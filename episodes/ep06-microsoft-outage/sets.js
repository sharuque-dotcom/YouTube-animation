// Episode 6 set pieces (episode-3 template): the server hall, the dead inbox, the outage map,
// before the bell. Pure functions of time t.
import { W, H, clamp, lerp, rand, text } from '../../pipeline/engine.js';
import { sky, stars, clouds, skyline, rain, mist, beam, glow, reflect } from '../../pipeline/scenery.js';
import { cityWindow, darkMap } from '../ep04-deepfake/night.js';

const ez = (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);

// ---------------------------------------------------------------- 1. the server hall
/** Rows of racks receding into mist; status lights flip red from `failAt` (fraction failed = fail) */
export function serverHall(g, t, { fail = 0.3, beaconAt = 0 } = {}) {
  g.fillStyle = '#04050f'; g.fillRect(0, 0, W, H);
  const vx = 960, vy = 470;
  // ceiling light strips converging to the vanishing point (cool key)
  for (let i = 0; i < 9; i++) { const u = i / 8; g.strokeStyle = `rgba(140,180,255,${0.05 + 0.25 * (1 - u)})`; g.lineWidth = lerp(18, 2, u); const y0 = lerp(0, vy - 60, u * 0.95); g.beginPath(); g.moveTo(lerp(0, vx - 40, u), y0); g.lineTo(lerp(W, vx + 40, u), y0); g.stroke(); }
  // floor
  const fg = g.createLinearGradient(0, vy, 0, H); fg.addColorStop(0, '#0a0d1f'); fg.addColorStop(1, '#141a35'); g.fillStyle = fg; g.beginPath(); g.moveTo(0, H); g.lineTo(vx - 60, vy + 20); g.lineTo(vx + 60, vy + 20); g.lineTo(W, H); g.closePath(); g.fill();
  // racks: left and right walls of cabinets in perspective, depth-sorted far → near
  const N = 14, r = rand(5);
  const lights = [];
  for (let k = N - 1; k >= 0; k--) {
    const d0 = k / N, d1 = (k + 1) / N;
    const sc = (d) => Math.pow(1 - d, 1.6);
    for (const side of [-1, 1]) {
      const x0 = vx + side * lerp(60, 940, sc(d1)), x1 = vx + side * lerp(60, 940, sc(d0));
      const top0 = vy - lerp(40, 520, sc(d1)), top1 = vy - lerp(40, 520, sc(d0));
      const bot0 = vy + lerp(20, 600, sc(d1)), bot1 = vy + lerp(20, 600, sc(d0));
      const shade = 0.25 + 0.75 * sc(d0);
      g.fillStyle = `rgba(${Math.round(18 * shade + 6)},${Math.round(22 * shade + 8)},${Math.round(44 * shade + 14)},1)`;
      g.beginPath(); g.moveTo(x0, top0); g.lineTo(x1, top1); g.lineTo(x1, bot1); g.lineTo(x0, bot0); g.closePath(); g.fill();
      g.strokeStyle = `rgba(120,150,255,${0.12 * shade})`; g.lineWidth = 1.5; g.stroke();
      // status lights on this cabinet face
      for (let row = 0; row < 10; row++) for (let col = 0; col < 3; col++) {
        const u = (col + 0.5) / 3, v = (row + 0.6) / 10.5;
        const x = lerp(x0, x1, u), yt = lerp(top0, top1, u), yb = lerp(bot0, bot1, u), y = lerp(yt, yb, v);
        const id = r(), failed = id < fail;
        const blink = (Math.floor(t * (3 + id * 6) + id * 10) % 4) !== 0;
        lights.push([x, y, Math.max(1.2, 3.2 * sc(d0) + 0.6), failed, blink, shade]);
      }
    }
  }
  lights.forEach(([x, y, s, failed, blink, shade]) => { g.fillStyle = failed ? `rgba(255,60,80,${0.95 * shade + 0.05})` : blink ? `rgba(90,200,255,${0.9 * shade + 0.1})` : `rgba(60,120,200,${0.4 * shade})`; g.fillRect(x - s, y - s / 2, s * 2, s); if (failed && shade > 0.4) glow(g, x, y, s * 8, '255,60,80', 0.25); });
  // red beacon over a failing rack, sweeping
  if (t > beaconAt) { const a = (t - beaconAt) * 4; glow(g, 420, 160, 260, '255,40,60', 0.35 + 0.3 * Math.sin(a * 2)); beam(g, t, 420, 160, a, { len: 900, spread: 0.12, color: '255,40,60', alpha: 0.18, motes: 0 }); g.fillStyle = '#ff3b4e'; g.beginPath(); g.arc(420, 160, 16, 0, Math.PI * 2); g.fill(); }
  // vanishing glow + cold mist
  glow(g, vx, vy, 360, '120,170,255', 0.3);
  mist(g, t, { y: 900, h: 220, color: '110,140,220', alpha: 0.22 });
  reflect(g, t, 760, 200, { alpha: 0.18, blur: 6 });
}

// ---------------------------------------------------------------- 2. the dead inbox
export function deadInbox(g, t, { stampAt = 99, spinUntil = 99 } = {}) {
  const wall = g.createLinearGradient(0, 0, W, 0); wall.addColorStop(0, '#0d0a1e'); wall.addColorStop(1, '#17112b'); g.fillStyle = wall; g.fillRect(0, 0, W, H);
  const win = [1240, 80, 560, 480];
  cityWindow(g, t, win, { moonAt: [0.4, 0.25], rainA: 0.45, seed: 60 });
  g.fillStyle = '#1a1430'; g.fillRect(win[0] - 16, win[1] - 16, win[2] + 32, 16); g.fillRect(win[0] - 16, win[1] + win[3], win[2] + 32, 22); g.fillRect(win[0] - 16, win[1], 16, win[3]); g.fillRect(win[0] + win[2], win[1], 16, win[3]); g.fillRect(win[0] + win[2] / 2 - 6, win[1], 12, win[3]);
  const dg = g.createLinearGradient(0, 760, 0, H); dg.addColorStop(0, '#2a2236'); dg.addColorStop(1, '#0e0a16'); g.fillStyle = dg; g.fillRect(0, 760, W, H - 760);
  // laptop
  const lx = 300, ly = 170, lw = 860, lh = 560;
  g.fillStyle = '#0a0812'; g.beginPath(); g.roundRect(lx, ly, lw, lh, 20); g.fill();
  const sx = lx + 18, sy = ly + 18, sw = lw - 36, sh = lh - 50;
  g.fillStyle = '#f2f4f8'; g.fillRect(sx, sy, sw, sh);
  g.fillStyle = '#2b579a'; g.fillRect(sx, sy, sw, 44); text(g, 'Outlook', sx + 18, sy + 30, { font: 'Inter', weight: 600, size: 20, color: '#fff' });
  g.fillStyle = '#e6e9f0'; g.fillRect(sx, sy + 44, 200, sh - 44);
  ['Inbox', 'Calendar', 'Sent', 'Drafts'].forEach((l, i) => text(g, l, sx + 20, sy + 86 + i * 40, { font: 'Inter', weight: 600, size: 18, color: '#3a3f4a' }));
  for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(200,205,215,0.5)'; g.fillRect(sx + 220, sy + 70 + i * 70, sw - 240, 54); }
  // the spinner, then "can't connect"
  const cx = sx + sw / 2 + 100, cy = sy + sh / 2;
  g.fillStyle = 'rgba(242,244,248,0.85)'; g.fillRect(sx + 200, sy + 44, sw - 200, sh - 44);
  if (t < spinUntil) { g.strokeStyle = '#2b579a'; g.lineWidth = 8; g.lineCap = 'round'; g.beginPath(); g.arc(cx, cy - 20, 40, t * 6, t * 6 + 4.2); g.stroke(); text(g, 'Trying to connect…', cx, cy + 60, { font: 'Inter', weight: 600, size: 24, color: '#3a3f4a', align: 'center' }); }
  else { text(g, '⚠', cx, cy - 10, { font: 'Inter', weight: 600, size: 70, color: '#c0392b', align: 'center' }); text(g, 'Can’t connect to the server', cx, cy + 50, { font: 'Inter', weight: 600, size: 26, color: '#1d1f24', align: 'center' }); text(g, 'Try again later', cx, cy + 86, { font: 'Inter', weight: 400, size: 20, color: '#5a5f6a', align: 'center' }); }
  glow(g, lx + lw / 2, ly + lh / 2, 700, '170,190,255', 0.18);
  g.fillStyle = '#2a2440'; g.beginPath(); g.moveTo(lx - 60, ly + lh); g.lineTo(lx + lw + 60, ly + lh); g.lineTo(lx + lw + 20, ly + lh + 34); g.lineTo(lx - 20, ly + lh + 34); g.closePath(); g.fill();
  // a meeting invite card on the desk, stamped
  g.save(); g.translate(1450, 860); g.rotate(-0.05);
  g.shadowColor = 'rgba(0,0,0,0.5)'; g.shadowBlur = 20; g.fillStyle = '#ffffff'; g.fillRect(-230, -110, 460, 220); g.shadowColor = 'transparent';
  g.fillStyle = '#2b579a'; g.fillRect(-230, -110, 10, 220);
  text(g, 'Meeting: Q4 planning', -200, -60, { font: 'Inter', weight: 600, size: 26, color: '#1d1f24' });
  text(g, 'Fri 9:00 – 9:30 · Teams', -200, -22, { font: 'Inter', weight: 400, size: 20, color: '#5a5f6a' });
  ['Send', 'Reschedule', 'Cancel'].forEach((b2, i) => { g.fillStyle = '#e6e9f0'; g.beginPath(); g.roundRect(-200 + i * 140, 20, 128, 44, 8); g.fill(); text(g, b2, -136 + i * 140, 49, { font: 'Inter', weight: 600, size: 18, color: '#9aa0aa', align: 'center' }); });
  g.restore();
  if (t > stampAt) { const sp = clamp((t - stampAt) / 0.1); g.save(); g.translate(1470, 860); g.rotate(-0.15); const s = lerp(2.2, 1, sp * sp * sp); g.scale(s, s); g.globalAlpha = 0.92 * sp; g.strokeStyle = '#e2412e'; g.lineWidth = 8; g.beginPath(); g.roundRect(-200, -50, 400, 100, 14); g.stroke(); text(g, 'COULDN’T SAVE', 0, 18, { font: 'Jakarta', weight: 800, size: 46, color: '#e2412e', align: 'center' }); g.restore(); }
}

// ---------------------------------------------------------------- 3. the outage map
export function outageMap(g, t, { start = 0, dur = 3, n = 140 } = {}) {
  const proj = darkMap(g, t, 10, 25, 5.0);
  const r = rand(23);
  const hubs = [[-74, 40.7], [-87.6, 41.9], [-118, 34], [-97.7, 30.3], [-0.1, 51.5], [2.3, 48.9], [13.4, 52.5], [4.9, 52.4], [139.7, 35.7], [77.2, 28.6], [72.8, 19.1], [151.2, -33.9], [103.8, 1.35], [121.5, 25], [-46.6, -23.5], [18.4, -33.9], [55.3, 25.2], [37.6, 55.8], [126.9, 37.5], [-79.4, 43.7]];
  for (let i = 0; i < n; i++) {
    const h = hubs[i % hubs.length], ll = [h[0] + (r() - 0.5) * 18, h[1] + (r() - 0.5) * 12], a0 = start + (i / n) * dur + r() * 0.3;
    if (t < a0) continue;
    const [x, y] = proj(ll), ph = ((t - a0) * 0.8) % 1;
    glow(g, x, y, 26, '255,70,90', 0.55);
    g.strokeStyle = `rgba(255,90,110,${0.6 * (1 - ph)})`; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 6 + ph * 40, 0, Math.PI * 2); g.stroke();
    g.fillStyle = '#ffc2cb'; g.beginPath(); g.arc(x, y, 3, 0, Math.PI * 2); g.fill();
  }
  return proj;
}

// ---------------------------------------------------------------- 4. before the bell
export function beforeBell(g, t, { clock = 7.5, pct = 2.8 } = {}) {
  sky(g, { top: '#141235', mid: '#4a3060', horizon: '#ffb07a', glow: 'rgba(255,170,110,0.45)', hy: 760 });
  glow(g, 1700, 760, 700, '255,190,120', 0.45);
  clouds(g, t, { y: 200, h: 110, seed: 91, n: 9, scale: 0.7, body: '#5a3a6a', shade: '#3a2550', rim: 'rgba(255,200,150,0.85)', lx: 1700, ly: 760, speed: 4, speckle: false });
  skyline(g, t, { base: 840, seed: 92, depth: 0.3, color: '#2a1d40', lit: 0.25, tall: 1.4, fog: 'rgba(255,170,130,0.3)' });
  // the exchange façade: pediment, columns, a flag, a big clock
  const cx = 960, base = 940;
  const fgr = g.createLinearGradient(cx - 520, 0, cx + 520, 0); fgr.addColorStop(0, '#6e6888'); fgr.addColorStop(0.75, '#8f87a8'); fgr.addColorStop(1, '#c9a58e'); g.fillStyle = fgr; g.fillRect(cx - 520, base - 470, 1040, 470);
  g.fillStyle = '#857d9e'; g.beginPath(); g.moveTo(cx - 560, base - 470); g.lineTo(cx, base - 600); g.lineTo(cx + 560, base - 470); g.closePath(); g.fill(); g.strokeStyle = 'rgba(255,200,150,0.6)'; g.lineWidth = 3; g.beginPath(); g.moveTo(cx, base - 600); g.lineTo(cx + 560, base - 470); g.stroke();
  for (let i = 0; i < 6; i++) { const x = cx - 430 + i * 172; const cg = g.createLinearGradient(x - 30, 0, x + 30, 0); cg.addColorStop(0, '#5e587a'); cg.addColorStop(0.55, '#b4acc8'); cg.addColorStop(1, '#e8b89a'); g.fillStyle = cg; g.fillRect(x - 32, base - 430, 64, 420); }
  g.fillStyle = '#7a7294'; g.fillRect(cx - 540, base - 490, 1080, 30); g.fillStyle = 'rgba(30,24,50,0.55)'; g.fillRect(cx - 520, base - 40, 1040, 40);
  for (let i = 0; i < 5; i++) { g.fillStyle = 'rgba(255,200,140,0.55)'; g.fillRect(cx - 360 + i * 172, base - 230, 40, 70); }
  g.fillStyle = 'rgba(255,190,130,0.5)'; g.fillRect(cx + 505, base - 470, 15, 470);
  g.strokeStyle = '#cfc8de'; g.lineWidth = 6; g.beginPath(); g.moveTo(cx, base - 600); g.lineTo(cx, base - 720); g.stroke();
  const fw = Math.sin(t * 4) * 6; g.fillStyle = '#b22234'; g.fillRect(cx, base - 720, 130, 70); g.fillStyle = '#fff'; for (let i = 1; i < 7; i += 2) g.fillRect(cx, base - 720 + i * 10 + fw * 0.1, 130, 10); g.fillStyle = '#3c3b6e'; g.fillRect(cx, base - 720, 56, 40);
  // clock
  g.fillStyle = '#f7f1e6'; g.beginPath(); g.arc(cx, base - 520, 54, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#2a2440'; g.lineWidth = 5; g.stroke();
  const hh = (clock / 12) * Math.PI * 2 - Math.PI / 2, mm = ((clock % 1) * Math.PI * 2) - Math.PI / 2;
  g.lineCap = 'round'; g.lineWidth = 6; g.beginPath(); g.moveTo(cx, base - 520); g.lineTo(cx + Math.cos(hh) * 28, base - 520 + Math.sin(hh) * 28); g.stroke(); g.lineWidth = 4; g.beginPath(); g.moveTo(cx, base - 520); g.lineTo(cx + Math.cos(mm) * 42, base - 520 + Math.sin(mm) * 42); g.stroke();
  // street + ticker band
  g.fillStyle = '#1d1630'; g.fillRect(0, base, W, H - base);
  g.fillStyle = '#0c0a1c'; g.fillRect(0, 980, W, 70);
  const items = [`MSFT −${pct.toFixed(1)}%  PRE-MARKET`, 'NASDAQ FUT ≈ 0.0%', 'OUTLOOK · TEAMS · 365 DOWN', `MSFT ~$508`];
  g.font = '800 34px Jakarta'; let x0 = -((t * 200) % 1600);
  for (let k = 0; k < 4; k++) items.forEach((s) => { g.fillStyle = s.startsWith('MSFT −') ? '#ff6b7d' : s.startsWith('NASDAQ') ? '#cfc6ff' : s.startsWith('OUTLOOK') ? '#ffc93c' : '#ff6b7d'; g.fillText(s, x0, 1028); x0 += g.measureText(s).width + 90; });
  glow(g, 300, 1015, 300, '255,80,100', 0.2);
  reflect(g, t, base, 60, { alpha: 0.3 });
}
void ez; void stars; void rain; void beam;
