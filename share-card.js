(function () {
  "use strict";

  const section = document.querySelector("[data-share-card-section]");
  if (!section || !window.BlogLinks) return;

  const postSlug = document.body.dataset.postSlug;
  if (!postSlug) return;

  const link = BlogLinks.getByPostSlug(postSlug);
  if (!link) return;

  section.hidden = false;

  function t(key, params) {
    if (window.BlogI18n && window.BlogI18n.t) {
      return window.BlogI18n.t(key, params);
    }
    return key;
  }

  const shortUrl = BlogLinks.getShortUrl(link.code);
  const cardUrl = BlogLinks.getCardUrl(link.code);
  const siteLabel = "Vivendo Entre Dolores";
  const feedback = section.querySelector("[data-share-card-feedback]");
  const shortDisplay = section.querySelector("[data-short-url-display]");
  const cardLink = section.querySelector("[data-share-card-link]");
  const downloadBtn = section.querySelector("[data-share-card-download]");
  const copyShortBtn = section.querySelector("[data-share-copy-short]");
  const preview = section.querySelector("[data-share-card-preview]");

  if (shortDisplay) {
    shortDisplay.textContent = t("share.usingShortLink", { url: shortUrl });
  }

  if (cardLink) {
    cardLink.href = cardUrl;
  }

  function showFeedback(message) {
    if (!feedback) return;
    feedback.textContent = message;
    setTimeout(function () {
      feedback.textContent = "";
    }, 2500);
  }

  function copyText(value, successMessage) {
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
    const words = text.split(/\s+/);
    const lines = [];
    let line = "";

    words.forEach(function (word) {
      const testLine = line ? line + " " + word : word;
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

  function drawCard(qrCanvas) {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext("2d");

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
    const titleLines = wrapText(ctx, link.title, 820);
    let y = 170;
    titleLines.forEach(function (line) {
      ctx.fillText(line, 96, y);
      y += 78;
    });

    ctx.font = "36px Georgia, 'Times New Roman', serif";
    y += 24;
    const excerptLines = wrapText(ctx, link.excerpt, 820);
    excerptLines.forEach(function (line) {
      ctx.fillText(line, 96, y);
      y += 52;
    });

    const qrSize = 260;
    const qrX = 96;
    const qrY = canvas.height - 96 - qrSize - 120;
    ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);

    ctx.font = "30px Georgia, 'Times New Roman', serif";
    ctx.fillText(t("shareCard.scanOrTap"), 96, qrY + qrSize + 28);

    ctx.font = "28px Georgia, 'Times New Roman', serif";
    const shortLabel = shortUrl.replace(/^https?:\/\//, "");
    ctx.fillText(shortLabel, 96, qrY + qrSize + 72);

    if (preview) {
      preview.innerHTML = "";
      const img = document.createElement("img");
      img.src = canvas.toDataURL("image/png");
      img.alt = link.title;
      img.width = 360;
      img.height = 360;
      preview.appendChild(img);
    }

    return canvas;
  }

  function renderCard() {
    if (!window.QRCode) return;

    const qrCanvas = document.createElement("canvas");
    return QRCode.toCanvas(qrCanvas, shortUrl, {
      width: 260,
      margin: 1,
      color: { dark: "#000000", light: "#ffffff" },
    }).then(function () {
      return drawCard(qrCanvas);
    });
  }

  if (downloadBtn) {
    downloadBtn.addEventListener("click", function () {
      renderCard()
        .then(function (canvas) {
          const anchor = document.createElement("a");
          anchor.download = link.code + "-share.png";
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
      copyText(shortUrl, t("shareCard.copyShortOk"));
    });
  }

  if (window.QRCode) {
    renderCard().catch(function () {
      /* preview optional */
    });
  }
})();
