// Colachel 1741 ("the king who captured Europe's captain"): kit formula. Hook (Van Imhoff's threat, the king's
// "I'll invade Europe" comeback), mockery (the Dutch laugh), escalation (landing, cannons, guns, army), our side
// (Nair warriors... and fishermen), the legend (palm-trunk cannons, night vallam blockade), siege + BOOM, surrender,
// wait...? (Dutch-Kerala map, dream), twist + analogy (losing captain becomes our coach), montage (forts, drills,
// Valiya Kappithan), quiet beat (Udayagiri tomb at dusk), callback ending (Europe's captain captured).
// Cast in ./cast.js, VOC ship in ./ship.js, beach dressing + fort set in ./sets.js; beach base from episodes/ml-bean.
const ML = "'Noto Malayalam'";
import { W, H, clamp, lerp } from '../../pipeline/engine.js';
function text(g, str, x, y, o = {}) { g.save(); let sz = o.size || 48; const f = () => `${o.weight || 800} ${sz}px ${o.font || ML}`; g.font = f(); if (o.maxWidth) while (g.measureText(str).width > o.maxWidth && sz > 12) { sz -= 2; g.font = f(); }
  g.textAlign = o.align || 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; if (o.stroke) { g.lineWidth = o.strokeWidth || sz * 0.15; g.strokeStyle = o.stroke; g.strokeText(str, x, y); } g.fillStyle = o.color || '#fff'; g.fillText(str, x, y); g.restore(); }
import { ALIGN } from './align.js';

let K = null, B = null, S = null, stage = null, camera = null, THREE = null, PROPS = null, MC = null;
const ez = (x) => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };
const ezo = (x) => 1 - Math.pow(1 - clamp(x, 0, 1), 3);
const span = (t, a, d) => clamp((t - a) / d, 0, 1);
const ALL = { beach: [], fort: [] };

export async function preload() {
  K = await import('../../pipeline/toon3d.js'); THREE = K.THREE; B = await import('../../pipeline/bean.js'); PROPS = B.PROPS;
  (await import('./cast.js')).registerCast(B);
  const base = await import('../ml-bean/sets.js'), my = await import('./sets.js');
  S = { beach: base.beachSet(), fort: my.fortSet(), map: { life: [] } };
  my.dressBeach(S.beach); buildBeach(); buildFort();
  MC = document.createElement('canvas'); MC.width = W; MC.height = H;
  stage = K.makeInkStage(W, H); camera = new THREE.PerspectiveCamera(52, W / H, 0.05, 900);
}

// ------------------------------------------------------------------ actors
function actor(set, who, x, z, y = 0, scale = 1) { const c = K.card(who, {}, { scale }); c.position.set(x, y, z); S[set].scene.add(c); const a = { c, who, last: '', seed: (Math.abs(x) * 13.1 + Math.abs(z) * 7.7) % 9, base: [x, y, z] }; ALL[set].push(a); return a; }
function pose(a, o, t) {
  a.c.visible = true; const blinkPh = (t + a.seed) % 3.1, blink = blinkPh < 0.12 ? 1 : 0; const o2 = { ...o, blink: o.blink ?? blink };
  if (typeof o2.propR === 'string') o2.propR = PROPS[o2.propR]; if (typeof o2.propL === 'string') o2.propL = PROPS[o2.propL];
  const key = JSON.stringify({ ...o, blink: o2.blink }); if (key !== a.last) { a.c.userData.set(o2); a.last = key; }
  const m = a.c.userData.cardMesh; m.rotation.z = Math.sin(t * 1.4 + a.seed) * 0.03 + (o.lean || 0); m.position.y = Math.abs(Math.sin(t * 2.8 + a.seed)) * 0.012 + (o.hop || 0);
}
const fakesOn = () => S.beach.fakes.forEach((c) => { c.visible = true; });
const hopAt = (t, k = 7, amt = 0.08, ph = 0) => Math.max(0, Math.sin(t * k + ph)) * amt;

function buildBeach() {
  const b = S.beach;
  b.imhoff = actor('beach', 'imhoff', 0.3, -4.6); b.lannoy = actor('beach', 'lannoy', -1.3, -5.2);
  b.dsold = [[-3.4, -8.0], [-2.2, -8.4], [-1.0, -8.0], [0.6, -8.4], [1.9, -8.0], [3.1, -8.4]].map(([x, z]) => actor('beach', 'dutchSoldier', x, z));
  b.king = actor('beach', 'maharaja', -0.3, 1.4);
  b.nairs = [[-1.6, 0.7], [0.9, 0.6], [2.0, 1.1], [-2.6, 1.3]].map(([x, z]) => actor('beach', 'nair', x, z));
  b.fishers = [actor('beach', 'fisher2', 2.9, 1.9), actor('beach', 'fisher', 3.8, 1.3), actor('beach', 'diver', -3.6, 2.0)];
  b.pris = actor('beach', 'lannoyPrisoner', 0.3, -2.8); b.guards = [actor('beach', 'nair', -0.6, -2.6), actor('beach', 'nair', 1.2, -2.6)];
  b.kap = actor('beach', 'kappithan', 0.9, 1.7); b.kannan = actor('beach', 'kannan', 0.4, 2.8);
  b.riders = [actor('beach', 'fisher2', 0, 0), actor('beach', 'diver', 0, 0), actor('beach', 'fisher', 0, 0)];
  b.ball.scale.setScalar(1.7); b.trail = []; for (let k = 0; k < 5; k++) { const m = K.mesh(new THREE.SphereGeometry(0.07 + k * 0.02, 10, 8), new THREE.MeshLambertMaterial({ color: 0xd8d4cc }), { shadow: false }); m.visible = false; b.scene.add(m); b.trail.push(m); }
  b.extras = [b.pris, ...b.guards, b.kap, b.kannan, ...b.riders];
}
function buildFort() {
  const f = S.fort;
  f.king = actor('fort', 'maharaja', 0, -4.5, 0.6); f.ram = actor('fort', 'ramayyan', 1.5, -4.4, 0.6);
  f.pris = actor('fort', 'lannoyPrisoner', 0, -1.6); f.kap = actor('fort', 'kappithan', 0, -1.6);
  f.guards = [actor('fort', 'nair', -1.2, -1.3), actor('fort', 'nair', 1.2, -1.3)];
  f.drill = []; for (let r = 0; r < 2; r++) for (let k = 0; k < 4; k++) f.drill.push(actor('fort', 'nair', -2.4 + k * 1.6 + r * 0.4, 1.2 + r * 1.4));
}

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
const STORE = [4.5, 0, -8.5];
function resetProps() {
  const b = S.beach, f = S.fort;
  ALL.beach.forEach((a) => { a.c.position.set(...a.base); a.c.visible = true; }); ALL.fort.forEach((a) => { a.c.position.set(...a.base); a.c.visible = true; });
  b.extras.forEach((a) => { a.c.visible = false; }); f.kap.c.visible = false; f.drill.forEach((a) => { a.c.visible = false; });
  b.fleet.forEach((s) => { s.visible = false; }); b.rowboats.forEach((r, k) => { r.position.set(-1.5 + k * 3.4, 0, -9 - k); });
  b.fakes.forEach((c, k) => { c.position.set(-3.2 + k * 1.6, 0, 3.6); c.visible = false; }); b.trail.forEach((m) => { m.visible = false; }); b.cannons.forEach((c) => { c.scale.setScalar(1); c.visible = true; });
  b.store.visible = true; b.boom.forEach((m) => { m.visible = false; }); b.smoke.forEach((m) => { m.visible = false; }); b.ball.visible = false;
  b.night.forEach((v) => { v.visible = false; }); b.torches.forEach((v) => { v.visible = false; }); b.white.visible = false; b.whiteF.position.y = 2.3;
  f.walls.position.y = 0; OV = {};
}
// crowds
function dutch(t, mode) {
  const b = S.beach, laugh = mode === 'laugh', scared = mode === 'scared', give = mode === 'give', bored = mode === 'bored';
  b.dsold.forEach((a, i) => pose(a, { expr: laugh ? (i % 2 ? 'laugh' : 'grin') : scared ? 'nervous' : give ? 'shock' : bored ? (i % 2 ? 'bored' : 'nervous') : 'stern', L: laugh ? (i % 2 ? 'mouth' : 'point') : give ? 'up' : 'hang', R: give ? 'up' : 'rifle', propR: give ? null : 'musket',
    lean: laugh ? Math.sin(t * 9 + i) * 0.06 : 0, hop: laugh ? hopAt(t, 8, 0.05, i) : give ? hopAt(t, 3, 0.02, i) : 0, look: -0.2 }, t));
  pose(b.lannoy, { expr: laugh ? 'grin' : scared ? 'nervous' : give ? 'sad' : 'smug', L: 'hip', R: scared ? 'scope' : give ? 'up' : 'holdUp', propR: give || scared ? null : 'sword', look: 0.4 }, t);
}
function ours(t, mode) {
  const b = S.beach, cheer = mode === 'cheer', ready = mode === 'ready';
  pose(b.king, { expr: cheer ? 'beam' : 'proud', L: 'hip', R: cheer ? 'up' : 'holdUp', propR: 'sword', look: -0.3, hop: cheer ? hopAt(t, 6, 0.05) : 0 }, t);
  b.nairs.forEach((a, i) => pose(a, { expr: cheer ? (i % 2 ? 'laugh' : 'beam') : ready ? (i % 2 ? 'angry' : 'stern') : 'stern', R: cheer || ready ? 'up' : 'holdUp', propR: 'sword', L: 'hold', propL: 'shield', look: -0.4, hop: cheer || ready ? hopAt(t, 7, 0.06, i * 1.4) : 0 }, t));
  b.fishers.forEach((a, i) => pose(a, { expr: cheer ? 'laugh' : ['grin', 'proud', 'sly'][i], R: i === 2 ? 'wave' : 'hold', propR: i === 2 ? null : 'oar', L: cheer ? 'up' : 'hip', look: -0.4, hop: cheer ? hopAt(t, 8, 0.07, i) : 0 }, t));
}
function boom(t, t0) {
  const b = S.beach, u = t - t0; if (u < 0) return; b.store.visible = u < 0.12;
  b.boom.forEach((m, k) => { const d = m.userData.d, grow = ezo(u / 0.35), fade = u < 0.9 ? 1 : Math.max(0, 1 - (u - 0.9) / 0.8); m.visible = fade > 0.02; m.scale.setScalar((0.6 + (k % 3) * 0.45) * grow * fade + 0.01); m.position.set(STORE[0] + d[0] * (0.4 + grow), d[1] * (0.6 + grow * 1.2), STORE[2] + d[2] * (0.4 + grow)); });
  b.smoke.forEach((m, k) => { const v = u - 0.15 - k * 0.04; m.visible = v > 0; if (!m.visible) return; m.scale.setScalar(0.7 + v * 0.9); m.position.set(STORE[0] + Math.sin(k * 2.1) * (0.8 + v * 0.5), 1.2 + v * 2.2 + (k % 3) * 0.6, STORE[2] + Math.cos(k * 1.3) * 0.8); m.material.opacity = Math.max(0, 0.85 - v * 0.18); });
}
const arcAt = (u) => [lerp(-1, STORE[0], u), 1.4 + Math.sin(u * Math.PI) * 5.5 - u * 0.2, lerp(1.0, STORE[2], u)];
function ballArc(t, t0, t1) { const b = S.beach, u = (t - t0) / (t1 - t0); if (u < 0 || u > 1) return; b.ball.visible = true; b.ball.position.set(...arcAt(u)); b.trail.forEach((m, k) => { const v = u - (k + 1) * 0.035; m.visible = v > 0; if (v > 0) m.position.set(...arcAt(v)); }); }
function nightRing(t, t0, r0, r1) {
  ALL.beach.forEach((a) => { a.c.visible = false; });
  const b = S.beach, cx = 8, cz = -34, R = lerp(r0, r1, ezo(span(t, t0, 2.2)));
  b.night.forEach((v, k) => { const ang = k / 8 * Math.PI * 2 + t * 0.12, x = cx + Math.cos(ang) * R, z = cz + Math.sin(ang) * Math.min(13, R); v.visible = true; v.position.set(x, 0.05 + Math.sin(t * 2 + k) * 0.08, z); v.rotation.y = -ang; b.torches[k].visible = true; b.torches[k].position.set(x + 1.2 * Math.cos(-ang), 1.5, z - 1.2 * Math.sin(-ang)); b.torches[k].scale.setScalar(1 + Math.sin(t * 13 + k * 3) * 0.15); });
  // fishermen riding the three nearest boats
  const near = b.night.map((v, k) => [v.position.z, k]).sort((p, q) => q[0] - p[0]).slice(0, 3);
  b.riders.forEach((a, i) => { const v = b.night[near[i][1]]; a.c.position.set(v.position.x, 0.25, v.position.z); pose(a, { expr: ['sly', 'grin', 'stern'][i], R: i === 1 ? 'point' : 'hold', propR: i === 1 ? null : 'oar', L: 'hang', look: 0.5, hop: hopAt(t, 2, 0.03, i) }, t); });
}
function fortCourt(t, mode) {
  const f = S.fort, kap = mode === 'kap' || mode === 'cheer';
  pose(f.king, { expr: mode === 'coach' ? 'grin' : mode === 'cheer' ? 'beam' : 'smug', L: 'hip', R: mode === 'coach' ? 'holdUp' : mode === 'cheer' ? 'up' : 'chin', propR: mode === 'coach' ? 'whistle' : null, look: 0 }, t);
  pose(f.ram, { expr: mode === 'coach' ? 'shock' : mode === 'cheer' ? 'beam' : 'stern', L: mode === 'coach' ? 'mouth' : 'hang', R: 'hang', look: -1 }, t);
  if (kap) { f.pris.c.visible = false; pose(f.kap, { expr: 'proud', L: 'hip', R: mode === 'cheer' ? 'up' : 'hold', propR: mode === 'cheer' ? 'sword' : 'whistle', look: 0, hop: mode === 'cheer' ? hopAt(t, 6, 0.05) : 0 }, t); }
  else pose(f.pris, { expr: mode === 'coach' ? 'shock' : 'sad', L: 'hang', R: 'hang', look: 0, lookY: mode === 'coach' ? 0 : 1 }, t);
  f.guards.forEach((a, i) => pose(a, { expr: mode === 'cheer' ? 'beam' : mode === 'coach' ? 'shock' : 'stern', R: mode === 'cheer' ? 'up' : 'holdUp', propR: 'sword', L: 'hold', propL: 'shield', look: i ? -1 : 1, hop: mode === 'cheer' ? hopAt(t, 7, 0.06, i) : 0 }, t));
}

// ------------------------------------------------------------------ shots
function shots(s) { return tidy(rawShots(s)); }
function rawShots(s) {
  const L = (i) => s.cue(i), w = (i, n) => wt(s, i, n);
  const BCH = (k) => ({ set: 'beach', ...k }), FRT = (k) => ({ set: 'fort', ...k }), MAP = (k) => ({ set: 'map', keys: [[0, [0, 0, 1], [0, 0, 0]]], ...k });
  const w0D = w(0, 'ഡച്ച്'), w0Bh = w(0, 'ഭീഷണിപ്പെടുത്തി'), w0Yu = w(0, '"യുദ്ധം'), w0Ra = w(0, 'രാജാവിന്റെ'), w0Nj = w(0, '"ഞാനൊരു'), w0Eu = w(0, 'യൂറോപ്പ്');
  const w1Nok = w(1, 'നോക്കൂ,'), w1Kach = w(1, 'കച്ചവട');
  const w2Pir = w(2, 'പീരങ്കികൾ.'), w2Tho = w(2, 'തോക്കുകൾ.'), w2Yur = w(2, 'യൂറോപ്യൻ');
  const w3Nair = w(3, 'നായർ'), w3Pin = w(3, 'പിന്നെ');
  const w4Muk = w(4, 'മുക്കുവന്മാർ'), w4Vya = w(4, 'വ്യാജ'), w4Nir = w(4, 'നിരത്തി.'), w4Che = w(4, 'ചെറുവള്ളങ്ങളിൽ'), w4Val = w(4, 'വളഞ്ഞ്');
  const w5Odu = w(5, 'ഒടുവിൽ'), w5Pir = w(5, 'പീരങ്കിയുണ്ട'), w5Ved = w(5, 'വെടിമരുന്ന്'), w5Che = w(5, 'ചെന്നുവീണു.'), w5Boom = w(5, 'ബൂം!');
  const w6Dut = w(6, 'ഡച്ചുകാർ'), w6Ava = w(6, 'അവരുടെ'), w6Lan = w(6, 'ലനോയ്'), w6Tad = w(6, 'തടവുകാരനായി.');
  const w7Ann = w(7, 'അന്ന്'), w7Ker = w(7, 'കേരളം,'), w7Ind = w(7, 'ഇന്തോനേഷ്യയെപ്പോലെ,'), w7Nur = w(7, 'നൂറ്റാണ്ടുകളോളം');
  const w8Tho = w(8, 'തോറ്റ'), w8Tad = w(8, 'തടവുകാരനെ'), w8Thal = w(8, 'തലവനാക്കി!');
  const w9Sai = w(9, 'സൈന്യത്തെ'), w9Thi = w(9, 'തിരുവിതാംകൂറിന്റെ'), w9Val = w(9, '"വലിയ');
  const w10Inn = w(10, 'ഇന്നും');
  const w11Pak = w(11, 'പക്ഷേ'), w11Pid = w(11, 'പിടിച്ചു!');
  return [
    // ---- 1. HOOK: 1741, the Dutch governor threatens; the king's comeback
    BCH({ a: 0, b: w0D - 0.1, keys: [[0, [1.4, 1.5, 3.2], [2, 4, -34], 0.05, 50], [0.35, [1.1, 1.6, 2.6], [2, 4.5, -34], 0.02, 50], [3, [0.8, 1.7, 2.0], [2, 5, -34], -0.02, 52]],
      act: (t) => { const b = S.beach; dutch(t, 'stern'); [b.king, ...b.nairs, ...b.fishers].forEach((a) => { a.c.visible = false; }); pose(b.imhoff, { expr: 'stern', L: 'hip', R: 'holdUp', propR: 'scroll', look: 0.3 }, t); OV.count = { txt: '1741', sub: 'കുളച്ചൽ', t0: 0.1 }; } }),
    BCH({ a: w0D - 0.1, b: w0Bh - 0.1, keys: [[0, [1.1, 1.55, -1.9], [0.3, 1.35, -4.6], 0.04, 46], [0.35, [0.95, 1.55, -2.3], [0.3, 1.38, -4.6], 0.02, 46], [2.2, [0.85, 1.55, -2.6], [0.3, 1.4, -4.6], -0.02, 46]],
      act: (t) => { dutch(t, 'stern'); pose(S.beach.imhoff, { expr: 'smug', L: 'hip', R: 'holdUp', propR: 'scroll', look: 0.3 }, t); OV.tag = { t0: w0D, txt: 'വാൻ ഇംഹോഫ്', sub: 'DUTCH GOVERNOR' }; } }),
    BCH({ a: w0Bh - 0.1, b: w0Yu - 0.1, shake: w0Bh + 0.45, keys: [[0, [0.15, 0.95, -2.4], [0.3, 1.5, -4.6], -0.05, 50], [0.35, [0.2, 0.95, -2.7], [0.3, 1.5, -4.6], -0.02, 50], [2, [0.25, 0.95, -2.9], [0.3, 1.5, -4.6], 0.02, 48]],
      act: (t) => { const slam = t > w0Bh + 0.4; dutch(t, 'stern'); pose(S.beach.imhoff, { expr: slam ? 'angry' : 'stern', L: 'hip', R: slam ? 'point' : 'up', propR: 'scroll', look: 0.3, hop: slam && t < w0Bh + 0.6 ? -0.04 : 0 }, t); } }),
    BCH({ a: w0Yu - 0.1, b: w0Ra - 0.1, shake: w0Yu + 0.05, keys: [[0, [0.6, 1.5, -2.7], [0.3, 1.45, -4.6], 0.04, 42], [0.3, [0.55, 1.5, -2.9], [0.3, 1.45, -4.6], 0.02, 42], [2, [0.5, 1.5, -3.0], [0.3, 1.45, -4.6], -0.02, 40]],
      act: (t) => { dutch(t, 'stern'); pose(S.beach.imhoff, { expr: 'angry', L: 'fist', R: 'point', propR: 'scroll', look: 0.3 }, t); OV.badge = { t0: w0Yu, txt: 'യുദ്ധം വേണോ?', sub: 'WANT A WAR?' }; } }),
    FRT({ a: w0Ra - 0.1, b: w0Nj - 0.1, keys: [[0, [1.2, 1.8, -0.2], [0.2, 1.75, -4.6], 0.04, 50], [0.35, [1.0, 1.8, -0.7], [0.2, 1.75, -4.6], 0.02, 48], [2, [0.9, 1.8, -1.0], [0.2, 1.75, -4.6], -0.02, 48]],
      act: (t) => { fortCourt(t, 'calm'); S.fort.pris.c.visible = false; S.fort.guards.forEach((a) => { a.c.visible = false; }); OV.tag = { t0: w0Ra, txt: 'മാർത്താണ്ഡവർമ്മ', sub: 'KING OF TRAVANCORE' }; } }),
    FRT({ a: w0Nj - 0.1, b: w0Eu - 0.1, keys: [[0, [0.3, 2.0, -2.5], [0, 1.95, -4.5], -0.04, 42], [0.35, [0.28, 2.0, -2.7], [0, 1.95, -4.5], -0.02, 42], [2, [0.25, 2.0, -2.8], [0, 1.95, -4.5], 0.02, 40]],
      act: (t) => { fortCourt(t, 'calm'); pose(S.fort.king, { expr: 'sly', L: 'hip', R: 'point', look: 0 }, t); S.fort.pris.c.visible = false; S.fort.guards.forEach((a) => { a.c.visible = false; }); } }),
    FRT({ a: w0Eu - 0.1, b: L(1), shake: w0Eu + 0.1, keys: [[0, [0.9, 1.95, 0.6], [0.75, 1.75, -4.5], 0.05, 46], [0.35, [0.85, 1.95, 0.2], [0.75, 1.75, -4.5], 0.02, 46], [2, [0.8, 1.95, -0.1], [0.75, 1.75, -4.5], -0.02, 44]],
      act: (t) => { const f = S.fort; pose(f.king, { expr: 'laugh', L: 'hip', R: 'up', look: 0, lean: Math.sin(t * 8) * 0.04 }, t); pose(f.ram, { expr: 'shock', L: 'mouth', R: 'hang', look: -1, hop: t < w0Eu + 0.4 ? 0.06 : 0 }, t); f.pris.c.visible = false; f.guards.forEach((a) => { a.c.visible = false; });
        OV.badge = { t0: w0Eu + 0.1, txt: 'യൂറോപ്പ് പിടിക്കും!', sub: 'INVADE EUROPE?!' }; } }),
    // ---- 2. MOCKERY: the Dutch laugh; YOU SEE: the world's biggest trading empire
    BCH({ a: L(1), b: w1Nok - 0.1, keys: [[0, [-0.3, 1.5, -1.6], [0, 1.4, -6.5], -0.04, 52], [0.35, [-0.25, 1.5, -2.0], [0, 1.4, -6.5], -0.01, 52], [2, [-0.2, 1.5, -2.3], [0, 1.4, -6.5], 0.02, 50]],
      act: (t) => { dutch(t, 'laugh'); pose(S.beach.imhoff, { expr: 'laugh', L: 'mouth', R: 'point', propR: 'scroll', look: 0.3, lean: Math.sin(t * 8) * 0.05 }, t); } }),
    BCH({ a: w1Nok - 0.1, b: L(2), keys: [[0, [0, 22, 10], [0, 0, -44], 0.03, 52], [0.4, [-1, 23, 9], [0, 0, -46], 0.02, 52], [3, [-3, 25, 7], [2, 0, -50], -0.02, 54]],
      act: (t) => { dutch(t, 'stern'); S.beach.fleet.forEach((s) => { s.visible = true; }); OV.badge = { t0: w1Kach - 0.1, txt: 'ഏറ്റവും വലിയ കച്ചവട സാമ്രാജ്യം', sub: 'VOC · DUTCH EAST INDIA CO.' }; } }),
    // ---- 3. ESCALATION: they land at Colachel. Cannons. Guns. A European army.
    BCH({ a: L(2), b: w2Pir - 0.25, keys: [[0, [3.2, 1.6, -1.6], [0, 1.0, -13], 0.04, 50], [0.35, [3.0, 1.6, -2.1], [0, 1.0, -13], 0.02, 50], [2.5, [2.8, 1.6, -2.6], [0, 1.0, -13], -0.02, 50]],
      act: (t, tt, sh) => { const b = S.beach, u = ezo(span(t, sh.a - 0.3, 2.4)); b.rowboats.forEach((r, k) => { r.position.z = lerp(-19 - k, -10 - k, u); });
        b.dsold.forEach((a, i) => { a.c.position.z = a.base[2] - 3 * (1 - ezo(span(t, sh.a + 0.2 + i * 0.12, 1.6))); pose(a, { expr: 'stern', R: 'rifle', propR: 'musket', L: 'hang', walk: span(t, sh.a + 0.2 + i * 0.12, 1.6) < 1 ? (t * 1.4 + i * 0.3) % 1 : 0 }, t); });
        pose(b.lannoy, { expr: 'smug', L: 'hip', R: 'holdUp', propR: 'sword', look: 0.4 }, t); b.imhoff.c.visible = false; } }),
    BCH({ a: w2Pir - 0.25, b: w2Tho - 0.1, keys: [[0, [2.4, 0.85, -5.0], [-0.6, 0.5, -7.2], 0.05, 50], [0.3, [2.3, 0.85, -5.2], [-0.6, 0.5, -7.2], 0.02, 50], [2, [2.2, 0.85, -5.4], [-0.6, 0.5, -7.2], -0.02, 50]],
      act: (t) => { dutch(t, 'stern'); S.beach.imhoff.c.visible = false; S.beach.cannons.forEach((c, k) => { const p = span(t, w2Pir + k * 0.12, 0.3); c.scale.setScalar(Math.max(0.01, ezo(p) * (1 + Math.sin(p * Math.PI) * 0.25))); }); OV.word = { t0: w2Pir, txt: 'പീരങ്കികൾ' }; } }),
    BCH({ a: w2Tho - 0.1, b: w2Yur - 0.1, keys: [[0, [-0.6, 1.45, -5.4], [-1.2, 1.45, -8.2], -0.04, 44], [0.3, [-0.6, 1.45, -5.6], [-1.2, 1.45, -8.2], -0.02, 44], [2, [-0.6, 1.45, -5.7], [-1.2, 1.45, -8.2], 0.02, 42]],
      act: (t) => { dutch(t, 'stern'); S.beach.imhoff.c.visible = false; S.beach.dsold.forEach((a, i) => pose(a, { expr: i % 2 ? 'angry' : 'stern', R: 'scope', propR: 'musket', L: 'hang', look: 0.2 }, t)); OV.word = { t0: w2Tho, txt: 'തോക്കുകൾ' }; } }),
    BCH({ a: w2Yur - 0.1, b: L(3), keys: [[0, [0.2, 0.6, 0.6], [0, 1.7, -8], 0.04, 52], [0.35, [0.2, 0.65, 0.2], [0, 1.7, -8], 0.02, 52], [2, [0.2, 0.7, -0.2], [0, 1.75, -8], -0.02, 52]],
      act: (t) => { dutch(t, 'stern'); pose(S.beach.imhoff, { expr: 'smug', L: 'hip', R: 'point', propR: 'scroll', look: 0.3 }, t); S.beach.fakes.forEach((c) => { c.visible = false; }); OV.word = { t0: w2Yur, txt: 'യൂറോപ്യൻ പട്ടാളം' }; } }),
    // ---- 4. OUR SIDE: Nair warriors... and the fishermen
    BCH({ a: L(3), b: w3Nair - 0.1, keys: [[0, [0.3, 1.65, 4.2], [-0.3, 1.55, 1.4], 0.04, 44], [0.35, [0.25, 1.65, 3.9], [-0.3, 1.55, 1.4], 0.02, 44], [2, [0.2, 1.65, 3.7], [-0.3, 1.55, 1.4], -0.02, 42]],
      act: (t) => { ours(t, 'calm'); pose(S.beach.king, { expr: 'smug', L: 'hip', R: 'holdUp', propR: 'sword', look: 0 }, t); } }),
    BCH({ a: w3Nair - 0.1, b: w3Pin - 0.1, shake: w3Nair + 0.1, keys: [[0, [0, 1.2, 5.2], [0, 1.4, 0.8], -0.04, 52], [0.35, [0, 1.2, 4.8], [0, 1.4, 0.8], -0.01, 52], [2, [0, 1.2, 4.6], [0, 1.45, 0.8], 0.02, 50]],
      act: (t) => ours(t, 'ready') }),
    BCH({ a: w3Pin - 0.1, b: L(4), keys: [[0, [3.7, 1.5, 4.6], [3.3, 1.35, 1.6], 0.05, 44], [0.35, [3.6, 1.5, 4.4], [3.3, 1.35, 1.6], 0.02, 44], [2, [3.55, 1.5, 4.3], [3.3, 1.35, 1.6], -0.02, 42]],
      act: (t) => { ours(t, 'calm'); S.beach.fishers.forEach((a, i) => pose(a, { expr: i ? 'proud' : 'beam', R: 'hold', propR: 'oar', L: i ? 'hip' : 'thumb', look: 0, hop: hopAt(t, 5, 0.04, i) }, t)); } }),
    // ---- 5. THE LEGEND: palm-trunk cannons; vallams block the ships at night
    BCH({ a: L(4), b: w4Muk + 0.3, keys: [[0, [1.0, 1.5, 5.2], [2.4, 1.3, 1.6], -0.04, 46], [0.35, [1.2, 1.5, 4.9], [2.4, 1.3, 1.6], -0.02, 46], [2, [1.3, 1.5, 4.7], [2.4, 1.3, 1.6], 0.02, 44]],
      act: (t) => { ours(t, 'calm'); S.beach.fishers.forEach((a, i) => pose(a, { expr: 'sly', R: i === 1 ? 'chin' : 'mouth', L: 'hip', look: i === 2 ? 1 : -1 }, t)); OV.badge = { t0: L(4) + 0.05, txt: 'ഐതിഹ്യം', sub: 'THE STORY GOES...' }; } }),
    BCH({ a: w4Muk + 0.3, b: w4Vya - 0.1, keys: [[0, [3.0, 1.1, 7.2], [0.4, 0.8, 3.6], 0.04, 50], [0.35, [2.8, 1.1, 6.9], [0.4, 0.8, 3.6], 0.02, 50], [2.5, [2.5, 1.1, 6.6], [0.3, 0.8, 3.6], -0.02, 50]],
      act: (t, tt, sh) => { ours(t, 'calm'); fakesOn(); S.beach.fakes.forEach((c, k) => { const u = ezo(span(t, sh.a + (4 - k) * 0.12, 0.6)); c.position.x = -3.2 + k * 1.6 + (1 - u) * 9; }); } }),
    BCH({ a: w4Vya - 0.1, b: w4Nir - 0.1, keys: [[0, [-5.2, 0.7, 5.6], [0, 0.85, 3.5], 0.03, 46], [0.35, [-5.0, 0.72, 5.4], [0, 0.85, 3.5], 0.01, 46], [2, [-4.9, 0.75, 5.3], [0, 0.85, 3.5], -0.02, 46]],
      act: (t) => { ours(t, 'calm'); fakesOn(); OV.word = { t0: w4Vya, txt: 'വ്യാജ പീരങ്കി!' }; } }),
    BCH({ a: w4Nir - 0.1, b: w4Che - 0.1, keys: [[0, [-0.8, 1.6, -2.7], [-1.3, 1.55, -5.2], 0.04, 42], [0.35, [-0.85, 1.6, -2.9], [-1.3, 1.55, -5.2], 0.02, 42], [2, [-0.9, 1.6, -3.0], [-1.3, 1.55, -5.2], -0.02, 40]],
      act: (t) => { dutch(t, 'scared'); } }),
    BCH({ a: w4Che - 0.1, b: w4Val - 0.1, night: true, keys: [[0, [12, 20, -4], [8, 0, -30], 0.04, 52], [0.4, [11.6, 21, -4.5], [8, 0, -30], 0.02, 52], [2.5, [11, 22.5, -5.5], [8, 0, -31], -0.02, 52]],
      act: (t, tt, sh) => { nightRing(t, sh.a, 19, 15); } }),
    BCH({ a: w4Val - 0.1, b: L(5), night: true, keys: [[0, [8, 52, -10], [8, 0, -34], 0.02, 50], [0.4, [8, 54, -9.5], [8, 0, -34], 0.01, 50], [3, [7.5, 58, -8.5], [8, 0, -34], -0.02, 52]],
      act: (t, tt, sh) => { nightRing(t, sh.a - 1.5, 15, 13.5); } }),
    // ---- 6. SIEGE for months... then one cannonball hits the powder store. BOOM!
    BCH({ a: L(5), b: w5Odu - 0.1, keys: [[0, [0.9, 1.5, -3.4], [0, 1.35, -8.2], 0.03, 48], [0.35, [0.8, 1.5, -3.7], [0, 1.35, -8.2], 0.01, 48], [2, [0.7, 1.5, -3.9], [0, 1.35, -8.2], -0.02, 48]],
      act: (t) => { dutch(t, 'bored'); S.beach.imhoff.c.visible = false; OV.cal = { t0: L(5) + 0.05, t1: w5Odu - 0.3 }; } }),
    BCH({ a: w5Odu - 0.1, b: w5Ved - 0.1, keys: [[0, [-4.6, 2.4, 8.4], [-1, 3.4, -2], 0.04, 56], [0.35, [-4.4, 2.5, 8.0], [0, 4.2, -3.5], 0.02, 56], [2.5, [-4.0, 2.6, 7.4], [2, 4.2, -6], -0.02, 56]],
      act: (t) => { ours(t, 'ready'); fakesOn(); ballArc(t, w5Pir - 0.2, w5Che + 0.1); } }),
    BCH({ a: w5Ved - 0.1, b: w5Boom - 0.05, keys: [[0, [2.0, 1.7, -3.2], [4.5, 1.2, -8.5], 0.04, 46], [0.35, [2.1, 1.7, -3.5], [4.5, 1.2, -8.5], 0.02, 46], [2, [2.2, 1.7, -3.7], [4.5, 1.2, -8.5], -0.02, 46]],
      act: (t) => { dutch(t, 'scared'); ballArc(t, w5Pir - 0.2, w5Che + 0.1); } }),
    BCH({ a: w5Boom - 0.05, b: L(6), shake: w5Boom, flash: w5Boom + 0.27, keys: [[0, [-0.6, 2.2, 0.4], [3.5, 2.6, -8.5], 0.06, 54], [0.4, [-0.9, 2.4, 0.9], [3.5, 3.0, -8.5], 0.02, 56], [2, [-1.1, 2.6, 1.3], [3.5, 3.2, -8.5], -0.02, 58]],
      act: (t) => { dutch(t, 'scared'); boom(t, w5Boom); } }),
    // ---- 7. 10 AUGUST: surrender. Captain De Lannoy taken prisoner.
    BCH({ a: L(6), b: w6Dut - 0.1, keys: [[0, [1.5, 1.5, -3.0], [0.3, 2.0, -6.2], 0.04, 46], [0.35, [1.4, 1.5, -3.3], [0.3, 2.0, -6.2], 0.02, 46], [2, [1.3, 1.5, -3.5], [0.3, 2.1, -6.2], -0.02, 46]],
      act: (t, tt, sh) => { dutch(t, 'give'); S.beach.imhoff.c.visible = false; boom(t, sh.a - 3); S.beach.white.visible = true; OV.count = { txt: '10', sub: 'ഓഗസ്റ്റ് 1741', t0: L(6) + 0.1 }; } }),
    BCH({ a: w6Dut - 0.1, b: w6Ava - 0.1, keys: [[0, [0, 1.6, -4.0], [0, 1.4, -8.2], -0.04, 50], [0.35, [0, 1.6, -4.3], [0, 1.4, -8.2], -0.01, 50], [2, [0, 1.6, -4.5], [0, 1.45, -8.2], 0.02, 50]],
      act: (t, tt, sh) => { dutch(t, 'give'); S.beach.imhoff.c.visible = false; S.beach.white.visible = true; S.beach.whiteF.position.y = lerp(0.8, 2.3, ezo(span(t, sh.a, 0.8))); boom(t, sh.a - 5); } }),
    BCH({ a: w6Ava - 0.1, b: w6Tad - 0.1, keys: [[0, [-0.85, 1.6, -2.8], [-1.3, 1.55, -5.2], 0.04, 40], [0.35, [-0.9, 1.6, -3.0], [-1.3, 1.55, -5.2], 0.02, 40], [2, [-0.95, 1.6, -3.1], [-1.3, 1.55, -5.2], -0.02, 38]],
      act: (t) => { dutch(t, 'give'); S.beach.imhoff.c.visible = false; S.beach.white.visible = true; OV.tag = { t0: w6Lan - 0.2, txt: 'ഡി ലനോയ്', sub: 'DUTCH CAPTAIN' }; } }),
    BCH({ a: w6Tad - 0.1, b: L(7), shake: w6Tad + 0.05, keys: [[0, [0.7, 1.5, -0.3], [0.3, 1.4, -2.8], 0.04, 48], [0.35, [0.65, 1.5, -0.6], [0.3, 1.4, -2.8], 0.02, 48], [2, [0.6, 1.5, -0.8], [0.3, 1.4, -2.8], -0.02, 46]],
      act: (t) => { const b = S.beach; dutch(t, 'give'); b.imhoff.c.visible = false; b.lannoy.c.visible = false; b.white.visible = true; pose(b.pris, { expr: 'sad', L: 'hang', R: 'hang', look: 0, lookY: 1 }, t); b.guards.forEach((a, i) => pose(a, { expr: 'stern', R: 'holdUp', propR: 'sword', L: 'hold', propL: 'shield', look: i ? -1 : 1 }, t)); } }),
    // ---- 8. WAIT...? what if the Dutch had won? (dream: a Dutch Kerala)
    BCH({ a: L(7), b: w7Ann - 0.1, dream: true, keys: [[0, [1.3, 1.75, 6.6], [0.4, 1.5, 2.8], -0.03, 42], [0.4, [1.2, 1.72, 6.2], [0.4, 1.5, 2.8], -0.01, 40], [2.5, [1.1, 1.7, 6.0], [0.4, 1.5, 2.8], 0.02, 40]],
      act: (t) => { const b = S.beach; ours(t, 'calm'); pose(b.kannan, { expr: 'think', L: 'chin', R: 'hip', look: 0.4, lookY: -1 }, t); } }),
    BCH({ a: w7Ann - 0.1, b: w7Ker - 0.1, dream: true, keys: [[0, [0.8, 1.5, -1.6], [0.3, 1.45, -4.8], 0.04, 46], [0.35, [0.75, 1.5, -1.9], [0.3, 1.45, -4.8], 0.02, 46], [2, [0.7, 1.5, -2.1], [0.3, 1.45, -4.8], -0.02, 46]],
      act: (t) => { dutch(t, 'laugh'); pose(S.beach.imhoff, { expr: 'laugh', L: 'up', R: 'up', propR: 'scroll', look: 0.3, hop: hopAt(t, 6, 0.06) }, t); } }),
    MAP({ a: w7Ker - 0.1, b: L(8), dream: true, act: (t, tt, sh) => { OV.map = { t0: sh.a, ind: w7Ind, nur: w7Nur }; } }),
    // ---- 9. TWIST + ANALOGY: the losing team's captain becomes our coach... the prisoner becomes the army chief
    FRT({ a: L(8), b: w8Tho - 0.1, keys: [[0, [0.4, 2.5, 2.8], [0, 1.5, -3.6], 0.04, 50], [0.35, [0.35, 2.5, 2.4], [0, 1.5, -3.6], 0.02, 50], [2.2, [0.3, 2.5, 2.1], [0, 1.55, -3.6], -0.02, 50]],
      act: (t) => fortCourt(t, 'calm') }),
    FRT({ a: w8Tho - 0.1, b: w8Tad - 0.1, keys: [[0, [0.5, 2.0, -2.3], [0, 1.95, -4.5], -0.04, 42], [0.35, [0.45, 2.0, -2.5], [0, 1.95, -4.5], -0.02, 42], [2, [0.4, 2.0, -2.6], [0, 1.95, -4.5], 0.02, 40]],
      act: (t) => { fortCourt(t, 'coach'); OV.badge = { t0: w8Tho, txt: 'തോറ്റ ക്യാപ്റ്റൻ = കോച്ച്', sub: "LOSING CAPTAIN → OUR COACH" }; } }),
    FRT({ a: w8Tad - 0.1, b: w8Thal + 0.05, keys: [[0, [0.35, 1.55, 0.7], [0, 1.45, -1.6], 0.04, 44], [0.35, [0.3, 1.55, 0.5], [0, 1.45, -1.6], 0.02, 44], [2, [0.28, 1.55, 0.4], [0, 1.45, -1.6], -0.02, 42]],
      act: (t) => fortCourt(t, 'coach') }),
    FRT({ a: w8Thal + 0.05, b: L(9), flash: w8Thal + 0.32, shake: w8Thal + 0.3, keys: [[0, [1.8, 1.6, 2.0], [0, 1.5, -2.4], 0.05, 50], [0.35, [1.6, 1.6, 1.6], [0, 1.5, -2.4], 0.02, 50], [2, [1.5, 1.6, 1.4], [0, 1.5, -2.4], -0.02, 48]],
      act: (t) => fortCourt(t, t > w8Thal + 0.32 ? 'cheer' : 'coach') }),
    // ---- 10. MONTAGE: he built forts, trained the army, became the Valiya Kappithan
    FRT({ a: L(9), b: w9Sai - 0.1, shake: L(9) + 0.2, keys: [[0, [0, 3.2, 21], [0, 2.2, 8], 0.03, 52], [0.4, [-0.5, 3.4, 20], [0, 2.3, 8], 0.01, 52], [2.5, [-1, 3.6, 19], [0, 2.4, 8], -0.02, 52]],
      act: (t, tt, sh) => { fortCourt(t, 'kap'); S.fort.walls.position.y = lerp(-3.9, 0, ezo(span(t, sh.a + 0.05, 1.3))); } }),
    FRT({ a: w9Sai - 0.1, b: w9Thi - 0.1, keys: [[0, [4.2, 2.0, 7.2], [0, 1.2, 0.4], 0.04, 50], [0.35, [4.0, 2.0, 6.9], [0, 1.2, 0.4], 0.02, 50], [2, [3.8, 2.0, 6.6], [0, 1.2, 0.4], -0.02, 50]],
      act: (t) => { const f = S.fort; f.pris.c.visible = false; f.guards.forEach((a) => { a.c.visible = false; }); f.kap.c.position.set(0, 0, -0.6); pose(f.kap, { expr: 'stern', L: 'hip', R: 'mouth', propR: 'whistle', look: 1 }, t);
        f.drill.forEach((a, i) => pose(a, { expr: 'stern', R: 'holdUp', propR: 'sword', L: 'hold', propL: 'shield', walk: (t * 1.6 + (i % 2) * 0.5) % 1, look: -1, lean: Math.sin(t * 10 + i) * 0.02 }, t)); } }),
    FRT({ a: w9Thi - 0.1, b: L(10), keys: [[0, [0.5, 1.6, 2.0], [0, 1.5, -0.6], 0.04, 44], [0.35, [0.45, 1.6, 1.7], [0, 1.5, -0.6], 0.02, 44], [2, [0.4, 1.6, 1.5], [0, 1.5, -0.6], -0.02, 42]],
      act: (t) => { const f = S.fort; f.pris.c.visible = false; f.guards.forEach((a) => { a.c.visible = false; }); f.kap.c.position.set(0, 0, -0.6); pose(f.kap, { expr: 'proud', L: 'hip', R: 'holdUp', propR: 'sword', look: 0 }, t); OV.plate = { t0: w9Val - 0.1 }; } }),
    // ---- 11. QUIET: 36 years of service; he still rests at Udayagiri fort
    FRT({ a: L(10), b: w10Inn - 0.1, dusk: true, keys: [[0, [21, 2.6, 9], [13, 2, -1], 0.02, 50], [0.4, [20.6, 2.6, 8.4], [13, 2, -1], 0.01, 50], [3, [20, 2.5, 7.6], [13, 2, -1], -0.01, 48]],
      act: (t) => { const f = S.fort; ALL.fort.forEach((a) => { a.c.visible = false; }); OV.count = { txt: '36', sub: 'വർഷം', t0: L(10) + 0.1 }; void f; } }),
    FRT({ a: w10Inn - 0.1, b: L(11), dusk: true, keys: [[0, [11.9, 2.1, 3.1], [12.6, 0.3, 1.4], 0.02, 46], [0.4, [11.95, 2.0, 2.95], [12.6, 0.3, 1.4], 0.01, 44], [3, [12.05, 1.85, 2.7], [12.6, 0.3, 1.4], -0.01, 42]],
      act: () => { ALL.fort.forEach((a) => { a.c.visible = false; }); } }),
    // ---- 12. CALLBACK: he didn't capture Europe... but he captured Europe's captain!
    BCH({ a: L(11), b: w11Pak - 0.1, keys: [[0, [0, 1.7, 4.6], [-0.3, 1.45, 1.4], 0.04, 42], [0.35, [-0.05, 1.7, 4.4], [-0.3, 1.45, 1.4], 0.02, 42], [2, [-0.1, 1.7, 4.3], [-0.3, 1.45, 1.4], -0.02, 42]],
      act: (t) => { ours(t, 'calm'); S.beach.dsold.concat([S.beach.imhoff, S.beach.lannoy]).forEach((a) => { a.c.visible = false; }); pose(S.beach.king, { expr: 'smug', L: 'hip', R: 'holdUp', propR: 'tricorne', look: 0 }, t); } }),
    BCH({ a: w11Pak - 0.1, b: w11Pid - 0.1, keys: [[0, [0.8, 1.7, 5.4], [0.3, 1.45, 1.5], -0.04, 48], [0.35, [0.75, 1.7, 5.1], [0.3, 1.45, 1.5], -0.02, 48], [2, [0.7, 1.7, 4.9], [0.3, 1.45, 1.5], 0.02, 46]],
      act: (t) => { const b = S.beach; ours(t, 'calm'); b.dsold.concat([b.imhoff, b.lannoy]).forEach((a) => { a.c.visible = false; }); pose(b.king, { expr: 'grin', L: 'hip', R: 'holdUp', propR: 'tricorne', look: 1 }, t); pose(b.kap, { expr: 'grin', L: 'thumb', R: 'hip', look: -1 }, t); } }),
    BCH({ a: w11Pid - 0.1, b: 1e9, keys: [[0, [0.6, 1.8, 5.8], [0.2, 1.5, 1.4], 0.03, 50], [0.4, [0.9, 3.0, 8.5], [0.2, 1.4, 0], 0.02, 52], [3.5, [2.5, 13, 24], [0, 2, -14], -0.02, 54]],
      act: (t) => { const b = S.beach; ours(t, 'cheer'); b.dsold.concat([b.imhoff, b.lannoy]).forEach((a) => { a.c.visible = false; }); pose(b.king, { expr: 'beam', L: 'up', R: 'holdUp', propR: 'tricorne', look: 0, hop: hopAt(t, 6, 0.05) }, t); pose(b.kap, { expr: 'laugh', L: 'up', R: 'up', look: -1, hop: hopAt(t, 6, 0.06, 1) }, t); } }),
  ];
}
// keep cuts on the word but never shorter than 0.6 s; split anything over 2.3 s into a fresh composition
function tidy(list) {
  const n = list.length; for (let i = 1; i < n; i++) { const lo = list[i - 1].a + 0.6, hi = i + 1 < n ? list[i + 1].a - 0.6 : 1e9; if (list[i].a < lo) list[i].a = Math.min(lo, Math.max(list[i - 1].a + 0.3, (list[i - 1].a + hi) / 2)); }
  for (let i = 0; i < n; i++) list[i].b = i + 1 < n ? list[i + 1].a : list[i].b;
  const out = []; list.forEach((x) => { const d = x.b - x.a; if (d <= 2.3 || x.b > 1e8 || x.set === 'map') { out.push(x); return; } const k = Math.ceil(d / 2.0), step = d / k;
    for (let j = 0; j < k; j++) { if (!j) { out.push({ ...x, b: x.a + step }); continue; } const side = j % 2 ? 1 : -1, push = 0.22 + 0.08 * j, big = Math.hypot(...x.keys[0][1].map((v, q) => v - x.keys[0][2][q])) > 20 ? 6 : 1;
      const keys = x.keys.map(([t, p, l, r = 0, f = 52]) => [t, p.map((v, q) => v + (l[q] - v) * push + (q === 0 ? side * 0.25 * big : q === 1 ? 0.12 * big : 0)), l, -r + side * 0.03, f - 4]);
      out.push({ ...x, a: x.a + j * step, b: j === k - 1 ? x.b : x.a + (j + 1) * step, keys, flash: null }); } });
  return out;
}

// ------------------------------------------------------------------ the what-if map (Kerala coast only)
const COAST = [[400, -20], [420, 160], [455, 330], [480, 470], [520, 620], [548, 760], [580, 900], [615, 1040], [650, 1180], [680, 1300], [725, 1430], [760, 1540], [805, 1660], [840, 1760], [880, 1860], [910, 1960]];
function coastPath(g) { g.beginPath(); g.moveTo(...COAST[0]); for (let i = 1; i < COAST.length - 1; i++) { const [x, y] = COAST[i], [x2, y2] = COAST[i + 1]; g.quadraticCurveTo(x + Math.sin(i * 2.3) * 14, y, (x + x2) / 2, (y + y2) / 2); } g.lineTo(...COAST[COAST.length - 1]); g.lineTo(W + 20, H + 20); g.lineTo(W + 20, -20); g.closePath(); }
function drawMap(t, o) {
  const g = MC.getContext('2d'); g.save();
  const sea = g.createLinearGradient(0, 0, W, H); sea.addColorStop(0, '#5a9ccc'); sea.addColorStop(1, '#7fb8dc'); g.fillStyle = sea; g.fillRect(0, 0, W, H);
  g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 4; for (let k = 0; k < 14; k++) { const y = (k * 150 + t * 30) % (H + 100) - 50; g.beginPath(); for (let x = 40; x < 480; x += 20) g.lineTo(x, y + Math.sin(x * 0.04 + t * 2 + k) * 8); g.stroke(); }
  text(g, 'അറബിക്കടൽ', 250, 980, { size: 54, color: '#1f4f6a', weight: 700 });
  coastPath(g); g.fillStyle = '#e8d8a8'; g.fill(); g.save(); coastPath(g); g.clip(); g.fillStyle = '#7fae5a'; g.fillRect(900, 0, 200, H);
  // Dutch colours spread up the coast from Colachel in the south
  const u = ezo(span(t, o.t0 + 0.2, 2.2)), top = H - u * (H + 100);
  if (u > 0) { g.save(); g.beginPath(); g.rect(0, top, W, H - top); g.clip(); const cols = ['#c8312c', '#fbfaf6', '#1f4f8a']; g.globalAlpha = 0.7; for (let k = 0; k < 40; k++) { g.fillStyle = cols[k % 3]; g.fillRect(0, k * 60, W, 60); } g.restore(); }
  g.restore(); coastPath(g); g.lineWidth = 9; g.strokeStyle = '#2a1c17'; g.stroke();
  // towns + VOC flags popping in as the colour arrives
  [['കോഴിക്കോട്', 440, 440], ['കൊച്ചി', 530, 640], ['കൊല്ലം', 670, 1250], ['കുളച്ചൽ', 820, 1690]].forEach(([nm, x, y], k) => { ell2(g, x + 40, y, 12, '#2a1c17'); text(g, nm, x + 16, y, { size: 50, color: '#2a1c17', align: 'right', stroke: '#f4ecd6', strokeWidth: 8 });
    const p = ezo(span(t, o.t0 + 0.3 + (y > top ? 0 : 9) + (H - y) / H * 2.0, 0.3)); if (p > 0 && y > top) { g.save(); g.translate(x + 40, y); g.scale(p, p); g.strokeStyle = '#2a1c17'; g.lineWidth = 6; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -110); g.stroke(); const fw = 90, fh = 60; [['#c8312c', 0], ['#fbfaf6', 1], ['#1f4f8a', 2]].forEach(([c, i]) => { g.fillStyle = c; g.fillRect(0, -110 + i * fh / 3, fw, fh / 3); }); g.strokeRect(0, -110, fw, fh); g.restore(); } });
  // the years roll on: 1741 ... 1947?
  const yr = Math.round(lerp(1741, 1947, ez(span(t, o.nur - 0.1, 1.6)))); text(g, `${yr}${yr >= 1947 ? '?' : ''}`, 240, 1150, { font: "'Oswald'", weight: 700, size: 160, color: '#ffffff', stroke: '#2a1c17', strokeWidth: 24 });
  text(g, 'ഡച്ച് കേരളം?', 240, 1280, { size: 64, maxWidth: 420, color: '#f6d24a', stroke: '#2a1c17', strokeWidth: 16 });
  if (t > o.ind - 0.1) { const p = ezo(span(t, o.ind - 0.1, 0.3)); g.save(); g.globalAlpha = p; g.translate(W / 2 - 90, 1560); g.rotate(-0.04); g.fillStyle = '#f6d24a'; g.strokeStyle = '#2a1c17'; g.lineWidth = 9; g.beginPath(); g.roundRect(-330, -80, 660, 190, 24); g.fill(); g.stroke();
    text(g, 'ഇന്തോനേഷ്യ പോലെ', 0, -8, { size: 70, color: '#2a1c17', maxWidth: 600 }); text(g, 'DUTCH-RULED TILL 1949', 0, 66, { font: "'Oswald'", weight: 700, size: 48, color: '#8a1e1e' }); g.restore(); }
  g.restore(); return MC;
}
function ell2(g, x, y, r, c) { g.beginPath(); g.arc(x, y, r, 0, 7); g.fillStyle = c; g.fill(); }

// ------------------------------------------------------------------ rendering
const TINT = { day: 0xffffff, night: 0x8e9ad0, dusk: 0xffcfae };
function renderShot(g, sh, t, alpha = 1) {
  const set = S[sh.set]; const tt = t - sh.a; set.life.forEach((f) => f(t)); resetProps(); sh.act(t, tt, sh);
  let cv;
  if (sh.set === 'map') cv = drawMap(t, OV.map);
  else {
    if (sh.set === 'beach') S.beach.setNight(sh.night ? 1 : 0); else S.fort.setDusk(sh.dusk ? 1 : 0);
    const tint = sh.night ? TINT.night : sh.dusk ? TINT.dusk : TINT.day; ALL[sh.set].forEach((a) => a.c.userData.cardMesh.material.color.setHex(tint));
    const c = camAt(sh.keys, tt); const dist = Math.hypot(...c.p.map((v, q) => v - c.l[q])); place(c, t, sh.shake != null ? shakeAt(t, sh.shake, 0.5) : 0, dist > 25 ? 6 : 1); camera.updateMatrixWorld();
    cv = stage.render(set.scene, camera, sh.night ? { focus: dist, aperture: 2, hazeAmt: 0.15, haze: 0x1a2040, sat: 1.0, contrast: 0.04, lift: 0.07, warm: -0.02, vignette: 0.45 }
      : { focus: dist, aperture: dist > 25 ? 1.5 : 6, hazeAmt: 0.25, haze: sh.dusk ? 0xf0b890 : 0xdfe9f2, sat: 1.1, contrast: 0.06, lift: 0.015, warm: sh.dusk ? 0.08 : 0.02, vignette: sh.dusk ? 0.4 : 0.3 });
  }
  g.save(); g.globalAlpha = alpha;
  if (sh.dream) { g.filter = sh.set === 'map' ? 'saturate(0.9)' : 'saturate(0.45) brightness(1.06)'; const N = 48, sh2 = H / N; for (let i = 0; i < N; i++) { const dx = Math.sin(i * 0.35 + t * 3) * 10; g.drawImage(cv, 0, i * sh2 * (cv.height / H), cv.width, sh2 * (cv.height / H) + 1, dx, i * sh2, W, sh2 + 1); } g.filter = 'none';
    const rg = g.createRadialGradient(W / 2, H / 2, W * 0.35, W / 2, H / 2, H * 0.62); rg.addColorStop(0, 'rgba(255,255,255,0)'); rg.addColorStop(1, 'rgba(255,255,255,.85)'); g.fillStyle = rg; g.fillRect(0, 0, W, H);
  } else g.drawImage(cv, 0, 0, W, H);
  g.restore();
  // flash builds over ~8 frames to its peak, holds, then recovers over ~10
  if (sh.flash != null) { const k = t - sh.flash, pre = k < 0 ? Math.max(0, 1 + k / 0.27) : 0, post = k >= 0 && k < 0.33 ? 1 - k / 0.33 : 0; g.save(); g.globalAlpha = Math.max(pre, post) * 0.92 * alpha; g.fillStyle = '#fff6e0'; g.fillRect(0, 0, W, H); g.restore(); }
  overlays(g, t, alpha);
}
function overlays(g, t, alpha) {
  if (OV.badge) badge(g, t, OV.badge, alpha);
  if (OV.tag && !OV.badge) tag(g, t, OV.tag, alpha);
  if (OV.count) { const p = ezo(span(t, OV.count.t0, 0.25)); g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1180); g.scale(0.7 + 0.3 * p, 0.7 + 0.3 * p); text(g, OV.count.txt, 0, 0, { font: "'Oswald'", weight: 700, size: OV.count.txt.length > 2 ? 300 : 380, color: '#ffffff', align: 'center', stroke: '#2a1c17', strokeWidth: 34 });
    if (OV.count.sub) text(g, OV.count.sub, 0, 250, { font: ML, weight: 800, size: 96, color: '#f6d24a', align: 'center', stroke: '#2a1c17', strokeWidth: 18 }); g.restore(); }
  if (OV.word) { const p = ezo(span(t, OV.word.t0, 0.2)); if (p > 0) { g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1480); g.rotate(-0.05); g.scale(1.4 - 0.4 * p, 1.4 - 0.4 * p); text(g, OV.word.txt, 0, 0, { size: 120, color: '#ffffff', stroke: '#8a1e1e', strokeWidth: 22, maxWidth: 960 }); g.restore(); } }
  if (OV.cal) calendar(g, t, OV.cal, alpha);
  if (OV.plate) nameplate(g, t, OV.plate.t0, alpha);
}
function badge(g, t, b, alpha) {
  const p = ezo(span(t, b.t0, 0.27)); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1480); g.rotate(-0.04); g.scale(0.8 + 0.2 * p, 0.8 + 0.2 * p);
  g.font = `800 88px ${ML}`; const w = Math.min(980, g.measureText(b.txt).width + 120);
  g.fillStyle = '#f6d24a'; g.strokeStyle = '#2a1c17'; g.lineWidth = 10; g.beginPath(); g.roundRect(-w / 2, -90, w, b.sub ? 230 : 180, 26); g.fill(); g.stroke();
  text(g, b.txt, 0, 0, { font: ML, weight: 800, size: 88, color: '#2a1c17', align: 'center', maxWidth: w - 60 }); if (b.sub) text(g, b.sub, 0, 92, { font: "'Oswald'", weight: 700, size: 58, color: '#8a1e1e', align: 'center', maxWidth: w - 60 }); g.restore();
}
function tag(g, t, b, alpha) { // name tag for real historical figures
  const p = ezo(span(t, b.t0, 0.3)); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2 - (1 - p) * 60, 1500);
  g.fillStyle = '#1f2a44'; g.strokeStyle = '#f6d24a'; g.lineWidth = 6; g.beginPath(); g.roundRect(-400, -86, 800, 172, 20); g.fill(); g.stroke();
  text(g, b.txt, 0, -22, { size: 76, color: '#ffffff', maxWidth: 740 }); text(g, b.sub, 0, 50, { font: "'Oswald'", weight: 700, size: 44, color: '#f6d24a' }); g.restore();
}
function calendar(g, t, c, alpha) { // months of siege: pages tear away
  const months = ['മേയ്', 'ജൂൺ', 'ജൂലൈ', 'ഓഗസ്റ്റ്'], p0 = ezo(span(t, c.t0, 0.25)); if (p0 <= 0) return; const u = span(t, c.t0 + 0.3, c.t1 - c.t0 - 0.3) * (months.length - 1), k = Math.min(months.length - 1, Math.floor(u)), f = u - k;
  g.save(); g.globalAlpha = alpha * p0; g.translate(W / 2, 1250); g.scale(0.8 + 0.2 * p0, 0.8 + 0.2 * p0);
  const page = (m, dy = 0, rot = 0, a = 1) => { g.save(); g.globalAlpha *= a; g.translate(0, dy); g.rotate(rot); g.fillStyle = '#f6efdc'; g.strokeStyle = '#2a1c17'; g.lineWidth = 9; g.beginPath(); g.roundRect(-230, -230, 460, 460, 20); g.fill(); g.stroke(); g.fillStyle = '#8a1e1e'; g.fillRect(-226, -226, 452, 110);
    text(g, m, 0, -170, { size: 72, color: '#fff' }); text(g, '1741', 0, 40, { font: "'Oswald'", weight: 700, size: 150, color: '#2a1c17' }); g.restore(); };
  if (k + 1 < months.length) page(months[k + 1]); const tear = k + 1 < months.length ? ez(clamp(f * 1.6 - 0.4, 0, 1)) : 0; page(months[k], tear * 520, tear * 0.6, 1 - tear);
  g.restore();
}
function nameplate(g, t, a0, alpha) {
  const p = ezo(span(t, a0, 0.35)); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 640 - (1 - p) * 40);
  g.fillStyle = '#f4ecd6'; g.strokeStyle = '#2a1c17'; g.lineWidth = 7; g.beginPath(); g.roundRect(-440, -78, 880, 156, 18); g.fill(); g.stroke();
  g.fillStyle = '#c8312c'; g.fillRect(-440, -78, 880, 14);
  text(g, 'തിരുവിതാംകൂറിന്റെ', 0, -16, { font: ML, weight: 800, size: 40, color: '#8a1e1e', align: 'center' }); text(g, 'വലിയ കപ്പിത്താൻ ⚔', 0, 50, { font: ML, weight: 800, size: 64, color: '#2a1c17', align: 'center' }); g.restore();
}
// captions: 1-2 words at the very top (owner's call)
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
  if (prev && prev.set !== sh.set && t < sh.a + XF) { renderShot(g, prev, t); renderShot(g, sh, t, ez((t - sh.a) / XF)); }
  else renderShot(g, sh, t);
  captions(g, s);
}
function end(g, s) { main(g, s); }
export const scenes = { main, end };
export const hits = [];
export const extraHits = (timeline) => {
  const m = timeline.scenes.find((x) => x.id === 'main'), out = []; const s = { line: (i) => m.cues[i]?.text, cue: (i) => m.cues[i].start, cueEnd: (i) => m.cues[i].end };
  const sh = shots(s); sh.forEach((x, i) => { if (!i) return; const cut = sh[i - 1].set !== x.set; if (cut || i % 4 === 0) out.push({ t: m.start + x.a - 0.15, kind: 'whoosh', vol: cut ? 0.22 : 0.1 }); });
  const at = (i, n) => m.start + wt(s, i, n), add = (t, kind, vol) => out.push({ t, kind, vol });
  add(m.start + 0.1, 'boom', 0.35); add(m.start + 0.1, 'horn', 0.25); add(at(0, 'ഡച്ച്'), 'pop', 0.3); add(at(0, 'ഭീഷണിപ്പെടുത്തി') + 0.45, 'thud', 0.55); add(at(0, '"യുദ്ധം'), 'hit', 0.45); add(at(0, 'രാജാവിന്റെ'), 'chime', 0.3); add(at(0, 'യൂറോപ്പ്') + 0.1, 'boom', 0.4); add(at(0, 'യൂറോപ്പ്') + 0.15, 'pop', 0.35);
  add(m.start + s.cue(1), 'pop', 0.3); add(at(1, 'നോക്കൂ,'), 'whoosh', 0.25); add(at(1, 'കച്ചവട'), 'coin', 0.4); add(at(1, 'കച്ചവട') + 0.1, 'pop', 0.3);
  add(m.start + s.cue(2) + 0.3, 'whoosh', 0.2); add(at(2, 'പീരങ്കികൾ.'), 'thud', 0.5); for (let k = 0; k < 3; k++) add(at(2, 'പീരങ്കികൾ.') + k * 0.12, 'hit', 0.2); add(at(2, 'തോക്കുകൾ.'), 'hit', 0.45); add(at(2, 'യൂറോപ്യൻ'), 'boom', 0.4); for (let k = 0; k < 4; k++) add(at(2, 'യൂറോപ്യൻ') + 0.2 + k * 0.3, 'thud', 0.2);
  add(at(3, 'നായർ'), 'hit', 0.5); add(at(3, 'നായർ') + 0.1, 'chime', 0.3); add(at(3, 'മുക്കുവന്മാർ!'), 'pop', 0.45); add(at(3, 'മുക്കുവന്മാർ!') + 0.3, 'tick', 0.3);
  add(m.start + s.cue(4), 'chime', 0.3); for (let k = 0; k < 5; k++) add(at(4, 'മുക്കുവന്മാർ') + 0.3 + (4 - k) * 0.25 + 0.6, 'thud', 0.25); add(at(4, 'വ്യാജ'), 'pop', 0.4); add(at(4, 'ചെറുവള്ളങ്ങളിൽ'), 'whoosh', 0.3); add(at(4, 'വഴിയടച്ചു.'), 'thud', 0.4);
  for (let k = 0; k < 3; k++) add(m.start + s.cue(5) + 0.4 + k * 0.6, 'paper', 0.35); add(at(5, 'പീരങ്കിയുണ്ട') - 0.2, 'boom', 0.35); add(at(5, 'പീരങ്കിയുണ്ട'), 'whoosh', 0.35); add(at(5, 'ബൂം!'), 'boom', 0.75); add(at(5, 'ബൂം!') + 0.05, 'hit', 0.5);
  add(m.start + s.cue(6) + 0.1, 'pop', 0.4); add(at(6, 'ഡച്ചുകാർ'), 'whoosh', 0.2); add(at(6, 'ലനോയ്'), 'tick', 0.3); add(at(6, 'തടവുകാരനായി.') + 0.05, 'thud', 0.45);
  add(m.start + s.cue(7), 'hit', 0.35); add(at(7, 'കേരളം,'), 'chime', 0.25); add(at(7, 'ഇന്തോനേഷ്യയെപ്പോലെ,'), 'pop', 0.35); for (let k = 0; k < 6; k++) add(at(7, 'നൂറ്റാണ്ടുകളോളം') + k * 0.25, 'tick', 0.2);
  add(m.start + s.cue(8), 'whoosh', 0.25); add(at(8, 'തോറ്റ'), 'pop', 0.4); add(at(8, 'തലവനാക്കി!') + 0.3, 'boom', 0.45); add(at(8, 'തലവനാക്കി!') + 0.32, 'chime', 0.45);
  add(m.start + s.cue(9) + 0.2, 'thud', 0.5); add(m.start + s.cue(9) + 0.6, 'thud', 0.35); add(at(9, 'സൈന്യത്തെ'), 'tick', 0.35); for (let k = 0; k < 4; k++) add(at(9, 'സൈന്യത്തെ') + 0.3 + k * 0.32, 'thud', 0.18); add(at(9, '"വലിയ'), 'chime', 0.45);
  add(m.start + s.cue(10) + 0.1, 'chime', 0.2);
  add(at(11, 'പക്ഷേ'), 'pop', 0.3); add(at(11, 'പിടിച്ചു!'), 'boom', 0.45); add(at(11, 'പിടിച്ചു!') + 0.05, 'chime', 0.4);
  return out;
};
void H;
export const shotTimes = (timeline) => { const m = timeline.scenes.find((x) => x.id === 'main'); const s = { line: (i) => m.cues[i]?.text, cue: (i) => m.cues[i].start, cueEnd: (i) => m.cues[i].end }; return shots(s).map((x) => ({ a: m.start + x.a, b: m.start + x.b, set: x.set })); };
