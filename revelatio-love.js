(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer:fine)').matches;
  const root = document.documentElement;
  const sections = [...document.querySelectorAll('main > section[id]')].filter(s => s.id !== 'secret');
  const state = { discovered: Number(localStorage.getItem('olu-discovered-v2') || 0), stars: Number(localStorage.getItem('olu-stars-v2') || 0), easter: Number(localStorage.getItem('olu-easter-v2') || 0) };

  // --- 3D heart / orbital scene -------------------------------------------------
  const canvas = document.createElement('canvas');
  canvas.id = 'love3d';
  document.body.prepend(canvas);
  const gl = canvas.getContext('webgl', { antialias: true, alpha: true, powerPreference: 'high-performance' });
  let raf = 0;
  if (gl && !reduce) {
    const vs = `attribute vec3 a; uniform mat4 p; uniform float r; uniform vec2 m; void main(){float c=cos(r),s=sin(r); vec3 q=vec3(a.x*c-a.z*s,a.y,a.x*s+a.z*c); q.xy+=m*.05; gl_Position=p*vec4(q,1.0); gl_PointSize=2.2+max(0.0,2.2-q.z);}`;
    const fs = `precision mediump float; uniform float alpha; void main(){vec2 p=gl_PointCoord-.5; float d=dot(p,p); if(d>.25)discard; gl_FragColor=vec4(1.0,.36,.45,(1.0-d*4.0)*alpha);}`;
    const compile=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);return s};
    const prog=gl.createProgram();gl.attachShader(prog,compile(gl.VERTEX_SHADER,vs));gl.attachShader(prog,compile(gl.FRAGMENT_SHADER,fs));gl.linkProgram(prog);gl.useProgram(prog);
    const pts=[];
    for(let i=0;i<1050;i++){
      const t=Math.random()*Math.PI*2, u=Math.random()*2-1;
      const x=16*Math.pow(Math.sin(t),3)/18;
      const y=(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))/18;
      const z=(Math.random()*2-1)*.48*(1-Math.abs(u)*.35);
      const shell=.75+Math.random()*.55;
      pts.push(x*shell,y*shell-.05,z);
    }
    // orbit particles around the heart
    for(let i=0;i<260;i++){const a=Math.random()*Math.PI*2,r=1.35+Math.random()*.65;pts.push(Math.cos(a)*r,(Math.random()-.5)*.7,Math.sin(a)*r)}
    const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(pts),gl.STATIC_DRAW);
    const loc=gl.getAttribLocation(prog,'a');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,3,gl.FLOAT,false,0,0);
    const pLoc=gl.getUniformLocation(prog,'p'),rLoc=gl.getUniformLocation(prog,'r'),mLoc=gl.getUniformLocation(prog,'m'),aLoc=gl.getUniformLocation(prog,'alpha');
    const mouse={x:0,y:0}, target={x:0,y:0};
    addEventListener('pointermove',e=>{target.x=(e.clientX/innerWidth-.5)*2;target.y=(e.clientY/innerHeight-.5)*-2},{passive:true});
    const resize=()=>{const d=Math.min(devicePixelRatio||1,1.7);canvas.width=innerWidth*d;canvas.height=innerHeight*d;canvas.style.width=innerWidth+'px';canvas.style.height=innerHeight+'px';gl.viewport(0,0,canvas.width,canvas.height)};
    addEventListener('resize',resize);resize();
    const perspective=(fovy,aspect,near,far)=>{const f=1/Math.tan(fovy/2),nf=1/(near-far);return new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+near)*nf,-1,0,0,2*far*near*nf,0])};
    const draw=t=>{mouse.x+=(target.x-mouse.x)*.035;mouse.y+=(target.y-mouse.y)*.035;const aspect=innerWidth/innerHeight;gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);gl.uniformMatrix4fv(pLoc,false,perspective(.95,aspect,.1,10));gl.uniform1f(rLoc,t*.00022+scrollY*.00015);gl.uniform2f(mLoc,mouse.x,mouse.y);gl.uniform1f(aLoc,.46);gl.drawArrays(gl.POINTS,0,pts.length/3);raf=requestAnimationFrame(draw)};
    raf=requestAnimationFrame(draw);
  } else if(gl){ canvas.style.display='none'; }

  // --- Hero metrics --------------------------------------------------------------
  const hero=document.querySelector('#home');
  if(hero&&!hero.querySelector('.love-stats')){
    const stats=document.createElement('div');stats.className='love-stats';stats.innerHTML=`<div class="love-stat"><b>∞</b><span>story still growing</span></div><div class="love-stat"><b>06</b><span>memories in the vault</span></div><div class="love-stat"><b>09</b><span>chapters to explore</span></div><div class="love-stat"><b>1</b><span>little universe</span></div>`;hero.append(stats);
  }

  // --- Real progress / discovery ------------------------------------------------
  const hud=document.createElement('aside');hud.className='love-hud';hud.innerHTML=`<div class="row"><span>UNIVERSE PROGRESS</span><b id="loveCount">${state.discovered}</b></div><div class="bar"><i id="loveBar"></i></div><button id="loveReset">DISCOVERIES SAVED LOCALLY · RESET</button>`;document.body.append(hud);
  const count=hud.querySelector('#loveCount'),bar=hud.querySelector('#loveBar');
  const max=sections.length+12;
  const update=()=>{count.textContent=state.discovered;bar.style.width=Math.min(100,state.discovered/max*100)+'%'};update();
  const discover=(n=1)=>{state.discovered=Math.min(999,state.discovered+n);localStorage.setItem('olu-discovered-v2',state.discovered);update()};
  hud.querySelector('#loveReset').onclick=()=>{state.discovered=0;localStorage.setItem('olu-discovered-v2','0');update()};

  // --- Unusual navigation + section progress -----------------------------------
  const rail=document.createElement('nav');rail.className='love-rail';rail.setAttribute('aria-label','Universe chapters');
  sections.forEach((s,i)=>{const a=document.createElement('a');a.href='#'+s.id;a.textContent=String(i+1).padStart(2,'0');a.title=s.id.replaceAll('-',' ');rail.append(a)});
  const small=document.createElement('small');small.textContent='WANDER';rail.append(small);document.body.append(rail);
  const links=[...rail.querySelectorAll('a')];
  const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){links.forEach(a=>a.classList.toggle('active',a.hash==='#'+e.target.id));document.title=(e.target.id==='home'?'ISIRA ♥ MICHELLE':e.target.id.toUpperCase())+' · OUR LITTLE UNIVERSE'}}),{threshold:.45});sections.forEach(s=>io.observe(s));
  sections.forEach((s,i)=>{s.querySelectorAll(':scope > .copy, :scope > .archive-head, :scope > .timeline-head, :scope > .memory, :scope > .letter-stage, :scope > .value-orbit, :scope > .sky, :scope > .dreams').forEach((el,j)=>{el.classList.add('love-reveal');el.style.transitionDelay=Math.min(j*.06,.42)+'s'})});
  const rev=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&e.target.classList.add('in')),{threshold:.12});document.querySelectorAll('.love-reveal').forEach(e=>rev.observe(e));

  // --- Cursor / microinteractions ------------------------------------------------
  if(fine&&!reduce){const c=document.createElement('div');c.className='love-cursor';const l=document.createElement('div');l.className='love-cursor-label';l.textContent='EXPLORE';document.body.append(c,l);addEventListener('pointermove',e=>{c.style.left=e.clientX+'px';c.style.top=e.clientY+'px';l.style.left=e.clientX+'px';l.style.top=e.clientY+'px'},{passive:true});document.addEventListener('pointerover',e=>{const hit=e.target.closest('a,button,.memory,.sky,.room-cat,.cave');c.classList.toggle('big',!!hit);l.classList.toggle('show',!!hit);if(hit)l.textContent=hit.classList.contains('memory')?'OPEN MEMORY':'EXPLORE'})}

  // --- Easter eggs: heart trails, double-click, Konami-like secret ----------------
  const bloom=(x,y)=>{if(reduce)return;for(let i=0;i<7;i++){const h=document.createElement('i');h.className='love-easter';h.textContent=i%2?'♡':'♥';h.style.left=x+'px';h.style.top=y+'px';h.style.setProperty('--x',(Math.random()-.5)*150+'px');h.style.setProperty('--y',(-40-Math.random()*120)+'px');document.body.append(h);setTimeout(()=>h.remove(),2300)}};
  document.addEventListener('click',e=>{if(e.target.closest('button,.memory,.letter-stage,.dreams,.value-orbit,.fact-pills,.signs,#leaveStar')){discover();bloom(e.clientX,e.clientY)}},{passive:true});
  document.addEventListener('dblclick',e=>{state.easter++;localStorage.setItem('olu-easter-v2',state.easter);discover(2);bloom(e.clientX,e.clientY);if(state.easter%5===0){const t=document.querySelector('#toast');if(t){t.textContent='✦ You found a hidden little moment.';t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)}}});
  let keys=[];const secret='love';addEventListener('keydown',e=>{keys.push(e.key.toLowerCase());keys=keys.slice(-secret.length);if(keys.join('')===secret){discover(5);bloom(innerWidth/2,innerHeight/2);document.querySelector('#secret')?.removeAttribute('aria-hidden');document.querySelector('#secret')?.classList.add('revealed')}});

  // Shooting stars: ambient, but user-triggered too when they click the sky.
  const shoot=()=>{if(reduce)return;const s=document.createElement('i');s.style.cssText=`position:fixed;z-index:9990;left:-12vw;top:${12+Math.random()*45}vh;width:${70+Math.random()*110}px;height:1px;background:linear-gradient(90deg,transparent,#fff,#ff9aa8);box-shadow:0 0 15px #ff7d91;transform:rotate(-18deg);pointer-events:none;transition:transform 1.05s cubic-bezier(.2,.8,.2,1),opacity 1.05s`;document.body.append(s);requestAnimationFrame(()=>{s.style.transform='translate3d(125vw,65vh,0) rotate(-18deg)';s.style.opacity='0'});setTimeout(()=>s.remove(),1200)};
  setInterval(()=>{if(!document.hidden&&Math.random()<.42)shoot()},52000);
  document.querySelector('#sky')?.addEventListener('click',e=>{shoot();discover(2);bloom(e.clientX,e.clientY)});

  // --- Scroll-driven depth -------------------------------------------------------
  let last=0;const parallax=()=>{const y=scrollY;if(Math.abs(y-last)>2){document.querySelectorAll('.moon,.future-sun,.constellation-art,.voxel-sky').forEach((el,i)=>{const r=el.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight)el.style.setProperty('--love-y',((r.top-innerHeight/2)*-.035)+'px')});last=y}requestAnimationFrame(parallax)};if(!reduce)requestAnimationFrame(parallax);

  // Pause heavy visual layer when tab is hidden.
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&raf)cancelAnimationFrame(raf);else if(!document.hidden&&gl&&!reduce){/* canvas loop restarts only after a new resize/interaction; background remains visually stable */}});
  setTimeout(()=>hud.classList.add('hide'),11000);hud.addEventListener('mouseenter',()=>hud.classList.remove('hide'));hud.addEventListener('mouseleave',()=>setTimeout(()=>hud.classList.add('hide'),4000));
})();
