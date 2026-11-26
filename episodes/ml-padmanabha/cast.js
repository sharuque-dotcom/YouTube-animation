// Padmanabhaswamy Vault B: new cast. Historical figures are friendly bean caricatures by costume only, no likeness.
// T.P. SUNDARARAJAN (petitioner, ex-IPS lawyer, 70 in 2011), a generic AUDITOR (stands in for the amicus report), a
// ROYAL FAMILY representative (dignified, never mocked), the TANTRI (shown respectfully), JUDGE, INSPECTOR.
// MARTHANDA VARMA is reused from ml-colachel. The deity is never drawn; only a golden glow.
const INK = '#2a1c17', OL = 6.5;
function ell(ctx, x, y, rx, ry, rot = 0) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); }
function fs(ctx, fill, w = OL) { if (fill) { ctx.fillStyle = fill; ctx.fill(); } ctx.lineWidth = w; ctx.strokeStyle = INK; ctx.stroke(); }
const both = (...fns) => (ctx) => fns.forEach((f) => f(ctx));

function hairWhite(color = '#eeeae2') { return (ctx) => { // thin white hair, side-parted, high forehead
  ctx.beginPath(); ctx.moveTo(-54, -298); ctx.bezierCurveTo(-60, -340, -40, -360, -10, -356); ctx.quadraticCurveTo(-30, -340, -36, -318); ctx.quadraticCurveTo(-44, -306, -54, -298); ctx.closePath(); fs(ctx, color, 4);
  ctx.beginPath(); ctx.moveTo(54, -298); ctx.bezierCurveTo(60, -336, 44, -352, 20, -356); ctx.quadraticCurveTo(38, -336, 42, -316); ctx.closePath(); fs(ctx, color, 4); }; }
function sideWhite(color = '#e6e1d8') { return (ctx) => { for (const s of [-1, 1]) { ell(ctx, s * 48, -306, 11, 22, s * 0.2); fs(ctx, color, 3); } }; }
function kudumi(color) { return (ctx) => { // shaved head with a front tuft (traditional priest)
  ctx.strokeStyle = 'rgba(42,28,23,.25)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, -300, 50, 3.6, 5.8); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-10, -346); ctx.quadraticCurveTo(-26, -372, -4, -380); ctx.quadraticCurveTo(18, -376, 10, -346); ctx.closePath(); fs(ctx, color, 4); }; }
function bhasmam(ctx) { ctx.strokeStyle = '#f6f2ea'; ctx.lineWidth = 4; for (const y of [-334, -326, -318]) { ctx.beginPath(); ctx.moveTo(-22, y); ctx.lineTo(22, y); ctx.stroke(); } ell(ctx, 0, -326, 4, 4); ctx.fillStyle = '#c8312c'; ctx.fill(); }
function helmet(color) { return (ctx) => { ctx.beginPath(); ctx.moveTo(-58, -318); ctx.bezierCurveTo(-58, -392, 58, -392, 58, -318); ctx.closePath(); fs(ctx, color); ctx.beginPath(); ctx.ellipse(0, -318, 66, 9, 0, 0, 7); fs(ctx, color, 4); ell(ctx, 0, -362, 10, 8); fs(ctx, '#fff6c0', 3); }; }
const advocateCoat = (ctx, top, bot) => { // black coat open over a white shirt, white bands at the collar
  ctx.fillStyle = '#1c1d24'; ctx.beginPath(); ctx.moveTo(-70, top); ctx.lineTo(-18, top - 4); ctx.lineTo(-8, bot + 6); ctx.lineTo(-70, bot + 6); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(70, top); ctx.lineTo(18, top - 4); ctx.lineTo(8, bot + 6); ctx.lineTo(70, bot + 6); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-18, top - 4); ctx.lineTo(-8, bot + 6); ctx.moveTo(18, top - 4); ctx.lineTo(8, bot + 6); ctx.stroke();
  ctx.fillStyle = '#fbfaf6'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.rect(s * 7 - 5, top + 2, 10, 26); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke(); } };
const judgeRobe = (ctx, top, bot) => { advocateCoat(ctx, top, bot); ctx.fillStyle = '#1c1d24'; ctx.fillRect(-8, top + 30, 16, bot - top - 24); };
const poonool = (ctx, top, bot) => { ctx.strokeStyle = '#f6f2ea'; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(-40, top); ctx.lineTo(46, bot - 6); ctx.stroke(); ctx.strokeStyle = 'rgba(42,28,23,.35)'; ctx.lineWidth = 1; ctx.stroke(); };
const angavastram = (col, border) => (ctx, top, bot) => { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-64, top + 4); ctx.lineTo(-24, top - 6); ctx.lineTo(64, bot - 22); ctx.lineTo(64, bot); ctx.closePath(); ctx.fill(); ctx.strokeStyle = border; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-24, top - 4); ctx.lineTo(64, bot - 20); ctx.stroke(); };
const vest = (col) => (ctx, top, bot) => { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-70, top); ctx.lineTo(-20, top - 4); ctx.lineTo(-6, bot + 6); ctx.lineTo(-70, bot + 6); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(70, top); ctx.lineTo(20, top - 4); ctx.lineTo(6, bot + 6); ctx.lineTo(70, bot + 6); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#e8d24a'; ctx.fillRect(-66, top + 50, 132, 8); };

export const NEW_CAST = {
  sundar: { name: 'T.P. SUNDARARAJAN', skin: '#b98257', hair: hairWhite(), glasses: true, wrinkles: true, stache: false, shirt: '#f6f4ee', shirtDark: '#d8d4c8', collar: true, over: advocateCoat, lower: 'mundu', mundu: '#f6f1e4', kasavu: '#c9b48a', legs: '#6b4632', shoes: '#2a1c17' },
  sundarHome: { name: 'SUNDARARAJAN (at home)', skin: '#b98257', hair: hairWhite(), glasses: true, wrinkles: true, shirt: '#f6f4ee', shirtDark: '#d8d4c8', collar: true, pocket: true, lower: 'mundu', mundu: '#f6f1e4', kasavu: '#c9b48a', legs: '#6b4632', shoes: '#4a3022' },
  royal: { name: 'ROYAL FAMILY', skin: '#c99068', hair: sideWhite(), glasses: true, wrinkles: true, bare: true, shirt: '#c99068', shirtDark: '#a87048', over: angavastram('#f6f1e4', '#d9a521'), lower: 'mundu', mundu: '#f6f1e4', kasavu: '#d9a521', legs: '#a87048', shoes: '#a87048' },
  tantri: { name: 'TANTRI', skin: '#b98257', hair: both(kudumi('#1a120d'), bhasmam), bare: true, shirt: '#b98257', shirtDark: '#96603a', over: poonool, lower: 'mundu', mundu: '#f6f1e4', kasavu: '#d9a521', legs: '#96603a', shoes: '#96603a' },
  judge: { name: 'JUDGE', skin: '#c08a5e', hair: sideWhite('#d8d2c8'), glasses: true, shirt: '#f6f4ee', shirtDark: '#d8d4c8', collar: true, over: judgeRobe, lower: 'pants', mundu: '#1c1d24', legs: '#1c1d24', shoes: '#14110f' },
  auditor: { name: 'AUDITOR (amicus report)', skin: '#c99068', hair: sideWhite('#bdb6ad'), glasses: true, stache: true, shirt: '#8a96a6', shirtDark: '#6a7686', collar: true, pocket: true, lower: 'pants', mundu: '#3a3f4a', legs: '#3a3f4a', shoes: '#2a1c17' },
  inspector: { name: 'INSPECTION TEAM', skin: '#a87048', hair: helmet('#f0c23a'), stache: true, shirt: '#e8e2d0', shirtDark: '#c8c0aa', collar: true, over: vest('#e8742a'), lower: 'mundu', mundu: '#f4efe4', kasavu: '#8c6b3a', legs: '#86562f', shoes: '#3a2a20' },
  devotee: { name: 'DEVOTEE', skin: '#c48a60', hair: (ctx) => { ctx.beginPath(); ctx.moveTo(-54, -296); ctx.bezierCurveTo(-60, -366, 60, -366, 54, -296); ctx.quadraticCurveTo(44, -330, 2, -338); ctx.quadraticCurveTo(-40, -330, -54, -296); ctx.closePath(); fs(ctx, '#1c1410'); for (let i = 0; i < 6; i++) { ell(ctx, 22 + i * 1.5, -362 + i * 2, 5, 5); fs(ctx, '#fff', 2.5); } }, shirt: '#2f6a3a', shirtDark: '#1f4f2a', lower: 'mundu', mundu: '#f6f1e4', kasavu: '#d9a521', neriyathu: true, legs: '#6b4632', shoes: '#6b4632' },
};

export const NEW_PROPS = {
  petition: (ctx) => { ctx.save(); ctx.translate(8, -30); ctx.rotate(-0.1); for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.rect(-10 + i * 2, -46 - i * 7, 64, 50); fs(ctx, ['#f2ecdc', '#e8dcc0', '#f6f0e0', '#d8b878'][i], 3.5); }
    ctx.strokeStyle = '#c8312c'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-6, -50); ctx.lineTo(60, -50); ctx.stroke(); ctx.restore(); },
  torch: (ctx) => { ctx.save(); ctx.rotate(-0.5); ctx.beginPath(); ctx.rect(-8, -50, 16, 52); fs(ctx, '#3a3f4a', 4); ctx.beginPath(); ctx.moveTo(-12, -50); ctx.lineTo(12, -50); ctx.lineTo(16, -66); ctx.lineTo(-16, -66); ctx.closePath(); fs(ctx, '#5a606c', 4);
    ctx.fillStyle = 'rgba(255,240,170,.55)'; ctx.beginPath(); ctx.moveTo(-14, -66); ctx.lineTo(-60, -190); ctx.lineTo(60, -190); ctx.lineTo(14, -66); ctx.closePath(); ctx.fill(); ctx.restore(); },
  gavel: (ctx) => { ctx.save(); ctx.rotate(-0.6); ctx.beginPath(); ctx.rect(-4, -60, 8, 64); fs(ctx, '#8a5a2a', 3.5); ctx.beginPath(); ctx.rect(-26, -80, 52, 24); fs(ctx, '#6a4020', 4); ctx.restore(); },
  report: (ctx) => { ctx.save(); ctx.translate(10, -40); ctx.rotate(-0.08); ctx.beginPath(); ctx.rect(-6, -54, 80, 100); fs(ctx, '#f2ecdc', 4); ctx.fillStyle = '#2a4a7a'; ctx.fillRect(-2, -50, 72, 18);
    ctx.fillStyle = '#c8312c'; ctx.font = "800 40px Oswald"; ctx.textAlign = 'center'; ctx.fillText('7×', 34, 20); ctx.restore(); },
  lamp: (ctx) => { ctx.save(); ctx.translate(6, -10); ctx.beginPath(); ctx.ellipse(0, 0, 28, 8, 0, 0, 7); fs(ctx, '#d9a521', 4); ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(-4, -40); ctx.lineTo(4, -40); ctx.lineTo(6, 0); ctx.closePath(); fs(ctx, '#d9a521', 3);
    ctx.beginPath(); ctx.ellipse(0, -42, 20, 6, 0, 0, 7); fs(ctx, '#d9a521', 3.5); ctx.fillStyle = 'rgba(255,200,80,.35)'; ell(ctx, 0, -64, 26, 26); ctx.fill(); ctx.beginPath(); ctx.moveTo(0, -48); ctx.quadraticCurveTo(-8, -62, 0, -78); ctx.quadraticCurveTo(8, -62, 0, -48); fs(ctx, '#ffb43a', 2.5); ctx.restore(); },
  coins: (ctx) => { for (let i = 0; i < 5; i++) { ell(ctx, 4 + (i % 3) * 14 - 10, -8 - Math.floor(i / 3) * 12, 11, 6); fs(ctx, '#f0c23a', 3); } },
  cowrie: (ctx) => { ctx.save(); ctx.translate(10, -14); ctx.beginPath(); ctx.rect(-40, -20, 80, 36); fs(ctx, '#7a4a2a', 4); ctx.fillStyle = '#f6efe0'; for (let i = 0; i < 6; i++) { ell(ctx, -26 + (i % 3) * 26, -8 + Math.floor(i / 3) * 14, 6, 4); ctx.fill(); } ctx.restore(); },
};
export function registerCast(B) { Object.assign(B.CAST, NEW_CAST); Object.assign(B.PROPS, NEW_PROPS); }
