(() => {
  const reduceQuery = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(pointer: coarse)').matches;
  const layer = document.createElement('div');
  layer.id = 'ambient-layer';
  layer.setAttribute('aria-hidden', 'true');
  document.body.append(layer);

  const badge = document.createElement('div');
  badge.className = 'living-badge';
  badge.innerHTML = '<b>✦ LIVE UNIVERSE</b> · <span id="ambientMode">calm</span>';
  document.body.append(badge);

  const quality = document.documentElement.dataset.quality || 'high';
  const limits = { low: { petals: 2, fireflies: 5 }, medium: { petals: 4, fireflies: 9 }, high: { petals: 7, fireflies: 14 } }[quality] || { petals: 4, fireflies: 9 };
  const state = { reduced: reduceQuery.matches, enabled: true, scene: 'calm', clicks: 0 };

  const random = (min, max) => min + Math.random() * (max - min);
  const removeLater = (el, ms) => setTimeout(() => el.remove(), ms);

  function spawnPetal() {
    if (state.reduced || !state.enabled || document.hidden) return;
    const el = document.createElement('i');
    el.className = 'ambient-petal';
    el.style.left = `${random(-5, 105)}vw`;
    el.style.setProperty('--fall', `${random(7.5, 13)}s`);
    el.style.setProperty('--sway', `${random(-24, 24)}vw`);
    el.style.setProperty('--scale', random(.55, 1.15).toFixed(2));
    el.style.setProperty('--opacity', random(.45, .9).toFixed(2));
    layer.append(el);
    removeLater(el, 14000);
  }

  function spawnFirefly() {
    if (state.reduced || !state.enabled || document.hidden) return;
    const el = document.createElement('i');
    el.className = 'ambient-firefly';
    el.style.left = `${random(5, 95)}vw`;
    el.style.top = `${random(25, 92)}vh`;
    el.style.setProperty('--dx', `${random(-70, 70)}px`);
    el.style.setProperty('--dy', `${random(-90, 90)}px`);
    el.style.setProperty('--life', `${random(5, 10)}s`);
    layer.append(el);
    removeLater(el, 11000);
  }

  function heartBurst(x, y) {
    if (state.reduced) return;
    for (let i = 0; i < 5; i++) {
      const el = document.createElement('span');
      el.className = 'heart-burst';
      el.textContent = i % 2 ? '♡' : '♥';
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.style.setProperty('--dx', `${random(-55, 55)}px`);
      el.style.setProperty('--dy', `${random(-65, -18)}px`);
      el.style.setProperty('--rot', `${random(-35, 35)}deg`);
      document.body.append(el);
      removeLater(el, 1000);
    }
  }

  // A soft cursor light on desktop; no permanent pointer trail on touch devices.
  let cursorOrb;
  if (!coarse && !state.reduced) {
    cursorOrb = document.createElement('div');
    cursorOrb.className = 'cursor-orb';
    cursorOrb.setAttribute('aria-hidden', 'true');
    document.body.append(cursorOrb);
    addEventListener('pointermove', (e) => {
      cursorOrb.style.left = `${e.clientX}px`;
      cursorOrb.style.top = `${e.clientY}px`;
    }, { passive: true });
  }

  // Click anywhere interactive: a tiny heart response. Avoid double-firing form-like controls.
  addEventListener('click', (e) => {
    if (state.reduced || e.target.closest('input,textarea,select')) return;
    const interactive = e.target.closest('button,a,.memory,.envelope-object,.planet');
    if (interactive) heartBurst(e.clientX, e.clientY);
  }, { passive: true });

  // Gentle tilt on memory cards. It is deliberately disabled for touch and reduced motion.
  if (!coarse && !state.reduced) {
    document.querySelectorAll('.memory').forEach((card) => {
      card.classList.add('tilt-ready');
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5;
        const y = (e.clientY - r.top) / r.height - .5;
        card.style.transform = `perspective(900px) rotateX(${(-y * 3).toFixed(2)}deg) rotateY(${(x * 4).toFixed(2)}deg) translateY(-3px)`;
      }, { passive: true });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; }, { passive: true });
    });
  }

  // Atmospheric state changes based on the section the user is actually visiting.
  const mode = document.querySelector('#ambientMode');
  const sectionModes = [
    ['#home', 'petals'], ['#story', 'starlight'], ['#memories', 'memories'], ['#michelle', 'rainy glow'],
    ['#envelope', 'fireflies'], ['#letters', 'soft hearts'], ['#values', 'orbit'], ['#constellation', 'starlight'], ['#future', 'petals'], ['#deep-space', 'deep space']
  ];
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const match = sectionModes.find(([selector]) => entry.target.matches(selector));
        if (match) {
          state.scene = match[1];
          if (mode) mode.textContent = state.scene;
          badge.classList.add('show');
          clearTimeout(badge._hide);
          badge._hide = setTimeout(() => badge.classList.remove('show'), 2600);
        }
      }
    });
  }, { threshold: .35 });
  sectionModes.forEach(([selector]) => { const el = document.querySelector(selector); if (el) observer.observe(el); });

  // Aurora and moon halo are inserted only where they add visual value.
  const universe = document.querySelector('#constellation');
  if (universe && !universe.querySelector('.aurora-layer')) {
    const aurora = document.createElement('div');
    aurora.className = 'aurora-layer';
    aurora.setAttribute('aria-hidden', 'true');
    universe.append(aurora);
  }
  const story = document.querySelector('#story');
  if (story && !story.querySelector('.moon-halo')) {
    const halo = document.createElement('div');
    halo.className = 'moon-halo';
    halo.setAttribute('aria-hidden', 'true');
    halo.style.right = '8%'; halo.style.top = '16%';
    story.append(halo);
  }

  function ambientLoop() {
    if (!state.reduced && state.enabled && !document.hidden) {
      const petalChance = state.scene === 'petals' || state.scene === 'soft hearts' ? .75 : .28;
      const fireflyChance = state.scene === 'fireflies' || state.scene === 'memories' ? .8 : .18;
      if (Math.random() < petalChance) spawnPetal();
      if (Math.random() < fireflyChance) spawnFirefly();
    }
    setTimeout(ambientLoop, 650);
  }
  ambientLoop();

  // Burst of petals when the user first enters the hero, then settle into ambient drift.
  let heroSeen = false;
  const hero = document.querySelector('#home');
  if (hero) {
    const heroObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !heroSeen && !state.reduced) {
        heroSeen = true;
        for (let i = 0; i < limits.petals + 2; i++) setTimeout(spawnPetal, i * 110);
      }
    }, { threshold: .55 });
    heroObserver.observe(hero);
  }

  // Small discovery: clicking the main heart seven times reveals a tiny toast.
  const heart = document.querySelector('#constellation .heart');
  heart?.addEventListener('click', () => {
    state.clicks++;
    if (state.clicks === 7) {
      const toast = document.querySelector('#toast');
      if (toast) {
        toast.textContent = 'You found the little heartbeat ✦';
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2600);
      }
      heartBurst(innerWidth / 2, innerHeight / 2);
    }
  });

  // Pause the effect system when the page is hidden.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) layer.replaceChildren();
  });

  const handleMotion = () => {
    state.reduced = reduceQuery.matches;
    if (state.reduced) {
      layer.replaceChildren();
      cursorOrb?.remove();
    }
  };
  reduceQuery.addEventListener?.('change', handleMotion);
})();
