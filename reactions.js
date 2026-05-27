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

  function t(key) {
    if (window.BlogI18n && window.BlogI18n.t) return window.BlogI18n.t(key);
    return key;
  }

  function getReactions() {
    return REACTION_IDS.map(function (id) {
      return { id: id, emoji: REACTION_EMOJI[id], label: t("reactions." + id) };
    });
  }

  var section = document.querySelector("[data-reactions]");
  if (!section) return;

  var postSlug = section.getAttribute("data-post-slug");
  if (!postSlug) return;

  var supabaseUrl = window.MURAL_SUPABASE_URL;
  var supabaseKey = window.MURAL_SUPABASE_ANON_KEY;

  function isConfigured() {
    return Boolean(
      supabaseUrl &&
        supabaseKey &&
        supabaseUrl.indexOf("supabase.co") !== -1 &&
        supabaseKey.length > 20
    );
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

  function storageKey() {
    return "post_reaction_" + postSlug;
  }

  function getLocalReaction() {
    return localStorage.getItem(storageKey());
  }

  function setLocalReaction(reactionId) {
    if (reactionId) {
      localStorage.setItem(storageKey(), reactionId);
    } else {
      localStorage.removeItem(storageKey());
    }
  }

  function renderBar(counts, activeId) {
    var bar = section.querySelector(".reactions-bar");
    if (!bar) return;

    bar.innerHTML = getReactions().map(function (r) {
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
    }).join("");
  }

  function aggregateCounts(rows) {
    var counts = {};
    REACTION_IDS.forEach(function (id) {
      counts[id] = 0;
    });
    rows.forEach(function (row) {
      if (counts[row.reaction] !== undefined) {
        counts[row.reaction] += 1;
      }
    });
    return counts;
  }

  if (!isConfigured() || typeof window.supabase === "undefined") {
    section.querySelector(".reactions-note").hidden = false;
    return;
  }

  var client = window.supabase.createClient(supabaseUrl, supabaseKey);
  var visitorId = getVisitorId();

  function loadCounts() {
    return client
      .from("post_reactions")
      .select("reaction")
      .eq("post_slug", postSlug)
      .then(function (result) {
        if (result.error) throw result.error;
        return aggregateCounts(result.data || []);
      });
  }

  function refresh() {
    var activeId = getLocalReaction();
    loadCounts()
      .then(function (counts) {
        renderBar(counts, activeId);
        bindButtons();
      })
      .catch(function () {
        section.querySelector(".reactions-note").textContent = t("reactions.errorLoad");
        section.querySelector(".reactions-note").hidden = false;
      });
  }

  function bindButtons() {
    section.querySelectorAll(".reaction-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var reaction = btn.getAttribute("data-reaction");
        var current = getLocalReaction();

        btn.disabled = true;

        if (current === reaction) {
          client
            .from("post_reactions")
            .delete()
            .eq("post_slug", postSlug)
            .eq("visitor_id", visitorId)
            .then(function (result) {
              btn.disabled = false;
              if (result.error) return;
              setLocalReaction(null);
              refresh();
            });
          return;
        }

        client
          .from("post_reactions")
          .upsert(
            { post_slug: postSlug, visitor_id: visitorId, reaction: reaction },
            { onConflict: "post_slug,visitor_id" }
          )
          .then(function (result) {
            btn.disabled = false;
            if (result.error) return;
            setLocalReaction(reaction);
            refresh();
          });
      });
    });
  }

  refresh();
  document.addEventListener("bloglangchange", refresh);
})();
