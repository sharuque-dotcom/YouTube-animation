// Episode 4 set pieces (light house style, detailed): the call, the deepfake video call,
// the "Lawyer Call" desk at night, and the money map. Pure functions of time t.
import { W, H, clamp, lerp, rand, text } from '../../pipeline/engine.js';
import { glow, beam, skyline, mist, buf } from '../../pipeline/scenery.js';
import { person } from '../../pipeline/fx.js';
import { lightMap, mapPin, chip } from '../../pipeline/lightui.js';

const ez = (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
const PURPLE = '#4a2a8c', LAV = '#b9a2ff', INK = '#1d1b29';

// ---------------------------------------------------------------- shared
/** A face (3/4 front) as a dot-matrix of light: the cloned identity */
export function dotFace(g, cx, cy, s, t, { color = '185,162,255', reveal = 1, glitch = 0 } = {}) {
  const [c, cg] = buf('dotface', 420, 520);
  cg.translate(210, 260);
  cg.fillStyle = '#fff';
  cg.beginPath(); cg.ellipse(0, -20, 140, 180, 0, 0, Math.PI * 2); cg.fill();
  cg.beginPath(); cg.moveTo(-90, 120); cg.quadraticCurveTo(-60, 230, 0, 240); cg.quadraticCurveTo(60, 230, 90, 120); cg.fill();
  cg.fillRect(-60, 180, 120, 80);
  cg.beginPath(); cg.moveTo(-210, 260); cg.quadraticCurveTo(-200, 190, -80, 200); cg.lineTo(80, 200); cg.quadraticCurveTo(200, 190, 210, 260); cg.fill();
  const mask = cg.getImageData(0, 0, 420, 520).data;
  const step = 9;
  g.save(); g.translate(cx, cy); g.scale(s, s);
  for (let y = 0; y < 520; y += step) {
    const gl = glitch && Math.sin(y * 0.3 + t * 30) > 0.92 ? (Math.sin(t * 50 + y) * 40 * glitch) : 0;
    for (let x = 0; x < 420; x += step) {
      if (!mask[(y * 420 + x) * 4 + 3]) continue;
      if (y / 520 > reveal) continue;
      const ex = x - 210, ey = y - 260;
      // facial features: darker eyes / mouth / nose shading
      const eye = Math.hypot(ex + 52, ey + 30) < 22 || Math.hypot(ex - 52, ey + 30) < 22;
      const mouth = Math.abs(ey - 80) < 10 && Math.abs(ex) < 46;
      const nose = Math.abs(ex - 6) < 12 && ey > -10 && ey < 40;
      let b = 0.35 + 0.65 * (1 - Math.hypot(ex / 160, (ey + 40) / 220));
      if (eye || mouth) b = 0.1; if (nose) b *= 0.7;
      const flick = 0.75 + 0.25 * Math.sin(t * 4 + x * 0.05 + y * 0.03);
      g.fillStyle = `rgba(${color},${clamp(b * flick)})`;
      const r = 1.4 + 2.2 * clamp(b);
      g.beginPath(); g.arc(ex + gl, ey, r, 0, Math.PI * 2); g.fill();
    }
  }
  g.restore();
}
/** A voice waveform of bars */
export function waveform(g, t, x, y, w, h, { color = '185,162,255', bars = 64, amp = 1 } = {}) {
  for (let i = 0; i < bars; i++) {
    const u = i / (bars - 1), env = Math.sin(u * Math.PI);
    const v = (0.25 + 0.75 * Math.abs(Math.sin(t * 7 + i * 0.7) * Math.sin(t * 3.1 + i * 0.23))) * env * amp;
    const bh = Math.max(3, v * h);
    g.fillStyle = `rgba(${color},${0.5 + 0.5 * env})`;
    g.beginPath(); g.roundRect(x + u * w - 3, y - bh / 2, 6, bh, 3); g.fill();
  }
}
function plant(g, t, x, y, s = 1) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = '#e9e4f5'; g.beginPath(); g.moveTo(-40, 0); g.lineTo(40, 0); g.lineTo(30, 70); g.lineTo(-30, 70); g.closePath(); g.fill();
  for (let i = 0; i < 9; i++) {
    const a = -Math.PI / 2 + (i - 4) * 0.28, len = 90 + (i % 3) * 30, sway = Math.sin(t * 1.3 + i) * 0.05 * (len / 100);
    g.save(); g.rotate(a + Math.PI / 2 + sway); g.fillStyle = i % 2 ? '#3f8f6b' : '#4fa67d';
    g.beginPath(); g.ellipse(0, -len / 2, 13, len / 2, 0, 0, Math.PI * 2); g.fill(); g.restore();
  }
  g.restore();
}
function mug(g, t, x, y) {
  g.fillStyle = '#ffffff'; g.beginPath(); g.roundRect(x - 34, y - 70, 68, 74, 10); g.fill();
  g.strokeStyle = '#ffffff'; g.lineWidth = 9; g.beginPath(); g.arc(x + 40, y - 36, 18, -1.3, 1.3); g.stroke();
  g.fillStyle = PURPLE; g.fillRect(x - 34, y - 46, 68, 10);
  for (let i = 0; i < 3; i++) { const ph = (t * 0.4 + i / 3) % 1; g.strokeStyle = `rgba(255,255,255,${0.5 * Math.sin(ph * Math.PI)})`; g.lineWidth = 4; g.beginPath(); g.moveTo(x - 12 + i * 12, y - 80 - ph * 60); g.bezierCurveTo(x - 24 + i * 12, y - 100 - ph * 60, x + i * 12, y - 120 - ph * 60, x - 10 + i * 12, y - 140 - ph * 60); g.stroke(); }
}

// ---------------------------------------------------------------- 1. the call (bright office, late afternoon)
export function office(g, t, o = {}) {
  const ring = o.ringAt ?? 0.5, face = o.faceAt ?? 1.5;
  // back wall
  const wall = g.createLinearGradient(0, 0, 0, H); wall.addColorStop(0, '#f1eafb'); wall.addColorStop(1, '#e6dcf3');
  g.fillStyle = wall; g.fillRect(0, 0, W, H);
  // big window right: city in warm afternoon light
  const wx = 1080, wy = 90, ww = 760, wh = 560;
  g.save(); g.beginPath(); g.rect(wx, wy, ww, wh); g.clip();
  const skyg = g.createLinearGradient(0, wy, 0, wy + wh); skyg.addColorStop(0, '#bfd3ff'); skyg.addColorStop(0.7, '#ffd9b8'); skyg.addColorStop(1, '#ffc49a');
  g.fillStyle = skyg; g.fillRect(wx, wy, ww, wh);
  glow(g, wx + ww * 0.8, wy + wh * 0.75, 420, '255,220,170', 0.8);
  skyline(g, t, { base: wy + wh + 10, seed: 401, depth: 0.2, color: '#b9a9d9', lit: 0.0, tall: 1.2, fog: 'rgba(255,220,190,0.5)' });
  skyline(g, t, { base: wy + wh + 30, seed: 402, depth: 0.55, color: '#9c8bc4', lit: 0.0, tall: 1.4, minW: 70, maxW: 160, fog: 'rgba(255,210,180,0.35)' });
  g.restore();
  // window frame + blinds (half up)
  g.fillStyle = '#ffffff'; g.fillRect(wx - 16, wy - 16, ww + 32, 16); g.fillRect(wx - 16, wy + wh, ww + 32, 22); g.fillRect(wx - 16, wy, 16, wh); g.fillRect(wx + ww, wy, 16, wh); g.fillRect(wx + ww / 2 - 6, wy, 12, wh);
  for (let i = 0; i < 9; i++) { g.fillStyle = i % 2 ? '#efe8f8' : '#e4daf1'; g.fillRect(wx, wy + i * 18, ww, 14); }
  // volumetric sunbeams through the window onto the desk (warm key)
  beam(g, t, wx + 260, wy + 200, 2.55, { len: 1250, spread: 0.16, color: '255,214,160', alpha: 0.22, motes: 70, seed: 41 });
  beam(g, t, wx + 560, wy + 260, 2.45, { len: 1300, spread: 0.12, color: '255,214,160', alpha: 0.16, motes: 40, seed: 42 });
  // wall details: framed chart, clock
  g.fillStyle = '#ffffff'; g.fillRect(170, 150, 360, 250); g.strokeStyle = '#d9cdee'; g.lineWidth = 8; g.strokeRect(170, 150, 360, 250);
  g.strokeStyle = PURPLE; g.lineWidth = 6; g.beginPath(); [[200, 360], [260, 330], [320, 340], [380, 280], [440, 250], [500, 200]].forEach(([a, b], i) => (i ? g.lineTo(a, b) : g.moveTo(a, b))); g.stroke();
  g.fillStyle = '#fff'; g.beginPath(); g.arc(760, 220, 70, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#d9cdee'; g.lineWidth = 8; g.stroke();
  const hr = (t * 0.02) % (Math.PI * 2); g.strokeStyle = INK; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(760, 220); g.lineTo(760 + Math.cos(-1.2 + hr) * 34, 220 + Math.sin(-1.2 + hr) * 34); g.stroke(); g.lineWidth = 4; g.beginPath(); g.moveTo(760, 220); g.lineTo(760 + Math.cos(t * 0.5) * 52, 220 + Math.sin(t * 0.5) * 52); g.stroke();
  // employee at the desk (generic, seen from the front)
  person(g, 700, 640, 1.55, t, { jacket: '#5b6ea8', shirt: '#ffffff', armL: 0.6, armR: -0.4, seed: 23, hair: '#3b2a1a', skin: '#e8b48f' });
  // desk (front edge) with warm sun stripes
  const dg = g.createLinearGradient(0, 760, 0, H); dg.addColorStop(0, '#fbf8ff'); dg.addColorStop(1, '#e3d9f2');
  g.fillStyle = dg; g.fillRect(0, 760, W, H - 760);
  g.fillStyle = '#d6c9ec'; g.fillRect(0, 760, W, 8);
  g.save(); g.globalCompositeOperation = 'multiply'; for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(230,215,250,0.5)'; g.beginPath(); g.moveTo(300 + i * 160, 768); g.lineTo(380 + i * 160, 768); g.lineTo(200 + i * 160, H); g.lineTo(120 + i * 160, H); g.closePath(); g.fill(); } g.restore();
  // monitor with a spreadsheet
  g.fillStyle = '#2b2440'; g.beginPath(); g.roundRect(60, 480, 400, 270, 14); g.fill();
  g.fillStyle = '#ffffff'; g.fillRect(76, 496, 368, 230);
  for (let r = 0; r < 9; r++) for (let c = 0; c < 5; c++) { g.fillStyle = r === 0 ? '#e4dbf5' : (r + c) % 2 ? '#f7f4fc' : '#ffffff'; g.fillRect(80 + c * 72, 500 + r * 25, 70, 23); }
  g.fillStyle = '#2b2440'; g.fillRect(240, 750, 40, 20); g.fillRect(190, 765, 140, 10);
  plant(g, t, 1760, 760, 1.1);
  mug(g, t, 760, 860);
  // papers
  g.save(); g.translate(1050, 900); g.rotate(-0.08); g.fillStyle = '#fff'; g.fillRect(-160, -60, 320, 200); g.fillStyle = '#e4dbf5'; for (let i = 0; i < 5; i++) g.fillRect(-130, -30 + i * 30, 260 - (i % 2) * 70, 10); g.restore();
  // desk phone, ringing: "CEO calling"
  const ringing = t > ring;
  const shake = ringing ? Math.sin(t * 70) * (Math.floor((t - ring) * 2) % 2 ? 0 : 3) : 0;
  g.save(); g.translate(1380 + shake, 820);
  g.fillStyle = '#2b2440'; g.beginPath(); g.roundRect(-170, -60, 340, 160, 30); g.fill();
  g.fillStyle = '#3a3156'; g.beginPath(); g.roundRect(-190, -110, 120, 220, 50); g.fill();
  g.fillStyle = ringing ? '#e8fff6' : '#5b5870'; g.beginPath(); g.roundRect(-40, -40, 180, 60, 10); g.fill();
  if (ringing) { text(g, 'CEO calling', 50, -1, { font: 'Jakarta', weight: 800, size: 26, color: '#145a46', align: 'center' }); }
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) { g.fillStyle = '#4a3f6b'; g.beginPath(); g.roundRect(-30 + c * 44, 34 + r * 20, 34, 14, 5); g.fill(); }
  g.restore();
  if (ringing) for (let i = 0; i < 3; i++) { const ph = ((t - ring) * 1.2 + i / 3) % 1; g.strokeStyle = `rgba(74,42,140,${0.5 * (1 - ph)})`; g.lineWidth = 4; g.beginPath(); g.arc(1300, 720, 60 + ph * 140, -2.4, -0.7); g.stroke(); }
  // the voice: waveform rising out of the handset, gathering into a face
  const fp = clamp((t - face) / 1.6);
  if (fp > 0) {
    g.save(); g.globalAlpha = fp;
    waveform(g, t, 1190, 640 - fp * 40, 380, 120 * fp, { color: '74,42,140' });
    g.restore();
    const hg = g.createRadialGradient(1380, 420, 40, 1380, 420, 300); hg.addColorStop(0, `rgba(40,20,90,${0.85 * fp})`); hg.addColorStop(1, 'rgba(40,20,90,0)');
    g.fillStyle = hg; g.beginPath(); g.arc(1380, 420, 300, 0, Math.PI * 2); g.fill();
    glow(g, 1380, 420, 320, '185,162,255', 0.4 * fp);
    dotFace(g, 1380, 420, 0.62, t, { color: '226,214,255', reveal: ez(fp) });
  }
}

// ---------------------------------------------------------------- 2. the deepfake video call
function tilePerson(g, t, x, y, w, h, { jacket, hair, skin, seed, label, bg }) {
  g.save(); g.beginPath(); g.roundRect(x, y, w, h, 18); g.clip();
  const gb = g.createLinearGradient(x, y, x, y + h); gb.addColorStop(0, bg[0]); gb.addColorStop(1, bg[1]);
  g.fillStyle = gb; g.fillRect(x, y, w, h);
  g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(x + w * 0.62, y + h * 0.1, w * 0.3, h * 0.42);
  person(g, x + w / 2, y + h * 0.78, h / 330, t, { jacket, shirt: '#ffffff', hair, skin, seed, armL: 0.1, armR: -0.1 });
  g.restore();
  g.fillStyle = 'rgba(20,14,40,0.6)'; g.beginPath(); g.roundRect(x + 14, y + h - 46, 150, 32, 10); g.fill();
  text(g, label, x + 26, y + h - 23, { font: 'Inter', weight: 600, size: 18, color: '#fff' });
}
export function videocall(g, t, o = {}) {
  const peel = clamp((t - (o.peelAt ?? 1)) / 1.4);
  const wall = g.createLinearGradient(0, 0, 0, H); wall.addColorStop(0, '#efe7fb'); wall.addColorStop(1, '#ddd0f0');
  g.fillStyle = wall; g.fillRect(0, 0, W, H);
  beam(g, t, 200, -40, 1.1, { len: 1300, spread: 0.18, color: '255,226,180', alpha: 0.18, motes: 50, seed: 7 });
  g.fillStyle = '#f9f6ff'; g.fillRect(0, 880, W, 200); g.fillStyle = '#d6c9ec'; g.fillRect(0, 880, W, 8);
  // laptop
  const lx = 300, ly = 110, lw = 1320, lh = 760;
  g.fillStyle = '#2b2440'; g.beginPath(); g.roundRect(lx, ly, lw, lh, 30); g.fill();
  g.fillStyle = '#16122a'; g.fillRect(lx + 26, ly + 26, lw - 52, lh - 72);
  g.fillStyle = '#c9c3d9'; g.beginPath(); g.moveTo(lx - 80, ly + lh); g.lineTo(lx + lw + 80, ly + lh); g.lineTo(lx + lw + 30, ly + lh + 40); g.lineTo(lx - 30, ly + lh + 40); g.closePath(); g.fill();
  // tiles
  const sx = lx + 46, sy = ly + 46, tw = (lw - 52 - 60) / 2, th = (lh - 72 - 80) / 2;
  const tiles = [
    { label: 'CEO', jacket: '#1d1b2e', hair: '#8a8a8a', skin: '#f3c9a3', seed: 31, bg: ['#cfd8f6', '#a9b6e6'] },
    { label: 'CFO', jacket: '#4a2a8c', hair: '#2b2440', skin: '#e8b48f', seed: 32, bg: ['#f6d9cf', '#e6b6a9'] },
    { label: 'Legal counsel', jacket: '#2b4a3a', hair: '#3b2a1a', skin: '#f6d2b5', seed: 33, bg: ['#d8f0e4', '#b2dcc8'] },
    { label: 'You', jacket: '#5b6ea8', hair: '#3b2a1a', skin: '#e8b48f', seed: 23, bg: ['#f3eefb', '#ddd2f1'] },
  ];
  tiles.forEach((tp, i) => tilePerson(g, t, sx + (i % 2) * (tw + 14), sy + Math.floor(i / 2) * (th + 14), tw, th, tp));
  // the CEO tile peels back into a wireframe: a mesh over the face, a scanline glitch band
  const cx = sx + tw / 2, cy = sy + th * 0.78 - 1.25 * 70 * (th / 330) * 1.2 / 1.25;
  if (peel > 0) {
    g.save(); g.beginPath(); g.roundRect(sx, sy, tw, th, 18); g.clip();
    const edge = sx + tw * (1 - ez(peel));
    g.beginPath(); g.rect(edge, sy, tw, th); g.clip();
    g.fillStyle = '#0d0b22'; g.fillRect(sx, sy, tw, th);
    dotFace(g, cx, sy + th * 0.48, th / 560, t, { color: '62,224,181', glitch: 1 });
    g.strokeStyle = 'rgba(62,224,181,0.45)'; g.lineWidth = 1.5;
    const fs = th / 560;
    for (let a = -6; a <= 6; a++) { g.beginPath(); for (let k = 0; k <= 20; k++) { const u = k / 20 * Math.PI * 2; const px = cx + Math.cos(u) * 140 * fs * Math.cos(a * 0.22), py = sy + th * 0.48 - 20 * fs + Math.sin(a * 0.22) * 180 * fs + Math.sin(u) * 12 * fs; k ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke(); }
    g.restore();
    g.fillStyle = 'rgba(62,224,181,0.9)'; g.fillRect(edge - 2, sy, 4, th);
    void cy;
  }
  // scanline glitch band with RGB split across the CEO tile
  const band = sy + ((t * 220) % th);
  g.save(); g.beginPath(); g.roundRect(sx, sy, tw, th, 18); g.clip(); g.globalCompositeOperation = 'lighter';
  g.fillStyle = 'rgba(255,40,80,0.18)'; g.fillRect(sx + 6, band, tw, 10); g.fillStyle = 'rgba(40,200,255,0.18)'; g.fillRect(sx - 6, band + 4, tw, 10);
  g.restore();
  // call bar
  const by = ly + lh - 90;
  [['🎤', 0], ['📷', 1], ['✕', 2]].forEach(([, k]) => { g.fillStyle = k === 2 ? '#e2412e' : '#3a3156'; g.beginPath(); g.arc(lx + lw / 2 - 90 + k * 90, by + 28, 26, 0, Math.PI * 2); g.fill(); });
  g.fillStyle = 'rgba(255,255,255,0.85)'; g.fillRect(lx + lw / 2 - 98, by + 22, 16, 12); g.fillRect(lx + lw / 2 - 4, by + 20, 18, 16);
  text(g, '✕', lx + lw / 2 + 90, by + 38, { font: 'Jakarta', weight: 800, size: 26, color: '#fff', align: 'center' });
  // little REC + "Confidential — Project" title
  text(g, '● Confidential · acquisition call', lx + 60, ly + 22, { font: 'Inter', weight: 600, size: 16, color: '#ff8a96' });
}

// ---------------------------------------------------------------- 3. the "Lawyer Call" desk at night
export function lawyerDesk(g, t, o = {}) {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#120e26'); gr.addColorStop(1, '#231a3d');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  // window: generic city at night
  g.save(); g.beginPath(); g.rect(1180, 80, 640, 460); g.clip();
  const sk = g.createLinearGradient(0, 80, 0, 540); sk.addColorStop(0, '#0b0a24'); sk.addColorStop(1, '#2a2050'); g.fillStyle = sk; g.fillRect(1180, 80, 640, 460);
  skyline(g, t, { base: 560, seed: 431, depth: 0.3, color: '#1a1638', lit: 0.25, tall: 1.1, fog: 'rgba(80,60,130,0.4)' });
  g.restore();
  g.fillStyle = '#1b1530'; g.fillRect(1166, 66, 668, 14); g.fillRect(1166, 540, 668, 20); g.fillRect(1166, 80, 14, 460); g.fillRect(1820, 80, 14, 460); g.fillRect(1494, 80, 12, 460);
  // desk lamp: warm key, volumetric cone
  g.fillStyle = '#3a3156'; g.fillRect(380, 740, 120, 18); g.save(); g.strokeStyle = '#3a3156'; g.lineWidth = 14; g.beginPath(); g.moveTo(440, 740); g.lineTo(520, 520); g.lineTo(680, 430); g.stroke(); g.restore();
  g.save(); g.translate(690, 430); g.rotate(0.55); g.fillStyle = '#4a3f6b'; g.beginPath(); g.moveTo(-60, -10); g.lineTo(60, -10); g.lineTo(90, 70); g.lineTo(-90, 70); g.closePath(); g.fill(); g.restore();
  beam(g, t, 700, 490, 1.25, { len: 620, spread: 0.42, color: '255,200,130', alpha: 0.28, motes: 60, seed: 9 });
  // desk surface lit by the lamp
  const dg = g.createRadialGradient(820, 900, 40, 820, 900, 900); dg.addColorStop(0, '#5a3d2e'); dg.addColorStop(1, '#1d1420');
  g.fillStyle = dg; g.fillRect(0, 760, W, H - 760);
  // notebook with the handwritten script
  g.save(); g.translate(820, 900); g.rotate(-0.06);
  g.fillStyle = '#fbf3df'; g.fillRect(-300, -150, 600, 300); g.fillStyle = '#f3e7cc'; g.fillRect(-4, -150, 8, 300);
  g.strokeStyle = 'rgba(120,140,200,0.35)'; g.lineWidth = 2; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(-290, -110 + i * 30); g.lineTo(290, -110 + i * 30); g.stroke(); }
  const typed = clamp((t - (o.writeAt ?? 0.3)) / 2);
  const lines = ['LAWYER CALL', '1. "Good afternoon, this is', '   ... from the London office"', '2. confirm the CEO briefed you', '3. stress: STRICTLY confidential', '4. read out account details'];
  let left = Math.floor(typed * lines.join('').length);
  lines.forEach((ln, i) => { const n = Math.min(ln.length, Math.max(0, left)); left -= ln.length; if (n > 0) text(g, ln.slice(0, n), -280, -118 + i * 30 + (i === 0 ? -6 : 0), { font: "'Caveat'", weight: 700, size: i === 0 ? 40 : 28, color: i === 0 ? '#b5482e' : '#1d1b29' }); });
  g.restore();
  // letterhead of a FICTIONAL firm (clearly not real)
  g.save(); g.translate(1360, 860); g.rotate(0.05); g.fillStyle = '#ffffff'; g.fillRect(-200, -150, 400, 280);
  text(g, 'HARROW & VALE LLP', 0, -100, { font: "'Playfair Display'", weight: 700, size: 30, color: '#1d1b29', align: 'center' });
  text(g, 'LONDON · fictional', 0, -70, { font: 'Inter', weight: 600, size: 16, color: '#8a8478', align: 'center' });
  g.fillStyle = '#d9d3e8'; for (let i = 0; i < 6; i++) g.fillRect(-160, -40 + i * 28, 320 - (i % 2) * 80, 9);
  g.restore();
  // headset
  g.save(); g.translate(330, 880); g.strokeStyle = '#2b2440'; g.lineWidth = 16; g.beginPath(); g.arc(0, 0, 90, Math.PI, 0); g.stroke(); g.fillStyle = '#2b2440'; g.beginPath(); g.roundRect(-110, -10, 44, 70, 14); g.fill(); g.beginPath(); g.roundRect(66, -10, 44, 70, 14); g.fill(); g.lineWidth = 6; g.beginPath(); g.moveTo(-90, 50); g.quadraticCurveTo(-60, 120, 20, 110); g.stroke(); g.restore();
  // laptop showing a voice clone waveform
  g.fillStyle = '#16122a'; g.beginPath(); g.roundRect(820, 520, 400, 240, 14); g.fill();
  g.fillStyle = '#0c0a1c'; g.fillRect(834, 534, 372, 206);
  waveform(g, t, 850, 640, 340, 110, { color: '62,224,181', bars: 40 });
  text(g, 'voice model: "CEO"', 850, 562, { font: 'Inter', weight: 600, size: 16, color: '#3ee0b5' });
  g.fillStyle = '#2b2440'; g.beginPath(); g.moveTo(780, 760); g.lineTo(1260, 760); g.lineTo(1230, 780); g.lineTo(810, 780); g.closePath(); g.fill();
  glow(g, 1020, 640, 320, '62,224,181', 0.22);
  // shelf of binders on the back wall
  g.fillStyle = '#2a2045'; g.fillRect(120, 250, 560, 16);
  ['#4a2a8c', '#2b4a3a', '#5a1f2e', '#3a3156', '#4a2a8c', '#2b4a6a', '#5a3a2a'].forEach((c, i) => { g.fillStyle = c; g.fillRect(140 + i * 70, 110, 56, 140); g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(150 + i * 70, 140, 36, 10); });
  // burner phones
  [[1600, 940, 0.2], [1700, 960, -0.15], [1640, 1010, 0.05]].forEach(([x, y, r]) => { g.save(); g.translate(x, y); g.rotate(r); g.fillStyle = '#0a0812'; g.beginPath(); g.roundRect(-40, -70, 80, 140, 12); g.fill(); g.fillStyle = '#2a2050'; g.fillRect(-32, -60, 64, 110); g.restore(); });
  glow(g, 700, 600, 700, '255,190,120', 0.18);
}

// ---------------------------------------------------------------- 4. follow the money (light map)
export function moneyMap(g, t, o = {}) {
  const wall = g.createLinearGradient(0, 0, W, H); wall.addColorStop(0, '#f3edfc'); wall.addColorStop(1, '#ffe9de');
  g.fillStyle = wall; g.fillRect(0, 0, W, H);
  const proj = lightMap(g, 25, 32, 4.6 * (1 + 0.02 * Math.sin(t * 0.2)));
  const from = [[-74, 40.7, 'New York'], [-0.1, 51.5, 'London']];
  const to = [[-3.7, 40.4, 'Spain'], [23.7, 37.98, 'Greece'], [55.3, 25.2, 'UAE'], [103.8, 1.35, 'Singapore'], [121.5, 31.2, 'China']];
  const start = o.routesAt ?? 0.3;
  from.forEach(([lo, la, name], i) => { const [x, y] = proj([lo, la]); mapPin(g, t, start + i * 0.2, x, y, { color: '#e2412e' }); chip(g, name, x - 60, i === 1 ? y - 66 : y + 30, { size: 22, weight: 700, stroke: null, scale: 1 }); });
  to.forEach(([lo, la, name], k) => {
    const [bx, by] = proj([lo, la]);
    from.forEach(([flo, fla], i) => {
      const [ax, ay] = proj([flo, fla]), p = clamp((t - start - 0.4 - k * 0.25 - i * 0.1) / 1.4);
      if (p <= 0) return;
      const mx = (ax + bx) / 2, my = Math.min(ay, by) - 160 - k * 20;
      const bz = (u) => [(1 - u) ** 2 * ax + 2 * (1 - u) * u * mx + u * u * bx, (1 - u) ** 2 * ay + 2 * (1 - u) * u * my + u * u * by];
      g.save(); g.strokeStyle = 'rgba(74,42,140,0.55)'; g.lineWidth = 3; g.setLineDash([4, 12]); g.lineCap = 'round'; g.beginPath();
      for (let s = 0; s <= 40 * ez(p); s++) { const [px, py] = bz(s / 40); s ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke(); g.restore();
      // banknotes turning into coins as they travel
      for (let n = 0; n < 2; n++) {
        const u = ((t * 0.25 + n * 0.5 + k * 0.13 + i * 0.07) % 1);
        if (u > ez(p)) continue;
        const [px, py] = bz(u);
        if (u < 0.5) { g.save(); g.translate(px, py); g.rotate(Math.sin(t * 3 + n) * 0.3); g.fillStyle = '#9ad1a8'; g.fillRect(-16, -9, 32, 18); g.fillStyle = '#4f8f62'; g.fillRect(-5, -5, 10, 10); g.restore(); }
        else { g.fillStyle = '#ffc93c'; g.beginPath(); g.arc(px, py, 11, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#e0a82a'; g.lineWidth = 3; g.beginPath(); g.arc(px, py, 6, 0, Math.PI * 2); g.stroke(); }
      }
    });
    mapPin(g, t, start + 0.9 + k * 0.25, bx, by);
    chip(g, name, bx + 24, by - 20, { size: 22, weight: 700, stroke: null, scale: clamp((t - start - 1 - k * 0.25) * 3) });
  });
}
void mist; void lerp; void rand; void LAV;
