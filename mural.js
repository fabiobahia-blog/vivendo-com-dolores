(function () {
  "use strict";

  var sections = document.querySelectorAll("[data-mural-section]");
  if (!sections.length) return;

  var supabaseUrl = window.MURAL_SUPABASE_URL;
  var supabaseKey = window.MURAL_SUPABASE_ANON_KEY;

  function t(key, params) {
    if (window.BlogI18n && window.BlogI18n.t) return window.BlogI18n.t(key, params);
    return key;
  }

  function escapeHtml(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatDate(iso) {
    try {
      var locale = window.BlogI18n && window.BlogI18n.getLang() === "en-US" ? "en-US" : "pt-BR";
      return new Date(iso).toLocaleString(locale, {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "";
    }
  }

  function isConfigured() {
    return Boolean(
      supabaseUrl &&
        supabaseKey &&
        supabaseUrl.indexOf("supabase.co") !== -1 &&
        supabaseUrl.indexOf("SEU-PROJETO") === -1 &&
        supabaseKey.length > 20
    );
  }

  function getPostTitle(slug) {
    var key = "posts." + slug + ".title";
    var title = t(key);
    return title === key ? slug : title;
  }

  function getPostHref(slug) {
    return slug + "/";
  }

  function initSection(section, client) {
    var postSlug = section.getAttribute("data-post-slug") || "";
    var isPostMode = Boolean(postSlug);
    var form = section.querySelector("[data-mural-form]");
    var list = section.querySelector("[data-mural-list]");
    var feedback = section.querySelector("[data-mural-feedback]");
    var setupNote = section.querySelector("[data-mural-setup]");

    if (!form || !list) return;

    function showFeedback(message) {
      if (feedback) feedback.textContent = message;
    }

    function renderPostLabel(item) {
      if (isPostMode) return "";

      if (item.post_slug) {
        var title = getPostTitle(item.post_slug);
        var label = t("postMessages.onPost", { title: title });
        return (
          '<p class="mural-card-post"><a href="' +
          escapeHtml(getPostHref(item.post_slug)) +
          '">' +
          escapeHtml(label) +
          "</a></p>"
        );
      }

      return '<p class="mural-card-post">' + escapeHtml(t("postMessages.toBlog")) + "</p>";
    }

    function renderRecados(rows) {
      var emptyKey = isPostMode ? "postMessages.empty" : "mural.empty";

      if (!rows || rows.length === 0) {
        list.innerHTML = '<li class="mural-empty">' + t(emptyKey) + "</li>";
        return;
      }

      list.innerHTML = rows
        .map(function (item) {
          return (
            '<li class="mural-card">' +
            renderPostLabel(item) +
            '<p class="mural-card-name">' +
            escapeHtml(item.nome) +
            "</p>" +
            '<p class="mural-card-text">' +
            escapeHtml(item.recado) +
            "</p>" +
            '<p class="mural-card-date">' +
            formatDate(item.created_at) +
            "</p>" +
            "</li>"
          );
        })
        .join("");
    }

    function loadRecados() {
      var query = client
        .from("recados")
        .select("id, nome, recado, post_slug, created_at")
        .order("created_at", { ascending: false })
        .limit(50);

      if (isPostMode) {
        query = query.eq("post_slug", postSlug);
      }

      query.then(function (result) {
        if (result.error) {
          showFeedback(t("mural.errorLoad"));
          return;
        }
        renderRecados(result.data);
      });
    }

    if (!isConfigured()) {
      if (setupNote) setupNote.hidden = false;
      form.querySelectorAll("input, textarea, button").forEach(function (el) {
        el.disabled = true;
      });
      list.innerHTML = '<li class="mural-empty">' + t("mural.configuring") + "</li>";
      return;
    }

    if (setupNote) setupNote.hidden = true;

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var honeypot = form.querySelector("[data-mural-honeypot]");
      if (honeypot && honeypot.value.trim() !== "") {
        showFeedback(t("mural.errorSend"));
        return;
      }

      var nomeInput = form.querySelector("[data-mural-name]");
      var recadoInput = form.querySelector("[data-mural-text]");
      var nome = nomeInput ? nomeInput.value.trim() : "";
      var recado = recadoInput ? recadoInput.value.trim() : "";

      if (nome.length < 2) {
        showFeedback(t("mural.nameRequired"));
        return;
      }

      if (recado.length < 3) {
        showFeedback(t("mural.messageRequired"));
        return;
      }

      var submitBtn = form.querySelector('button[type="submit"]');
      var payload = { nome: nome, recado: recado };
      if (isPostMode) payload.post_slug = postSlug;

      submitBtn.disabled = true;
      showFeedback(t("mural.sending"));

      client
        .from("recados")
        .insert([payload])
        .then(function (result) {
          submitBtn.disabled = false;
          if (result.error) {
            showFeedback(t("mural.errorSend"));
            return;
          }
          form.reset();
          showFeedback(t("mural.published"));
          loadRecados();
          setTimeout(function () {
            showFeedback("");
          }, 3000);
        });
    });

    loadRecados();
  }

  if (!isConfigured()) {
    sections.forEach(function (section) {
      initSection(section, null);
    });
    return;
  }

  var client = window.supabase.createClient(supabaseUrl, supabaseKey);
  sections.forEach(function (section) {
    initSection(section, client);
  });
})();
