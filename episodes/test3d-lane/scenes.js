// 5 s test of the px3d kit: a Trivandrum lane on a June 1947 night, villagers gathered at a radio shop in the rain.
import { W, H } from '../../pipeline/engine.js';

let K = null; // lazily built (WebGL only exists in the browser)
async function build() {
  const { THREE, PX, pxBox, roof, sprite, halo, makeStage, rnd } = await import('../../pipeline/px3d.js');
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x16223a, 0.022);
  // sky gradient #050818 -> #101d3e -> #2c4262
  { const c = new OffscreenCanvas(4, 256), g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#050818'); gr.addColorStop(0.6, '#101d3e'); gr.addColorStop(1, '#2c4262'); g.fillStyle = gr; g.fillRect(0, 0, 4, 256); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; scene.background = t; }
  // ---- textures (24 px per metre)
  const road = new PX(48, 48).ramp(['#2a1a1c', '#3a2424', '#4a2c28', '#5a3630'], (x, y) => 0.45 + 0.25 * Math.sin(x * 0.7) * Math.cos(y * 0.5) + (rnd(x * 97 + y)() - 0.5) * 0.5);
  { const r = rnd(4); for (let i = 0; i < 26; i++) road.rect(r() * 48, r() * 48, 2, 1, '#1e1416'); }
  const laterite = new PX(48, 48).ramp(['#5a2a22', '#7a3a2a', '#9a4e34', '#b0623e'], (x, y) => 0.55 + 0.3 * Math.sin(x * 1.3 + y * 0.4) * 0.5 + (rnd(x * 31 + y * 7)() - 0.5) * 0.6);
  for (let y = 0; y < 48; y += 8) for (let x = (y / 8) % 2 ? 0 : 6; x < 48; x += 12) laterite.rect(x, y, 1, 8, '#3a1a16').rect(x, y, 12, 1, '#3a1a16');
  const lime = new PX(48, 48).ramp(['#9a9488', '#bab4a6', '#d6d0c0', '#ece6d6'], (x, y) => 0.65 + (rnd(x * 13 + y * 5)() - 0.5) * 0.4 - (y > 40 ? 0.3 : 0));
  const tiles = new PX(24, 24); for (let y = 0; y < 24; y++) for (let x = 0; x < 24; x++) { const row = Math.floor(y / 3), k = (x + (row % 2) * 3) % 6; tiles.dot(x, y, y % 3 === 0 ? '#5a1a12' : k === 0 ? '#7a2a1e' : k < 3 ? '#b4452c' : '#c95a38'); }
  const shopBack = new PX(96, 48).ramp(['#a8641e', '#d8923a', '#ffc870', '#ffe2a8'], (x, y) => 0.75 - y / 120);
  for (let s2 = 0; s2 < 3; s2++) { shopBack.rect(4, 10 + s2 * 12, 88, 1, '#5a3014'); for (let i = 0; i < 18; i++) shopBack.rect(6 + i * 4.8, 4 + s2 * 12, 3, 6, ['#2a5a8a', '#8a2a1e', '#e0b040', '#3a7a3a', '#f0e8d8'][(i + s2 * 2) % 5]); }
  shopBack.rect(60, 28, 16, 10, '#5a2a10').rect(62, 30, 12, 3, '#fff0b0').rect(63, 34, 3, 3, '#2a1008').rect(70, 34, 3, 3, '#2a1008');
  // ---- set
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshLambertMaterial({ map: road.tex({ repeat: [40, 40] }) })); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  // wet puddles: glossy dark discs that catch the lamps
  [[-1.5, 2.6, 1.3], [2.4, 3.4, 0.9], [0.4, 5.8, 1.1]].forEach(([x, z, r]) => { const p = new THREE.Mesh(new THREE.CircleGeometry(r, 12), new THREE.MeshPhongMaterial({ color: 0x14182a, shininess: 120, specular: 0x8899cc })); p.rotation.x = -Math.PI / 2; p.position.set(x, 0.01, z); p.receiveShadow = true; scene.add(p); });
  const house = (x, z, w, d, rot, lit) => { const g = new THREE.Group(); const body = pxBox(w, 3, d, (lit % 2 ? lime : laterite).tex(), { tileM: 2 }); body.position.y = 1.5; g.add(body);
    const rf = roof(w, d, 1.8, tiles.tex(), 1); rf.position.y = 3; g.add(rf);
    // emissive window panes
    for (let i = 0; i < 2; i++) { const on = (lit >> i) & 1; const pane = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.8), new THREE.MeshBasicMaterial({ color: on ? 0xffae55 : 0x1a1420 })); pane.position.set(-w / 4 + i * w / 2, 1.7, d / 2 + 0.02); g.add(pane); if (on) { const h = halo(0xffa050, 1.6); h.position.copy(pane.position); h.position.z += 0.1; g.add(h); } }
    g.position.set(x, 0, z); g.rotation.y = rot; scene.add(g); return g; };
  house(-6.5, -3, 4.5, 4, 0.5, 1); house(6.8, -2.5, 5, 4, -0.45, 2); house(-8, 5, 4, 4, 1.2, 3); house(8.5, 6, 4.5, 4, -1.3, 1); house(0, -9, 6, 4, 0, 3);
  // the radio shop: back wall glowing with shelves, side walls, counter, tiled awning
  const shop = new THREE.Group(); scene.add(shop);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(4, 2.2), new THREE.MeshLambertMaterial({ map: shopBack.tex(), emissive: 0xffffff, emissiveMap: shopBack.tex(), emissiveIntensity: 1.4 })); back.position.set(0, 1.2, -1.2); shop.add(back);
  [-2, 2].forEach((x) => { const sw = pxBox(0.25, 2.6, 2.6, laterite.tex()); sw.position.set(x, 1.3, 0); shop.add(sw); });
  const top = pxBox(4.3, 0.4, 2.6, laterite.tex()); top.position.set(0, 2.6, 0); shop.add(top);
  const counter = pxBox(3.6, 0.9, 0.5, laterite.tex()); counter.position.set(0, 0.45, 0.9); shop.add(counter);
  const aw = roof(4.6, 3.2, 1.0, tiles.tex(), 1); aw.position.set(0, 2.8, 0.3); shop.add(aw);
  const sign = new PX(48, 10).ramp(['#123a22', '#1e5a32'], () => 0.5); for (let i = 0; i < 9; i++) sign.rect(4 + i * 4.6, 3, 3, 4, '#f0dca0'); const signM = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.5), new THREE.MeshLambertMaterial({ map: sign.tex(), emissive: 0xffffff, emissiveMap: sign.tex(), emissiveIntensity: 0.6 })); signM.position.set(0, 3.25, 1.55); shop.add(signM);
  const shopLight = new THREE.PointLight(0xffae55, 12, 14, 1.6); shopLight.position.set(0, 1.6, 0.6); shopLight.castShadow = true; shopLight.shadow.mapSize.set(1024, 1024); shop.add(shopLight);
  const sh = halo(0xffb060, 3.2); sh.position.set(0, 1.5, -0.6); shop.add(sh);
  // villagers: 34x50 px sprites (1/30 m per px), mundu + shirt, 1 px selout; hero in teal
  const person = (shirt, skin, frame, hair = '#1a1016') => { const p = new PX(34, 50); const b = frame;
    p.rect(12, 30, 10, 18, '#ece6d6').rect(12, 30, 2, 18, '#bdb6a6').rect(20, 30, 2, 18, '#d6d0c0');          // mundu
    p.rect(11, 15 + b, 12, 16, shirt).rect(11, 15 + b, 2, 16, '#000000' + '33');                                 // shirt
    p.rect(13, 5 + b, 8, 10, skin).rect(13, 4 + b, 8, 3, hair).rect(19, 9 + b, 1, 1, '#1a1016');               // head
    p.rect(9, 17 + b, 3, 11, skin).rect(22, 17 + b, 3, 11, skin); p.rect(13, 48, 3, 2, '#3a2420').rect(18, 48, 3, 2, '#3a2420');
    return p.outline('#1a1016'); };
  const people = []; const r = rnd(9);
  [[-1.4, 2.0, '#c8c0a8'], [-0.6, 2.6, '#b8a888'], [0.3, 2.2, '#1fb8a8'], [1.1, 2.7, '#d8d0c0'], [1.8, 2.1, '#a89878'], [-2.2, 2.9, '#c0b8a0']].forEach(([x, z, shirt], k) => {
    const frames = [person(shirt, ['#8a5a3a', '#6a4028', '#9a6a48'][k % 3], 0), person(shirt, ['#8a5a3a', '#6a4028', '#9a6a48'][k % 3], 1)];
    const sp = sprite(frames[0], 1.67); sp.position.set(x, 0, z); sp.userData.frames = frames.map((f) => f.tex()); sp.userData.ph = r() * 2; scene.add(sp); people.push(sp); });
  // palms as big billboards
  const palmPX = () => { const p = new PX(96, 180); for (let j = 0; j < 120; j++) p.rect(46 + Math.sin(j / 120 * 1.4) * 8, 179 - j, 5, 1, j % 6 ? '#3a2a22' : '#4e3a2c');
    const cx = 46 + Math.sin(1.4) * 8 + 2, cy = 60; for (let f = 0; f < 11; f++) { const a = -Math.PI * 1.05 + (f / 10) * Math.PI * 1.1; for (let k = 0; k < 44; k++) { const u = k / 44, x = cx + Math.cos(a) * k, y = cy + Math.sin(a) * k * 0.5 + u * u * 22; p.rect(x, y, 2, 2, k % 4 ? '#2a4a2a' : '#3e6a36'); if (k % 2) { p.rect(x - 1, y + 2, 1, 4 + (1 - u) * 4, '#1e3a20'); p.rect(x + 2, y + 2, 1, 3 + (1 - u) * 4, '#24422a'); } } }
    return p.outline('#121a14'); };
  [[-4, -6.5], [4.6, -7], [-10.5, 1], [10, 1.5], [-3.5, 8.5]].forEach(([x, z]) => { const s2 = sprite(palmPX(), 9); s2.position.set(x, 0, z); scene.add(s2); });
  // street lamp
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 4.2, 6), new THREE.MeshLambertMaterial({ color: 0x2a2030 })); pole.position.set(3.6, 2.1, 3.2); pole.castShadow = true; scene.add(pole);
  const lamp = new THREE.PointLight(0xffb070, 13, 16, 1.6); lamp.position.set(3.6, 4.1, 3.6); lamp.castShadow = true; lamp.shadow.mapSize.set(1024, 1024); scene.add(lamp);
  const lh = halo(0xffc080, 1.8); lh.position.set(3.6, 4.15, 3.25); scene.add(lh);
  // moon key, hemisphere fill, cool front fill on the crowd
  const moon = new THREE.DirectionalLight(0x8fa8e0, 2.6); moon.position.set(-14, 22, 10); moon.castShadow = true; moon.shadow.mapSize.set(2048, 2048); Object.assign(moon.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, far: 80 }); scene.add(moon);
  scene.add(new THREE.HemisphereLight(0x5a6c9a, 0x1a1420, 2.4));
  const fill = new THREE.PointLight(0x9fb2e8, 6, 9, 1.2); fill.position.set(0, 2.2, 5.2); scene.add(fill);
  const moonHalo = halo(0xdde6ff, 6); moonHalo.position.set(-30, 40, -60); scene.add(moonHalo);
  // rain: wind-slanted segments
  const N = 1500, rp = new Float32Array(N * 6), rr = rnd(3); for (let i = 0; i < N; i++) { const x = (rr() - 0.5) * 30, y = rr() * 14, z = (rr() - 0.5) * 30; rp.set([x, y, z, x + 0.06, y - 0.45, z + 0.02], i * 6); }
  const rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.BufferAttribute(rp, 3)); const rain = new THREE.LineSegments(rg, new THREE.LineBasicMaterial({ color: 0xaab8e8, transparent: true, opacity: 0.45 })); scene.add(rain);
  const camera = new THREE.PerspectiveCamera(42, W / H, 0.3, 400);
  const stage = makeStage(W, H, { ss: 1 });
  K = { THREE, scene, camera, stage, people, rain, shopLight, lamp, sh, lh };
}

export async function preload() { await build(); }
export const hits = [];
export const scenes = {
  s1: (g, s) => {
    const { scene, camera, stage, people, rain, shopLight, lamp, sh, lh } = K; const t = s.t;
    const { track, flick } = K.px || {};
    const tr = (keys) => keys; void tr;
    // camera: rising high 3/4 view, slow push and descend toward the shop (monotone path)
    const u = Math.min(1, t / 5), e = u * u * (3 - 2 * u);
    camera.position.set(-3.5 + 3.5 * e, 13 - 5.5 * e, 20 - 9 * e); camera.lookAt(0, 1.3, 1.2);
    // stepped idles (~1.4 Hz), smooth light flicker
    people.forEach((p) => { const f = Math.floor(t * 1.4 + p.userData.ph) % 2; p.material.map = p.userData.frames[f]; });
    const fl = 1 + 0.08 * Math.sin(t * 7.3) + 0.07 * Math.sin(t * 13.1) + 0.05 * Math.sin(t * 23.7);
    shopLight.intensity = 12 * fl; lamp.intensity = 13 * (1 + 0.06 * Math.sin(t * 9.1 + 2)); sh.material.opacity = 0.8 * fl; lh.material.opacity = 0.9;
    rain.position.y = -((t * 14) % 7);
    const focus = camera.position.distanceTo(new (K.THREE.Vector3)(0, 1.2, 2.3));
    const fp = new (K.THREE.Vector3)(0, 1.2, 2.3).project(camera); const band = Math.min(0.8, Math.max(0.2, (fp.y + 1) / 2));
    const cv = stage.render(scene, camera, { focus, aperture: 160, tilt: 14, band, half: 0.09, feather: 0.32 });
    g.drawImage(cv, 0, 0, W, H);
  },
};
