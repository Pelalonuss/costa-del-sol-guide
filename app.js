/* ============================================================
   Costa del Sol Guide — Interaktion
   Tabs, Akkordeon, Theme, Suche, Checklisten, Offline
   ============================================================ */
(function () {
  'use strict';

  var LS = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { } }
  };

  /* ---------- Theme ---------- */
  var root = document.documentElement;
  function applyTheme(t) {
    root.setAttribute('data-theme', t);
    var b = document.getElementById('themeBtn');
    if (b) b.setAttribute('aria-label', t === 'dark' ? 'Helles Design' : 'Dunkles Design');
  }
  var saved = LS.get('cds-theme', null);
  applyTheme(saved || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('#themeBtn');
    if (!b) return;
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next); LS.set('cds-theme', next);
  });

  /* ---------- Tabs ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));
  var panels = Array.prototype.slice.call(document.querySelectorAll('.panel'));

  function showTab(id, push) {
    tabs.forEach(function (t) { t.setAttribute('aria-selected', String(t.dataset.target === id)); });
    panels.forEach(function (p) { p.classList.toggle('on', p.id === id); });
    var active = document.querySelector('.tab[aria-selected="true"]');
    if (active && active.scrollIntoView) active.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    LS.set('cds-tab', id);
    if (push && history.replaceState) history.replaceState(null, '', '#' + id);
  }

  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      showTab(t.dataset.target, true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  var startTab = (location.hash || '').replace('#', '');
  if (!startTab || !document.getElementById(startTab)) startTab = LS.get('cds-tab', 'uebersicht');
  if (!document.getElementById(startTab)) startTab = 'uebersicht';
  showTab(startTab, false);

  /* interne Links, die auf einen Tab zeigen */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-goto]');
    if (!a) return;
    e.preventDefault();
    var target = a.dataset.goto;
    var anchor = a.dataset.anchor;
    showTab(target, true);
    setTimeout(function () {
      if (anchor) {
        var el = document.getElementById(anchor);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          if (el.classList.contains('day')) el.classList.add('open');
        }
      } else window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 60);
  });

  /* ---------- Tages-Akkordeon ---------- */
  document.addEventListener('click', function (e) {
    var h = e.target.closest && e.target.closest('.day-head');
    if (!h) return;
    var d = h.parentElement;
    var open = d.classList.toggle('open');
    h.setAttribute('aria-expanded', String(open));
  });

  var expandBtn = document.getElementById('expandAll');
  if (expandBtn) {
    expandBtn.addEventListener('click', function () {
      var days = document.querySelectorAll('#tage .day');
      var anyClosed = Array.prototype.some.call(days, function (d) { return !d.classList.contains('open'); });
      Array.prototype.forEach.call(days, function (d) {
        d.classList.toggle('open', anyClosed);
        var hh = d.querySelector('.day-head');
        if (hh) hh.setAttribute('aria-expanded', String(anyClosed));
      });
      expandBtn.textContent = anyClosed ? 'Alle zuklappen' : 'Alle aufklappen';
    });
  }

  /* aktuellen Tag automatisch öffnen */
  (function openToday() {
    var days = document.querySelectorAll('#tage .day[data-date]');
    var today = new Date();
    var iso = today.getFullYear() + '-' +
      String(today.getMonth() + 1).padStart(2, '0') + '-' +
      String(today.getDate()).padStart(2, '0');
    var hit = null;
    Array.prototype.forEach.call(days, function (d) { if (d.dataset.date === iso) hit = d; });
    if (hit) {
      hit.classList.add('open');
      var hh = hit.querySelector('.day-head');
      if (hh) hh.setAttribute('aria-expanded', 'true');
      var badge = hit.querySelector('.daynum');
      if (badge) badge.style.background = 'linear-gradient(150deg,var(--olive),var(--olive))';
      var t = hit.querySelector('.day-t .date');
      if (t) t.textContent = t.textContent + ' · HEUTE';
    } else if (days.length) {
      days[0].classList.add('open');
    }
  })();

  /* ---------- Countdown / Reisetag ---------- */
  (function countdown() {
    var el = document.getElementById('countdown');
    if (!el) return;
    var start = new Date(2026, 7, 31);  // 31.08.2026
    var end = new Date(2026, 8, 10);    // 10.09.2026
    var now = new Date();
    var d0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var day = 86400000;
    if (d0 < start) {
      var n = Math.round((start - d0) / day);
      el.textContent = n === 1 ? 'noch 1 Tag' : 'noch ' + n + ' Tage';
    } else if (d0 <= end) {
      el.textContent = 'Tag ' + (Math.round((d0 - start) / day) + 1) + ' von 11';
    } else {
      el.textContent = '¡Hasta la próxima!';
    }
  })();

  /* ---------- Checklisten mit Speicher ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('.check input[type=checkbox]'), function (cb) {
    var key = 'cds-chk-' + (cb.dataset.k || cb.id || '');
    if (LS.get(key) === '1') cb.checked = true;
    cb.addEventListener('change', function () { LS.set(key, cb.checked ? '1' : '0'); });
  });
  var resetBtn = document.getElementById('resetChecks');
  if (resetBtn) resetBtn.addEventListener('click', function () {
    if (!confirm('Alle Haken zurücksetzen?')) return;
    Array.prototype.forEach.call(document.querySelectorAll('.check input[type=checkbox]'), function (cb) {
      cb.checked = false; LS.set('cds-chk-' + (cb.dataset.k || cb.id || ''), '0');
    });
  });

  /* ---------- Suche ---------- */
  var si = document.getElementById('search');
  if (si) {
    var timer = null;
    si.addEventListener('input', function () {
      clearTimeout(timer);
      timer = setTimeout(function () { runSearch(si.value.trim().toLowerCase()); }, 130);
    });
  }

  function runSearch(q) {
    var hitCount = 0;
    var units = document.querySelectorAll('[data-searchable]');
    if (!q) {
      Array.prototype.forEach.call(units, function (u) { u.classList.remove('hidden-by-search'); });
      Array.prototype.forEach.call(document.querySelectorAll('.sect-h'), function (s) { s.classList.remove('hidden-by-search'); });
      /* Einzel-Panel-Ansicht wiederherstellen */
      var activeTab = document.querySelector('.tab[aria-selected="true"]');
      var backTo = activeTab ? activeTab.dataset.target : LS.get('cds-tab', 'uebersicht');
      if (!document.getElementById(backTo)) backTo = 'uebersicht';
      panels.forEach(function (p) { p.classList.toggle('on', p.id === backTo); });
      var nr0 = document.getElementById('noresult'); if (nr0) nr0.style.display = 'none';
      var sr = document.getElementById('searchResultInfo'); if (sr) sr.textContent = '';
      return;
    }
    /* Suche über alle Panels: alle anzeigen, Treffer filtern */
    panels.forEach(function (p) { p.classList.add('on'); });
    Array.prototype.forEach.call(document.querySelectorAll('.sect-h'), function (s) { s.classList.add('hidden-by-search'); });
    Array.prototype.forEach.call(units, function (u) {
      var txt = (u.dataset.kw || '') + ' ' + u.textContent.toLowerCase();
      var hit = txt.indexOf(q) !== -1;
      u.classList.toggle('hidden-by-search', !hit);
      if (hit) {
        hitCount++;
        if (u.classList.contains('day')) u.classList.add('open');
      }
    });
    var nr = document.getElementById('noresult');
    if (nr) nr.style.display = hitCount ? 'none' : 'block';
    var info = document.getElementById('searchResultInfo');
    if (info) info.textContent = hitCount + ' Treffer für "' + q + '" (alle Bereiche)';
  }

  var clearBtn = document.getElementById('clearSearch');
  if (clearBtn) clearBtn.addEventListener('click', function () {
    if (si) { si.value = ''; }
    runSearch('');
    showTab(LS.get('cds-tab', 'uebersicht'), false);
  });

  /* ---------- Nach oben ---------- */
  var top = document.getElementById('toTop');
  if (top) {
    window.addEventListener('scroll', function () { top.classList.toggle('on', window.scrollY > 700); }, { passive: true });
    top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  /* ---------- Offline / Service Worker ---------- */
  if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('./sw.js').catch(function () { });
    });
  }
  function netState() {
    var el = document.getElementById('netState');
    if (!el) return;
    el.textContent = navigator.onLine ? '' : 'offline — gespeicherte Version';
  }
  window.addEventListener('online', netState);
  window.addEventListener('offline', netState);
  netState();
})();
