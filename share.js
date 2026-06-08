(function () {
  "use strict";

  const section = document.querySelector("[data-share-section]");
  if (!section) return;

  function t(key, params) {
    if (window.BlogI18n && window.BlogI18n.t) {
      return window.BlogI18n.t(key, params);
    }
    return key;
  }

  function getShareUrl() {
    const postSlug = document.body.dataset.postSlug;
    if (window.BlogLinks && postSlug) {
      const link = BlogLinks.getByPostSlug(postSlug);
      if (link) return BlogLinks.getShortUrl(link.code);
    }
    return window.location.href.split("#")[0];
  }

  function updateShareLinks() {
    const shareUrl = getShareUrl();
    const pageUrl = encodeURIComponent(shareUrl);
    const pageTitle = encodeURIComponent(document.title);
    const text = encodeURIComponent(
      t("share.shareText", { title: document.title })
    );

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

    const shortDisplay = section.querySelector("[data-share-short-url]");
    if (shortDisplay && window.BlogLinks && document.body.dataset.postSlug) {
      const link = BlogLinks.getByPostSlug(document.body.dataset.postSlug);
      if (link) {
        shortDisplay.textContent = t("share.usingShortLink", {
          url: BlogLinks.getShortUrl(link.code),
        });
        shortDisplay.hidden = false;
      }
    }
  }

  updateShareLinks();
  document.addEventListener("bloglangchange", updateShareLinks);

  const copyFeedback = section.querySelector("[data-copy-feedback]");

  function copyUrl(successMessage) {
    const shareUrl = getShareUrl();

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
      textarea.value = shareUrl;
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
      navigator.clipboard.writeText(shareUrl).then(showSuccess).catch(fallbackCopy);
      return;
    }

    fallbackCopy();
  }

  const copyBtn = section.querySelector('[data-share="copy"]');
  if (copyBtn) {
    copyBtn.addEventListener("click", function (event) {
      copyUrl(t("share.copyOk"));
      event.currentTarget.blur();
    });
  }

  const instagramBtn = section.querySelector('[data-share="instagram"]');
  if (instagramBtn) {
    instagramBtn.addEventListener("click", function (event) {
      copyUrl(t("share.instagramOk"));
      event.currentTarget.blur();
    });
  }
})();
