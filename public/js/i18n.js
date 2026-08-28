(function () {
  'use strict';

  var SUPPORTED = ['ko', 'en', 'vi', 'km', 'ne', 'id'];
  var FALLBACK = 'en';
  var dict = {};
  var fallbackDict = {};
  var current = FALLBACK;

  function pickLang() {
    var q = new URLSearchParams(location.search).get('lang');
    if (q && SUPPORTED.indexOf(q) >= 0) return q;
    try {
      var saved = localStorage.getItem('hango_lang');
      if (saved && SUPPORTED.indexOf(saved) >= 0) return saved;
    } catch (e) {}
    var nav = (navigator.language || 'en').slice(0, 2).toLowerCase();
    return SUPPORTED.indexOf(nav) >= 0 ? nav : FALLBACK;
  }

  function fetchJson(url) {
    return fetch(url).then(function (r) { return r.ok ? r.json() : {}; }).catch(function () { return {}; });
  }

  function t(key, vars) {
    var s = (dict && dict[key] != null) ? dict[key] : (fallbackDict[key] != null ? fallbackDict[key] : key);
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        s = s.replace(new RegExp('\\{' + k + '\\}', 'g'), vars[k]);
      });
    }
    return s;
  }

  function apply(root) {
    (root || document).querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.documentElement.lang = current;
  }

  function load(lang) {
    current = lang;
    try { localStorage.setItem('hango_lang', lang); } catch (e) {}
    var jobs = [fetchJson('/locales/' + lang + '.json')];
    if (lang !== FALLBACK) jobs.push(fetchJson('/locales/' + FALLBACK + '.json'));
    return Promise.all(jobs).then(function (res) {
      dict = res[0] || {};
      fallbackDict = res[1] || res[0] || {};
      apply(document);
      window.dispatchEvent(new CustomEvent('i18n:changed', { detail: { lang: lang } }));
    });
  }

  window.I18N = {
    t: t,
    apply: apply,
    load: load,
    get lang() { return current; },
    supported: SUPPORTED,
    init: function () {
      var lang = pickLang();
      var sel = document.getElementById('langSelect');
      if (sel) {
        sel.value = lang;
        sel.addEventListener('change', function () { load(sel.value); });
      }
      return load(lang);
    },
  };
})();
