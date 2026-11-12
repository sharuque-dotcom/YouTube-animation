// Episode 5 set pieces (episode-3 template): boardroom at night, "call ended", the red ticker,
// Washington at night. Pure functions of time t.
import { W, H, clamp, lerp, rand, text } from '../../pipeline/engine.js';
import { sky, stars, moon, clouds, skyline, rain, mist, beam, glow, reflect } from '../../pipeline/scenery.js';
import { cityWindow } from '../ep04-deepfake/night.js';

const ez = (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
const NV = '#76b900';

/** Seated faceless silhouette (head + shoulders over a chair back), rim-lit */
export function seated(g, x, y, s, { rim = 'rgba(255,210,160,0.6)', side = 1, chair = true } = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  if (chair) { g.fillStyle = '#0d0a18'; g.beginPath(); g.roundRect(-70, -190, 140, 200, 24); g.fill(); }
  g.fillStyle = '#06050d';
  g.beginPath(); g.ellipse(0, -205, 40, 48, 0, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.moveTo(-95, 20); g.quadraticCurveTo(-100, -130, -30, -150); g.lineTo(30, -150); g.quadraticCurveTo(100, -130, 95, 20); g.closePath(); g.fill();
  g.strokeStyle = rim; g.lineWidth = 3.5; g.beginPath(); g.ellipse(0, -205, 40, 48, 0, side > 0 ? -1.4 : 1.8, side > 0 ? 0.7 : 3.9); g.stroke();
  g.beginPath(); if (side > 0) { g.moveTo(30, -150); g.quadraticCurveTo(100, -130, 95, 20); } else { g.moveTo(-30, -150); g.quadraticCurveTo(-100, -130, -95, 20); } g.stroke();
  g.restore();
}
/** The leather jacket, draped over a chair back: glossy black with highlights */
export function jacket(g, t, x, y, s, { lit = 1 } = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  // chair back
  g.fillStyle = '#0d0a18'; g.beginPath(); g.roundRect(-110, -300, 220, 330, 36); g.fill();
  const jg = g.createLinearGradient(-160, -300, 160, 80); jg.addColorStop(0, '#34303c'); jg.addColorStop(0.45, '#17151c'); jg.addColorStop(1, '#060508');
  g.fillStyle = jg;
  // body of the jacket hanging over the chair back
  g.beginPath(); g.moveTo(-150, -280); g.quadraticCurveTo(0, -300, 150, -280); g.lineTo(160, 40); g.lineTo(-160, 40); g.closePath(); g.fill();
  // sleeves hanging straight down each side
  g.beginPath(); g.roundRect(-205, -280, 62, 330, 26); g.fill(); g.beginPath(); g.roundRect(143, -280, 62, 330, 26); g.fill();
  // cuffs with zips
  g.fillStyle = '#0a090d'; g.fillRect(-205, 20, 62, 30); g.fillRect(143, 20, 62, 30);
  // wide lapels/collar
  g.fillStyle = '#25222c';
  g.beginPath(); g.moveTo(-90, -292); g.lineTo(-20, -180); g.lineTo(-60, -120); g.lineTo(-120, -270); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(90, -292); g.lineTo(20, -180); g.lineTo(60, -120); g.lineTo(120, -270); g.closePath(); g.fill();
  // zipper + zipped chest pocket
  g.strokeStyle = '#9a94a6'; g.lineWidth = 4; g.beginPath(); g.moveTo(0, -180); g.lineTo(0, 40); g.stroke();
  g.lineWidth = 3; g.beginPath(); g.moveTo(40, -110); g.lineTo(110, -120); g.stroke();
  // seams
  g.strokeStyle = 'rgba(0,0,0,0.6)'; g.lineWidth = 3; g.beginPath(); g.moveTo(-150, -60); g.lineTo(150, -60); g.stroke();
  // specular highlights from the pendant light above (leather sheen)
  g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.6 * lit;
  [[-90, -230, 26, 60, -0.4], [90, -230, 26, 60, 0.4], [-175, -150, 10, 90, 0], [175, -150, 10, 90, 0], [-60, -20, 18, 50, 0.2], [70, -10, 18, 50, -0.2]].forEach(([a2, b2, rx, ry, rot]) => { const hg = g.createRadialGradient(a2, b2, 0, a2, b2, ry); hg.addColorStop(0, 'rgba(255,220,180,0.75)'); hg.addColorStop(1, 'rgba(255,220,180,0)'); g.fillStyle = hg; g.beginPath(); g.ellipse(a2, b2, rx, ry, rot, 0, Math.PI * 2); g.fill(); });
  g.restore();
  g.restore();
}

// ---------------------------------------------------------------- 1. the boardroom at night
export function boardroom(g, t, o = {}) {
  const head = o.jacketLit ?? 1;
  // the city through the glass wall
  cityWindow(g, t, [0, 0, W, 760], { moonAt: [0.82, 0.18], rainA: 0.35, seed: 40 });
  g.fillStyle = 'rgba(6,5,16,0.35)'; g.fillRect(0, 0, W, 760);
  for (let i = 1; i < 6; i++) { g.fillStyle = '#0b0918'; g.fillRect(i * 320 - 6, 0, 12, 760); }
  // ceiling + pendant lights (warm key)
  g.fillStyle = '#0b0918'; g.fillRect(0, 0, W, 60);
  [560, 960, 1360].forEach((x) => { g.strokeStyle = '#1a1530'; g.lineWidth = 3; g.beginPath(); g.moveTo(x, 60); g.lineTo(x, 200); g.stroke(); g.fillStyle = '#2a2140'; g.beginPath(); g.ellipse(x, 205, 70, 14, 0, 0, Math.PI * 2); g.fill(); glow(g, x, 215, 160, '255,200,140', 0.6); beam(g, t, x, 215, Math.PI / 2, { len: 560, spread: 0.32, color: '255,205,150', alpha: 0.16, motes: 25, seed: x }); });
  // floor
  const fl = g.createLinearGradient(0, 760, 0, H); fl.addColorStop(0, '#16112a'); fl.addColorStop(1, '#07060f'); g.fillStyle = fl; g.fillRect(0, 760, W, H - 760);
  // far head chair with the jacket (warm pool of light)
  glow(g, 960, 470, 260, '255,200,140', 0.35 * head);
  jacket(g, t, 960, 640, 0.62, { lit: head });
  // the long table in perspective, glossy
  const tg = g.createLinearGradient(0, 600, 0, H); tg.addColorStop(0, '#2a1f30'); tg.addColorStop(1, '#120c18');
  g.fillStyle = tg; g.beginPath(); g.moveTo(800, 610); g.lineTo(1120, 610); g.lineTo(1560, H); g.lineTo(360, H); g.closePath(); g.fill();
  g.save(); g.globalCompositeOperation = 'lighter'; [560, 960, 1360].forEach((x) => { const rg = g.createRadialGradient(lerp(960, x, 0.6), 760, 10, lerp(960, x, 0.6), 760, 260); rg.addColorStop(0, 'rgba(255,200,140,0.18)'); rg.addColorStop(1, 'rgba(255,200,140,0)'); g.fillStyle = rg; g.fillRect(360, 610, 1200, 470); }); g.restore();
  g.strokeStyle = 'rgba(255,210,170,0.25)'; g.lineWidth = 2; g.beginPath(); g.moveTo(800, 610); g.lineTo(1120, 610); g.stroke();
  // laptops + glasses along the table
  for (let k = 0; k < 5; k++) for (const sd of [-1, 1]) {
    const d = k / 4, y = lerp(650, 980, d), x = 960 + sd * lerp(140, 470, d), sc = lerp(0.45, 1, d);
    g.fillStyle = '#0a0812'; g.fillRect(x - 40 * sc, y - 30 * sc, 80 * sc, 46 * sc); glow(g, x, y - 8 * sc, 60 * sc, '150,170,255', 0.25);
    g.fillStyle = 'rgba(220,230,255,0.25)'; g.fillRect(x + sd * -60 * sc, y - 20 * sc, 10 * sc, 22 * sc);
  }
  // ten silhouettes, five a side, depth-scaled, rim-lit by the pendants
  for (let k = 4; k >= 0; k--) for (const sd of [-1, 1]) {
    const d = k / 4, y = lerp(700, 1150, d), x = 960 + sd * lerp(250, 760, d), s = lerp(0.42, 1.05, d);
    seated(g, x, y, s, { side: -sd, rim: 'rgba(255,210,160,0.55)' });
  }
  // rain trickles on the glass
  rain(g, t, { n: 160, alpha: 0.18, rect: [0, 0, W, 760] });
}

// ---------------------------------------------------------------- 2. "Call ended"
export function callEnded(g, t, o = {}) {
  const wall = g.createLinearGradient(0, 0, W, 0); wall.addColorStop(0, '#0d0a1e'); wall.addColorStop(1, '#17112b'); g.fillStyle = wall; g.fillRect(0, 0, W, H);
  const win = [1100, 90, 700, 520];
  cityWindow(g, t, win, { moonAt: [0.3, 0.25], rainA: 0.45, seed: 44 });
  g.fillStyle = '#1a1430'; g.fillRect(win[0] - 16, win[1] - 16, win[2] + 32, 16); g.fillRect(win[0] - 16, win[1] + win[3], win[2] + 32, 22); g.fillRect(win[0] - 16, win[1], 16, win[3]); g.fillRect(win[0] + win[2], win[1], 16, win[3]); g.fillRect(win[0] + win[2] / 2 - 6, win[1], 12, win[3]);
  // desk
  const dg = g.createLinearGradient(0, 700, 0, H); dg.addColorStop(0, '#3a2b3a'); dg.addColorStop(1, '#120c16'); g.fillStyle = dg; g.fillRect(0, 700, W, H - 700);
  g.fillStyle = 'rgba(200,190,255,0.22)'; g.fillRect(0, 700, W, 3);
  // lamp: warm cone onto the phone
  g.fillStyle = '#2a2140'; g.fillRect(250, 690, 120, 14); g.strokeStyle = '#2a2140'; g.lineWidth = 12; g.beginPath(); g.moveTo(310, 690); g.lineTo(360, 480); g.lineTo(520, 420); g.stroke();
  g.save(); g.translate(540, 420); g.rotate(0.55); g.fillStyle = '#3a3156'; g.beginPath(); g.moveTo(-50, -8); g.lineTo(50, -8); g.lineTo(76, 56); g.lineTo(-76, 56); g.closePath(); g.fill(); g.restore();
  beam(g, t, 560, 470, 1.15, { len: 560, spread: 0.42, color: '255,200,130', alpha: 0.3, motes: 50, seed: 2 });
  glow(g, 760, 820, 380, '255,200,130', 0.3);
  // phone lying on the desk in perspective, screen up
  g.save(); g.translate(800, 860); g.transform(1, 0, -0.35, 0.55, 0, 0); g.rotate(-0.12);
  g.fillStyle = '#05040a'; g.beginPath(); g.roundRect(-140, -260, 280, 520, 40); g.fill();
  const sc = g.createLinearGradient(0, -240, 0, 240); sc.addColorStop(0, '#2a1f55'); sc.addColorStop(1, '#14102a'); g.fillStyle = sc; g.beginPath(); g.roundRect(-126, -246, 252, 492, 30); g.fill();
  g.fillStyle = '#5b4a9a'; g.beginPath(); g.arc(0, -110, 56, 0, Math.PI * 2); g.fill();
  text(g, '?', 0, -90, { font: 'Jakarta', weight: 800, size: 60, color: '#fff', align: 'center' });
  text(g, 'Unknown · New York', 0, 0, { font: 'Inter', weight: 600, size: 26, color: '#e8e3f5', align: 'center' });
  const ended = t >= (o.endedAt ?? -1);
  text(g, ended ? 'Call ended' : 'Incoming call…', 0, 60, { font: 'Jakarta', weight: 800, size: 38, color: ended ? '#ff8a96' : '#9fffe0', align: 'center' });
  text(g, ended ? '0:07' : '', 0, 108, { font: 'Jakarta', weight: 600, size: 30, color: '#cfc6ff', align: 'center' });
  g.restore();
  glow(g, 780, 860, 260, '150,130,255', 0.35);
  // a coffee cup and a folded newspaper in the lamp light
  g.fillStyle = '#d9cfe8'; g.beginPath(); g.roundRect(1180, 780, 70, 76, 10); g.fill();
  g.save(); g.translate(1460, 880); g.rotate(0.12); g.fillStyle = '#e8e2d6'; g.fillRect(-200, -70, 400, 150); g.fillStyle = '#1d1b29'; g.fillRect(-180, -54, 260, 16); g.fillStyle = '#b8b2a6'; for (let i = 0; i < 4; i++) g.fillRect(-180, -20 + i * 22, 360 - (i % 2) * 90, 8); g.restore();
}

// ---------------------------------------------------------------- 3. the red ticker
export function redTicker(g, t, o = {}) {
  g.fillStyle = '#05040f'; g.fillRect(0, 0, W, H);
  // wall of screens
  for (let r = 0; r < 4; r++) for (let c = 0; c < 8; c++) {
    const x = 40 + c * 232, y = 40 + r * 150, w = 220, h = 138, rr = rand(r * 8 + c);
    g.fillStyle = '#0c0a1e'; g.fillRect(x, y, w, h);
    const red = rr() < 0.85;
    g.strokeStyle = red ? 'rgba(255,70,90,0.9)' : 'rgba(118,185,0,0.9)'; g.lineWidth = 3; g.beginPath();
    for (let i = 0; i <= 20; i++) { const u = i / 20, v = 0.3 + rr() * 0.12 + (red ? u * 0.45 : -u * 0.25) + Math.sin(t * 2 + i + c) * 0.01; i ? g.lineTo(x + 10 + u * (w - 20), y + 20 + v * (h - 40)) : g.moveTo(x + 10, y + 20 + v * (h - 40)); }
    g.stroke();
    text(g, red ? `−${(2 + rr() * 8).toFixed(1)}%` : `+${(1 + rr() * 4).toFixed(1)}%`, x + 14, y + 30, { font: 'Jakarta', weight: 800, size: 22, color: red ? '#ff6b7d' : '#9be36a' });
    glow(g, x + w / 2, y + h / 2, 160, red ? '255,60,80' : '118,185,0', 0.08);
  }
  // scrolling ticker band
  g.fillStyle = '#100c22'; g.fillRect(0, 640, W, 60);
  const items = ['NVDA −8.4%', 'NASDAQ −1.0%', 'AMD +4.1%', 'AVGO +3.0%', 'SK HYNIX −3.2%', 'CRWV −6.0%'];
  g.font = '800 30px Jakarta'; let x0 = -((t * 220) % 1400);
  for (let k = 0; k < 4; k++) items.forEach((s) => { const up = s.includes('+'); g.fillStyle = up ? '#9be36a' : '#ff6b7d'; g.fillText(s, x0, 682); x0 += g.measureText(s).width + 70; });
  // floor
  const fl = g.createLinearGradient(0, 700, 0, H); fl.addColorStop(0, '#120e24'); fl.addColorStop(1, '#05040c'); g.fillStyle = fl; g.fillRect(0, 700, W, H - 700);
  // the cracked green chip monolith, and two small rising towers
  const cx = 960, base = 1000;
  const shake = o.shake ? Math.sin(t * 40) * 3 : 0;
  g.save(); g.translate(shake, 0);
  const mg = g.createLinearGradient(cx - 200, 0, cx + 200, 0); mg.addColorStop(0, '#1a2a10'); mg.addColorStop(0.5, '#2d4a12'); mg.addColorStop(1, '#101a08');
  g.fillStyle = mg; g.fillRect(cx - 200, 330, 400, base - 330);
  g.fillStyle = '#3d6a14'; g.beginPath(); g.moveTo(cx - 200, 330); g.lineTo(cx - 160, 300); g.lineTo(cx + 240, 300); g.lineTo(cx + 200, 330); g.closePath(); g.fill();
  g.fillStyle = '#16240c'; g.beginPath(); g.moveTo(cx + 200, 330); g.lineTo(cx + 240, 300); g.lineTo(cx + 240, base - 30); g.lineTo(cx + 200, base); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(118,185,0,0.55)'; g.lineWidth = 3; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(cx - 170, 380 + i * 100); g.lineTo(cx + 170, 380 + i * 100); g.stroke(); }
  glow(g, cx, 600, 420, '118,185,0', 0.22);
  // the crack, glowing red
  g.save(); g.shadowColor = 'rgba(255,60,80,0.9)'; g.shadowBlur = 20; g.strokeStyle = '#ff5c6e'; g.lineWidth = 6; g.lineJoin = 'round';
  g.beginPath(); [[cx + 20, 300], [cx - 30, 420], [cx + 40, 520], [cx - 10, 640], [cx + 30, 760], [cx - 20, 880], [cx + 10, base]].forEach(([a, b], i) => (i ? g.lineTo(a, b) : g.moveTo(a, b))); g.stroke(); g.restore();
  text(g, 'NVDA', cx, 280, { font: 'Jakarta', weight: 800, size: 54, color: '#9be36a', align: 'center' });
  g.restore();
  [[cx - 470, 'AMD +4%', 220], [cx + 480, 'AVGO +3%', 190]].forEach(([x, lab, h]) => { const hh = h + Math.sin(t * 2) * 6, top = base - hh; const tg2 = g.createLinearGradient(0, top, 0, base); tg2.addColorStop(0, '#2a4a20'); tg2.addColorStop(1, '#10200c'); g.fillStyle = tg2; g.fillRect(x - 90, top, 180, hh); g.fillStyle = '#9be36a'; g.fillRect(x - 90, top, 180, 6); text(g, lab, x, top + 50, { font: 'Jakarta', weight: 800, size: 30, color: '#d6ffb8', align: 'center' }); text(g, '▲', x, top + 100, { font: 'Jakarta', weight: 800, size: 40, color: '#9be36a', align: 'center' }); glow(g, x, top, 160, '155,227,106', 0.18); });
  // falling paper (sell orders)
  const r = rand(5); for (let i = 0; i < 26; i++) { const ph = (t * (0.15 + r() * 0.2) + r()) % 1; const x = r() * W + Math.sin(t + i) * 40, y = -40 + ph * 1120; g.save(); g.translate(x, y); g.rotate(t * 2 + i); g.fillStyle = `rgba(240,235,250,${0.7 * (1 - ph * 0.5)})`; g.fillRect(-14, -9, 28, 18); g.restore(); }
  reflect(g, t, 1000, 260, { alpha: 0.35 });
}

// ---------------------------------------------------------------- 4. Washington at night
export function capitol(g, t, o = {}) {
  sky(g, { top: '#05051a', mid: '#141238', horizon: '#2e2650', hy: 860 });
  stars(g, t, { n: 90, maxY: 420, alpha: 0.5 });
  moon(g, 1560, 200, 40);
  clouds(g, t, { y: 230, h: 130, seed: 51, n: 10, scale: 0.8, lx: 1560, ly: 200, speed: 5 });
  // searchlights crossing
  [[300, 1.9], [1620, 1.25], [700, 1.6]].forEach(([x, a], k) => beam(g, t, x, 1000, -Math.PI + a + Math.sin(t * 0.5 + k) * 0.18, { len: 1100, spread: 0.05, color: '220,220,255', alpha: 0.16, motes: 0 }));
  skyline(g, t, { base: 900, seed: 52, depth: 0.2, color: '#1b1840', lit: 0.1, tall: 0.5, fog: 'rgba(80,65,125,0.5)' });
  // the Capitol: lit white dome, drum with columns, wings
  const cx = 960, base = 880;
  glow(g, cx, 560, 520, '200,195,255', 0.16);
  const wing = (x0, w) => { g.fillStyle = '#b4add0'; g.fillRect(x0, base - 160, w, 160); for (let i = 0; i < w / 40; i++) { g.fillStyle = 'rgba(80,70,120,0.35)'; g.fillRect(x0 + 10 + i * 40, base - 140, 12, 130); } g.fillStyle = 'rgba(255,214,150,0.65)'; for (let i = 0; i < w / 80; i++) if (rand(x0 + i)() < 0.5) g.fillRect(x0 + 24 + i * 80, base - 110, 18, 40); };
  wing(cx - 620, 420); wing(cx + 200, 420);
  g.fillStyle = '#bfb8d8'; g.fillRect(cx - 220, base - 260, 440, 260);
  g.beginPath(); g.moveTo(cx - 240, base - 260); g.lineTo(cx, base - 330); g.lineTo(cx + 240, base - 260); g.closePath(); g.fill();
  g.fillStyle = '#c6bfdd'; g.fillRect(cx - 170, base - 470, 340, 150);
  for (let i = 0; i < 12; i++) { g.fillStyle = 'rgba(80,70,120,0.35)'; g.fillRect(cx - 160 + i * 28, base - 460, 10, 130); }
  const dg = g.createRadialGradient(cx - 50, base - 600, 20, cx, base - 520, 220); dg.addColorStop(0, '#e8e4f6'); dg.addColorStop(1, '#9d95bd');
  g.fillStyle = dg; g.beginPath(); g.ellipse(cx, base - 470, 170, 190, 0, Math.PI, Math.PI * 2); g.fill();
  g.fillStyle = '#c6bfdd'; g.fillRect(cx - 24, base - 700, 48, 60); g.beginPath(); g.arc(cx, base - 700, 24, Math.PI, 0); g.fill();
  g.strokeStyle = 'rgba(150,140,190,0.4)'; g.lineWidth = 2; for (let i = -4; i <= 4; i++) { g.beginPath(); g.ellipse(cx, base - 470, Math.abs(i) * 40 || 1, 190, 0, Math.PI, Math.PI * 2); g.stroke(); }
  // steps + plaza
  g.fillStyle = '#c9c2de'; g.beginPath(); g.moveTo(cx - 260, base); g.lineTo(cx + 260, base); g.lineTo(cx + 380, base + 80); g.lineTo(cx - 380, base + 80); g.closePath(); g.fill();
  g.fillStyle = '#0d0b1e'; g.fillRect(0, base + 80, W, H - base - 80);
  mist(g, t, { y: base + 40, h: 180, alpha: 0.28 });
  // a subpoena caught in the wind
  const fp = (t * 0.18) % 1;
  g.save(); g.translate(lerp(200, 1700, fp), 760 - Math.sin(fp * Math.PI) * 360 + Math.sin(t * 3) * 20); g.rotate(Math.sin(t * 2) * 0.6);
  g.fillStyle = '#f3efe6'; g.fillRect(-90, -120, 180, 240); text(g, 'SUBPOENA', 0, -70, { font: "'Playfair Display'", weight: 900, size: 26, color: '#1d1b29', align: 'center' }); g.fillStyle = '#c9c2b6'; for (let i = 0; i < 6; i++) g.fillRect(-70, -40 + i * 26, 140 - (i % 2) * 40, 7);
  g.restore();
  rain(g, t, { n: 500, alpha: 0.35 });
  reflect(g, t, base + 80, 120, { alpha: 0.3 });
}
void ez; void NV; void clamp;
