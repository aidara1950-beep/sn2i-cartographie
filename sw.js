/* SN2I — garde la page du formulaire de terrain pour l'ouvrir HORS RÉSEAU
   (recette QA du 08/10/2026 : « ajouter à l'écran d'accueil » donnait, hors
   réseau, la page d'erreur du navigateur).
   Règle : le réseau d'abord — l'enquêteur a toujours la dernière version quand il
   capte ; la copie gardée ne sert que hors réseau. Seule la page du formulaire
   est concernée : la console, la base et tout le reste passent sans copie. */
var CACHE = 'sn2i-formulaire-v1';
var PAGES = ['./', './index.html'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(PAGES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (cles) {
    return Promise.all(cles.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var u = new URL(e.request.url);
  var page = e.request.method === 'GET' && u.origin === self.location.origin &&
    (u.pathname.endsWith('/') || u.pathname.endsWith('/index.html')) && u.pathname.indexOf('console') === -1;
  if (!page) { return; }
  e.respondWith(fetch(e.request).then(function (r) {
    if (r && r.ok) { var copie = r.clone(); caches.open(CACHE).then(function (c) { c.put('./index.html', copie); }); }
    return r;
  }).catch(function () { return caches.match('./index.html'); }));
});
