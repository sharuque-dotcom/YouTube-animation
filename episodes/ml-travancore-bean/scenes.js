// Travancore what-if Short, BEAN STYLE: 2D bean characters acting in inked 3D sets, one continuous camera flight.
// Shares the Malayalam narration (Anjali voice) with episodes/ml-travancore.
import { W, H, clamp, lerp, text } from '../../pipeline/engine.js';

const ML = "'Noto Malayalam'";
let drawBeanRef = null; let K = null, B = null, S = null, stage = null, camera = null, THREE = null, PROPS = null;
const ez = (x) => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };
const ezo = (x) => 1 - Math.pow(1 - clamp(x, 0, 1), 3);
const span = (t, a, d) => clamp((t - a) / d, 0, 1);
const V = (a) => new THREE.Vector3(...a);

export async function preload() {
  K = await import('../../pipeline/toon3d.js'); THREE = K.THREE; B = await import('../../pipeline/bean.js'); PROPS = B.PROPS; drawBeanRef = (g) => B.drawBean(g, 'kannan', { expr: 'smile' });
  const st = await import('../ml-bean/street.js'), sets = await import('../ml-bean/sets.js');
  S = { street: st.buildStreet(), office: sets.officeSet(), beach: sets.beachSet(), concert: sets.concertSet() };
  S.street.cards = st.radioCrowd(S.street.scene);
  buildStreetExtras(); buildBeachCast(); buildConcertCast(); buildOfficeCast();
  stage = K.makeInkStage(W, H); camera = new THREE.PerspectiveCamera(52, W / H, 0.05, 400);
  const tl = await (await fetch('/build/ml-travancore-bean/timeline.json')).json(); const m = tl.scenes.find((x) => x.id === 'main'), e = tl.scenes.find((x) => x.id === 'end');
  SH = shots({ line: (i) => m.cues[i]?.text, cue: (i) => m.start + m.cues[i].start, cueEnd: (i) => m.start + m.cues[i].end }); END0 = e.start;
}

// ------------------------------------------------------------------ actors
function actor(scene, who, x, z, y = 0, scale = 1) { const c = K.card(who, {}, { scale }); c.position.set(x, y, z); scene.add(c); return { c, who, last: '', seed: (x * 13.1 + z * 7.7) % 9, base: [x, y, z] }; }
function pose(a, o, t) {
  const blinkPh = (t + a.seed) % 3.1, blink = blinkPh < 0.12 ? 1 : 0; const o2 = { ...o, blink: o.blink ?? blink };
  if (o2.propR && typeof o2.propR === 'string') o2.propR = PROPS[o2.propR]; if (o2.propL && typeof o2.propL === 'string') o2.propL = PROPS[o2.propL];
  const key = JSON.stringify({ ...o, blink: o2.blink }); if (key !== a.last) { a.c.userData.set(o2); a.last = key; }
  const m = a.c.userData.cardMesh; m.rotation.z = Math.sin(t * 1.4 + a.seed) * 0.03 + (o.lean || 0); m.position.y = Math.abs(Math.sin(t * 2.8 + a.seed)) * 0.012 + (o.hop || 0);
}
function crowdFromCards(cards) { return cards.map((c) => ({ c, last: '', seed: (c.position.x * 13.1 + c.position.z * 7.7) % 9, base: [c.position.x, c.position.y, c.position.z] })); }

function buildStreetExtras() {
  const s = S.street, sc = s.scene; s.crowd = crowdFromCards(s.cards);
  // confetti (3D paper bits) thrown from the balconies
  s.confetti = []; const r = K.rnd(77);
  for (let i = 0; i < 90; i++) { const m = K.mesh(new THREE.PlaneGeometry(0.07, 0.05), new THREE.MeshLambertMaterial({ color: [0xc8312c, 0xf4efe4, 0xe2b13c, 0x2f8a86][i % 4], side: THREE.DoubleSide }), { shadow: false }); m.userData = { x: -3.6 + r() * 3.4, z: -6.5 + r() * 4.5, y0: 4 + r() * 2, sp: 0.6 + r() * 0.7, ph: r() * 6 }; m.visible = false; sc.add(m); s.confetti.push(m); }
  // the coin (Travancore chakram) and the postage stamp, both real 3D
  const coinT = K.paint(256, 256, (g, w, h) => { g.fillStyle = '#e8b93a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#a8761a'; g.lineWidth = 14; g.beginPath(); g.arc(w / 2, h / 2, 100, 0, 7); g.stroke(); g.fillStyle = '#a8761a'; g.beginPath(); g.ellipse(w / 2, h / 2, 34, 50, 0.3, 0, 7); g.fill(); g.font = "800 34px 'Noto Malayalam'"; g.textAlign = 'center'; g.fillText('ചക്രം', w / 2, h - 46); });
  s.coin = K.mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.04, 32), [new THREE.MeshLambertMaterial({ color: 0xc8962a }), new THREE.MeshLambertMaterial({ map: coinT }), new THREE.MeshLambertMaterial({ map: coinT })]); s.coin.visible = false; sc.add(s.coin);
  const stampT = K.paint(300, 360, (g, w, h) => { g.fillStyle = '#f4efe4'; g.fillRect(0, 0, w, h); g.fillStyle = '#1f5a7a'; g.fillRect(24, 24, w - 48, h - 48); g.fillStyle = '#f4efe4'; for (let x = 0; x < w; x += 20) { g.beginPath(); g.arc(x + 10, 0, 7, 0, 7); g.fill(); g.beginPath(); g.arc(x + 10, h, 7, 0, 7); g.fill(); } for (let y = 0; y < h; y += 20) { g.beginPath(); g.arc(0, y + 10, 7, 0, 7); g.fill(); g.beginPath(); g.arc(w, y + 10, 7, 0, 7); g.fill(); }
    g.beginPath(); g.ellipse(w / 2, 150, 46, 70, 0.3, 0, 7); g.fill(); g.font = "800 30px 'Noto Malayalam'"; g.textAlign = 'center'; g.fillText('തിരുവിതാംകൂർ', w / 2, 270); g.font = "700 34px 'Oswald'"; g.fillText('ANCHAL · 1947', w / 2, 312); });
  s.stamp = K.mesh(new THREE.BoxGeometry(0.5, 0.6, 0.01), new THREE.MeshLambertMaterial({ map: stampT })); s.stamp.visible = false; sc.add(s.stamp);
  // anchal counter: postman + a letter on a small table in front of the post office
  const tbl = K.box(1.2, 0.85, 0.6, K.stdTextures().wood, { tileM: 1 }); tbl.position.set(-3.1, 0.42, -10.6); tbl.rotation.y = Math.PI / 2; sc.add(tbl);
  s.post = actor(sc, 'postman', -2.7, -11.3); s.villager = actor(sc, 'chaya', -1.9, -10.0);
  // the Nair Brigade marching up the street
  s.soldiers = []; for (let i = 0; i < 8; i++) s.soldiers.push(actor(sc, 'soldier', (i % 2 ? 0.55 : -0.55), -13.5 - Math.floor(i / 2) * 1.4));
  s.cheer = [actor(sc, 'meenu', 2.6, -12), actor(sc, 'kannan', 2.9, -14.5), actor(sc, 'ammini', -2.8, -13.5), actor(sc, 'fisher', -3.0, -11.5)];
  // embassy row: flag poles with foreign flags + a brass plaque
  s.flags = new THREE.Group(); sc.add(s.flags);
  const flagTex = [(g, w, h) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); g.fillStyle = '#c8102e'; g.beginPath(); g.arc(w / 2, h / 2, h * 0.3, 0, 7); g.fill(); },
    (g, w, h) => { ['#0055a4', '#fff', '#ef4135'].forEach((c, i) => { g.fillStyle = c; g.fillRect(i * w / 3, 0, w / 3 + 1, h); }); },
    (g, w, h) => { ['#000', '#dd0000', '#ffce00'].forEach((c, i) => { g.fillStyle = c; g.fillRect(0, i * h / 3, w, h / 3 + 1); }); },
    (g, w, h) => { ['#009246', '#fff', '#ce2b37'].forEach((c, i) => { g.fillStyle = c; g.fillRect(i * w / 3, 0, w / 3 + 1, h); }); }];
  [[-3.3, -2.6], [-3.3, -6.2], [3.2, -4.0], [3.2, -8.0]].forEach(([x, z], i) => { const pole = K.mesh(new THREE.CylinderGeometry(0.04, 0.05, 4.4, 8), K.col(0xd8d8d8)); pole.position.set(x, 2.2, z); s.flags.add(pole);
    const fg = new THREE.PlaneGeometry(1.1, 0.72, 10, 1); fg.translate(0.55, 0, 0); const f = K.mesh(fg, new THREE.MeshLambertMaterial({ map: K.paint(150, 100, flagTex[i]), side: THREE.DoubleSide }), { shadow: false }); f.position.set(x, 4.0, z); f.rotation.y = x < 0 ? 0.4 : Math.PI - 0.4; s.flags.add(f);
    const f0 = fg.attributes.position.array.slice(); s.life = s.life || []; S.street.life.push((t) => { const a = fg.attributes.position; for (let k = 0; k < a.count; k++) { const xx = f0[k * 3]; a.setZ(k, Math.sin(xx * 5 - t * 4 + i) * 0.06 * xx); } a.needsUpdate = true; }); });
  { const pl = K.mesh(new THREE.PlaneGeometry(1.3, 0.5), new THREE.MeshLambertMaterial({ map: K.signTex(['എംബസി റോഡ്', 'EMBASSY ROW'], { bg: '#c8962a', fg: '#2a1c17', border: '#5a3018', w: 512, h: 200 }) })); pl.position.set(-3.25, 2.3, -4.4); pl.rotation.y = 1.0; s.flags.add(pl); }
  s.dips = [actor(sc, 'brit', -1.5, -9), actor(sc, 'yank', -0.7, -9.6), actor(sc, 'clerk', 0.3, -9.2)];
  // coin rain + our hero + two giants
  s.rain = []; { const r2 = K.rnd(31); for (let i = 0; i < 40; i++) { const c = s.coin.clone(); c.scale.setScalar(0.6); c.userData = { x: -2.6 + r2() * 3.4, z: -5.8 + r2() * 2.8, sp: 0.5 + r2() * 0.6, ph: r2() }; c.visible = false; sc.add(c); s.rain.push(c); } }
  s.hero = actor(sc, 'kannan', -1.0, -4.6);
  s.giants = [actor(sc, 'brit', -2.05, -4.9, 0, 2.6), actor(sc, 'yank', 0.05, -4.9, 0, 2.6)];
  // crows that take off from the wire
  s.crows = []; sc.traverse((o) => { if (o.isGroup && o.children.length === 3 && o.position.y > 7) s.crows.push(o); });
}
function buildBeachCast() {
  const b = S.beach, sc = b.scene;
  { const ft = K.paint(300, 200, (g, w, h) => { g.fillStyle = '#c8312c'; g.fillRect(0, 0, w, h); g.fillStyle = '#f4efe4'; g.beginPath(); g.ellipse(w / 2, h / 2, 34, 48, 0.3, 0, 7); g.fill(); g.strokeStyle = '#c8312c'; g.lineWidth = 6; g.beginPath(); g.arc(w / 2, h / 2, 20, 0.5, 5); g.stroke(); });
    const fg = new THREE.PlaneGeometry(2.6, 1.7, 10, 1); fg.translate(1.3, 0, 0); b.conch = K.mesh(fg, new THREE.MeshLambertMaterial({ map: ft, side: THREE.DoubleSide }), { shadow: false }); b.conch.position.set(5, 6.6, 0); b.ship.add(b.conch);
    const f0 = fg.attributes.position.array.slice(); b.life.push((t) => { const a = fg.attributes.position; for (let k = 0; k < a.count; k++) { const xx = f0[k * 3]; a.setZ(k, Math.sin(xx * 2.5 - t * 4) * 0.12 * xx); } a.needsUpdate = true; });
    b.port = new THREE.Group(); const sp = K.mesh(new THREE.PlaneGeometry(2.4, 0.9), new THREE.MeshLambertMaterial({ map: K.signTex(['കൊല്ലം തുറമുഖം', 'PORT OF KOLLAM'], { bg: '#1f4f6a', fg: '#f6e0a0', border: '#e8b93a', w: 512, h: 200 }) })); sp.position.y = 2.2; b.port.add(sp);
    for (const x of [-1, 1]) { const l = K.box(0.1, 2.2, 0.1, K.stdTextures().wood, { tileM: 1 }); l.position.set(x, 1.1, -0.06); b.port.add(l); } b.port.position.set(3.5, 0, -24); b.port.rotation.y = -0.6; sc.add(b.port); }
  b.ammini = actor(sc, 'ammini', -0.2, 0.9); b.fisher = actor(sc, 'fisher', 0.9, 0.2); b.kid = actor(sc, 'meenu', -1.0, 1.6);
  b.brit = actor(b.ship, 'brit', -1.5, 1.1, 3.8); b.yank = actor(b.ship, 'yank', 0.2, 1.1, 3.8);
}
function buildConcertCast() {
  const c = S.concert, sc = c.scene;
  c.veena = actor(sc, 'musician', -0.9, -2.35, 0.5); c.drum = actor(sc, 'drummer', 0.8, -2.35, 0.5);
  c.dewan = actor(sc, 'dewan', 0.6, -0.6); c.shadow = actor(sc, 'shadow', -5.6, 4.6);
  c.aud = [actor(sc, 'clerk', -2.6, -1.2), actor(sc, 'ammini', 2.4, -1.1), actor(sc, 'kannan', -3.3, -0.4), actor(sc, 'chaya', 3.3, -0.2), actor(sc, 'postman', 3.9, -1.2)];
}
function buildOfficeCast() {
  const o = S.office, sc = o.scene;
  o.dewan = actor(sc, 'dewan', 0, -1.75); o.clerk = actor(sc, 'clerk', -1.7, -0.7);
  // wall calendar with flying pages (25 -> 30 July)
  const pages = []; for (let d = 30; d >= 25; d--) { const tx = K.paint(220, 300, (g, w, h) => { g.fillStyle = '#f6efdc'; g.fillRect(0, 0, w, h); g.fillStyle = '#b8302a'; g.fillRect(0, 0, w, 70); g.fillStyle = '#fff'; g.font = "800 40px 'Noto Malayalam'"; g.textAlign = 'center'; g.fillText('ജൂലൈ', w / 2, 52); g.fillStyle = '#2a1c17'; g.font = "800 150px 'Oswald'"; g.fillText(String(d), w / 2, 240); });
    const m = K.mesh(new THREE.PlaneGeometry(0.62, 0.84), new THREE.MeshLambertMaterial({ map: tx, side: THREE.DoubleSide }), { shadow: false }); m.geometry.translate(0, -0.42, 0); m.position.set(o.R.w / 2 - 0.05, 2.9, 1.6); m.rotation.y = -Math.PI / 2; sc.add(m); pages.push({ m, d }); }
  o.pages = pages.reverse(); // pages[0] = 25
  { const cover = K.paint(256, 360, (g, w, h) => { g.fillStyle = '#5a1a24'; g.fillRect(0, 0, w, h); g.fillStyle = '#e8b93a'; g.textAlign = 'center'; g.font = "800 34px 'Noto Malayalam'"; g.fillText('തിരുവിതാംകൂർ', w / 2, 70); g.beginPath(); g.ellipse(w / 2, 175, 40, 58, 0.3, 0, 7); g.fill(); g.font = "700 40px 'Oswald'"; g.fillText('PASSPORT', w / 2, 300); });
    const inside = K.paint(512, 360, (g, w, h) => { g.fillStyle = '#efe6d0'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(90,26,36,.4)'; g.lineWidth = 2; for (let y = 40; y < h; y += 30) { g.beginPath(); g.moveTo(w / 2 + 20, y); g.lineTo(w - 20, y); g.stroke(); } g.fillStyle = '#c99068'; g.fillRect(40, 60, 150, 190); g.save(); g.translate(115, 330); g.scale(0.42, 0.42); drawBeanRef(g); g.restore(); g.strokeStyle = '#2a1c17'; g.lineWidth = 4; g.strokeRect(40, 60, 150, 190); });
    const stampT = K.paint(256, 256, (g, w, h) => { g.translate(w / 2, h / 2); g.rotate(-0.3); g.strokeStyle = '#1f5a7a'; g.lineWidth = 10; g.beginPath(); g.arc(0, 0, 100, 0, 7); g.stroke(); g.fillStyle = '#1f5a7a'; g.font = "800 40px 'Noto Malayalam'"; g.textAlign = 'center'; g.fillText('പ്രവേശനം', 0, -10); g.font = "700 34px 'Oswald'"; g.fillText('KOLLAM · 2026', 0, 40); });
    const pp = new THREE.Group(); const back = K.mesh(new THREE.BoxGeometry(0.3, 0.02, 0.42), new THREE.MeshLambertMaterial({ color: 0x5a1a24 })); back.position.x = 0.15; pp.add(back);
    const pages2 = K.mesh(new THREE.PlaneGeometry(0.6, 0.42), new THREE.MeshLambertMaterial({ map: inside })); pages2.rotation.x = -Math.PI / 2; pages2.position.set(0, 0.012, 0); pp.add(pages2);
    const lid = new THREE.Group(); const lidM = K.mesh(new THREE.BoxGeometry(0.3, 0.02, 0.42), [new THREE.MeshLambertMaterial({ color: 0x5a1a24 }), new THREE.MeshLambertMaterial({ color: 0x5a1a24 }), new THREE.MeshLambertMaterial({ map: cover }), new THREE.MeshLambertMaterial({ color: 0xefe6d0 }), new THREE.MeshLambertMaterial({ color: 0x5a1a24 }), new THREE.MeshLambertMaterial({ color: 0x5a1a24 })]); lidM.position.x = -0.15; lid.add(lidM); pp.add(lid);
    const st = K.mesh(new THREE.PlaneGeometry(0.2, 0.2), new THREE.MeshBasicMaterial({ map: stampT, transparent: true, depthWrite: false }), { shadow: false }); st.userData.noInk = true; st.rotation.x = -Math.PI / 2; st.position.set(0.16, 0.025, 0.02); pp.add(st);
    pp.userData.open = (u) => { lid.rotation.z = -(1 - u) * Math.PI * 0.98 + 0; lid.position.y = 0.01; }; pp.userData.stamped = (b) => { st.visible = b; };
    pp.position.set(0.05, 1.03, 0.05); o.desk.add(pp); o.passport = pp; pp.visible = false; }
}

// ------------------------------------------------------------------ camera
/** keys: [[t, pos, look, roll?, fov?]] in shot-relative seconds; first move eased out (fast-in), later segments smooth */
function camAt(keys, tt) {
  let i = 0; while (i < keys.length - 2 && tt > keys[i + 1][0]) i++;
  const [t0, p0, l0, r0 = 0, f0 = 52] = keys[i], [t1, p1, l1, r1 = r0, f1 = f0] = keys[Math.min(i + 1, keys.length - 1)];
  const u = t1 > t0 ? (i === 0 ? ezo((tt - t0) / (t1 - t0)) : ez((tt - t0) / (t1 - t0))) : 1;
  return { p: p0.map((v, k) => lerp(v, p1[k], u)), l: l0.map((v, k) => lerp(v, l1[k], u)), r: lerp(r0, r1, u), f: lerp(f0, f1, u) };
}
function place(c, t, shake = 0) {
  const n = (a, b) => Math.sin(t * a + b) * 0.5 + Math.sin(t * a * 2.3 + b * 1.7) * 0.25; // handheld drift
  camera.fov = c.f; camera.updateProjectionMatrix(); camera.position.set(c.p[0] + n(0.9, 1) * 0.02 + shake * n(40, 2) * 0.06, c.p[1] + n(0.7, 2) * 0.015 + shake * n(37, 5) * 0.05, c.p[2]);
  camera.up.set(0, 1, 0); camera.lookAt(c.l[0] + n(0.5, 3) * 0.02, c.l[1] + n(0.6, 4) * 0.015, c.l[2]); camera.rotateZ(c.r + n(0.4, 6) * 0.008 + shake * n(45, 1) * 0.02);
}
const shakeAt = (t, t0, d = 0.5) => (t >= t0 && t < t0 + d ? Math.pow(1 - (t - t0) / d, 2) : 0);

// word time inside a narration line (proportional to characters, Malayalam text)
function wt(s, i, needle) { const line = s.line(i), a = s.cue(i), b = s.cueEnd(i); const k = Math.max(0, line.indexOf(needle)); return a + (k / line.length) * (b - a); }

// ------------------------------------------------------------------ shots
function shots(s) {
  const L = (i) => s.cue(i), wNo = wt(s, 0, 'ഇല്ല'), wTrav = wt(s, 0, 'തിരുവിതാംകൂർ'), wInd = wt(s, 1, 'സ്വതന്ത്ര'), wCur = wt(s, 2, 'കറൻസി'), wSt = wt(s, 2, 'സ്റ്റാമ്പ'), wArmy = wt(s, 2, 'സൈന്യ'),
    wFuel = wt(s, 3, 'ആണവ'), wSand = wt(s, 3, 'മണൽ'), wDewan = wt(s, 4, 'ദിവാൻ'), wTvm = wt(s, 4, 'തിരുവനന്തപുരത്ത്'), wAtt = wt(s, 4, 'ആക്രമി'), wPass = wt(s, 7, 'തിരുവനന്തപുരത്ത്'), wShip = wt(s, 7, 'ശംഖു'), wOr = wt(s, 8, 'അതോ'), E0 = s.cueEnd(8) + 0.35;
  return [
    // ---- line 1: the Dewan says NO
    { set: 'office', a: 0, b: 1.9, keys: [[0, [0.15, 1.3, -0.45], [0.05, 1.0, -0.72], 0.05, 44], [0.5, [0.25, 1.55, 0.3], [0.05, 1.2, -1.2], 0.02, 48], [1.9, [0.35, 1.75, 1.3], [0, 1.55, -1.6], -0.02, 50]],
      act: (t) => { const o = S.office; pose(o.dewan, { expr: 'stern', L: 'hip', R: 'hold', look: 0.2, lookY: 1 }, t); pose(o.clerk, { expr: 'nervous', R: 'holdUp', propR: 'paper', look: 1 }, t); o.setStamp(0); o.setBanner(0); o.mark.visible = false; } },
    { set: 'office', a: 1.9, b: wNo - 0.55, keys: [[0, [1.1, 1.3, 1.4], [0.1, 1.45, -1.4], 0.04], [0.45, [0.9, 1.4, 1.1], [0.1, 1.5, -1.5], 0.03], [3, [0.7, 1.45, 0.85], [0.1, 1.55, -1.5], 0.01]],
      act: (t, tt, sh) => { const o = S.office, p = span(t, sh.a + 0.2, sh.b - sh.a); pose(o.dewan, { expr: p < 0.4 ? 'think' : 'sly', L: 'hip', R: { a: 'hold', b: 'holdUp', t: ez(p * 2) }, look: 0.6 }, t); pose(o.clerk, { expr: 'nervous', R: 'holdUp', propR: 'paper', look: 1 }, t); o.setStamp(0.5 * ez(p)); o.mark.visible = false; o.setBanner(0); } },
    { set: 'office', a: wNo - 0.55, b: wNo + 1.5, keys: [[0, [1.1, 1.75, 1.2], [0.1, 1.2, -1.0], 0.03, 48], [0.45, [0.95, 1.65, 1.0], [0.1, 1.2, -1.05], 0.0, 48], [2, [0.85, 1.7, 1.1], [0.1, 1.25, -1.05], -0.03, 50]],
      shake: wNo, act: (t) => { const o = S.office, p = 0.5 + 0.5 * span(t, wNo - 0.55, 0.55 / 0.35 * 0.5); o.setStamp(Math.min(1, t < wNo ? 0.5 + 0.2 * span(t, wNo - 0.55, 0.55) : 0.7 + 0.3 * span(t, wNo, 0.5))); void p;
        o.mark.visible = t > wNo; o.markMat.map = o.noMark; o.mark.scale.setScalar(t > wNo ? 1 + 0.3 * Math.max(0, 1 - (t - wNo) / 0.2) : 1); o.flyPapers(wNo, t);
        pose(o.dewan, { expr: t < wNo ? 'angry' : 'smug', L: 'hip', R: t < wNo ? 'holdUp' : 'hold', look: 0.4 }, t); pose(o.clerk, { expr: t < wNo ? 'nervous' : 'shock', L: t < wNo ? 'hang' : 'up', R: t < wNo ? 'holdUp' : 'up', propR: t < wNo ? 'paper' : null, hop: t > wNo && t < wNo + 0.35 ? 0.15 : 0, look: 1 }, t); o.setBanner(0); } },
    { set: 'office', a: wNo + 1.5, b: wTrav - 0.25, keys: [[0, [-1.2, 1.5, 0.5], [0, 1.45, -1.75], -0.03, 46], [0.45, [-0.9, 1.5, 0.35], [0, 1.45, -1.75], -0.02, 46], [3, [0.75, 1.55, 0.45], [0, 1.45, -1.75], 0.03, 46]],
      act: (t) => { const o = S.office; o.flyPapers(wNo, t); o.setStamp(1); o.mark.visible = true; pose(o.dewan, { expr: 'smug', L: 'cross', R: 'cross', look: (t * 0.7) % 2 > 1 ? 1 : -0.5 }, t); pose(o.clerk, { expr: 'nervous', L: 'mouth', R: 'hang', look: 1 }, t); o.setBanner(0); } },
    { set: 'office', a: wTrav - 0.25, b: L(1), keys: [[0, [0.5, 1.6, 1.4], [0.4, 1.9, -2.5], 0.02, 52], [0.45, [0.6, 1.8, 2.3], [0.5, 2.2, -2.6], 0.01, 54], [2.5, [0.7, 1.9, 2.8], [0.5, 2.3, -2.6], -0.01, 56]],
      act: (t) => { const o = S.office, u = ezo(span(t, wTrav - 0.15, 0.9)); o.setBanner(u); o.setStamp(1); o.mark.visible = true; pose(o.dewan, { expr: u > 0.5 ? 'proud' : 'smug', L: 'hip', R: u > 0.3 ? 'fist' : 'cross', look: 0.8, hop: u > 0.3 && u < 0.9 ? 0.06 : 0 }, t); pose(o.clerk, { expr: 'shock', L: 'up', R: 'up', look: 1 }, t); } },
    // ---- line 2: the radio announcement
    { set: 'street', a: L(1), b: L(1) + 2.1, keys: [[0, [-2.6, 2.0, -2.2], [-4.9, 1.72, -4.05], 0.04, 46], [0.45, [-2.9, 1.95, -2.6], [-4.9, 1.72, -4.05], 0.02, 46], [2.1, [-3.1, 1.9, -2.85], [-4.9, 1.7, -4.05], -0.01, 46]],
      act: (t) => streetCrowd(t, 'listen') },
    { set: 'street', a: L(1) + 2.1, b: wInd - 0.15, keys: [[0, [-1.6, 1.9, -1.8], [-3.8, 1.7, -4.4], 0.0, 54], [0.5, [0.9, 2.1, 1.6], [-3.9, 2.0, -4.8], 0.0, 56], [4, [1.3, 2.15, 2.2], [-3.9, 2.05, -4.8], 0.025, 56]],
      act: (t) => streetCrowd(t, 'listen') },
    { set: 'street', a: wInd - 0.15, b: wInd + 2.0, keys: [[0, [0.2, 1.7, -0.6], [-2.2, 1.45, -3.9], -0.03, 50], [0.4, [-0.1, 1.65, -1.0], [-2.2, 1.45, -3.9], -0.02, 50], [2.2, [-0.9, 1.7, -1.4], [-2.2, 1.45, -4.0], 0.03, 50]],
      act: (t) => streetCrowd(t, 'cheer', wInd) },
    { set: 'street', a: wInd + 2.0, b: wInd + 4.0, keys: [[0, [0.6, 1.8, 1.4], [-1.8, 1.8, -4], 0.02, 56], [0.5, [0.9, 1.9, 2.4], [-1.4, 3.4, -4.0], 0.05, 60], [2, [1.0, 2.0, 2.8], [-1.2, 3.6, -4.2], 0.02, 60]],
      act: (t) => streetCrowd(t, 'cheer', wInd) },
    { set: 'street', a: wInd + 4.0, b: L(2), keys: [[0, [0.6, 2.8, 4.2], [-0.6, 2.4, -6], -0.03, 56], [0.5, [0.9, 2.4, 6.6], [-0.6, 2.6, -6], -0.025, 56], [4, [0.5, 2.5, 5.4], [-0.7, 2.6, -6], 0.0, 56]],
      act: (t) => streetCrowd(t, 'cheer', wInd) },
    // ---- line 3: currency, stamps, army
    { set: 'street', a: L(2), b: wSt - 0.1, keys: [[0, [1.4, 1.5, -3.2], [-1.45, 1.7, -5.0], 0.02, 52], [0.4, [1.0, 1.55, -3.6], [-1.45, 2.2, -5.0], 0.01, 52], [2, [0.9, 1.6, -3.8], [-1.45, 2.0, -5.0], -0.02, 52]],
      act: (t, tt, sh) => { streetCrowd(t, 'calm'); const s0 = S.street, u = span(t, sh.a + 0.15, 1.3); s0.coin.visible = true; s0.coin.position.set(-0.55, 1.6 + Math.sin(u * Math.PI) * 0.9, -4.5); s0.coin.rotation.set(t * 14, 0, 0.3); s0.stamp.visible = false; } },
    { set: 'street', a: wSt - 0.1, b: wArmy - 0.1, keys: [[0, [0.6, 1.8, -7.6], [-2.9, 1.4, -10.8], 0.03, 50], [0.45, [0.1, 1.7, -8.2], [-2.9, 1.45, -10.8], 0.02, 50], [2, [-0.1, 1.7, -8.5], [-2.9, 1.5, -10.8], -0.01, 50]],
      act: (t, tt, sh) => { const s0 = S.street, u = ezo(span(t, sh.a + 0.35, 0.5)); s0.coin.visible = false; pose(s0.post, { expr: u > 0.5 ? 'proud' : 'stern', R: u > 0.1 ? 'hold' : 'holdUp', propR: 'stamp', look: -0.5 }, t); pose(s0.villager, { expr: u > 0.5 ? 'beam' : 'think', L: 'chin', look: -1 }, t);
        s0.stamp.visible = u > 0; s0.stamp.position.set(-2.6, 1.0 + u * 1.0, -10.6 + u * 0.5); s0.stamp.rotation.set(-0.2, 0.9 + (1 - u) * 3, (1 - u) * 0.6); s0.stamp.scale.setScalar(0.2 + 0.8 * u); } },
    { set: 'street', a: wArmy - 0.1, b: L(3), keys: [[0, [0.9, 0.9, -6.0], [0, 1.5, -14], 0.0, 52], [0.45, [0.6, 0.95, -7.0], [0, 1.55, -14], 0.02, 52], [2.4, [0.5, 1.0, -7.6], [0, 1.6, -14], -0.02, 52]],
      act: (t, tt, sh) => { const s0 = S.street; s0.stamp.visible = false; s0.soldiers.forEach((a, i) => { const z = a.base[2] + (t - sh.a) * 1.3; a.c.position.z = z; pose(a, { expr: i % 3 ? 'stern' : 'proud', L: 'march', R: 'rifle', propR: 'rifle', walk: ((t * 1.3) + (i % 2) * 0.5) % 1 }, t); });
        s0.cheer.forEach((a, i) => pose(a, { expr: ['beam', 'grin', 'smug', 'laugh'][i], R: 'wave', L: i % 2 ? 'up' : 'hang', look: i < 2 ? -1 : 1, hop: Math.max(0, Math.sin(t * 7 + i)) * 0.06 }, t)); } },
    // ---- line 4: thorium sand, the world is watching
    { set: 'beach', a: L(3), b: wFuel - 0.1, keys: [[0, [3.5, 5.2, -33], [9, 4.6, -45], 0.03, 44], [0.45, [5.0, 5.0, -36.5], [9.5, 4.7, -45.5], 0.02, 44], [2.5, [5.6, 4.9, -37.5], [9.6, 4.7, -45.5], -0.01, 44]],
      act: (t) => { beachCast(t, 'watch'); S.beach.setGlow(0, t); } },
    { set: 'beach', a: wFuel - 0.1, b: wSand - 0.2, iris: true, keys: [[0, [0.25, 0.32, 1.75], [0, 0.05, 0.6], 0.0, 48], [0.45, [0.2, 0.42, 2.0], [0, 0.08, 0.6], 0.03, 48], [2.5, [0.1, 0.55, 2.3], [0, 0.1, 0.6], 0.05, 48]],
      act: (t, tt, sh) => { beachCast(t, 'watch'); S.beach.setGlow(ez(span(t, sh.a + 0.2, 0.8)), t); } },
    { set: 'beach', a: wSand - 0.2, b: wSand + 1.9, keys: [[0, [0.5, 0.9, 2.8], [-0.2, 1.0, 0.6], 0.0, 52], [0.45, [1.2, 1.55, 4.4], [-0.3, 1.25, 0.5], 0.02, 54], [2.2, [1.0, 1.65, 4.9], [-0.3, 1.3, 0.5], -0.02, 54]],
      act: (t) => { beachCast(t, 'glow'); S.beach.setGlow(1, t); } },
    { set: 'beach', a: wSand + 1.9, b: L(4), keys: [[0, [3.0, 2.0, 5.2], [-0.3, 1.2, -1], 0.03, 54], [0.5, [3.4, 2.4, 6.4], [-0.4, 1.3, -2], 0.02, 54], [3, [1.8, 2.7, 7.4], [0, 1.6, -6], -0.02, 54]],
      act: (t) => { beachCast(t, 'wave'); S.beach.setGlow(1, t); } },
    // ---- line 5: the concert, the attack (25 July 1947, evening)
    { set: 'concert', a: L(4), b: wDewan - 0.15, keys: [[0, [-1.8, 4.4, 4.6], [0, 4.6, -2.6], -0.04, 54], [0.45, [-1.0, 4.4, 4.2], [0, 4.5, -2.6], -0.02, 54], [2.2, [0.9, 4.2, 4.0], [0, 4.3, -2.6], 0.02, 54]],
      act: (t) => concertCast(t, 'play') },
    { set: 'concert', a: wDewan - 0.15, b: wTvm - 0.1, keys: [[0, [1.6, 2.2, 2.2], [0.6, 1.7, -0.6], 0.03, 44], [0.45, [1.2, 1.75, 1.3], [0.6, 1.6, -0.6], 0.02, 44], [3, [1.0, 1.75, 1.0], [0.6, 1.6, -0.6], -0.02, 44]],
      nameplate: true, act: (t) => concertCast(t, 'clap') },
    { set: 'concert', a: wTvm - 0.1, b: wAtt - 1.9, keys: [[0, [-3.0, 2.2, 3.6], [0, 1.5, -2.6], -0.03, 54], [0.5, [-2.2, 1.9, 2.6], [0, 1.5, -2.6], -0.02, 54], [3, [-1.4, 1.95, 2.8], [0.2, 1.5, -2.6], 0.02, 54]],
      act: (t) => concertCast(t, 'play') },
    { set: 'concert', a: wAtt - 1.9, b: wAtt - 0.3, keys: [[0, [-6.4, 1.5, 7.6], [-1, 1.4, 1.6], 0.02, 52], [0.45, [-6.0, 1.6, 7.2], [-0.5, 1.4, 1.6], 0.01, 52], [2, [-5.7, 1.6, 7.0], [0, 1.4, 1.8], -0.02, 52]],
      act: (t, tt, sh) => concertCast(t, 'leave', sh.a) },
    { set: 'concert', a: wAtt - 0.3, b: L(5), shake: wAtt + 0.1, keys: [[0, [3.4, 1.7, 6.0], [1.5, 1.4, 2.6], 0.06, 50], [0.3, [2.6, 1.6, 5.0], [1.2, 1.45, 2.4], 0.04, 50], [2, [2.3, 1.7, 4.8], [1.2, 1.5, 2.4], -0.03, 50]],
      act: (t, tt, sh) => concertCast(t, 'attack', sh.a, wAtt) },
    // ---- line 6: within days, YES
    { set: 'office', a: L(5), b: L(5) + 2.3, keys: [[0, [2.2, 2.4, 2.3], [4.5, 2.5, 1.6], 0.03, 48], [0.45, [2.7, 2.5, 1.9], [4.5, 2.5, 1.6], 0.02, 48], [2.3, [2.9, 2.5, 1.8], [4.5, 2.5, 1.6], -0.01, 48]],
      act: (t, tt, sh) => { const o = S.office; o.pages.forEach((p, i) => { const k = sh.a + 0.25 + i * 0.32, u = span(t, k, 0.6); p.m.visible = i === 5 || u < 1; p.m.rotation.set(0, -Math.PI / 2, 0); p.m.position.set(o.R.w / 2 - 0.05 - u * 1.2, 2.9 + u * 0.8 - u * u * 1.5, 1.6 + u * 0.6); p.m.rotation.x = u * 3; p.m.rotation.z = u * 1.5; });
        o.dewan.c.visible = false; pose(o.clerk, { expr: 'nervous', look: 1, R: 'hang' }, t); o.setBanner(1); o.mark.visible = true; o.markMat.map = o.noMark; } },
    { set: 'office', a: L(5) + 2.3, b: L(6), shake: L(5) + 2.3 + 0.75, keys: [[0, [0.75, 1.5, 0.5], [0.12, 1.05, -0.7], -0.03, 46], [0.45, [0.6, 1.45, 0.3], [0.12, 1.02, -0.72], 0.0, 46], [3, [0.7, 1.75, 1.5], [0.1, 1.3, -1.2], 0.02, 50]],
      act: (t, tt, sh) => { const o = S.office, ts = sh.a + 0.75; o.dewan.c.visible = false; o.clerk.c.position.set(0.15, 0, -1.55); o.setStamp(t < ts ? 0.5 + 0.2 * span(t, sh.a, 0.75) : 0.7 + 0.3 * span(t, ts, 0.5));
        o.markMat.map = t > ts ? o.yesMark : o.noMark; o.mark.scale.setScalar(t > ts ? 1 + 0.3 * Math.max(0, 1 - (t - ts) / 0.2) : 1); o.setBanner(1 - ezo(span(t, ts + 0.6, 1.2)));
        pose(o.clerk, { expr: t < ts ? 'nervous' : 'beam', R: t < ts ? 'holdUp' : 'hold', L: 'hip', look: 0.5 }, t); o.pages.forEach((p) => { p.m.visible = p.d === 30; p.m.position.set(o.R.w / 2 - 0.05, 2.9, 1.6); p.m.rotation.set(0, -Math.PI / 2, 0); }); } },
    // ---- line 7: rewind. What if the plan had worked?
    { set: 'office', a: L(6), b: L(7), rewind: true, keys: [[0, [0.9, 1.9, 2.2], [0, 1.6, -1.75], 0.04, 52], [0.4, [0.6, 1.7, 1.4], [0, 1.55, -1.75], 0.0, 50], [2.5, [0.45, 1.65, 1.15], [0, 1.55, -1.75], -0.02, 48]],
      act: (t, tt, sh) => { const o = S.office, u = span(t, sh.a, 0.6); o.dewan.c.visible = u > 0.5; o.clerk.c.position.set(-1.7, 0, -0.7); o.markMat.map = u > 0.5 ? o.noMark : o.yesMark; o.mark.visible = true; o.setStamp(0); o.setBanner(ezo(span(t, sh.a + 0.4, 0.8))); o.passport.visible = false;
        o.pages.forEach((p) => { p.m.visible = p.d === 25; p.m.position.set(o.R.w / 2 - 0.05, 2.9, 1.6); p.m.rotation.set(0, -Math.PI / 2, 0); });
        pose(o.dewan, { expr: u < 0.9 ? 'shock' : 'sly', L: 'hip', R: 'chin', look: 0.5, hop: u > 0.5 && u < 0.9 ? 0.1 : 0 }, t); pose(o.clerk, { expr: 'shock', L: 'up', R: 'up', look: 1 }, t); } },
    // ---- line 8: passport, embassies, ships
    { set: 'office', a: L(7), b: wPass, keys: [[0, [0.45, 2.0, 0.3], [0.05, 1.0, -0.8], 0.04, 46], [0.4, [0.3, 1.85, 0.0], [0.05, 1.0, -0.8], 0.02, 46], [3, [0.35, 1.95, 0.15], [0.05, 1.05, -0.85], -0.02, 48]],
      shake: L(7) + 1.4, act: (t, tt, sh) => { const o = S.office, u = ezo(span(t, sh.a + 0.1, 0.6)); o.dewan.c.visible = true; o.letter.visible = false; o.passport.visible = true; o.passport.userData.open(u); o.setStamp(t < sh.a + 1.4 ? 0.5 + 0.2 * span(t, sh.a + 0.7, 0.7) : 0.7 + 0.3 * span(t, sh.a + 1.4, 0.5), undefined, new THREE.Vector3(0.18, 1.1, 0.1)); o.mark.visible = false; o.passport.userData.stamped(t > sh.a + 1.4);
        pose(o.dewan, { expr: 'proud', L: 'hip', R: 'hold', look: 0.4 }, t); pose(o.clerk, { expr: 'beam', L: 'clap', R: 'clap', look: 1 }, t); } },
    { set: 'street', a: wPass, b: wShip - 0.1, keys: [[0, [1.6, 2.6, 1.0], [-2.4, 3.2, -6], 0.03, 54], [0.45, [1.3, 2.2, 0.3], [-2.4, 2.8, -6], 0.02, 54], [3.5, [0.9, 2.0, -1.2], [-2.4, 2.6, -7], -0.02, 54]],
      act: (t, tt, sh) => { streetCrowd(t, 'calm'); const s0 = S.street; s0.flags.visible = true; s0.dips.forEach((a, i) => { a.c.visible = true; a.c.position.z = a.base[2] + (t - sh.a) * 0.9; pose(a, { expr: ['proud', 'grin', 'smile'][i], L: 'hip', R: i === 1 ? 'wave' : 'hold', walk: (t * 1.4 + i * 0.3) % 1, look: 0.5 }, t); }); } },
    { set: 'beach', a: wShip - 0.1, b: L(8), keys: [[0, [3.0, 3.2, -27], [11.5, 5.5, -44], 0.03, 54], [0.5, [5.0, 3.8, -30], [12.5, 6.0, -45], 0.02, 54], [4, [6.0, 4.0, -32], [12.5, 6.2, -45], -0.02, 54]],
      act: (t) => { const b = S.beach; b.conch.visible = true; b.port.visible = true; beachCast(t, 'wave'); pose(b.brit, { expr: 'beam', R: 'wave', L: 'hip', look: -1 }, t); pose(b.yank, { expr: 'grin', L: 'wave', R: 'hip', look: -1 }, t); b.setGlow(0, t); } },
    // ---- line 9: rich like Singapore? Or squeezed between giants?
    { set: 'street', a: L(8), b: wOr - 0.1, keys: [[0, [0.4, 1.5, -2.0], [-1.0, 1.55, -5], 0.03, 50], [0.45, [0.2, 1.6, -2.6], [-1.0, 1.7, -5], 0.02, 50], [2.5, [0.1, 1.65, -2.9], [-1.0, 1.75, -5], -0.02, 50]],
      act: (t, tt, sh) => { const s0 = S.street; streetCrowd(t, 'cheer', sh.a); s0.flags.visible = true; s0.rain.forEach((c, i) => { const d = c.userData, u = (t - sh.a) * d.sp + d.ph; c.visible = true; c.position.set(d.x, 4.5 - (u % 1) * 4.5, d.z); c.rotation.set(t * 6 + i, t * 3, 0); }); pose(s0.hero, { expr: 'laugh', L: 'up', R: 'up', look: -0.3, hop: Math.max(0, Math.sin(t * 8)) * 0.12 }, t); s0.hero.c.visible = true; s0.giants.forEach((g) => { g.c.visible = false; }); } },
    { set: 'street', a: wOr - 0.1, b: E0, keys: [[0, [0.3, 1.8, -1.0], [-1.0, 1.9, -5], -0.04, 56], [0.45, [0.2, 1.9, -0.6], [-1.0, 2.2, -5], -0.03, 58], [2.5, [0.15, 1.95, -0.4], [-1.0, 2.3, -5], 0.01, 58]],
      act: (t, tt, sh) => { const s0 = S.street; streetCrowd(t, 'calm'); s0.flags.visible = true; s0.rain.forEach((c) => { c.visible = false; }); s0.hero.c.visible = true; const sq = ezo(span(t, sh.a + 0.2, 1.2));
        pose(s0.hero, { expr: sq > 0.5 ? 'nervous' : 'shock', L: 'hang', R: 'hang', look: (t * 2) % 2 > 1 ? 1 : -1, lean: 0 }, t); s0.hero.c.userData.cardMesh.scale.x = 1 - sq * 0.35;
        s0.giants.forEach((g, i) => { g.c.visible = true; g.c.position.x = lerp(i ? 2.6 : -4.6, i ? 0.05 : -2.05, sq); pose(g, { expr: 'smug', L: i ? 'hip' : 'cross', R: i ? 'cross' : 'hip', look: i ? -1 : 1 }, t); }); } },
    // ---- end: part 2, follow
    { set: 'street', a: E0, b: E0 + 8, keys: [[0, [0.2, 1.9, 0.5], [-1.0, 2.0, -5], 0.02, 54], [0.6, [0.9, 2.4, 6.0], [-0.6, 2.6, -6], -0.02, 56], [6, [0.4, 3.4, 8.5], [-0.4, 3.8, -20], 0.0, 58]],
      endcard: true, act: (t, tt, sh) => { const s0 = S.street; streetCrowd(t, 'cheer', sh.a - 0.5); s0.hero.c.visible = false; s0.giants.forEach((g) => { g.c.visible = false; }); s0.flags.visible = true; s0.rain.forEach((c) => { c.visible = false; }); } },
  ].reduce((out, x) => { const prev = out[out.length - 1]; if (prev) { x.a = Math.max(x.a, prev.a + 0.5); prev.b = x.a; } out.push(x); return out; }, []).filter((x) => x.b - x.a > 0.35);
}

function defaults(name) {
  if (name === 'street') { const s0 = S.street; s0.flags.visible = false; s0.dips.forEach((a) => { a.c.visible = false; }); s0.rain.forEach((c) => { c.visible = false; }); s0.hero.c.visible = false; s0.hero.c.userData.cardMesh.scale.x = 1; s0.giants.forEach((g) => { g.c.visible = false; }); }
  if (name === 'office') { const o = S.office; o.passport.visible = false; o.letter.visible = true; o.dewan.c.visible = true; o.clerk.c.position.set(-1.7, 0, -0.7); o.pages.forEach((p) => { p.m.visible = p.d === 25; }); }
  if (name === 'beach') { S.beach.conch.visible = false; S.beach.port.visible = false; }
}
function streetCrowd(t, mode, t0 = 0) {
  const s = S.street, cheer = mode === 'cheer' && t > t0;
  const E = { listen: ['think', 'smug', 'nervous', 'think', 'neutral', 'think', 'nervous', 'smile', 'think'], cheer: ['beam', 'proud', 'laugh', 'beam', 'beam', 'grin', 'shock', 'beam', 'laugh'], calm: ['smile', 'smug', 'grin', 'smile', 'beam', 'think', 'smile', 'smile', 'grin'] }[cheer ? 'cheer' : mode === 'cheer' ? 'listen' : mode];
  s.crowd.forEach((a, i) => { const ph = (t * 0.6 + i * 0.37) % 1, swap = cheer && ph > 0.5; const arms = cheer ? [['up', 'fist'], ['hip', 'wave'], ['up', 'up'], ['wave', 'holdUp'], ['up', 'up'], ['hang', 'wave'], ['mouth', 'mouth'], ['wave', 'up'], ['up', 'wave']][i] : [[{ a: 'point', b: 'up', t: 0.3 }, 'hip'], ['cross', 'chin'], ['hang', 'hold'], ['hang', 'holdUp'], ['hang', 'chin'], ['hang', 'chin'], ['mouth', 'hang'], ['hold', 'hang'], ['hip', 'chin']][i];
    const props = [null, null, 'fish', 'glass', i === 4 ? 'flag' : null, null, null, null, null];
    pose(a, { expr: swap && E[i] === 'beam' ? 'laugh' : E[i], L: swap ? arms[1] : arms[0], R: swap ? arms[0] : arms[1], propR: i === 4 && cheer ? 'flag' : props[i] && i !== 4 ? props[i] : null, look: -1, lookY: cheer ? -0.5 : 0, hop: cheer ? Math.max(0, Math.sin(t * 8 + i * 1.3)) * (i === 4 ? 0.22 : 0.08) : 0, lean: mode === 'listen' ? 0.06 : 0 }, t); });
  // confetti falls after the cheer
  s.confetti.forEach((m) => { const d = m.userData, u = t - t0 - 0.2; m.visible = cheer && u > 0 && u < 6; if (!m.visible) return; m.position.set(d.x + Math.sin(u * 2 + d.ph) * 0.3, d.y0 - u * d.sp * 1.2, d.z); m.rotation.set(u * 4 + d.ph, u * 3, u * 5); });
  s.crows.forEach((c, i) => { const u = cheer ? Math.max(0, t - t0 - 0.3 - i * 0.15) : 0; if (!c.userData.home) c.userData.home = c.position.clone(); c.position.copy(c.userData.home).add(new THREE.Vector3(u * 2.2, u * 1.6 + Math.sin(u * 20) * 0.05 * Math.min(1, u * 5), -u * 1.5)); });
  s.coin.visible = false; s.stamp.visible = false;
}
function beachCast(t, mode) {
  const b = S.beach, glow = mode !== 'watch';
  pose(b.ammini, { expr: glow ? (mode === 'wave' ? 'proud' : 'beam') : 'smug', R: glow ? 'holdUp' : 'hip', propR: glow ? 'sand' : null, L: mode === 'wave' ? 'wave' : 'hip', look: mode === 'wave' ? -1 : 0.3 }, t);
  pose(b.fisher, { expr: glow ? 'shock' : 'think', L: glow ? 'mouth' : 'hang', R: glow ? 'up' : 'chin', look: -0.8 }, t);
  pose(b.kid, { expr: glow ? 'beam' : 'smile', R: 'point', L: 'hang', look: 1, hop: glow ? Math.max(0, Math.sin(t * 7)) * 0.1 : 0 }, t);
  pose(b.brit, { expr: glow ? 'shock' : 'sly', R: 'scope', propR: 'scope', L: 'hip', look: -1 }, t); pose(b.yank, { expr: glow ? 'shock' : 'think', L: 'chin', R: 'point', look: -1 }, t);
}
function concertCast(t, mode, t0 = 0, tAtt = 1e9) {
  const c = S.concert, plays = (t * 2.2) % 1 > 0.5;
  pose(c.veena, { expr: 'smile', R: 'hold', propR: 'veena', L: plays ? 'hold' : 'clap', look: 0.3 }, t); pose(c.drum, { expr: plays ? 'beam' : 'grin', L: plays ? 'clap' : 'hold', R: plays ? 'hold' : 'clap', look: -0.3 }, t);
  c.aud.forEach((a, i) => pose(a, { expr: t > tAtt ? 'shock' : ['smile', 'beam', 'grin', 'smile', 'proud'][i], L: t > tAtt ? 'mouth' : 'clap', R: t > tAtt ? 'up' : 'clap', look: t > tAtt ? 1 : (i % 2 ? -0.5 : 0.5), hop: t > tAtt ? Math.max(0, Math.sin(t * 9 + i)) * 0.08 : 0 }, t));
  c.bang.visible = false; c.turban.visible = false;
  if (mode === 'play' || mode === 'clap') { c.dewan.c.position.set(0.6, 0, -0.6); c.shadow.c.visible = false; pose(c.dewan, { expr: mode === 'clap' ? 'proud' : 'smile', L: 'clap', R: 'clap', look: -0.4 }, t); return; }
  // leaving towards the car, the shadow lurks by the lamp post
  const u = span(t, t0, 3.2); c.dewan.c.position.set(lerp(0.6, 2.4, u), 0, lerp(-0.6, 2.2, u)); c.shadow.c.visible = true;
  if (mode === 'leave') { pose(c.dewan, { expr: 'smile', L: 'wave', R: 'hang', walk: (t * 1.6) % 1, look: -0.6 }, t); c.shadow.c.position.set(-5.6, 0, 4.6); pose(c.shadow, { lean: 0.12 }, t); return; }
  // attack: the shadow dashes in, the turban flies, shock everywhere
  const d = span(t, tAtt - 0.45, 0.45), hit = t > tAtt, dp = c.dewan.c.position;
  c.shadow.c.position.set(lerp(-1.2, dp.x - 0.55, ezo(d)), 0, lerp(3.8, dp.z + 0.2, ezo(d))); pose(c.shadow, { R: hit ? 'out' : 'point', lean: hit ? -0.25 : -0.12 }, t);
  pose(c.dewan, { expr: hit ? 'shock' : 'smile', noHat: hit, L: hit ? 'up' : 'wave', R: hit ? 'up' : 'hang', look: hit ? -1 : -0.6, hop: hit && t < tAtt + 0.3 ? 0.12 : 0, lean: hit ? 0.18 : 0 }, t);
  c.bang.visible = hit; if (hit) { const k = t - tAtt; c.bang.position.set(dp.x, 2.45 + Math.min(0.2, k), dp.z + 0.3); c.bang.scale.setScalar(Math.min(1, k * 6)); c.bang.lookAt(camera.position); }
  c.turban.visible = hit; if (hit) { const k = t - tAtt; c.turban.position.set(dp.x + k * 1.4, 1.95 + k * 3.2 - k * k * 4.9, dp.z + k * 0.6); if (c.turban.position.y < 0.15) c.turban.position.y = 0.15; c.turban.rotation.set(k * 6, k * 2, k * 4); }
}

// ------------------------------------------------------------------ rendering
function renderShot(g, sh, t, alpha = 1) {
  const set = S[sh.set]; const tt = t - sh.a; set.life.forEach((f) => f(t)); defaults(sh.set); sh.act(t, tt, sh);
  if (sh.set === 'street' && sh.act.toString().indexOf('streetCrowd') < 0) { /* crowd keeps idling */ }
  const c = camAt(sh.keys, tt); place(c, t, sh.shake != null ? shakeAt(t, sh.shake, 0.5) : 0); camera.updateMatrixWorld();
  const look = new THREE.Vector3(...c.l), focus = camera.position.distanceTo(look);
  const night = sh.set === 'concert';
  const cv = stage.render(set.scene, camera, { focus, aperture: night ? 7 : 6, hazeAmt: night ? 0.15 : 0.3, haze: night ? 0x5a5a9a : 0xdfe9f2, sat: night ? 1.12 : 1.1, contrast: 0.06, lift: night ? 0.03 : 0.015, warm: night ? -0.01 : 0.02, vignette: 0.3 });
  g.save(); g.globalAlpha = alpha; g.drawImage(cv, 0, 0, W, H); g.restore();
  if (sh.iris) iris(g, alpha);
  if (sh.rewind) rewindFx(g, t, sh.a, alpha);
  if (sh.endcard) endcard(g, t, sh.a, alpha);
  if (sh.nameplate) nameplate(g, t, sh.a + 0.3, alpha);
}
function rewindFx(g, t, a0, alpha) { const u = span(t, a0, 0.7); if (u >= 1) return; g.save(); g.globalAlpha = alpha * (1 - u) * 0.9; g.fillStyle = 'rgba(40,60,140,0.25)'; g.fillRect(0, 0, W, H);
  for (let y = (t * 900) % 24; y < H; y += 24) { g.fillStyle = 'rgba(255,255,255,0.06)'; g.fillRect(0, y, W, 3); } g.fillStyle = '#fff'; g.font = "800 150px 'Oswald'"; g.textAlign = 'center'; g.fillText('◀◀', W / 2, H * 0.62); g.restore(); }
function endcard(g, t, a0, alpha) { const p = ezo(span(t, a0 + 0.6, 0.5)); if (p > 0) { g.save(); g.globalAlpha = alpha; g.translate(W / 2, 640); g.scale(p, p); g.fillStyle = '#f4ecd6'; g.strokeStyle = '#2a1c17'; g.lineWidth = 8; g.beginPath(); g.roundRect(-260, -120, 520, 240, 24); g.fill(); g.stroke(); g.fillStyle = '#c8312c'; g.fillRect(-260, -120, 520, 18);
    text(g, 'ഭാഗം', 0, -30, { font: ML, weight: 800, size: 64, color: '#8a1e1e', align: 'center' }); text(g, '2', 0, 90, { font: "'Oswald'", weight: 700, size: 120, color: '#2a1c17', align: 'center' }); g.restore(); }
  const tap = a0 + 3.0, q = ezo(span(t, a0 + 2.0, 0.4)); if (q <= 0) return; const pr = t > tap && t < tap + 0.25 ? 0.9 : 1, done = t > tap + 0.2;
  g.save(); g.globalAlpha = alpha; g.translate(W / 2, 1560); g.scale(q * pr, q * pr); g.fillStyle = done ? '#3a3350' : '#ff2f45'; g.strokeStyle = '#120c0a'; g.lineWidth = 6; g.beginPath(); g.roundRect(-250, -70, 500, 140, 70); g.fill(); g.stroke();
  text(g, done ? 'FOLLOWING ✓' : 'FOLLOW', 0, 20, { font: "'Oswald'", weight: 700, size: 64, color: '#fff', align: 'center' }); g.restore();
  if (t > tap - 0.6 && t < tap + 0.5) { const hx = W / 2 + 120 + (1 - span(t, tap - 0.6, 0.6)) * 160, hy = 1600 + (1 - span(t, tap - 0.6, 0.6)) * 120; g.save(); g.globalAlpha = alpha; g.fillStyle = '#fff'; g.strokeStyle = '#120c0a'; g.lineWidth = 6; g.beginPath(); g.ellipse(hx, hy, 34, 46, -0.4, 0, 7); g.fill(); g.stroke(); g.restore(); } }
function iris(g, a) { // look-through telescope: brass ring + dark outside
  g.save(); g.globalAlpha = a; g.fillStyle = '#1a120e'; g.beginPath(); g.rect(0, 0, W, H); g.arc(W / 2, H * 0.46, 470, 0, Math.PI * 2, true); g.fill('evenodd');
  g.strokeStyle = '#c8962a'; g.lineWidth = 34; g.beginPath(); g.arc(W / 2, H * 0.46, 470, 0, 7); g.stroke(); g.strokeStyle = '#2a1c17'; g.lineWidth = 6; g.beginPath(); g.arc(W / 2, H * 0.46, 452, 0, 7); g.stroke(); g.beginPath(); g.arc(W / 2, H * 0.46, 488, 0, 7); g.stroke(); g.restore();
}
function nameplate(g, t, a0, alpha) {
  const p = ezo(span(t, a0, 0.35)); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 1500 + (1 - p) * 40);
  g.fillStyle = '#f4ecd6'; g.strokeStyle = '#2a1c17'; g.lineWidth = 7; g.beginPath(); g.roundRect(-400, -78, 800, 156, 18); g.fill(); g.stroke();
  g.fillStyle = '#8a1e1e'; g.fillRect(-400, -78, 800, 14);
  text(g, 'ദിവാൻ', 0, -16, { font: ML, weight: 800, size: 40, color: '#8a1e1e', align: 'center' }); text(g, 'സി.പി. രാമസ്വാമി അയ്യർ', 0, 50, { font: ML, weight: 800, size: 56, color: '#2a1c17', align: 'center' }); g.restore();
}

// captions: 1-2 words, white with a thick dark outline, centred low, 88->100% pop
function captions(g, s) {
  const t = s.t; let li = -1; for (let i = 0; s.line(i); i++) if (t >= s.cue(i) - 0.05 && t < s.cueEnd(i) + 0.15) li = i; if (li < 0) return;
  const words = s.line(li).split(/\s+/), a = s.cue(li), b = s.cueEnd(li), tot = words.reduce((x, w) => x + w.length + 2, 0); let acc = 0;
  const ws = words.map((w) => { const t0 = a + (acc / tot) * (b - a); acc += w.length + 2; return [w, t0]; });
  const chunks = []; for (let i = 0; i < ws.length;) { const n = ws[i][0].length > 9 || (ws[i + 1] && ws[i + 1][0].length > 9) ? 1 : 2; chunks.push(ws.slice(i, i + n)); i += n; }
  let k = 0; while (k + 1 < chunks.length && t >= chunks[k + 1][0][1]) k++;
  const str = chunks[k].map(([w]) => w).join(' '), p = ezo(span(t, chunks[k][0][1], 0.12)), sc = 0.88 + 0.12 * p;
  g.save(); g.translate(W / 2, 300); g.scale(sc, sc); g.font = `800 92px ${ML}`; const fsz = Math.min(92, 92 * 940 / (g.measureText(str).width + 1)); g.font = `800 ${fsz}px ${ML}`;
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineWidth = fsz * 0.22; g.strokeStyle = '#120c0a'; g.strokeText(str, 0, 0); g.fillStyle = '#ffffff'; g.fillText(str, 0, 0); g.restore();
}

let SH = null;
let MAIN = null;
function main(g, s) {
  const t = s.t; draw(g, t); captions(g, s);
}
function draw(g, t) { let i = SH.findIndex((x) => t >= x.a && t < x.b); if (i < 0) i = t < SH[0].a ? 0 : SH.length - 1;
  const sh = SH[i], prev = SH[i - 1], XF = 0.3; // moving dissolve between different sets (both shots keep moving)
  if (prev && prev.set !== sh.set && t < sh.a + XF) { renderShot(g, prev, t); renderShot(g, sh, t, ez((t - sh.a) / XF)); }
  else renderShot(g, sh, t);
}
function end(g, s) { draw(g, s.t + END0); captions(g, s); }
let END0 = 53.5;
export const scenes = { main, end };
export const hits = [];
export const extraHits = (timeline) => {
  const m = timeline.scenes.find((x) => x.id === 'main'), out = []; const s = { line: (i) => m.cues[i]?.text, cue: (i) => m.cues[i].start, cueEnd: (i) => m.cues[i].end };
  const sh = shots(s); sh.forEach((x, i) => { if (i && sh[i - 1].set !== x.set) out.push({ t: m.start + x.a - 0.2, kind: 'whoosh', vol: 0.22 }); else if (i % 2) out.push({ t: m.start + x.a - 0.1, kind: 'whoosh', vol: 0.1 }); });
  const at = (i, n) => m.start + wt(s, i, n);
  out.push({ t: at(0, 'ഇല്ല'), kind: 'boom', vol: 0.55 }, { t: at(1, 'സ്വതന്ത്ര'), kind: 'pop', vol: 0.5 }, { t: at(2, 'കറൻസി'), kind: 'tick', vol: 0.5 }, { t: at(2, 'സ്റ്റാമ്പ') + 0.35, kind: 'hit', vol: 0.4 }, { t: at(3, 'ആണവ') + 0.3, kind: 'pop', vol: 0.4 }, { t: at(4, 'ആക്രമി') + 0.1, kind: 'boom', vol: 0.6 }, { t: m.start + m.cues[5].start + 3.05, kind: 'boom', vol: 0.45 });
  for (let k = 0; k < 6; k++) out.push({ t: m.start + m.cues[5].start + 0.25 + k * 0.32, kind: 'tick', vol: 0.35 });
  return out;
};
void H;
