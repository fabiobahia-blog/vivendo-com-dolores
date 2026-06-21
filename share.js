(function () {
  "use strict";

  const shareSection = document.querySelector("[data-share-section]");
  const captionsSection = document.querySelector("[data-social-captions]");

  if (!shareSection && !captionsSection) return;

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

  function getSocialCaption(platform) {
    const slug = getPostSlug();
    if (!slug) return null;
    const key = "posts." + slug + ".social." + platform;
    const value = t(key, { url: getShareUrl() });
    return value !== key ? value : null;
  }

  function getShareText() {
    const whatsappCaption = getSocialCaption("whatsapp");
    if (whatsappCaption) return whatsappCaption;
    return t("share.shareText", { title: document.title });
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
    if (!shareSection) return;

    const shareUrl = getShareUrl();
    const pageUrl = encodeURIComponent(shareUrl);
    const pageTitle = encodeURIComponent(document.title);
    const shareText = getShareText();
    const text = encodeURIComponent(shareText);
    const whatsappCaption = getSocialCaption("whatsapp");
    const whatsappHref = whatsappCaption
      ? "https://wa.me/?text=" + text
      : "https://wa.me/?text=" + text + "%20" + pageUrl;

    const links = {
      whatsapp: whatsappHref,
      x: "https://twitter.com/intent/tweet?text=" + text + "&url=" + pageUrl,
      facebook: "https://www.facebook.com/sharer/sharer.php?u=" + pageUrl,
      linkedin: "https://www.linkedin.com/sharing/share-offsite/?url=" + pageUrl,
      email: "mailto:?subject=" + pageTitle + "&body=" + text + "%0A%0A" + pageUrl,
    };

    Object.entries(links).forEach(function ([key, href]) {
      const anchor = shareSection.querySelector('[data-share="' + key + '"]');
      if (anchor) anchor.href = href;
    });

    const shortDisplay = shareSection.querySelector("[data-share-short-url]");
    if (shortDisplay && window.BlogLinks && getPostSlug()) {
      const link = BlogLinks.getByPostSlug(getPostSlug());
      if (link) {
        shortDisplay.textContent = t("share.usingShortLink", {
          url: BlogLinks.getShortUrl(link.code),
        });
        shortDisplay.hidden = false;
      }
    }
  }

  function initSocialCaptions() {
    if (!captionsSection) return;

    const platforms = ["whatsapp", "facebook", "instagram", "linkedin"];
    const hasAny = platforms.some(function (platform) {
      return getSocialCaption(platform);
    });

    captionsSection.hidden = !hasAny;
    if (!hasAny) return;

    const feedback = captionsSection.querySelector("[data-social-captions-feedback]");

    platforms.forEach(function (platform) {
      const btn = captionsSection.querySelector('[data-social-copy="' + platform + '"]');
      if (!btn) return;
      if (!getSocialCaption(platform)) {
        btn.hidden = true;
        return;
      }
      btn.hidden = false;
      btn.onclick = function (event) {
        copyText(getSocialCaption(platform), feedback, t("share.socialCopyOk"));
        event.currentTarget.blur();
      };
    });
  }

  updateShareLinks();
  initSocialCaptions();
  document.addEventListener("bloglangchange", function () {
    updateShareLinks();
    initSocialCaptions();
  });

  if (shareSection) {
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
        const caption = getSocialCaption("instagram");
        if (caption) {
          copyText(caption, copyFeedback, t("share.instagramOk"));
        } else {
          copyText(getShareUrl(), copyFeedback, t("share.instagramOk"));
        }
        event.currentTarget.blur();
      });
    }
  }
})();
