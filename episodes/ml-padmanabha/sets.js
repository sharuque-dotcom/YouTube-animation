// Padmanabhaswamy Vault B sets (all our own): the temple at dusk (seven-tier gopuram over the tank), the vault corridor
// with doors A, C, D, E, F and Vault B at the end (grille, wooden door, and the iron door with two serpents), the
// treasure chamber (coin heaps, the 18-ft chain, gem-set gold coconut shells, the 800 kg coin box, and the sanctum glow:
// the deity itself is never drawn), the Supreme Court bench, and a tharavad room with its old pathayam (paddy chest).
import * as K from '../../pipeline/toon3d.js';
const THREE = K.THREE;
const glow = (c, o = {}) => new THREE.MeshBasicMaterial({ color: c, toneMapped: false, ...o });
const noInk = (m) => { m.userData.noInk = true; return m; };
const plane = (w, h, map, o = {}) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshLambertMaterial({ map, transparent: !!o.transparent, side: o.side || THREE.FrontSide }));
const GOLD = 0xf0c23a, GOLD2 = 0xd9a521;

let STONE = null;
function stoneTex() { if (STONE) return STONE; STONE = K.paint(256, 256, (g, w, h) => { g.fillStyle = '#6e6458'; g.fillRect(0, 0, w, h); K.mottle(g, w, h, ['#5a5248', '#82786a', '#4a4238', '#8e8272'], 500, [4, 26], 41, 0.3);
  g.strokeStyle = '#3a342c'; g.lineWidth = 4; for (let y = 0; y <= h; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); for (let x = (y / 64) % 2 ? 0 : 64; x < w; x += 128) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 64); g.stroke(); } } }); return STONE; }
const stoneMat = (rx = 2, ry = 1) => { const t = stoneTex().clone(); t.repeat.set(rx, ry); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.needsUpdate = true; return new THREE.MeshLambertMaterial({ map: t, side: THREE.DoubleSide }); };
const lampFlame = (scene, life, x, y, z, k = 1, intensity = 3) => { // brass oil lamp (nilavilakku) with a flickering flame + light
  const g = new THREE.Group(); const base = K.mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.06, 16), K.col(GOLD2)); g.add(base); const st = K.mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.9, 10), K.col(GOLD2)); st.position.y = 0.47; g.add(st);
  const cup = K.mesh(new THREE.CylinderGeometry(0.16, 0.08, 0.06, 16), K.col(GOLD)); cup.position.y = 0.94; g.add(cup);
  const fl = noInk(K.mesh(new THREE.SphereGeometry(0.035, 8, 8), glow(0xffc860), { shadow: false })); fl.scale.y = 2.2; fl.position.y = 1.02; g.add(fl);
  const li = new THREE.PointLight(0xffb050, intensity, 7, 1.6); li.position.y = 1.15; g.add(li); g.position.set(x, y, z); g.scale.setScalar(k); scene.add(g);
  const ph = x * 3.1 + z; life.push((t) => { const f = 0.85 + Math.sin(t * 13 + ph) * 0.08 + Math.sin(t * 29 + ph) * 0.05; li.intensity = intensity * f; fl.scale.set(1, 2.2 * f, 1); }); return g; };

// ------------------------------------------------------------------ serpents (relief on the iron door)
function serpent(mirror = 1, eyeMats = []) { // coiled cobra with a raised hood, in low relief, facing the centre
  const g = new THREE.Group(); const m = K.col(0x8a7a5a), dark = K.col(0x4a4030);
  const pts = []; for (let i = 0; i <= 60; i++) { const u = i / 60, a = u * Math.PI * 3.2, r = 0.36 * (1 - u * 0.55); pts.push(new THREE.Vector3(Math.cos(a) * r * mirror, -0.6 + u * 0.95 + Math.sin(a) * r * 0.5, 0.05)); }
  pts.push(new THREE.Vector3(0.05 * mirror, 0.55, 0.06), new THREE.Vector3(0.0, 0.8, 0.07));
  const body = K.mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 120, 0.07, 10, false), m); g.add(body);
  const hood = K.mesh(new THREE.SphereGeometry(0.24, 18, 12), m); hood.scale.set(1, 1.25, 0.32); hood.position.set(0, 0.92, 0.08); g.add(hood);
  for (let i = 0; i < 3; i++) { const sc = K.mesh(new THREE.SphereGeometry(0.05, 8, 6), dark); sc.scale.z = 0.4; sc.position.set(0, 0.84 + i * 0.09, 0.17); g.add(sc); }
  const head = K.mesh(new THREE.SphereGeometry(0.1, 12, 10), m); head.scale.set(1, 0.8, 0.8); head.position.set(0, 1.06, 0.16); g.add(head);
  for (const s of [-1, 1]) { const em = glow(0x3a1a10); eyeMats.push(em); const e = noInk(K.mesh(new THREE.SphereGeometry(0.022, 8, 6), em, { shadow: false })); e.position.set(s * 0.045, 1.09, 0.24); g.add(e); }
  return g;
}

// ------------------------------------------------------------------ a vault door unit (frame + leaf on a hinge + letter plate)
function vaultDoor(letter, { leafColor = 0x5a4a3a, w = 1.4, h = 2.3 } = {}) {
  const g = new THREE.Group(), sm = stoneMat(1, 1);
  const jambL = new THREE.Mesh(new THREE.BoxGeometry(0.3, h + 0.3, 0.5), sm), jambR = jambL.clone(), lint = new THREE.Mesh(new THREE.BoxGeometry(w + 0.6, 0.35, 0.55), sm);
  [jambL, jambR, lint].forEach((m) => { m.castShadow = m.receiveShadow = true; g.add(m); }); jambL.position.set(-w / 2 - 0.15, (h + 0.3) / 2, 0); jambR.position.set(w / 2 + 0.15, (h + 0.3) / 2, 0); lint.position.set(0, h + 0.35, 0);
  const dark = K.mesh(new THREE.PlaneGeometry(w, h), K.col(0x120c08)); dark.position.set(0, h / 2, -0.2); g.add(dark);
  const pivot = new THREE.Group(); pivot.position.set(-w / 2, 0, 0.05); g.add(pivot); const leaf = K.box(w, h, 0.1, null, { color: leafColor }); leaf.position.set(w / 2, h / 2, 0); pivot.add(leaf);
  for (const y of [0.4, h / 2, h - 0.4]) { const band = K.box(w, 0.08, 0.12, null, { color: 0x2a2420 }); band.position.set(w / 2, y, 0.02); pivot.add(band); }
  const plate = plane(0.5, 0.5, K.signTex([letter], { w: 128, h: 128, bg: '#2a2018', fg: '#f0c23a', border: '#d9a521', font: 'Oswald' })); plate.position.set(0, h + 0.36, 0.29); g.add(plate);
  const glowL = new THREE.PointLight(0xffc860, 0, 5, 1.4); glowL.position.set(0, h / 2, -0.6); g.add(glowL);
  return { group: g, setOpen(u) { pivot.rotation.y = -u * 1.7; glowL.intensity = u * 6; }, pivot };
}

// ------------------------------------------------------------------ the temple at dusk
export function templeSet() {
  const T = K.stdTextures(), scene = new THREE.Scene(), life = [];
  scene.background = K.skyTexture({ top: '#3a3a7a', mid: '#c87a6a', bottom: '#f6c27a', clouds: 6, seed: 51 }); scene.fog = new THREE.Fog(0xe8a878, 40, 160);
  const lt = T.laterite.clone(); lt.repeat.set(40, 40); lt.needsUpdate = true; const gnd = K.mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshLambertMaterial({ map: lt })); gnd.rotation.x = -Math.PI / 2; scene.add(gnd);
  // the tank (Padmateertham) in front, with stepped sides
  const tank = new THREE.Group(); tank.position.set(0, 0, 14); scene.add(tank); const sm = stoneMat(4, 1);
  for (let i = 0; i < 4; i++) { const s = 18 - i * 1.4; for (const [x, z, w, d] of [[0, -s / 2, s, 0.7], [0, s / 2, s, 0.7], [-s / 2, 0, 0.7, s], [s / 2, 0, 0.7, s]]) { const st = new THREE.Mesh(new THREE.BoxGeometry(w, 0.3, d), sm); st.position.set(x, -i * 0.3 - 0.15, z); st.receiveShadow = true; tank.add(st); } }
  const water = noInk(new THREE.Mesh(new THREE.PlaneGeometry(13, 13), new THREE.MeshPhongMaterial({ color: 0x3a5a7a, shininess: 90, specular: 0xffc890, transparent: true, opacity: 0.92 }))); water.rotation.x = -Math.PI / 2; water.position.y = -1.0; tank.add(water);
  // the gopuram: a wide base storey with the gate + seven tapering tiers + seven golden kalasams on top
  const gop = new THREE.Group(); gop.position.set(0, 0, -6); scene.add(gop); const lime = T.lime.clone(); lime.repeat.set(3, 1); lime.needsUpdate = true; const lm = new THREE.MeshLambertMaterial({ map: lime });
  const base = K.mesh(new THREE.BoxGeometry(16, 5, 6), sm); base.position.y = 2.5; gop.add(base);
  const gate = K.mesh(new THREE.BoxGeometry(3.2, 4.2, 6.2), K.col(0x1a120c)); gate.position.y = 2.1; gop.add(gate);
  const door = K.box(3.0, 4.0, 0.1, T.wood, { tileM: 1 }); door.position.set(0, 2.0, 3.05); door.visible = false; gop.add(door);
  let y = 5; for (let i = 0; i < 7; i++) { const w = 15 - i * 1.6, d = 5.4 - i * 0.45, hh = 2.2 - i * 0.12; const tier = K.mesh(new THREE.BoxGeometry(w, hh, d), lm); tier.position.y = y + hh / 2; gop.add(tier);
    const ledge = K.mesh(new THREE.BoxGeometry(w + 0.5, 0.25, d + 0.4), K.col(0xd8c8a0)); ledge.position.y = y + 0.1; gop.add(ledge);
    for (let k = 0; k < Math.max(2, 7 - i); k++) { const nx = -w / 2 + (k + 0.5) * (w / Math.max(2, 7 - i)); const niche = K.mesh(new THREE.BoxGeometry(0.6, hh * 0.6, 0.1), K.col(0x7a5a3a)); niche.position.set(nx, y + hh * 0.5, d / 2 + 0.03); gop.add(niche);
      const lampWin = noInk(K.mesh(new THREE.PlaneGeometry(0.3, hh * 0.35), glow(0xffd080), { shadow: false })); lampWin.position.set(nx, y + hh * 0.45, d / 2 + 0.09); gop.add(lampWin); }
    y += hh; }
  const crestB = K.mesh(new THREE.BoxGeometry(7.6, 0.6, 2.2), K.col(0xb88a4a)); crestB.position.y = y + 0.3; gop.add(crestB);
  const vault = K.mesh(new THREE.CylinderGeometry(1.1, 1.1, 7.6, 20, 1, false, 0, Math.PI), K.col(0xc89a5a)); vault.rotation.z = Math.PI / 2; vault.rotation.x = -Math.PI / 2; vault.position.y = y + 0.6; gop.add(vault);
  y += 0.6;
  for (let k = 0; k < 7; k++) { const x = -3 + k; const ka = new THREE.Group(); const b = K.mesh(new THREE.SphereGeometry(0.22, 12, 10), K.col(GOLD)); ka.add(b); const tip = K.mesh(new THREE.ConeGeometry(0.1, 0.5, 10), K.col(GOLD)); tip.position.y = 0.4; ka.add(tip); ka.position.set(x, y + 1.25, 0); gop.add(ka); }
  // flanking walls with lamp rows (vilakkumadam), lit at dusk
  for (const s of [-1, 1]) { const wall = K.mesh(new THREE.BoxGeometry(22, 2.4, 1), sm); wall.position.set(s * 19, 1.2, -6); scene.add(wall);
    for (let i = 0; i < 18; i++) { const fl = noInk(K.mesh(new THREE.SphereGeometry(0.07, 6, 6), glow(0xffc860), { shadow: false })); fl.position.set(s * (9 + i * 1.15), 2.55, -5.4); scene.add(fl); } }
  for (const x of [-5.5, -3.2, 3.2, 5.5]) lampFlame(scene, life, x, 0, -2.4, 1.6, 4);
  // palms beyond
  for (let i = 0; i < 10; i++) { const p = K.palm(9 + (i % 3) * 2, 0.12 * (i % 2 ? 1 : -1), 60 + i); p.position.set((i < 5 ? -1 : 1) * (14 + (i % 5) * 4), 0, -14 - (i % 3) * 4); scene.add(p); }
  const sun = new THREE.DirectionalLight(0xffb070, 1.3); sun.position.set(-20, 10, 18); sun.target.position.set(0, 4, -6); scene.add(sun, sun.target); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -25, right: 25, top: 25, bottom: -25 });
  scene.add(new THREE.HemisphereLight(0xffd8b0, 0x6a4a5a, 0.95));
  life.push((t) => { water.material.opacity = 0.9 + Math.sin(t * 0.8) * 0.02; });
  return { scene, life, gopuram: gop };
}

// ------------------------------------------------------------------ the vault corridor + Vault B
export function vaultSet() {
  const scene = new THREE.Scene(), life = []; scene.background = new THREE.Color(0x0e0a08); scene.fog = new THREE.Fog(0x0e0a08, 8, 34);
  const L = 26; const floor = K.mesh(new THREE.PlaneGeometry(6, L), stoneMat(3, 13)); floor.rotation.x = -Math.PI / 2; floor.position.z = -L / 2 + 4; scene.add(floor);
  const ceil = K.mesh(new THREE.PlaneGeometry(6, L), stoneMat(3, 13)); ceil.rotation.x = Math.PI / 2; ceil.position.set(0, 4.2, -L / 2 + 4); scene.add(ceil);
  for (const s of [-1, 1]) { const w = K.mesh(new THREE.PlaneGeometry(L, 4.2), stoneMat(13, 2)); w.rotation.y = -s * Math.PI / 2; w.position.set(s * 3, 2.1, -L / 2 + 4); scene.add(w); }
  // side doors: A, C, D on the left, E, F on the right; each opens toward a gold glow
  const doors = {}; const spec = [['A', -1, -2], ['C', -1, -8], ['D', -1, -14], ['E', 1, -5], ['F', 1, -11]];
  for (const [l, s, z] of spec) { const d = vaultDoor(l); d.group.rotation.y = s * -Math.PI / 2; d.group.position.set(s * 2.95, 0, z); scene.add(d.group); doors[l] = d;
    const heap = new THREE.Group(); for (let i = 0; i < 40; i++) { const c = K.mesh(new THREE.SphereGeometry(0.18 + (i % 4) * 0.05, 8, 6), K.col(i % 5 ? GOLD : GOLD2)); c.position.set((i % 7 - 3) * 0.18, (i % 3) * 0.14, -0.4 - Math.floor(i / 7) * 0.15); heap.add(c); }
    heap.position.set(0, 0, -0.4); d.group.add(heap); }
  // Vault B at the end of the corridor
  const B = new THREE.Group(); B.position.set(0, 0, -20); scene.add(B); const sm = stoneMat(2, 2);
  for (const [x, y, w, h] of [[-2.0, 2.1, 2.0, 4.2], [2.0, 2.1, 2.0, 4.2], [0, 3.47, 2.0, 1.45]]) { const wp = K.mesh(new THREE.PlaneGeometry(w, h), sm); wp.position.set(x, y, -0.4); B.add(wp); }
  const recess = K.mesh(new THREE.BoxGeometry(2.0, 2.75, 2.4), new THREE.MeshLambertMaterial({ color: 0x1a120a, side: THREE.BackSide })); recess.position.set(0, 1.38, -1.6); B.add(recess);
  const goldWall = noInk(K.mesh(new THREE.PlaneGeometry(2.0, 2.75), new THREE.MeshBasicMaterial({ color: 0xffd070, transparent: true, opacity: 0, toneMapped: false }), { shadow: false })); goldWall.position.set(0, 1.38, -2.75); B.add(goldWall);
  const fr = [[-1.2, 1.4, 0.4, 2.9], [1.2, 1.4, 0.4, 2.9], [0, 2.95, 2.8, 0.4]]; fr.forEach(([x, y, w, h]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.6), sm); m.position.set(x, y, -0.2); m.castShadow = m.receiveShadow = true; B.add(m); });
  const plateB = plane(0.7, 0.7, K.signTex(['B'], { w: 128, h: 128, bg: '#2a2018', fg: '#f0c23a', border: '#d9a521', font: 'Oswald' })); plateB.position.set(0, 2.96, 0.11); B.add(plateB);
  // 3rd door: iron, studded, with two serpents facing each other
  const ironP = new THREE.Group(); ironP.position.set(-1.0, 0, -0.35); B.add(ironP); const iron = new THREE.Group(); iron.position.set(1.0, 0, 0); ironP.add(iron);
  const behind = new THREE.PointLight(0xffc860, 0, 9, 1.3); behind.position.set(0, 1.4, -1.6); B.add(behind);  const ironLeaf = K.box(2.0, 2.75, 0.12, null, { color: 0x3a3632 }); ironLeaf.position.set(0, 1.38, 0); iron.add(ironLeaf);
  for (let i = 0; i < 5; i++) for (let j = 0; j < 7; j++) { if (i > 0 && i < 4 && j > 0 && j < 6) continue; const st = K.mesh(new THREE.SphereGeometry(0.045, 8, 6), K.col(0x8a7a5a)); st.position.set(-0.8 + i * 0.4, 0.2 + j * 0.4, 0.08); iron.add(st); }
  const eyeMats = []; const sL = serpent(1, eyeMats), sR = serpent(-1, eyeMats); sL.position.set(-0.45, 1.2, 0.06); sR.position.set(0.45, 1.2, 0.06); sL.rotation.z = -0.08; sR.rotation.z = 0.08; iron.add(sL, sR);
  const lock = K.box(0.26, 0.34, 0.1, null, { color: 0x6a5a3a }); lock.position.set(0, 1.1, 0.12); iron.add(lock);
  // 2nd door: wooden, on a hinge; 1st: iron grille on a hinge
  const woodP = new THREE.Group(); woodP.position.set(-1.0, 0, 0.0); B.add(woodP); const wood = K.box(2.0, 2.75, 0.1, K.stdTextures().wood, { tileM: 1 }); wood.position.set(1.0, 1.38, 0); woodP.add(wood);
  const grilleP = new THREE.Group(); grilleP.position.set(-1.0, 0, 0.12); B.add(grilleP); const gm = K.col(0x2a2420);
  for (let i = 0; i <= 8; i++) { const bar = K.mesh(new THREE.CylinderGeometry(0.025, 0.025, 2.75, 6), gm); bar.position.set(i * 0.25, 1.38, 0); grilleP.add(bar); }
  for (const y of [0.3, 1.38, 2.5]) { const rail = K.box(2.0, 0.06, 0.06, null, { color: 0x2a2420 }); rail.position.set(1.0, y, 0); grilleP.add(rail); }
  const pad = K.box(0.16, 0.2, 0.08, null, { color: 0xb8862a }); pad.position.set(1.95, 1.38, 0.06); grilleP.add(pad);
  // light: torches on the walls + a cool rim from behind the camera
  for (const [x, z] of [[-2.7, -1], [2.7, -4], [-2.7, -10], [2.7, -13], [-2.4, -18.5], [2.4, -18.5]]) lampFlame(scene, life, x, 0, z, 1.2, 3.2);
  const key = new THREE.SpotLight(0xffd8a0, 30, 40, 0.5, 0.6, 1.2); key.position.set(0, 3.8, 3); key.target.position.set(0, 1.2, -20); key.castShadow = true; scene.add(key, key.target);
  scene.add(new THREE.HemisphereLight(0x8a7a9a, 0x2a1a10, 0.35));
  const api = { scene, life, doors, B, iron, sL, sR,
    setGrille(u) { grilleP.rotation.y = -u * 1.9; }, setWood(u) { woodP.rotation.y = -u * 1.75; },
    setIronStrain(u, t = 0) { iron.position.x = 1.0 + Math.sin(t * 40) * 0.006 * u; },
    setIronOpen(u, light = 0) { ironP.rotation.y = -u * 1.6; behind.intensity = light * 40; goldWall.material.opacity = light * 0.9; },
    setEyes(u) { eyeMats.forEach((m) => m.color.setRGB(0.23 + u * 0.77, 0.1 + u * 0.75, 0.06 + u * 0.1)); },
    setDoors(u, which = 'ACDEF') { for (const l of 'ACDEF') doors[l].setOpen(which.includes(l) ? u : 0); },
  };
  api.setGrille(0); api.setWood(0); api.setEyes(0); api.setDoors(0); api.setIronOpen(0); return api;
}

// ------------------------------------------------------------------ the treasure chamber (inside the opened vaults)
function chain(len = 6, links = 46) { const g = new THREE.Group(); const m = K.col(GOLD); for (let i = 0; i < links; i++) { const u = i / (links - 1); const l = K.mesh(new THREE.TorusGeometry(0.07, 0.022, 6, 12), m); l.position.set(-len / 2 + u * len, 0.05 + Math.sin(u * Math.PI * 3) * 0.04, Math.sin(u * Math.PI * 2) * 0.5); l.rotation.set(i % 2 ? Math.PI / 2 : 0, u * 2, 0); g.add(l); } return g; }
function coconutShell(seed = 1) { const g = new THREE.Group(); const s = K.mesh(new THREE.SphereGeometry(0.22, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshLambertMaterial({ color: GOLD, side: THREE.DoubleSide })); s.rotation.x = Math.PI; s.position.y = 0.22; g.add(s);
  const r = K.rnd(seed); for (let i = 0; i < 7; i++) { const a = r() * Math.PI * 2, b = 0.3 + r() * 1.0; const gem = noInk(K.mesh(new THREE.SphereGeometry(0.03, 8, 6), glow(i % 2 ? 0xd0283a : 0x2ab870), { shadow: false })); gem.position.set(Math.cos(a) * Math.sin(b) * 0.22, 0.22 - Math.cos(b) * 0.22, Math.sin(a) * Math.sin(b) * 0.22); g.add(gem); } return g; }
export function treasureSet() {
  const scene = new THREE.Scene(), life = []; scene.background = new THREE.Color(0x120c08); scene.fog = new THREE.Fog(0x120c08, 6, 22);
  const floor = K.mesh(new THREE.PlaneGeometry(14, 12), stoneMat(7, 6)); floor.rotation.x = -Math.PI / 2; scene.add(floor);
  const back = K.mesh(new THREE.PlaneGeometry(14, 5), stoneMat(7, 2.5)); back.position.set(0, 2.5, -5); scene.add(back);
  for (const s of [-1, 1]) { const w = K.mesh(new THREE.PlaneGeometry(12, 5), stoneMat(6, 2.5)); w.rotation.y = -s * Math.PI / 2; w.position.set(s * 7, 2.5, 1); scene.add(w); }
  // coin heaps
  const coinG = new THREE.CylinderGeometry(0.06, 0.06, 0.02, 10), cm = K.col(GOLD), cm2 = K.col(GOLD2); const heaps = [];
  for (const [hx, hz, R, n] of [[-3.2, -2.6, 1.3, 520], [3.0, -3.0, 1.1, 420], [-0.6, -3.8, 0.9, 300]]) { const heap = new THREE.Group(); const r = K.rnd(n); for (let i = 0; i < n; i++) { const u = Math.sqrt(r()), a = r() * 6.3, rr = u * R; const c = K.mesh(coinG, i % 4 ? cm : cm2, { shadow: false }); c.position.set(Math.cos(a) * rr, (1 - u) * R * 0.75 + r() * 0.05, Math.sin(a) * rr); c.rotation.set(r() * 0.8, 0, r() * 0.8); heap.add(c); } heap.position.set(hx, 0, hz); scene.add(heap); heaps.push(heap); }
  // the 800 kg coin box
  const box = new THREE.Group(); const bb = K.box(1.6, 0.8, 1.0, K.stdTextures().wood, { tileM: 1 }); bb.position.y = 0.4; box.add(bb); for (let i = 0; i < 90; i++) { const c = K.mesh(coinG, cm, { shadow: false }); c.position.set(-0.7 + (i % 15) * 0.1, 0.82 + Math.floor(i / 15) % 2 * 0.02, -0.4 + Math.floor(i / 15) * 0.14); c.rotation.x = 0.3; box.add(c); }
  const tagBox = plane(0.9, 0.3, K.signTex(['800 KG'], { w: 300, h: 100, bg: '#2a2018', fg: '#f0c23a', border: '#d9a521', font: 'Oswald' })); tagBox.position.set(0, 0.42, 0.51); box.add(tagBox); box.position.set(1.8, 0, 0.4); box.rotation.y = -0.4; scene.add(box);
  // the 18-ft chain, laid out in a wave along the floor
  const ch = chain(5.4, 60); ch.position.set(-0.8, 0, 1.6); scene.add(ch);
  // gem-set gold coconut shells
  const shells = []; for (let i = 0; i < 5; i++) { const s = coconutShell(i + 3); s.position.set(-3.2 + i * 0.5, 0, 0.6 + (i % 2) * 0.35); scene.add(s); shells.push(s); }
  // sanctum glow: a lotus pedestal and a column of light. The deity is never drawn.
  const ped = new THREE.Group(); ped.position.set(0, 0, -3.2); scene.add(ped); const lot = K.mesh(new THREE.CylinderGeometry(0.9, 1.1, 0.5, 16), K.col(GOLD2)); lot.position.y = 0.25; ped.add(lot);
  for (let i = 0; i < 12; i++) { const p = K.mesh(new THREE.SphereGeometry(0.3, 10, 8), K.col(GOLD)); p.scale.set(0.6, 0.35, 1); const a = i / 12 * Math.PI * 2; p.position.set(Math.cos(a) * 0.85, 0.55, Math.sin(a) * 0.85); p.rotation.y = -a; ped.add(p); }
  const beamM = new THREE.MeshBasicMaterial({ color: 0xffd880, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
  const beam = noInk(new THREE.Mesh(new THREE.CylinderGeometry(0.7, 1.0, 5, 24, 1, true), beamM)); beam.position.y = 3.0; ped.add(beam);
  const haloT = K.paint(256, 256, (g, w, h) => { const rg = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); rg.addColorStop(0, 'rgba(255,248,220,1)'); rg.addColorStop(0.35, 'rgba(255,220,140,.6)'); rg.addColorStop(1, 'rgba(255,200,100,0)'); g.fillStyle = rg; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(255,230,160,.5)'; g.lineWidth = 3; for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; g.beginPath(); g.moveTo(w / 2 + Math.cos(a) * 40, h / 2 + Math.sin(a) * 40); g.lineTo(w / 2 + Math.cos(a) * 125, h / 2 + Math.sin(a) * 125); g.stroke(); } });
  const halo = noInk(new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2), new THREE.MeshBasicMaterial({ map: haloT, color: 0xffffff, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }))); halo.position.set(0, 2.2, -0.2); ped.add(halo);
  const pl = new THREE.PointLight(0xffd070, 16, 12, 1.4); pl.position.set(0, 2.2, -2.6); scene.add(pl);
  const torch = new THREE.SpotLight(0xfff0d0, 0, 18, 0.32, 0.5, 1.1); torch.castShadow = true; scene.add(torch, torch.target);
  scene.add(new THREE.HemisphereLight(0x8a7a6a, 0x2a1a10, 0.5)); lampFlame(scene, life, -5.5, 0, -3.6, 1.3, 3); lampFlame(scene, life, 5.5, 0, -3.6, 1.3, 3);
  life.push((t) => { beamM.opacity = 0.3 + Math.sin(t * 1.3) * 0.05; halo.rotation.z = t * 0.2; shells.forEach((s, i) => { s.rotation.y = t * 0.4 + i; }); });
  return { scene, life, heaps, box, chain: ch, shells, ped, beam: beamM, halo,
    setTorch(on, from = [0, 1.7, 4], to = [0, 0.5, -2]) { torch.intensity = on ? 40 : 0; torch.position.set(...from); torch.target.position.set(...to); },
    setGlow(u) { pl.intensity = 16 * u; beamM.opacity = 0.35 * u; halo.material.opacity = 0.55 * u; } };
}

// ------------------------------------------------------------------ the Supreme Court bench
export function courtSet() {
  const T = K.stdTextures(), scene = new THREE.Scene(), life = []; scene.background = new THREE.Color(0xe8dcc0);
  const floor = K.mesh(new THREE.PlaneGeometry(16, 14), K.col(0x7a3a28)); floor.rotation.x = -Math.PI / 2; scene.add(floor);
  const carpet = K.mesh(new THREE.PlaneGeometry(3, 10), K.col(0x8a1e24)); carpet.rotation.x = -Math.PI / 2; carpet.position.set(0, 0.005, 1); scene.add(carpet);
  const wallT = T.lime.clone(); wallT.repeat.set(3, 1.2); wallT.needsUpdate = true; const wm = new THREE.MeshLambertMaterial({ map: wallT, side: THREE.DoubleSide });
  const back = K.mesh(new THREE.PlaneGeometry(16, 7), wm); back.position.set(0, 3.5, -5); scene.add(back);
  for (const s of [-1, 1]) { const w = K.mesh(new THREE.PlaneGeometry(14, 7), wm); w.rotation.y = -s * Math.PI / 2; w.position.set(s * 7, 3.5, 2); scene.add(w); }
  const panel = K.box(16, 2.2, 0.08, T.wood, { tileM: 1 }); panel.position.set(0, 1.1, -4.95); scene.add(panel);
  // raised bench for three judges
  const dais = K.box(9, 0.5, 2.4, T.wood, { tileM: 1 }); dais.position.set(0, 0.25, -3.6); scene.add(dais);
  const bench = K.box(8, 0.9, 0.5, T.wood, { tileM: 1 }); bench.position.set(0, 0.95, -2.55); scene.add(bench);
  const benchTop = K.box(8.3, 0.08, 0.9, null, { color: 0x4a2a18 }); benchTop.position.set(0, 1.42, -2.7); scene.add(benchTop);
  for (const x of [-2.4, 0, 2.4]) { const cb = K.box(1.0, 2.2, 0.15, null, { color: 0x7a1e24 }); cb.position.set(x, 1.6, -4.3); scene.add(cb); }
  const emblem = plane(3.6, 0.9, K.signTex(['സുപ്രീം കോടതി'], { w: 720, h: 180, bg: '#3a2414', fg: '#f0c23a', border: '#d9a521' })); emblem.position.set(0, 4.6, -4.93); scene.add(emblem);
  const scale = new THREE.Group(); const sp = K.mesh(new THREE.CylinderGeometry(0.03, 0.03, 1, 8), K.col(GOLD2)); sp.position.y = 0.5; scale.add(sp); const arm = K.box(1.0, 0.04, 0.04, null, { color: GOLD2 }); arm.position.y = 1.0; scale.add(arm);
  for (const s of [-1, 1]) { const pan = K.mesh(new THREE.CylinderGeometry(0.18, 0.12, 0.05, 12), K.col(GOLD)); pan.position.set(s * 0.48, 0.7, 0); scale.add(pan); } scale.position.set(0, 3.0, -4.85); scale.scale.setScalar(1.3); scene.add(scale);
  // lectern for the petitioner + a file stack
  const lec = new THREE.Group(); const lb = K.box(0.9, 1.1, 0.6, T.wood, { tileM: 1 }); lb.position.y = 0.55; lec.add(lb); const lt = K.box(1.0, 0.06, 0.7, null, { color: 0x4a2a18 }); lt.position.y = 1.13; lt.rotation.x = -0.2; lec.add(lt); lec.position.set(1.0, 0, 0.6); scene.add(lec);
  const files = new THREE.Group(); for (let i = 0; i < 12; i++) { const f = K.box(0.5, 0.06, 0.36, null, { color: [0xd8b878, 0xc8a060, 0xe8d0a0, 0xf2ecdc][i % 4] }); f.position.y = i * 0.065; f.rotation.y = (i % 3 - 1) * 0.06; files.add(f); } const fr = K.box(0.06, 0.8, 0.38, null, { color: 0xc8312c }); fr.position.set(0, 0.4, 0); files.add(fr); files.position.set(-1.6, 1.46, -2.7); scene.add(files);
  for (let r = 0; r < 3; r++) { const pew = K.box(2.6, 0.9, 0.5, T.wood, { tileM: 1 }); pew.position.set(-3.2, 0.45, 2.2 + r * 1.4); scene.add(pew); const pew2 = pew.clone(); pew2.position.x = 3.2; scene.add(pew2); }
  const sun = new THREE.DirectionalLight(0xfff0d0, 1.3); sun.position.set(6, 9, 8); sun.target.position.set(0, 0, -2); scene.add(sun, sun.target); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0005; Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9 });
  scene.add(new THREE.HemisphereLight(0xfff4e0, 0x8a6a4a, 1.05));
  return { scene, life, lectern: lec, files };
}

// ------------------------------------------------------------------ the tharavad room and its pathayam
export function tharavadSet() {
  const T = K.stdTextures(), scene = new THREE.Scene(), life = []; scene.background = new THREE.Color(0x2a1a10);
  const floor = K.mesh(new THREE.PlaneGeometry(12, 10), K.col(0x5a2a20)); floor.rotation.x = -Math.PI / 2; scene.add(floor); // red-oxide floor
  const wt = T.wood.clone(); wt.repeat.set(6, 1.5); wt.needsUpdate = true; const wm = new THREE.MeshLambertMaterial({ map: wt, side: THREE.DoubleSide });
  const back = K.mesh(new THREE.PlaneGeometry(12, 5), wm); back.position.set(0, 2.5, -4); scene.add(back); for (const s of [-1, 1]) { const w = K.mesh(new THREE.PlaneGeometry(10, 5), wm); w.rotation.y = -s * Math.PI / 2; w.position.set(s * 6, 2.5, 1); scene.add(w); }
  const win = noInk(new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.6), glow(0xffe4a0))); win.position.set(3.2, 2.6, -3.98); scene.add(win); for (let k = 0; k < 5; k++) { const bar = K.box(0.06, 1.6, 0.06, null, { color: 0x3a2010 }); bar.position.set(2.6 + k * 0.3, 2.6, -3.94); scene.add(bar); }
  // the pathayam: big carved paddy chest with a lid on a back hinge
  const P = new THREE.Group(); P.position.set(0, 0, -1.6); scene.add(P); const W = 2.8, D = 1.4, Hh = 1.2;
  const body = K.box(W, Hh, D, T.wood, { tileM: 0.8 }); body.position.y = Hh / 2; P.add(body); for (const x of [-1.0, 0, 1.0]) { const post = K.box(0.12, Hh + 0.04, D + 0.04, null, { color: 0x3a2010 }); post.position.set(x, Hh / 2, 0); P.add(post); }
  for (let i = 0; i < 6; i++) { const knob = K.mesh(new THREE.SphereGeometry(0.05, 8, 6), K.col(GOLD2)); knob.position.set(-1.2 + i * 0.48, Hh * 0.55, D / 2 + 0.03); P.add(knob); }
  const inner = K.box(W - 0.16, 0.04, D - 0.16, null, { color: 0x1a0e08 }); inner.position.y = Hh - 0.05; P.add(inner);
  const rice = K.box(W - 0.2, 0.06, D - 0.2, null, { color: 0xe8dcc0 }); rice.position.y = Hh - 0.02; P.add(rice);
  const goldTop = new THREE.Group(); goldTop.position.y = Hh - 0.04; P.add(goldTop); const cg = new THREE.CylinderGeometry(0.07, 0.07, 0.025, 10), cm = K.col(GOLD); const rr = K.rnd(17);
  for (let i = 0; i < 360; i++) { const c = K.mesh(cg, cm, { shadow: false }); const u = rr(), v = rr(); c.position.set((u - 0.5) * (W - 0.3), Math.sin(u * Math.PI) * Math.sin(v * Math.PI) * 0.35, (v - 0.5) * (D - 0.3)); c.rotation.set(rr() * 0.8, 0, rr() * 0.8); goldTop.add(c); }
  const shine = new THREE.PointLight(0xffd060, 0, 4, 1.4); shine.position.set(0, Hh + 0.6, 0.3); P.add(shine);
  const lidP = new THREE.Group(); lidP.position.set(0, Hh, -D / 2); P.add(lidP); const lid = K.box(W + 0.1, 0.14, D + 0.1, T.wood, { tileM: 0.8 }); lid.position.set(0, 0.07, D / 2); lidP.add(lid);
  // spill of gold over the front when it overflows
  const spill = new THREE.Group(); P.add(spill); for (let i = 0; i < 60; i++) { const c = K.mesh(cg, cm, { shadow: false }); c.position.set((rr() - 0.5) * 2.4, rr() * 0.12, D / 2 + 0.2 + rr() * 0.9); c.rotation.set(rr(), 0, rr()); spill.add(c); }
  lampFlame(scene, life, -2.8, 0, -2.8, 1.4, 4);
  const sun = new THREE.DirectionalLight(0xffe4b0, 1.0); sun.position.set(4, 6, 3); sun.target.position.set(0, 0.8, -1.6); scene.add(sun, sun.target); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6 });
  scene.add(new THREE.HemisphereLight(0xffe8c0, 0x4a2a1a, 0.8));
  const api = { scene, life, chest: P,
    setOpen(u) { lidP.rotation.x = -u * 1.9; }, setGold(u) { rice.visible = u < 0.5; goldTop.visible = u >= 0.5; goldTop.scale.y = Math.max(0.01, u); shine.intensity = u * 8; spill.visible = u > 0.95; } };
  api.setOpen(0); api.setGold(0); return api;
}
