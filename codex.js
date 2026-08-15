import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import {EffectComposer} from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/postprocessing/UnrealBloomPass.js';

const root=document.documentElement;
const stage=document.getElementById('stage');
const statusNode=document.getElementById('status');
const realityButton=document.getElementById('realityToggle');
const audioButton=document.getElementById('audioToggle');
const cursor=document.getElementById('cursor');
const kissCanvas=document.getElementById('kissCanvas');
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
const coarse=window.matchMedia('(pointer: coarse)');
let viewportWidth=1,viewportHeight=1,dpr=Math.min(window.devicePixelRatio||1,2),targetDpr=dpr;
let frameHandle=0,lastFrame=performance.now(),badFrames=0,slowFrames=0,frameCount=0,fps=60;
let renderer=null,scene=null,camera=null,composer=null,bloom=null,fluid=null,foilGroup=null,asteroid=null,artifactGroup=null;
let clock=new THREE.Clock();
let pointer=new THREE.Vector2(),pointerTarget=new THREE.Vector2(),velocity=new THREE.Vector2(),lastPointer=new THREE.Vector2();
let scrollVelocity=0,lastScroll=window.scrollY,scrollTarget=0;
let virtualReality=true,audioContext=null,analyser=null,audioData=null,audioStarted=false;
let resources=[];

function setViewportUnit(){const h=window.visualViewport?window.visualViewport.height:window.innerHeight;root.style.setProperty('--vh',`${h}px`);}
setViewportUnit();
if(window.visualViewport)window.visualViewport.addEventListener('resize',setViewportUnit,{passive:true});
const viewportObserver=new ResizeObserver(entries=>{for(const entry of entries){const box=entry.contentRect;viewportWidth=Math.max(1,box.width);viewportHeight=Math.max(1,box.height);setViewportUnit();resizeRenderer();}});
viewportObserver.observe(stage);

const fluidVertex=`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position,1.0);}`;
const fluidFragment=`precision highp float;varying vec2 vUv;uniform float uTime;uniform vec2 uPointer;uniform vec2 uVelocity;uniform float uAudio;uniform float uReality;float hash21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);float a=hash21(i),b=hash21(i+vec2(1,0)),c=hash21(i+vec2(0,1)),d=hash21(i+vec2(1,1));return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);}float fbm(vec2 p){float v=0.0,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.03;a*=.5;}return v;}void main(){vec2 p=vUv*2.0-1.0;p.x*=1.65;vec2 q=p-uPointer*.22;float t=uTime*.045;float n=fbm(q*2.2+vec2(t,-t));float field=sin(length(q)*8.0-n*4.0-t*1.7+uAudio*3.0+dot(uVelocity,q)*2.0);float metab=smoothstep(.78,.98,field*.5+.5);float edge=smoothstep(1.3,.1,length(p));float lum=metab*.045*edge;float violet=uReality*.012;gl_FragColor=vec4(lum+violet*.15,lum,lum+violet,1.0);}`;

function createRenderer(){
 if(reduced.matches)return false;
 try{
  renderer=new THREE.WebGLRenderer({antialias:false,alpha:false,powerPreference:'high-performance',stencil:false,depth:true});
  renderer.setClearColor(0x000000,1);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
  stage.replaceChildren(renderer.domElement);resources.push(renderer);
  return true;
 }catch(error){stage.classList.add('no3d');return false;}
}
function createScene(){
 scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(42,1,.1,100);camera.position.set(0,0,12);
 const ambient=new THREE.AmbientLight(0xffffff,.55);scene.add(ambient);resources.push(ambient);
 const key=new THREE.DirectionalLight(0xffffff,2.4);key.position.set(4,6,8);scene.add(key);resources.push(key);
 const rim=new THREE.PointLight(0x5533ff,20,30);rim.position.set(-5,2,4);scene.add(rim);resources.push(rim);
 const fluidGeometry=new THREE.PlaneGeometry(2,2);const fluidMaterial=new THREE.ShaderMaterial({vertexShader:fluidVertex,fragmentShader:fluidFragment,uniforms:{uTime:{value:0},uPointer:{value:new THREE.Vector2()},uVelocity:{value:new THREE.Vector2()},uAudio:{value:0},uReality:{value:1}},depthWrite:false,depthTest:false});fluid=new THREE.Mesh(fluidGeometry,fluidMaterial);fluid.frustumCulled=false;scene.add(fluid);resources.push(fluid);
 createFoil();createAsteroid();createArtifacts();
 composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));bloom=new UnrealBloomPass(new THREE.Vector2(viewportWidth,viewportHeight),.4,.65,.85);composer.addPass(bloom);resources.push(composer,bloom);
}
function foilMaterial(){return new THREE.MeshPhysicalMaterial({color:0xf5f5f5,metalness:.9,roughness:.08,clearcoat:1,clearcoatRoughness:.04,iridescence:1,iridescenceIOR:1.45,iridescenceThicknessRange:[120,600]});}
function createFoil(){
 foilGroup=new THREE.Group();foilGroup.position.set(0,.8,0);scene.add(foilGroup);
 const shapes=[{text:'M',x:-2.8},{text:'I',x:-1},{text:'S',x:.5},{text:'H',x:2.7}];
 const fontLoader=new THREE.FontLoader();
 fontLoader.load('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/fonts/helvetiker_bold.typeface.json',font=>{for(const item of shapes){const geometry=new THREE.TextGeometry(item.text,{font,size:2.1,height:.48,curveSegments:8,bevelEnabled:true,bevelThickness:.15,bevelSize:.08,bevelSegments:12});geometry.computeBoundingSphere();const mesh=new THREE.Mesh(geometry,foilMaterial());mesh.position.x=item.x;mesh.rotation.z=(Math.random()-.5)*.08;foilGroup.add(mesh);resources.push(geometry,mesh.material);}});
}
function createAsteroid(){
 const geometry=new THREE.IcosahedronGeometry(2.2,6);const material=new THREE.ShaderMaterial({uniforms:{uTime:{value:0},uAudio:{value:0}},vertexShader:`varying vec3 vNormal;varying vec3 vWorld;uniform float uTime;uniform float uAudio;float n(vec3 p){return sin(p.x*3.7+uTime*.3)+sin(p.y*4.1-uTime*.23)+sin(p.z*3.2+uTime*.17);}void main(){vec3 p=position;float d=n(normalize(position)*3.0)*.06+uAudio*.025;p+=normal*d;vNormal=normal;vec4 w=modelMatrix*vec4(p,1.0);vWorld=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`,fragmentShader:`precision highp float;varying vec3 vNormal;varying vec3 vWorld;uniform float uTime;uniform float uAudio;void main(){vec3 L=normalize(vec3(2.0,4.0,5.0));float diff=max(dot(normalize(vNormal),L),0.0);float fuzz=.5+.5*sin(vWorld.x*15.0+vWorld.y*13.0+uTime*2.0);vec3 moss=mix(vec3(.015,.05,.012),vec3(.12,.35,.05),fuzz);float sss=pow(1.0-max(dot(normalize(vNormal),L),0.0),2.0);gl_FragColor=vec4(moss*(.35+diff)+sss*.08,1.0);}`});asteroid=new THREE.Mesh(geometry,material);asteroid.position.set(4,-1,-1);asteroid.scale.setScalar(.9);scene.add(asteroid);resources.push(geometry,material);}
function createArtifacts(){artifactGroup=new THREE.Group();scene.add(artifactGroup);const heart=new THREE.Mesh(new THREE.TorusKnotGeometry(.8,.22,80,16,2,3),foilMaterial());heart.position.set(-4,-2,1);heart.scale.set(.8,.8,.8);artifactGroup.add(heart);const ring=new THREE.Mesh(new THREE.TorusGeometry(1.5,.08,20,96),foilMaterial());ring.position.set(3,2,-1);ring.rotation.x=1.2;artifactGroup.add(ring);const asterisk=new THREE.Mesh(new THREE.OctahedronGeometry(.9,2),foilMaterial());asterisk.position.set(-3,2,-2);artifactGroup.add(asterisk);for(const m of [heart,ring,asterisk])resources.push(m.geometry,m.material);}

function resizeRenderer(){if(!renderer||!camera)return;renderer.setSize(viewportWidth,viewportHeight,false);camera.aspect=viewportWidth/viewportHeight;camera.updateProjectionMatrix();if(composer)composer.setSize(viewportWidth,viewportHeight);renderer.setPixelRatio(targetDpr);}
function updateQuality(delta){frameCount++;if(delta>.0166)badFrames++;else badFrames=Math.max(0,badFrames-2);if(delta>.0333)slowFrames++;else slowFrames=Math.max(0,slowFrames-1);if(badFrames>=30){targetDpr=Math.max(1,targetDpr-.25);badFrames=0;resizeRenderer();}if(slowFrames>=10&&bloom){bloom.enabled=false;}if(delta<.024&&targetDpr<dpr&&badFrames===0){targetDpr=Math.min(dpr,targetDpr+.05);resizeRenderer();}if(frameCount%12===0){fps=Math.round(1/Math.max(delta,.001));statusNode.textContent=`[ ${virtualReality?'VIRTUAL_ROBLOX':'INFINITE_COSMOS'} :: TIER_${targetDpr<1.5?'MOBILE':'CINEMATIC'} :: ${fps}FPS ]`;}}
function sampleAudio(){if(!analyser||!audioData)return 0;analyser.getByteFrequencyData(audioData);let sum=0;for(let i=0;i<audioData.length;i++)sum+=audioData[i];return sum/audioData.length/255;}
function render(time){const now=time||performance.now();let delta=Math.min(.1,(now-lastFrame)/1000);lastFrame=now;if(delta>.0333&&frameCount%2===1){frameHandle=requestAnimationFrame(render);return;}updateQuality(delta);const t=clock.getElapsedTime();pointer.lerp(pointerTarget,.08);velocity.multiplyScalar(.92);scrollVelocity+=(scrollTarget-scrollVelocity)*.08;if(fluid){fluid.material.uniforms.uTime.value=t;fluid.material.uniforms.uPointer.value.copy(pointer);fluid.material.uniforms.uVelocity.value.set(velocity.x,scrollVelocity);fluid.material.uniforms.uAudio.value=sampleAudio();fluid.material.uniforms.uReality.value=virtualReality?1:0;}if(foilGroup){foilGroup.rotation.y+=.002+velocity.x*.002;foilGroup.rotation.x+=(pointer.y*.12-foilGroup.rotation.x)*.03;}if(asteroid){asteroid.rotation.x+=.0015;asteroid.rotation.y+=.002;asteroid.material.uniforms.uTime.value=t;asteroid.material.uniforms.uAudio.value=sampleAudio();}if(artifactGroup){artifactGroup.rotation.y+=.001;artifactGroup.children.forEach((m,i)=>{m.position.y+=Math.sin(t*.7+i)*.0007;});}if(composer&&bloom&&bloom.enabled)composer.render(delta);else renderer.render(scene,camera);frameHandle=requestAnimationFrame(render);}

function initAudio(){if(audioStarted)return;audioStarted=true;try{audioContext=new AudioContext();analyser=audioContext.createAnalyser();analyser.fftSize=128;audioData=new Uint8Array(analyser.frequencyBinCount);const master=audioContext.createGain();master.gain.value=.035;master.connect(analyser);analyser.connect(audioContext.destination);const notes=[130.81,164.81,196,261.63,329.63];notes.forEach((frequency,index)=>{const oscillator=audioContext.createOscillator();const gain=audioContext.createGain();const filter=audioContext.createBiquadFilter();oscillator.type=index%2?'triangle':'sine';oscillator.frequency.value=frequency;filter.type='lowpass';filter.frequency.value=900;gain.gain.value=.14/(index+1);oscillator.connect(filter);filter.connect(gain);gain.connect(master);oscillator.start();});audioButton.textContent='[ AMBIENT_AUDIO :: ON ]';}catch(error){audioButton.textContent='[ AUDIO :: UNAVAILABLE ]';}}
function makeKissParticles(){const ctx=kissCanvas.getContext('2d');const w=kissCanvas.width=innerWidth*devicePixelRatio;const h=kissCanvas.height=innerHeight*devicePixelRatio;ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);const particles=Array.from({length:500},()=>({x:innerWidth*.5+(Math.random()-.5)*80,y:innerHeight*.68+(Math.random()-.5)*30,vx:(Math.random()-.5)*12,vy:-Math.random()*15-3,r:Math.random()*2+1,life:1}));let previous=performance.now();function step(now){const dt=Math.min(.033,(now-previous)/1000);previous=now;ctx.clearRect(0,0,innerWidth,innerHeight);let alive=0;for(const p of particles){p.vy+=22*dt;p.x+=p.vx*60*dt;p.y+=p.vy*60*dt;p.vx*=.995;p.life-=dt*.38;if(p.y>innerHeight-20){p.y=innerHeight-20;p.vy*=-.62;}if(p.life>0){alive++;ctx.globalAlpha=p.life;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle='rgba(255,210,235,.9)';ctx.fill();}}ctx.globalAlpha=1;if(alive)requestAnimationFrame(step);else ctx.clearRect(0,0,innerWidth,innerHeight);}requestAnimationFrame(step);}

const letter='Mish,\n\nIf this little universe ever feels impossibly large, remember that it was built from small moments: a message, a laugh, a game, a plan, a memory worth keeping.\n\nI wanted a place where those moments could stay alive and where every future memory still has somewhere to land.\n\nAlways becoming,\nIsira';
function openLetter(){const modal=document.getElementById('letterModal'),text=document.getElementById('letterText');modal.hidden=false;const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ΔΩΣЖλπ01';let index=0;const timer=setInterval(()=>{text.textContent=letter.split('').map((char,i)=>i<index?char:(char==='\n'?'\n':alphabet[Math.floor(Math.random()*alphabet.length)])).join('');index++;if(index>letter.length){clearInterval(timer);text.textContent=letter;}},22);modal.dataset.timer='active';}
function closeLetter(){document.getElementById('letterModal').hidden=true;}
function toggleReality(){virtualReality=!virtualReality;if(bloom){bloom.strength=virtualReality?.4:.65;}realityButton.textContent=virtualReality?'[ REALITY :: VIRTUAL_ROBLOX ]':'[ REALITY :: INFINITE_COSMOS ]';}

window.addEventListener('scroll',()=>{const y=window.scrollY;scrollTarget=(y-lastScroll);scrollVelocity=scrollTarget;lastScroll=y;document.body.style.setProperty('--scroll',`${y}px`);},{passive:true});
window.addEventListener('pointermove',event=>{const nx=event.clientX/innerWidth*2-1,ny=-(event.clientY/innerHeight*2-1);velocity.set(nx-lastPointer.x,ny-lastPointer.y);lastPointer.set(nx,ny);pointerTarget.set(nx,ny);if(!coarse.matches){cursor.style.left=`${event.clientX}px`;cursor.style.top=`${event.clientY}px`;const target=event.target.closest('a,button,.memory');cursor.classList.toggle('big',Boolean(target));}},{passive:true});
window.addEventListener('touchstart',event=>{initAudio();if(event.touches[0]){pointerTarget.set(event.touches[0].clientX/innerWidth*2-1,-(event.touches[0].clientY/innerHeight*2-1));}}, {passive:true});
window.addEventListener('pointerdown',initAudio,{passive:true});
audioButton.addEventListener('click',()=>{initAudio();if(audioContext&&audioContext.state==='suspended')audioContext.resume();});
realityButton.addEventListener('click',toggleReality);
document.getElementById('kiss').addEventListener('click',makeKissParticles);
document.getElementById('openLetter').addEventListener('click',openLetter);document.getElementById('closeLetter').addEventListener('click',closeLetter);
document.querySelectorAll('.memory').forEach(memory=>{memory.addEventListener('click',()=>{memory.classList.add('is-active');setTimeout(()=>memory.classList.remove('is-active'),900);});});
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)entry.target.classList.add('is-active');else if(!coarse.matches)entry.target.classList.remove('is-active');}),{threshold:.55});document.querySelectorAll('.memory').forEach(item=>observer.observe(item));

function updateLoveClock(){const start=Date.parse('2023-01-01T00:00:00Z');const diff=Math.max(0,Date.now()-start);const total=Math.floor(diff/1000);document.getElementById('days').textContent=Math.floor(total/86400).toLocaleString();document.getElementById('hours').textContent=String(Math.floor(total/3600)%24).padStart(2,'0');document.getElementById('minutes').textContent=String(Math.floor(total/60)%60).padStart(2,'0');document.getElementById('seconds').textContent=String(total%60).padStart(2,'0');}
setInterval(updateLoveClock,1000);updateLoveClock();

function disposeMaterial(material){if(Array.isArray(material))material.forEach(disposeMaterial);else if(material&&typeof material.dispose==='function')material.dispose();}
function disposeScene(){if(!scene)return;scene.traverse(object=>{if(object.geometry)object.geometry.dispose();if(object.material)disposeMaterial(object.material);});if(composer&&typeof composer.dispose==='function')composer.dispose();if(renderer){renderer.dispose();renderer.forceContextLoss?.();}resources.length=0;}
window.addEventListener('pagehide',()=>{cancelAnimationFrame(frameHandle);viewportObserver.disconnect();disposeScene();},{once:true});

if(createRenderer()){createScene();resizeRenderer();frameHandle=requestAnimationFrame(render);}else{statusNode.textContent='[ DOM_FALLBACK :: READY ]';}
