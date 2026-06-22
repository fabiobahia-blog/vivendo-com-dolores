(function () {
  "use strict";

  var hub = document.querySelector("[data-share-card-hub]");
  var section = document.querySelector("[data-share-card-section]");

  if (!window.BlogLinks) return;
  if (!hub && !section) return;

  function t(key, params) {
    if (window.BlogI18n && window.BlogI18n.t) return window.BlogI18n.t(key, params);
    return key;
  }

  function getPostTitle(slug, fallback) {
    var key = "posts." + slug + ".title";
    var title = t(key);
    return title === key ? fallback : title;
  }

  function entryToLink(code, entry) {
    return {
      code: code,
      postSlug: entry.postSlug,
      title: getPostTitle(entry.postSlug, entry.title),
      excerpt: entry.excerpt,
    };
  }

  function initShareCard(target, getLink) {
    var feedback = target.querySelector("[data-share-card-feedback]");
    var shortDisplay = target.querySelector("[data-short-url-display]");
    var cardLink = target.querySelector("[data-share-card-link]");
    var downloadBtn = target.querySelector("[data-share-card-download]");
    var copyShortBtn = target.querySelector("[data-share-copy-short]");
    var preview = target.querySelector("[data-share-card-preview]");
    var siteLabel = "Vivendo Entre Dolores";
    var currentLink = null;

    function showFeedback(message) {
      if (!feedback) return;
      feedback.textContent = message;
      setTimeout(function () {
        feedback.textContent = "";
      }, 2500);
    }

    function copyText(value, successMessage) {
      function fallbackCopy() {
        var textarea = document.createElement("textarea");
        textarea.value = value;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "absolute";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand("copy");
          showFeedback(successMessage);
        } catch (err) {
          showFeedback("Não foi possível copiar.");
        }
        document.body.removeChild(textarea);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(function () {
          showFeedback(successMessage);
        }).catch(fallbackCopy);
        return;
      }

      fallbackCopy();
    }

    function wrapText(ctx, text, maxWidth) {
      var words = text.split(/\s+/);
      var lines = [];
      var line = "";

      words.forEach(function (word) {
        var testLine = line ? line + " " + word : word;
        if (ctx.measureText(testLine).width > maxWidth && line) {
          lines.push(line);
          line = word;
        } else {
          line = testLine;
        }
      });

      if (line) lines.push(line);
      return lines;
    }

    function drawCard(qrCanvas, link, shortUrl) {
      var canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1080;
      var ctx = canvas.getContext("2d");

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 8;
      ctx.strokeRect(48, 48, canvas.width - 96, canvas.height - 96);

      ctx.fillStyle = "#000000";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";

      ctx.font = "28px Georgia, 'Times New Roman', serif";
      ctx.fillText(siteLabel.toUpperCase(), 96, 96);

      ctx.font = "bold 64px Georgia, 'Times New Roman', serif";
      var titleLines = wrapText(ctx, link.title, 820);
      var y = 170;
      titleLines.forEach(function (line) {
        ctx.fillText(line, 96, y);
        y += 78;
      });

      ctx.font = "36px Georgia, 'Times New Roman', serif";
      y += 24;
      var excerptLines = wrapText(ctx, link.excerpt, 820);
      excerptLines.forEach(function (line) {
        ctx.fillText(line, 96, y);
        y += 52;
      });

      var qrSize = 260;
      var qrX = 96;
      var qrY = canvas.height - 96 - qrSize - 120;
      ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);

      ctx.font = "30px Georgia, 'Times New Roman', serif";
      ctx.fillText(t("shareCard.scanOrTap"), 96, qrY + qrSize + 28);

      ctx.font = "28px Georgia, 'Times New Roman', serif";
      var shortLabel = shortUrl.replace(/^https?:\/\//, "");
      ctx.fillText(shortLabel, 96, qrY + qrSize + 72);

      if (preview) {
        preview.innerHTML = "";
        var img = document.createElement("img");
        img.src = canvas.toDataURL("image/png");
        img.alt = link.title;
        img.width = 360;
        img.height = 360;
        preview.appendChild(img);
      }

      return canvas;
    }

    function renderCard() {
      if (!currentLink || !window.QRCode) return Promise.resolve();

      var shortUrl = BlogLinks.getShortUrl(currentLink.code);
      var qrCanvas = document.createElement("canvas");
      return QRCode.toCanvas(qrCanvas, shortUrl, {
        width: 260,
        margin: 1,
        color: { dark: "#000000", light: "#ffffff" },
      }).then(function () {
        return drawCard(qrCanvas, currentLink, shortUrl);
      });
    }

    function refresh() {
      currentLink = getLink();
      if (!currentLink) {
        target.hidden = true;
        return;
      }

      target.hidden = false;
      var shortUrl = BlogLinks.getShortUrl(currentLink.code);
      var cardUrl = BlogLinks.getCardUrl(currentLink.code);

      if (shortDisplay) {
        shortDisplay.textContent = t("share.usingShortLink", { url: shortUrl });
      }
      if (cardLink) {
        cardLink.href = cardUrl;
      }

      renderCard().catch(function () {
        /* preview optional */
      });
    }

    if (downloadBtn) {
      downloadBtn.addEventListener("click", function () {
        renderCard()
          .then(function (canvas) {
            if (!canvas || !currentLink) return;
            var anchor = document.createElement("a");
            anchor.download = currentLink.code + "-share.png";
            anchor.href = canvas.toDataURL("image/png");
            anchor.click();
            showFeedback(t("shareCard.downloadOk"));
          })
          .catch(function () {
            showFeedback("Não foi possível gerar a imagem.");
          });
      });
    }

    if (copyShortBtn) {
      copyShortBtn.addEventListener("click", function () {
        if (!currentLink) return;
        copyText(BlogLinks.getShortUrl(currentLink.code), t("shareCard.copyShortOk"));
      });
    }

    refresh();
    return refresh;
  }

  if (hub) {
    var pick = hub.querySelector("[data-share-card-pick]");
    if (!pick) return;

    Object.keys(BlogLinks.entries).forEach(function (code) {
      var entry = BlogLinks.entries[code];
      var option = document.createElement("option");
      option.value = code;
      option.textContent = getPostTitle(entry.postSlug, entry.title);
      pick.appendChild(option);
    });

    var params = new URLSearchParams(window.location.search);
    var postParam = params.get("post");
    if (postParam) {
      var matched = BlogLinks.getByPostSlug(postParam);
      if (matched) {
        pick.value = matched.code;
      }
    }

    var refreshHub = initShareCard(hub, function () {
      var code = pick.value;
      if (!code || !BlogLinks.entries[code]) return null;
      return entryToLink(code, BlogLinks.entries[code]);
    });

    pick.addEventListener("change", function () {
      if (refreshHub) refreshHub();
    });

    if (window.location.hash === "#share-card") {
      var target = document.getElementById("share-card") || hub;
      if (target && target.scrollIntoView) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
    return;
  }

  var postSlug = document.body.getAttribute("data-post-slug");
  if (!postSlug) return;

  var link = BlogLinks.getByPostSlug(postSlug);
  if (!link) return;

  initShareCard(section, function () {
    return entryToLink(link.code, link);
  });
})();
