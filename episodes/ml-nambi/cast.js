// ISRO spy case 1994: new cast in the bean style. Real people are friendly caricatures by costume only, never a photo
// or film likeness (no 'Rocketry' look). NAMBI (1994, cryogenic project head), NAMBI 2018 (grey, vindicated),
// a generic POLICE officer and CONSTABLE (unnamed), two REPORTERS, two NEIGHBOURS, a generic CBI officer, and a home
// COOK for the biryani analogy. The two Maldivian women are only ever SILHOUETTES (they were cleared too).
// The JUDGE is reused from ml-padmanabha.
import * as PAD from '/episodes/ml-padmanabha/cast.js';
const INK = '#2a1c17', OL = 6.5;
function ell(ctx, x, y, rx, ry, rot = 0) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); }
function fs(ctx, fill, w = OL) { if (fill) { ctx.fillStyle = fill; ctx.fill(); } ctx.lineWidth = w; ctx.strokeStyle = INK; ctx.stroke(); }
const both = (...fns) => (ctx) => fns.forEach((f) => f(ctx));

// ---------- heads (hair is drawn after the face, so glasses drawn here sit on top)
function squareGlasses(frame = '#2a1c17') { return (ctx) => { // big 90s square frames
  ctx.strokeStyle = frame; ctx.lineWidth = 4.5; for (const s of [-1, 1]) { ctx.beginPath(); ctx.roundRect(s * 21 - 17, -316, 34, 28, 6); ctx.fillStyle = 'rgba(220,240,255,.22)'; ctx.fill(); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(-4, -306); ctx.lineTo(4, -306); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-38, -308); ctx.lineTo(-52, -304); ctx.moveTo(38, -308); ctx.lineTo(52, -304); ctx.stroke(); }; }
function backSwept(color = '#1a120d', grey = null) { return (ctx) => { // neat back-combed hair, high forehead
  ctx.beginPath(); ctx.moveTo(-54, -298); ctx.bezierCurveTo(-62, -350, -30, -372, 0, -370); ctx.bezierCurveTo(30, -372, 62, -350, 54, -298); ctx.quadraticCurveTo(46, -330, 24, -340); ctx.quadraticCurveTo(0, -346, -24, -340); ctx.quadraticCurveTo(-46, -330, -54, -298); ctx.closePath(); fs(ctx, color, 4.5);
  if (grey) { ctx.strokeStyle = grey; ctx.lineWidth = 3; for (const x of [-30, -12, 8, 26]) { ctx.beginPath(); ctx.moveTo(x, -366); ctx.quadraticCurveTo(x + 6, -354, x + 4, -344); ctx.stroke(); } } }; }
function thickStache(color) { return (ctx) => { ctx.beginPath(); ctx.moveTo(-26, -276); ctx.quadraticCurveTo(-12, -294, 0, -284); ctx.quadraticCurveTo(12, -294, 26, -276); ctx.quadraticCurveTo(12, -280, 0, -276); ctx.quadraticCurveTo(-12, -280, -26, -276); ctx.closePath(); fs(ctx, color, 3); }; }
function thinWhite(color = '#eeeae2') { return (ctx) => { // receding white hair: full sides, a few strands swept back over the crown
  for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sd * 54, -296); ctx.bezierCurveTo(sd * 62, -330, sd * 50, -352, sd * 30, -356); ctx.quadraticCurveTo(sd * 42, -334, sd * 44, -312); ctx.closePath(); fs(ctx, color, 4); }
  ctx.strokeStyle = INK; ctx.lineWidth = 8; ctx.beginPath(); for (const x of [-22, 0, 22]) { ctx.moveTo(x - 6, -346); ctx.quadraticCurveTo(x, -356, x + 8, -350); } ctx.stroke(); ctx.strokeStyle = color; ctx.lineWidth = 4; ctx.stroke(); }; }
function hairShort(color, part = 1) { return (ctx) => { ctx.beginPath(); ctx.moveTo(-54, -300); ctx.bezierCurveTo(-60, -366, 58, -372, 54, -300); ctx.quadraticCurveTo(44, -330, part * 10, -338); ctx.quadraticCurveTo(-30, -326, -54, -300); ctx.closePath(); fs(ctx, color); }; }
function policeCap(ctx) { // khaki peaked cap, red band, brass badge
  ctx.beginPath(); ctx.moveTo(-58, -326); ctx.bezierCurveTo(-64, -384, 64, -384, 58, -326); ctx.closePath(); fs(ctx, '#a8946a');
  ctx.beginPath(); ctx.rect(-56, -336, 112, 12); fs(ctx, '#b0243a', 3.5); ell(ctx, 0, -352, 11, 12); fs(ctx, '#e8b93a', 3);
  ctx.beginPath(); ctx.moveTo(-50, -324); ctx.quadraticCurveTo(0, -306, 58, -322); ctx.lineTo(54, -316); ctx.quadraticCurveTo(0, -300, -46, -318); ctx.closePath(); fs(ctx, '#2a1c17', 3); }
function bunHair(color = '#1a120d') { return (ctx) => { ctx.beginPath(); ctx.moveTo(-56, -296); ctx.bezierCurveTo(-60, -364, 60, -364, 56, -296); ctx.quadraticCurveTo(40, -336, 0, -338); ctx.quadraticCurveTo(-40, -336, -56, -296); ctx.closePath(); fs(ctx, color); ell(ctx, 0, -360, 22, 16); fs(ctx, color); }; }
function pressCap(ctx) { ctx.beginPath(); ctx.moveTo(-54, -318); ctx.bezierCurveTo(-56, -372, 56, -372, 54, -318); ctx.closePath(); fs(ctx, '#2f5f8a'); ctx.beginPath(); ctx.moveTo(40, -322); ctx.lineTo(92, -316); ctx.lineTo(50, -308); ctx.closePath(); fs(ctx, '#2f5f8a', 4); ctx.fillStyle = '#fbfaf6'; ctx.font = "700 14px 'Oswald'"; ctx.textAlign = 'center'; ctx.fillText('PRESS', 0, -340); }
function scarf(color) { return (ctx) => { ctx.beginPath(); ctx.moveTo(-62, -250); ctx.quadraticCurveTo(-72, -330, -50, -350); ctx.bezierCurveTo(-30, -390, 30, -390, 50, -350); ctx.quadraticCurveTo(72, -330, 62, -250); ctx.lineTo(44, -256); ctx.quadraticCurveTo(52, -318, 30, -334); ctx.quadraticCurveTo(0, -342, -30, -334); ctx.quadraticCurveTo(-52, -318, -44, -256); ctx.closePath(); fs(ctx, color); }; }

// ---------- torso layers
const isroShirt = (ctx, top, bot) => { // 90s half-sleeve shirt: pocket with pens, clip-on ID badge
  ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.strokeRect(14, top + 18, 26, 26); ctx.fillStyle = '#2a4a9a'; ctx.fillRect(20, top + 8, 4, 18); ctx.fillStyle = '#1a1a1a'; ctx.fillRect(30, top + 10, 4, 16);
  ctx.fillStyle = '#fbfaf6'; ctx.fillRect(-42, top + 26, 24, 30); ctx.strokeRect(-42, top + 26, 24, 30); ctx.fillStyle = '#e8742a'; ctx.fillRect(-42, top + 26, 24, 8); ctx.fillStyle = '#2a4a9a'; ell(ctx, -30, top + 44, 6, 6); ctx.fill();
};
const khaki = (ctx, top, bot) => { // police: shoulder flaps, two chest pockets, name strip, black belt with buckle, lanyard
  ctx.strokeStyle = INK; ctx.lineWidth = 3; for (const s of [-1, 1]) { ctx.strokeRect(s * 28 - 13, top + 18, 26, 24); ctx.beginPath(); ctx.moveTo(s * 66, top - 2); ctx.lineTo(s * 40, top - 6); ctx.stroke(); }
  ctx.fillStyle = '#1a1a1a'; ctx.fillRect(-68, bot - 26, 136, 13); ctx.fillStyle = '#e8b93a'; ctx.fillRect(-9, bot - 28, 18, 17);
  ctx.fillStyle = '#fbfaf6'; ctx.fillRect(-42, top + 6, 28, 8); ctx.strokeStyle = '#c8312c'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(-60, top); ctx.quadraticCurveTo(-40, top + 40, -50, top + 60); ctx.stroke();
};
const safari = (ctx, top, bot) => { ctx.strokeStyle = INK; ctx.lineWidth = 3; for (const s of [-1, 1]) { ctx.strokeRect(s * 30 - 14, top + 16, 28, 26); ctx.beginPath(); ctx.moveTo(s * 30 - 14, top + 22); ctx.lineTo(s * 30 + 14, top + 22); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(0, top - 6); ctx.lineTo(0, bot); ctx.stroke(); ctx.fillStyle = '#5a4a32'; ctx.fillRect(-66, bot - 28, 132, 10); };
const reporterVest = (ctx, top, bot) => { ctx.fillStyle = '#6a7a4a'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 70, top); ctx.lineTo(s * 18, top - 4); ctx.lineTo(s * 8, bot + 6); ctx.lineTo(s * 70, bot + 6); ctx.closePath(); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke(); ctx.strokeRect(s * 44 - 12, top + 40, 24, 18); } };
const blouse = (col) => (ctx, top, bot) => { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-44, top - 6); ctx.lineTo(-22, top - 6); ctx.lineTo(48, bot); ctx.lineTo(26, bot); ctx.closePath(); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke(); };
const apron = (ctx, top, bot) => { ctx.fillStyle = '#f6f1e4'; ctx.beginPath(); ctx.moveTo(-40, top + 30); ctx.lineTo(40, top + 30); ctx.lineTo(50, bot + 8); ctx.lineTo(-50, bot + 8); ctx.closePath(); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke(); ctx.fillStyle = '#e8742a'; ctx.fillRect(-50, bot - 2, 100, 8); };
const kurtaWhite = (ctx, top, bot) => { ctx.strokeStyle = 'rgba(42,28,23,.5)'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(0, top - 4); ctx.lineTo(0, top + 50); ctx.stroke(); for (let y = top + 10; y < top + 50; y += 12) { ell(ctx, 0, y, 3, 3); ctx.fillStyle = '#c9b48a'; ctx.fill(); } };

export const NEW_CAST = {
  nambi: { name: 'NAMBI NARAYANAN (1994)', skin: '#b98257', hair: both(backSwept('#1a120d'), thickStache('#1a120d'), squareGlasses()), shirt: '#dfe8f0', shirtDark: '#b8c8d6', collar: true, over: isroShirt, lower: 'pants', mundu: '#5a5a62', legs: '#4a4a52', shoes: '#2a1c17' },
  nambiOld: { name: 'NAMBI NARAYANAN (2018)', skin: '#b98257', hair: both(thinWhite(), thickStache('#e6e1d8'), squareGlasses('#6a5a4a')), wrinkles: true, shirt: '#fbfaf6', shirtDark: '#dcd8ce', collar: true, over: kurtaWhite, lower: 'mundu', mundu: '#f6f1e4', kasavu: '#c9b48a', legs: '#86562f', shoes: '#4a3022' },
  police: { name: 'POLICE OFFICER (generic)', skin: '#a87048', hair: both(thickStache('#1a120d'), policeCap), shirt: '#b8a478', shirtDark: '#96845a', collar: true, over: khaki, lower: 'pants', mundu: '#b8a478', legs: '#96845a', shoes: '#1a120d' },
  constable: { name: 'CONSTABLE', skin: '#9c6640', hair: both(thickStache('#1a120d'), policeCap), shirt: '#b8a478', shirtDark: '#96845a', collar: true, over: khaki, lower: 'pants', mundu: '#b8a478', legs: '#96845a', shoes: '#1a120d' },
  reporter: { name: 'REPORTER (camera)', skin: '#c68b62', hair: both(hairShort('#2a2018', -1), pressCap), shirt: '#e8dcc0', shirtDark: '#c8b896', collar: true, over: reporterVest, lower: 'pants', mundu: '#3a3f4a', legs: '#3a3f4a', shoes: '#2a1c17' },
  reporter2: { name: 'REPORTER (notepad)', skin: '#b67a52', hair: bunHair('#1a120d'), glasses: true, shirt: '#c8562a', shirtDark: '#a8421e', over: blouse('#e8b93a'), lower: 'mundu', mundu: '#2f5f8a', kasavu: '#2f5f8a', legs: '#86562f', shoes: '#3a2a20' },
  neighbour: { name: 'NEIGHBOUR 1', skin: '#a87048', hair: hairShort('#2a2018', 1), stache: true, shirt: '#2f6a3a', shirtDark: '#1f4a28', collar: true, pocket: true, lower: 'mundu', mundu: '#f6f1e4', kasavu: '#8c6b3a', legs: '#86562f', shoes: '#3a2a20' },
  neighbour2: { name: 'NEIGHBOUR 2', skin: '#b67a52', hair: bunHair('#bdb6ad'), wrinkles: true, shirt: '#8a3a5a', shirtDark: '#6a2a42', over: blouse('#f6f1e4'), lower: 'mundu', mundu: '#f6f1e4', kasavu: '#8a3a5a', legs: '#86562f', shoes: '#86562f' },
  cbi: { name: 'CBI OFFICER (generic)', skin: '#c08a5e', hair: hairShort('#3a3a3a', 1), glasses: true, stache: true, shirt: '#8a7a5a', shirtDark: '#6a5a3e', collar: true, over: safari, lower: 'pants', mundu: '#8a7a5a', legs: '#6a5a3e', shoes: '#2a1c17' },
  cook: { name: 'HOME COOK (analogy)', skin: '#b98257', hair: bunHair('#2a2018'), shirt: '#2f8a8a', shirtDark: '#1f6a6a', over: apron, lower: 'mundu', mundu: '#e8742a', kasavu: '#e8742a', legs: '#86562f', shoes: '#86562f' },
  shadowWoman: { name: 'SILHOUETTE (unnamed)', silhouette: true, skin: '#2a2430', hair: scarf('#2a2430'), shirt: '#2a2430', shirtDark: '#1e1a24', lower: 'mundu', mundu: '#2a2430', kasavu: '#2a2430', legs: '#1e1a24', shoes: '#1e1a24' },
};

export const NEW_PROPS = {
  handcuffs: (ctx) => { ctx.lineWidth = 7; for (const x of [-14, 18]) { ell(ctx, x, -14, 15, 15); ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 4; ctx.strokeStyle = '#c8ccd4'; ctx.stroke(); ctx.lineWidth = 7; }
    ctx.strokeStyle = '#c8ccd4'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(1, -14); ctx.lineTo(4, -10); ctx.lineTo(7, -14); ctx.stroke(); },
  blueprint: (ctx) => { ctx.save(); ctx.rotate(-0.15); ctx.beginPath(); ctx.rect(-6, -54, 70, 54); fs(ctx, '#2f5f9a', 4); ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(20, -46); ctx.lineTo(36, -46); ctx.lineTo(42, -24); ctx.lineTo(50, -8); ctx.lineTo(6, -8); ctx.lineTo(14, -24); ctx.closePath(); ctx.stroke(); ctx.restore(); },
  newspaper: (ctx) => { ctx.save(); ctx.rotate(-0.12); ctx.beginPath(); ctx.rect(-6, -66, 70, 66); fs(ctx, '#f4ecd6', 4); ctx.fillStyle = '#c8312c'; ctx.font = "700 20px 'Oswald'"; ctx.textAlign = 'center'; ctx.fillText('SPY!', 29, -40);
    ctx.strokeStyle = 'rgba(42,28,23,.5)'; ctx.lineWidth = 2; for (let y = -30; y < -6; y += 6) { ctx.beginPath(); ctx.moveTo(2, y); ctx.lineTo(56, y); ctx.stroke(); } ctx.restore(); },
  notepad: (ctx) => { ctx.save(); ctx.rotate(-0.2); ctx.beginPath(); ctx.rect(-4, -42, 34, 44); fs(ctx, '#fbfaf6', 4); ctx.fillStyle = INK; ctx.fillRect(-4, -46, 34, 6); ctx.strokeStyle = 'rgba(42,28,23,.5)'; ctx.lineWidth = 2; for (let y = -30; y < 0; y += 7) { ctx.beginPath(); ctx.moveTo(2, y); ctx.lineTo(24, y); ctx.stroke(); } ctx.restore(); },
  camera: (ctx) => { ctx.beginPath(); ctx.rect(-10, -36, 56, 36); fs(ctx, '#2a2a30', 4); ell(ctx, 18, -18, 13, 13); fs(ctx, '#4a5a6a', 4); ell(ctx, 18, -18, 6, 6); ctx.fillStyle = '#9fd8ff'; ctx.fill();
    ctx.beginPath(); ctx.rect(30, -50, 14, 14); fs(ctx, '#fbfaf6', 3); },
  file: (ctx) => { ctx.save(); ctx.rotate(-0.12); ctx.beginPath(); ctx.rect(-6, -56, 62, 56); fs(ctx, '#e8c88a', 4); ctx.beginPath(); ctx.rect(-6, -62, 24, 8); fs(ctx, '#e8c88a', 3);
    ctx.save(); ctx.translate(25, -26); ctx.rotate(-0.2); ctx.strokeStyle = '#c8312c'; ctx.lineWidth = 3; ctx.strokeRect(-24, -10, 48, 20); ctx.fillStyle = '#c8312c'; ctx.font = "700 14px 'Oswald'"; ctx.textAlign = 'center'; ctx.fillText('FALSE', 0, 5); ctx.restore(); ctx.restore(); },
  lathi: (ctx) => { ctx.save(); ctx.rotate(0.25); ctx.beginPath(); ctx.rect(-5, -110, 10, 130); fs(ctx, '#b8862a', 3.5); ctx.restore(); },
  ladle: (ctx) => { ctx.save(); ctx.rotate(-0.4); ctx.beginPath(); ctx.rect(-3, -90, 6, 80); fs(ctx, '#c8ccd4', 3); ell(ctx, 0, -96, 16, 10); fs(ctx, '#c8ccd4', 3.5); ctx.restore(); },
  emptyPot: (ctx) => { ctx.beginPath(); ctx.moveTo(-34, -46); ctx.lineTo(44, -46); ctx.quadraticCurveTo(48, 0, 5, 2); ctx.quadraticCurveTo(-38, 0, -34, -46); ctx.closePath(); fs(ctx, '#c8ccd4', 4); ell(ctx, 5, -46, 39, 8); fs(ctx, '#6a6e76', 3.5); },
  medal: (ctx) => { ctx.strokeStyle = '#c8312c'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-8, -60); ctx.lineTo(0, -28); ctx.lineTo(8, -60); ctx.stroke(); ell(ctx, 0, -18, 16, 16); fs(ctx, '#e8b93a', 4); ctx.fillStyle = '#fbfaf6'; ctx.beginPath(); ctx.arc(0, -18, 6, 0, 7); ctx.fill(); },
  cheque: (ctx) => { ctx.save(); ctx.rotate(-0.12); ctx.beginPath(); ctx.rect(-6, -34, 92, 34); fs(ctx, '#d8eadb', 4); ctx.fillStyle = INK; ctx.font = "800 13px 'Noto Malayalam'"; ctx.textAlign = 'center'; ctx.fillText('₹50 ലക്ഷം', 40, -12); ctx.restore(); },
  engineModel: (ctx) => { ctx.save(); ctx.rotate(-0.1); ctx.beginPath(); ctx.rect(-4, -70, 30, 30); fs(ctx, '#c8ccd4', 4); ctx.beginPath(); ctx.moveTo(0, -40); ctx.lineTo(22, -40); ctx.lineTo(36, 0); ctx.lineTo(-14, 0); ctx.closePath(); fs(ctx, '#b0b6c0', 4);
    ctx.fillStyle = 'rgba(220,240,255,.85)'; for (const [x, y] of [[-6, -10], [4, -22], [24, -14], [10, -6]]) { ell(ctx, x, y, 4, 2.5); ctx.fill(); } ctx.restore(); },
};
export function registerCast(B) { PAD.registerCast(B); Object.assign(B.CAST, NEW_CAST); Object.assign(B.PROPS, NEW_PROPS); }
