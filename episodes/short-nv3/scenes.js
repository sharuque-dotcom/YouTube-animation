// Short: "Three women, four days" (Nvidia). Shorts-first style: native 9:16, real photo cut-outs relit,
// kinetic word captions, zoom-punch cuts with built flashes, slams and shake. Safe zones: visuals 220-1300,
// captions ~1400, bottom 1600+ left to the YouTube UI.
import { W, H, clamp, lerp, rand, text } from '../../pipeline/engine.js';
import { glow, beam, buf, nightFinish } from '../../pipeline/scenery.js';
import { ez, out3, span, spring } from '../../pipeline/scenekit.js';
import { mask } from '../ep07-nvidia-part3/sets.js';

const INK = '#ffffff', GOLD = '#ffd23c', RED = '#ff3b4e', GREEN = '#76b900', LAV = '#c3b2ff';
const IMG = {};
export async function preload() {
  for (const n of ['007', '009', '036']) IMG[n] = await createImageBitmap(await (await fetch(`/episodes/short-nv3/photos/jensen-${n}-cut.png`)).blob());
}

// ---------------------------------------------------------------- timing helpers
const lineAt = (s, i) => s.cue(i);                     // line i start (0-based)
function wordTimes(s, i) {
  const str = s.line(i), a = s.cue(i), b = s.cueEnd(i), ws = str.split(/\s+/);
  const tot = ws.reduce((x, w) => x + w.length + 1.5, 0); let acc = 0;
  return ws.map((w) => { const t0 = a + (acc / tot) * (b - a); acc += w.length + 1.5; return [w, t0]; });
}
function wordT(s, i, word) { const f = wordTimes(s, i).find(([w]) => w.toLowerCase().replace(/[^a-z0-9-]/g, '').startsWith(word)); return f ? f[1] : s.cue(i); }
const pulse = (t, a, up = 0.27, down = 0.33) => (t < a - up || t > a + down ? 0 : t < a ? ez((t - (a - up)) / up) : 1 - ez((t - a) / down));

// ---------------------------------------------------------------- look
function bg(g, t, { top = '#0b0720', bot = '#1d0b2e', accent = '120,80,255', seed = 1 } = {}) {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, top); gr.addColorStop(1, bot); g.fillStyle = gr; g.fillRect(-200, -300, W + 400, H + 600);
  glow(g, W * 0.5, H * 0.45, 1000, accent, 0.3);
  // depth-scaled bokeh: far = small, slow, dim; near = big, faster, soft
  const r = rand(seed);
  for (let i = 0; i < 46; i++) { const d = r(), x = (r() * W + t * lerp(6, 40, d) * (r() < 0.5 ? -1 : 1) + W * 10) % W, y = (r() * H - t * lerp(4, 30, d) + H * 10) % H, rad = lerp(3, 26, d * d);
    g.fillStyle = `rgba(${accent},${lerp(0.08, 0.18, d)})`; g.beginPath(); g.arc(x, y, rad, 0, Math.PI * 2); g.fill(); }
  // light sweep
  const sx = ((t * 0.18) % 1.6 - 0.3) * W; const sg = g.createLinearGradient(sx - 300, 0, sx + 300, H * 0.4); sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(0.5, 'rgba(255,255,255,0.035)'); sg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = sg; g.fillRect(0, 0, W, H);
}
/** A cut-out photo, relit: warm key from the left, cool fill, coloured rim light on the right edge, grain-safe. */
function photo(g, img, cx, base, h, { rim = '160,120,255', sat = 1, key = 0.18, dark = 0, crack = 0 } = {}) {
  const w = (img.width / img.height) * h;
  const [c, cg] = buf('ph', Math.ceil(w), Math.ceil(h));
  cg.filter = `saturate(${sat}) contrast(1.08)`; cg.drawImage(img, 0, 0, w, h); cg.filter = 'none';
  cg.globalCompositeOperation = 'source-atop';
  const kg = cg.createLinearGradient(0, 0, w, 0); kg.addColorStop(0, `rgba(255,190,140,${key})`); kg.addColorStop(0.6, 'rgba(255,190,140,0)'); kg.addColorStop(1, 'rgba(60,40,140,0.28)'); cg.fillStyle = kg; cg.fillRect(0, 0, w, h);
  if (dark) { cg.fillStyle = `rgba(8,4,20,${dark})`; cg.fillRect(0, 0, w, h); }
  // silhouette for the rim
  const [m, mg] = buf('phrim', Math.ceil(w), Math.ceil(h)); mg.drawImage(img, 0, 0, w, h); mg.globalCompositeOperation = 'source-in'; mg.fillStyle = `rgb(${rim})`; mg.fillRect(0, 0, w, h);
  const fade = (cx2) => { cx2.globalCompositeOperation = 'destination-out'; const fo = cx2.createLinearGradient(0, h - 320, 0, h); fo.addColorStop(0, 'rgba(0,0,0,0)'); fo.addColorStop(1, 'rgba(0,0,0,1)'); cx2.fillStyle = fo; cx2.fillRect(0, h - 320, w, 320); };
  fade(cg); fade(mg);
  const x0 = cx - w / 2, y0 = base - h;
  g.save(); g.filter = 'blur(26px)'; g.globalAlpha = 0.55; g.drawImage(m, x0, y0); g.filter = 'none'; g.globalAlpha = 0.9; g.drawImage(m, x0 + 7, y0 - 3); g.globalAlpha = 1; g.drawImage(c, x0, y0); g.restore();
  if (crack > 0) cracks(g, cx + 40, y0 + h * 0.3, crack);
}
function cracks(g, x, y, p) {
  const r = rand(77); g.save(); g.strokeStyle = `rgba(255,255,255,${0.85 * p})`; g.lineWidth = 3;
  for (let k = 0; k < 9; k++) { let a = (k / 9) * Math.PI * 2 + r() * 0.4, px = x, py = y; g.beginPath(); g.moveTo(px, py); const n = 5 + Math.floor(r() * 4); for (let i = 0; i < n * p; i++) { a += (r() - 0.5) * 0.6; const l = 40 + r() * 70; px += Math.cos(a) * l; py += Math.sin(a) * l; g.lineTo(px, py); } g.stroke(); }
  g.restore(); glow(g, x, y, 120, '255,255,255', 0.3 * p);
}
function slam(g, t, a, x, y, draw, { from = 2.2, rot = 0 } = {}) {
  if (t < a - 0.12) return; const p = clamp((t - (a - 0.12)) / 0.12), sc = lerp(from, 1, p * p * p);
  const wob = t > a ? Math.exp(-(t - a) * 8) * Math.sin((t - a) * 34) * 0.05 : 0;
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(sc + wob, sc + wob); g.globalAlpha = Math.min(1, p * 1.5); draw(g); g.restore();
}
function big(g, str, x, y, { size = 170, color = INK, stroke = true, glowC = null, align = 'center', spacing = 0 } = {}) {
  g.save(); if (glowC) { g.shadowColor = glowC; g.shadowBlur = 40; }
  if (stroke) { g.font = `800 ${size}px Jakarta`; g.textAlign = align; g.lineJoin = 'round'; g.strokeStyle = 'rgba(0,0,0,0.75)'; g.lineWidth = size * 0.12; g.strokeText(str, x, y); }
  text(g, str, x, y, { font: 'Jakarta', weight: 800, size, color, align, spacing }); g.restore();
}
function dayTile(g, t, a, day, x = W / 2, y = 360) {
  slam(g, t, a, x, y, (gg) => {
    gg.shadowColor = 'rgba(0,0,0,0.6)'; gg.shadowBlur = 30; gg.fillStyle = '#1a1230'; gg.beginPath(); gg.roundRect(-150, -120, 300, 240, 30); gg.fill(); gg.shadowColor = 'transparent';
    gg.fillStyle = RED; gg.beginPath(); gg.roundRect(-150, -120, 300, 78, [30, 30, 0, 0]); gg.fill();
    text(gg, day, 0, -66, { font: 'Jakarta', weight: 800, size: 46, color: '#fff', align: 'center', spacing: 8 });
    text(gg, { SUN: '8', WED: '11', THU: '12' }[day], 0, 90, { font: 'Jakarta', weight: 800, size: 120, color: '#fff', align: 'center' });
  });
}
function strike(g, t, a, cx, cy, r = 300) {
  const p = ez(span(t, a, 0.18)), q = ez(span(t, a + 0.1, 0.18)); if (p <= 0) return;
  g.save(); g.strokeStyle = RED; g.lineCap = 'round'; g.lineWidth = 34; g.shadowColor = RED; g.shadowBlur = 30;
  g.beginPath(); g.moveTo(cx - r, cy - r); g.lineTo(cx - r + 2 * r * p, cy - r + 2 * r * p); g.stroke();
  if (q > 0) { g.beginPath(); g.moveTo(cx + r, cy - r); g.lineTo(cx + r - 2 * r * q, cy - r + 2 * r * q); g.stroke(); } g.restore();
}
function chipIcon(g, t) {
  glow(g, 0, 0, 420, '118,185,0', 0.5);
  g.fillStyle = '#0c1a08'; g.beginPath(); g.roundRect(-230, -230, 460, 460, 40); g.fill();
  g.fillStyle = '#b8c0a8'; for (let i = -5; i <= 5; i++) { g.fillRect(i * 38 - 8, -280, 16, 50); g.fillRect(i * 38 - 8, 230, 16, 50); g.fillRect(-280, i * 38 - 8, 50, 16); g.fillRect(230, i * 38 - 8, 50, 16); }
  const cg = g.createLinearGradient(-160, -160, 160, 160); cg.addColorStop(0, '#2a3a20'); cg.addColorStop(0.5, '#4a6a2a'); cg.addColorStop(1, '#1a2a12'); g.fillStyle = cg; g.beginPath(); g.roundRect(-160, -160, 320, 320, 20); g.fill();
  g.strokeStyle = GREEN; g.lineWidth = 6; g.beginPath(); g.roundRect(-160, -160, 320, 320, 20); g.stroke();
  for (let i = 0; i < 8; i++) { g.strokeStyle = `rgba(118,185,0,${0.3 + 0.3 * Math.sin(t * 6 + i)})`; g.lineWidth = 3; g.beginPath(); g.moveTo(-120, -110 + i * 30); g.lineTo(120, -110 + i * 30); g.stroke(); }
}
function cashIcon(g, t) {
  glow(g, 0, 0, 420, '80,220,120', 0.35);
  for (let k = 0; k < 7; k++) { g.save(); g.translate(Math.sin(k * 1.7) * 14, 120 - k * 34); g.rotate(Math.sin(k * 2.3) * 0.05); g.fillStyle = '#1f7a45'; g.fillRect(-250, -60, 500, 120); g.strokeStyle = '#7dffb0'; g.lineWidth = 4; g.strokeRect(-236, -46, 472, 92); text(g, '$', 0, 30, { font: 'Jakarta', weight: 800, size: 80, color: '#bfffd6', align: 'center' }); g.restore(); }
}
function radar(g, t, x, y, r) {
  g.save(); g.strokeStyle = 'rgba(255,60,80,0.5)'; g.lineWidth = 3; for (let k = 1; k <= 3; k++) { g.beginPath(); g.arc(x, y, (r * k) / 3, 0, Math.PI * 2); g.stroke(); }
  g.beginPath(); g.moveTo(x - r, y); g.lineTo(x + r, y); g.moveTo(x, y - r); g.lineTo(x, y + r); g.stroke();
  const a = t * 2.4; const sg = g.createConicGradient ? g.createConicGradient(a, x, y) : null;
  if (sg) { sg.addColorStop(0, 'rgba(255,60,80,0.45)'); sg.addColorStop(0.12, 'rgba(255,60,80,0)'); sg.addColorStop(1, 'rgba(255,60,80,0)'); g.fillStyle = sg; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
  // reticle corners
  g.strokeStyle = RED; g.lineWidth = 8; const q = r * 0.55; [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sy]) => { g.beginPath(); g.moveTo(x + sx * q, y + sy * q * 0.6); g.lineTo(x + sx * q, y + sy * q); g.lineTo(x + sx * q * 0.6, y + sy * q); g.stroke(); });
  g.restore();
}
function tag(g, t, a, str, y, { color = '#fff', fill = 'rgba(12,8,28,0.85)', size = 40 } = {}) {
  const p = spring(t, a, 1.9, 0.6); if (p <= 0.01) return;
  g.save(); g.font = `800 ${size}px Jakarta`; const w = g.measureText(str).width + 60; g.translate(W / 2, y); g.scale(Math.min(1, p), Math.min(1, p));
  g.fillStyle = fill; g.beginPath(); g.roundRect(-w / 2, -size, w, size * 2, size); g.fill(); g.strokeStyle = 'rgba(255,255,255,0.25)'; g.lineWidth = 2; g.stroke();
  text(g, str, 0, size * 0.36, { font: 'Jakarta', weight: 800, size, color, align: 'center' }); g.restore();
}
function phoneMsg(g, t, a) {
  slam(g, t, a, 640, 860, (gg) => {
    gg.rotate(0.05); gg.fillStyle = '#0b0912'; gg.beginPath(); gg.roundRect(-230, -420, 460, 840, 60); gg.fill(); gg.strokeStyle = 'rgba(255,255,255,0.3)'; gg.lineWidth = 3; gg.stroke();
    gg.fillStyle = '#f3f1f8'; gg.beginPath(); gg.roundRect(-210, -400, 420, 800, 46); gg.fill();
    text(gg, 'To: All employees', -170, -320, { font: 'Inter', weight: 600, size: 26, color: '#6a6680' });
    gg.fillStyle = '#d9d5e6'; for (let i = 0; i < 6; i++) gg.fillRect(-170, -270 + i * 40, 340 - (i % 3) * 60, 14);
    gg.fillStyle = 'rgba(255,210,60,0.55)'; gg.fillRect(-180, 30, 360, 150);
    text(gg, '“I have fallen', 0, 90, { font: 'Jakarta', weight: 800, size: 40, color: '#1d1530', align: 'center' }); text(gg, 'short…”', 0, 145, { font: 'Jakarta', weight: 800, size: 40, color: '#1d1530', align: 'center' });
  }, { from: 1.6, rot: 0 });
}
function orgLine(g, t, a) {
  // CEO face node -> executive node; the line burns red
  const p = ez(span(t, a, 0.8));
  g.save(); g.strokeStyle = RED; g.lineWidth = 10; g.shadowColor = RED; g.shadowBlur = 24; g.beginPath(); g.moveTo(540, 470); g.lineTo(540, 470 + 330 * p); g.stroke(); g.restore();
  g.save(); g.beginPath(); g.arc(540, 380, 110, 0, Math.PI * 2); g.fillStyle = '#1a1230'; g.fill(); g.clip(); const img = IMG['009']; const h = 520, w = (img.width / img.height) * h; g.drawImage(img, 540 - w / 2 + 10, 380 - 150, w, h); g.restore();
  g.strokeStyle = '#fff'; g.lineWidth = 6; g.beginPath(); g.arc(540, 380, 110, 0, Math.PI * 2); g.stroke();
  text(g, 'CEO', 540, 270 - 10, { font: 'Jakarta', weight: 800, size: 36, color: '#fff', align: 'center' });
}

// ---------------------------------------------------------------- captions (big, word by word)
/** content is designed in 220-1330; place it larger and lower so the frame is filled down to the captions */
function frame(g) { g.translate(W / 2, H / 2 + 110); g.scale(1.1, 1.1); g.translate(-W / 2, -H / 2); }
const HOT = /^(three|women|chips|money|affair|second|third|resignation|unnamed|fourteen|percent|thirty-three|four|days|china|intelligence)/i;
function captions(g, s) {
  const t = s.t; let li = -1; for (let i = 0; s.line(i); i++) if (t >= s.cue(i) - 0.05 && t < s.cueEnd(i) + 0.1) li = i;
  if (li < 0) return;
  const ws = wordTimes(s, li); const chunks = []; for (let i = 0; i < ws.length; i += 3) chunks.push(ws.slice(i, i + 3));
  let k = 0; while (k + 1 < chunks.length && t >= chunks[k + 1][0][1]) k++;
  const ch = chunks[k]; g.save(); g.font = '800 84px Jakarta';
  const widths = ch.map(([w]) => g.measureText(w.toUpperCase()).width), total = widths.reduce((a, b) => a + b, 0) + 26 * (ch.length - 1);
  const sc = Math.min(1, 960 / total); let x = W / 2 - (total * sc) / 2;
  ch.forEach(([w, t0], j) => { const p = clamp((t - t0) / 0.1), cur = t >= t0 && (j === ch.length - 1 || t < ch[j + 1][1]);
    const col = HOT.test(w.replace(/[^a-z-]/gi, '')) ? (cur ? RED : '#ff8a96') : cur ? GOLD : '#fff';
    const ww = widths[j] * sc; g.save(); g.translate(x + ww / 2, 1590); const z = lerp(0.6, 1, out3(p)) * (cur ? 1.08 : 1); g.scale(z * sc, z * sc); g.globalAlpha = 0.35 + 0.65 * p;
    big(g, w.toUpperCase(), 0, 0, { size: 84, color: col }); g.restore(); x += ww + 26 * sc; });
  g.restore();
}

// ---------------------------------------------------------------- the beats
function main(g, s) {
  const t = s.t, L = (i) => lineAt(s, i);
  const cuts = [L(1), L(2), L(3), L(4), L(5), L(6), L(7), L(8), L(9), L(10)];
  let i = 0; while (i < cuts.length && t >= cuts[i] - 0.02) i++;
  const since = i ? t - cuts[i - 1] : t;
  // zoom punch on every cut + small shake on impacts
  const punch = 1 + 0.1 * Math.exp(-since * 9);
  const shakeA = [2, 3, 7, 9].includes(i) ? Math.exp(-since * 6) * 14 : 0;
  g.save(); g.translate(W / 2 + Math.sin(t * 61) * shakeA, H / 2 + Math.cos(t * 53) * shakeA); g.scale(punch, punch); g.translate(-W / 2, -H / 2); frame(g);
  const B = [
    () => { // 0: he lost the company
      bg(g, t, { accent: '118,185,0', seed: 1 });
      const lost = wordT(s, 0, 'lost'); const red = ez(span(t, lost, 0.4));
      g.save(); g.globalAlpha = 0.16 + 0.1 * Math.sin(t * 2); big(g, 'NVIDIA', W / 2, 640, { size: 300, color: red > 0.5 ? '#ff6a78' : '#9be05a', stroke: false }); g.restore();
      photo(g, IMG['009'], W / 2 + 20, 1330, 1150 * (1 + t * 0.012), { rim: red > 0.5 ? '255,70,90' : '118,185,0', sat: 1 - 0.5 * red });
      const yrs = Math.round(33 * out3(span(t, wordT(s, 0, 'thirty-three') - 0.2, 0.9)));
      if (yrs > 0) slam(g, t, wordT(s, 0, 'thirty-three') - 0.2, W / 2, 330, (gg) => { big(gg, `${yrs} YEARS`, 0, 0, { size: 130, color: GOLD, glowC: 'rgba(255,200,60,0.6)' }); });
      if (red > 0) slam(g, t, lost, W / 2, 1060, (gg) => { gg.rotate(-0.1); gg.strokeStyle = RED; gg.lineWidth = 12; gg.beginPath(); gg.roundRect(-300, -80, 600, 160, 22); gg.stroke(); big(gg, 'LOST IT', 0, 46, { size: 120, color: RED, stroke: false }); }, { from: 2.4 });
    },
    () => { bg(g, t, { accent: '118,185,0', seed: 2 }); slam(g, t, L(1), W / 2, 820, (gg) => chipIcon(gg, t), { from: 1.6 }); big(g, 'CHIPS', W / 2, 360, { size: 160, color: '#b6f070' }); strike(g, t, L(1) + 0.45, W / 2, 820, 330); },
    () => { bg(g, t, { accent: '80,220,120', seed: 3 }); slam(g, t, L(2), W / 2, 860, (gg) => cashIcon(gg, t), { from: 1.6 }); big(g, 'MONEY', W / 2, 360, { size: 160, color: '#9dffc4' }); strike(g, t, L(2) + 0.45, W / 2, 820, 330); },
    () => { // 3 women
      bg(g, t, { top: '#1a0614', bot: '#2a0818', accent: '255,60,90', seed: 4 });
      const hb = 1 + 0.06 * Math.max(0, Math.sin((t - L(3)) * 8)) * Math.exp(-(t - L(3)) * 1.2);
      [[300, 780], [780, 780], [540, 1080]].forEach(([x, y], k) => slam(g, t, L(3) + k * 0.22, x, y, (gg) => { gg.scale(hb, hb); glow(gg, 0, 0, 260, '255,60,90', 0.4); mask(gg, t, 0, 0, 1.15, { blank: k === 2, lit: 1, feather: k ? '#3a2a7a' : '#7a1d4a' }); }, { from: 1.9 }));
      slam(g, t, wordT(s, 3, 'three'), W / 2, 380, (gg) => big(gg, '3 WOMEN', 0, 0, { size: 150, color: '#fff', glowC: 'rgba(255,60,90,0.8)' }));
    },
    () => { // Sunday: he admits
      bg(g, t, { accent: '255,170,90', seed: 5 }); photo(g, IMG['036'], 330, 1330, 980, { rim: '255,170,90', sat: 0.85 });
      phoneMsg(g, t, wordT(s, 4, 'admits') - 0.1); dayTile(g, t, L(4), 'SUN', 800, 340);
    },
    () => { // US intelligence suspected (per NYT)
      bg(g, t, { top: '#140410', bot: '#22060e', accent: '255,40,70', seed: 6 });
      g.save(); g.globalAlpha = 0.15; for (let y = 0; y < H; y += 6) { g.fillStyle = '#ff2a4a'; g.fillRect(0, y, W, 1); } g.restore();
      mask(g, t, W / 2, 800, 1.6, { lit: 1, feather: '#7a1d4a' }); radar(g, t, W / 2, 790, 380);
      tag(g, t, wordT(s, 5, 'suspected'), 'SUSPECTED BY US INTELLIGENCE', 330, { color: '#ff8a96', size: 42 });
      tag(g, t, L(5) + 0.2, 'per The New York Times', 1210, { size: 32, color: LAV });
    },
    () => { // Wednesday: second relationship, reported directly to him
      bg(g, t, { accent: '170,120,255', seed: 7 }); dayTile(g, t, L(6), 'WED', 870, 230);
      orgLine(g, t, wordT(s, 6, 'second')); slam(g, t, wordT(s, 6, 'second') + 0.5, 540, 960, (gg) => { glow(gg, 0, 0, 240, '255,60,90', 0.35); mask(gg, t, 0, 0, 1.05, { lit: 1, feather: '#3a2a7a', tint: '#f6e7d8' }); });
      tag(g, t, wordT(s, 6, 'executive'), 'AN EXECUTIVE WHO REPORTED TO HIM', 1180, { size: 36, color: GOLD });
    },
    () => { // That night: resignation
      bg(g, t, { top: '#05040c', bot: '#120a1e', accent: '200,200,255', seed: 8 });
      const at = wordT(s, 7, 'resignation'); const gone = ez(span(t, at, 0.5));
      beam(g, t, W / 2, -60, Math.PI / 2, { len: 1400, spread: 0.16, color: '230,230,255', alpha: 0.3, motes: 50 });
      photo(g, IMG['007'], W / 2, 1330, 1150, { rim: '200,200,255', sat: 1 - gone, dark: 0.25 * gone, crack: gone });
      slam(g, t, at, W / 2, 760, (gg) => { gg.rotate(-0.12); gg.strokeStyle = RED; gg.lineWidth = 14; gg.beginPath(); gg.roundRect(-380, -90, 760, 180, 24); gg.stroke(); big(gg, 'RESIGNED', 0, 50, { size: 130, color: RED, stroke: false }); }, { from: 2.6 });
      tag(g, t, L(7) + 0.1, 'WEDNESDAY NIGHT · THE BOARD', 300, { size: 36 });
    },
    () => { // Thursday: a third, unnamed
      bg(g, t, { top: '#04060f', bot: '#0b1024', accent: '150,170,255', seed: 9 }); dayTile(g, t, L(8), 'THU', W / 2, 260);
      beam(g, t, W / 2, 300, Math.PI / 2, { len: 900, spread: 0.18, color: '200,210,255', alpha: 0.35, motes: 40 });
      slam(g, t, wordT(s, 8, 'third'), W / 2, 820, (gg) => mask(gg, t, 0, 0, 1.6, { blank: true, lit: 1 }), { from: 1.7 });
      const un = wordT(s, 8, 'unnamed'); if (t > un - 0.1) { const n = Math.floor(clamp((t - un + 0.1) / 0.5) * 13); tag(g, t, un - 0.1, 'STILL UNNAMED'.slice(0, Math.max(1, n)), 1180, { size: 46, color: '#c8d2ff' }); }
      tag(g, t, wordT(s, 8, 'reuters'), 'REUTERS · 2 SOURCES', 480, { size: 34, color: LAV });
    },
    () => { // -14%
      bg(g, t, { top: '#1a0408', bot: '#2a060c', accent: '255,40,60', seed: 10 });
      const p = ez(span(t, L(9), 0.9)); g.save(); g.strokeStyle = RED; g.lineWidth = 14; g.shadowColor = RED; g.shadowBlur = 30; g.lineJoin = 'round'; g.beginPath();
      for (let k = 0; k <= 60 * p; k++) { const u = k / 60, x = 80 + u * 920, y = 520 + (u < 0.35 ? Math.sin(u * 40) * 20 : (u - 0.35) * 900) + Math.sin(k * 3.1) * 14; k ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); g.restore();
      slam(g, t, wordT(s, 9, 'fourteen'), W / 2, 1000, (gg) => big(gg, '−14%', 0, 0, { size: 280, color: RED, glowC: 'rgba(255,40,60,0.9)' }), { from: 2.4 });
      tag(g, t, L(9) + 0.1, 'NVIDIA STOCK · AT THE OPEN', 320, { size: 38 });
    },
    () => { // 33 years. 4 days.
      bg(g, t, { accent: '255,200,60', seed: 11 });
      g.save(); g.globalAlpha = 0.5; photo(g, IMG['009'], W / 2, 1330, 1100, { rim: '255,200,60', sat: 0.2, dark: 0.35 }); g.restore();
      slam(g, t, L(10), W / 2, 520, (gg) => big(gg, '33 YEARS', 0, 0, { size: 170, color: GOLD, glowC: 'rgba(255,200,60,0.7)' }));
      slam(g, t, wordT(s, 10, 'four'), W / 2, 820, (gg) => big(gg, '4 DAYS', 0, 0, { size: 210, color: RED, glowC: 'rgba(255,40,60,0.8)' }), { from: 2.8 });
    },
  ];
  B[Math.min(i, B.length - 1)]();
  g.restore();
  // built flash around each cut (8 frames up, 10 down)
  const f = Math.max(...cuts.map((c) => pulse(t, c))); if (f > 0) { g.fillStyle = `rgba(255,250,240,${0.32 * f})`; g.fillRect(0, 0, W, H); }
  captions(g, s);
  text(g, 'TOPPLED GIANTS', W / 2, 120, { font: 'Jakarta', weight: 800, size: 28, color: 'rgba(255,255,255,0.7)', align: 'center', spacing: 8 });
}
function end(g, s) {
  const t = s.t; g.save(); frame(g); bg(g, t, { accent: '150,110,255', seed: 12 });
  slam(g, t, 0.05, W / 2, 640, (gg) => big(gg, 'WHAT', 0, 0, { size: 150, color: '#fff' }));
  slam(g, t, 0.25, W / 2, 800, (gg) => big(gg, 'HAPPENS', 0, 0, { size: 150, color: '#fff' }));
  slam(g, t, 0.45, W / 2, 960, (gg) => big(gg, 'NEXT?', 0, 0, { size: 170, color: GOLD, glowC: 'rgba(255,200,60,0.7)' }));
  const tap = wordT(s, 0, 'follow'), pr = t > tap + 0.5 && t < tap + 0.75 ? 0.92 : 1;
  slam(g, t, tap, W / 2, 1180, (gg) => { gg.scale(pr, pr); gg.fillStyle = t > tap + 0.7 ? '#3a3350' : '#ff2f45'; gg.beginPath(); gg.roundRect(-260, -70, 520, 140, 70); gg.fill(); big(gg, t > tap + 0.7 ? 'FOLLOWING ✓' : 'FOLLOW', 0, 22, { size: 56, color: '#fff', stroke: false }); });
  g.restore(); captions(g, s);
  text(g, 'TOPPLED GIANTS', W / 2, 120, { font: 'Jakarta', weight: 800, size: 28, color: 'rgba(255,255,255,0.7)', align: 'center', spacing: 8 });
}

export const scenes = { main, end };
export const look = { finish: (ctx, frame) => nightFinish(ctx, frame) };
export const hits = [];
export const extraHits = (timeline) => {
  const m = timeline.scenes.find((x) => x.id === 'main'), e = timeline.scenes.find((x) => x.id === 'end'), out = [];
  m.cues.forEach((c, i) => { if (i) out.push({ t: m.start + c.start - 0.25, kind: 'whoosh', vol: 0.4 }); });
  const at = (i, frac) => m.start + m.cues[i].start + (m.cues[i].end - m.cues[i].start) * frac;
  out.push({ t: at(0, 0.3), kind: 'hit', vol: 0.5 }, { t: at(1, 0.45), kind: 'hit', vol: 0.6 }, { t: at(2, 0.45), kind: 'hit', vol: 0.6 });
  [0, 0.22, 0.44].forEach((d) => out.push({ t: m.start + m.cues[3].start + d, kind: 'pop', vol: 0.7 }));
  out.push({ t: at(7, 0.7), kind: 'hit', vol: 0.9 }, { t: at(9, 0.45), kind: 'hit', vol: 0.9 }, { t: at(10, 0.6), kind: 'hit', vol: 0.8 }, { t: e.start + 1.2, kind: 'pop', vol: 0.7 });
  return out;
};
