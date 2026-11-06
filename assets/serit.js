/* PUDİNG şeridi (Alkım, 2026-11-06): ifadenin üstüne gelince, dokununca ya da klavyeyle odaklanınca açıklama kutusu açılır.
   Kutu ekrandan taşmaz: yana kayar (ok ifadede kalır), üstte yer yoksa altta açılır. */
(function () {
  "use strict";
  var KENAR = 16, kaplar = [].slice.call(document.querySelectorAll(".pd-serit-kap")), sonIsaretci = "";
  function yerlestir(k) {
    var kutu = k.querySelector(".pd-ipucu");
    k.classList.remove("pd-alta");
    kutu.style.setProperty("--pd-kay", "0px");
    var r = kutu.getBoundingClientRect(), g = document.documentElement.clientWidth, kay = 0;
    if (r.left < KENAR) kay = KENAR - r.left;
    else if (r.right > g - KENAR) kay = g - KENAR - r.right;
    kutu.style.setProperty("--pd-kay", kay.toFixed(1) + "px");
    if (r.top < KENAR) k.classList.add("pd-alta");
  }
  function kapa(k) {
    k.classList.remove("pd-acik");
    k.querySelector("button").setAttribute("aria-expanded", "false");
  }
  function ac(k) {
    kaplar.forEach(function (o) { if (o !== k) kapa(o); });
    k.classList.add("pd-acik");
    k.querySelector("button").setAttribute("aria-expanded", "true");
    yerlestir(k);
  }
  kaplar.forEach(function (k) {
    var dugme = k.querySelector("button");
    k.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") ac(k); });
    k.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse" && !dugme.matches(":focus-visible")) kapa(k); });
    dugme.addEventListener("pointerdown", function (e) { sonIsaretci = e.pointerType; });
    dugme.addEventListener("focus", function () { if (dugme.matches(":focus-visible")) ac(k); });
    dugme.addEventListener("blur", function () { kapa(k); });
    dugme.addEventListener("click", function () {
      if (sonIsaretci === "mouse") { sonIsaretci = ""; return; }   // imleçte kutuyu üstüne gelmek açar
      sonIsaretci = "";
      k.classList.contains("pd-acik") ? kapa(k) : ac(k);
    });
  });
  function hepsiniKapa() { kaplar.forEach(kapa); }
  document.addEventListener("pointerdown", function (e) { if (!e.target.closest(".pd-serit-kap")) hepsiniKapa(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") hepsiniKapa(); });
  addEventListener("resize", function () { kaplar.forEach(function (k) { if (k.classList.contains("pd-acik")) yerlestir(k); }); });
})();
