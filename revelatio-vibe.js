(() => {
  const sections = [...document.querySelectorAll('main > section[id]')].filter(s => s.id && s.id !== 'secret');
  if (!sections.length) return;

  const rail = document.createElement('nav');
  rail.className = 'rv-rail';
  rail.setAttribute('aria-label', 'Universe index');
  sections.slice(0, 9).forEach((section, i) => {
    const link = document.createElement('a');
    link.href = `#${section.id}`;
    link.textContent = String(i + 1).padStart(2, '0');
    link.title = section.id.replaceAll('-', ' ');
    rail.append(link);
  });
  const railLabel = document.createElement('small');
  railLabel.textContent = 'WANDER';
  rail.append(railLabel);
  document.body.append(rail);
  const railLinks = [...rail.querySelectorAll('a')];

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      railLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { threshold: 0.38 });
  sections.forEach(section => observer.observe(section));

  const hero = document.querySelector('#home');
  if (hero && !hero.querySelector('.rv-stats')) {
    const stats = document.createElement('div');
    stats.className = 'rv-stats';
    stats.innerHTML = `
      <div class="rv-stat"><b>∞</b><span>still growing</span></div>
      <div class="rv-stat"><b>06</b><span>memories captured</span></div>
      <div class="rv-stat"><b>02</b><span>little worlds</span></div>
      <div class="rv-stat"><b>01</b><span>shared universe</span></div>`;
    hero.append(stats);
  }

  document.querySelectorAll('.hero,.archive,.universe,.future').forEach(section => {
    if (section.querySelector('.rv-sheen')) return;
    const sheen = document.createElement('div');
    sheen.className = 'rv-sheen';
    sheen.setAttribute('aria-hidden', 'true');
    section.append(sheen);
  });

  const finePointer = matchMedia('(pointer:fine)').matches;
  if (finePointer && !document.querySelector('.rv-cursor-label')) {
    const label = document.createElement('div');
    label.className = 'rv-cursor-label';
    label.setAttribute('aria-hidden', 'true');
    label.textContent = 'EXPLORE';
    document.body.append(label);
    addEventListener('pointermove', e => {
      label.style.left = `${e.clientX}px`;
      label.style.top = `${e.clientY}px`;
    }, { passive: true });
    document.addEventListener('pointerover', e => {
      const target = e.target.closest('a,button,.memory,.planet,.dreams button');
      document.body.classList.toggle('rv-hover', !!target);
      if (target) label.textContent = target.classList.contains('memory') ? 'OPEN MEMORY' : 'EXPLORE';
    });
  }

  const baseTitle = document.title;
  const titleObserver = new IntersectionObserver(entries => {
    const visible = entries.filter(e => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    const id = visible.target.id;
    const pretty = id === 'home' ? 'Isira ♥ Michelle' : id.replaceAll('-', ' ');
    document.title = `${pretty.toUpperCase()} · Our Little Universe`;
  }, { threshold: [0.35, 0.6] });
  sections.forEach(section => titleObserver.observe(section));
  addEventListener('pagehide', () => { document.title = baseTitle; }, { once: true });
})();
