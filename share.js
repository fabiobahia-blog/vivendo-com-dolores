(function () {
  "use strict";

  const shareSection = document.querySelector("[data-share-section]");
  if (!shareSection) return;

  function t(key, params) {
    if (window.BlogI18n && window.BlogI18n.t) {
      return window.BlogI18n.t(key, params);
    }
    return key;
  }

  function getPostSlug() {
    return document.body.dataset.postSlug || "";
  }

  function getShareUrl() {
    const postSlug = getPostSlug();
    if (window.BlogLinks && postSlug) {
      const link = BlogLinks.getByPostSlug(postSlug);
      if (link) return BlogLinks.getShortUrl(link.code);
    }
    return window.location.href.split("#")[0];
  }

  function getCardShareUrl() {
    const postSlug = getPostSlug();
    if (window.BlogLinks && postSlug) {
      const link = BlogLinks.getByPostSlug(postSlug);
      if (link) return BlogLinks.getCardUrl(link.code);
    }
    return getShareUrl();
  }

  function buildShareHref(platform) {
    const shareUrl = getShareUrl();
    const cardUrl = getCardShareUrl();
    const pageUrl = encodeURIComponent(
      platform === "facebook" || platform === "linkedin" ? cardUrl : shareUrl
    );
    const fallbackText = t("share.shareText", { title: document.title }) + " " + shareUrl;

    switch (platform) {
      case "whatsapp":
        return "https://wa.me/?text=" + encodeURIComponent(fallbackText);
      case "x":
        return "https://twitter.com/intent/tweet?text=" + encodeURIComponent(fallbackText);
      case "facebook":
        return "https://www.facebook.com/sharer/sharer.php?u=" + pageUrl;
      case "linkedin":
        return "https://www.linkedin.com/sharing/share-offsite/?url=" + pageUrl;
      case "email":
        return (
          "mailto:?subject=" +
          encodeURIComponent(document.title) +
          "&body=" +
          encodeURIComponent(fallbackText)
        );
      default:
        return "#";
    }
  }

  function copyText(value, feedbackEl, successMessage) {
    function showSuccess() {
      if (!feedbackEl) return;
      feedbackEl.textContent = successMessage;
      setTimeout(function () {
        feedbackEl.textContent = "";
      }, 2500);
    }

    function fallbackCopy() {
      const textarea = document.createElement("textarea");
      textarea.value = value;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "absolute";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        showSuccess();
      } catch (err) {
        if (feedbackEl) {
          feedbackEl.textContent = "Não foi possível copiar. Copie manualmente.";
        }
      }
      document.body.removeChild(textarea);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value).then(showSuccess).catch(fallbackCopy);
      return;
    }

    fallbackCopy();
  }

  function updateShareLinks() {
    const platforms = ["whatsapp", "x", "facebook", "linkedin", "email"];

    platforms.forEach(function (platform) {
      const anchor = shareSection.querySelector('[data-share="' + platform + '"]');
      if (anchor) anchor.href = buildShareHref(platform);
    });
  }

  updateShareLinks();
  document.addEventListener("bloglangchange", updateShareLinks);

  const copyFeedback = shareSection.querySelector("[data-copy-feedback]");

  const copyBtn = shareSection.querySelector('[data-share="copy"]');
  if (copyBtn) {
    copyBtn.addEventListener("click", function (event) {
      copyText(getShareUrl(), copyFeedback, t("share.copyOk"));
      event.currentTarget.blur();
    });
  }

  const instagramBtn = shareSection.querySelector('[data-share="instagram"]');
  if (instagramBtn) {
    instagramBtn.addEventListener("click", function (event) {
      copyText(getShareUrl(), copyFeedback, t("share.instagramOk"));
      event.currentTarget.blur();
    });
  }
})();
