(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(pointer: coarse)').matches;
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const sections = $$('main > section[id]');

  // Make the current document read like one art-directed story instead of a stack of widgets.
  document.body.classList.add('studio-v3');
  sections.forEach(s => s.classList.add('studio-section'));

  // Add a compact hero index/status line.
  const hero = $('#home');
  if (hero && !$('.v3-index')) {
    const index = document.createElement('div');
    index.className = 'v3-index';
    index.innerHTML = '<b>01</b><i></i><span>ISIRA + MICHELLE</span>';
    hero.append(index);
  }

  // Give the timeline a deliberate editorial structure if its generated content is empty.
  const timeline = $('#timelineTrack');
  if (timeline && !timeline.children.length) {
    timeline.innerHTML = [
      ['01','BEGINNING','The first pages of the story.'],
      ['02','THE EVERYDAY','The small moments that became ours.'],
      ['03','THE ADVENTURE','Games, jokes, chaos and long conversations.'],
      ['04','NEXT CHAPTER','Everything we have not made yet.']
    ].map((x,i) => `<article class="timeline-card"><div class="n">${x[0]}</div><div><div class="date">CHAPTER ${String(i+1).padStart(2,'0')}</div><p><strong>${x[1]}</strong><br>${x[2]}</p></div></article>`).join('');
  }

  // Add a missing Deep Space chapter without disturbing the previous universe modules.
  if (!$('#deep-space')) {
    const future = $('#future');
    const deep = document.createElement('section');
    deep.id = 'deep-space';
    deep.className = 'deep-space chapter studio-section';
    deep.innerHTML = `<div class="copy"><p class="eyebrow">10 / DEEP SPACE</p><h2>A place for<br><em>the impossible.</em></h2><p>The archive ends here only so the universe can begin again. Discover shooting stars, hidden notes and memories that have not happened yet.</p><div class="dreams"><button data-deep="meteor">☄ Trigger a meteor</button><button data-deep="star">✦ Add a star</button><button data-deep="note">⌁ Reveal a note</button><button data-deep="pulse">♡ Pulse the universe</button></div><p class="deep-output" aria-live="polite"></p></div><div class="v3-photo-index">DEEP SPACE / 10</div>`;
    future?.insertAdjacentElement('afterend', deep);
  }

  // Footer becomes the intentional closing scene.
  const footer = $('footer');
  if (footer && !footer.classList.contains('v3-footer')) {
    footer.className = 'v3-footer';
    footer.innerHTML = `<div class="v3-footer-grid"><div><h2>Still<br><em>growing.</em></h2></div><div><p>OUR LITTLE UNIVERSE</p><p>Isira ♥ Michelle</p><div class="v3-status"><i></i> LIVE / LOCAL / GROWING</div></div><div><p>Every memory can become another chapter.</p><p><a href="#home">Return to the beginning ↗</a></p></div></div>`;
  }

  // Marquee between major storytelling blocks, used sparingly.
  if (hero && !$('.v3-marquee')) {
    const marquee = document.createElement('div');
    marquee.className = 'v3-marquee';
    marquee.innerHTML = '<span>ONE STORY · MANY CHAPTERS · ISIRA + MICHELLE · KEEP WANDERING · ONE STORY · MANY CHAPTERS · ISIRA + MICHELLE · KEEP WANDERING ·</span>';
    hero.insertAdjacentElement('afterend', marquee);
  }

  // Unusual chapter navigation.
  if (!$('.v3-rail')) {
    const rail = document.createElement('nav');
    rail.className = 'v3-rail';
    rail.setAttribute('aria-label','Universe chapters');
    sections.concat($('#deep-space') || []).filter(Boolean).forEach((s,i)=>{
      const a=document.createElement('a'); a.href='#'+s.id; a.textContent=String(i+1).padStart(2,'0'); a.title=s.id.replaceAll('-',' '); rail.append(a);
    });
    const label=document.createElement('small'); label.textContent='WANDER'; rail.append(label); document.body.append(rail);
    const links=$$('.v3-rail a');
    const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){links.forEach(a=>a.classList.toggle('active',a.hash===`#${e.target.id}`));}}),{threshold:.5});
    [...sections, $('#deep-space')].filter(Boolean).forEach(s=>io.observe(s));
  }

  // Persistent exploration progress, separate from the older discovery widgets.
  const hud = document.createElement('aside');
  hud.className='v3-hud';
  hud.innerHTML='<div class="row"><span>EXPLORED</span><b id="v3Count">0%</b></div><div class="bar"><i></i></div><button type="button">progress saved locally</button>';
  document.body.append(hud);
  const count=$('#v3Count',hud), bar=$('.bar i',hud);
  const visited=new Set(JSON.parse(localStorage.getItem('olu-v3-sections')||'[]'));
  const updateProgress=()=>{const pct=Math.round(Math.min(100,(visited.size/([].concat(sections,$('#deep-space')).filter(Boolean).length))*100));count.textContent=pct+'%';bar.style.width=pct+'%';};
  updateProgress();
  const sectionObserver=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){visited.add(e.target.id);localStorage.setItem('olu-v3-sections',JSON.stringify([...visited]));updateProgress();}}),{threshold:.3});
  [...sections,$('#deep-space')].filter(Boolean).forEach(s=>sectionObserver.observe(s));
  setTimeout(()=>hud.classList.add('hide'),9000); hud.addEventListener('mouseenter',()=>hud.classList.remove('hide')); hud.addEventListener('mouseleave',()=>setTimeout(()=>hud.classList.add('hide'),3500));

  // 3D-ish ambient orb: a single efficient canvas object, not a full-screen GPU storm.
  if (!reduce) {
    const c=document.createElement('canvas'); c.id='studio-orbit'; c.setAttribute('aria-hidden','true'); c.style.cssText='position:fixed;inset:0;z-index:-3;width:100%;height:100%;pointer-events:none;'; document.body.prepend(c);
    const gl=c.getContext('webgl',{alpha:true,antialias:true,powerPreference:'high-performance'});
    if(gl){
      const vs='attribute vec3 p;uniform mat4 m;void main(){gl_Position=m*vec4(p,1.0);gl_PointSize=2.2;}';
      const fs='precision mediump float;void main(){vec2 q=gl_PointCoord-.5;if(dot(q,q)>.25)discard;gl_FragColor=vec4(1.,.35,.45,.32);}';
      const compile=(t,src)=>{const s=gl.createShader(t);gl.shaderSource(s,src);gl.compileShader(s);return s};
      const pr=gl.createProgram();gl.attachShader(pr,compile(gl.VERTEX_SHADER,vs));gl.attachShader(pr,compile(gl.FRAGMENT_SHADER,fs));gl.linkProgram(pr);gl.useProgram(pr);
      const pts=[]; for(let i=0;i<190;i++){const a=Math.random()*Math.PI*2,r=.8+Math.random()*1.8;pts.push(Math.cos(a)*r,(Math.random()-.5)*.65,Math.sin(a)*r)}
      const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(pts),gl.STATIC_DRAW);const loc=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,3,gl.FLOAT,false,0,0);const m=gl.getUniformLocation(pr,'m');
      const resize=()=>{const d=Math.min(devicePixelRatio||1,1.4);c.width=innerWidth*d;c.height=innerHeight*d;gl.viewport(0,0,c.width,c.height)};addEventListener('resize',resize,{passive:true});resize();
      let frame=0; const draw=t=>{if(document.hidden)return;const a=t*.00016,co=Math.cos(a),si=Math.sin(a);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.uniformMatrix4fv(m,false,new Float32Array([co,0,si,0,0,1,0,0,-si,0,co,0,0,0,-.2,1]));gl.drawArrays(gl.POINTS,0,pts.length/3);frame=requestAnimationFrame(draw)};frame=requestAnimationFrame(draw);document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelAnimationFrame(frame);else frame=requestAnimationFrame(draw);});
    }
  }

  // Tactile cursor and love microinteractions.
  if (!coarse && !reduce) {
    const cursor=document.createElement('div'); cursor.className='v3-cursor'; const label=document.createElement('div'); label.className='v3-cursor-label'; label.textContent='EXPLORE'; document.body.append(cursor,label);
    addEventListener('pointermove',e=>{cursor.style.left=e.clientX+'px';cursor.style.top=e.clientY+'px';label.style.left=e.clientX+'px';label.style.top=e.clientY+'px'},{passive:true});
    document.addEventListener('pointerover',e=>{const hit=e.target.closest('a,button,.memory,.sky');cursor.classList.toggle('big',!!hit);label.classList.toggle('show',!!hit);if(hit)label.textContent=hit.classList.contains('memory')?'OPEN MEMORY':'EXPLORE';});
  }

  const floatLove=(x,y)=>{if(reduce)return;for(let i=0;i<5;i++){const s=document.createElement('span');s.className='v3-float';s.textContent=i%2?'♡':'✦';s.style.left=x+'px';s.style.top=y+'px';s.style.setProperty('--x',`${(Math.random()-.5)*90}px`);s.style.setProperty('--y',`${-30-Math.random()*85}px`);document.body.append(s);setTimeout(()=>s.remove(),1900)}};
  document.addEventListener('click',e=>{if(e.target.closest('.memory,.letter-stage,.fact-pills button,.signs button,.dreams button,.value-orbit button,#leaveStar'))floatLove(e.clientX,e.clientY)},{passive:true});

  // Deep Space actions.
  const deep=$('#deep-space');
  deep?.addEventListener('click',e=>{
    const action=e.target.closest('[data-deep]')?.dataset.deep; if(!action)return; const out=$('.deep-output',deep);
    if(action==='pulse'){document.body.animate([{filter:'brightness(1)'},{filter:'brightness(1.35)'},{filter:'brightness(1)'}],{duration:700,easing:'ease-out'});out.textContent='The whole universe pulsed once. ♡';}
    if(action==='note'){out.textContent=['Some memories are still on their way.','The best chapter might be the one you have not lived yet.','Keep the little things.'][Math.floor(Math.random()*3)];}
    if(action==='star'){const sky=$('#sky');if(sky){const star=document.createElement('span');star.className='new-star';star.style.left=(8+Math.random()*84)+'%';star.style.top=(10+Math.random()*78)+'%';sky.append(star);out.textContent='A new point of light joined your constellation.';}}
    if(action==='meteor'){const m=document.createElement('span');m.style.cssText='position:fixed;z-index:9996;left:-12vw;top:'+(12+Math.random()*40)+'vh;width:150px;height:1px;background:linear-gradient(90deg,transparent,#fff,#ff5c72);box-shadow:0 0 16px #ff5c72;transform:rotate(-18deg);transition:transform 1s cubic-bezier(.16,1,.3,1),opacity 1s;pointer-events:none';document.body.append(m);requestAnimationFrame(()=>{m.style.transform='translate3d(125vw,62vh,0) rotate(-18deg)';m.style.opacity='0'});setTimeout(()=>m.remove(),1100);out.textContent='Make a wish. ✦';}
  });
})();