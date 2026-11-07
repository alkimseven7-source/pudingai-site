/* Puding site modu: ana sayfadaki anonim sohbet barı (Alkım, 2026-11-05).
   Saydam açık gri bar; kutu yukarı açılır, arkasında logo; tek kapı "Selam! Ne Pudingisin?".
   Sözlük sayfasındaki düğme /?sor=neli ile gelir: bar alanına "Neli pudingsin?" yazılı gelir, gönderme kişide.
   Hiçbir şey saklanmaz: görüşme yalnız bu sayfanın belleğinde (yenilenince gider); çerez ve localStorage yok.
   Kaşık 9. turda kendiliğinden belirir; 12. turda kutu çıkar, sonra yalnız kriz yanıt alır → kayıt ekranı.
   Üç dil (Alkım, 2026-11-07): metinler sayfanın diline göre (html lang); dil sunucuya görüşmenin ilk mesajında gider. */
(function () {
  "use strict";
  var TURNSTILE_SITE_KEY = "0x4AAAAAAF0u99NTOm2ZVM0R"; // herkese açık site anahtarı (Cloudflare Turnstile); gizli anahtar yalnız sunucuda
  var UC = "/api/site/mesaj";
  var METIN = {
    tr: {kapi: "Selam! Ne Pudingisin?", yaz: "Puding'e yaz", yerTutucu: "Puding'e yaz…", gonder: "Gönder", kapat: "Kapat",
         kutuIlk: "Burada tanışma kadar konuşabiliyoruz.", kutuDolu: "Bugünlük burada doluyuz.",
         kutuSonu: "Devam etmek istiyorsan kaşığa bas; kendi görüşmen başlasın. Puding şimdilik ücretsiz.",
         alt: ["* Yazdıkların yanıt için Anthropic'e gider, Puding'de saklanmaz. Ad, adres gibi kimlik bilgilerini yazmana gerek yok. 18+"],
         kasik: "devam etmek istiyorsan kaşığa bas", kasikKisa: "kaşığa bas", kasikNot: "",
         dogrulama: "Doğrulama tamamlanamadı. Sayfayı yenileyip yeniden dene.", yavas: "Biraz yavaşlayalım; birazdan yeniden yazabilirsin.",
         yanitYok: "Şu an yanıt üretilemedi. Biraz sonra tekrar dene.", baglanti: "Şu an bağlantı yok. Biraz sonra tekrar dene."},
    en: {kapi: "Hi! What kind of pudding are you?", yaz: "Write to Puding", yerTutucu: "Write something to Puding…", gonder: "Send", kapat: "Close",
         kutuIlk: "Here we can talk just enough to get acquainted.", kutuDolu: "We're full here for today.",
         kutuSonu: "If you want to continue, tap the spoon to start your own conversation. Puding is free for now.",
         alt: ["Puding is an AI and can make mistakes.",
               "* What you write is sent to Anthropic to generate a reply; it isn't stored by Puding. No need to share identifying details like your name or address. 18+"],
         kasik: "if you want to keep going, tap the spoon", kasikKisa: "tap the spoon",
         kasikNot: "The app is in Turkish for now; English and Spanish are on the way.",
         dogrulama: "Verification didn't complete. Reload the page and try again.", yavas: "Let's slow down a little; you can write again in a moment.",
         yanitYok: "No reply could be generated right now. Try again in a moment.", baglanti: "No connection right now. Try again in a moment."},
    es: {kapi: "¡Hola! ¿Qué clase de pudin eres?", yaz: "Escríbele a Puding", yerTutucu: "Escríbele algo a Puding…", gonder: "Enviar", kapat: "Cerrar",
         kutuIlk: "Aquí podemos hablar lo justo para conocernos.", kutuDolu: "Por hoy estamos completos aquí.",
         kutuSonu: "Si quieres continuar, toca la cuchara y empieza tu propia conversación. Puding es gratis por ahora.",
         alt: ["Puding es una inteligencia artificial y puede cometer errores.",
               "* Lo que escribes se envía a Anthropic para generar una respuesta; Puding no lo guarda. No hace falta que compartas datos que te identifiquen, como tu nombre o dirección. 18+"],
         kasik: "si quieres continuar, toca la cuchara", kasikKisa: "toca la cuchara",
         kasikNot: "Por ahora la aplicación está en turco; pronto estará en inglés y español.",
         dogrulama: "No se pudo completar la verificación. Recarga la página e inténtalo de nuevo.", yavas: "Vayamos un poco más despacio; podrás escribir de nuevo en un momento.",
         yanitYok: "Ahora mismo no se ha podido generar una respuesta. Inténtalo de nuevo en un momento.", baglanti: "Ahora mismo no hay conexión. Inténtalo de nuevo en un momento."}
  };
  var DIL = (document.documentElement.lang || "tr").slice(0, 2);
  if (!METIN[DIL]) DIL = "tr";
  var T = METIN[DIL];
  var KAPI = T.kapi;
  var SOZLUK_SORUSU = "Neli pudingsin?";
  var KUTU_ILK = T.kutuIlk, KUTU_DOLU = T.kutuDolu, KUTU_SONU = T.kutuSonu;
  var KAYIT = "/odam?kayit";
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
    '<button type="button" class="pd-kapat">×</button>' +
    '<div class="pd-akis" role="log" aria-live="polite"></div><div class="pd-ts"></div></div>' +
    '<div class="pd-kapilar"><button type="button" class="pd-kapi"></button></div>' +
    '<form class="pd-bar" autocomplete="off"><label class="pd-gizli" for="pd-girdi"></label>' +
    '<textarea id="pd-girdi" rows="1" maxlength="1000"></textarea>' +
    '<button type="submit" class="pd-gonder">↑</button></form>' +
    T.alt.map(function () { return '<p class="pd-alt"></p>'; }).join("");
  var kutu = kok.querySelector(".pd-kutu"), akis = kok.querySelector(".pd-akis"), form = kok.querySelector(".pd-bar"),
      girdi = kok.querySelector("textarea"), kapi = kok.querySelector(".pd-kapi"), kapilar = kok.querySelector(".pd-kapilar");
  kapi.textContent = KAPI;
  girdi.placeholder = T.yerTutucu;
  kok.querySelector("label.pd-gizli").textContent = T.yaz;
  kok.querySelector(".pd-kapat").setAttribute("aria-label", T.kapat);
  kok.querySelector(".pd-gonder").setAttribute("aria-label", T.gonder);
  Array.prototype.forEach.call(kok.querySelectorAll(".pd-alt"), function (p, i) { p.textContent = T.alt[i]; });

  function ac() { kutu.hidden = false; kok.classList.add("pd-acik"); }
  kok.querySelector(".pd-kapat").addEventListener("click", function () { kutu.hidden = true; kok.classList.remove("pd-acik"); });

  function ozutlu(p, ozut) {  // özüt kalın italik görünür; metin textContent kalır
    var e = el("p"), i = ozut ? p.toLocaleLowerCase("tr").indexOf(ozut.toLocaleLowerCase("tr")) : -1;
    if (i < 0) { e.textContent = p; return e; }
    e.appendChild(document.createTextNode(p.slice(0, i)));
    e.appendChild(el("strong", "pd-ozut", p.slice(i, i + ozut.length)));
    e.appendChild(document.createTextNode(p.slice(i + ozut.length)));
    return e;
  }
  function balon(kim, metin, ozut) {
    var b = el("div", "pd-balon pd-" + kim);
    String(metin || "").split(/\n{2,}/).forEach(function (p) { if (p.trim()) b.appendChild(ozutlu(p.trim(), ozut)); });
    akis.appendChild(b);
    akis.scrollTop = akis.scrollHeight;
    return b;
  }
  function kartlar(liste) {
    (liste || []).forEach(function (k) {
      var id = "pd-kart-" + k.tur;
      if (document.getElementById(id)) return;
      var c = el("div", "pd-kart"); c.id = id;
      if (k.baslik) c.appendChild(el("strong", null, k.baslik));
      (k.satirlar || []).forEach(function (s) { c.appendChild(el("p", null, s)); });
      akis.appendChild(c);
    });
  }
  function kasikBagi(yazi) {
    var a = el("a", "pd-kasik"); a.href = KAYIT; a.rel = "noopener";
    a.innerHTML = KASIK_SVG + "<span></span>";
    a.querySelector("span").textContent = yazi;
    return a;
  }
  function kasik() {
    if (kasikGosterildi) return;
    kasikGosterildi = true;
    akis.appendChild(kasikBagi(T.kasik));
    if (T.kasikNot) akis.appendChild(el("p", "pd-kasik-not", T.kasikNot));
    akis.scrollTop = akis.scrollHeight;
  }
  // 12. turda ve günlük tavanda: kaşık düğmeli kutu; görüşmede tek kutu, önceki kaşık yerine geçer
  function kutuAc(ilk, ozut) {
    var eski = akis.querySelector(".pd-davet");
    if (eski) { eski.querySelector("p.pd-davet-metin").textContent = ilk + " " + KUTU_SONU; return; }
    kasikGosterildi = true;
    Array.prototype.forEach.call(akis.querySelectorAll(".pd-kasik, .pd-kasik-not"), function (k) { k.remove(); });
    var d = el("div", "pd-davet");
    if (ozut) { var o = el("p", null, "Bugünkü özütün: "); o.appendChild(el("strong", "pd-ozut", ozut)); d.appendChild(o); }
    d.appendChild(el("p", "pd-davet-metin", ilk + " " + KUTU_SONU));
    d.appendChild(kasikBagi(T.kasikKisa));
    if (T.kasikNot) d.appendChild(el("p", "pd-kasik-not", T.kasikNot));
    akis.appendChild(d);
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
        "error-callback": function () { tsBekleyen.splice(0); mesgul = false; balon("puding", T.dogrulama); }
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
                 body: JSON.stringify({oturum: oturum, metin: metin, turnstile: oturum ? null : tsJeton, dil: DIL})})
        .then(function (r) { return r.json().then(function (j) { return {kod: r.status, j: j}; }); })
        .then(function (c) {
          bekle.remove();
          var j = c.j || {};
          if (j.oturum) oturum = j.oturum;
          if (j.gonderilen) benim.querySelector("p").textContent = j.gonderilen; // kişisel bilgi maskeli hâliyle
          if (c.kod === 200) {
            if (j.yanit) balon("puding", j.yanit, j.ozut);
            kartlar(j.kartlar);
            if (j.kutu) kutuAc(KUTU_ILK, j.kutu_ozut);
            else if (j.kasik) kasik();
            if (j.kapali) kilitle();  // 12. turda yazı alanı açık kalır: mesaj kriz sınıflandırıcısından geçer
          } else if (j.hata === "butce" || j.hata === "sinir") {
            if (j.hata === "butce") kutuAc(KUTU_DOLU, j.kutu_ozut);  // yazı alanı açık kalır: yeni mesaj kriz sınıflandırıcısından geçer
            else balon("puding", T.yavas);
          } else if (j.hata === "dogrulama") {
            tsJeton = null; balon("puding", T.dogrulama);
          } else {
            kartlar(j.kartlar);
            balon("puding", (DIL === "tr" && j.hata) || T.yanitYok);
          }
        })
        .catch(function () { bekle.remove(); balon("puding", T.baglanti); })
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

  // Sözlükten gelen: soru bar alanında hazır durur, kişi gönderir; adres çubuğundan kalkar
  if (new URLSearchParams(location.search).get("sor") === "neli") {
    girdi.value = SOZLUK_SORUSU; kapilar.hidden = true;
    history.replaceState(null, "", location.pathname + location.hash);
    girdi.dispatchEvent(new Event("input"));
    girdi.focus({preventScroll: true});
  }
})();
