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
  humanLabel.textContent = "Confirme que é humano: quanto é " + a + " + " + b + "?";

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
      feedback.textContent = "Não foi possível validar o envio.";
      return;
    }

    if (Date.now() - startedAt < 1500) {
      feedback.textContent = "Aguarde um instante e tente novamente.";
      return;
    }

    if (!nome || !email || !mensagem) {
      feedback.textContent = "Preencha todos os campos obrigatórios.";
      return;
    }

    if (!emailRegex.test(email)) {
      feedback.textContent = "Digite um email válido (exemplo@dominio.com).";
      return;
    }

    if (humano !== resposta) {
      feedback.textContent = "Confirmação de humano inválida. Tente novamente.";
      return;
    }

    const assunto = encodeURIComponent("Contato pelo blog - " + nome);
    const corpo = encodeURIComponent(
      "Nome: " + nome + "\nEmail: " + email + "\n\nMensagem:\n" + mensagem
    );

    window.location.href = "mailto:" + emailDestino + "?subject=" + assunto + "&body=" + corpo;
    feedback.textContent = "Abrindo seu aplicativo de email para finalizar o envio.";
  });
})();
