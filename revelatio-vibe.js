(() => {
  const sections = [...document.querySelectorAll('main > section[id]')].filter(s => s.id && s.id !== 'secret');
  if (!sections.length) return;
  const rail = document.createElement('nav');
  rail.className = 'rv-rail';
  rail.setAttribute('aria-label', 'Universe index');
  sections.slice(0,9).forEach((section,i)=>{const a=document.createElement('a');a.href=`#${section.id}`;a.textContent=String(i+1).padStart(2,'0');a.title=section.id.replaceAll('-',' ');rail.append(a)});
  const small=document.createElement('small');small.textContent='WANDER';rail.append(small);document.body.append(rail);
  const links=[...rail.querySelectorAll('a')];
  const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)links.forEach(a=>a.classList.toggle('active',a.getAttribute('href')===`#${entry.target.id}`))}),{threshold:.38});
  sections.forEach(s=>io.observe(s));
  const hero=document.querySelector('#home');
  if(hero&&!hero.querySelector('.rv-stats')){const stats=document.createElement('div');stats.className='rv-stats';stats.innerHTML='<div class="rv-stat"><b>∞</b><span>still growing</span></div><div class="rv-stat"><b>06</b><span>memories captured</span></div><div class="rv-stat"><b>02</b><span>little worlds</span></div><div class="rv-stat"><b>01</b><span>shared universe</span></div>';hero.append(stats)}
  document.querySelectorAll('.hero,.archive,.universe,.future').forEach(section=>{if(section.querySelector('.rv-sheen'))return;const s=document.createElement('div');s.className='rv-sheen';s.setAttribute('aria-hidden','true');section.append(s)});
  if(matchMedia('(pointer:fine)').matches&&!document.querySelector('.rv-cursor-label')){const label=document.createElement('div');label.className='rv-cursor-label';label.setAttribute('aria-hidden','true');label.textContent='EXPLORE';document.body.append(label);addEventListener('pointermove',e=>{label.style.left=`${e.clientX}px`;label.style.top=`${e.clientY}px`},{passive:true});document.addEventListener('pointerover',e=>{const hit=e.target.closest('a,button,.memory,.planet,.dreams button');document.body.classList.toggle('rv-hover',!!hit);if(hit)label.textContent=hit.classList.contains('memory')?'OPEN MEMORY':'EXPLORE'})}
  const titleObserver=new IntersectionObserver(entries=>{const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(!visible)return;const id=visible.target.id;document.title=`${(id==='home'?'Isira ♥ Michelle':id.replaceAll('-',' ')).toUpperCase()} · Our Little Universe`},{threshold:[.35,.6]});
  sections.forEach(s=>titleObserver.observe(s));
})();
