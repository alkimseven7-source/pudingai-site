/* Tema düğmesi (Alkım, 2026-11-09): açık / koyu / otomatik; tek anahtar puding_tema. Sayfa açılırken temayı <head>'deki satır içi betik uygular;
   bu dosya düğmeyi, "otomatik" bağlantısını, cihaz ayarı değişimini ve telefonun üst çubuk rengini yönetir. Saat kullanılmaz. */
(function () {
  "use strict";
  var ANAHTAR = "puding_tema", kok = document.documentElement;
  var mq = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  var bellek = null;  // localStorage kapalıysa seçim bu sayfada kalır
  var OTO = {tr: "otomatik", en: "auto", es: "auto"}[(kok.lang || "tr").slice(0, 2)] || "otomatik";

  function secim() {
    var t = bellek;
    try { t = localStorage.getItem(ANAHTAR) || bellek; } catch (e) {}
    if (t === "gunduz") return "acik";  // eski /odam ayarı
    if (t === "gece") return "koyu";
    return t === "acik" || t === "koyu" ? t : "otomatik";
  }
  function yaz(t) {
    bellek = t;
    try { localStorage.setItem(ANAHTAR, t); } catch (e) {}
  }
  function koyuMu(t) { return t === "koyu" || (t !== "acik" && !!(mq && mq.matches)); }
  // Geçiş (Alkım, 2026-11-09): koyuluk Puding simgesinden daire olarak yayılır; açığa dönerken simgede toplanır. Tarayıcı View Transitions
  // bilmiyorsa ya da hareketi azalt açıksa anında. Cihaz ayarı ya da başka sekme değişince de anında (dokunuş yok).
  function simgedenGec(degistir) {
    var once = kok.getAttribute("data-theme") === "koyu";
    var b = document.querySelector(".pd-tema-dugme");
    if (!document.startViewTransition || !b || (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches)) return degistir();
    if (koyuMu(secim()) === once) return degistir();
    var r = b.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    var yaricap = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    var kucuk = "circle(0px at " + x + "px " + y + "px)", buyuk = "circle(" + yaricap + "px at " + x + "px " + y + "px)";
    if (once) kok.classList.add("tema-cekil");  // koyu görüntü üstte kalır, simgede toplanır
    var v = document.startViewTransition(degistir);
    v.ready.then(function () {
      kok.animate({clipPath: once ? [buyuk, kucuk] : [kucuk, buyuk]},
                  {duration: 560, easing: "cubic-bezier(.4,0,.2,1)", pseudoElement: once ? "::view-transition-old(root)" : "::view-transition-new(root)"});
    }).catch(function () {});
    v.finished.then(function () { kok.classList.remove("tema-cekil"); }, function () { kok.classList.remove("tema-cekil"); });
  }
  function uygula() {
    var t = secim(), koyu = koyuMu(t);
    kok.setAttribute("data-theme", koyu ? "koyu" : "acik");
    // otomatikte iki meta kendi media koşuluyla çalışır; elle seçimde ikisi de seçilen zemini alır
    var zemin = getComputedStyle(kok).getPropertyValue("--zemin").trim();
    Array.prototype.forEach.call(document.querySelectorAll('meta[name="theme-color"]'), function (m) {
      if (!m.dataset.ilk) m.dataset.ilk = m.content;
      m.content = t === "otomatik" ? m.dataset.ilk : zemin;
    });
    Array.prototype.forEach.call(document.querySelectorAll(".pd-tema-dugme"), function (b) { b.setAttribute("aria-pressed", String(koyu)); });
    Array.prototype.forEach.call(document.querySelectorAll(".pd-tema-oto"), function (b) { b.textContent = OTO; b.hidden = t === "otomatik"; });
  }
  document.addEventListener("click", function (e) {
    var h = e.target.closest && e.target.closest(".pd-tema-dugme, .pd-tema-oto");
    if (!h) return;
    yaz(h.classList.contains("pd-tema-oto") ? "otomatik" : (koyuMu(secim()) ? "acik" : "koyu"));
    simgedenGec(uygula);
  });
  if (mq) {
    var degisti = function () { if (secim() === "otomatik") uygula(); };
    if (mq.addEventListener) mq.addEventListener("change", degisti); else if (mq.addListener) mq.addListener(degisti);
  }
  window.addEventListener("storage", function (e) { if (e.key === ANAHTAR) uygula(); });
  uygula();
})();
