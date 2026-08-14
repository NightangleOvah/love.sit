const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const touchQuery = window.matchMedia('(pointer: coarse)');
const saveData = navigator.connection?.saveData === true;

const state = {
  reducedMotion: reduceMotionQuery.matches,
  manualMotionOff: false,
  manualSound: false,
  timeMode: 'auto',
  memoryIndex: 0,
  starCount: 90,
  pixelRatioCap: 1.75,
  quality: 'high',
  rain: false
};

const qs = (s, root = document) => root.querySelector(s);
const qsa = (s, root = document) => [...root.querySelectorAll(s)];

const toast = (message) => {
  const el = qs('#toast');
  if (!el) return;
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove('show'), 2200);
};

function readDeviceQuality() {
  const cores = navigator.hardwareConcurrency || 4;
  const memory = navigator.deviceMemory || 4;
  const narrow = innerWidth < 700;
  if (saveData || state.reducedMotion || cores <= 2 || memory <= 2) return 'low';
  if (narrow || cores <= 4 || memory <= 4 || touchQuery.matches) return 'medium';
  return 'high';
}

function applyQuality() {
  state.quality = readDeviceQuality();
  const settings = {
    low: { stars: 35, dpr: 1, bloom: 0.55 },
    medium: { stars: 65, dpr: 1.35, bloom: 0.75 },
    high: { stars: 105, dpr: 1.75, bloom: 1 }
  }[state.quality];
  state.starCount = settings.stars;
  state.pixelRatioCap = settings.dpr;
  document.documentElement.style.setProperty('--fx-bloom', String(settings.bloom));
  document.documentElement.dataset.quality = state.quality;
}

applyQuality();

// Loader
window.addEventListener('load', () => {
  setTimeout(() => qs('#loader')?.classList.add('done'), state.reducedMotion ? 50 : 500);
});

// Scroll progress
const progress = qs('#progress');
const updateProgress = () => {
  if (!progress) return;
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = `${max > 0 ? (scrollY / max) * 100 : 0}%`;
};
addEventListener('scroll', updateProgress, { passive: true });
addEventListener('resize', updateProgress, { passive: true });
updateProgress();

// Navigation
const menu = qs('#menu');
const nav = qs('#nav');
menu?.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') === 'true';
  menu.setAttribute('aria-expanded', String(!open));
  nav?.classList.toggle('open', !open);
});
qsa('#nav a').forEach((link) => link.addEventListener('click', () => {
  menu?.setAttribute('aria-expanded', 'false');
  nav?.classList.remove('open');
}));

// Scroll-linked reveals; IntersectionObserver avoids continuous viewport polling.
const revealObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  }
}, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
qsa('.reveal').forEach((el) => revealObserver.observe(el));

// Memory lightbox
const memories = qsa('.memory');
const lightbox = qs('#lightbox');
const big = qs('#big');
const meta = qs('#meta');
const memoryData = memories.map((figure) => ({
  src: figure.querySelector('source')?.srcset || figure.querySelector('img')?.currentSrc,
  fallback: figure.querySelector('img')?.src,
  title: figure.querySelector('b')?.textContent || 'Memory',
  note: figure.querySelector('small')?.textContent || ''
}));

function openMemory(index) {
  if (!memoryData.length) return;
  state.memoryIndex = (index + memoryData.length) % memoryData.length;
  const item = memoryData[state.memoryIndex];
  big.src = item.src || item.fallback;
  big.alt = item.title;
  meta.textContent = `${item.title} ${item.note ? `— ${item.note}` : ''}`;
  lightbox?.classList.add('open');
  lightbox?.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}
function closeMemory() {
  lightbox?.classList.remove('open');
  lightbox?.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}
memories.forEach((memory, index) => memory.addEventListener('click', () => openMemory(index)));
qs('#close')?.addEventListener('click', closeMemory);
qs('#prev')?.addEventListener('click', () => openMemory(state.memoryIndex - 1));
qs('#next')?.addEventListener('click', () => openMemory(state.memoryIndex + 1));
lightbox?.addEventListener('click', (event) => {
  if (event.target === lightbox) closeMemory();
});

// Keyboard access for the lightbox and interactive sections.
addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeMemory();
    qs('#secret')?.classList.remove('open');
  }
  if (!lightbox?.classList.contains('open')) return;
  if (event.key === 'ArrowLeft') openMemory(state.memoryIndex - 1);
  if (event.key === 'ArrowRight') openMemory(state.memoryIndex + 1);
});

// Fact / sign / value / dream interactions
qsa('[data-fact]').forEach((button) => button.addEventListener('click', () => {
  const output = qs('#factOutput');
  if (output) output.textContent = button.dataset.fact;
}));
qsa('[data-sign]').forEach((button) => button.addEventListener('click', () => {
  const output = qs('#signOutput');
  if (output) output.textContent = button.dataset.sign;
}));
qsa('[data-value]').forEach((button) => button.addEventListener('click', () => {
  const output = qs('#valueOutput');
  if (output) output.textContent = button.dataset.value;
}));
qsa('[data-text]').forEach((button) => button.addEventListener('click', () => {
  const output = qs('#dreamText');
  if (output) output.textContent = button.dataset.text;
}));

// Rain toggle
const rainToggle = qs('#rainToggle');
rainToggle?.addEventListener('click', () => {
  state.rain = !state.rain;
  document.body.classList.toggle('rain-on', state.rain);
  rainToggle.querySelector('span')?.replaceChildren(document.createTextNode(state.rain ? '☔' : '☂'));
  rainToggle.childNodes[0].textContent = state.rain ? 'Disable rain ' : 'Toggle rain ';
});

// Cat interaction
const roomCat = qs('#roomCat');
roomCat?.addEventListener('click', () => toast('pspspsps… the cat approves'));
roomCat?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    toast('pspspsps… the cat approves');
  }
});

// Letter
const letter = qs('#letter');
letter?.addEventListener('click', () => {
  const msg = qs('#letterMessage');
  const open = letter.classList.toggle('open');
  if (msg) {
    msg.textContent = open
      ? 'Some of the best things are small: a laugh, a message, a game, a quiet moment, and a reason to keep the story growing.'
      : '';
  }
});

// Hidden cave / secret ending
qs('#cave')?.addEventListener('click', () => {
  const secret = qs('#secret');
  if (!secret) return;
  secret.classList.add('open');
  secret.setAttribute('aria-hidden', 'false');
  secret.scrollIntoView({ behavior: state.reducedMotion ? 'auto' : 'smooth' });
});
qs('#closeSecret')?.addEventListener('click', () => {
  const secret = qs('#secret');
  secret?.classList.remove('open');
  secret?.setAttribute('aria-hidden', 'true');
  qs('#home')?.scrollIntoView({ behavior: state.reducedMotion ? 'auto' : 'smooth' });
});

// Custom cursor only on fine pointers, with passive pointer tracking.
const cursor = qs('#cursor');
if (cursor && !touchQuery.matches) {
  let cx = innerWidth / 2;
  let cy = innerHeight / 2;
  let tx = cx;
  let ty = cy;
  addEventListener('pointermove', (event) => {
    tx = event.clientX;
    ty = event.clientY;
  }, { passive: true });
  const moveCursor = () => {
    if (state.reducedMotion || state.manualMotionOff) {
      cursor.style.transform = `translate(${tx}px, ${ty}px) translate(-50%, -50%)`;
    } else {
      cx += (tx - cx) * 0.2;
      cy += (ty - cy) * 0.2;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    }
    if (!document.hidden) requestAnimationFrame(moveCursor);
  };
  requestAnimationFrame(moveCursor);
  qsa('a,button,.memory').forEach((el) => {
    el.addEventListener('mouseenter', () => cursor.classList.add('cursor-big'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-big'));
  });
}

// Procedural sky canvas. It is deliberately lightweight, adaptive, and paused when hidden.
const canvas = qs('#stars');
const ctx = canvas?.getContext('2d', { alpha: true });
let stars = [];
let raf = 0;
let lastFrame = 0;
let width = 0;
let height = 0;

function resizeStars() {
  if (!canvas || !ctx) return;
  width = innerWidth;
  height = innerHeight;
  const dpr = Math.min(devicePixelRatio || 1, state.pixelRatioCap);
  canvas.width = Math.max(1, Math.floor(width * dpr));
  canvas.height = Math.max(1, Math.floor(height * dpr));
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  stars = Array.from({ length: state.starCount }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: Math.random() * 1.4 + 0.25,
    a: Math.random() * 0.7 + 0.15,
    tw: Math.random() * 1.8 + 0.4,
    p: Math.random() * Math.PI * 2,
    drift: (Math.random() - 0.5) * 0.016
  }));
}

function drawStars(time = 0) {
  if (!ctx || document.hidden || state.manualMotionOff || state.reducedMotion) return;
  ctx.clearRect(0, 0, width, height);
  for (const star of stars) {
    star.p += star.tw * 0.0015;
    star.x += star.drift;
    if (star.x < -2) star.x = width + 2;
    if (star.x > width + 2) star.x = -2;
    const alpha = star.a * (0.76 + Math.sin(star.p + time * 0.0005) * 0.24);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  raf = requestAnimationFrame(drawStars);
}

resizeStars();
if (!state.reducedMotion) raf = requestAnimationFrame(drawStars);
addEventListener('resize', resizeStars, { passive: true });

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    cancelAnimationFrame(raf);
    return;
  }
  if (!state.reducedMotion && !state.manualMotionOff) raf = requestAnimationFrame(drawStars);
});

// Additive constellation stars, with a very small cap.
let customStars = 0;
qs('#leaveStar')?.addEventListener('click', () => {
  if (customStars >= 14) {
    toast('The sky is full for now ✦');
    return;
  }
  customStars += 1;
  const sky = qs('#sky');
  if (!sky) return;
  const star = document.createElement('span');
  star.className = 'new-star';
  star.style.left = `${8 + Math.random() * 84}%`;
  star.style.top = `${10 + Math.random() * 78}%`;
  sky.appendChild(star);
  toast('A new little star joined the story ✦');
});

// Controls
const motionToggle = qs('#motionToggle');
motionToggle?.addEventListener('click', () => {
  state.manualMotionOff = !state.manualMotionOff;
  document.body.classList.toggle('motion-off', state.manualMotionOff);
  motionToggle.setAttribute('aria-pressed', String(state.manualMotionOff));
  motionToggle.querySelector('span').textContent = state.manualMotionOff ? 'OFF' : (state.reducedMotion ? 'REDUCED' : 'AUTO');
  if (state.manualMotionOff) cancelAnimationFrame(raf);
  else if (!document.hidden && !state.reducedMotion) raf = requestAnimationFrame(drawStars);
});

const timeToggle = qs('#timeToggle');
timeToggle?.addEventListener('click', () => {
  const next = state.timeMode === 'auto' ? 'day' : state.timeMode === 'day' ? 'night' : 'auto';
  state.timeMode = next;
  document.documentElement.dataset.time = next;
  timeToggle.querySelector('span').textContent = next.toUpperCase();
});

const soundToggle = qs('#soundToggle');
let audioContext;
let ambientGain;
function ensureAmbientAudio() {
  if (audioContext) return;
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    ambientGain = audioContext.createGain();
    ambientGain.gain.value = 0;
    ambientGain.connect(audioContext.destination);
  } catch {
    toast('Audio is unavailable in this browser.');
  }
}
soundToggle?.addEventListener('click', async () => {
  state.manualSound = !state.manualSound;
  if (state.manualSound) {
    ensureAmbientAudio();
    try {
      await audioContext?.resume();
      if (ambientGain) ambientGain.gain.setTargetAtTime(0.012, audioContext.currentTime, 0.08);
    } catch {}
  } else if (ambientGain && audioContext) {
    ambientGain.gain.setTargetAtTime(0, audioContext.currentTime, 0.08);
  }
  soundToggle.setAttribute('aria-pressed', String(state.manualSound));
  soundToggle.querySelector('span').textContent = state.manualSound ? 'ON' : 'OFF';
});

// Use the user's platform preference dynamically.
const handleMotionPreference = () => {
  state.reducedMotion = reduceMotionQuery.matches;
  document.body.classList.toggle('prefers-reduced-motion', state.reducedMotion);
  applyQuality();
  if (state.reducedMotion) cancelAnimationFrame(raf);
  else if (!document.hidden && !state.manualMotionOff) raf = requestAnimationFrame(drawStars);
};
reduceMotionQuery.addEventListener?.('change', handleMotionPreference);

// Persist lightweight preferences without storing personal data.
try {
  const saved = JSON.parse(localStorage.getItem('olu-preferences') || '{}');
  if (typeof saved.timeMode === 'string') {
    state.timeMode = saved.timeMode;
    document.documentElement.dataset.time = state.timeMode;
    timeToggle?.querySelector('span') && (timeToggle.querySelector('span').textContent = state.timeMode.toUpperCase());
  }
} catch {}

addEventListener('pagehide', () => {
  cancelAnimationFrame(raf);
  try { localStorage.setItem('olu-preferences', JSON.stringify({ timeMode: state.timeMode })); } catch {}
});
