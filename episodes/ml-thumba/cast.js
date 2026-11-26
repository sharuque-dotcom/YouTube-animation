// Thumba 1963: new cast in the bean style. Real people are friendly caricatures drawn by costume only.
// VIKRAM SARABHAI, BISHOP PEREIRA, young KALAM, a second young SCIENTIST, a FISHER WOMAN, a FISHER BOY,
// the SCOFFER (generic foreign pundit) and the ALTAR SERVER. VAREED (fisherman) and MEENU come from pipeline/bean.js.
const INK = '#2a1c17', OL = 6.5;
function ell(ctx, x, y, rx, ry, rot = 0) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); }
function fs(ctx, fill, w = OL) { if (fill) { ctx.fillStyle = fill; ctx.fill(); } ctx.lineWidth = w; ctx.strokeStyle = INK; ctx.stroke(); }
const both = (...fns) => (ctx) => fns.forEach((f) => f(ctx));

// ---------- heads
function wavySwept(color, grey) { // thick wavy hair swept back off the forehead, greying temples
  return (ctx) => {
    ctx.beginPath(); ctx.moveTo(-54, -298); ctx.bezierCurveTo(-64, -350, -40, -384, 0, -380); ctx.bezierCurveTo(44, -384, 66, -350, 54, -298);
    ctx.quadraticCurveTo(50, -330, 30, -338); ctx.quadraticCurveTo(0, -346, -30, -338); ctx.quadraticCurveTo(-50, -330, -54, -298); ctx.closePath(); fs(ctx, color);
    ctx.strokeStyle = 'rgba(255,255,255,.28)'; ctx.lineWidth = 3; for (const k of [-1, 0, 1]) { ctx.beginPath(); ctx.moveTo(-34 + k * 4, -350 + k * 8); ctx.quadraticCurveTo(0, -372 + k * 6, 34, -352 + k * 8); ctx.stroke(); }
    if (grey) { ctx.fillStyle = grey; for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * 51, -310, 6, 13, 0, 0, 7); ctx.fill(); } }
  };
}
function sideFlop(color) { // young Kalam: full side-parted hair falling over the ears (before the famous long silver hair)
  return (ctx) => {
    ctx.beginPath(); ctx.moveTo(-58, -280); ctx.bezierCurveTo(-70, -360, -30, -384, 6, -378); ctx.bezierCurveTo(50, -376, 70, -344, 58, -280);
    ctx.quadraticCurveTo(54, -318, 40, -328); ctx.quadraticCurveTo(10, -340, -22, -326); ctx.quadraticCurveTo(-46, -318, -58, -280); ctx.closePath(); fs(ctx, color);
    ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-26, -366); ctx.quadraticCurveTo(10, -356, 44, -336); ctx.stroke();
    ctx.strokeStyle = INK; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(-18, -378); ctx.quadraticCurveTo(-24, -356, -22, -330); ctx.stroke(); // side parting
  };
}
function zucchetto(cap = '#b0243a', hair = '#d8d2c8') { // bishop: short grey hair and a small magenta skullcap
  return (ctx) => {
    ctx.beginPath(); ctx.moveTo(-53, -300); ctx.bezierCurveTo(-58, -352, 58, -352, 53, -300); ctx.quadraticCurveTo(40, -328, 0, -330); ctx.quadraticCurveTo(-40, -328, -53, -300); ctx.closePath(); fs(ctx, hair);
    ctx.beginPath(); ctx.ellipse(0, -346, 34, 14, 0, Math.PI, 0); ctx.quadraticCurveTo(0, -338, -34, -346); fs(ctx, cap, 4.5); ell(ctx, 0, -360, 4, 3); fs(ctx, cap, 2.5);
  };
}
function bowler(color = '#2a2a30') { return (ctx) => { ctx.beginPath(); ctx.ellipse(0, -326, 72, 12, 0, 0, 7); fs(ctx, color); ctx.beginPath(); ctx.moveTo(-44, -328); ctx.bezierCurveTo(-48, -394, 48, -394, 44, -328); ctx.closePath(); fs(ctx, color); ctx.fillStyle = '#5a5a66'; ctx.fillRect(-44, -340, 88, 8); }; }
function boyCrop(color = '#1a120d') { return (ctx) => { ctx.beginPath(); ctx.moveTo(-53, -302); ctx.bezierCurveTo(-58, -362, 58, -362, 53, -302); ctx.quadraticCurveTo(30, -322, 10, -316); ctx.lineTo(0, -330); ctx.lineTo(-12, -316); ctx.quadraticCurveTo(-36, -322, -53, -302); ctx.closePath(); fs(ctx, color); }; }
function longBraid(color = '#1c1410') { return (ctx) => { ctx.beginPath(); ctx.moveTo(-53, -298); ctx.bezierCurveTo(-58, -362, 58, -362, 53, -298); ctx.quadraticCurveTo(40, -330, 0, -334); ctx.quadraticCurveTo(-40, -330, -53, -298); ctx.closePath(); fs(ctx, color);
  ctx.beginPath(); ctx.moveTo(44, -310); ctx.quadraticCurveTo(70, -270, 60, -220); ctx.quadraticCurveTo(52, -250, 40, -300); ctx.closePath(); fs(ctx, color, 4.5); ell(ctx, 0, -300, 4, 4); }; }

// ---------- torso layers
const cassock = (ctx, top, bot) => { // white cassock: magenta piping and buttons, sash, pectoral cross on a chain
  ctx.strokeStyle = '#b0243a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, top - 4); ctx.lineTo(0, bot + 2); ctx.stroke();
  for (let y = top + 6; y < bot - 6; y += 13) { ell(ctx, 0, y, 3.6, 3.6); ctx.fillStyle = '#b0243a'; ctx.fill(); }
  ctx.fillStyle = '#b0243a'; ctx.fillRect(-64, bot - 30, 128, 16); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.strokeRect(-64, bot - 30, 128, 16);
  ctx.strokeStyle = '#e8b93a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-26, top - 6); ctx.quadraticCurveTo(0, top + 34, 26, top - 6); ctx.stroke();
  ctx.fillStyle = '#e8b93a'; ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.rect(-4, top + 30, 8, 34); ctx.rect(-14, top + 40, 28, 8); ctx.fill(); ctx.stroke();
};
const halfSleeve = (pen = '#2a4a9a') => (ctx, top, bot) => { // 60s scientist: pocket with pens
  ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.strokeRect(14, top + 18, 26, 26); ctx.fillStyle = pen; ctx.fillRect(20, top + 8, 4, 18); ctx.fillStyle = '#c8312c'; ctx.fillRect(30, top + 10, 4, 16);
};
const chatta = (ctx, top, bot) => { // white chatta blouse with a little gold cross on a thread, neriyathu over the shoulder
  ctx.strokeStyle = '#1a120d'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, top - 10, 26, 0.4, Math.PI - 0.4); ctx.stroke();
  ctx.fillStyle = '#e8b93a'; ctx.fillRect(-2, top + 14, 4, 14); ctx.fillRect(-6, top + 18, 12, 4);
  ctx.fillStyle = 'rgba(246,241,228,.95)'; ctx.beginPath(); ctx.moveTo(-44, top - 6); ctx.lineTo(-22, top - 6); ctx.lineTo(48, bot); ctx.lineTo(26, bot); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#c8562a'; ctx.lineWidth = 4; ctx.stroke();
};
const suit = (ctx, top, bot) => { ctx.fillStyle = '#fbfaf6'; ctx.beginPath(); ctx.moveTo(-14, top - 6); ctx.lineTo(0, top + 40); ctx.lineTo(14, top - 6); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#8a1e2a'; ctx.beginPath(); ctx.moveTo(-5, top + 2); ctx.lineTo(5, top + 2); ctx.lineTo(3, top + 42); ctx.lineTo(-3, top + 42); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(-16, top - 6); ctx.lineTo(-4, top + 58); ctx.moveTo(16, top - 6); ctx.lineTo(4, top + 58); ctx.stroke(); };
const surplice = (ctx, top, bot) => { ctx.fillStyle = '#fbfaf6'; ctx.beginPath(); ctx.moveTo(-60, top + 4); ctx.quadraticCurveTo(0, top - 10, 60, top + 4); ctx.lineTo(66, bot - 30); ctx.quadraticCurveTo(0, bot - 18, -66, bot - 30); ctx.closePath(); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3.5; ctx.stroke(); };

export const NEW_CAST = {
  sarabhai: { name: 'VIKRAM SARABHAI', skin: '#d0a07a', hair: wavySwept('#2a2018', '#9a948a'), shirt: '#fbfaf6', shirtDark: '#dcd8ce', collar: true, over: halfSleeve(), lower: 'pants', mundu: '#efeae0', legs: '#efeae0', shoes: '#5a3a22' },
  bishop: { name: 'BISHOP PEREIRA', skin: '#b88058', hair: zucchetto(), glasses: true, wrinkles: true, shirt: '#fbfaf6', shirtDark: '#dedad2', over: cassock, lower: 'mundu', mundu: '#fbfaf6', kasavu: '#b0243a', legs: '#86562f', shoes: '#2a1c17' },
  kalam: { name: 'YOUNG KALAM', skin: '#9c6a46', hair: sideFlop('#1a120d'), shirt: '#eef2f6', shirtDark: '#cfd6de', collar: true, over: halfSleeve('#1a1a22'), lower: 'pants', mundu: '#3a3a44', legs: '#3a3a44', shoes: '#2a1c17' },
  scientist: { name: 'TEAM MEMBER', skin: '#b98257', hair: (ctx) => { ctx.beginPath(); ctx.moveTo(-53, -300); ctx.bezierCurveTo(-58, -360, 58, -362, 53, -300); ctx.quadraticCurveTo(46, -326, 20, -330); ctx.quadraticCurveTo(-10, -318, -30, -326); ctx.quadraticCurveTo(-46, -320, -53, -300); ctx.closePath(); fs(ctx, '#1a120d'); }, glasses: true, stache: true, shirt: '#d8e4ea', shirtDark: '#b4c4cc', collar: true, over: halfSleeve(), lower: 'pants', mundu: '#6a5a4a', legs: '#6a5a4a', shoes: '#2a1c17' },
  fisherwoman: { name: 'MARIYAMMA', skin: '#9c6640', hair: longBraid(), shirt: '#f6f1e4', shirtDark: '#d8d0bc', over: chatta, lower: 'mundu', mundu: '#f6f1e4', kasavu: '#2f5fae', legs: '#7d4f30', shoes: '#7d4f30' },
  fisherboy: { name: 'JOSEPH (fisher boy)', skin: '#9c6640', hair: boyCrop(), child: true, bare: true, shirt: '#9c6640', shirtDark: '#7d4f30', lower: 'lungi', mundu: '#c8562a', kasavu: '#f2c94c', legs: '#7d4f30', shoes: '#7d4f30' },
  scoffer: { name: 'THE SCOFFER', skin: '#f0c8a6', hair: both(bowler()), stache: true, shirt: '#3a3a44', shirtDark: '#26262e', collar: false, over: suit, lower: 'pants', mundu: '#3a3a44', legs: '#26262e', shoes: '#1a120d' },
  server: { name: 'ALTAR BOY', skin: '#a87048', hair: boyCrop('#2a2018'), child: true, shirt: '#b0243a', shirtDark: '#8a1a2c', over: surplice, lower: 'mundu', mundu: '#b0243a', kasavu: '#b0243a', legs: '#86562f', shoes: '#2a1c17' },
};

export const NEW_PROPS = {
  clipboard: (ctx) => { ctx.save(); ctx.rotate(-0.15); ctx.beginPath(); ctx.rect(-6, -66, 54, 70); fs(ctx, '#b8864a', 4); ctx.beginPath(); ctx.rect(0, -58, 42, 56); fs(ctx, '#fbfaf6', 3); ctx.beginPath(); ctx.rect(12, -72, 18, 10); fs(ctx, '#9aa0aa', 3);
    ctx.strokeStyle = '#2a4a9a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(8, -12); ctx.quadraticCurveTo(20, -50, 36, -52); ctx.stroke(); ctx.restore(); }, // a little trajectory sketch
  toolbox: (ctx) => { ctx.beginPath(); ctx.rect(-30, 0, 64, 40); fs(ctx, '#c8312c', 4); ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(-10, -12); ctx.lineTo(14, -12); ctx.lineTo(14, 0); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke(); ctx.fillStyle = '#e8b93a'; ctx.fillRect(-4, 14, 10, 8); },
  wrench: (ctx) => { ctx.save(); ctx.rotate(-0.5); ctx.beginPath(); ctx.rect(-5, -70, 10, 76); fs(ctx, '#b8bcc4', 3.5); ctx.beginPath(); ctx.arc(0, -78, 14, 0.9, Math.PI * 2 + 0.2); fs(ctx, '#b8bcc4', 3.5); ctx.restore(); },
  nosecone: (ctx) => { ctx.save(); ctx.rotate(-0.25); ctx.beginPath(); ctx.moveTo(-16, 10); ctx.lineTo(-16, -40); ctx.quadraticCurveTo(0, -110, 16, -40); ctx.lineTo(16, 10); ctx.closePath(); fs(ctx, '#e6e8ec', 4);
    ctx.fillStyle = '#c8312c'; ctx.fillRect(-15, -22, 30, 8); ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-8, 4); ctx.lineTo(-8, -46); ctx.stroke(); ctx.restore(); },
  newspaper: (ctx) => { ctx.save(); ctx.rotate(-0.1); ctx.beginPath(); ctx.rect(-6, -64, 70, 84); fs(ctx, '#ece6d6', 4); ctx.fillStyle = INK; ctx.fillRect(2, -56, 54, 9); ctx.fillStyle = 'rgba(42,28,23,.45)'; for (let y = -40; y < 14; y += 8) ctx.fillRect(2, y, y % 16 ? 24 : 54, 3); ctx.beginPath(); ctx.rect(32, -38, 24, 24); ctx.fillStyle = '#9aa0aa'; ctx.fill(); ctx.restore(); },
  bible: (ctx) => { ctx.save(); ctx.rotate(-0.1); ctx.beginPath(); ctx.rect(-4, -44, 44, 54); fs(ctx, '#5a1a22', 4); ctx.fillStyle = '#e8b93a'; ctx.fillRect(14, -30, 6, 26); ctx.fillRect(8, -22, 18, 6); ctx.restore(); },
  keys: (ctx) => { ctx.strokeStyle = '#e8b93a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(6, -10, 10, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(14, -16); ctx.lineTo(34, -36); ctx.moveTo(26, -28); ctx.lineTo(32, -22); ctx.moveTo(30, -32); ctx.lineTo(36, -26); ctx.stroke(); },
  candle: (ctx) => { ctx.beginPath(); ctx.rect(-6, -50, 12, 52); fs(ctx, '#fbf6e6', 3.5); ctx.beginPath(); ctx.moveTo(0, -74); ctx.quadraticCurveTo(10, -58, 0, -52); ctx.quadraticCurveTo(-10, -58, 0, -74); fs(ctx, '#f0b23a', 2.5); },
};
export function registerCast(B) { Object.assign(B.CAST, NEW_CAST); Object.assign(B.PROPS, NEW_PROPS); }
