(function () {
  "use strict";

  var measurementId = window.BLOG_GA_ID;

  if (!measurementId || measurementId.indexOf("G-") !== 0 || measurementId.indexOf("XXXX") !== -1) {
    return;
  }

  var script = document.createElement("script");
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtag/js?id=" + measurementId;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;

  gtag("js", new Date());
  gtag("config", measurementId, {
    anonymize_ip: true,
    send_page_view: true,
  });
})();
