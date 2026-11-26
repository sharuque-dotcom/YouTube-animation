// Kerala Lottery 1967 sets (all our own): the treasury chest (ഖജനാവ്) that fills, leaks and wears a crown; a village
// chayakkada with its samovar, jar shelf, result board and the little bhandaram box that grows; and the first-draw stage
// with spinning digit wheels. Reused: Gulf home plot (Kittunni's yard), Travancore office (Kunju Sahib), bean street.
import * as K from '../../pipeline/toon3d.js';
const THREE = K.THREE;
const glow = (c, o = {}) => new THREE.MeshBasicMaterial({ color: c, ...o });
const noInk = (m) => { m.userData.noInk = true; return m; };
const plane = (w, h, map, o = {}) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshLambertMaterial({ map, transparent: !!o.transparent, side: o.side || THREE.FrontSide }));
const canvasTex = (w, h) => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; return { cv, tex, g: cv.getContext('2d') }; };

// ------------------------------------------------------------------ the treasury chest
export function treasuryChest(T = K.stdTextures()) {
  const g = new THREE.Group(), W = 1.6, D = 1.0, Hh = 0.9;
  const body = K.box(W, Hh, D, T.wood, { tileM: 1 }); body.position.y = Hh / 2; g.add(body);
  for (const x of [-0.55, 0, 0.55]) { const band = K.box(0.1, Hh + 0.02, D + 0.02, null, { color: 0xc8962a }); band.position.set(x, Hh / 2, 0); g.add(band); }
  const inner = K.box(W - 0.1, 0.05, D - 0.1, null, { color: 0x2a1a10 }); inner.position.y = Hh - 0.02; g.add(inner);
  // coins: a heap whose height follows setFill
  const heap = new THREE.Group(); heap.position.y = 0.1; g.add(heap); const coinM = K.col(0xf0c23a), coinG = new THREE.CylinderGeometry(0.07, 0.07, 0.025, 12);
  const coins = []; const r = K.rnd(71); for (let i = 0; i < 160; i++) { const c = K.mesh(coinG, coinM, { shadow: false }); const lay = i / 160; c.position.set((r() - 0.5) * (W - 0.25) * (1 - lay * 0.5), lay * 1.0, (r() - 0.5) * (D - 0.25) * (1 - lay * 0.5)); c.rotation.set(r() * 0.8, r() * 3, r() * 0.8); heap.add(c); coins.push(c); }
  const shine = new THREE.PointLight(0xffd060, 0, 3, 1.6); shine.position.set(0, Hh + 0.3, 0.2); g.add(shine);
  // lid on a hinge at the back edge
  const lidPivot = new THREE.Group(); lidPivot.position.set(0, Hh, -D / 2); g.add(lidPivot);
  const lid = K.mesh(new THREE.CylinderGeometry(D / 2, D / 2, W, 20, 1, false, 0, Math.PI), K.mat(T.wood)); lid.rotation.z = Math.PI / 2; lid.rotation.y = Math.PI / 2; lid.position.set(0, 0, D / 2); lidPivot.add(lid);
  for (const x of [-0.55, 0, 0.55]) { const b = K.mesh(new THREE.CylinderGeometry(D / 2 + 0.015, D / 2 + 0.015, 0.1, 20, 1, false, 0, Math.PI), K.col(0xc8962a)); b.rotation.z = Math.PI / 2; b.rotation.y = Math.PI / 2; b.position.set(x, 0, D / 2); lidPivot.add(b); }
  const lock = K.box(0.22, 0.26, 0.06, null, { color: 0xd8a030 }); lock.position.set(0, Hh - 0.08, D / 2 + 0.03); g.add(lock);
  const sign = plane(1.0, 0.26, K.signTex(['ഖജനാവ്'], { w: 400, h: 104, bg: '#8a1e1e', fg: '#f6e0a0', border: '#d9a521' })); sign.position.set(0, 0.36, D / 2 + 0.012); g.add(sign);
  // crown (sits on the lid when the government "wins every draw")
  const crown = new THREE.Group(); const ring = K.mesh(new THREE.CylinderGeometry(0.34, 0.3, 0.22, 16, 1, true), new THREE.MeshLambertMaterial({ color: 0xf0c23a, side: THREE.DoubleSide })); crown.add(ring);
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; const sp = K.mesh(new THREE.ConeGeometry(0.07, 0.24, 6), K.col(0xf0c23a)); sp.position.set(Math.cos(a) * 0.32, 0.22, Math.sin(a) * 0.32); crown.add(sp); const gem = K.mesh(new THREE.SphereGeometry(0.04, 8, 6), K.col(i % 2 ? 0xc8312c : 0x2f6a8a)); gem.position.set(Math.cos(a) * 0.33, 0.02, Math.sin(a) * 0.33); crown.add(gem); }
  crown.position.set(0, Hh + D / 2 + 0.12, 0); crown.rotation.z = 0.15; g.add(crown);
  // cobwebs + a dangling spider for the empty 1967 chest
  const webT = K.paint(256, 256, (c, w, h) => { c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 2; for (let i = 0; i < 9; i++) { const a = i / 8 * Math.PI / 2; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * w, Math.sin(a) * h); c.stroke(); } for (let k = 1; k < 7; k++) { c.beginPath(); for (let i = 0; i < 9; i++) { const a = i / 8 * Math.PI / 2, rr = k * 36 + Math.sin(i * 3) * 4; c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } c.stroke(); } });
  const webs = []; for (const s of [-1, 1]) { const m = noInk(new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.7), new THREE.MeshBasicMaterial({ map: webT, transparent: true, side: THREE.DoubleSide, depthWrite: false }))); m.position.set(s * (W / 2 - 0.3), Hh - 0.3, D / 2 + 0.02); m.rotation.z = s > 0 ? -Math.PI / 2 : Math.PI; g.add(m); webs.push(m); }
  const spider = new THREE.Group(); const thread = noInk(K.mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.5, 4), glow(0xffffff), { shadow: false })); thread.position.y = 0.25; spider.add(thread); const sb = K.mesh(new THREE.SphereGeometry(0.06, 8, 6), K.col(0x1a1a1e)); spider.add(sb); spider.position.set(0.5, Hh - 0.6, D / 2 + 0.1); g.add(spider);
  // leak: coins pouring out of a hole in the front
  const hole = K.mesh(new THREE.CircleGeometry(0.14, 16), K.col(0x120a06), { shadow: false }); hole.position.set(-0.3, 0.2, D / 2 + 0.015); g.add(hole);
  const drips = []; for (let i = 0; i < 14; i++) { const c = K.mesh(coinG, coinM, { shadow: false }); g.add(c); drips.push(c); }
  const api = {
    group: g, lidPivot,
    setOpen(u) { lidPivot.rotation.x = -u * 1.9; },
    setFill(u) { coins.forEach((c, i) => { c.visible = i / coins.length < u; }); shine.intensity = u * 4; },
    setCrown(on) { crown.visible = on; },
    setCobweb(on, t = 0) { webs.forEach((m) => { m.visible = on; }); spider.visible = on; spider.position.y = Hh - 0.6 + Math.sin(t * 1.5) * 0.08; },
    setLeak(u, t = 0) { hole.visible = u > 0; drips.forEach((c, i) => { const k = (t * 1.4 + i / drips.length) % 1; c.visible = u > 0; c.position.set(-0.3 + k * 0.5, 0.2 - k * k * 0.2, D / 2 + 0.1 + k * 0.9); c.rotation.set(t * 6 + i, i, 0); }); },
  };
  api.setOpen(0); api.setFill(0); api.setCrown(false); api.setCobweb(false); api.setLeak(0); return api;
}

// ------------------------------------------------------------------ the chayakkada
function samovar(T) { const g = new THREE.Group(); const body = K.mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.7, 20), K.col(0xb8662e)); body.position.y = 0.35; g.add(body);
  const band = K.mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.06, 20), K.col(0xd8a040)); band.position.y = 0.12; g.add(band); const band2 = band.clone(); band2.position.y = 0.62; g.add(band2);
  const chim = K.mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.5, 10), K.col(0x5a4a3a)); chim.position.y = 0.95; g.add(chim); const tap = K.box(0.16, 0.05, 0.05, null, { color: 0xd8a040 }); tap.position.set(0, 0.18, 0.33); g.add(tap);
  const steam = []; for (let i = 0; i < 7; i++) { const s = K.mesh(new THREE.SphereGeometry(0.08, 8, 6), new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.5, depthWrite: false }), { shadow: false }); s.userData.noInk = true; g.add(s); steam.push(s); }
  g.userData.tick = (t) => steam.forEach((s, i) => { const k = (t * 0.5 + i / steam.length) % 1; s.position.set(Math.sin(t * 2 + i) * 0.08 * k, 1.2 + k * 1.0, 0); s.scale.setScalar(0.6 + k * 1.6); s.material.opacity = 0.5 * (1 - k); }); return g; }

export function teaShopSet() {
  const T = K.stdTextures(), scene = new THREE.Scene(), life = [];
  scene.background = K.skyTexture({ seed: 91, clouds: 6 }); scene.fog = new THREE.Fog(0xd8e6ee, 30, 120);
  const gt = T.grass.clone(); gt.repeat.set(60, 60); gt.needsUpdate = true; const g0 = K.mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshLambertMaterial({ map: gt })); g0.rotation.x = -Math.PI / 2; scene.add(g0);
  const dt = T.dirt.clone(); dt.repeat.set(8, 1.2); dt.needsUpdate = true; const road = K.mesh(new THREE.PlaneGeometry(60, 6), new THREE.MeshLambertMaterial({ map: dt })); road.rotation.x = -Math.PI / 2; road.position.set(0, 0.01, 4.4); scene.add(road);
  // the shop: lime walls, open front, laterite plinth, tiled lean-to roof
  const shop = new THREE.Group(); scene.add(shop); const Wd = 7, Dp = 4.2, Hh = 3.2;
  const plinth = K.box(Wd + 0.6, 0.3, Dp + 1.2, T.laterite, { tileM: 1.2 }); plinth.position.set(0, 0.15, -Dp / 2 + 0.6); shop.add(plinth);
  const wallT = T.limeYellow.clone(); wallT.repeat.set(2, 1); wallT.needsUpdate = true; const wm = new THREE.MeshLambertMaterial({ map: wallT, side: THREE.DoubleSide });
  const back = K.mesh(new THREE.PlaneGeometry(Wd, Hh), wm); back.position.set(0, Hh / 2 + 0.3, -Dp); shop.add(back);
  for (const s of [-1, 1]) { const side = K.mesh(new THREE.PlaneGeometry(Dp, Hh), wm); side.rotation.y = Math.PI / 2; side.position.set(s * Wd / 2, Hh / 2 + 0.3, -Dp / 2); shop.add(side); }
  for (const x of [-Wd / 2 + 0.15, Wd / 2 - 0.15, -1.2, 1.2]) { const post = K.box(0.2, Hh + 0.4, 0.2, T.woodTeal, { tileM: 1 }); post.position.set(x, (Hh + 0.4) / 2 + 0.3, 0.6); shop.add(post); }
  const roof = K.mesh(new THREE.PlaneGeometry(Wd + 1.4, Dp + 2.2), new THREE.MeshLambertMaterial({ map: (() => { const t = T.tiles.clone(); t.repeat.set(4, 2.4); t.needsUpdate = true; return t; })(), side: THREE.DoubleSide })); roof.rotation.x = -Math.PI / 2 + 0.28; roof.position.set(0, Hh + 0.75, -Dp / 2 + 0.7); shop.add(roof);
  const fascia = K.box(Wd + 1.4, 0.18, 0.1, T.woodTeal, { tileM: 1 }); fascia.position.set(0, Hh + 0.42, 1.75); shop.add(fascia);
  const board = plane(4.2, 0.8, K.signTex(['ശ്രീ ഭഗവതി ടീ സ്റ്റാൾ'], { w: 800, h: 150, bg: '#2a3f7a', fg: '#f4dca0' })); board.position.set(0, Hh + 0.95, 1.82); board.rotation.x = -0.1; shop.add(board);
  // counter with glass jars + biscuit bharanis, glasses, the samovar
  const counter = K.box(3.4, 1.0, 0.8, T.wood, { tileM: 1 }); counter.position.set(-0.6, 0.8, -0.2); shop.add(counter);
  const glassM = new THREE.MeshLambertMaterial({ color: 0xcfe6ee, transparent: true, opacity: 0.45 });
  const jarCols = [0xe8a030, 0xd04a24, 0xf2d06a, 0x8a5a2a, 0x6aa83e];
  for (let i = 0; i < 5; i++) { const j = new THREE.Group(); const gl = K.mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.42, 14), glassM, { shadow: false }); j.add(gl); const fill = K.mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.26, 12), K.col(jarCols[i])); fill.position.y = -0.07; j.add(fill); const cap = K.mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.06, 14), K.col(0xc8312c)); cap.position.y = 0.24; j.add(cap); j.position.set(-1.9 + i * 0.42, 1.51, -0.2); shop.add(j); }
  const tumblers = []; for (let i = 0; i < 6; i++) { const tg = K.mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.13, 10), new THREE.MeshLambertMaterial({ color: 0xc58a4a })); tg.position.set(0.25 + (i % 3) * 0.14, 1.37, -0.05 - Math.floor(i / 3) * 0.14); shop.add(tg); tumblers.push(tg); }
  const sam = samovar(T); sam.position.set(1.7, 0.3, -0.3); shop.add(sam); life.push((t) => sam.userData.tick(t)); const samTable = K.box(1.0, 0.0, 0.8, null, { color: 0x5a3a22 }); shop.add(samTable);
  // back wall: shelf of jars, a calendar, a radio, the result board
  const shelf = K.box(3.0, 0.08, 0.35, T.wood, { tileM: 1 }); shelf.position.set(-1.4, 2.1, -Dp + 0.2); shop.add(shelf);
  for (let i = 0; i < 7; i++) { const b = K.mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.3, 10), glassM, { shadow: false }); b.position.set(-2.7 + i * 0.42, 2.3, -Dp + 0.2); shop.add(b); const f = K.mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.18, 8), K.col(jarCols[i % 5])); f.position.copy(b.position); f.position.y -= 0.04; shop.add(f); }
  const cal = canvasTex(256, 360); const calM = plane(0.6, 0.85, cal.tex); calM.position.set(-2.9, 1.3, -Dp + 0.02); shop.add(calM);
  const setCal = (year) => { const g = cal.g; g.fillStyle = '#f4ead0'; g.fillRect(0, 0, 256, 360); g.fillStyle = '#b8302a'; g.fillRect(0, 0, 256, 90); g.fillStyle = '#fff'; g.font = "800 64px 'Oswald'"; g.textAlign = 'center'; g.fillText(String(year), 128, 70); g.fillStyle = '#2a1c17'; g.font = "800 40px 'Noto Malayalam'"; g.fillText('കലണ്ടർ', 128, 160); g.strokeStyle = 'rgba(42,28,23,.4)'; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(20, 200 + i * 30); g.lineTo(236, 200 + i * 30); g.stroke(); } cal.tex.needsUpdate = true; };
  const res = canvasTex(640, 440); const resM = plane(1.6, 1.1, res.tex); resM.position.set(1.0, 1.9, -Dp + 0.02); shop.add(resM);
  const resFrame = K.box(1.72, 1.22, 0.05, T.wood, { tileM: 1 }); resFrame.position.set(1.0, 1.9, -Dp + 0.0); shop.add(resFrame);
  const setResult = (mode, t = 0) => { const g = res.g; g.fillStyle = '#1f3a2a'; g.fillRect(0, 0, 640, 440); g.fillStyle = '#f4e8c8'; g.textAlign = 'center'; g.textBaseline = 'middle';
    if (mode === 'blank') { g.globalAlpha = 0.25; g.font = "800 60px 'Noto Malayalam'"; g.fillText('—', 320, 220); g.globalAlpha = 1; }
    else { g.font = "800 58px 'Noto Malayalam'"; g.fillText('ഇന്നത്തെ ഫലം', 320, 70); g.fillStyle = '#f6d24a'; g.font = "700 120px 'Oswald'"; const n = mode === 'spin' ? String(100000 + Math.floor(Math.abs(Math.sin(Math.floor(t * 14) * 12.9898) * 43758.5) % 900000)) : 'KR 438271'; g.fillText(n, 320, 230); g.fillStyle = '#f4e8c8'; g.font = "800 46px 'Noto Malayalam'"; g.fillText('ഒന്നാം സമ്മാനം', 320, 360); }
    res.tex.needsUpdate = true; };
  // the bhandaram (donation box) on the corner of the counter: grows to swallow the shop
  const bh = new THREE.Group(); const bhB = K.box(0.36, 0.42, 0.3, null, { color: 0x8a1e1e }); bhB.position.y = 0.21; bh.add(bhB); const slot = K.box(0.18, 0.02, 0.04, null, { color: 0x120a06 }); slot.position.y = 0.43; bh.add(slot);
  const bhL = plane(0.32, 0.14, K.signTex(['ഭണ്ഡാരം'], { w: 240, h: 104, bg: '#f4dca0', fg: '#8a1e1e', border: '#d9a521' })); bhL.position.set(0, 0.24, 0.152); bh.add(bhL); const lockb = K.box(0.06, 0.08, 0.02, null, { color: 0xd8a030 }); lockb.position.set(0, 0.36, 0.16); bh.add(lockb);
  bh.position.set(-2.05, 1.3, 0.05); shop.add(bh);
  // a bench out front, a bunch of bananas, a newspaper on a wire
  const bench = K.box(2.4, 0.08, 0.5, T.wood, { tileM: 1 }); bench.position.set(-0.6, 0.62, 1.4); shop.add(bench); for (const x of [-1.6, 0.4]) { const l = K.box(0.08, 0.5, 0.4, T.wood, { tileM: 1 }); l.position.set(x, 0.55, 1.4); shop.add(l); }
  const banana = new THREE.Group(); for (let i = 0; i < 14; i++) { const b = K.mesh(new THREE.CapsuleGeometry(0.035, 0.18, 4, 8), K.col(0xe8c83a)); b.position.set(Math.cos(i * 0.9) * 0.1, -i * 0.04, Math.sin(i * 0.9) * 0.1); b.rotation.z = 0.5; banana.add(b); } banana.position.set(-2.9, 2.9, 0.4); shop.add(banana); life.push((t) => { banana.rotation.y = Math.sin(t * 0.8) * 0.2; });
  const paperT = K.paint(256, 320, (g, w, h) => { g.fillStyle = '#f2ecdc'; g.fillRect(0, 0, w, h); g.fillStyle = '#2a1c17'; g.font = "800 40px 'Noto Malayalam'"; g.textAlign = 'center'; g.fillText('പത്രം', w / 2, 46); g.strokeStyle = 'rgba(42,28,23,.45)'; g.lineWidth = 3; for (let y = 80; y < h - 10; y += 14) { g.beginPath(); g.moveTo(16, y); g.lineTo(w / 2 - 8, y); g.stroke(); g.beginPath(); g.moveTo(w / 2 + 8, y); g.lineTo(w - 16, y); g.stroke(); } });
  const paper = plane(0.5, 0.62, paperT, { side: THREE.DoubleSide }); paper.position.set(2.7, 2.4, 0.62); shop.add(paper); life.push((t) => { paper.rotation.y = Math.sin(t * 1.3) * 0.15; });
  const lamp = new THREE.PointLight(0xffc27a, 5, 7, 1.6); lamp.position.set(0, 2.8, -1.5); shop.add(lamp); const bulb = noInk(K.mesh(new THREE.SphereGeometry(0.09, 10, 8), glow(0xffe0a0), { shadow: false })); bulb.position.copy(lamp.position); shop.add(bulb);
  // palms + a neighbouring shop for depth
  [[-9, -5, 9], [8, -6, 10], [12, -2, 8.5], [-13, -9, 9.5], [16, -10, 9]].forEach(([x, z, h], i) => { const p = K.palm(h, 0.12 + (i % 3) * 0.07, i + 80); p.position.set(x, 0, z); scene.add(p); life.push((t) => p.userData.sway?.(t)); });
  const sun = new THREE.DirectionalLight(0xfff0d8, 1.7); sun.position.set(10, 18, 14); sun.target.position.set(0, 0, -1); scene.add(sun, sun.target); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.03; Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10, near: 1, far: 50 });
  scene.add(new THREE.HemisphereLight(0xcfe2ff, 0xc89a6a, 1.0));
  setCal(2026); setResult('result');
  return { scene, life, shop, bh, counter, tumblers, setCal, setResult, paper,
    setBox(u) { // 0 = tiny box on the counter; 1 = a giant box filling the shop front
      const s = 1 + u * 7.5; bh.scale.setScalar(s); bh.position.set(lerpN(-2.05, -0.2, u), lerpN(1.3, 0.3, u), lerpN(0.05, 0.4, u)); counter.visible = u < 0.6; },
  };
}
const lerpN = (a, b, u) => a + (b - a) * u;

// ------------------------------------------------------------------ the first draw (26 Jan 1968): stage + digit wheels
export function drawSet() {
  const T = K.stdTextures(), scene = new THREE.Scene(), life = []; scene.background = new THREE.Color(0x1a1018); scene.fog = new THREE.Fog(0x1a1018, 14, 40);
  const floor = K.mesh(new THREE.PlaneGeometry(30, 30), K.col(0x4a2a20)); floor.rotation.x = -Math.PI / 2; scene.add(floor);
  const stage = K.box(10, 0.7, 4, T.wood, { tileM: 2 }); stage.position.set(0, 0.35, -5); scene.add(stage);
  const wall = K.mesh(new THREE.PlaneGeometry(30, 12), K.col(0x3a1a20)); wall.position.set(0, 6, -7.2); scene.add(wall);
  for (const s of [-1, 1]) { const c = K.box(2.4, 7, 0.3, null, { color: 0x8a1e1e }); c.position.set(s * 5.6, 3.5, -6.8); scene.add(c); for (let k = 0; k < 4; k++) { const f = K.box(0.06, 7, 0.32, null, { color: 0x6a1414 }); f.position.set(s * 5.6 - 0.9 + k * 0.6, 3.5, -6.78); scene.add(f); } }
  const valance = K.box(12, 0.8, 0.3, null, { color: 0x8a1e1e }); valance.position.set(0, 6.6, -6.7); scene.add(valance);
  const ban = canvasTex(1400, 260); const banM = new THREE.Mesh(new THREE.PlaneGeometry(8.4, 1.56), new THREE.MeshLambertMaterial({ map: ban.tex })); banM.position.set(0, 5.4, -6.9); scene.add(banM);
  { const g = ban.g; g.fillStyle = '#f4dca0'; g.fillRect(0, 0, 1400, 260); g.strokeStyle = '#8a1e1e'; g.lineWidth = 14; g.strokeRect(10, 10, 1380, 240); g.fillStyle = '#8a1e1e'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = "800 92px 'Noto Malayalam'"; g.fillText('കേരള സംസ്ഥാന ഭാഗ്യക്കുറി', 700, 100); g.font = "800 58px 'Noto Malayalam'"; g.fillText('ആദ്യ നറുക്കെടുപ്പ് · 26-1-1968', 700, 200); ban.tex.needsUpdate = true; }
  // the draw machine: a row of six digit wheels in a frame
  const machine = new THREE.Group(); machine.position.set(0, 0.7, -5.2); scene.add(machine);
  const frame = K.box(5.4, 0.2, 0.9, T.wood, { tileM: 1 }); frame.position.y = 0.2; machine.add(frame); const top = frame.clone(); top.position.y = 2.6; machine.add(top);
  for (const x of [-2.6, 2.6]) { const p = K.box(0.2, 2.6, 0.9, T.wood, { tileM: 1 }); p.position.set(x, 1.4, 0); machine.add(p); }
  const digitT = K.paint(1024, 256, (g, w, h) => { g.fillStyle = '#f6efdc'; g.fillRect(0, 0, w, h); g.textAlign = 'center'; g.textBaseline = 'middle';
    for (let i = 0; i < 10; i++) { const cx = (i + 0.5) * w / 10; g.save(); g.translate(cx, h / 2); g.rotate(Math.PI / 2); g.fillStyle = '#2a1c17'; g.font = "700 150px 'Oswald'"; g.fillText(String(i), 0, 6); g.restore(); g.fillStyle = 'rgba(42,28,23,.3)'; g.fillRect((i + 1) * w / 10 - 2, 0, 4, h); } });
  const wheels = []; for (let i = 0; i < 6; i++) { const wgeo = new THREE.CylinderGeometry(0.62, 0.62, 0.62, 30, 1, false); const tex = digitT.clone(); tex.needsUpdate = true; tex.wrapS = THREE.RepeatWrapping;
    const wm = [new THREE.MeshLambertMaterial({ map: tex }), K.col(0xc8962a), K.col(0xc8962a)]; const wh = K.mesh(wgeo, wm); wh.rotation.z = Math.PI / 2; const holder = new THREE.Group(); holder.add(wh); holder.position.set(-2.0 + i * 0.8, 1.4, 0.1); machine.add(holder); wheels.push(holder); }
  const axle = K.mesh(new THREE.CylinderGeometry(0.06, 0.06, 5.2, 10), K.col(0x5a5a60)); axle.rotation.z = Math.PI / 2; axle.position.set(0, 1.4, 0.1); machine.add(axle);
  const crank = K.box(0.1, 0.8, 0.1, null, { color: 0x5a5a60 }); crank.geometry.translate(0, 0.4, 0); crank.position.set(2.75, 1.4, 0.1); machine.add(crank);
  // officials' table + garlanded lamp (nilavilakku)
  const table = K.box(3.6, 0.1, 1.0, null, { color: 0xf4efe4 }); table.position.set(-3.0, 1.6, -3.8); scene.add(table); const tcloth = K.box(3.6, 0.85, 1.0, null, { color: 0xf4efe4 }); tcloth.position.set(-3.0, 1.15, -3.8); scene.add(tcloth);
  const vil = new THREE.Group(); const st = K.mesh(new THREE.CylinderGeometry(0.06, 0.22, 1.6, 12), K.col(0xd8a030)); st.position.y = 0.8; vil.add(st); const dish = K.mesh(new THREE.CylinderGeometry(0.3, 0.2, 0.08, 16), K.col(0xd8a030)); dish.position.y = 1.6; vil.add(dish);
  const flames = []; for (let i = 0; i < 5; i++) { const f = noInk(K.mesh(new THREE.ConeGeometry(0.04, 0.16, 8), glow(0xffc040), { shadow: false })); const a = i / 5 * Math.PI * 2; f.position.set(Math.cos(a) * 0.24, 1.72, Math.sin(a) * 0.24); vil.add(f); flames.push(f); }
  const vl = new THREE.PointLight(0xffb050, 4, 5, 1.6); vl.position.y = 1.9; vil.add(vl); vil.position.set(3.6, 0.7, -4.0); scene.add(vil); life.push((t) => flames.forEach((f, i) => { f.scale.y = 1 + Math.sin(t * 18 + i * 2) * 0.25; }));
  // audience chairs
  const chairs = []; for (let r = 0; r < 4; r++) for (let c = 0; c < 10; c++) { const s = K.box(0.7, 0.8, 0.6, null, { color: 0x6a4a2a }); s.position.set(-4.5 + c * 1.0, 0.4, 0.2 + r * 1.3); scene.add(s); chairs.push(s); }
  const spot = new THREE.SpotLight(0xfff0d0, 60, 18, 0.45, 0.5, 1); spot.position.set(0, 9, 2); spot.target.position.set(0, 1.4, -5.2); scene.add(spot, spot.target);
  const beam = noInk(K.mesh(new THREE.ConeGeometry(2.6, 10, 20, 1, true), glow(0xfff2d0, { transparent: true, opacity: 0.07, side: THREE.DoubleSide, depthWrite: false }), { shadow: false })); beam.position.set(0, 4.5, -2.2); beam.rotation.x = 0.55; scene.add(beam);
  scene.add(new THREE.HemisphereLight(0x8a6a8a, 0x2a1418, 0.9)); const front = new THREE.DirectionalLight(0xffe8d0, 0.9); front.position.set(2, 6, 8); scene.add(front);
  return { scene, life, machine, wheels, crank, chairs,
    /** spin the wheels from t0; wheel i stops on digits[i] at stopAt[i] */
    setWheels(t, t0, digits = [4, 3, 8, 2, 7, 1], stopAt = null) { wheels.forEach((w, i) => { const s = stopAt ? stopAt[i] : 1e9; const tt = Math.min(t, s) - t0; const target = digits[i] / 10 * Math.PI * 2;
      const spin = tt > 0 ? tt * (14 + i * 1.3) : 0; const settle = t >= s ? target + Math.round(spin / (Math.PI * 2)) * Math.PI * 2 : spin; w.rotation.x = -settle; }); crank.rotation.x = -(t - t0) * 6; },
  };
}

// ------------------------------------------------------------------ the finance minister's office, 1967 (chest in the corner)
export function financeOffice() {
  const T = K.stdTextures(), scene = new THREE.Scene(), life = []; scene.background = new THREE.Color(0xe8dcc0);
  const floor = K.mesh(new THREE.PlaneGeometry(16, 12), K.col(0x9a5a3a)); floor.rotation.x = -Math.PI / 2; scene.add(floor);
  for (let i = 0; i < 8; i++) { const ln = K.box(16, 0.005, 0.03, null, { color: 0x7a4024 }); ln.position.set(0, 0.004, -6 + i * 1.6); scene.add(ln); }
  const wallT = T.lime.clone(); wallT.repeat.set(3, 1.2); wallT.needsUpdate = true; const wm = new THREE.MeshLambertMaterial({ map: wallT, side: THREE.DoubleSide });
  const back = K.mesh(new THREE.PlaneGeometry(16, 6), wm); back.position.set(0, 3, -5); scene.add(back); const left = K.mesh(new THREE.PlaneGeometry(12, 6), wm); left.rotation.y = Math.PI / 2; left.position.set(-6, 3, 1); scene.add(left);
  const dado = K.box(16, 1.1, 0.05, T.woodGreen, { tileM: 1 }); dado.position.set(0, 0.55, -4.95); scene.add(dado);
  const win = noInk(new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.2), new THREE.MeshBasicMaterial({ map: K.skyTexture({ seed: 33, clouds: 3, top: '#5f9fe0', bottom: '#f0e2b8' }), toneMapped: false }))); win.position.set(3.6, 3.0, -4.94); scene.add(win);
  for (let k = 0; k < 4; k++) { const bar = K.box(0.05, 2.2, 0.05, null, { color: 0x2f6a5a }); bar.position.set(2.7 + k * 0.6, 3.0, -4.9); scene.add(bar); }
  const plaque = plane(4.6, 1.0, K.signTex(['ധനകാര്യ വകുപ്പ് · കേരളം'], { w: 900, h: 190, bg: '#1f4f36', fg: '#f4dca0' })); plaque.position.set(-0.6, 4.4, -4.93); scene.add(plaque);
  const calT = K.paint(200, 280, (g, w, h) => { g.fillStyle = '#f4ead0'; g.fillRect(0, 0, w, h); g.fillStyle = '#b8302a'; g.fillRect(0, 0, w, 70); g.fillStyle = '#fff'; g.font = "800 50px 'Oswald'"; g.textAlign = 'center'; g.fillText('1967', w / 2, 52); g.strokeStyle = 'rgba(42,28,23,.4)'; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(14, 100 + i * 28); g.lineTo(w - 14, 100 + i * 28); g.stroke(); } });
  const cal = plane(0.6, 0.84, calT); cal.position.set(1.6, 2.9, -4.93); scene.add(cal);
  const desk = new THREE.Group(); const top = K.box(3.0, 0.1, 1.4, T.wood, { tileM: 1 }); top.position.y = 0.95; desk.add(top); for (const s of [-1, 1]) { const ped = K.box(0.8, 0.9, 1.3, T.wood, { tileM: 1 }); ped.position.set(s * 1.05, 0.45, 0); desk.add(ped); }
  for (let i = 0; i < 4; i++) { const f = K.box(0.42, 0.05, 0.32, null, { color: [0xd8b878, 0xc8a060, 0xe8d0a0, 0xb88a50][i] }); f.position.set(-1.0, 1.03 + i * 0.05, -0.2); f.rotation.y = i * 0.08; desk.add(f); }
  const ph = K.box(0.36, 0.12, 0.24, null, { color: 0x2a2a30 }); ph.position.set(1.0, 1.06, 0); desk.add(ph); desk.position.set(0, 0, -2.4); scene.add(desk);
  const chair = new THREE.Group(); const seat = K.box(0.7, 0.1, 0.65, T.wood, { tileM: 1 }); seat.position.y = 0.5; chair.add(seat); const cb = K.box(0.7, 1.2, 0.08, T.wood, { tileM: 1 }); cb.position.set(0, 1.1, -0.3); chair.add(cb); chair.position.set(0, 0, -3.5); scene.add(chair);
  const chest = treasuryChest(T); chest.group.position.set(-3.4, 0, -3.2); chest.group.rotation.y = 0.35; scene.add(chest.group);
  const fan = new THREE.Group(); const blades = new THREE.Group(); fan.add(blades); for (let i = 0; i < 3; i++) { const bl = K.box(1.0, 0.02, 0.18, T.wood, { tileM: 1 }); bl.position.x = 0.6; const arm = new THREE.Group(); arm.add(bl); arm.rotation.y = i / 3 * Math.PI * 2; blades.add(arm); }
  fan.position.set(0, 5.2, -1.5); scene.add(fan); life.push((t) => { blades.rotation.y = t * 5; });
  const sun = new THREE.DirectionalLight(0xfff0d0, 1.4); sun.position.set(6, 9, 8); sun.target.position.set(0, 0, -2); scene.add(sun, sun.target); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0005; Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 40 });
  scene.add(new THREE.HemisphereLight(0xfff4e0, 0x8a6a4a, 1.05)); const lamp = new THREE.PointLight(0xffc880, 5, 9, 1.5); lamp.position.set(-1, 3.2, -1); scene.add(lamp);
  return { scene, life, desk, chest };
}
