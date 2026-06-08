(function () {
  "use strict";

  var REACTION_IDS = ["like", "love", "haha", "wow", "sad", "angry"];
  var REACTION_EMOJI = {
    like: "👍",
    love: "❤️",
    haha: "😂",
    wow: "😮",
    sad: "😢",
    angry: "😠",
  };

  var section = document.querySelector("[data-reactions]");
  if (!section) return;

  var postSlug = section.getAttribute("data-post-slug");
  if (!postSlug) return;

  var noteEl = section.querySelector(".reactions-note");
  var backend = (window.REACTIONS_BACKEND || "supabase").toLowerCase();
  var activeReaction = null;

  function t(key) {
    if (window.BlogI18n && window.BlogI18n.t) return window.BlogI18n.t(key);
    return key;
  }

  function getReactions() {
    return REACTION_IDS.map(function (id) {
      return { id: id, emoji: REACTION_EMOJI[id], label: t("reactions." + id) };
    });
  }

  function emptyCounts() {
    var counts = {};
    REACTION_IDS.forEach(function (id) {
      counts[id] = 0;
    });
    return counts;
  }

  function getVisitorId() {
    var key = "blog_visitor_id";
    var id = localStorage.getItem(key);
    if (!id) {
      id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : "v_" + Date.now() + "_" + Math.random().toString(36).slice(2);
      localStorage.setItem(key, id);
    }
    return id;
  }

  function showNote(key) {
    if (!noteEl) return;
    noteEl.setAttribute("data-i18n", key);
    var text = t(key);
    noteEl.textContent = text === key ? "" : text;
    noteEl.hidden = false;
  }

  function hideNote() {
    if (!noteEl) return;
    noteEl.hidden = true;
  }

  function setButtonsDisabled(disabled) {
    section.querySelectorAll(".reaction-btn").forEach(function (btn) {
      btn.disabled = disabled;
    });
  }

  function renderBar(counts, activeId) {
    var bar = section.querySelector(".reactions-bar");
    if (!bar) return;

    bar.innerHTML = getReactions()
      .map(function (r) {
        var count = counts[r.id] || 0;
        var active = activeId === r.id ? " is-active" : "";
        return (
          '<button type="button" class="reaction-btn' +
          active +
          '" data-reaction="' +
          r.id +
          '" aria-label="' +
          r.label +
          '" aria-pressed="' +
          (activeId === r.id ? "true" : "false") +
          '">' +
          '<span class="reaction-emoji" aria-hidden="true">' +
          r.emoji +
          "</span>" +
          '<span class="reaction-count">' +
          count +
          "</span>" +
          "</button>"
        );
      })
      .join("");
  }

  function bindButtons(onReact) {
    section.querySelectorAll(".reaction-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var reaction = btn.getAttribute("data-reaction");
        btn.disabled = true;

        onReact(reaction, activeReaction)
          .then(function () {
            btn.disabled = false;
          })
          .catch(function () {
            btn.disabled = false;
            showNote("reactions.errorLoad");
          });
      });
    });
  }

  function aggregateSupabaseRows(rows) {
    var counts = emptyCounts();
    rows.forEach(function (row) {
      if (counts[row.reaction] !== undefined) {
        counts[row.reaction] += 1;
      }
    });
    return counts;
  }

  function isSupabaseConfigured() {
    var url = window.MURAL_SUPABASE_URL;
    var key = window.MURAL_SUPABASE_ANON_KEY;
    return Boolean(
      url &&
        key &&
        url.indexOf("supabase.co") !== -1 &&
        url.indexOf("SEU-PROJETO") === -1 &&
        key.length > 20 &&
        typeof window.supabase !== "undefined"
    );
  }

  function isUpstashConfigured() {
    var url = window.REACTIONS_UPSTASH_URL;
    var token = window.REACTIONS_UPSTASH_TOKEN;
    return Boolean(
      url &&
        token &&
        url.indexOf("upstash.io") !== -1 &&
        url.indexOf("SEU-ENDPOINT") === -1 &&
        token.indexOf("SEU-TOKEN") === -1 &&
        token.length > 10
    );
  }

  function upstashRequest(commandParts) {
    var url = window.REACTIONS_UPSTASH_URL.replace(/\/$/, "") + "/" + commandParts.join("/");
    return fetch(url, {
      headers: { Authorization: "Bearer " + window.REACTIONS_UPSTASH_TOKEN },
    }).then(function (response) {
      return response.json().then(function (body) {
        if (!response.ok || body.error) {
          throw new Error(body.error || "Upstash request failed");
        }
        return body.result;
      });
    });
  }

  function upstashCountsKey() {
    return "reaction:c:" + postSlug;
  }

  function upstashVisitorKey(visitorId) {
    return "reaction:v:" + visitorId + ":" + postSlug;
  }

  function parseUpstashHash(result) {
    var counts = emptyCounts();
    if (!result) return counts;

    if (Array.isArray(result)) {
      for (var i = 0; i < result.length; i += 2) {
        var field = result[i];
        var value = parseInt(result[i + 1], 10);
        if (counts[field] !== undefined && !isNaN(value)) {
          counts[field] = Math.max(0, value);
        }
      }
      return counts;
    }

    if (typeof result === "object") {
      REACTION_IDS.forEach(function (id) {
        if (result[id] !== undefined) {
          counts[id] = Math.max(0, parseInt(result[id], 10) || 0);
        }
      });
    }

    return counts;
  }

  function upstashAdjustCount(reactionId, delta) {
    if (!delta) return Promise.resolve();
    return upstashRequest([
      "HINCRBY",
      encodeURIComponent(upstashCountsKey()),
      reactionId,
      String(delta),
    ]);
  }

  function upstashSetVisitor(reactionId, visitorId) {
    if (reactionId) {
      return upstashRequest([
        "SET",
        encodeURIComponent(upstashVisitorKey(visitorId)),
        reactionId,
      ]);
    }
    return upstashRequest(["DEL", encodeURIComponent(upstashVisitorKey(visitorId))]);
  }

  function upstashLoad() {
    var visitorId = getVisitorId();
    return Promise.all([
      upstashRequest(["HGETALL", encodeURIComponent(upstashCountsKey())]),
      upstashRequest(["GET", encodeURIComponent(upstashVisitorKey(visitorId))]),
    ]).then(function (results) {
      return {
        counts: parseUpstashHash(results[0]),
        activeId: results[1] || null,
      };
    });
  }

  function upstashReact(reaction, current) {
    var visitorId = getVisitorId();

    if (current === reaction) {
      return upstashAdjustCount(reaction, -1)
        .then(function () {
          return upstashSetVisitor(null, visitorId);
        })
        .then(function () {
          return refresh();
        });
    }

    var chain = Promise.resolve();
    if (current) {
      chain = chain.then(function () {
        return upstashAdjustCount(current, -1);
      });
    }
    return chain
      .then(function () {
        return upstashAdjustCount(reaction, 1);
      })
      .then(function () {
        return upstashSetVisitor(reaction, visitorId);
      })
      .then(function () {
        return refresh();
      });
  }

  function supabaseReact(reaction, current, client, visitorId) {
    if (current === reaction) {
      return client
        .from("post_reactions")
        .delete()
        .eq("post_slug", postSlug)
        .eq("visitor_id", visitorId)
        .then(function (result) {
          if (result.error) throw result.error;
          return refresh();
        });
    }

    return client
      .from("post_reactions")
      .upsert(
        { post_slug: postSlug, visitor_id: visitorId, reaction: reaction },
        { onConflict: "post_slug,visitor_id" }
      )
      .then(function (result) {
        if (result.error) throw result.error;
        return refresh();
      });
  }

  function supabaseLoad(client, visitorId) {
    return Promise.all([
      client.from("post_reactions").select("reaction").eq("post_slug", postSlug),
      client
        .from("post_reactions")
        .select("reaction")
        .eq("post_slug", postSlug)
        .eq("visitor_id", visitorId)
        .maybeSingle(),
    ]).then(function (results) {
      if (results[0].error) throw results[0].error;
      if (results[1].error) throw results[1].error;
      return {
        counts: aggregateSupabaseRows(results[0].data || []),
        activeId: results[1].data ? results[1].data.reaction : null,
      };
    });
  }

  function showUnavailable() {
    renderBar(emptyCounts(), null);
    setButtonsDisabled(true);
    showNote("reactions.configuring");
  }

  function refresh() {
    if (backend === "upstash" && isUpstashConfigured()) {
      renderBar(emptyCounts(), activeReaction);
      setButtonsDisabled(true);
      upstashLoad()
        .then(function (state) {
          activeReaction = state.activeId;
          renderBar(state.counts, activeReaction);
          bindButtons(upstashReact);
          setButtonsDisabled(false);
          hideNote();
        })
        .catch(function () {
          showUnavailable();
          showNote("reactions.errorLoad");
        });
      return;
    }

    if (backend === "supabase" && isSupabaseConfigured()) {
      var client = window.supabase.createClient(
        window.MURAL_SUPABASE_URL,
        window.MURAL_SUPABASE_ANON_KEY
      );
      var visitorId = getVisitorId();

      renderBar(emptyCounts(), activeReaction);
      setButtonsDisabled(true);

      supabaseLoad(client, visitorId)
        .then(function (state) {
          activeReaction = state.activeId;
          renderBar(state.counts, activeReaction);
          bindButtons(function (reaction, current) {
            return supabaseReact(reaction, current, client, visitorId);
          });
          setButtonsDisabled(false);
          hideNote();
        })
        .catch(function () {
          showUnavailable();
          showNote("reactions.errorLoad");
        });
      return;
    }

    showUnavailable();
  }

  function boot() {
    refresh();
  }

  if (window.BlogI18n && window.BlogI18n.onChange) {
    window.BlogI18n.onChange(boot);
  }
  document.addEventListener("bloglangchange", boot);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
