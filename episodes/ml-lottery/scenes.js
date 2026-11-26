// Kerala Lottery 1967 (kit formula): hook = Kittunni-ettan's "adichu mole" faint (Kilukkam homage) -> the treasury it fills
// -> what if the one-rupee 'joke' never started; you-see (1967, empty chest, no jobs, Kunju Sahib's idea), mockery,
// launch (1 Nov 1967, Re 1, Rs 50,000), the first draw (26 Jan 1968) to the Onam bumper, today (1.5 lakh sellers,
// Rs 11,000 cr), the tea-shop box analogy, wait...? twist (his win was Nandini's prank; the government wins every draw),
// Karunya, the what-if (leaking chest, idle sellers, silent tea shop), callback (no faint, no "adichu mole").
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
  (await import('../ml-travancore-p2/cast.js')).registerCast(B); (await import('../ml-gulf/cast.js')).registerCast(B); (await import('./cast.js')).registerCast(B);
  const G = await import('../ml-gulf/sets.js'), Z = await import('./sets.js'), st = await import('../ml-bean/street.js');
  S = { home: G.homeSet(), office: Z.financeOffice(), tea: Z.teaShopSet(), draw: Z.drawSet(), street: st.buildStreet() };
  S.street.cards = st.radioCrowd(S.street.scene);
  buildHome(); buildOffice(); buildTea(); buildDraw(); buildStreet();
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
const shakeAt = (t, t0, d = 0.5) => (t >= t0 && t < t0 + d ? Math.pow(1 - (t - t0) / d, 2) : 0);
const cw = (ch) => (/[0-9]/.test(ch) ? 7 : 1);
function wt(s, i, needle) { const line = s.line(i), a = s.cue(i), b = s.cueEnd(i); const k = Math.max(0, line.indexOf(needle));
  const al = ALIGN[i]; if (al && al.length === line.split(/\s+/).length) { const ws = line.split(/\s+/), wi = line.slice(0, k).split(/\s+/).length - 1, off = k - ws.slice(0, wi).join(' ').length - (wi ? 1 : 0), t0 = al[wi][1], t1 = wi + 1 < al.length ? al[wi + 1][1] : b - a; return a + t0 + (t1 - t0) * Math.max(0, off) / Math.max(1, ws[wi].length); }
  let pre = 0, tot = 0; for (let j = 0; j < line.length; j++) { const c = cw(line[j]); tot += c; if (j < k) pre += c; } return a + (pre / tot) * (b - a); }


function laughCrowd(t) { const E = ['laugh', 'grin', 'laugh', 'smug', 'laugh', 'beam', 'laugh', 'grin', 'laugh'];
  S.street.crowd.forEach((a, i) => pose(a, { expr: E[i % E.length], L: i % 3 === 0 ? 'point' : 'hip', R: i % 2 ? 'mouth' : 'hip', look: -1, lean: (i % 2 ? 0.08 : -0.06) * Math.sin(t * 9 + i), hop: hopAt(t, 8, 0.06, i * 1.3) }, t)); }

function tidy(list) {
  const n = list.length; for (let i = 1; i < n; i++) { const lo = list[i - 1].a + 0.6, hi = i + 1 < n ? list[i + 1].a - 0.6 : 1e9; if (list[i].a < lo) list[i].a = Math.min(lo, Math.max(list[i - 1].a + 0.3, (list[i - 1].a + hi) / 2)); }
  for (let i = 0; i < n; i++) list[i].b = i + 1 < n ? list[i + 1].a : list[i].b;
  const out = []; list.forEach((x) => { const d = x.b - x.a; if (d <= 2.4 || x.b > 1e8) { out.push(x); return; } const k = Math.ceil(d / 2.1), step = d / k;
    for (let j = 0; j < k; j++) { if (!j) { out.push({ ...x, b: x.a + step }); continue; } const side = j % 2 ? 1 : -1, push = 0.2 + 0.08 * j, far = Math.hypot(...x.keys[0][1].map((v, q) => v - x.keys[0][2][q])) > 20 ? 6 : 1;
      const keys = x.keys.map(([t, p, l, r = 0, f = 52]) => [t, p.map((v, q) => v + (l[q] - v) * push + (q === 0 ? side * 0.25 * far : q === 1 ? 0.1 * far : 0)), l, -r + side * 0.03, f - 4]);
      out.push({ ...x, a: x.a + j * step, b: j === k - 1 ? x.b : x.a + (j + 1) * step, keys, flash: null }); } });
  return out;
}


function renderShot(g, sh, t, alpha = 1) {
  const set = S[sh.set]; const tt = t - sh.a; set.life.forEach((f) => f(t)); resetProps(); sh.act(t, tt, sh);
  const c = camAt(sh.keys, tt); const dist = Math.hypot(...c.p.map((v, q) => v - c.l[q])); place(c, t, sh.shake != null ? shakeAt(t, sh.shake, 0.5) : 0, dist > 25 ? 5 : 1); camera.updateMatrixWorld();
  const gr = sh.night ? GRADE.night : GRADE[sh.set]; const cv = stage.render(set.scene, camera, { focus: Math.min(dist, 30), aperture: dist > 25 ? 1.5 : 6, ...gr, sat: sh.war ? 0.6 : gr.sat });
  g.save(); g.globalAlpha = alpha;
  if (sh.dream) { g.filter = 'saturate(0.45) brightness(1.06)'; const N = 48, sh2 = H / N; for (let i = 0; i < N; i++) { const dx = Math.sin(i * 0.35 + t * 3) * 10; g.drawImage(cv, 0, i * sh2 * (cv.height / H), cv.width, sh2 * (cv.height / H) + 1, dx, i * sh2, W, sh2 + 1); } g.filter = 'none';
    const rg = g.createRadialGradient(W / 2, H / 2, W * 0.35, W / 2, H / 2, H * 0.62); rg.addColorStop(0, 'rgba(255,255,255,0)'); rg.addColorStop(1, 'rgba(255,255,255,.75)'); g.fillStyle = rg; g.fillRect(0, 0, W, H);
  } else g.drawImage(cv, 0, 0, W, H);
  if (sh.war) { g.fillStyle = 'rgba(160,40,20,.28)'; g.fillRect(0, 0, W, H); }
  g.restore();
  if (sh.flash != null) { const k = t - sh.flash, a = k < 0 ? 0 : k < 0.27 ? 0 : k < 0.6 ? 1 - (k - 0.27) / 0.33 : 0; const pre = Math.max(0, 1 - Math.abs(k) / 0.27); g.save(); g.globalAlpha = Math.max(a, pre) * 0.9 * alpha; g.fillStyle = '#fff'; g.fillRect(0, 0, W, H); g.restore(); }
  overlays(g, t, alpha);
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
function chips(g, t, items, alpha) { // items that appear and get crossed out, one by one
  items.forEach(([txt, t0], i) => { const p = ezo(span(t, t0, 0.25)); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1180 + i * 230); g.rotate(i % 2 ? 0.03 : -0.03); g.scale(0.8 + 0.2 * p, 0.8 + 0.2 * p);
    g.fillStyle = '#f4ecd6'; g.strokeStyle = '#2a1c17'; g.lineWidth = 9; g.beginPath(); g.roundRect(-330, -85, 660, 170, 26); g.fill(); g.stroke(); text(g, txt, -40, 4, { size: 90, color: '#2a1c17' });
    const x = ezo(span(t, t0 + 0.25, 0.2)); if (x > 0) { g.strokeStyle = '#d0281e'; g.lineWidth = 22; g.lineCap = 'round'; g.beginPath(); g.moveTo(-260, 0); g.lineTo(-260 + 450 * x, 0); g.stroke(); text(g, '✘', 250, 4, { font: "'Oswald'", size: 120, color: '#d0281e' }); }
    g.restore(); }); }

function seal(g, t, t0, alpha) { // gold record seal
  const k = span(t, t0, 0.3); if (k <= 0) return; const sc = lerp(2, 1, ezo(k)); g.save(); g.globalAlpha = alpha * Math.min(1, k * 3); g.translate(W / 2, 1400); g.rotate(Math.sin(t * 2) * 0.04); g.scale(sc, sc);
  g.fillStyle = '#e8b93a'; g.strokeStyle = '#2a1c17'; g.lineWidth = 9; g.beginPath(); for (let i = 0; i < 48; i++) { const a = i / 48 * Math.PI * 2, r = i % 2 ? 250 : 275; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.fill(); g.stroke();
  g.fillStyle = '#f6d24a'; g.beginPath(); g.arc(0, 0, 210, 0, 7); g.fill(); g.stroke(); text(g, 'ഗിന്നസ്', 0, -70, { size: 80, color: '#5a3a10' }); text(g, 'റെക്കോർഡ്', 0, 20, { size: 72, color: '#5a3a10' }); text(g, 'LARGEST CIVILIAN AIRLIFT', 0, 110, { font: "'Oswald'", weight: 700, size: 34, color: '#5a3a10' });
  g.restore(); }

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

const PEOPLE = ['dasan', 'vijayan', 'youth', 'chaya', 'amma', 'kannan', 'fisher', 'ammini', 'meenu', 'manavalan', 'worker', 'youth', 'amma', 'kannan'];
function buildHome() { const h = S.home, sc = h.scene; h.setBuild(0); h.kit = actor(sc, 'kittunni', 0, 2.7); h.nan = actor(sc, 'nandini', 1.5, 2.4); }
function buildOffice() { const o = S.office, sc = o.scene; o.kunju = actor(sc, 'kunju', 0, -3.2); o.clerk = actor(sc, 'clerk', 1.9, -2.6); }
function buildTea() { const c = S.tea, sc = c.scene; c.chaya = actor(c.shop, 'chaya', 0.2, -0.95, 0.3); c.dasan = actor(sc, 'dasan', -1.5, 2.3); c.seller = actor(sc, 'seller', 2.4, 2.5); c.kit = actor(sc, 'kittunni', 0.5, 2.6); c.youth = actor(sc, 'youth', -2.6, 2.1); }
function buildDraw() { const d = S.draw, sc = d.scene; d.kunju = actor(sc, 'kunju', -1.7, -3.5, 0.7); d.clerk = actor(sc, 'clerk', 1.9, -3.5, 0.7); d.aud = []; for (let i = 0; i < 16; i++) d.aud.push(actor(sc, PEOPLE[i % PEOPLE.length], -4.0 + (i % 8) * 1.15, 1.0 + Math.floor(i / 8) * 1.3)); }
function buildStreet() { const s = S.street; s.crowd = s.cards.map((c) => ({ c, last: '', seed: (Math.abs(c.position.x) * 13.1 + Math.abs(c.position.z) * 7.7) % 9, base: [c.position.x, c.position.y, c.position.z] }));
  s.sellers = []; for (let i = 0; i < 14; i++) s.sellers.push(actor(s.scene, 'seller', (i % 2 ? 1.6 : -1.2) + Math.sin(i) * 0.4, 1.5 - i * 2.2)); s.kit = actor(s.scene, 'kittunni', 0.4, 1.0); }

// ------------------------------------------------------------------ per-shot state
let OV = null;
function resetProps() {
  const h = S.home, o = S.office, c = S.tea, d = S.draw, s = S.street;
  [h.kit, h.nan, o.kunju, o.clerk, c.chaya, c.dasan, c.seller, c.kit, c.youth, d.kunju, d.clerk, ...d.aud, ...s.sellers, s.kit].forEach((x) => { x.c.visible = false; x.c.position.set(...x.base); });
  s.crowd.forEach((x) => { x.c.visible = false; });
  const ch = o.chest; ch.setOpen(0); ch.setFill(0); ch.setCrown(false); ch.setCobweb(false); ch.setLeak(0); c.setBox(0); c.setResult('result'); c.setCal(2026); d.setWheels(0, 0, [4, 3, 8, 2, 7, 1], [0, 0, 0, 0, 0, 0]);
  OV = {};
}
function laughCrowdOn(t) { S.street.crowd.forEach((x) => { x.c.visible = true; }); laughCrowd(t); }
const kitPose = (t, o) => pose(S.home.kit, { L: 'hang', look: 0, ...o }, t);
function audience(t, mode = 'watch') { S.draw.aud.forEach((a, i) => pose(a, { expr: mode === 'cheer' ? ['beam', 'laugh', 'grin'][i % 3] : mode === 'sad' ? 'bored' : ['think', 'smile', 'nervous'][i % 3], R: mode === 'cheer' ? 'up' : i % 2 ? 'hold' : 'chin', propR: mode !== 'cheer' && i % 2 ? 'ticket' : null, L: mode === 'cheer' ? 'up' : 'hang', look: 0, lookY: -0.4, hop: mode === 'cheer' ? hopAt(t, 8, 0.06, i) : 0 }, t)); }
function sellers(t, mode = 'sell', n = 14) { S.street.sellers.forEach((a, i) => { if (i >= n) return; pose(a, mode === 'idle' ? { expr: ['sad', 'bored', 'sad'][i % 3], R: 'hang', L: 'hang', look: i % 2 ? -0.5 : 0.5 } : { expr: ['grin', 'beam', 'smile'][i % 3], R: 'holdUp', propR: 'board', L: i % 2 ? 'wave' : 'hip', look: i % 2 ? -0.6 : 0.6, hop: hopAt(t, 5, 0.03, i) }, t); }); }

// ------------------------------------------------------------------ shots
function shots(s) { return tidy(rawShots(s)); }
function rawShots(s) {
  const L = (i) => s.cue(i), w = (i, n) => wt(s, i, n);
  const HO = (k) => ({ set: 'home', ...k }), OF = (k) => ({ set: 'office', ...k }), TE = (k) => ({ set: 'tea', ...k }), DR = (k) => ({ set: 'draw', ...k }), ST = (k) => ({ set: 'street', ...k });
  const h = S?.home, o = S?.office, c = S?.tea, d = S?.draw, st = S?.street;
  const kitHome = [[0, [0.5, 1.9, 8.6], [0, 1.4, 2.7], 0.04, 46], [0.35, [0.45, 1.9, 8.2], [0, 1.42, 2.7], 0.01, 44], [2.2, [0.4, 1.9, 7.8], [0, 1.45, 2.7], -0.02, 42]];
  const chestCam = [[0, [-1.2, 2.5, 0.9], [-3.4, 0.9, -3.2], 0.04, 50], [0.35, [-1.3, 2.45, 0.6], [-3.4, 0.9, -3.2], 0.01, 48], [2.2, [-1.4, 2.4, 0.3], [-3.4, 0.95, -3.2], -0.02, 46]];
  const deskCam = [[0, [0.5, 1.7, 0.4], [0, 1.45, -3.2], 0.04, 44], [0.35, [0.45, 1.7, 0.1], [0, 1.47, -3.2], 0.01, 42], [2.2, [0.4, 1.7, -0.2], [0, 1.5, -3.2], -0.02, 40]];
  const teaWide = [[0, [1.4, 2.0, 8.2], [0, 1.4, 0], 0.03, 50], [0.4, [1.3, 2.0, 7.8], [0, 1.4, 0], 0.01, 50], [2.2, [1.2, 2.0, 7.4], [0, 1.45, 0], -0.02, 50]];
  const drawWide = [[0, [0, 3.6, 5.2], [0, 1.6, -5], 0.03, 54], [0.4, [0, 3.5, 4.8], [0, 1.6, -5], 0.01, 54], [2.2, [0, 3.4, 4.4], [0, 1.65, -5], -0.02, 52]];
  const wheelCam = [[0, [0.5, 2.5, 1.2], [0, 2.0, -5.2], 0.03, 44], [0.35, [0.45, 2.5, 0.9], [0, 2.0, -5.2], 0.01, 42], [2, [0.4, 2.5, 0.6], [0, 2.05, -5.2], -0.02, 40]];
  const streetLaugh = [[0, [1.0, 1.7, 0.9], [-1.8, 1.5, -4], 0.04, 52], [0.35, [0.7, 1.75, 1.3], [-1.8, 1.55, -4], 0.02, 54], [2.1, [0.5, 1.8, 1.6], [-1.8, 1.6, -4], -0.01, 54]];
  const streetSell = [[0, [0.2, 1.9, 5.5], [0.2, 1.4, -14], 0.03, 50], [0.4, [0.2, 2.1, 5.0], [0.2, 1.4, -14], 0.01, 50], [2.2, [0.2, 2.4, 4.4], [0.2, 1.4, -14], -0.02, 50]];
  const crown = (t) => { o.chest.setOpen(1); o.chest.setFill(1); o.chest.setCrown(true); };
  const w0Lo = w(0, 'ലോട്ടറി'), w0Bo = w(0, 'ബോധംകെട്ടു'), w0Aa = w(0, 'ആ ഒരു'), w0Kh = w(0, 'ഖജനാവ്'), w0Ru = w(0, 'ഒരു രൂപയിൽ'), w0Il = w(0, 'ഇല്ലായിരുന്നെങ്കിലോ');
  const w1Kh = w(1, 'ഖജനാവിൽ'), w1Na = w(1, 'നാട്ടിൽ'), w1Dh = w(1, 'ധനമന്ത്രി'), w1Id = w(1, 'ഐഡിയ'), w1Sw = w(1, 'സ്വകാര്യ'), w1Sa = w(1, 'സർക്കാർ');
  const w2Sa = w(2, '"സർക്കാർ'), w2Or = w(2, 'ഒരു രൂപ');
  const w3Ke = w(3, 'കേരളപ്പിറവി'), w3Aa = w(3, 'ആദ്യ'), w3Vi = w(3, 'വില'), w3On = w(3, 'ഒന്നാം');
  const w4Na = w(4, 'ആദ്യ നറുക്കെടുപ്പ്'), w4Pi = w(4, 'പിന്നെ'), w4Aa = w(4, 'ആഴ്ചയിൽ'), w4Oo = w(4, 'ഓണം'), w4On = w(4, 'ഒന്നാം');
  const w5Or = w(5, 'ഒരു വർഷം');
  const w6Ip = w(6, 'ഇപ്പോൾ');
  const w7Ki = w(7, 'കിട്ടുണ്ണിയേട്ടന്'), w7Il = w(7, 'ഇല്ല.'), w7Na = w(7, 'നന്ദിനി'), w7Pa = w(7, 'പക്ഷേ'), w7Sa = w(7, 'സർക്കാർ!');
  const w8Ka = w(8, 'കാരുണ്യ');
  const w9Kh = w(9, 'ഖജനാവിൽ'), w9La = w(9, 'ലക്ഷക്കണക്കിന്'), w9Ch = w(9, 'ചായക്കടയിൽ');
  const w10Ad = w(10, '"അടിച്ചു'), w10Ma = w(10, 'മലയാളിയും');
  return [
    // ---- 1. HOOK: "adichu mole!" -> the faint -> the treasury it fills -> what if?
    HO({ a: 0, b: w0Lo - 0.1, keys: kitHome, act: (t) => { kitPose(t, { expr: 'laugh', R: 'hold', propR: 'newspaper', L: 'up', hop: hopAt(t, 9, 0.07), talk: Math.abs(Math.sin(t * 12)) * 0.6 }); OV.bubble = { t0: 0.05, txt: '"അടിച്ചു മോളേ!"', x: 0.5, y: 0.66 }; } }),
    HO({ a: w0Lo - 0.1, b: w0Bo - 0.1, keys: [[0, [0.5, 2.0, 6.6], [0.2, 1.75, 2.7], 0.04, 42], [0.35, [0.45, 2.0, 6.3], [0.2, 1.76, 2.7], 0.01, 40], [2, [0.4, 2.0, 6.0], [0.2, 1.78, 2.7], -0.02, 38]],
      act: (t) => { kitPose(t, { expr: 'beam', R: 'holdUp', propR: 'ticketBig', L: 'up', hop: hopAt(t, 10, 0.05) }); OV.tag = { t0: w(0, 'കിട്ടുണ്ണിയേട്ടൻ'), txt: 'കിട്ടുണ്ണിയേട്ടൻ', sub: 'കിലുക്കം · 1991' }; } }),
    HO({ a: w0Bo - 0.1, b: w0Aa - 0.1, shake: w0Bo + 0.45, keys: [[0, [1.8, 1.8, 8.4], [-0.3, 0.9, 2.7], 0.05, 48], [0.35, [1.7, 1.75, 8.1], [-0.3, 0.85, 2.7], 0.02, 48], [2, [1.6, 1.7, 7.8], [-0.3, 0.8, 2.7], -0.02, 48]],
      act: (t) => { const u = ezo(span(t, w0Bo, 0.5)); kitPose(t, { expr: u > 0.3 ? 'shock' : 'laugh', R: 'out', L: 'up', lean: u * 1.42, blink: u > 0.8 ? 1 : 0 }); OV.stars = { t0: w0Bo + 0.45 }; } }),
    OF({ a: w0Aa - 0.1, b: w0Kh - 0.1, keys: chestCam, act: (t, tt, sh) => { o.chest.setOpen(1); o.chest.setFill(ezo(span(t, sh.a, 1.6))); OV.coins = { t0: sh.a }; } }),
    OF({ a: w0Kh - 0.1, b: w0Ru - 0.1, keys: [[0, [-2.4, 1.8, -0.3], [-3.4, 0.9, -3.2], 0.03, 44], [0.35, [-2.45, 1.8, -0.5], [-3.4, 0.9, -3.2], 0.01, 42], [2, [-2.5, 1.8, -0.7], [-3.4, 0.95, -3.2], -0.02, 40]],
      act: (t) => { o.chest.setOpen(1); o.chest.setFill(1); OV.badge = { t0: w0Kh, txt: 'ഖജനാവ്', sub: 'KERALA TREASURY' }; } }),
    TE({ a: w0Ru - 0.1, b: L(1), flash: w0Il - 0.15, keys: teaWide, act: (t) => { pose(c.seller, { expr: 'grin', R: 'holdUp', propR: 'board', L: 'wave', look: -0.3 }, t); pose(c.chaya, { expr: 'smile', R: 'hold', propR: 'glass', L: 'hip' }, t); pose(c.dasan, { expr: 'think', R: 'hold', propR: 'ticket', L: 'chin', look: 0.5 }, t);
      if (t < w0Il - 0.1) OV.ticket = { t0: w0Ru, price: '₹1' }; else OV.big = { t0: w0Il, txt: '?', sub: 'ഇല്ലായിരുന്നെങ്കിലോ?' }; } }),
    // ---- 2. YOU SEE: 1967. empty treasury, no jobs. Kunju Sahib's idea: ban private lotteries, the government runs one.
    OF({ a: L(1), b: w1Kh - 0.1, keys: [[0, [1.6, 2.4, 2.4], [-0.6, 1.6, -3.4], 0.03, 54], [0.4, [1.5, 2.4, 2.1], [-0.6, 1.6, -3.4], 0.01, 52], [2, [1.4, 2.4, 1.8], [-0.6, 1.65, -3.4], -0.02, 50]],
      act: (t) => { pose(o.kunju, { expr: 'think', R: 'chin', L: 'hip', look: -0.5 }, t); o.chest.setCobweb(true, t); OV.cal = { t0: L(1) + 0.1 }; } }),
    OF({ a: w1Kh - 0.1, b: w1Na - 0.1, keys: chestCam, act: (t) => { o.chest.setOpen(0.8); o.chest.setCobweb(true, t); OV.chips = { items: [['പണം', w(1, 'പണമില്ല')]] }; } }),
    ST({ a: w1Na - 0.1, b: w1Dh - 0.1, keys: streetSell, act: (t) => { sellers(t, 'idle', 10); OV.chips = { items: [['പണി', w(1, 'പണിയില്ല')]] }; } }),
    OF({ a: w1Dh - 0.1, b: w1Id - 0.1, keys: deskCam, act: (t) => { pose(o.kunju, { expr: 'proud', R: 'hold', propR: 'files', L: 'hip', look: 0 }, t); OV.tag = { t0: w1Dh, txt: 'പി.കെ. കുഞ്ഞ് സാഹിബ്', sub: 'ധനമന്ത്രി · 1967' }; } }),
    OF({ a: w1Id - 0.1, b: w1Sw - 0.1, keys: [[0, [0.4, 2.7, -0.2], [0, 1.75, -3.2], 0.04, 46], [0.35, [0.35, 2.7, -0.4], [0, 1.75, -3.2], 0.01, 44], [2, [0.3, 2.7, -0.6], [0, 1.78, -3.2], -0.02, 42]],
      act: (t) => { pose(o.kunju, { expr: 'beam', R: 'up', L: 'hip', look: 0, hop: hopAt(t, 6, 0.03) }, t); OV.idea = { t0: w1Id }; } }),
    ST({ a: w1Sw - 0.1, b: w1Sa - 0.1, keys: [[0, [0.6, 1.7, 2.4], [-0.6, 1.5, -6], 0.03, 50], [0.35, [0.5, 1.7, 2.1], [-0.6, 1.5, -6], 0.01, 50], [2, [0.4, 1.7, 1.8], [-0.6, 1.5, -6], -0.02, 48]],
      act: (t) => { sellers(t, 'idle', 4); OV.stamp = { t0: w(1, 'നിരോധിക്കുക'), txt: 'സ്വകാര്യ ലോട്ടറി: നിരോധിച്ചു', sub: 'PRIVATE LOTTERIES BANNED' }; } }),
    OF({ a: w1Sa - 0.1, b: L(2), keys: deskCam, act: (t) => { pose(o.kunju, { expr: 'proud', R: 'holdUp', propR: 'ticket', L: 'thumb', look: 0 }, t); pose(o.clerk, { expr: 'shock', R: 'mouth', L: 'hang', look: -1 }, t); OV.badge = { t0: w1Sa, txt: 'സർക്കാർ ലോട്ടറി', sub: 'KERALA STATE LOTTERY' }; } }),
    // ---- 3. MOCKERY
    ST({ a: L(2), b: w2Or - 0.1, keys: streetLaugh, act: (t) => { laughCrowdOn(t); if (t > w2Sa) OV.bubble = { t0: w2Sa, txt: '"സർക്കാർ ചൂതാട്ടമോ?"', x: 0.5, y: 0.64 }; } }),
    TE({ a: w2Or - 0.1, b: L(3), keys: [[0, [-0.6, 1.9, 8.0], [-1.0, 1.4, 2.2], 0.04, 46], [0.35, [-0.65, 1.9, 7.7], [-1.0, 1.42, 2.2], 0.01, 44], [2, [-0.7, 1.9, 7.4], [-1.0, 1.45, 2.2], -0.02, 42]],
      act: (t) => { pose(c.dasan, { expr: 'laugh', R: 'mouth', L: 'hip', lean: Math.sin(t * 9) * 0.06, hop: hopAt(t, 8, 0.05) }, t); pose(c.youth, { expr: 'laugh', R: 'point', L: 'hip', look: 1, hop: hopAt(t, 8, 0.05, 1) }, t); pose(c.seller, { expr: 'nervous', R: 'holdUp', propR: 'board', L: 'hang', look: -1 }, t);
        OV.bubble = { t0: w2Or, txt: '"₹1 വിറ്റ് സംസ്ഥാനമോ?"', x: 0.5, y: 0.64 }; } }),
    // ---- 4. LAUNCH: 1 Nov 1967 (Kerala Piravi), first ticket, Re 1, Rs 50,000
    TE({ a: L(3), b: w3Aa - 0.1, keys: teaWide, act: (t) => { c.setCal(1967); pose(c.seller, { expr: 'beam', R: 'holdUp', propR: 'board', L: 'wave', look: -0.3 }, t); pose(c.chaya, { expr: 'smile', R: 'hold', propR: 'glass', L: 'hip' }, t); OV.cal = { t0: L(3), nov: true }; if (t > w3Ke) OV.badge = { t0: w3Ke, txt: 'കേരളപ്പിറവി ദിനം', sub: '1 NOV 1967' }; } }),
    TE({ a: w3Aa - 0.1, b: w3Vi - 0.1, keys: [[0, [1.8, 1.9, 7.6], [2.2, 1.5, 2.5], 0.04, 44], [0.35, [1.8, 1.9, 7.3], [2.2, 1.52, 2.5], 0.01, 42], [2, [1.8, 1.9, 7.0], [2.2, 1.55, 2.5], -0.02, 40]],
      act: (t) => { pose(c.seller, { expr: 'beam', R: 'holdUp', propR: 'board', L: 'wave', look: -0.2, hop: hopAt(t, 6, 0.04) }, t); OV.ticket = { t0: w3Aa, price: '₹1', prize: true }; } }),
    TE({ a: w3Vi - 0.1, b: w3On - 0.1, keys: [[0, [0.7, 1.9, 7.4], [0.5, 1.5, 2.6], 0.04, 44], [0.35, [0.7, 1.9, 7.1], [0.5, 1.52, 2.6], 0.01, 42], [2, [0.7, 1.9, 6.8], [0.5, 1.55, 2.6], -0.02, 40]],
      act: (t) => { pose(c.kit, { expr: 'beam', R: 'holdUp', propR: 'ticket', L: 'hip', look: 0.4 }, t); OV.big = { t0: w3Vi, txt: '₹1', sub: 'ടിക്കറ്റ് വില' }; } }),
    TE({ a: w3On - 0.1, b: L(4), keys: [[0, [0.7, 2.0, 6.4], [0.5, 1.75, 2.6], 0.04, 40], [0.35, [0.7, 2.0, 6.1], [0.5, 1.77, 2.6], 0.01, 38], [2, [0.7, 2.0, 5.8], [0.5, 1.8, 2.6], -0.02, 36]],
      act: (t) => { pose(c.kit, { expr: 'shock', R: 'holdUp', propR: 'ticket', L: 'up', look: 0 }, t); OV.big = { t0: w3On, txt: '₹50,000', sub: 'ഒന്നാം സമ്മാനം', count: true }; } }),
    // ---- 5. THE DRAW and the growth: 26 Jan 1968, seven a week, the Onam bumper, 25 crore
    DR({ a: L(4), b: w4Na - 0.1, keys: drawWide, act: (t, tt, sh) => { audience(t); pose(d.kunju, { expr: 'proud', R: 'point', L: 'hip', look: 1 }, t); pose(d.clerk, { expr: 'smile', R: 'hold', propR: 'files', L: 'hip', look: 1 }, t); d.setWheels(t, sh.a); OV.badge = { t0: w(4, 'ജനുവരി'), txt: '26 ജനുവരി 1968', sub: 'ആദ്യ നറുക്കെടുപ്പ്' }; } }),
    DR({ a: w4Na - 0.1, b: w4Pi - 0.1, keys: wheelCam, act: (t, tt, sh) => { const a = sh.a; d.setWheels(t, a - 2, [4, 3, 8, 2, 7, 1], [a + 0.3, a + 0.5, a + 0.7, a + 0.9, a + 1.1, a + 1.3]); } }),
    DR({ a: w4Pi - 0.1, b: w4Oo - 0.1, keys: drawWide, act: (t, tt, sh) => { audience(t, 'cheer'); pose(d.kunju, { expr: 'beam', R: 'up', L: 'hip', look: 1 }, t); d.setWheels(t * 2, sh.a); OV.week = { t0: w4Aa }; } }),
    TE({ a: w4Oo - 0.1, b: w4On - 0.1, keys: [[0, [1.8, 1.9, 7.6], [2.2, 1.5, 2.5], -0.04, 44], [0.35, [1.8, 1.9, 7.3], [2.2, 1.52, 2.5], -0.01, 42], [2, [1.8, 1.9, 7.0], [2.2, 1.55, 2.5], 0.02, 40]],
      act: (t) => { pose(c.seller, { expr: 'laugh', R: 'holdUp', propR: 'board', L: 'up', look: -0.2, hop: hopAt(t, 7, 0.05) }, t); OV.tag = { t0: w4Oo, txt: 'ഓണം ബമ്പർ', sub: 'THIRUVONAM BUMPER' }; } }),
    TE({ a: w4On - 0.1, b: L(5), shake: w(4, 'കോടി') + 0.1, keys: teaWide, act: (t) => { pose(c.seller, { expr: 'laugh', R: 'holdUp', propR: 'board', L: 'up', hop: hopAt(t, 7, 0.05) }, t); pose(c.dasan, { expr: 'shock', R: 'mouth', L: 'up' }, t); pose(c.kit, { expr: 'shock', R: 'holdUp', propR: 'ticket', L: 'up' }, t); OV.big = { t0: w4On, txt: '₹25 കോടി', sub: 'ഒന്നാം സമ്മാനം' }; } }),
    // ---- 6. TODAY: 1.5 lakh+ sellers; Rs 11,000 crore of tickets a year
    ST({ a: L(5), b: w5Or - 0.1, keys: streetSell, act: (t) => { sellers(t); OV.big = { t0: w(5, 'ഒന്നര'), txt: '1,50,000+', sub: 'വിൽപ്പനക്കാർ', count: true }; } }),
    OF({ a: w5Or - 0.1, b: L(6), keys: chestCam, act: (t, tt, sh) => { o.chest.setOpen(1); o.chest.setFill(1); OV.coins = { t0: sh.a }; OV.big = { t0: w(5, 'പതിനൊന്നായിരം'), txt: '₹11,000 കോടി', sub: 'ഒരു വർഷത്തെ ടിക്കറ്റ് വിൽപ്പന' }; } }),
    // ---- 7. ANALOGY: the little box in the tea-shop corner now runs the whole shop
    TE({ a: L(6), b: w6Ip - 0.1, keys: [[0, [-1.5, 2.0, 2.6], [-2.0, 1.45, 0.05], 0.03, 40], [0.35, [-1.52, 2.0, 2.4], [-2.0, 1.47, 0.05], 0.01, 38], [2, [-1.55, 2.0, 2.2], [-2.0, 1.5, 0.05], -0.02, 36]],
      act: (t) => { pose(c.chaya, { expr: 'smile', R: 'hold', propR: 'glass', L: 'hip', look: -1 }, t); OV.badge = { t0: w(6, 'ഭണ്ഡാരപ്പെട്ടി'), txt: 'ഭണ്ഡാരപ്പെട്ടി', sub: '' }; } }),
    TE({ a: w6Ip - 0.1, b: L(7), shake: w6Ip + 0.5, keys: [[0, [1.0, 2.3, 7.0], [-0.3, 1.8, 0], 0.03, 52], [0.4, [1.0, 2.4, 7.6], [-0.3, 1.9, 0], 0.01, 54], [2.2, [1.0, 2.6, 8.4], [-0.3, 2.1, 0], -0.02, 56]],
      act: (t) => { c.setBox(ezo(span(t, w6Ip, 0.9))); pose(c.dasan, { expr: 'shock', R: 'mouth', L: 'up', look: 0.6 }, t); pose(c.seller, { expr: 'shock', R: 'holdUp', propR: 'board', L: 'up', look: -0.6 }, t); pose(c.youth, { expr: 'nervous', R: 'hang', L: 'up', look: 1 }, t); } }),
    // ---- 8. WAIT...? Did he really win? No: Nandini's prank. The one who wins every draw: the government.
    HO({ a: L(7), b: w7Il - 0.1, rewind: true, keys: kitHome, act: (t, tt, sh) => { const u = 1 - ezo(span(t, sh.a, 0.9)); kitPose(t, { expr: u > 0.3 ? 'shock' : 'beam', R: 'holdUp', propR: 'ticketBig', L: 'up', lean: u * 1.42 }); OV.rewind = { t0: sh.a }; } }),
    HO({ a: w7Il - 0.1, b: w7Na - 0.1, keys: kitHome, act: (t) => { kitPose(t, { expr: 'sad', R: 'holdUp', propR: 'ticketBig', L: 'hang' }); OV.nope = { t0: w7Il, kind: 'ticket', txt: 'ഇല്ല!' }; } }),
    HO({ a: w7Na - 0.1, b: w7Pa - 0.1, keys: [[0, [1.4, 1.9, 7.8], [0.8, 1.45, 2.5], 0.04, 44], [0.35, [1.35, 1.9, 7.5], [0.8, 1.47, 2.5], 0.01, 42], [2, [1.3, 1.9, 7.2], [0.8, 1.5, 2.5], -0.02, 40]],
      act: (t) => { pose(h.nan, { expr: 'sly', R: 'hold', propR: 'newspaper', L: 'mouth', look: -1, hop: hopAt(t, 9, 0.03) }, t); kitPose(t, { expr: 'shock', R: 'hang', L: 'hang', look: 1 }); OV.stamp = { t0: w(7, 'പറ്റിക്കലായിരുന്നു'), txt: 'പറ്റിക്കൽ!', sub: "NANDINI'S PRANK" }; } }),
    DR({ a: w7Pa - 0.1, b: w7Sa - 0.1, keys: wheelCam, act: (t, tt, sh) => { d.setWheels(t, sh.a - 1); } }),
    OF({ a: w7Sa - 0.1, b: L(8), flash: w7Sa - 0.1, keys: [[0, [-1.0, 2.6, 1.0], [-2.6, 1.3, -3.2], 0.04, 50], [0.35, [-1.1, 2.55, 0.7], [-2.6, 1.3, -3.2], 0.01, 48], [2, [-1.2, 2.5, 0.4], [-2.6, 1.35, -3.2], -0.02, 46]],
      act: (t) => { crown(t); pose(o.kunju, { expr: 'smug', R: 'thumb', L: 'hip', look: -1 }, t); OV.badge = { t0: w7Sa, txt: 'എപ്പോഴും ജയിക്കുന്നത്', sub: 'സർക്കാർ 👑'.replace(' 👑', '') }; } }),
    // ---- 9. KARUNYA: even the medical aid comes from that profit
    OF({ a: L(8), b: L(9), keys: chestCam, act: (t, tt, sh) => { crown(t); OV.karunya = { t0: w8Ka - 0.2 }; } }),
    // ---- 10. WHAT IF it never started: the leaking chest, idle sellers, a silent tea shop
    DR({ a: L(9), b: w9Kh - 0.1, dream: true, keys: drawWide, act: (t) => { audience(t, 'sad'); OV.nope = { t0: L(9) + 0.4, kind: 'ticket', txt: 'ലോട്ടറി ഇല്ലെങ്കിൽ?' }; } }),
    OF({ a: w9Kh - 0.1, b: w9La - 0.1, dream: true, keys: chestCam, act: (t) => { o.chest.setOpen(0.8); o.chest.setFill(0.15); o.chest.setLeak(1, t); o.chest.setCobweb(true, t); OV.badge = { t0: w(9, 'ആയിരക്കണക്കിന്'), txt: 'ആയിരക്കണക്കിന് കോടിയുടെ ഓട്ട', sub: 'EVERY YEAR' }; } }),
    ST({ a: w9La - 0.1, b: w9Ch - 0.1, dream: true, keys: streetSell, act: (t) => { sellers(t, 'idle'); OV.chips = { items: [['പണി', w(9, 'പണിയില്ല')]] }; } }),
    TE({ a: w9Ch - 0.1, b: L(10), dream: true, keys: [[0, [0.6, 1.9, 5.2], [0.6, 1.8, -3], 0.03, 46], [0.35, [0.6, 1.9, 4.9], [0.6, 1.8, -3], 0.01, 44], [2, [0.6, 1.9, 4.6], [0.6, 1.82, -3], -0.02, 42]],
      act: (t) => { c.setResult('blank'); pose(c.chaya, { expr: 'bored', R: 'hold', propR: 'glass', L: 'hip' }, t); pose(c.dasan, { expr: 'bored', R: 'hold', propR: 'newspaper', L: 'hang' }, t); OV.nope = { t0: w(9, 'ഇന്നത്തെ'), kind: 'bubble', txt: '"ഇന്നത്തെ നമ്പർ ഏതാ?"' }; } }),
    // ---- 11. CALLBACK: no faint... no "adichu mole"
    HO({ a: L(10), b: w10Ad - 0.1, keys: kitHome, act: (t) => { kitPose(t, { expr: 'bored', R: 'hold', propR: 'newspaper', L: 'hip' }); } }),
    HO({ a: w10Ad - 0.1, b: 1e9, keys: [[0, [0.5, 1.9, 8.0], [0, 1.45, 2.7], 0.02, 44], [0.4, [0.7, 2.4, 9.4], [0, 1.6, 1.0], 0.01, 48], [3.5, [1.4, 4.2, 13], [0, 2.4, -1], -0.01, 52]],
      act: (t) => { kitPose(t, { expr: 'bored', R: 'hold', propR: 'newspaper', L: 'hip' }); OV.bubble = { t0: w10Ad, txt: '"അടിച്ചു മോളേ"', x: 0.5, y: 0.62, pop: w10Ma }; } }),
  ];
}

const GRADE = { home: { hazeAmt: 0.25, haze: 0xdfe9f2, sat: 1.1, contrast: 0.06, lift: 0.015, warm: 0.03, vignette: 0.3 }, office: { hazeAmt: 0.1, haze: 0xf0e4c8, sat: 1.1, contrast: 0.06, lift: 0.015, warm: 0.03, vignette: 0.35 },
  tea: { hazeAmt: 0.25, haze: 0xdfe9f2, sat: 1.12, contrast: 0.06, lift: 0.015, warm: 0.03, vignette: 0.3 }, draw: { hazeAmt: 0.1, haze: 0x1a1018, sat: 1.1, contrast: 0.08, lift: 0.03, warm: 0.03, vignette: 0.45 },
  street: { hazeAmt: 0.3, haze: 0xdfe9f2, sat: 1.1, contrast: 0.06, lift: 0.015, warm: 0.02, vignette: 0.3 }, night: { hazeAmt: 0.15, haze: 0x1a1a30, sat: 1.05, contrast: 0.08, lift: 0.02, warm: -0.01, vignette: 0.45 } };
function overlays(g, t, alpha) {
  if (OV.rewind) rewind(g, t, OV.rewind.t0, alpha);
  if (OV.stars) stars(g, t, OV.stars.t0, alpha);
  if (OV.coins) coins(g, t, OV.coins.t0, alpha);
  if (OV.badge) badge(g, t, OV.badge, alpha);
  if (OV.bubble) { const b = OV.bubble; if (b.pop && t > b.pop) { const k = span(t, b.pop, 0.35); g.save(); g.globalAlpha = 1 - k; g.translate(W * b.x, H * b.y); g.scale(1 + k * 0.6, 1 + k * 0.6); g.translate(-W * b.x, -H * b.y); bubble(g, t, b, alpha); g.restore(); } else bubble(g, t, b, alpha); }
  if (OV.stamp) stamp(g, t, OV.stamp, alpha);
  if (OV.tag) tag(g, t, OV.tag, alpha);
  if (OV.ticket) ticketCard(g, t, OV.ticket, alpha);
  if (OV.big) bigNum(g, t, OV.big, alpha);
  if (OV.nope) nope(g, t, OV.nope, alpha);
  if (OV.cal) calendar(g, t, OV.cal, alpha);
  if (OV.chips) chips(g, t, OV.chips.items, alpha);
  if (OV.idea) idea(g, t, OV.idea.t0, alpha);
  if (OV.week) week(g, t, OV.week.t0, alpha);
  if (OV.karunya) karunya(g, t, OV.karunya.t0, alpha);
}
function drawTicket(g, w, h, price, prize) { g.fillStyle = '#f6e7b8'; g.strokeStyle = '#2a1c17'; g.lineWidth = 9; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, 18); g.fill(); g.stroke();
  g.fillStyle = '#c8312c'; g.beginPath(); g.roundRect(-w / 2 + 12, -h / 2 + 12, w - 24, h * 0.26, 10); g.fill(); text(g, 'കേരള ഭാഗ്യക്കുറി', 0, -h / 2 + 12 + h * 0.13, { size: h * 0.13, color: '#fff6d0', maxWidth: w - 60 });
  text(g, price, -w * 0.18, h * 0.08, { font: "'Oswald'", weight: 700, size: h * 0.32, color: '#2a1c17' }); text(g, '1967', w * 0.26, h * 0.0, { font: "'Oswald'", weight: 700, size: h * 0.12, color: '#8a1e1e' });
  if (prize) text(g, 'ഒന്നാം സമ്മാനം ₹50,000', 0, h * 0.36, { size: h * 0.1, color: '#8a1e1e', maxWidth: w - 60 }); else text(g, 'No. 000001', 0, h * 0.36, { font: "'Oswald'", weight: 700, size: h * 0.1, color: '#5a3a10' });
  g.strokeStyle = 'rgba(42,28,23,.5)'; g.setLineDash([12, 10]); g.lineWidth = 5; g.beginPath(); g.moveTo(w / 2 - 70, -h / 2 + 14); g.lineTo(w / 2 - 70, h / 2 - 14); g.stroke(); g.setLineDash([]); }
function ticketCard(g, t, b, alpha) { const p = ezo(span(t, b.t0, 0.35)); if (p <= 0) return; g.save(); g.globalAlpha = alpha * Math.min(1, p * 2); g.translate(W / 2, lerp(1900, 1380, p)); g.rotate(-0.08 + Math.sin(t * 2) * 0.03); g.scale(0.8 + 0.2 * p, 0.8 + 0.2 * p); drawTicket(g, 820, 430, b.price, b.prize); g.restore(); }
function icon2(g, kind) { if (kind === 'ticket') { g.save(); g.rotate(-0.1); drawTicket(g, 360, 190, '₹1', false); g.restore(); return; }
  if (kind === 'bubble') { g.fillStyle = '#fff'; g.strokeStyle = '#2a1c17'; g.lineWidth = 9; g.beginPath(); g.ellipse(0, -10, 150, 90, 0, 0, 7); g.fill(); g.stroke(); g.beginPath(); g.moveTo(-60, 60); g.lineTo(-100, 120); g.lineTo(-10, 74); g.fill(); g.stroke(); text(g, '?', 0, -10, { font: "'Oswald'", weight: 700, size: 130, color: '#2a1c17' }); return; } icon(g, kind); }
function nope(g, t, b, alpha) { const p = ezo(span(t, b.t0 - 0.25, 0.3)); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1420); g.scale(0.8 + 0.2 * p, 0.8 + 0.2 * p);
  g.fillStyle = 'rgba(244,236,214,.96)'; g.strokeStyle = '#2a1c17'; g.lineWidth = 9; g.beginPath(); g.roundRect(-400, -250, 800, 480, 34); g.fill(); g.stroke();
  g.save(); g.translate(0, -60); icon2(g, b.kind); g.restore(); text(g, b.txt, 0, 150, { size: 72, color: '#2a1c17', maxWidth: 720 });
  const x = ezo(span(t, b.t0 + 0.05, 0.2)); if (x > 0) { g.strokeStyle = '#d0281e'; g.lineWidth = 34; g.lineCap = 'round'; g.beginPath(); g.moveTo(-240, -200); g.lineTo(-240 + 480 * x, -200 + 300 * x); g.stroke(); if (x > 0.5) { const y = (x - 0.5) * 2; g.beginPath(); g.moveTo(240, -200); g.lineTo(240 - 480 * y, -200 + 300 * y); g.stroke(); } }
  g.restore(); }
function icon(g, kind) { g.fillStyle = '#c8312c'; g.beginPath(); g.arc(0, 0, 100, 0, 7); g.fill(); }
function calendar(g, t, c, alpha) { // tear-off calendar: years flip to 1967, or days flip to 1 NOV 1967
  const p = span(t, c.t0, 0.6); if (p <= 0) return; g.save(); g.globalAlpha = alpha * Math.min(1, p * 4); g.translate(W / 2, 1380);
  g.fillStyle = '#f4f0e6'; g.strokeStyle = '#2a1c17'; g.lineWidth = 10; g.beginPath(); g.roundRect(-260, -260, 520, 520, 28); g.fill(); g.stroke(); g.fillStyle = '#c8312c'; g.beginPath(); g.roundRect(-260, -260, 520, 130, [28, 28, 0, 0]); g.fill(); g.stroke();
  const flip = Math.min(3, Math.floor(p * 4));
  if (c.nov) { const day = ['29', '30', '31', '1'][flip], mon = flip < 3 ? 'OCT 1967' : 'NOV 1967'; text(g, mon, 0, -195, { font: "'Oswald'", weight: 700, size: 76, color: '#fff' }); text(g, day, 0, 60, { font: "'Oswald'", weight: 700, size: 280, color: '#2a1c17' }); }
  else { const yr = ['1964', '1965', '1966', '1967'][flip]; text(g, 'KERALA', 0, -195, { font: "'Oswald'", weight: 700, size: 76, color: '#fff' }); text(g, yr, 0, 60, { font: "'Oswald'", weight: 700, size: 200, color: '#2a1c17' }); }
  if (p < 1) { const k = (p * 4) % 1; g.save(); g.translate(0, -130); g.scale(1, 1 - k); g.fillStyle = '#e8e2d4'; g.fillRect(-250, 0, 500, 380); g.restore(); }
  g.restore(); }
function stars(g, t, t0, alpha) { const k = t - t0; if (k < 0) return; g.save(); g.globalAlpha = alpha * Math.min(1, k * 4); g.translate(W / 2 - 140, 1180);
  for (let i = 0; i < 5; i++) { const a = t * 3 + i / 5 * Math.PI * 2; g.save(); g.translate(Math.cos(a) * 170, Math.sin(a) * 50); g.rotate(t * 4); g.fillStyle = '#f6d24a'; g.strokeStyle = '#2a1c17'; g.lineWidth = 6; g.beginPath(); for (let j = 0; j < 10; j++) { const r = j % 2 ? 18 : 42, b = j / 10 * Math.PI * 2; g.lineTo(Math.cos(b) * r, Math.sin(b) * r); } g.closePath(); g.fill(); g.stroke(); g.restore(); }
  g.restore(); }
function coins(g, t, t0, alpha) { const k = t - t0; if (k < 0) return; g.save(); g.globalAlpha = alpha; for (let i = 0; i < 26; i++) { const ph = (k * 0.9 + i * 0.137) % 1, x = W * (0.12 + ((i * 0.381) % 0.76)), y = lerp(-80, H * 0.62, ph);
  g.save(); g.translate(x, y); g.scale(Math.cos(t * 6 + i), 1); g.fillStyle = '#f0c23a'; g.strokeStyle = '#8a5a10'; g.lineWidth = 5; g.beginPath(); g.arc(0, 0, 34, 0, 7); g.fill(); g.stroke(); text(g, '₹', 0, 2, { font: "'Oswald'", weight: 700, size: 38, color: '#8a5a10' }); g.restore(); } g.restore(); }
function idea(g, t, t0, alpha) { const p = ezo(span(t, t0, 0.3)); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1000); g.scale(p, p);
  const glowR = g.createRadialGradient(0, 0, 20, 0, 0, 260); glowR.addColorStop(0, 'rgba(255,240,150,.9)'); glowR.addColorStop(1, 'rgba(255,240,150,0)'); g.fillStyle = glowR; g.beginPath(); g.arc(0, 0, 260, 0, 7); g.fill();
  g.fillStyle = '#fff2a0'; g.strokeStyle = '#2a1c17'; g.lineWidth = 9; g.beginPath(); g.arc(0, -30, 110, Math.PI * 0.8, Math.PI * 2.2); g.lineTo(46, 110); g.lineTo(-46, 110); g.closePath(); g.fill(); g.stroke(); g.fillStyle = '#9a9a9a'; g.fillRect(-50, 110, 100, 50); g.strokeRect(-50, 110, 100, 50);
  drawTicket(g, 150, 80, '₹1', false); g.strokeStyle = '#f6d24a'; g.lineWidth = 10; for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + t; g.beginPath(); g.moveTo(Math.cos(a) * 170, Math.sin(a) * 170 - 30); g.lineTo(Math.cos(a) * 220, Math.sin(a) * 220 - 30); g.stroke(); } g.restore(); }
function week(g, t, t0, alpha) { const days = ['തി', 'ചൊ', 'ബു', 'വ്യാ', 'വെ', 'ശ', 'ഞാ']; g.save(); g.globalAlpha = alpha; days.forEach((dname, i) => { const p = ezo(span(t, t0 + i * 0.12, 0.25)); if (p <= 0) return; g.save(); g.translate(W / 2 - 390 + i * 130, 1450 - Math.sin(p * Math.PI) * 30); g.scale(p, p); g.rotate((i % 2 ? 1 : -1) * 0.06);
  g.fillStyle = ['#f6e7b8', '#f2c0c8', '#bfe0c8', '#f6d090', '#c8d8f0', '#f0c8a0', '#e0d0f0'][i]; g.strokeStyle = '#2a1c17'; g.lineWidth = 6; g.beginPath(); g.roundRect(-58, -90, 116, 180, 12); g.fill(); g.stroke(); text(g, dname, 0, -30, { size: 46, color: '#2a1c17' }); text(g, '🎟'.length > 1 ? '₹' : '₹', 0, 40, { font: "'Oswald'", weight: 700, size: 60, color: '#c8312c' }); g.restore(); });
  const p = ezo(span(t, t0 + 0.9, 0.3)); if (p > 0) text(g, 'ആഴ്ചയിൽ 7 നറുക്ക്', W / 2, 1650, { size: 70, color: '#f6d24a', stroke: '#2a1c17', strokeWidth: 16 }); g.restore(); }
function karunya(g, t, t0, alpha) { const p = ezo(span(t, t0, 0.35)); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1400); g.scale(0.8 + 0.2 * p, 0.8 + 0.2 * p);
  g.fillStyle = '#f4f0e6'; g.strokeStyle = '#2a1c17'; g.lineWidth = 10; g.beginPath(); g.roundRect(-420, -230, 840, 460, 34); g.fill(); g.stroke();
  g.fillStyle = '#d0281e'; g.fillRect(-60, -190, 120, 300); g.fillRect(-150, -100, 300, 120); g.strokeRect(-60, -190, 120, 300);
  text(g, 'കാരുണ്യ', 0, 160, { size: 96, color: '#1f4f36' }); for (let i = 0; i < 6; i++) { const k = (t * 0.8 + i / 6) % 1; g.save(); g.translate(-360 + k * 240, -150 + Math.sin(k * Math.PI) * -60 + i * 8); g.fillStyle = '#f0c23a'; g.strokeStyle = '#8a5a10'; g.lineWidth = 4; g.beginPath(); g.arc(0, 0, 24, 0, 7); g.fill(); g.stroke(); g.restore(); }
  g.restore(); }
function rewind(g, t, t0, alpha) { const k = t - t0; if (k < 0 || k > 1.1) return; g.save(); g.globalAlpha = alpha * (k < 0.9 ? 1 : 1 - (k - 0.9) / 0.2); g.fillStyle = 'rgba(255,255,255,.18)'; for (let i = 0; i < 14; i++) { const y = ((i * 151 + t * 900) % H); g.fillRect(0, y, W, 6 + (i % 3) * 4); }
  g.fillStyle = '#ffffff'; g.strokeStyle = '#120c0a'; g.lineWidth = 8; g.translate(W - 220, 520); for (const dx of [0, 70]) { g.beginPath(); g.moveTo(dx, -50); g.lineTo(dx - 70, 0); g.lineTo(dx, 50); g.closePath(); g.fill(); g.stroke(); } g.restore(); }

export const hits = [];
export const extraHits = (timeline) => {
  const m = timeline.scenes.find((x) => x.id === 'main'), out = []; const s = { line: (i) => m.cues[i]?.text, cue: (i) => m.cues[i].start, cueEnd: (i) => m.cues[i].end };
  const sh = shots(s); sh.forEach((x, i) => { if (!i) return; const cut = sh[i - 1].set !== x.set; if (cut || i % 4 === 0) out.push({ t: m.start + x.a - 0.15, kind: 'whoosh', vol: cut ? 0.22 : 0.1 }); });
  const at2 = (i, n) => m.start + wt(s, i, n), add = (t, kind, vol) => out.push({ t, kind, vol });
  add(m.start + 0.05, 'boom', 0.3); add(m.start + 0.1, 'chime', 0.4); add(at2(0, 'ബോധംകെട്ടു') + 0.45, 'thud', 0.55); for (let k = 0; k < 4; k++) add(at2(0, 'ബോധംകെട്ടു') + 0.5 + k * 0.15, 'tick', 0.2);
  for (let k = 0; k < 6; k++) add(at2(0, 'ആ ഒരു') + k * 0.15, 'coin', 0.25); add(at2(0, 'ഖജനാവ്'), 'pop', 0.35); add(at2(0, 'ഒരു രൂപയിൽ'), 'pop', 0.35); add(at2(0, 'ഇല്ലായിരുന്നെങ്കിലോ'), 'boom', 0.4);
  for (let k = 0; k < 4; k++) add(m.start + s.cue(1) + 0.15 + k * 0.15, 'tick', 0.25); add(at2(1, 'പണമില്ല') + 0.25, 'hit', 0.35); add(at2(1, 'പണിയില്ല') + 0.25, 'hit', 0.35); add(at2(1, 'ധനമന്ത്രി'), 'pop', 0.35); add(at2(1, 'ഐഡിയ'), 'chime', 0.45); add(at2(1, 'നിരോധിക്കുക'), 'boom', 0.45); add(at2(1, 'സർക്കാർ'), 'pop', 0.35);
  add(at2(2, 'ചിരിച്ചു'), 'pop', 0.3); add(at2(2, '"സർക്കാർ'), 'pop', 0.3); add(at2(2, 'ഒരു രൂപ'), 'pop', 0.3);
  for (let k = 0; k < 4; k++) add(m.start + s.cue(3) + 0.1 + k * 0.15, 'tick', 0.25); add(at2(3, 'കേരളപ്പിറവി'), 'chime', 0.4); add(at2(3, 'ആദ്യ'), 'whoosh', 0.3); add(at2(3, 'വില'), 'coin', 0.4); add(at2(3, 'ഒന്നാം'), 'chime', 0.4); for (let k = 0; k < 6; k++) add(at2(3, 'ഒന്നാം') + 0.1 + k * 0.13, 'tick', 0.2);
  add(at2(4, 'ജനുവരി'), 'pop', 0.35); for (let k = 0; k < 6; k++) add(at2(4, 'ആദ്യ നറുക്കെടുപ്പ്') + 0.2 + k * 0.2, 'tick', 0.3); add(at2(4, 'പിന്നെ'), 'whoosh', 0.3); for (let k = 0; k < 7; k++) add(at2(4, 'ആഴ്ചയിൽ') + k * 0.12, 'pop', 0.2); add(at2(4, 'ഓണം'), 'chime', 0.35); add(at2(4, 'കോടി'), 'boom', 0.5);
  add(at2(5, 'ഒന്നര'), 'pop', 0.35); for (let k = 0; k < 6; k++) add(at2(5, 'ഒന്നര') + 0.1 + k * 0.13, 'tick', 0.2); for (let k = 0; k < 6; k++) add(at2(5, 'ഒരു വർഷം') + k * 0.15, 'coin', 0.25); add(at2(5, 'പതിനൊന്നായിരം'), 'boom', 0.45);
  add(at2(6, 'ഭണ്ഡാരപ്പെട്ടി'), 'coin', 0.4); add(at2(6, 'ഇപ്പോൾ'), 'whoosh', 0.3); add(at2(6, 'ഇപ്പോൾ') + 0.6, 'boom', 0.5);
  add(m.start + s.cue(7), 'hit', 0.35); add(m.start + s.cue(7) + 0.05, 'whoosh', 0.35); add(at2(7, 'ഇല്ല.'), 'hit', 0.45); add(at2(7, 'പറ്റിക്കലായിരുന്നു'), 'boom', 0.45); for (let k = 0; k < 5; k++) add(at2(7, 'പക്ഷേ') + 0.2 + k * 0.2, 'tick', 0.25); add(at2(7, 'സർക്കാർ!'), 'chime', 0.5); add(at2(7, 'സർക്കാർ!') + 0.05, 'boom', 0.4);
  add(at2(8, 'കാരുണ്യ'), 'chime', 0.4);
  add(m.start + s.cue(9), 'chime', 0.25); add(at2(9, 'തുടങ്ങിയില്ലായിരുന്നെങ്കിലോ') + 0.4, 'hit', 0.35); for (let k = 0; k < 5; k++) add(at2(9, 'ഖജനാവിൽ') + 0.2 + k * 0.2, 'coin', 0.2); add(at2(9, 'പണിയില്ല') + 0.25, 'hit', 0.3); add(at2(9, 'ചോദ്യമില്ല') + 0.1, 'hit', 0.3);
  add(m.start + s.cue(10), 'hit', 0.2); add(at2(10, '"അടിച്ചു'), 'pop', 0.35); add(at2(10, 'മലയാളിയും'), 'pop', 0.3);
  return out;
};
void H;
export const shotTimes = (timeline) => { const m = timeline.scenes.find((x) => x.id === 'main'); const s = { line: (i) => m.cues[i]?.text, cue: (i) => m.cues[i].start, cueEnd: (i) => m.cues[i].end }; return shots(s).map((x) => ({ a: m.start + x.a, b: m.start + x.b, set: x.set })); };
