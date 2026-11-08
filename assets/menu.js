/* Açık kayıt açıkken BAŞVUR menüden kalkar (Alkım, 2026-11-05). Ayar sunucuda (PUDING_ACIK_KAYIT); sunucuya ulaşılamazsa
   menü olduğu gibi kalır. Kimlik yok, çerez yok: yanıt yalnız evet/hayır. */
fetch("/api/kayit_durum", { credentials: "omit" })
  .then(function (r) { return r.ok ? r.json() : null; })
  .then(function (d) {
    if (d && d.acik_kayit) document.querySelectorAll(".pd-basvur").forEach(function (a) { a.remove(); });
  })
  .catch(function () {});

/* Kurulum (Alkım, 2026-11-07): İNDİR sayfadan çıkmaz. Chrome ve Edge: tarayıcının yükleme penceresi. iPhone: Paylaş oku.
   Instagram, Facebook gibi uygulama içi tarayıcılar yükleyemez: dış tarayıcıya yönlendiren ok. Uygulama açıksa düğme yok;
   bu tarayıcıda yüklüyse "AÇ". Yalnız bu cihazda "pd_yuklu" işareti tutulur; JavaScript yoksa bağlantı /odam?kur'a gider. */
(function () {
  var METIN = {
    tr: {ac: "AÇ", acEtiket: "Puding'i aç", kapat: "Kapat", ios: "Paylaş'a dokun → Ana Ekrana Ekle.",
         ios26: "⋯'ye, sonra Paylaş'a dokun → Ana Ekrana Ekle.",
         ic: "Puding'i yüklemek için bu sayfayı Safari'de (Android'de Chrome'da) aç.",
         android: "Tarayıcının menüsünü (⋮) aç → Ana ekrana ekle.",
         krom: "Chrome şu an yükleme penceresi açmadı; Puding zaten yüklü olabilir. Adres çubuğunun sağındaki simgeye bak.",
         masaustu: "Puding'i bilgisayarına yüklemek için bu sayfayı Chrome'da aç; telefonuna yüklemek için pudingai.com'u telefonundan aç."},
    en: {ac: "OPEN", acEtiket: "Open Puding", kapat: "Close", ios: "Tap Share → Add to Home Screen.",
         ios26: "Tap ⋯, then Share → Add to Home Screen.",
         ic: "To install Puding, open this page in Safari (Chrome on Android).",
         android: "Open the browser menu (⋮) → Add to Home screen.",
         krom: "Chrome didn't open its install window; Puding may already be installed. Check the icon at the right of the address bar.",
         masaustu: "To install Puding on your computer, open this page in Chrome; to install it on your phone, open pudingai.com there."},
    es: {ac: "ABRIR", acEtiket: "Abrir Puding", kapat: "Cerrar", ios: "Toca Compartir → Añadir a pantalla de inicio.",
         ios26: "Toca ⋯ y luego Compartir → Añadir a pantalla de inicio.",
         ic: "Para instalar Puding, abre esta página en Safari (Chrome en Android).",
         android: "Abre el menú del navegador (⋮) → Añadir a pantalla de inicio.",
         krom: "Chrome no abrió la ventana de instalación; puede que Puding ya esté instalado. Mira el icono a la derecha de la barra de direcciones.",
         masaustu: "Para instalar Puding en tu ordenador, abre esta página en Chrome; para instalarlo en tu teléfono, abre pudingai.com allí."}
  };
  var T = METIN[(document.documentElement.lang || "tr").slice(0, 2)] || METIN.tr;
  var ua = navigator.userAgent;
  var ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var iphone = /iPhone|iPod/.test(ua);
  var safari = ios && !/CriOS|FxiOS|EdgiOS|OPiOS|GSA\//.test(ua);
  var android = /Android/.test(ua);
  var uygulamaIci = /Instagram|FBAN|FBAV|FB_IAB|FBIOS|Messenger|TikTok|musical_ly|BytedanceWebview|LinkedInApp|Snapchat|\bLine\//.test(ua);
  var kromYapili = /Chrome\/|Edg\//.test(ua) && !android;
  var istem = null, bekleyen = null;

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
  var stil = document.createElement("style");
  stil.textContent = ".pd-kur{position:fixed;left:12px;right:12px;z-index:2147483000;display:flex;align-items:flex-start;gap:8px;max-width:420px;margin:0 auto;"
    + "padding:14px 8px 14px 18px;background:var(--murekkep);color:var(--murekkep-metin);border-radius:16px;font:600 16px/1.4 Nunito,sans-serif;box-shadow:0 8px 28px var(--golge-koyu)}"
    + ".pd-kur p{margin:0;padding-top:8px;flex:1}.pd-kur button{flex:none;width:44px;height:44px;border:0;background:none;color:var(--murekkep-metin);font:400 26px/1 Nunito,sans-serif;cursor:pointer}"
    + ".pd-kur-alt{bottom:calc(58px + env(safe-area-inset-bottom))}.pd-kur-ust{top:calc(72px + env(safe-area-inset-top))}"
    + ".pd-kur-ok{position:fixed;z-index:2147483000;width:44px;height:48px;color:var(--metin);pointer-events:none;filter:drop-shadow(0 0 3px var(--zemin))}"
    + ".pd-kur-ok svg{display:block;width:100%;height:100%}"
    + ".pd-kur-ok-orta{left:calc(50% - 22px);bottom:calc(6px + env(safe-area-inset-bottom))}"
    + ".pd-kur-ok-sag-alt{right:14px;bottom:calc(6px + env(safe-area-inset-bottom))}"
    + ".pd-kur-ok-sag-ust{right:14px;top:calc(16px + env(safe-area-inset-top));transform:rotate(180deg)}"
    + "@media (prefers-reduced-motion:no-preference){.pd-kur-ok svg{animation:pd-kur-sek 1.1s ease-in-out infinite}}"
    + "@keyframes pd-kur-sek{50%{transform:translateY(6px)}}";
  document.head.appendChild(stil);

  function kapat() {
    Array.prototype.forEach.call(document.querySelectorAll(".pd-kur,.pd-kur-ok"), function (x) { x.remove(); });
    removeEventListener("keydown", tus);
  }
  function tus(e) { if (e.key === "Escape") kapat(); }
  function ipucu(metin, konum, ok) {
    kapat();
    var k = document.createElement("div");
    k.className = "pd-kur pd-kur-" + konum;
    k.setAttribute("role", "status");
    var p = document.createElement("p"); p.textContent = metin; k.appendChild(p);
    var b = document.createElement("button"); b.type = "button"; b.setAttribute("aria-label", T.kapat); b.textContent = "×";
    b.addEventListener("click", kapat); k.appendChild(b);
    document.body.appendChild(k);
    if (ok) {
      var o = document.createElement("div");
      o.className = "pd-kur-ok pd-kur-ok-" + ok;
      o.setAttribute("aria-hidden", "true");
      o.innerHTML = '<svg viewBox="0 0 44 48" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 4v38M8 28l14 14 14-14"/></svg>';
      document.body.appendChild(o);
    }
    addEventListener("keydown", tus);
  }
  function pencereAc() {
    var i = istem; istem = null;
    i.prompt();
    i.userChoice.then(function (c) { if (c && c.outcome === "accepted") { isaret(true); durumYaz(); } }).catch(function () {});
  }
  function yedek() {
    if (android) return ipucu(T.android, "ust", "sag-ust");
    ipucu(kromYapili ? T.krom : T.masaustu, "alt", null);
  }
  function tiklandi(e) {
    var a = e.target.closest && e.target.closest(".pd-indir");
    if (!a || a.dataset.acik) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    if (uygulamaIci) return ipucu(T.ic, "ust", "sag-ust");
    if (ios) {
      var surum = +((/Version\/(\d+)/.exec(ua) || [])[1] || 0);
      if (!safari) return ipucu(T.ios, "alt", null);
      if (!iphone) return ipucu(T.ios, "ust", null);   // iPad: Paylaş üstte
      return surum >= 26 ? ipucu(T.ios26, "alt", "sag-alt") : ipucu(T.ios, "alt", "orta");
    }
    if (istem) return pencereAc();
    bekleyen = setTimeout(function () { bekleyen = null; yedek(); }, 1200);   // tarayıcı yeni öneriyorsa bekle
  }

  addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    istem = e;
    isaret(false);   // tarayıcı öneriyorsa uygulama yüklü değildir
    durumYaz();
    if (bekleyen) { clearTimeout(bekleyen); bekleyen = null; pencereAc(); }
  });
  addEventListener("appinstalled", function () { istem = null; isaret(true); kapat(); durumYaz(); });
  // Site her zaman siteyi gösterir (Alkım, 2026-11-07): Odam'a yalnız GİRİŞ ve AÇ ile gidilir, kendiliğinden geçiş yok
  var pencere = matchMedia("(display-mode: standalone)");
  if (pencere.addEventListener) pencere.addEventListener("change", durumYaz);
  document.addEventListener("click", tiklandi, true);
  durumYaz();
})();
