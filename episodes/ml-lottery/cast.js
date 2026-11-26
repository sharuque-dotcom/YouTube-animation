// Kerala Lottery 1967: new cast. KITTUNNI-ETTAN is a costume homage to the Kilukkam (1991) character: wavy combed-back
// hair, thick moustache, white shirt under a grey V-neck sweater vest, white mundu, lottery ticket. Bean style only,
// never an actor likeness. P.K. Kunju Sahib (historical finance minister) is a friendly bean caricature by costume only.
// NANDINI is a costume homage (long braid, salwar) seen only in the prank beat.
const INK = '#2a1c17', OL = 6.5;
function ell(ctx, x, y, rx, ry, rot = 0) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); }
function fs(ctx, fill, w = OL) { if (fill) { ctx.fillStyle = fill; ctx.fill(); } ctx.lineWidth = w; ctx.strokeStyle = INK; ctx.stroke(); }
const both = (...fns) => (ctx) => fns.forEach((f) => f(ctx));

function hairWavy(color) { return (ctx) => { // thick wavy hair combed back, slightly receding at the temples
  ctx.beginPath(); ctx.moveTo(-54, -296); ctx.bezierCurveTo(-64, -350, -40, -376, -6, -374); ctx.bezierCurveTo(30, -380, 64, -352, 54, -296);
  ctx.quadraticCurveTo(50, -322, 34, -330); ctx.quadraticCurveTo(26, -342, 8, -340); ctx.quadraticCurveTo(-10, -346, -22, -336); ctx.quadraticCurveTo(-40, -330, -54, -296); ctx.closePath(); fs(ctx, color);
  ctx.strokeStyle = 'rgba(255,255,255,.28)'; ctx.lineWidth = 3; for (const o of [-24, 0, 22]) { ctx.beginPath(); ctx.moveTo(o - 10, -352); ctx.quadraticCurveTo(o, -366, o + 12, -354); ctx.stroke(); } }; }
function heavyStache(ctx) { ctx.beginPath(); ctx.moveTo(-28, -274); ctx.quadraticCurveTo(-14, -296, 0, -285); ctx.quadraticCurveTo(14, -296, 28, -274); ctx.quadraticCurveTo(14, -280, 0, -275); ctx.quadraticCurveTo(-14, -280, -28, -274); ctx.closePath(); ctx.fillStyle = '#1a120d'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke(); }
function hairBald(side = '#cfc8be') { return (ctx) => { ctx.fillStyle = side; for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * 48, -308, 11, 24, s * 0.2, 0, 7); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke(); }
  ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(-10, -322, 22, 3.6, 4.6); ctx.stroke(); }; }
function hairBraid(color) { return (ctx) => { // long braid falling over the right shoulder
  for (let i = 0; i < 6; i++) { ell(ctx, 50 + i * 2, -276 + i * 26, 12, 15, 0.15); fs(ctx, color, 4); }
  ctx.beginPath(); ctx.moveTo(-54, -296); ctx.bezierCurveTo(-60, -366, 60, -366, 54, -296); ctx.quadraticCurveTo(44, -330, 2, -338); ctx.quadraticCurveTo(-40, -330, -54, -296); ctx.closePath(); fs(ctx, color);
  ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(-18, -350); ctx.quadraticCurveTo(0, -356, 20, -348); ctx.stroke();
  ell(ctx, -34, -334, 7, 5, -0.4); fs(ctx, '#c8312c', 2.5); }; } // small red hair clip
function capSeller(color) { return (ctx) => { ctx.beginPath(); ctx.moveTo(-52, -320); ctx.bezierCurveTo(-52, -372, 52, -372, 52, -320); ctx.closePath(); fs(ctx, color); ctx.beginPath(); ctx.moveTo(-56, -320); ctx.lineTo(66, -320); ctx.lineTo(60, -309); ctx.lineTo(-56, -312); ctx.closePath(); fs(ctx, '#3a3a40', 4.5); }; }
const sweaterVest = (col, rib) => (ctx, top, bot) => { // V-neck sleeveless sweater over a collared shirt
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-34, top - 6); ctx.lineTo(0, top + 62); ctx.lineTo(34, top - 6); ctx.lineTo(70, top); ctx.lineTo(70, bot + 6); ctx.lineTo(-70, bot + 6); ctx.lineTo(-70, top); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(-34, top - 6); ctx.lineTo(0, top + 62); ctx.lineTo(34, top - 6); ctx.stroke();
  ctx.strokeStyle = rib; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-30, top - 4); ctx.lineTo(0, top + 56); ctx.lineTo(30, top - 4); ctx.stroke();
  ctx.fillStyle = rib; ctx.fillRect(-70, bot - 14, 140, 14); ctx.strokeStyle = 'rgba(0,0,0,.18)'; ctx.lineWidth = 2; for (let x = -66; x < 70; x += 8) { ctx.beginPath(); ctx.moveTo(x, bot - 14); ctx.lineTo(x, bot); ctx.stroke(); }
  ctx.fillStyle = '#f6f4ee'; ctx.beginPath(); ctx.moveTo(-14, top - 2); ctx.lineTo(0, top + 18); ctx.lineTo(14, top - 2); ctx.closePath(); ctx.fill(); };
const kurtaSash = (col) => (ctx, top, bot) => { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-60, top + 6); ctx.lineTo(-30, top - 6); ctx.lineTo(60, bot - 30); ctx.lineTo(60, bot - 6); ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'rgba(42,28,23,.5)'; ctx.lineWidth = 3; ctx.stroke(); }; // dupatta
const slingBag = (ctx, top, bot) => { ctx.strokeStyle = '#5a3a22'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(-30, top - 4); ctx.lineTo(44, bot - 30); ctx.stroke(); };

export const NEW_CAST = {
  kittunni: { name: 'KITTUNNI-ETTAN (homage)', skin: '#c08458', hair: both(hairWavy('#1c1410'), heavyStache), shirt: '#f6f4ee', shirtDark: '#d8d4c8', collar: true, over: sweaterVest('#8e939a', '#6e737a'), lower: 'mundu', mundu: '#f6f1e4', kasavu: '#c9b48a', legs: '#6b4632', shoes: '#3a2a20' },
  kunju: { name: 'P.K. KUNJU SAHIB', skin: '#c08a5e', hair: hairBald('#d8d2c8'), glasses: true, stache: true, shirt: '#f4f1e8', shirtDark: '#d6d0c0', collar: true, pocket: true, lower: 'mundu', mundu: '#f6f1e4', kasavu: '#d9a521', legs: '#6b4632', shoes: '#3a2a20' },
  nandini: { name: 'NANDINI (homage)', skin: '#c99068', hair: hairBraid('#1c1410'), shirt: '#e06a8a', shirtDark: '#b84a6a', over: kurtaSash('#f2d04a'), lower: 'pants', mundu: '#f2d04a', legs: '#c99068', shoes: '#8a3a2a' },
  seller: { name: 'LOTTERY SELLER', skin: '#a87048', hair: capSeller('#2f6a8a'), stache: true, shirt: '#e8a24a', shirtDark: '#c4802a', collar: true, over: slingBag, lower: 'lungi', mundu: '#3a5a8a', kasavu: '#e8d48a', legs: '#86562f', shoes: '#3a2a20' },
};

function ticketDraw(ctx, w, h, num = '₹1') { // a 1967-style paper lottery ticket, drawn at origin
  ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 4); fs(ctx, '#f6e7b8', 4); ctx.fillStyle = '#c8312c'; ctx.fillRect(-w / 2 + 4, -h / 2 + 4, w - 8, h * 0.22);
  ctx.fillStyle = '#2a1c17'; ctx.font = `800 ${Math.round(h * 0.26)}px Oswald`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(num, 0, h * 0.12);
  ctx.strokeStyle = 'rgba(42,28,23,.5)'; ctx.setLineDash([4, 4]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(w / 2 - 14, -h / 2); ctx.lineTo(w / 2 - 14, h / 2); ctx.stroke(); ctx.setLineDash([]); }
export const NEW_PROPS = {
  ticket: (ctx) => { ctx.save(); ctx.translate(16, -30); ctx.rotate(-0.25); ticketDraw(ctx, 74, 42); ctx.restore(); },
  ticketBig: (ctx) => { ctx.save(); ctx.translate(26, -50); ctx.rotate(-0.12); ticketDraw(ctx, 120, 66); ctx.restore(); },
  newspaper: (ctx) => { ctx.save(); ctx.translate(10, -40); ctx.rotate(-0.08); ctx.beginPath(); ctx.rect(-10, -50, 92, 90); fs(ctx, '#f2ecdc', 4); ctx.fillStyle = '#2a1c17'; ctx.fillRect(-4, -44, 80, 10);
    ctx.strokeStyle = 'rgba(42,28,23,.45)'; ctx.lineWidth = 2; for (let y = -26; y < 36; y += 7) { ctx.beginPath(); ctx.moveTo(-4, y); ctx.lineTo(34, y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(42, y); ctx.lineTo(76, y); ctx.stroke(); } ctx.restore(); },
  board: (ctx) => { ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, 30); ctx.lineTo(0, -120); ctx.stroke(); ctx.translate(0, -150); ctx.beginPath(); ctx.rect(-50, -40, 100, 80); fs(ctx, '#2f6a8a', 4);
    const cols = ['#f6e7b8', '#f2c0c8', '#bfe0c8', '#f6d090']; for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.rect(-44 + (i % 4) * 22, -34 + Math.floor(i / 4) * 36, 20, 32); fs(ctx, cols[i % 4], 2); } ctx.restore(); },
  files: (ctx) => { ctx.save(); ctx.translate(4, -16); for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.rect(-6 + i * 3, -30 - i * 6, 46, 34); fs(ctx, ['#d8b878', '#c8a868', '#e8c888'][i], 3.5); } ctx.restore(); },
};
export function registerCast(B) { Object.assign(B.CAST, NEW_CAST); Object.assign(B.PROPS, NEW_PROPS); }
