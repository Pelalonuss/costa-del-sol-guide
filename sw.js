/* Offline-Cache: Der Guide funktioniert auch ohne Internet in Spanien.
   Strategie:
   - HTML: network-first (frisch wenn online, aus dem Cache wenn nicht)
   - CSS/JS/Assets: stale-while-revalidate (sofort aus dem Cache, im Hintergrund
     wird die neue Version geholt und beim nächsten Laden benutzt)
   Damit bleibt die Seite offline nutzbar UND holt sich Updates von selbst. */

var CACHE = 'costa-del-sol-guide-v2';
var ASSETS = ['./', './index.html', './style.css', './app.js', './manifest.webmanifest', './assets/icon.svg'];

self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).catch(function () { }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || req.url.indexOf('http') !== 0) return;
  /* nur eigene Dateien cachen, keine fremden Hosts */
  if (new URL(req.url).origin !== self.location.origin) return;

  var isDoc = req.mode === 'navigate' || (req.headers.get('accept') || '').indexOf('text/html') !== -1;

  if (isDoc) {
    /* network-first */
    e.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
        return res;
      }).catch(function () {
        return caches.match(req).then(function (r) { return r || caches.match('./index.html'); });
      })
    );
    return;
  }

  /* stale-while-revalidate */
  e.respondWith(
    caches.match(req).then(function (cached) {
      var fresh = fetch(req).then(function (res) {
        if (res && res.status === 200) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      }).catch(function () { return cached; });
      return cached || fresh;
    })
  );
});
