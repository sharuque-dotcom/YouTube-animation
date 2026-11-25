// Gulf boom what-if: new cast + props, registered into the shared bean CAST/PROPS at runtime.
// DASAN / VIJAYAN / MANAVALAN are costume-and-prop homages to Malayalam film characters, drawn in our own bean
// style: recognisable by outfit only, never by an actor's face. The boatman is our own unnamed character.
const INK = '#2a1c17', OL = 6.5;
function ell(ctx, x, y, rx, ry, rot = 0) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); }
function fs(ctx, fill, w = OL) { if (fill) { ctx.fillStyle = fill; ctx.fill(); } ctx.lineWidth = w; ctx.strokeStyle = INK; ctx.stroke(); }
const both = (...fns) => (ctx) => fns.forEach((f) => f(ctx));

// wavy side-parted hair with a puff on top (Dasan)
function hairWavy(color) {
  return (ctx) => {
    ctx.beginPath(); ctx.moveTo(-55, -296); ctx.bezierCurveTo(-64, -350, -30, -372, 4, -370); ctx.bezierCurveTo(44, -372, 66, -346, 55, -296);
    ctx.quadraticCurveTo(50, -322, 34, -330); ctx.quadraticCurveTo(22, -318, 8, -332); ctx.quadraticCurveTo(-10, -320, -24, -334); ctx.quadraticCurveTo(-42, -322, -55, -296); ctx.closePath(); fs(ctx, color);
    ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-30, -356); ctx.quadraticCurveTo(-4, -366, 20, -358); ctx.stroke();
  };
}
// thinning hair, high forehead, big side tufts (Vijayan)
function hairThin(color) {
  return (ctx) => {
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 54, -290); ctx.quadraticCurveTo(s * 64, -336, s * 32, -350); ctx.quadraticCurveTo(s * 42, -326, s * 46, -296); ctx.closePath(); fs(ctx, color, 5); }
    ctx.beginPath(); ctx.moveTo(-30, -350); ctx.quadraticCurveTo(0, -362, 30, -350); ctx.quadraticCurveTo(10, -354, -4, -346); ctx.quadraticCurveTo(-18, -352, -30, -350); ctx.closePath(); fs(ctx, color, 4);
  };
}
// puffed 70s hair + dark "cooling glass" sunglasses (Manavalan)
function hairPuff(color) {
  return (ctx) => {
    ctx.beginPath(); ctx.moveTo(-56, -292); ctx.bezierCurveTo(-74, -360, -40, -392, 0, -390); ctx.bezierCurveTo(40, -392, 74, -360, 56, -292);
    ctx.quadraticCurveTo(52, -330, 30, -338); ctx.quadraticCurveTo(0, -326, -30, -338); ctx.quadraticCurveTo(-52, -330, -56, -292); ctx.closePath(); fs(ctx, color);
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 52, -300); ctx.lineTo(s * 56, -262); ctx.lineTo(s * 46, -270); ctx.closePath(); fs(ctx, color, 3.5); } // sideburns
  };
}
function cooling(ctx) {
  ctx.fillStyle = '#141018'; ctx.strokeStyle = INK; ctx.lineWidth = 4;
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 4, -312); ctx.lineTo(s * 40, -314); ctx.quadraticCurveTo(s * 42, -290, s * 24, -288); ctx.quadraticCurveTo(s * 6, -290, s * 4, -312); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(-40, -314); ctx.lineTo(-54, -310); ctx.moveTo(40, -314); ctx.lineTo(54, -310); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.55)'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * 26 - 6, -306, 6, 3, -0.4, 0, 7); ctx.fill(); }
}
function towelHead(color) { return (ctx) => { ctx.beginPath(); ctx.moveTo(-56, -312); ctx.bezierCurveTo(-60, -372, 60, -372, 56, -312); ctx.quadraticCurveTo(0, -330, -56, -312); ctx.closePath(); fs(ctx, color);
  ctx.strokeStyle = '#c8312c'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-54, -322); ctx.quadraticCurveTo(0, -340, 54, -322); ctx.stroke(); ctx.beginPath(); ctx.moveTo(48, -330); ctx.quadraticCurveTo(74, -330, 70, -300); fs(ctx, null, 7); ctx.strokeStyle = color; ctx.lineWidth = 3.5; ctx.stroke(); }; }
function beard(color) { return (ctx) => { ctx.beginPath(); ctx.moveTo(-52, -300); ctx.quadraticCurveTo(-52, -222, 0, -216); ctx.quadraticCurveTo(52, -222, 52, -300); ctx.quadraticCurveTo(44, -246, 0, -236); ctx.quadraticCurveTo(-44, -246, -52, -300); ctx.closePath(); fs(ctx, color, 4); }; }
function hairShort(color, part = 1) { return (ctx) => { ctx.beginPath(); ctx.moveTo(-53, -300); ctx.bezierCurveTo(-58, -360, 58, -362, 53, -300); ctx.quadraticCurveTo(46, -326, 20 * part, -330); ctx.quadraticCurveTo(-10 * part, -318, -30, -326); ctx.quadraticCurveTo(-46, -320, -53, -300); ctx.closePath(); fs(ctx, color); }; }
function hardHat(color) { return (ctx) => { ctx.beginPath(); ctx.moveTo(-50, -330); ctx.bezierCurveTo(-52, -396, 52, -396, 50, -330); ctx.closePath(); fs(ctx, color); ctx.beginPath(); ctx.moveTo(-64, -330); ctx.quadraticCurveTo(0, -342, 64, -330); ctx.lineTo(62, -320); ctx.quadraticCurveTo(0, -330, -62, -320); ctx.closePath(); fs(ctx, color, 5); }; }

// torso overlays (clipped to the torso)
const checks = (a, b) => (ctx, top, bot) => { ctx.fillStyle = a; ctx.globalAlpha = 0.85; for (let x = -60; x < 60; x += 22) ctx.fillRect(x, top - 10, 9, bot - top + 20); for (let y = top; y < bot + 10; y += 22) ctx.fillRect(-60, y, 120, 9); ctx.globalAlpha = 1;
  ctx.fillStyle = b; ctx.globalAlpha = 0.5; for (let x = -60; x < 60; x += 22) for (let y = top; y < bot + 10; y += 22) ctx.fillRect(x, y, 9, 9); ctx.globalAlpha = 1; };
const loud = (ctx, top, bot) => { // big flower print + open collar + gold chain
  const cols = ['#f6d24a', '#ffffff', '#1f9e95']; let k = 0;
  for (let y = top + 6; y < bot + 20; y += 34) for (let x = -56 + ((y / 34) % 2) * 17; x < 60; x += 34) { const c = cols[k++ % 3]; ctx.fillStyle = c; for (let p = 0; p < 5; p++) { const a = p * 1.2566; ell(ctx, x + Math.cos(a) * 7, y + Math.sin(a) * 7, 6, 4, a); ctx.fill(); } ctx.fillStyle = '#c8312c'; ell(ctx, x, y, 3.5, 3.5); ctx.fill(); }
  ctx.fillStyle = '#c68b62'; ctx.beginPath(); ctx.moveTo(-20, top - 4); ctx.lineTo(0, top + 46); ctx.lineTo(20, top - 4); ctx.closePath(); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke(); // open neck
  ctx.strokeStyle = '#f0c23a'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-22, top); ctx.quadraticCurveTo(0, top + 44, 22, top); ctx.stroke(); ctx.strokeStyle = '#a8761a'; ctx.lineWidth = 1.5; ctx.stroke();
  ell(ctx, 0, top + 30, 8, 10); ctx.fillStyle = '#f0c23a'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.stroke(); };
const coverall = (ctx, top, bot) => { ctx.fillStyle = '#e8763a'; ctx.fillRect(-60, top + 70, 120, 8); ctx.strokeStyle = 'rgba(42,28,23,.45)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, top + 6); ctx.lineTo(0, bot); ctx.stroke(); };

export const NEW_CAST = {
  dasan: { name: 'DASAN', skin: '#c68b62', hair: hairWavy('#1c1410'), stache: true, shirt: '#f2e2a8', shirtDark: '#d6c084', collar: true, pocket: true, lower: 'mundu', mundu: '#f6f1e4', kasavu: '#c9b48a', legs: '#6b4632', shoes: '#4a3022' },
  vijayan: { name: 'VIJAYAN', skin: '#a8704a', hair: hairThin('#1c1410'), stache: true, shirt: '#e8d6b0', shirtDark: '#c8b48a', collar: true, over: checks('#a8452e', '#2a4a7a'), lower: 'mundu', mundu: '#f1ead8', kasavu: '#a89a7a', legs: '#6b4632', shoes: '#3a2a20' },
  manavalan: { name: 'MANAVALAN', skin: '#c68b62', hair: both(hairPuff('#1a120d'), cooling), stache: true, shirt: '#c8312c', shirtDark: '#9b211e', over: loud, lower: 'pants', mundu: '#f4efe4', legs: '#f4efe4', shoes: '#f4efe4' },
  boatman: { name: 'LAUNCH BOATMAN', skin: '#8a5a38', hair: both(beard('#3a2a20'), towelHead('#efe6d0')), shirt: '#4a6a8a', shirtDark: '#33506a', banian: true, lower: 'lungi', mundu: '#2f5f3e', kasavu: '#f2c94c', legs: '#6b4632', shoes: '#3a2a20' },
  worker: { name: 'GULF WORKER', skin: '#b07a50', hair: hardHat('#f2c418'), stache: true, shirt: '#2a4a8a', shirtDark: '#1d3466', over: coverall, lower: 'pants', mundu: '#2a4a8a', legs: '#2a4a8a', shoes: '#2a1c17' },
  amma: { name: 'AMMA', skin: '#b67a52', hair: (ctx) => { ctx.beginPath(); ctx.moveTo(-56, -296); ctx.bezierCurveTo(-60, -364, 60, -364, 56, -296); ctx.quadraticCurveTo(40, -336, 0, -338); ctx.quadraticCurveTo(-40, -336, -56, -296); ctx.closePath(); fs(ctx, '#2a2018'); ell(ctx, 0, -360, 22, 16); fs(ctx, '#2a2018'); },
    shirt: '#2f7a5a', shirtDark: '#1f5a40', lower: 'mundu', mundu: '#f6f0e2', kasavu: '#d9a521', neriyathu: true, legs: '#6b4632', shoes: '#7a4a2a' },
  youth: { name: 'GRADUATE', skin: '#b98257', hair: hairShort('#1a120d', 1), glasses: true, shirt: '#f2f2ee', shirtDark: '#d6d6ce', collar: true, pocket: true, lower: 'pants', mundu: '#4a4a52', legs: '#4a4a52', shoes: '#2a1c17' },
};

export const NEW_PROPS = {
  bundle: (ctx) => { ctx.save(); ctx.translate(4, -16); ell(ctx, 0, 0, 30, 24); fs(ctx, '#e8dcc0', 4.5); ctx.beginPath(); ctx.moveTo(-6, -22); ctx.quadraticCurveTo(0, -40, 10, -26); ctx.quadraticCurveTo(14, -38, 22, -22); fs(ctx, '#e8dcc0', 4); ctx.strokeStyle = '#c8312c'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-28, 4); ctx.quadraticCurveTo(0, 14, 28, 4); ctx.stroke(); ctx.restore(); },
  suitcase: (ctx) => { ctx.save(); ctx.translate(0, 34); ctx.beginPath(); ctx.roundRect(-30, -24, 60, 44, 5); fs(ctx, '#3a5a8a', 4.5); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-10, -24); ctx.lineTo(-10, -34); ctx.lineTo(10, -34); ctx.lineTo(10, -24); ctx.stroke(); ctx.fillStyle = '#e8b93a'; ctx.fillRect(-26, -6, 52, 5); ctx.restore(); },
  twoinone: (ctx) => { ctx.save(); ctx.translate(18, -30); ctx.rotate(-0.15); ctx.beginPath(); ctx.roundRect(-44, -26, 88, 50, 6); fs(ctx, '#c8c8cc', 4.5); for (const s of [-1, 1]) { ell(ctx, s * 26, 2, 14, 14); fs(ctx, '#2a2a30', 3.5); ell(ctx, s * 26, 2, 5, 5); ctx.fillStyle = '#8a8a90'; ctx.fill(); }
    ctx.fillStyle = '#1d1d22'; ctx.fillRect(-10, -8, 20, 16); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-30, -26); ctx.lineTo(-24, -40); ctx.lineTo(24, -40); ctx.lineTo(30, -26); ctx.stroke(); ctx.restore(); },
  letter: (ctx) => { ctx.save(); ctx.rotate(-0.2); ctx.beginPath(); ctx.rect(-6, -40, 52, 34); fs(ctx, '#bfe0f4', 4); ctx.strokeStyle = '#c8312c'; ctx.lineWidth = 3; ctx.setLineDash([6, 5]); ctx.strokeRect(-2, -36, 44, 26); ctx.setLineDash([]); ctx.fillStyle = '#c8312c'; ctx.fillRect(30, -36, 10, 10); ctx.restore(); },
  draft: (ctx) => { ctx.save(); ctx.rotate(-0.2); ctx.beginPath(); ctx.rect(-6, -36, 62, 28); fs(ctx, '#f4ecd6', 4); ctx.fillStyle = '#2f6a3a'; ctx.fillRect(-6, -36, 62, 6); ctx.fillStyle = '#2a1c17'; ctx.font = "700 13px 'Oswald'"; ctx.fillText('₹ ★★★', 4, -14); ctx.restore(); },
  papers: (ctx) => { ctx.save(); ctx.rotate(-0.15); ctx.beginPath(); ctx.rect(-4, -46, 40, 50); fs(ctx, '#f4ecd6', 4); ctx.fillStyle = '#8a1e1e'; ctx.font = "800 11px 'Noto Malayalam'"; ctx.fillText('ബിരുദം', 0, -30); ctx.strokeStyle = 'rgba(42,28,23,.5)'; ctx.lineWidth = 2; for (let y = -22; y < 0; y += 6) { ctx.beginPath(); ctx.moveTo(2, y); ctx.lineTo(30, y); ctx.stroke(); } ctx.restore(); },
};

export function registerCast(B) { Object.assign(B.CAST, NEW_CAST); Object.assign(B.PROPS, NEW_PROPS); }
