const SZ = [
  { k: 'vp', term: 'boşluk', def: 'Boşluk da vardır. Kütlesi olan, ölçüm limitleri yüzünden yok sayılamaz olan.' },
  { k: 'ip', term: 'sıfatlama', def: 'Deneyim üzerinde söz söyleme yetkisinin icrası. Her sıfatlama bir iktidar kullanımıdır.' },
  { k: 'pd', term: 'özüt', def: 'Bir görüşmenin damıtılmış en rafine hâli: birbiriyle gerilim içindeki iki sözcük.' },
  { k: 'vp', term: 'tortul birikim', def: 'Geçmiş etkileşimlerin her yeni etkileşimde yeniden işlenmesi. Katmanlı bir arşiv değil, her turda yeniden yoğrulan bir hamur.' },
  { k: 'ip', term: 'onam', def: 'Atamanın içselleştirilmesi: öznenin atamayı kendi sesiyle yeniden üretmesi. Geri çekilebilir.' },
  { k: 'vp', term: 'müphem çekirdek', def: 'Girdabın merkezi. Hareketin en az olduğu yer, potansiyelin en yüksek olduğu yerdir.' },
  { k: 'pd', term: 'ontoid', def: 'Varlıksı. Ne varlık ne yokluk; etkisi olduğu için yok sayılamaz.' },
  { k: 'vp', term: 'olan vardır', def: 'Kimsenin ilan etmediği, kimseye ait olmayan, her deneyimin içinde gerçekleştiği zemin koşulu.' },
  { k: 'ip', term: 'koruma ataması', def: 'Korunanı tanımlamayı zorunlu kılan atama. Korunan, tanım gereği, yetersiz olarak konumlandırılır.' },
  { k: 'vp', term: 'belirsizlik', def: 'Eksiklik değil, enformasyon zenginliği. Bilgi, enformasyonun bir alt kümesidir.' },
  { k: 'vp', term: 'düzensiz süreklilik', def: 'Ne tam deterministik ne tam stokastik süreklilik. Sistem kesintisizdir, ancak gidişi önceden belirlenemez.' },
  { k: 'vp', term: 'form oluş', def: 'Plastisitenin üç kapasitesinden biri. Nadir bir eşik geçişi değildir; her etkileşim turunda gerçekleşir.' }
];
const SZ_TAG = { vp: 'VORTİKAL PLASTİSİTE', ip: 'İKTİDAR PLASTİSİTESİ', pd: 'PUDİNG' };
const SZ_BG = { vp: 'rgba(133,124,143,0.22)', ip: 'rgba(179,22,95,0.12)', pd: 'transparent' };
const SZ_RING = { vp: 'none', ip: 'none', pd: 'inset 0 0 0 1.5px #1D1A20' };
// okuma süresi: 4 sn + sözcük başına 0,35 sn (≈170 sözcük/dk), 9–16 sn arası
function szDuration(def) {
  const words = def.split(/\s+/).length;
  return Math.min(16000, Math.max(9000, 4000 + words * 350));
}

(function(){
  var box = document.getElementById('sz-box'), btn = document.getElementById('sz-pause');
  if (!box || !btn) return;
  var tag = document.getElementById('sz-tag'), term = document.getElementById('sz-term'), def = document.getElementById('sz-def');
  var i = 0, paused = false, hover = false, t1, t2;
  function show(n){
    var w = SZ[n];
    tag.textContent = SZ_TAG[w.k]; term.textContent = w.term; def.textContent = w.def;
    term.style.background = SZ_BG[w.k]; term.style.boxShadow = SZ_RING[w.k];
  }
  function schedule(){
    clearTimeout(t1); clearTimeout(t2);
    t1 = setTimeout(function(){
      if (paused || hover || document.hidden) { schedule(); return; }
      box.style.opacity = 0;
      t2 = setTimeout(function(){ i = (i + 1) % SZ.length; show(i); box.style.opacity = 1; schedule(); }, 450);
    }, szDuration(SZ[i].def));
  }
  btn.addEventListener('click', function(){
    paused = !paused; btn.textContent = paused ? 'Sürdür' : 'Durdur'; btn.setAttribute('aria-pressed', paused ? 'true' : 'false');
  });
  box.addEventListener('mouseenter', function(){ hover = true; });
  box.addEventListener('mouseleave', function(){ hover = false; });
  schedule();
})();
