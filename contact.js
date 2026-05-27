(function () {
  "use strict";

  const form = document.getElementById("contactForm");
  if (!form) return;

  const humanLabel = document.getElementById("humanLabel");
  const feedback = document.getElementById("feedback");
  const emailDestino = "fbahia@hotmail.com";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const startedAt = Date.now();

  const a = Math.floor(Math.random() * 7) + 2;
  const b = Math.floor(Math.random() * 7) + 2;
  const resposta = a + b;

  function t(key) {
    if (window.BlogI18n && window.BlogI18n.t) {
      return window.BlogI18n.t(key, { a: a, b: b });
    }
    return key;
  }

  function updateHumanLabel() {
    if (humanLabel) humanLabel.textContent = t("contact.human");
  }

  updateHumanLabel();
  document.addEventListener("bloglangchange", updateHumanLabel);

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const nomeInput = document.getElementById("nome");
    const emailInput = document.getElementById("email");
    const mensagemInput = document.getElementById("mensagem");
    const humanoInput = document.getElementById("humano");
    const websiteInput = document.getElementById("website");

    const nome = nomeInput.value.trim();
    const email = emailInput.value.trim();
    const mensagem = mensagemInput.value.trim();
    const humano = Number(humanoInput.value);

    feedback.textContent = "";

    if (websiteInput.value.trim() !== "") {
      feedback.textContent = t("contact.feedbackBot");
      return;
    }

    if (Date.now() - startedAt < 1500) {
      feedback.textContent = t("contact.feedbackFast");
      return;
    }

    if (!nome || !email || !mensagem) {
      feedback.textContent = t("contact.feedbackRequired");
      return;
    }

    if (!emailRegex.test(email)) {
      feedback.textContent = t("contact.feedbackEmail");
      return;
    }

    if (humano !== resposta) {
      feedback.textContent = t("contact.feedbackHuman");
      return;
    }

    const assunto = encodeURIComponent("Contato pelo blog - " + nome);
    const corpo = encodeURIComponent(
      "Nome: " + nome + "\nEmail: " + email + "\n\nMensagem:\n" + mensagem
    );

    window.location.href = "mailto:" + emailDestino + "?subject=" + assunto + "&body=" + corpo;
    feedback.textContent = t("contact.feedbackOk");
  });
})();
