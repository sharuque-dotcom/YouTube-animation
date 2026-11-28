// 1957 EMS government (kit formula): hook = Delhi's stamp slams on a ballot box -> what if Delhi hadn't thrown out the
// government the people voted in; 1957 red flags + 65/126 seats; you-see (EMS, eviction stay order), two bills (land to
// the tiller, teachers paid by the government), the front (NSS, Church, League, Congress) -> Vimochana Samaram, firings
// (Angamaly, Pulluvila), wait...? majority intact but Article 356 on 31 July 1959 -> OUT, umpire analogy, 1960 twist
// (votes up, seats down), 356 becomes a habit (100+), the what-if, callback (ballot box in, a paper out), question + subscribe.
// Sets: ./sets.js (assembly, field, street, delhi, ground). Red look: red flags/velvet/dusk + redEdge() + warm grade.
// 3D-CAMERA SAMPLE (28 Nov): same story as ml-ems, re-shot with a camera that never stops: every shot is a real
// dolly / orbit / crane move around its subject (fly()), wider lens, 2-sample motion blur, dust motes in the air for
// parallax, shallower depth of field, and 2D cards that drift with the camera so they sit in the world.
const ML = "'Noto Malayalam'";
import { W, H, clamp, lerp } from '../../pipeline/engine.js';
import { ALIGN } from './align.js';
function text(g, str, x, y, o = {}) { g.save(); let sz = o.size || 48; const f = () => `${o.weight || 800} ${sz}px ${o.font || ML}`; g.font = f(); if (o.maxWidth) while (g.measureText(str).width > o.maxWidth && sz > 12) { sz -= 2; g.font = f(); }
  g.textAlign = o.align || 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; if (o.stroke) { g.lineWidth = o.strokeWidth || sz * 0.15; g.strokeStyle = o.stroke; g.strokeText(str, x, y); } g.fillStyle = o.color || '#fff'; g.fillText(str, x, y); g.restore(); }



let K = null, B = null, S = null, stage = null, camera = null, THREE = null, PROPS = null;
const ez = (x) => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };
const ezo = (x) => 1 - Math.pow(1 - clamp(x, 0, 1), 3);
const span = (t, a, d) => clamp((t - a) / d, 0, 1);

export async function preload() {
  K = await import('../../pipeline/toon3d.js'); THREE = K.THREE; B = await import('../../pipeline/bean.js'); PROPS = B.PROPS;
  (await import('./cast.js')).registerCast(B);
  const E = await import('./sets.js');
  S = { assembly: E.assemblySet(), field: E.fieldSet(), street: E.streetSet(), delhi: E.delhiSet(), ground: E.groundSet() };
  buildCast();
  stage = K.makeInkStage(W, H); camera = new THREE.PerspectiveCamera(52, W / H, 0.05, 900);
}
// ------------------------------------------------------------------ actors
function actor(scene, who, x, z, y = 0, scale = 1) { const c = K.card(who, {}, { scale }); c.position.set(x, y, z); scene.add(c); return { c, who, last: '', seed: (Math.abs(x) * 13.1 + Math.abs(z) * 7.7) % 9, base: [x, y, z] }; }
function pose(a, o, t) {
  a.c.visible = true; const blinkPh = (t + a.seed) % 3.1, blink = blinkPh < 0.12 ? 1 : 0; const o2 = { ...o, blink: o.blink ?? blink };
  if (typeof o2.propR === 'string') o2.propR = PROPS[o2.propR]; if (typeof o2.propL === 'string') o2.propL = PROPS[o2.propL];
  const key = JSON.stringify({ ...o, blink: o2.blink }); if (key !== a.last) { a.c.userData.set(o2); a.last = key; }
  const m = a.c.userData.cardMesh; m.rotation.z = Math.sin(t * 1.4 + a.seed) * 0.03 + (o.lean || 0); m.position.y = Math.abs(Math.sin(t * 2.8 + a.seed)) * 0.012 + (o.hop || 0);
}
const hopAt = (t, k = 7, amt = 0.08, ph = 0) => Math.max(0, Math.sin(t * k + ph)) * amt;
const at = (a, x, y, z) => a.c.position.set(x, y, z);

// camera
function camAt(keys, tt) {
  let i = 0; while (i < keys.length - 2 && tt > keys[i + 1][0]) i++;
  const [t0, p0, l0, r0 = 0, f0 = 52] = keys[i], [t1, p1, l1, r1 = r0, f1 = f0] = keys[Math.min(i + 1, keys.length - 1)];
  const u = t1 > t0 ? (i === 0 ? ezo((tt - t0) / (t1 - t0)) : ez((tt - t0) / (t1 - t0))) : 1;
  return { p: p0.map((v, k) => lerp(v, p1[k], u)), l: l0.map((v, k) => lerp(v, l1[k], u)), r: lerp(r0, r1, u), f: lerp(f0, f1, u) };
}
function place(c, t, shake = 0, big = 1) {
  const n = (a, b) => Math.sin(t * a + b) * 0.5 + Math.sin(t * a * 2.3 + b * 1.7) * 0.25;
  camera.fov = c.f; camera.updateProjectionMatrix(); camera.position.set(c.p[0] + (n(0.9, 1) * 0.02 + shake * n(40, 2) * 0.06) * big, c.p[1] + (n(0.7, 2) * 0.015 + shake * n(37, 5) * 0.05) * big, c.p[2]);
  camera.up.set(0, 1, 0); camera.lookAt(c.l[0] + n(0.5, 3) * 0.02 * big, c.l[1] + n(0.6, 4) * 0.015 * big, c.l[2]); camera.rotateZ(c.r + n(0.4, 6) * 0.008 + shake * n(45, 1) * 0.02);
}
// ------------------------------------------------------------------ the flying camera
// Each shot's keyframes give the subject and a base framing; fly() turns that into a continuous move: orbit (radians
// around the look point), dolly (distance factor) and crane (height, in units of distance). Fast start, never stops.
const MOVES = [
  { orb: [-0.50, 0.22], dol: [1.45, 0.74], cr: [-0.14, 0.08], tr: [-0.22, 0.18] }, // push in, arcing right
  { orb: [0.46, -0.24], dol: [1.0, 0.72], cr: [0.24, -0.06], tr: [0.24, -0.16] },  // descending arc left
  { orb: [-0.16, 0.16], dol: [0.74, 1.3], cr: [-0.08, 0.24], tr: [0.1, -0.1] },    // pull back + crane up: reveal
  { orb: [0.55, -0.12], dol: [1.2, 0.8], cr: [-0.18, -0.08], tr: [-0.28, 0.2] },   // low arc, hero angle
  { orb: [-0.40, 0.40], dol: [1.05, 0.88], cr: [0.03, 0.03], tr: [0.3, -0.3] },    // orbit + truck
];
let DRIFT = 0;
function fly(c, sh, tt) {
  const m = MOVES[sh.mv % MOVES.length], d = Math.max(0.6, sh.b - sh.a);
  const x = clamp(tt / Math.min(d, 3.2), 0, 1.25), u = 0.45 * x + 0.55 * ezo(Math.min(x, 1)) + (x > 1 ? 0 : 0);
  const off = c.p.map((v, q) => v - c.l[q]), dist = Math.hypot(...off), wide = dist > 20 ? 0.55 : 1;
  const az = lerp(m.orb[0], m.orb[1], u) * wide, k = lerp(1 + (m.dol[0] - 1) * wide, 1 + (m.dol[1] - 1) * wide, u), cr = lerp(m.cr[0], m.cr[1], u) * dist * wide;
  const ca = Math.cos(az), sa = Math.sin(az); const ox = off[0] * ca + off[2] * sa, oz = -off[0] * sa + off[2] * ca;
  // truck: slide camera and look point sideways together (strong parallax), the look point half as much
  const tr = lerp(m.tr[0], m.tr[1], u) * Math.min(dist, 12) * wide, rl = Math.hypot(oz, ox) || 1, rx = oz / rl, rz = -ox / rl;
  const p = [c.l[0] + ox * k + rx * tr, Math.max(0.35, c.l[1] + off[1] * k + cr), c.l[2] + oz * k + rz * tr];
  const l = [c.l[0] + rx * tr * 0.5, c.l[1], c.l[2] + rz * tr * 0.5];
  DRIFT = -az * 180 - tr * 30; return { ...c, p, l, f: c.f + 6 };
}
let DUST = null;
function dustFor(scene) { if (scene.userData.dust) return scene.userData.dust; if (!DUST) { const cv = document.createElement('canvas'); cv.width = cv.height = 64; const g = cv.getContext('2d'); const rg = g.createRadialGradient(32, 32, 0, 32, 32, 32); rg.addColorStop(0, 'rgba(255,214,150,1)'); rg.addColorStop(0.35, 'rgba(255,200,130,.45)'); rg.addColorStop(1, 'rgba(255,220,180,0)'); g.fillStyle = rg; g.fillRect(0, 0, 64, 64); DUST = new THREE.CanvasTexture(cv); }
  const N = 220, pos = new Float32Array(N * 3); let r = 7; const R = () => ((r = (r * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < N; i++) { pos[i * 3] = (R() - 0.5) * 2.4; pos[i * 3 + 1] = (R() - 0.3) * 1.0; pos[i * 3 + 2] = (R() - 0.2) * 2.0; }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.05, map: DUST, transparent: true, opacity: 0.32, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true }));
  pts.userData.noInk = true; pts.frustumCulled = false; scene.add(pts); scene.userData.dust = pts; return pts; }
const shakeAt = (t, t0, d = 0.5) => (t >= t0 && t < t0 + d ? Math.pow(1 - (t - t0) / d, 2) : 0);
const cw = (ch) => (/[0-9]/.test(ch) ? 7 : 1);
function wt(s, i, needle) { const line = s.line(i), a = s.cue(i), b = s.cueEnd(i); const k = Math.max(0, line.indexOf(needle));
  const al = ALIGN[i]; if (al && al.length === line.split(/\s+/).length) { const ws = line.split(/\s+/), wi = line.slice(0, k).split(/\s+/).length - 1, off = k - ws.slice(0, wi).join(' ').length - (wi ? 1 : 0), t0 = al[wi][1], t1 = wi + 1 < al.length ? al[wi + 1][1] : b - a; return a + t0 + (t1 - t0) * Math.max(0, off) / Math.max(1, ws[wi].length); }
  let pre = 0, tot = 0; for (let j = 0; j < line.length; j++) { const c = cw(line[j]); tot += c; if (j < k) pre += c; } return a + (pre / tot) * (b - a); }


function tidy(list) {
  const n = list.length; for (let i = 1; i < n; i++) { const lo = list[i - 1].a + 0.6, hi = i + 1 < n ? list[i + 1].a - 0.6 : 1e9; if (list[i].a < lo) list[i].a = Math.min(lo, Math.max(list[i - 1].a + 0.3, (list[i - 1].a + hi) / 2)); }
  for (let i = 0; i < n; i++) list[i].b = i + 1 < n ? list[i + 1].a : list[i].b;
  const out = []; list.forEach((x) => { const d = x.b - x.a; if (d <= 2.4 || x.b > 1e8) { out.push(x); return; } const k = Math.ceil(d / 2.1), step = d / k;
    for (let j = 0; j < k; j++) { if (!j) { out.push({ ...x, b: x.a + step }); continue; } const side = j % 2 ? 1 : -1, push = 0.2 + 0.08 * j, far = Math.hypot(...x.keys[0][1].map((v, q) => v - x.keys[0][2][q])) > 20 ? 6 : 1;
      const keys = x.keys.map(([t, p, l, r = 0, f = 52]) => [t, p.map((v, q) => v + (l[q] - v) * push + (q === 0 ? side * 0.25 * far : q === 1 ? 0.1 * far : 0)), l, -r + side * 0.03, f - 4]);
      out.push({ ...x, a: x.a + j * step, b: j === k - 1 ? x.b : x.a + (j + 1) * step, keys, flash: null }); } });
  return out;
}


let BLUR = null; const MBLUR = false; // 2-sample blur doubles render time; off for now
function draw3D(sh, t) {
  const set = S[sh.set]; const tt = t - sh.a; set.life.forEach((f) => f(t)); resetProps(); sh.act(t, tt, sh);
  const c0 = camAt(sh.keys, 0), c = fly(camAt(sh.keys, tt), sh, tt); const dist = Math.hypot(...c.p.map((v, q) => v - c.l[q]));
  const dust = dustFor(set.scene), d0 = Math.hypot(...c0.p.map((v, q) => v - c0.l[q])), sc = Math.min(d0, 14); dust.position.set(...c0.l); dust.scale.setScalar(sc); dust.material.size = 0.018 * sc;
  dust.rotation.y = t * 0.03; dust.position.y = c0.l[1] - sc * 0.15 + Math.sin(t * 0.4) * 0.05;
  place(c, t, sh.shake != null ? shakeAt(t, sh.shake, 0.5) : 0, dist > 25 ? 5 : 1); camera.updateMatrixWorld();
  const gr = sh.night ? GRADE.night : GRADE[sh.set];
  return stage.render(set.scene, camera, { focus: Math.min(dist, 30), aperture: dist > 25 ? 2.5 : 11, maxR: 20, ...gr, sat: sh.war ? 0.6 : gr.sat });
}
function renderShot(g, sh, t, alpha = 1) {
  // 2-sample motion blur: the frame half a frame earlier, blended 50/50 with this one (180-degree shutter look)
  if (!BLUR) { BLUR = document.createElement('canvas'); BLUR.width = W; BLUR.height = H; }
  const bg = BLUR.getContext('2d'); bg.globalAlpha = 1; if (MBLUR) bg.drawImage(draw3D(sh, Math.max(sh.a, t - 1 / 60)), 0, 0, W, H);
  const cur = draw3D(sh, t); bg.globalAlpha = MBLUR ? 0.5 : 1; bg.drawImage(cur, 0, 0, W, H); bg.globalAlpha = 1; const cv = BLUR;
  g.save(); g.globalAlpha = alpha;
  if (sh.dream) { g.filter = 'saturate(0.45) brightness(1.06)'; const N = 48, sh2 = H / N; for (let i = 0; i < N; i++) { const dx = Math.sin(i * 0.35 + t * 3) * 10; g.drawImage(cv, 0, i * sh2 * (cv.height / H), cv.width, sh2 * (cv.height / H) + 1, dx, i * sh2, W, sh2 + 1); } g.filter = 'none';
    const rg = g.createRadialGradient(W / 2, H / 2, W * 0.35, W / 2, H / 2, H * 0.62); rg.addColorStop(0, 'rgba(255,255,255,0)'); rg.addColorStop(1, 'rgba(255,255,255,.75)'); g.fillStyle = rg; g.fillRect(0, 0, W, H);
  } else g.drawImage(cv, 0, 0, W, H);
  if (sh.war) { g.fillStyle = 'rgba(160,40,20,.28)'; g.fillRect(0, 0, W, H); }
  redEdge(g);
  g.restore();
  if (sh.flash != null) { const k = t - sh.flash, a = k < 0 ? 0 : k < 0.27 ? 0 : k < 0.6 ? 1 - (k - 0.27) / 0.33 : 0; const pre = Math.max(0, 1 - Math.abs(k) / 0.27); g.save(); g.globalAlpha = Math.max(a, pre) * 0.9 * alpha; g.fillStyle = '#fff'; g.fillRect(0, 0, W, H); g.restore(); }
  g.save(); g.translate(DRIFT, 0); overlays(g, t, alpha); g.restore();
}

function tag(g, t, b, alpha) { const p = ezo(span(t, b.t0, 0.3)); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1480); g.rotate(-0.05); g.scale(0.8 + 0.2 * p, 0.8 + 0.2 * p);
  g.font = `800 84px ${ML}`; const w = Math.min(980, g.measureText(b.txt).width + 110); g.fillStyle = '#c8312c'; g.strokeStyle = '#2a1c17'; g.lineWidth = 9; g.beginPath(); g.roundRect(-w / 2, -80, w, b.sub ? 220 : 160, 24); g.fill(); g.stroke();
  text(g, b.txt, 0, 0, { size: 84, color: '#fff6d0', maxWidth: w - 60 }); if (b.sub) text(g, b.sub, 0, 92, { size: 56, color: '#f6d24a', maxWidth: w - 60 }); g.restore(); }
function badge(g, t, b, alpha) {
  const p = ezo(span(t, b.t0, 0.27)); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1480); g.rotate(-0.04); g.scale(0.8 + 0.2 * p, 0.8 + 0.2 * p);
  g.font = `800 88px ${ML}`; const w = Math.min(980, g.measureText(b.txt).width + 120);
  g.fillStyle = '#f6d24a'; g.strokeStyle = '#2a1c17'; g.lineWidth = 10; g.beginPath(); g.roundRect(-w / 2, -90, w, b.sub ? 230 : 180, 26); g.fill(); g.stroke();
  text(g, b.txt, 0, 0, { font: /^[0-9 ]+$/.test(b.txt) ? "'Oswald'" : ML, weight: 800, size: 88, color: '#2a1c17', align: 'center', maxWidth: w - 60 }); if (b.sub) text(g, b.sub, 0, 92, { font: /[a-zA-Z0-9]/.test(b.sub) && !/[ഀ-ൿ]/.test(b.sub) ? "'Oswald'" : ML, weight: 700, size: 56, color: '#8a1e1e', align: 'center', maxWidth: w - 60 }); g.restore();
}
function bubble(g, t, b, alpha) {
  const p = ezo(span(t, b.t0, 0.25)); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W * b.x, H * b.y); g.scale(0.7 + 0.3 * p, 0.7 + 0.3 * p);
  g.font = `800 76px ${ML}`; const w = Math.min(980, g.measureText(b.txt).width + 100);
  g.fillStyle = '#ffffff'; g.strokeStyle = '#2a1c17'; g.lineWidth = 9; g.beginPath(); g.roundRect(-w / 2, -80, w, 160, 60); g.moveTo(-40, 78); g.lineTo(-90, 170); g.lineTo(20, 78); g.fill(); g.stroke();
  g.fillStyle = '#ffffff'; g.fillRect(-36, 66, 52, 20); text(g, b.txt, 0, 4, { size: 76, color: '#2a1c17', maxWidth: w - 60 }); g.restore();
}
function stamp(g, t, b, alpha) {
  const k = span(t, b.t0, 0.25); if (k <= 0) return; const sc = lerp(2.2, 1, ezo(k)); g.save(); g.globalAlpha = alpha * Math.min(1, k * 3); g.translate(W / 2, 1420); g.rotate(-0.12); g.scale(sc, sc);
  g.strokeStyle = '#d0281e'; g.lineWidth = 14; g.beginPath(); g.roundRect(-400, -120, 800, 240, 24); g.stroke(); g.lineWidth = 5; g.beginPath(); g.roundRect(-376, -96, 752, 192, 16); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(-370, -90, 740, 180); text(g, b.txt, 0, -18, { size: 92, color: '#d0281e', maxWidth: 720 }); text(g, b.sub, 0, 62, { font: "'Oswald'", weight: 700, size: 54, color: '#d0281e' }); g.restore();
}
function bigNum(g, t, b, alpha) {
  const p = ezo(span(t, b.t0, 0.3)); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1330); g.scale(0.7 + 0.3 * p, 0.7 + 0.3 * p);
  let txt = b.txt; if (b.count) { const n = parseInt(b.txt.replace(/[^0-9]/g, ''), 10), u = ezo(span(t, b.t0, 0.9)), v = Math.round(n * u), pre = b.txt.startsWith('₹') ? '₹' : '', suf = b.txt.endsWith('+') ? '+' : ''; txt = pre + (n >= 1000 ? v.toLocaleString('en-IN') : String(v)) + suf; }
  text(g, txt, 0, 0, { font: /^[0-9₹,+ a-zA-Z]+$/.test(b.txt) ? "'Oswald'" : ML, weight: 800, size: /^[0-9₹,+ a-zA-Z]+$/.test(b.txt) ? 190 : 120, color: '#f6d24a', stroke: '#2a1c17', strokeWidth: 24, maxWidth: 1000 });
  text(g, b.sub, 0, 150, { size: 64, color: '#ffffff', stroke: '#2a1c17', strokeWidth: 14, maxWidth: 980 }); g.restore();
}
// captions: 1-2 words at the very top (owner's call), synced to the take's word times
function captions(g, s) {
  const t = s.t; let li = -1; for (let i = 0; s.line(i); i++) if (t >= s.cue(i) - 0.05 && t < s.cueEnd(i) + 0.15) li = i; if (li < 0) return;
  const words = s.line(li).split(/\s+/), a = s.cue(li), b = s.cueEnd(li), wl = (w) => [...w].reduce((x, ch) => x + cw(ch), 0), tot = words.reduce((x, w) => x + wl(w) + 2, 0); let acc = 0;
  const al = ALIGN[li] && ALIGN[li].length === words.length ? ALIGN[li] : null; const ws = words.map((w, q) => { const t0 = al ? a + al[q][1] : a + (acc / tot) * (b - a); acc += wl(w) + 2; return [w, t0]; });
  const chunks = []; for (let i = 0; i < ws.length;) { const n = ws[i][0].length > 9 || (ws[i + 1] && ws[i + 1][0].length > 9) ? 1 : 2; chunks.push(ws.slice(i, i + n)); i += n; }
  let k = 0; while (k + 1 < chunks.length && t >= chunks[k + 1][0][1]) k++;
  const str = chunks[k].map(([w]) => w).join(' '), p = ezo(span(t, chunks[k][0][1], 0.12)), sc = 0.88 + 0.12 * p;
  g.save(); g.translate(W / 2, 290); g.scale(sc, sc); g.font = `800 92px ${ML}`; const fsz = Math.min(92, 92 * 940 / (g.measureText(str).width + 1)); g.font = `800 ${fsz}px ${ML}`;
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineWidth = fsz * 0.22; g.strokeStyle = '#120c0a'; g.strokeText(str, 0, 0); g.fillStyle = '#ffffff'; g.fillText(str, 0, 0); g.restore();
}
let SH = null;
function main(g, s) {
  if (!SH) SH = shots(s);
  const t = s.t; let i = SH.findIndex((x) => t >= x.a && t < x.b); if (i < 0) i = t < SH[0].a ? 0 : SH.length - 1;
  const sh = SH[i], prev = SH[i - 1], XF = 0.3;
  if (prev && prev.set !== sh.set && t < sh.a + XF) { renderShot(g, prev, t); renderShot(g, sh, t, ez((t - sh.a) / XF)); } else renderShot(g, sh, t);
  captions(g, s);
}
function end(g, s) { main(g, s); }
export const scenes = { main, end };
function redEdge(g) { const rg = g.createRadialGradient(W / 2, H * 0.48, W * 0.42, W / 2, H * 0.5, H * 0.66); rg.addColorStop(0, 'rgba(150,10,14,0)'); rg.addColorStop(1, 'rgba(150,10,14,.34)'); g.fillStyle = rg; g.fillRect(0, 0, W, H); }

// ------------------------------------------------------------------ cast on the sets
let ALL = [];
function buildCast() { const A = (set, who, x, z, y = 0, s = 1) => { const a = actor(S[set].scene, who, x, z, y, s); ALL.push(a); return a; };
  const as = S.assembly; as.ems = A('assembly', 'ems', -1.0, 2.0); as.tea = A('assembly', 'teacher', 1.3, 2.0); as.m = [A('assembly', 'kannan', -4.2, -1.4, 0.3), A('assembly', 'clerk', -3.4, -2.9, 0.65), A('assembly', 'chaya', 4.2, -1.4, 0.3), A('assembly', 'postman', 3.4, -2.9, 0.65)];
  const fi = S.field; fi.far = A('field', 'farmer', 3.6, 0.2); fi.lord = A('field', 'landlord', 1.0, 0.8); fi.wife = A('field', 'ammini', 5.4, -0.6); fi.boy = A('field', 'kannan', 2.4, -1.4);
  const st = S.street; st.mn = A('street', 'mannathu', -0.7, 0.4); st.pr = A('street', 'priest', 0.7, 0.0); st.lg = A('street', 'leaguer', -2.0, -0.2); st.cg = A('street', 'congress', 2.0, 0.2);
  st.crowd = [A('street', 'clerk', -1.5, -2.4), A('street', 'chaya', 0.2, -2.8), A('street', 'landlord', 1.6, -2.2), A('street', 'neighbour', -0.4, -4.0), A('street', 'neighbour2', 1.0, -4.4)];
  st.pol = A('street', 'police', -1.6, 2.6); st.con = A('street', 'constable', 1.4, 2.8);
  const de = S.delhi; de.neh = A('delhi', 'nehru', -2.6, -1.0);
  const gr = S.ground; gr.bat = A('ground', 'batter', 0.4, 1.4); gr.ump = A('ground', 'umpire', -1.4, -1.2); gr.keep = A('ground', 'kannan', 0.2, 3.6);
}
function resetProps() { ALL.forEach((x) => { x.c.visible = false; x.c.position.set(...x.base); });
  S.assembly.setTally(1); S.field.setFlags(1); S.street.setSmoke(0); S.street.setTorch(0); S.delhi.setStamp(0); S.delhi.setBallot(true); S.delhi.paper.visible = false; S.ground.setNoise(0.2); S.ground.setScore(); OV = {}; }
let OV = null;

// ------------------------------------------------------------------ shots
function shots(s) { return tidy(rawShots(s)).map((x, i) => ({ ...x, mv: i })); }
function rawShots(s) {
  const n = []; for (let i = 0; s.line(i); i++) n.push(s.line(i));
  const id = (start) => n.findIndex((x) => x.startsWith(start));
  const I = { hook: id('ജനം'), see: id('നോക്കൂ'), bills: id('പിന്നാലെ'), front: id('ഭൂവുടമകളും'), fire: id('തെരുവുകൾ'), wait: id('കാത്തിരിക്കൂ'), ana: id('കളി'),
    twist: id('അടുത്ത'), habit: id('അന്നുമുതൽ'), whatif: id('അന്ന് പിരിച്ചു'), paper: id('ഒരു ബാലറ്റ്'), ask: id('ആ പിരിച്ചുവിടൽ') };
  const L = (i) => s.cue(i), w = (i, nd) => wt(s, i, nd);
  const AS = (k) => ({ set: 'assembly', ...k }), FI = (k) => ({ set: 'field', ...k }), ST = (k) => ({ set: 'street', ...k }), DE = (k) => ({ set: 'delhi', ...k }), GR = (k) => ({ set: 'ground', ...k });
  const as = S?.assembly, fi = S?.field, st = S?.street, de = S?.delhi, gr = S?.ground;
  const push = (p0, lk, r0 = 0.03, f = 50, d = [0, 0, -0.6]) => [[0, p0, lk, r0, f], [0.35, p0.map((x, q) => x + d[q] * 0.4), lk, 0.01, f - 2], [2.2, p0.map((x, q) => x + d[q]), lk, -0.02, f - 4]];
  const asWide = push([0, 2.6, 8.4], [0, 2.2, -3], 0.03, 52, [0, 0, -1.0]);
  const asEms = push([-0.8, 2.1, 5.6], [-1.0, 1.15, 2.0], 0.03, 50, [0, 0, -0.5]);
  const asTea = push([1.2, 2.1, 5.6], [1.3, 1.15, 2.0], 0.03, 50, [0, 0, -0.5]);
  const asBoard = push([1.0, 3.4, -2.5], [7.9, 3.5, -2.5], 0.02, 50, [0.5, 0, 0]);
  const fiWide = push([1.5, 2.3, 7.4], [2, 1.8, -4], 0.03, 52, [0, 0, -0.9]);
  const fiFar = push([3.3, 2.1, 4.8], [3.5, 1.15, 0.2], 0.03, 50, [0, 0, -0.5]);
  const fiLord = push([1.0, 2.1, 5.2], [1.0, 1.15, 0.8], 0.03, 50, [0, 0, -0.5]);
  const fiFlag = [[0, [4.6, 1.2, 4.0], [5.0, 3.6, -2.0], 0.02, 52], [2.2, [4.4, 1.4, 3.2], [5.0, 4.0, -2.0], -0.02, 48]];
  const stWide = push([0, 2.3, 7.4], [0, 2.0, -6], 0.03, 52, [0, 0, -1.0]);
  const stFront = push([0, 2.1, 7.0], [0, 1.2, 0.1], 0.03, 50, [0, 0, -0.6]);
  const stPol = push([0, 1.6, 6.2], [0, 1.5, 1.5], 0.03, 50, [0, 0, -0.6]);
  const deWide = push([0, 2.4, 5.8], [0, 1.8, -2.5], 0.03, 52, [0, 0, -0.8]);
  const deDesk = push([0.3, 2.3, 1.8], [0.2, 2.3, -2.1], 0.03, 50, [0, -0.1, -0.4]);
  const deNeh = push([-2.2, 2.1, 3.0], [-2.6, 1.15, -1.0], 0.03, 50, [0, 0, -0.4]);
  const grWide = push([0, 2.0, 8.2], [0, 2.0, -10], 0.03, 52, [0, 0, -1.0]);
  const grUmp = push([-1.1, 1.7, 2.2], [-1.4, 1.5, -1.2], 0.03, 50, [0, 0, -0.4]);
  const grBat = push([0.5, 1.6, 4.4], [0.4, 1.4, 1.4], 0.03, 50, [0, 0, -0.5]);
  const grCrowd = [[0, [0, 2.6, 4], [0, 5, -32], 0.02, 40], [2.4, [0, 2.6, 2], [0, 5.5, -32], -0.02, 36]];
  const grBoard = push([8, 4.5, -10], [20, 7, -26], 0.02, 46, [0.6, 0, -0.6]);
  const out = []; const add = (x) => { if (x.a != null && x.b != null && x.b > x.a) out.push(x); };
  const emsP = (t, o = {}) => pose(as.ems, { expr: 'proud', R: 'hang', L: 'hang', ...o }, t);
  const members = (t, ex = 'smile') => as.m.forEach((a, k) => pose(a, { expr: ex, R: k % 2 ? 'clap' : 'hang', L: k % 2 ? 'clap' : 'hang', hop: ex === 'beam' ? hopAt(t, 6, 0.04, k) : 0 }, t));
  const front = (t, show = 4, ex = 'angry', arms = 'fist') => { [[st.mn, 'whiteFlag'], [st.pr, null], [st.lg, 'greenFlag'], [st.cg, 'triFlag']].forEach(([a, f], k) => { if (k < show) pose(a, { expr: ex, R: f ? 'hold' : arms, propR: f, L: arms === 'fist' ? 'fist' : 'hang', hop: hopAt(t, 6, 0.04, k) }, t); }); };
  // ---- 1. HOOK: Delhi's stamp slams on the ballot box; what if...; 1957 Kerala; communists by ballot; the world was stunned
  if (I.hook >= 0) { const i = I.hook, wDe = w(i, 'ഡൽഹി'), wPu = w(i, 'പുറത്താക്കിയില്ലായിരുന്നെങ്കിലോ'), wAy = w(i, 'ആയിരത്തി'), wBa = w(i, 'ബാലറ്റ്'), wLo = w(i, 'ലോകം'), end = L(i + 1);
    add(DE({ a: 0, b: wPu - 0.1, shake: 0.42, keys: deDesk, act: (t) => { de.setStamp(ezo(clamp(t / 0.4, 0, 1))); OV.stamp = { t0: 0.42, txt: 'പിരിച്ചുവിട്ടു!', sub: 'DISMISSED · 1959' }; if (t > wDe - 0.1) OV.tag = { t0: wDe, txt: 'ഡൽഹി', sub: 'THE CENTRE' }; } }));
    add(DE({ a: wPu - 0.1, b: wAy - 0.1, keys: deWide, act: (t) => { de.setStamp(1 - ez(clamp((t - wPu) / 0.6, 0, 1))); pose(de.neh, { expr: 'stern', R: 'hold', propR: 'order356', L: 'hip' }, t); OV.rewind = { t0: wPu }; OV.big = { t0: wPu + 0.4, txt: '?', sub: 'WHAT IF?' }; } }));
    add(FI({ a: wAy - 0.1, b: wBa - 0.1, keys: fiFlag, act: (t) => { fi.setFlags(ezo(clamp((t - wAy) / 1.0, 0, 1))); OV.cal = { t0: wAy, top: 'KERALA', big: '1957' }; } }));
    add(AS({ a: wBa - 0.1, b: wLo - 0.1, keys: asBoard, act: (t) => { as.setTally(clamp((t - wBa) / 1.6, 0, 1)); OV.badge = { t0: wBa + 0.3, txt: 'ബാലറ്റിലൂടെ!', sub: 'ELECTED · APRIL 1957' }; } }));
    add(FI({ a: wLo - 0.1, b: end, keys: fiWide, act: (t) => { pose(fi.far, { expr: 'beam', R: 'hold', propR: 'redFlag', L: 'hold', propL: 'plough', hop: hopAt(t, 6, 0.05) }, t); pose(fi.wife, { expr: 'beam', R: 'wave', L: 'hang' }, t); pose(fi.boy, { expr: 'grin', R: 'up', L: 'hang', hop: hopAt(t, 7, 0.05, 1) }, t); OV.papers = { t0: wLo }; } })); }
  // ---- 2. YOU SEE: Chief Minister EMS; within a week: no more evicting tenants
  if (I.see >= 0) { const i = I.see, wAd = w(i, 'അധികാരമേറ്റ്'), wKu = w(i, 'കുടിയിറക്കരുത്'), end = L(i + 1);
    add(AS({ a: L(i), b: wAd - 0.1, keys: asEms, act: (t) => { emsP(t, { R: 'wave' }); members(t); OV.tag = { t0: L(i) + 0.15, txt: 'ഇ.എം.എസ്.', sub: 'CHIEF MINISTER · 5 APRIL 1957' }; } }));
    add(FI({ a: wAd - 0.1, b: wKu - 0.1, keys: fiLord, act: (t) => { pose(fi.lord, { expr: 'smug', R: 'hold', propR: 'notice', L: 'point' }, t); pose(fi.far, { expr: 'sad', R: 'hang', L: 'hang' }, t); OV.cal = { t0: wAd + 0.1, top: 'ഒരാഴ്ചയ്ക്കകം', big: '11 APR' }; } }));
    add(FI({ a: wKu - 0.1, b: end, shake: wKu + 0.2, keys: fiFar, act: (t) => { pose(fi.far, { expr: 'beam', R: 'up', L: 'hang', hop: hopAt(t, 7, 0.05) }, t); pose(fi.lord, { expr: 'shock', R: 'hang', L: 'hang' }, t); OV.tear = { t0: wKu }; OV.stamp = { t0: wKu + 0.25, txt: 'കുടിയിറക്കരുത്!', sub: 'ORDINANCE · 1957' }; } })); }
  // ---- 3. TWO BILLS: land to the tiller; teachers paid straight by the government, appointments in its grip
  if (I.bills >= 0) { const i = I.bills, wBh = w(i, 'ഭൂമി'), wSw = w(i, 'സ്വകാര്യ'), wNi = w(i, 'നിയമനത്തിൽ'), end = L(i + 1);
    add(AS({ a: L(i), b: wBh - 0.1, keys: asWide, act: (t) => { emsP(t, { R: 'point', L: 'hold', propL: 'book' }); members(t); OV.bills = { t0: L(i) + 0.1 }; } }));
    add(FI({ a: wBh - 0.1, b: wSw - 0.1, keys: fiFar, act: (t) => { pose(fi.far, { expr: 'beam', R: 'hold', propR: 'redFlag', L: 'hold', propL: 'plough' }, t); OV.badge = { t0: wBh + 0.1, txt: 'ഭൂമി കൃഷിക്കാരന്', sub: 'LAND TO THE TILLER' }; } }));
    add(AS({ a: wSw - 0.1, b: end, keys: asTea, act: (t) => { pose(as.tea, { expr: t > wNi ? 'think' : 'beam', R: 'hold', propR: 'payEnv', L: 'hang' }, t); OV.pay = { t0: wSw + 0.2 }; if (t > wNi - 0.1) OV.pay = null, OV.badge = { t0: wNi, txt: 'നിയമനം: സർക്കാർ', sub: 'APPOINTMENTS · EDUCATION BILL' }; } })); }
  // ---- 4. THE FRONT: landlords + managements rise; NSS, Church, League, Congress on one stage; Vimochana Samaram
  if (I.front >= 0) { const i = I.front, wNs = w(i, 'എൻഎസ്എസ്'), wKa = w(i, 'കത്തോലിക്കാ'), wMu = w(i, 'മുസ്ലിം'), wKo = w(i, 'കോൺഗ്രസ്'), wVi = w(i, 'വിമോചന'), end = L(i + 1);
    add(FI({ a: L(i), b: wNs - 0.1, keys: fiLord, act: (t) => { pose(fi.lord, { expr: 'angry', R: 'hold', propR: 'umbrella', L: 'fist', hop: hopAt(t, 7, 0.05) }, t); OV.bubble = { t0: L(i) + 0.3, txt: '"ഇത് അനുവദിക്കില്ല!"', x: 0.5, y: 0.56 }; } }));
    add(ST({ a: wNs - 0.1, b: wVi - 0.1, keys: stFront, act: (t) => { const show = t < wKa - 0.05 ? 1 : t < wMu - 0.05 ? 2 : t < wKo - 0.05 ? 3 : 4; front(t, show); st.setTorch(0.4);
      OV.chips = { list: [['എൻഎസ്എസ്', wNs], ['സഭ', wKa], ['ലീഗ്', wMu], ['കോൺഗ്രസ്', wKo]] }; } }));
    add(ST({ a: wVi - 0.1, b: end, shake: wVi + 0.3, keys: stWide, act: (t) => { front(t); st.crowd.forEach((a, k) => pose(a, { expr: 'angry', R: 'fist', L: 'hang', hop: hopAt(t, 6, 0.04, k + 2) }, t)); st.setTorch(1); OV.stamp = { t0: wVi + 0.1, txt: 'വിമോചന സമരം', sub: 'JUNE–JULY 1959' }; } })); }
  // ---- 5. FIRINGS: the streets burned; police firing at Angamaly and Pulluvila; lives were lost
  if (I.fire >= 0) { const i = I.fire, wAn = w(i, 'അങ്കമാലിയിലും'), wJe = w(i, 'ജീവനുകൾ'), end = L(i + 1);
    add(ST({ a: L(i), b: wAn - 0.1, keys: stWide, act: (t) => { front(t); st.crowd.forEach((a, k) => pose(a, { expr: 'angry', R: 'fist', L: 'hang', hop: hopAt(t, 6, 0.04, k) }, t)); st.setTorch(1); st.setSmoke(0.6, t); } }));
    add(ST({ a: wAn - 0.1, b: wJe - 0.1, shake: w(i, 'വെടിവെപ്പ്') + 0.1, keys: stPol, act: (t) => { pose(st.pol, { expr: 'stern', R: 'hold', propR: 'lathi', L: 'hip' }, t); pose(st.con, { expr: 'stern', R: 'hold', propR: 'lathi', L: 'hip' }, t);
      st.crowd.forEach((a, k) => pose(a, { expr: 'shock', R: 'hang', L: 'hang' }, t)); st.setTorch(0.8); st.setSmoke(1, t); OV.places = { list: [['അങ്കമാലി', wAn], ['പുല്ലുവിള', w(i, 'പുല്ലുവിളയിലും')]] }; OV.puffs = { t0: w(i, 'വെടിവെപ്പ്') }; } }));
    add(ST({ a: wJe - 0.1, b: end, keys: stFront, act: (t) => { st.setTorch(0.3); st.setSmoke(0.5, t); OV.dim = 0.55; OV.lamp = { t0: wJe }; } })); }
  // ---- 6. WAIT...: majority still EMS's; yet on 31 July 1959 Nehru's Centre used Article 356; government OUT
  if (I.wait >= 0) { const i = I.wait, wBu = w(i, 'ഭൂരിപക്ഷം'), wEn = w(i, 'എന്നിട്ടും'), wNe = w(i, 'നെഹ്റുവിന്റെ'), wAr = w(i, 'ആർട്ടിക്കിൾ'), wOu = w(i, 'ഔട്ട്'), end = L(i + 1);
    add(AS({ a: L(i), b: wEn - 0.1, keys: asBoard, act: (t) => { OV.rewind = { t0: L(i) }; if (t > wBu - 0.1) OV.badge = { t0: wBu, txt: 'ഭൂരിപക്ഷം ✔', sub: 'MAJORITY STILL INTACT' }; } }));
    add(DE({ a: wEn - 0.1, b: wAr - 0.1, keys: deNeh, act: (t) => { pose(de.neh, { expr: t > wNe ? 'stern' : 'think', R: 'hold', propR: 'order356', L: 'hip' }, t); OV.cal = { t0: wEn + 0.2, top: '31 JULY', big: '1959' }; if (t > wNe - 0.1) OV.cal = null, OV.tag = { t0: wNe, txt: 'നെഹ്റു സർക്കാർ', sub: 'THE CENTRE, NEW DELHI' }; } }));
    add(DE({ a: wAr - 0.1, b: wOu - 0.1, shake: wAr + 0.9, keys: deDesk, act: (t) => { de.setStamp(ez(clamp((t - wAr - 0.5) / 0.4, 0, 1))); OV.art = { t0: wAr }; } }));
    add(AS({ a: wOu - 0.1, b: end, shake: wOu + 0.1, keys: asEms, act: (t) => { emsP(t, { expr: 'sad', R: 'hang', L: 'hang' }); OV.stamp = { t0: wOu, txt: 'ഔട്ട്!', sub: "PRESIDENT'S RULE" }; } })); }
  // ---- 7. ANALOGY: winning, the gallery is loud, the umpire cancels the whole match
  if (I.ana >= 0) { const i = I.ana, wGa = w(i, 'ഗാലറിയിലെ'), wAm = w(i, 'അമ്പയർ'), end = L(i + 1);
    add(GR({ a: L(i), b: wGa - 0.1, keys: grBat, act: (t) => { pose(gr.bat, { expr: 'proud', R: 'hold', propR: 'bat', L: 'up', hop: hopAt(t, 6, 0.04) }, t); OV.badge = { t0: L(i) + 0.2, txt: '248/2', sub: 'WINNING' }; } }));
    add(GR({ a: wGa - 0.1, b: wAm - 0.1, keys: grCrowd, act: (t) => { gr.setNoise(1); OV.noise = { t0: wGa }; } }));
    add(GR({ a: wAm - 0.1, b: end, shake: wAm + 0.4, keys: grUmp, act: (t) => { gr.setNoise(0.6); pose(gr.ump, { expr: 'stern', R: t > wAm + 0.2 ? 'up' : 'hang', L: 'hang' }, t); pose(gr.bat, { expr: 'shock', R: 'hold', propR: 'bat', L: 'hang' }, t); gr.setScore('EMS XI  248/2', 'TARGET 180', clamp((t - wAm - 0.6) / 1.2, 0, 1)); if (t > wAm + 0.2) OV.out = { t0: wAm + 0.2 }; } })); }
  // ---- 8. 1960 TWIST: votes up! but the opposition united, seats under half
  if (I.twist >= 0) { const i = I.twist, wKa = w(i, 'കമ്മ്യൂണിസ്റ്റുകൾക്ക്'), wPa = w(i, 'പക്ഷേ'), wSe = w(i, 'സീറ്റ്'), end = L(i + 1);
    add(FI({ a: L(i), b: wKa - 0.1, keys: fiWide, act: (t) => { pose(fi.far, { expr: 'think', R: 'hold', propR: 'redFlag', L: 'hang' }, t); OV.cal = { t0: L(i) + 0.1, top: 'ELECTION', big: '1960' }; } }));
    add(ST({ a: wKa - 0.1, b: end, keys: stFront, act: (t) => { const united = t > wPa; if (united) front(t, 4, 'grin', 'hang'); st.setTorch(0.2); OV.vs = { t0: wKa, seatsAt: wSe - 0.4 }; } })); }
  // ---- 9. HABIT: from then on the article became Delhi's habit; more than a hundred times, many states
  if (I.habit >= 0) { const i = I.habit, wNu = w(i, 'നൂറിലേറെ'), end = L(i + 1);
    add(DE({ a: L(i), b: end, keys: deDesk, act: (t) => { const k = Math.max(0, t - L(i) - 0.2), ph = (k * 2.2) % 1; de.setStamp(ph < 0.35 ? ez(ph / 0.35) : 1 - ez((ph - 0.35) / 0.65)); de.setBallot(false); OV.storm = { t0: L(i) + 0.2 }; if (t > wNu - 0.1) OV.big = { t0: wNu, txt: '100+', sub: 'തവണ · പല സംസ്ഥാനങ്ങളിൽ', count: true }; } })); }
  // ---- 10. WHAT IF: not dismissed -> land reform maybe ten years earlier; not so easy for Delhi to remove governments
  if (I.whatif >= 0) { const i = I.whatif, wBh = w(i, 'ഭൂപരിഷ്കരണം'), wIs = w(i, 'ഇഷ്ടമില്ലാത്ത'), end = L(i + 1);
    add(DE({ a: L(i), b: wBh - 0.1, flash: L(i), dream: true, keys: deDesk, act: (t) => { de.setStamp(1 - ezo(clamp((t - L(i) - 0.3) / 0.6, 0, 1))); OV.noStamp = { t0: L(i) + 0.3 }; } }));
    add(FI({ a: wBh - 0.1, b: wIs - 0.1, dream: true, keys: fiFar, act: (t) => { pose(fi.far, { expr: 'beam', R: 'hold', propR: 'redFlag', L: 'hold', propL: 'plough', hop: hopAt(t, 6, 0.05) }, t); pose(fi.wife, { expr: 'beam', R: 'wave', L: 'hang' }, t); OV.decade = { t0: wBh, t1: wBh + 1.6 }; } }));
    add(AS({ a: wIs - 0.1, b: end, dream: true, keys: asWide, act: (t) => { emsP(t, { expr: 'beam', R: 'wave', L: 'hang' }); members(t, 'beam'); OV.badge = { t0: wIs + 0.2, txt: 'സർക്കാർ തുടരുന്നു', sub: 'THE VOTE DECIDES, NOT DELHI' }; } })); }
  // ---- 11. CALLBACK: came in by a ballot box... went out by a piece of paper
  if (I.paper >= 0) { const i = I.paper, wKd = w(i, 'കടലാസ്'), end = L(i + 1);
    add(DE({ a: L(i), b: end, keys: [[0, [0.4, 2.0, 1.6], [0.2, 1.5, -2.1], 0.02, 46], [3.4, [0.3, 1.9, 0.9], [0.2, 1.45, -2.1], -0.01, 42]], act: (t) => { de.setStamp(0); OV.dim = 0.35; const u = clamp((t - wKd + 0.4) / 1.6, 0, 1); const p = de.paper; p.visible = u > 0;
      p.position.set(0.2 + Math.sin(u * 7) * 0.25 * (1 - u), 1.12 + 0.72 + 0.02 + (1 - ezo(u)) * 1.6, -2.1); p.rotation.set(Math.sin(u * 9) * 0.4 * (1 - u), u * 0.6, Math.cos(u * 8) * 0.3 * (1 - u)); OV.callback = { t0: L(i), t1: wKd }; } })); }
  // ---- 12. QUESTION + SUBSCRIBE
  if (I.ask >= 0) { const i = I.ask, wSa = w(i, 'ശരി,'), wKa = w(i, 'കമന്റ്'), wNa = w(i, 'നാളത്തെ');
    add(AS({ a: L(i), b: 1e9, keys: asEms, act: (t) => { emsP(t, { expr: t > wSa ? 'think' : 'smile', R: 'chin', L: 'hang' }); if (t > wSa - 0.1) OV.yesno = { t0: wSa }; if (t > wKa - 0.1) OV.comment = { t0: wKa }; if (t > wNa - 0.1) OV.yesno = null, OV.comment = null, OV.follow = { t0: wNa }; } })); }
  return out;
}

const GRADE = { assembly: { hazeAmt: 0.1, haze: 0xf0d8c8, sat: 1.08, contrast: 0.07, lift: 0.015, warm: 0.06, vignette: 0.34 }, field: { hazeAmt: 0.12, haze: 0xe6eef0, sat: 1.1, contrast: 0.06, lift: 0.015, warm: 0.04, vignette: 0.3 },
  street: { hazeAmt: 0.14, haze: 0x7a3a30, sat: 1.1, contrast: 0.09, lift: 0.01, warm: 0.1, vignette: 0.46 }, delhi: { hazeAmt: 0.1, haze: 0xf0d8c0, sat: 1.05, contrast: 0.08, lift: 0.01, warm: 0.07, vignette: 0.42 },
  ground: { hazeAmt: 0.12, haze: 0xdfe9f2, sat: 1.1, contrast: 0.06, lift: 0.015, warm: 0.03, vignette: 0.3 }, night: { hazeAmt: 0.12, haze: 0x2a3050, sat: 1.08, contrast: 0.08, lift: 0.02, warm: 0.02, vignette: 0.42 } };

// ------------------------------------------------------------------ overlays (story-specific motion graphics)
function overlays(g, t, alpha) {
  if (OV.dim) { g.save(); g.globalAlpha = alpha * OV.dim; g.fillStyle = '#000'; g.fillRect(0, 0, W, H); g.restore(); }
  if (OV.rewind) rewind(g, t, OV.rewind.t0, alpha);
  if (OV.cal) calendar(g, t, OV.cal, alpha);
  if (OV.papers) papers(g, t, OV.papers.t0, alpha);
  if (OV.tear) tear(g, t, OV.tear.t0, alpha);
  if (OV.bills) bills(g, t, OV.bills.t0, alpha);
  if (OV.pay) pay(g, t, OV.pay.t0, alpha);
  if (OV.chips) chips(g, t, OV.chips.list, alpha, 1450);
  if (OV.places) chips(g, t, OV.places.list, alpha, 1420, '#2a1c17');
  if (OV.puffs) puffs(g, t, OV.puffs.t0, alpha);
  if (OV.lamp) lamp(g, t, OV.lamp.t0, alpha);
  if (OV.art) art356(g, t, OV.art.t0, alpha);
  if (OV.noise) noise(g, t, OV.noise.t0, alpha);
  if (OV.out) outCard(g, t, OV.out.t0, alpha);
  if (OV.vs) votesSeats(g, t, OV.vs, alpha);
  if (OV.storm) storm(g, t, OV.storm.t0, alpha);
  if (OV.noStamp) noStamp(g, t, OV.noStamp.t0, alpha);
  if (OV.decade) decade(g, t, OV.decade, alpha);
  if (OV.callback) callback(g, t, OV.callback, alpha);
  if (OV.yesno) yesno(g, t, OV.yesno.t0, alpha);
  if (OV.comment) comment(g, t, OV.comment.t0, alpha);
  if (OV.follow) follow(g, t, OV.follow.t0, alpha);
  if (OV.badge) badge(g, t, OV.badge, alpha);
  if (OV.bubble) bubble(g, t, OV.bubble, alpha);
  if (OV.stamp) stamp(g, t, OV.stamp, alpha);
  if (OV.tag) tag(g, t, OV.tag, alpha);
  if (OV.big) bigNum(g, t, OV.big, alpha);
}
const card = (g, w, h, fill = '#f4ecd6', r = 28) => { g.fillStyle = fill; g.strokeStyle = '#2a1c17'; g.lineWidth = 9; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, r); g.fill(); g.stroke(); };
const pop = (t, t0, d = 0.3) => ezo(span(t, t0, d));
function hs(g, x, y, s, col = '#f6d24a') { g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = col; g.lineCap = 'round'; g.lineWidth = 3.2; g.beginPath(); g.arc(1, -1, 9, Math.PI * 0.95, Math.PI * 2.35); g.stroke(); g.lineWidth = 3; g.beginPath(); g.moveTo(-7, 9); g.lineTo(-3, 5); g.stroke();
  g.lineWidth = 2.6; g.beginPath(); g.moveTo(-6, -8); g.lineTo(8, 8); g.stroke(); g.lineWidth = 4.5; g.beginPath(); g.moveTo(-9, -5); g.lineTo(-3, -11); g.stroke(); g.restore(); }
function calendar(g, t, c, alpha) { const p = pop(t, c.t0); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1400); g.rotate(-0.04); g.scale(0.8 + 0.2 * p, 0.8 + 0.2 * p);
  card(g, 520, 440, '#f4f0e6'); g.fillStyle = '#c8312c'; g.beginPath(); g.roundRect(-260, -220, 520, 120, [28, 28, 0, 0]); g.fill(); g.stroke();
  const ml = /[ഀ-ൿ]/.test(c.top); text(g, c.top, 0, -160, { font: ml ? ML : "'Oswald'", weight: ml ? 800 : 700, size: ml ? 60 : 72, color: '#fff', maxWidth: 470 }); text(g, c.big, 0, 60, { font: "'Oswald'", weight: 700, size: c.big.length > 4 ? 150 : 190, color: '#2a1c17', maxWidth: 470 }); g.restore(); }
function rewind(g, t, t0, alpha) { const k = t - t0; if (k < 0 || k > 1.1) return; g.save(); g.globalAlpha = alpha * (k < 0.9 ? 1 : 1 - (k - 0.9) / 0.2); g.fillStyle = 'rgba(255,255,255,.16)'; for (let i = 0; i < 14; i++) { const y = ((i * 151 + t * 900) % H); g.fillRect(0, y, W, 6 + (i % 3) * 4); }
  g.fillStyle = '#ffffff'; g.strokeStyle = '#120c0a'; g.lineWidth = 8; g.translate(W - 220, 520); for (const dx of [0, 70]) { g.beginPath(); g.moveTo(dx, -50); g.lineTo(dx - 70, 0); g.lineTo(dx, 50); g.closePath(); g.fill(); g.stroke(); } g.restore(); }
function papers(g, t, t0, alpha) { [[0.26, 0.42, -0.3, 0, 'RED KERALA!', 1], [0.74, 0.36, 0.25, 0.3, 'COMMUNISTS WIN BY BALLOT', 1], [0.5, 0.64, -0.08, 0.6, 'ലോകം ഞെട്ടി!', 0]].forEach(([x, y, r, d, txt, en]) => { const k = t - t0 - d; if (k < 0) return; const u = ezo(clamp(k / 0.5, 0, 1)); g.save(); g.globalAlpha = alpha; g.translate(W * x, H * y); g.rotate(r + (1 - u) * 6); g.scale(u * 1.1, u * 1.1);
  card(g, 520, 380, '#f4ecd6', 6); g.fillStyle = '#2a1c17'; g.fillRect(-240, -170, 480, 16); text(g, '1957', 180, -140, { font: "'Oswald'", weight: 700, size: 30, color: '#2a1c17' }); text(g, txt, 0, -70, { font: en ? "'Oswald'" : ML, weight: en ? 700 : 800, size: en ? 72 : 82, color: '#c8312c', maxWidth: 470 });
  g.strokeStyle = 'rgba(42,28,23,.45)'; g.lineWidth = 6; for (let r2 = 0; r2 < 5; r2++) { g.beginPath(); g.moveTo(-220, 20 + r2 * 32); g.lineTo(r2 % 2 ? 60 : 220, 20 + r2 * 32); g.stroke(); } g.restore(); }); }
function tear(g, t, t0, alpha) { const k = t - t0; if (k < -0.6) return; const u = ezo(clamp(k / 0.5, 0, 1)); g.save(); g.globalAlpha = alpha * (k > 1.6 ? Math.max(0, 1 - (k - 1.6) / 0.4) : 1); g.translate(W / 2, 1000);
  for (const s of [-1, 1]) { g.save(); g.translate(s * u * 170, u * 120); g.rotate(s * u * 0.5); g.beginPath(); if (s < 0) { g.moveTo(-200, -260); g.lineTo(0, -260); for (let y = -260; y <= 260; y += 40) g.lineTo((y / 40) % 2 ? -20 : 15, y); g.lineTo(-200, 260); } else { g.moveTo(200, -260); g.lineTo(0, -260); for (let y = -260; y <= 260; y += 40) g.lineTo((y / 40) % 2 ? -20 : 15, y); g.lineTo(200, 260); } g.closePath();
    g.fillStyle = '#f4ecd6'; g.fill(); g.strokeStyle = '#2a1c17'; g.lineWidth = 8; g.stroke(); g.clip(); text(g, 'കുടിയിറക്ക്', 0, -150, { size: 80, color: '#c8312c' }); text(g, 'EVICTION NOTICE', 0, -60, { font: "'Oswald'", weight: 700, size: 46, color: '#2a1c17' });
    g.strokeStyle = 'rgba(42,28,23,.45)'; g.lineWidth = 6; for (let r = 0; r < 5; r++) { g.beginPath(); g.moveTo(-160, 20 + r * 40); g.lineTo(160, 20 + r * 40); g.stroke(); } g.restore(); } g.restore(); }
function bills(g, t, t0, alpha) { [['1', 'ഭൂമി', 'LAND BILL', -230], ['2', 'സ്കൂൾ', 'EDUCATION BILL', 230]].forEach(([nm, ml, en, x], j) => { const p = pop(t, t0 + j * 0.45, 0.3); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2 + x, 1400); g.rotate(j ? 0.05 : -0.05); g.scale(0.7 + 0.3 * p, 0.7 + 0.3 * p);
  card(g, 420, 400, '#fbf6e6'); g.fillStyle = '#c8312c'; g.beginPath(); g.arc(0, -120, 60, 0, 7); g.fill(); g.stroke(); text(g, nm, 0, -116, { font: "'Oswald'", weight: 700, size: 80, color: '#fff' }); text(g, ml, 0, 20, { size: 84, color: '#2a1c17' }); text(g, en, 0, 120, { font: "'Oswald'", weight: 700, size: 40, color: '#8a1e1e' }); g.restore(); }); }
function pay(g, t, t0, alpha) { const p = pop(t, t0, 0.3); if (p <= 0) return; const u = ezo(clamp((t - t0 - 0.3) / 1.0, 0, 1)); g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1420);
  card(g, 920, 300, '#f4ecd6'); text(g, '🏛️ സർക്കാർ', -280, -40, { size: 60, color: '#2a1c17' }); text(g, '👨‍🏫 അധ്യാപകൻ', 260, -40, { size: 60, color: '#2a1c17' }); text(g, 'ശമ്പളം നേരിട്ട്', 0, 90, { size: 54, color: '#2f7a3a' });
  g.save(); g.translate(lerp(-180, 150, u), -40 - Math.sin(u * Math.PI) * 60); g.rotate(-0.1); g.fillStyle = '#e8d8a8'; g.strokeStyle = '#2a1c17'; g.lineWidth = 6; g.beginPath(); g.rect(-60, -34, 120, 68); g.fill(); g.stroke(); g.beginPath(); g.moveTo(-60, -34); g.lineTo(0, 6); g.lineTo(60, -34); g.stroke(); text(g, '₹', 0, 12, { font: "'Oswald'", weight: 700, size: 40, color: '#2f7a3a' }); g.restore(); g.restore(); }
function chips(g, t, list, alpha, y, fill = '#c8312c') { const vis = list.filter(([, t0]) => t >= t0 - 0.05); const n = vis.length; if (!n) return; const cols = n > 2 ? 2 : n;
  vis.forEach(([txt, t0], k) => { const p = pop(t, t0, 0.25); const r = Math.floor(k / 2), c = k % 2, cx = cols === 1 ? W / 2 : W / 2 + (c ? 240 : -240); g.save(); g.globalAlpha = alpha * p; g.translate(cx, y + r * 170); g.rotate(c ? 0.04 : -0.04); g.scale(0.7 + 0.3 * p, 0.7 + 0.3 * p);
    g.font = `800 70px ${ML}`; const w = Math.min(460, g.measureText(txt).width + 90); g.fillStyle = fill; g.strokeStyle = '#f6d24a'; g.lineWidth = 8; g.beginPath(); g.roundRect(-w / 2, -64, w, 128, 26); g.fill(); g.stroke(); text(g, txt, 0, 2, { size: 70, color: '#fff6d0', maxWidth: w - 40 }); g.restore(); }); }
function puffs(g, t, t0, alpha) { for (let j = 0; j < 4; j++) { const k = t - t0 - j * 0.35; if (k < 0 || k > 1.2) continue; const a = k < 0.15 ? k / 0.15 : 1 - (k - 0.15) / 1.05; const x = W * (0.25 + j * 0.17), y = 980 - k * 120;
  g.save(); g.globalAlpha = alpha * a * 0.85; const rg = g.createRadialGradient(x, y, 0, x, y, 120 + k * 160); rg.addColorStop(0, 'rgba(255,236,190,1)'); rg.addColorStop(0.3, 'rgba(220,214,206,.8)'); rg.addColorStop(1, 'rgba(200,196,190,0)'); g.fillStyle = rg; g.fillRect(0, 0, W, H); g.restore(); } }
function lamp(g, t, t0, alpha) { const p = pop(t, t0, 0.5); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1050);
  const rg = g.createRadialGradient(0, -220, 0, 0, -220, 420); rg.addColorStop(0, 'rgba(255,200,110,.55)'); rg.addColorStop(1, 'rgba(255,200,110,0)'); g.fillStyle = rg; g.fillRect(-540, -700, 1080, 1100);
  g.fillStyle = '#d9a521'; g.strokeStyle = '#2a1c17'; g.lineWidth = 8; g.beginPath(); g.ellipse(0, 200, 170, 34, 0, 0, 7); g.fill(); g.stroke(); g.fillRect(-18, -120, 36, 320); g.strokeRect(-18, -120, 36, 320); g.beginPath(); g.ellipse(0, -130, 120, 30, 0, 0, Math.PI); g.fill(); g.stroke();
  for (const dx of [-80, 0, 80]) { const fl = 1 + Math.sin(t * 11 + dx) * 0.12; g.save(); g.translate(dx, -150); g.scale(fl, fl); g.fillStyle = '#ffb030'; g.beginPath(); g.moveTo(0, -70); g.quadraticCurveTo(26, -20, 0, 0); g.quadraticCurveTo(-26, -20, 0, -70); g.fill(); g.fillStyle = '#fff1a8'; g.beginPath(); g.moveTo(0, -40); g.quadraticCurveTo(12, -12, 0, 0); g.quadraticCurveTo(-12, -12, 0, -40); g.fill(); g.restore(); }
  text(g, 'ജീവനുകൾ പോയി', 0, 400, { size: 84, color: '#ffffff', stroke: '#2a1c17', strokeWidth: 18 }); g.restore(); }
function art356(g, t, t0, alpha) { const p = pop(t, t0, 0.3); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1380); g.rotate(-0.03); g.scale(0.8 + 0.2 * p, 0.8 + 0.2 * p);
  card(g, 900, 420, '#fbfaf6', 18); g.fillStyle = '#c8312c'; g.fillRect(-450, -210, 900, 24); text(g, 'ARTICLE', 0, -120, { font: "'Oswald'", weight: 700, size: 70, color: '#2a1c17' }); text(g, '356', 0, 20, { font: "'Oswald'", weight: 700, size: 200, color: '#c8312c', stroke: '#2a1c17', strokeWidth: 10 }); text(g, '31 JULY 1959', 0, 160, { font: "'Oswald'", weight: 700, size: 64, color: '#2a1c17' }); g.restore(); }
function noise(g, t, t0, alpha) { const k = t - t0; if (k < 0) return; g.save(); g.globalAlpha = alpha * Math.min(1, k * 4); ['ബഹളം!', '📣', 'ഹൂയ്!', '📣', 'ബഹളം!'].forEach((s, j) => { const ph = (t * 1.3 + j * 0.37) % 1, x = W * (0.15 + j * 0.18), y = 1300 - ph * 500; g.globalAlpha = alpha * Math.min(1, k * 4) * Math.sin(ph * Math.PI);
  text(g, s, x, y, { font: /[ഀ-ൿ]/.test(s) ? ML : 'sans-serif', size: 76, color: '#f6d24a', stroke: '#2a1c17', strokeWidth: 16 }); }); g.restore(); }
function outCard(g, t, t0, alpha) { const p = pop(t, t0, 0.3); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1400); g.rotate(-0.05); g.scale(0.7 + 0.3 * p, 0.7 + 0.3 * p);
  card(g, 640, 300, '#ffffff', 40); g.save(); g.translate(-200, 10); g.fillStyle = '#e0ac84'; g.strokeStyle = '#2a1c17'; g.lineWidth = 7; g.beginPath(); g.roundRect(-40, -20, 80, 90, 20); g.fill(); g.stroke(); g.beginPath(); g.roundRect(-16, -120, 32, 110, 16); g.fill(); g.stroke(); g.restore();
  text(g, 'OUT!', 90, -20, { font: "'Oswald'", weight: 700, size: 150, color: '#c8312c' }); text(g, 'മാച്ച് റദ്ദ്', 90, 100, { size: 54, color: '#2a1c17' }); g.restore(); }
function votesSeats(g, t, o, alpha) { const p = pop(t, o.t0, 0.3); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1360); g.scale(0.85 + 0.15 * p, 0.85 + 0.15 * p);
  card(g, 980, 520, '#fbf6e6'); text(g, '1957 → 1960', 0, -200, { font: "'Oswald'", weight: 700, size: 56, color: '#8a1e1e' });
  const u1 = ezo(clamp((t - o.t0 - 0.2) / 0.8, 0, 1)), u2 = ezo(clamp((t - o.seatsAt) / 0.8, 0, 1));
  // votes (left): 35% -> 39%, green arrow up
  g.save(); g.translate(-240, 30); text(g, 'വോട്ട്', 0, -110, { size: 56, color: '#2a1c17' }); text(g, `${Math.round(lerp(35, 39, u1))}%`, -40, 20, { font: "'Oswald'", weight: 700, size: 120, color: '#2a1c17' });
  g.fillStyle = '#2f8a3a'; g.strokeStyle = '#2a1c17'; g.lineWidth = 6; g.save(); g.translate(130, 30 - u1 * 40); g.beginPath(); g.moveTo(0, -70); g.lineTo(46, -10); g.lineTo(18, -10); g.lineTo(18, 60); g.lineTo(-18, 60); g.lineTo(-18, -10); g.lineTo(-46, -10); g.closePath(); g.fill(); g.stroke(); g.restore();
  text(g, '35% → 39%', 0, 150, { font: "'Oswald'", weight: 700, size: 44, color: '#2f8a3a' }); g.restore();
  g.strokeStyle = 'rgba(42,28,23,.3)'; g.lineWidth = 5; g.beginPath(); g.moveTo(0, -150); g.lineTo(0, 220); g.stroke();
  if (t > o.seatsAt) { g.save(); g.globalAlpha = alpha * p * Math.min(1, (t - o.seatsAt) * 4); g.translate(240, 30); text(g, 'സീറ്റ്', 0, -110, { size: 56, color: '#2a1c17' }); text(g, `${Math.round(lerp(60, 29, u2))}`, -40, 20, { font: "'Oswald'", weight: 700, size: 120, color: '#2a1c17' });
    g.fillStyle = '#c8312c'; g.strokeStyle = '#2a1c17'; g.lineWidth = 6; g.save(); g.translate(120, 10 + u2 * 40); g.rotate(Math.PI); g.beginPath(); g.moveTo(0, -70); g.lineTo(46, -10); g.lineTo(18, -10); g.lineTo(18, 60); g.lineTo(-18, 60); g.lineTo(-18, -10); g.lineTo(-46, -10); g.closePath(); g.fill(); g.stroke(); g.restore();
    text(g, '60 → 29', 0, 150, { font: "'Oswald'", weight: 700, size: 44, color: '#c8312c' }); g.restore(); }
  g.restore(); }
function storm(g, t, t0, alpha) { const k = t - t0; if (k < 0) return; const n = Math.min(14, Math.floor(k * 4.4) + 1); g.save(); g.globalAlpha = alpha;
  for (let j = 0; j < n; j++) { const x = W * (0.15 + ((j * 0.37) % 0.7)), y = 700 + ((j * 173) % 900), r = ((j * 0.9) % 1 - 0.5) * 0.5, u = ezo(clamp((k - j / 4.4) / 0.2, 0, 1)); g.save(); g.translate(x, y); g.rotate(r); g.scale(lerp(1.8, 1, u), lerp(1.8, 1, u)); g.globalAlpha = alpha * Math.min(1, u * 2);
    g.strokeStyle = '#d0281e'; g.lineWidth = 9; g.beginPath(); g.roundRect(-120, -56, 240, 112, 14); g.stroke(); text(g, '356', 0, 4, { font: "'Oswald'", weight: 700, size: 84, color: '#d0281e' }); g.restore(); } g.restore(); }
function noStamp(g, t, t0, alpha) { const k = t - t0; if (k < 0 || k > 2.2) return; g.save(); g.globalAlpha = alpha * (k < 1.8 ? Math.min(1, k * 3) : 1 - (k - 1.8) / 0.4); g.translate(W / 2, 1380); const p = pop(t, t0, 0.3); g.scale(0.8 + 0.2 * p, 0.8 + 0.2 * p);
  g.strokeStyle = '#d0281e'; g.lineWidth = 12; g.beginPath(); g.roundRect(-220, -100, 440, 200, 20); g.stroke(); text(g, '356', 0, 4, { font: "'Oswald'", weight: 700, size: 130, color: '#d0281e' });
  g.strokeStyle = '#2a1c17'; g.lineWidth = 26; g.beginPath(); g.arc(0, 0, 200, 0, 7); g.moveTo(-140, -140); g.lineTo(140, 140); g.stroke(); g.strokeStyle = '#f6d24a'; g.lineWidth = 14; g.stroke();
  text(g, 'പിരിച്ചുവിട്ടില്ലെങ്കിൽ?', 0, 300, { size: 80, color: '#f6d24a', stroke: '#2a1c17', strokeWidth: 18, maxWidth: 980 }); g.restore(); }
function decade(g, t, o, alpha) { const y = Math.round(lerp(1970, 1960, ezo(clamp((t - o.t0) / (o.t1 - o.t0), 0, 1)))); calendar(g, t, { t0: o.t0, top: 'ഭൂപരിഷ്കരണം', big: String(y) }, alpha);
  if (t > o.t1) { const p = pop(t, o.t1, 0.3); g.save(); g.globalAlpha = alpha * p; text(g, 'ഒരുപക്ഷേ 10 വർഷം മുൻപേ?', W / 2, 1700, { size: 64, color: '#f6d24a', stroke: '#2a1c17', strokeWidth: 16, maxWidth: 1000 }); g.restore(); } }
function callback(g, t, o, alpha) { const p1 = pop(t, o.t0 + 0.2, 0.3), p2 = pop(t, o.t1, 0.3); g.save(); g.globalAlpha = alpha * p1; text(g, '🗳️ ബാലറ്റ് പെട്ടി → അകത്ത്', W / 2, 1380, { font: ML, size: 70, color: '#ffffff', stroke: '#2a1c17', strokeWidth: 16, maxWidth: 1000 });
  g.globalAlpha = alpha * p2; text(g, '📄 ഒരു കടലാസ് → പുറത്ത്', W / 2, 1520, { size: 70, color: '#f6d24a', stroke: '#2a1c17', strokeWidth: 16, maxWidth: 1000 }); g.restore(); }
function comment(g, t, t0, alpha) { const p = pop(t, t0, 0.25); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1640 + Math.sin(t * 6) * 6); g.scale(p, p); card(g, 560, 120, '#ffffff', 60); text(g, '💬 കമന്റ് ചെയ്യൂ 👇', 0, 4, { size: 54, color: '#2a1c17', maxWidth: 520 }); g.restore(); }
function follow(g, t, t0, alpha) { const p = pop(t, t0, 0.3); if (p <= 0) return; const k = t - t0, press = k > 1.2 ? 1 : 0, sq = k > 1.2 && k < 1.4 ? 0.92 : 1; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1380); g.scale((0.8 + 0.2 * p) * sq, (0.8 + 0.2 * p) * sq);
  card(g, 900, 380, '#f4ecd6'); text(g, "നാളത്തെ 'എങ്കിലോ?'", 0, -90, { size: 70, color: '#2a1c17', maxWidth: 840 }); g.fillStyle = press ? '#6a6a70' : '#d0281e'; g.beginPath(); g.roundRect(-300, 0, 600, 130, 65); g.fill(); g.stroke();
  text(g, press ? 'SUBSCRIBED ✓' : 'SUBSCRIBE', 0, 66, { font: "'Oswald'", weight: 700, size: 70, color: '#fff' });
  if (k > 0.6) { const u = ezo(span(t, t0 + 0.6, 0.6)); g.save(); g.translate(lerp(380, 60, u), lerp(260, 90, u)); g.rotate(-0.4); g.fillStyle = '#fff'; g.strokeStyle = '#2a1c17'; g.lineWidth = 6; g.beginPath(); g.moveTo(0, 0); g.lineTo(26, 70); g.lineTo(38, 44); g.lineTo(66, 60); g.lineTo(54, 34); g.lineTo(82, 28); g.closePath(); g.fill(); g.stroke(); g.restore(); }
  g.restore(); }
function yesno(g, t, t0, alpha) { [['ശരി', '#2f8a4a', '✅'], ['തെറ്റ്', '#c8312c', '❌']].forEach(([lbl, col, ic], j) => { const p = pop(t, t0 + j * 0.5, 0.3); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2 + (j ? 250 : -250), 1340); g.rotate(j ? 0.05 : -0.05); g.scale(0.8 + 0.2 * p, 0.8 + 0.2 * p);
  card(g, 440, 360, '#f4ecd6'); text(g, ic, 0, -60, { font: 'sans-serif', size: 120 }); g.fillStyle = col; g.beginPath(); g.roundRect(-200, 60, 400, 100, 20); g.fill(); g.stroke(); text(g, lbl, 0, 112, { size: 64, color: '#fff', maxWidth: 380 }); g.restore(); }); }

export const hits = [];
export const extraHits = (timeline) => {
  const m = timeline.scenes.find((x) => x.id === 'main'), out = []; const s = { line: (i) => m.cues[i]?.text, cue: (i) => m.cues[i].start, cueEnd: (i) => m.cues[i].end };
  const sh = shots(s); sh.forEach((x, i) => { if (!i) return; const cut = sh[i - 1].set !== x.set; if (cut || i % 4 === 0) out.push({ t: m.start + x.a - 0.15, kind: 'whoosh', vol: cut ? 0.22 : 0.1 }); });
  const n = []; for (let i = 0; s.line(i); i++) n.push(s.line(i)); const id = (st) => n.findIndex((x) => x.startsWith(st));
  const at2 = (st, nd) => { const i = id(st); return i < 0 ? null : m.start + wt(s, i, nd); }, add = (t, kind, vol) => { if (t != null) out.push({ t, kind, vol }); };
  add(m.start + 0.42, 'thud', 0.55); add(m.start + 0.45, 'boom', 0.35); add(at2('ജനം', 'പുറത്താക്കിയില്ലായിരുന്നെങ്കിലോ?'), 'whoosh', 0.35); add(at2('ജനം', 'ആയിരത്തി'), 'chime', 0.3); add(at2('ജനം', 'ബാലറ്റ്'), 'pop', 0.3); [0, 0.3, 0.6].forEach((d) => add(at2('ജനം', 'ലോകം') + d, 'whoosh', 0.3));
  add(at2('നോക്കൂ', 'നോക്കൂ,'), 'chime', 0.3); add(at2('നോക്കൂ', 'കുടിയിറക്കരുത്!'), 'hit', 0.45); add(at2('നോക്കൂ', 'കുടിയിറക്കരുത്!') + 0.25, 'thud', 0.45);
  add(at2('പിന്നാലെ', 'പിന്നാലെ'), 'pop', 0.3); add(at2('പിന്നാലെ', 'ബില്ലുകൾ.'), 'pop', 0.3); add(at2('പിന്നാലെ', 'ഭൂമി'), 'chime', 0.3); add(at2('പിന്നാലെ', 'സ്വകാര്യ') + 0.4, 'whoosh', 0.25); add(at2('പിന്നാലെ', 'നിയമനത്തിൽ'), 'pop', 0.3);
  add(at2('ഭൂവുടമകളും', 'ഇളകി.'), 'hit', 0.35); ['എൻഎസ്എസ്,', 'കത്തോലിക്കാ', 'മുസ്ലിം', 'കോൺഗ്രസ്:'].forEach((nd) => add(at2('ഭൂവുടമകളും', nd), 'pop', 0.35)); add(at2('ഭൂവുടമകളും', 'വിമോചന') + 0.1, 'thud', 0.55); add(at2('ഭൂവുടമകളും', 'വിമോചന') + 0.12, 'boom', 0.35);
  add(at2('തെരുവുകൾ', 'തെരുവുകൾ'), 'whoosh', 0.3); add(at2('തെരുവുകൾ', 'വെടിവെപ്പ്.'), 'boom', 0.5); add(at2('തെരുവുകൾ', 'വെടിവെപ്പ്.') + 0.35, 'boom', 0.35); add(at2('തെരുവുകൾ', 'ജീവനുകൾ'), 'chime', 0.2);
  add(at2('കാത്തിരിക്കൂ', 'കാത്തിരിക്കൂ...'), 'whoosh', 0.35); add(at2('കാത്തിരിക്കൂ', 'ഭൂരിപക്ഷം'), 'pop', 0.3); add(at2('കാത്തിരിക്കൂ', 'എന്നിട്ടും'), 'chime', 0.3); add(at2('കാത്തിരിക്കൂ', 'ആർട്ടിക്കിൾ') + 0.9, 'thud', 0.6); add(at2('കാത്തിരിക്കൂ', 'ഔട്ട്!') + 0.05, 'hit', 0.5);
  add(at2('കളി', 'കളി'), 'pop', 0.3); for (let k = 0; k < 4; k++) add(at2('കളി', 'ഗാലറിയിലെ') + k * 0.25, 'pop', 0.22); add(at2('കളി', 'അമ്പയർ') + 0.2, 'hit', 0.45); add(at2('കളി', 'റദ്ദാക്കിയതുപോലെ!'), 'thud', 0.4);
  add(at2('അടുത്ത', 'അടുത്ത'), 'chime', 0.3); add(at2('അടുത്ത', 'കമ്മ്യൂണിസ്റ്റുകൾക്ക്') + 0.2, 'pop', 0.35); add(at2('അടുത്ത', 'സീറ്റ്'), 'hit', 0.45);
  for (let k = 0; k < 8; k++) add(at2('അന്നുമുതൽ', 'അന്നുമുതൽ') + 0.2 + k * 0.45 + 0.16, 'thud', 0.3); add(at2('അന്നുമുതൽ', 'നൂറിലേറെ'), 'boom', 0.4);
  add(at2('അന്ന് പിരിച്ചു', 'അന്ന്'), 'boom', 0.4); add(at2('അന്ന് പിരിച്ചു', 'ഭൂപരിഷ്കരണം'), 'chime', 0.35); add(at2('അന്ന് പിരിച്ചു', 'ഇഷ്ടമില്ലാത്ത'), 'whoosh', 0.3);
  add(at2('ഒരു ബാലറ്റ്', 'ഒരു'), 'whoosh', 0.3); add(at2('ഒരു ബാലറ്റ്', 'കടലാസ്'), 'pop', 0.3);
  add(at2('ആ പിരിച്ചുവിടൽ', 'ശരി,'), 'pop', 0.3); add(at2('ആ പിരിച്ചുവിടൽ', 'തെറ്റ്?'), 'pop', 0.3); add(at2('ആ പിരിച്ചുവിടൽ', 'കമന്റ്'), 'chime', 0.3); add(at2('ആ പിരിച്ചുവിടൽ', 'സബ്സ്ക്രൈബ്'), 'pop', 0.4);
  return out.filter((x) => x.t != null && !Number.isNaN(x.t));
};
void H;
export const shotTimes = (timeline) => { const m = timeline.scenes.find((x) => x.id === 'main'); const s = { line: (i) => m.cues[i]?.text, cue: (i) => m.cues[i].start, cueEnd: (i) => m.cues[i].end }; return shots(s).map((x) => ({ a: m.start + x.a, b: m.start + x.b, set: x.set })); };
