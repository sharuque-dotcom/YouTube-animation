// Cinderella Short: three grounded looks, one per act (native 9:16).
// Act 1 Humble: 1980 diner at night, tungsten + neon, film stock. Act 2 Rise: keynote, Nvidia green + gold.
// Act 3 Midnight: tabloid, black and white with red, camera flashes.
import { W, H, clamp, lerp, rand, text } from '../../pipeline/engine.js';
import { rain, glow, beam, buf } from '../../pipeline/scenery.js';

export const IMG = {};
export async function loadPhotos() {
  for (const n of ['007', '009', '036']) IMG[n] = await createImageBitmap(await (await fetch(`/episodes/short-nv3/photos/jensen-${n}-cut.png`)).blob());
}

// ---------------------------------------------------------------- shared
export function photo(g, img, cx, base, h, { rim = '255,200,140', sat = 1, bw = 0, key = 0.18, contrast = 1.08 } = {}) {
  const w = (img.width / img.height) * h;
  const [c, cg] = buf('cph', Math.ceil(w), Math.ceil(h));
  cg.filter = `saturate(${sat}) grayscale(${bw}) contrast(${contrast})`; cg.drawImage(img, 0, 0, w, h); cg.filter = 'none';
  cg.globalCompositeOperation = 'source-atop';
  const kg = cg.createLinearGradient(0, 0, w, 0); kg.addColorStop(0, `rgba(255,200,150,${key})`); kg.addColorStop(0.6, 'rgba(255,200,150,0)'); kg.addColorStop(1, 'rgba(30,30,60,0.25)'); cg.fillStyle = kg; cg.fillRect(0, 0, w, h);
  const [m, mg] = buf('cphr', Math.ceil(w), Math.ceil(h)); mg.drawImage(img, 0, 0, w, h); mg.globalCompositeOperation = 'source-in'; mg.fillStyle = `rgb(${rim})`; mg.fillRect(0, 0, w, h);
  for (const k of [cg, mg]) { k.globalCompositeOperation = 'destination-out'; const fo = k.createLinearGradient(0, h - 300, 0, h); fo.addColorStop(0, 'rgba(0,0,0,0)'); fo.addColorStop(1, 'rgba(0,0,0,1)'); k.fillStyle = fo; k.fillRect(0, h - 300, w, 300); }
  const x0 = cx - w / 2, y0 = base - h;
  g.save(); g.filter = 'blur(24px)'; g.globalAlpha = 0.5; g.drawImage(m, x0, y0); g.filter = 'none'; g.globalAlpha = 0.9; g.drawImage(m, x0 + 6, y0 - 3); g.globalAlpha = 1; g.drawImage(c, x0, y0); g.restore();
}
/** film stock: grade the whole frame (sepia/tint), gate weave, light leak, scratches, heavy grain */
export function filmGrade(g, t, { sepia = 0.45, leak = 0.5, seed = 1 } = {}) {
  const [c, cg] = buf('film'); cg.drawImage(g.canvas, 0, 0);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.filter = `sepia(${sepia}) contrast(1.12) saturate(1.1)`; g.drawImage(c, Math.sin(t * 13) * 1.5, Math.cos(t * 11) * 1.5); g.filter = 'none';
  g.globalCompositeOperation = 'lighter'; const lx = W * (0.8 + 0.15 * Math.sin(t * 0.7)); const lg = g.createRadialGradient(lx, 200, 10, lx, 200, 700); lg.addColorStop(0, `rgba(255,120,40,${0.35 * leak})`); lg.addColorStop(1, 'rgba(255,120,40,0)'); g.fillStyle = lg; g.fillRect(0, 0, W, H);
  g.globalCompositeOperation = 'source-over';
  const r = rand(Math.floor(t * 24) + seed); for (let i = 0; i < 3; i++) if (r() < 0.5) { g.fillStyle = 'rgba(255,240,220,0.18)'; g.fillRect(r() * W, 0, 2, H); }
  const vg = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(20,8,0,0.6)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
  g.restore();
}

// ---------------------------------------------------------------- act 1: the diner at night, Oregon, 1980
export function diner(g, t, { clock = '11:58' } = {}) {
  // sky: low cloud lit orange from below by the town's sodium lights (warm key from below, cool above)
  const sk = g.createLinearGradient(0, 0, 0, 760); sk.addColorStop(0, '#070912'); sk.addColorStop(0.6, '#1c1a24'); sk.addColorStop(1, '#4a2e22'); g.fillStyle = sk; g.fillRect(0, 0, W, H);
  const cr = rand(4); for (let i = 0; i < 26; i++) { const x = ((cr() * 1.4 - 0.2) * W + t * 8) % (W + 400) - 200, y = 120 + cr() * 520, rw = 160 + cr() * 260, rh = 40 + cr() * 60; const cg = g.createRadialGradient(x, y + rh * 0.6, 4, x, y, rw); cg.addColorStop(0, `rgba(120,70,50,${0.25 + (y / 760) * 0.3})`); cg.addColorStop(1, 'rgba(30,25,35,0)'); g.fillStyle = cg; g.beginPath(); g.ellipse(x, y, rw, rh, 0, 0, Math.PI * 2); g.fill(); }
  // far: hills and town lights; telephone poles with sagging wires
  g.fillStyle = '#0f1016'; g.beginPath(); g.moveTo(0, 760); for (let x = 0; x <= W; x += 40) g.lineTo(x, 720 - Math.sin(x * 0.005 + 1) * 50); g.lineTo(W, 800); g.lineTo(0, 800); g.fill();
  const tr = rand(8); for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(255,${170 + tr() * 50},90,${0.4 + tr() * 0.5})`; g.fillRect(tr() * W, 690 + tr() * 80, 3, 3); }
  g.strokeStyle = '#08080c'; g.lineWidth = 7; [70, 1010].forEach((x) => { g.beginPath(); g.moveTo(x, 200); g.lineTo(x, 800); g.stroke(); g.beginPath(); g.moveTo(x - 60, 240); g.lineTo(x + 60, 240); g.stroke(); });
  g.lineWidth = 2; for (const dy of [0, 14]) { g.beginPath(); g.moveTo(10, 244 + dy); g.quadraticCurveTo(540, 360 + dy, 1070, 244 + dy); g.stroke(); }
  // the diner: big, close, warm tungsten windows (key light spilling out)
  const by = 820, bh = 430;
  g.fillStyle = '#3a2a24'; g.fillRect(0, by - 60, W, 70); g.fillStyle = '#d9b860'; g.fillRect(0, by - 70, W, 14); // roof + trim (rim-lit)
  g.fillStyle = '#251c1e'; g.fillRect(0, by, W, bh);
  for (let i = 0; i < 4; i++) { const x = 30 + i * 262; const wg = g.createLinearGradient(0, by + 40, 0, by + 300); wg.addColorStop(0, '#ffe2a8'); wg.addColorStop(1, '#eaa456'); g.fillStyle = wg; g.fillRect(x, by + 40, 240, 270);
    g.fillStyle = 'rgba(140,50,40,0.6)'; g.fillRect(x, by + 230, 240, 80); g.fillStyle = 'rgba(80,30,20,0.6)'; g.fillRect(x + 20, by + 210, 200, 14); // booths + table
    g.strokeStyle = 'rgba(40,25,20,0.8)'; g.lineWidth = 6; g.strokeRect(x, by + 40, 240, 270); glow(g, x + 120, by + 170, 300, '255,190,110', 0.3); }
  // inside: the busboy carrying a tall stack of plates (moves slowly across), a customer hunched in a booth
  const bx = 120 + ((t * 40) % 760);
  g.fillStyle = '#2a1712'; g.beginPath(); g.ellipse(bx, by + 110, 20, 24, 0, 0, Math.PI * 2); g.fill(); g.fillRect(bx - 24, by + 132, 48, 120);
  g.fillStyle = '#f7f2e8'; for (let k = 0; k < 8; k++) g.fillRect(bx + 16, by + 150 - k * 8, 76, 6);
  g.fillStyle = '#2a1712'; g.beginPath(); g.ellipse(830, by + 190, 18, 20, 0, 0, Math.PI * 2); g.fill(); g.fillRect(808, by + 206, 50, 40);
  // pole sign, fully in frame, buzzing
  g.fillStyle = '#121016'; g.fillRect(760, 300, 22, 460);
  g.save(); g.translate(770, 300); g.fillStyle = '#1c0f14'; g.beginPath(); g.roundRect(-250, -130, 500, 240, 30); g.fill(); g.strokeStyle = '#ffcc66'; g.lineWidth = 6; g.shadowColor = '#ffcc66'; g.shadowBlur = 20; g.stroke();
  const buzz = Math.floor(t * 9) % 11 === 0 ? 0.3 : 1;
  g.shadowColor = '#ff4a5a'; g.shadowBlur = 34; text(g, "DENNY'S", 0, -14, { font: 'Jakarta', weight: 800, size: 100, color: `rgba(255,96,106,${buzz})`, align: 'center' });
  g.shadowColor = '#ffc04a'; text(g, 'OPEN 24 HOURS', 0, 72, { font: 'Jakarta', weight: 800, size: 44, color: '#ffd27a', align: 'center', spacing: 4 }); g.restore();
  glow(g, 770, 300, 560, '255,90,90', 0.3 * buzz);
  // streetlight on the left: sodium cone with rain caught inside (volumetric)
  g.fillStyle = '#0a0a0e'; g.fillRect(150, 420, 14, 840); g.fillRect(150, 420, 90, 10);
  beam(g, t, 236, 432, Math.PI / 2 + 0.08, { len: 900, spread: 0.32, color: '255,180,90', alpha: 0.28, motes: 30, seed: 2 });
  glow(g, 236, 436, 90, '255,190,110', 0.9);
  // wet parking lot: long reflections of the windows, sign and streetlight
  const rg = g.createLinearGradient(0, by + bh, 0, H); rg.addColorStop(0, '#191519'); rg.addColorStop(1, '#060508'); g.fillStyle = rg; g.fillRect(0, by + bh, W, H - by - bh);
  for (let i = 0; i < 4; i++) { const x = 30 + i * 262 + 120; for (let k = 0; k < 20; k++) { const y = by + bh + 16 + k * 22, w2 = 170 + Math.sin(t * 3 + k + i) * 30; g.fillStyle = `rgba(255,190,110,${0.18 - k * 0.008})`; g.fillRect(x - w2 / 2 + Math.sin(t * 2 + k) * 8, y, w2, 6); } }
  for (let k = 0; k < 20; k++) { g.fillStyle = `rgba(255,90,100,${0.2 - k * 0.009})`; g.fillRect(720 + Math.sin(t * 2.5 + k) * 10, by + bh + 16 + k * 22, 110, 5); }
  // a 1980 sedan in the foreground (silhouette, tail-lights glowing, roof rim-lit by the windows)
  g.save(); g.translate(560, 1520); g.fillStyle = '#0b0a0d'; g.beginPath(); g.moveTo(-430, 40); g.lineTo(-420, -40); g.lineTo(-250, -60); g.lineTo(-170, -140); g.lineTo(170, -140); g.lineTo(260, -60); g.lineTo(430, -40); g.lineTo(440, 40); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(255,200,140,0.55)'; g.lineWidth = 3; g.beginPath(); g.moveTo(-170, -140); g.lineTo(170, -140); g.lineTo(260, -60); g.stroke();
  g.fillStyle = '#060508'; [-270, 270].forEach((x) => { g.beginPath(); g.arc(x, 40, 62, 0, Math.PI * 2); g.fill(); });
  [-430, 430].forEach((x) => { g.fillStyle = '#ff2a2a'; g.fillRect(x - (x < 0 ? 0 : 14), -30, 14, 34); glow(g, x, -14, 120, '255,40,40', 0.5); }); g.restore();
  // the time card, pinned in the foreground
  g.save(); g.translate(300, 1700); g.rotate(-0.05); g.shadowColor = 'rgba(0,0,0,0.6)'; g.shadowBlur = 30; g.fillStyle = '#e2d8bf'; g.fillRect(-230, -100, 460, 200); g.shadowColor = 'transparent';
  text(g, 'TIME CARD · NIGHT SHIFT', 0, -50, { font: 'Jakarta', weight: 800, size: 26, color: '#2a2420', align: 'center' });
  text(g, `OUT  ${clock} PM`, 0, 30, { font: "'JetBrains Mono'", weight: 800, size: 46, color: '#8a1d1d', align: 'center' }); g.restore();
  rain(g, t, { n: 800, alpha: 0.4, angle: 0.12 });
}

// ---------------------------------------------------------------- act 2: the keynote, the king of AI
export function keynote(g, t, { value = '$5 TRILLION' } = {}) {
  g.fillStyle = '#020403'; g.fillRect(0, 0, W, H);
  // giant LED wall: green field with moving data lines
  const sx = 40, sy = 160, sw = W - 80, sh = 760;
  const lg = g.createLinearGradient(0, sy, 0, sy + sh); lg.addColorStop(0, '#0c2a06'); lg.addColorStop(1, '#173f0a'); g.fillStyle = lg; g.fillRect(sx, sy, sw, sh);
  for (let i = 0; i < 26; i++) { const r = rand(i + 3); const y = sy + r() * sh, ph = (t * (0.3 + r()) + r()) % 1; g.fillStyle = `rgba(150,230,60,${0.25 + r() * 0.3})`; g.fillRect(sx + ph * sw, y, 120 + r() * 200, 3); }
  g.strokeStyle = 'rgba(118,185,0,0.7)'; g.lineWidth = 4; g.strokeRect(sx, sy, sw, sh);
  // the number on the wall, gold with bloom
  g.save(); g.shadowColor = 'rgba(255,200,60,0.9)'; g.shadowBlur = 50; text(g, value, W / 2, 360, { font: 'Jakarta', weight: 800, size: 130, color: '#ffd23c', align: 'center' }); g.restore();
  text(g, 'FIRST COMPANY IN HISTORY', W / 2, 440, { font: 'Jakarta', weight: 800, size: 34, color: '#d9ffb0', align: 'center', spacing: 6 });
  // stage + key spotlights crossing on him
  g.fillStyle = '#0b0d0a'; g.fillRect(0, 1180, W, 120); g.fillStyle = 'rgba(180,255,120,0.3)'; g.fillRect(0, 1180, W, 3);
  beam(g, t, 200, -80, Math.PI / 2 - 0.35, { len: 1500, spread: 0.07, color: '255,240,210', alpha: 0.32, motes: 50, seed: 3 });
  beam(g, t, 880, -80, Math.PI / 2 + 0.35, { len: 1500, spread: 0.07, color: '255,240,210', alpha: 0.32, motes: 50, seed: 4 });
  photo(g, IMG['009'], W / 2, 1300, 900, { rim: '180,255,120', key: 0.2 });
  // gold confetti, depth-scaled (near = big and fast)
  const r = rand(9); for (let i = 0; i < 140; i++) { const d = r(), x = (r() * W + Math.sin(t * 2 + i) * 30), y = ((r() * H + t * lerp(80, 320, d)) % H), s = lerp(5, 18, d);
    g.save(); g.translate(x, y); g.rotate(t * (2 + d * 6) + i); g.fillStyle = r() < 0.7 ? `rgba(255,${190 + r() * 50},60,${0.5 + d * 0.5})` : `rgba(150,230,60,${0.5 + d * 0.5})`; g.fillRect(-s / 2, -s / 4, s, s / 2); g.restore(); }
  // the crowd: phone lights in depth (far small/dim, near big/bright)
  g.fillStyle = '#030403'; g.fillRect(0, 1300, W, H - 1300);
  for (let row = 0; row < 7; row++) { const d = row / 6, y = 1320 + Math.pow(d, 1.3) * 560, s = lerp(0.4, 1.6, d), rr = rand(row + 30);
    for (let x = -20; x < W + 40; x += 70 * s) { g.fillStyle = '#060806'; g.beginPath(); g.ellipse(x, y + 20 * s, 26 * s, 32 * s, 0, 0, Math.PI * 2); g.fill(); g.fillRect(x - 34 * s, y + 46 * s, 68 * s, 80 * s);
      if (rr() < 0.35) { const lx = x + 12 * s, ly = y - 30 * s + Math.sin(t * 2 + x) * 4 * s; glow(g, lx, ly, 30 * s, '230,240,255', 0.5); g.fillStyle = '#eef4ff'; g.fillRect(lx - 6 * s, ly - 10 * s, 12 * s, 20 * s); } } }
}

// ---------------------------------------------------------------- act 3: midnight, the tabloid storm
export function tabloid(g, t, { stamp = 1 } = {}) {
  g.fillStyle = '#0a0a0a'; g.fillRect(0, 0, W, H);
  // newspapers scattered (depth: back ones small and grey)
  const heads = [['NVIDIA CEO RESIGNS', 0.95], ['THIRD AFFAIR REPORTED', 0.8], ['BOARD ACTS', 0.6], ['$300B WIPED?', 0.0]];
  heads.slice(0, 3).forEach(([h, d], k) => { g.save(); g.translate(540 + (k - 1) * 120, 640 + k * 300); g.rotate((k - 1) * 0.12); const s = lerp(0.6, 0.8, d); g.scale(s, s);
    g.fillStyle = '#e8e4da'; g.fillRect(-380, -230, 760, 460); g.fillStyle = '#111'; g.fillRect(-340, -200, 680, 8);
    text(g, 'THE DAILY', -340, -150, { font: "'Playfair Display'", weight: 900, size: 40, color: '#111' });
    text(g, h, 0, -50, { font: "'Playfair Display'", weight: 900, size: 58, color: '#111', align: 'center' });
    g.fillStyle = 'rgba(20,20,20,0.35)'; for (let i = 0; i < 6; i++) { g.fillRect(-340, 10 + i * 30, 320, 9); g.fillRect(20, 10 + i * 30, 320, 9); } g.restore(); });
  // him, in black and white, with a red rim
  photo(g, IMG['007'], W / 2, 1420, 1050, { rim: '255,40,60', bw: 1, sat: 0, contrast: 1.3, key: 0.05 });
  // camera flashes: each builds over ~8 frames, decays over ~10, from the edges
  const fr = rand(5); for (let k = 0; k < 9; k++) { const per = 0.7 + fr() * 1.4, ph = ((t + fr() * 3) % per) / per, x = fr() < 0.5 ? fr() * 160 : W - fr() * 160, y = 300 + fr() * 1200;
    const a = ph < 0.27 / per ? ph / (0.27 / per) : Math.max(0, 1 - (ph - 0.27 / per) / (0.33 / per)); if (a > 0) { glow(g, x, y, 420, '255,255,255', 0.75 * a); g.fillStyle = `rgba(255,255,255,${0.05 * a})`; g.fillRect(0, 0, W, H); } }
  // midnight clock (top), the stamp
  g.save(); g.translate(W / 2, 240); g.strokeStyle = '#e8e4da'; g.lineWidth = 8; g.beginPath(); g.arc(0, 0, 110, 0, Math.PI * 2); g.stroke();
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; g.fillStyle = '#e8e4da'; g.fillRect(Math.cos(a) * 90 - 3, Math.sin(a) * 90 - 3, 6, 6); }
  g.strokeStyle = '#ff3b4e'; g.lineWidth = 10; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -80); g.stroke(); g.lineWidth = 7; g.beginPath(); g.moveTo(0, 0); g.lineTo(4, -58); g.stroke(); g.restore();
  text(g, 'MIDNIGHT', W / 2, 400, { font: 'Jakarta', weight: 800, size: 40, color: '#e8e4da', align: 'center', spacing: 14 });
  if (stamp) { g.save(); g.translate(W / 2, 1080); g.rotate(-0.12); g.strokeStyle = '#ff2a3a'; g.lineWidth = 14; g.beginPath(); g.roundRect(-400, -100, 800, 200, 24); g.stroke(); g.shadowColor = '#ff2a3a'; g.shadowBlur = 20; text(g, 'RESIGNED', 0, 50, { font: 'Jakarta', weight: 800, size: 140, color: '#ff2a3a', align: 'center' }); g.restore(); }
  // halftone print texture over everything
  g.save(); g.globalAlpha = 0.08; g.fillStyle = '#fff'; for (let y = 0; y < H; y += 9) for (let x = (y / 9) % 2 ? 4 : 0; x < W; x += 9) g.fillRect(x, y, 2, 2); g.restore();
}
