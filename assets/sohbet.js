/* Puding site modu: ana sayfadaki anonim sohbet barı (Alkım, 2026-11-05).
   Saydam açık gri bar; kutu yukarı açılır, arkasında logo; tek kapı "Selam! Ne Pudingisin?".
   Hiçbir şey saklanmaz: görüşme yalnız bu sayfanın belleğinde (yenilenince gider); çerez ve localStorage yok.
   Kaşık: Puding uygun gördüğünde ya da 16. turda arayüz kaşığı gösterir → kayıt ekranı. */
(function () {
  "use strict";
  var TURNSTILE_SITE_KEY = "0x4AAAAAAF0u99NTOm2ZVM0R"; // herkese açık site anahtarı (Cloudflare Turnstile); gizli anahtar yalnız sunucuda
  var UC = /(^|\.)pudingai\.com$/.test(location.hostname) ? "https://demo.pudingai.com/api/site/mesaj" : "/api/site/mesaj";
  var KAPI = "Selam! Ne Pudingisin?";
  var ALT = "* Yazdıkların yanıt için Anthropic'e gider, Puding'de saklanmaz. Kişisel bilgiler görüşmeye saklanmalıdır. 18+";
  var KAYIT = "https://demo.pudingai.com/?kayit";
  var KASIK_SVG = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><ellipse cx="12" cy="6.5" rx="4.2" ry="5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 11.5v10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';

  var oturum = null, mesgul = false, bitti = false, kasikGosterildi = false, tsJeton = null, tsBekleyen = [];

  function el(etiket, sinif, metin) {
    var e = document.createElement(etiket);
    if (sinif) e.className = sinif;
    if (metin != null) e.textContent = metin;
    return e;
  }

  var kok = el("div", "pd-sohbet");
  kok.innerHTML =
    '<div class="pd-kutu" hidden><div class="pd-kutu-logo" aria-hidden="true"></div>' +
    '<button type="button" class="pd-kapat" aria-label="Kapat">×</button>' +
    '<div class="pd-akis" role="log" aria-live="polite"></div><div class="pd-ts"></div></div>' +
    '<div class="pd-kapilar"><button type="button" class="pd-kapi"></button></div>' +
    '<form class="pd-bar" autocomplete="off"><label class="pd-gizli" for="pd-girdi">Puding\'e yaz</label>' +
    '<textarea id="pd-girdi" rows="1" maxlength="1000" placeholder="Puding\'e yaz…"></textarea>' +
    '<button type="submit" class="pd-gonder" aria-label="Gönder">↑</button></form>' +
    '<p class="pd-alt"></p>';
  var kutu = kok.querySelector(".pd-kutu"), akis = kok.querySelector(".pd-akis"), form = kok.querySelector(".pd-bar"),
      girdi = kok.querySelector("textarea"), kapi = kok.querySelector(".pd-kapi"), kapilar = kok.querySelector(".pd-kapilar");
  kapi.textContent = KAPI;
  kok.querySelector(".pd-alt").textContent = ALT;

  function ac() { kutu.hidden = false; kok.classList.add("pd-acik"); }
  kok.querySelector(".pd-kapat").addEventListener("click", function () { kutu.hidden = true; kok.classList.remove("pd-acik"); });

  function balon(kim, metin) {
    var b = el("div", "pd-balon pd-" + kim);
    String(metin || "").split(/\n{2,}/).forEach(function (p) { if (p.trim()) b.appendChild(el("p", null, p.trim())); });
    akis.appendChild(b);
    akis.scrollTop = akis.scrollHeight;
    return b;
  }
  function kartlar(liste) {
    (liste || []).forEach(function (k) {
      var id = "pd-kart-" + k.tur;
      if (document.getElementById(id)) return;
      var c = el("div", "pd-kart"); c.id = id;
      c.appendChild(el("strong", null, k.baslik || ""));
      (k.satirlar || []).forEach(function (s) { c.appendChild(el("p", null, s)); });
      akis.appendChild(c);
    });
  }
  function kasik(neden) {
    if (kasikGosterildi) return;
    kasikGosterildi = true;
    var a = el("a", "pd-kasik"); a.href = KAYIT; a.rel = "noopener";
    a.innerHTML = KASIK_SVG + "<span></span>";
    a.querySelector("span").textContent = neden || "devam etmek istiyorsan kaşığa bas";
    akis.appendChild(a);
    akis.scrollTop = akis.scrollHeight;
  }
  function kilitle() { bitti = true; girdi.disabled = true; form.classList.add("pd-kilitli"); }

  // Turnstile: görüşmenin ilk mesajında bir kez (site anahtarı yoksa atlanır)
  function turnstile(sonra) {
    if (!TURNSTILE_SITE_KEY || oturum) return sonra();
    if (tsJeton) return sonra();
    tsBekleyen.push(sonra);
    if (tsBekleyen.length > 1) return;
    var kur = function () {
      window.turnstile.render(kok.querySelector(".pd-ts"), {
        sitekey: TURNSTILE_SITE_KEY, appearance: "interaction-only",
        callback: function (j) { tsJeton = j; var b = tsBekleyen.splice(0); b.forEach(function (f) { f(); }); },
        "error-callback": function () { tsBekleyen.splice(0); mesgul = false; balon("puding", "Doğrulama tamamlanamadı. Sayfayı yenileyip yeniden dene."); }
      });
    };
    if (window.turnstile) return kur();
    var s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true; s.onload = kur;
    document.head.appendChild(s);
  }

  function gonder(metin) {
    metin = (metin || "").trim();
    if (!metin || mesgul || bitti) return;
    mesgul = true; ac(); kapilar.hidden = true;
    var benim = balon("ben", metin);
    var bekle = el("div", "pd-balon pd-puding pd-bekle"); bekle.appendChild(el("p", null, "…")); akis.appendChild(bekle);
    turnstile(function () {
      fetch(UC, {method: "POST", headers: {"Content-Type": "application/json"},
                 body: JSON.stringify({oturum: oturum, metin: metin, turnstile: oturum ? null : tsJeton})})
        .then(function (r) { return r.json().then(function (j) { return {kod: r.status, j: j}; }); })
        .then(function (c) {
          bekle.remove();
          var j = c.j || {};
          if (j.oturum) oturum = j.oturum;
          if (j.gonderilen) benim.querySelector("p").textContent = j.gonderilen; // kişisel bilgi maskeli hâliyle
          if (c.kod === 200) {
            if (j.yanit) balon("puding", j.yanit);
            kartlar(j.kartlar);
            if (j.kasik) kasik();
            if (j.tavan || j.kapali) kilitle();
          } else if (j.hata === "butce" || j.hata === "sinir") {
            balon("puding", j.hata === "butce" ? "Puding bugünlük burada dinleniyor." : "Biraz yavaşlayalım; birazdan yeniden yazabilirsin.");
            if (j.hata === "butce") { kasik(); kilitle(); }
          } else if (j.hata === "dogrulama") {
            tsJeton = null; balon("puding", "Doğrulama tamamlanamadı. Sayfayı yenileyip yeniden dene.");
          } else {
            kartlar(j.kartlar);
            balon("puding", j.hata || "Şu an yanıt üretilemedi. Biraz sonra tekrar dene.");
          }
        })
        .catch(function () { bekle.remove(); balon("puding", "Şu an bağlantı yok. Biraz sonra tekrar dene."); })
        .then(function () { mesgul = false; if (!bitti) girdi.focus(); });
    });
  }

  kapi.addEventListener("click", function () { gonder(KAPI); });
  form.addEventListener("submit", function (e) { e.preventDefault(); var m = girdi.value; girdi.value = ""; girdi.style.height = ""; gonder(m); });
  girdi.addEventListener("keydown", function (e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); } });
  girdi.addEventListener("input", function () { girdi.style.height = ""; girdi.style.height = Math.min(girdi.scrollHeight, 140) + "px"; });
  girdi.addEventListener("focus", function () { if (akis.children.length) ac(); });

  document.body.classList.add("pd-sohbet-var");
  (document.getElementById("pd-sohbet-yeri") || document.body).appendChild(kok);
})();
