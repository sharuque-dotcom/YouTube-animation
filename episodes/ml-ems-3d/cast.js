// 1957 EMS government: new cast in the bean style. Real people are friendly caricatures by costume only, never a photo
// likeness: EMS (white jubba + mundu, round glasses, side parting), NEHRU (Gandhi cap, achkan, a rose), MANNATHU
// PADMANABHAN (bald, white moustache, shawl). The protest front is GENERIC figures (priest, League man, Congress man,
// landlord), the people are a tenant FARMER, a TEACHER, the cricket UMPIRE and BATTER. Police come from ml-nambi.
import * as NAM from '/episodes/ml-nambi/cast.js';
const INK = '#2a1c17', OL = 6.5;
function ell(ctx, x, y, rx, ry, rot = 0) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); }
function fs(ctx, fill, w = OL) { if (fill) { ctx.fillStyle = fill; ctx.fill(); } ctx.lineWidth = w; ctx.strokeStyle = INK; ctx.stroke(); }
const both = (...fns) => (ctx) => fns.forEach((f) => f(ctx));

// ---------- heads
function roundGlasses(frame = '#2a1c17') { return (ctx) => { ctx.strokeStyle = frame; ctx.lineWidth = 4.5;
  for (const s of [-1, 1]) { ell(ctx, s * 21, -304, 15, 14); ctx.fillStyle = 'rgba(220,240,255,.22)'; ctx.fill(); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(-6, -306); ctx.quadraticCurveTo(0, -311, 6, -306); ctx.moveTo(-36, -306); ctx.lineTo(-52, -302); ctx.moveTo(36, -306); ctx.lineTo(52, -302); ctx.stroke(); }; }
function sidePart(color = '#1a120d', grey = '#9a948c') { return (ctx) => { // EMS: short hair, deep left side parting, greying temples
  ctx.beginPath(); ctx.moveTo(-55, -296); ctx.bezierCurveTo(-62, -350, -34, -362, -18, -360); ctx.quadraticCurveTo(14, -366, 56, -330); ctx.quadraticCurveTo(58, -316, 54, -298);
  ctx.quadraticCurveTo(44, -334, -14, -344); ctx.quadraticCurveTo(-46, -332, -55, -296); ctx.closePath(); fs(ctx, color, 4.5);
  ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-8, -356); ctx.quadraticCurveTo(20, -356, 44, -334); ctx.stroke();
  ctx.fillStyle = grey; for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 54, -300); ctx.quadraticCurveTo(s * 58, -318, s * 52, -324); ctx.lineTo(s * 48, -304); ctx.closePath(); ctx.fill(); } }; }
function gandhiCap(cap = '#f8f6ee', side = '#cfc8be') { return (ctx) => { // folded khadi cap, a fold line and grey side hair
  ctx.fillStyle = side; for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * 50, -304, 8, 16, s * 0.2, 0, 7); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(-58, -326); ctx.lineTo(-48, -364); ctx.quadraticCurveTo(0, -378, 48, -364); ctx.lineTo(58, -326); ctx.quadraticCurveTo(0, -336, -58, -326); ctx.closePath(); fs(ctx, cap, 5);
  ctx.strokeStyle = 'rgba(42,28,23,.45)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-46, -342); ctx.quadraticCurveTo(0, -352, 46, -342); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, -372); ctx.lineTo(0, -346); ctx.stroke(); }; }
function bald(side = '#efebe4') { return (ctx) => { ctx.fillStyle = side; for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * 50, -302, 9, 18, s * 0.2, 0, 7); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,255,255,.35)'; ell(ctx, -16, -336, 16, 7, -0.3); ctx.fill(); }; }
function whiteStache(color = '#f2eee6') { return (ctx) => { ctx.beginPath(); ctx.moveTo(-30, -276); ctx.quadraticCurveTo(-14, -296, 0, -284); ctx.quadraticCurveTo(14, -296, 30, -276); ctx.quadraticCurveTo(14, -282, 0, -277); ctx.quadraticCurveTo(-14, -282, -30, -276); ctx.closePath(); fs(ctx, color, 3); }; }
function bigStache(color = '#1a120d') { return (ctx) => { ctx.beginPath(); ctx.moveTo(-38, -270); ctx.quadraticCurveTo(-30, -292, -10, -288); ctx.quadraticCurveTo(0, -286, 10, -288); ctx.quadraticCurveTo(30, -292, 38, -270); ctx.quadraticCurveTo(22, -280, 0, -278); ctx.quadraticCurveTo(-22, -280, -38, -270); ctx.closePath(); fs(ctx, color, 3); }; }
function hairShort(color, part = 1) { return (ctx) => { ctx.beginPath(); ctx.moveTo(-54, -300); ctx.bezierCurveTo(-60, -366, 58, -372, 54, -300); ctx.quadraticCurveTo(44, -330, part * 10, -338); ctx.quadraticCurveTo(-30, -326, -54, -300); ctx.closePath(); fs(ctx, color); }; }
function thoppi(color = '#fbfaf6') { return (ctx) => { ctx.beginPath(); ctx.moveTo(-50, -330); ctx.bezierCurveTo(-48, -378, 48, -378, 50, -330); ctx.quadraticCurveTo(0, -340, -50, -330); ctx.closePath(); fs(ctx, color, 4.5);
  ctx.strokeStyle = 'rgba(42,28,23,.3)'; ctx.lineWidth = 2; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(-44, -342 - k * 9); ctx.quadraticCurveTo(0, -352 - k * 9, 44, -342 - k * 9); ctx.stroke(); } }; }
function towelHead(color = '#efe6d0') { return (ctx) => { ctx.beginPath(); ctx.moveTo(-58, -318); ctx.bezierCurveTo(-60, -368, 60, -368, 58, -318); ctx.quadraticCurveTo(0, -330, -58, -318); ctx.closePath(); fs(ctx, color, 4.5);
  ctx.strokeStyle = '#c8312c'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-54, -326); ctx.quadraticCurveTo(0, -338, 54, -326); ctx.stroke(); ctx.beginPath(); ctx.moveTo(48, -336); ctx.quadraticCurveTo(70, -330, 66, -306); ctx.lineTo(56, -312); ctx.closePath(); fs(ctx, color, 3.5); }; }
function sunHat(color = '#fbfaf6') { return (ctx) => { ctx.beginPath(); ctx.ellipse(0, -330, 82, 14, 0, 0, 7); fs(ctx, color, 4.5); ctx.beginPath(); ctx.moveTo(-48, -330); ctx.bezierCurveTo(-46, -384, 46, -384, 48, -330); ctx.closePath(); fs(ctx, color, 4.5);
  ctx.fillStyle = '#2a1c17'; ctx.fillRect(-48, -342, 96, 8); }; }
function cricketCap(color = '#b0243a') { return (ctx) => { ctx.beginPath(); ctx.moveTo(-54, -318); ctx.bezierCurveTo(-56, -376, 56, -376, 54, -318); ctx.closePath(); fs(ctx, color); ctx.beginPath(); ctx.moveTo(40, -322); ctx.lineTo(94, -314); ctx.lineTo(48, -306); ctx.closePath(); fs(ctx, color, 4);
  ctx.fillStyle = '#f6d24a'; ctx.beginPath(); ctx.arc(0, -348, 7, 0, 7); ctx.fill(); }; }

// ---------- torso layers (clipped to the torso)
const jubba = (ctx, top, bot) => { // EMS: white half-sleeve jubba, side placket with cloth buttons, a red pen in the pocket
  ctx.strokeStyle = 'rgba(42,28,23,.45)'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(-6, top - 4); ctx.lineTo(-6, top + 52); ctx.stroke();
  for (let y = top + 10; y < top + 52; y += 13) { ell(ctx, -6, y, 3, 3); ctx.fillStyle = '#d8ccb0'; ctx.fill(); }
  ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.strokeRect(14, top + 26, 24, 22); ctx.fillStyle = '#c8312c'; ctx.fillRect(22, top + 14, 5, 18); };
const achkan = (ctx, top, bot) => { // Nehru: long buttoned coat, high collar, a red rose
  ctx.fillStyle = 'rgba(0,0,0,.08)'; ctx.fillRect(-60, top, 120, bot - top + 10); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, top - 6); ctx.lineTo(0, bot + 4); ctx.stroke();
  for (let y = top + 14; y < bot - 4; y += 18) { ell(ctx, 0, y, 3.6, 3.6); ctx.fillStyle = '#8a7a5a'; ctx.fill(); }
  ctx.fillStyle = '#e8e2d2'; ctx.fillRect(-20, top - 6, 40, 10); ctx.strokeRect(-20, top - 6, 40, 10);
  ctx.save(); ctx.translate(-30, top + 26); ctx.fillStyle = '#2f7a3a'; ctx.beginPath(); ctx.ellipse(-6, 10, 8, 4, 0.6, 0, 7); ctx.fill(); ctx.fillStyle = '#d0281e'; ell(ctx, 0, 0, 10, 9); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.strokeStyle = '#8a1414'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 5, 0, 5); ctx.stroke(); ctx.restore(); };
const khadi = (ctx, top, bot) => { // Congress man: khadi kurta + a small tricolour badge
  ctx.strokeStyle = 'rgba(42,28,23,.4)'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(0, top - 4); ctx.lineTo(0, top + 46); ctx.stroke();
  ctx.save(); ctx.translate(-30, top + 28); [['#e8742a', -8], ['#fbfaf6', 0], ['#2f8a3a', 8]].forEach(([c, y]) => { ctx.fillStyle = c; ctx.fillRect(-12, y - 4, 24, 8); }); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(-12, -12, 24, 24); ctx.restore(); };
const greenShawl = (ctx, top, bot) => { ctx.fillStyle = '#2f7a3a'; ctx.beginPath(); ctx.moveTo(-44, top - 6); ctx.lineTo(-20, top - 6); ctx.lineTo(50, bot); ctx.lineTo(26, bot); ctx.closePath(); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke(); };
const cassock = (ctx, top, bot) => { // generic priest: white cassock, black buttons, a red sash, small cross
  ctx.strokeStyle = 'rgba(42,28,23,.45)'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(0, top - 4); ctx.lineTo(0, bot + 4); ctx.stroke(); for (let y = top + 8; y < bot - 20; y += 12) { ell(ctx, 0, y, 2.6, 2.6); ctx.fillStyle = INK; ctx.fill(); }
  ctx.fillStyle = '#b0243a'; ctx.fillRect(-60, bot - 30, 120, 12); ctx.strokeStyle = '#d9a521'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-26, top + 18); ctx.lineTo(-26, top + 44); ctx.moveTo(-34, top + 26); ctx.lineTo(-18, top + 26); ctx.stroke(); };
const goldChain = (ctx, top, bot) => { // landlord: fine shirt, heavy gold chain, a ring of keys at the waist
  ctx.strokeStyle = '#d9a521'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-26, top - 2); ctx.quadraticCurveTo(0, top + 56, 26, top - 2); ctx.stroke(); ell(ctx, 0, top + 30, 8, 10); ctx.fillStyle = '#e8b93a'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.strokeStyle = '#8a7a5a'; ctx.lineWidth = 3; ell(ctx, 34, bot - 14, 9, 9); ctx.stroke(); };
const teacherShirt = (ctx, top, bot) => { ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.strokeRect(14, top + 20, 24, 22); ctx.fillStyle = '#2a4a9a'; ctx.fillRect(20, top + 10, 4, 16); ctx.fillStyle = '#1a1a1a'; ctx.fillRect(28, top + 12, 4, 14); };
const umpireCoat = (ctx, top, bot) => { ctx.strokeStyle = 'rgba(42,28,23,.45)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-20, top - 4); ctx.lineTo(0, top + 40); ctx.lineTo(20, top - 4); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, top + 40); ctx.lineTo(0, bot); ctx.stroke(); for (const y of [top + 56, top + 80]) { ell(ctx, 0, y, 3.5, 3.5); ctx.fillStyle = INK; ctx.fill(); } };
const jersey = (ctx, top, bot) => { ctx.fillStyle = '#fbfaf6'; ctx.fillRect(-60, top + 38, 120, 10); ctx.font = "700 30px 'Oswald'"; ctx.fillStyle = '#f6d24a'; ctx.textAlign = 'center'; ctx.fillText('57', 0, top + 90); };

export const NEW_CAST = {
  ems: { name: 'E.M.S. NAMBOODIRIPAD', skin: '#c08a5e', hair: both(sidePart(), roundGlasses()), shirt: '#fbfaf6', shirtDark: '#ddd8cc', over: jubba, lower: 'mundu', mundu: '#f6f1e4', kasavu: '#c9b48a', legs: '#86562f', shoes: '#5a3a26' },
  nehru: { name: 'NEHRU (Delhi)', skin: '#e0ac84', hair: gandhiCap(), shirt: '#f1ebdc', shirtDark: '#d6cdb8', over: achkan, lower: 'pants', mundu: '#f4efe4', legs: '#d6cdb8', shoes: '#4a3022' },
  mannathu: { name: 'MANNATHU PADMANABHAN', skin: '#b98257', hair: both(bald(), whiteStache()), wrinkles: true, glasses: true, bare: true, neriyathu: true, shirt: '#b98257', shirtDark: '#9c6a44', lower: 'mundu', mundu: '#f6f1e4', kasavu: '#c9b48a', legs: '#86562f', shoes: '#5a3a26' },
  priest: { name: 'PRIEST (generic)', skin: '#b88058', hair: hairShort('#2a2018', -1), glasses: true, shirt: '#fbfaf6', shirtDark: '#dedad2', over: cassock, lower: 'mundu', mundu: '#fbfaf6', kasavu: '#fbfaf6', legs: '#86562f', shoes: '#2a1c17' },
  leaguer: { name: 'LEAGUE MAN (generic)', skin: '#a87048', hair: thoppi(), stache: true, shirt: '#fbfaf6', shirtDark: '#dcd8ce', collar: true, over: greenShawl, lower: 'mundu', mundu: '#f6f1e4', kasavu: '#2f7a3a', legs: '#86562f', shoes: '#3a2a20' },
  congress: { name: 'CONGRESS MAN (generic)', skin: '#b67a52', hair: gandhiCap(), glasses: true, shirt: '#f4f1e8', shirtDark: '#d6d0c0', over: khadi, lower: 'mundu', mundu: '#f6f1e4', kasavu: '#8c6b3a', legs: '#86562f', shoes: '#3a2a20' },
  landlord: { name: 'LANDLORD (janmi)', skin: '#c99068', hair: both(bald('#2a2018'), bigStache()), shirt: '#f6f0dc', shirtDark: '#d8ceb4', over: goldChain, lower: 'mundu', mundu: '#f6f1e4', kasavu: '#d9a521', legs: '#86562f', shoes: '#4a3022' },
  farmer: { name: 'TENANT FARMER', skin: '#8e5a36', hair: both(towelHead(), (ctx) => { ctx.beginPath(); ctx.moveTo(-26, -276); ctx.quadraticCurveTo(-12, -292, 0, -282); ctx.quadraticCurveTo(12, -292, 26, -276); ctx.quadraticCurveTo(0, -280, -26, -276); ctx.closePath(); fs(ctx, '#1a120d', 3); }), bare: true, shirt: '#8e5a36', shirtDark: '#6e4426', lower: 'lungi', mundu: '#c8a878', kasavu: '#8a5a2a', legs: '#6e4426', shoes: '#6e4426' },
  teacher: { name: 'SCHOOL TEACHER', skin: '#c08a5e', hair: hairShort('#2a2018', 1), glasses: true, stache: true, shirt: '#e8eef4', shirtDark: '#c4ccd6', collar: true, over: teacherShirt, lower: 'mundu', mundu: '#f6f1e4', kasavu: '#8c6b3a', legs: '#86562f', shoes: '#3a2a20' },
  umpire: { name: 'UMPIRE', skin: '#c99068', hair: sunHat(), shirt: '#fbfaf6', shirtDark: '#dcd8ce', over: umpireCoat, lower: 'pants', mundu: '#2a2a30', legs: '#2a2a30', shoes: '#1a120d' },
  batter: { name: 'BATTER (EMS side)', skin: '#a87048', hair: cricketCap('#b0243a'), shirt: '#c8312c', shirtDark: '#9b211e', collar: true, over: jersey, lower: 'pants', mundu: '#fbfaf6', legs: '#dcd8ce', shoes: '#fbfaf6' },
};

// ---------- props (drawn in hand space; text props go in the R hand)
function flagOn(ctx, draw, h = 130) { ctx.save(); ctx.rotate(0.12); ctx.strokeStyle = INK; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(0, 30); ctx.lineTo(0, -h); ctx.stroke(); ctx.strokeStyle = '#b8862a'; ctx.lineWidth = 4; ctx.stroke();
  ctx.translate(2, -h); draw(ctx); ctx.restore(); }
function hammerSickle(ctx, x, y, s, col = '#f6d24a') { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.strokeStyle = col; ctx.lineCap = 'round';
  ctx.lineWidth = 3.2; ctx.beginPath(); ctx.arc(1, -1, 9, Math.PI * 0.95, Math.PI * 2.35); ctx.stroke(); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-7, 9); ctx.lineTo(-3, 5); ctx.stroke();
  ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(-6, -8); ctx.lineTo(8, 8); ctx.stroke(); ctx.lineWidth = 4.5; ctx.beginPath(); ctx.moveTo(-9, -5); ctx.lineTo(-3, -11); ctx.stroke(); ctx.restore(); }
export { hammerSickle };
export const NEW_PROPS = {
  redFlag: (ctx) => flagOn(ctx, (c) => { c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(36, -8, 76, 4); c.lineTo(76, 54); c.quadraticCurveTo(36, 42, 0, 50); c.closePath(); fs(c, '#d0281e', 4); hammerSickle(c, 34, 24, 1.1); }),
  triFlag: (ctx) => flagOn(ctx, (c) => { [['#e8742a', 0], ['#fbfaf6', 17], ['#2f8a3a', 34]].forEach(([col, y]) => { c.fillStyle = col; c.fillRect(0, y, 76, 17); }); c.strokeStyle = INK; c.lineWidth = 4; c.strokeRect(0, 0, 76, 51); c.strokeStyle = '#2a4a9a'; c.lineWidth = 2; c.beginPath(); c.arc(38, 25, 6, 0, 7); c.stroke(); }),
  greenFlag: (ctx) => flagOn(ctx, (c) => { c.beginPath(); c.rect(0, 0, 76, 51); fs(c, '#2f7a3a', 4); c.fillStyle = '#fbfaf6'; c.beginPath(); c.arc(34, 25, 13, 0.6, 5.7); c.arc(39, 25, 10, 5.5, 0.8, true); c.fill(); c.beginPath(); c.arc(52, 22, 3.5, 0, 7); c.fill(); }),
  whiteFlag: (ctx) => flagOn(ctx, (c) => { c.beginPath(); c.rect(0, 0, 76, 51); fs(c, '#f6f1e4', 4); c.fillStyle = '#2a4a9a'; c.font = "700 20px 'Oswald'"; c.textAlign = 'center'; c.fillText('NSS', 38, 33); }),
  ballot: (ctx) => { ctx.beginPath(); ctx.rect(-10, -54, 64, 50); fs(ctx, '#4a5a6a', 4); ctx.fillStyle = INK; ctx.fillRect(8, -54, 28, 6); ctx.save(); ctx.translate(22, -62); ctx.rotate(0.15); ctx.beginPath(); ctx.rect(-10, -16, 20, 22); fs(ctx, '#fbfaf6', 3); ctx.restore(); },
  bat: (ctx) => { ctx.save(); ctx.rotate(-0.35); ctx.beginPath(); ctx.rect(-4, -60, 8, 40); fs(ctx, '#2a2a30', 3); ctx.beginPath(); ctx.roundRect(-11, -20, 22, 90, 6); fs(ctx, '#e8c88a', 4); ctx.restore(); },
  torch: (ctx) => { ctx.save(); ctx.rotate(0.15); ctx.beginPath(); ctx.rect(-5, -90, 10, 110); fs(ctx, '#8a5a2a', 3.5); ctx.beginPath(); ctx.moveTo(-14, -90); ctx.quadraticCurveTo(-18, -122, 0, -150); ctx.quadraticCurveTo(18, -122, 14, -90); ctx.closePath(); fs(ctx, '#f0a03a', 3.5);
    ctx.fillStyle = '#fff1a8'; ctx.beginPath(); ctx.moveTo(-6, -94); ctx.quadraticCurveTo(-6, -116, 0, -128); ctx.quadraticCurveTo(6, -116, 6, -94); ctx.closePath(); ctx.fill(); ctx.restore(); },
  plough: (ctx) => { ctx.save(); ctx.rotate(0.5); ctx.strokeStyle = INK; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(0, -80); ctx.lineTo(0, 50); ctx.lineTo(40, 70); ctx.stroke(); ctx.strokeStyle = '#8a5a2a'; ctx.lineWidth = 5; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(34, 62); ctx.lineTo(60, 80); ctx.lineTo(30, 78); ctx.closePath(); fs(ctx, '#9aa0aa', 3.5); ctx.restore(); },
  book: (ctx) => { ctx.save(); ctx.rotate(-0.15); ctx.beginPath(); ctx.rect(-4, -50, 48, 50); fs(ctx, '#2f5f8a', 4); ctx.fillStyle = '#f4ecd6'; ctx.fillRect(40, -48, 4, 46); ctx.fillStyle = '#f6d24a'; ctx.fillRect(4, -40, 30, 6); ctx.restore(); },
  payEnv: (ctx) => { ctx.save(); ctx.rotate(-0.15); ctx.beginPath(); ctx.rect(-6, -36, 76, 40); fs(ctx, '#e8d8a8', 4); ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(-6, -36); ctx.lineTo(32, -12); ctx.lineTo(70, -36); ctx.stroke();
    ctx.fillStyle = '#2f7a3a'; ctx.font = "700 16px 'Oswald'"; ctx.textAlign = 'center'; ctx.fillText('₹ GOVT', 32, -2); ctx.restore(); },
  notice: (ctx) => { ctx.save(); ctx.rotate(-0.1); ctx.beginPath(); ctx.rect(-6, -66, 62, 66); fs(ctx, '#f4ecd6', 4); ctx.fillStyle = '#c8312c'; ctx.font = "800 13px 'Noto Malayalam'"; ctx.textAlign = 'center'; ctx.fillText('കുടിയിറക്ക്', 25, -42);
    ctx.strokeStyle = 'rgba(42,28,23,.5)'; ctx.lineWidth = 2; for (let y = -30; y < -6; y += 6) { ctx.beginPath(); ctx.moveTo(2, y); ctx.lineTo(48, y); ctx.stroke(); } ctx.restore(); },
  order356: (ctx) => { ctx.save(); ctx.rotate(-0.1); ctx.beginPath(); ctx.rect(-6, -76, 70, 76); fs(ctx, '#fbfaf6', 4); ctx.fillStyle = '#2a1c17'; ctx.font = "700 14px 'Oswald'"; ctx.textAlign = 'center'; ctx.fillText('ARTICLE', 29, -54);
    ctx.font = "700 26px 'Oswald'"; ctx.fillStyle = '#c8312c'; ctx.fillText('356', 29, -28); ctx.strokeStyle = 'rgba(42,28,23,.5)'; ctx.lineWidth = 2; for (let y = -18; y < -4; y += 6) { ctx.beginPath(); ctx.moveTo(2, y); ctx.lineTo(56, y); ctx.stroke(); } ctx.restore(); },
  umbrella: (ctx) => { ctx.save(); ctx.rotate(-0.1); ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, 30); ctx.lineTo(0, -110); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-70, -100); ctx.quadraticCurveTo(0, -170, 70, -100); ctx.quadraticCurveTo(35, -112, 0, -102); ctx.quadraticCurveTo(-35, -112, -70, -100); ctx.closePath(); fs(ctx, '#1a1a1e', 4);
    ctx.beginPath(); ctx.arc(-6, 30, 8, 0, Math.PI); ctx.strokeStyle = '#8a5a2a'; ctx.lineWidth = 5; ctx.stroke(); ctx.restore(); },
};
export function registerCast(B) { NAM.registerCast(B); Object.assign(B.CAST, NEW_CAST); Object.assign(B.PROPS, NEW_PROPS); }
