// Vasco da Gama at Calicut (1498): new cast in the bean style. Historical figures are friendly caricatures by costume only.
// VASCO DA GAMA, the ZAMORIN's FACTOR and the WALI (laughing courtiers), two TUNISIAN/ARAB MERCHANTS, a Portuguese
// SAILOR carrying the gift, and a modern WEDDING GUEST for the analogy. The ZAMORIN, CAPTAIN and PORTUGUESE SOLDIER
// are reused from ml-kunjali.
import * as KUNJALI from '/episodes/ml-kunjali/cast.js';
const INK = '#2a1c17', OL = 6.5;
function ell(ctx, x, y, rx, ry, rot = 0) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); }
function fs(ctx, fill, w = OL) { if (fill) { ctx.fillStyle = fill; ctx.fill(); } ctx.lineWidth = w; ctx.strokeStyle = INK; ctx.stroke(); }
const both = (...fns) => (ctx) => fns.forEach((f) => f(ctx));

// ---------- heads
function velvetCap(color = '#1a1a22') { // Gama: soft black velvet cap tilted on dark hair
  return (ctx) => {
    ctx.beginPath(); ctx.moveTo(-54, -300); ctx.bezierCurveTo(-58, -350, 58, -350, 54, -300); ctx.quadraticCurveTo(30, -322, 0, -324); ctx.quadraticCurveTo(-30, -322, -54, -300); ctx.closePath(); fs(ctx, '#2a1e18', 4.5);
    ctx.save(); ctx.translate(0, -8); ctx.rotate(-0.08); ctx.beginPath(); ctx.ellipse(0, -344, 66, 24, 0, 0, 7); fs(ctx, color); ctx.beginPath(); ctx.moveTo(-56, -350); ctx.bezierCurveTo(-60, -400, 60, -404, 56, -350); ctx.quadraticCurveTo(0, -360, -56, -350); ctx.closePath(); fs(ctx, color);
    ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(-14, -372, 22, 3.5, 4.6); ctx.stroke(); ell(ctx, 40, -356, 7, 7); fs(ctx, '#e8b93a', 3); ctx.restore();
  };
}
function bushyBeard(color = '#2a1e18') { // the big famous beard: full and rounded, ending on the upper chest
  return (ctx) => {
    ctx.beginPath(); ctx.moveTo(-52, -290); ctx.bezierCurveTo(-62, -236, -40, -200, 0, -194); ctx.bezierCurveTo(40, -200, 62, -236, 52, -290);
    ctx.quadraticCurveTo(44, -256, 24, -252); ctx.quadraticCurveTo(0, -248, -24, -252); ctx.quadraticCurveTo(-44, -256, -52, -290); ctx.closePath(); fs(ctx, color, 4.5);
    ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = 3; for (const x of [-26, -8, 10, 28]) { ctx.beginPath(); ctx.moveTo(x, -246); ctx.quadraticCurveTo(x + 5, -224, x - 2, -206); ctx.stroke(); }
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(0, -270); ctx.quadraticCurveTo(s * 22, -280, s * 38, -266); ctx.quadraticCurveTo(s * 22, -262, 0, -260); ctx.closePath(); fs(ctx, color, 3.5); }
  };
}
function courtTurban(cloth = '#f6f1e4', band = '#e8b93a') { // Calicut courtier: small white head-wrap with a gold band, bun-knot on top
  return (ctx) => {
    ctx.beginPath(); ctx.moveTo(-56, -306); ctx.bezierCurveTo(-60, -366, 60, -366, 56, -306); ctx.quadraticCurveTo(0, -320, -56, -306); ctx.closePath(); fs(ctx, cloth);
    ctx.strokeStyle = band; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-55, -316); ctx.quadraticCurveTo(0, -330, 55, -316); ctx.stroke(); ell(ctx, -10, -362, 18, 13); fs(ctx, cloth, 4);
  };
}
function kufiya(cloth = '#f2eee4', cord = '#2a2a30') { // merchant: draped head-cloth falling to the shoulders with a dark cord
  return (ctx) => {
    ctx.beginPath(); ctx.moveTo(-66, -230); ctx.quadraticCurveTo(-74, -300, -56, -334); ctx.bezierCurveTo(-40, -384, 40, -384, 56, -334); ctx.quadraticCurveTo(74, -300, 66, -230); ctx.lineTo(48, -236); ctx.quadraticCurveTo(54, -300, 44, -318); ctx.quadraticCurveTo(0, -330, -44, -318); ctx.quadraticCurveTo(-54, -300, -48, -236); ctx.closePath(); fs(ctx, cloth);
    ctx.strokeStyle = INK; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(-50, -334); ctx.quadraticCurveTo(0, -348, 50, -334); ctx.stroke(); ctx.strokeStyle = cord; ctx.lineWidth = 6; ctx.stroke();
  };
}
function wrapTurban(cloth = '#2f5f8a') { return (ctx) => { ctx.beginPath(); ctx.moveTo(-60, -312); ctx.bezierCurveTo(-70, -392, 70, -392, 60, -312); ctx.quadraticCurveTo(0, -326, -60, -312); ctx.closePath(); fs(ctx, cloth);
  ctx.save(); ctx.clip(); ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.lineWidth = 4; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-64, -330 - i * 13); ctx.quadraticCurveTo(0, -350 - i * 13, 64, -322 - i * 13); ctx.stroke(); } ctx.restore(); }; }
function pointBeard(color) { return (ctx) => { ctx.beginPath(); ctx.moveTo(-48, -290); ctx.quadraticCurveTo(-40, -230, 0, -196); ctx.quadraticCurveTo(40, -230, 48, -290); ctx.quadraticCurveTo(30, -248, 0, -244); ctx.quadraticCurveTo(-30, -248, -48, -290); ctx.closePath(); fs(ctx, color, 4); }; }
function sailorCap(color = '#c8312c') { return (ctx) => { ctx.beginPath(); ctx.moveTo(-54, -304); ctx.bezierCurveTo(-58, -370, 58, -370, 54, -304); ctx.quadraticCurveTo(0, -316, -54, -304); ctx.closePath(); fs(ctx, color); ctx.beginPath(); ctx.moveTo(40, -350); ctx.quadraticCurveTo(76, -340, 70, -300); ctx.quadraticCurveTo(60, -320, 44, -330); ctx.closePath(); fs(ctx, color, 4); }; }
function modernHair(color = '#1a120d') { return (ctx) => { ctx.beginPath(); ctx.moveTo(-54, -300); ctx.bezierCurveTo(-60, -366, 58, -372, 54, -300); ctx.quadraticCurveTo(44, -330, 10, -338); ctx.quadraticCurveTo(-30, -326, -54, -300); ctx.closePath(); fs(ctx, color); }; }

// ---------- torso layers (bean.js calls c.over(ctx, top, bot))
const gamaDoublet = (ctx, top, bot) => { // black doublet, gold buttons, white collar, heavy gold chain with a cross-of-Christ medallion
  for (let y = top + 18; y < bot - 6; y += 16) { ell(ctx, 0, y, 3.6, 3.6); ctx.fillStyle = '#e8b93a'; ctx.fill(); }
  ctx.fillStyle = '#fbfaf6'; ctx.beginPath(); ctx.moveTo(-30, top - 8); ctx.quadraticCurveTo(0, top + 10, 30, top - 8); ctx.lineTo(24, top + 2); ctx.quadraticCurveTo(0, top + 18, -24, top + 2); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#e8b93a'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, top + 4, 44, 0.35, Math.PI - 0.35); ctx.stroke();
  ctx.fillStyle = '#c8312c'; ctx.beginPath(); ctx.moveTo(0, top + 34); ctx.lineTo(8, top + 46); ctx.lineTo(0, top + 58); ctx.lineTo(-8, top + 46); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#e8b93a'; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = '#6a3e22'; ctx.fillRect(-66, bot - 26, 132, 12); ctx.fillStyle = '#e8b93a'; ctx.fillRect(-8, bot - 28, 16, 16);
};
const courtShawl = (col) => (ctx, top, bot) => { // bare chest, thin gold chain, coloured shawl over one shoulder, sacred thread
  ctx.strokeStyle = '#e8b93a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, top - 8, 30, 0.4, Math.PI - 0.4); ctx.stroke();
  ctx.strokeStyle = '#f6f1e4'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(-36, top - 4); ctx.lineTo(40, bot - 10); ctx.stroke();
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(26, top - 6); ctx.lineTo(54, top - 6); ctx.lineTo(60, bot + 6); ctx.lineTo(36, bot + 6); ctx.closePath(); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
};
const robe = (stripe) => (ctx, top, bot) => { // long merchant robe, open front, striped sash
  ctx.strokeStyle = INK; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(-14, top - 6); ctx.lineTo(-8, bot + 4); ctx.moveTo(14, top - 6); ctx.lineTo(8, bot + 4); ctx.stroke();
  ctx.fillStyle = stripe; ctx.fillRect(-64, bot - 34, 128, 16); ctx.fillStyle = 'rgba(255,255,255,.5)'; for (let x = -60; x < 64; x += 14) ctx.fillRect(x, bot - 34, 5, 16);
};
const sailorStripe = (ctx, top, bot) => { ctx.fillStyle = '#2f4a7a'; for (let y = top + 10; y < bot - 6; y += 22) ctx.fillRect(-62, y, 124, 9); ctx.fillStyle = '#6a3e22'; ctx.fillRect(-66, bot - 22, 132, 10); };
const kurta = (ctx, top, bot) => { ctx.strokeStyle = '#e8b93a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, top - 4); ctx.lineTo(0, top + 46); ctx.stroke(); for (let y = top + 8; y < top + 46; y += 12) { ell(ctx, 0, y, 3, 3); ctx.fillStyle = '#e8b93a'; ctx.fill(); } };

export const NEW_CAST = {
  vasco: { name: 'VASCO DA GAMA', skin: '#f0c8a6', hair: both(velvetCap(), bushyBeard()), shirt: '#1a1a22', shirtDark: '#0f0f14', over: gamaDoublet, lower: 'pants', mundu: '#2a2430', legs: '#2a2430', shoes: '#1a120d' },
  factor: { name: "ZAMORIN'S FACTOR", skin: '#b07a50', hair: both(courtTurban(), (ctx) => { for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(0, -272); ctx.quadraticCurveTo(s * 20, -282, s * 36, -272); ctx.quadraticCurveTo(s * 20, -266, 0, -266); ctx.closePath(); fs(ctx, '#1a120d', 3); } }), bare: true, shirt: '#b07a50', shirtDark: '#8e5e3a', over: courtShawl('#2f6a3a'), lower: 'mundu', mundu: '#f6f1e4', kasavu: '#e8b93a', legs: '#8e5e3a', shoes: '#8e5e3a' },
  wali: { name: 'THE WALI', skin: '#a87048', hair: courtTurban('#f6f1e4', '#c8312c'), glasses: false, wrinkles: true, bare: true, shirt: '#a87048', shirtDark: '#86562f', over: courtShawl('#c8312c'), lower: 'mundu', mundu: '#f6f1e4', kasavu: '#c8312c', legs: '#86562f', shoes: '#86562f' },
  merchant: { name: 'MERCHANT (Tunis)', skin: '#c89468', hair: both(kufiya(), pointBeard('#2a1e18')), shirt: '#e8dcc0', shirtDark: '#c8b896', over: robe('#2f6a3a'), lower: 'mundu', mundu: '#e8dcc0', kasavu: '#e8dcc0', legs: '#a87048', shoes: '#6a3e22' },
  merchant2: { name: 'MERCHANT 2', skin: '#b88058', hair: both(wrapTurban(), pointBeard('#d8d2c8')), wrinkles: true, shirt: '#8a5a8a', shirtDark: '#6a3e6a', over: robe('#e8b93a'), lower: 'mundu', mundu: '#8a5a8a', kasavu: '#8a5a8a', legs: '#86562f', shoes: '#6a3e22' },
  porter: { name: 'PORTUGUESE SAILOR', skin: '#f0c8a6', hair: both(sailorCap(), (ctx) => { ctx.fillStyle = 'rgba(90,58,26,.35)'; ctx.beginPath(); ctx.ellipse(0, -248, 40, 18, 0, 0, Math.PI); ctx.fill(); }), shirt: '#fbfaf6', shirtDark: '#dcd8ce', over: sailorStripe, lower: 'pants', mundu: '#7a6a4a', legs: '#7a6a4a', shoes: '#2a1c17' },
  guest: { name: 'WEDDING GUEST', skin: '#b98257', hair: modernHair(), stache: true, shirt: '#e8b93a', shirtDark: '#c8992a', collar: false, over: kurta, lower: 'mundu', mundu: '#fbfaf6', kasavu: '#e8b93a', legs: '#86562f', shoes: '#3a2a20' },
};

export const NEW_PROPS = {
  sugarBox: (ctx) => { ctx.beginPath(); ctx.rect(-26, -40, 56, 44); fs(ctx, '#c8a46a', 4); ctx.beginPath(); ctx.moveTo(-26, -40); ctx.lineTo(-14, -52); ctx.lineTo(42, -52); ctx.lineTo(30, -40); ctx.closePath(); fs(ctx, '#d8b47a', 3.5);
    ctx.fillStyle = '#fbfaf6'; for (const [x, y] of [[-6, -56], [8, -60], [20, -56], [2, -54]]) { ctx.fillRect(x, y, 8, 8); } ctx.fillStyle = INK; ctx.font = "700 14px 'Oswald'"; ctx.textAlign = 'center'; ctx.fillText('AÇÚCAR', 2, -14); },
  honeyJar: (ctx) => { ctx.beginPath(); ctx.moveTo(-18, 2); ctx.quadraticCurveTo(-30, -30, -14, -52); ctx.lineTo(16, -52); ctx.quadraticCurveTo(32, -30, 20, 2); ctx.closePath(); fs(ctx, '#d8892a', 4); ctx.beginPath(); ctx.rect(-16, -62, 34, 10); fs(ctx, '#8a5a2a', 3.5);
    ctx.strokeStyle = 'rgba(255,240,180,.7)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-12, -40); ctx.quadraticCurveTo(-16, -24, -10, -8); ctx.stroke(); },
  hat: (ctx) => { ctx.beginPath(); ctx.ellipse(8, -6, 34, 9, 0, 0, 7); fs(ctx, '#c8312c', 4); ctx.beginPath(); ctx.moveTo(-14, -8); ctx.bezierCurveTo(-16, -44, 32, -44, 30, -8); ctx.closePath(); fs(ctx, '#c8312c', 4); },
  cloth: (ctx) => { ctx.save(); ctx.rotate(-0.1); ctx.beginPath(); ctx.rect(-20, -40, 64, 40); fs(ctx, '#e8dcc0', 4); ctx.fillStyle = '#2f5f8a'; for (let x = -16; x < 44; x += 14) ctx.fillRect(x, -40, 6, 40); ctx.restore(); },
  pepperSack: (ctx) => { ctx.beginPath(); ctx.moveTo(-28, 4); ctx.quadraticCurveTo(-36, -40, -18, -62); ctx.quadraticCurveTo(4, -72, 24, -62); ctx.quadraticCurveTo(40, -40, 32, 4); ctx.closePath(); fs(ctx, '#c8a46a', 4);
    ctx.fillStyle = '#1a120d'; for (const [x, y] of [[-6, -70], [4, -74], [12, -68], [0, -66]]) { ell(ctx, x, y, 5, 5); ctx.fill(); } ctx.strokeStyle = '#6a3e22'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-18, -58); ctx.lineTo(24, -58); ctx.stroke(); },
  palmLeaf: (ctx) => { ctx.save(); ctx.rotate(-0.2); ctx.beginPath(); ctx.rect(-6, -22, 80, 18); fs(ctx, '#e8d29a', 3.5); ctx.strokeStyle = 'rgba(42,28,23,.5)'; ctx.lineWidth = 2; for (let x = 4; x < 66; x += 9) { ctx.beginPath(); ctx.moveTo(x, -18); ctx.lineTo(x + 5, -8); ctx.stroke(); } ctx.restore(); },
  biscuit: (ctx) => { ctx.save(); ctx.rotate(-0.15); ctx.beginPath(); ctx.rect(-6, -30, 62, 30); fs(ctx, '#e04a3a', 4); ctx.fillStyle = '#f2c94c'; ctx.fillRect(4, -24, 22, 18); ctx.fillStyle = '#fbfaf6'; ctx.font = "700 12px 'Oswald'"; ctx.fillText('BISCUIT', 26, -10); ctx.restore(); },
  sword: (ctx) => { ctx.save(); ctx.rotate(-0.3); ctx.beginPath(); ctx.rect(-4, -120, 8, 120); fs(ctx, '#dfe4ea', 3.5); ctx.beginPath(); ctx.rect(-20, -4, 40, 8); fs(ctx, '#e8b93a', 3); ctx.beginPath(); ctx.rect(-5, 4, 10, 22); fs(ctx, '#6a3e22', 3); ctx.restore(); },
};
export function registerCast(B) { KUNJALI.registerCast(B); Object.assign(B.CAST, NEW_CAST); Object.assign(B.PROPS, NEW_PROPS); }
