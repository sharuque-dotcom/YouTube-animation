// Kuwait 1990 sets: dressing for the reused Gulf desert (night Kuwait City + tanks; the bus convoy road with
// BASRA / BAGHDAD / AMMAN signs; the what-if camp with January flashes) and a small cinema for the Airlift twist.
import * as K from '../../pipeline/toon3d.js';
const THREE = K.THREE;
const glow = (c, o = {}) => new THREE.MeshBasicMaterial({ color: c, ...o });
const noInk = (m) => { m.userData.noInk = true; return m; };
const plane = (w, h, map) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshLambertMaterial({ map }));

export function tank() { const g = new THREE.Group(); const c = 0x6a6a4a;
  const hull = K.box(3.2, 0.8, 1.9, null, { color: c }); hull.position.y = 0.7; g.add(hull); for (const s of [-1, 1]) { const tr = K.box(3.4, 0.6, 0.45, null, { color: 0x2a2a26 }); tr.position.set(0, 0.35, s * 0.95); g.add(tr); }
  const tur = K.mesh(new THREE.CylinderGeometry(0.7, 0.8, 0.5, 14), K.col(c)); tur.position.set(-0.2, 1.35, 0); g.add(tur); const gun = K.mesh(new THREE.CylinderGeometry(0.08, 0.1, 2.6, 8), K.col(0x4a4a38)); gun.rotation.z = Math.PI / 2; gun.position.set(1.3, 1.4, 0); g.add(gun);
  const lamp = noInk(K.mesh(new THREE.CircleGeometry(0.14, 10), glow(0xfff0b0))); lamp.position.set(1.62, 0.85, 0.6); lamp.rotation.y = Math.PI / 2; g.add(lamp); return g; }
export function bus(color = 0xe8d8a8, stripe = 0x2f6a8a) { const g = new THREE.Group(); const body = K.box(6, 2.2, 2.2, null, { color }); body.position.y = 1.5; g.add(body); const st = K.box(6.02, 0.3, 2.22, null, { color: stripe }); st.position.y = 1.2; g.add(st);
  for (let i = 0; i < 6; i++) { const w = K.box(0.75, 0.7, 2.24, null, { color: 0x3a5a7a }); w.position.set(-2.3 + i * 0.9, 2.05, 0); g.add(w); } const ws = K.box(0.06, 1.0, 1.9, null, { color: 0x3a5a7a }); ws.position.set(3.0, 1.9, 0); g.add(ws);
  for (const x of [-1.9, 1.9]) for (const z of [-1.1, 1.1]) { const w = K.mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.3, 14), K.col(0x1a1a1e)); w.rotation.x = Math.PI / 2; w.position.set(x, 0.45, z); g.add(w); }
  const rack = K.box(4.4, 0.5, 1.8, null, { color: [0xc8312c, 0x3a5a8a, 0xb8925a][Math.floor(Math.random() * 3)] }); rack.position.set(-0.4, 2.85, 0); g.add(rack); return g; }

export function sedan(color = 0xe8e4dc) { const g = new THREE.Group(); const body = K.box(4.2, 0.7, 1.8, null, { color }); body.position.y = 0.75; g.add(body);
  const cab = K.box(2.2, 0.6, 1.6, null, { color }); cab.position.set(-0.2, 1.4, 0); g.add(cab); for (const s of [-1, 1]) { const w = K.box(2.0, 0.45, 0.02, null, { color: 0x3a5a7a }); w.position.set(-0.2, 1.42, s * 0.81); g.add(w); }
  const ws = K.box(0.04, 0.5, 1.5, null, { color: 0x3a5a7a }); ws.position.set(0.92, 1.4, 0); g.add(ws);
  for (const x of [-1.3, 1.3]) for (const z of [-0.9, 0.9]) { const w = K.mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.24, 14), K.col(0x1a1a1e)); w.rotation.x = Math.PI / 2; w.position.set(x, 0.38, z); g.add(w); }
  for (const z of [-0.6, 0.6]) { const l = noInk(K.mesh(new THREE.CircleGeometry(0.13, 10), glow(0xfff0b0))); l.position.set(2.11, 0.85, z); l.rotation.y = Math.PI / 2; g.add(l); }
  const beam = noInk(K.mesh(new THREE.ConeGeometry(1.6, 9, 16, 1, true), glow(0xfff2c0, { transparent: true, opacity: 0.0, side: THREE.DoubleSide, depthWrite: false }), { shadow: false })); beam.rotation.z = Math.PI / 2; beam.position.set(6.6, 0.8, 0); g.add(beam); g.userData.beam = beam; return g; }

export function dressDesertKuwait(d) {
  const sc = d.scene; let sun = null, hemi = null; sc.traverse((o) => { if (o.isDirectionalLight) sun = o; if (o.isHemisphereLight) hemi = o; });
  const day = sc.background, dayFog = sc.fog.color.clone();
  const night = K.paint(128, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0a0e26'); gr.addColorStop(0.7, '#2a2a50'); gr.addColorStop(1, '#6a4a50'); g.fillStyle = gr; g.fillRect(0, 0, w, h); const r = K.rnd(3); g.fillStyle = '#fff'; for (let i = 0; i < 120; i++) g.fillRect(r() * w, r() * h * 0.6, 1, 1); });
  const dusk = K.skyTexture({ seed: 81, clouds: 3, top: '#3a2a5a', mid: '#c0603a', bottom: '#f0a060' });
  d.setMode = (m) => { sc.background = m === 'night' ? night : m === 'dusk' ? dusk : day; sc.fog.color.set(m === 'night' ? 0x1a1a30 : m === 'dusk' ? 0x8a5a4a : dayFog); sun.intensity = m === 'night' ? 1.0 : m === 'dusk' ? 0.9 : 1.9; sun.color.set(m === 'dusk' ? 0xffa060 : m === 'night' ? 0x8aa0ff : 0xfff0d0); hemi.intensity = m === 'night' ? 1.1 : 1.0; };
  // flatten a corridor for the road + tank lane (ground is the big 400x400 plane; plane-y = -world-z)
  sc.traverse((o) => { const gp = o.geometry; if (!o.isMesh || !gp || !gp.parameters || gp.parameters.width !== 400 || gp.parameters.heightSegments !== 100) return; const pa = gp.attributes.position;
    for (let i = 0; i < pa.count; i++) { const wz = -pa.getY(i), k = Math.min(1, Math.max(0, (Math.abs(wz - 6) - 9) / 6)); pa.setZ(i, pa.getZ(i) * k); } pa.needsUpdate = true; gp.computeVertexNormals(); });
  if (d.sign) d.sign.visible = false;
  // tanks rolling in along the front road
  d.tanks = [0, 1, 2, 3].map((i) => { const t = tank(); t.position.set(-30 + i * 6, 0, 4 - (i % 2) * 2.6); sc.add(t); return t; });
  // convoy road + buses + signs
  const road = K.mesh(new THREE.PlaneGeometry(400, 5), K.col(0x6a6a72)); road.rotation.x = -Math.PI / 2; road.position.set(0, 0.04, 8); sc.add(road);
  for (let i = 0; i < 40; i++) { const s = K.box(2, 0.02, 0.2, null, { color: 0xf0e6c0 }); s.position.set(-200 + i * 10, 0.06, 8); sc.add(s); }
  d.buses = [0, 1, 2, 3, 4, 5].map((i) => { const b = bus([0xe8d8a8, 0xf2f2ec, 0xd8c8a0][i % 3], [0x2f6a8a, 0xc8312c, 0x2f6a3a][i % 3]); b.position.set(-200, 0.04, 8); sc.add(b); return b; });
  d.car = sedan(0xe8e4dc); d.car.position.set(-200, 0.04, 8.8); sc.add(d.car);
  d.signs = ['BASRA · البصرة', 'BAGHDAD · بغداد', 'AMMAN · عمّان'].map((txt, i) => { const g = new THREE.Group(); const p = plane(3.2, 1.0, K.signTex([txt], { w: 640, h: 200, bg: '#1f6a3a', fg: '#ffffff', border: '#ffffff', font: 'Oswald', weight: 700, aged: false })); p.position.y = 3.0; g.add(p);
    for (const x of [-1.2, 1.2]) { const l = K.box(0.1, 3.0, 0.1, null, { color: 0x9a9aa0 }); l.position.set(x, 1.5, -0.05); g.add(l); } g.position.set(-200, 0, 11.4); sc.add(g); return g; });
  // camp: tents + crowd area, and January flashes on the horizon
  d.tents = []; for (let i = 0; i < 8; i++) { const tnt = K.mesh(new THREE.ConeGeometry(1.6, 2.0, 4), K.col([0xe8e2d4, 0xd8c8a8][i % 2])); tnt.position.set(-8 + i * 2.6, 1.0, -4 - (i % 2) * 2); tnt.rotation.y = Math.PI / 4; tnt.visible = false; sc.add(tnt); d.tents.push(tnt); }
  d.flashes = []; for (let i = 0; i < 5; i++) { const f = noInk(K.mesh(new THREE.SphereGeometry(4, 12, 8), glow(0xffb060, { transparent: true, opacity: 0 }), { shadow: false })); f.position.set(-50 + i * 25, 3, -120); sc.add(f); d.flashes.push(f); }
  d.setFlash = (t, on) => d.flashes.forEach((f, i) => { const k = ((t * 0.7 + i * 0.37) % 1); f.material.opacity = on ? Math.max(0, 1 - k * 4) * 0.9 : 0; f.scale.setScalar(0.5 + k * 2); });
}

export function cinemaSet() {
  const scene = new THREE.Scene(), life = []; scene.background = new THREE.Color(0x120a10); scene.fog = new THREE.Fog(0x120a10, 10, 40);
  const floor = K.mesh(new THREE.PlaneGeometry(30, 30), K.col(0x3a1a20)); floor.rotation.x = -Math.PI / 2; scene.add(floor);
  const wall = K.mesh(new THREE.PlaneGeometry(30, 12), K.col(0x2a1418)); wall.position.set(0, 6, -9); scene.add(wall);
  const curtain = []; for (const s of [-1, 1]) { const c = K.box(3, 8, 0.3, null, { color: 0x8a1e1e }); c.position.set(s * 7.5, 4.5, -8.6); scene.add(c); curtain.push(c); }
  const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 576; const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const screen = noInk(new THREE.Mesh(new THREE.PlaneGeometry(12, 6.75), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }))); screen.position.set(0, 4.6, -8.7); scene.add(screen);
  const seats = []; for (let r = 0; r < 5; r++) for (let c = 0; c < 9; c++) { const s = K.box(0.8, 0.9, 0.7, null, { color: 0x6a1a22 }); s.position.set(-4 + c * 1.0, 0.45, -2 + r * 1.3); scene.add(s); seats.push(s); }
  const beam = noInk(K.mesh(new THREE.ConeGeometry(4, 18, 20, 1, true), glow(0xfff2d0, { transparent: true, opacity: 0.08, side: THREE.DoubleSide, depthWrite: false }), { shadow: false })); beam.rotation.x = Math.PI / 2; beam.position.set(0, 5.5, 0); scene.add(beam);
  const light = new THREE.PointLight(0xc8d8ff, 30, 30, 1.4); light.position.set(0, 4, -6); scene.add(light); scene.add(new THREE.HemisphereLight(0x6a5a8a, 0x201018, 0.8));
  return { scene, life, cv, tex, screen, seats, beam };
}

// a room that plays two parts: the Toyota showroom (car + sign) and the Indian embassy in Baghdad (flag + desk + plaque)
export function roomSet() {
  const T = K.stdTextures(), scene = new THREE.Scene(), life = []; scene.background = new THREE.Color(0xe8dcc0);
  const floor = K.mesh(new THREE.PlaneGeometry(16, 12), K.col(0xb8a888)); floor.rotation.x = -Math.PI / 2; scene.add(floor);
  for (let i = 0; i < 8; i++) { const ln = K.box(16, 0.005, 0.03, null, { color: 0x9a8a6a }); ln.position.set(0, 0.004, -6 + i * 1.6); scene.add(ln); }
  const wallM = (c) => new THREE.MeshLambertMaterial({ color: c, side: THREE.DoubleSide });
  const back = K.mesh(new THREE.PlaneGeometry(16, 6), wallM(0xe6dcc4)); back.position.set(0, 3, -5); scene.add(back);
  const left = K.mesh(new THREE.PlaneGeometry(12, 6), wallM(0xd8ccb0)); left.rotation.y = Math.PI / 2; left.position.set(-8, 3, 1); scene.add(left);
  const dado = K.box(16, 1.1, 0.05, T.wood, { tileM: 1 }); dado.position.set(0, 0.55, -4.95); scene.add(dado);
  // window on the back wall: day or night outside
  const dayT = K.skyTexture({ seed: 77, clouds: 3, top: '#5f9fe0', bottom: '#f0e2b8' });
  const nightT = K.paint(128, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0a0e26'); gr.addColorStop(1, '#3a2a40'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = '#ffd890'; for (let i = 0; i < 14; i++) g.fillRect((i * 37) % w, h * 0.6 + ((i * 53) % 60), 6, 8); });
  const winM = new THREE.MeshBasicMaterial({ map: dayT, toneMapped: false }); const win = noInk(new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.2), winM)); win.position.set(-4.6, 3.0, -4.94); scene.add(win);
  const wf = K.box(2.8, 0.12, 0.1, null, { color: 0x5a3a22 }); wf.position.set(-4.6, 1.85, -4.9); scene.add(wf); const wf2 = wf.clone(); wf2.position.y = 4.15; scene.add(wf2); const wb = K.box(0.08, 2.2, 0.08, null, { color: 0x5a3a22 }); wb.position.set(-4.6, 3, -4.9); scene.add(wb);
  // big sign plaque on the wall
  const plaqueCv = document.createElement('canvas'); plaqueCv.width = 1024; plaqueCv.height = 256; const plaqueTex = new THREE.CanvasTexture(plaqueCv); plaqueTex.colorSpace = THREE.SRGBColorSpace;
  const plaque = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 1.3), new THREE.MeshLambertMaterial({ map: plaqueTex })); plaque.position.set(1.4, 4.2, -4.93); scene.add(plaque);
  const setPlaque = (lines, bg, fg) => { const g = plaqueCv.getContext('2d'); g.fillStyle = bg; g.fillRect(0, 0, 1024, 256); g.strokeStyle = fg; g.lineWidth = 10; g.strokeRect(14, 14, 996, 228); g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle';
    lines.forEach(([txt, size, y, font]) => { g.font = `800 ${size}px ${font || "'Oswald'"}`; g.fillText(txt, 512, y); }); plaqueTex.needsUpdate = true; };
  // showroom car on a turntable
  const car = sedan(0xf2f2ec); car.position.set(2.6, 0.12, -1.6); car.rotation.y = -0.5; scene.add(car); const disc = K.mesh(new THREE.CylinderGeometry(3, 3, 0.12, 40), K.col(0x8a8a90)); disc.position.set(2.6, 0.06, -1.6); scene.add(disc);
  life.push((t) => { car.rotation.y = -0.5 + Math.sin(t * 0.3) * 0.25; });
  // embassy desk + tricolour on a stand
  const desk = new THREE.Group(); const top = K.box(3.2, 0.1, 1.4, T.wood, { tileM: 1 }); top.position.y = 0.95; desk.add(top); for (const s of [-1, 1]) { const ped = K.box(0.8, 0.9, 1.3, T.wood, { tileM: 1 }); ped.position.set(s * 1.1, 0.45, 0); desk.add(ped); }
  for (let i = 0; i < 3; i++) { const f = K.box(0.42, 0.05, 0.32, null, { color: [0xd8b878, 0xc8a060, 0xe8d0a0][i] }); f.position.set(-1.1, 1.03 + i * 0.05, -0.1); desk.add(f); }
  const ph = K.box(0.36, 0.12, 0.24, null, { color: 0x2a2a30 }); ph.position.set(1.1, 1.06, 0); desk.add(ph); desk.position.set(0, 0, -2.6); scene.add(desk);
  const flagT = K.paint(300, 200, (g, w, h) => { g.fillStyle = '#ff9933'; g.fillRect(0, 0, w, h / 3); g.fillStyle = '#ffffff'; g.fillRect(0, h / 3, w, h / 3); g.fillStyle = '#138808'; g.fillRect(0, 2 * h / 3, w, h / 3); g.strokeStyle = '#000080'; g.lineWidth = 4; g.beginPath(); g.arc(w / 2, h / 2, 26, 0, 7); g.stroke();
    for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2; g.beginPath(); g.moveTo(w / 2, h / 2); g.lineTo(w / 2 + Math.cos(a) * 26, h / 2 + Math.sin(a) * 26); g.lineWidth = 1.5; g.stroke(); } });
  const flag = new THREE.Group(); const pole = K.mesh(new THREE.CylinderGeometry(0.03, 0.03, 3, 8), K.col(0xc8962a)); pole.position.y = 1.5; flag.add(pole); const fgeo = new THREE.PlaneGeometry(1.2, 0.8, 10, 1); const fl = K.mesh(fgeo, new THREE.MeshLambertMaterial({ map: flagT, side: THREE.DoubleSide })); fl.position.set(0.62, 2.55, 0); flag.add(fl);
  const fp0 = fgeo.attributes.position.array.slice(); life.push((t) => { const a = fgeo.attributes.position; for (let i = 0; i < a.count; i++) { const x = fp0[i * 3] + 0.6; a.setZ(i, Math.sin(x * 4 - t * 3) * 0.05 * x); } a.needsUpdate = true; fgeo.computeVertexNormals(); });
  flag.position.set(-2.6, 0, -3.6); scene.add(flag);
  // ceiling fan
  const fan = new THREE.Group(); const blades = new THREE.Group(); fan.add(blades); for (let i = 0; i < 3; i++) { const bl = K.box(1.0, 0.02, 0.18, T.wood, { tileM: 1 }); bl.position.x = 0.6; const arm = new THREE.Group(); arm.add(bl); arm.rotation.y = i / 3 * Math.PI * 2; blades.add(arm); }
  fan.position.set(0, 5.2, -1); scene.add(fan); life.push((t) => { blades.rotation.y = t * 5; });
  const sun = new THREE.DirectionalLight(0xfff0d0, 1.4); sun.position.set(-6, 9, 8); sun.target.position.set(0, 0, -2); scene.add(sun, sun.target); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0005; Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 40 });
  const hemi = new THREE.HemisphereLight(0xfff4e0, 0x8a6a4a, 1.05); scene.add(hemi); const lamp = new THREE.PointLight(0xffc880, 6, 9, 1.5); lamp.position.set(0.5, 3.2, 0); scene.add(lamp);
  let cur = '';
  const setMode = (m) => { if (m === cur) return; cur = m; const show = m === 'showroom'; car.visible = show; disc.visible = show; desk.visible = !show; flag.visible = m === 'embassy'; plaque.visible = m !== 'night';
    const night = m === 'night'; winM.map = night ? nightT : dayT; winM.needsUpdate = true; sun.intensity = night ? 0.25 : 1.4; hemi.intensity = night ? 0.45 : 1.05; lamp.intensity = night ? 14 : 6; scene.background.set(night ? 0x2a2230 : 0xe8dcc0);
    if (show) setPlaque([['TOYOTA · KUWAIT', 120, 128]], '#c8312c', '#ffffff'); else setPlaque([['EMBASSY OF INDIA', 92, 96], ['ഇന്ത്യൻ എംബസി · ബാഗ്ദാദ്', 64, 186, "'Noto Malayalam'"]], '#1f3a6a', '#f4e8c8'); };
  setMode('showroom');
  return { scene, life, car, desk, flag, setMode };
}
