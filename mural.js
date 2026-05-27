(function () {
  "use strict";

  var form = document.getElementById("muralForm");
  var list = document.getElementById("muralList");
  var feedback = document.getElementById("muralFeedback");
  var setupNote = document.getElementById("muralSetupNote");

  var supabaseUrl = window.MURAL_SUPABASE_URL;
  var supabaseKey = window.MURAL_SUPABASE_ANON_KEY;

  if (!form || !list) return;

  function t(key) {
    if (window.BlogI18n && window.BlogI18n.t) return window.BlogI18n.t(key);
    return key;
  }

  function showFeedback(message) {
    if (feedback) feedback.textContent = message;
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

  if (!isConfigured()) {
    if (setupNote) setupNote.hidden = false;
    form.querySelectorAll("input, textarea, button").forEach(function (el) {
      el.disabled = true;
    });
    list.innerHTML = "<li class=\"mural-empty\">" + t("mural.configuring") + "</li>";
    return;
  }

  if (setupNote) setupNote.hidden = true;

  var client = window.supabase.createClient(supabaseUrl, supabaseKey);

  function renderRecados(rows) {
    if (!rows || rows.length === 0) {
      list.innerHTML = "<li class=\"mural-empty\">" + t("mural.empty") + "</li>";
      return;
    }

    list.innerHTML = rows
      .map(function (item) {
        return (
          "<li class=\"mural-card\">" +
          "<p class=\"mural-card-name\">" +
          escapeHtml(item.nome) +
          "</p>" +
          "<p class=\"mural-card-text\">" +
          escapeHtml(item.recado) +
          "</p>" +
          "<p class=\"mural-card-date\">" +
          formatDate(item.created_at) +
          "</p>" +
          "</li>"
        );
      })
      .join("");
  }

  function loadRecados() {
    client
      .from("recados")
      .select("id, nome, recado, created_at")
      .order("created_at", { ascending: false })
      .limit(50)
      .then(function (result) {
        if (result.error) {
          showFeedback(t("mural.errorLoad"));
          return;
        }
        renderRecados(result.data);
      });
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var honeypot = document.getElementById("muralWebsite");
    if (honeypot && honeypot.value.trim() !== "") {
      showFeedback(t("mural.errorSend"));
      return;
    }

    var nome = document.getElementById("muralNome").value.trim();
    var recado = document.getElementById("muralTexto").value.trim();

    if (nome.length < 2) {
      showFeedback(t("mural.nameRequired"));
      return;
    }

    if (recado.length < 3) {
      showFeedback(t("mural.messageRequired"));
      return;
    }

    var submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    showFeedback(t("mural.sending"));

    client
      .from("recados")
      .insert([{ nome: nome, recado: recado }])
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
})();
