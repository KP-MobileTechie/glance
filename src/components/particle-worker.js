/* Glance particle background worker — tick math off main thread */
let particles = [];

function init(count, w, h) {
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    r: Math.random() * 2 + 0.5,
    a: Math.random() * 0.4 + 0.1,
  }));
}

function tick(w, h) {
  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0) p.x = w;
    if (p.x > w) p.x = 0;
    if (p.y < 0) p.y = h;
    if (p.y > h) p.y = 0;
  }
  return particles.map(({ x, y, r, a }) => ({ x, y, r, a }));
}

self.onmessage = (e) => {
  if (e.data.type === 'init') init(e.data.count, e.data.w, e.data.h);
  if (e.data.type === 'tick') self.postMessage(tick(e.data.w, e.data.h));
};
