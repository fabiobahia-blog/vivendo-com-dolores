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
})();
