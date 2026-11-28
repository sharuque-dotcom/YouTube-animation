// Sabarimala cast in the bean style. Pilgrims in black mundu with the irumudi (the twin bundle) on the head; the
// inquiry officer is a generic 1950 police DIG in khaki (no likeness of K. Kesava Menon); the bronze-casters of
// Chengannur are generic craftsmen; the arsonist is only ever a faceless shadow. No deity is drawn.
import * as NAM from '/episodes/ml-nambi/cast.js';
const INK = '#2a1c17';
function fs(ctx, fill, w = 6.5) { if (fill) { ctx.fillStyle = fill; ctx.fill(); } ctx.lineWidth = w; ctx.strokeStyle = INK; ctx.stroke(); }
const both = (...fns) => (ctx) => fns.forEach((f) => f(ctx));
const hair = (color) => (ctx) => { ctx.beginPath(); ctx.moveTo(-54, -300); ctx.bezierCurveTo(-60, -366, 58, -372, 54, -300); ctx.quadraticCurveTo(44, -330, 10, -338); ctx.quadraticCurveTo(-30, -326, -54, -300); ctx.closePath(); fs(ctx, color); };
const beard = (ctx) => { ctx.beginPath(); ctx.moveTo(-50, -292); ctx.quadraticCurveTo(-48, -236, 0, -228); ctx.quadraticCurveTo(48, -236, 50, -292); ctx.quadraticCurveTo(30, -262, 0, -262); ctx.quadraticCurveTo(-30, -262, -50, -292); ctx.closePath(); fs(ctx, '#2a2420', 4); };
const irumudi = (ctx) => { // the twin bundle on the head: a white cloth sack tied in the middle, a red tie
  ctx.beginPath(); ctx.ellipse(-26, -372, 34, 22, -0.15, 0, 7); fs(ctx, '#f2ead6', 5); ctx.beginPath(); ctx.ellipse(28, -372, 32, 21, 0.15, 0, 7); fs(ctx, '#e8dcc0', 5);
  ctx.beginPath(); ctx.roundRect(-8, -392, 14, 40, 5); fs(ctx, '#c8312c', 4); ctx.strokeStyle = 'rgba(42,28,23,.35)'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(-50, -370); ctx.lineTo(-14, -372); ctx.moveTo(14, -372); ctx.lineTo(52, -368); ctx.stroke(); };
const rudraksha = (ctx, top) => { ctx.strokeStyle = '#6a3a1e'; ctx.lineWidth = 5; ctx.setLineDash([2, 8]); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-28, top); ctx.quadraticCurveTo(0, top + 50, 28, top); ctx.stroke(); ctx.setLineDash([]); };
const ash = (ctx) => { ctx.strokeStyle = '#f6f1e4'; ctx.lineWidth = 3; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(-22, -336 + k * 6); ctx.lineTo(22, -336 + k * 6); ctx.stroke(); } ctx.fillStyle = '#c8312c'; ctx.beginPath(); ctx.arc(0, -330, 4, 0, 7); ctx.fill(); };
export const NEW_CAST = {};
export const NEW_PROPS = {
  stick: (ctx) => { ctx.save(); ctx.rotate(0.1); ctx.strokeStyle = INK; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(0, 60); ctx.lineTo(0, -150); ctx.stroke(); ctx.strokeStyle = '#a8784a'; ctx.lineWidth = 5; ctx.stroke(); ctx.restore(); },
  report: (ctx) => { ctx.save(); ctx.rotate(-0.12); ctx.beginPath(); ctx.rect(-4, -84, 74, 86); fs(ctx, '#e8d8a8', 4); ctx.fillStyle = '#8a1e1e'; ctx.font = "700 15px 'Oswald'"; ctx.fillText('INQUIRY', 6, -60); ctx.fillText('REPORT', 8, -42); ctx.fillStyle = '#2a1c17'; ctx.fillText('1950', 14, -18); ctx.restore(); },
  tongs: (ctx) => { ctx.save(); ctx.rotate(0.5); ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(-6, 20); ctx.lineTo(-4, -120); ctx.moveTo(6, 20); ctx.lineTo(4, -120); ctx.stroke(); ctx.strokeStyle = '#6a6a72'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore(); },
  lamp: (ctx) => { ctx.beginPath(); ctx.ellipse(10, -14, 26, 9, 0, 0, 7); fs(ctx, '#d9a521', 4); ctx.beginPath(); ctx.moveTo(10, -50); ctx.quadraticCurveTo(24, -30, 10, -22); ctx.quadraticCurveTo(-4, -30, 10, -50); ctx.fillStyle = '#ffb030'; ctx.fill(); },
};
export function registerCast(B) {
  NAM.registerCast(B); const C = B.CAST;
  Object.assign(NEW_CAST, {
    swami: { name: 'PILGRIM', skin: '#a87048', hair: both(hair('#1a120d'), irumudi), stache: true, bare: true, shirt: '#a87048', shirtDark: '#86562f', over: (ctx, top) => rudraksha(ctx, top - 4), lower: 'mundu', mundu: '#1a1a1e', kasavu: '#3a3a40', legs: '#86562f', shoes: '#86562f' },
    swami2: { name: 'PILGRIM 2', skin: '#c08a5e', hair: both(hair('#2a2018'), beard, irumudi), shirt: '#1a1a1e', shirtDark: '#0e0e12', collar: false, lower: 'mundu', mundu: '#1a1a1e', kasavu: '#3a3a40', legs: '#9a6a44', shoes: '#9a6a44' },
    swami3: { name: 'PILGRIM 3', skin: '#9c6640', hair: both(hair('#c9c3bb'), ash, irumudi), stache: true, wrinkles: true, bare: true, shirt: '#9c6640', shirtDark: '#7a4a2a', over: (ctx, top) => rudraksha(ctx, top - 4), lower: 'mundu', mundu: '#2a2a6a', kasavu: '#1a1a3a', legs: '#7a4a2a', shoes: '#7a4a2a' },
    kanni: { name: 'KANNI SWAMI', skin: '#c48a60', hair: both(hair('#1c1410'), irumudi), child: true, shirt: '#1a1a1e', shirtDark: '#0e0e12', lower: 'mundu', mundu: '#1a1a1e', kasavu: '#3a3a40', legs: '#9a6a44', shoes: '#9a6a44' },
    dig: { ...C.police, name: 'DIG (1950)', glasses: true },
    caster: { name: 'BRONZE CASTER', skin: '#9c6640', hair: C.fisher.hair, stache: true, bare: true, shirt: '#9c6640', shirtDark: '#7a4a2a', lower: 'mundu', mundu: '#efe6d0', kasavu: '#8c6b3a', legs: '#7a4a2a', shoes: '#7a4a2a' },
  });
  Object.assign(C, NEW_CAST); Object.assign(B.PROPS, NEW_PROPS);
}
