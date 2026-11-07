/* Açılış satırı (Alkım, 2026-11-05): alt satır başlığın gerçek genişliğine eşitlenir (başlık iki satıra düşse de; her dilde). Betik çalışmazsa
   site.css'teki oran geçerlidir. Yazı tipi yüklenince ve yeniden boyutlanınca tekrar ölçülür. */
(function () {
  "use strict";
  var baslik = document.querySelector(".pd-acilis-baslik"), alt = document.querySelector(".pd-acilis-alt");
  if (!baslik || !alt) return;
  function genislik(el) {  // alt satır iki parçaysa (İspanyolca, dar ekran) en geniş satır
    var r = document.createRange(), parcalar = el.querySelectorAll("span"), en = 0;
    (parcalar.length && getComputedStyle(parcalar[0]).display === "block" ? [].slice.call(parcalar) : [el]).forEach(function (p) {
      r.selectNodeContents(p);
      en = Math.max(en, r.getBoundingClientRect().width);
    });
    return en;
  }
  function esitle() {
    alt.style.fontSize = "";
    alt.style.fontSize = (parseFloat(getComputedStyle(alt).fontSize) * genislik(baslik) / genislik(alt)).toFixed(2) + "px";
  }
  esitle();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(esitle);
  addEventListener("resize", esitle);
})();
