// Extra sets for the bean-style Travancore Short: Dewan's office, thorium beach, concert hall (evening).
import { THREE, rnd, paint, mottle, stdTextures, signTex, box, mat, col, mesh, roofGable, palm, banana, card, skyTexture } from '../../pipeline/toon3d.js';
import { drawBean } from '../../pipeline/bean.js';

const P = (x, y, z) => new THREE.Vector3(x, y, z);
const glowMat = (c) => new THREE.MeshBasicMaterial({ color: c });

function redOxide() { return paint(256, 256, (g, w, h) => { g.fillStyle = '#9a3424'; g.fillRect(0, 0, w, h); mottle(g, w, h, ['#b8442e', '#7e2a1c', '#c45a40'], 200, [10, 50], 41, 0.25);
  g.strokeStyle = 'rgba(40,10,6,.45)'; g.lineWidth = 3; for (let i = 0; i <= w; i += 64) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, h); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(w, i); g.stroke(); }
  g.fillStyle = 'rgba(255,230,210,.18)'; g.beginPath(); g.ellipse(90, 70, 60, 18, -0.4, 0, 7); g.fill(); }); }

/** a flat textured plane that faces +z, stands at position */
function plane(w, h, tex, { basic = false, side = THREE.FrontSide } = {}) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), basic ? new THREE.MeshBasicMaterial({ map: tex, side }) : new THREE.MeshLambertMaterial({ map: tex, side })); m.receiveShadow = true; return m; }

export function textTex(lines, { w = 512, h = 256, bg = '#f4ecd6', fg = '#2a1c17', font = "'Noto Malayalam'", weight = 800, red = null } = {}) {
  return paint(w, h, (g) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); mottle(g, w, h, ['#c8a870', '#fff6dc'], 60, [8, 30], w, 0.2); g.textAlign = 'center'; g.textBaseline = 'middle';
    lines.forEach(([t, size, y, c], i) => { g.fillStyle = c || fg; let s = size; g.font = `${weight} ${s}px ${font}, 'Oswald', sans-serif`; while (g.measureText(t).width > w - 40 && s > 10) { s -= 2; g.font = `${weight} ${s}px ${font}, 'Oswald', sans-serif`; } g.fillText(t, w / 2, y); });
    if (red) { g.save(); g.translate(w * 0.62, h * 0.62); g.rotate(-0.25); g.strokeStyle = '#c8312c'; g.lineWidth = 8; g.beginPath(); g.ellipse(0, 0, 110, 56, 0, 0, 7); g.stroke(); g.fillStyle = '#c8312c'; g.font = `800 70px ${font}`; g.fillText(red, 0, 4); g.restore(); } });
}

// ------------------------------------------------------------------ OFFICE
export function officeSet() {
  const T = stdTextures(), scene = new THREE.Scene(), life = [];
  scene.background = new THREE.Color(0xf3e6c8);
  const R = { w: 9, d: 8, h: 4.6 };
  const floor = mesh(new THREE.PlaneGeometry(R.w, R.d), new THREE.MeshLambertMaterial({ map: (() => { const t = redOxide(); t.repeat.set(4, 4); return t; })() })); floor.rotation.x = -Math.PI / 2; scene.add(floor);
  const wallT = T.limeYellow.clone(); wallT.repeat.set(3, 1.5); wallT.needsUpdate = true; const wm = new THREE.MeshLambertMaterial({ map: wallT, side: THREE.DoubleSide });
  const back = mesh(new THREE.PlaneGeometry(R.w, R.h), wm); back.position.set(0, R.h / 2, -R.d / 2); scene.add(back);
  const left = mesh(new THREE.PlaneGeometry(R.d, R.h), wm); left.rotation.y = Math.PI / 2; left.position.set(-R.w / 2, R.h / 2, 0); scene.add(left);
  const right = mesh(new THREE.PlaneGeometry(R.d, R.h), wm); right.rotation.y = -Math.PI / 2; right.position.set(R.w / 2, R.h / 2, 0); scene.add(right);
  const ceil = mesh(new THREE.PlaneGeometry(R.w, R.d), mat(T.wood)); ceil.rotation.x = Math.PI / 2; ceil.position.y = R.h; scene.add(ceil);
  for (let i = 0; i < 5; i++) { const b = box(R.w, 0.22, 0.22, T.wood, { tileM: 1 }); b.position.set(0, R.h - 0.11, -R.d / 2 + 0.8 + i * 1.6); scene.add(b); }
  // teak dado panels + skirting
  for (const [pw, rot, pos] of [[R.w, 0, P(0, 0.6, -R.d / 2 + 0.03)], [R.d, Math.PI / 2, P(-R.w / 2 + 0.03, 0.6, 0)], [R.d, -Math.PI / 2, P(R.w / 2 - 0.03, 0.6, 0)]]) {
    const d = box(pw, 1.2, 0.05, T.wood, { tileM: 1 }); d.rotation.y = rot; d.position.copy(pos); scene.add(d);
    const rail = box(pw, 0.08, 0.1, null, { color: 0x5a3018 }); rail.rotation.y = rot; rail.position.copy(pos); rail.position.y = 1.22; scene.add(rail); }
  // tall windows on the left wall with green shutters, bright palms outside
  const outside = skyTexture({ seed: 4, clouds: 3, top: '#6aa8e6', bottom: '#d8ecf0' });
  for (const z of [-2, 1.2]) { const g = new THREE.Group(); const hole = plane(1.3, 2.3, outside, { basic: true }); g.add(hole);
    for (const s of [-1, 1]) { const sh = box(0.62, 2.3, 0.05, T.woodGreen, { tileM: 1 }); sh.position.set(s * 0.95, 0, 0.3); sh.rotation.y = -s * 0.9; g.add(sh); }
    for (let k = 0; k < 4; k++) { const bar = box(0.04, 2.3, 0.04, null, { color: 0x2a1c17 }); bar.position.set(-0.45 + k * 0.3, 0, 0.03); g.add(bar); }
    const arch = mesh(new THREE.CircleGeometry(0.65, 20, 0, Math.PI), glowMat(0xffe8b0)); arch.position.y = 1.15; g.add(arch);
    const pf = new THREE.Group(); const fr = mesh(new THREE.PlaneGeometry(1.2, 0.9), new THREE.MeshBasicMaterial({ color: 0x5a9a3a, side: THREE.DoubleSide })); fr.rotation.z = 0.5; fr.position.set(0.2, 0.5, -0.4); pf.add(fr); g.add(pf);
    g.rotation.y = Math.PI / 2; g.position.set(-R.w / 2 + 0.02, 2.3, z); scene.add(g); }
  // sun beam through the window (soft additive slab) + dust motes
  const beam = mesh(new THREE.PlaneGeometry(1.4, 6), new THREE.MeshBasicMaterial({ color: 0xfff0c0, transparent: true, opacity: 0.12, depthWrite: false, side: THREE.DoubleSide }), { shadow: false }); beam.userData.noInk = true; beam.position.set(-2.4, 1.6, -0.4); beam.rotation.set(0, Math.PI / 2, 0.9); scene.add(beam);
  const motes = []; { const r = rnd(5); for (let i = 0; i < 40; i++) { const m = mesh(new THREE.OctahedronGeometry(0.012), glowMat(0xfff4d0), { shadow: false }); m.userData.noInk = true; m.position.set(-3 + r() * 2.4, 0.5 + r() * 2.6, -1.6 + r() * 2.4); m.userData.ph = r() * 9; scene.add(m); motes.push(m); } }
  life.push((t) => motes.forEach((m, i) => { m.position.y += Math.sin(t * 0.6 + m.userData.ph) * 0.0015; m.position.x += Math.cos(t * 0.4 + i) * 0.001; }));
  // ceiling fan (always turning)
  const fan = new THREE.Group(); const rod = mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.7, 6), col(0x3a2a20)); rod.position.y = 0.35; fan.add(rod);
  const hub = mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.16, 14), col(0x6a4a2a)); fan.add(hub); const blades = new THREE.Group(); fan.add(blades);
  for (let i = 0; i < 3; i++) { const bl = box(0.9, 0.02, 0.16, T.wood, { tileM: 1 }); bl.position.x = 0.55; const arm = new THREE.Group(); arm.add(bl); arm.rotation.y = (i / 3) * Math.PI * 2; blades.add(arm); }
  fan.position.set(0.2, R.h - 0.75, -0.6); scene.add(fan); life.push((t) => { blades.rotation.y = t * 5.5; });
  // the Maharaja's portrait (gold frame) + conch flag on a stand
  const portrait = paint(300, 380, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#5a2a3a'); gr.addColorStop(1, '#2a1424'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.save(); g.translate(w / 2, h + 120); g.scale(0.85, 0.85); drawBean(g, { name: 'M', skin: '#c99068', hair: (c) => { c.beginPath(); c.moveTo(-56, -318); c.bezierCurveTo(-62, -386, 62, -386, 56, -318); c.closePath(); c.fillStyle = '#e8b93a'; c.fill(); c.lineWidth = 6; c.strokeStyle = '#2a1c17'; c.stroke(); c.fillStyle = '#c8312c'; c.beginPath(); c.arc(0, -352, 10, 0, 7); c.fill(); }, shirt: '#e8dcc0', shirtDark: '#c8b896', coat: true, glasses: false, lower: 'mundu', mundu: '#f6f1e4', kasavu: '#d9a521', legs: '#6b4632', shoes: '#1a1310' }, { expr: 'proud' }); g.restore();
    g.fillStyle = '#e8c06a'; g.font = "800 26px 'Noto Malayalam'"; g.textAlign = 'center'; g.fillText('മഹാരാജാവ്', w / 2, h - 18); });
  const pf = new THREE.Group(); const frame = box(1.35, 1.65, 0.08, null, { color: 0xc8962a }); pf.add(frame); const pic = plane(1.15, 1.45, portrait); pic.position.z = 0.05; pf.add(pic);
  pf.position.set(-1.9, 2.75, -R.d / 2 + 0.06); scene.add(pf);
  const flag = paint(300, 200, (g, w, h) => { g.fillStyle = '#c8312c'; g.fillRect(0, 0, w, h); g.fillStyle = '#f4efe4'; g.beginPath(); g.ellipse(w / 2, h / 2, 34, 48, 0.3, 0, 7); g.fill(); g.strokeStyle = '#c8312c'; g.lineWidth = 6; g.beginPath(); g.arc(w / 2, h / 2, 20, 0.5, 5); g.stroke(); });
  const fpole = mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.8, 8), col(0xc8962a)); fpole.position.set(2.9, 1.4, -2.8); scene.add(fpole);
  const fgeo = new THREE.PlaneGeometry(1.1, 0.7, 10, 1); const fl = mesh(fgeo, new THREE.MeshLambertMaterial({ map: flag, side: THREE.DoubleSide })); fl.position.set(3.45, 2.45, -2.8); scene.add(fl);
  const fp0 = fgeo.attributes.position.array.slice(); life.push((t) => { const a = fgeo.attributes.position; for (let i = 0; i < a.count; i++) { const x = fp0[i * 3] + 0.55; a.setZ(i, Math.sin(x * 4 - t * 3) * 0.06 * x); } a.needsUpdate = true; fgeo.computeVertexNormals(); });
  // bookshelf on the right wall
  { const sh = new THREE.Group(); const fr = box(2.6, 2.8, 0.45, T.wood, { tileM: 1 }); fr.position.y = 1.4; sh.add(fr); const r = rnd(8);
    for (let k = 0; k < 4; k++) { const y = 0.45 + k * 0.66; for (let x = -1.15; x < 1.1;) { const bw = 0.07 + r() * 0.08, bh = 0.42 + r() * 0.16; const b = box(bw, bh, 0.3, null, { color: [0x8a2a1e, 0x1f4f6a, 0x2f5a3a, 0xc8962a, 0x5a2a5a, 0xd8cfa8][Math.floor(r() * 6)] }); b.position.set(x + bw / 2, y + bh / 2, 0.26); sh.add(b); x += bw + 0.012; } }
    sh.rotation.y = -Math.PI / 2; sh.position.set(R.w / 2 - 0.25, 0, -1.4); scene.add(sh); }
  // the desk
  const desk = new THREE.Group(); const top = box(3.0, 0.1, 1.4, T.wood, { tileM: 1 }); top.position.y = 0.95; desk.add(top);
  const leather = box(2.4, 0.012, 0.9, null, { color: 0x2f5a3a }); leather.position.y = 1.006; desk.add(leather);
  for (const s of [-1, 1]) { const ped = box(0.8, 0.9, 1.3, T.wood, { tileM: 1 }); ped.position.set(s * 1.05, 0.45, 0); desk.add(ped); for (let k = 0; k < 3; k++) { const kn = mesh(new THREE.SphereGeometry(0.035, 8, 6), col(0xd8a63a)); kn.position.set(s * 1.05, 0.2 + k * 0.28, 0.66); desk.add(kn); } }
  const modesty = box(1.3, 0.7, 0.05, T.wood, { tileM: 1 }); modesty.position.set(0, 0.55, 0.6); desk.add(modesty);
  // files, inkpot, phone, nameplate
  for (let i = 0; i < 4; i++) { const f = box(0.42, 0.05, 0.32, null, { color: [0xd8b878, 0xc8a060, 0xe8d0a0, 0xb88a50][i] }); f.position.set(-1.05 + (i % 2) * 0.02, 1.03 + i * 0.05, -0.2); f.rotation.y = i * 0.08; desk.add(f); }
  const ink = mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.1, 10), col(0x1a2a4a)); ink.position.set(0.95, 1.06, -0.25); desk.add(ink);
  const quill = mesh(new THREE.ConeGeometry(0.03, 0.4, 6), col(0xf4efe4)); quill.position.set(0.98, 1.25, -0.25); quill.rotation.z = -0.4; desk.add(quill);
  const phone = new THREE.Group(); const pb = mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.04, 12), col(0x1a1a1a)); phone.add(pb); const ps = mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.32, 6), col(0x1a1a1a)); ps.position.y = 0.17; phone.add(ps); const pm = mesh(new THREE.CylinderGeometry(0.05, 0.03, 0.07, 10), col(0x1a1a1a)); pm.position.y = 0.35; phone.add(pm);
  phone.position.set(1.15, 1.03, 0.05); desk.add(phone);
  const nameTex = textTex([['DEWAN OF TRAVANCORE', 54, 128, '#2a1c17']], { w: 512, h: 256, bg: '#d8a63a' }); const np = new THREE.Group(); const npb = box(0.7, 0.14, 0.05, null, { color: 0x5a3018 }); np.add(npb); const npf = plane(0.66, 0.11, nameTex); npf.position.z = 0.03; np.add(npf);
  np.position.set(0, 1.1, 0.42); np.rotation.x = -0.4; desk.add(np);
  // the accession letter (hero prop) + stamp pad
  const letter = new THREE.Group(); const lt = textTex([['INDIAN UNION', 46, 50, '#1f3a6a'], ['INSTRUMENT OF ACCESSION', 32, 100], ['Sign here: __________', 30, 190]], { w: 512, h: 360 });
  const lp = plane(0.62, 0.44, lt); lp.rotation.x = -Math.PI / 2; letter.add(lp); letter.position.set(0.05, 1.015, 0.1); desk.add(letter);
  const noMark = paint(256, 256, (g, w, h) => { g.translate(w / 2, h / 2); g.rotate(-0.25); g.strokeStyle = '#c8312c'; g.lineWidth = 12; g.beginPath(); g.ellipse(0, 0, 110, 70, 0, 0, 7); g.stroke(); g.fillStyle = '#c8312c'; g.font = "800 96px 'Noto Malayalam'"; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('ഇല്ല', 0, 6); });
  const yesMark = paint(256, 256, (g, w, h) => { g.translate(w / 2, h / 2); g.rotate(-0.2); g.strokeStyle = '#1f6a3a'; g.lineWidth = 12; g.beginPath(); g.ellipse(0, 0, 110, 70, 0, 0, 7); g.stroke(); g.fillStyle = '#1f6a3a'; g.font = "800 92px 'Noto Malayalam'"; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('അതെ', 0, 6); });
  const markMat = new THREE.MeshBasicMaterial({ map: noMark, transparent: true, depthWrite: false }); const mark = mesh(new THREE.PlaneGeometry(0.34, 0.34), markMat, { shadow: false }); mark.userData.noInk = true; mark.rotation.x = -Math.PI / 2; mark.position.set(0.12, 0.004, 0.05); letter.add(mark);
  // big rubber stamp (3D) that the Dewan slams
  const stamp = new THREE.Group(); const sb = box(0.36, 0.1, 0.24, null, { color: 0x3a2a20 }); stamp.add(sb); const rub = box(0.34, 0.025, 0.22, null, { color: 0xc8312c }); rub.position.y = -0.06; stamp.add(rub);
  const neck = mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.22, 10), mat(T.wood)); neck.position.y = 0.16; stamp.add(neck); const knob = mesh(new THREE.SphereGeometry(0.08, 12, 10), mat(T.wood)); knob.position.y = 0.3; stamp.add(knob);
  desk.add(stamp); stamp.position.set(0.42, 1.1, -0.3);
  // flying papers (3D sheets)
  const sheets = []; { const r = rnd(12); for (let i = 0; i < 9; i++) { const sm = mesh(new THREE.PlaneGeometry(0.21, 0.28), new THREE.MeshLambertMaterial({ map: textTex([['——————', 30, 60], ['—————', 30, 110], ['————', 30, 160]], { w: 256, h: 340 }), side: THREE.DoubleSide })); sm.userData.v = P((r() - 0.5) * 2.4, 1.6 + r() * 1.4, (r() - 0.2) * 1.6); sm.userData.spin = P(r() * 6, r() * 6, r() * 6); sm.visible = false; desk.add(sm); sheets.push(sm); } }
  desk.position.set(0, 0, -0.8); scene.add(desk);
  // chair behind desk
  const chair = new THREE.Group(); const seat = box(0.7, 0.1, 0.65, T.wood, { tileM: 1 }); seat.position.y = 0.5; chair.add(seat); const cb = box(0.7, 1.2, 0.08, T.wood, { tileM: 1 }); cb.position.set(0, 1.1, -0.3); chair.add(cb);
  const cane = box(0.5, 0.8, 0.02, null, { color: 0xd8b870 }); cane.position.set(0, 1.15, -0.25); chair.add(cane); chair.position.set(0, 0, -2.0); scene.add(chair);
  // the title banner that unrolls from the beam ("Travancore")
  const banTex = paint(512, 900, (g, w, h) => { g.fillStyle = '#c8312c'; g.fillRect(0, 0, w, h); mottle(g, w, h, ['#a82a24', '#e04a3a'], 80, [10, 50], 61, 0.2); g.strokeStyle = '#e8b93a'; g.lineWidth = 16; g.strokeRect(22, 22, w - 44, h - 44);
    g.fillStyle = '#f4efe4'; g.beginPath(); g.ellipse(w / 2, 300, 90, 130, 0.3, 0, 7); g.fill(); g.strokeStyle = '#c8312c'; g.lineWidth = 12; g.beginPath(); g.arc(w / 2, 300, 50, 0.5, 5); g.stroke();
    g.fillStyle = '#f6e0a0'; g.font = "800 86px 'Noto Malayalam'"; g.textAlign = 'center'; g.fillText('തിരുവിതാം', w / 2, 600); g.fillText('കൂർ', w / 2, 720); });
  const banner = new THREE.Group(); const bgeo = new THREE.PlaneGeometry(1.5, 2.6); bgeo.translate(0, -1.3, 0); const bm = mesh(bgeo, new THREE.MeshLambertMaterial({ map: banTex, side: THREE.DoubleSide }), { shadow: false }); banner.add(bm);
  const roll = mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.65, 12), col(0xc8962a)); roll.rotation.z = Math.PI / 2; banner.add(roll); const roll2 = roll.clone(); banner.add(roll2);
  banner.position.set(1.7, R.h - 0.3, -R.d / 2 + 0.25); scene.add(banner);
  // lights: warm window key from the left, cool sky bounce, warm practical
  const sun = new THREE.DirectionalLight(0xfff0d0, 1.5); sun.position.set(-9, 7, 2); sun.target.position.set(0, 0, -1); scene.add(sun, sun.target); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0005; Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 30 });
  scene.add(new THREE.HemisphereLight(0xfff4e0, 0x9a5a3a, 1.05));
  const lamp = new THREE.PointLight(0xffc880, 3, 6, 1.5); lamp.position.set(0.8, 2.2, 0.6); scene.add(lamp);
  return {
    scene, life, desk, stamp, letter, mark, markMat, noMark, yesMark, sheets, banner, bm, roll2, R,
    /** u: 0 rolled up .. 1 fully down */
    setBanner(u) { const k = Math.max(0.001, u); bm.scale.y = k; roll2.position.y = -2.6 * k; },
    /** stamp animation: p in 0..1 (0 = resting, rises, slams at 0.7, lifts after) */
    setStamp(p, home = P(0.42, 1.1, -0.3), target = P(0.12, 1.1, 0.05)) { const up = Math.min(1, p / 0.5), down = Math.max(0, Math.min(1, (p - 0.55) / 0.15)), lift = Math.max(0, Math.min(1, (p - 0.85) / 0.15));
      const pos = home.clone().lerp(target, Math.min(1, p / 0.55)); pos.y = home.y + Math.sin(up * Math.PI / 2) * 0.55 - down * 0.62 + lift * 0.25; stamp.position.copy(pos); stamp.rotation.z = (1 - down) * 0.25 * up; },
    flyPapers(t0, t) { sheets.forEach((s) => { const dt = t - t0; s.visible = dt > 0 && dt < 3; if (!s.visible) return; const v = s.userData.v; s.position.set(v.x * dt, 1.05 + v.y * dt - 2.2 * dt * dt * (dt > 0.8 ? 0.6 : 1), v.z * dt); if (s.position.y < 0.02) s.position.y = 0.02; s.rotation.set(s.userData.spin.x * dt, s.userData.spin.y * dt, s.userData.spin.z * dt); }); },
  };
}

// ------------------------------------------------------------------ BEACH (mineral sand coast, afternoon)
export function beachSet() {
  const T = stdTextures(), scene = new THREE.Scene(), life = [];
  scene.background = skyTexture({ seed: 21, clouds: 6, top: '#4f95e0', mid: '#94c8f0', bottom: '#f2ecd8' });
  scene.fog = new THREE.Fog(0xe6eef0, 40, 180);
  const sandT = paint(512, 512, (g, w, h) => { g.fillStyle = '#e2c48a'; g.fillRect(0, 0, w, h); mottle(g, w, h, ['#d4b070', '#f0d8a4', '#c8a468'], 600, [6, 40], 71, 0.25);
    // black monazite/ilmenite streaks (the thorium-bearing sand)
    g.globalAlpha = 0.35; for (let k = 0; k < 4; k++) { g.strokeStyle = k % 2 ? '#2a2420' : '#4a3a30'; g.lineWidth = 10 + k * 3; g.beginPath(); g.moveTo(0, 40 + k * 55); g.bezierCurveTo(w / 3, 20 + k * 55, 2 * w / 3, 70 + k * 55, w, 40 + k * 55); g.stroke(); } g.globalAlpha = 1;
    const r = rnd(72); for (let i = 0; i < 1200; i++) { g.fillStyle = ['#1a1612', '#f6e6b8', '#a87a3a'][i % 3]; g.fillRect(r() * w, r() * h, 2, 2); } });
  sandT.repeat.set(5, 4);
  const sand = mesh(new THREE.PlaneGeometry(200, 120, 1, 1), new THREE.MeshLambertMaterial({ map: sandT, emissive: 0x3a2a10, emissiveIntensity: 0.25 })); sand.rotation.x = -Math.PI / 2; sand.position.z = 40; scene.add(sand);
  // sea: animated vertex waves + foam lines
  const sgeo = new THREE.PlaneGeometry(400, 160, 120, 60); const sea = mesh(sgeo, new THREE.MeshLambertMaterial({ color: 0x2f8ab0, emissive: 0x16506a, emissiveIntensity: 0.5 }), { shadow: false }); sea.rotation.x = -Math.PI / 2; sea.position.set(0, 0.05, -100); scene.add(sea);
  const sp0 = sgeo.attributes.position.array.slice(); life.push((t) => { const a = sgeo.attributes.position; for (let i = 0; i < a.count; i++) { const x = sp0[i * 3], y = sp0[i * 3 + 1]; a.setZ(i, Math.sin(x * 0.15 + t * 1.2) * 0.12 + Math.sin(y * 0.3 - t * 1.6) * 0.18); } a.needsUpdate = true; sgeo.computeVertexNormals(); });
  const foams = []; for (let k = 0; k < 4; k++) { const fgeo = new THREE.PlaneGeometry(220, 0.6, 60, 1); const fp = fgeo.attributes.position; for (let i = 0; i < fp.count; i++) fp.setY(i, fp.getY(i) + Math.sin(fp.getX(i) * 0.3) * 0.4); const f = mesh(fgeo, new THREE.MeshLambertMaterial({ color: 0xf6fbff, emissive: 0x8aa0a8, emissiveIntensity: 0.4, transparent: true, opacity: 0.9 }), { shadow: false }); f.rotation.x = -Math.PI / 2; scene.add(f); foams.push(f); }
  life.push((t) => foams.forEach((f, k) => { const u = (t * 0.18 + k / 4) % 1; f.position.set(0, 0.09, -20 + u * 6); f.material.opacity = 0.9 * Math.sin(u * Math.PI); }));
  // wet band
  const wet = mesh(new THREE.PlaneGeometry(220, 8), new THREE.MeshLambertMaterial({ color: 0x9a8058, transparent: true, opacity: 0.55 }), { shadow: false }); wet.rotation.x = -Math.PI / 2; wet.position.set(0, 0.02, -17); scene.add(wet);
  // country boats (vallam) on the sand
  const boat = (c) => { const g = new THREE.Group(); const hull = mesh(new THREE.CylinderGeometry(0.7, 0.7, 6, 16, 1, false, Math.PI / 2, Math.PI), new THREE.MeshLambertMaterial({ color: c, side: THREE.DoubleSide })); hull.rotation.z = Math.PI / 2; hull.scale.set(1, 1, 0.55); hull.position.y = 0.6; g.add(hull);
    for (const s of [-1, 1]) { const tip = mesh(new THREE.ConeGeometry(0.4, 1.2, 10), col(c)); tip.rotation.z = -s * Math.PI / 2 - s * 0.5; tip.position.set(s * 3.2, 0.85, 0); g.add(tip); }
    const rim = box(6, 0.08, 0.1, T.wood, { tileM: 1 }); rim.position.set(0, 0.62, 0.38); g.add(rim); const rim2 = rim.clone(); rim2.position.z = -0.38; g.add(rim2); return g; };
  [[-6, -9, 0.3, 0x2f6a8a], [7, -7, -0.4, 0xc8562a], [-14, -4, 0.8, 0x3a8a5a]].forEach(([x, z, r, c]) => { const b = boat(c); b.position.set(x, 0, z); b.rotation.y = r; scene.add(b); });
  // fishing net on poles
  for (let i = 0; i < 4; i++) { const p = mesh(new THREE.CylinderGeometry(0.05, 0.06, 2.4, 6), mat(T.wood)); p.position.set(9 + i * 1.6, 1.2, -2 - i * 0.4); scene.add(p); }
  const net = mesh(new THREE.PlaneGeometry(4.8, 1.4, 12, 4), new THREE.MeshLambertMaterial({ color: 0x6a5a4a, wireframe: true }), { shadow: false }); net.position.set(11.4, 1.6, -2.6); net.rotation.y = -0.25; scene.add(net);
  // palms at the back of the beach
  const palms = []; [[-10, 8, 9], [-6, 12, 10], [-14, 14, 8], [6, 10, 9.5], [12, 7, 8.5], [16, 13, 10], [0, 16, 9], [-20, 9, 8], [22, 10, 9]].forEach(([x, z, h], i) => { const p = palm(h, 0.25 + (i % 3) * 0.1, i + 40); p.position.set(x, 0, z); p.rotation.y = Math.PI + (i % 2 ? 0.4 : -0.4); scene.add(p); palms.push(p); });
  life.push((t) => palms.forEach((p) => p.userData.sway(t)));
  // the joke sign stuck in the sand
  const signT = signTex(['തോറിയം ☢', 'THORIUM SAND'], { bg: '#f4ecd6', fg: '#8a1e1e', border: '#2a1c17', w: 512, h: 220 });
  const sg = new THREE.Group(); const sp = plane(1.5, 0.64, signT); sp.position.y = 1.5; sg.add(sp); const back = box(1.56, 0.7, 0.05, T.wood, { tileM: 1 }); back.position.set(0, 1.5, -0.04); sg.add(back);
  const leg = box(0.09, 1.7, 0.09, T.wood, { tileM: 1 }); leg.position.set(0, 0.6, -0.08); sg.add(leg); sg.position.set(-1.8, 0, 0.4); sg.rotation.set(0, 0.35, 0.08); scene.add(sg);
  // glowing thorium sparkles (3D octahedra rising from the black sand)
  const sparks = []; { const r = rnd(9); for (let i = 0; i < 70; i++) { const s = mesh(new THREE.OctahedronGeometry(0.035 + r() * 0.03), glowMat(0x9dff7a), { shadow: false }); s.userData = { x: (r() - 0.5) * 3.2, z: (r() - 0.5) * 2.2 + 0.6, ph: r(), sp: 0.3 + r() * 0.5, noInk: true }; scene.add(s); sparks.push(s); } }
  const glowPool = mesh(new THREE.CircleGeometry(1.2, 32), new THREE.MeshBasicMaterial({ color: 0x7aff5a, transparent: true, opacity: 0.0, depthWrite: false, blending: THREE.AdditiveBlending }), { shadow: false }); glowPool.userData.noInk = true; glowPool.rotation.x = -Math.PI / 2; glowPool.position.set(0, 0.03, 0.6); scene.add(glowPool);
  // the steamship on the horizon with two diplomats on deck
  const ship = new THREE.Group(); const hullS = box(14, 2.2, 3, null, { color: 0x2a2a34 }); hullS.position.y = 1.1; ship.add(hullS); const red = box(14.05, 0.5, 3.05, null, { color: 0xa83a2a }); red.position.y = 0.25; ship.add(red);
  const deck = box(8, 1.6, 2.4, null, { color: 0xf0ead8 }); deck.position.set(-1, 3, 0); ship.add(deck); for (let i = 0; i < 6; i++) { const w = mesh(new THREE.CircleGeometry(0.18, 12), glowMat(0x2a3a4a)); w.position.set(-4.4 + i * 1.3, 3.1, 1.21); ship.add(w); }
  for (const x of [-2, 1]) { const fn = mesh(new THREE.CylinderGeometry(0.45, 0.5, 2.4, 14), col(0xd8a63a)); fn.position.set(x, 5, 0); ship.add(fn); const band = mesh(new THREE.CylinderGeometry(0.47, 0.47, 0.5, 14), col(0x2a2a34)); band.position.set(x, 6, 0); ship.add(band); }
  const mast = mesh(new THREE.CylinderGeometry(0.06, 0.06, 6, 6), col(0x3a2a20)); mast.position.set(5, 4.5, 0); ship.add(mast);
  const smoke = []; for (let i = 0; i < 10; i++) { const s = mesh(new THREE.SphereGeometry(0.5, 10, 8), new THREE.MeshLambertMaterial({ color: 0xd8d8dc }), { shadow: false }); ship.add(s); smoke.push(s); }
  life.push((t) => smoke.forEach((s, i) => { const u = (t * 0.25 + i / 10) % 1; s.position.set(-2 - u * 4 + (i % 2) * 3, 6.4 + u * 3, 0); s.scale.setScalar(0.4 + u * 1.6); }));
  ship.position.set(10, 0, -46); ship.rotation.y = -0.25; scene.add(ship);
  life.push((t) => { ship.position.y = Math.sin(t * 0.9) * 0.12; ship.rotation.z = Math.sin(t * 0.7) * 0.015; });
  const sun = new THREE.DirectionalLight(0xfff0d0, 1.6); sun.position.set(-14, 22, 18); sun.target.position.set(0, 0, -4); scene.add(sun, sun.target); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0005; Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 70 });
  scene.add(new THREE.HemisphereLight(0xcfe6ff, 0xd8b078, 1.0));
  return { scene, life, ship, sparks, glowPool, setGlow(u, t) { glowPool.material.opacity = 0.16 * u; sparks.forEach((s) => { const d = s.userData, k = (t * d.sp + d.ph) % 1; s.visible = u > 0.05; s.position.set(d.x * (0.4 + 0.6 * u), 0.05 + k * 1.8 * u, d.z); s.scale.setScalar((1 - k) * u + 0.01); s.rotation.y = t * 3 + d.ph * 9; }); } };
}

// ------------------------------------------------------------------ CONCERT HALL (evening, 25 July 1947)
export function concertSet() {
  const T = stdTextures(), scene = new THREE.Scene(), life = [];
  scene.background = skyTexture({ seed: 33, clouds: 4, top: '#26357a', mid: '#5c5aa8', bottom: '#f0a070' });
  scene.fog = new THREE.Fog(0x4a4a8a, 30, 120);
  const grT = T.dirt.clone(); grT.repeat.set(4, 4); grT.needsUpdate = true; const ground = mesh(new THREE.PlaneGeometry(120, 120), new THREE.MeshLambertMaterial({ map: grT })); ground.rotation.x = -Math.PI / 2; scene.add(ground);
  // hall: colonnaded facade, lit windows, tiled roof, open doors showing the stage glow
  const hall = new THREE.Group(); const body = box(16, 6, 10, T.lime, { tileM: 2.5 }); body.position.set(0, 3.5, -6); hall.add(body);
  const plinth = box(17, 0.5, 13, T.laterite, { tileM: 1.4 }); plinth.position.set(0, 0.25, -4.5); hall.add(plinth);
  for (let i = 0; i < 8; i++) { const c = mesh(new THREE.CylinderGeometry(0.28, 0.32, 4.6, 14), mat(T.lime)); c.position.set(-7 + i * 2, 2.8, 1.2); hall.add(c); }
  const ent = box(16.6, 0.7, 3.2, T.lime, { tileM: 2.5 }); ent.position.set(0, 5.4, -0.2); hall.add(ent);
  const rf = roofGable(17, 13, 3.2, T.tiles, 0.8); rf.position.set(0, 6.5, -4.5); hall.add(rf);
  const winGlow = glowMat(0xffc870); for (let i = 0; i < 6; i++) { if (i === 2 || i === 3) continue; const w = mesh(new THREE.PlaneGeometry(1.1, 2.0), winGlow, { shadow: false }); w.position.set(-6.2 + i * 2.5, 2.6, -0.98); hall.add(w); const fr = box(1.25, 2.15, 0.06, T.woodTeal, { tileM: 1 }); fr.position.set(-6.2 + i * 2.5, 2.6, -1.02); hall.add(fr); }
  const door = mesh(new THREE.PlaneGeometry(3.4, 3.6), glowMat(0xffd890), { shadow: false }); door.position.set(0, 2.3, -0.97); hall.add(door);
  const banner = signTex(['സംഗീതക്കച്ചേരി', '25 · VII · 1947'], { bg: '#7a1e3a', fg: '#f6e0a0', border: '#e8b93a', w: 512, h: 300 }); const bn = plane(3.6, 2.1, banner); bn.position.set(0, 5.4, 1.42); hall.add(bn);
  hall.position.set(0, 0, -4); scene.add(hall);
  // stage inside (seen through the door): musicians on a dais
  const stage = new THREE.Group(); const dais = box(4, 0.4, 2, T.wood, { tileM: 1 }); dais.position.y = 0.7; stage.add(dais); const curtain = box(5, 3.6, 0.1, null, { color: 0x8a1e3a }); curtain.position.set(0, 2.3, -1); stage.add(curtain);
  stage.position.set(0, 0, -9.5); scene.add(stage);
  // street lamps (warm practicals with halos) and a 1940s car
  const lamps = []; for (const [x, z] of [[-5, 4.5], [5, 4.5], [-9, 9], [9, 9]]) { const p = mesh(new THREE.CylinderGeometry(0.07, 0.09, 3.6, 8), col(0x2a2a30)); p.position.set(x, 1.8, z); scene.add(p);
    const bulb = mesh(new THREE.SphereGeometry(0.22, 12, 10), glowMat(0xffe0a0), { shadow: false }); bulb.position.set(x, 3.7, z); scene.add(bulb); const L = new THREE.PointLight(0xffb060, 9, 9, 1.6); L.position.set(x, 3.4, z); scene.add(L); lamps.push(L); }
  life.push((t) => lamps.forEach((L, i) => { L.intensity = 9 * (1 + 0.05 * Math.sin(t * 9 + i * 3)); }));
  const car = new THREE.Group(); const cb = box(1.9, 0.7, 4.4, null, { color: 0x1c2a3a }); cb.position.y = 0.75; car.add(cb); const cab = box(1.7, 0.75, 2.2, null, { color: 0x1c2a3a }); cab.position.set(0, 1.45, -0.3); car.add(cab);
  for (const s of [-1, 1]) { const w = mesh(new THREE.PlaneGeometry(0.05, 0.6), glowMat(0x8aa8d0)); void w; for (const z of [-1.4, 1.4]) { const wh = mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.28, 16), col(0x141414)); wh.rotation.z = Math.PI / 2; wh.position.set(s * 0.95, 0.38, z); car.add(wh); }
    const hl = mesh(new THREE.CircleGeometry(0.15, 14), glowMat(0xfff0c0), { shadow: false }); hl.position.set(s * 0.6, 0.95, 2.21); car.add(hl); const fen = box(0.3, 0.2, 1.2, null, { color: 0x1c2a3a }); fen.position.set(s * 0.95, 0.65, 1.4); car.add(fen); }
  const glass = box(1.6, 0.5, 0.05, null, { color: 0x6a8aa8 }); glass.position.set(0, 1.5, 0.82); car.add(glass); const chrome = box(1.7, 0.25, 0.08, null, { color: 0xd8d8d8 }); chrome.position.set(0, 0.6, 2.22); car.add(chrome);
  car.position.set(4.2, 0, 4.0); car.rotation.y = -0.4; scene.add(car);
  const hlL = new THREE.SpotLight(0xfff0c0, 20, 14, 0.5, 0.6, 1.2); hlL.position.set(4.2 + 0.5, 1, 6); hlL.target.position.set(0, 0, 10); scene.add(hlL, hlL.target);
  // palms silhouetted against the dusk
  const palms = []; [[-12, -2, 10], [12, -3, 9], [-16, 6, 9], [17, 5, 10], [-8, -16, 11], [9, -15, 10]].forEach(([x, z, h], i) => { const p = palm(h, 0.15 + (i % 3) * 0.08, i + 60); p.position.set(x, 0, z); scene.add(p); palms.push(p); });
  life.push((t) => palms.forEach((p) => p.userData.sway(t)));
  // evening rig: cool blue moon/sky key, warm door spill, lamps
  const key = new THREE.DirectionalLight(0x9ab0ff, 0.9); key.position.set(10, 14, 10); scene.add(key); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -15, right: 15, top: 15, bottom: -15, near: 1, far: 60 });
  scene.add(new THREE.HemisphereLight(0x7a88d8, 0x4a3a40, 0.9));
  const spill = new THREE.PointLight(0xffc070, 14, 12, 1.4); spill.position.set(0, 2.5, -2.5); scene.add(spill);
  // impact marks ("!") as 3D extruded shapes
  const bang = new THREE.Group(); const bm = new THREE.MeshLambertMaterial({ color: 0xffd23a, emissive: 0x8a5a00, emissiveIntensity: 0.6 });
  for (let i = 0; i < 3; i++) { const g = new THREE.Group(); const bar = box(0.12, 0.42, 0.1, null, { color: 0xffd23a }); bar.material = bm; bar.position.y = 0.28; g.add(bar); const dot = box(0.12, 0.12, 0.1, null); dot.material = bm; g.add(dot); g.position.set(-0.4 + i * 0.4, 0, 0); g.rotation.z = (i - 1) * -0.4; bang.add(g); }
  bang.visible = false; scene.add(bang);
  // the flying turban (3D)
  const turban = new THREE.Group(); const tb = mesh(new THREE.SphereGeometry(0.26, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), col(0xf5f1e6)); turban.add(tb); const tband = mesh(new THREE.TorusGeometry(0.25, 0.04, 8, 24), col(0xd9a521)); tband.rotation.x = Math.PI / 2; tband.position.y = 0.02; turban.add(tband);
  turban.visible = false; scene.add(turban);
  return { scene, life, car, bang, turban, hall };
}
