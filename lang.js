(function () {
  "use strict";

  var STORAGE_KEY = "blog_lang";
  var DEFAULT_LANG = "pt-BR";
  var SUPPORTED = ["pt-BR", "en-US"];

  function getScriptBase() {
    var script = document.querySelector('script[src*="lang.js"]');
    if (!script) return "locales/";
    var src = script.getAttribute("src") || "";
    if (src.indexOf("../") === 0) return "../locales/";
    return "locales/";
  }

  function getNested(obj, path) {
    return path.split(".").reduce(function (acc, key) {
      return acc && acc[key] !== undefined ? acc[key] : null;
    }, obj);
  }

  function interpolate(text, params) {
    if (!params || !text) return text;
    return text.replace(/\{(\w+)\}/g, function (_, key) {
      return params[key] !== undefined ? params[key] : "";
    });
  }

  var state = {
    lang: DEFAULT_LANG,
    dict: {},
    listeners: [],
  };

  function t(key, params) {
    var value = getNested(state.dict, key);
    if (value === null || value === undefined) return key;
    return interpolate(String(value), params);
  }

  function notify() {
    state.listeners.forEach(function (fn) {
      fn(state.lang, state.dict);
    });
    document.dispatchEvent(
      new CustomEvent("bloglangchange", { detail: { lang: state.lang, dict: state.dict } })
    );
  }

  function applyTranslations() {
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      var value = t(key);
      if (value && value !== key) el.textContent = value;
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-placeholder");
      var value = t(key);
      if (value && value !== key) el.setAttribute("placeholder", value);
    });

    var titleKey = document.body.getAttribute("data-i18n-title");
    if (titleKey) {
      document.title = t(titleKey);
    }

    var metaDesc = document.querySelector('meta[name="description"][data-i18n-content]');
    if (metaDesc) {
      var descKey = metaDesc.getAttribute("data-i18n-content");
      metaDesc.setAttribute("content", t(descKey));
    }
  }

  function setActiveFlag(lang) {
    document.querySelectorAll(".lang-flag").forEach(function (btn) {
      var isActive = btn.getAttribute("data-lang") === lang;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  function loadLanguage(lang) {
    if (SUPPORTED.indexOf(lang) === -1) lang = DEFAULT_LANG;
    var base = getScriptBase();
    return fetch(base + lang + ".json")
      .then(function (res) {
        if (!res.ok) throw new Error("locale");
        return res.json();
      })
      .then(function (dict) {
        state.lang = lang;
        state.dict = dict;
        localStorage.setItem(STORAGE_KEY, lang);
        document.documentElement.lang = lang;
        setActiveFlag(lang);
        applyTranslations();
        notify();
      });
  }

  function initSwitcher() {
    document.querySelectorAll(".lang-flag").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var lang = btn.getAttribute("data-lang");
        if (lang && lang !== state.lang) loadLanguage(lang);
      });
    });
  }

  window.BlogI18n = {
    t: t,
    getLang: function () {
      return state.lang;
    },
    onChange: function (fn) {
      state.listeners.push(fn);
    },
  };

  document.addEventListener("DOMContentLoaded", function () {
    initSwitcher();
    var saved = localStorage.getItem(STORAGE_KEY);
    var browser = (navigator.language || "").toLowerCase();
    var initial = saved || (browser.indexOf("en") === 0 ? "en-US" : DEFAULT_LANG);
    loadLanguage(initial).catch(function () {
      loadLanguage(DEFAULT_LANG);
    });
  });
})();
