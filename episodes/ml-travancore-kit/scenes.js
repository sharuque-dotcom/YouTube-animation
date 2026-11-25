// Travancore Short v2 ("the kingdom that said NO"), rebuilt on the ricksclips kit formula:
// hook + snapback, "you see", mockery joke, escalation, "wait...?", twist, everyday analogy, spectacle, callback ending.
// Bean characters acting in inked 3D sets (reuses episodes/ml-bean sets), one continuous camera flight.
import { W, H, clamp, lerp, text } from '../../pipeline/engine.js';

const ML = "'Noto Malayalam'";
let K = null, B = null, S = null, stage = null, camera = null, THREE = null, PROPS = null;
const ez = (x) => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };
const ezo = (x) => 1 - Math.pow(1 - clamp(x, 0, 1), 3);
const span = (t, a, d) => clamp((t - a) / d, 0, 1);
const V = (a) => new THREE.Vector3(...a);

export async function preload() {
  K = await import('../../pipeline/toon3d.js'); THREE = K.THREE; B = await import('../../pipeline/bean.js'); PROPS = B.PROPS;
  const st = await import('../ml-bean/street.js'), sets = await import('../ml-bean/sets.js');
  S = { street: st.buildStreet(), office: sets.officeSet(), beach: sets.beachSet(), concert: sets.concertSet() };
  S.street.cards = st.radioCrowd(S.street.scene);
  buildStreetExtras(); buildBeachCast(); buildConcertCast(); buildOfficeCast(); buildKitProps();
  stage = K.makeInkStage(W, H); camera = new THREE.PerspectiveCamera(52, W / H, 0.05, 400);
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
  // crows that take off from the wire
  s.crows = []; sc.traverse((o) => { if (o.isGroup && o.children.length === 3 && o.position.y > 7) s.crows.push(o); });
}
function buildBeachCast() {
  const b = S.beach, sc = b.scene;
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
}

// ------------------------------------------------------------------ v2 props (all real 3D, inked)
const conchTex = () => K.paint(300, 200, (g, w, h) => { g.fillStyle = '#c8312c'; g.fillRect(0, 0, w, h); g.fillStyle = '#f4efe4'; g.beginPath(); g.ellipse(w / 2, h / 2, 34, 48, 0.3, 0, 7); g.fill(); g.strokeStyle = '#c8312c'; g.lineWidth = 6; g.beginPath(); g.arc(w / 2, h / 2, 20, 0.5, 5); g.stroke(); });
function waveFlag(scene, life, tex, w, h, amp = 0.08) { const geo = new THREE.PlaneGeometry(w, h, 10, 1); geo.translate(w / 2, 0, 0); const m = K.mesh(geo, new THREE.MeshLambertMaterial({ map: tex, side: THREE.DoubleSide }), { shadow: false }); const p0 = geo.attributes.position.array.slice();
  life.push((t) => { const a = geo.attributes.position; for (let i = 0; i < a.count; i++) { const x = p0[i * 3]; a.setZ(i, Math.sin(x * 5 - t * 4) * amp * x / w); } a.needsUpdate = true; geo.computeVertexNormals(); }); return m; }
function buildKitProps() {
  const o = S.office, st = S.street, b = S.beach;
  // 1. the map on the Dewan's desk: Kerala coast only, Travancore shaded at the southern tip
  const mapT = K.paint(360, 480, (g, w, h) => { g.fillStyle = '#7fb8dc'; g.fillRect(0, 0, w, h); K.mottle(g, w, h, ['#6aa8d0', '#93c6e4'], 120, [10, 40], 5, 0.25);
    g.beginPath(); g.moveTo(150, 0); g.bezierCurveTo(170, 120, 200, 200, 215, 300); g.bezierCurveTo(228, 380, 250, 440, 262, 480); g.lineTo(w, h); g.lineTo(w, 0); g.closePath(); g.fillStyle = '#e8d8a8'; g.fill(); g.lineWidth = 6; g.strokeStyle = '#2a1c17'; g.stroke();
    g.save(); g.clip(); g.beginPath(); g.moveTo(205, 360); g.lineTo(w, 330); g.lineTo(w, h); g.lineTo(240, h); g.closePath(); g.fillStyle = '#c8312c'; g.fill(); g.restore();
    g.fillStyle = '#2a1c17'; g.font = "800 22px 'Noto Malayalam'"; g.textAlign = 'center'; g.fillText('തിരുവിതാംകൂർ', 300, 315); g.fillStyle = '#1f4f6a'; g.font = "700 24px 'Noto Malayalam'"; g.save(); g.translate(80, 260); g.rotate(-1.4); g.fillText('അറബിക്കടൽ', 0, 0); g.restore();
    g.strokeStyle = '#2a1c17'; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10); });
  o.map = K.mesh(new THREE.BoxGeometry(0.6, 0.006, 0.8), [K.col(0xf4ecd6), K.col(0xf4ecd6), new THREE.MeshLambertMaterial({ map: mapT }), K.col(0xf4ecd6), K.col(0xf4ecd6), K.col(0xf4ecd6)]); o.map.position.set(0.05, 1.045, -0.82); o.map.visible = false; o.scene.add(o.map);
  o.pen = new THREE.Group(); const body = K.mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.42, 12), K.col(0x1f3a6a)); body.position.y = 0.27; o.pen.add(body); const nib = K.mesh(new THREE.ConeGeometry(0.03, 0.07, 12), K.col(0xd8a63a)); nib.rotation.x = Math.PI; nib.position.y = 0.025; o.pen.add(nib); const cap = K.mesh(new THREE.CylinderGeometry(0.033, 0.033, 0.08, 12), K.col(0xd8a63a)); cap.position.y = 0.46; o.pen.add(cap);
  o.pen.visible = false; o.scene.add(o.pen);
  // 2. Delhi's pressure: letters raining onto the desk
  const envT = K.paint(256, 170, (g, w, h) => { g.fillStyle = '#f0e2c0'; g.fillRect(0, 0, w, h); g.strokeStyle = '#2a1c17'; g.lineWidth = 6; g.strokeRect(3, 3, w - 6, h - 6); g.beginPath(); g.moveTo(3, 3); g.lineTo(w / 2, h * 0.55); g.lineTo(w - 3, 3); g.stroke(); g.fillStyle = '#b8302a'; g.font = "800 40px 'Oswald'"; g.textAlign = 'center'; g.fillText('DELHI', w / 2, h - 22); });
  o.letters = []; { const r = K.rnd(31); for (let i = 0; i < 16; i++) { const m = K.mesh(new THREE.BoxGeometry(0.26, 0.012, 0.17), [K.col(0xf0e2c0), K.col(0xf0e2c0), new THREE.MeshLambertMaterial({ map: envT }), K.col(0xf0e2c0), K.col(0xf0e2c0), K.col(0xf0e2c0)]); m.userData = { x: -0.95 + r() * 1.9, z: -1.25 + r() * 0.9, ry: r() * 3, k: i }; m.visible = false; o.scene.add(m); o.letters.push(m); } }
  // 3. weeks passing on a second calendar (June -> July)
  o.weeks = []; [['ജൂൺ', 18], ['ജൂൺ', 25], ['ജൂലൈ', 2], ['ജൂലൈ', 9], ['ജൂലൈ', 16], ['ജൂലൈ', 23]].forEach(([mo, d]) => { const tx = K.paint(220, 300, (g, w, h) => { g.fillStyle = '#f6efdc'; g.fillRect(0, 0, w, h); g.fillStyle = '#1f5a7a'; g.fillRect(0, 0, w, 70); g.fillStyle = '#fff'; g.font = "800 40px 'Noto Malayalam'"; g.textAlign = 'center'; g.fillText(mo, w / 2, 52); g.fillStyle = '#2a1c17'; g.font = "800 150px 'Oswald'"; g.fillText(String(d), w / 2, 240); });
    const m = K.mesh(new THREE.PlaneGeometry(0.62, 0.84), new THREE.MeshLambertMaterial({ map: tx, side: THREE.DoubleSide }), { shadow: false }); m.geometry.translate(0, -0.42, 0); m.visible = false; o.scene.add(m); o.weeks.push(m); });
  // 4. the telegram (street, at the post table)
  const telT = K.paint(360, 260, (g, w, h) => { g.fillStyle = '#f4ecd0'; g.fillRect(0, 0, w, h); g.fillStyle = '#1f4f36'; g.fillRect(0, 0, w, 60); g.fillStyle = '#f4dca0'; g.font = "700 40px 'Oswald'"; g.textAlign = 'center'; g.fillText('TELEGRAM', w / 2, 45);
    g.fillStyle = '#2a1c17'; g.font = "700 24px 'Oswald'"; g.fillText('TO: DEWAN OF TRAVANCORE', w / 2, 110); g.font = "800 40px 'Noto Malayalam'"; g.fillStyle = '#1f6a3a'; g.fillText('പിന്തുണ ✔', w / 2, 175); g.font = "700 22px 'Oswald'"; g.fillStyle = '#2a1c17'; g.fillText('— M.A. JINNAH', w / 2, 225); });
  st.telegram = K.mesh(new THREE.BoxGeometry(0.62, 0.45, 0.01), new THREE.MeshLambertMaterial({ map: telT })); st.telegram.visible = false; st.scene.add(st.telegram);
  // 5. the lottery ticket that tears (two halves)
  const tick = (half) => K.paint(220, 300, (g, w, h) => { g.save(); g.translate(-half * w, 0); const W2 = w * 2; g.fillStyle = '#f6d24a'; g.fillRect(0, 0, W2, h); K.mottle(g, W2, h, ['#f0c030', '#fff0a0'], 60, [8, 30], 8, 0.3); g.strokeStyle = '#2a1c17'; g.lineWidth = 8; g.strokeRect(6, 6, W2 - 12, h - 12);
    g.fillStyle = '#b8302a'; g.font = "800 64px 'Noto Malayalam'"; g.textAlign = 'center'; g.fillText('ലോട്ടറി', w, 90); g.fillStyle = '#2a1c17'; g.font = "800 46px 'Oswald'"; g.fillText('1ST PRIZE', w, 160); g.font = "700 40px 'Oswald'"; g.fillText('No. 1947', w, 230); g.restore();
    g.strokeStyle = '#2a1c17'; g.setLineDash([10, 8]); g.lineWidth = 4; g.beginPath(); g.moveTo(half ? 3 : w - 3, 0); g.lineTo(half ? 3 : w - 3, h); g.stroke(); });
  st.ticket = new THREE.Group(); st.halves = [0, 1].map((k) => { const m = K.mesh(new THREE.BoxGeometry(0.22, 0.3, 0.004), new THREE.MeshLambertMaterial({ map: tick(k) }), { shadow: false }); m.geometry.translate(k ? 0.11 : -0.11, 0, 0); st.ticket.add(m); return m; });
  st.ticketGlow = K.mesh(new THREE.CircleGeometry(0.27, 32), new THREE.MeshBasicMaterial({ color: 0xffe070, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }), { shadow: false }); st.ticketGlow.userData.noInk = true; st.ticketGlow.position.z = -0.02; st.ticket.add(st.ticketGlow);
  st.ticket.visible = false; st.scene.add(st.ticket);
  // 6. the Travancore passport (opens in the air)
  const covT = K.paint(256, 360, (g, w, h) => { g.fillStyle = '#6a1a24'; g.fillRect(0, 0, w, h); g.fillStyle = '#e8b93a'; g.beginPath(); g.ellipse(w / 2, 150, 44, 64, 0.3, 0, 7); g.fill(); g.strokeStyle = '#6a1a24'; g.lineWidth = 8; g.beginPath(); g.arc(w / 2, 150, 26, 0.5, 5); g.stroke();
    g.fillStyle = '#e8b93a'; g.font = "800 36px 'Noto Malayalam'"; g.textAlign = 'center'; g.fillText('തിരുവിതാംകൂർ', w / 2, 60); g.font = "700 40px 'Oswald'"; g.fillText('PASSPORT', w / 2, 290); });
  const pageT = K.paint(256, 360, (g, w, h) => { g.fillStyle = '#f2ead6'; g.fillRect(0, 0, w, h); g.strokeStyle = '#c8b890'; g.lineWidth = 2; for (let y = 40; y < h; y += 28) { g.beginPath(); g.moveTo(20, y); g.lineTo(w - 20, y); g.stroke(); }
    g.save(); g.translate(w / 2, h / 2); g.rotate(-0.3); g.strokeStyle = '#1f6a3a'; g.lineWidth = 8; g.beginPath(); g.ellipse(0, 0, 100, 64, 0, 0, 7); g.stroke(); g.fillStyle = '#1f6a3a'; g.font = "800 34px 'Oswald'"; g.textAlign = 'center'; g.fillText('ENTRY', 0, -6); g.font = "800 30px 'Noto Malayalam'"; g.fillText('കൊല്ലം തുറമുഖം', 0, 34); g.restore(); });
  st.passport = new THREE.Group(); const back = K.mesh(new THREE.BoxGeometry(0.3, 0.42, 0.015), [K.col(0x6a1a24), K.col(0x6a1a24), K.col(0x6a1a24), K.col(0x6a1a24), new THREE.MeshLambertMaterial({ map: pageT }), K.col(0x6a1a24)]); back.geometry.translate(0.15, 0, 0); st.passport.add(back);
  st.pcover = new THREE.Group(); const cv = K.mesh(new THREE.BoxGeometry(0.3, 0.42, 0.015), [K.col(0x6a1a24), K.col(0x6a1a24), K.col(0x6a1a24), K.col(0x6a1a24), new THREE.MeshLambertMaterial({ map: covT }), K.col(0xf2ead6)]); cv.geometry.translate(0.15, 0, 0.016); st.pcover.add(cv); st.passport.add(st.pcover);
  st.passport.visible = false; st.scene.add(st.passport);
  // 7. embassy flags that shoot up along the street
  const flagCols = [['#1f4f8a', '#f4efe4'], ['#2f7a3a', '#f6d24a'], ['#e8b93a', '#8a1e1e'], ['#5a2a6a', '#f4efe4'], ['#1f8a86', '#f4efe4'], ['#c8562a', '#1f3a5a']];
  st.flags = []; for (let i = 0; i < 6; i++) { const [c1, c2] = flagCols[i]; const ft = K.paint(240, 160, (g, w, h) => { g.fillStyle = c1; g.fillRect(0, 0, w, h); g.fillStyle = c2; if (i % 2) g.fillRect(0, h / 3, w, h / 3); else { g.beginPath(); g.arc(w / 2, h / 2, 40, 0, 7); g.fill(); } g.strokeStyle = '#2a1c17'; g.lineWidth = 8; g.strokeRect(4, 4, w - 8, h - 8); });
    const grp = new THREE.Group(); const pole = K.mesh(new THREE.CylinderGeometry(0.04, 0.05, 4.2, 8), K.col(0xd8d0c0)); pole.position.y = 2.1; grp.add(pole); const ball = K.mesh(new THREE.SphereGeometry(0.08, 10, 8), K.col(0xd8a63a)); ball.position.y = 4.25; grp.add(ball);
    const fl = waveFlag(st.scene, st.life, ft, 1.1, 0.72); fl.position.set(0.04, 3.75, 0); grp.add(fl);
    const plq = K.mesh(new THREE.BoxGeometry(0.8, 0.26, 0.04), new THREE.MeshLambertMaterial({ map: K.signTex(['EMBASSY'], { w: 384, h: 120, font: 'Oswald', bg: '#f4ecd6', fg: '#2a1c17', border: '#d9a521' }) })); plq.position.set(0, 1.25, 0.06); grp.add(plq);
    const side = i % 2 ? 1 : -1; grp.position.set(side * 1.3, 0, -8.0 - Math.floor(i / 2) * 2.6); grp.rotation.y = side > 0 ? -0.5 : 0.5; grp.userData.k = i; st.scene.add(grp); st.flags.push(grp); }
  // 8. conch flag on the steamship's mast + the 'ഇല്ല' mark pressed into the sand for the ending
  const sf = waveFlag(b.scene, b.life, conchTex(), 2.4, 1.6, 0.25); sf.position.set(5.05, 6.6, 0); b.ship.add(sf); b.shipFlag = sf;
  b.imprint = K.mesh(new THREE.PlaneGeometry(1.1, 1.1), new THREE.MeshBasicMaterial({ map: o.noMark, transparent: true, opacity: 0, depthWrite: false }), { shadow: false }); b.imprint.userData.noInk = true; b.imprint.rotation.x = -Math.PI / 2; b.imprint.position.set(0.9, 0.04, 2.0); b.scene.add(b.imprint);
  // coin rain (3D chakram coins) for the what-if spectacle
  st.rain = []; { const r = K.rnd(19); const cm = S.street.coin.material; for (let i = 0; i < 40; i++) { const c = K.mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.02, 20), cm, { shadow: false }); c.userData = { x: -2.6 + r() * 5.2, z: -9 + r() * 6, y0: 5 + r() * 3, sp: 1.6 + r() * 1.4, ph: r() * 6 }; c.visible = false; st.scene.add(c); st.rain.push(c); } }
}
function billboard(obj, extra = 0) { obj.lookAt(camera.position); obj.rotateY(extra); }

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
// digits are spoken as long words in Malayalam ("1947" = aayirathi thollaayirathi naalpathiyezhu), so weight them when placing words in time
const cw = (ch) => (/[0-9]/.test(ch) ? 7 : 1);
function wt(s, i, needle) { const line = s.line(i), a = s.cue(i), b = s.cueEnd(i); const k = Math.max(0, line.indexOf(needle)); let pre = 0, tot = 0; for (let j = 0; j < line.length; j++) { const c = cw(line[j]); tot += c; if (j < k) pre += c; } return a + (pre / tot) * (b - a); }

function resetProps() {
  const o = S.office, st = S.street, b = S.beach;
  o.map.visible = false; o.pen.visible = false; o.stamp.visible = true; o.letters.forEach((m) => { m.visible = false; }); o.weeks.forEach((m) => { m.visible = false; }); o.pages.forEach((p) => { p.m.visible = p.d === 25; p.m.position.set(o.R.w / 2 - 0.05, 2.9, 1.6); p.m.rotation.set(0, -Math.PI / 2, 0); });
  o.dewan.c.visible = true; o.dewan.c.position.set(0, 0, -1.75); o.clerk.c.position.set(-1.7, 0, -0.7); o.sheets.forEach((x) => { x.visible = false; });
  st.telegram.visible = false; st.ticket.visible = false; st.passport.visible = false; st.rain.forEach((c) => { c.visible = false; }); st.flags.forEach((f) => { f.position.y = -4.6; }); st.coin.visible = false; st.stamp.visible = false;
  st.soldiers.forEach((a) => { a.c.position.z = a.base[2]; });
  b.imprint.material.opacity = 0;
}
function letterRain(t, t0) { const o = S.office; o.letters.forEach((m) => { const d = m.userData, k = t - t0 - d.k * 0.09; m.visible = k > 0; if (!m.visible) return; const y = Math.max(1.03 + d.k * 0.012, 3.2 - k * k * 9); m.position.set(d.x, y, d.z); m.rotation.set(y > 1.1 ? k * 5 : 0, d.ry, y > 1.1 ? k * 3 : 0); }); }
function weekPages(t, t0) { const o = S.office; o.weeks.forEach((m, i) => { const k = t0 + 0.15 + i * 0.36, u = span(t, k, 0.55); m.visible = i === 5 || u < 1; m.rotation.set(0, -Math.PI / 2, 0); m.position.set(o.R.w / 2 - 0.06 - u * 1.2, 2.9 + u * 0.8 - u * u * 1.5, 1.6 + u * 0.6); m.rotation.x = u * 3; m.rotation.z = u * 1.5; }); o.pages.forEach((p) => { p.m.visible = false; }); }
function ticketAt(t, pos, torn, glow, extra = 0) { const st = S.street; st.ticket.visible = true; st.ticket.position.copy(pos); billboard(st.ticket, extra); st.halves[0].position.set(-torn * 0.12, -torn * torn * 0.25, 0); st.halves[0].rotation.set(0, 0, torn * 0.5); st.halves[1].position.set(torn * 0.12, -torn * torn * 0.18, 0); st.halves[1].rotation.set(0, 0, -torn * 0.6); st.ticketGlow.material.opacity = glow * (0.55 + 0.15 * Math.sin(t * 9)); st.ticketGlow.scale.setScalar(1 + 0.08 * Math.sin(t * 6)); }
function coinRain(t, t0) { S.street.rain.forEach((c) => { const d = c.userData, k = t - t0; c.visible = k > 0; if (!c.visible) return; const y = d.y0 - ((k * d.sp) % (d.y0 + 0.5)); c.position.set(d.x, Math.max(0.03, y), d.z); c.rotation.set(t * 9 + d.ph, t * 4, 0.4); }); }

// ------------------------------------------------------------------ shots
function shots(s) { return tidy(rawShots(s)); }
function rawShots(s) {
  const L = (i) => s.cue(i), w = (i, n) => wt(s, i, n);
  const wNo = w(0, 'ഇല്ല'), wKar = w(0, 'കാരണം'), wLok = w(0, 'ലോകശക്തികൾ');
  const wNok = w(1, 'നോക്കൂ'), wThor = w(1, 'തോറിയം'), wGold = w(1, 'സ്വർണ്ണം');
  const wCoin = w(2, 'നാണയം'), wSt = w(2, 'സ്റ്റാമ്പ്'), wArmy = w(2, 'പട്ടാളം'), wWhy = w(2, 'പിന്നെന്തിന്');
  const wQ = w(3, '"ഈ'), wMap = w(3, 'മാപ്പിൽ'), wCover = w(3, 'മറയ്ക്കാവുന്ന');
  const wInd = w(4, 'സ്വതന്ത്ര'), wJin = w(4, 'ജിന്ന');
  const wDel = w(5, 'ഡൽഹി'), wKul = w(5, 'ദിവാൻ കുലുങ്ങിയില്ല');
  const wKaz = w(6, 'കഴിഞ്ഞിറങ്ങുമ്പോൾ'), wAtt = w(6, 'ആക്രമി');
  const wMan = w(7, 'ലോകം'), wVit = w(7, 'വിട്ടുകൊടുത്തോ'), wYes = w(7, 'അതെ'), wSam = w(7, 'സമ്മതിച്ചു');
  const wTic = w(8, 'കൗണ്ടറിലേക്കുള്ള'), wTear = w(8, 'കീറിപ്പോയ');
  const wPass = w(9, 'തിരുവിതാംകൂർ പാസ്‌'), wEmb = w(9, 'എംബസികൾ'), wShip = w(9, 'ശംഖുമുദ്ര');
  const wSand = w(10, 'കറുത്ത'), wNoEnd = w(10, "'ഇല്ല'");
  const OFF = (k) => ({ set: 'office', ...k }), STR = (k) => ({ set: 'street', ...k }), BCH = (k) => ({ set: 'beach', ...k }), CON = (k) => ({ set: 'concert', ...k });
  return [
    // ---- 1. HOOK: frame 0 = the stamp already rising; slam on 'ഇല്ല' (second beat by ~2.5 s); snapback to the world powers eyeing the sand
    OFF({ a: 0, b: wNo - 0.5, keys: [[0, [1.4, 1.25, 1.7], [0.1, 1.4, -1.4], 0.06, 46], [0.35, [0.95, 1.4, 1.05], [0.1, 1.5, -1.5], 0.03, 46], [3, [0.7, 1.45, 0.8], [0.1, 1.55, -1.5], 0.0, 46]],
      act: (t, tt, sh) => { const o = S.office, p = span(t, sh.a, sh.b - sh.a); pose(o.dewan, { expr: p < 0.3 ? 'think' : 'sly', L: 'hip', R: { a: 'hold', b: 'holdUp', t: ez(p * 2) }, look: 0.6 }, t); pose(o.clerk, { expr: 'nervous', R: 'holdUp', propR: 'paper', look: 1 }, t); o.setStamp(0.15 + 0.35 * ez(p)); o.mark.visible = false; o.setBanner(0); } }),
    OFF({ a: wNo - 0.5, b: wNo + 1.1, shake: wNo, keys: [[0, [1.1, 1.75, 1.2], [0.1, 1.2, -1.0], 0.03, 48], [0.4, [0.95, 1.65, 1.0], [0.1, 1.2, -1.05], 0.0, 48], [2, [0.85, 1.7, 1.1], [0.1, 1.25, -1.05], -0.03, 50]],
      act: (t) => { const o = S.office; o.setStamp(t < wNo ? 0.5 + 0.2 * span(t, wNo - 0.5, 0.5) : 0.7 + 0.3 * span(t, wNo, 0.5)); o.mark.visible = t > wNo; o.markMat.map = o.noMark; o.mark.scale.setScalar(t > wNo ? 1 + 0.3 * Math.max(0, 1 - (t - wNo) / 0.2) : 1); o.flyPapers(wNo, t);
        pose(o.dewan, { expr: t < wNo ? 'angry' : 'smug', L: 'hip', R: t < wNo ? 'holdUp' : 'hold', look: 0.4 }, t); pose(o.clerk, { expr: t < wNo ? 'nervous' : 'shock', L: t < wNo ? 'hang' : 'up', R: t < wNo ? 'holdUp' : 'up', propR: t < wNo ? 'paper' : null, hop: t > wNo && t < wNo + 0.35 ? 0.15 : 0, look: 1 }, t); o.setBanner(0); } }),
    OFF({ a: wNo + 1.1, b: wKar - 0.1, keys: [[0, [-1.2, 1.5, 0.5], [0, 1.45, -1.75], -0.03, 46], [0.4, [-0.9, 1.5, 0.35], [0, 1.45, -1.75], -0.02, 46], [3, [0.75, 1.55, 0.45], [0, 1.45, -1.75], 0.03, 46]],
      act: (t) => { const o = S.office; o.flyPapers(wNo, t); o.setStamp(1); o.mark.visible = true; pose(o.dewan, { expr: 'smug', L: 'cross', R: 'cross', look: (t * 0.7) % 2 > 1 ? 1 : -0.5 }, t); pose(o.clerk, { expr: 'nervous', L: 'mouth', R: 'hang', look: 1 }, t); o.setBanner(0); } }),
    BCH({ a: wKar - 0.1, b: wLok + 0.6, keys: [[0, [3.5, 5.2, -33], [9, 4.6, -45], 0.03, 44], [0.4, [5.0, 5.0, -36.5], [9.5, 4.7, -45.5], 0.02, 44], [2.5, [5.6, 4.9, -37.5], [9.6, 4.7, -45.5], -0.01, 44]],
      act: (t) => { beachCast(t, 'watch'); S.beach.setGlow(0, t); } }),
    BCH({ a: wLok + 0.6, b: L(1), iris: true, keys: [[0, [0.25, 0.32, 1.75], [0, 0.05, 0.6], 0.0, 48], [0.4, [0.2, 0.42, 2.0], [0, 0.08, 0.6], 0.03, 48], [2.5, [0.1, 0.55, 2.3], [0, 0.1, 0.6], 0.05, 48]],
      act: (t, tt, sh) => { beachCast(t, 'watch'); S.beach.setGlow(0.4 * ez(span(t, sh.a + 0.2, 0.8)), t); } }),
    // ---- 2. "Travancore." banner, then YOU SEE: thorium in the black sand, atom-age gold
    OFF({ a: L(1), b: wNok - 0.1, keys: [[0, [0.5, 1.6, 1.4], [0.4, 1.9, -2.5], 0.02, 52], [0.4, [0.6, 1.8, 2.3], [0.5, 2.2, -2.6], 0.01, 54], [2.5, [0.7, 1.9, 2.8], [0.5, 2.3, -2.6], -0.01, 56]],
      act: (t, tt, sh) => { const o = S.office, u = ezo(span(t, sh.a + 0.05, 0.9)); o.setBanner(u); o.setStamp(1); o.mark.visible = true; pose(o.dewan, { expr: u > 0.5 ? 'proud' : 'smug', L: 'hip', R: u > 0.3 ? 'fist' : 'cross', look: 0.8, hop: u > 0.3 && u < 0.9 ? 0.06 : 0 }, t); pose(o.clerk, { expr: 'shock', L: 'up', R: 'up', look: 1 }, t); } }),
    BCH({ a: wNok - 0.1, b: wThor + 0.9, keys: [[0, [0.3, 0.5, 2.9], [-0.2, 0.6, 0.6], 0.03, 46], [0.4, [0.9, 1.1, 3.6], [-0.3, 0.9, 0.5], 0.02, 50], [2.2, [1.0, 1.4, 4.3], [-0.3, 1.1, 0.5], -0.02, 52]],
      act: (t, tt, sh) => { beachCast(t, 'glow'); S.beach.setGlow(ez(span(t, wThor - 0.2, 0.6)), t); } }),
    BCH({ a: wThor + 0.9, b: L(2), keys: [[0, [3.0, 2.0, 5.2], [-0.3, 1.2, -1], 0.03, 54], [0.4, [3.4, 2.4, 6.4], [-0.4, 1.3, -2], 0.02, 54], [3, [1.8, 2.7, 7.4], [0, 1.6, -6], -0.02, 54]],
      act: (t) => { beachCast(t, 'wave'); S.beach.setGlow(1 + 0.3 * Math.max(0, 1 - Math.abs(t - wGold) * 2), t); } }),
    // ---- 3. the Dewan does the maths: coin, stamp, army... why India?
    OFF({ a: L(2), b: wCoin - 0.1, keys: [[0, [1.6, 1.6, 0.9], [0.0, 1.55, -1.75], 0.04, 44], [0.4, [1.1, 1.6, 0.4], [0.0, 1.6, -1.75], 0.02, 44], [2.5, [0.8, 1.6, 0.2], [0.0, 1.6, -1.75], -0.01, 44]],
      act: (t) => { const o = S.office; o.setStamp(1); o.mark.visible = true; o.setBanner(1); pose(o.dewan, { expr: 'think', L: 'chin', R: 'hip', look: 0.4, lookY: -1 }, t); pose(o.clerk, { expr: 'nervous', R: 'holdUp', propR: 'paper', look: 1 }, t); } }),
    STR({ a: wCoin - 0.1, b: wSt - 0.1, keys: [[0, [1.4, 1.5, -3.2], [-1.45, 1.7, -5.0], 0.02, 52], [0.4, [1.0, 1.55, -3.6], [-1.45, 2.2, -5.0], 0.01, 52], [2, [0.9, 1.6, -3.8], [-1.45, 2.0, -5.0], -0.02, 52]],
      act: (t, tt, sh) => { streetCrowd(t, 'calm'); const s0 = S.street, u = span(t, sh.a + 0.1, 1.2); s0.coin.visible = true; s0.coin.position.set(-0.55, 1.6 + Math.sin(u * Math.PI) * 0.9, -4.5); s0.coin.rotation.set(t * 14, 0, 0.3); } }),
    STR({ a: wSt - 0.1, b: wArmy - 0.1, keys: [[0, [0.6, 1.8, -7.6], [-2.9, 1.4, -10.8], 0.03, 50], [0.4, [0.1, 1.7, -8.2], [-2.9, 1.45, -10.8], 0.02, 50], [2, [-0.1, 1.7, -8.5], [-2.9, 1.5, -10.8], -0.01, 50]],
      act: (t, tt, sh) => { const s0 = S.street, u = ezo(span(t, sh.a + 0.25, 0.5)); pose(s0.post, { expr: u > 0.5 ? 'proud' : 'stern', R: u > 0.1 ? 'hold' : 'holdUp', propR: 'stamp', look: -0.5 }, t); pose(s0.villager, { expr: u > 0.5 ? 'beam' : 'think', L: 'chin', look: -1 }, t);
        s0.stamp.visible = u > 0; s0.stamp.position.set(-2.6, 1.0 + u * 1.0, -10.6 + u * 0.5); s0.stamp.rotation.set(-0.2, 0.9 + (1 - u) * 3, (1 - u) * 0.6); s0.stamp.scale.setScalar(0.2 + 0.8 * u); } }),
    STR({ a: wArmy - 0.1, b: wWhy - 0.1, keys: [[0, [0.9, 0.9, -6.0], [0, 1.5, -14], 0.0, 52], [0.4, [0.6, 0.95, -7.0], [0, 1.55, -14], 0.02, 52], [2.4, [0.5, 1.0, -7.6], [0, 1.6, -14], -0.02, 52]],
      act: (t, tt, sh) => { marchCheer(t, sh.a); } }),
    OFF({ a: wWhy - 0.1, b: L(3), keys: [[0, [0.95, 1.3, -0.35], [0.0, 1.5, -1.75], 0.05, 40], [0.35, [0.85, 1.45, 0.1], [0.0, 1.5, -1.75], 0.02, 44], [2, [0.75, 1.55, 0.45], [0, 1.55, -1.75], -0.02, 46]],
      act: (t) => { const o = S.office; o.setStamp(1); o.mark.visible = true; o.setBanner(1); pose(o.dewan, { expr: 'smug', L: 'cross', R: 'cross', look: 0.2, lookY: 1 }, t); pose(o.clerk, { expr: 'shock', L: 'mouth', R: 'hang', look: 1 }, t); } }),
    // ---- 4. MOCKERY + JOKE: people laugh; a country you can hide under a pen tip
    STR({ a: L(3), b: wQ + 0.9, keys: [[0, [1.0, 1.7, 0.9], [-1.8, 1.5, -4], 0.04, 52], [0.4, [0.7, 1.75, 1.3], [-1.8, 1.55, -4], 0.02, 54], [2.1, [0.5, 1.8, 1.6], [-1.8, 1.6, -4], -0.01, 54]],
      act: (t) => streetCrowd(t, 'laugh') }),
    STR({ a: wQ + 0.9, b: wMap - 0.1, keys: [[0, [0.2, 1.7, -0.6], [-2.2, 1.45, -3.9], -0.03, 50], [0.4, [-0.1, 1.65, -1.0], [-2.2, 1.45, -3.9], -0.02, 50], [2.2, [-0.9, 1.7, -1.4], [-2.2, 1.45, -4.0], 0.03, 50]],
      act: (t) => streetCrowd(t, 'laugh') }),
    OFF({ a: wMap - 0.1, b: L(4), keys: [[0, [0.35, 3.0, -0.1], [0.05, 1.04, -0.82], 0.05, 40], [0.4, [0.12, 2.65, -0.3], [0.07, 1.04, -0.82], 0.02, 40], [2.6, [0.12, 2.4, -0.4], [0.14, 1.04, -0.72], -0.02, 38]],
      act: (t, tt, sh) => { const o = S.office; o.setStamp(0); o.stamp.visible = false; o.mark.visible = false; o.setBanner(1); o.map.visible = true; o.pen.visible = true; const u = ezo(span(t, wCover - 0.5, 0.5)); o.pen.position.set(0.21 + (1 - u) * 0.15, 1.05 + (1 - u) * 0.45, -0.55 - (1 - u) * 0.1); o.pen.rotation.set(-(1 - u) * 0.4, 0, (1 - u) * 0.3);
        pose(o.dewan, { expr: t > wCover ? 'angry' : 'stern', L: 'hip', R: 'cross', look: 0 }, t); pose(o.clerk, { expr: t > wCover ? 'laugh' : 'grin', L: 'mouth', R: 'point', look: 1 }, t); } }),
    // ---- 5. ESCALATION: the radio, the street erupts, Jinnah's telegram
    STR({ a: L(4), b: wInd - 0.15, keys: [[0, [-1.6, 1.9, -1.8], [-3.8, 1.7, -4.4], 0.0, 54], [0.4, [0.9, 2.1, 1.6], [-3.9, 2.0, -4.8], 0.0, 56], [4, [1.3, 2.15, 2.2], [-3.9, 2.05, -4.8], 0.025, 56]],
      act: (t) => streetCrowd(t, 'listen') }),
    STR({ a: wInd - 0.15, b: wInd + 1.6, keys: [[0, [0.6, 1.8, 1.4], [-1.8, 1.8, -4], 0.02, 56], [0.4, [0.9, 1.9, 2.4], [-1.4, 3.4, -4.0], 0.05, 60], [2, [1.0, 2.0, 2.8], [-1.2, 3.6, -4.2], 0.02, 60]],
      act: (t) => streetCrowd(t, 'cheer', wInd) }),
    STR({ a: wInd + 1.6, b: wJin - 0.1, keys: [[0, [0.6, 2.8, 4.2], [-0.6, 2.4, -6], -0.03, 56], [0.4, [0.9, 2.4, 6.6], [-0.6, 2.6, -6], -0.025, 56], [4, [0.5, 2.5, 5.4], [-0.7, 2.6, -6], 0.0, 56]],
      act: (t) => streetCrowd(t, 'cheer', wInd) }),
    STR({ a: wJin - 0.1, b: L(5), keys: [[0, [0.6, 1.8, -7.6], [-2.9, 1.5, -10.8], -0.03, 46], [0.4, [0.0, 1.75, -8.3], [-2.9, 1.6, -10.8], -0.01, 46], [2.4, [-0.3, 1.75, -8.6], [-2.9, 1.65, -10.8], 0.02, 46]],
      act: (t, tt, sh) => { const s0 = S.street, u = ezo(span(t, sh.a + 0.2, 0.6)); pose(s0.post, { expr: u > 0.5 ? 'shock' : 'neutral', R: 'holdUp', propR: 'paper', L: u > 0.5 ? 'up' : 'hang', look: -0.5 }, t); pose(s0.villager, { expr: u > 0.5 ? 'shock' : 'think', L: 'mouth', look: -1 }, t);
        s0.telegram.visible = true; s0.telegram.position.set(-2.55, 1.2 + u * 0.75, -10.4 + u * 0.4); s0.telegram.rotation.set(-0.1, 0.85 + (1 - u) * 2.5, (1 - u) * 0.5); s0.telegram.scale.setScalar(0.3 + 0.7 * u); } }),
    // ---- 6. TIME MARKERS: weeks pass, Delhi's letters pile up, the Dewan won't budge
    OFF({ a: L(5), b: wDel - 0.05, keys: [[0, [2.2, 2.4, 2.3], [4.5, 2.5, 1.6], 0.03, 48], [0.4, [2.7, 2.5, 1.9], [4.5, 2.5, 1.6], 0.02, 48], [2.3, [2.9, 2.5, 1.8], [4.5, 2.5, 1.6], -0.01, 48]],
      act: (t, tt, sh) => { const o = S.office; weekPages(t, sh.a); pose(o.clerk, { expr: 'nervous', look: 1, R: 'hang' }, t); pose(o.dewan, { expr: 'stern', L: 'cross', R: 'cross' }, t); o.setBanner(1); o.mark.visible = true; o.setStamp(1); } }),
    OFF({ a: wDel - 0.05, b: wKul - 0.1, shake: wDel + 0.35, keys: [[0, [-1.4, 2.4, 1.2], [0, 1.3, -1.2], -0.04, 50], [0.4, [-1.1, 2.1, 0.9], [0, 1.3, -1.3], -0.02, 50], [2, [-0.7, 2.0, 0.9], [0, 1.35, -1.3], 0.02, 50]],
      act: (t, tt, sh) => { const o = S.office; letterRain(t, sh.a); o.setBanner(1); o.mark.visible = true; o.setStamp(1); pose(o.dewan, { expr: 'stern', L: 'cross', R: 'cross', look: 0.3 }, t); pose(o.clerk, { expr: 'shock', L: 'up', R: 'up', hop: Math.max(0, Math.sin(t * 8)) * 0.05, look: 1 }, t); } }),
    OFF({ a: wKul - 0.1, b: L(6), keys: [[0, [-0.95, 1.3, -0.35], [0.0, 1.5, -1.75], -0.05, 40], [0.35, [-0.85, 1.4, -0.15], [0.0, 1.5, -1.75], -0.02, 42], [2, [-0.75, 1.5, 0.25], [0.0, 1.5, -1.75], 0.02, 44]],
      act: (t, tt, sh) => { const o = S.office; letterRain(t, sh.a - 2); o.setBanner(1); o.mark.visible = true; o.setStamp(1); pose(o.dewan, { expr: 'smug', L: 'cross', R: 'cross', look: 0.1, lookY: 1 }, t); pose(o.clerk, { expr: 'nervous', L: 'mouth', R: 'hang', look: 1 }, t); } }),
    // ---- 7. the concert, the attack (25 July 1947, evening)
    CON({ a: L(6), b: L(6) + 1.5, keys: [[0, [-1.8, 4.4, 4.6], [0, 4.6, -2.6], -0.04, 54], [0.4, [-1.0, 4.4, 4.2], [0, 4.5, -2.6], -0.02, 54], [2.2, [0.9, 4.2, 4.0], [0, 4.3, -2.6], 0.02, 54]],
      act: (t) => concertCast(t, 'play') }),
    CON({ a: L(6) + 1.5, b: wKaz + 0.2, keys: [[0, [1.6, 2.2, 2.2], [0.6, 1.7, -0.6], 0.03, 44], [0.4, [1.2, 1.75, 1.3], [0.6, 1.6, -0.6], 0.02, 44], [3, [1.0, 1.75, 1.0], [0.6, 1.6, -0.6], -0.02, 44]],
      nameplate: true, act: (t) => concertCast(t, 'clap') }),
    CON({ a: wKaz + 0.2, b: wAtt - 0.35, keys: [[0, [-6.4, 1.5, 7.6], [-1, 1.4, 1.6], 0.02, 52], [0.4, [-6.0, 1.6, 7.2], [-0.5, 1.4, 1.6], 0.01, 52], [2, [-5.7, 1.6, 7.0], [0, 1.4, 1.8], -0.02, 52]],
      act: (t, tt, sh) => concertCast(t, 'leave', sh.a) }),
    CON({ a: wAtt - 0.35, b: L(7), shake: wAtt + 0.1, keys: [[0, [3.4, 1.7, 6.0], [1.5, 1.4, 2.6], 0.06, 50], [0.3, [2.6, 1.6, 5.0], [1.2, 1.45, 2.4], 0.04, 50], [2, [2.3, 1.7, 4.8], [1.2, 1.5, 2.4], -0.03, 50]],
      act: (t, tt, sh) => concertCast(t, 'attack', sh.a - 1.6, wAtt) }),
    // ---- 8. WAIT...? the sand everyone wanted, given up? YES: five days, the Maharaja signs
    BCH({ a: L(7), b: wVit - 0.2, keys: [[0, [-2.4, 1.6, 4.4], [0, 1.2, 0.6], -0.04, 50], [0.4, [-1.6, 1.5, 3.9], [0, 1.2, 0.6], -0.02, 50], [2.6, [-1.0, 1.5, 3.7], [0, 1.25, 0.6], 0.02, 50]],
      act: (t) => { beachCast(t, 'puzzled'); S.beach.setGlow(0.7, t); } }),
    BCH({ a: wVit - 0.2, b: wYes - 0.15, keys: [[0, [0.5, 0.9, 2.8], [-0.2, 1.0, 0.6], 0.0, 52], [0.4, [1.2, 1.55, 4.4], [-0.3, 1.25, 0.5], 0.02, 54], [2.2, [1.0, 1.65, 4.9], [-0.3, 1.3, 0.5], -0.02, 54]],
      act: (t) => { beachCast(t, 'puzzled'); S.beach.setGlow(0.7, t); } }),
    OFF({ a: wYes - 0.15, b: wYes + 1.7, keys: [[0, [2.2, 2.4, 2.3], [4.5, 2.5, 1.6], 0.03, 48], [0.4, [2.7, 2.5, 1.9], [4.5, 2.5, 1.6], 0.02, 48], [2.3, [2.9, 2.5, 1.8], [4.5, 2.5, 1.6], -0.01, 48]],
      act: (t, tt, sh) => { const o = S.office; o.pages.forEach((p, i) => { const k = sh.a + 0.15 + i * 0.3, u = span(t, k, 0.55); p.m.visible = i === 5 || u < 1; p.m.rotation.set(0, -Math.PI / 2, 0); p.m.position.set(o.R.w / 2 - 0.05 - u * 1.2, 2.9 + u * 0.8 - u * u * 1.5, 1.6 + u * 0.6); p.m.rotation.x = u * 3; p.m.rotation.z = u * 1.5; });
        o.dewan.c.visible = false; pose(o.clerk, { expr: 'nervous', look: 1, R: 'hang' }, t); o.setBanner(1); o.mark.visible = true; o.markMat.map = o.noMark; } }),
    OFF({ a: wYes + 1.7, b: L(8), shake: wSam, keys: [[0, [0.75, 1.5, 0.5], [0.12, 1.05, -0.7], -0.03, 46], [0.4, [0.6, 1.45, 0.3], [0.12, 1.02, -0.72], 0.0, 46], [3, [0.7, 1.75, 1.5], [0.1, 1.3, -1.2], 0.02, 50]],
      act: (t, tt, sh) => { const o = S.office, ts = wSam; o.dewan.c.visible = false; o.clerk.c.position.set(0.15, 0, -1.55); o.setStamp(t < ts ? 0.5 + 0.2 * span(t, ts - 0.75, 0.75) : 0.7 + 0.3 * span(t, ts, 0.5));
        o.markMat.map = t > ts ? o.yesMark : o.noMark; o.mark.visible = true; o.mark.scale.setScalar(t > ts ? 1 + 0.3 * Math.max(0, 1 - (t - ts) / 0.2) : 1); o.setBanner(1 - ezo(span(t, ts + 0.4, 1.0)));
        pose(o.clerk, { expr: t < ts ? 'nervous' : 'beam', R: t < ts ? 'holdUp' : 'hold', L: 'hip', look: 0.5 }, t); o.pages.forEach((p) => { p.m.visible = p.d === 30; p.m.position.set(o.R.w / 2 - 0.05, 2.9, 1.6); p.m.rotation.set(0, -Math.PI / 2, 0); }); } }),
    // ---- 9. ANALOGY: a winning lottery ticket torn on the way to the counter
    STR({ a: L(8), b: wTic, keys: [[0, [0.4, 1.4, -7.9], [-1.9, 1.3, -9.8], 0.05, 40], [0.4, [-0.2, 1.4, -8.4], [-1.9, 1.3, -9.85], 0.02, 40], [2.2, [-0.5, 1.45, -8.6], [-1.9, 1.32, -9.85], -0.01, 42]],
      act: (t) => { const s0 = S.street; pose(s0.villager, { expr: 'beam', R: 'holdUp', L: 'up', hop: Math.max(0, Math.sin(t * 7)) * 0.08, look: 1 }, t); pose(s0.post, { expr: 'shock', L: 'mouth', look: 0.5 }, t); ticketAt(t, new THREE.Vector3(-1.5, 0.98, -9.55), 0, 1); } }),
    STR({ a: wTic, b: L(9), shake: wTear + 0.1, keys: [[0, [-0.6, 1.6, -7.6], [-1.9, 1.35, -9.8], -0.05, 44], [0.35, [-0.9, 1.55, -8.2], [-1.9, 1.35, -9.8], -0.02, 44], [2, [-1.0, 1.6, -8.4], [-1.9, 1.35, -9.8], 0.02, 44]],
      act: (t) => { const s0 = S.street, u = ezo(span(t, wTear, 0.5)); pose(s0.villager, { expr: u > 0.1 ? 'shock' : 'beam', R: 'holdUp', L: u > 0.1 ? 'mouth' : 'up', lean: u * 0.1, look: 1 }, t); pose(s0.post, { expr: u > 0.1 ? 'sad' : 'grin', L: 'hang', look: 0.5 }, t); ticketAt(t, new THREE.Vector3(-1.5, 0.98, -9.55), u, 1 - u); } }),
    // ---- 10. SPECTACLE: what if it hadn't torn? passport, embassies, ships under the conch flag
    STR({ a: L(9), b: wPass - 0.3, keys: [[0, [-0.8, 1.6, -8.0], [-1.85, 1.45, -9.8], 0.03, 44], [0.4, [-0.5, 1.7, -7.7], [-1.85, 1.5, -9.8], 0.0, 46], [2.5, [0.2, 1.9, -7.0], [-1.85, 1.6, -9.8], -0.02, 50]],
      act: (t, tt, sh) => { const s0 = S.street, u = ezo(span(t, sh.a + 0.2, 0.7)); pose(s0.villager, { expr: u > 0.6 ? 'laugh' : 'shock', R: 'holdUp', L: u > 0.6 ? 'up' : 'mouth', hop: u > 0.6 ? Math.max(0, Math.sin(t * 8)) * 0.1 : 0, look: 1 }, t); pose(s0.post, { expr: u > 0.6 ? 'beam' : 'sad', L: u > 0.6 ? 'up' : 'hang', R: 'wave', look: 0.5 }, t); ticketAt(t, new THREE.Vector3(-1.5, 0.98 + u * 0.2, -9.55), 1 - u, u); coinRain(t, sh.a + 0.9); } }),
    STR({ a: wPass - 0.3, b: wEmb - 0.1, keys: [[0, [0.9, 2.3, 1.2], [-1.2, 2.2, -2.6], 0.05, 48], [0.4, [0.5, 2.2, 0.6], [-1.1, 2.3, -2.6], 0.02, 48], [2, [0.3, 2.2, 0.4], [-1.1, 2.35, -2.6], -0.02, 48]],
      act: (t, tt, sh) => { streetCrowd(t, 'cheer', sh.a); const s0 = S.street, u = ezo(span(t, sh.a, 0.5)), op = ezo(span(t, sh.a + 0.45, 0.5)); s0.passport.visible = true; s0.passport.position.set(-0.55, 1.4 + u * 0.75, -1.6 + u * 0.5); billboard(s0.passport, Math.PI + (1 - u) * 2.4); s0.passport.translateX(-0.2); s0.pcover.rotation.y = -op * 2.8; s0.passport.scale.setScalar(0.5 + 1.0 * u); } }),
    STR({ a: wEmb - 0.1, b: wShip - 0.2, keys: [[0, [0.9, 0.9, -2.8], [0, 2.6, -14], 0.04, 56], [0.4, [0.6, 1.0, -4.0], [0, 2.8, -14], 0.02, 56], [2.4, [0.5, 1.1, -4.6], [0, 3.0, -14], -0.02, 56]],
      act: (t, tt, sh) => { const s0 = S.street; s0.flags.forEach((f) => { const u = ezo(span(t, sh.a + f.userData.k * 0.12, 0.45)); f.position.y = -4.6 * (1 - u); }); marchCheer(t, sh.a); coinRain(t, sh.a - 1); } }),
    BCH({ a: wShip - 0.2, b: L(10), keys: [[0, [7.0, 3.0, -30], [13.5, 6.4, -45.5], 0.05, 50], [0.4, [8.2, 3.4, -33], [13.8, 6.6, -45.5], 0.02, 50], [2.6, [8.8, 3.8, -34.5], [14, 6.8, -45.5], -0.02, 52]],
      act: (t) => { beachCast(t, 'wave'); S.beach.setGlow(1, t); } }),
    // ---- 11. ENDING callback: only the black sand is left... without the kingdom that said NO
    BCH({ a: L(10), b: wNoEnd - 0.2, keys: [[0, [0.5, 0.9, 2.8], [-0.2, 1.0, 0.6], 0.0, 50], [0.4, [0.9, 1.2, 3.4], [-0.2, 1.05, 0.6], 0.01, 50], [2.6, [1.1, 1.35, 3.8], [-0.2, 1.1, 0.6], -0.01, 52]],
      act: (t, tt, sh) => { beachCast(t, 'pour', sh.a); S.beach.setGlow(1 - 0.5 * span(t, sh.a, 3), t); } }),
    BCH({ a: wNoEnd - 0.2, b: 1e9, keys: [[0, [1.6, 2.2, 3.6], [0.9, 0.04, 2.0], 0.02, 44], [0.4, [1.4, 2.6, 3.4], [0.9, 0.1, 1.8], 0.0, 46], [3, [1.0, 5.5, 5.5], [0.6, 0.6, -2], -0.02, 54]],
      act: (t, tt, sh) => { beachCast(t, 'sad'); const b = S.beach; b.setGlow(0.4, t); const fade = span(t, sh.a + 0.6, 1.2); b.imprint.material.opacity = 0.9 * (1 - fade); b.imprint.position.y = 0.04; } }),
  ];
}
// keep cuts on the word but never shorter than 0.6 s; split anything over 2.2 s into a fresh composition (kit: new composition every <= 2.2 s)
function tidy(list) {
  const n = list.length; for (let i = 1; i < n; i++) { const lo = list[i - 1].a + 0.6, hi = i + 1 < n ? list[i + 1].a - 0.6 : 1e9; if (list[i].a < lo) list[i].a = Math.min(lo, Math.max(list[i - 1].a + 0.3, (list[i - 1].a + hi) / 2)); }
  for (let i = 0; i < n; i++) list[i].b = i + 1 < n ? list[i + 1].a : list[i].b;
  const out = []; list.forEach((x) => { const d = x.b - x.a; if (d <= 2.3 || x.b > 1e8) { out.push(x); return; } const k = Math.ceil(d / 2.0), step = d / k;
    for (let j = 0; j < k; j++) { if (!j) { out.push({ ...x, b: x.a + step }); continue; } const side = j % 2 ? 1 : -1, push = 0.22 + 0.08 * j;
      const keys = x.keys.map(([t, p, l, r = 0, f = 52]) => [t, p.map((v, q) => v + (l[q] - v) * push + (q === 0 ? side * 0.25 : q === 1 ? 0.12 : 0)), l, -r + side * 0.03, f - 4]);
      out.push({ ...x, a: x.a + j * step, b: j === k - 1 ? x.b : x.a + (j + 1) * step, keys, shake: x.shake, iris: x.iris, nameplate: false }); } });
  return out;
}
function marchCheer(t, a0) { const s0 = S.street; s0.soldiers.forEach((a, i) => { a.c.position.z = a.base[2] + (t - a0) * 1.3; pose(a, { expr: i % 3 ? 'stern' : 'proud', L: 'march', R: 'rifle', propR: 'rifle', walk: ((t * 1.3) + (i % 2) * 0.5) % 1 }, t); });
  s0.cheer.forEach((a, i) => pose(a, { expr: ['beam', 'grin', 'smug', 'laugh'][i], R: 'wave', L: i % 2 ? 'up' : 'hang', look: i < 2 ? -1 : 1, hop: Math.max(0, Math.sin(t * 7 + i)) * 0.06 }, t)); }

function streetCrowd(t, mode, t0 = 0) {
  const s = S.street, cheer = mode === 'cheer' && t > t0;
  if (mode === 'laugh') { s.crowd.forEach((a, i) => { const ph = Math.sin(t * 9 + i * 1.7); pose(a, { expr: ['laugh', 'grin', 'laugh', 'smug', 'laugh', 'beam', 'laugh', 'grin', 'laugh'][i], L: i % 3 === 0 ? 'point' : 'hip', R: i % 2 ? 'mouth' : 'hip', look: i % 2 ? -1 : 1, lean: (i % 2 ? 0.08 : -0.08) + ph * 0.03, hop: Math.max(0, ph) * 0.04 }, t); }); s.confetti.forEach((m) => { m.visible = false; }); return; }
  const E = { listen: ['think', 'smug', 'nervous', 'think', 'neutral', 'think', 'nervous', 'smile', 'think'], cheer: ['beam', 'proud', 'laugh', 'beam', 'beam', 'grin', 'shock', 'beam', 'laugh'], calm: ['smile', 'smug', 'grin', 'smile', 'beam', 'think', 'smile', 'smile', 'grin'] }[cheer ? 'cheer' : mode === 'cheer' ? 'listen' : mode];
  s.crowd.forEach((a, i) => { const ph = (t * 0.6 + i * 0.37) % 1, swap = cheer && ph > 0.5; const arms = cheer ? [['up', 'fist'], ['hip', 'wave'], ['up', 'up'], ['wave', 'holdUp'], ['up', 'up'], ['hang', 'wave'], ['mouth', 'mouth'], ['wave', 'up'], ['up', 'wave']][i] : [[{ a: 'point', b: 'up', t: 0.3 }, 'hip'], ['cross', 'chin'], ['hang', 'hold'], ['hang', 'holdUp'], ['hang', 'chin'], ['hang', 'chin'], ['mouth', 'hang'], ['hold', 'hang'], ['hip', 'chin']][i];
    const props = [null, null, 'fish', 'glass', i === 4 ? 'flag' : null, null, null, null, null];
    pose(a, { expr: swap && E[i] === 'beam' ? 'laugh' : E[i], L: swap ? arms[1] : arms[0], R: swap ? arms[0] : arms[1], propR: i === 4 && cheer ? 'flag' : props[i] && i !== 4 ? props[i] : null, look: -1, lookY: cheer ? -0.5 : 0, hop: cheer ? Math.max(0, Math.sin(t * 8 + i * 1.3)) * (i === 4 ? 0.22 : 0.08) : 0, lean: mode === 'listen' ? 0.06 : 0 }, t); });
  // confetti falls after the cheer
  s.confetti.forEach((m) => { const d = m.userData, u = t - t0 - 0.2; m.visible = cheer && u > 0 && u < 6; if (!m.visible) return; m.position.set(d.x + Math.sin(u * 2 + d.ph) * 0.3, d.y0 - u * d.sp * 1.2, d.z); m.rotation.set(u * 4 + d.ph, u * 3, u * 5); });
  s.crows.forEach((c, i) => { const u = cheer ? Math.max(0, t - t0 - 0.3 - i * 0.15) : 0; if (!c.userData.home) c.userData.home = c.position.clone(); c.position.copy(c.userData.home).add(new THREE.Vector3(u * 2.2, u * 1.6 + Math.sin(u * 20) * 0.05 * Math.min(1, u * 5), -u * 1.5)); });
  s.coin.visible = false; s.stamp.visible = false;
}
function beachCast(t, mode, t0 = 0) {
  const b = S.beach;
  if (mode === 'puzzled' || mode === 'sad' || mode === 'pour') {
    const pour = mode === 'pour', sad = mode === 'sad';
    pose(b.ammini, { expr: sad ? 'sad' : pour ? 'think' : 'think', R: pour || sad ? 'holdUp' : 'chin', propR: pour ? 'sand' : null, L: pour ? 'hold' : 'hip', look: pour ? 0 : 1, lookY: pour ? 1 : 0 }, t);
    pose(b.fisher, { expr: sad ? 'sad' : 'nervous', L: 'shrug', R: 'shrug', look: -0.8 }, t);
    pose(b.kid, { expr: sad ? 'sad' : 'think', R: sad ? 'hang' : 'point', L: 'chin', look: 1 }, t);
    pose(b.brit, { expr: 'sly', R: 'scope', propR: 'scope', L: 'hip', look: -1 }, t); pose(b.yank, { expr: 'smug', L: 'chin', R: 'point', look: -1 }, t); return;
  }
  const glow = mode !== 'watch';
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
  const set = S[sh.set]; const tt = t - sh.a; set.life.forEach((f) => f(t)); resetProps(); sh.act(t, tt, sh);
  if (sh.set === 'street' && sh.act.toString().indexOf('streetCrowd') < 0) { /* crowd keeps idling */ }
  const c = camAt(sh.keys, tt); place(c, t, sh.shake != null ? shakeAt(t, sh.shake, 0.5) : 0); camera.updateMatrixWorld();
  const look = new THREE.Vector3(...c.l), focus = camera.position.distanceTo(look);
  const night = sh.set === 'concert';
  const cv = stage.render(set.scene, camera, { focus, aperture: night ? 7 : 6, hazeAmt: night ? 0.15 : 0.3, haze: night ? 0x5a5a9a : 0xdfe9f2, sat: night ? 1.12 : 1.1, contrast: 0.06, lift: night ? 0.03 : 0.015, warm: night ? -0.01 : 0.02, vignette: 0.3 });
  g.save(); g.globalAlpha = alpha; g.drawImage(cv, 0, 0, W, H); g.restore();
  if (sh.iris) iris(g, alpha);
  if (sh.nameplate) nameplate(g, t, sh.a + 0.3, alpha);
}
function iris(g, a) { // look-through telescope: brass ring + dark outside
  g.save(); g.globalAlpha = a; g.fillStyle = '#1a120e'; g.beginPath(); g.rect(0, 0, W, H); g.arc(W / 2, H * 0.46, 470, 0, Math.PI * 2, true); g.fill('evenodd');
  g.strokeStyle = '#c8962a'; g.lineWidth = 34; g.beginPath(); g.arc(W / 2, H * 0.46, 470, 0, 7); g.stroke(); g.strokeStyle = '#2a1c17'; g.lineWidth = 6; g.beginPath(); g.arc(W / 2, H * 0.46, 452, 0, 7); g.stroke(); g.beginPath(); g.arc(W / 2, H * 0.46, 488, 0, 7); g.stroke(); g.restore();
}
function nameplate(g, t, a0, alpha) {
  const p = ezo(span(t, a0, 0.35)); if (p <= 0) return; g.save(); g.globalAlpha = alpha * p; g.translate(W / 2, 640 - (1 - p) * 40);
  g.fillStyle = '#f4ecd6'; g.strokeStyle = '#2a1c17'; g.lineWidth = 7; g.beginPath(); g.roundRect(-400, -78, 800, 156, 18); g.fill(); g.stroke();
  g.fillStyle = '#8a1e1e'; g.fillRect(-400, -78, 800, 14);
  text(g, 'ദിവാൻ', 0, -16, { font: ML, weight: 800, size: 40, color: '#8a1e1e', align: 'center' }); text(g, 'സി.പി. രാമസ്വാമി അയ്യർ', 0, 50, { font: ML, weight: 800, size: 56, color: '#2a1c17', align: 'center' }); g.restore();
}

// captions: 1-2 words, white with a thick dark outline, at the very top (owner's call: keeps the action clear), 88->100% pop
function captions(g, s) {
  const t = s.t; let li = -1; for (let i = 0; s.line(i); i++) if (t >= s.cue(i) - 0.05 && t < s.cueEnd(i) + 0.15) li = i; if (li < 0) return;
  const words = s.line(li).split(/\s+/), a = s.cue(li), b = s.cueEnd(li), wl = (w) => [...w].reduce((x, ch) => x + cw(ch), 0), tot = words.reduce((x, w) => x + wl(w) + 2, 0); let acc = 0;
  const ws = words.map((w) => { const t0 = a + (acc / tot) * (b - a); acc += wl(w) + 2; return [w, t0]; });
  const chunks = []; for (let i = 0; i < ws.length;) { const n = ws[i][0].length > 9 || (ws[i + 1] && ws[i + 1][0].length > 9) ? 1 : 2; chunks.push(ws.slice(i, i + n)); i += n; }
  let k = 0; while (k + 1 < chunks.length && t >= chunks[k + 1][0][1]) k++;
  const str = chunks[k].map(([w]) => w).join(' '), p = ezo(span(t, chunks[k][0][1], 0.12)), sc = 0.88 + 0.12 * p;
  g.save(); g.translate(W / 2, 290); g.scale(sc, sc); g.font = `800 92px ${ML}`; const fsz = Math.min(92, 92 * 940 / (g.measureText(str).width + 1)); g.font = `800 ${fsz}px ${ML}`;
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineWidth = fsz * 0.22; g.strokeStyle = '#120c0a'; g.strokeText(str, 0, 0); g.fillStyle = '#ffffff'; g.fillText(str, 0, 0); g.restore();
}

let SH = null;
function main(g, s) {
  if (!SH) SH = shots(s);
  const t = s.t; let i = SH.findIndex((x) => t >= x.a && t < x.b); if (i < 0) i = t < SH[0].a ? 0 : SH.length - 1;
  const sh = SH[i], prev = SH[i - 1], XF = 0.3; // moving dissolve between different sets (both shots keep moving)
  if (prev && prev.set !== sh.set && t < sh.a + XF) { renderShot(g, prev, t); renderShot(g, sh, t, ez((t - sh.a) / XF)); }
  else renderShot(g, sh, t);
  captions(g, s);
}
function end(g, s) { main(g, s); }
export const scenes = { main, end };
export const hits = [];
export const extraHits = (timeline) => {
  // kit: ~8 hits per 10 s, whooshes on camera moves, chimes on reveals, foley locked to actions
  const m = timeline.scenes.find((x) => x.id === 'main'), out = []; const s = { line: (i) => m.cues[i]?.text, cue: (i) => m.cues[i].start, cueEnd: (i) => m.cues[i].end };
  const sh = shots(s); sh.forEach((x, i) => { if (!i) return; const cut = sh[i - 1].set !== x.set; if (cut || i % 5 === 0) out.push({ t: m.start + x.a - 0.15, kind: 'whoosh', vol: cut ? 0.22 : 0.1 }); });
  const at = (i, n) => m.start + wt(s, i, n), add = (t, kind, vol) => out.push({ t, kind, vol });
  add(at(0, 'ഇല്ല'), 'boom', 0.55); add(at(0, 'ഇല്ല') + 0.1, 'paper', 0.35); add(at(0, 'ലോകശക്തികൾ'), 'chime', 0.3);
  add(m.start + s.cue(1) + 0.15, 'chime', 0.35); add(at(1, 'തോറിയം'), 'chime', 0.4); add(at(1, 'സ്വർണ്ണം'), 'chime', 0.45);
  add(at(2, 'നാണയം') + 0.1, 'coin', 0.45); add(at(2, 'സ്റ്റാമ്പ്') + 0.3, 'thud', 0.45); for (let k = 0; k < 2; k++) add(at(2, 'പട്ടാളം') + k * 0.38, 'thud', 0.25); add(at(2, 'പിന്നെന്തിന്'), 'pop', 0.35);
  add(at(3, 'ചിരിച്ചു'), 'pop', 0.3); add(at(3, 'മാപ്പിൽ'), 'paper', 0.3); add(at(3, 'മറയ്ക്കാവുന്ന'), 'tick', 0.5);
  add(at(4, 'റേഡിയോ'), 'tick', 0.35); add(at(4, 'സ്വതന്ത്ര'), 'boom', 0.4); add(at(4, 'സ്വതന്ത്ര') + 0.2, 'chime', 0.4); add(at(4, 'ടെലിഗ്രാം'), 'paper', 0.4); add(at(4, 'ടെലിഗ്രാം') + 0.2, 'tick', 0.35);
  for (let k = 0; k < 3; k++) add(m.start + s.cue(5) + 0.15 + k * 0.72, 'paper', 0.2); for (let k = 0; k < 3; k++) add(at(5, 'ഡൽഹി') + k * 0.3, 'thud', 0.2); add(at(5, 'കുലുങ്ങിയില്ല'), 'hit', 0.4);
  add(at(6, 'സംഗീത'), 'chime', 0.25); add(at(6, 'ആക്രമി') + 0.1, 'boom', 0.6);
  add(at(7, 'കാത്തിരിക്കൂ'), 'pop', 0.3); for (let k = 0; k < 3; k++) add(at(7, 'അതെ') + k * 0.6, 'paper', 0.2); add(at(7, 'സമ്മതിച്ചു'), 'boom', 0.45);
  add(m.start + s.cue(8) + 0.1, 'chime', 0.4); add(at(8, 'കീറിപ്പോയ'), 'rip', 0.6);
  add(m.start + s.cue(9) + 0.2, 'chime', 0.45); for (let k = 0; k < 4; k++) add(m.start + s.cue(9) + 1.0 + k * 0.3, 'coin', 0.2); add(at(9, 'പാസ്‌പോർട്ട്'), 'pop', 0.45); add(at(9, 'പാസ്‌പോർട്ട്') + 0.5, 'thud', 0.4);
  for (let k = 0; k < 3; k++) add(at(9, 'എംബസികൾ') + k * 0.25, 'pop', 0.25); add(at(9, 'കപ്പലുകൾ'), 'horn', 0.5);
  add(at(10, 'മണൽ'), 'chime', 0.25); add(at(10, "'ഇല്ല'"), 'hit', 0.35);
  return out;
};
void H;
export const shotTimes = (timeline) => { const m = timeline.scenes.find((x) => x.id === 'main'); const s = { line: (i) => m.cues[i]?.text, cue: (i) => m.cues[i].start, cueEnd: (i) => m.cues[i].end }; return shots(s).map((x) => ({ a: m.start + x.a, b: m.start + x.b, set: x.set })); };
