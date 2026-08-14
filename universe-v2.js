(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;
  const state = { reduced: reduce.matches, discoveries: Number(localStorage.getItem('olu-v2-discoveries') || 0) };
  const widget = document.createElement('aside');
  widget.className = 'universe-widget';
  widget.setAttribute('aria-live', 'polite');
  widget.innerHTML = `<button class="close-widget" aria-label="Close universe panel">×</button><h4>✦ UNIVERSE SIGNAL</h4><p id="signalText">The world is quietly changing around you.</p><div class="world-clock">LOCAL SKY <b id="worldClock">--:--</b></div><div class="memory-counter">DISCOVERIES <b id="v2Count">${state.discoveries}</b></div><div class="widget-row"><button data-action="spark">Spark shower</button><button data-action="weather">Change sky</button><button data-action="note">Floating note</button><button data-action="save">Save moment</button></div>`;
  document.body.append(widget);
  const signal = widget.querySelector('#signalText'), clock = widget.querySelector('#worldClock'), count = widget.querySelector('#v2Count');

  const messages = [
    'A quiet little change just passed through the sky.',
    'The universe noticed that you are still exploring.',
    'Some corners of the page only appear after wandering.',
    'The stars are never placed exactly the same way twice.',
    'There is always another detail hiding somewhere.'
  ];
  const notes = ['KEEP WANDERING', 'LOOK CLOSER', 'ANOTHER STAR', 'STILL GROWING', 'SECRET CORNER'];

  function toast(text) {
    const t = document.querySelector('#toast');
    if (!t) return;
    t.textContent = text; t.classList.add('show');
    clearTimeout(t._v2); t._v2 = setTimeout(() => t.classList.remove('show'), 2400);
  }
  function discover() {
    state.discoveries = Math.min(99, state.discoveries + 1);
    localStorage.setItem('olu-v2-discoveries', String(state.discoveries));
    count.textContent = state.discoveries;
  }
  function sparkShower() {
    if (state.reduced) return;
    for (let i = 0; i < 16; i++) {
      const p = document.createElement('i'); p.className = 'constellation-particle';
      p.style.left = `${innerWidth * (.25 + Math.random() * .5)}px`;
      p.style.top = `${innerHeight * (.2 + Math.random() * .45)}px`;
      p.style.setProperty('--dx', `${(Math.random() - .5) * 300}px`);
      p.style.setProperty('--dy', `${-30 - Math.random() * 180}px`);
      document.body.append(p); setTimeout(() => p.remove(), 1300);
    }
    discover(); signal.textContent = 'A small constellation just formed overhead.';
  }
  function changeSky() {
    const modes = ['night','day','auto'];
    const current = root.dataset.time || 'auto';
    root.dataset.time = modes[(modes.indexOf(current) + 1) % modes.length];
    discover(); signal.textContent = `Sky mode changed to ${root.dataset.time}.`;
  }
  function floatingNote() {
    const n = document.createElement('div'); n.className = 'floating-note';
    n.style.left = `${10 + Math.random() * 75}vw`; n.style.top = `${28 + Math.random() * 48}vh`;
    n.innerHTML = `<b>UNIVERSE NOTE</b>${notes[Math.floor(Math.random() * notes.length)]}`;
    document.body.append(n); setTimeout(() => n.remove(), 3300); discover();
  }
  function saveMoment() {
    const now = new Date();
    const key = 'olu-saved-moments';
    let moments = []; try { moments = JSON.parse(localStorage.getItem(key) || '[]'); } catch {}
    moments.unshift({ time: now.toISOString(), section: location.hash || '#home' });
    moments = moments.slice(0, 12); localStorage.setItem(key, JSON.stringify(moments));
    discover(); signal.textContent = `Moment saved locally · ${moments.length}/12 in your little archive.`;
    toast('Moment saved locally ✦');
  }
  widget.addEventListener('click', (e) => {
    const action = e.target.closest('[data-action]')?.dataset.action;
    if (action === 'spark') sparkShower();
    if (action === 'weather') changeSky();
    if (action === 'note') floatingNote();
    if (action === 'save') saveMoment();
    if (e.target.closest('.close-widget')) widget.classList.remove('show');
  });

  // Open the panel after the user has wandered for a little while, never immediately.
  setTimeout(() => widget.classList.add('show'), 5200);
  setTimeout(() => widget.classList.remove('show'), 10500);

  function updateClock() {
    const now = new Date();
    clock.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
  updateClock(); setInterval(updateClock, 1000);

  // The environment reacts to scroll position without changing existing layout.
  let lastY = scrollY;
  addEventListener('scroll', () => {
    if (Math.abs(scrollY - lastY) > 500) { signal.textContent = messages[Math.floor(Math.random() * messages.length)]; lastY = scrollY; }
  }, { passive: true });

  // Turn some existing interactions into tiny discoveries, without replacing their handlers.
  document.querySelectorAll('.memory, #roomCat, #letter, #leaveStar, #cave, .dreams button, .fact-pills button, .signs button, .value-orbit button').forEach(el => {
    el.addEventListener('click', () => { if (Math.random() < .28) discover(); }, { passive: true });
  });

  // Ambient weather particles vary subtly by local month and section.
  function weatherBurst() {
    if (state.reduced || document.hidden) return;
    const host = document.querySelector('.future, .universe, .hero'); if (!host) return;
    const layer = host.querySelector('.weather-specks') || (() => { const x = document.createElement('div'); x.className = 'weather-specks'; x.setAttribute('aria-hidden','true'); host.append(x); return x; })();
    for (let i = 0; i < 3; i++) { const s = document.createElement('i'); s.className = 'weather-speck'; s.style.left = `${Math.random()*100}%`; s.style.setProperty('--x', `${(Math.random()-.5)*90}px`); s.style.setProperty('--d', `${5+Math.random()*4}s`); layer.append(s); setTimeout(() => s.remove(), 10000); }
  }
  setInterval(weatherBurst, 2800);

  reduce.addEventListener?.('change', () => { state.reduced = reduce.matches; });
})();
