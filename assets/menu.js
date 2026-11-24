/* Açık kayıt açıkken BAŞVUR menüden kalkar (Alkım, 2026-11-05). Ayar sunucuda (PUDING_ACIK_KAYIT); sunucuya ulaşılamazsa
   menü olduğu gibi kalır. Kimlik yok, çerez yok: yanıt yalnız evet/hayır. */
fetch("/api/kayit_durum", { credentials: "omit" })
  .then(function (r) { return r.ok ? r.json() : null; })
  .then(function (d) {
    if (d && d.acik_kayit) document.querySelectorAll(".pd-basvur").forEach(function (a) { a.remove(); });
  })
  .catch(function () {});

/* Kurulum (Alkım, 2026-11-07; 2026-11-24): İNDİR sayfadan çıkmaz. Chrome ve Edge: tarayıcının yükleme penceresi.
   Öteki her durumda (iPhone, uygulama içi tarayıcı) bağlantı /odam?kur'a gider; sitede ipucu yok. Uygulama açıksa düğme yok;
   bu tarayıcıda yüklüyse "AÇ". Yalnız bu cihazda "pd_yuklu" işareti tutulur; JavaScript yoksa bağlantı /odam?kur'a gider. */
(function () {
  var METIN = {
    tr: {ac: "AÇ", acEtiket: "Puding'i aç"},
    en: {ac: "OPEN", acEtiket: "Open Puding"},
    es: {ac: "ABRIR", acEtiket: "Abrir Puding"}
  };
  var T = METIN[(document.documentElement.lang || "tr").slice(0, 2)] || METIN.tr;
  var ua = navigator.userAgent;
  var uygulamaIci = /Instagram|FBAN|FBAV|FB_IAB|FBIOS|Messenger|TikTok|musical_ly|BytedanceWebview|LinkedInApp|Snapchat|\bLine\//.test(ua);
  var istem = null;

  function uygulamadaMi() {
    return matchMedia("(display-mode: standalone)").matches || matchMedia("(display-mode: fullscreen)").matches
      || matchMedia("(display-mode: minimal-ui)").matches || navigator.standalone === true;
  }
  function isaret(deger) {
    try { if (deger) localStorage.setItem("pd_yuklu", "1"); else localStorage.removeItem("pd_yuklu"); } catch (e) {}
  }
  function isaretli() { try { return localStorage.getItem("pd_yuklu") === "1"; } catch (e) { return false; } }
  function dugmeler(fn) { Array.prototype.forEach.call(document.querySelectorAll(".pd-indir"), fn); }
  function durumYaz() {
    if (uygulamadaMi()) { isaret(true); dugmeler(function (a) { a.hidden = true; a.style.display = "none"; }); return; }
    dugmeler(function (a) {
      if (!a.dataset.yazi) { a.dataset.yazi = a.textContent; a.dataset.etiket = a.getAttribute("aria-label") || ""; }
      var yuklu = isaretli();
      a.textContent = yuklu ? T.ac : a.dataset.yazi;
      a.setAttribute("aria-label", yuklu ? T.acEtiket : a.dataset.etiket);
      a.setAttribute("href", yuklu ? "/odam" : "/odam?kur");
      if (yuklu) a.dataset.acik = "1"; else delete a.dataset.acik;
    });
  }

  if (!document.querySelector('link[rel="manifest"]')) {
    var l = document.createElement("link"); l.rel = "manifest"; l.href = "/manifest.webmanifest"; document.head.appendChild(l);
  }
  function pencereAc() {
    var i = istem; istem = null;
    i.prompt();
    i.userChoice.then(function (c) { if (c && c.outcome === "accepted") { isaret(true); durumYaz(); } }).catch(function () {});
  }
  function tiklandi(e) {
    var a = e.target.closest && e.target.closest(".pd-indir");
    if (!a || a.dataset.acik) return;
    // Sitede "ana ekrana ekle" ipucu yok (Alkım, 2026-11-24): yalnız tarayıcının kendi yükleme penceresi;
    // o yoksa bağlantı /odam?kur'a gider, yönerge uygulamada (Odam) görünür.
    if (!istem || uygulamaIci) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    pencereAc();
  }

  addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    istem = e;
    isaret(false);   // tarayıcı öneriyorsa uygulama yüklü değildir
    durumYaz();
  });
  addEventListener("appinstalled", function () { istem = null; isaret(true); durumYaz(); });
  // Site her zaman siteyi gösterir (Alkım, 2026-11-07): Odam'a yalnız GİRİŞ ve AÇ ile gidilir, kendiliğinden geçiş yok
  var pencere = matchMedia("(display-mode: standalone)");
  if (pencere.addEventListener) pencere.addEventListener("change", durumYaz);
  document.addEventListener("click", tiklandi, true);
  durumYaz();
})();
