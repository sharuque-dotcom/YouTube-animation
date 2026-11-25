// Colachel 1741: cast + props in the bean style, registered into the shared bean CAST/PROPS at runtime.
// Head top ~y -350, face centred at y -300, INK outline. Torso overlays use bean.js's c.over(ctx, top, bot) hook.
const INK = '#2a1c17', OL = 6.5;
function ell(ctx, x, y, rx, ry, rot = 0) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); }
function fs(ctx, fill, w = OL) { if (fill) { ctx.fillStyle = fill; ctx.fill(); } ctx.lineWidth = w; ctx.strokeStyle = INK; ctx.stroke(); }
const both = (...fns) => (ctx) => fns.forEach((f) => f(ctx));

// ---------- heads
function periwig(color = '#f2efe8') { // powdered wig: rolled curls over the ears, queue at the back
  return (ctx) => {
    ctx.beginPath(); ctx.moveTo(-54, -300); ctx.bezierCurveTo(-60, -372, 60, -372, 54, -300); ctx.quadraticCurveTo(30, -338, 0, -340); ctx.quadraticCurveTo(-30, -338, -54, -300); ctx.closePath(); fs(ctx, color);
    for (const s of [-1, 1]) for (let k = 0; k < 2; k++) { ell(ctx, s * 60, -318 + k * 24, 13, 11); fs(ctx, color, 4.5); ctx.strokeStyle = 'rgba(42,28,23,.35)'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(s * 60, -318 + k * 24, 5, 0.5, 5.5); ctx.stroke(); }
  };
}
function tricorne(color, trim) {
  return (ctx) => {
    ctx.beginPath(); ctx.moveTo(-84, -330); ctx.quadraticCurveTo(-60, -350, -40, -386); ctx.quadraticCurveTo(0, -364, 40, -386); ctx.quadraticCurveTo(60, -350, 84, -330); ctx.quadraticCurveTo(0, -312, -84, -330); ctx.closePath(); fs(ctx, color);
    ctx.strokeStyle = trim; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-78, -333); ctx.quadraticCurveTo(-58, -352, -40, -380); ctx.quadraticCurveTo(0, -360, 40, -380); ctx.quadraticCurveTo(58, -352, 78, -333); ctx.stroke();
    ell(ctx, -46, -350, 7, 7); fs(ctx, '#f4a02a', 3); // orange cockade
  };
}
function longHair(color) { // tied-back hair under a hat, side locks
  return (ctx) => { for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 50, -330); ctx.quadraticCurveTo(s * 62, -300, s * 54, -272); ctx.quadraticCurveTo(s * 46, -290, s * 44, -320); ctx.closePath(); fs(ctx, color, 4.5); }
    ctx.beginPath(); ctx.moveTo(-50, -318); ctx.bezierCurveTo(-54, -356, 54, -356, 50, -318); ctx.quadraticCurveTo(0, -334, -50, -318); ctx.closePath(); fs(ctx, color); };
}
function crown() { // Travancore royal headdress: gold tiered crown with a red gem and a white plume
  return (ctx) => {
    ctx.beginPath(); ctx.moveTo(-50, -322); ctx.lineTo(-44, -360); ctx.quadraticCurveTo(0, -376, 44, -360); ctx.lineTo(50, -322); ctx.quadraticCurveTo(0, -332, -50, -322); ctx.closePath(); fs(ctx, '#e8b93a');
    ctx.beginPath(); ctx.moveTo(-30, -366); ctx.lineTo(0, -410); ctx.lineTo(30, -366); ctx.closePath(); fs(ctx, '#f0c84a', 5);
    ctx.strokeStyle = '#a8761a'; ctx.lineWidth = 3; for (const y of [-338, -350]) { ctx.beginPath(); ctx.moveTo(-46, y); ctx.quadraticCurveTo(0, y - 12, 46, y); ctx.stroke(); }
    ell(ctx, 0, -352, 9, 10); fs(ctx, '#c8312c', 3.5); ell(ctx, 0, -388, 5, 6); fs(ctx, '#2f8a5a', 3);
    ctx.beginPath(); ctx.moveTo(4, -408); ctx.quadraticCurveTo(30, -440, 48, -420); ctx.quadraticCurveTo(26, -418, 8, -400); ctx.closePath(); fs(ctx, '#fbfaf6', 4);
    for (const s of [-1, 1]) { ell(ctx, s * 55, -282, 6, 9); fs(ctx, '#e8b93a', 3); } // ear studs (kadukkan)
  };
}
function kudumi(color) { // front-knot hair of 18th-c. Nair warriors, with a red cloth band
  return (ctx) => {
    ctx.beginPath(); ctx.moveTo(-53, -304); ctx.bezierCurveTo(-58, -358, 58, -358, 53, -304); ctx.quadraticCurveTo(0, -330, -53, -304); ctx.closePath(); fs(ctx, color);
    ell(ctx, -22, -360, 20, 16, -0.4); fs(ctx, color);
    ctx.strokeStyle = '#c8312c'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(-52, -322); ctx.quadraticCurveTo(0, -340, 52, -322); ctx.stroke();
  };
}
function generalTurban() { // De Lannoy as Valiya Kappithan: Travancore red turban with a gold band + plume over his own hair
  return (ctx) => {
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 50, -320); ctx.quadraticCurveTo(s * 60, -296, s * 54, -276); ctx.quadraticCurveTo(s * 46, -292, s * 46, -318); ctx.closePath(); fs(ctx, '#8a5a2a', 4.5); }
    ctx.beginPath(); ctx.moveTo(-56, -318); ctx.bezierCurveTo(-62, -386, 62, -386, 56, -318); ctx.quadraticCurveTo(0, -330, -56, -318); ctx.closePath(); fs(ctx, '#c8312c');
    ctx.save(); ctx.clip(); ctx.strokeStyle = 'rgba(42,28,23,.3)'; ctx.lineWidth = 3; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-60, -336 - i * 10); ctx.quadraticCurveTo(0, -356 - i * 12, 60, -328 - i * 10); ctx.stroke(); } ctx.restore();
    ctx.strokeStyle = '#e8b93a'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(-54, -322); ctx.quadraticCurveTo(0, -334, 54, -322); ctx.stroke();
    ell(ctx, 20, -352, 8, 8); fs(ctx, '#e8b93a', 3); ctx.beginPath(); ctx.moveTo(22, -358); ctx.quadraticCurveTo(40, -400, 58, -386); ctx.quadraticCurveTo(40, -380, 26, -352); ctx.closePath(); fs(ctx, '#fbfaf6', 4);
  };
}
function towelHead(color) {
  return (ctx) => {
    ctx.beginPath(); ctx.moveTo(-55, -318); ctx.bezierCurveTo(-56, -365, 56, -365, 55, -318); ctx.quadraticCurveTo(0, -330, -55, -318); ctx.closePath(); fs(ctx, color);
    ctx.beginPath(); ctx.moveTo(48, -332); ctx.lineTo(70, -342); ctx.lineTo(66, -322); ctx.closePath(); fs(ctx, color, 5);
  };
}
function wetHair(color) { // diver: slicked hair with drips
  return (ctx) => { ctx.beginPath(); ctx.moveTo(-53, -300); ctx.bezierCurveTo(-58, -362, 58, -362, 53, -300); ctx.quadraticCurveTo(30, -322, 0, -330); ctx.quadraticCurveTo(-30, -322, -53, -300); ctx.closePath(); fs(ctx, color);
    for (const [x, y] of [[-40, -280], [44, -270], [30, -360]]) { ctx.beginPath(); ctx.moveTo(x, y - 12); ctx.quadraticCurveTo(x + 7, y, x, y + 4); ctx.quadraticCurveTo(x - 7, y, x, y - 12); fs(ctx, '#9fd8ff', 2.5); } };
}
function beardShort(color) { return (ctx) => { ctx.beginPath(); ctx.moveTo(-50, -296); ctx.quadraticCurveTo(-50, -230, 0, -226); ctx.quadraticCurveTo(50, -230, 50, -296); ctx.quadraticCurveTo(42, -246, 0, -240); ctx.quadraticCurveTo(-42, -246, -50, -296); ctx.closePath(); fs(ctx, color, 4); }; }

// ---------- torso layers
const dutchCoat = (col, cuff) => (ctx, top, bot) => { // long coat with gold-trimmed lapels, waistcoat showing
  ctx.fillStyle = '#f2e6c8'; ctx.beginPath(); ctx.moveTo(-14, top); ctx.lineTo(14, top); ctx.lineTo(16, bot); ctx.lineTo(-16, bot); ctx.closePath(); ctx.fill();
  for (let y = top + 16; y < bot - 6; y += 16) { ell(ctx, 0, y, 3.2, 3.2); ctx.fillStyle = '#c8962a'; ctx.fill(); }
  ctx.strokeStyle = cuff; ctx.lineWidth = 5; for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 15, top); ctx.lineTo(s * 17, bot); ctx.stroke(); }
  ctx.fillStyle = '#fbfaf6'; ctx.beginPath(); ctx.moveTo(-12, top - 4); ctx.lineTo(12, top - 4); ctx.lineTo(0, top + 26); ctx.closePath(); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.stroke(); // cravat
};
const crossBelts = (ctx, top, bot) => { ctx.strokeStyle = '#fbfaf6'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(-40, top + 4); ctx.lineTo(44, bot - 4); ctx.moveTo(40, top + 4); ctx.lineTo(-44, bot - 4); ctx.stroke(); ctx.strokeStyle = 'rgba(42,28,23,.4)'; ctx.lineWidth = 2; ctx.stroke(); ell(ctx, 0, (top + bot) / 2 - 4, 7, 7); ctx.fillStyle = '#e8b93a'; ctx.fill(); };
const royal = (ctx, top, bot) => { // gold necklaces + a red-and-gold angavastram over the shoulder
  ctx.strokeStyle = '#e8b93a'; ctx.lineWidth = 5; for (const r of [24, 36]) { ctx.beginPath(); ctx.arc(0, top - 6, r, 0.35, Math.PI - 0.35); ctx.stroke(); } ell(ctx, 0, top + 32, 8, 10); ctx.fillStyle = '#c8312c'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.fillStyle = '#f6f0e2'; ctx.beginPath(); ctx.moveTo(18, top - 6); ctx.lineTo(40, top - 6); ctx.lineTo(-30, bot + 4); ctx.lineTo(-52, bot + 4); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#e8b93a'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(38, top - 4); ctx.lineTo(-32, bot); ctx.stroke(); };
const sash = (ctx, top, bot) => { ctx.strokeStyle = '#c8312c'; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(-34, top); ctx.lineTo(40, bot - 6); ctx.stroke(); ctx.strokeStyle = '#e8b93a'; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = '#e8b93a'; for (const s of [-1, 1]) { ctx.fillRect(s * 44 - 10, top + 2, 20, 8); } for (let y = top + 22; y < bot - 8; y += 20) { ell(ctx, 0, y, 3.4, 3.4); ctx.fill(); } };
const bareWarrior = (ctx, top) => { ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(-14, top + 40, 10, 0.3, 2.6); ctx.arc(14, top + 40, 10, 0.5, 2.8); ctx.stroke(); ctx.strokeStyle = '#4a3020'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(-50, top + 104); ctx.lineTo(50, top + 104); ctx.stroke(); ctx.fillStyle = '#c8312c'; ctx.fillRect(-8, top + 98, 16, 12); }; // waist belt // sandal-paste marks
const chains = (ctx, top, bot) => { for (let k = 0; k < 9; k++) { const x = -44 + k * 11, y = bot - 30 + Math.sin(k * 0.8) * 3; ell(ctx, x, y, 8, 5.5, k % 2 ? 0 : 0.4); ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 3.5; ctx.strokeStyle = '#a8a8b0'; ctx.stroke(); }
  ctx.strokeStyle = 'rgba(42,28,23,.35)'; ctx.lineWidth = 3; for (const y of [top + 30, top + 60]) { ctx.beginPath(); ctx.moveTo(-30, y); ctx.lineTo(-10, y + 10); ctx.stroke(); } }; // torn shirt + chain

export const NEW_CAST = {
  imhoff: { name: 'VAN IMHOFF (Dutch governor)', skin: '#f1c9a8', hair: both(periwig(), tricorne('#1d2330', '#e8b93a')), shirt: '#1f4f8a', shirtDark: '#173c6a', over: dutchCoat('#1f4f8a', '#e8b93a'), lower: 'pants', mundu: '#f2e6c8', legs: '#fbfaf6', shoes: '#1d2330' },
  lannoy: { name: 'DE LANNOY (Dutch captain)', skin: '#f0c8a6', hair: both(longHair('#8a5a2a'), tricorne('#1d2330', '#fbfaf6')), stache: true, shirt: '#2a5a9a', shirtDark: '#1f4678', over: dutchCoat('#2a5a9a', '#c8312c'), lower: 'pants', mundu: '#f2e6c8', legs: '#fbfaf6', shoes: '#1d2330' },
  lannoyPrisoner: { name: 'DE LANNOY (prisoner)', skin: '#f0c8a6', hair: longHair('#8a5a2a'), stache: true, shirt: '#e8dcc0', shirtDark: '#cfc0a0', over: chains, lower: 'pants', mundu: '#8a7a5a', legs: '#f0c8a6', shoes: '#3a2a20' },
  kappithan: { name: 'VALIYA KAPPITHAN (De Lannoy)', skin: '#f0c8a6', hair: generalTurban(), stache: true, shirt: '#f6f0e2', shirtDark: '#dcd2b8', over: sash, lower: 'mundu', mundu: '#f6f1e4', kasavu: '#d9a521', legs: '#f0c8a6', shoes: '#6b4632' },
  maharaja: { name: 'MARTHANDA VARMA', skin: '#c08458', hair: crown(), stache: true, bare: true, shirt: '#c08458', shirtDark: '#a06a44', over: royal, lower: 'mundu', mundu: '#f6f1e4', kasavu: '#d9a521', legs: '#a06a44', shoes: '#6b4632' },
  nair: { name: 'NAIR WARRIOR', skin: '#a87048', hair: kudumi('#1a120d'), stache: true, bare: true, shirt: '#a87048', shirtDark: '#86562f', over: bareWarrior, lower: 'mundu', mundu: '#f4efe4', kasavu: '#c8312c', legs: '#86562f', shoes: '#a87048' },
  dutchSoldier: { name: 'DUTCH SOLDIER', skin: '#f2c8a4', hair: both(longHair('#c8a060'), tricorne('#1d2330', '#fbfaf6')), shirt: '#2a5a9a', shirtDark: '#1f4678', over: crossBelts, lower: 'pants', mundu: '#f2e6c8', legs: '#fbfaf6', shoes: '#1d2330' },
  fisher2: { name: 'MUKKUVAN (fisherman)', skin: '#8e5a36', hair: towelHead('#f2c94c'), stache: true, bare: true, shirt: '#8e5a36', shirtDark: '#6e4426', lower: 'lungi', mundu: '#c8312c', kasavu: '#f2c94c', legs: '#6e4426', shoes: '#8e5a36' },
  diver: { name: 'DIVER (night raid)', skin: '#86542f', hair: wetHair('#141010'), bare: true, shirt: '#86542f', shirtDark: '#66401f', lower: 'lungi', mundu: '#2a3a5a', kasavu: '#8fb7c9', legs: '#66401f', shoes: '#86542f' },
  ramayyan: { name: 'RAMAYYAN DALAWA', skin: '#c48a60', hair: kudumi('#2a2018'), glasses: false, stache: true, shirt: '#f6f0e2', shirtDark: '#dcd2b8', over: (ctx, top, bot) => { ctx.strokeStyle = '#d9a521'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-30, top); ctx.lineTo(38, bot); ctx.stroke(); }, lower: 'mundu', mundu: '#f6f1e4', kasavu: '#d9a521', legs: '#a06a44', shoes: '#6b4632' },
};
void beardShort;

export const NEW_PROPS = {
  sword: (ctx) => { ctx.save(); ctx.rotate(-0.25); ctx.beginPath(); ctx.moveTo(-4, 0); ctx.lineTo(-4, -110); ctx.quadraticCurveTo(6, -124, 10, -108); ctx.lineTo(4, 0); ctx.closePath(); fs(ctx, '#d8d8dc', 4); ctx.beginPath(); ctx.rect(-14, -2, 28, 7); fs(ctx, '#e8b93a', 3.5); ctx.beginPath(); ctx.rect(-4, 4, 8, 20); fs(ctx, '#6a4a2a', 3.5); ctx.restore(); },
  shield: (ctx) => { ell(ctx, 6, -6, 30, 30); fs(ctx, '#7a4a2a', 5); ell(ctx, 6, -6, 18, 18); ctx.strokeStyle = '#e8b93a'; ctx.lineWidth = 3; ctx.stroke(); for (const [x, y] of [[6, -30], [6, 18], [-18, -6], [30, -6]]) { ell(ctx, x, y, 3.5, 3.5); ctx.fillStyle = '#e8b93a'; ctx.fill(); } ell(ctx, 6, -6, 6, 6); fs(ctx, '#e8b93a', 3); },
  musket: (ctx) => { ctx.save(); ctx.rotate(0.15); ctx.strokeStyle = INK; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(0, 60); ctx.lineTo(0, -140); ctx.stroke(); ctx.strokeStyle = '#7a4a2a'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, 60); ctx.lineTo(0, -40); ctx.stroke(); ctx.strokeStyle = '#8a8a92'; ctx.beginPath(); ctx.moveTo(0, -40); ctx.lineTo(0, -138); ctx.stroke(); ctx.strokeStyle = '#d8d8dc'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -138); ctx.lineTo(0, -168); ctx.stroke(); ctx.restore(); },
  scroll: (ctx) => { ctx.save(); ctx.rotate(-0.2); ctx.beginPath(); ctx.rect(-2, -46, 36, 48); fs(ctx, '#f4e6c0', 4); for (const y of [-48, 2]) { ell(ctx, 16, y, 22, 5); fs(ctx, '#e2cf9a', 3); } ell(ctx, 16, -10, 7, 7); fs(ctx, '#c8312c', 3); ctx.restore(); },
  whistle: (ctx) => { ctx.beginPath(); ctx.roundRect(-4, -14, 26, 14, 5); fs(ctx, '#d8d8dc', 3.5); ell(ctx, 18, -2, 8, 8); fs(ctx, '#d8d8dc', 3.5); ctx.strokeStyle = '#c8312c'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-4, -8); ctx.quadraticCurveTo(-30, -40, -10, -70); ctx.stroke(); },
  oar: (ctx) => { ctx.save(); ctx.rotate(0.2); ctx.strokeStyle = INK; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(0, 50); ctx.lineTo(0, -120); ctx.stroke(); ctx.strokeStyle = '#b08850'; ctx.lineWidth = 5; ctx.stroke(); ctx.beginPath(); ctx.ellipse(0, -128, 12, 30, 0, 0, 7); fs(ctx, '#b08850', 4); ctx.restore(); },
  tricorne: (ctx) => { ctx.save(); ctx.translate(0, -14); ctx.rotate(-0.15); ctx.beginPath(); ctx.moveTo(-54, 0); ctx.quadraticCurveTo(-38, -14, -26, -42); ctx.quadraticCurveTo(0, -26, 26, -42); ctx.quadraticCurveTo(38, -14, 54, 0); ctx.quadraticCurveTo(0, 14, -54, 0); ctx.closePath(); fs(ctx, '#1d2330', 5);
    ctx.strokeStyle = '#e8b93a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-48, -2); ctx.quadraticCurveTo(-36, -16, -26, -36); ctx.quadraticCurveTo(0, -22, 26, -36); ctx.quadraticCurveTo(36, -16, 48, -2); ctx.stroke(); ell(ctx, -30, -14, 6, 6); fs(ctx, '#f4a02a', 3); ctx.restore(); },
};

export function registerCast(B) { Object.assign(B.CAST, NEW_CAST); Object.assign(B.PROPS, NEW_PROPS); }
