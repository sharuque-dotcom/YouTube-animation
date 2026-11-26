// Kunjali Marakkar (1600): new cast in the bean style. Historical figures are friendly caricatures by costume only;
// any nod to the 2021 Marakkar film is costume (white turban, red sash, curved sword), never an actor likeness.
// KUNJALI IV, KUNJALI III (older), the ZAMORIN (Samoothiri of Calicut), a PORTUGUESE CAPTAIN, the VICEROY,
// a PORTUGUESE SOLDIER, a MARAKKAR SAILOR and a modern INDIAN NAVY SAILOR. NAIR warriors are reused from ml-colachel.
const INK = '#2a1c17', OL = 6.5;
function ell(ctx, x, y, rx, ry, rot = 0) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); }
function fs(ctx, fill, w = OL) { if (fill) { ctx.fillStyle = fill; ctx.fill(); } ctx.lineWidth = w; ctx.strokeStyle = INK; ctx.stroke(); }
const both = (...fns) => (ctx) => fns.forEach((f) => f(ctx));

// ---------- heads
function thalappavu(cloth = '#fbfaf6', band = '#c8312c') { // wrapped Mappila turban with a red band and a tail at the back
  return (ctx) => {
    ctx.beginPath(); ctx.moveTo(-58, -314); ctx.bezierCurveTo(-66, -392, 66, -392, 58, -314); ctx.quadraticCurveTo(0, -330, -58, -314); ctx.closePath(); fs(ctx, cloth);
    ctx.save(); ctx.clip(); ctx.strokeStyle = 'rgba(42,28,23,.28)'; ctx.lineWidth = 3; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-64, -330 - i * 11); ctx.quadraticCurveTo(0, i % 2 ? -364 - i * 9 : -344 - i * 11, 64, -326 - i * 11); ctx.stroke(); } ctx.restore();
    ctx.strokeStyle = band; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(-57, -322); ctx.quadraticCurveTo(0, -336, 57, -322); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(50, -330); ctx.quadraticCurveTo(80, -320, 76, -282); ctx.quadraticCurveTo(66, -300, 52, -312); ctx.closePath(); fs(ctx, cloth, 4.5); // tail
    ell(ctx, 0, -350, 8, 8); fs(ctx, '#e8b93a', 3.5);
  };
}
function beard(color, long = false) { // full beard framing the jaw, moustache joined
  return (ctx) => {
    const d = long ? 34 : 18;
    ctx.beginPath(); ctx.moveTo(-52, -300); ctx.quadraticCurveTo(-56, -236 + d * 0.2, -20, -226 + d); ctx.quadraticCurveTo(0, -218 + d, 20, -226 + d); ctx.quadraticCurveTo(56, -236 + d * 0.2, 52, -300);
    ctx.quadraticCurveTo(46, -250, 26, -240); ctx.quadraticCurveTo(0, -232, -26, -240); ctx.quadraticCurveTo(-46, -250, -52, -300); ctx.closePath(); fs(ctx, color, 4.5);
  };
}
function zamorinCrown() { // tall tapering gold crown (kireedam) with a red gem band, peacock-blue tip, big ear studs
  return (ctx) => {
    ctx.beginPath(); ctx.moveTo(-50, -320); ctx.lineTo(-34, -408); ctx.quadraticCurveTo(0, -424, 34, -408); ctx.lineTo(50, -320); ctx.quadraticCurveTo(0, -334, -50, -320); ctx.closePath(); fs(ctx, '#e8b93a');
    ctx.strokeStyle = '#a8761a'; ctx.lineWidth = 3; for (const y of [-348, -372, -394]) { ctx.beginPath(); ctx.moveTo(-46 + (y + 320) * -0.18, y); ctx.quadraticCurveTo(0, y - 10, 46 - (y + 320) * -0.18, y); ctx.stroke(); }
    for (const x of [-26, 0, 26]) { ell(ctx, x, -336, 7, 8); fs(ctx, '#c8312c', 3); }
    ctx.beginPath(); ctx.moveTo(-14, -414); ctx.quadraticCurveTo(0, -452, 14, -414); ctx.closePath(); fs(ctx, '#f0c84a', 4.5); ell(ctx, 0, -432, 5, 7); fs(ctx, '#1f8a8a', 3);
    for (const s of [-1, 1]) { ell(ctx, s * 56, -280, 8, 11); fs(ctx, '#e8b93a', 3); ell(ctx, s * 56, -280, 3, 4); fs(ctx, '#c8312c', 1.5); }
  };
}
function bigStache(color = '#1a120d') { return (ctx) => { for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(0, -272); ctx.quadraticCurveTo(s * 22, -284, s * 40, -272); ctx.quadraticCurveTo(s * 50, -262, s * 46, -282); ctx.quadraticCurveTo(s * 30, -268, 0, -266); ctx.closePath(); fs(ctx, color, 3.5); } }; }
function morion(metal = '#c8ccd4') { // Iberian crested helmet with an upturned brim
  return (ctx) => {
    ctx.beginPath(); ctx.moveTo(-80, -318); ctx.quadraticCurveTo(-70, -332, -50, -326); ctx.bezierCurveTo(-52, -390, 52, -390, 50, -326); ctx.quadraticCurveTo(70, -332, 80, -318); ctx.quadraticCurveTo(0, -306, -80, -318); ctx.closePath(); fs(ctx, metal);
    ctx.beginPath(); ctx.moveTo(-36, -364); ctx.quadraticCurveTo(0, -420, 36, -364); ctx.closePath(); fs(ctx, metal, 4.5); // comb
    ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(-14, -350, 20, 3.6, 4.6); ctx.stroke();
    ell(ctx, 30, -398, 8, 14, 0.5); fs(ctx, '#c8312c', 3); // plume
  };
}
function plumedHat(color = '#1a1a22') { // viceroy: flat black hat with a white ostrich feather
  return (ctx) => {
    ctx.beginPath(); ctx.ellipse(0, -330, 74, 14, 0, 0, 7); fs(ctx, color); ctx.beginPath(); ctx.moveTo(-44, -332); ctx.bezierCurveTo(-46, -380, 46, -380, 44, -332); ctx.closePath(); fs(ctx, color);
    ctx.strokeStyle = '#e8b93a'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-44, -340); ctx.lineTo(44, -340); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(30, -350); ctx.quadraticCurveTo(80, -400, 96, -350); ctx.quadraticCurveTo(70, -370, 34, -340); ctx.closePath(); fs(ctx, '#fbfaf6', 4);
  };
}
function goatee(color) { return (ctx) => { ctx.beginPath(); ctx.moveTo(-10, -254); ctx.quadraticCurveTo(0, -212, 10, -254); ctx.closePath(); fs(ctx, color, 3.5); for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(0, -274); ctx.quadraticCurveTo(s * 20, -282, s * 34, -290); ctx.quadraticCurveTo(s * 26, -274, 0, -268); ctx.closePath(); fs(ctx, color, 3); } }; }
function headCloth(color) { return (ctx) => { ctx.beginPath(); ctx.moveTo(-55, -312); ctx.bezierCurveTo(-58, -366, 58, -366, 55, -312); ctx.quadraticCurveTo(0, -326, -55, -312); ctx.closePath(); fs(ctx, color); ctx.beginPath(); ctx.moveTo(-50, -324); ctx.lineTo(-76, -318); ctx.lineTo(-70, -300); ctx.closePath(); fs(ctx, color, 4); }; }
function navyCap() { // white peaked cap with a black band and gold badge, short hair
  return (ctx) => {
    ctx.beginPath(); ctx.moveTo(-54, -306); ctx.bezierCurveTo(-58, -344, 58, -344, 54, -306); ctx.closePath(); fs(ctx, '#1a120d', 4);
    ctx.beginPath(); ctx.ellipse(0, -350, 66, 22, 0, 0, 7); fs(ctx, '#fbfaf6'); ctx.beginPath(); ctx.rect(-52, -342, 104, 16); fs(ctx, '#1a1a22', 4);
    ctx.beginPath(); ctx.moveTo(-50, -326); ctx.quadraticCurveTo(0, -306, 50, -326); ctx.lineTo(44, -322); ctx.quadraticCurveTo(0, -316, -44, -322); ctx.closePath(); fs(ctx, '#1a1a22', 3);
    ell(ctx, 0, -336, 9, 9); fs(ctx, '#e8b93a', 3);
  };
}

// ---------- torso layers (bean.js calls c.over(ctx, top, bot))
const marakkarSash = (col = '#c8312c') => (ctx, top, bot) => { // long white tunic, red waist sash with gold edge, crossed belt for the sword
  ctx.fillStyle = col; ctx.fillRect(-70, bot - 38, 140, 26); ctx.strokeStyle = '#e8b93a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-70, bot - 38); ctx.lineTo(70, bot - 38); ctx.moveTo(-70, bot - 12); ctx.lineTo(70, bot - 12); ctx.stroke();
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(30, bot - 14); ctx.lineTo(48, bot + 30); ctx.lineTo(28, bot + 34); ctx.lineTo(18, bot - 12); ctx.closePath(); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
  ctx.strokeStyle = '#6a3e22'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(-40, top + 2); ctx.lineTo(44, bot - 40); ctx.stroke(); ell(ctx, 6, top + 50, 7, 7); fs(ctx, '#e8b93a', 2.5);
  ctx.strokeStyle = 'rgba(42,28,23,.25)'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(0, top - 2); ctx.lineTo(0, top + 40); ctx.stroke();
};
const royalBare = (ctx, top, bot) => { // gold chains, armlets, red-and-gold angavastram over the shoulder
  ctx.strokeStyle = '#e8b93a'; ctx.lineWidth = 5; for (const r of [24, 36, 48]) { ctx.beginPath(); ctx.arc(0, top - 8, r, 0.35, Math.PI - 0.35); ctx.stroke(); }
  ell(ctx, 0, top + 44, 9, 11); fs(ctx, '#c8312c', 3);
  ctx.fillStyle = '#c8312c'; ctx.beginPath(); ctx.moveTo(-40, top - 6); ctx.lineTo(-18, top - 6); ctx.lineTo(50, bot + 4); ctx.lineTo(28, bot + 4); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#e8b93a'; ctx.lineWidth = 4; ctx.stroke();
};
const doublet = (col, slash) => (ctx, top, bot) => { // puffed, slashed doublet with a white ruff and a gold chain
  ctx.strokeStyle = slash; ctx.lineWidth = 6; for (let x = -54; x <= 54; x += 18) { ctx.beginPath(); ctx.moveTo(x, top + 14); ctx.lineTo(x + 4, bot - 6); ctx.stroke(); }
  for (let y = top + 18; y < bot - 6; y += 18) { ell(ctx, 0, y, 3.4, 3.4); ctx.fillStyle = '#e8b93a'; ctx.fill(); }
  ctx.fillStyle = '#fbfaf6'; for (let k = -4; k <= 4; k++) { ell(ctx, k * 12, top - 4, 9, 10); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke(); }
  ctx.strokeStyle = '#e8b93a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, top + 6, 30, 0.4, Math.PI - 0.4); ctx.stroke();
};
const cuirass = (ctx, top, bot) => { ctx.fillStyle = '#c8ccd4'; ctx.beginPath(); ctx.moveTo(-58, top + 6); ctx.quadraticCurveTo(0, top - 8, 58, top + 6); ctx.lineTo(52, bot - 10); ctx.quadraticCurveTo(0, bot + 6, -52, bot - 10); ctx.closePath(); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,.65)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-26, top + 20); ctx.quadraticCurveTo(-34, top + 60, -22, bot - 20); ctx.stroke(); ctx.strokeStyle = 'rgba(42,28,23,.3)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, top + 4); ctx.lineTo(0, bot - 4); ctx.stroke(); };
const chained = (ctx, top, bot) => { for (let k = 0; k < 9; k++) { const x = -44 + k * 11, y = bot - 34 + Math.sin(k * 0.8) * 3; ell(ctx, x, y, 8, 5.5, k % 2 ? 0 : 0.4); ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 3.5; ctx.strokeStyle = '#9aa0aa'; ctx.stroke(); } };
const navyWhites = (ctx, top, bot) => { ctx.fillStyle = '#1a2a5a'; ctx.beginPath(); ctx.moveTo(-40, top - 4); ctx.lineTo(0, top + 40); ctx.lineTo(40, top - 4); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#fbfaf6'; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = '#1a1a22'; ctx.beginPath(); ctx.moveTo(-10, top + 30); ctx.lineTo(10, top + 30); ctx.lineTo(4, top + 62); ctx.lineTo(-4, top + 62); ctx.closePath(); ctx.fill();
  for (const s of [-1, 1]) { ctx.fillStyle = '#1a1a22'; ctx.fillRect(s * 52 - 10, top + 2, 20, 8); ctx.fillStyle = '#e8b93a'; ctx.fillRect(s * 52 - 8, top + 4, 16, 3); } };

export const NEW_CAST = {
  kunjali: { name: 'KUNJALI MARAKKAR IV', skin: '#a87048', hair: both(thalappavu(), beard('#1a120d'), bigStache()), shirt: '#f6f2ea', shirtDark: '#d8d2c4', collar: false, over: marakkarSash(), lower: 'mundu', mundu: '#f6f1e4', kasavu: '#c8312c', legs: '#86562f', shoes: '#86562f' },
  kunjaliChained: { name: 'KUNJALI (captured)', skin: '#a87048', hair: both(thalappavu('#d8d0bc', '#8a7a5a'), beard('#1a120d'), bigStache()), shirt: '#e8e0cc', shirtDark: '#c8bea6', over: chained, lower: 'mundu', mundu: '#e8e0cc', kasavu: '#8a7a5a', legs: '#86562f', shoes: '#86562f' },
  kunjali3: { name: 'KUNJALI III', skin: '#a87048', hair: both(thalappavu('#f2eee4', '#2f6a3a'), beard('#d8d2c8', true)), wrinkles: true, shirt: '#f2eee4', shirtDark: '#d4cebe', over: marakkarSash('#2f6a3a'), lower: 'mundu', mundu: '#f2eee4', kasavu: '#2f6a3a', legs: '#86562f', shoes: '#86562f' },
  zamorin: { name: 'THE ZAMORIN', skin: '#c08458', hair: both(zamorinCrown(), bigStache()), bare: true, shirt: '#c08458', shirtDark: '#a06a44', over: royalBare, lower: 'mundu', mundu: '#f6f1e4', kasavu: '#e8b93a', legs: '#a06a44', shoes: '#a06a44' },
  captain: { name: 'PORTUGUESE CAPTAIN', skin: '#f0c8a6', hair: both(morion(), goatee('#5a3a1a')), shirt: '#8a1e2a', shirtDark: '#6a1520', over: doublet('#8a1e2a', '#e8b93a'), lower: 'pants', mundu: '#2a2430', legs: '#2a2430', shoes: '#1a120d' },
  viceroy: { name: 'THE VICEROY', skin: '#f2cca8', hair: both(plumedHat(), goatee('#3a2a1a')), shirt: '#1a1a22', shirtDark: '#0f0f14', over: doublet('#1a1a22', '#4a4a5a'), lower: 'pants', mundu: '#1a1a22', legs: '#1a1a22', shoes: '#0f0f14' },
  portSoldier: { name: 'PORTUGUESE SOLDIER', skin: '#f0c8a6', hair: both(morion('#b8bcc4'), bigStache('#5a3a1a')), shirt: '#c8b48a', shirtDark: '#a8946a', over: cuirass, lower: 'pants', mundu: '#5a3a2a', legs: '#5a3a2a', shoes: '#2a1c17' },
  sailor: { name: 'MARAKKAR SAILOR', skin: '#8a5a38', hair: both(headCloth('#2f6a8a'), bigStache()), bare: true, shirt: '#8a5a38', shirtDark: '#6a4220', lower: 'lungi', mundu: '#2f4a7a', kasavu: '#e8b93a', legs: '#6a4220', shoes: '#6a4220' },
  sailor2: { name: 'MARAKKAR SAILOR 2', skin: '#9c6640', hair: headCloth('#c8562a'), bare: true, shirt: '#9c6640', shirtDark: '#7a4a2a', lower: 'lungi', mundu: '#6a2a3a', kasavu: '#e8b93a', legs: '#7a4a2a', shoes: '#7a4a2a' },
  navy: { name: 'INDIAN NAVY SAILOR', skin: '#b07a50', hair: navyCap(), shirt: '#fbfaf6', shirtDark: '#dcdad2', over: navyWhites, lower: 'pants', mundu: '#fbfaf6', legs: '#fbfaf6', shoes: '#1a120d' },
};

export const NEW_PROPS = {
  scimitar: (ctx) => { ctx.save(); ctx.rotate(-0.35); ctx.beginPath(); ctx.moveTo(-3, -10); ctx.quadraticCurveTo(26, -70, 6, -132); ctx.quadraticCurveTo(-2, -70, -14, -12); ctx.closePath(); fs(ctx, '#dfe4ea', 4);
    ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(2, -24); ctx.quadraticCurveTo(14, -70, 4, -118); ctx.stroke();
    ctx.beginPath(); ctx.rect(-24, -14, 34, 8); fs(ctx, '#e8b93a', 3.5); ctx.beginPath(); ctx.rect(-10, -6, 8, 24); fs(ctx, '#6a3e22', 3); ctx.restore(); },
  telescope: (ctx) => { ctx.save(); ctx.rotate(-1.2); ctx.beginPath(); ctx.rect(-7, -64, 14, 70); fs(ctx, '#b8862a', 4); ctx.beginPath(); ctx.rect(-10, -96, 20, 34); fs(ctx, '#d8a63a', 4); ctx.beginPath(); ctx.rect(-12, -100, 24, 6); fs(ctx, '#6a3e22', 3); ctx.restore(); },
  treaty: (ctx) => { ctx.save(); ctx.translate(6, -40); ctx.rotate(-0.1); ctx.beginPath(); ctx.rect(-10, -50, 70, 90); fs(ctx, '#f2e6c8', 4); ctx.strokeStyle = 'rgba(42,28,23,.4)'; ctx.lineWidth = 2.5; for (let y = -34; y < 20; y += 10) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(50, y); ctx.stroke(); }
    ell(ctx, 40, 26, 11, 11); fs(ctx, '#c8312c', 3); ctx.restore(); },
  oarK: (ctx) => { ctx.save(); ctx.rotate(0.3); ctx.beginPath(); ctx.rect(-4, -120, 8, 170); fs(ctx, '#8a5a2a', 3.5); ctx.beginPath(); ctx.ellipse(0, 56, 12, 28, 0, 0, 7); fs(ctx, '#8a5a2a', 3.5); ctx.restore(); },
  rope: (ctx) => { ctx.save(); ctx.strokeStyle = '#c8a46a'; ctx.lineWidth = 7; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.ellipse(0, -20 - k * 4, 22 - k * 3, 12, 0, 0, 7); ctx.stroke(); } ctx.restore(); },
};
export function registerCast(B) { Object.assign(B.CAST, NEW_CAST); Object.assign(B.PROPS, NEW_PROPS); }
