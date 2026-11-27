// ISRO spy case 1994 sets (all our own; the court and the chayakkada are reused from ml-padmanabha / ml-lottery).
// labSet(): ISRO propulsion lab: the cryogenic engine on a stand with frost and cold vapour, blueprint boards, a
//   "CRYOGENIC" sign, test-bench pipes. API: setFrost(u), setFire(u, t) (engine plume for the what-if), board.
// stationSet(): 1994 police station: desk with a rotary phone and files, the "police story" chalkboard (arrows to two
//   silhouettes and a map pin), a lock-up with bars and a day counter on the wall. API: setDays(n), setStory(u), cell.
// kitchenSet(): the biryani analogy: a home kitchen with a cold stove, an EMPTY handi and a spice shelf. API: setCold(u).
// padSet(): night launch pad by the sea: a tall three-stage GSLV-style rocket on a tower, floodlights, a foreign
//   rocket on a far pad. API: setLaunch(u, t), rocket, far (foreign rocket), sat.
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
function lights(scene, { key = 0xfff0d0, ki = 1.3, pos = [6, 9, 8], hemi = [0xfff4e0, 0x8a6a4a, 1.05] } = {}) {
  const sun = new THREE.DirectionalLight(key, ki); sun.position.set(...pos); sun.target.position.set(0, 0, -2); scene.add(sun, sun.target); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0005;
  Object.assign(sun.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: 1, far: 40 }); scene.add(new THREE.HemisphereLight(...hemi)); return sun;
}

// ---------- the cryogenic engine: chamber + bell nozzle + pipes, frosted
export function engine({ scale = 1 } = {}) {
  const g = new THREE.Group(), M = K.col(0xc8ccd4), D = K.col(0x8a909a), Cu = K.col(0xc8823a);
  const dome = K.mesh(new THREE.SphereGeometry(0.42, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2), M); dome.position.y = 2.2; g.add(dome);
  const ch = K.mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.7, 18), M); ch.position.y = 1.85; g.add(ch);
  const throat = K.mesh(new THREE.CylinderGeometry(0.42, 0.22, 0.35, 18), D); throat.position.y = 1.33; g.add(throat);
  const bell = K.mesh(new THREE.CylinderGeometry(0.22, 0.85, 1.2, 24, 1, true), new THREE.MeshLambertMaterial({ color: 0xb0b6c0, side: THREE.DoubleSide })); bell.position.y = 0.55; g.add(bell);
  for (let k = 0; k < 8; k++) { const r = K.mesh(new THREE.TorusGeometry(0.3 + k * 0.07, 0.015, 6, 28), Cu); r.rotation.x = Math.PI / 2; r.position.y = 1.1 - k * 0.15; g.add(r); }
  for (const s of [-1, 1]) { const p = K.mesh(new THREE.TorusGeometry(0.45, 0.05, 8, 20, Math.PI), Cu); p.position.set(s * 0.45, 2.0, 0); p.rotation.y = Math.PI / 2; p.rotation.z = s > 0 ? 0 : Math.PI; g.add(p);
    const tank = K.mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.6, 12), s > 0 ? K.col(0x2f5f9a) : K.col(0xe8742a)); tank.position.set(s * 0.75, 2.4, 0.2); g.add(tank); }
  const frost = []; for (let k = 0; k < 26; k++) { const f = noInk(K.mesh(new THREE.SphereGeometry(0.05 + (k % 3) * 0.02, 6, 5), glow(0xe8f6ff, 0.9), { shadow: false })); const a = k * 2.4, y = 0.2 + (k % 9) * 0.22; f.position.set(Math.cos(a) * (0.4 + (y < 1.2 ? (1.2 - y) * 0.4 : 0)), y, Math.sin(a) * 0.45); g.add(f); frost.push(f); }
  const plume = noInk(K.mesh(new THREE.ConeGeometry(0.8, 4, 20, 1, true), new THREE.MeshBasicMaterial({ color: 0xbfe4ff, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }), { shadow: false }));
  plume.rotation.x = Math.PI; plume.position.y = -2.0; g.add(plume);
  const core = noInk(K.mesh(new THREE.ConeGeometry(0.4, 2.4, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }), { shadow: false })); core.rotation.x = Math.PI; core.position.y = -1.2; g.add(core);
  g.scale.setScalar(scale);
  g.setFrost = (u) => frost.forEach((f) => { f.visible = u > 0.05; f.scale.setScalar(Math.max(0.01, u)); });
  g.setFire = (u, t = 0) => { plume.material.opacity = 0.55 * u; core.material.opacity = 0.9 * u; const fl = 1 + Math.sin(t * 40) * 0.06; plume.scale.set(fl, 1 + u * 0.3, fl); core.scale.set(fl, 1, fl); };
  return g;
}

// ---------- a GSLV-style launcher: core stage + 4 strap-ons + upper (cryogenic) stage + payload fairing
export function gslv({ scale = 1 } = {}) {
  const g = new THREE.Group(), W = K.col(0xf2f2ee), O = K.col(0xe8742a), G = K.col(0x9aa0aa), B = K.col(0x2a2a30);
  const core = K.mesh(new THREE.CylinderGeometry(0.42, 0.42, 6, 20), W); core.position.y = 3; g.add(core);
  for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 4, b = K.mesh(new THREE.CylinderGeometry(0.2, 0.2, 3.6, 14), O); b.position.set(Math.cos(a) * 0.62, 1.8, Math.sin(a) * 0.62); g.add(b);
    const n = K.mesh(new THREE.ConeGeometry(0.2, 0.6, 14), O); n.position.set(Math.cos(a) * 0.62, 3.9, Math.sin(a) * 0.62); g.add(n); }
  const s2 = K.mesh(new THREE.CylinderGeometry(0.42, 0.42, 2.2, 20), W); s2.position.y = 7.1; g.add(s2);
  const band = K.mesh(new THREE.CylinderGeometry(0.43, 0.43, 0.2, 20), B); band.position.y = 6.05; g.add(band);
  const cryo = K.mesh(new THREE.CylinderGeometry(0.42, 0.42, 1.6, 20), K.col(0xd8e8f4)); cryo.position.y = 9.0; g.add(cryo);
  const fair = K.mesh(new THREE.CylinderGeometry(0.55, 0.42, 1.6, 20), W); fair.position.y = 10.6; g.add(fair);
  const nose = K.mesh(new THREE.ConeGeometry(0.55, 1.3, 20), W); nose.position.y = 12.05; g.add(nose);
  const flag = K.box(0.02, 0.5, 0.3, null, { color: 0xe8742a }); flag.position.set(0.43, 5.2, 0); g.add(flag); const fl2 = K.box(0.02, 0.5, 0.3, null, { color: 0x2f8a3a }); fl2.position.set(0.43, 4.7, 0); g.add(fl2);
  const flame = noInk(K.mesh(new THREE.ConeGeometry(1.1, 5, 18, 1, true), new THREE.MeshBasicMaterial({ color: 0xffb040, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }), { shadow: false }));
  flame.rotation.x = Math.PI; flame.position.y = -2.4; g.add(flame);
  g.scale.setScalar(scale); g.flame = flame; return g;
}

export function labSet() {
  const T = K.stdTextures(), life = []; const scene = room(T, { w: 14, d: 11, h: 6, wall: T.limeBlue, floor: 0x9aa4a8, bg: 0xdfe8ec, rep: 4 });
  // epoxy floor stripes
  for (const x of [-2.2, 2.2]) { const st = K.mesh(new THREE.PlaneGeometry(0.12, 10), K.col(0xe8c83a)); st.rotation.x = -Math.PI / 2; st.position.set(x, 0.005, 0); scene.add(st); }
  // engine on a stand
  const stand = K.box(2.2, 0.5, 2.2, null, { color: 0x3a4250 }); stand.position.set(0, 0.25, -2); scene.add(stand);
  for (const s of [-1, 1]) { const post = K.box(0.14, 3.6, 0.14, null, { color: 0xe8c83a }); post.position.set(s * 1.1, 2.3, -2); scene.add(post); }
  const beam = K.box(2.4, 0.16, 0.16, null, { color: 0xe8c83a }); beam.position.set(0, 4.1, -2); scene.add(beam);
  const eng = engine({ scale: 1.05 }); eng.position.set(0, 1.05, -2); scene.add(eng);
  // cold vapour puffs drifting off the engine
  const vap = []; for (let k = 0; k < 10; k++) { const v = noInk(K.mesh(new THREE.SphereGeometry(0.28, 10, 8), glow(0xf4fbff, 0.35), { shadow: false })); scene.add(v); vap.push(v); }
  life.push((t) => vap.forEach((v, k) => { const u = (t * 0.25 + k / 10) % 1; v.position.set(Math.sin(k * 3.1) * (0.5 + u * 1.2), 1.4 - u * 1.2 + 0.1, -2 + Math.cos(k * 2.3) * 0.5 + u * 0.6); v.scale.setScalar(0.6 + u * 1.6); v.material.opacity = 0.35 * (1 - u); }));
  // blueprint boards and the sign
  const bp = K.paint(900, 600, (g, w, h) => { g.fillStyle = '#1f4f8a'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 2; for (let x = 0; x < w; x += 40) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y < h; y += 40) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    g.strokeStyle = '#f4f8ff'; g.lineWidth = 6; g.beginPath(); g.moveTo(380, 80); g.lineTo(520, 80); g.lineTo(520, 220); g.lineTo(560, 280); g.lineTo(640, 520); g.lineTo(260, 520); g.lineTo(340, 280); g.lineTo(380, 220); g.closePath(); g.stroke();
    g.beginPath(); g.moveTo(340, 280); g.lineTo(560, 280); g.stroke(); g.font = "700 44px 'Oswald'"; g.fillStyle = '#f4f8ff'; g.fillText('LH2', 120, 160); g.fillText('LOX', 700, 160); g.fillText('−253°C', 90, 420); g.lineWidth = 3; g.strokeRect(20, 20, w - 40, h - 40); });
  const board = plane(4.2, 2.8, bp); board.position.set(-4.4, 2.9, -5.45); scene.add(board); const board2 = plane(3.2, 2.2, bp); board2.position.set(4.6, 3.0, -5.45); scene.add(board2);
  const sign = plane(5.6, 0.95, K.signTex(['CRYOGENIC ENGINE PROJECT', 'ക്രയോജനിക് എഞ്ചിൻ'], { w: 900, h: 160, bg: '#16306a', fg: '#f4ecd6', border: '#e8742a', font: 'Oswald', weight: 700 })); sign.position.set(0, 5.2, -5.44); scene.add(sign);
  // side benches with tools, pipes along the back wall
  for (const s of [-1, 1]) { const b = K.box(2.6, 0.9, 1.0, null, { color: 0x6a7a8a }); b.position.set(s * 5.4, 0.45, 0.5); scene.add(b); const top = K.box(2.7, 0.06, 1.1, T.wood, { tileM: 1 }); top.position.set(s * 5.4, 0.93, 0.5); scene.add(top);
    const gauge = K.mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.08, 16), K.col(0xf4f0e6)); gauge.rotation.x = Math.PI / 2; gauge.position.set(s * 5.0, 1.25, 0.3); scene.add(gauge); }
  for (const [y, c] of [[0.6, 0x2f5f9a], [0.9, 0xe8742a]]) { const p = K.mesh(new THREE.CylinderGeometry(0.07, 0.07, 14, 10), K.col(c)); p.rotation.z = Math.PI / 2; p.position.set(0, y, -5.3); scene.add(p); }
  const lampL = new THREE.PointLight(0xdff0ff, 2.2, 9, 1.5); lampL.position.set(0, 4.6, -0.5); scene.add(lampL);
  lights(scene, { key: 0xf4f8ff, ki: 1.2, pos: [-6, 10, 8], hemi: [0xf0f6ff, 0x6a7a8a, 1.1] });
  eng.setFrost(1); eng.setFire(0);
  return { scene, life, engine: eng, board, setFrost: eng.setFrost, setFire: eng.setFire, vap };
}

export function stationSet() {
  const T = K.stdTextures(), life = []; const scene = room(T, { w: 14, d: 10, h: 5.5, wall: T.limeYellow, floor: 0x6a5a4a, bg: 0x3a3028, rep: 4 });
  const dado = K.box(14, 1.4, 0.06, null, { color: 0x2f5f4a }); dado.position.set(0, 0.7, -4.96); scene.add(dado);
  // desk, rotary phone, files, a hanging bulb
  const desk = new THREE.Group(); const top = K.box(3.0, 0.1, 1.4, T.wood, { tileM: 1 }); top.position.y = 1.0; desk.add(top); const front = K.box(3.0, 0.95, 0.08, T.wood, { tileM: 1 }); front.position.set(0, 0.5, 0.66); desk.add(front);
  const phone = K.box(0.4, 0.18, 0.3, null, { color: 0x1a1a1a }); phone.position.set(-1.0, 1.14, 0); desk.add(phone);
  for (let i = 0; i < 7; i++) { const f = K.box(0.5, 0.06, 0.36, null, { color: [0xd8b878, 0xc8a060, 0xe8d0a0][i % 3] }); f.position.set(0.9, 1.08 + i * 0.065, 0); f.rotation.y = (i % 3 - 1) * 0.08; desk.add(f); }
  desk.position.set(-2.4, 0, -1.6); scene.add(desk);
  const bulbW = K.mesh(new THREE.CylinderGeometry(0.01, 0.01, 1.4, 4), K.col(0x1a1a1a)); bulbW.position.set(-2.4, 4.8, -1.6); scene.add(bulbW);
  const bulb = noInk(K.mesh(new THREE.SphereGeometry(0.16, 10, 8), glow(0xffe4a0), { shadow: false })); bulb.position.set(-2.4, 4.0, -1.6); scene.add(bulb);
  const bl = new THREE.PointLight(0xffc880, 2.5, 8, 1.5); bl.position.copy(bulb.position); scene.add(bl);
  life.push((t) => { const sw = Math.sin(t * 1.3) * 0.08; bulb.position.x = -2.4 + sw; bl.position.x = bulb.position.x; });
  // the "police story" chalkboard: drawn live (arrows from ISRO -> two silhouettes -> map pin)
  const cb = canvasTex(1000, 640); const board = plane(4.4, 2.8, cb.tex); board.position.set(-2.2, 2.9, -4.92); scene.add(board);
  const frame = K.box(4.6, 3.0, 0.05, T.wood, { tileM: 1 }); frame.position.set(-2.2, 2.9, -4.97); scene.add(frame);
  const drawStory = (u) => { const g = cb.g, w = 1000, h = 640; g.fillStyle = '#1e3a2a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#f4f0e6'; g.fillStyle = '#f4f0e6'; g.lineWidth = 7; g.lineCap = 'round';
    g.font = "800 58px 'Noto Malayalam'"; g.textAlign = 'center'; g.fillText('പോലീസിന്റെ കഥ', w / 2, 80);
    const box = (x, y, txt) => { g.strokeRect(x - 110, y - 55, 220, 110); g.font = "700 46px 'Oswald'"; g.fillText(txt, x, y + 16); };
    if (u > 0.05) box(160, 330, 'ISRO');
    const arrow = (x0, y0, x1, y1, k) => { if (k <= 0) return; const x = x0 + (x1 - x0) * k, y = y0 + (y1 - y0) * k; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x, y); g.stroke(); if (k > 0.95) { const a = Math.atan2(y1 - y0, x1 - x0); g.beginPath(); g.moveTo(x1, y1); g.lineTo(x1 - 30 * Math.cos(a - 0.4), y1 - 30 * Math.sin(a - 0.4)); g.moveTo(x1, y1); g.lineTo(x1 - 30 * Math.cos(a + 0.4), y1 - 30 * Math.sin(a + 0.4)); g.stroke(); } };
    const k1 = Math.min(1, Math.max(0, (u - 0.15) / 0.3)), k2 = Math.min(1, Math.max(0, (u - 0.55) / 0.3));
    arrow(270, 330, 410, 330, k1); if (k1 >= 1) { for (const dx of [-45, 45]) { g.beginPath(); g.arc(500 + dx, 290, 30, 0, 7); g.fill(); g.beginPath(); g.moveTo(500 + dx - 45, 400); g.quadraticCurveTo(500 + dx, 300, 500 + dx + 45, 400); g.fill(); } g.font = "700 36px 'Oswald'"; g.fillText('? ?', 500, 460); }
    arrow(590, 330, 760, 330, k2); if (k2 >= 1) { g.font = "800 50px 'Noto Malayalam'"; g.fillText('പാകിസ്ഥാൻ?', 850, 345); }
    if (u > 0.95) { g.strokeStyle = '#e8c83a'; g.lineWidth = 5; g.beginPath(); g.ellipse(w / 2, 340, 470, 170, 0, 0, 7); g.stroke(); }
    cb.tex.needsUpdate = true; };
  drawStory(0);
  // lock-up: back-right corner, bars, bench, a chalk day counter on the wall
  const cell = new THREE.Group(); scene.add(cell); cell.position.set(3.6, 0, -2.6);
  const cellFloor = K.box(5.4, 0.04, 4.6, null, { color: 0x4a3e34 }); cellFloor.position.y = 0.02; cell.add(cellFloor);
  const bars = new THREE.Group(); for (let i = 0; i < 15; i++) { const b = K.mesh(new THREE.CylinderGeometry(0.035, 0.035, 4.2, 8), K.col(0x3a3a40)); b.position.set(-2.6 + i * 0.37, 2.1, 2.3); bars.add(b); }
  for (const y of [0.2, 2.2, 4.1]) { const r = K.box(5.4, 0.08, 0.08, null, { color: 0x3a3a40 }); r.position.set(0, y, 2.3); bars.add(r); } cell.add(bars);
  const cbench = K.box(2.2, 0.45, 0.7, null, { color: 0x6a6a6a }); cbench.position.set(0.4, 0.22, -1.6); cell.add(cbench);
  const tally = canvasTex(600, 400); const tallyP = plane(2.4, 1.6, tally.tex); tallyP.position.set(0.4, 2.6, -2.25); cell.add(tallyP);
  const setDays = (n) => { const g = tally.g; g.clearRect(0, 0, 600, 400); g.strokeStyle = 'rgba(250,246,236,.92)'; g.lineWidth = 6; g.lineCap = 'round'; const m = Math.min(50, Math.floor(n));
    for (let i = 0; i < m; i++) { const grp = Math.floor(i / 5), k = i % 5, gx = 30 + (grp % 5) * 112, gy = 40 + Math.floor(grp / 5) * 150; if (k < 4) { g.beginPath(); g.moveTo(gx + k * 20, gy); g.lineTo(gx + k * 20 + 4, gy + 100); g.stroke(); } else { g.beginPath(); g.moveTo(gx - 10, gy + 80); g.lineTo(gx + 80, gy + 20); g.stroke(); } }
    tally.tex.needsUpdate = true; };
  setDays(0);
  const win = noInk(new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.6), glow(0xffe4a0))); win.position.set(4.0, 3.9, -4.95); scene.add(win);
  for (let k = 0; k < 4; k++) { const b = K.box(0.05, 0.6, 0.05, null, { color: 0x2a2a2a }); b.position.set(3.7 + k * 0.2, 3.9, -4.92); scene.add(b); }
  const shaft = noInk(K.mesh(new THREE.PlaneGeometry(1.0, 5), new THREE.MeshBasicMaterial({ color: 0xfff0c0, transparent: true, opacity: 0.12, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }), { shadow: false })); shaft.position.set(4.0, 2.0, -3.6); shaft.rotation.x = -0.6; scene.add(shaft);
  lights(scene, { key: 0xffe0b0, ki: 1.0, pos: [-6, 9, 6], hemi: [0xffe8c8, 0x5a4a3a, 0.9] });
  return { scene, life, desk, cell, bars, setDays, setStory: drawStory, board };
}

export function kitchenSet() {
  const T = K.stdTextures(), life = []; const scene = room(T, { w: 10, d: 8, h: 4.6, wall: T.limeYellow, floor: 0x8a3a2a, bg: 0xe8dcc0, rep: 3 });
  const tiles = K.paint(512, 256, (g, w, h) => { for (let y = 0; y < 8; y++) for (let x = 0; x < 16; x++) { g.fillStyle = (x + y) % 2 ? '#e8f2f0' : '#cfe4e0'; g.fillRect(x * 32, y * 32, 32, 32); } });
  const splash = plane(10, 1.2, tiles); splash.position.set(0, 1.7, -3.97); scene.add(splash);
  const counter = K.box(7, 1.0, 1.1, null, { color: 0x6a5a4a }); counter.position.set(0, 0.5, -3.4); scene.add(counter); const ct = K.box(7.1, 0.08, 1.2, null, { color: 0x2a2a30 }); ct.position.set(0, 1.04, -3.4); scene.add(ct);
  // two-burner stove, cold; the big handi on it, empty (no steam)
  const stove = K.box(1.6, 0.18, 0.8, null, { color: 0xc8ccd4 }); stove.position.set(0, 1.17, -3.3); scene.add(stove);
  const handi = new THREE.Group(); const hb = K.mesh(new THREE.CylinderGeometry(0.62, 0.5, 0.7, 24, 1, true), new THREE.MeshLambertMaterial({ color: 0xc8ccd4, side: THREE.DoubleSide })); hb.position.y = 0.35; handi.add(hb);
  const hbot = K.mesh(new THREE.CircleGeometry(0.5, 24), K.col(0x8a909a)); hbot.rotation.x = -Math.PI / 2; hbot.position.y = 0.02; handi.add(hbot);
  const rim = K.mesh(new THREE.TorusGeometry(0.62, 0.04, 8, 24), K.col(0x9aa0aa)); rim.rotation.x = Math.PI / 2; rim.position.y = 0.7; handi.add(rim); handi.position.set(-0.3, 1.26, -3.3); scene.add(handi);
  const flame = noInk(K.mesh(new THREE.TorusGeometry(0.28, 0.05, 6, 16), glow(0x5aa0ff, 0.0), { shadow: false })); flame.rotation.x = Math.PI / 2; flame.position.set(-0.3, 1.28, -3.3); scene.add(flame);
  // spice shelf with jars + a recipe card pinned on the wall ("രഹസ്യക്കൂട്ട്")
  const shelf = K.box(3.2, 0.08, 0.4, T.wood, { tileM: 1 }); shelf.position.set(2.2, 2.9, -3.8); scene.add(shelf);
  [0xc8312c, 0xe8b93a, 0x6a3e22, 0x2f6a3a, 0xe8742a].forEach((c, i) => { const j = K.mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.4, 12), K.col(c)); j.position.set(1.0 + i * 0.6, 3.14, -3.75); scene.add(j); });
  const card = plane(1.5, 1.0, K.signTex(['രഹസ്യക്കൂട്ട്', '???'], { w: 420, h: 280, bg: '#f4ecd6', fg: '#8a1e1e', border: '#2a1c17' })); card.position.set(-2.6, 2.6, -3.95); card.rotation.z = 0.06; scene.add(card);
  const win = noInk(new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.2), glow(0xfff0c0))); win.position.set(-4.98, 2.6, -1.2); win.rotation.y = Math.PI / 2; scene.add(win);
  lights(scene, { key: 0xfff0d0, ki: 1.3, pos: [-8, 7, 4] });
  return { scene, life, handi, flame, setCold(u) { flame.material.opacity = 1 - u; } };
}

export function padSet() {
  const T = K.stdTextures(), life = [], scene = new THREE.Scene(); scene.background = K.skyTexture({ top: '#0e1a3a', mid: '#2a3a6a', bottom: '#e8946a', clouds: 4, seed: 7 }); scene.fog = new THREE.Fog(0x2a3050, 30, 120);
  const ground = K.mesh(new THREE.PlaneGeometry(200, 200), K.col(0x4a5a3a)); ground.rotation.x = -Math.PI / 2; scene.add(ground);
  const sea = K.mesh(new THREE.PlaneGeometry(200, 80), K.col(0x2a4a7a)); sea.rotation.x = -Math.PI / 2; sea.position.set(0, 0.02, -70); scene.add(sea);
  const pad = K.box(10, 0.6, 10, null, { color: 0x8a8a84 }); pad.position.set(0, 0.3, -10); scene.add(pad);
  const rocket = gslv({ scale: 1 }); rocket.position.set(0, 0.6, -10); scene.add(rocket);
  // umbilical tower
  const tower = new THREE.Group(); for (const [x, z] of [[2.2, -11], [3.6, -11], [2.2, -9.6], [3.6, -9.6]]) { const p = K.box(0.14, 14, 0.14, null, { color: 0xc8312c }); p.position.set(x, 7, z); tower.add(p); }
  for (let y = 1; y < 14; y += 1.6) { const r = K.box(1.6, 0.1, 1.6, null, { color: 0xc8312c }); r.position.set(2.9, y, -10.3); tower.add(r); } scene.add(tower);
  // floodlight masts with beams
  for (const s of [-1, 1]) { const m = K.box(0.2, 9, 0.2, null, { color: 0x6a6a6a }); m.position.set(s * 9, 4.5, -4); scene.add(m); const lamp = noInk(K.mesh(new THREE.BoxGeometry(1.0, 0.5, 0.3), glow(0xfff4d0), { shadow: false })); lamp.position.set(s * 9, 9.1, -4); scene.add(lamp);
    const beam = noInk(K.mesh(new THREE.ConeGeometry(2.4, 12, 20, 1, true), new THREE.MeshBasicMaterial({ color: 0xfff0c0, transparent: true, opacity: 0.08, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }), { shadow: false }));
    beam.position.set(s * 4.5, 6, -7); beam.rotation.z = s * 1.05; scene.add(beam); }
  // a foreign rocket on a far pad (for "waiting for foreign rockets"): a slim white launcher with a big fairing
  const far = new THREE.Group(); const fc = K.mesh(new THREE.CylinderGeometry(0.5, 0.5, 9, 16), K.col(0xf2f2ee)); fc.position.y = 4.5; far.add(fc); const ff = K.mesh(new THREE.CylinderGeometry(0.7, 0.5, 2, 16), K.col(0xf2f2ee)); ff.position.y = 10; far.add(ff);
  const fn = K.mesh(new THREE.ConeGeometry(0.7, 1.4, 16), K.col(0xf2f2ee)); fn.position.y = 11.7; far.add(fn); for (const s of [-1, 1]) { const b = K.mesh(new THREE.CylinderGeometry(0.3, 0.3, 5, 12), K.col(0xd8d8d0)); b.position.set(s * 0.8, 2.5, 0); far.add(b); }
  const sat = K.box(0.9, 0.9, 0.9, null, { color: 0xe8b93a }); sat.position.set(1.8, 0.45, 0); far.add(sat); far.position.set(-26, 0, -48); far.scale.setScalar(1.4); scene.add(far);
  const smoke = []; for (let k = 0; k < 16; k++) { const s = noInk(K.mesh(new THREE.SphereGeometry(1, 10, 8), new THREE.MeshLambertMaterial({ color: 0xe8e0d8, transparent: true, opacity: 0 }), { shadow: false })); scene.add(s); smoke.push(s); }
  const key = new THREE.DirectionalLight(0xffc8a0, 1.0); key.position.set(-20, 14, 10); scene.add(key); scene.add(new THREE.HemisphereLight(0x9ab0e0, 0x3a3a2a, 0.9));
  const padL = new THREE.PointLight(0xffe4b0, 3, 30, 1.2); padL.position.set(0, 6, -4); scene.add(padL);
  const setLaunch = (u, t = 0) => { const lift = Math.max(0, u - 0.25) / 0.75; rocket.position.y = 0.6 + Math.pow(lift, 2) * 40; rocket.flame.material.opacity = u > 0.05 ? 0.85 : 0; const fl = 1 + Math.sin(t * 35) * 0.08; rocket.flame.scale.set(fl, 1 + lift * 0.6, fl);
    padL.color.set(u > 0.05 ? 0xffa040 : 0xffe4b0); padL.intensity = u > 0.05 ? 8 : 3;
    smoke.forEach((s, k) => { const a = k / smoke.length * Math.PI * 2, r = 2 + u * 7 * (0.6 + (k % 3) * 0.2); s.position.set(Math.cos(a) * r, 0.8 + (k % 4) * 0.5 + u * 1.5, -10 + Math.sin(a) * r * 0.6); s.scale.setScalar(0.8 + u * 2.2); s.material.opacity = u > 0.05 ? Math.min(0.85, u * 2) : 0; }); };
  setLaunch(0);
  return { scene, life, rocket, far, sat, setLaunch };
}
