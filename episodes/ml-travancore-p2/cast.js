// Travancore Part 2 ("Travancore today"): new cast + props, registered into the shared bean CAST/PROPS at runtime.
// Same bean look: inked brush outline INK, head top ~y -350, face centred at y -300.
const INK = '#2a1c17', OL = 6.5;
function ell(ctx, x, y, rx, ry, rot = 0) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); }
function fs(ctx, fill, w = OL) { if (fill) { ctx.fillStyle = fill; ctx.fill(); } ctx.lineWidth = w; ctx.strokeStyle = INK; ctx.stroke(); }

// ghutra (head cloth) + agal (black cord ring): drapes past the face down to the shoulders; face left open
function ghutra(cloth, pattern) {
  return (ctx) => {
    ctx.beginPath();
    ctx.moveTo(-70, -232); ctx.bezierCurveTo(-74, -300, -66, -392, 0, -392); ctx.bezierCurveTo(66, -392, 74, -300, 70, -232);
    ctx.quadraticCurveTo(60, -226, 50, -236); ctx.bezierCurveTo(54, -300, 50, -340, 0, -344); ctx.bezierCurveTo(-50, -340, -54, -300, -50, -236);
    ctx.quadraticCurveTo(-60, -226, -70, -232); ctx.closePath(); fs(ctx, cloth);
    if (pattern) { ctx.save(); ctx.clip(); ctx.strokeStyle = pattern; ctx.lineWidth = 3; ctx.globalAlpha = 0.75;
      for (let k = -120; k < 140; k += 14) { ctx.beginPath(); ctx.moveTo(k, -400); ctx.lineTo(k + 150, -220); ctx.stroke(); ctx.beginPath(); ctx.moveTo(k, -220); ctx.lineTo(k + 150, -400); ctx.stroke(); } ctx.restore(); }
    // fold shadow
    ctx.strokeStyle = 'rgba(42,28,23,.3)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-58, -300); ctx.quadraticCurveTo(-64, -268, -60, -240); ctx.stroke(); ctx.beginPath(); ctx.moveTo(58, -300); ctx.quadraticCurveTo(64, -268, 60, -240); ctx.stroke();
    // agal: two black cord rings
    for (const dy of [0, 9]) { ctx.beginPath(); ctx.ellipse(0, -352 + dy, 58, 11, 0, Math.PI * 1.02, Math.PI * 1.98, true); ctx.strokeStyle = INK; ctx.lineWidth = 9; ctx.stroke(); }
  };
}
function hardHat(color) {
  return (ctx) => {
    ctx.beginPath(); ctx.moveTo(-50, -330); ctx.bezierCurveTo(-52, -396, 52, -396, 50, -330); ctx.closePath(); fs(ctx, color);
    ctx.beginPath(); ctx.moveTo(-64, -330); ctx.quadraticCurveTo(0, -342, 64, -330); ctx.lineTo(62, -320); ctx.quadraticCurveTo(0, -330, -62, -320); ctx.closePath(); fs(ctx, color, 5);
    ctx.beginPath(); ctx.moveTo(-8, -388); ctx.lineTo(-8, -334); ctx.lineTo(8, -334); ctx.lineTo(8, -388); ctx.closePath(); fs(ctx, 'rgba(255,255,255,.35)', 3);
    ctx.fillStyle = 'rgba(255,255,255,.45)'; ell(ctx, -26, -368, 9, 5, -0.6); ctx.fill();
  };
}
function captainCap() {
  return (ctx) => {
    ctx.fillStyle = '#d9d9d9'; for (const s of [-1, 1]) { ell(ctx, s * 50, -306, 7, 14); ctx.fill(); } // grey sideburns
    ctx.beginPath(); ctx.moveTo(-52, -326); ctx.lineTo(-62, -366); ctx.quadraticCurveTo(0, -388, 62, -366); ctx.lineTo(52, -326); ctx.closePath(); fs(ctx, '#f7f7f2');
    ctx.fillStyle = '#1d2330'; ctx.fillRect(-52, -338, 104, 13); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.strokeRect(-52, -338, 104, 13);
    ctx.beginPath(); ctx.moveTo(-50, -326); ctx.quadraticCurveTo(0, -306, 56, -326); ctx.lineTo(50, -330); ctx.closePath(); fs(ctx, '#1d2330', 4.5);
    ctx.strokeStyle = '#e8b93a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-40, -322); ctx.quadraticCurveTo(0, -310, 44, -322); ctx.stroke();
    ell(ctx, 0, -356, 11, 9); fs(ctx, '#e8b93a', 3.5);
  };
}
function hairSide(color) { // receding hair with a shiny top (shopkeeper)
  return (ctx) => {
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 54, -296); ctx.quadraticCurveTo(s * 60, -334, s * 34, -344); ctx.quadraticCurveTo(s * 40, -322, s * 46, -300); ctx.closePath(); fs(ctx, color, 5); }
    ctx.fillStyle = 'rgba(255,255,255,.4)'; ell(ctx, -14, -338, 12, 5, -0.3); ctx.fill();
  };
}
function hairShort(color, part = 1) { // same silhouette as bean.js (module-private there)
  return (ctx) => {
    ctx.beginPath(); ctx.moveTo(-53, -300); ctx.bezierCurveTo(-58, -360, 58, -362, 53, -300);
    ctx.quadraticCurveTo(46, -326, 20 * part, -330); ctx.quadraticCurveTo(-10 * part, -318, -30, -326); ctx.quadraticCurveTo(-46, -320, -53, -300);
    ctx.closePath(); fs(ctx, color);
  };
}
function beard(color) { return (ctx) => { ctx.beginPath(); ctx.moveTo(-52, -300); ctx.quadraticCurveTo(-52, -222, 0, -216); ctx.quadraticCurveTo(52, -222, 52, -300); ctx.quadraticCurveTo(44, -246, 0, -236); ctx.quadraticCurveTo(-44, -246, -52, -300); ctx.closePath(); fs(ctx, color, 4); }; }
function ponytail(color) { return (ctx) => { ctx.beginPath(); ctx.moveTo(40, -330); ctx.quadraticCurveTo(84, -320, 74, -262); ctx.quadraticCurveTo(70, -240, 60, -250); ctx.quadraticCurveTo(66, -290, 44, -312); ctx.closePath(); fs(ctx, color, 5); ell(ctx, 50, -322, 7, 7); fs(ctx, '#c8312c', 3);
  for (const s of [-1, 1]) { ell(ctx, s * 53, -282, 4.5, 4.5); fs(ctx, '#f0c23a', 2.5); } }; }
const both = (...fns) => (ctx) => fns.forEach((f) => f(ctx));

// torso overlays (bean.js calls c.over inside the torso clip)
const hiVis = (ctx, top, bot) => { ctx.fillStyle = '#ff7a1a'; ctx.fillRect(-60, top - 10, 120, bot - top + 20); ctx.fillStyle = '#f4f4f0';
  for (const y of [top + 64, bot - 34]) ctx.fillRect(-60, y, 120, 9); ctx.fillStyle = '#1f9e95'; ctx.fillRect(-14, top - 10, 28, bot - top + 20); // shirt shows down the middle
  ctx.strokeStyle = INK; ctx.lineWidth = 3; for (const x of [-14, 14]) { ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, bot); ctx.stroke(); } };
const kandura = (ctx, top, bot) => { ctx.strokeStyle = 'rgba(42,28,23,.5)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, top + 4); ctx.lineTo(0, top + 50); ctx.stroke(); ell(ctx, 0, top + 6, 7, 3); ctx.stroke();
  ctx.strokeStyle = 'rgba(160,150,130,.5)'; ctx.lineWidth = 2; for (const x of [-24, 26]) { ctx.beginPath(); ctx.moveTo(x, top + 30); ctx.quadraticCurveTo(x + 6, (top + bot) / 2, x - 2, bot); ctx.stroke(); } };
const uniform = (ctx, top, bot) => { ctx.fillStyle = '#1d2330'; for (const s of [-1, 1]) ctx.fillRect(s * 44 - 9, top + 4, 18, 9); ctx.fillStyle = '#e8b93a'; for (const s of [-1, 1]) for (let k = 0; k < 3; k++) ctx.fillRect(s * 44 - 8, top + 5 + k * 3, 16, 1.6);
  for (let y = top + 22; y < bot - 8; y += 20) { ell(ctx, 0, y, 3.6, 3.6); ctx.fillStyle = '#e8b93a'; ctx.fill(); } ctx.strokeStyle = 'rgba(42,28,23,.4)'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(0, top + 8); ctx.lineTo(0, bot); ctx.stroke(); };
const apron = (ctx, top, bot) => { ctx.fillStyle = '#2f6a3a'; ctx.beginPath(); ctx.moveTo(-34, top + 40); ctx.lineTo(34, top + 40); ctx.lineTo(42, bot + 4); ctx.lineTo(-42, bot + 4); ctx.closePath(); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = '#f4dca0'; ctx.font = "800 15px 'Noto Malayalam'"; ctx.textAlign = 'center'; ctx.fillText('ഫോൺ', 0, top + 80); };

export const NEW_CAST = {
  khalid: { name: 'KHALID (from the Gulf)', skin: '#c99a70', hair: ghutra('#fbfaf6'), stache: true, shirt: '#fbfaf6', shirtDark: '#dcd8ce', over: kandura, lower: 'mundu', mundu: '#fbfaf6', kasavu: '#eeeae0', legs: '#8a6a4a', shoes: '#6b4a2a' },
  salem: { name: 'SALEM (from the Gulf)', skin: '#b9895f', hair: both(beard('#2a2018'), ghutra('#fbfaf6', '#c8312c')), stache: true, shirt: '#efe6d2', shirtDark: '#d2c6aa', over: kandura, lower: 'mundu', mundu: '#efe6d2', kasavu: '#e2d8c0', legs: '#7a5a3a', shoes: '#4a3022' },
  rashid: { name: 'RASHID (young, from the Gulf)', skin: '#caa078', hair: ghutra('#fbfaf6'), shirt: '#fbfaf6', shirtDark: '#dcd8ce', over: kandura, lower: 'mundu', mundu: '#fbfaf6', kasavu: '#eeeae0', legs: '#8a6a4a', shoes: '#2a1c17' },
  shopkeeper: { name: 'MAMMUKKA (phone shop)', skin: '#b07a50', hair: hairSide('#2a2018'), glasses: true, stache: true, shirt: '#f2ecdc', shirtDark: '#d6ccb2', collar: true, over: apron, lower: 'lungi', mundu: '#3a6aa8', kasavu: '#f2c94c', legs: '#6b4632', shoes: '#3a2a20' },
  porter: { name: 'SAJI (port crew)', skin: '#a87048', hair: hardHat('#f2c418'), stache: true, shirt: '#1f9e95', shirtDark: '#147a73', over: hiVis, lower: 'pants', mundu: '#2f3e5a', legs: '#2f3e5a', shoes: '#2a1c17' },
  porter2: { name: 'LATHA (crane operator)', skin: '#b67a52', hair: both(ponytail('#1c1410'), hardHat('#f4f4f0')), earrings: true, shirt: '#1f9e95', shirtDark: '#147a73', over: hiVis, lower: 'pants', mundu: '#2f3e5a', legs: '#2f3e5a', shoes: '#2a1c17' },
  captain: { name: 'CAPTAIN (ship)', skin: '#e8b890', hair: both(beard('#e6e2da'), captainCap()), shirt: '#f7f7f2', shirtDark: '#d8d8d0', over: uniform, lower: 'pants', mundu: '#f7f7f2', legs: '#e0e0d8', shoes: '#1d2330' },
  sailor: { name: 'CREW', skin: '#8a5a38', hair: hairShort('#1a120d', -1), shirt: '#2a4a8a', shirtDark: '#1d3466', collar: true, pocket: true, lower: 'pants', mundu: '#1d2330', legs: '#1d2330', shoes: '#2a1c17' },
};

export const NEW_PROPS = {
  sack: (ctx) => { // burlap sack overflowing with chakram coins, slung from the hand
    ctx.save(); ctx.translate(14, 34); ctx.beginPath(); ctx.moveTo(-26, -36); ctx.quadraticCurveTo(-44, 10, -36, 40); ctx.quadraticCurveTo(0, 56, 38, 40); ctx.quadraticCurveTo(46, 10, 26, -36); ctx.closePath(); fs(ctx, '#c9a464', 5);
    ctx.strokeStyle = 'rgba(110,80,40,.5)'; ctx.lineWidth = 2; for (let x = -30; x < 34; x += 8) { ctx.beginPath(); ctx.moveTo(x, -30); ctx.lineTo(x * 1.1, 44); ctx.stroke(); }
    for (const [x, y] of [[-12, -38], [4, -42], [18, -36], [-2, -32], [12, -46]]) { ell(ctx, x, y, 8, 8); fs(ctx, '#f0c23a', 3); }
    ctx.fillStyle = '#8a1e1e'; ctx.font = "800 19px 'Noto Malayalam'"; ctx.textAlign = 'center'; ctx.fillText('ചക്രം', 2, 16); ctx.restore(); },
  phone: (ctx) => { ctx.save(); ctx.rotate(-0.15); ctx.beginPath(); ctx.roundRect(-4, -54, 32, 58, 6); fs(ctx, '#1d1d22', 4); ctx.fillStyle = '#5ab0e8'; ctx.fillRect(0, -48, 24, 44); ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.fillRect(3, -46, 6, 30); ctx.restore(); },
  suitcase: (ctx) => { ctx.save(); ctx.translate(0, 34); ctx.beginPath(); ctx.roundRect(-30, -24, 60, 44, 5); fs(ctx, '#8a4a2a', 4.5); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-10, -24); ctx.lineTo(-10, -34); ctx.lineTo(10, -34); ctx.lineTo(10, -24); ctx.stroke();
    ctx.fillStyle = '#e8b93a'; ctx.fillRect(-26, -6, 52, 5); ctx.fillStyle = '#f4ecd6'; ctx.fillRect(8, 2, 16, 12); ctx.restore(); },
  wand: (ctx) => { ctx.save(); ctx.rotate(0.4); ctx.beginPath(); ctx.roundRect(-5, -60, 10, 62, 4); fs(ctx, '#ff7a1a', 4); ctx.fillStyle = '#fff6b0'; ctx.fillRect(-3, -58, 6, 22); ctx.restore(); }, // marshalling wand
  clipboard: (ctx) => { ctx.save(); ctx.rotate(-0.2); ctx.beginPath(); ctx.rect(-6, -48, 38, 50); fs(ctx, '#a8763a', 4); ctx.fillStyle = '#f4ecd6'; ctx.fillRect(-1, -42, 28, 40); ctx.fillStyle = '#5a5a60'; ctx.fillRect(6, -52, 14, 8); ctx.strokeStyle = 'rgba(42,28,23,.5)'; ctx.lineWidth = 2; for (let y = -34; y < -6; y += 7) { ctx.beginPath(); ctx.moveTo(3, y); ctx.lineTo(23, y); ctx.stroke(); } ctx.restore(); },
};

export function registerCast(B) { Object.assign(B.CAST, NEW_CAST); Object.assign(B.PROPS, NEW_PROPS); }
