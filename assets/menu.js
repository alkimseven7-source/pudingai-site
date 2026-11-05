/* Açık kayıt açıkken BAŞVUR menüden kalkar (Alkım, 2026-11-05). Ayar sunucuda (PUDING_ACIK_KAYIT); sunucuya ulaşılamazsa
   menü olduğu gibi kalır. Kimlik yok, çerez yok: yanıt yalnız evet/hayır. */
fetch("https://demo.pudingai.com/api/kayit_durum", { credentials: "omit" })
  .then(function (r) { return r.ok ? r.json() : null; })
  .then(function (d) {
    if (d && d.acik_kayit) document.querySelectorAll(".pd-basvur").forEach(function (a) { a.remove(); });
  })
  .catch(function () {});
