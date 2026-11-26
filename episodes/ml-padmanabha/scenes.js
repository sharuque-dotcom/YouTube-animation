// Padmanabhaswamy Vault B (kit formula): hook = June 2011, the vaults open on more than ₹1 lakh crore, one door stays
// shut -> what if Vault B is opened; you-see (the temple, 1750 dedication, Padmanabhadasa, centuries of offerings),
// underdog (T.P. Sundararajan, ex-IPS lawyer) + mockery, the order (June 2011, five of six vaults), the inventory,
// the pathayam analogy, wait...? (the jammed third door, devaprashnam, "the curse", the sea), twist (the report: opened
// seven times; the royals: only the antechamber), status (SC 2020 -> committee -> tantri), the what-if (more gold,
// or nothing; for devotees it is the Lord's), callback (the serpents keep guard). The deity is never drawn.
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
  (await import('../ml-gulf/cast.js')).registerCast(B); (await import('../ml-colachel/cast.js')).registerCast(B); (await import('./cast.js')).registerCast(B);
  const Z = await import('./sets.js'), st = await import('../ml-bean/street.js');
  S = { temple: Z.templeSet(), vault: Z.vaultSet(), treasure: Z.treasureSet(), court: Z.courtSet(), tharavad: Z.tharavadSet(), street: st.buildStreet() };
  S.street.cards = st.radioCrowd(S.street.scene);
  buildTemple(); buildVault(); buildTreasure(); buildCourt(); buildTharavad(); buildStreet();
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

// ------------------------------------------------------------------ cast on the sets
const PEOPLE = ['devotee', 'amma', 'kannan', 'ammini', 'dasan', 'vijayan', 'devotee', 'chaya', 'meenu', 'manavalan'];
function buildTemple() { const T = S.temple, sc = T.scene; T.mv = actor(sc, 'maharaja', 0, -1.6); T.royal = actor(sc, 'royal', -0.6, 1.2); T.tantri = actor(sc, 'tantri', 0.65, 1.0);
  T.dev = []; for (let i = 0; i < 10; i++) T.dev.push(actor(sc, PEOPLE[i], -4.5 + i * 1.0, 3.6 + (i % 2) * 0.8)); }
function buildVault() { const v = S.vault, sc = v.scene; v.i1 = actor(sc, 'inspector', 0.6, -3); v.i2 = actor(sc, 'inspector', -0.8, -1.2); v.j1 = actor(sc, 'judge', -1.2, -16.5); }
function buildTreasure() { const r = S.treasure, sc = r.scene; r.i1 = actor(sc, 'inspector', 2.6, 2.4); r.i2 = actor(sc, 'inspector', -2.4, 2.8); }
function buildCourt() { const c = S.court, sc = c.scene; c.j = [actor(sc, 'judge', -2.4, -3.3, 0.5), actor(sc, 'judge', 0, -3.3, 0.5), actor(sc, 'judge', 2.4, -3.3, 0.5)]; c.sun = actor(sc, 'sundar', 1.9, 1.0); c.aud = actor(sc, 'auditor', -1.6, 0.6); c.royal = actor(sc, 'royal', -3.2, 1.8); }
function buildTharavad() { const h = S.tharavad, sc = h.scene; h.amm = actor(sc, 'ammini', 1.15, 0.2); h.kan = actor(sc, 'kannan', -1.15, 0.3); }
function buildStreet() { const s = S.street; s.crowd = s.cards.map((c) => ({ c, last: '', seed: (Math.abs(c.position.x) * 13.1 + Math.abs(c.position.z) * 7.7) % 9, base: [c.position.x, c.position.y, c.position.z] })); }

// ------------------------------------------------------------------ per-shot state
let OV = null;
function resetProps() {
  const T = S.temple, v = S.vault, r = S.treasure, c = S.court, h = S.tharavad, s = S.street;
  [T.mv, T.royal, T.tantri, ...T.dev, v.i1, v.i2, v.j1, r.i1, r.i2, ...c.j, c.sun, c.aud, c.royal, h.amm, h.kan].forEach((x) => { x.c.visible = false; x.c.position.set(...x.base); });
  s.crowd.forEach((x) => { x.c.visible = false; });
  v.setDoors(0); v.setGrille(0); v.setWood(0); v.setEyes(0); v.setIronOpen(0); v.setIronStrain(0); r.setGlow(1); r.setTorch(false); h.setOpen(0); h.setGold(0);
  OV = {};
}
function laughCrowdOn(t) { S.street.crowd.forEach((x) => { x.c.visible = true; }); laughCrowd(t); }
function devotees(t, mode = 'pray') { S.temple.dev.forEach((a, i) => pose(a, mode === 'pray' ? { expr: ['smile', 'proud', 'smile'][i % 3], R: 'clap', L: 'clap', look: 0 } : { expr: ['shock', 'think', 'nervous'][i % 3], R: i % 2 ? 'mouth' : 'chin', L: 'hang', look: (i % 3 - 1) * 0.5 }, t)); }
const torchI = (a, t, o = {}) => pose(a, { expr: 'shock', R: 'holdUp', propR: 'torch', L: 'out', ...o }, t);

// ------------------------------------------------------------------ shots
function shots(s) { return tidy(rawShots(s)); }
function rawShots(s) {
  const n = []; for (let i = 0; s.line(i); i++) n.push(s.line(i));
  const id = (start) => n.findIndex((x) => x.startsWith(start));
  const I = { hook: id('രണ്ടായിരത്തി പതിനൊന്ന്.'), see: id('നോക്കൂ'), sun: id('ടി.പി.'), mock: id('ആളുകൾ ചിരിച്ചു'), order: id('രണ്ടായിരത്തി പതിനൊന്ന് ജൂൺ'), items: id('നാലടി'), ana: id('തറവാട്ടിലെ'),
    wait: id('കാത്തിരിക്കൂ'), curse: id('മൂന്നാഴ്ച'), twist: id('പക്ഷേ ഇതാ'), status: id('രണ്ടായിരത്തി ഇരുപതിൽ'), whatif: id('ആ വാതിൽ തുറന്നാലോ'), end: id('അതുവരെ') };
  const L = (i) => s.cue(i), w = (i, nd) => wt(s, i, nd);
  const TP = (k) => ({ set: 'temple', ...k }), VA = (k) => ({ set: 'vault', ...k }), TR = (k) => ({ set: 'treasure', ...k }), CO = (k) => ({ set: 'court', ...k }), TH = (k) => ({ set: 'tharavad', ...k }), ST = (k) => ({ set: 'street', ...k });
  const T = S?.temple, v = S?.vault, r = S?.treasure, c = S?.court, h = S?.tharavad;
  const push = (p0, l, r0 = 0.03, f = 50, d = [0, 0, -0.6]) => [[0, p0, l, r0, f], [0.35, p0.map((x, q) => x + d[q] * 0.4), l, 0.01, f - 2], [2.2, p0.map((x, q) => x + d[q]), l, -0.02, f - 4]];
  const corridor = push([0.3, 1.9, 3.5], [0, 1.5, -20], 0.03, 50, [0, 0, -1.2]);
  const doorB = push([0.2, 1.7, -14.6], [0, 1.6, -20.3], 0.03, 48, [0, 0, -0.8]);
  const snakes = push([0, 2.0, -17.4], [0, 2.0, -20.4], 0.02, 44, [0, 0, -0.5]);
  const trWide = push([0.4, 2.2, 7.4], [0, 1.2, -2], 0.03, 50, [0, 0, -0.9]);
  const templeWide = [[0, [0, 2.4, 30], [0, 7, -6], 0.02, 50], [0.4, [0, 2.6, 28.5], [0, 7.5, -6], 0.01, 50], [2.4, [0, 3.0, 26.5], [0, 8.5, -6], -0.01, 50]];
  const gate = push([0.5, 1.6, 3.4], [0, 1.6, -1.6], 0.03, 48, [0, 0, -0.4]);
  const templeFront = push([0.2, 1.7, 7.2], [0, 1.4, 1.0], 0.03, 46, [0, 0, -0.6]);
  const courtWide = push([-1.2, 2.2, 6.2], [0.4, 1.8, -2.5], 0.03, 50, [0, 0, -0.7]);
  const benchCam = push([0.2, 2.1, 1.4], [0, 1.9, -3.3], 0.03, 44, [0, 0, -0.4]);
  const lectern = push([0.4, 1.8, 4.4], [1.6, 1.6, 1.0], 0.03, 44, [0, 0, -0.5]);
  const streetLaugh = [[0, [1.0, 1.7, 0.9], [-1.8, 1.5, -4], 0.04, 52], [0.35, [0.7, 1.75, 1.3], [-1.8, 1.55, -4], 0.02, 54], [2.1, [0.5, 1.8, 1.6], [-1.8, 1.6, -4], -0.01, 54]];
  const chest = push([0.8, 2.2, 6.2], [0.2, 1.2, -1.2], 0.03, 48, [0, -0.1, -0.6]);
  const out = [];
  const add = (x) => { if (x.a != null && x.b != null && x.b > x.a) out.push(x); };
  // ---- 1. HOOK
  if (I.hook >= 0) { const i = I.hook, wNi = w(i, 'നിലവറകൾ'), wLa = w(i, 'ഒരു ലക്ഷം'), wPa = w(i, 'പക്ഷേ'), wAa = w(i, 'ആ ബി'), end = L(i + 1);
    add(TR({ a: 0, b: wNi - 0.1, keys: [[0, [0.8, 1.4, 3.2], [-2.2, 0.6, -2.6], 0.05, 46], [0.3, [0.7, 1.45, 2.9], [-2.2, 0.6, -2.6], 0.02, 44], [2, [0.6, 1.5, 2.6], [-2.2, 0.65, -2.6], -0.02, 42]], act: (t) => { r.setTorch(true, [1.5, 1.8, 3.5], [-3, 0.4, -2.6]); at(r.i1, -1.4, 0, -0.6); torchI(r.i1, t, { look: -1 }); OV.cal = { t0: 0.05, top: 'JUNE', big: '2011' }; } }));
    add(VA({ a: wNi - 0.1, b: wLa - 0.1, keys: corridor, act: (t, tt, sh) => { v.setDoors(ezo(span(t, sh.a, 1.2))); torchI(v.i1, t); pose(v.i2, { expr: 'beam', R: 'point', L: 'hip', look: -0.5 }, t); } }));
    add(TR({ a: wLa - 0.1, b: wPa - 0.1, shake: wLa + 0.1, keys: trWide, act: (t) => { torchI(r.i1, t, { hop: hopAt(t, 8, 0.04) }); pose(r.i2, { expr: 'laugh', R: 'up', L: 'up', hop: hopAt(t, 8, 0.05, 1) }, t); OV.coins = { t0: wLa - 0.1 }; OV.big = { t0: wLa, txt: '₹1,00,000', sub: 'കോടിയിലധികം!' }; } }));
    add(VA({ a: wPa - 0.1, b: wAa - 0.1, keys: [[0, [0.3, 1.8, -6], [0, 1.5, -20.3], 0.02, 46], [0.4, [0.25, 1.8, -8], [0, 1.5, -20.3], 0.01, 46], [3, [0.2, 1.75, -12.5], [0, 1.55, -20.3], -0.01, 46]], act: (t) => { v.setDoors(1); OV.lock = { t0: wPa + 0.3 }; } }));
    add(VA({ a: wAa - 0.1, b: end, flash: w(i, 'തുറന്നാലോ') - 0.15, keys: snakes, act: (t, tt, sh) => { v.setGrille(1); v.setWood(1); v.setEyes(ezo(span(t, sh.a + 0.2, 0.6))); OV.badge = { t0: wAa, txt: 'ബി നിലവറ', sub: 'VAULT B' }; if (t > w(i, 'തുറന്നാലോ') - 0.1) { OV.badge = null; OV.big = { t0: w(i, 'തുറന്നാലോ'), txt: '?', sub: 'തുറന്നാലോ?' }; } } })); }
  // ---- 2. YOU SEE: the temple, 1750, Padmanabhadasa, offerings
  if (I.see >= 0) { const i = I.see, wAy = w(i, 'ആയിരത്തി'), wSa = w(i, 'സമർപ്പിച്ചു'), wAn = w(i, 'അന്നുമുതൽ'), wNu = w(i, 'നൂറ്റാണ്ടുകളുടെ'), end = L(i + 1);
    add(TP({ a: L(i), b: wAy - 0.1, keys: templeWide, act: (t) => { devotees(t); OV.tag = { t0: w(i, 'ശ്രീ'), txt: 'ശ്രീ പത്മനാഭസ്വാമി ക്ഷേത്രം', sub: 'തിരുവനന്തപുരം' }; } }));
    add(TP({ a: wAy - 0.1, b: wSa - 0.1, keys: gate, act: (t) => { pose(T.mv, { expr: 'proud', R: 'hold', propR: 'sword', L: 'hip' }, t); OV.cal = { t0: wAy, top: 'AD', big: '1750' }; } }));
    add(TP({ a: wSa - 0.1, b: wAn - 0.1, keys: push([0.6, 1.9, 2.6], [0, 1.7, -4], 0.03, 44, [0, 0, -0.4]), act: (t, tt, sh) => { const u = ezo(span(t, wSa, 0.6)); pose(T.mv, { expr: 'smile', R: 'clap', L: 'clap', lean: u * 0.25 }, t); OV.badge = { t0: wSa, txt: 'രാജ്യം → ഭഗവാന്', sub: 'THRIPPADIDANAM' }; } }));
    add(TP({ a: wAn - 0.1, b: wNu - 0.1, keys: templeFront, act: (t) => { pose(T.royal, { expr: 'smile', R: 'hold', propR: 'lamp', L: 'hang' }, t); pose(T.tantri, { expr: 'smile', R: 'clap', L: 'clap' }, t); OV.tag = { t0: wAn + 0.2, txt: 'പത്മനാഭദാസൻ', sub: 'ഭഗവാന്റെ ദാസൻ' }; } }));
    add(TR({ a: wNu - 0.1, b: end, keys: trWide, act: (t, tt, sh) => { r.setGlow(0.6); OV.coins = { t0: sh.a }; OV.years = { t0: wNu }; } })); }
  // ---- 3. UNDERDOG: T.P. Sundararajan
  if (I.sun >= 0) { const i = I.sun, wIp = w(i, 'ഐ.പി.എസ്'), wKs = w(i, 'ക്ഷേത്രസ്വത്ത്'), wKo = w(i, 'കോടതി'), end = L(i + 1);
    add(CO({ a: L(i), b: wIp - 0.1, keys: lectern, act: (t) => { pose(c.sun, { expr: 'stern', R: 'hold', propR: 'petition', L: 'hang' }, t); OV.tag = { t0: L(i) + 0.05, txt: 'ടി.പി. സുന്ദരരാജൻ', sub: '1941–2011' }; } }));
    add(CO({ a: wIp - 0.1, b: wKs - 0.1, keys: push([0.6, 1.9, 5.6], [1.9, 1.6, 1.0], 0.03, 42, [0, 0, -0.4]), act: (t) => { pose(c.sun, { expr: 'proud', R: 'thumb', L: 'hold', propL: 'petition' }, t); OV.swap = { t0: wIp, a: 'IPS', b: 'വക്കീൽ' }; } }));
    add(CO({ a: wKs - 0.1, b: wKo - 0.1, keys: lectern, act: (t) => { pose(c.sun, { expr: 'think', R: 'chin', L: 'hold', propL: 'petition' }, t); OV.bubble = { t0: wKs, txt: '"സ്വത്ത് സുരക്ഷിതമാണോ?"', x: 0.5, y: 0.62 }; } }));
    add(CO({ a: wKo - 0.1, b: end, keys: courtWide, act: (t) => { c.j.forEach((a, k) => pose(a, { expr: ['think', 'stern', 'neutral'][k], R: k === 1 ? 'hold' : 'chin', propR: k === 1 ? 'gavel' : null, look: 0.4 }, t)); pose(c.sun, { expr: 'stern', R: 'point', L: 'hold', propL: 'petition', look: -1 }, t); } })); }
  // ---- 4. MOCKERY
  if (I.mock >= 0) { const i = I.mock, wOr = w(i, '"ഒരു'), end = L(i + 1);
    add(ST({ a: L(i), b: end, keys: streetLaugh, act: (t) => { laughCrowdOn(t); if (t > wOr - 0.1) OV.bubble = { t0: wOr, txt: '"വയസ്സൻ വക്കീൽ vs രാജകുടുംബം?"', x: 0.5, y: 0.64 }; } })); }
  // ---- 5. THE ORDER: June 2011, five of six
  if (I.order >= 0) { const i = I.order, wSu = w(i, 'സുപ്രീം'), wUt = w(i, 'ഉത്തരവിട്ടു'), wAa = w(i, 'ആറിൽ'), end = L(i + 1);
    add(CO({ a: L(i), b: wSu - 0.1, keys: courtWide, act: (t) => { c.j.forEach((a, k) => pose(a, { expr: 'stern', R: 'chin', look: 0.3 }, t)); pose(c.sun, { expr: 'nervous', R: 'hold', propR: 'petition', L: 'hang', look: -1 }, t); OV.cal = { t0: L(i), top: 'JUNE', big: '2011' }; } }));
    add(CO({ a: wSu - 0.1, b: wAa - 0.1, shake: wUt + 0.2, keys: benchCam, act: (t) => { const u = span(t, wUt, 0.25); c.j.forEach((a, k) => pose(a, k === 1 ? { expr: 'stern', R: u > 0 && u < 1 ? 'holdUp' : 'hold', propR: 'gavel' } : { expr: 'stern', R: 'chin' }, t)); if (t > wUt) OV.stamp = { t0: wUt + 0.15, txt: 'തുറക്കുക!', sub: 'SUPREME COURT ORDER' }; } }));
    add(VA({ a: wAa - 0.1, b: end, keys: corridor, act: (t, tt, sh) => { v.setDoors(1, 'ACDEF'.slice(0, 1 + Math.floor(clamp((t - wAa) / 0.35, 0, 4)))); torchI(v.i1, t); pose(v.i2, { expr: 'beam', R: 'point', L: 'hip' }, t); OV.vaults = { t0: wAa }; } })); }
  // ---- 6. THE INVENTORY
  if (I.items >= 0) { const i = I.items, wPa = w(i, 'പതിനെട്ടടി'), wEn = w(i, 'എണ്ണൂറ്'), wRa = w(i, 'രത്നം'), end = L(i + 1);
    add(TR({ a: L(i), b: wPa - 0.1, keys: push([0.2, 1.8, 2.4], [0, 2.0, -3.2], 0.02, 46, [0, 0.1, -0.4]), act: (t) => { r.setGlow(1.15); OV.badge = { t0: L(i) + 0.1, txt: '4 അടി സ്വർണ്ണ വിഗ്രഹം', sub: 'GOLD MAHAVISHNU IDOL' }; } }));
    add(TR({ a: wPa - 0.1, b: wEn - 0.1, keys: [[0, [-3.2, 1.3, 2.6], [0.6, 0.1, 1.6], 0.04, 46], [0.35, [-2.9, 1.3, 2.6], [0.6, 0.1, 1.6], 0.01, 46], [2.2, [-2.0, 1.3, 2.7], [1.2, 0.1, 1.6], -0.02, 46]], act: (t) => { OV.ruler = { t0: wPa, txt: '18 അടി', sub: 'സ്വർണ്ണ മാല' }; } }));
    add(TR({ a: wEn - 0.1, b: wRa - 0.1, shake: wEn + 0.5, keys: push([2.6, 1.6, 2.6], [1.8, 0.6, 0.4], 0.03, 44, [0, 0, -0.3]), act: (t) => { torchI(r.i1, t, { expr: 'shock' }); OV.big = { t0: wEn + 0.1, txt: '800 KG', sub: 'സ്വർണ്ണ നാണയങ്ങൾ' }; } }));
    add(TR({ a: wRa - 0.1, b: end, keys: push([-2.4, 1.0, 2.2], [-2.2, 0.2, 0.7], 0.03, 40, [0.1, 0, -0.3]), act: (t) => { OV.badge = { t0: wRa, txt: 'രത്നം പതിച്ച', sub: 'സ്വർണ്ണ ചിരട്ടകൾ' }; OV.sparkle = { t0: wRa }; } })); }
  // ---- 7. ANALOGY: the tharavad pathayam
  if (I.ana >= 0) { const i = I.ana, wNe = w(i, 'നെല്ലിനു'), end = L(i + 1);
    add(TH({ a: L(i), b: wNe - 0.1, keys: chest, act: (t, tt, sh) => { h.setOpen(ezo(span(t, sh.a + 0.3, 0.6))); pose(h.amm, { expr: 'smile', R: 'hold', propR: 'glass', L: 'hip', look: -0.6 }, t); pose(h.kan, { expr: 'think', R: 'chin', L: 'hip', look: 0.6 }, t); } }));
    add(TH({ a: wNe - 0.1, b: end, shake: wNe + 0.3, keys: push([1.2, 2.0, 3.4], [0.2, 1.1, -1.6], 0.03, 44, [0, 0, -0.5]), act: (t) => { h.setOpen(1); h.setGold(ezo(span(t, wNe, 0.5))); pose(h.amm, { expr: 'shock', R: 'up', L: 'up', hop: hopAt(t, 8, 0.05) }, t); pose(h.kan, { expr: 'laugh', R: 'up', L: 'up', hop: hopAt(t, 8, 0.05, 1) }, t); OV.chips2 = { t0: wNe, a: 'നെല്ല്', b: 'സ്വർണ്ണം' }; } })); }
  // ---- 8. WAIT...: Vault B, the three doors, devaprashnam
  if (I.wait >= 0) { const i = I.wait, wIr = w(i, 'ഇരുമ്പ് ഗ്രിൽ'), wMa = w(i, 'മരവാതിൽ'), wMo = w(i, 'മൂന്നാമത്തെ'), wDe = w(i, 'ദേവപ്രശ്നം'), end = L(i + 1);
    add(VA({ a: L(i), b: wIr - 0.1, keys: [[0, [0.3, 1.8, -6], [0, 1.5, -20.3], 0.03, 46], [0.4, [0.25, 1.8, -8.5], [0, 1.5, -20.3], 0.01, 46], [2.5, [0.2, 1.75, -13], [0, 1.55, -20.3], -0.01, 46]], act: (t) => { v.setDoors(1); OV.rewind = { t0: L(i) }; OV.badge = { t0: L(i) + 0.6, txt: 'ബി നിലവറ?', sub: 'VAULT B' }; } }));
    add(VA({ a: wIr - 0.1, b: wMa - 0.1, keys: doorB, act: (t) => { v.setGrille(ezo(span(t, wIr + 0.2, 0.6))); at(v.i1, 1.3, 0, -18.4); torchI(v.i1, t, { expr: 'beam' }); OV.step = { t0: wIr, n: 1 }; } }));
    add(VA({ a: wMa - 0.1, b: wMo - 0.1, keys: doorB, act: (t) => { v.setGrille(1); v.setWood(ezo(span(t, wMa + 0.2, 0.6)) * 0.9); at(v.i1, 1.3, 0, -18.4); torchI(v.i1, t, { expr: 'smile' }); OV.step = { t0: wMa, n: 2 }; } }));
    add(VA({ a: wMo - 0.1, b: wDe - 0.1, shake: wMo + 0.6, keys: push([0.4, 1.6, -16.4], [0, 1.4, -20.3], 0.04, 44, [0, 0, -0.3]), act: (t) => { v.setGrille(1); v.setWood(0.9); v.setIronStrain(1, t); v.setEyes(0.5); at(v.i1, 0.5, 0, -19.3); at(v.i2, -0.5, 0, -19.3); pose(v.i1, { expr: 'angry', R: 'fist', L: 'fist', lean: -0.15 + Math.sin(t * 20) * 0.03 }, t); pose(v.i2, { expr: 'nervous', R: 'fist', L: 'fist', lean: 0.15 }, t); OV.step = { t0: wMo, n: 3, stuck: true }; } }));
    add(TP({ a: wDe - 0.1, b: end, keys: templeFront, act: (t) => { pose(T.tantri, { expr: 'think', R: 'hold', propR: 'cowrie', L: 'hold', propL: 'lamp' }, t); pose(T.royal, { expr: 'neutral', R: 'clap', L: 'clap' }, t); if (t > w(i, 'തുറക്കരുത്') - 0.1) OV.stamp = { t0: w(i, 'തുറക്കരുത്'), txt: 'തുറക്കരുത്', sub: 'DEVAPRASHNAM, 2011' }; else OV.tag = { t0: wDe, txt: 'ദേവപ്രശ്നം', sub: 'ASHTAMANGALA' }; } })); }
  // ---- 9. THE CURSE + the sea
  if (I.curse >= 0) { const i = I.curse, wAa = w(i, 'ആളുകൾ'), wVa = w(i, 'വാതിലിനപ്പുറം'), end = L(i + 1);
    add(CO({ a: L(i), b: wAa - 0.1, keys: push([0.6, 1.8, 4.2], [1.4, 1.4, 0.6], 0.02, 44, [0, 0, -0.3]), act: (t) => { OV.cal = { t0: L(i), top: 'JULY 17', big: '2011' }; OV.dim = 0.35; } }));
    add(VA({ a: wAa - 0.1, b: wVa - 0.1, keys: snakes, act: (t) => { v.setGrille(1); v.setWood(1); v.setEyes(0.6 + Math.sin(t * 6) * 0.4); OV.bubble = { t0: w(i, 'ശാപം') - 0.05, txt: '"ശാപം!"', x: 0.5, y: 0.66 }; } }));
    add(VA({ a: wVa - 0.1, b: end, dream: true, keys: doorB, act: (t) => { v.setGrille(1); v.setWood(1); v.setEyes(1); OV.waves = { t0: wVa }; OV.tag = { t0: wVa + 0.3, txt: 'അറബിക്കടൽ?', sub: 'ONLY A STORY' }; } })); }
  // ---- 10. TWIST: opened seven times? the antechamber
  if (I.twist >= 0) { const i = I.twist, wVi = w(i, 'വിനോദ്'), wBi = w(i, 'ബി നിലവറ'), wRa = w(i, 'രാജകുടുംബം'), wPr = w(i, 'പ്രധാന'), end = L(i + 1);
    add(VA({ a: L(i), b: wVi - 0.1, flash: L(i), keys: snakes, act: (t) => { v.setGrille(1); v.setWood(1); v.setEyes(0.3); OV.rewind = { t0: L(i) }; } }));
    add(CO({ a: wVi - 0.1, b: wRa - 0.1, keys: push([-0.6, 1.9, 5.8], [-1.6, 1.6, 0.6], 0.03, 44, [0, 0, -0.4]), act: (t) => { pose(c.aud, { expr: 'smug', R: 'holdUp', propR: 'report', L: 'hip' }, t); OV.tag = { t0: wVi, txt: 'വിനോദ് റായ് റിപ്പോർട്ട്', sub: 'AMICUS, 2014' }; if (t > wBi) { OV.tag = null; OV.tally = { t0: wBi }; } } }));
    add(TP({ a: wRa - 0.1, b: wPr - 0.1, keys: push([-0.2, 1.8, 6.4], [-1.0, 1.5, 1.2], 0.03, 44, [0, 0, -0.4]), act: (t) => { pose(T.royal, { expr: 'neutral', R: 'point', L: 'hang', talk: Math.abs(Math.sin(t * 11)) * 0.5 }, t); OV.bubble = { t0: wRa + 0.3, txt: '"മുന്നിലെ ചെറിയ അറ മാത്രം"', x: 0.5, y: 0.62 }; } }));
    add(VA({ a: wPr - 0.1, b: end, keys: doorB, act: (t) => { v.setGrille(1); v.setWood(1); v.setEyes(0.4); OV.rooms = { t0: wPr }; } })); }
  // ---- 11. STATUS (optional line): SC 2020 -> committee -> tantri, no decision
  if (I.status >= 0) { const i = I.status, wPi = w(i, 'പിന്നീട്'), wIn = w(i, 'ഇന്നും'), end = L(i + 1);
    add(CO({ a: L(i), b: wPi - 0.1, keys: benchCam, act: (t) => { c.j.forEach((a, k) => pose(a, { expr: 'neutral', R: k === 1 ? 'point' : 'chin', look: 0.2 }, t)); OV.pass = { t0: L(i) + 0.2, step: 0 }; } }));
    add(TP({ a: wPi - 0.1, b: wIn - 0.1, keys: templeFront, act: (t) => { pose(T.tantri, { expr: 'think', R: 'hold', propR: 'lamp', L: 'chin' }, t); pose(T.royal, { expr: 'smile', R: 'point', L: 'hang', look: 0.7 }, t); OV.pass = { t0: wPi, step: 1 }; } }));
    add(VA({ a: wIn - 0.1, b: end, keys: snakes, act: (t) => { v.setGrille(1); v.setWood(1); v.setEyes(0.6); OV.big = { t0: wIn + 0.2, txt: '?', sub: 'ഇന്നും തീരുമാനമില്ല' }; } })); }
  // ---- 12. WHAT IF: bigger than the rest... or nothing. For devotees: the Lord's.
  if (I.whatif >= 0) { const i = I.whatif, wOr = w(i, 'ഒരുപക്ഷേ ബാക്കി'), wOn = w(i, 'ഒരുപക്ഷേ ഒന്നുമില്ല'), wPa = w(i, 'പക്ഷേ ലക്ഷക്കണക്കിന്'), end = L(i + 1);
    add(VA({ a: L(i), b: wOr - 0.1, flash: L(i), keys: push([0.2, 1.7, -15.2], [0, 1.6, -20.3], 0.03, 48, [0, 0, -1.0]), act: (t, tt, sh) => { v.setGrille(1); v.setWood(1); v.setEyes(1); v.setIronOpen(ezo(span(t, sh.a + 0.4, 1.0)), ezo(span(t, sh.a + 0.4, 1.0))); } }));
    add(TR({ a: wOr - 0.1, b: wOn - 0.1, dream: true, keys: trWide, act: (t) => { r.setGlow(1.3); OV.coins = { t0: wOr - 0.1 }; OV.big = { t0: wOr + 0.1, txt: '> ₹1,00,000', sub: 'കോടി?' }; } }));
    add(VA({ a: wOn - 0.1, b: wPa - 0.1, keys: push([0.1, 1.6, -17.6], [0, 1.4, -21], 0.02, 46, [0, 0, -0.4]), act: (t) => { v.setGrille(1); v.setWood(1); v.setIronOpen(1, 0.05); OV.big = { t0: wOn + 0.1, txt: '0', sub: 'ഒന്നുമില്ല?' }; } }));
    add(TP({ a: wPa - 0.1, b: end, keys: [[0, [0, 2.0, 11], [0, 2.4, -2], 0.02, 50], [0.4, [0, 2.1, 10.4], [0, 2.6, -2], 0.01, 50], [2.5, [0, 2.3, 9.4], [0, 3.0, -2], -0.01, 50]], act: (t) => { devotees(t); pose(T.tantri, { expr: 'smile', R: 'hold', propR: 'lamp', L: 'clap' }, t); pose(T.royal, { expr: 'smile', R: 'clap', L: 'clap' }, t); OV.badge = { t0: w(i, 'ഭഗവാന്റെ'), txt: 'ഭഗവാന്റെ സ്വത്ത്', sub: '' }; } })); }
  // ---- 13. CALLBACK: the serpents keep guard
  if (I.end >= 0) { const i = I.end;
    add(VA({ a: L(i), b: 1e9, keys: [[0, [0, 2.0, -18.0], [0, 2.0, -20.4], 0, 42], [0.4, [0, 1.95, -17.6], [0, 2.0, -20.4], 0, 44], [4.5, [0, 1.7, -13.5], [0, 1.6, -20.4], 0, 48]], act: (t) => { v.setGrille(1); v.setWood(1); v.setEyes(0.5 + Math.sin(t * 2) * 0.5); } })); }
  return out;
}

const GRADE = { temple: { hazeAmt: 0.2, haze: 0xf0b890, sat: 1.1, contrast: 0.06, lift: 0.015, warm: 0.05, vignette: 0.3 }, vault: { hazeAmt: 0.25, haze: 0x1a120c, sat: 1.08, contrast: 0.08, lift: 0.02, warm: 0.04, vignette: 0.5 },
  treasure: { hazeAmt: 0.2, haze: 0x1a120c, sat: 1.1, contrast: 0.07, lift: 0.02, warm: 0.05, vignette: 0.42 }, court: { hazeAmt: 0.1, haze: 0xf0e4c8, sat: 1.08, contrast: 0.06, lift: 0.015, warm: 0.03, vignette: 0.32 },
  tharavad: { hazeAmt: 0.1, haze: 0x2a1a10, sat: 1.1, contrast: 0.07, lift: 0.02, warm: 0.05, vignette: 0.38 }, street: { hazeAmt: 0.3, haze: 0xdfe9f2, sat: 1.1, contrast: 0.06, lift: 0.015, warm: 0.02, vignette: 0.3 },
  night: { hazeAmt: 0.15, haze: 0x1a1a30, sat: 1.05, contrast: 0.08, lift: 0.02, warm: -0.01, vignette: 0.45 } };

// ------------------------------------------------------------------ overlays (story-specific motion graphics)
function overlays(g, t, alpha) {
  if (OV.dim) { g.save(); g.globalAlpha = alpha * OV.dim; g.fillStyle = '#000'; g.fillRect(0, 0, W, H); g.restore(); }
  if (OV.waves) waves(g, t, OV.waves.t0, alpha);
  if (OV.rewind) rewind(g, t, OV.rewind.t0, alpha);
  if (OV.coins) coins(g, t, OV.coins.t0, alpha);
  if (OV.sparkle) sparkle(g, t, OV.sparkle.t0, alpha);
  if (OV.cal) calendar(g, t, OV.cal, alpha);
  if (OV.badge) badge(g, t, OV.badge, alpha);
  if (OV.bubble) bubble(g, t, OV.bubble, alpha);
  if (OV.stamp) stamp(g, t, OV.stamp, alpha);
  if (OV.tag) tag(g, t, OV.tag, alpha);
  if (OV.big) bigNum(g, t, OV.big, alpha);
  if (OV.lock) lockIcon(g, t, OV.lock.t0, alpha);
  if (OV.years) years(g, t, OV.years.t0, alpha);
  if (OV.swap) swap(g, t, OV.swap, alpha);
  if (OV.vaults) vaults(g, t, OV.vaults.t0, alpha);
  if (OV.ruler) ruler(g, t, OV.ruler, alpha);
  if (OV.chips2) swap(g, t, { ...OV.chips2, strike: true }, alpha);
  if (OV.step) step(g, t, OV.step, alpha);
  if (OV.tally) tally(g, t, OV.tally.t0, alpha);
  if (OV.rooms) rooms(g, t, OV.rooms.t0, alpha);
  if (OV.pass) pass(g, t, OV.pass, alpha);
}
const card = (g, w, h, fill = '#f4ecd6', r = 28) => { g.fillStyle = fill; g.strokeStyle = '#2a1c17'; g.lineWidth = 9; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, r); g.fill(); g.stroke(); };
function calendar(g, t, c, alpha) { const p = ezo(span(t, c.t0, 0.3)); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1400); g.rotate(-0.04); g.scale(0.8 + 0.2 * p, 0.8 + 0.2 * p);
  card(g, 520, 440, '#f4f0e6'); g.fillStyle = '#c8312c'; g.beginPath(); g.roundRect(-260, -220, 520, 120, [28, 28, 0, 0]); g.fill(); g.stroke();
  text(g, c.top, 0, -160, { font: "'Oswald'", weight: 700, size: 72, color: '#fff' }); const k = Math.min(1, span(t, c.t0 + 0.1, 0.5)); const y = c.roll && /^\d+$/.test(c.big) ? Math.round(+c.big - (1 - k) * 12) : c.big; text(g, String(y), 0, 60, { font: "'Oswald'", weight: 700, size: 210, color: '#2a1c17' }); g.restore(); }
function coins(g, t, t0, alpha) { const k = t - t0; if (k < 0) return; g.save(); g.globalAlpha = alpha; for (let i = 0; i < 26; i++) { const ph = (k * 0.9 + i * 0.137) % 1, x = W * (0.08 + ((i * 0.381) % 0.84)), y = lerp(-80, H * 0.75, ph);
  g.save(); g.translate(x, y); g.scale(Math.cos(t * 6 + i), 1); g.fillStyle = '#f0c23a'; g.strokeStyle = '#8a5a10'; g.lineWidth = 5; g.beginPath(); g.arc(0, 0, 30, 0, 7); g.fill(); g.stroke(); g.beginPath(); g.arc(0, 0, 16, 0, 7); g.stroke(); g.restore(); } g.restore(); }
function sparkle(g, t, t0, alpha) { const k = t - t0; if (k < 0) return; g.save(); g.globalAlpha = alpha * Math.min(1, k * 3); for (let i = 0; i < 9; i++) { const x = W * (0.2 + (i * 0.29) % 0.6), y = H * (0.42 + (i * 0.17) % 0.25), s = 20 + 22 * Math.abs(Math.sin(t * 4 + i));
  g.fillStyle = '#fff8d0'; g.beginPath(); for (let j = 0; j < 8; j++) { const r = j % 2 ? s * 0.25 : s, a = j / 8 * Math.PI * 2 + t; g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } g.closePath(); g.fill(); } g.restore(); }
function rewind(g, t, t0, alpha) { const k = t - t0; if (k < 0 || k > 1.1) return; g.save(); g.globalAlpha = alpha * (k < 0.9 ? 1 : 1 - (k - 0.9) / 0.2); g.fillStyle = 'rgba(255,255,255,.16)'; for (let i = 0; i < 14; i++) { const y = ((i * 151 + t * 900) % H); g.fillRect(0, y, W, 6 + (i % 3) * 4); }
  g.fillStyle = '#ffffff'; g.strokeStyle = '#120c0a'; g.lineWidth = 8; g.translate(W - 220, 520); for (const dx of [0, 70]) { g.beginPath(); g.moveTo(dx, -50); g.lineTo(dx - 70, 0); g.lineTo(dx, 50); g.closePath(); g.fill(); g.stroke(); } g.restore(); }
function lockIcon(g, t, t0, alpha) { const p = ezo(span(t, t0, 0.3)); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1350 + Math.sin(t * 9) * (t - t0 < 0.8 ? 8 : 0)); g.scale(0.7 + 0.3 * p, 0.7 + 0.3 * p);
  g.strokeStyle = '#2a1c17'; g.lineWidth = 38; g.beginPath(); g.arc(0, -90, 90, Math.PI, 0); g.stroke(); g.strokeStyle = '#a8a8b0'; g.lineWidth = 22; g.stroke(); card(g, 300, 240, '#f0c23a', 30); g.fillStyle = '#2a1c17'; g.beginPath(); g.arc(0, -10, 26, 0, 7); g.fill(); g.fillRect(-10, 0, 20, 60);
  text(g, 'ഇന്നും അടഞ്ഞ്', 0, 200, { size: 74, color: '#fff', stroke: '#2a1c17', strokeWidth: 14 }); g.restore(); }
function years(g, t, t0, alpha) { const p = ezo(span(t, t0, 0.3)); if (p <= 0) return; const k = clamp((t - t0) / 1.6, 0, 1), yr = Math.round(lerp(1750, 2011, ezo(k))); g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1380);
  card(g, 760, 260, 'rgba(244,236,214,.95)'); text(g, '1750 → ' + yr, 0, -30, { font: "'Oswald'", weight: 700, size: 110, color: '#2a1c17' }); text(g, 'നൂറ്റാണ്ടുകളുടെ കാണിക്ക', 0, 70, { size: 54, color: '#8a5a10' }); g.restore(); }
function swap(g, t, b, alpha) { const p = ezo(span(t, b.t0, 0.3)); if (p <= 0) return; const k = ezo(span(t, b.t0 + 0.45, 0.35)); g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1400);
  g.save(); g.translate(-230, 0); g.rotate(-0.05); card(g, 380, 190); text(g, b.a, 0, 4, { font: /[a-zA-Z]/.test(b.a) ? "'Oswald'" : ML, weight: 800, size: 96, color: '#2a1c17', maxWidth: 330 });
  if (k > 0) { g.strokeStyle = '#d0281e'; g.lineWidth = 18; g.lineCap = 'round'; g.beginPath(); g.moveTo(-150, 0); g.lineTo(-150 + 300 * k, 0); g.stroke(); } g.restore();
  text(g, '→', 0, 0, { font: "'Oswald'", weight: 700, size: 120, color: '#fff', stroke: '#2a1c17', strokeWidth: 14 });
  if (k > 0) { g.save(); g.translate(230, 0); g.rotate(0.05); g.scale(0.7 + 0.3 * k, 0.7 + 0.3 * k); card(g, 380, 190, '#f6d24a'); text(g, b.b, 0, 4, { size: 92, color: '#2a1c17', maxWidth: 330 }); g.restore(); } g.restore(); }
function vaults(g, t, t0, alpha) { const p = ezo(span(t, t0, 0.25)); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1360);
  card(g, 900, 420, 'rgba(26,18,12,.9)'); const L6 = ['A', 'B', 'C', 'D', 'E', 'F']; L6.forEach((l, i) => { const x = -350 + i * 140, open = l !== 'B' && t > t0 + 0.12 + 'ACDEF'.indexOf(l) * 0.35;
    g.save(); g.translate(x, -40); g.fillStyle = open ? '#f0c23a' : '#3a3632'; g.strokeStyle = '#f4ecd6'; g.lineWidth = 6; g.beginPath(); g.roundRect(-55, -90, 110, 180, 10); g.fill(); g.stroke();
    text(g, l, 0, -10, { font: "'Oswald'", weight: 700, size: 80, color: open ? '#2a1c17' : '#f4ecd6' }); if (l === 'B') text(g, '🔒', 0, 60, { font: 'sans-serif', size: 44 }); else if (open) text(g, '✔', 0, 60, { font: "'Oswald'", size: 50, color: '#1d6a2a' }); g.restore(); });
  text(g, '6 ൽ 5 തുറന്നു', 0, 140, { size: 70, color: '#f6d24a' }); g.restore(); }
function ruler(g, t, b, alpha) { const p = ezo(span(t, b.t0, 0.3)); if (p <= 0) return; const k = ezo(span(t, b.t0 + 0.1, 0.9)); g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1330);
  g.fillStyle = '#f6d24a'; g.strokeStyle = '#2a1c17'; g.lineWidth = 8; g.beginPath(); g.roundRect(-440, -40, 880 * k, 80, 12); g.fill(); g.stroke(); g.fillStyle = '#2a1c17'; for (let i = 0; i <= 18; i++) { const x = -440 + i * (880 / 18); if (x > -440 + 880 * k) break; g.fillRect(x - 2, -40, 4, i % 3 ? 26 : 44); }
  text(g, b.txt, 0, 120, { size: 120, color: '#f6d24a', stroke: '#2a1c17', strokeWidth: 22 }); text(g, b.sub, 0, 230, { size: 62, color: '#fff', stroke: '#2a1c17', strokeWidth: 14 }); g.restore(); }
function step(g, t, b, alpha) { const p = ezo(span(t, b.t0, 0.25)); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1420);
  const names = ['ഇരുമ്പ് ഗ്രിൽ', 'മരവാതിൽ', 'ഇരുമ്പ് വാതിൽ']; names.forEach((nm, i) => { const x = -300 + i * 300, done = i < b.n - 1 || (i === b.n - 1 && !b.stuck), cur = i === b.n - 1;
    g.save(); g.translate(x, 0); if (cur && b.stuck) g.translate(Math.sin(t * 40) * 6, 0); card(g, 270, 230, cur ? '#f6d24a' : done ? '#cfe8c0' : 'rgba(244,236,214,.8)', 24); text(g, String(i + 1), 0, -50, { font: "'Oswald'", weight: 700, size: 90, color: '#2a1c17' }); text(g, nm, 0, 50, { size: 44, color: '#2a1c17', maxWidth: 240 });
    if (i < b.n - 1 || (cur && !b.stuck)) text(g, '✔', 90, -80, { font: "'Oswald'", size: 64, color: '#1d6a2a' }); if (cur && b.stuck) text(g, '✘', 90, -80, { font: "'Oswald'", size: 70, color: '#d0281e' }); g.restore(); }); g.restore(); }
function waves(g, t, t0, alpha) { const k = t - t0; if (k < 0) return; g.save(); g.globalAlpha = alpha * Math.min(0.85, k * 2); for (let j = 0; j < 4; j++) { const y = 1250 + j * 120; g.fillStyle = ['#2f6a9a', '#3a7ab0', '#4a8ac0', '#5a9ad0'][j]; g.beginPath(); g.moveTo(0, H);
  for (let x = 0; x <= W; x += 20) g.lineTo(x, y + Math.sin(x * 0.012 + t * (2 + j) + j) * 30); g.lineTo(W, H); g.closePath(); g.fill(); } g.restore(); }
function tally(g, t, t0, alpha) { const p = ezo(span(t, t0, 0.3)); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1390); card(g, 820, 380, 'rgba(244,236,214,.96)');
  text(g, '1990', -200, -100, { font: "'Oswald'", weight: 700, size: 80, color: '#2a1c17' }); text(g, '2002', 200, -100, { font: "'Oswald'", weight: 700, size: 80, color: '#2a1c17' });
  const n = Math.floor(clamp((t - t0 - 0.2) / 0.18, 0, 7)); g.strokeStyle = '#c8312c'; g.lineWidth = 14; g.lineCap = 'round'; for (let i = 0; i < n; i++) { const x = i < 2 ? -240 + i * 40 : 120 + (i - 2) * 40; g.beginPath(); g.moveTo(x, -30); g.lineTo(x, 50); g.stroke(); if (i === 6) { g.beginPath(); g.moveTo(105, 40); g.lineTo(300, -20); g.stroke(); } }
  if (n >= 7) text(g, '7 തവണ തുറന്നു?', 0, 130, { size: 70, color: '#c8312c' }); g.restore(); }
function rooms(g, t, t0, alpha) { const p = ezo(span(t, t0, 0.3)); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1380); card(g, 860, 440, 'rgba(26,18,12,.9)');
  g.fillStyle = '#5a4a3a'; g.fillRect(-380, -150, 200, 220); text(g, 'മുൻമുറി', -280, 120, { size: 48, color: '#f4ecd6' }); text(g, '✔', -280, -40, { font: "'Oswald'", size: 70, color: '#8fd08a' });
  g.fillStyle = '#000'; g.strokeStyle = '#f0c23a'; g.lineWidth = 6; g.beginPath(); g.rect(-120, -190, 500, 300); g.fill(); g.stroke(); text(g, '?', 130, -40, { font: "'Oswald'", weight: 700, size: 170, color: '#f0c23a' }); text(g, 'പ്രധാന അറ', 130, 160, { size: 56, color: '#f6d24a' }); g.restore(); }
function pass(g, t, b, alpha) { const p = ezo(span(t, b.t0, 0.3)); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1400);
  const st = [['സുപ്രീം കോടതി', '2020'], ['ക്ഷേത്ര സമിതി', ''], ['തന്ത്രി', '2025']]; const k = b.step + ezo(span(t, b.t0 + 0.3, 0.6));
  st.forEach(([a, y], i) => { g.save(); g.translate(0, -170 + i * 170); card(g, 640, 130, i <= Math.floor(k) ? '#f6d24a' : 'rgba(244,236,214,.85)', 22); text(g, a, -60, 2, { size: 60, color: '#2a1c17', maxWidth: 420 }); if (y) text(g, y, 230, 2, { font: "'Oswald'", weight: 700, size: 52, color: '#8a1e1e' }); g.restore(); });
  const fy = lerp(-170, 170, clamp(k / 2, 0, 1)); g.save(); g.translate(-380, fy); g.rotate(-0.15); card(g, 90, 110, '#e8dcc0', 8); g.fillStyle = '#c8312c'; g.fillRect(-38, -40, 76, 10); g.restore(); g.restore(); }

export const hits = [];
export const extraHits = (timeline) => {
  const m = timeline.scenes.find((x) => x.id === 'main'), out = []; const s = { line: (i) => m.cues[i]?.text, cue: (i) => m.cues[i].start, cueEnd: (i) => m.cues[i].end };
  const sh = shots(s); sh.forEach((x, i) => { if (!i) return; const cut = sh[i - 1].set !== x.set; if (cut || i % 4 === 0) out.push({ t: m.start + x.a - 0.15, kind: 'whoosh', vol: cut ? 0.22 : 0.1 }); });
  const n = []; for (let i = 0; s.line(i); i++) n.push(s.line(i)); const id = (st) => n.findIndex((x) => x.startsWith(st));
  const at2 = (st, nd) => { const i = id(st); return i < 0 ? null : m.start + wt(s, i, nd); }, add = (t, kind, vol) => { if (t != null) out.push({ t, kind, vol }); };
  add(m.start + 0.05, 'boom', 0.3); add(m.start + 0.1, 'chime', 0.35); const la = at2('രണ്ടായിരത്തി പതിനൊന്ന്.', 'ഒരു ലക്ഷം'); for (let k = 0; k < 8; k++) add(la != null ? la + k * 0.12 : null, 'coin', 0.25); add(la, 'boom', 0.45);
  add(at2('രണ്ടായിരത്തി പതിനൊന്ന്.', 'പക്ഷേ') + 0.3, 'hit', 0.35); add(at2('രണ്ടായിരത്തി പതിനൊന്ന്.', 'തുറന്നാലോ'), 'boom', 0.45);
  add(at2('നോക്കൂ', 'ശ്രീ'), 'chime', 0.35); add(at2('നോക്കൂ', 'ആയിരത്തി'), 'pop', 0.35); add(at2('നോക്കൂ', 'സമർപ്പിച്ചു'), 'chime', 0.4); for (let k = 0; k < 6; k++) add(at2('നോക്കൂ', 'നൂറ്റാണ്ടുകളുടെ') + k * 0.15, 'coin', 0.2);
  add(at2('ടി.പി.', 'ടി.പി.'), 'pop', 0.35); add(at2('ടി.പി.', 'ഐ.പി.എസ്') + 0.45, 'hit', 0.3); add(at2('ടി.പി.', 'ക്ഷേത്രസ്വത്ത്'), 'pop', 0.3);
  add(at2('ആളുകൾ ചിരിച്ചു', 'ചിരിച്ചു:'), 'pop', 0.3); add(at2('ആളുകൾ ചിരിച്ചു', '"ഒരു'), 'pop', 0.3);
  add(at2('രണ്ടായിരത്തി പതിനൊന്ന് ജൂൺ', 'ഉത്തരവിട്ടു') + 0.2, 'thud', 0.55); add(at2('രണ്ടായിരത്തി പതിനൊന്ന് ജൂൺ', 'ഉത്തരവിട്ടു') + 0.25, 'boom', 0.4); for (let k = 0; k < 5; k++) add(at2('രണ്ടായിരത്തി പതിനൊന്ന് ജൂൺ', 'ആറിൽ') + 0.12 + k * 0.35, 'pop', 0.3);
  for (const nd of ['നാലടി', 'പതിനെട്ടടി', 'എണ്ണൂറ്', 'രത്നം']) add(at2('നാലടി', nd), 'chime', 0.35); add(at2('നാലടി', 'എണ്ണൂറ്') + 0.5, 'thud', 0.5);
  add(at2('തറവാട്ടിലെ', 'പത്തായം'), 'whoosh', 0.25); for (let k = 0; k < 6; k++) add(at2('തറവാട്ടിലെ', 'നെല്ലിനു') + k * 0.12, 'coin', 0.3); add(at2('തറവാട്ടിലെ', 'നെല്ലിനു') + 0.3, 'boom', 0.4);
  add(at2('കാത്തിരിക്കൂ', 'കാത്തിരിക്കൂ'), 'whoosh', 0.35); add(at2('കാത്തിരിക്കൂ', 'ഇരുമ്പ് ഗ്രിൽ') + 0.3, 'hit', 0.3); add(at2('കാത്തിരിക്കൂ', 'മരവാതിൽ') + 0.3, 'hit', 0.3); for (let k = 0; k < 4; k++) add(at2('കാത്തിരിക്കൂ', 'മൂന്നാമത്തെ') + 0.4 + k * 0.2, 'thud', 0.4); add(at2('കാത്തിരിക്കൂ', 'തുറക്കരുത്') + 0.1, 'boom', 0.5);
  add(at2('മൂന്നാഴ്ച', 'മൂന്നാഴ്ച'), 'tick', 0.3); add(at2('മൂന്നാഴ്ച', 'ശാപം') , 'hit', 0.45); add(at2('മൂന്നാഴ്ച', 'വാതിലിനപ്പുറം'), 'whoosh', 0.35);
  add(at2('പക്ഷേ ഇതാ', 'ട്വിസ്റ്റ്'), 'boom', 0.45); for (let k = 0; k < 7; k++) add(at2('പക്ഷേ ഇതാ', 'ബി നിലവറ') + 0.2 + k * 0.18, 'tick', 0.3); add(at2('പക്ഷേ ഇതാ', 'രാജകുടുംബം'), 'pop', 0.3);
  add(at2('രണ്ടായിരത്തി ഇരുപതിൽ', 'രണ്ടായിരത്തി'), 'thud', 0.35); add(at2('രണ്ടായിരത്തി ഇരുപതിൽ', 'പിന്നീട്'), 'whoosh', 0.3); add(at2('രണ്ടായിരത്തി ഇരുപതിൽ', 'ഇന്നും'), 'hit', 0.35);
  add(at2('ആ വാതിൽ തുറന്നാലോ', 'ആ'), 'boom', 0.45); for (let k = 0; k < 8; k++) add(at2('ആ വാതിൽ തുറന്നാലോ', 'ഒരുപക്ഷേ ബാക്കി') + k * 0.12, 'coin', 0.25); add(at2('ആ വാതിൽ തുറന്നാലോ', 'ഒരുപക്ഷേ ഒന്നുമില്ല') + 0.4, 'hit', 0.35); add(at2('ആ വാതിൽ തുറന്നാലോ', 'ഭഗവാന്റെ'), 'chime', 0.45);
  add(at2('അതുവരെ', 'സർപ്പങ്ങൾ'), 'hit', 0.25);
  return out.filter((x) => x.t != null && !Number.isNaN(x.t));
};
void H;
export const shotTimes = (timeline) => { const m = timeline.scenes.find((x) => x.id === 'main'); const s = { line: (i) => m.cues[i]?.text, cue: (i) => m.cues[i].start, cueEnd: (i) => m.cues[i].end }; return shots(s).map((x) => ({ a: m.start + x.a, b: m.start + x.b, set: x.set })); };
