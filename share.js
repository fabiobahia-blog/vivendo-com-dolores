(function () {
  "use strict";

  const section = document.querySelector("[data-share-section]");
  if (!section) return;

  const pageUrl = encodeURIComponent(window.location.href);
  const pageTitle = encodeURIComponent(document.title);
  const text = encodeURIComponent("Leia este post: " + document.title);

  const links = {
    whatsapp: "https://wa.me/?text=" + text + "%20" + pageUrl,
    x: "https://twitter.com/intent/tweet?text=" + text + "&url=" + pageUrl,
    facebook: "https://www.facebook.com/sharer/sharer.php?u=" + pageUrl,
    linkedin: "https://www.linkedin.com/sharing/share-offsite/?url=" + pageUrl,
    email: "mailto:?subject=" + pageTitle + "&body=" + text + "%0A%0A" + pageUrl,
  };

  Object.entries(links).forEach(function ([key, href]) {
    const anchor = section.querySelector('[data-share="' + key + '"]');
    if (anchor) anchor.href = href;
  });

  const copyFeedback = section.querySelector("[data-copy-feedback]");
  const rawUrl = window.location.href;

  function copyUrl(successMessage) {
    function showSuccess() {
      if (copyFeedback) {
        copyFeedback.textContent = successMessage;
        setTimeout(function () {
          copyFeedback.textContent = "";
        }, 2500);
      }
    }

    function fallbackCopy() {
      const textarea = document.createElement("textarea");
      textarea.value = rawUrl;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "absolute";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        showSuccess();
      } catch (err) {
        if (copyFeedback) {
          copyFeedback.textContent = "Não foi possível copiar. Copie manualmente da barra de endereço.";
        }
      }
      document.body.removeChild(textarea);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(rawUrl).then(showSuccess).catch(fallbackCopy);
      return;
    }

    fallbackCopy();
  }

  const copyBtn = section.querySelector('[data-share="copy"]');
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      copyUrl("Link copiado!");
    });
  }

  const instagramBtn = section.querySelector('[data-share="instagram"]');
  if (instagramBtn) {
    instagramBtn.addEventListener("click", function () {
      copyUrl("Link copiado! Cole no Instagram (Stories, DM ou bio).");
    });
  }
})();
