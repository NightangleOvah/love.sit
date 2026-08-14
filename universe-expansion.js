(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(pointer: coarse)').matches;
  const root = document.documentElement;
  const state = { reduced: reduce.matches, stars: 0, discovered: new Set() };
  const style = document.createElement('style');
  style.textContent = `
    .universe-console{position:relative;min-height:100svh;padding:12vw 6vw;background:radial-gradient(circle at 50% 20%,#34295b 0,#100d1d 38%,#08070e 80%);overflow:hidden}
    .console-inner{max-width:1100px;margin:auto;position:relative;z-index:3}.console-grid{display:grid;grid-template-columns:1.15fr .85fr;gap:18px;margin-top:45px}.h2-like{max-width:none!important;font-size:clamp(46px,7vw,96px);line-height:.9;letter-spacing:-.065em;font-weight:500;margin:28px 0}.h2-like em{font-family:'Playfair Display',serif;color:var(--orange)}
    .console-card{border:1px solid #ffffff18;background:#ffffff08;backdrop-filter:blur(18px);border-radius:22px;padding:22px;box-shadow:0 25px 90px #0006}.console-card h3{margin:0 0 10px;font-size:22px}.console-card p{color:#aaa3b2;line-height:1.7}
    .planet-field{height:440px;position:relative;border-radius:18px;overflow:hidden;background:radial-gradient(circle at 50% 50%,#6e5fa122,transparent 30%),#090914}.planet{position:absolute;width:64px;height:64px;border-radius:50%;border:1px solid #ffffff33;cursor:pointer;box-shadow:0 0 30px #a88cff55;transition:transform .35s}.planet:hover{transform:scale(1.18)}.planet:after{content:"";position:absolute;inset:-11px;border:1px solid #ffffff18;border-radius:50%;transform:rotate(-20deg) scaleX(1.5)}
    .p1{left:16%;top:25%;background:radial-gradient(circle at 35% 30%,#ffd9a0,#b56f8e 55%,#2c214b)}.p2{left:58%;top:17%;background:radial-gradient(circle at 30% 30%,#b8e7ff,#6556a5 55%,#17122b)}.p3{left:70%;top:62%;background:radial-gradient(circle at 35% 30%,#d6a7ff,#6b3e82 55%,#1c1027)}.p4{left:28%;top:67%;background:radial-gradient(circle at 35% 30%,#fff0bd,#d06d77 55%,#2a172d)}
    .orbit-ring{position:absolute;left:50%;top:50%;width:70%;height:48%;border:1px solid #ffffff12;border-radius:50%;transform:translate(-50%,-50%) rotate(-14deg);animation:consoleOrbit 22s linear infinite}.orbit-ring:nth-child(2){width:46%;height:70%;animation-duration:31s;animation-direction:reverse}
    .console-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:18px}.console-actions button{border:1px solid #ffffff1c;background:#ffffff08;border-radius:999px;padding:9px 12px;cursor:pointer;font:10px 'DM Mono';text-transform:uppercase;letter-spacing:.08em}.console-actions button:hover{background:#ffffff12;border-color:#ffffff44}.discovery{min-height:50px;color:var(--gold,#f8d38a);font:11px 'DM Mono';margin-top:16px}
    .shooting-star{position:fixed;z-index:20;width:2px;height:90px;background:linear-gradient(transparent,#fff,#ffb27f,transparent);transform:rotate(48deg);pointer-events:none;filter:drop-shadow(0 0 8px #fff);animation:shoot 1.3s linear forwards}
    .ambient-pulse{position:fixed;z-index:-2;width:30vw;height:30vw;border-radius:50%;background:#a88cff12;filter:blur(55px);pointer-events:none;transition:transform 1s ease}.parallax-card{transform-style:preserve-3d;will-change:transform}.parallax-card>*{transform:translateZ(12px)}
    @keyframes consoleOrbit{to{transform:translate(-50%,-50%) rotate(346deg)}}@keyframes shoot{from{opacity:0;transform:translate(0,0) rotate(48deg)}15%{opacity:1}to{opacity:0;transform:translate(-360px,360px) rotate(48deg)}}
    @media(max-width:800px){.console-grid{grid-template-columns:1fr}.planet-field{height:360px}.console-card{padding:18px}}@media(prefers-reduced-motion:reduce){.orbit-ring{animation:none}.shooting-star{display:none}}
  `;
  document.head.append(style);
  const section = document.createElement('section');
  section.className = 'universe-console chapter'; section.id = 'deep-space';
  section.innerHTML = `
    <div class="ambient-pulse" id="ambientPulse"></div><div class="console-inner">
      <p class="eyebrow">08 / DEEP SPACE</p><h2 class="h2-like">A universe that<br><em>remembers.</em></h2>
      <p style="color:var(--muted);max-width:650px;line-height:1.8">Explore the systems hidden underneath the scrapbook. Every discovery becomes part of this browser-local universe.</p>
      <div class="console-grid"><div class="console-card"><h3>Memory planets</h3><p>Four tiny worlds represent different kinds of memories. Tap one to reveal a new message.</p>
        <div class="planet-field" id="planetField"><span class="orbit-ring"></span><span class="orbit-ring"></span><button class="planet p1" aria-label="Adventure planet" data-planet="Adventure is a memory you can keep moving through."></button><button class="planet p2" aria-label="Quiet moments planet" data-planet="Quiet moments deserve stars too."></button><button class="planet p3" aria-label="Funny memories planet" data-planet="The funniest memories are often the smallest ones."></button><button class="planet p4" aria-label="Future planet" data-planet="The future is another world waiting to be visited."></button></div>
        <div class="discovery" id="discovery">Choose a planet.</div></div>
        <div class="console-card parallax-card"><h3>Universe controls</h3><p>Change the atmosphere, trigger a rare event, or reveal how many discoveries you have made.</p>
          <div class="console-actions"><button id="shootNow">Meteor ✦</button><button id="pulseNow">Pulse ✧</button><button id="nightNow">Night ◐</button><button id="resetDiscoveries">Reset discoveries</button></div>
          <div class="discovery" id="achievement">0 / 4 memory worlds discovered</div><div class="console-actions"><button id="keyboardHint">Keyboard guide</button></div></div></div></div>`;
  document.querySelector('main')?.append(section);
  const discovery = section.querySelector('#discovery'), achievement = section.querySelector('#achievement');
  const key = 'olu-discoveries-v1';
  try { JSON.parse(localStorage.getItem(key) || '[]').forEach(x => state.discovered.add(x)); } catch {}
  const save = () => { try { localStorage.setItem(key, JSON.stringify([...state.discovered])); } catch {} achievement.textContent = `${state.discovered.size} / 4 memory worlds discovered`; };
  section.querySelectorAll('.planet').forEach((planet, i) => planet.addEventListener('click', () => { state.discovered.add(String(i)); discovery.textContent = planet.dataset.planet; save(); })); save();
  function meteor(){ if(state.reduced)return; const el=document.createElement('i'); el.className='shooting-star'; el.style.left=`${20+Math.random()*70}%`; el.style.top=`${5+Math.random()*45}%`; document.body.append(el); setTimeout(()=>el.remove(),1400); }
  section.querySelector('#shootNow').addEventListener('click',()=>{meteor();discovery.textContent='A meteor just crossed the sky ✦';});
  section.querySelector('#pulseNow').addEventListener('click',()=>{root.animate([{filter:'brightness(1)'},{filter:'brightness(1.35)'},{filter:'brightness(1)'}],{duration:900,easing:'ease-out'});discovery.textContent='The universe pulsed for a moment ✧';});
  section.querySelector('#nightNow').addEventListener('click',()=>{root.dataset.time='night';discovery.textContent='Night mode engaged. The stars are louder now.';});
  section.querySelector('#resetDiscoveries').addEventListener('click',()=>{state.discovered.clear();save();discovery.textContent='The memory worlds are waiting again.';});
  section.querySelector('#keyboardHint').addEventListener('click',()=>{discovery.textContent='Shortcuts: M = meteor · N = night · Esc = close memories';});
  const pulse=section.querySelector('#ambientPulse');
  if(!coarse&&!state.reduced&&pulse)addEventListener('pointermove',e=>{pulse.style.transform=`translate(${(e.clientX/innerWidth-.5)*80}px, ${(e.clientY/innerHeight-.5)*80}px)`},{passive:true});
  let nextMeteor=Date.now()+7000; function ambient(time){if(!state.reduced&&!document.hidden&&time>nextMeteor){meteor();nextMeteor=time+9000+Math.random()*16000;}requestAnimationFrame(ambient);} requestAnimationFrame(ambient);
  addEventListener('keydown',e=>{if(e.target.matches('input,textarea'))return;if(e.key.toLowerCase()==='m')meteor();if(e.key.toLowerCase()==='n')root.dataset.time='night';});
  reduce.addEventListener?.('change',()=>{state.reduced=reduce.matches;});
})();