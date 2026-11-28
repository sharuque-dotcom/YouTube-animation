// Mullaperiyar cast in the bean style. Real people are friendly caricatures by costume only, never a photo likeness:
// the MAHARAJA of 1886 (Travancore crown and a jewelled court coat), PENNYCUICK (British engineer: khaki, pith helmet,
// big moustache). Everyone else is generic: a British OFFICER (Madras side), a dry-land MADURAI FARMER, a KERALA
// OFFICIAL and a TAMIL NADU OFFICIAL for 1970, the sleeping family (Kannan, Ammini), the NEIGHBOUR with the tap, the
// JUDGE. Reuses figures from ml-ems (farmer, nambi pack), ml-colachel (maharaja), ml-padmanabha (judge).
import * as EMS from '/episodes/ml-ems/cast.js';
import * as COL from '/episodes/ml-colachel/cast.js';
import * as PAD from '/episodes/ml-padmanabha/cast.js';
const INK = '#2a1c17', OL = 6.5;
function fs(ctx, fill, w = OL) { if (fill) { ctx.fillStyle = fill; ctx.fill(); } ctx.lineWidth = w; ctx.strokeStyle = INK; ctx.stroke(); }
const courtCoat = (ctx, top, bot) => { // jewelled brocade coat: gold placket, buttons, a necklace of pearls
  ctx.fillStyle = 'rgba(217,165,33,.9)'; ctx.fillRect(-8, top - 4, 16, bot - top + 8); ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.strokeRect(-8, top - 4, 16, bot - top + 8);
  for (let y = top + 10; y < bot - 4; y += 16) { ctx.beginPath(); ctx.arc(0, y, 3.5, 0, 7); ctx.fillStyle = '#c8312c'; ctx.fill(); }
  ctx.strokeStyle = '#f6f1e4'; ctx.lineWidth = 5; ctx.setLineDash([1, 7]); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-30, top - 2); ctx.quadraticCurveTo(0, top + 44, 30, top - 2); ctx.stroke(); ctx.setLineDash([]); };
const khakiPockets = (ctx, top) => { ctx.strokeStyle = INK; ctx.lineWidth = 3; for (const x of [-34, 12]) ctx.strokeRect(x, top + 18, 22, 20); ctx.fillStyle = '#6a5a3a'; ctx.fillRect(-60, top + 70, 120, 10); };
const govtBadge = (color) => (ctx, top) => { ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.strokeRect(14, top + 20, 24, 22); ctx.fillStyle = color; ctx.fillRect(20, top + 10, 4, 16); };
export const NEW_CAST = {};
export const NEW_PROPS = {
  quill: (ctx) => { ctx.save(); ctx.rotate(-0.5); ctx.beginPath(); ctx.moveTo(0, 20); ctx.quadraticCurveTo(-18, -50, 4, -110); ctx.quadraticCurveTo(22, -50, 0, 20); ctx.closePath(); fs(ctx, '#f6f1e4', 4);
    ctx.strokeStyle = 'rgba(42,28,23,.5)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(2, 18); ctx.lineTo(3, -100); ctx.stroke(); ctx.restore(); },
  lease: (ctx) => { ctx.save(); ctx.rotate(-0.12); ctx.beginPath(); ctx.rect(-4, -70, 70, 72); fs(ctx, '#f2e2b8', 4); for (const y of [-72, 4]) { ctx.beginPath(); ctx.ellipse(31, y, 40, 7, 0, 0, 7); fs(ctx, '#c8a86a', 3); }
    ctx.fillStyle = '#8a1e1e'; ctx.font = "700 30px 'Oswald'"; ctx.textAlign = 'center'; ctx.fillText('999', 31, -24); ctx.beginPath(); ctx.arc(31, -8, 6, 0, 7); ctx.fillStyle = '#c8312c'; ctx.fill(); ctx.restore(); },
  plans: (ctx) => { ctx.save(); ctx.rotate(0.3); ctx.beginPath(); ctx.roundRect(-10, -90, 20, 110, 8); fs(ctx, '#3a6a9a', 4); ctx.beginPath(); ctx.ellipse(0, -90, 10, 4, 0, 0, 7); fs(ctx, '#e8f0f8', 2.5); ctx.restore(); },
  file: (ctx) => { ctx.save(); ctx.rotate(-0.1); ctx.beginPath(); ctx.rect(-4, -60, 60, 62); fs(ctx, '#c8a86a', 4); ctx.fillStyle = '#f6f1e4'; ctx.fillRect(6, -48, 40, 10); ctx.fillStyle = INK; ctx.font = "700 14px 'Oswald'"; ctx.fillText('1970', 10, -14); ctx.restore(); },
  pen: (ctx) => { ctx.save(); ctx.rotate(-0.6); ctx.beginPath(); ctx.roundRect(-5, -60, 10, 70, 4); fs(ctx, '#1a1a2a', 3); ctx.restore(); },
  placardK: (ctx) => board(ctx, 'പുതിയ ഡാം!', '#c8312c'),
  placardT: (ctx) => board(ctx, 'ഡാം സേഫ്', '#2f6a9a'),
  gavel: (ctx) => { ctx.save(); ctx.rotate(-0.5); ctx.beginPath(); ctx.rect(-4, -70, 8, 80); fs(ctx, '#7a4a2a', 3); ctx.beginPath(); ctx.roundRect(-26, -92, 52, 26, 6); fs(ctx, '#5a3420', 4); ctx.restore(); },
  hoe: (ctx) => { ctx.save(); ctx.rotate(0.4); ctx.strokeStyle = INK; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(0, 40); ctx.lineTo(0, -100); ctx.stroke(); ctx.strokeStyle = '#8a5a2a'; ctx.lineWidth = 5; ctx.stroke(); ctx.beginPath(); ctx.moveTo(-4, -100); ctx.lineTo(-40, -86); ctx.lineTo(-36, -74); ctx.lineTo(-2, -88); ctx.closePath(); fs(ctx, '#9aa0aa', 3.5); ctx.restore(); },
  pot: (ctx) => { ctx.beginPath(); ctx.ellipse(24, -20, 30, 26, 0, 0, 7); fs(ctx, '#b8683a', 4); ctx.beginPath(); ctx.ellipse(24, -44, 14, 5, 0, 0, 7); fs(ctx, '#8a4a2a', 3); },
};
function board(ctx, txt, col) { ctx.save(); ctx.rotate(0.08); ctx.strokeStyle = INK; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(0, 30); ctx.lineTo(0, -120); ctx.stroke(); ctx.strokeStyle = '#b8862a'; ctx.lineWidth = 4; ctx.stroke();
  ctx.beginPath(); ctx.rect(-95, -205, 190, 90); fs(ctx, '#fbfaf6', 5); ctx.fillStyle = col; ctx.font = "800 30px 'Noto Malayalam'"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, 0, -158); ctx.restore(); }
export function registerCast(B) {
  EMS.registerCast(B); COL.registerCast(B); PAD.registerCast(B); const C = B.CAST;
  Object.assign(NEW_CAST, {
    raja: { ...C.maharaja, name: 'MAHARAJA (1886)', bare: false, shirt: '#7a1a2a', shirtDark: '#5a1020', over: courtCoat, stache: true },
    penny: { ...C.brit, name: 'PENNYCUICK', shirt: '#c8b48a', shirtDark: '#a8946a', coat: false, collar: true, over: khakiPockets, legs: '#a8946a', mundu: '#c8b48a' },
    officer: { ...C.brit, name: 'BRITISH OFFICER' },
    mfarmer: { ...C.farmer, name: 'MADURAI FARMER' },
    kofficial: { ...C.neighbour, name: 'KERALA OFFICIAL', shirt: '#f6f4ee', shirtDark: '#d8d4c8', glasses: true, over: govtBadge('#2a4a9a') },
    tofficial: { ...C.neighbour2, name: 'TAMIL NADU OFFICIAL', shirt: '#f6f4ee', shirtDark: '#d8d4c8', mundu: '#f6f1e4', kasavu: '#1a1a1a', over: govtBadge('#c8312c') },
  });
  Object.assign(C, NEW_CAST); Object.assign(B.PROPS, NEW_PROPS);
}
