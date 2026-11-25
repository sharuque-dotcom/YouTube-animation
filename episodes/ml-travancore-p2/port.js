// Vizhinjam port set (daytime): quay, STS gantry cranes, container yard, a giant container ship, tug,
// lighthouse on the headland, and a far shipping lane whose ship count can grow (1 -> 10 -> 100).
// Coordinates: quay edge at z = 0 (land z > 0, sea z < 0), quay deck y = 0, water y = -1.6.
import * as K from '../../pipeline/toon3d.js';
const THREE = K.THREE;
const WATER = -1.6;
const BOXCOLS = [0xc8312c, 0x1f5a9a, 0x2f8a5a, 0xe8a63a, 0x6a2a6a, 0xd8d0c0, 0x1f8a86, 0xc8562a, 0x3a3a48];

function containerTex() { return K.paint(128, 64, (g, w, h) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(0,0,0,.22)'; g.lineWidth = 2; for (let x = 4; x < w; x += 6) { g.beginPath(); g.moveTo(x, 3); g.lineTo(x, h - 3); g.stroke(); } g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = 4; g.strokeRect(2, 2, w - 4, h - 4); }); }
let _ctex = null;
/** instanced container stacks; list of [x,y,z,rotY,colorIndex] (y = bottom), size [L,H,W] */
function containers(list, size = [6, 2.6, 2.4]) {
  if (!_ctex) _ctex = containerTex();
  const geo = new THREE.BoxGeometry(...size); geo.translate(0, size[1] / 2, 0);
  const m = new THREE.InstancedMesh(geo, new THREE.MeshLambertMaterial({ map: _ctex }), list.length); m.castShadow = true; m.receiveShadow = true;
  const o = new THREE.Object3D(), c = new THREE.Color();
  list.forEach(([x, y, z, r, ci], i) => { o.position.set(x, y, z); o.rotation.set(0, r, 0); o.updateMatrix(); m.setMatrixAt(i, o.matrix); m.setColorAt(i, c.setHex(BOXCOLS[ci % BOXCOLS.length])); });
  return m;
}

/** a giant container ship (bow +x). length ~ L metres. */
export function containerShip({ L = 110, B = 18, name = 'മഹാറാണി', seed = 5, flagTex = null, life = null } = {}) {
  const g = new THREE.Group(), r = K.rnd(seed);
  // side profile extruded across the beam
  const sh = new THREE.Shape(); sh.moveTo(-L / 2, -5); sh.lineTo(L / 2 - 8, -5); sh.quadraticCurveTo(L / 2 + 2, -4, L / 2 + 4, 7); sh.lineTo(-L / 2 + 1, 7); sh.lineTo(-L / 2, 2); sh.closePath();
  const hg = new THREE.ExtrudeGeometry(sh, { depth: B, bevelEnabled: false }); hg.translate(0, 0, -B / 2); hg.computeVertexNormals();
  const hull = K.mesh(hg, K.col(0x2a5a9a)); g.add(hull);
  const anti = K.mesh(new THREE.BoxGeometry(L - 6, 3.2, B + 0.1), K.col(0xa83a2a)); anti.position.set(-2, -3.6, 0); g.add(anti);
  const stripe = K.mesh(new THREE.BoxGeometry(L - 4, 0.5, B + 0.12), K.col(0xf4efe4)); stripe.position.set(-1, 5.8, 0); g.add(stripe);
  // name on both sides of the bow
  const nameT = K.paint(512, 128, (c, w, h) => { c.clearRect(0, 0, w, h); c.fillStyle = '#f4efe4'; c.font = "800 84px 'Noto Malayalam'"; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(name, w / 2, h / 2 + 6); });
  for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(16, 4), new THREE.MeshBasicMaterial({ map: nameT, transparent: true, depthWrite: false })); p.userData.noInk = true; p.position.set(L / 2 - 16, 2.2, s * (B / 2 + 0.06)); if (s < 0) p.rotation.y = Math.PI; g.add(p); }
  // bridge tower near the stern
  const tower = K.box(9, 15, B - 2, null, { color: 0xf2eee4 }); tower.position.set(-L / 2 + 10, 7 + 7.5, 0); g.add(tower);
  const winT = K.paint(256, 64, (c, w, h) => { c.fillStyle = '#f2eee4'; c.fillRect(0, 0, w, h); c.fillStyle = '#1c2a3a'; for (let x = 6; x < w; x += 24) c.fillRect(x, 14, 18, 30); });
  for (const y of [11, 15, 19.5]) { const wnd = K.mesh(new THREE.BoxGeometry(9.1, 1.6, B - 1.9), new THREE.MeshLambertMaterial({ map: winT })); wnd.position.set(-L / 2 + 10, y, 0); g.add(wnd); }
  const wings = K.box(4, 1.2, B + 3, null, { color: 0xf2eee4 }); wings.position.set(-L / 2 + 11, 21, 0); g.add(wings);
  const funnel = K.box(4, 6, 4, null, { color: 0xe8b93a }); funnel.position.set(-L / 2 + 6, 24, 0); g.add(funnel);
  const fband = K.box(4.1, 1.2, 4.1, null, { color: 0x1f2a44 }); fband.position.set(-L / 2 + 6, 26.6, 0); g.add(fband);
  // containers on deck: bays along x, rows across the beam, uneven tiers
  const list = []; for (let x = -L / 2 + 20; x < L / 2 - 12; x += 6.4) { const tiers = 3 + Math.floor(r() * 4); for (let z = -B / 2 + 1.5; z <= B / 2 - 1.5; z += 2.5) { const tt = tiers - (Math.abs(z) > B / 2 - 3 ? 1 : 0); for (let k = 0; k < tt; k++) list.push([x, 7 + k * 2.6, z, 0, Math.floor(r() * 9)]); } }
  const stack = containers(list); g.add(stack);
  // stern flag pole (flag texture swapped by scene: conch / tricolour)
  const pole = K.mesh(new THREE.CylinderGeometry(0.15, 0.15, 7, 8), K.col(0xd8d0c0)); pole.position.set(-L / 2 + 1.5, 10.5, 0); g.add(pole);
  if (flagTex && life) { const f = waveFlagMesh(life, flagTex, 5, 3.4, 0.25); f.position.set(-L / 2 + 1.5, 12.2, 0); f.rotation.y = Math.PI; g.add(f); g.userData.flag = f; }
  // bow wave foam (additive, follows the ship when it moves)
  const foam = new THREE.Mesh(new THREE.PlaneGeometry(10, B + 6), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false })); foam.userData.noInk = true; foam.rotation.x = -Math.PI / 2; foam.position.set(L / 2, -4.9, 0); g.add(foam); g.userData.foam = foam;
  g.userData.L = L; return g;
}

export function waveFlagMesh(life, tex, w, h, amp = 0.08) {
  const geo = new THREE.PlaneGeometry(w, h, 12, 1); geo.translate(w / 2, 0, 0); const m = K.mesh(geo, new THREE.MeshLambertMaterial({ map: tex, side: THREE.DoubleSide }), { shadow: false }); const p0 = geo.attributes.position.array.slice();
  life.push((t) => { const a = geo.attributes.position; for (let i = 0; i < a.count; i++) { const x = p0[i * 3]; a.setZ(i, Math.sin(x * 5 / w * 1.5 - t * 4) * amp * x / w * (w / 1.1)); } a.needsUpdate = true; geo.computeVertexNormals(); }); return m;
}
export const tricolourTex = () => K.paint(360, 240, (g, w, h) => { g.fillStyle = '#ff9933'; g.fillRect(0, 0, w, h / 3); g.fillStyle = '#ffffff'; g.fillRect(0, h / 3, w, h / 3); g.fillStyle = '#138808'; g.fillRect(0, 2 * h / 3, w, h / 3);
  g.strokeStyle = '#000080'; g.lineWidth = 4; g.beginPath(); g.arc(w / 2, h / 2, 32, 0, 7); g.stroke(); for (let k = 0; k < 24; k++) { const a = (k / 24) * Math.PI * 2; g.beginPath(); g.moveTo(w / 2, h / 2); g.lineTo(w / 2 + Math.cos(a) * 32, h / 2 + Math.sin(a) * 32); g.lineWidth = 1.6; g.stroke(); } g.fillStyle = '#000080'; g.beginPath(); g.arc(w / 2, h / 2, 6, 0, 7); g.fill();
  g.strokeStyle = '#2a1c17'; g.lineWidth = 8; g.strokeRect(4, 4, w - 8, h - 8); });
export const conchTex = () => K.paint(300, 200, (g, w, h) => { g.fillStyle = '#c8312c'; g.fillRect(0, 0, w, h); g.fillStyle = '#f4efe4'; g.beginPath(); g.ellipse(w / 2, h / 2, 34, 48, 0.3, 0, 7); g.fill(); g.strokeStyle = '#c8312c'; g.lineWidth = 6; g.beginPath(); g.arc(w / 2, h / 2, 20, 0.5, 5); g.stroke(); g.strokeStyle = '#2a1c17'; g.lineWidth = 8; g.strokeRect(4, 4, w - 8, h - 8); });

/** ship-to-shore gantry crane; boom reaches out over the sea (-z). trolley u: 0 = over land, 1 = boom tip */
function stsCrane(seed) {
  const g = new THREE.Group(), white = 0xeeeeea, red = 0xd8382a;
  for (const x of [-6, 6]) for (const z of [1.5, 14]) { const l = K.box(1, 26, 1, null, { color: red }); l.position.set(x, 13, z); g.add(l); const bog = K.box(1.8, 1, 2.2, null, { color: 0x3a3a40 }); bog.position.set(x, 0.5, z); g.add(bog); }
  for (const z of [1.5, 14]) { const b = K.box(13, 1.6, 1.2, null, { color: red }); b.position.set(0, 26, z); g.add(b); const b2 = K.box(13, 1, 1, null, { color: red }); b2.position.set(0, 9, z); g.add(b2); }
  for (const x of [-6, 6]) { const s = K.box(1, 1, 12.5, null, { color: red }); s.position.set(x, 9, 7.75); g.add(s); }
  const boom = K.box(3, 2, 58, null, { color: white }); boom.position.set(0, 27.8, -14); g.add(boom);
  const apex = K.box(1, 12, 1, null, { color: white }); apex.position.set(0, 34, 7.75); g.add(apex);
  for (const [z1, y1] of [[-38, 28.6], [24, 28.6]]) { const len = Math.hypot(7.75 - z1, 40 - y1); const st = K.mesh(new THREE.CylinderGeometry(0.15, 0.15, len, 6), K.col(0x3a3a40), { shadow: false }); st.position.set(0, (40 + y1) / 2, (7.75 + z1) / 2); st.rotation.x = Math.atan2(7.75 - z1, 40 - y1); g.add(st); }
  const house = K.box(4, 3.4, 6, null, { color: white }); house.position.set(0, 30.5, 18); g.add(house);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(10, 1.6), new THREE.MeshLambertMaterial({ map: K.signTex(['VIZHINJAM'], { w: 512, h: 90, bg: '#eeeeea', fg: '#1f3a6a', border: '#eeeeea', font: 'Oswald', weight: 700, aged: false }) })); sign.position.set(0, 27.8, -14 + 29.05); sign.rotation.y = 0; sign.position.z = 15.1; g.add(sign);
  const trolley = K.box(3.4, 1.4, 3.2, null, { color: 0x3a3a40 }); g.add(trolley);
  const cable = K.mesh(new THREE.CylinderGeometry(0.06, 0.06, 1, 4), K.col(0x2a2a2a), { shadow: false }); g.add(cable);
  const spreader = K.box(6.4, 0.5, 2.6, null, { color: 0xe8b93a }); g.add(spreader);
  const box = containers([[0, -2.6, 0, 0, seed]]); g.add(box);
  g.userData.set = (u, drop, carry = true) => { const z = 6 - u * 40, y = 26.6 - drop; trolley.position.set(0, 26.4, z); spreader.position.set(0, y, z); cable.position.set(0, (26 + y) / 2, z); cable.scale.y = Math.max(0.1, 26 - y); box.visible = carry; box.position.set(0, y - 0.25, z); };
  g.userData.set(0.3, 8, true); return g;
}

function lighthouse() {
  const g = new THREE.Group(); const T = K.paint(64, 256, (c, w, h) => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#f4efe4' : '#c8312c'; c.fillRect(0, i * h / 8, w, h / 8); } });
  const tw = K.mesh(new THREE.CylinderGeometry(2.2, 3.2, 26, 20), new THREE.MeshLambertMaterial({ map: T })); tw.position.y = 13; g.add(tw);
  const gal = K.mesh(new THREE.CylinderGeometry(3.2, 3.2, 0.6, 20), K.col(0x2a2a30)); gal.position.y = 26.3; g.add(gal);
  const lamp = K.mesh(new THREE.CylinderGeometry(1.6, 1.6, 2.6, 16), new THREE.MeshBasicMaterial({ color: 0xfff2b0 })); lamp.position.y = 27.9; g.add(lamp);
  const cap = K.mesh(new THREE.ConeGeometry(2.2, 2, 16), K.col(0xc8312c)); cap.position.y = 30.2; g.add(cap); return g;
}

export function portSet() {
  const T = K.stdTextures(), scene = new THREE.Scene(), life = [];
  scene.background = K.skyTexture({ seed: 33, clouds: 7, top: '#4f95e0', mid: '#94c8f0', bottom: '#eef0e4' });
  scene.fog = new THREE.Fog(0xdfeaf0, 220, 900);
  // sea
  const sgeo = new THREE.PlaneGeometry(1000, 520, 140, 70); const sea = K.mesh(sgeo, new THREE.MeshLambertMaterial({ color: 0x2f8ab0, emissive: 0x16506a, emissiveIntensity: 0.5 }), { shadow: false }); sea.rotation.x = -Math.PI / 2; sea.position.set(0, WATER, -255); scene.add(sea);
  const sp0 = sgeo.attributes.position.array.slice(); life.push((t) => { const a = sgeo.attributes.position; for (let i = 0; i < a.count; i++) { const x = sp0[i * 3], y = sp0[i * 3 + 1]; a.setZ(i, Math.sin(x * 0.08 + t * 1.1) * 0.25 + Math.sin(y * 0.11 - t * 0.9) * 0.2); } a.needsUpdate = true; sgeo.computeVertexNormals(); });
  // quay deck + land
  const conc = K.paint(512, 512, (g, w, h) => { g.fillStyle = '#b8b4aa'; g.fillRect(0, 0, w, h); K.mottle(g, w, h, ['#a8a49a', '#c8c4b8', '#9a968c'], 500, [8, 40], 41, 0.25); g.strokeStyle = 'rgba(60,60,60,.35)'; g.lineWidth = 3; for (let x = 0; x <= w; x += 128) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); g.beginPath(); g.moveTo(0, x); g.lineTo(w, x); g.stroke(); } });
  conc.repeat.set(30, 12);
  const deck = K.mesh(new THREE.BoxGeometry(400, 4, 160), [K.col(0x8a867c), K.col(0x8a867c), new THREE.MeshLambertMaterial({ map: conc }), K.col(0x8a867c), K.col(0x6a665c), K.col(0x8a867c)]); deck.position.set(0, -2, 80); scene.add(deck);
  // yellow lane lines and crane rails
  for (const z of [1.5, 14]) { const rl = K.mesh(new THREE.BoxGeometry(400, 0.08, 0.3), K.col(0x4a4a50), { shadow: false }); rl.position.set(0, 0.04, z); scene.add(rl); }
  for (const z of [3.2, 8, 17]) { const ln = K.mesh(new THREE.PlaneGeometry(400, 0.25), new THREE.MeshLambertMaterial({ color: 0xf2c418 }), { shadow: false }); ln.rotation.x = -Math.PI / 2; ln.position.set(0, 0.02, z); scene.add(ln); }
  // fenders + bollards on the edge
  for (let x = -190; x < 190; x += 9) { const f = K.mesh(new THREE.CylinderGeometry(0.7, 0.7, 2.4, 10), K.col(0x1a1a1e)); f.rotation.z = Math.PI / 2; f.position.set(x, -1.6, -0.5); scene.add(f); }
  for (let x = -60; x < 60; x += 12) { const b = K.mesh(new THREE.CylinderGeometry(0.28, 0.34, 0.7, 10), K.col(0x2a2a30)); b.position.set(x + 3, 0.35, 0.8); scene.add(b); const cap = K.mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.14, 10), K.col(0x2a2a30)); cap.position.set(x + 3, 0.72, 0.8); scene.add(cap); }
  // cranes along the quay
  const cranes = []; [-62, -30, 2, 34].forEach((x, i) => { const c = stsCrane(i * 2 + 1); c.position.set(x, 0, 0); scene.add(c); cranes.push(c); });
  // container yard behind
  { const r = K.rnd(8), list = []; for (let bx = -110; bx < 110; bx += 7) for (let bz = 24; bz < 60; bz += 2.8) { if (Math.abs(bx - 6) < 8 && bz < 40) continue; const n = 1 + Math.floor(r() * 4); for (let k = 0; k < n; k++) list.push([bx, k * 2.6, bz, 0, Math.floor(r() * 9)]); } scene.add(containers(list)); }
  // straddle carrier / truck
  const truck = new THREE.Group(); { const cab = K.box(2.2, 2.2, 2.4, null, { color: 0x1f8a86 }); cab.position.set(3.4, 1.6, 0); truck.add(cab); const win = K.box(0.1, 0.8, 2, null, { color: 0x1c2a3a }); win.position.set(4.52, 2.1, 0); truck.add(win); const bed = K.box(7, 0.4, 2.4, null, { color: 0x3a3a40 }); bed.position.set(-1.2, 0.9, 0); truck.add(bed);
    for (const x of [-3.5, -1, 3.4]) for (const z of [-1.1, 1.1]) { const w = K.mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.4, 12), K.col(0x1a1a1e)); w.rotation.x = Math.PI / 2; w.position.set(x, 0.5, z); truck.add(w); }
    truck.add(containers([[-1.2, 1.1, 0, 0, 3]])); }
  truck.position.set(-20, 0, 10.5); scene.add(truck);
  // port office with the big sign + control tower
  const off = K.box(18, 7, 8, T.lime, { tileM: 3 }); off.position.set(14, 3.5, 30); scene.add(off);
  const sgn = new THREE.Mesh(new THREE.PlaneGeometry(16, 3.2), new THREE.MeshLambertMaterial({ map: K.signTex(['വിഴിഞ്ഞം തുറമുഖം'], { w: 1024, h: 200, bg: '#1f3a6a', fg: '#f4efe4', border: '#e8b93a', aged: false }) })); sgn.position.set(14, 8.8, 25.9); scene.add(sgn);
  const ctw = K.box(4, 18, 4, T.lime, { tileM: 3 }); ctw.position.set(26, 9, 31); scene.add(ctw); const cab = K.box(7, 3, 7, null, { color: 0x6aa8c8 }); cab.position.set(26, 19.5, 31); scene.add(cab); const roof = K.box(8, 0.6, 8, null, { color: 0xf2eee4 }); roof.position.set(26, 21.3, 31); scene.add(roof);
  // headland with the lighthouse and palms (Vizhinjam's real red/white lighthouse sits on the cliff)
  const hill = K.mesh(new THREE.SphereGeometry(40, 24, 14, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshLambertMaterial({ map: T.grass })); hill.scale.set(1.4, 0.55, 1); hill.position.set(-150, -2, 40); scene.add(hill);
  const lh = lighthouse(); lh.position.set(-140, 20, 36); scene.add(lh);
  const palms = []; [[-120, 20, 9], [-110, 26, 10], [-128, 12, 9], [60, 50, 9], [72, 56, 10], [84, 48, 9], [-80, 62, 10], [100, 64, 9]].forEach(([x, z, h], i) => { const p = K.palm(h, 0.2 + (i % 3) * 0.1, i + 60); const hy = x < -100 ? Math.max(0, 20 - Math.hypot(x + 150, z - 40) * 0.45) : 0; p.position.set(x, hy, z); p.scale.setScalar(1.6); scene.add(p); palms.push(p); });
  life.push((t) => palms.forEach((p) => p.userData.sway(t)));
  const hills = K.mesh(new THREE.SphereGeometry(120, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2), K.col(0x6f9a4e)); hills.scale.set(2.4, 0.3, 0.6); hills.position.set(40, -4, 230); scene.add(hills);
  // flag poles on the quay: Travancore conch flag + Indian tricolour (raised by the scene)
  const flags = {}; for (const [k, tex, x] of [['conch', conchTex(), -9], ['india', tricolourTex(), -5]]) { const grp = new THREE.Group(); const pole = K.mesh(new THREE.CylinderGeometry(0.06, 0.08, 6.5, 8), K.col(0xd8d0c0)); pole.position.y = 3.25; grp.add(pole); const ball = K.mesh(new THREE.SphereGeometry(0.12, 10, 8), K.col(0xd8a63a)); ball.position.y = 6.6; grp.add(ball);
    const f = waveFlagMesh(life, tex, 1.6, 1.07, 0.12); f.position.set(0.06, 5.9, 0); grp.add(f); grp.position.set(x, 0, 5.5); scene.add(grp); flags[k] = { grp, f }; }
  // the giant ship at the berth + tug
  const ship = containerShip({ L: 120, B: 18, flagTex: tricolourTex(), life }); ship.position.set(0, WATER, -13); scene.add(ship);
  const tug = new THREE.Group(); { const h = K.box(12, 3, 5, null, { color: 0xc8562a }); h.position.y = 0.5; tug.add(h); const c2 = K.box(5, 3, 4, null, { color: 0xf2eee4 }); c2.position.set(-1, 3.5, 0); tug.add(c2); const fn = K.box(1.2, 2, 1.2, null, { color: 0x1f2a44 }); fn.position.set(-2.5, 6, 0); tug.add(fn); const tyre = K.mesh(new THREE.TorusGeometry(0.8, 0.35, 8, 16), K.col(0x1a1a1e)); tyre.position.set(6.2, 0.8, 0); tyre.rotation.y = Math.PI / 2; tug.add(tyre); }
  tug.position.set(72, WATER, -24); tug.rotation.y = 0.3; scene.add(tug);
  life.push((t) => { tug.position.y = WATER + Math.sin(t * 1.4) * 0.25; tug.rotation.z = Math.sin(t * 1.1) * 0.03; });
  // shipping lane: up to 100 ships far out at sea
  const LN = 100, laneGeo = [new THREE.BoxGeometry(28, 5, 6), new THREE.BoxGeometry(18, 4, 5), new THREE.BoxGeometry(4, 8, 5)], laneMat = [K.col(0x1f2a44), new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: false }), K.col(0xf2eee4)];
  const lane = laneGeo.map((g2, k) => { const m = new THREE.InstancedMesh(g2, laneMat[k], LN); m.castShadow = false; m.count = 0; scene.add(m); return m; });
  { const c = new THREE.Color(); for (let i = 0; i < LN; i++) lane[1].setColorAt(i, c.setHex(BOXCOLS[i % 9])); }
  const laneR = K.rnd(17), lanePos = []; for (let i = 0; i < LN; i++) lanePos.push([-420 + laneR() * 840, -150 - (i % 6) * 32 - laneR() * 14, laneR() < 0.5 ? 1 : -1, 6 + laneR() * 6]);
  lanePos[0] = [-10, -130, 1, 0.4];
  const o = new THREE.Object3D();
  const setLane = (n, t) => { lane.forEach((m) => { m.count = n; }); for (let i = 0; i < n; i++) { const [x0, z, dir, sp] = lanePos[i]; const x = ((x0 + dir * sp * t + 420) % 840 + 840) % 840 - 420; const parts = [[0, 0.5, 0], [-1, 5, 0], [-11, 6.5, 0]];
    parts.forEach(([dx, dy], k) => { o.position.set(x + dir * dx, WATER + dy, z); o.rotation.set(0, dir > 0 ? 0 : Math.PI, 0); o.updateMatrix(); lane[k].setMatrixAt(i, o.matrix); lane[k].instanceMatrix.needsUpdate = true; }); } };
  // the dashed "10 nautical miles" line from the quay to the lane (shown by the scene)
  const dashT = K.paint(64, 512, (g, w, h) => { g.clearRect(0, 0, w, h); for (let y = 0; y < h; y += 64) { g.fillStyle = '#ffe070'; g.fillRect(8, y, w - 16, 40); } });
  const dash = new THREE.Mesh(new THREE.PlaneGeometry(3, 150), new THREE.MeshBasicMaterial({ map: dashT, transparent: true, depthWrite: false })); dash.userData.noInk = true; dash.rotation.x = -Math.PI / 2; dash.position.set(10, WATER + 0.6, -95); dash.visible = false; scene.add(dash);
  // sun + sky light
  const sun = new THREE.DirectionalLight(0xfff0d0, 1.6); sun.position.set(-60, 90, 70); sun.target.position.set(0, 0, -10); scene.add(sun, sun.target); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0006; Object.assign(sun.shadow.camera, { left: -90, right: 90, top: 90, bottom: -90, near: 1, far: 300 });
  scene.add(new THREE.HemisphereLight(0xcfe6ff, 0xb8a888, 1.0));
  return { scene, life, ship, cranes, tug, truck, flags, lane, setLane, dash, WATER };
}
