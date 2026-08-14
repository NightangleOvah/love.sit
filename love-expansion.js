(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;
  const state = { reduced: reduce.matches, discoveries: Number(localStorage.getItem('olu-love-discoveries') || 0), hearts: Number(localStorage.getItem('olu-love-hearts') || 0) };
  const layer = document.createElement('div'); layer.className = 'love-expansion-root'; layer.setAttribute('aria-hidden','true'); document.body.append(layer);
  const toast = document.createElement('div'); toast.className='wish-toast'; document.body.append(toast);
  const showToast = (text) => { toast.textContent=text; toast.classList.add('show'); clearTimeout(toast._t); toast._t=setTimeout(()=>toast.classList.remove('show'),2400); };
  const discover = () => { state.discoveries=Math.min(99,state.discoveries+1); localStorage.setItem('olu-love-discoveries',String(state.discoveries)); updatePanel(); };
  const addHeart = () => { state.hearts=Math.min(12,state.hearts+1); localStorage.setItem('olu-love-hearts',String(state.hearts)); updatePanel(); };

  const panel=document.createElement('aside'); panel.className='love-panel'; panel.setAttribute('aria-label','Love universe controls');
  panel.innerHTML='<button class="love-close" aria-label="Close love panel">×</button><h3>♡ ISIRA + MICHELLE</h3><p id="loveSignal">A little more love is hiding around the universe.</p><div class="heart-meter" aria-label="discovered hearts"></div><div class="love-actions"><button data-love="garden">Rose garden</button><button data-love="wish">Wish jar</button><button data-love="butterfly">Butterfly</button><button data-love="star">Memory star</button><button data-love="shoot">Shooting star</button></div>';
  document.body.append(panel);
  const signal=panel.querySelector('#loveSignal');
  function updatePanel(){panel.querySelector('.heart-meter').innerHTML=Array.from({length:12},(_,i)=>`<i class="${i<state.hearts?'on':''}">♥</i>`).join('');}
  updatePanel(); setTimeout(()=>panel.classList.add('show'),6500); setTimeout(()=>panel.classList.remove('show'),12500);
  panel.addEventListener('click',(e)=>{ if(e.target.closest('.love-close')) panel.classList.remove('show'); const action=e.target.closest('[data-love]')?.dataset.love; if(action==='garden') document.querySelector('#love-garden')?.scrollIntoView({behavior:'smooth'}); if(action==='wish') document.querySelector('#wish-jar')?.click(); if(action==='butterfly') spawnButterfly(); if(action==='star') spawnMemoryStar(); if(action==='shoot') spawnShootingWish(); });

  // Add a new, additive rose garden to the future chapter.
  const future=document.querySelector('#future');
  if(future && !document.querySelector('#love-garden')){
    const garden=document.createElement('div'); garden.id='love-garden'; garden.className='rose-garden'; garden.innerHTML='<div class="garden-caption"><strong>THE GARDEN OF LITTLE THINGS</strong> · every bloom keeps a memory</div>';
    const petals=['our first laughs','late-night talks','game nights','tiny surprises','future adventures','always choosing kindness','more memories'];
    for(let i=0;i<9;i++){const r=document.createElement('button'); r.className='rose'; r.style.left=`${8+i*10+Math.random()*3}%`; r.style.height=`${95+Math.random()*45}px`; r.setAttribute('aria-label',`Rose ${i+1}`); r.title=petals[i%petals.length]; r.addEventListener('click',()=>{addHeart();discover();showToast(`✿ ${r.title}`);}); garden.append(r);}
    future.append(garden);
  }

  // Wish jar: local-only, no server or account required.
  const letters=document.querySelector('#letters');
  if(letters && !document.querySelector('#wish-jar')){
    const jar=document.createElement('button'); jar.id='wish-jar'; jar.className='wish-jar'; jar.setAttribute('aria-label','Open the wish jar');
    const wish=document.createElement('p'); wish.id='wish-text'; wish.className='wish-text'; wish.textContent='Tap the jar for a little future wish.';
    jar.addEventListener('click',()=>{const wishes=['another place to explore together.','a thousand more ridiculous laughs.','a photo from a day we haven’t lived yet.','a peaceful night under the same sky.','a future full of small, happy surprises.','another year of choosing kindness.']; wish.textContent='✦ '+wishes[Math.floor(Math.random()*wishes.length)]; addHeart(); discover();});
    letters.append(jar,wish);
  }

  // Relationship calendar: uses generic placeholders so future dates can be edited without changing core code.
  const timeline=document.querySelector('#timeline');
  if(timeline && !document.querySelector('#love-calendar')){
    const wrap=document.createElement('div'); wrap.id='love-calendar'; wrap.className='love-calendar';
    [['01','First chapter'],['02','First month'],['03','Next adventure'],['04','A future memory'],['05','Another birthday'],['06','Another anniversary'],['07','A place we visit'],['∞','Still us']].forEach(([day,label],i)=>{const b=document.createElement('button'); b.className='calendar-star '+(i<2?'done':'future'); b.innerHTML=`<b>${day}</b>${label}`; b.addEventListener('click',()=>{addHeart();showToast(`♡ ${label}`);}); wrap.append(b);});
    timeline.append(wrap);
  }

  function spawnButterfly(){ if(state.reduced||document.hidden)return; const b=document.createElement('i'); b.className='butterfly'; b.style.left='0'; b.style.top='0'; layer.append(b); setTimeout(()=>b.remove(),14000); discover(); }
  function spawnShootingWish(){ if(state.reduced||document.hidden)return; const s=document.createElement('button'); s.className='shooting-wish'; s.setAttribute('aria-label','Make a wish'); s.style.left=`${Math.random()*30}vw`; s.style.top=`${55+Math.random()*25}vh`; s.addEventListener('click',()=>{showToast('☄️ Wish saved in the little universe.');addHeart();discover();s.remove();}); layer.append(s); setTimeout(()=>s.remove(),1600); }
  function spawnMemoryStar(){ const star=document.createElement('button'); star.className='memory-star'; star.setAttribute('aria-label','New memory star'); star.style.left=`${12+Math.random()*76}vw`; star.style.top=`${15+Math.random()*68}vh`; star.addEventListener('click',()=>{const card=document.createElement('div');card.className='star-card';card.style.left=`${Math.min(innerWidth-300,Math.max(10,parseFloat(star.style.left)/100*innerWidth))}px`;card.style.top=`${Math.min(innerHeight-120,Math.max(10,parseFloat(star.style.top)/100*innerHeight+18))}px`;card.innerHTML='<b>✦ A new memory star</b><small>This space is waiting for a future moment to be attached to it.</small>';document.body.append(card);setTimeout(()=>card.remove(),3200);addHeart();discover();}); layer.append(star); setTimeout(()=>star.remove(),30000); }

  // Rare butterflies and shooting stars occur naturally, never constantly.
  setInterval(()=>{ if(Math.random()<.18) spawnButterfly(); if(Math.random()<.08) spawnShootingWish(); },7000);

  // Same-document View Transitions for anchor navigation, with a normal fallback.
  if(document.startViewTransition){ document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',(e)=>{const target=document.querySelector(a.getAttribute('href'));if(!target)return;e.preventDefault();const go=()=>{history.pushState({},'',a.getAttribute('href'));target.scrollIntoView({behavior:reduce.matches?'auto':'smooth'});}; document.startViewTransition(go); })); }

  // Gentle, user-initiated Web Audio chime; no autoplay.
  let audioCtx=null;
  function chime(){ if(!audioCtx){audioCtx=new (window.AudioContext||window.webkitAudioContext)();} if(audioCtx.state==='suspended')audioCtx.resume(); const o=audioCtx.createOscillator(),g=audioCtx.createGain(); o.type='sine';o.frequency.value=523.25;g.gain.setValueAtTime(.0001,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.045,audioCtx.currentTime+.02);g.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+.45);o.connect(g).connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+.46); }
  document.addEventListener('click',(e)=>{if(e.target.closest('.rose,.wish-jar,.shooting-wish,.memory-star')){try{chime();}catch{}}},{passive:true});

  reduce.addEventListener?.('change',()=>{state.reduced=reduce.matches;});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)layer.replaceChildren();});
})();
