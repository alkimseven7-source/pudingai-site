/* Dil seçimi (Alkım, 2026-11-07): TR / EN / ES düğmesine basınca seçim bu tarayıcıda hatırlanır; yönlendirme ana sayfanın başında. */
document.querySelectorAll(".pd-dil a[data-dil]").forEach(function (a) {
  a.addEventListener("click", function () { try { localStorage.setItem("pd_dil", a.getAttribute("data-dil")); } catch (e) {} });
});
