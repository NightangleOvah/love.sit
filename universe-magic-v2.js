(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const layer = document.createElement('div'); layer.className='magic-weather'; layer.setAttribute('aria-hidden','true');
  const toast=document.createElement('div'); toast.className='magic-toast'; document.body.append(toast);
  const season=document.createElement('div'); season.className='magic-season'; season.setAttribute('aria-hidden','true'); document.body.append(season);
  const now=new Date(); const month=now.getMonth();
  const seasonName=month<2||month===11?'winter':month<5?'spring':month<8?'summer':'autumn'; season.textContent=`${seasonName} atmosphere · ${now.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}`;
  const rand=(a,b)=>a+Math.random()*(b-a); const later=(e,t)=>setTimeout(()=>e.remove(),t);
  const show=(text)=>{toast.textContent=text;toast.classList.add('show');clearTimeout(show.t);show.t=setTimeout(()=>toast.classList.remove('show'),2600)};
  function butterfly(){if(reduce.matches||document.hidden)return;const e=document.createElement('i');e.className='magic-butterfly';e.style.left=rand(2,98)+'vw';e.style.top=rand(25,90)+'vh';e.style.setProperty('--dx',rand(-80,80)+'px');e.style.setProperty('--dy',rand(-100,80)+'px');e.style.setProperty('--dx2',rand(-140,140)+'px');e.style.setProperty('--dy2',rand(-160,120)+'px');e.style.setProperty('--rot',rand(-30,30)+'deg');e.style.setProperty('--rot2',rand(120,300)+'deg');e.style.setProperty('--life',rand(9,16)+'s');layer.append(e);later(e,17000)}
  function snow(){if(reduce.matches||document.hidden)return;const e=document.createElement('i');e.className='magic-snow';e.style.left=rand(0,100)+'vw';e.style.setProperty('--dx',rand(-80,80)+'px');e.style.setProperty('--life',rand(7,12)+'s');layer.append(e);later(e,13000)}
  function ripple(x,y){if(reduce.matches)return;const e=document.createElement('i');e.className='magic-ripple';e.style.left=x+'px';e.style.top=y+'px';document.body.append(e);later(e,950)}
  function addMemoryGlow(){document.querySelectorAll('.memory').forEach(card=>{if(card.querySelector('.magic-memory-glow'))return;const g=document.createElement('span');g.className='magic-memory-glow';card.append(g)})}
  function starMap(){const sky=document.querySelector('#sky');if(!sky||sky.dataset.magicMap)return;sky.dataset.magicMap='1';const stars=[...sky.querySelectorAll('.star,.heart')];stars.forEach((s,i)=>s.addEventListener('click',()=>{if(i<stars.length-1){const a=s.getBoundingClientRect(),b=stars[i+1].getBoundingClientRect(),line=document.createElement('i');line.className='magic-constellation-line';const dx=b.left-a.left,dy=b.top-a.top;line.style.left=(a.left+innerWidth*0)+'px';line.style.top=(a.top+10)+'px';line.style.width=Math.hypot(dx,dy)+'px';line.style.setProperty('--angle',Math.atan2(dy,dx)+'rad');document.body.append(line);later(line,1000)}show('A new line appeared in the constellation ✦')}))}
  function secretGesture(){let seq='';addEventListener('keydown',e=>{if(reduce.matches)return;seq=(seq+e.key.toLowerCase()).slice(-8);if(seq==='starlight'){show('The universe heard the secret word ✦');document.documentElement.animate([{filter:'brightness(1)'},{filter:'brightness(1.4)'},{filter:'brightness(1)'}],{duration:900})}})}
  function pulseClick(){addEventListener('pointerdown',e=>{if(e.target.closest('button,a,.memory,.planet,.envelope-object'))ripple(e.clientX,e.clientY)},{passive:true})}
  document.addEventListener('DOMContentLoaded',()=>{document.head.insertAdjacentHTML('beforeend','<link rel="stylesheet" href="universe-magic-v2.css">');document.body.append(layer);addMemoryGlow();starMap();secretGesture();pulseClick();
    let t=0;function loop(){if(!reduce.matches&&!document.hidden){if(Math.random()<.22)butterfly();if(seasonName==='winter'&&Math.random()<.35)snow();t++;if(t%30===0)season.textContent=`${seasonName} atmosphere · ${new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}`}setTimeout(loop,900)}loop();
    document.querySelectorAll('.dreams button,.signs button,.fact-pills button').forEach(b=>b.addEventListener('click',()=>show('The universe remembered that ✦')));
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden)layer.replaceChildren()});
})();
