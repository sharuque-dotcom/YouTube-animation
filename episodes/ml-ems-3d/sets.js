// 1957 EMS government sets (all our own). The red look comes from the story itself: red flags in the paddy, the red
// velvet behind the Speaker, a red-dusk street, plus a warm red grade in scenes.js.
// assemblySet(): Kerala Niyamasabha 1957: Speaker's dais under a red velvet canopy, curved tiers of benches, tall
//   windows with light shafts, ceiling fans, a seat board. API: setTally(u) (fills 65 of 126 seats red), setFans(t).
// fieldSet(): tenant land: paddy rows, a thatched hut with red flags on bamboo poles, the landlord's big tiled house
//   behind, palms. API: setFlags(u) (flags rise), setSun(u).
// streetSet(): town street at red dusk for the Vimochana Samaram: shop fronts, poles and wires, bunting of mixed party
//   flags across the street, torch glow, smoke. API: setSmoke(u, t), setTorch(u).
// delhiSet(): a Delhi office: panelled walls, a tricolour on a stand, a window onto a domed skyline, a big desk with
//   a ballot box and a giant rubber stamp. API: setStamp(u) (0 up, 1 slammed), setBallot(v), paper (sheet that drifts).
// groundSet(): a cricket ground: oval, pitch, stumps, a packed gallery that jumps, a scoreboard. API: setScore(a, b, torn),
//   setNoise(u) (gallery jumps).
import * as K from '../../pipeline/toon3d.js';
const THREE = K.THREE;
const glow = (c, o = 1) => new THREE.MeshBasicMaterial({ color: c, transparent: o < 1, opacity: o, depthWrite: o >= 1 });
const noInk = (m) => { m.userData.noInk = true; m.traverse?.((o) => { o.userData.noInk = true; }); return m; };
function plane(w, h, tex, basic = false) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), basic ? new THREE.MeshBasicMaterial({ map: tex, transparent: true }) : new THREE.MeshLambertMaterial({ map: tex, transparent: true })); m.receiveShadow = true; return m; }
const canvasTex = (w, h) => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; return { cv, tex, g: cv.getContext('2d') }; };
function room(T, { w = 12, d = 10, h = 5, wall = T.lime, floor = 0x8a8a84, bg = 0xe8dcc0, rep = 3 } = {}) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(bg);
  const fl = K.mesh(new THREE.PlaneGeometry(w, d), K.col(floor)); fl.rotation.x = -Math.PI / 2; scene.add(fl);
  const wt = wall.clone(); wt.repeat.set(rep, 1.2); wt.needsUpdate = true; const wm = new THREE.MeshLambertMaterial({ map: wt, side: THREE.DoubleSide });
  const back = K.mesh(new THREE.PlaneGeometry(w, h), wm); back.position.set(0, h / 2, -d / 2); scene.add(back);
  for (const s of [-1, 1]) { const sw = K.mesh(new THREE.PlaneGeometry(d, h), wm); sw.rotation.y = -s * Math.PI / 2; sw.position.set(s * w / 2, h / 2, 0); scene.add(sw); }
  return scene;
}
function lights(scene, { key = 0xfff0d0, ki = 1.3, pos = [6, 9, 8], hemi = [0xfff4e0, 0x8a6a4a, 1.05], box = 8 } = {}) {
  const sun = new THREE.DirectionalLight(key, ki); sun.position.set(...pos); sun.target.position.set(0, 0, -2); scene.add(sun, sun.target); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0005;
  Object.assign(sun.shadow.camera, { left: -box, right: box, top: box, bottom: -box, near: 1, far: 60 }); scene.add(new THREE.HemisphereLight(...hemi)); return sun;
}
const shaftMat = (o = 0.12, c = 0xfff0c0) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
function fan(scene, x, y, z, life) { const g = new THREE.Group(); const rod = K.mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.8, 6), K.col(0x2a2a2a)); rod.position.y = 0.4; g.add(rod);
  const hub = K.mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.12, 12), K.col(0x5a4a3a)); g.add(hub); const bl = new THREE.Group(); g.add(bl);
  for (let k = 0; k < 3; k++) { const b = K.box(0.9, 0.02, 0.16, null, { color: 0x6a4a2a }); b.position.x = 0.5; const p = new THREE.Group(); p.rotation.y = k * Math.PI * 2 / 3; p.add(b); bl.add(p); }
  g.position.set(x, y, z); scene.add(g); life.push((t) => { bl.rotation.y = t * 5 + x; }); return g; }
// a cloth flag that ripples: a segmented plane whose vertices wave in life()
function clothFlag(paintFn, w = 1.2, h = 0.8, seed = 0) { const tex = K.paint(256, 170, paintFn); const geo = new THREE.PlaneGeometry(w, h, 10, 4); geo.translate(w / 2, 0, 0);
  const m = K.mesh(geo, new THREE.MeshLambertMaterial({ map: tex, side: THREE.DoubleSide })); const base = geo.attributes.position.array.slice();
  m.userData.wave = (t, amt = 1) => { const p = geo.attributes.position.array; for (let i = 0; i < p.length; i += 3) { const x = base[i]; p[i + 2] = Math.sin(x * 4 - t * 6 + seed) * 0.08 * (x / w) * amt; p[i + 1] = base[i + 1] + Math.sin(x * 3 - t * 5 + seed) * 0.03 * (x / w) * amt; } geo.attributes.position.needsUpdate = true; };
  return m; }
export function hammerSickle(g, cx, cy, s, col = '#f6d24a') { g.save(); g.translate(cx, cy); g.scale(s, s); g.strokeStyle = col; g.lineCap = 'round';
  g.lineWidth = 3.2; g.beginPath(); g.arc(1, -1, 9, Math.PI * 0.95, Math.PI * 2.35); g.stroke(); g.lineWidth = 3; g.beginPath(); g.moveTo(-7, 9); g.lineTo(-3, 5); g.stroke();
  g.lineWidth = 2.6; g.beginPath(); g.moveTo(-6, -8); g.lineTo(8, 8); g.stroke(); g.lineWidth = 4.5; g.beginPath(); g.moveTo(-9, -5); g.lineTo(-3, -11); g.stroke(); g.restore(); }
export const FLAGS = {
  red: (g, w, h) => { g.fillStyle = '#d0281e'; g.fillRect(0, 0, w, h); hammerSickle(g, w * 0.32, h * 0.4, 3.2); },
  tri: (g, w, h) => { [['#e8742a', 0], ['#fbfaf6', 1], ['#2f8a3a', 2]].forEach(([c, k]) => { g.fillStyle = c; g.fillRect(0, k * h / 3, w, h / 3 + 1); }); g.strokeStyle = '#2a4a9a'; g.lineWidth = 4; g.beginPath(); g.arc(w / 2, h / 2, h / 9, 0, 7); g.stroke(); },
  green: (g, w, h) => { g.fillStyle = '#2f7a3a'; g.fillRect(0, 0, w, h); g.fillStyle = '#fbfaf6'; g.beginPath(); g.arc(w * 0.45, h / 2, h * 0.26, 0.6, 5.7); g.arc(w * 0.52, h / 2, h * 0.2, 5.5, 0.8, true); g.fill(); g.beginPath(); g.arc(w * 0.66, h * 0.44, h * 0.07, 0, 7); g.fill(); },
  white: (g, w, h) => { g.fillStyle = '#f6f1e4'; g.fillRect(0, 0, w, h); g.fillStyle = '#2a4a9a'; g.font = "700 56px 'Oswald'"; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('NSS', w / 2, h / 2); },
};

// ---------------------------------------------------------------- ASSEMBLY 1957
export function assemblySet() {
  const T = K.stdTextures(), life = []; const scene = room(T, { w: 16, d: 13, h: 7, wall: T.lime, floor: 0x7a5a3e, bg: 0xe8dcc0, rep: 5 });
  const dado = K.box(16, 1.6, 0.06, T.wood, { tileM: 1.5 }); dado.position.set(0, 0.8, -6.46); scene.add(dado);
  const carpet = K.mesh(new THREE.PlaneGeometry(2.6, 13), K.col(0x9a1c1e)); carpet.rotation.x = -Math.PI / 2; carpet.position.set(0, 0.01, 0); scene.add(carpet);
  // Speaker's dais: steps, a high-backed chair, red velvet canopy and drapes, the sign
  const dais = K.box(5, 0.5, 2.2, T.wood, { tileM: 1 }); dais.position.set(0, 0.25, -5.2); scene.add(dais); const step = K.box(3, 0.25, 0.6, T.wood, { tileM: 1 }); step.position.set(0, 0.12, -3.9); scene.add(step);
  const chair = new THREE.Group(); const seat = K.box(1.0, 0.2, 0.8, null, { color: 0x7a1418 }); seat.position.y = 1.0; chair.add(seat); const back = K.box(1.0, 1.8, 0.16, null, { color: 0x7a1418 }); back.position.set(0, 1.9, -0.36); chair.add(back);
  const crest = K.box(1.2, 0.3, 0.2, null, { color: 0xd9a521 }); crest.position.set(0, 2.9, -0.36); chair.add(crest); chair.position.set(0, 0.5, -5.6); scene.add(chair);
  const table = K.box(3.2, 0.55, 0.9, T.wood, { tileM: 1 }); table.position.set(0, 0.28, -3.2); scene.add(table);
  const velvet = K.paint(256, 512, (g, w, h) => { g.fillStyle = '#9a1418'; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 32) { const gr = g.createLinearGradient(x, 0, x + 32, 0); gr.addColorStop(0, 'rgba(0,0,0,.35)'); gr.addColorStop(0.5, 'rgba(255,120,120,.18)'); gr.addColorStop(1, 'rgba(0,0,0,.35)'); g.fillStyle = gr; g.fillRect(x, 0, 32, h); } g.fillStyle = '#d9a521'; g.fillRect(0, h - 18, w, 18); });
  const drape = plane(6.4, 5.2, velvet); drape.position.set(0, 3.4, -6.42); scene.add(drape);
  const canopy = K.box(4.6, 0.4, 1.6, null, { color: 0x9a1418 }); canopy.position.set(0, 5.4, -5.6); scene.add(canopy); const fringe = K.box(4.7, 0.12, 1.7, null, { color: 0xd9a521 }); fringe.position.set(0, 5.18, -5.6); scene.add(fringe);
  const sign = plane(4.2, 0.9, K.signTex(['കേരള നിയമസഭ · 1957'], { bg: '#5a1a14', fg: '#f6d24a', border: '#d9a521', w: 900, h: 190 })); sign.position.set(0, 6.25, -6.4); scene.add(sign);
  // emblem disc above the chair
  const em = plane(0.9, 0.9, K.paint(256, 256, (g, w, h) => { g.fillStyle = '#d9a521'; g.beginPath(); g.arc(w / 2, h / 2, 120, 0, 7); g.fill(); g.strokeStyle = '#5a3a10'; g.lineWidth = 10; g.stroke(); g.fillStyle = '#5a3a10'; g.font = "700 90px 'Oswald'"; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('1957', w / 2, h / 2); }), true); em.position.set(0, 4.6, -6.38); scene.add(em);
  // curved benches in three tiers on both sides, green leather tops (the treasury side gets red cushions via setTally)
  const benches = []; for (const s of [-1, 1]) for (let r = 0; r < 3; r++) { const rad = 3.2 + r * 1.3, y = r * 0.35; for (let k = 0; k < 6; k++) { const a = -0.15 + k * 0.24; const x = s * (Math.sin(0.5 + a) * rad + 0.6), z = -2.2 + Math.cos(0.5 + a) * rad * 0.9 - 1;
    const plat = K.box(1.2, 0.3 + y, 0.9, T.wood, { tileM: 1 }); plat.position.set(x, (0.3 + y) / 2, z); plat.rotation.y = s * (0.5 + a) * 0.9; scene.add(plat);
    const desk = K.box(1.2, 0.55, 0.12, T.wood, { tileM: 1 }); desk.position.set(x - s * 0.05, 0.3 + y + 0.25, z + 0.38); desk.rotation.y = plat.rotation.y; scene.add(desk);
    const cush = K.box(1.1, 0.1, 0.6, null, { color: 0x3a6a4a }); cush.position.set(x, 0.3 + y + 0.05, z - 0.08); cush.rotation.y = plat.rotation.y; scene.add(cush); benches.push({ cush, s, r, k }); } }
  const red = K.col(0xc8281e), green = K.col(0x3a6a4a);
  // seat board on the right wall: 126 seats, CPI + independents fill red
  const sb = canvasTex(900, 700); const board = plane(3.4, 2.6, sb.tex); board.position.set(7.9, 3.6, -2.5); board.rotation.y = -Math.PI / 2; scene.add(board);
  const frame = K.box(0.06, 2.8, 3.6, T.wood, { tileM: 1 }); frame.position.set(7.96, 3.6, -2.5); scene.add(frame);
  const setTally = (u) => { const g = sb.g; g.fillStyle = '#20302a'; g.fillRect(0, 0, 900, 700); g.fillStyle = '#f4f0e6'; g.font = "700 58px 'Oswald'"; g.textAlign = 'center'; g.fillText('126 SEATS', 450, 80);
    const n = Math.round(65 * u); for (let i = 0; i < 126; i++) { const c = i % 14, r = Math.floor(i / 14); g.fillStyle = i < n ? '#e0281e' : '#5a6a62'; g.beginPath(); g.arc(90 + c * 55, 150 + r * 52, 20, 0, 7); g.fill(); }
    g.fillStyle = '#f6d24a'; g.font = "700 64px 'Oswald'"; g.fillText(n >= 65 ? '60 + 5 = 65  ✔' : String(n), 450, 660); sb.tex.needsUpdate = true;
    benches.forEach((b) => { b.cush.material = b.s < 0 && (b.r * 6 + b.k) < Math.round(18 * u) ? red : green; }); };
  setTally(0);
  // tall windows on the left wall with sun shafts
  for (const z of [-4, -0.5, 3]) { const win = noInk(new THREE.Mesh(new THREE.PlaneGeometry(1.6, 3.2), glow(0xfff2cc))); win.position.set(-7.96, 3.6, z); win.rotation.y = Math.PI / 2; scene.add(win);
    for (let k = 0; k < 3; k++) { const b = K.box(0.06, 3.2, 0.06, null, { color: 0x5a3a22 }); b.position.set(-7.92, 3.6, z - 0.5 + k * 0.5); scene.add(b); }
    const sh = noInk(K.mesh(new THREE.PlaneGeometry(1.6, 9), shaftMat(0.1), { shadow: false })); sh.position.set(-4.5, 2.6, z + 0.6); sh.rotation.set(0, Math.PI / 2, 0.95); scene.add(sh); }
  for (const [x, z] of [[-3, -2], [3, -2], [-3, 2], [3, 2]]) fan(scene, x, 6.0, z, life);
  // dust motes in the shafts
  const motes = []; for (let k = 0; k < 40; k++) { const m = noInk(K.mesh(new THREE.SphereGeometry(0.02, 4, 3), glow(0xfff4d0, 0.8), { shadow: false })); scene.add(m); motes.push(m); }
  life.push((t) => motes.forEach((m, k) => { m.position.set(-6 + ((k * 0.37 + t * 0.05) % 4), 1 + ((k * 0.61 + t * 0.08) % 4), -4 + (k * 0.53) % 8); }));
  lights(scene, { key: 0xffe8c0, ki: 1.2, pos: [-9, 10, 4], hemi: [0xfff0dc, 0x6a4a3a, 1.0], box: 10 });
  return { scene, life, setTally, chair, table };
}

// ---------------------------------------------------------------- PADDY FIELD + TENANT HUT
export function fieldSet() {
  const T = K.stdTextures(), life = [], scene = new THREE.Scene(); scene.background = K.skyTexture({ seed: 57, clouds: 6, top: '#4f8fd8', mid: '#9fcaf0', bottom: '#f4e6c4' }); scene.fog = new THREE.Fog(0xe6eef0, 30, 110);
  const g0 = K.mesh(new THREE.PlaneGeometry(200, 200), K.col(0x5f8a34)); g0.rotation.x = -Math.PI / 2; scene.add(g0);
  // water sheen between rows
  for (let z = -27; z < 1; z += 1.1) { const wr = noInk(K.mesh(new THREE.PlaneGeometry(40, 0.28), new THREE.MeshBasicMaterial({ color: 0x9fc8d8, transparent: true, opacity: 0.45 }), { shadow: false })); wr.rotation.x = -Math.PI / 2; wr.position.set(0, 0.015, z); scene.add(wr); }
  // paddy: instanced tufts in rows, swaying
  const tuftGeo = new THREE.ConeGeometry(0.09, 0.55, 5); tuftGeo.translate(0, 0.27, 0); const N = 3300; const tufts = new THREE.InstancedMesh(tuftGeo, K.col(0x8ab84a), N); tufts.castShadow = true; tufts.receiveShadow = true;
  const dummy = new THREE.Object3D(), base = []; let i = 0; for (let z = -28; z < 3 && i < N; z += 0.7) for (let x = -20; x < 20 && i < N; x += 0.6) { if (Math.abs(x - 4.5) < 2.5 && z > -6) continue; if (Math.abs(z + 8) < 0.4) continue; base.push([x + Math.sin(i) * 0.08, z]); i++; }
  tufts.count = base.length; scene.add(tufts); const tcol = new THREE.Color(); base.forEach((b, k) => { tcol.setHSL(0.24 + (k % 7) * 0.006, 0.55, 0.45 + (k % 5) * 0.03); tufts.setColorAt(k, tcol); });
  life.push((t) => { base.forEach(([x, z], k) => { dummy.position.set(x, 0, z); dummy.rotation.set(Math.sin(t * 1.6 + x * 0.4 + z * 0.3) * 0.12, 0, Math.sin(t * 1.2 + x * 0.2) * 0.08); dummy.scale.setScalar(0.9 + (k % 4) * 0.08); dummy.updateMatrix(); tufts.setMatrixAt(k, dummy.matrix); }); tufts.instanceMatrix.needsUpdate = true; });
  // a bund path with the hut yard
  const bund = K.box(40, 0.12, 0.7, T.dirt, { tileM: 3 }); bund.position.set(0, 0.06, -8); scene.add(bund);
  const yard = K.box(5.5, 0.1, 7, T.dirt, { tileM: 3 }); yard.position.set(4.5, 0.05, -2.5); scene.add(yard);
  // thatched hut: mud walls, coconut-thatch roof, a doorway
  const hut = new THREE.Group(); const walls = K.box(3.2, 1.9, 2.4, null, { color: 0xb8865a }); walls.position.y = 0.95; hut.add(walls);
  const thatch = K.paint(128, 128, (g, w, h) => { g.fillStyle = '#b89a5a'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(90,70,30,.55)'; g.lineWidth = 2; for (let x = 0; x < w; x += 4) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 6, h); g.stroke(); } });
  const roof = K.roofGable(3.9, 3.0, 1.3, thatch); roof.position.y = 1.9; hut.add(roof);
  const door = K.box(0.8, 1.4, 0.05, null, { color: 0x3a2418 }); door.position.set(0, 0.7, 1.21); hut.add(door); hut.position.set(5.2, 0, -4); scene.add(hut);
  // red flags on bamboo poles by the hut (rise with setFlags)
  const flags = []; [[3.0, -1.6, 0], [7.4, -2.6, 1.3], [6.4, 0.6, 2.1]].forEach(([x, z, sd]) => { const pole = K.mesh(new THREE.CylinderGeometry(0.04, 0.05, 4.2, 6), K.col(0xc8a85a)); pole.position.set(x, 2.1, z); scene.add(pole);
    const f = clothFlag(FLAGS.red, 1.2, 0.8, sd); f.position.set(x + 0.04, 3.7, z); scene.add(f); flags.push({ f, x, z }); });
  const setFlags = (u) => flags.forEach(({ f }) => { f.position.y = 0.6 + 3.1 * u; f.visible = u > 0.02; });
  life.push((t) => flags.forEach(({ f }) => f.userData.wave(t)));
  // the landlord's big tiled house behind the field
  const big = new THREE.Group(); const bw = K.box(8, 3.2, 4, T.lime, { tileM: 2 }); bw.position.y = 1.6; big.add(bw); const br = K.roofGable(9.2, 5.2, 2.4, T.tiles); br.position.y = 3.2; big.add(br);
  const plinth = K.box(8.6, 0.5, 4.6, T.laterite, { tileM: 1 }); plinth.position.y = 0.25; big.add(plinth); for (let k = 0; k < 5; k++) { const p = K.box(0.25, 2.8, 0.25, T.wood, { tileM: 1 }); p.position.set(-3.4 + k * 1.7, 1.9, 2.2); big.add(p); }
  big.position.set(-9, 0, -26); big.rotation.y = 0.25; scene.add(big);
  [[-16, -18, 11], [12, -22, 12], [17, -12, 10], [-13, -8, 9], [10, -6, 8.5], [-22, -30, 13], [22, -30, 12]].forEach(([x, z, h], k) => { const p = K.palm(h, 0.1 + (k % 3) * 0.07, k + 140); p.position.set(x, 0, z); scene.add(p); life.push((t) => p.userData.sway?.(t)); });
  const hills = K.mesh(new THREE.CylinderGeometry(60, 60, 8, 40, 1, true, Math.PI * 0.75, Math.PI * 0.5), new THREE.MeshLambertMaterial({ color: 0x5a8a6a, side: THREE.DoubleSide })); hills.position.set(0, 3, 0); hills.scale.set(1, 0.6, 1); scene.add(hills);
  lights(scene, { key: 0xfff0d0, ki: 1.35, pos: [8, 14, 9], hemi: [0xeaf4ff, 0x6a7a3a, 1.0], box: 14 });
  setFlags(1);
  return { scene, life, hut, big, setFlags };
}

// ---------------------------------------------------------------- STREET AT RED DUSK (Vimochana Samaram)
export function streetSet() {
  const T = K.stdTextures(), life = [], scene = new THREE.Scene(); scene.background = K.skyTexture({ seed: 59, clouds: 5, top: '#2a1430', mid: '#9a2a2a', bottom: '#f09a4a' }); scene.fog = new THREE.Fog(0x7a3a30, 18, 70);
  const road = K.box(9, 0.1, 80, T.dirt, { tileM: 4 }); road.position.set(0, 0.05, -20); scene.add(road);
  const side = K.mesh(new THREE.PlaneGeometry(200, 200), K.col(0x6a5040)); side.rotation.x = -Math.PI / 2; scene.add(side);
  const signs = ['ഹോട്ടൽ', 'തുണിക്കട', 'ബുക്ക് സ്റ്റാൾ', 'ചായക്കട', 'സ്റ്റോഴ്സ്', 'മരുന്ന് കട'];
  const shopCol = [0x2f8a86, 0x4f7a3a, 0x8a5a2a, 0x3a5a8a, 0x8a3a3a, 0x6a6a4a];
  let n = 0; for (const s of [-1, 1]) for (let k = 0; k < 6; k++) { const z = 2 - k * 6.5, h = 3.4 + (k % 3) * 0.6, g = new THREE.Group();
    const body = K.box(5.6, h, 4, T.lime, { tileM: 2 }); body.position.y = h / 2; g.add(body); const roof = K.roofGable(6.4, 5, 1.4, T.tiles); roof.position.y = h; roof.rotation.y = Math.PI / 2; g.add(roof);
    const front = K.box(0.1, 2.0, 3.4, null, { color: shopCol[(k + (s > 0 ? 3 : 0)) % 6] }); front.position.set(-s * 2.82, 1.0, 0); g.add(front);
    const lit = noInk(new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.3), glow(0xffc070, 0.95))); lit.position.set(-s * 2.88, 1.2, 0); lit.rotation.y = -s * Math.PI / 2; g.add(lit);
    const sg = plane(3.4, 0.6, K.signTex([signs[n++ % 6]], { bg: '#f4e8c8', fg: '#7a1418', border: '#7a1418', w: 600, h: 110 })); sg.position.set(-s * 2.9, 2.5, 0); sg.rotation.y = -s * Math.PI / 2; g.add(sg);
    g.position.set(s * 7.6, 0, z); scene.add(g); }
  // poles + sagging wires; bunting of mixed party flags across the street
  for (let k = 0; k < 5; k++) { const z = 1 - k * 8; for (const s of [-1, 1]) { const p = K.mesh(new THREE.CylinderGeometry(0.06, 0.08, 6.5, 6), K.col(0x3a3a3a)); p.position.set(s * 4.8, 3.25, z); scene.add(p); } }
  const bunting = []; const kinds = ['tri', 'green', 'white', 'tri', 'green', 'white'];
  for (let row = 0; row < 3; row++) { const z = -2 - row * 9, y0 = 5.2; for (let k = 0; k < 11; k++) { const x = -4.6 + k * 0.92, sag = Math.sin((k / 10) * Math.PI) * 0.6;
    const tex = K.paint(96, 96, (g, w, h) => { FLAGS[kinds[(k + row) % 6]](g, w, h); }); const tri = new THREE.Mesh(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-0.3, 0, 0), new THREE.Vector3(0.3, 0, 0), new THREE.Vector3(0, -0.6, 0)]), new THREE.MeshLambertMaterial({ map: tex, side: THREE.DoubleSide }));
    tri.geometry.setAttribute('uv', new THREE.Float32BufferAttribute([0, 1, 1, 1, 0.5, 0], 2)); tri.geometry.computeVertexNormals(); tri.position.set(x, y0 - sag, z); scene.add(tri); bunting.push(tri); } }
  life.push((t) => bunting.forEach((b, k) => { b.rotation.x = Math.sin(t * 3 + k) * 0.25; }));
  // torch glow (warm point lights) and drifting smoke
  const torches = []; for (const [x, z] of [[-2.5, -3], [2.2, -5], [-1, -9], [3, -12]]) { const l = new THREE.PointLight(0xff8a3a, 0, 9, 1.6); l.position.set(x, 2.6, z); scene.add(l); const f = noInk(K.mesh(new THREE.SphereGeometry(0.16, 8, 6), glow(0xffd080), { shadow: false })); f.position.copy(l.position); scene.add(f); torches.push({ l, f, x }); }
  const setTorch = (u) => torches.forEach(({ l, f }) => { l.intensity = 3.5 * u; f.visible = u > 0.05; });
  life.push((t) => torches.forEach(({ l, f, x }) => { const fl = 0.85 + Math.sin(t * 13 + x * 3) * 0.15; l.intensity *= 1; f.scale.setScalar(fl); }));
  const smoke = []; for (let k = 0; k < 26; k++) { const s = noInk(K.mesh(new THREE.SphereGeometry(0.5, 10, 8), new THREE.MeshLambertMaterial({ color: 0xbab4ac, transparent: true, opacity: 0, depthWrite: false }), { shadow: false })); scene.add(s); smoke.push(s); }
  const setSmoke = (u, t = 0) => smoke.forEach((s, k) => { const p = (t * 0.18 + k / 26) % 1; s.position.set(Math.sin(k * 2.7) * 3 + p * 1.5, 0.5 + p * 4, -4 - (k % 6) * 1.6); s.scale.setScalar(0.6 + p * 2.2); s.material.opacity = u * 0.55 * Math.sin(p * Math.PI); });
  setSmoke(0); setTorch(0);
  lights(scene, { key: 0xff9a6a, ki: 1.1, pos: [-10, 8, 6], hemi: [0xffb08a, 0x3a2030, 0.85], box: 14 });
  return { scene, life, setSmoke, setTorch };
}

// ---------------------------------------------------------------- DELHI OFFICE (the order)
export function delhiSet() {
  const T = K.stdTextures(), life = []; const panel = K.paint(256, 256, (g, w, h) => { g.fillStyle = '#6a4228'; g.fillRect(0, 0, w, h); K.mottle(g, w, h, ['#5a3420', '#7a5034'], 120, [6, 30], 81, 0.25); g.strokeStyle = 'rgba(30,15,8,.6)'; g.lineWidth = 6; g.strokeRect(14, 14, w - 28, h - 28); g.strokeStyle = 'rgba(255,220,170,.15)'; g.lineWidth = 3; g.strokeRect(22, 22, w - 44, h - 44); });
  const scene = room(T, { w: 14, d: 10, h: 6, wall: panel, floor: 0x5a3020, bg: 0x2a1a14, rep: 6 });
  const rug = K.mesh(new THREE.PlaneGeometry(7, 5), K.col(0x7a1a1e)); rug.rotation.x = -Math.PI / 2; rug.position.set(0, 0.01, -1); scene.add(rug);
  const rugB = K.mesh(new THREE.PlaneGeometry(6.4, 4.4), K.col(0xb8862a)); rugB.rotation.x = -Math.PI / 2; rugB.position.set(0, 0.015, -1); scene.add(rugB); const rugC = K.mesh(new THREE.PlaneGeometry(6.0, 4.0), K.col(0x7a1a1e)); rugC.rotation.x = -Math.PI / 2; rugC.position.set(0, 0.02, -1); scene.add(rugC);
  // window onto a domed skyline at the back
  const sky = K.paint(512, 320, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#f0b070'); gr.addColorStop(1, '#f8e0b0'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = '#b07a5a'; g.fillRect(40, 200, 440, 120); g.beginPath(); g.ellipse(260, 200, 80, 70, 0, Math.PI, 0); g.fill(); g.fillRect(250, 110, 20, 30); for (let x = 70; x < 460; x += 40) g.fillRect(x, 180, 14, 30); });
  const win = noInk(new THREE.Mesh(new THREE.PlaneGeometry(4.4, 2.6), new THREE.MeshBasicMaterial({ map: sky, toneMapped: false }))); win.position.set(2.4, 3.4, -4.95); scene.add(win);
  for (let k = 0; k < 4; k++) { const b = K.box(0.08, 2.6, 0.08, T.wood, { tileM: 1 }); b.position.set(0.9 + k * 1.0, 3.4, -4.9); scene.add(b); } const sill = K.box(4.8, 0.15, 0.3, T.wood, { tileM: 1 }); sill.position.set(2.4, 2.05, -4.85); scene.add(sill);
  
  const plaque = plane(2.6, 0.55, K.signTex(['NEW DELHI · 1959'], { bg: '#2a1a10', fg: '#e8c070', border: '#b8862a', w: 700, h: 150, font: 'Oswald', weight: 700 })); plaque.position.set(-3.6, 4.6, -4.95); scene.add(plaque);
  // tricolour on a stand
  const pole = K.mesh(new THREE.CylinderGeometry(0.04, 0.04, 3.2, 8), K.col(0xd9a521)); pole.position.set(-4.4, 1.6, -3.6); scene.add(pole); const tri = clothFlag(FLAGS.tri, 1.3, 0.86, 1); tri.position.set(-4.38, 2.8, -3.6); scene.add(tri); life.push((t) => tri.userData.wave(t, 0.4));
  const fbase = K.mesh(new THREE.CylinderGeometry(0.3, 0.36, 0.2, 12), K.col(0x2a1a10)); fbase.position.set(-4.4, 0.1, -3.6); scene.add(fbase);
  // the big desk
  const desk = new THREE.Group(); const top = K.box(4.2, 0.14, 1.8, T.wood, { tileM: 1 }); top.position.y = 1.05; desk.add(top); for (const s of [-1, 1]) { const ped = K.box(1.0, 1.0, 1.6, T.wood, { tileM: 1 }); ped.position.set(s * 1.5, 0.5, 0); desk.add(ped); }
  const green = K.box(2.4, 0.02, 1.0, null, { color: 0x2f5a3a }); green.position.y = 1.13; desk.add(green);
  const lamp = new THREE.Group(); const lb = K.mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.06, 10), K.col(0xb8862a)); lamp.add(lb); const ls = K.mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 6), K.col(0xb8862a)); ls.position.y = 0.25; lamp.add(ls); const lh = K.mesh(new THREE.CylinderGeometry(0.1, 0.24, 0.2, 12, 1, true), new THREE.MeshLambertMaterial({ color: 0x2f6a3a, side: THREE.DoubleSide })); lh.position.y = 0.5; lamp.add(lh); lamp.position.set(-1.6, 1.12, -0.4); desk.add(lamp);
  const ll = new THREE.PointLight(0xffd8a0, 1.6, 5, 1.6); ll.position.set(-1.6, 1.5, -0.4); desk.add(ll);
  for (let i = 0; i < 5; i++) { const f = K.box(0.5, 0.05, 0.36, null, { color: [0xd8b878, 0xc8a060, 0xe8d0a0][i % 3] }); f.position.set(1.5, 1.15 + i * 0.055, -0.3); desk.add(f); }
  desk.position.set(0, 0, -2.2); scene.add(desk);
  // the ballot box on the desk (the hook's victim) and the giant rubber stamp above it
  const ballot = new THREE.Group(); const bb = K.box(0.9, 0.7, 0.6, null, { color: 0x4a5a6a }); bb.position.y = 0.35; ballot.add(bb); const slot = K.box(0.4, 0.02, 0.08, null, { color: 0x1a1a1a }); slot.position.y = 0.71; ballot.add(slot);
  const lbl = plane(0.7, 0.3, K.signTex(['BALLOT 1957'], { bg: '#f4f0e6', fg: '#2a1c17', border: '#c8312c', w: 400, h: 160, font: 'Oswald', weight: 700, aged: false })); lbl.position.set(0, 0.38, 0.31); ballot.add(lbl);
  const vote = K.box(0.3, 0.36, 0.02, null, { color: 0xfbfaf6 }); vote.position.set(0, 0.86, 0); vote.rotation.z = 0.15; ballot.add(vote);
  ballot.position.set(0.2, 1.12, -2.1); scene.add(ballot);
  const stamp = new THREE.Group(); const knob = K.mesh(new THREE.SphereGeometry(0.28, 14, 10), K.col(0x7a4a2a)); knob.position.y = 1.15; stamp.add(knob); const neck = K.mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.8, 12), K.col(0x7a4a2a)); neck.position.y = 0.7; stamp.add(neck);
  const block = K.box(1.3, 0.3, 1.0, null, { color: 0x3a2a20 }); block.position.y = 0.2; stamp.add(block); const rub = K.box(1.25, 0.06, 0.95, null, { color: 0xc8281e }); rub.position.y = 0.03; stamp.add(rub); scene.add(stamp);
  const setStamp = (u) => { const y = 1.12 + 0.78 + (1 - u) * 2.6; stamp.position.set(0.2, y, -2.1); stamp.rotation.z = (1 - u) * 0.25; };
  const setBallot = (v) => { ballot.visible = v; };
  const paper = K.box(0.8, 0.012, 1.0, K.signTex(['ORDER · 356'], { bg: '#fbfaf6', fg: '#c8312c', border: '#c8312c', w: 512, h: 512, font: 'Oswald', weight: 700, aged: false }), { tileM: 1 }); scene.add(paper); paper.visible = false;
  setStamp(0);
  fan(scene, 0, 5.4, 0, life);
  lights(scene, { key: 0xffd8a8, ki: 1.15, pos: [6, 9, 6], hemi: [0xffe8c8, 0x4a2a1a, 0.9] });
  return { scene, life, desk, ballot, stamp, setStamp, setBallot, paper };
}

// ---------------------------------------------------------------- CRICKET GROUND (the analogy)
export function groundSet() {
  const T = K.stdTextures(), life = [], scene = new THREE.Scene(); scene.background = K.skyTexture({ seed: 61, clouds: 7 }); scene.fog = new THREE.Fog(0xdfeaf0, 40, 140);
  const outfield = K.mesh(new THREE.CircleGeometry(36, 60), K.col(0x5f9a3e)); outfield.rotation.x = -Math.PI / 2; scene.add(outfield);
  for (let k = 0; k < 8; k++) { const st = K.mesh(new THREE.PlaneGeometry(72, 4.5), K.col(k % 2 ? 0x6aa646 : 0x5a923a)); st.rotation.x = -Math.PI / 2; st.position.set(0, 0.01, -18 + k * 4.5); scene.add(st); }
  const pitch = K.box(2.2, 0.03, 13, null, { color: 0xd8c08a }); pitch.position.set(0, 0.02, -4); scene.add(pitch);
  for (const z of [2.2, -10.2]) { for (let k = 0; k < 3; k++) { const s = K.mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.72, 6), K.col(0xf4eed8)); s.position.set(-0.12 + k * 0.12, 0.38, z); scene.add(s); } const cr = K.box(1.8, 0.01, 0.05, null, { color: 0xfbfaf6 }); cr.position.set(0, 0.04, z + (z > 0 ? -1.2 : 1.2)); scene.add(cr); }
  const rope = K.mesh(new THREE.TorusGeometry(30, 0.08, 6, 80), K.col(0xfbfaf6)); rope.rotation.x = Math.PI / 2; rope.position.y = 0.08; scene.add(rope);
  // gallery: tiers in an arc behind the bowler's end, packed crowd that jumps
  const crowd = []; const cgeo = new THREE.SphereGeometry(0.28, 8, 6); const cols = [0xc8312c, 0xf6f1e4, 0x2f8a3a, 0xe8742a, 0x2f5f8a, 0xf6d24a, 0x8a3a5a];
  for (let r = 0; r < 5; r++) { const rad = 33 + r * 1.6, y = 0.6 + r * 1.0; const tier = K.mesh(new THREE.CylinderGeometry(rad + 0.8, rad + 0.8, 0.6, 60, 1, true, Math.PI * 0.62, Math.PI * 0.76), new THREE.MeshLambertMaterial({ color: 0x9a9a92, side: THREE.DoubleSide })); tier.position.y = y - 0.3; scene.add(tier);
    for (let k = 0; k < 70; k++) { const a = Math.PI * 0.62 + (k + 0.5) / 70 * Math.PI * 0.76; const m = K.mesh(cgeo, K.col(cols[(k * 3 + r) % cols.length]), { shadow: false }); const x = Math.sin(a) * (rad + 0.3), z = Math.cos(a) * (rad + 0.3); m.position.set(x, y + 0.3, z); m.scale.y = 1.4; scene.add(m); crowd.push({ m, y: y + 0.3, ph: k * 1.7 + r }); } }
  let noise = 0; const setNoise = (u) => { noise = u; };
  life.push((t) => crowd.forEach(({ m, y, ph }) => { m.position.y = y + Math.max(0, Math.sin(t * 9 + ph)) * 0.35 * noise; }));
  // scoreboard on the right
  const sb = canvasTex(900, 600); const board = plane(9, 6, sb.tex); board.position.set(20, 7, -26); board.rotation.y = -0.6; scene.add(board);
  const legs = K.box(9.4, 6.4, 0.3, null, { color: 0x1a2a20 }); legs.position.set(20.1, 7, -26.15); legs.rotation.y = -0.6; scene.add(legs); for (const s of [-1, 1]) { const l = K.box(0.4, 4, 0.4, null, { color: 0x3a3a3a }); l.position.set(20 + s * 3.6 * Math.cos(0.6), 2, -26 + s * 3.6 * Math.sin(0.6)); scene.add(l); }
  const setScore = (a = 'EMS XI  248/2', b = 'TARGET 180', torn = 0) => { const g = sb.g; g.clearRect(0, 0, 900, 600); g.fillStyle = '#1a2a20'; g.fillRect(0, 0, 900, 600);
    g.save(); if (torn > 0) { g.translate(450, 300); g.rotate(torn * 0.15); g.translate(-450, -300); }
    g.fillStyle = '#f6d24a'; g.font = "700 96px 'Oswald'"; g.textAlign = 'center'; g.fillText(a, 450, 220); g.fillStyle = '#f4f0e6'; g.font = "700 70px 'Oswald'"; g.fillText(b, 450, 360);
    g.restore(); if (torn > 0) { g.strokeStyle = '#d0281e'; g.lineWidth = 40; g.beginPath(); g.moveTo(80, 80); g.lineTo(80 + 740 * Math.min(1, torn * 1.4), 80 + 440 * Math.min(1, torn * 1.4)); g.stroke(); g.fillStyle = '#d0281e'; g.font = "700 120px 'Oswald'"; if (torn > 0.6) g.fillText('ABANDONED', 450, 540); }
    sb.tex.needsUpdate = true; };
  setScore();
  [[-28, -22, 10], [26, -30, 12], [-34, 6, 11], [34, 4, 10]].forEach(([x, z, h], k) => { const p = K.palm(h, 0.1, k + 170); p.position.set(x, 0, z); scene.add(p); life.push((t) => p.userData.sway?.(t)); });
  lights(scene, { key: 0xfff0d0, ki: 1.35, pos: [10, 16, 12], hemi: [0xeaf4ff, 0x5a7a3a, 1.0], box: 16 });
  return { scene, life, setScore, setNoise };
}
