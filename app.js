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
  var SECTION_NAMES = {
    uebersicht: 'Übersicht', tage: 'Die 11 Tage', essen: 'Essen',
    shopping: 'Shopping', achtung: 'Achtung', budget: 'Budget', extras: 'Extras'
  };

  var marks = [];      /* alle gefundenen Fundstellen in DOM-Reihenfolge */
  var markIndex = -1;  /* welche gerade angesprungen ist */

  /* Akzente und Umlaute einebnen, damit "malaga" auch "Málaga" findet.
     Jede Ersetzung ist 1 Zeichen -> 1 Zeichen, damit die Fundstellen-Positionen
     im Originaltext gültig bleiben. */
  function fold(s) {
    return s.toLowerCase()
      .replace(/[áàâãä]/g, 'a').replace(/[éèêë]/g, 'e').replace(/[íìîï]/g, 'i')
      .replace(/[óòôõö]/g, 'o').replace(/[úùûü]/g, 'u')
      .replace(/[ñ]/g, 'n').replace(/[ç]/g, 'c');
  }

  var si = document.getElementById('search');
  if (si) {
    var timer = null;
    si.addEventListener('input', function () {
      clearTimeout(timer);
      timer = setTimeout(function () { runSearch(fold(si.value.trim())); }, 160);
    });
    /* Enter springt zur nächsten Fundstelle */
    si.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' || !marks.length) return;
      e.preventDefault();
      gotoMark(markIndex + (e.shiftKey ? -1 : 1));
    });
  }

  /* Markierungen wieder entfernen und Textknoten zusammenführen */
  function clearHighlights() {
    var old = document.querySelectorAll('mark.hl');
    Array.prototype.forEach.call(old, function (m) {
      var p = m.parentNode;
      if (!p) return;
      p.replaceChild(document.createTextNode(m.textContent), m);
      p.normalize();
    });
    Array.prototype.forEach.call(document.querySelectorAll('.hitbar'), function (b) { b.remove(); });
    marks = [];
    markIndex = -1;
  }

  /* Suchbegriff im sichtbaren Text eines Elements einfärben */
  function highlightIn(el, q) {
    var found = [];
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (!n.nodeValue || fold(n.nodeValue).indexOf(q) === -1) return NodeFilter.FILTER_REJECT;
        var p = n.parentNode;
        if (!p) return NodeFilter.FILTER_REJECT;
        var tag = p.nodeName;
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'MARK') return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = [], n;
    while ((n = walker.nextNode())) nodes.push(n);

    nodes.forEach(function (node) {
      var txt = node.nodeValue, low = fold(txt);
      var idx = low.indexOf(q);
      if (idx === -1) return;
      var frag = document.createDocumentFragment();
      var i = 0;
      while (idx !== -1) {
        if (idx > i) frag.appendChild(document.createTextNode(txt.slice(i, idx)));
        var m = document.createElement('mark');
        m.className = 'hl';
        m.textContent = txt.slice(idx, idx + q.length);
        frag.appendChild(m);
        found.push(m);
        i = idx + q.length;
        idx = low.indexOf(q, i);
      }
      if (i < txt.length) frag.appendChild(document.createTextNode(txt.slice(i)));
      if (node.parentNode) node.parentNode.replaceChild(frag, node);
    });
    return found;
  }

  /* Zu einer bestimmten Fundstelle springen */
  function gotoMark(i) {
    if (!marks.length) return;
    if (i < 0) i = marks.length - 1;
    if (i >= marks.length) i = 0;
    markIndex = i;
    Array.prototype.forEach.call(document.querySelectorAll('mark.hl.current'), function (m) { m.classList.remove('current'); });
    var m = marks[i];
    m.classList.add('current');
    var day = m.closest ? m.closest('.day') : null;
    if (day) day.classList.add('open');
    m.scrollIntoView({ behavior: 'smooth', block: 'center' });
    updateCounter();
  }

  function updateCounter() {
    var el = document.getElementById('hitPos');
    if (el) el.textContent = marks.length ? (markIndex < 0 ? 1 : markIndex + 1) + ' / ' + marks.length : '0';
  }

  function runSearch(q) {
    var units = document.querySelectorAll('[data-searchable]');
    var info = document.getElementById('searchResultInfo');
    var nr = document.getElementById('noresult');

    clearHighlights();

    if (!q) {
      Array.prototype.forEach.call(units, function (u) { u.classList.remove('hidden-by-search'); });
      Array.prototype.forEach.call(document.querySelectorAll('.sect-h'), function (s) { s.classList.remove('hidden-by-search'); });
      /* Einzel-Panel-Ansicht wiederherstellen */
      var activeTab = document.querySelector('.tab[aria-selected="true"]');
      var backTo = activeTab ? activeTab.dataset.target : LS.get('cds-tab', 'uebersicht');
      if (!document.getElementById(backTo)) backTo = 'uebersicht';
      panels.forEach(function (p) { p.classList.toggle('on', p.id === backTo); });
      document.body.classList.remove('searching');
      if (nr) nr.style.display = 'none';
      if (info) info.innerHTML = '';
      return;
    }

    /* Suche läuft über alle Bereiche gleichzeitig */
    panels.forEach(function (p) { p.classList.add('on'); });
    document.body.classList.add('searching');
    Array.prototype.forEach.call(document.querySelectorAll('.sect-h'), function (s) { s.classList.add('hidden-by-search'); });

    var sections = 0;
    Array.prototype.forEach.call(units, function (u) {
      var txt = fold((u.dataset.kw || '') + ' ' + u.textContent);
      var hit = txt.indexOf(q) !== -1;
      u.classList.toggle('hidden-by-search', !hit);
      if (!hit) return;

      sections++;
      if (u.classList.contains('day')) u.classList.add('open');

      /* Schild darüber: in welchem Bereich steckt der Treffer? */
      var panel = u.closest('.panel');
      var name = panel ? (SECTION_NAMES[panel.id] || panel.id) : '';
      var found = highlightIn(u, q) || [];
      marks = marks.concat(found);

      var bar = document.createElement('div');
      bar.className = 'hitbar';
      bar.innerHTML = '<span class="hitbar-sec">' + name + '</span>' +
        '<span class="hitbar-n">' + (found.length ? found.length + (found.length === 1 ? ' Fundstelle' : ' Fundstellen') : 'Stichwort-Treffer') + '</span>';
      if (u.parentNode) u.parentNode.insertBefore(bar, u);
    });

    if (nr) nr.style.display = sections ? 'none' : 'block';

    if (info) {
      if (!sections) {
        info.innerHTML = '';
      } else {
        info.innerHTML =
          '<b>' + marks.length + '</b> Fundstelle' + (marks.length === 1 ? '' : 'n') +
          ' in <b>' + sections + '</b> Abschnitt' + (sections === 1 ? '' : 'en') +
          ' <span class="hitnav">' +
          '<button type="button" class="hitbtn" id="hitPrev" aria-label="Vorherige Fundstelle">&#8249;</button>' +
          '<span id="hitPos">' + (marks.length ? '1 / ' + marks.length : '0') + '</span>' +
          '<button type="button" class="hitbtn" id="hitNext" aria-label="Nächste Fundstelle">&#8250;</button>' +
          '</span>' +
          '<button type="button" class="hitbtn wide" id="hitReset">Suche beenden</button>';

        var pv = document.getElementById('hitPrev'), nx = document.getElementById('hitNext'), rs = document.getElementById('hitReset');
        if (pv) pv.addEventListener('click', function () { gotoMark(markIndex - 1); });
        if (nx) nx.addEventListener('click', function () { gotoMark(markIndex + 1); });
        if (rs) rs.addEventListener('click', resetSearch);
      }
    }

    /* automatisch zur ersten Fundstelle springen */
    if (marks.length) setTimeout(function () { gotoMark(0); }, 60);
  }

  function resetSearch() {
    if (si) { si.value = ''; si.blur(); }
    runSearch('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  var clearBtn = document.getElementById('clearSearch');
  if (clearBtn) clearBtn.addEventListener('click', resetSearch);

  /* Escape beendet die Suche */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && si && si.value) resetSearch();
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
