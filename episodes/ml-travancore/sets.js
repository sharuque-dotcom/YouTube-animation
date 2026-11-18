// Travancore what-if Short (Malayalam). Native 9:16 set pieces: 1947 map, radio room, thorium beach, what-if harbour.
// Rule: maps show only the Kerala coast / Travancore. No India-wide borders.
import { W, H, clamp, lerp, rand, text } from '../../pipeline/engine.js';
import { landRings } from '../../pipeline/map.js';
import { sky, stars, clouds, rain, mist, beam, glow, buf } from '../../pipeline/scenery.js';

const GOLD = '#e8b84a';

/** coconut palm: curved trunk, 11 pinnate fronds with leaflets; heavy, so it sways slowly */
export function palm(g, t, x, base, sc, { ph = 0, color = '#0a0608', rim = null, h = 700, lean = -60 } = {}) {
  const sw = Math.sin(t * 0.5 + ph) * 0.05;
  g.save(); g.translate(x, base);
  g.strokeStyle = color; g.lineWidth = 22 * sc; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(lean * sc, -h * 0.55 * sc, lean * 0.35 * sc, -h * sc); g.stroke();
  if (rim) { g.strokeStyle = rim; g.lineWidth = 4; g.beginPath(); g.moveTo(-9 * sc, 0); g.quadraticCurveTo((lean - 9) * sc, -h * 0.55 * sc, (lean * 0.35 - 9) * sc, -h * sc); g.stroke(); }
  g.translate(lean * 0.35 * sc, -h * sc); g.rotate(sw);
  for (let f = 0; f < 11; f++) {
    const a = -Math.PI * 1.08 + (f / 10) * Math.PI * 1.16 + Math.sin(t * 1.3 + f + ph) * 0.03, L = (240 + (f % 3) * 30) * sc, droop = 90 * sc;
    const pt = (u) => [Math.cos(a) * L * u, Math.sin(a) * L * u * 0.5 + droop * u * u - 30 * sc * u];
    g.strokeStyle = color; g.lineWidth = 6 * sc; g.beginPath(); for (let i = 0; i <= 12; i++) { const [px, py] = pt(i / 12); i ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke();
    g.lineWidth = 3.2 * sc; for (let i = 1; i <= 16; i++) { const u = i / 17, [px, py] = pt(u), ll = (1 - u * 0.6) * 62 * sc; for (const sd of [-1, 1]) { const la = a + sd * 1.15 + 0.5; g.beginPath(); g.moveTo(px, py); g.lineTo(px + Math.cos(la) * ll * 0.5, py + Math.abs(Math.sin(la)) * ll + 6 * sc); g.stroke(); } }
  }
  g.fillStyle = color; for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(Math.cos(i) * 14 * sc, 18 * sc + Math.sin(i) * 6 * sc, 12 * sc, 0, Math.PI * 2); g.fill(); }
  g.restore();
}

// ---------------------------------------------------------------- the royal conch (Valampiri Shankhu), drawn
export function conch(g, x, y, s, { color = GOLD, glowA = 0.5 } = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  if (glowA) glow(g, 0, 0, 220, '232,184,74', glowA);
  const cg = g.createLinearGradient(-90, -120, 90, 120); cg.addColorStop(0, '#fff3cf'); cg.addColorStop(0.45, color); cg.addColorStop(1, '#7a5418');
  g.fillStyle = cg; g.strokeStyle = '#3a2408'; g.lineWidth = 4;
  // body: a spindle with a spire on top and a long siphon below
  g.beginPath(); g.moveTo(0, -150); g.quadraticCurveTo(30, -110, 70, -70); g.quadraticCurveTo(110, -10, 70, 60); g.quadraticCurveTo(40, 110, 8, 160); g.lineTo(-8, 160); g.quadraticCurveTo(-30, 100, -70, 50); g.quadraticCurveTo(-100, -10, -60, -70); g.quadraticCurveTo(-25, -110, 0, -150); g.closePath(); g.fill(); g.stroke();
  // spiral whorls on the spire
  g.lineWidth = 3; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(-40 + i * 6, -60 - i * 22); g.quadraticCurveTo(0, -48 - i * 22, 46 - i * 8, -62 - i * 22); g.stroke(); }
  // the aperture (lip) on the right, opening clockwise
  g.fillStyle = '#5a3a10'; g.beginPath(); g.moveTo(30, -40); g.quadraticCurveTo(80, 0, 40, 90); g.quadraticCurveTo(20, 30, 30, -40); g.fill();
  g.strokeStyle = 'rgba(255,240,200,0.8)'; g.lineWidth = 3; g.beginPath(); g.moveTo(-60, -60); g.quadraticCurveTo(-90, 0, -60, 60); g.stroke();
  g.restore();
}
function paperTex(g, seed = 1) {
  const pg = g.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, H * 0.75); pg.addColorStop(0, '#efe0bb'); pg.addColorStop(1, '#b8945a'); g.fillStyle = pg; g.fillRect(0, 0, W, H);
  const r = rand(seed); for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(${r() < 0.5 ? '90,60,20' : '255,250,230'},${r() * 0.08})`; g.fillRect(r() * W, r() * H, 1 + r() * 3, 1 + r() * 3); }
  for (let i = 0; i < 6; i++) { g.strokeStyle = `rgba(110,80,40,${0.08 + r() * 0.08})`; g.lineWidth = 1 + r() * 2; g.beginPath(); let x = r() * W, y = r() * H; g.moveTo(x, y); for (let k = 0; k < 8; k++) { x += (r() - 0.5) * 300; y += (r() - 0.5) * 300; g.lineTo(x, y); } g.stroke(); }
}
// Approximate outline of the Travancore state (1947), labelled approximate on screen
const TRAV = [[76.18, 9.98], [76.55, 10.05], [77.05, 10.25], [77.25, 9.95], [77.2, 9.55], [77.4, 9.1], [77.25, 8.75], [77.62, 8.2], [77.53, 8.05], [76.6, 8.6], [76.2, 9.4]];
/** a 1947 survey map of the south-west coast. glowP 0..1 lights the Travancore border in gold */
export function oldMap(g, t, { glowP = 1, k = 520, lon = 76.85, lat = 9.05 } = {}) {
  paperTex(g, 3);
  const merc = (la) => Math.log(Math.tan(Math.PI / 4 + (la * Math.PI) / 360)) * 180 / Math.PI;
  const P = ([x, y]) => [W / 2 + (x - lon) * k * (W / 1080), H / 2 - (merc(y) - merc(lat)) * k];
  // sea hatching
  g.strokeStyle = 'rgba(70,90,110,0.14)'; g.lineWidth = 2; for (let y = 0; y < H; y += 14) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y + 30); g.stroke(); }
  // land from the 50m coastline
  const land = new Path2D();
  for (const ring of landRings('50m')) { let first = true; let near = false; for (const pt of ring) if (pt[0] > 70 && pt[0] < 84 && pt[1] > 4 && pt[1] < 16) near = true; if (!near) continue; for (const pt of ring) { const [x, y] = P(pt); first ? land.moveTo(x, y) : land.lineTo(x, y); first = false; } land.closePath(); }
  g.fillStyle = '#e6d3a4'; g.fill(land); g.save(); g.clip(land); for (let i = 0; i < 160; i++) { const r = rand(i); g.fillStyle = `rgba(120,90,40,${0.05 + r() * 0.06})`; g.beginPath(); g.arc(r() * W, r() * H, 20 + r() * 60, 0, Math.PI * 2); g.fill(); } g.restore();
  g.strokeStyle = '#4a3418'; g.lineWidth = 3; g.stroke(land);
  // coastline ink ripples (cartographer's water lines)
  for (let k2 = 1; k2 <= 3; k2++) { g.save(); g.strokeStyle = `rgba(60,80,100,${0.25 - k2 * 0.06})`; g.lineWidth = 2; g.translate(-k2 * 9, 0); g.stroke(land); g.restore(); }
  // Western Ghats hachures
  for (let i = 0; i < 40; i++) { const la = 8.3 + i * 0.05, lo = 77.1 + Math.sin(i) * 0.12; const [x, y] = P([lo, la]); g.strokeStyle = 'rgba(80,55,25,0.45)'; g.lineWidth = 2; for (let j = -2; j <= 2; j++) { g.beginPath(); g.moveTo(x + j * 8, y - 10); g.lineTo(x + j * 8 + 4, y + 10); g.stroke(); } }
  // Travancore glowing border
  const tp = new Path2D(); TRAV.forEach((pt, i) => { const [x, y] = P(pt); i ? tp.lineTo(x, y) : tp.moveTo(x, y); }); tp.closePath();
  g.save(); g.clip(land); g.fillStyle = `rgba(232,184,74,${0.28 * glowP})`; g.fill(tp); g.restore();
  g.save(); g.clip(land); g.shadowColor = 'rgba(255,200,80,0.9)'; g.shadowBlur = 30 * glowP; g.strokeStyle = `rgba(200,140,30,${0.4 + 0.6 * glowP})`; g.lineWidth = 7; g.setLineDash([22, 12]); g.lineDashOffset = -t * 30; g.stroke(tp); g.restore();
  // towns
  [['Trivandrum', 76.95, 8.52], ['Quilon', 76.6, 8.89], ['Alleppey', 76.33, 9.49], ['Kottayam', 76.52, 9.59]].forEach(([n, lo, la]) => { const [x, y] = P([lo, la]); g.fillStyle = '#7a1d1d'; g.beginPath(); g.arc(x, y, 9, 0, Math.PI * 2); g.fill(); text(g, n, x + 18, y + 8, { font: "'Cormorant Garamond'", weight: 600, size: 34, color: '#3a2408' }); });
  const [lx, ly] = P([76.0, 8.9]); text(g, 'ARABIAN SEA', lx - 120, ly + 260, { font: "'Cormorant Garamond'", weight: 600, size: 40, color: 'rgba(40,60,80,0.55)', spacing: 10 });
  text(g, 'TRAVANCORE · 1947', W / 2, 250, { font: "'Cormorant Garamond'", weight: 600, size: 64, color: '#3a2408', align: 'center', spacing: 6 });
  text(g, 'approximate boundary', W / 2, 300, { font: "'Cormorant Garamond'", weight: 500, size: 28, color: 'rgba(58,36,8,0.7)', align: 'center', style: 'italic' });
  // compass rose
  g.save(); g.translate(170, 1500); g.strokeStyle = '#4a3418'; g.lineWidth = 3; g.beginPath(); g.arc(0, 0, 70, 0, Math.PI * 2); g.stroke(); for (let i = 0; i < 4; i++) { g.rotate(Math.PI / 2); g.fillStyle = i % 2 ? '#4a3418' : '#8a6a3a'; g.beginPath(); g.moveTo(0, -95); g.lineTo(14, 0); g.lineTo(-14, 0); g.closePath(); g.fill(); } text(g, 'N', 0, -110, { font: "'Cormorant Garamond'", weight: 600, size: 30, color: '#3a2408', align: 'center' }); g.restore();
  // vignette burn on the paper edges
  const vg = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.72); vg.addColorStop(0, 'rgba(60,30,0,0)'); vg.addColorStop(1, 'rgba(60,30,0,0.55)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
}

// ---------------------------------------------------------------- radio room, June 1947, night
export function radioRoom(g, t, { on = 1 } = {}) {
  g.fillStyle = '#0e0a08'; g.fillRect(0, 0, W, H);
  // window with rain and swaying palms (heavy fronds sway slowly)
  const wx = 140, wy = 160, ww = 800, wh = 620;
  g.save(); g.beginPath(); g.rect(wx, wy, ww, wh); g.clip();
  const wsk = g.createLinearGradient(0, wy, 0, wy + wh); wsk.addColorStop(0, '#0b1424'); wsk.addColorStop(1, '#22304a'); g.fillStyle = wsk; g.fillRect(wx, wy, ww, wh);
  if (Math.floor(t * 0.7) % 5 === 0 && (t * 0.7) % 1 < 0.15) { g.fillStyle = 'rgba(200,220,255,0.35)'; g.fillRect(wx, wy, ww, wh); } // distant lightning
  palm(g, t, 330, wy + wh + 40, 0.75, { color: '#05080e', h: 620, lean: 40 }); palm(g, t, 780, wy + wh + 40, 0.55, { color: '#070b14', h: 640, lean: -50, ph: 1.3 });
  rain(g, t, { n: 500, alpha: 0.5, rect: [wx, wy, ww, wh] });
  g.restore();
  g.strokeStyle = '#2a1c12'; g.lineWidth = 26; g.strokeRect(wx, wy, ww, wh); g.lineWidth = 14; g.beginPath(); g.moveTo(wx + ww / 2, wy); g.lineTo(wx + ww / 2, wy + wh); g.moveTo(wx, wy + wh / 2); g.lineTo(wx + ww, wy + wh / 2); g.stroke();
  // wall + teak table
  const tg = g.createLinearGradient(0, 1150, 0, H); tg.addColorStop(0, '#4a2a16'); tg.addColorStop(1, '#1a0c06'); g.fillStyle = tg; g.fillRect(0, 1150, W, H - 1150);
  for (let i = 0; i < 9; i++) { g.strokeStyle = 'rgba(20,8,2,0.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 1180 + i * 70); g.bezierCurveTo(300, 1170 + i * 70 + 20, 700, 1200 + i * 70 - 20, W, 1180 + i * 70); g.stroke(); }
  // kerosene lamp: the warm key from the left, exponential falloff
  const fl = 0.88 + 0.12 * Math.sin(t * 13) * Math.sin(t * 7.1);
  g.save(); g.globalCompositeOperation = 'lighter'; const lg = g.createRadialGradient(200, 1000, 10, 200, 1000, 1000); lg.addColorStop(0, `rgba(255,170,80,${0.45 * fl})`); lg.addColorStop(0.3, `rgba(255,140,60,${0.14 * fl})`); lg.addColorStop(1, 'rgba(255,140,60,0)'); g.fillStyle = lg; g.fillRect(0, 0, W, H); g.restore();
  g.fillStyle = '#6a4a22'; g.fillRect(150, 1100, 100, 60); g.fillStyle = 'rgba(255,230,180,0.25)'; g.beginPath(); g.ellipse(200, 1010, 50, 90, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = `rgba(255,220,140,${fl})`; g.beginPath(); g.ellipse(200, 1030, 10, 26, 0, 0, Math.PI * 2); g.fill(); glow(g, 200, 1030, 140, '255,190,100', 0.8 * fl);
  // the valve radio: walnut cabinet, cloth grille, glowing dial
  g.save(); g.translate(640, 1060);
  g.shadowColor = 'rgba(0,0,0,0.6)'; g.shadowBlur = 40; const rg = g.createLinearGradient(-300, 0, 300, 0); rg.addColorStop(0, '#3a1e0c'); rg.addColorStop(0.3, '#7a4420'); rg.addColorStop(1, '#2a1406'); g.fillStyle = rg;
  g.beginPath(); g.moveTo(-300, 100); g.lineTo(-300, -180); g.quadraticCurveTo(-300, -330, 0, -340); g.quadraticCurveTo(300, -330, 300, -180); g.lineTo(300, 100); g.closePath(); g.fill(); g.shadowColor = 'transparent';
  g.strokeStyle = 'rgba(255,190,120,0.5)'; g.lineWidth = 3; g.beginPath(); g.moveTo(-300, -180); g.quadraticCurveTo(-300, -330, 0, -340); g.stroke(); // rim from the lamp
  g.fillStyle = '#2a1a10'; g.beginPath(); g.moveTo(-220, -60); g.lineTo(-220, -170); g.quadraticCurveTo(-220, -270, 0, -275); g.quadraticCurveTo(220, -270, 220, -170); g.lineTo(220, -60); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(120,80,40,0.6)'; g.lineWidth = 3; for (let i = -9; i <= 9; i++) { g.beginPath(); g.moveTo(i * 22, -265); g.lineTo(i * 22, -65); g.stroke(); }
  const dg = g.createLinearGradient(0, -30, 0, 50); dg.addColorStop(0, `rgba(255,220,140,${0.95 * on})`); dg.addColorStop(1, `rgba(255,170,80,${0.85 * on})`); g.fillStyle = dg; g.beginPath(); g.roundRect(-200, -30, 400, 70, 12); g.fill();
  glow(g, 0, 5, 260, '255,190,100', 0.55 * on);
  for (let i = 0; i <= 10; i++) { g.fillStyle = 'rgba(80,40,10,0.8)'; g.fillRect(-180 + i * 36, -22, 2, i % 2 ? 12 : 22); }
  g.strokeStyle = '#b01e1e'; g.lineWidth = 4; const nx = lerp(-150, 120, 0.62 + Math.sin(t * 0.3) * 0.01); g.beginPath(); g.moveTo(nx, -26); g.lineTo(nx, 36); g.stroke();
  text(g, 'TRIVANDRUM', 0, 70 + 10, { font: 'Jakarta', weight: 700, size: 22, color: 'rgba(255,220,160,0.7)', align: 'center', spacing: 6 });
  [-150, 150].forEach((x) => { g.fillStyle = '#c8a060'; g.beginPath(); g.arc(x, 90, 28, 0, Math.PI * 2); g.fill(); g.fillStyle = '#6a4a20'; g.beginPath(); g.arc(x, 90, 20, 0, Math.PI * 2); g.fill(); });
  g.restore();
  g.save(); g.translate(330, 1560); g.rotate(-0.08); g.fillStyle = '#e8dfc6'; g.fillRect(-260, -140, 520, 280); g.fillStyle = '#1a1208'; text(g, 'THE TRAVANCORE TIMES', 0, -80, { font: "'Playfair Display'", weight: 900, size: 34, color: '#1a1208', align: 'center' }); g.fillRect(-230, -60, 460, 4); text(g, 'JUNE 1947', 0, -20, { font: "'Playfair Display'", weight: 700, size: 26, color: '#4a3a20', align: 'center' }); g.fillStyle = 'rgba(30,20,10,0.3)'; for (let i = 0; i < 5; i++) { g.fillRect(-230, 10 + i * 24, 220, 8); g.fillRect(10, 10 + i * 24, 220, 8); } g.restore();
  // the broadcast: sound rings rippling out of the grille
  if (on) for (let k = 0; k < 4; k++) { const ph = (t * 0.6 + k / 4) % 1; g.strokeStyle = `rgba(255,210,140,${0.5 * (1 - ph)})`; g.lineWidth = 4; g.beginPath(); g.arc(640, 900, 120 + ph * 520, -Math.PI * 0.95, -Math.PI * 0.05); g.stroke(); }
  // dust motes in the lamp light
  for (let i = 0; i < 40; i++) { const r = rand(i + 7); const x = 120 + r() * 600 + Math.sin(t * 0.5 + i) * 20, y = 700 + r() * 500 - ((t * 10 * (0.5 + r())) % 200); g.fillStyle = `rgba(255,220,170,${0.25 * r()})`; g.fillRect(x, y, 2, 2); }
}

// ---------------------------------------------------------------- thorium beach at dusk
export function thoriumBeach(g, t, { atom = 1 } = {}) {
  sky(g, { top: '#1a1030', mid: '#6a3050', horizon: '#ff9a5a', glow: 'rgba(255,150,80,0.5)', hy: 820 });
  clouds(g, t, { y: 420, h: 120, seed: 31, n: 7, scale: 0.7, body: '#5a2a4a', shade: '#3a1a35', rim: 'rgba(255,190,130,0.9)', lx: 540, ly: 840, speed: 5, speckle: false });
  // sun on the horizon + its glitter path
  glow(g, 540, 830, 700, '255,150,80', 0.6); g.fillStyle = '#ffd6a0'; g.beginPath(); g.arc(540, 840, 90, Math.PI, 0); g.fill();
  const sea = g.createLinearGradient(0, 840, 0, 1240); sea.addColorStop(0, '#6a3a5a'); sea.addColorStop(1, '#1a1428'); g.fillStyle = sea; g.fillRect(0, 840, W, 400);
  for (let i = 0; i < 40; i++) { const y = 850 + i * 10, w = 40 + i * 9; g.fillStyle = `rgba(255,200,140,${0.35 - i * 0.007})`; g.fillRect(540 - w / 2 + Math.sin(t * 2 + i) * 10, y, w, 3); }
  // waves rolling in: foam lines with depth
  for (let k = 0; k < 5; k++) { const ph = (t * 0.25 + k / 5) % 1, y = lerp(900, 1260, ph); g.strokeStyle = `rgba(255,240,230,${0.6 * Math.sin(ph * Math.PI)})`; g.lineWidth = lerp(2, 8, ph); g.beginPath(); for (let x = 0; x <= W; x += 30) g.lineTo(x, y + Math.sin(x * 0.012 + t + k) * lerp(3, 14, ph)); g.stroke(); }
  // black monazite sand with glints (the thorium)
  const sg = g.createLinearGradient(0, 1240, 0, H); sg.addColorStop(0, '#1c1418'); sg.addColorStop(1, '#0a0608'); g.fillStyle = sg; g.beginPath(); g.moveTo(0, 1250); for (let x = 0; x <= W; x += 40) g.lineTo(x, 1240 + Math.sin(x * 0.01 + 1) * 20); g.lineTo(W, H); g.lineTo(0, H); g.fill();
  const r = rand(5); for (let i = 0; i < 500; i++) { const x = r() * W, y = 1260 + r() * 660, tw = Math.max(0, Math.sin(t * (2 + r() * 4) + i)); if (tw > 0.7) { g.fillStyle = `rgba(255,${200 + r() * 55},${120 + r() * 80},${(tw - 0.7) * 3})`; g.fillRect(x, y, 3, 3); } else { g.fillStyle = `rgba(80,60,70,${0.3 * r()})`; g.fillRect(x, y, 2, 2); } }
  // palms on the right, near (heavy, slow sway) with rim light from the sunset
  palm(g, t, 960, 1560, 1.35, { rim: 'rgba(255,170,110,0.45)', h: 760, lean: -90 }); palm(g, t, 70, 1460, 0.95, { rim: 'rgba(255,170,110,0.35)', h: 720, lean: 60, ph: 2 });
  // a glowing atom traced above the sand
  if (atom > 0) { g.save(); g.globalAlpha = atom; g.translate(560, 1330); glow(g, 0, 0, 260, '120,220,255', 0.4); g.strokeStyle = 'rgba(160,230,255,0.85)'; g.lineWidth = 4; for (let i = 0; i < 3; i++) { g.save(); g.rotate(i * Math.PI / 3 + t * 0.3); g.beginPath(); g.ellipse(0, 0, 170, 60, 0, 0, Math.PI * 2); g.stroke(); const a = t * 3 + i * 2; g.fillStyle = '#e8fbff'; g.beginPath(); g.arc(Math.cos(a) * 170, Math.sin(a) * 60, 9, 0, Math.PI * 2); g.fill(); g.restore(); } g.fillStyle = '#bff0ff'; g.beginPath(); g.arc(0, 0, 22, 0, Math.PI * 2); g.fill();
    text(g, 'Th', 0, 12, { font: 'Jakarta', weight: 800, size: 30, color: '#0a3040', align: 'center' }); g.restore(); }
  mist(g, t, { y: 1220, h: 120, alpha: 0.2, color: '255,190,160' });
}

// ---------------------------------------------------------------- what-if: a free Travancore's harbour at sunrise
function conchFlag(g, t, x, y, s) {
  g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = '#d8d0c0'; g.fillRect(-3, 0, 6, 220);
  g.beginPath(); for (let i = 0; i <= 20; i++) { const u = i / 20; g.lineTo(u * 200, Math.sin(t * 4 - u * 5) * 10 * u); } for (let i = 20; i >= 0; i--) { const u = i / 20; g.lineTo(u * 200, 120 + Math.sin(t * 4 - u * 5) * 10 * u); } g.closePath();
  const fg = g.createLinearGradient(0, 0, 200, 0); fg.addColorStop(0, '#9a1e2a'); fg.addColorStop(1, '#c43a40'); g.fillStyle = fg; g.fill();
  conch(g, 100, 60 + Math.sin(t * 4 - 2.5) * 5, 0.28, { glowA: 0 }); g.restore();
}
export function harbour(g, t) {
  sky(g, { top: '#2a3a6a', mid: '#e89a7a', horizon: '#ffd8a0', glow: 'rgba(255,200,140,0.6)', hy: 980 });
  beam(g, t, 300, 980, -Math.PI / 2 + 0.25, { len: 1200, spread: 0.18, color: '255,220,170', alpha: 0.18, motes: 0 });
  glow(g, 300, 990, 500, '255,210,150', 0.6); g.fillStyle = '#fff1d0'; g.beginPath(); g.arc(300, 990, 70, Math.PI, 0); g.fill();
  clouds(g, t, { y: 360, h: 120, seed: 41, n: 7, scale: 0.6, body: '#b07a8a', shade: '#7a5a7a', rim: 'rgba(255,230,190,0.9)', lx: 300, ly: 980, speed: 4, speckle: false });
  // far skyline of a modern capital, hazy (depth occlusion)
  const r = rand(12); let x = 0; while (x < W) { const w = 40 + r() * 70, h = 120 + r() * 360; g.fillStyle = 'rgba(120,110,150,0.55)'; g.fillRect(x, 980 - h, w - 6, h); for (let k = 0; k < h / 30; k++) if (r() < 0.25) { g.fillStyle = 'rgba(255,230,180,0.5)'; g.fillRect(x + 6, 980 - h + 10 + k * 30, w - 18, 4); } x += w; }
  // cranes, mid ground
  for (const cx of [700, 900]) { g.strokeStyle = '#3a2a40'; g.lineWidth = 10; g.beginPath(); g.moveTo(cx, 1060); g.lineTo(cx, 760); g.lineTo(cx - 220, 780); g.moveTo(cx, 760); g.lineTo(cx + 80, 770); g.stroke(); g.lineWidth = 3; g.beginPath(); g.moveTo(cx - 180, 778); g.lineTo(cx - 180, 900 + Math.sin(t + cx) * 10); g.stroke(); }
  // water
  const wg = g.createLinearGradient(0, 1060, 0, H); wg.addColorStop(0, '#d8a08a'); wg.addColorStop(1, '#2a3050'); g.fillStyle = wg; g.fillRect(0, 1060, W, H - 1060);
  for (let i = 0; i < 50; i++) { const y = 1070 + i * 16, w = 60 + i * 8; g.fillStyle = `rgba(255,230,190,${0.3 - i * 0.005})`; g.fillRect(300 - w / 2 + Math.sin(t * 2 + i) * 12, y, w, 3); }
  // a container ship flying the conch flag
  g.save(); g.translate(560 + Math.sin(t * 0.2) * 20, 1260 + Math.sin(t * 1.1) * 4); g.fillStyle = '#1e2236'; g.beginPath(); g.moveTo(-420, 0); g.lineTo(440, 0); g.lineTo(380, 90); g.lineTo(-390, 90); g.closePath(); g.fill();
  const cols = ['#c0392b', '#2b7cd3', '#e0a020', '#1f8a5b', '#8a4ab8']; for (let rr = 0; rr < 3; rr++) for (let c = 0; c < 11; c++) { g.fillStyle = cols[(rr * 2 + c) % 5]; g.fillRect(-380 + c * 66, -40 - rr * 40, 62, 36); }
  g.fillStyle = '#e8e3f5'; g.fillRect(330, -190, 80, 190); g.strokeStyle = 'rgba(255,220,170,0.7)'; g.lineWidth = 3; g.strokeRect(330, -190, 80, 190); g.restore();
  conchFlag(g, t, 920, 830, 1.1);
  // near: a quay with a passport stamp being pressed (foreground story detail)
  g.fillStyle = '#14101c'; g.fillRect(0, 1560, W, H - 1560);
  g.save(); g.translate(300, 1720); g.rotate(-0.06); g.fillStyle = '#1e3a5a'; g.beginPath(); g.roundRect(-170, -120, 340, 240, 14); g.fill(); g.strokeStyle = GOLD; g.lineWidth = 3; g.strokeRect(-150, -100, 300, 200);
  conch(g, 0, -10, 0.32, { glowA: 0.2 }); text(g, 'TRAVANCORE', 0, 80, { font: "'Cormorant Garamond'", weight: 600, size: 32, color: GOLD, align: 'center', spacing: 4 }); g.restore();
  text(g, 'PASSPORT', 300, 1880 - 10, { font: 'Jakarta', weight: 700, size: 22, color: 'rgba(232,184,74,0.7)', align: 'center', spacing: 8 });
}
