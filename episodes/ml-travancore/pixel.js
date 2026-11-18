// "Pixel diorama" look for the Travancore Short: a pixel-art miniature set (low-res, nearest-neighbour)
// seen from a high 3/4 angle, lit by practical lamps, with smooth light/fog/rain, tilt-shift focus band,
// heavy bloom and vignette. Sprites are stepped; everything else is smooth. No pure black: darkest = warm ink.
import { W, H, clamp, lerp, rand } from '../../pipeline/engine.js';
import { buf } from '../../pipeline/scenery.js';

export const S = 4;                          // one art pixel = 4 screen pixels
export const LW = W / S, LH = H / S;         // 270 x 480 art canvas
export const INK = '#1a1220';
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => v / 16);

export function px(c, x, y, w, h, col) { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
/** vertical gradient through a palette ramp, dithered (Bayer 4x4, narrow) */
export function ditherV(c, x, y, w, h, ramp, { width = 0.45 } = {}) {
  for (let j = 0; j < h; j++) { const u = j / Math.max(1, h - 1) * (ramp.length - 1);
    for (let i = 0; i < w; i++) { const b = (BAYER[((y + j) % 4) * 4 + ((x + i) % 4)] - 0.5) * width; const k = clamp(Math.round(u + b), 0, ramp.length - 1); c.fillStyle = ramp[k]; c.fillRect(x + i, y + j, 1, 1); } }
}
/** Kerala house in high 3/4 view: laterite walls, steep tiled roof, carved verandah, emissive windows */
export function house(c, t, x, y, w, { lit = [1, 1], seed = 1, wall = ['#6a3a2a', '#8a4e34', '#a8643e'], doorGlow = 0 } = {}) {
  const wh = 34, rh = 30, depth = 14;
  // side wall in shade, front wall in key
  px(c, x + w, y - wh, depth * 0.6, wh, '#3a2026');
  ditherV(c, x, y - wh, w, wh, wall.slice().reverse(), { width: 0.45 });
  // laterite block texture
  const r = rand(seed); for (let k = 0; k < 18; k++) px(c, x + 1 + r() * (w - 4), y - wh + 2 + r() * (wh - 4), 3, 1, 'rgba(60,24,20,0.5)');
  // verandah pillars
  for (let i = 0; i < 4; i++) px(c, x + 3 + i * (w - 8) / 3, y - 18, 2, 18, '#d8c8a8');
  // windows (emissive panes) and door
  [[x + 6, lit[0]], [x + w - 16, lit[1]]].forEach(([wx, on]) => { px(c, wx, y - wh + 8, 10, 8, on ? '#ffd27a' : '#2a1a24'); if (on) { px(c, wx + 1, y - wh + 9, 8, 2, '#fff0c0'); } px(c, wx + 4, y - wh + 8, 1, 8, INK); });
  px(c, x + w / 2 - 5, y - 16, 10, 16, doorGlow ? '#ffb85a' : '#2a1418');
  // steep roof: two planes of terracotta tiles, front plane lit, back plane dark, ridge
  for (let j = 0; j < rh; j++) { const inset = j * 0.5; const yy = y - wh - j; const ramp = ['#7a2a1e', '#a23a24', '#c4553a'];
    for (let i = -6 + inset; i < w + 6 - inset; i++) { const k = ((Math.floor(i) + (j % 2 ? 2 : 0)) % 5 === 0) ? 0 : (j % 3 === 0 ? 1 : 2); c.fillStyle = ramp[k]; c.fillRect(Math.floor(x + i), yy, 1, 1); } }
  px(c, x + 10, y - wh - rh, w - 20, 2, '#5a1e16');
  // rain-wet roof highlight from the street lamp (cool rim on the tiles)
  for (let i = 0; i < w; i += 3) px(c, x + i, y - wh - 2, 1, 1, 'rgba(200,220,255,0.6)');
}
/** a pixel sprite: villager in mundu (stepped, 2-frame idle). hero gets the saturated colour */
export function villager(c, t, x, y, { shirt = '#e8e0d0', skin = '#8a5a3a', hero = false, phase = 0, face = 1 } = {}) {
  const f = Math.floor(t * 1.5 + phase) % 2; const by = y - f;  // 2-frame idle bob, stepped
  px(c, x - 3, y, 7, 1, 'rgba(26,18,32,0.6)');                              // contact shadow
  px(c, x - 2, by - 8, 5, 8, '#f2eee4'); px(c, x - 2, by - 8, 1, 8, '#c8c0b0');  // mundu (white, selout left)
  px(c, x - 2, by - 15, 5, 7, hero ? '#1fb8a8' : shirt); px(c, x - 2, by - 15, 1, 7, hero ? '#127a70' : '#a8a090');
  px(c, x - 1 + (face > 0 ? 1 : 0), by - 19, 3, 4, skin); px(c, x - 1, by - 20, 4, 2, INK);   // head + hair
  px(c, x + (face > 0 ? 3 : -3), by - 14, 1, 5, skin);                       // arm
}
export function palm(c, t, x, y, h, seed = 0) {
  const sway = Math.round(Math.sin(t * 0.6 + seed) * 1.5);
  for (let j = 0; j < h; j++) px(c, x + Math.round(Math.sin(j / h * 1.2) * 4) + (j > h * 0.7 ? sway : 0), y - j, 2, 1, j % 4 ? '#3a2a22' : '#4a3628');
  const tx = x + Math.round(Math.sin(1.2) * 4) + sway, ty = y - h;
  for (let f = 0; f < 9; f++) { const a = -Math.PI + (f / 8) * Math.PI + Math.sin(t * 1.2 + f) * 0.03; for (let k = 0; k < 16; k++) { const u = k / 16; px(c, tx + Math.cos(a) * k * 1.3, ty + Math.sin(a) * k * 0.6 + u * u * 6, 1, 1, k % 3 ? '#2a4a2a' : '#3a6a34'); if (k % 2) px(c, tx + Math.cos(a) * k * 1.3, ty + Math.sin(a) * k * 0.6 + u * u * 6 + 1, 1, 2, '#1e3420'); } }
}

/** the June 1947 radio night: villagers gather at a lit shop on a rainy lane. Returns light positions (screen px) */
function streetArt(c, t) {
  // sky: dithered night ramp, never pure black
  ditherV(c, 0, 0, LW, 150, ['#1a1430', '#24204a', '#2e2c5a', '#3a3462']);
  for (let i = 0; i < 40; i++) { const r = rand(i); if (r() < 0.7) px(c, r() * LW, r() * 110, 1, 1, Math.sin(t * 2 + i) > 0.6 ? '#fff6dc' : '#8a86b0'); }
  px(c, 210, 26, 10, 10, '#f2ecd0'); px(c, 212, 28, 3, 3, '#d8d0b8');
  // far ridge + distant temple lamps
  for (let x = 0; x < LW; x++) { const h = 128 + Math.round(Math.sin(x * 0.05) * 6 + Math.sin(x * 0.13) * 3); for (let y = h; y < 160; y++) px(c, x, y, 1, 1, y - h < 2 ? '#3a3a62' : '#2a2a4a'); }
  // the lane: laterite road in 3/4, wet, with stepping-stone kerbs
  ditherV(c, 0, 160, LW, LH - 160, ['#3a2630', '#4a2e30', '#5a3832', '#6a4236'], { width: 0.45 });
  for (let y = 200; y < LH; y += 18) for (let x = (y / 18) % 2 ? 0 : 9; x < LW; x += 18) px(c, x, y, 8, 1, 'rgba(26,18,32,0.35)');
  // puddles (quantized reflections of the shop light)
  [[128, 334, 36], [40, 340, 24], [196, 344, 30]].forEach(([x, y, w], k) => { for (let j = 0; j < 6; j++) { const ww = Math.round(w * Math.sin(((j + 0.5) / 6) * Math.PI)); px(c, x + (w - ww) / 2, y + j, ww, 1, j < 2 ? '#3a3260' : '#2a2448'); }
    for (let j = 1; j < 5; j++) { const sh = (Math.floor(t * 4) + j + k) % 3 - 1; px(c, x + w / 2 - 3 + sh, y + j, 6 - j, 1, j % 2 ? '#ffd890' : '#e8a050'); } });
  // houses along the lane (far to near)
  house(c, t, 8, 200, 70, { lit: [1, 0], seed: 3 });
  house(c, t, 168, 214, 82, { lit: [0, 1], seed: 4 });
  palm(c, t, 92, 206, 70, 1); palm(c, t, 250, 240, 80, 2);
  // the radio shop: open front, warm interior, radio on the counter, signboard
  const sx = 70, sy = 300;
  px(c, sx, sy - 44, 110, 44, '#4a2a26'); ditherV(c, sx + 6, sy - 38, 98, 34, ['#ffe2a0', '#f2b860', '#c8783a'], { width: 0.22 });
  for (let k = 0; k < 2; k++) { px(c, sx + 8, sy - 34 + k * 10, 94, 1, '#8a5030'); for (let i = 0; i < 14; i++) px(c, sx + 10 + i * 6.6, sy - 39 + k * 10, 4, 5, ['#3a6a8a', '#8a3a2a', '#d8b048', '#4a7a3a'][(i + k) % 4]); }
  px(c, sx + 80, sy - 26, 14, 9, '#5a3018'); px(c, sx + 82, sy - 24, 10, 2, '#ffe0a0'); // a second radio on the shelf
  px(c, sx + 6, sy - 12, 98, 6, '#6a3a24'); px(c, sx + 46, sy - 22, 18, 10, '#7a4420'); px(c, sx + 48, sy - 20, 14, 3, '#ffe9b0'); px(c, sx + 50, sy - 15, 3, 3, '#3a1a10'); px(c, sx + 57, sy - 15, 3, 3, '#3a1a10');
  for (let j = 0; j < 14; j++) px(c, sx - 6 + j * 0.3, sy - 44 - j, 122 - j * 0.6, 1, j % 3 ? '#a23a24' : '#7a2a1e');
  px(c, sx + 28, sy - 66, 54, 10, '#1e3a2a'); px(c, sx + 30, sy - 64, 50, 6, '#2a5a3a');
  for (let i = 0; i < 9; i++) px(c, sx + 33 + i * 5, sy - 63, 3, 4, '#e8d8a0');   // signboard "lettering" (pixel blocks)
  // listeners gathered in front (stepped sprites); the hero in teal
  [[sx + 20, sy + 14, 0, 1], [sx + 34, sy + 20, 0.5, 1], [sx + 52, sy + 16, 1, -1, true], [sx + 70, sy + 22, 1.5, -1], [sx + 88, sy + 15, 0.3, -1], [sx + 104, sy + 24, 0.8, -1]].forEach(([x, y, ph, face, hero]) => villager(c, t, x, y, { phase: ph, face, hero: !!hero, shirt: ['#c8c0a8', '#b8a888', '#d8d0c0'][Math.floor(ph * 2) % 3] }));
  // near plane: low laterite wall and banana plants (out of focus below the band)
  for (let x = 0; x < LW; x++) { const top = 352 + Math.round(Math.sin(x * 0.2) * 1); px(c, x, top, 1, 10, (x % 9) ? '#7a4232' : '#5a2e26'); px(c, x, top, 1, 1, '#a8644a'); }
  [[20, 356], [150, 360], [240, 354]].forEach(([bx, by], k) => { for (let f = 0; f < 6; f++) { const a = -Math.PI / 2 + (f - 2.5) * 0.45 + Math.sin(t * 0.9 + k + f) * 0.05; for (let j = 0; j < 30; j++) { const w2 = Math.round(Math.sin(j / 30 * Math.PI) * 5); px(c, bx + Math.cos(a) * j - w2 / 2, by + Math.sin(a) * j * 1.2, w2 + 1, 1, j % 5 ? '#2e5a2a' : '#3e7a36'); } } px(c, bx - 1, by - 2, 3, 16, '#3a4a22'); });
  // street lamp post
  px(c, 230, 260, 2, 66, '#2a2030'); px(c, 226, 258, 10, 3, '#2a2030'); px(c, 228, 261, 6, 4, '#ffe2a0');
  return [[(sx + 55) * S, (sy - 20) * S, 1.0], [231 * S, 263 * S, 0.8], [13 * S, 175 * S, 0.5], [(168 + 66) * S, 188 * S, 0.5]];
}

/** compose: pixel art (nearest) + smooth light, fog, rain, tilt-shift, bloom, vignette. No grain. */
export function pixelStreet(g, t, o = {}) { compose(g, t, streetArt, { band: [0.36, 0.66], camZ: 2.05, focus: [500, 1150], to: [540, 980], ...o }); }
/** generic diorama compositor: art(c, t) draws the 270x480 pixel set and returns practical lights [x, y, level] in screen px */
export function compose(g, t, art, { band = [0.36, 0.66], camZ = 1, focus = [W / 2, H / 2], to = [W / 2, H / 2], fog = '120,120,190', fogA = 0.45, rainA = 1, warm = '255,200,120', blur = 12 } = {}) {
  const [a, ac] = buf('pxart', LW, LH); ac.imageSmoothingEnabled = false; ac.clearRect(0, 0, LW, LH);
  const lights = art(ac, t) || [];
  const [s, sg] = buf('pxsharp');
  sg.imageSmoothingEnabled = false; sg.save(); sg.translate(to[0], to[1]); sg.scale(camZ, camZ); sg.translate(-focus[0], -focus[1]); sg.drawImage(a, 0, 0, W, H);
  // practical lights: smooth, flickering (sum of sines, about ±20%), additive glow sprites + floor pools
  sg.globalCompositeOperation = 'lighter';
  lights.forEach(([x, y, lv], k) => { const fl = lv * (1 + 0.1 * Math.sin(t * 7 + k) + 0.1 * Math.sin(t * 13.3 + k * 2)); const r = 120 + 260 * Math.pow(fl, 1.3);
    const gg = sg.createRadialGradient(x, y, 2, x, y, r); gg.addColorStop(0, `rgba(${warm},${0.55 * fl})`); gg.addColorStop(0.25, `rgba(${warm},${0.2 * fl})`); gg.addColorStop(1, 'rgba(255,150,80,0)'); sg.fillStyle = gg; sg.fillRect(x - r, y - r, r * 2, r * 2); });
  sg.globalCompositeOperation = 'source-over';
  // fog: one colour per set (cool blue-violet), thicker far away
  const fg = sg.createLinearGradient(0, 380, 0, 1100); fg.addColorStop(0, `rgba(${fog},${fogA})`); fg.addColorStop(1, `rgba(${fog},0)`); sg.fillStyle = fg; sg.fillRect(0, 0, W, H);
  // rain: smooth slanted streaks, depth-scaled
  const r = rand(5); for (let i = 0; i < 380 * rainA; i++) { const d = r(), x = (r() * W + t * 60) % W, y = (r() * H + t * lerp(500, 1400, d)) % H, l = lerp(14, 40, d); sg.strokeStyle = `rgba(200,210,255,${lerp(0.15, 0.4, d)})`; sg.lineWidth = lerp(1, 2.5, d); sg.beginPath(); sg.moveTo(x, y); sg.lineTo(x - l * 0.2, y + l); sg.stroke(); }
  sg.restore();
  // tilt-shift: blur grows away from the sharp band (far above, near below)
  const [b, bg] = buf('pxblur'); bg.filter = `blur(${blur}px)`; bg.drawImage(s, 0, 0); bg.filter = 'none';
  bg.globalCompositeOperation = 'destination-out'; const m = bg.createLinearGradient(0, 0, 0, H);
  const [b0, b1] = band; m.addColorStop(0, 'rgba(0,0,0,0)'); m.addColorStop(Math.max(0, b0 - 0.18), 'rgba(0,0,0,0)'); m.addColorStop(b0, 'rgba(0,0,0,1)'); m.addColorStop(b1, 'rgba(0,0,0,1)'); m.addColorStop(Math.min(1, b1 + 0.06), 'rgba(0,0,0,0)'); m.addColorStop(1, 'rgba(0,0,0,0)');
  bg.fillStyle = m; bg.fillRect(0, 0, W, H);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(s, 0, 0); g.drawImage(b, 0, 0);
  // heavy bloom
  const [q, qg] = buf('pxbloom', W / 4, H / 4); qg.filter = 'brightness(0.9) contrast(2.2) blur(6px)'; qg.drawImage(g.canvas, 0, 0, W / 4, H / 4);
  g.globalCompositeOperation = 'screen'; g.globalAlpha = 0.55; g.drawImage(q, 0, 0, W, H); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  // vignette toward warm ink (never pure black)
  const vg = g.createRadialGradient(W / 2, H * 0.58, H * 0.22, W / 2, H * 0.58, H * 0.75); vg.addColorStop(0, 'rgba(26,18,32,0)'); vg.addColorStop(1, 'rgba(26,18,32,0.75)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
  g.restore();
}
