(function () {
  "use strict";

  var token = window.CF_ANALYTICS_TOKEN;

  if (!token || token.indexOf("XXXX") !== -1 || token.length < 10) {
    return;
  }

  var script = document.createElement("script");
  script.defer = true;
  script.src = "https://static.cloudflareinsights.com/beacon.min.js";
  script.setAttribute("data-cf-beacon", JSON.stringify({ token: token }));
  document.head.appendChild(script);
})();
