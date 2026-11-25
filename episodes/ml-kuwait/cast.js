// Kuwait 1990 (Gulf Part 2): new cast. Real people (Mathunny "Toyota Sunny" Mathews, Harbhajan Singh Vedi) are
// drawn as friendly bean caricatures by costume and props only (era clothes, briefcase, turban), never from photos.
// The "film hero" is a generic movie-star bean, not any actor's likeness. Saddam is a bean caricature (beret, moustache, uniform).
const INK = '#2a1c17', OL = 6.5;
function ell(ctx, x, y, rx, ry, rot = 0) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); }
function fs(ctx, fill, w = OL) { if (fill) { ctx.fillStyle = fill; ctx.fill(); } ctx.lineWidth = w; ctx.strokeStyle = INK; ctx.stroke(); }
const both = (...fns) => (ctx) => fns.forEach((f) => f(ctx));
function hairGrey(color = '#cfc9c0') { return (ctx) => { // receding grey hair, combed back
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 54, -288); ctx.quadraticCurveTo(s * 62, -338, s * 26, -352); ctx.quadraticCurveTo(s * 36, -330, s * 46, -294); ctx.closePath(); fs(ctx, color, 5); }
  ctx.beginPath(); ctx.moveTo(-26, -352); ctx.quadraticCurveTo(0, -362, 26, -352); ctx.quadraticCurveTo(0, -350, -26, -352); fs(ctx, color, 4); }; }
function turbanS(color) { return (ctx) => { // Sikh turban (dastar) with layered folds + a peak
  ctx.beginPath(); ctx.moveTo(-56, -306); ctx.bezierCurveTo(-64, -380, -20, -398, 0, -396); ctx.bezierCurveTo(20, -398, 64, -380, 56, -306); ctx.quadraticCurveTo(0, -330, -56, -306); ctx.closePath(); fs(ctx, color);
  ctx.strokeStyle = 'rgba(42,28,23,.35)'; ctx.lineWidth = 3; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-54, -318 - i * 14); ctx.quadraticCurveTo(0, -344 - i * 12, 54, -318 - i * 14); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(-10, -394); ctx.lineTo(0, -326); ctx.lineTo(10, -394); ctx.strokeStyle = INK; ctx.lineWidth = 3.5; ctx.stroke(); }; }
function beardFull(color) { return (ctx) => { ctx.beginPath(); ctx.moveTo(-54, -296); ctx.quadraticCurveTo(-58, -200, 0, -196); ctx.quadraticCurveTo(58, -200, 54, -296); ctx.quadraticCurveTo(44, -250, 0, -244); ctx.quadraticCurveTo(-44, -250, -54, -296); ctx.closePath(); fs(ctx, color, 4); }; }
function keffiyeh(cloth, pat) { return (ctx) => { ctx.beginPath(); ctx.moveTo(-70, -232); ctx.bezierCurveTo(-74, -300, -66, -392, 0, -392); ctx.bezierCurveTo(66, -392, 74, -300, 70, -232);
  ctx.quadraticCurveTo(60, -226, 50, -236); ctx.bezierCurveTo(54, -300, 50, -340, 0, -344); ctx.bezierCurveTo(-50, -340, -54, -300, -50, -236); ctx.quadraticCurveTo(-60, -226, -70, -232); ctx.closePath(); fs(ctx, cloth);
  ctx.save(); ctx.clip(); ctx.strokeStyle = pat; ctx.lineWidth = 3; ctx.globalAlpha = 0.8; for (let k = -120; k < 140; k += 14) { ctx.beginPath(); ctx.moveTo(k, -400); ctx.lineTo(k + 150, -220); ctx.stroke(); ctx.beginPath(); ctx.moveTo(k, -220); ctx.lineTo(k + 150, -400); ctx.stroke(); } ctx.restore(); }; }
function hairStar(color) { return (ctx) => { ctx.beginPath(); ctx.moveTo(-55, -296); ctx.bezierCurveTo(-66, -372, 10, -396, 40, -372); ctx.quadraticCurveTo(66, -350, 55, -296); ctx.quadraticCurveTo(44, -330, 10, -338); ctx.quadraticCurveTo(-30, -330, -55, -296); ctx.closePath(); fs(ctx, color); }; }
function shades(ctx) { ctx.fillStyle = '#141018'; ctx.strokeStyle = INK; ctx.lineWidth = 4; for (const s of [-1, 1]) { ctx.beginPath(); ctx.roundRect(s > 0 ? 4 : -40, -314, 36, 24, 8); ctx.fill(); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(-4, -306); ctx.lineTo(4, -306); ctx.stroke(); }
function glassesThin(ctx) { ctx.strokeStyle = INK; ctx.lineWidth = 3.5; for (const s of [-1, 1]) { ctx.beginPath(); ctx.roundRect(s > 0 ? 6 : -36, -312, 30, 22, 6); ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fill(); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(-6, -304); ctx.lineTo(6, -304); ctx.stroke(); }
const safari = (ctx, top, bot) => { ctx.strokeStyle = 'rgba(42,28,23,.5)'; ctx.lineWidth = 3; for (const s of [-1, 1]) { ctx.strokeRect(s * 30 - 14, top + 30, 28, 24); ctx.strokeRect(s * 30 - 16, bot - 46, 32, 28); } ctx.beginPath(); ctx.moveTo(0, top + 4); ctx.lineTo(0, bot); ctx.stroke();
  ctx.fillStyle = '#8a7a5a'; ctx.fillRect(-60, bot - 16, 120, 10); for (let y = top + 18; y < bot - 20; y += 22) { ell(ctx, 4, y, 3, 3); ctx.fillStyle = INK; ctx.fill(); } };
const suit = (tie) => (ctx, top, bot) => { ctx.fillStyle = '#f4f4f0'; ctx.beginPath(); ctx.moveTo(-18, top - 2); ctx.lineTo(0, top + 60); ctx.lineTo(18, top - 2); ctx.closePath(); ctx.fill(); ctx.fillStyle = tie; ctx.beginPath(); ctx.moveTo(-5, top + 4); ctx.lineTo(5, top + 4); ctx.lineTo(7, top + 50); ctx.lineTo(0, top + 60); ctx.lineTo(-7, top + 50); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-18, top - 2); ctx.lineTo(0, top + 60); ctx.lineTo(18, top - 2); ctx.stroke(); };
function beret(color) { return (ctx) => { ctx.beginPath(); ctx.moveTo(-58, -322); ctx.bezierCurveTo(-70, -376, 10, -392, 60, -350); ctx.quadraticCurveTo(64, -330, 50, -322); ctx.quadraticCurveTo(0, -334, -58, -322); ctx.closePath(); fs(ctx, color);
  ctx.fillStyle = '#e8b93a'; ell(ctx, -26, -340, 9, 10); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke(); ctx.fillStyle = '#c9c3bb'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * 51, -304, 6, 13, 0, 0, 7); ctx.fill(); } }; }
function bigStache(ctx) { ctx.beginPath(); ctx.moveTo(-30, -276); ctx.quadraticCurveTo(-14, -298, 0, -286); ctx.quadraticCurveTo(14, -298, 30, -276); ctx.quadraticCurveTo(14, -282, 0, -276); ctx.quadraticCurveTo(-14, -282, -30, -276); ctx.closePath(); ctx.fillStyle = '#1a120d'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke(); }
const military = (ctx, top, bot) => { ctx.fillStyle = '#3a4a2a'; for (const s of [-1, 1]) ctx.fillRect(s * 44 - 10, top + 2, 20, 10); ctx.fillStyle = '#e8b93a'; for (const s of [-1, 1]) { ell(ctx, s * 44, top + 7, 4, 4); ctx.fill(); }
  ctx.fillStyle = '#c8312c'; ctx.fillRect(-40, top + 36, 22, 6); ctx.fillStyle = '#2f6a3a'; ctx.fillRect(-40, top + 42, 22, 6); ctx.fillStyle = '#3a2a20'; ctx.fillRect(-60, bot - 22, 120, 12); ctx.fillStyle = '#e8b93a'; ctx.fillRect(-7, bot - 23, 14, 14);
  ctx.strokeStyle = 'rgba(42,28,23,.45)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, top + 6); ctx.lineTo(0, bot - 22); ctx.stroke(); };
const jacket = (ctx, top, bot) => { ctx.fillStyle = '#1a1a1e'; ctx.fillRect(-60, top - 10, 40, bot - top + 20); ctx.fillRect(20, top - 10, 40, bot - top + 20); ctx.fillStyle = '#c8312c'; ctx.fillRect(-20, top - 10, 40, bot - top + 20); };

export const NEW_CAST = {
  saddam: { name: 'SADDAM', skin: '#c99a70', hair: both(beret('#1a1a1e'), bigStache), shirt: '#5a6a3a', shirtDark: '#3f4f28', collar: true, over: military, lower: 'pants', mundu: '#5a6a3a', legs: '#4a5a30', shoes: '#1a1310' },
  sunny: { name: "'TOYOTA SUNNY'", skin: '#c68b62', hair: both(hairGrey('#d6d0c6'), glassesThin), stache: true, shirt: '#c8b48a', shirtDark: '#a8946a', collar: true, over: safari, lower: 'pants', mundu: '#a8946a', legs: '#a8946a', shoes: '#4a3022' },
  vedi: { name: 'H. S. VEDI', skin: '#d0a078', hair: both(beardFull('#3a3430'), turbanS('#2a4a8a')), shirt: '#e8e2d4', shirtDark: '#c8c0aa', collar: true, pocket: true, lower: 'pants', mundu: '#4a4a52', legs: '#4a4a52', shoes: '#2a1c17' },
  ambassador: { name: 'AMBASSADOR', skin: '#c08a5e', hair: (ctx) => { ctx.beginPath(); ctx.moveTo(-53, -300); ctx.bezierCurveTo(-58, -360, 58, -362, 53, -300); ctx.quadraticCurveTo(30, -330, -30, -326); ctx.quadraticCurveTo(-46, -320, -53, -300); ctx.closePath(); fs(ctx, '#8a8480'); }, glasses: true, shirt: '#2a3040', shirtDark: '#1d2230', over: suit('#8a1e1e'), lower: 'pants', mundu: '#2a3040', legs: '#2a3040', shoes: '#1a1310' },
  driver: { name: 'IRAQI BUS DRIVER', skin: '#c99a70', hair: keffiyeh('#f4f0e6', '#c8312c'), stache: true, shirt: '#6a7a5a', shirtDark: '#4a5a3a', collar: true, pocket: true, lower: 'pants', mundu: '#4a4a40', legs: '#4a4a40', shoes: '#2a1c17' },
  star: { name: 'FILM HERO (fictional)', skin: '#d8a880', hair: both(hairStar('#1a120d'), shades), shirt: '#f4f4f0', shirtDark: '#d8d8d0', over: jacket, lower: 'pants', mundu: '#2a2a30', legs: '#2a2a30', shoes: '#1a1310' },
};
export const NEW_PROPS = {
  briefcase: (ctx) => { ctx.save(); ctx.translate(0, 34); ctx.beginPath(); ctx.roundRect(-34, -22, 68, 46, 4); fs(ctx, '#5a3a22', 4.5); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-10, -22); ctx.lineTo(-10, -32); ctx.lineTo(10, -32); ctx.lineTo(10, -22); ctx.stroke(); ctx.fillStyle = '#e8b93a'; for (const x of [-22, 22]) ctx.fillRect(x - 4, -20, 8, 6); ctx.restore(); },
  keys: (ctx) => { ctx.save(); ctx.translate(6, -20); ctx.beginPath(); ctx.arc(0, 0, 10, 0, 7); fs(ctx, null, 4); ctx.beginPath(); ctx.roundRect(4, -6, 30, 14, 4); fs(ctx, '#1a1a1e', 3.5); ctx.fillStyle = '#c8312c'; ell(ctx, 19, 1, 6, 4); ctx.fill(); ctx.restore(); },
  passport: (ctx) => { ctx.save(); ctx.rotate(-0.15); ctx.beginPath(); ctx.roundRect(-4, -46, 34, 46, 3); fs(ctx, '#1f3a6a', 4); ctx.fillStyle = '#e8b93a'; ell(ctx, 13, -26, 7, 7); ctx.fill(); ctx.restore(); },
  phone: (ctx) => { ctx.save(); ctx.rotate(-0.4); ctx.beginPath(); ctx.roundRect(-8, -60, 22, 66, 8); fs(ctx, '#2a2a30', 4); ctx.restore(); },
  clap: (ctx) => { ctx.save(); ctx.rotate(-0.2); ctx.beginPath(); ctx.rect(-4, -40, 56, 40); fs(ctx, '#1a1a1e', 4); ctx.beginPath(); ctx.moveTo(-4, -40); ctx.lineTo(52, -52); ctx.lineTo(52, -44); ctx.lineTo(-4, -32); ctx.closePath(); fs(ctx, '#f4f4f0', 3); ctx.restore(); },
};
export function registerCast(B) { Object.assign(B.CAST, NEW_CAST); Object.assign(B.PROPS, NEW_PROPS); }
