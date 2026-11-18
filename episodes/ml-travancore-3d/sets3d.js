// 3D pixel-diorama sets for the Travancore Short (px3d kit). Each set returns { scene, update(t), cam(t, camera) -> focus point }.
import { W, H } from '../../pipeline/engine.js';
import { THREE, PX, pxBox, roof, sprite, halo, rnd } from '../../pipeline/px3d.js';
import { mapArt, pxConch } from '../ml-travancore/pixelsets.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const ease = (u) => { u = Math.min(1, Math.max(0, u)); return u * u * (3 - 2 * u); };
const lerp3 = (a, b, u) => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];

// ---------------------------------------------------------------- shared textures
export const T = (() => {
  const road = new PX(48, 48).ramp(['#8a6248', '#9e7254', '#b08462', '#c29674'], (x, y) => 0.5 + 0.25 * Math.sin(x * 0.7) * Math.cos(y * 0.5) + (rnd(x * 97 + y)() - 0.5) * 0.5);
  { const r = rnd(4); for (let i = 0; i < 30; i++) road.rect(r() * 48, r() * 48, 2, 1, '#6a3a28'); }
  const grass = new PX(48, 48).ramp(['#4a6a32', '#587a3a', '#668a42', '#76984c'], (x, y) => 0.5 + (rnd(x * 13 + y * 29)() - 0.5) * 0.9);
  const laterite = new PX(48, 48).ramp(['#7a4a3a', '#8e5a44', '#a26c50', '#b47e5e'], (x, y) => 0.55 + 0.15 * Math.sin(x * 1.3 + y * 0.4) + (rnd(x * 31 + y * 7)() - 0.5) * 0.6);
  for (let y = 0; y < 48; y += 8) for (let x = (y / 8) % 2 ? 0 : 6; x < 48; x += 12) laterite.rect(x, y, 1, 8, '#5e3a2e').rect(x, y, 12, 1, '#5e3a2e');
  const lime = new PX(48, 48).ramp(['#c8c0ac', '#ddd6c4', '#ece6d6', '#f8f4ea'], (x, y) => 0.7 + (rnd(x * 13 + y * 5)() - 0.5) * 0.35 - (y > 40 ? 0.35 : 0));
  const tiles = new PX(24, 24); for (let y = 0; y < 24; y++) for (let x = 0; x < 24; x++) { const row = Math.floor(y / 3), k = (x + (row % 2) * 3) % 6; tiles.dot(x, y, y % 3 === 0 ? '#4e2218' : k === 0 ? '#6e3222' : k < 3 ? '#9a4a32' : '#ae5c3e'); }
  const wood = new PX(24, 24).ramp(['#4a2a18', '#6a3e22', '#8a5430'], (x, y) => 0.5 + 0.4 * Math.sin(y * 0.9 + Math.sin(x * 0.3)));
  const teak = new PX(48, 48).ramp(['#3a2014', '#542e1a', '#6e3e22', '#8a5230'], (x, y) => 0.5 + 0.35 * Math.sin(x * 0.25 + Math.sin(y * 0.15) * 3) + (rnd(x * 7 + y * 3)() - 0.5) * 0.3);
  const stone = new PX(48, 48).ramp(['#8a8478', '#a29c90', '#bab4a8', '#d0cabe'], (x, y) => 0.55 + (rnd(x * 11 + y * 17)() - 0.5) * 0.5);
  for (let y = 0; y < 48; y += 12) stone.rect(0, y, 48, 1, '#6a6458');
  const bark = new PX(12, 48); for (let y = 0; y < 48; y++) for (let x = 0; x < 12; x++) bark.dot(x, y, y % 4 === 0 ? '#4a3626' : x < 3 ? '#6a5038' : '#86684a');
  const frond = new PX(64, 24); for (let k = 0; k < 60; k++) { const u = k / 60, x = 2 + k, y = 6 + u * u * 12; frond.rect(x, y, 1, 2, '#3e6a2a'); if (k % 2) { frond.rect(x, y - 5 + u * 2, 1, 5 - u * 2, '#5a8a36'); frond.rect(x, y + 2, 1, 6 - u * 3, '#2e5420'); } } frond.outline('#1a3014');
  const grassClump = new PX(24, 12); { const gr = rnd(11); for (let i = 0; i < 46; i++) { const x = gr() * 24, h = 4 + gr() * 8; grassClump.rect(x, 12 - h, 1, h, gr() < 0.5 ? '#3a6a2a' : '#5a8a36'); } } grassClump.outline('#1e3a18');
  return { road, grass, laterite, lime, tiles, wood, teak, stone, bark, frond, grassClump };
})();

// ---------------------------------------------------------------- shared props
export function skyTex(stops, clouds = 9, { cloudCols = ['#ffffff', '#eef3fa', '#c8d6ea'], stars = 0, seed = 8 } = {}) {
  const sk = new PX(270, 480); sk.ramp(stops, (x, y) => y / 479); const r = rnd(seed);
  for (let i = 0; i < stars; i++) sk.dot(r() * 270, r() * 260, r() < 0.3 ? '#fff6dc' : '#8a96c0');
  for (let c = 0; c < clouds; c++) { const cx = r() * 270, cy = 40 + r() * 200, cw = 30 + r() * 60, ch = 8 + r() * 12;
    for (let j = 0; j < ch; j++) { const w = cw * Math.sin(((j + 0.5) / ch) * Math.PI) * (0.7 + 0.3 * r()); for (let i = -w / 2; i < w / 2; i++) sk.dot(cx + i, cy + j, cloudCols[j < ch * 0.35 ? 0 : j < ch * 0.7 ? 1 : 2]); } }
  const t = sk.tex(); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return t;
}
export function ground(scene, tex, size = 800, rep = 400) { const g = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshLambertMaterial({ map: tex.tex({ repeat: [rep, rep] }) })); g.rotation.x = -Math.PI / 2; g.receiveShadow = true; scene.add(g); return g; }
const barkMat = () => new THREE.MeshLambertMaterial({ map: T.bark.tex({ repeat: [1, 4] }) });
const frondMat = () => new THREE.MeshLambertMaterial({ map: T.frond.tex(), alphaTest: 0.5, side: THREE.DoubleSide });
export function palm(scene, x, z, h, { lean = 0.1, seed = 0, shadow = true, bm = barkMat(), fm = frondMat() } = {}) {
  const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
  const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.24, h, 8, 6), bm); tr.position.set(-Math.sin(lean) * h / 2, h / 2 * Math.cos(lean), 0); tr.rotation.z = lean; tr.castShadow = shadow; g.add(tr);
  const crown = new THREE.Group(); crown.position.set(-Math.sin(lean) * h, h * Math.cos(lean), 0); g.add(crown);
  for (let f = 0; f < 10; f++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.2), fm); m.geometry.translate(1.6, -0.25, 0); m.rotation.order = 'YZX'; m.rotation.y = (f / 10) * Math.PI * 2 + seed; m.rotation.z = -0.35 - (f % 2) * 0.2; m.rotation.x = (f % 3 - 1) * 0.3; m.castShadow = shadow; crown.add(m); }
  g.userData.crown = crown; g.userData.seed = seed; return g;
}
export function swayPalms(palms, t) { palms.forEach((p) => { p.userData.crown.rotation.z = Math.sin(t * 0.7 + p.userData.seed) * 0.03; p.userData.crown.rotation.x = Math.cos(t * 0.5 + p.userData.seed) * 0.02; }); }
export function house(scene, x, z, w, d, rot, wallTex, { windowsLit = 0 } = {}) {
  const g = new THREE.Group();
  const plinth = pxBox(w + 0.4, 0.45, d + 1.6, T.laterite.tex()); plinth.position.set(0, 0.22, 0.5); g.add(plinth);
  const body = pxBox(w, 2.6, d, wallTex.tex()); body.position.y = 1.75; g.add(body);
  for (let i = 0; i < 4; i++) { const p = pxBox(0.18, 2.4, 0.18, T.wood.tex(), { tileM: 1 }); p.position.set(-w / 2 + 0.2 + i * (w - 0.4) / 3, 1.65, d / 2 + 1.05); g.add(p); }
  const door = pxBox(0.9, 1.8, 0.06, T.wood.tex(), { tileM: 1 }); door.position.set(0, 1.35, d / 2 + 0.03); g.add(door);
  [-1, 1].forEach((sd) => { const lit = windowsLit && (sd > 0 || windowsLit > 1); const sh = lit ? new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.8), new THREE.MeshBasicMaterial({ color: 0xffae55 })) : pxBox(0.7, 0.8, 0.05, T.wood.tex(), { tileM: 1 }); sh.position.set(sd * w / 3, 1.9, d / 2 + 0.04); g.add(sh); if (lit) { const h2 = halo(0xffa050, 1.6); h2.position.set(sd * w / 3, 1.9, d / 2 + 0.2); g.add(h2); } });
  const rf = roof(w + 0.6, d + 2.4, 1.9, T.tiles.tex(), 1); rf.position.set(0, 3.05, 0.5); g.add(rf);
  g.position.set(x, 0, z); g.rotation.y = rot; scene.add(g); return g;
}
export function person(shirt, skin, frame, { paper = false, mundu = '#f2eee4', arms = 'down' } = {}) {
  const p = new PX(34, 50); const b = frame;
  p.rect(12, 30, 10, 18, mundu).rect(12, 30, 2, 18, '#c8c0b0').rect(20, 30, 2, 18, '#e0dace');
  p.rect(11, 15 + b, 12, 16, shirt).rect(11, 15 + b, 2, 16, 'rgba(0,0,0,0.2)');
  p.rect(13, 5 + b, 8, 10, skin).rect(13, 4 + b, 8, 3, '#1a1016').rect(19, 9 + b, 1, 1, '#1a1016');
  if (paper) p.rect(7, 16 + b, 20, 12, '#ece4cc').rect(9, 18 + b, 16, 1, '#2a2420').rect(9, 21 + b, 12, 1, '#6a6460').rect(9, 24 + b, 14, 1, '#6a6460');
  else if (arms === 'basket') p.rect(9, 17 + b, 3, 9, skin).rect(22, 17 + b, 3, 9, skin).rect(6, 24 + b, 22, 6, '#a8783a').rect(7, 24 + b, 20, 2, '#2a1c22');
  else p.rect(9, 17 + b, 3, 11, skin).rect(22, 17 + b, 3, 11, skin);
  p.rect(13, 48, 3, 2, '#3a2420').rect(18, 48, 3, 2, '#3a2420'); return p.outline('#1a1016');
}
export function crowd(scene, spec, seed = 9) {
  const r = rnd(seed); return spec.map(([x, z, shirt, opts = {}], k) => { const skin = ['#8a5a3a', '#6a4028', '#9a6a48'][k % 3];
    const frames = [person(shirt, skin, 0, opts), person(shirt, skin, 1, opts)]; const sp = sprite(frames[0], 1.67); sp.position.set(x, 0, z);
    sp.userData.frames = frames.map((f) => f.tex()); sp.userData.ph = r() * 2; scene.add(sp); return sp; });
}
export function idle(people, t) { people.forEach((p) => { p.material.map = p.userData.frames[Math.floor(t * 1.4 + p.userData.ph) % 2]; }); }
function grassRing(scene, n, r0, r1, cz = 1, seed = 5) { const gr = rnd(seed); for (let i = 0; i < n; i++) { const a = gr() * Math.PI * 2, d = r0 + gr() * (r1 - r0); const gm = sprite(T.grassClump, 0.55); gm.position.set(Math.cos(a) * d, 0, Math.sin(a) * d * 0.8 + cz); scene.add(gm); } }
/** conch flag on a pole: segmented plane, waves in update */
export function conchFlag(scene, x, y, z, s = 1) {
  const fp = new PX(52, 32).ramp(['#8a1a26', '#a82a34', '#c43a40'], (x2) => 0.3 + x2 / 80); pxConch(fp.g, 26, 16, 0.6); // conch drawn into the texture
  const g = new THREE.PlaneGeometry(2.6 * s, 1.6 * s, 16, 4); g.translate(1.3 * s, 0, 0);
  const m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ map: fp.tex(), side: THREE.DoubleSide })); m.position.set(x, y, z); m.castShadow = true; scene.add(m);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05 * s, 0.06 * s, 4.2 * s, 6), new THREE.MeshLambertMaterial({ color: 0xd8d0c0 })); pole.position.set(x, y - 1.3 * s, z); scene.add(pole);
  const base = g.attributes.position.array.slice();
  return (t) => { const a = g.attributes.position; for (let i = 0; i < a.count; i++) { const bx = base[i * 3]; a.setZ(i, Math.sin(t * 4 - bx * 2.2) * 0.18 * (bx / (2.6 * s)) * s); } a.needsUpdate = true; g.computeVertexNormals(); };
}
/** a simple pixel-water plane: quantized ripple texture scrolling + phong specular for the sun/lamp columns */
export function water(scene, { size = 300, color = 0x2a4a6a, spec = 0xffe0b0, y = 0, sky = 0x8aa0c8, glow = 0.55 } = {}) {
  const wp = new PX(64, 64); wp.ramp(['#98a8c2', '#a8b8d0', '#b8c6da'], (x, y2) => 0.5 + 0.3 * Math.sin(x * 0.2 + y2 * 0.05) + (rnd(x * 7 + y2 * 3)() - 0.5) * 0.3); for (let i = 0; i < 90; i++) { const r = rnd(i + 50); wp.rect(r() * 64, r() * 64, 3 + r() * 5, 1, '#f0f4fa'); }
  const tex = wp.tex({ repeat: [size / 2.6, size / 2.6] });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshPhongMaterial({ map: tex, color, specular: spec, shininess: 60, emissive: sky, emissiveMap: tex, emissiveIntensity: glow })); m.rotation.x = -Math.PI / 2; m.position.y = y; m.receiveShadow = true; scene.add(m);
  return (t) => { tex.offset.set(Math.floor(t * 8) / 64 * 0.5, Math.floor(t * 5) / 64); };
}

// ---------------------------------------------------------------- set: the Trivandrum lane (day or night)
export function laneSet({ night = false } = {}) {
  const scene = new THREE.Scene(); const up = []; const P = [];
  scene.background = night ? skyTex(['#050818', '#0a1430', '#101d3e', '#1c2c4e', '#2c4262'], 3, { cloudCols: ['#3a4a6e', '#2a3a5c', '#1e2c4a'], stars: 120 }) : skyTex(['#4a86d8', '#6aa0e4', '#8cb8ec', '#b4d2f2', '#dae8f6']);
  scene.fog = night ? new THREE.FogExp2(0x16223a, 0.018) : new THREE.Fog(0xcfe0f2, 35, 170);
  ground(scene, T.grass);
  const lane = new THREE.Mesh(new THREE.PlaneGeometry(7, 60), new THREE.MeshLambertMaterial({ map: T.road.tex({ repeat: [3.5, 30] }) })); lane.rotation.x = -Math.PI / 2; lane.position.set(0, 0.01, 2); lane.receiveShadow = true; scene.add(lane);
  const yard = new THREE.Mesh(new THREE.PlaneGeometry(14, 6), new THREE.MeshLambertMaterial({ map: T.road.tex({ repeat: [7, 3] }) })); yard.rotation.x = -Math.PI / 2; yard.position.set(0, 0.012, 1.5); yard.receiveShadow = true; scene.add(yard);
  const wl = night ? 1 : 0;
  house(scene, -5.6, -1.6, 4, 3.4, 0.35, T.lime, { windowsLit: wl }); house(scene, 5.8, -1.2, 4.2, 3.4, -0.35, T.laterite, { windowsLit: wl * 2 }); house(scene, -7.4, 5.2, 3.6, 3.2, 1.1, T.lime, { windowsLit: wl }); house(scene, 7.6, 5.6, 3.8, 3.2, -1.15, T.lime); house(scene, -1.8, -8, 5, 3.4, 0.1, T.laterite, { windowsLit: wl * 2 }); house(scene, 4.6, -9, 4, 3.2, -0.2, T.lime, { windowsLit: wl });
  // radio shop
  const shopBack = new PX(96, 48).ramp(night ? ['#a8641e', '#d8923a', '#ffc870', '#ffe2a8'] : ['#6a4a30', '#8a6440', '#a87e52'], (x, y) => 0.7 - y / 140);
  for (let s2 = 0; s2 < 3; s2++) { shopBack.rect(4, 10 + s2 * 12, 88, 1, '#3a2010'); for (let i = 0; i < 18; i++) shopBack.rect(6 + i * 4.8, 4 + s2 * 12, 3, 6, ['#2a5a8a', '#8a2a1e', '#e0b040', '#3a7a3a', '#f0e8d8'][(i + s2 * 2) % 5]); }
  const shop = new THREE.Group(); scene.add(shop);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(4, 2.2), new THREE.MeshLambertMaterial({ map: shopBack.tex(), emissive: night ? 0xffffff : 0x000000, emissiveMap: night ? shopBack.tex() : null, emissiveIntensity: 1.2 })); back.position.set(0, 1.2, -1.2); shop.add(back);
  [-2, 2].forEach((x) => { const sw = pxBox(0.25, 2.6, 2.6, T.lime.tex()); sw.position.set(x, 1.3, 0); shop.add(sw); });
  const top = pxBox(4.3, 0.4, 2.6, T.lime.tex()); top.position.set(0, 2.6, 0); shop.add(top);
  const counter = pxBox(3.6, 0.9, 0.5, T.wood.tex(), { tileM: 1 }); counter.position.set(0, 0.45, 0.9); shop.add(counter);
  const radio = pxBox(0.7, 0.45, 0.32, T.wood.tex(), { tileM: 0.5 }); radio.position.set(0.4, 1.12, 0.9); shop.add(radio);
  const dial = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.12), new THREE.MeshBasicMaterial({ color: 0xffd890 })); dial.position.set(0.4, 1.18, 1.07); shop.add(dial);
  const aw = roof(4.4, 2.4, 0.6, T.tiles.tex(), 1); aw.position.set(0, 2.8, 0.2); shop.add(aw);
  const sign = new PX(48, 10).ramp(['#123a22', '#1e5a32'], () => 0.5); for (let i = 0; i < 9; i++) sign.rect(4 + i * 4.6, 3, 3, 4, '#f0dca0'); const signM = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.5), new THREE.MeshLambertMaterial({ map: sign.tex(), emissive: 0xffffff, emissiveMap: sign.tex(), emissiveIntensity: night ? 0.5 : 0 })); signM.position.set(0, 3.25, 1.4); shop.add(signM);
  const people = crowd(scene, [[-1.4, 2.0, '#d8d0b8'], [-0.6, 2.6, '#b8a888'], [0.3, 2.2, '#1fb8a8'], [1.1, 2.7, '#e8e0d0', { paper: !night }], [1.8, 2.1, '#a89878'], [-2.2, 2.9, '#c8c0a8'], [3.2, 4.4, '#d8c8a0', { paper: !night }]]);
  const bm = barkMat(), fm = frondMat();
  [[-2.8, -3.6, 7.5], [3, -3.8, 8.2], [-8.4, 1.6, 7], [8.6, 2, 8], [-5, 8.4, 6.5], [1.4, -11, 9], [-12, -6, 8.5], [12, -5, 9]].forEach(([x, z, h], i) => P.push(palm(scene, x, z, h, { lean: 0.08 + (i % 3) * 0.05, seed: i, bm, fm })));
  for (let i = 0; i < 26; i++) palm(scene, -50 + i * 4 + (i % 2) * 1.5, -30 - (i % 3) * 4, 7 + (i % 4), { lean: 0.06 * ((i % 3) - 1), seed: i, shadow: false, bm, fm });
  grassRing(scene, 70, 4.6, 12.6);
  if (night) {
    const moon = new THREE.DirectionalLight(0x8fa8e0, 1.6); moon.position.set(-12, 20, 22); moon.castShadow = true; moon.shadow.mapSize.set(2048, 2048); Object.assign(moon.shadow.camera, { left: -18, right: 18, top: 18, bottom: -18, far: 80 }); scene.add(moon);
    scene.add(new THREE.HemisphereLight(0x4a5c8a, 0x1a1420, 1.8));
    const shopLight = new THREE.PointLight(0xffae55, 14, 14, 1.6); shopLight.position.set(0, 1.6, 0.6); shopLight.castShadow = true; shopLight.shadow.mapSize.set(1024, 1024); shop.add(shopLight);
    const sh = halo(0xffb060, 3.2); sh.position.set(0, 1.5, -0.6); shop.add(sh);
    [[3.6, 3.2], [-3.8, 4.2]].forEach(([x, z]) => { const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 4.2, 6), new THREE.MeshLambertMaterial({ color: 0x2a2030 })); pole.position.set(x, 2.1, z); scene.add(pole); const l = new THREE.PointLight(0xffb070, 12, 14, 1.6); l.position.set(x, 4.1, z + 0.4); scene.add(l); const h2 = halo(0xffc080, 1.8); h2.position.set(x, 4.15, z + 0.05); scene.add(h2); });
    const fill = new THREE.PointLight(0x9fb2e8, 5, 9, 1.2); fill.position.set(0, 2.2, 5.2); scene.add(fill);
    const N = 1500, rp = new Float32Array(N * 6), rr = rnd(3); for (let i = 0; i < N; i++) { const x = (rr() - 0.5) * 30, y = rr() * 14, z = (rr() - 0.5) * 30; rp.set([x, y, z, x + 0.06, y - 0.45, z + 0.02], i * 6); }
    const rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.BufferAttribute(rp, 3)); const rain = new THREE.LineSegments(rg, new THREE.LineBasicMaterial({ color: 0xaab8e8, transparent: true, opacity: 0.45 })); scene.add(rain);
    up.push((t) => { rain.position.y = -((t * 14) % 7); const fl = 1 + 0.08 * Math.sin(t * 7.3) + 0.07 * Math.sin(t * 13.1); shopLight.intensity = 14 * fl; dial.material.color.setScalar(0.9 + 0.1 * fl); });
  } else {
    const sun = new THREE.DirectionalLight(0xfff0d6, 3.4); sun.position.set(-10, 18, 14); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0005; Object.assign(sun.shadow.camera, { left: -18, right: 18, top: 18, bottom: -18, far: 80 }); scene.add(sun);
    scene.add(new THREE.HemisphereLight(0xb8d4ff, 0x8a6a48, 1.4)); const fill = new THREE.PointLight(0xdfe8ff, 3, 9, 1.2); fill.position.set(0, 2.2, 5.6); scene.add(fill);
  }
  return { scene, night, update: (t) => { idle(people, t); swayPalms(P, t); up.forEach((f) => f(t)); },
    cam: (tt, camera, { from = [-9, 12, 21], to = [-3.5, 5.8, 11.5], lookFrom = [0.3, 3.4, -2], lookTo = [0.3, 1.4, 0.2], dur = 5 } = {}) => { const e = ease(tt / dur); camera.position.set(...lerp3(from, to, e)); camera.lookAt(...lerp3(lookFrom, lookTo, e)); return V3(0, 1.2, 2.3); } };
}

// ---------------------------------------------------------------- set: the Dewan's desk with the 1947 map (daylight from a window)
export function deskSet() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x2a1a14);
  const floor = pxBox(30, 0.2, 30, T.stone.tex()); floor.position.y = -0.9; scene.add(floor);
  const desk = pxBox(3.6, 0.12, 2.4, T.teak.tex(), { tileM: 2 }); desk.position.y = 0; scene.add(desk);
  [[-1.6, -1], [1.6, -1], [-1.6, 1], [1.6, 1]].forEach(([x, z]) => { const l = pxBox(0.12, 0.9, 0.12, T.teak.tex()); l.position.set(x, -0.45, z); scene.add(l); });
  // the map: a live canvas texture (redrawn when the Travancore glow changes)
  const mc = new OffscreenCanvas(270, 480), mg = mc.getContext('2d'); mg.imageSmoothingEnabled = false; const mtex = new THREE.CanvasTexture(mc); mtex.magFilter = THREE.NearestFilter; mtex.minFilter = THREE.NearestFilter; mtex.colorSpace = THREE.SRGBColorSpace;
  const map = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 2.66), new THREE.MeshLambertMaterial({ map: mtex })); map.rotation.x = -Math.PI / 2; map.rotation.z = 0.04; map.position.set(-0.2, 0.065, 0); map.receiveShadow = true; scene.add(map);
  // props: brass lamp, inkwell, a pen, a book stack
  const brass = new THREE.MeshPhongMaterial({ color: 0xc8962e, shininess: 80, specular: 0xffe8a0 });
  const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.06, 12), brass); lampBase.position.set(1.2, 0.09, -0.8); lampBase.castShadow = true; scene.add(lampBase);
  const lampStem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.6, 8), brass); lampStem.position.set(1.2, 0.4, -0.8); scene.add(lampStem);
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.22, 12, 1, true), new THREE.MeshLambertMaterial({ color: 0x1e5a32, side: THREE.DoubleSide })); shade.position.set(1.2, 0.72, -0.8); scene.add(shade);
  const ink = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.1, 10), new THREE.MeshPhongMaterial({ color: 0x14182a, shininess: 100 })); ink.position.set(1.05, 0.11, 0.5); ink.castShadow = true; scene.add(ink);
  [0, 1, 2].forEach((k) => { const b = pxBox(0.6, 0.08, 0.45, T.wood.tex(), { tileM: 0.5 }); b.position.set(1.15, 0.1 + k * 0.08, 0.05); b.rotation.y = k * 0.12; scene.add(b); });
  const conchS = new PX(24, 36); pxConch(conchS.g, 12, 18, 1); const cw = sprite(conchS, 0.32); cw.position.set(0.75, 0.06, 0.95); scene.add(cw);
  // light: warm sun through a window (key from the left), cool bounce fill, the brass lamp's glow
  const sun = new THREE.DirectionalLight(0xffe2b0, 1.7); sun.position.set(-4, 6, 2); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3, far: 20 }); scene.add(sun);
  scene.add(new THREE.HemisphereLight(0xc8d0e8, 0x4a2a18, 0.8));
  const ll = new THREE.PointLight(0xffc070, 2.5, 3, 1.5); ll.position.set(1.2, 0.6, -0.65); scene.add(ll); const lh = halo(0xffc070, 0.5); lh.position.set(1.2, 0.62, -0.7); scene.add(lh);
  // window light shaft (beam card)
  const beam = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 6), new THREE.MeshBasicMaterial({ color: 0xffe8c0, transparent: true, opacity: 0.08, blending: THREE.AdditiveBlending, depthWrite: false })); beam.position.set(-1.8, 2.4, 0.2); beam.rotation.z = 0.6; scene.add(beam);
  let lastGlow = -1;
  return { scene, update: (t, { glow = 1, conchY = 210 } = {}) => { const gq = Math.round(glow * 20) / 20; if (gq !== lastGlow || conchY !== 210) { mg.clearRect(0, 0, 270, 480); mapArt(mg, t, { glow: gq, conchY }); mtex.needsUpdate = true; lastGlow = gq; } },
    cam: (tt, camera, { from = [0.3, 4.6, 2.6], to = [0.1, 3.6, 2.0], dur = 6 } = {}) => { const e = ease(tt / dur); camera.position.set(...lerp3(from, to, e)); camera.lookAt(0.1, 0, -0.1); return V3(-0.2, 0.06, 0); } };
}

// ---------------------------------------------------------------- set: currency, stamp and badge dropping onto velvet (palace table)
export function itemsSet() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x1a0a10);
  const vel = new PX(48, 48).ramp(['#3a0e1a', '#541a28', '#6e2434', '#842e3e'], (x, y) => 0.5 + 0.35 * Math.sin(x * 0.3 + y * 0.05) + (rnd(x * 5 + y * 3)() - 0.5) * 0.3);
  const table = pxBox(6, 0.2, 4, vel.tex(), { tileM: 2 }); table.position.y = -0.1; scene.add(table);
  const coinFace = new PX(32, 32); for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const d = Math.hypot(x - 15.5, y - 15.5); if (d < 16) coinFace.dot(x, y, d > 14 ? '#6a6258' : d > 12 ? '#d8d2c6' : (x + y) < 28 ? '#e8e2d6' : '#b8b0a4'); } pxConch(coinFace.g, 16, 16, 0.55, ['#6a6258', '#9a9284', '#d8d2c6', '#fff']);
  const silver = new THREE.MeshPhongMaterial({ color: 0xd8d2c6, shininess: 90, specular: 0xffffff });
  const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.06, 32), [silver, new THREE.MeshPhongMaterial({ map: coinFace.tex(), shininess: 90, specular: 0xffffff }), silver]); coin.castShadow = true; scene.add(coin);
  const st = new PX(36, 46); st.rect(0, 0, 36, 46, '#f2ead8'); for (let i = 0; i < 36; i += 3) { st.rect(i, 0, 1, 1, '#541a28'); st.rect(i, 45, 1, 1, '#541a28'); } st.rect(3, 3, 30, 40, '#8a1d2a'); pxConch(st.g, 18, 20, 0.8); st.rect(6, 36, 24, 3, '#f6e6c0');
  const stamp = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.02, 0.8), [0, 0, new THREE.MeshLambertMaterial({ map: st.tex() }), 0, 0, 0].map((m) => m || new THREE.MeshLambertMaterial({ color: 0xf2ead8 }))); stamp.castShadow = true; scene.add(stamp);
  const starShape = new THREE.Shape(); for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2, r = i % 2 ? 0.28 : 0.42; i ? starShape.lineTo(Math.cos(a) * r, Math.sin(a) * r) : starShape.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
  const badge = new THREE.Mesh(new THREE.ExtrudeGeometry(starShape, { depth: 0.06, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 1 }), new THREE.MeshPhongMaterial({ color: 0xc89a3a, shininess: 70, specular: 0xffe8a0, flatShading: true })); badge.rotation.x = -Math.PI / 2; badge.castShadow = true; scene.add(badge);
  const key = new THREE.SpotLight(0xffe2b8, 40, 12, 0.5, 0.6, 1.4); key.position.set(-1.5, 5, 2); key.target.position.set(0, 0, 0); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); scene.add(key, key.target);
  scene.add(new THREE.HemisphereLight(0xd8c8e8, 0x2a0a14, 1.0));
  const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.5, 10), new THREE.MeshLambertMaterial({ color: 0xe8dcc0 })); candle.position.set(-2, 0.25, -1.2); scene.add(candle);
  const cl = new THREE.PointLight(0xffb060, 4, 5, 1.5); cl.position.set(-2, 0.6, -1.1); scene.add(cl); const ch = halo(0xffc070, 0.6); ch.position.set(-2, 0.58, -1.15); scene.add(ch);
  const drop = (tt, x, z, restY, delay) => { const u = tt - delay; if (u < 0) return 3; const f = Math.min(1, u / 0.35); const bounce = u > 0.35 ? Math.exp(-(u - 0.35) * 10) * Math.abs(Math.sin((u - 0.35) * 18)) * 0.15 : 0; return restY + 3 * (1 - f * f) + bounce; };
  return { scene, update: (t, { a = 0, now = 0 } = {}) => { const tt = now - a;
      coin.position.set(-1.25, drop(tt, -1.25, 0.2, 0.03, 0), 0.25); coin.rotation.set(0, 0, 0); if (tt < 0.35) coin.rotation.x = (1 - Math.min(1, tt / 0.35)) * 2;
      stamp.position.set(0, drop(tt, 0, 0, 0.01, 0.5), -0.1); stamp.rotation.y = 0.08;
      badge.position.set(1.25, drop(tt, 1.25, 0.2, 0.03, 1.0), 0.3); badge.rotation.z = 0.3; cl.intensity = 4 * (1 + 0.1 * Math.sin(t * 9)); },
    cam: (tt, camera, { dur = 6 } = {}) => { const e = ease(tt / dur); camera.position.set(0.2 - 0.3 * e, 6.4 - 0.9 * e, 3.6 - 0.5 * e); camera.lookAt(0, 0, 0.1); return V3(0, 0.05, 0.1); } };
}

// ---------------------------------------------------------------- set: thorium beach at sunset
export function beachSet() {
  const scene = new THREE.Scene(); scene.background = skyTex(['#2a3a7a', '#7a5a9a', '#e07a6a', '#ffa868', '#ffd8a0'], 7, { cloudCols: ['#ffd8b0', '#e89a8a', '#9a6a8a'], seed: 12 }); scene.fog = new THREE.Fog(0xf0a888, 40, 220);
  const upd = water(scene, { color: 0x9a6a8a, spec: 0xffd0a0, sky: 0xd88a7a, glow: 0.6 });
  const sand = new PX(48, 48).ramp(['#2a1c22', '#3a2a30', '#4e3a3e', '#64504e'], (x, y) => 0.45 + (rnd(x * 41 + y * 13)() - 0.5) * 0.8);
  const beach = new THREE.Mesh(new THREE.PlaneGeometry(200, 30, 40, 1), new THREE.MeshPhongMaterial({ map: sand.tex({ repeat: [100, 15] }), shininess: 40, specular: 0x8a6a5a, emissive: 0xffffff, emissiveMap: sand.tex({ repeat: [100, 15] }), emissiveIntensity: 0.55 })); beach.rotation.x = -Math.PI / 2; beach.position.set(0, 0.06, 12); beach.receiveShadow = true; scene.add(beach);
  // glinting thorium grains (tiny emissive sprites that twinkle)
  const glints = []; const gr = rnd(7); for (let i = 0; i < 90; i++) { const h2 = halo(gr() < 0.5 ? 0xffd890 : 0xffffff, 0.12); h2.position.set((gr() - 0.5) * 18, 0.08, 1 + gr() * 12); h2.userData.ph = gr() * 10; scene.add(h2); glints.push(h2); }
  const sunDisc = new THREE.Mesh(new THREE.CircleGeometry(4.5, 32), new THREE.MeshBasicMaterial({ color: 0xffe8c0, fog: false })); sunDisc.position.set(0, 6, -150); scene.add(sunDisc);
  const sunHalo = halo(0xffc080, 32); sunHalo.material.fog = false; sunHalo.material.depthTest = false; sunHalo.renderOrder = 5; sunHalo.position.set(0, 6, -149); scene.add(sunHalo);
  const sun = new THREE.DirectionalLight(0xffb070, 2.6); sun.position.set(-30, 12, 10); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -20, right: 20, top: 20, bottom: -20, far: 120 }); scene.add(sun);
  scene.add(new THREE.HemisphereLight(0xf0a8c0, 0x4a3038, 2.0));
  const P = []; const bm = barkMat(), fm = frondMat(); [[7, 6, 9, -0.2], [-6.5, 4, 7.5, 0.18], [10, 10, 8, -0.1], [-10, 12, 8.5, 0.12]].forEach(([x, z, h, l], i) => P.push(palm(scene, x, z, h, { lean: l, seed: i, bm, fm })));
  const woman = crowd(scene, [[0.6, 7.5, '#c03a5a', { arms: 'basket', mundu: '#f2e8d8' }]], 3);
  const fill = new THREE.PointLight(0xffd0b0, 3, 8, 1.2); fill.position.set(0.6, 2, 11); scene.add(fill);
  // foam lines rolling in
  const foams = []; for (let k = 0; k < 4; k++) { const f = new THREE.Mesh(new THREE.PlaneGeometry(200, 0.3), new THREE.MeshBasicMaterial({ color: 0xfff0e8, transparent: true, opacity: 0.6 })); f.rotation.x = -Math.PI / 2; scene.add(f); foams.push(f); }
  return { scene, update: (t) => { upd(t); swayPalms(P, t); idle(woman, t); glints.forEach((g) => { const s2 = Math.max(0, Math.sin(t * 3 + g.userData.ph)); g.material.opacity = s2 > 0.7 ? (s2 - 0.7) * 3.3 : 0; });
      foams.forEach((f, k) => { const ph = (t * 0.2 + k / 4) % 1; f.position.set(0, 0.05, -6 + ph * 7); f.material.opacity = 0.6 * Math.sin(ph * Math.PI); }); },
    cam: (tt, camera, { dur = 6 } = {}) => { const e = ease(tt / dur); camera.position.set(-2 + 2 * e, 7.5 - 2 * e, 24 - 6 * e); camera.lookAt(0, 2.2 - 0.8 * e, 0); return V3(0.6, 0.8, 7.5); } };
}

// ---------------------------------------------------------------- set: the music academy on the rainy night of July 25
export function hallSet() {
  const scene = new THREE.Scene(); scene.background = skyTex(['#050818', '#0a1430', '#101d3e', '#1c2c4e', '#2c4262'], 4, { cloudCols: ['#3a4a6e', '#2a3a5c', '#1e2c4a'], stars: 60, seed: 4 }); scene.fog = new THREE.FogExp2(0x1c2334, 0.02);
  ground(scene, T.road, 300, 150);
  const hall = new THREE.Group(); scene.add(hall);
  const body = pxBox(12, 5, 6, T.lime.tex()); body.position.set(0, 2.5, -4); hall.add(body);
  for (let k = 0; k < 4; k++) { const st = pxBox(10 + k * 0.8, 0.2, 1, T.stone.tex()); st.position.set(0, 0.1 + k * 0.2 - 0.6 + 0.6, 0.6 - k * 0.6 + 0.6); }
  const steps = []; for (let k = 0; k < 4; k++) { const st = pxBox(11 - k * 0.6, 0.22, 0.8, T.stone.tex()); st.position.set(0, 0.11 + k * 0.22, 1.6 - k * 0.6); hall.add(st); steps.push(st); }
  for (let i = 0; i < 6; i++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 4.6, 12), new THREE.MeshLambertMaterial({ map: T.stone.tex({ repeat: [1, 2] }) })); c.position.set(-5 + i * 2, 3.2, -0.7); c.castShadow = true; hall.add(c); }
  const pedi = roof(12.6, 2.4, 1.5, T.stone.tex(), 2); pedi.position.set(0, 5.5, -0.7); hall.add(pedi);
  const frieze = new PX(96, 8).ramp(['#a29c90', '#bab4a8'], () => 0.5); for (let i = 0; i < 13; i++) frieze.rect(6 + i * 7, 2, 4, 4, '#4a443c'); const fz = new THREE.Mesh(new THREE.PlaneGeometry(10, 0.6), new THREE.MeshLambertMaterial({ map: frieze.tex() })); fz.position.set(0, 5.25, -0.38); hall.add(fz);
  const doors = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 3), new THREE.MeshBasicMaterial({ color: 0xffb860 })); doors.position.set(0, 2.4, -0.99); hall.add(doors); const dh = halo(0xffb060, 5); dh.position.set(0, 2.4, -0.6); hall.add(dh);
  const dl = new THREE.PointLight(0xffae55, 12, 14, 1.5); dl.position.set(0, 2.4, 0.4); dl.castShadow = true; scene.add(dl);
  [[-4.8, 1.6], [4.8, 1.6]].forEach(([x, z]) => { const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 3.6, 6), new THREE.MeshLambertMaterial({ color: 0x2a2030 })); pole.position.set(x, 1.8, z); scene.add(pole); const l = new THREE.PointLight(0xffb070, 10, 12, 1.6); l.position.set(x, 3.7, z + 0.3); scene.add(l); const h2 = halo(0xffc080, 1.6); h2.position.set(x, 3.7, z); scene.add(h2); });
  // 1940s sedan: body, cabin, wheels, chrome rim
  const car = new THREE.Group(); car.position.set(1.2, 0, 4.2); car.rotation.y = -0.2; scene.add(car);
  const paint = new THREE.MeshPhongMaterial({ color: 0x14121c, shininess: 90, specular: 0x8899cc });
  const cb = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.7, 1.7), paint); cb.position.y = 0.65; cb.castShadow = true; car.add(cb);
  const cab = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.7, 1.5), paint); cab.position.set(-0.2, 1.3, 0); cab.castShadow = true; car.add(cab);
  const glass = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.45, 1.52), new THREE.MeshPhongMaterial({ color: 0x2a3a5a, shininess: 120, specular: 0xffffff })); glass.position.set(-0.2, 1.35, 0); car.add(glass);
  [[-1.4, 0.85], [1.4, 0.85], [-1.4, -0.85], [1.4, -0.85]].forEach(([x, z]) => { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.28, 16), new THREE.MeshLambertMaterial({ color: 0x08060a })); w.rotation.x = Math.PI / 2; w.position.set(x, 0.38, z); car.add(w); });
  const hl = new THREE.PointLight(0xfff0c0, 3, 6, 1.5); hl.position.set(2.3, 0.7, 0); car.add(hl); const hh = halo(0xfff0c0, 0.8); hh.position.set(2.15, 0.7, 0.5); car.add(hh);
  const people = crowd(scene, [[-3, 2.6, '#c8c0a8'], [3.8, 2.2, '#b8a888'], [-1.6, 3.4, '#d8d0b8']], 12);
  const moon = new THREE.DirectionalLight(0x8fa8e0, 1.4); moon.position.set(-10, 20, 18); moon.castShadow = true; moon.shadow.mapSize.set(2048, 2048); Object.assign(moon.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, far: 80 }); scene.add(moon);
  scene.add(new THREE.HemisphereLight(0x4a5c8a, 0x1a1420, 1.8));
  const fill = new THREE.PointLight(0x9fb2e8, 4, 10, 1.2); fill.position.set(0, 2.5, 7); scene.add(fill);
  const N = 1800, rp = new Float32Array(N * 6), rr = rnd(3); for (let i = 0; i < N; i++) { const x = (rr() - 0.5) * 30, y = rr() * 14, z = (rr() - 0.5) * 30; rp.set([x, y, z, x + 0.08, y - 0.5, z + 0.02], i * 6); }
  const rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.BufferAttribute(rp, 3)); const rain = new THREE.LineSegments(rg, new THREE.LineBasicMaterial({ color: 0xaab8e8, transparent: true, opacity: 0.5 })); scene.add(rain);
  const bolt = new THREE.PointLight(0xcfe0ff, 0, 40, 1); bolt.position.set(2, 8, 6); scene.add(bolt);
  return { scene, update: (t, { flash = 0 } = {}) => { idle(people, t); rain.position.y = -((t * 16) % 7); bolt.intensity = 60 * flash; },
    cam: (tt, camera, { dur = 8 } = {}) => { const e = ease(tt / dur); camera.position.set(-6 + 5 * e, 9 - 3.5 * e, 20 - 6 * e); camera.lookAt(0.5, 2.6 - 0.8 * e, 0); return V3(1.2, 1, 4.2); } };
}

// ---------------------------------------------------------------- set: the what-if harbour (sunrise, or grey and shuttered)
export function harbourSet({ grey = false } = {}) {
  const scene = new THREE.Scene();
  scene.background = grey ? skyTex(['#4a4e5a', '#5a5e6a', '#6a6e78', '#7a7e88', '#8a8e98'], 12, { cloudCols: ['#9a9ea8', '#7a7e88', '#5a5e68'], seed: 21 }) : skyTex(['#3a5aa8', '#7a8ac8', '#e8a8a0', '#ffc898', '#ffe8c0'], 6, { cloudCols: ['#ffe8d8', '#f0b8a8', '#b88aa0'], seed: 14 });
  scene.fog = new THREE.Fog(grey ? 0x7a7e88 : 0xf8d8c0, 40, 200);
  const upd = water(scene, { sky: grey ? 0x6a7484 : 0xe8b0a0, glow: grey ? 0.45 : 0.6, color: grey ? 0x5a6070 : 0x8a88b0, spec: grey ? 0x8899aa : 0xffe0b0 });
  const quay = pxBox(60, 1.2, 10, T.stone.tex()); quay.position.set(0, 0.6, 12); scene.add(quay);
  // skyline of the capital: boxes with emissive window grids (golden at sunrise, dark when grey)
  const winPX = new PX(24, 48).ramp(grey ? ['#3a3e48', '#4a4e58'] : ['#6a7aa8', '#8a9ac0', '#a8b8d8'], (x, y) => 0.4 + 0.3 * Math.sin(y * 0.2)); for (let y = 2; y < 48; y += 4) for (let x = 2; x < 24; x += 4) winPX.rect(x, y, 2, 2, grey ? (rnd(x * 9 + y)() < 0.2 ? '#6a6a5a' : '#2a2e38') : (rnd(x * 9 + y)() < 0.5 ? '#ffe2a8' : '#4a5a88'));
  const wr = rnd(30); for (let i = 0; i < 26; i++) { const h = 6 + wr() * 26, w = 3 + wr() * 4; const b = pxBox(w, h, w, winPX.tex(), { tileM: 2 }); b.position.set(-40 + i * 3.4 + wr() * 2, h / 2, -40 - wr() * 20); b.castShadow = false; scene.add(b); }
  // cranes
  [[-16, 6], [17, 5]].forEach(([x, z]) => { const mat = new THREE.MeshLambertMaterial({ color: grey ? 0x4a4a52 : 0xd8682a }); const tw = new THREE.Mesh(new THREE.BoxGeometry(0.6, 14, 0.6), mat); tw.position.set(x, 7 + 1.2, z); scene.add(tw); const jib = new THREE.Mesh(new THREE.BoxGeometry(12, 0.5, 0.5), mat); jib.position.set(x - 4, 14, z); scene.add(jib); });
  // container ship
  const ship = new THREE.Group(); ship.position.set(0, 0, -6); scene.add(ship);
  const hull = new THREE.Mesh(new THREE.BoxGeometry(26, 2.4, 5), new THREE.MeshLambertMaterial({ color: 0x1e2236 })); hull.position.y = 0.8; hull.castShadow = true; ship.add(hull);
  const redB = new THREE.Mesh(new THREE.BoxGeometry(26.05, 0.6, 5.05), new THREE.MeshLambertMaterial({ color: 0x8a2a2a })); redB.position.y = -0.1; ship.add(redB);
  const cols = [0xc0392b, 0x2b7cd3, 0xe0a020, 0x1f8a5b, 0x8a4ab8]; for (let r = 0; r < 3; r++) for (let c = 0; c < 9; c++) for (let d = 0; d < 2; d++) { const ct = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.1, 2.3), new THREE.MeshLambertMaterial({ color: cols[(r * 3 + c + d) % 5] })); ct.position.set(-10 + c * 2.5, 2.6 + r * 1.15, -1.2 + d * 2.4); ct.castShadow = true; ship.add(ct); }
  const bridge = pxBox(3, 4, 4, T.lime.tex()); bridge.position.set(11, 4, 0); ship.add(bridge);
  const flagUpd = grey ? null : conchFlag(scene, 11, 8.5, -6, 1);
  const people = crowd(scene, [[-2, 9.5, '#1fb8a8'], [-1, 10.2, '#d8d0b8'], [2.5, 9.8, '#b8a888']], 14).map((p) => { p.position.y = 1.2; return p; });
  const sun = new THREE.DirectionalLight(grey ? 0xc8ccd8 : 0xffd8a8, grey ? 1.6 : 3.0); sun.position.set(-20, 14, -30); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, far: 120 }); scene.add(sun);
  scene.add(new THREE.HemisphereLight(grey ? 0xb0b6c4 : 0xffd8e8, 0x4a4a5a, 1.9));
  if (!grey) { const sd = new THREE.Mesh(new THREE.CircleGeometry(8, 32), new THREE.MeshBasicMaterial({ color: 0xfff0d0, fog: false })); sd.position.set(-60, 8, -150); scene.add(sd); const shh = halo(0xffd0a0, 60); shh.material.fog = false; shh.material.depthTest = false; shh.renderOrder = 5; shh.position.set(-60, 8, -149); scene.add(shh); }
  const fill = new THREE.PointLight(0xffe8d8, 3, 9, 1.2); fill.position.set(0, 3.5, 14); scene.add(fill);
  return { scene, update: (t) => { upd(t); idle(people, t); if (flagUpd) flagUpd(t); ship.position.y = Math.sin(t * 0.9) * 0.06; ship.rotation.z = Math.sin(t * 0.7) * 0.004; },
    cam: (tt, camera, { from = [-8, 16, 30], to = [-3, 12, 22], lookFrom = [2, 3, -6], lookTo = [4, 3, -6], dur = 8 } = {}) => { const e = ease(tt / dur); camera.position.set(...lerp3(from, to, e)); camera.lookAt(...lerp3(lookFrom, lookTo, e)); return V3(4, 3, -6); } };
}

// ---------------------------------------------------------------- set: finale, the palace roof at sunset with the conch flag
export function finaleSet() {
  const scene = new THREE.Scene(); scene.background = skyTex(['#2a2a6a', '#6a4a8a', '#c86a7a', '#ff9a6a', '#ffd098'], 6, { cloudCols: ['#ffd0b0', '#e08a8a', '#9a5a7a'], seed: 33 }); scene.fog = new THREE.Fog(0xf0a080, 40, 200);
  ground(scene, T.grass);
  const palace = new THREE.Group(); scene.add(palace);
  const body = pxBox(14, 5, 6, T.lime.tex()); body.position.set(0, 2.5, -4); palace.add(body);
  const rf = roof(14.6, 8, 3, T.tiles.tex(), 1); rf.position.set(0, 5, -4); palace.add(rf);
  const tower = pxBox(3.4, 4, 3.4, T.lime.tex()); tower.position.set(0, 7, -4); palace.add(tower); const trf = roof(4, 4, 2.2, T.tiles.tex(), 1); trf.position.set(0, 9, -4); palace.add(trf);
  for (let i = 0; i < 7; i++) { const c = pxBox(0.3, 3.6, 0.3, T.wood.tex(), { tileM: 1 }); c.position.set(-6 + i * 2, 1.8, -0.6); palace.add(c); }
  const flagUpd = conchFlag(scene, 0.1, 13.6, -4, 1.4);
  const P = []; const bm = barkMat(), fm = frondMat(); [[-9, 3, 9], [9.5, 2, 10], [-12, -6, 8.5], [12, -7, 9]].forEach(([x, z, h], i) => P.push(palm(scene, x, z, h, { lean: (i % 2 ? -1 : 1) * 0.12, seed: i, bm, fm })));
  const sun = new THREE.DirectionalLight(0xffb878, 3.0); sun.position.set(-20, 10, 16); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -20, right: 20, top: 20, bottom: -20, far: 80 }); scene.add(sun);
  scene.add(new THREE.HemisphereLight(0xffc8d8, 0x4a2a2a, 1.3));
  return { scene, update: (t) => { flagUpd(t); swayPalms(P, t); },
    cam: (tt, camera, { dur = 6 } = {}) => { const e = ease(tt / dur); camera.position.set(-6 + 3 * e, 6 + 4 * e, 26 - 4 * e); camera.lookAt(0, 9 + 2 * e, -4); return V3(0, 12, -4); } };
}
void W; void H;
