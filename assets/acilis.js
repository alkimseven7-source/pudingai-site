/* Açılış satırı (Alkım, 2026-11-05): alt satır başlığın gerçek genişliğine eşitlenir (başlık iki satıra düşse de). Betik çalışmazsa
   site.css'teki oran geçerlidir. Yazı tipi yüklenince ve yeniden boyutlanınca tekrar ölçülür. */
(function () {
  "use strict";
  var baslik = document.querySelector(".pd-acilis-baslik"), alt = document.querySelector(".pd-acilis-alt");
  if (!baslik || !alt) return;
  function genislik(el) {
    var r = document.createRange();
    r.selectNodeContents(el);
    return r.getBoundingClientRect().width;
  }
  function esitle() {
    alt.style.fontSize = "";
    alt.style.fontSize = (parseFloat(getComputedStyle(alt).fontSize) * genislik(baslik) / genislik(alt)).toFixed(2) + "px";
  }
  esitle();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(esitle);
  addEventListener("resize", esitle);
})();
