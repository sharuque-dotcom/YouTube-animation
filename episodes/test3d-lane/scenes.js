// 5 s test of the px3d kit in DAYLIGHT: a Trivandrum lane, June 1947, villagers gathered at the radio shop.
import { W, H } from '../../pipeline/engine.js';

let K = null;
async function build() {
  const { THREE, PX, pxBox, roof, sprite, makeStage, rnd } = await import('../../pipeline/px3d.js');
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xcfe0f2, 35, 170);                       // light aerial haze, not night fog
  // sky: bright gradient with pixel cumulus (screen-space background)
  { const sk = new PX(270, 480); sk.ramp(['#4a86d8', '#6aa0e4', '#8cb8ec', '#b4d2f2', '#dae8f6'], (x, y) => y / 479);
    const r = rnd(8); for (let c = 0; c < 9; c++) { const cx = r() * 270, cy = 40 + r() * 200, cw = 30 + r() * 60, ch = 8 + r() * 12;
      for (let j = 0; j < ch; j++) { const w = cw * Math.sin(((j + 0.5) / ch) * Math.PI) * (0.7 + 0.3 * r()); for (let i = -w / 2; i < w / 2; i++) sk.dot(cx + i, cy + j, j < ch * 0.35 ? '#ffffff' : j < ch * 0.7 ? '#eef3fa' : '#c8d6ea'); } }
    const t = sk.tex(); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; scene.background = t; }
  // ---- textures (24 px per metre)
  const road = new PX(48, 48).ramp(['#8a6248', '#9e7254', '#b08462', '#c29674'], (x, y) => 0.5 + 0.25 * Math.sin(x * 0.7) * Math.cos(y * 0.5) + (rnd(x * 97 + y)() - 0.5) * 0.5);
  { const r = rnd(4); for (let i = 0; i < 30; i++) road.rect(r() * 48, r() * 48, 2, 1, '#6a3a28'); for (let i = 0; i < 14; i++) road.dot(r() * 48, r() * 48, '#d8a070'); }
  const grassT = new PX(48, 48).ramp(['#4a6a32', '#587a3a', '#668a42', '#76984c'], (x, y) => 0.5 + (rnd(x * 13 + y * 29)() - 0.5) * 0.9);
  const laterite = new PX(48, 48).ramp(['#7a4a3a', '#8e5a44', '#a26c50', '#b47e5e'], (x, y) => 0.55 + 0.3 * Math.sin(x * 1.3 + y * 0.4) * 0.5 + (rnd(x * 31 + y * 7)() - 0.5) * 0.6);
  for (let y = 0; y < 48; y += 8) for (let x = (y / 8) % 2 ? 0 : 6; x < 48; x += 12) laterite.rect(x, y, 1, 8, '#5e3a2e').rect(x, y, 12, 1, '#5e3a2e');
  const lime = new PX(48, 48).ramp(['#c8c0ac', '#ddd6c4', '#ece6d6', '#f8f4ea'], (x, y) => 0.7 + (rnd(x * 13 + y * 5)() - 0.5) * 0.35 - (y > 40 ? 0.35 : 0));
  const tiles = new PX(24, 24); for (let y = 0; y < 24; y++) for (let x = 0; x < 24; x++) { const row = Math.floor(y / 3), k = (x + (row % 2) * 3) % 6; tiles.dot(x, y, y % 3 === 0 ? '#4e2218' : k === 0 ? '#6e3222' : k < 3 ? '#9a4a32' : '#ae5c3e'); }
  const wood = new PX(24, 24).ramp(['#4a2a18', '#6a3e22', '#8a5430'], (x, y) => 0.5 + 0.4 * Math.sin(y * 0.9 + Math.sin(x * 0.3)));
  const shopBack = new PX(96, 48).ramp(['#6a4a30', '#8a6440', '#a87e52'], (x, y) => 0.6 - y / 160);
  for (let s2 = 0; s2 < 3; s2++) { shopBack.rect(4, 10 + s2 * 12, 88, 1, '#3a2010'); for (let i = 0; i < 18; i++) shopBack.rect(6 + i * 4.8, 4 + s2 * 12, 3, 6, ['#2a5a8a', '#8a2a1e', '#e0b040', '#3a7a3a', '#f0e8d8'][(i + s2 * 2) % 5]); }
  shopBack.rect(58, 26, 20, 14, '#4a2410').rect(60, 28, 16, 4, '#e8d090').rect(61, 34, 4, 4, '#1a0a06').rect(71, 34, 4, 4, '#1a0a06');
  // ---- ground: laterite lane through grass
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(800, 800), new THREE.MeshLambertMaterial({ map: grassT.tex({ repeat: [400, 400] }) })); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  const lane = new THREE.Mesh(new THREE.PlaneGeometry(7, 60), new THREE.MeshLambertMaterial({ map: road.tex({ repeat: [3.5, 30] }) })); lane.rotation.x = -Math.PI / 2; lane.position.set(0, 0.01, 2); lane.receiveShadow = true; scene.add(lane);
  const yard = new THREE.Mesh(new THREE.PlaneGeometry(14, 6), new THREE.MeshLambertMaterial({ map: road.tex({ repeat: [7, 3] }) })); yard.rotation.x = -Math.PI / 2; yard.position.set(0, 0.012, 1.5); yard.receiveShadow = true; scene.add(yard);
  // ---- Kerala house: lime-washed walls, laterite plinth, verandah with pillars, wooden door + shutters, deep tiled roof
  const house = (x, z, w, d, rot, wallTex) => { const g = new THREE.Group();
    const plinth = pxBox(w + 0.4, 0.45, d + 1.6, laterite.tex()); plinth.position.set(0, 0.22, 0.5); g.add(plinth);
    const body = pxBox(w, 2.6, d, wallTex.tex()); body.position.y = 1.75; g.add(body);
    for (let i = 0; i < 4; i++) { const p = pxBox(0.18, 2.4, 0.18, wood.tex(), { tileM: 1 }); p.position.set(-w / 2 + 0.2 + i * (w - 0.4) / 3, 1.65, d / 2 + 1.05); g.add(p); }
    const door = pxBox(0.9, 1.8, 0.06, wood.tex(), { tileM: 1 }); door.position.set(0, 1.35, d / 2 + 0.03); g.add(door);
    [-1, 1].forEach((sd) => { const sh = pxBox(0.7, 0.8, 0.05, wood.tex(), { tileM: 1 }); sh.position.set(sd * w / 3, 1.9, d / 2 + 0.03); g.add(sh); });
    const rf = roof(w + 0.6, d + 2.4, 1.9, tiles.tex(), 1); rf.position.set(0, 3.05, 0.5); g.add(rf);
    g.position.set(x, 0, z); g.rotation.y = rot; scene.add(g); return g; };
  house(-5.6, -1.6, 4, 3.4, 0.35, lime); house(5.8, -1.2, 4.2, 3.4, -0.35, laterite); house(-7.4, 5.2, 3.6, 3.2, 1.1, lime); house(7.6, 5.6, 3.8, 3.2, -1.15, lime); house(-1.8, -8, 5, 3.4, 0.1, laterite); house(4.6, -9, 4, 3.2, -0.2, lime);
  // ---- the radio shop (open front, shelves, radio, signboard, tiled awning)
  const shop = new THREE.Group(); scene.add(shop);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(4, 2.2), new THREE.MeshLambertMaterial({ map: shopBack.tex() })); back.position.set(0, 1.2, -1.2); shop.add(back);
  [-2, 2].forEach((x) => { const sw = pxBox(0.25, 2.6, 2.6, lime.tex()); sw.position.set(x, 1.3, 0); shop.add(sw); });
  const top = pxBox(4.3, 0.4, 2.6, lime.tex()); top.position.set(0, 2.6, 0); shop.add(top);
  const counter = pxBox(3.6, 0.9, 0.5, wood.tex(), { tileM: 1 }); counter.position.set(0, 0.45, 0.9); shop.add(counter);
  const radio = pxBox(0.6, 0.4, 0.3, wood.tex(), { tileM: 0.5 }); radio.position.set(0.4, 1.1, 0.9); shop.add(radio);
  const aw = roof(4.4, 2.4, 0.6, tiles.tex(), 1); aw.position.set(0, 2.8, 0.2); shop.add(aw);
  const sign = new PX(48, 10).ramp(['#123a22', '#1e5a32'], () => 0.5); for (let i = 0; i < 9; i++) sign.rect(4 + i * 4.6, 3, 3, 4, '#f0dca0'); const signM = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.5), new THREE.MeshLambertMaterial({ map: sign.tex() })); signM.position.set(0, 3.3, 1.75); shop.add(signM);
  // ---- villagers: 34x50 px sprites, mundu + shirt, selout; hero in teal; two reading the newspaper
  const person = (shirt, skin, frame, { paper = false } = {}) => { const p = new PX(34, 50); const b = frame;
    p.rect(12, 30, 10, 18, '#f2eee4').rect(12, 30, 2, 18, '#c8c0b0').rect(20, 30, 2, 18, '#e0dace');
    p.rect(11, 15 + b, 12, 16, shirt).rect(11, 15 + b, 2, 16, 'rgba(0,0,0,0.2)');
    p.rect(13, 5 + b, 8, 10, skin).rect(13, 4 + b, 8, 3, '#1a1016').rect(19, 9 + b, 1, 1, '#1a1016');
    if (paper) p.rect(7, 16 + b, 20, 12, '#ece4cc').rect(9, 18 + b, 16, 1, '#2a2420').rect(9, 21 + b, 12, 1, '#6a6460').rect(9, 24 + b, 14, 1, '#6a6460');
    else p.rect(9, 17 + b, 3, 11, skin).rect(22, 17 + b, 3, 11, skin);
    p.rect(13, 48, 3, 2, '#3a2420').rect(18, 48, 3, 2, '#3a2420'); return p.outline('#1a1016'); };
  const people = []; const r = rnd(9);
  [[-1.4, 2.0, '#d8d0b8'], [-0.6, 2.6, '#b8a888'], [0.3, 2.2, '#1fb8a8'], [1.1, 2.7, '#e8e0d0', true], [1.8, 2.1, '#a89878'], [-2.2, 2.9, '#c8c0a8'], [3.2, 4.4, '#d8c8a0', true]].forEach(([x, z, shirt, paper], k) => {
    const skin = ['#8a5a3a', '#6a4028', '#9a6a48'][k % 3]; const frames = [person(shirt, skin, 0, { paper }), person(shirt, skin, 1, { paper })];
    const sp = sprite(frames[0], 1.67); sp.position.set(x, 0, z); sp.userData.frames = frames.map((f) => f.tex()); sp.userData.ph = r() * 2; scene.add(sp); people.push(sp); });
  // ---- coconut palms in 3D: pixel-textured trunk cylinder + crossed frond cards
  const bark = new PX(12, 48); for (let y = 0; y < 48; y++) for (let x = 0; x < 12; x++) bark.dot(x, y, y % 4 === 0 ? '#4a3626' : x < 3 ? '#6a5038' : '#86684a');
  const frondPX = new PX(64, 24); for (let k = 0; k < 60; k++) { const u = k / 60, x = 2 + k, y = 6 + u * u * 12; frondPX.rect(x, y, 1, 2, '#3e6a2a'); if (k % 2) { frondPX.rect(x, y - 5 + u * 2, 1, 5 - u * 2, '#5a8a36'); frondPX.rect(x, y + 2, 1, 6 - u * 3, '#2e5420'); } } frondPX.outline('#1a3014');
  const frondTex = frondPX.tex(), barkMat = new THREE.MeshLambertMaterial({ map: bark.tex({ repeat: [1, 4] }) }), frondMat = new THREE.MeshLambertMaterial({ map: frondTex, alphaTest: 0.5, side: THREE.DoubleSide });
  const palm = (x, z, h, lean = 0.12, seed = 0, shadow = true) => { const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
    const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.24, h, 8, 6), barkMat); tr.position.set(-Math.sin(lean) * h / 2, h / 2 * Math.cos(lean), 0); tr.rotation.z = lean; tr.castShadow = shadow; g.add(tr);
    const crown = new THREE.Group(); crown.position.set(-Math.sin(lean) * h, h * Math.cos(lean), 0); g.add(crown);
    for (let f = 0; f < 10; f++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.2), frondMat); m.geometry.translate(1.6, -0.25, 0); m.rotation.order = 'YZX'; m.rotation.y = (f / 10) * Math.PI * 2 + seed; m.rotation.z = -0.35 - (f % 2) * 0.2; m.rotation.x = (f % 3 - 1) * 0.3; m.castShadow = shadow; crown.add(m); }
    for (let i = 0; i < 4; i++) { const n = new THREE.Mesh(new THREE.SphereGeometry(0.14, 6, 4), new THREE.MeshLambertMaterial({ color: 0x6a8a2a })); n.position.set(Math.cos(i * 1.6) * 0.18, -0.2, Math.sin(i * 1.6) * 0.18); crown.add(n); }
    g.userData.crown = crown; return g; };
  const palms = [[-2.8, -3.6, 7.5], [3, -3.8, 8.2], [-8.4, 1.6, 7], [8.6, 2, 8], [-5, 8.4, 6.5], [1.4, -11, 9], [-12, -6, 8.5], [12, -5, 9]].map(([x, z, h], i) => palm(x, z, h, 0.08 + (i % 3) * 0.05, i));
  // grass clumps at the lane edges (billboards)
  const grass = new PX(24, 12); { const gr = rnd(11); for (let i = 0; i < 46; i++) { const x = gr() * 24, h = 4 + gr() * 8; grass.rect(x, 12 - h, 1, h, gr() < 0.5 ? '#3a6a2a' : '#5a8a36'); } } grass.outline('#1e3a18');
  { const gr = rnd(5); for (let i = 0; i < 70; i++) { const a = gr() * Math.PI * 2, d = 4.6 + gr() * 8; const gm = sprite(grass, 0.55); gm.position.set(Math.cos(a) * d, 0, Math.sin(a) * d * 0.8 + 1); scene.add(gm); } }
  // distant ridge of palms (hazed by the aerial fog)
  for (let i = 0; i < 26; i++) palm(-50 + i * 4 + (i % 2) * 1.5, -30 - (i % 3) * 4, 7 + (i % 4), 0.06 * ((i % 3) - 1), i, false);
  // ---- daylight rig: warm sun key with shadows, sky/ground hemisphere fill, soft front fill on the crowd
  const sun = new THREE.DirectionalLight(0xfff0d6, 3.4); sun.position.set(-10, 18, 14); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0005; Object.assign(sun.shadow.camera, { left: -18, right: 18, top: 18, bottom: -18, far: 80 }); scene.add(sun);
  scene.add(new THREE.HemisphereLight(0xb8d4ff, 0x8a6a48, 1.4));
  const fill = new THREE.PointLight(0xdfe8ff, 3, 9, 1.2); fill.position.set(0, 2.2, 5.6); scene.add(fill);
  const camera = new THREE.PerspectiveCamera(58, W / H, 0.3, 400);
  const stage = makeStage(W, H, { ss: 1 });
  stage.bloom.strength = 0.25; stage.bloom.threshold = 0.92; stage.renderer.toneMappingExposure = 1.05;
  stage.grade.uniforms.vignette.value = 0.35; stage.grade.uniforms.warm.value = 0.15; stage.grade.uniforms.sat.value = 1.12;
  K = { THREE, scene, camera, stage, people, palms };
}

export async function preload() { await build(); }
export const hits = [];
export const scenes = {
  s1: (g, s) => {
    const { THREE, scene, camera, stage, people, palms } = K; const t = s.t;
    const u = Math.min(1, t / 5), e = u * u * (3 - 2 * u);
    camera.position.set(-9 + 5.5 * e, 12 - 6.2 * e, 21 - 9.5 * e); camera.lookAt(0.3, 3.4 - 2.0 * e, -2 + 2.2 * e);
    people.forEach((p) => { const f = Math.floor(t * 1.4 + p.userData.ph) % 2; p.material.map = p.userData.frames[f]; });
    palms.forEach((p, i) => { p.userData.crown.rotation.z = Math.sin(t * 0.7 + i) * 0.03; p.userData.crown.rotation.x = Math.cos(t * 0.5 + i) * 0.02; });  // heavy crowns sway slowly
    const focus = camera.position.distanceTo(new THREE.Vector3(0, 1.2, 2.3)); const fp = new THREE.Vector3(0, 1.2, 2.3).project(camera); const band = Math.min(0.8, Math.max(0.2, (fp.y + 1) / 2));
    const cv = stage.render(scene, camera, { focus, aperture: 70, tilt: 8, band, half: 0.13, feather: 0.35 });
    g.drawImage(cv, 0, 0, W, H);
  },
};
