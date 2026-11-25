// Gulf boom what-if (kit formula): hook = boys dropped off a launch and told to swim (Dasan & Vijayan nod),
// you-see (oil under the sand, 1973), mockery (herding camels?), escalation (letter -> draft -> Manavalan -> mansion),
// numbers (22 lakh, 4 in 5, Rs 2.16 lakh crore, 1 rupee in 4), analogy (the neighbour's meter), wait...? + twist
// (the fuse blew in 1990: the Kuwait airlift), what-if (no Gulf houses, an exchange queue), callback (still on the shore).
const ML = "'Noto Malayalam'";
import { W, H, clamp, lerp } from '../../pipeline/engine.js';
import { ALIGN } from './align.js';
function text(g, str, x, y, o = {}) { g.save(); let sz = o.size || 48; const f = () => `${o.weight || 800} ${sz}px ${o.font || ML}`; g.font = f(); if (o.maxWidth) while (g.measureText(str).width > o.maxWidth && sz > 12) { sz -= 2; g.font = f(); }
  g.textAlign = o.align || 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; if (o.stroke) { g.lineWidth = o.strokeWidth || sz * 0.15; g.strokeStyle = o.stroke; g.strokeText(str, x, y); } g.fillStyle = o.color || '#fff'; g.fillText(str, x, y); g.restore(); }

let K = null, B = null, S = null, stage = null, camera = null, THREE = null, PROPS = null, Z = null;
const ez = (x) => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };
const ezo = (x) => 1 - Math.pow(1 - clamp(x, 0, 1), 3);
const span = (t, a, d) => clamp((t - a) / d, 0, 1);

export async function preload() {
  K = await import('../../pipeline/toon3d.js'); THREE = K.THREE; B = await import('../../pipeline/bean.js'); PROPS = B.PROPS;
  (await import('../ml-travancore-p2/cast.js')).registerCast(B); (await import('./cast.js')).registerCast(B);
  Z = await import('./sets.js');
  const st = await import('../ml-bean/street.js'), bs = await import('../ml-bean/sets.js');
  S = { launch: Z.launchSet(), desert: Z.desertSet(), home: Z.homeSet(), air: Z.airliftSet(), street: st.buildStreet(), beach: bs.beachSet() };
  S.street.cards = st.radioCrowd(S.street.scene); Z.dressBeachDusk(S.beach); Z.dressStreetQueue(S.street, K, (w, o) => K.card(w, o));
  buildLaunch(); buildDesert(); buildStreet2(); buildHome(); buildAir(); buildBeach2();
  stage = K.makeInkStage(W, H); camera = new THREE.PerspectiveCamera(52, W / H, 0.05, 900);
}

// ------------------------------------------------------------------ actors
function actor(scene, who, x, z, y = 0, scale = 1) { const c = K.card(who, {}, { scale }); c.position.set(x, y, z); scene.add(c); return { c, who, last: '', seed: (Math.abs(x) * 13.1 + Math.abs(z) * 7.7) % 9, base: [x, y, z] }; }
function pose(a, o, t) {
  const blinkPh = (t + a.seed) % 3.1, blink = blinkPh < 0.12 ? 1 : 0; const o2 = { ...o, blink: o.blink ?? blink };
  if (typeof o2.propR === 'string') o2.propR = PROPS[o2.propR]; if (typeof o2.propL === 'string') o2.propL = PROPS[o2.propL];
  const key = JSON.stringify({ ...o, blink: o2.blink }); if (key !== a.last) { a.c.userData.set(o2); a.last = key; }
  const m = a.c.userData.cardMesh; m.rotation.z = Math.sin(t * 1.4 + a.seed) * 0.03 + (o.lean || 0); m.position.y = Math.abs(Math.sin(t * 2.8 + a.seed)) * 0.012 + (o.hop || 0);
}
const hopAt = (t, k = 7, amt = 0.08, ph = 0) => Math.max(0, Math.sin(t * k + ph)) * amt;

function buildLaunch() {
  const L = S.launch, sc = L.scene, b = L.boat;
  // on deck (boat-local coordinates; deck top y = 1.26)
  const onDeck = (who, x, z) => { const a = actor(b, who, x, z, 1.26); return a; };
  L.boys = [onDeck('dasan', 0.4, 0.3), onDeck('vijayan', -0.5, 0.45), onDeck('youth', 2.6, 0.2), onDeck('chaya', 3.4, -0.1)];
  L.boatman = onDeck('boatman', -3.0, 0.9);
  // in the water (scene coordinates; only head + raised arms above the waves)
  L.swim = [actor(sc, 'dasan', 0.6, -6.5, -1.05), actor(sc, 'vijayan', 1.7, -6.0, -1.1)];
  L.more = []; for (let i = 0; i < 10; i++) L.more.push(actor(sc, ['youth', 'chaya', 'kannan', 'fisher'][i % 4], -9 + i * 2.1, -24 - (i % 3) * 3, -1.1));
}
function buildDesert() { const d = S.desert; d.sheikh = actor(d.scene, 'khalid', 0.6, -2.0); d.boss = actor(d.scene, 'salem', -2.6, -1.4); d.boys = [actor(d.scene, 'dasan', 2.2, 1.2), actor(d.scene, 'vijayan', 3.0, 0.6)]; }
function buildStreet2() { const s = S.street; s.crowd = s.cards.map((c) => ({ c, last: '', seed: (Math.abs(c.position.x) * 13.1 + Math.abs(c.position.z) * 7.7) % 9, base: [c.position.x, c.position.y, c.position.z] }));
  s.q = s.queue.map((c, i) => ({ c, last: '', seed: i * 0.77, base: [c.position.x, 0, c.position.z] })); s.grad = actor(s.scene, 'youth', -1.3, 1.2); s.clerk = actor(s.scene, 'clerk', -2.8, 3.4); }
function buildHome() { const h = S.home, sc = h.scene; h.amma = actor(sc, 'amma', 1.2, 2.6); h.post = actor(sc, 'postman', -0.4, 3.9); h.mana = actor(sc, 'manavalan', -1.6, 4.2); h.kid = actor(sc, 'meenu', 2.0, 3.0); h.neigh = actor(sc, 'chaya', -8.4, 2.4); }
function buildAir() { const a = S.air, sc = a.scene; a.down = []; for (let i = 0; i < 9; i++) a.down.push(actor(sc, ['worker', 'dasan', 'vijayan', 'worker', 'youth', 'chaya', 'worker', 'kannan', 'fisher'][i], 12, -7.4 + i * 0.4, 0));
  a.moms = [actor(sc, 'amma', -30, 4.6), actor(sc, 'ammini', -28.6, 4.8), actor(sc, 'amma', -27.2, 4.5), actor(sc, 'meenu', -26.2, 4.9), actor(sc, 'ammini', -24.8, 4.6)];
  a.walk = []; for (let i = 0; i < 14; i++) a.walk.push(actor(sc, ['worker', 'dasan', 'vijayan', 'youth', 'chaya', 'kannan', 'fisher'][i % 7], 6 - (i % 4) * 1.1, 0.5 + Math.floor(i / 4) * 1.3, 0)); }
function buildBeach2() { const b = S.beach; b.d = actor(b.scene, 'dasan', -0.4, 2.0); b.v = actor(b.scene, 'vijayan', 0.5, 2.2); }

// ------------------------------------------------------------------ camera
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

// ------------------------------------------------------------------ per-shot state
let OV = null;
function resetProps() {
  const L = S.launch, h = S.home, s = S.street, a = S.air, d = S.desert;
  L.boys.forEach((x) => { x.c.visible = true; x.c.position.set(...x.base); }); L.swim.forEach((x) => { x.c.position.set(...x.base); x.c.visible = true; }); L.more.forEach((x) => { x.c.position.set(...x.base); x.c.visible = false; }); L.setSplash(0, 0, 0, 1e9);
  d.setGush(0, 0); d.setCity(0); h.setBuild(0); h.setTime('day'); h.setLights(0); h.setSpark(0, 1e9); h.setNotes(false, 0); h.taxi.position.x = -30; h.mana.c.visible = false; h.post.c.visible = true; h.kid.c.visible = true;
  s.q.forEach((x) => { x.c.visible = false; }); s.crowd.forEach((x) => { x.c.visible = true; }); a.down.forEach((x) => { x.c.visible = false; }); a.walk.forEach((x) => { x.c.visible = false; }); a.moms.forEach((x) => { x.c.visible = true; x.c.userData.cardMesh.material.opacity = 1; });
  OV = {};
}
function crowd(t, mode) { const s = S.street; const E = mode === 'laugh' ? ['laugh', 'grin', 'laugh', 'smug', 'laugh', 'beam', 'laugh', 'grin', 'laugh'] : ['smile', 'smug', 'grin', 'smile', 'beam', 'think', 'smile', 'smile', 'grin'];
  s.crowd.forEach((a, i) => { const laugh = mode === 'laugh'; pose(a, { expr: E[i], L: laugh ? (i % 3 === 0 ? 'point' : 'hip') : 'hang', R: laugh ? (i % 2 ? 'mouth' : 'hip') : 'hang', look: -1, lean: laugh ? (i % 2 ? 0.08 : -0.06) * Math.sin(t * 9 + i) : 0, hop: laugh ? hopAt(t, 8, 0.06, i * 1.3) : 0 }, t); }); }
function deck(t, mode, t0 = 0) { const L = S.launch;
  L.boys.forEach((a, i) => { const jumped = mode === 'jump' && t > t0 + i * 0.25; a.c.visible = !jumped; if (mode === 'jump' && !jumped) { const k = span(t, t0 + i * 0.25 - 0.4, 0.4); a.c.position.z = a.base[2] + k * 0.6; }
    pose(a, { expr: mode === 'jump' ? 'shock' : ['nervous', 'think', 'nervous', 'sad'][i], R: i === 0 ? 'holdUp' : i === 1 ? 'hold' : 'cross', propR: i === 0 ? 'bundle' : i === 1 ? 'suitcase' : null, L: mode === 'jump' ? 'up' : 'hang', look: -0.4, hop: mode === 'jump' ? hopAt(t, 9, 0.06, i) : 0 }, t); });
  pose(L.boatman, { expr: mode === 'shout' ? 'angry' : 'sly', R: 'point', L: mode === 'shout' ? 'mouth' : 'hip', look: 1, talk: mode === 'shout' ? Math.abs(Math.sin(t * 14)) : 0 }, t); }
function swim(t, mode = 'up') { const L = S.launch; L.swim.forEach((a, i) => { a.c.position.y = a.base[1] + Math.sin(t * 2.2 + i * 1.7) * 0.08 + (mode === 'wade' ? 0 : 0); pose(a, { expr: mode === 'grin' ? 'beam' : i ? 'nervous' : 'shock', R: 'up', propR: i ? 'suitcase' : 'bundle', L: mode === 'stroke' ? (Math.sin(t * 6 + i) > 0 ? 'out' : 'up') : 'up', look: 0.3 }, t); }); }
function homeCast(t, mode, t0 = 0) { const h = S.home;
  pose(h.amma, { expr: mode === 'letter' ? 'beam' : mode === 'draft' ? 'shock' : mode === 'proud' ? 'proud' : 'smile', R: mode === 'letter' ? 'holdUp' : mode === 'draft' ? 'holdUp' : 'hip', propR: mode === 'letter' ? 'letter' : mode === 'draft' ? 'draft' : null, L: mode === 'draft' ? 'mouth' : 'hang', look: -1, hop: mode === 'draft' ? hopAt(t, 7, 0.06) : 0 }, t);
  pose(h.post, { expr: 'smile', R: mode === 'letter' ? 'point' : 'hold', propR: null, L: 'hip', look: 1 }, t);
  pose(h.kid, { expr: 'beam', R: 'up', L: 'hang', look: -1, hop: hopAt(t, 7, 0.08) }, t);
  pose(h.neigh, { expr: mode === 'dark' ? 'smug' : mode === 'spark' ? 'shock' : 'think', R: mode === 'dark' ? 'cross' : 'chin', L: 'hip', look: 1 }, t); }

// ------------------------------------------------------------------ shots
function shots(s) { return tidy(rawShots(s)); }
function rawShots(s) {
  const L = (i) => s.cue(i), w = (i, n) => wt(s, i, n);
  const LA = (k) => ({ set: 'launch', ...k }), DE = (k) => ({ set: 'desert', ...k }), ST = (k) => ({ set: 'street', ...k }), HO = (k) => ({ set: 'home', ...k }), AI = (k) => ({ set: 'air', ...k }), BE = (k) => ({ set: 'beach', ...k });
  const w0Kara = w(0, 'കര'), w0Bakki = w(0, '"ബാക്കി'), w0Das = w(0, 'ദാസനും'), w0Ith = w(0, 'ഇത്'), w0Aa = w(0, 'ആ നീന്തലാണ്');
  const w1Ez = w(1, 'എഴുപത്തിമൂന്നിൽ'), w1Gul = w(1, 'ഗൾഫ്'), w1Av = w(1, 'അവർക്ക്'), w1Pa = w(1, 'പണിക്കാർ');
  const w2Ma = w(2, '"മരുഭൂമിയിൽ'), w2Ot = w(2, 'ഒട്ടകത്തെ');
  const w3Dr = w(3, 'ഡ്രാഫ്റ്റ്'), w3Ku = w(3, 'കൂളിംഗ്'), w3Od = w(3, 'ഓടിട്ട'), w3Ko = w(3, 'കോൺക്രീറ്റ്');
  const w4Iru = w(4, 'ഇരുപത്തിരണ്ട്'), w4Anj = w(4, 'അഞ്ചിൽ'), w4Ren = w(4, 'രണ്ടായിരത്തി'), w4Lak = w(4, 'രണ്ട് ലക്ഷത്തി');
  const w5Ayal = w(5, 'അയൽവീട്ടിലെ'), w5Lig = w(5, 'ലൈറ്റ്'), w5Fy = w(5, 'ഫ്യൂസ്');
  const w6Aa = w(6, 'ആ ഫ്യൂസ്'), w6Und = w(6, 'ഉണ്ട്'), w6Th = w(6, 'തൊണ്ണൂറിൽ'), w6Oru = w(6, 'ഒരു ലക്ഷത്തി'), w6Av = w(6, 'അവരിൽ'), w6Kay = w(6, 'കയ്യിൽ');
  const w7Gv = w(7, 'ഗൾഫ് വീടുകളില്ല'), w7Air = w(7, 'എയർപോർട്ടിൽ');
  const w8Emp = w(8, 'എംപ്ലോയ്മെന്റ്'), w8Ki = w(8, 'കിലോമീറ്ററുകൾ');
  const w9Ke = w(9, 'കേരളം');
  const homeCam = (a, b) => [[0, a[0], a[1], a[2] || 0, a[3] || 50], [0.35, b[0], b[1], 0.01, b[3] || 50], [2.4, b[0].map((v, k) => v + (b[2] || [0, 0, 0])[k]), b[1], -0.02, b[3] || 50]];
  return [
    // ---- 1. HOOK: night, a smuggler's launch, boys dropped into the sea
    LA({ a: 0, b: w0Kara - 0.1, keys: [[0, [6.6, 2.5, -9.4], [4.2, 2.3, -13.8], 0.05, 46], [0.35, [6.2, 2.55, -9.8], [4.2, 2.3, -13.8], 0.02, 46], [3, [5.6, 2.7, -10.4], [4.0, 2.3, -13.8], -0.02, 48]],
      act: (t) => deck(t, 'calm') }),
    LA({ a: w0Kara - 0.1, b: w0Bakki - 0.1, shake: w0Kara + 0.9, keys: [[0, [8, 1.0, -4], [4.4, 1.4, -13], -0.04, 54], [0.35, [8.5, 1.2, -3.5], [4.4, 1.4, -13], -0.02, 54], [2, [9, 1.5, -3], [4.4, 1.4, -13], 0.02, 56]],
      act: (t, tt, sh) => { deck(t, 'jump', sh.a + 0.5); S.launch.setSplash(4.6, -11.6, t, sh.a + 0.9); } }),
    LA({ a: w0Bakki - 0.1, b: w0Das - 0.1, keys: [[0, [0.4, 2.9, -9.2], [1.4, 2.8, -13.8], 0.06, 42], [0.35, [0.6, 2.9, -9.6], [1.4, 2.8, -13.8], 0.03, 40], [2, [0.7, 2.9, -9.9], [1.4, 2.8, -13.8], 0.0, 38]],
      act: (t) => { deck(t, 'shout'); S.launch.boys.forEach((a) => { a.c.visible = false; }); OV.bubble = { t0: w(0, '"ബാക്കി'), txt: '"ബാക്കി നീന്തിക്കോ!"', x: 0.5, y: 0.62 }; } }),
    LA({ a: w0Das - 0.1, b: w0Ith - 0.1, keys: [[0, [1.6, 0.35, -2.4], [1.1, 0.4, -6.2], 0.04, 46], [0.35, [1.5, 0.4, -2.8], [1.1, 0.45, -6.2], 0.02, 46], [2.5, [1.4, 0.45, -3.1], [1.1, 0.5, -6.2], -0.02, 46]],
      act: (t) => { swim(t, 'up'); S.launch.boys.forEach((a) => { a.c.visible = false; }); OV.bubble = { t0: w0Das + 0.6, txt: 'ഗഫൂർ കാ ദോസ്ത്!', x: 0.5, y: 0.56 }; } }),
    LA({ a: w0Ith - 0.1, b: w0Aa - 0.1, flash: w0Ith - 0.1, keys: [[0, [0, 6, 6], [0, 0, -26], 0.03, 54], [0.4, [0, 7, 8], [0, 0, -28], 0.01, 54], [2, [0, 8, 10], [0, 0, -30], -0.01, 56]],
      act: (t) => { S.launch.boys.forEach((a) => { a.c.visible = false; }); S.launch.more.forEach((a, i) => { a.c.visible = true; a.c.position.z = a.base[2] - (t % 20) * 0.15; pose(a, { expr: 'nervous', R: 'up', L: Math.sin(t * 6 + i) > 0 ? 'out' : 'up', look: 0 }, t); }); swim(t, 'stroke'); OV.stamp = { t0: w0Ith + 0.2, txt: 'ശരിക്കും നടന്നത്', sub: 'TRUE STORY' }; } }),
    LA({ a: w0Aa - 0.1, b: L(1), keys: [[0, [3.5, 1.0, -66], [0.6, 1.2, -76], 0.03, 50], [0.4, [3.2, 1.2, -67], [0.6, 1.3, -76], 0.01, 50], [3, [2.6, 1.6, -68.5], [0.6, 1.5, -78], -0.01, 52]],
      act: (t) => { S.launch.boys.forEach((a) => { a.c.visible = false; }); S.launch.swim.forEach((a, i) => { a.c.position.set(i * 1.2, -0.4 + Math.min(0.4, (t - L(1) + 3) * 0.1), -74.5); pose(a, { expr: 'beam', R: 'up', propR: i ? 'suitcase' : 'bundle', L: 'wave', look: 0 }, t); }); } }),
    // ---- 2. YOU SEE: oil under the sand; 1973 price x4; the Gulf gets rich overnight; needs workers
    DE({ a: L(1), b: w1Ez - 0.1, keys: [[0, [-6, 2, 8], [-9, 8, -18], 0.04, 54], [0.4, [-5.5, 1.8, 6], [-9, 9, -18], 0.02, 54], [2, [-5, 1.6, 4.5], [-9, 10, -18], -0.02, 54]],
      act: (t, tt, sh) => { S.desert.setGush(1, t - sh.a); pose(S.desert.sheikh, { expr: 'shock', L: 'mouth', R: 'up', look: -1, lookY: -1 }, t); pose(S.desert.boss, { expr: 'beam', R: 'up', L: 'up', look: -1, hop: hopAt(t, 7, 0.08) }, t); S.desert.boys.forEach((a) => { a.c.visible = false; }); } }),
    DE({ a: w1Ez - 0.1, b: w1Gul - 0.1, keys: [[0, [2, 3, 10], [0, 3, -10], -0.03, 52], [0.35, [2, 3.2, 9], [0, 3.2, -10], -0.01, 52], [2, [2, 3.4, 8.4], [0, 3.4, -10], 0.02, 52]],
      act: (t, tt, sh) => { S.desert.setGush(1, t); pose(S.desert.sheikh, { expr: 'proud', L: 'hip', R: 'thumb', look: 0 }, t); pose(S.desert.boss, { expr: 'laugh', R: 'up', L: 'hip', look: 1 }, t); S.desert.boys.forEach((a) => { a.c.visible = false; }); OV.price = { t0: sh.a + 0.2 }; } }),
    DE({ a: w1Gul - 0.1, b: w1Av - 0.1, keys: [[0, [0, 4, 14], [0, 8, -100], 0.03, 56], [0.4, [0, 5, 12], [0, 10, -100], 0.01, 54], [2, [0, 6, 10], [0, 12, -100], -0.01, 52]],
      act: (t, tt, sh) => { S.desert.setGush(1, t); S.desert.setCity(ezo(span(t, sh.a, 1.6))); pose(S.desert.sheikh, { expr: 'beam', L: 'up', R: 'up', look: 0, lookY: -1 }, t); pose(S.desert.boss, { expr: 'beam', R: 'up', L: 'up', look: 0, hop: hopAt(t, 8, 0.08) }, t); S.desert.boys.forEach((a) => { a.c.visible = false; }); } }),
    DE({ a: w1Av - 0.1, b: L(2), keys: [[0, [1.6, 1.7, 3.2], [-0.6, 1.8, -2.4], 0.04, 46], [0.35, [1.4, 1.7, 2.8], [-0.6, 1.9, -2.4], 0.02, 46], [2, [1.2, 1.7, 2.6], [-0.6, 2.0, -2.4], -0.02, 46]],
      act: (t) => { pose(S.desert.sheikh, { expr: 'smug', R: 'point', L: 'hip', look: -0.4 }, t); pose(S.desert.boss, { expr: 'think', R: 'chin', L: 'hip', look: 1 }, t); S.desert.boys.forEach((a) => { a.c.visible = false; }); if (t > w1Pa - 0.1) OV.badge = { t0: w1Pa, txt: 'പണിക്കാർ!', sub: 'WORKERS WANTED' }; } }),
    // ---- 3. MOCKERY: herding camels?
    ST({ a: L(2), b: w2Ot - 0.1, keys: [[0, [1.0, 1.7, 0.9], [-1.8, 1.5, -4], 0.04, 52], [0.35, [0.7, 1.75, 1.3], [-1.8, 1.55, -4], 0.02, 54], [2.1, [0.5, 1.8, 1.6], [-1.8, 1.6, -4], -0.01, 54]],
      act: (t) => { crowd(t, 'laugh'); if (t > w2Ma) OV.bubble = { t0: w2Ma, txt: '"മരുഭൂമിയിൽ എന്ത് പണി?"', x: 0.5, y: 0.62 }; } }),
    ST({ a: w2Ot - 0.1, b: L(3), shake: w2Ot + 0.2, keys: [[0, [-1.6, 1.5, -2.6], [-2.5, 1.5, -4.6], -0.04, 44], [0.35, [-1.7, 1.5, -2.9], [-2.5, 1.5, -4.6], -0.02, 44], [2, [-1.75, 1.5, -3.0], [-2.5, 1.55, -4.6], 0.02, 42]],
      act: (t) => { crowd(t, 'laugh'); OV.badge = { t0: w2Ot, txt: 'ഒട്ടകത്തെ മേയ്ക്കാനോ? 🐪', sub: '' }; } }),
    // ---- 4. ESCALATION: a letter, a draft, Manavalan lands, the tiled house becomes a mansion
    HO({ a: L(3), b: w3Dr - 0.1, keys: [[0, [3.4, 1.6, 7.4], [0.6, 1.6, 3.0], 0.04, 46], [0.35, [3.0, 1.6, 7.0], [0.6, 1.6, 3.0], 0.02, 46], [2, [2.8, 1.65, 6.8], [0.6, 1.65, 3.0], -0.02, 46]],
      act: (t) => { homeCast(t, 'letter'); } }),
    HO({ a: w3Dr - 0.1, b: w3Ku - 0.1, keys: [[0, [1.5, 1.75, 6.2], [1.2, 1.65, 2.6], -0.03, 40], [0.35, [1.45, 1.74, 5.8], [1.2, 1.7, 2.6], -0.01, 40], [2, [1.4, 1.73, 5.5], [1.2, 1.72, 2.6], 0.02, 38]],
      act: (t) => { homeCast(t, 'draft'); S.home.post.c.visible = false; S.home.kid.c.visible = false; } }),
    HO({ a: w3Ku - 0.1, b: w3Od - 0.1, shake: w3Ku + 0.7, keys: [[0, [-4.6, 1.0, 8.6], [-1.6, 1.6, 4.0], 0.05, 48], [0.35, [-4.2, 1.1, 8.2], [-1.6, 1.7, 4.0], 0.02, 48], [2.4, [-3.6, 1.2, 7.6], [-1.6, 1.8, 4.0], -0.02, 46]],
      act: (t, tt, sh) => { const h = S.home, u = ezo(span(t, sh.a - 0.4, 0.9)); h.taxi.position.x = lerp(-18, -4.4, u); h.mana.c.visible = t > sh.a + 0.5; const k = span(t, sh.a + 0.5, 0.6); h.mana.c.position.set(lerp(-3.6, -1.6, k), 0, 4.2);
        pose(h.mana, { expr: 'smug', R: 'holdUp', propR: 'twoinone', L: t > sh.a + 1.4 ? 'wave' : 'hip', walk: k < 1 ? (t * 1.6) % 1 : 0, look: 1 }, t); homeCast(t, 'proud'); h.post.c.visible = false; OV.tag = { t0: sh.a + 0.6, txt: 'മണവാളൻ ✨' }; } }),
    HO({ a: w3Od - 0.1, b: L(4), keys: [[0, [0, 2.2, 15], [0, 3.0, -3], 0.03, 54], [0.4, [0, 2.6, 14], [0, 3.6, -3], 0.01, 56], [2.6, [0, 3.0, 13], [0, 4.0, -3], -0.02, 58]],
      act: (t, tt, sh) => { const h = S.home; h.setBuild(ezo(span(t, w3Ko - 0.3, 1.4))); h.taxi.position.x = -4.4; h.mana.c.visible = true; h.mana.c.position.set(-1.6, 0, 4.2); pose(h.mana, { expr: 'proud', R: 'holdUp', propR: 'twoinone', L: 'point', look: 0, lookY: -1 }, t); homeCast(t, 'proud'); h.post.c.visible = false; } }),
    // ---- 5. NUMBERS: 22 lakh abroad, 4 in 5 in the Gulf; Rs 2.16 lakh crore in 2023
    AI({ a: L(4), b: w4Ren - 0.1, keys: [[0, [20, 2.2, 18], [10, 3, -4], 0.03, 54], [0.4, [21, 2.6, 19], [10, 3.2, -4], 0.01, 54], [3, [22, 3.4, 21], [10, 3.6, -4], -0.02, 56]],
      act: (t, tt, sh) => { const a = S.air; a.walk.forEach((x, i) => { x.c.visible = true; const z = x.base[2] + (t - sh.a) * 1.1; x.c.position.set(x.base[0] + 4, 0, z); pose(x, { expr: ['beam', 'proud', 'smile'][i % 3], R: 'hold', propR: i % 2 ? 'suitcase' : 'bundle', L: 'hang', walk: (t * 1.4 + i * 0.3) % 1, look: 0 }, t); });
        OV.big = { t0: w4Iru, txt: '22 ലക്ഷം', sub: 'മലയാളികൾ പുറംനാട്ടിൽ' }; if (t > w4Anj) OV.pie = { t0: w4Anj }; } }),
    HO({ a: w4Ren - 0.1, b: L(5), keys: [[0, [0, 1.4, 13], [0, 4.0, -3], 0.03, 56], [0.4, [0, 1.6, 12.4], [0, 4.4, -3], 0.01, 58], [2.6, [0, 1.8, 11.8], [0, 4.8, -3], -0.02, 60]],
      act: (t) => { const h = S.home; h.setBuild(1); h.setNotes(true, t); homeCast(t, 'draft'); h.post.c.visible = false; h.mana.c.visible = true; h.mana.c.position.set(-1.6, 0, 4.2); pose(h.mana, { expr: 'laugh', R: 'up', L: 'up', look: 0, hop: hopAt(t, 7, 0.06) }, t);
        OV.big = { t0: w4Lak, txt: '₹2,16,893 കോടി', sub: '2023 · KERALA MIGRATION SURVEY' }; } }),
    // ---- 6. ONE RUPEE IN FOUR; the house on the neighbour's meter; lights on... until the fuse
    HO({ a: L(5), b: w5Ayal - 0.1, keys: [[0, [3, 1.5, 9], [0, 2.4, -2], 0.03, 50], [0.35, [2.8, 1.5, 8.6], [0, 2.4, -2], 0.01, 50], [2, [2.6, 1.55, 8.3], [0, 2.5, -2], -0.02, 50]],
      act: (t, tt, sh) => { const h = S.home; h.setBuild(1); homeCast(t, 'proud'); h.post.c.visible = false; OV.coins = { t0: sh.a + 0.2 }; } }),
    HO({ a: w5Ayal - 0.1, b: w5Lig - 0.1, keys: [[0, [-4.0, 2.3, 5.2], [-6.2, 2.9, 0.9], 0.04, 46], [0.35, [-4.2, 2.4, 4.8], [-6.0, 3.1, 0.6], 0.02, 46], [2, [-4.4, 2.6, 4.6], [-4.2, 3.6, -0.4], -0.02, 50]],
      act: (t) => { const h = S.home; h.setBuild(1); h.setTime('dusk'); homeCast(t, 'calm'); h.post.c.visible = false; } }),
    HO({ a: w5Lig - 0.1, b: w5Fy - 0.1, keys: [[0, [0, 1.6, 12], [0, 3.0, -3], 0.02, 54], [0.35, [0, 1.7, 11.5], [0, 3.1, -3], 0.0, 54], [2, [0, 1.8, 11.2], [0, 3.2, -3], -0.01, 54]],
      act: (t, tt, sh) => { const h = S.home; h.setBuild(1); h.setTime('dusk'); h.setLights(ezo(span(t, sh.a + 0.1, 0.3))); homeCast(t, 'proud'); h.post.c.visible = false; } }),
    HO({ a: w5Fy - 0.1, b: L(6), keys: [[0, [-5.4, 2.6, 3.8], [-6.4, 2.9, 0.8], -0.03, 46], [0.35, [-5.5, 2.6, 3.5], [-6.4, 2.9, 0.8], -0.01, 44], [2, [-5.6, 2.6, 3.3], [-6.4, 2.9, 0.8], 0.02, 42]],
      act: (t) => { const h = S.home; h.setBuild(1); h.setTime('dusk'); h.setLights(1); homeCast(t, 'spark'); h.post.c.visible = false; } }),
    // ---- 7. WAIT...? has the fuse ever blown? YES: 1990, Kuwait; the airlift
    HO({ a: L(6), b: w6Und - 0.1, dream: true, keys: [[0, [1.4, 1.75, 7.6], [1.2, 1.7, 2.6], -0.03, 44], [0.4, [1.4, 1.75, 7.2], [1.2, 1.7, 2.6], -0.01, 42], [2.5, [1.4, 1.75, 6.9], [1.2, 1.72, 2.6], 0.02, 40]],
      act: (t) => { const h = S.home; h.setBuild(1); h.setTime('dusk'); h.setLights(1); homeCast(t, 'calm'); pose(h.amma, { expr: 'think', R: 'chin', L: 'hip', look: 0.4, lookY: -1 }, t); h.post.c.visible = false; } }),
    HO({ a: w6Und - 0.1, b: w6Th - 0.1, shake: w6Und + 0.05, keys: [[0, [-5.0, 2.4, 4.2], [-6.4, 3.4, 0.8], 0.05, 48], [0.35, [-4.4, 2.6, 6.0], [-4.0, 3.2, -1.0], 0.02, 52], [1.6, [-2, 3.0, 11], [-1, 3.2, -3], -0.02, 56]],
      act: (t, tt, sh) => { const h = S.home; h.setBuild(1); h.setTime('dusk'); h.setSpark(t, sh.a + 0.05); h.setLights(t < sh.a + 0.15 ? 1 : 0); homeCast(t, 'spark'); h.post.c.visible = false; } }),
    DE({ a: w6Th - 0.1, b: w6Oru - 0.1, war: true, keys: [[0, [0, 6, 18], [0, 6, -100], 0.03, 56], [0.4, [0, 6.4, 17], [0, 6, -100], 0.01, 54], [2, [0, 6.8, 16], [0, 6, -100], -0.01, 52]],
      act: (t) => { S.desert.setCity(1); S.desert.boys.forEach((a) => { a.c.visible = false; }); S.desert.sheikh.c.visible = false; S.desert.boss.c.visible = false; OV.badge = { t0: w6Th + 0.1, txt: 'കുവൈറ്റ് · 1990', sub: 'IRAQ INVADES KUWAIT' }; } }),
    AI({ a: w6Oru - 0.1, b: w6Av - 0.1, keys: [[0, [30, 4, 16], [10, 5, -8], 0.04, 52], [0.4, [28, 4.4, 15], [10, 5.2, -8], 0.02, 52], [2, [26, 4.8, 14], [10, 5.4, -8], -0.02, 52]],
      act: (t, tt, sh) => { const a = S.air; a.down.forEach((x, i) => { const k = ((t - sh.a) * 0.45 - i * 0.11); x.c.visible = k > 0 && k < 1.2; const u = clamp(k, 0, 1); x.c.position.set(12, lerp(4.6, 0, u), lerp(-7.4 + 2.6, 0.2 + 2.6, u) + 2); pose(x, { expr: ['sad', 'nervous', 'think'][i % 3], R: 'hold', propR: i % 3 === 0 ? 'bundle' : null, L: 'hang', walk: (t * 1.4 + i * 0.3) % 1, look: 0.2 }, t); });
        OV.big = { t0: w6Oru, txt: '1,70,000', sub: '488 ഫ്ലൈറ്റുകൾ · 63 ദിവസം' }; } }),
    AI({ a: w6Av - 0.1, b: L(7), keys: [[0, [12.8, 1.7, 9.6], [12, 1.6, 5.4], 0.03, 44], [0.35, [12.7, 1.7, 9.2], [12, 1.65, 5.4], 0.01, 42], [2, [12.6, 1.72, 9.0], [12, 1.7, 5.4], -0.02, 40]],
      act: (t) => { const a = S.air; [a.down[1], a.down[2]].forEach((x, i) => { x.c.visible = true; x.c.position.set(11.5 + i * 1.0, 0, 5.2 - i * 0.3); pose(x, { expr: 'sad', R: t > w6Kay ? 'out' : 'hang', L: t > w6Kay ? 'out' : 'hang', look: 0 }, t); }); } }),
    // ---- 8. WHAT IF: no Gulf houses, no mothers waiting at the airport
    HO({ a: L(7), b: w7Gv - 0.1, dream: true, keys: [[0, [0, 2.4, 16], [0, 3.4, -3], 0.03, 52], [0.4, [0, 2.6, 15], [0, 3.6, -3], 0.01, 54], [2, [0, 2.8, 14.4], [0, 3.8, -3], -0.01, 56]],
      act: (t) => { const h = S.home; h.setBuild(1); homeCast(t, 'calm'); h.post.c.visible = false; } }),
    HO({ a: w7Gv - 0.1, b: w7Air - 0.1, dream: true, shake: w7Gv + 0.3, keys: [[0, [0, 2.0, 14], [0, 3.0, -3], -0.03, 54], [0.4, [0, 2.1, 13.4], [0, 3.0, -3], -0.01, 54], [2, [0, 2.2, 13], [0, 3.0, -3], 0.01, 54]],
      act: (t, tt, sh) => { const h = S.home; h.setBuild(1 - ezo(span(t, sh.a + 0.1, 1.0))); homeCast(t, 'calm'); pose(h.amma, { expr: 'shock', R: 'mouth', L: 'hang', look: 0, lookY: -1 }, t); h.post.c.visible = false; } }),
    AI({ a: w7Air - 0.1, b: L(8), dream: true, keys: [[0, [-27, 1.6, 12], [-27, 1.5, 4.6], 0.03, 50], [0.35, [-27, 1.6, 11.4], [-27, 1.5, 4.6], 0.01, 50], [2.4, [-27, 1.6, 11], [-27, 1.55, 4.6], -0.01, 50]],
      act: (t, tt, sh) => { const a = S.air, u = span(t, w(7, 'അമ്മമാരില്ല'), 0.8); a.moms.forEach((x, i) => { const gone = u > i / 5; x.c.visible = !gone; pose(x, { expr: 'beam', R: 'wave', L: 'up', look: 1, lookY: -0.4, hop: hopAt(t, 6, 0.05, i) }, t); }); } }),
    // ---- 9. instead: educated, jobless; a queue kilometres long
    ST({ a: L(8), b: w8Emp - 0.1, keys: [[0, [0.4, 1.7, 4.0], [-1.3, 1.75, 1.2], 0.03, 44], [0.35, [0.3, 1.7, 3.8], [-1.3, 1.78, 1.2], 0.01, 44], [2, [0.2, 1.7, 3.6], [-1.3, 1.8, 1.2], -0.02, 42]],
      act: (t) => { const s = S.street; s.crowd.forEach((x) => { x.c.visible = false; }); pose(s.grad, { expr: 'sad', R: 'holdUp', propR: 'papers', L: 'hang', look: 0 }, t); pose(s.clerk, { expr: 'bored', R: 'cross', L: 'cross', look: 1 }, t); OV.badge = { t0: L(8) + 0.4, txt: 'ബിരുദം ✔  ജോലി ✘', sub: '' }; } }),
    ST({ a: w8Emp - 0.1, b: L(9), keys: [[0, [1.2, 2.4, 5.0], [-2.0, 1.4, -10], 0.03, 50], [0.4, [1.4, 3.0, 5.6], [-2.0, 1.2, -16], 0.01, 52], [2.6, [1.8, 6.0, 7.0], [-2.0, 0.5, -30], -0.02, 56]],
      act: (t) => { const s = S.street; s.crowd.forEach((x) => { x.c.visible = false; }); s.grad.c.visible = false; pose(s.clerk, { expr: 'bored', R: 'cross', L: 'cross', look: 1 }, t); s.q.forEach((x, i) => { x.c.visible = true; pose(x, { expr: ['nervous', 'think', 'sad', 'bored'][i % 4], R: i % 3 ? 'holdUp' : 'cross', propR: i % 3 ? 'papers' : null, L: 'hang', look: 0.3 }, t); }); if (t > w8Ki) OV.badge = { t0: w8Ki, txt: 'കിലോമീറ്ററുകൾ...', sub: '' }; } }),
    // ---- 10. CALLBACK: still standing on the shore, waiting
    BE({ a: L(9), b: w9Ke - 0.1, keys: [[0, [0.1, 1.6, 6.4], [0.1, 1.6, 2.0], 0.03, 44], [0.35, [0.1, 1.62, 6.0], [0.1, 1.62, 2.0], 0.01, 42], [2, [0.1, 1.64, 5.8], [0.1, 1.64, 2.0], -0.01, 40]],
      act: (t) => { const b = S.beach; pose(b.d, { expr: 'think', R: 'holdUp', propR: 'bundle', L: 'hang', look: 0, lookY: 0 }, t); pose(b.v, { expr: 'nervous', R: 'hold', propR: 'suitcase', L: 'chin', look: 0 }, t); } }),
    BE({ a: w9Ke - 0.1, b: 1e9, keys: [[0, [0.3, 1.5, 4.4], [0, 1.6, -30], 0.02, 50], [0.4, [0.3, 2.2, 6], [0, 2, -60], 0.01, 50], [4, [0.3, 4.5, 12], [0, 3, -90], -0.01, 52]],
      act: (t) => { const b = S.beach; b.d.c.rotation.y = Math.PI; b.v.c.rotation.y = Math.PI; pose(b.d, { expr: 'sad', R: 'holdUp', propR: 'bundle', L: 'hang', look: 0 }, t); pose(b.v, { expr: 'sad', R: 'hold', propR: 'suitcase', L: 'hang', look: 0 }, t); } }),
  ];
}
function tidy(list) {
  const n = list.length; for (let i = 1; i < n; i++) { const lo = list[i - 1].a + 0.6, hi = i + 1 < n ? list[i + 1].a - 0.6 : 1e9; if (list[i].a < lo) list[i].a = Math.min(lo, Math.max(list[i - 1].a + 0.3, (list[i - 1].a + hi) / 2)); }
  for (let i = 0; i < n; i++) list[i].b = i + 1 < n ? list[i + 1].a : list[i].b;
  const out = []; list.forEach((x) => { const d = x.b - x.a; if (d <= 2.4 || x.b > 1e8) { out.push(x); return; } const k = Math.ceil(d / 2.1), step = d / k;
    for (let j = 0; j < k; j++) { if (!j) { out.push({ ...x, b: x.a + step }); continue; } const side = j % 2 ? 1 : -1, push = 0.2 + 0.08 * j, far = Math.hypot(...x.keys[0][1].map((v, q) => v - x.keys[0][2][q])) > 20 ? 6 : 1;
      const keys = x.keys.map(([t, p, l, r = 0, f = 52]) => [t, p.map((v, q) => v + (l[q] - v) * push + (q === 0 ? side * 0.25 * far : q === 1 ? 0.1 * far : 0)), l, -r + side * 0.03, f - 4]);
      out.push({ ...x, a: x.a + j * step, b: j === k - 1 ? x.b : x.a + (j + 1) * step, keys, flash: null }); } });
  return out;
}

// ------------------------------------------------------------------ rendering
const GRADE = { launch: { hazeAmt: 0.2, haze: 0x1a2040, sat: 1.05, contrast: 0.08, lift: 0.01, warm: -0.01, vignette: 0.45 }, desert: { hazeAmt: 0.25, haze: 0xf0dcb0, sat: 1.1, contrast: 0.06, lift: 0.015, warm: 0.04, vignette: 0.3 },
  home: { hazeAmt: 0.25, haze: 0xdfe9f2, sat: 1.1, contrast: 0.06, lift: 0.015, warm: 0.02, vignette: 0.3 }, air: { hazeAmt: 0.2, haze: 0xdfe4ea, sat: 1.05, contrast: 0.06, lift: 0.015, warm: 0.0, vignette: 0.3 },
  street: { hazeAmt: 0.3, haze: 0xdfe9f2, sat: 1.1, contrast: 0.06, lift: 0.015, warm: 0.02, vignette: 0.3 }, beach: { hazeAmt: 0.25, haze: 0xc08a7a, sat: 1.1, contrast: 0.07, lift: 0.01, warm: 0.05, vignette: 0.4 } };
function renderShot(g, sh, t, alpha = 1) {
  const set = S[sh.set]; const tt = t - sh.a; set.life.forEach((f) => f(t)); resetProps(); sh.act(t, tt, sh);
  const c = camAt(sh.keys, tt); const dist = Math.hypot(...c.p.map((v, q) => v - c.l[q])); place(c, t, sh.shake != null ? shakeAt(t, sh.shake, 0.5) : 0, dist > 25 ? 5 : 1); camera.updateMatrixWorld();
  const gr = GRADE[sh.set]; const cv = stage.render(set.scene, camera, { focus: Math.min(dist, 30), aperture: dist > 25 ? 1.5 : 6, ...gr, sat: sh.war ? 0.6 : gr.sat });
  g.save(); g.globalAlpha = alpha;
  if (sh.dream) { g.filter = 'saturate(0.45) brightness(1.06)'; const N = 48, sh2 = H / N; for (let i = 0; i < N; i++) { const dx = Math.sin(i * 0.35 + t * 3) * 10; g.drawImage(cv, 0, i * sh2 * (cv.height / H), cv.width, sh2 * (cv.height / H) + 1, dx, i * sh2, W, sh2 + 1); } g.filter = 'none';
    const rg = g.createRadialGradient(W / 2, H / 2, W * 0.35, W / 2, H / 2, H * 0.62); rg.addColorStop(0, 'rgba(255,255,255,0)'); rg.addColorStop(1, 'rgba(255,255,255,.85)'); g.fillStyle = rg; g.fillRect(0, 0, W, H);
  } else g.drawImage(cv, 0, 0, W, H);
  if (sh.war) { g.fillStyle = 'rgba(160,40,20,.28)'; g.fillRect(0, 0, W, H); }
  g.restore();
  if (sh.flash != null) { const k = t - sh.flash, a = k < 0 ? 0 : k < 0.27 ? 0 : k < 0.6 ? 1 - (k - 0.27) / 0.33 : 0; const pre = Math.max(0, 1 - Math.abs(k) / 0.27); g.save(); g.globalAlpha = Math.max(a, pre) * 0.9 * alpha; g.fillStyle = '#fff'; g.fillRect(0, 0, W, H); g.restore(); }
  overlays(g, t, alpha);
}
function overlays(g, t, alpha) {
  if (OV.badge) badge(g, t, OV.badge, alpha);
  if (OV.bubble) bubble(g, t, OV.bubble, alpha);
  if (OV.stamp) stamp(g, t, OV.stamp, alpha);
  if (OV.tag) { const p = ezo(span(t, OV.tag.t0, 0.3)); if (p > 0) { g.save(); g.globalAlpha = alpha * p; g.translate(W * 0.3, 1450); g.rotate(-0.06); g.fillStyle = '#c8312c'; g.strokeStyle = '#2a1c17'; g.lineWidth = 8; g.beginPath(); g.roundRect(-230, -70, 460, 140, 22); g.fill(); g.stroke(); text(g, OV.tag.txt, 0, 4, { size: 70, color: '#fff6d0' }); g.restore(); } }
  if (OV.big) bigNum(g, t, OV.big, alpha);
  if (OV.pie) pie(g, t, OV.pie.t0, alpha);
  if (OV.price) price(g, t, OV.price.t0, alpha);
  if (OV.coins) coins(g, t, OV.coins.t0, alpha);
}
function badge(g, t, b, alpha) {
  const p = ezo(span(t, b.t0, 0.27)); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1480); g.rotate(-0.04); g.scale(0.8 + 0.2 * p, 0.8 + 0.2 * p);
  g.font = `800 88px ${ML}`; const w = Math.min(980, g.measureText(b.txt).width + 120);
  g.fillStyle = '#f6d24a'; g.strokeStyle = '#2a1c17'; g.lineWidth = 10; g.beginPath(); g.roundRect(-w / 2, -90, w, b.sub ? 230 : 180, 26); g.fill(); g.stroke();
  text(g, b.txt, 0, 0, { font: ML, weight: 800, size: 88, color: '#2a1c17', align: 'center', maxWidth: w - 60 }); if (b.sub) text(g, b.sub, 0, 92, { font: "'Oswald'", weight: 700, size: 58, color: '#8a1e1e', align: 'center', maxWidth: w - 60 }); g.restore();
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
  text(g, b.txt, 0, -18, { size: 92, color: '#d0281e' }); text(g, b.sub, 0, 62, { font: "'Oswald'", weight: 700, size: 54, color: '#d0281e' }); g.restore();
}
function bigNum(g, t, b, alpha) {
  const p = ezo(span(t, b.t0, 0.3)); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1330); g.scale(0.7 + 0.3 * p, 0.7 + 0.3 * p);
  text(g, b.txt, 0, 0, { font: b.txt.match(/^[0-9₹,]+$/) ? "'Oswald'" : ML, weight: 800, size: 170, color: '#f6d24a', stroke: '#2a1c17', strokeWidth: 24, maxWidth: 1000 });
  text(g, b.sub, 0, 150, { size: 64, color: '#ffffff', stroke: '#2a1c17', strokeWidth: 14, maxWidth: 980 }); g.restore();
}
function pie(g, t, t0, alpha) { // 4 of 5 figures go gold: the Gulf share
  const p = span(t, t0, 0.9); if (p <= 0) return; g.save(); g.globalAlpha = alpha * Math.min(1, p * 3); g.translate(W / 2, 1680);
  for (let i = 0; i < 5; i++) { const x = -360 + i * 180, on = i < 4 && p > 0.2 + i * 0.15; g.fillStyle = on ? '#f6d24a' : '#e8e2d4'; g.strokeStyle = '#2a1c17'; g.lineWidth = 7;
    g.beginPath(); g.arc(x, -50, 34, 0, 7); g.fill(); g.stroke(); g.beginPath(); g.moveTo(x - 50, 70); g.quadraticCurveTo(x - 50, -10, x, -10); g.quadraticCurveTo(x + 50, -10, x + 50, 70); g.closePath(); g.fill(); g.stroke(); }
  text(g, '5-ൽ 4 പേരും ഗൾഫിൽ', 0, 150, { size: 60, color: '#ffffff', stroke: '#2a1c17', strokeWidth: 12 }); g.restore(); }
function price(g, t, t0, alpha) { // oil price x4 chart
  const p = span(t, t0, 1.0); if (p <= 0) return; g.save(); g.globalAlpha = alpha * Math.min(1, p * 4); g.translate(W / 2, 1420);
  g.fillStyle = 'rgba(244,236,214,.95)'; g.strokeStyle = '#2a1c17'; g.lineWidth = 8; g.beginPath(); g.roundRect(-430, -230, 860, 460, 28); g.fill(); g.stroke();
  const bars = [[-200, 0.22, '1972'], [160, ezo(clamp((p - 0.2) / 0.6, 0, 1)) * 0.88 + 0.22 * (1 - ezo(clamp((p - 0.2) / 0.6, 0, 1))), '1974']];
  bars.forEach(([x, h, lab]) => { g.fillStyle = '#2a1c17'; g.fillRect(x - 70, 150 - h * 330, 140, h * 330); text(g, lab, x, 190, { font: "'Oswald'", weight: 700, size: 44, color: '#2a1c17' }); });
  text(g, 'എണ്ണവില ×4', 0, -180, { size: 66, color: '#8a1e1e' }); g.restore(); }
function coins(g, t, t0, alpha) { // 4 rupees, one glows: "from across the sea"
  const p = span(t, t0, 1.2); if (p <= 0) return; g.save(); g.globalAlpha = alpha * Math.min(1, p * 4); g.translate(W / 2, 1460);
  for (let i = 0; i < 4; i++) { const x = -330 + i * 220, pop = ezo(clamp(p * 4 - i * 0.6, 0, 1)), hot = i === 3 && p > 0.7; g.save(); g.translate(x, hot ? -30 * Math.sin(t * 6) : 0); g.scale(pop, pop);
    g.fillStyle = hot ? '#f6d24a' : '#d8d8dc'; g.strokeStyle = '#2a1c17'; g.lineWidth = 8; g.beginPath(); g.arc(0, 0, 90, 0, 7); g.fill(); g.stroke(); text(g, '₹1', 0, 4, { font: "'Oswald'", weight: 700, size: 76, color: '#2a1c17' }); g.restore(); }
  if (p > 0.7) text(g, '4-ൽ 1 കടലിനക്കരെ നിന്ന്', 0, 170, { size: 62, color: '#ffffff', stroke: '#2a1c17', strokeWidth: 12 }); g.restore(); }
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
export const hits = [];
export const extraHits = (timeline) => {
  const m = timeline.scenes.find((x) => x.id === 'main'), out = []; const s = { line: (i) => m.cues[i]?.text, cue: (i) => m.cues[i].start, cueEnd: (i) => m.cues[i].end };
  const sh = shots(s); sh.forEach((x, i) => { if (!i) return; const cut = sh[i - 1].set !== x.set; if (cut || i % 4 === 0) out.push({ t: m.start + x.a - 0.15, kind: 'whoosh', vol: cut ? 0.22 : 0.1 }); });
  const at = (i, n) => m.start + wt(s, i, n), add = (t, kind, vol) => out.push({ t, kind, vol });
  add(m.start + 0.05, 'chime', 0.25); add(at(0, 'കര') + 0.8, 'boom', 0.35); for (let k = 0; k < 4; k++) add(at(0, 'കര') + 0.9 + k * 0.25, 'thud', 0.22); add(at(0, '"ബാക്കി'), 'hit', 0.35); add(at(0, 'ദാസനും') + 0.6, 'pop', 0.4); add(at(0, 'ഇത്'), 'thud', 0.5); add(at(0, 'ആ നീന്തലാണ്'), 'chime', 0.35);
  add(at(1, 'നോക്കൂ'), 'pop', 0.3); add(m.start + s.cue(1) + 0.2, 'boom', 0.35); add(at(1, 'എഴുപത്തിമൂന്നിൽ'), 'tick', 0.35); add(at(1, 'നാലിരട്ടിയായി'), 'pop', 0.45); add(at(1, 'ഗൾഫ്'), 'chime', 0.35); add(at(1, 'പണിക്കാർ'), 'hit', 0.35);
  add(at(2, 'ചിരിച്ചു'), 'pop', 0.3); add(at(2, 'ഒട്ടകത്തെ'), 'hit', 0.35);
  add(at(3, 'കത്ത്'), 'pop', 0.3); add(at(3, 'ഡ്രാഫ്റ്റ്'), 'coin', 0.4); add(at(3, 'കൂളിംഗ്'), 'horn', 0.3); add(at(3, 'കൂളിംഗ്') + 0.7, 'thud', 0.3); add(at(3, 'കോൺക്രീറ്റ്'), 'boom', 0.4);
  add(at(4, 'ഇരുപത്തിരണ്ട്'), 'pop', 0.4); add(at(4, 'അഞ്ചിൽ'), 'tick', 0.35); add(at(4, 'രണ്ട് ലക്ഷത്തി'), 'boom', 0.45); for (let k = 0; k < 6; k++) add(at(4, 'രണ്ട് ലക്ഷത്തി') + 0.2 + k * 0.15, 'coin', 0.18);
  for (let k = 0; k < 4; k++) add(m.start + s.cue(5) + 0.2 + k * 0.3, 'coin', 0.25); add(at(5, 'ലൈറ്റ്'), 'chime', 0.3); add(at(5, 'ഫ്യൂസ്'), 'tick', 0.4);
  add(m.start + s.cue(6), 'hit', 0.35); add(at(6, 'ഉണ്ട്'), 'boom', 0.55); add(at(6, 'തൊണ്ണൂറിൽ'), 'thud', 0.45); add(at(6, 'ഒരു ലക്ഷത്തി'), 'horn', 0.3); add(at(6, 'ഒരു ലക്ഷത്തി') + 0.2, 'pop', 0.4);
  add(m.start + s.cue(7), 'chime', 0.25); add(at(7, 'ഗൾഫ് വീടുകളില്ല') + 0.3, 'thud', 0.4); add(at(7, 'അമ്മമാരില്ല'), 'whoosh', 0.25);
  add(at(8, 'പഠിപ്പുള്ള'), 'tick', 0.3); add(at(8, 'കിലോമീറ്ററുകൾ'), 'whoosh', 0.3);
  add(m.start + s.cue(9), 'chime', 0.2); add(at(9, 'കാത്തിരുന്നേനെ'), 'chime', 0.3);
  return out;
};
void H;
export const shotTimes = (timeline) => { const m = timeline.scenes.find((x) => x.id === 'main'); const s = { line: (i) => m.cues[i]?.text, cue: (i) => m.cues[i].start, cueEnd: (i) => m.cues[i].end }; return shots(s).map((x) => ({ a: m.start + x.a, b: m.start + x.b, set: x.set })); };
