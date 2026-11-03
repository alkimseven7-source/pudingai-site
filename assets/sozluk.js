// Sözlük bandı: onaylı sözlükten beslenir (assets/sozluk-veri.js, sözlük üreticisi yazar; Alkım, 2026-11-03).
// Rastgele terim, gündelik tanımın ilk cümlesi, terime bağlantı.
const SZ_TAG = { cekirdek: 'VP · İP', odunc: 'ÖDÜNÇ KAVRAM' };
const SZ_BG = { cekirdek: 'rgba(133,124,143,0.22)', odunc: 'transparent' };
const SZ_RING = { cekirdek: 'none', odunc: 'inset 0 0 0 1.5px #1D1A20' };
// okuma süresi: 4 sn + sözcük başına 0,35 sn (≈170 sözcük/dk), 9–16 sn arası
function szDuration(def) {
  const words = def.split(/\s+/).length;
  return Math.min(16000, Math.max(9000, 4000 + words * 350));
}

(function(){
  var SZ = window.SOZLUK_BANT || [];
  var box = document.getElementById('sz-box'), btn = document.getElementById('sz-pause');
  if (!box || !btn || !SZ.length) return;
  var tag = document.getElementById('sz-tag'), term = document.getElementById('sz-term'), def = document.getElementById('sz-def');
  var sira = [], i = -1, paused = false, hover = false, t1, t2;
  // karışık sıra; bir tur bitince yeniden karılır, aynı terim art arda gelmez
  function karistir(){
    var son = sira.length ? sira[sira.length - 1] : -1;
    sira = SZ.map(function(_, n){ return n; });
    for (var k = sira.length - 1; k > 0; k--) { var j = Math.floor(Math.random() * (k + 1)); var x = sira[k]; sira[k] = sira[j]; sira[j] = x; }
    if (sira.length > 1 && sira[0] === son) { sira.push(sira.shift()); }
    i = 0;
  }
  function simdiki(){ return SZ[sira[i]]; }
  function show(){
    var w = simdiki();
    tag.textContent = SZ_TAG[w.k] || ''; term.textContent = w.t; term.href = '/sozluk/#' + encodeURIComponent(w.s); def.textContent = w.d;
    term.style.background = SZ_BG[w.k] || 'transparent'; term.style.boxShadow = SZ_RING[w.k] || 'none';
  }
  function schedule(){
    clearTimeout(t1); clearTimeout(t2);
    t1 = setTimeout(function(){
      if (paused || hover || document.hidden) { schedule(); return; }
      box.style.opacity = 0;
      t2 = setTimeout(function(){ i++; if (i >= sira.length) karistir(); show(); box.style.opacity = 1; schedule(); }, 450);
    }, szDuration(simdiki().d));
  }
  btn.addEventListener('click', function(){
    paused = !paused; btn.textContent = paused ? 'Sürdür' : 'Durdur'; btn.setAttribute('aria-pressed', paused ? 'true' : 'false');
  });
  box.addEventListener('mouseenter', function(){ hover = true; });
  box.addEventListener('mouseleave', function(){ hover = false; });
  karistir(); show();
  schedule();
})();
