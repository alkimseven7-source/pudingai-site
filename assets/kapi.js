/* Tek kapı (Alkım, 2026-11-27): ana sayfadaki düğme bu cihazda oturum varsa "Odana dön", yoksa "Konuşmaya başla".
   /api/oturum yalnız evet/hayır döner (kimlik yok); çerez HttpOnly, sayfa okuyamaz. Kontrol başarısız olursa metin değişmez.
   Eski ?gizlilik bağlantısı (site barının kutusu artık yok) aydınlatma metnine gider. */
(function () {
  var en = document.documentElement.lang === "en";
  try {
    var u = new URL(location.href);
    if (u.searchParams.has("gizlilik")) { location.replace(en ? "/odam?dil=en&aydinlatma" : "/odam?aydinlatma"); return; }
  } catch (e) {}
  var dugmeler = document.querySelectorAll("a.pd-kapi");
  if (!dugmeler.length || !window.fetch) return;
  fetch("/api/oturum", { credentials: "same-origin", cache: "no-store" })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (d) {
      if (!d || d.oturum !== true) return;
      Array.prototype.forEach.call(dugmeler, function (a) { a.textContent = en ? "Back to your room" : "Odana dön"; });
    })
    .catch(function () {});
})();
