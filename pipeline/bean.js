// Bean-head cartoon characters drawn on a 2D canvas (our own implementation).
// Look: round head slightly wider than tall, thick dark-brown brush outline,
// pear body with painted-on clothes, thin dark limbs, small dark hands/shoes,
// tall oval eyes, thick high brows that always show.
// Units: head width = 104 at scale 1. Origin = between the feet, y up is negative.

const INK = '#2a1c17';
const OL = 6.5; // outline width

function ell(ctx, x, y, rx, ry, rot = 0) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); }
function fs(ctx, fill, w = OL) { if (fill) { ctx.fillStyle = fill; ctx.fill(); } ctx.lineWidth = w; ctx.strokeStyle = INK; ctx.stroke(); }
const lerp = (a, b, t) => a + (b - a) * t;

// arm poses: [shoulder angle, elbow bend] in degrees; 0 = straight down, + = outward
export const ARMS = {
  hang: [8, 6], hip: [38, -95], wave: [120, -40], up: [165, 5], point: [95, 2],
  hold: [25, 95], holdUp: [70, 80], chin: [20, 150], mouth: [15, 160], cross: [20, 120],
  thumb: [40, 120], shrug: [60, -70], fist: [130, 70], out: [70, 10], clap: [28, 128], rifle: [30, 150], scope: [100, 120], march: [12, 20],
};

function armPose(p) {
  if (typeof p === 'string') return ARMS[p] || ARMS.hang;
  if (Array.isArray(p)) return p;
  const a = armPose(p.a), b = armPose(p.b), t = p.t ?? 0.5;
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
}

function drawArm(ctx, side, pose, sleeve, skin, L1 = 50, L2 = 48, prop) {
  const [sa, eb] = armPose(pose);
  const sx = side * 36, sy = -230;
  const a1 = (sa * Math.PI) / 180, a2 = ((sa + eb) * Math.PI) / 180;
  const ex = sx + side * Math.sin(a1) * L1, ey = sy + Math.cos(a1) * L1;
  const hx = ex + side * Math.sin(a2) * L2, hy = ey + Math.cos(a2) * L2;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  // outline pass then colour pass gives a brushy inked limb
  ctx.strokeStyle = INK; ctx.lineWidth = 11;
  ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.lineTo(hx, hy); ctx.stroke();
  ctx.strokeStyle = sleeve; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
  ctx.strokeStyle = skin; ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(hx, hy); ctx.stroke();
  if (prop) { ctx.save(); ctx.translate(hx, hy); ctx.scale(side, 1); prop(ctx); ctx.restore(); }
  ell(ctx, hx, hy, 7.5, 7.5); ctx.fillStyle = INK; ctx.fill();
  return [hx, hy];
}

// ---------- faces ----------
function eyes(ctx, kind, look, lookY, blink) {
  const ex = 21, ey = -302, lx = look * 4.5, ly = (lookY || 0) * 3;
  ctx.fillStyle = INK; ctx.strokeStyle = INK; ctx.lineCap = 'round';
  if (blink > 0.6 || kind === 'dash') {
    ctx.lineWidth = 6;
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * ex - 8, ey + 2); ctx.lineTo(s * ex + 8, ey + 2); ctx.stroke(); }
    return;
  }
  if (kind === 'ring') {
    for (const s of [-1, 1]) { ell(ctx, s * ex, ey, 12, 13); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 4.5; ctx.stroke();
      ell(ctx, s * ex + lx, ey + ly, 3.6, 3.6); ctx.fillStyle = INK; ctx.fill(); }
    return;
  }
  if (kind === 'x') {
    ctx.lineWidth = 5.5;
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * ex - 8 * s, ey - 7); ctx.lineTo(s * ex + 6 * s, ey); ctx.lineTo(s * ex - 8 * s, ey + 7); ctx.stroke(); }
    return;
  }
  if (kind === 'happy') {
    ctx.lineWidth = 5.5;
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(s * ex, ey + 4, 9, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); }
    return;
  }
  const h = kind === 'half' ? 0.55 : 1;
  for (const s of [-1, 1]) {
    ctx.save(); ell(ctx, s * ex + lx, ey + ly, 7.8, 12.5 * Math.max(0.12, 1 - blink)); ctx.fillStyle = INK; ctx.fill();
    if (h < 1) { ctx.fillStyle = ctx._skin; ctx.fillRect(s * ex - 12, ey - 13, 24, 11); ctx.lineWidth = 4.5; ctx.beginPath(); ctx.moveTo(s * ex - 10, ey - 2); ctx.lineTo(s * ex + 10, ey - 2); ctx.stroke(); }
    ctx.restore();
  }
}
function brows(ctx, kind, lift = 0) {
  const by = -322 - lift * 6;
  ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.lineCap = 'round';
  const seg = (x1, y1, x2, y2, bend) => { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.quadraticCurveTo((x1 + x2) / 2, (y1 + y2) / 2 - bend, x2, y2); ctx.stroke(); };
  for (const s of [-1, 1]) {
    const o = s * 19;
    if (kind === 'angry') seg(s * 31, by - 8, s * 7, by + 6, -2);
    else if (kind === 'worried') seg(s * 30, by + 4, s * 8, by - 7, 3);
    else if (kind === 'raised') seg(s * 30, by - (s > 0 ? 10 : 0), s * 8, by - (s > 0 ? 12 : 0), 5);
    else if (kind === 'flat') seg(s * 30, by, s * 8, by, 0);
    else seg(s * 31, by + 2, s * 7, by - 1, 6);
  }
}
function mouth(ctx, kind, talk = 0, my = -270) {
  ctx.strokeStyle = INK; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const open = talk > 0.05 && !['grin', 'beam', 'laugh', 'shout', 'o'].includes(kind);
  if (open) { ell(ctx, 0, my, 8 + talk * 3, 3 + talk * 8); ctx.fillStyle = '#5a1f1a'; ctx.fill(); ctx.lineWidth = 4; ctx.stroke(); return; }
  switch (kind) {
    case 'grin': case 'beam': case 'laugh': case 'shout': {
      const w = kind === 'beam' ? 24 : kind === 'shout' ? 16 : 21, d = kind === 'laugh' ? 22 : kind === 'shout' ? 24 : 16;
      ctx.beginPath(); ctx.moveTo(-w, my - 5);
      if (kind === 'shout') ctx.ellipse(0, my + 4, w, d * 0.6, 0, Math.PI, Math.PI * 3);
      else { ctx.lineTo(w, my - 5); ctx.quadraticCurveTo(w, my + d, 0, my + d); ctx.quadraticCurveTo(-w, my + d, -w, my - 5); }
      ctx.closePath(); ctx.fillStyle = '#4a1a16'; ctx.fill();
      ctx.save(); ctx.clip(); ctx.fillStyle = '#fff'; ctx.fillRect(-w, my - 6, w * 2, 7);
      ell(ctx, 0, my + d, w * 0.6, d * 0.4); ctx.fillStyle = '#d0605a'; ctx.fill(); ctx.restore();
      ctx.lineWidth = 4.5; ctx.beginPath(); ctx.moveTo(-w, my - 5); if (kind === 'shout') ctx.ellipse(0, my + 4, w, d * 0.6, 0, Math.PI, Math.PI * 3); else { ctx.lineTo(w, my - 5); ctx.quadraticCurveTo(w, my + d, 0, my + d); ctx.quadraticCurveTo(-w, my + d, -w, my - 5); } ctx.stroke();
      break; }
    case 'o': ell(ctx, 0, my + 3, 7, 9); ctx.fillStyle = '#4a1a16'; ctx.fill(); ctx.lineWidth = 4; ctx.stroke(); break;
    case 'smile': ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, my - 12, 15, Math.PI * 0.2, Math.PI * 0.8); ctx.stroke(); break;
    case 'smirk': ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-12, my); ctx.quadraticCurveTo(4, my + 4, 15, my - 7); ctx.stroke(); break;
    case 'frown': ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, my + 14, 16, Math.PI * 1.2, Math.PI * 1.8); ctx.stroke(); break;
    case 'wavy': ctx.lineWidth = 4.5; ctx.beginPath(); ctx.moveTo(-14, my); for (let i = 1; i <= 4; i++) ctx.quadraticCurveTo(-14 + i * 7 - 3.5, my + (i % 2 ? -5 : 5), -14 + i * 7, my); ctx.stroke(); break;
    default: ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-9, my); ctx.lineTo(9, my); ctx.stroke();
  }
}

export const FACES = {
  neutral: { eyes: 'oval', brows: 'arch', mouth: 'flat' },
  smile: { eyes: 'oval', brows: 'arch', mouth: 'smile' },
  grin: { eyes: 'oval', brows: 'arch', mouth: 'grin' },
  beam: { eyes: 'happy', brows: 'arch', mouth: 'beam', lift: 1 },
  laugh: { eyes: 'x', brows: 'arch', mouth: 'laugh', lift: 1 },
  smug: { eyes: 'half', brows: 'flat', mouth: 'smirk' },
  sly: { eyes: 'half', brows: 'angry', mouth: 'smirk' },
  stern: { eyes: 'oval', brows: 'angry', mouth: 'frown' },
  angry: { eyes: 'half', brows: 'angry', mouth: 'shout' },
  shock: { eyes: 'ring', brows: 'arch', mouth: 'o', lift: 1.4 },
  nervous: { eyes: 'oval', brows: 'worried', mouth: 'wavy', sweat: true },
  sad: { eyes: 'oval', brows: 'worried', mouth: 'frown' },
  think: { eyes: 'oval', brows: 'raised', mouth: 'smirk', lookY: -1 },
  bored: { eyes: 'dash', brows: 'flat', mouth: 'flat' },
  proud: { eyes: 'happy', brows: 'arch', mouth: 'smile', lift: 0.6 },
};

// ---------- outfits / cast ----------
// Each character spec: skin, hair(fn), shirt, lower (mundu/pants/sari), extras.
function hairShort(color, part = 1) {
  return (ctx) => {
    ctx.beginPath(); ctx.moveTo(-53, -300); ctx.bezierCurveTo(-58, -360, 58, -362, 53, -300);
    ctx.quadraticCurveTo(46, -326, 20 * part, -330); ctx.quadraticCurveTo(-10 * part, -318, -30, -326); ctx.quadraticCurveTo(-46, -320, -53, -300);
    ctx.closePath(); fs(ctx, color);
  };
}
function hairBun(color) {
  return (ctx) => {
    ell(ctx, 0, -356, 22, 17); fs(ctx, color);
    ctx.beginPath(); ctx.moveTo(-53, -298); ctx.bezierCurveTo(-58, -362, 58, -362, 53, -298);
    ctx.quadraticCurveTo(40, -330, 0, -334); ctx.quadraticCurveTo(-40, -330, -53, -298); ctx.closePath(); fs(ctx, color);
    ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(-20, -344); ctx.quadraticCurveTo(0, -350, 22, -342); ctx.stroke();
  };
}
function towelHead(color) { // thorthu tied on head (fisherman)
  return (ctx) => {
    ctx.beginPath(); ctx.moveTo(-55, -318); ctx.bezierCurveTo(-56, -365, 56, -365, 55, -318); ctx.quadraticCurveTo(0, -330, -55, -318); ctx.closePath(); fs(ctx, color);
    ctx.strokeStyle = '#c33'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-50, -330); ctx.quadraticCurveTo(0, -342, 50, -330); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(48, -332); ctx.lineTo(70, -342); ctx.lineTo(66, -322); ctx.closePath(); fs(ctx, color, 5);
  };
}
function turban(color, band) { // formal talappa of the 1940s court
  return (ctx) => {
    ctx.beginPath(); ctx.moveTo(-56, -318); ctx.bezierCurveTo(-62, -380, 62, -380, 56, -318); ctx.quadraticCurveTo(0, -330, -56, -318); ctx.closePath(); fs(ctx, color);
    ctx.save(); ctx.clip(); ctx.strokeStyle = 'rgba(42,28,23,.35)'; ctx.lineWidth = 3;
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-60, -336 - i * 10); ctx.quadraticCurveTo(0, -356 - i * 12, 60, -328 - i * 10); ctx.stroke(); } ctx.restore();
    ctx.strokeStyle = band; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-54, -322); ctx.quadraticCurveTo(0, -334, 54, -322); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(30, -350); ctx.quadraticCurveTo(52, -372, 46, -340); fs(ctx, color, 4.5);
    // grey sideburns
    ctx.fillStyle = '#c9c3bb'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * 51, -306, 6, 12, 0, 0, 7); ctx.fill(); }
  };
}
function capHat(color, band) { return (ctx) => { ctx.beginPath(); ctx.moveTo(-54, -318); ctx.bezierCurveTo(-58, -386, 58, -386, 54, -318); ctx.closePath(); fs(ctx, color); ctx.fillStyle = band; ctx.fillRect(-54, -330, 108, 12); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.strokeRect(-54, -330, 108, 12); ell(ctx, 0, -352, 9, 9); fs(ctx, '#f0c23a', 3.5); }; }
function pith(color) { return (ctx) => { ctx.beginPath(); ctx.ellipse(0, -322, 78, 14, 0, 0, 7); fs(ctx, color); ctx.beginPath(); ctx.moveTo(-50, -322); ctx.bezierCurveTo(-52, -392, 52, -392, 50, -322); ctx.closePath(); fs(ctx, color); ctx.fillStyle = '#7a6a4a'; ctx.fillRect(-50, -336, 100, 8); }; }
function fedora(color, band) { return (ctx) => { ctx.beginPath(); ctx.ellipse(0, -324, 80, 13, 0, 0, 7); fs(ctx, color); ctx.beginPath(); ctx.moveTo(-46, -324); ctx.lineTo(-40, -378); ctx.quadraticCurveTo(0, -362, 40, -378); ctx.lineTo(46, -324); ctx.closePath(); fs(ctx, color); ctx.fillStyle = band; ctx.fillRect(-46, -340, 92, 10); }; }
function hood(color) { return (ctx) => { ctx.beginPath(); ctx.moveTo(-62, -250); ctx.bezierCurveTo(-74, -400, 74, -400, 62, -250); ctx.quadraticCurveTo(40, -296, 0, -298); ctx.quadraticCurveTo(-40, -296, -62, -250); ctx.closePath(); fs(ctx, color); }; }
function moustache(ctx, c = INK) { ctx.beginPath(); ctx.moveTo(-22, -279); ctx.quadraticCurveTo(-10, -293, 0, -284); ctx.quadraticCurveTo(10, -293, 22, -279); ctx.quadraticCurveTo(10, -281, 0, -277); ctx.quadraticCurveTo(-10, -281, -22, -279); ctx.closePath(); ctx.fillStyle = c; ctx.fill(); ctx.strokeStyle = c; ctx.lineWidth = 3; ctx.stroke(); }
function glasses(ctx) { ctx.strokeStyle = INK; ctx.lineWidth = 3.5; for (const s of [-1, 1]) { ell(ctx, s * 19, -300, 13, 12); ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fill(); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(-6, -302); ctx.lineTo(6, -302); ctx.stroke(); }

export const CAST = {
  kannan: { name: 'KANNAN', skin: '#c68b62', hair: hairShort('#1f1712', 1), stache: true,
    shirt: '#1f9e95', shirtDark: '#147a73', collar: true, pocket: true, lower: 'mundu', mundu: '#f4efe4', kasavu: '#d9a521', legs: '#6b4632', shoes: '#4a3022' },
  ammini: { name: 'AMMINI', skin: '#b67a52', hair: hairBun('#bdb6ad'), glasses: true, wrinkles: true,
    shirt: '#c8312c', shirtDark: '#9b211e', lower: 'mundu', mundu: '#f6f0e2', kasavu: '#d9a521', neriyathu: true, legs: '#6b4632', shoes: '#7a4a2a' },
  fisher: { name: 'VAREED', skin: '#9c6640', hair: towelHead('#efe6d0'), stache: true, bare: true,
    shirt: '#9c6640', shirtDark: '#7d4f30', lower: 'lungi', mundu: '#2f5fae', kasavu: '#f2c94c', legs: '#7d4f30', shoes: '#3a2a20' },
  chaya: { name: 'CHAYA KUTTAN', skin: '#b07a50', hair: hairShort('#2a2018', -1), stache: true,
    shirt: '#f1ead8', shirtDark: '#cfc4a8', banian: true, lower: 'mundu', mundu: '#e9dcc0', kasavu: '#8c6b3a', legs: '#6b4632', shoes: '#3a2a20' },
  meenu: { name: 'MEENU', skin: '#c48a60', hair: hairBun('#1c1410'), jasmine: true, child: true,
    shirt: '#f0a03a', shirtDark: '#c57d22', lower: 'pavada', mundu: '#7b3fa6', kasavu: '#e7b93a', legs: '#6b4632', shoes: '#c33' },
  postman: { name: 'POSTMAN', skin: '#b98257', hair: hairShort('#2a2018', 1), stache: true, cap: '#6d5a3a',
    shirt: '#b49a6a', shirtDark: '#8e784e', collar: true, pocket: true, lower: 'pants', mundu: '#8e784e', legs: '#8e784e', shoes: '#2a1c17' },
  dewan: { name: 'DEWAN C.P.', skin: '#c99068', hair: turban('#f5f1e6', '#d9a521'), glasses: true, coat: true,
    shirt: '#23262f', shirtDark: '#14161c', collar: false, lower: 'mundu', mundu: '#f6f1e4', kasavu: '#d9a521', legs: '#6b4632', shoes: '#1a1310' },
  clerk: { name: 'CLERK', skin: '#b98257', hair: hairShort('#2a2018', -1), glasses: true, shirt: '#f2ecdc', shirtDark: '#d6ccb2', collar: true, pocket: true, lower: 'mundu', mundu: '#f6f1e4', kasavu: '#8c6b3a', legs: '#6b4632', shoes: '#3a2a20' },
  soldier: { name: 'NAIR BRIGADE', skin: '#a87048', hair: capHat('#c8312c', '#f0c23a'), stache: true, shirt: '#8f7a4a', shirtDark: '#6e5c34', collar: true, pocket: true, belt: true, lower: 'pants', mundu: '#8f7a4a', legs: '#6e5c34', shoes: '#2a1c17' },
  musician: { name: 'VEENA', skin: '#c08a5e', hair: hairBun('#1c1410'), jasmine: true, shirt: '#2f6a3a', shirtDark: '#1f4f2a', lower: 'mundu', mundu: '#d9a521', kasavu: '#8a2a1e', legs: '#6b4632', shoes: '#6b4632' },
  drummer: { name: 'MRIDANGAM', skin: '#a87048', hair: hairShort('#1a120d', 1), bare: true, shirt: '#a87048', shirtDark: '#86562f', lower: 'mundu', mundu: '#f4efe4', kasavu: '#d9a521', legs: '#86562f', shoes: '#6b4632' },
  shadow: { name: 'ATTACKER', silhouette: true, skin: '#1e1a2e', hair: hood('#1e1a2e'), shirt: '#1e1a2e', shirtDark: '#14111f', lower: 'pants', mundu: '#1e1a2e', legs: '#1e1a2e', shoes: '#0e0c16' },
  brit: { name: 'DIPLOMAT 1', skin: '#f1c9a8', hair: pith('#efe6cc'), stache: true, shirt: '#e8e2d0', shirtDark: '#c8c0aa', collar: true, coat: true, lower: 'pants', mundu: '#e8e2d0', legs: '#c8c0aa', shoes: '#4a3022' },
  yank: { name: 'DIPLOMAT 2', skin: '#efc4a0', hair: fedora('#4a4a52', '#2a2a30'), shirt: '#3a4a6a', shirtDark: '#2a3650', collar: true, pocket: true, lower: 'pants', mundu: '#3a4a6a', legs: '#2a3650', shoes: '#2a1c17' },
  official: { name: 'OFFICIAL (silhouette)', silhouette: true, skin: '#2b2440', shirt: '#2b2440', lower: 'pants', mundu: '#2b2440', legs: '#2b2440', shoes: '#1a1528', hair: (ctx) => { ctx.beginPath(); ctx.moveTo(-50,-330); ctx.lineTo(-40,-372); ctx.quadraticCurveTo(0,-385,40,-372); ctx.lineTo(50,-330); ctx.closePath(); fs(ctx,'#2b2440'); } },
};

function lowerBody(ctx, c, walk) {
  const sw = Math.sin(walk * Math.PI * 2) * 4;
  if (c.lower === 'mundu' || c.lower === 'lungi' || c.lower === 'pavada') {
    const hem = c.lower === 'pavada' ? -40 : -38;
    ctx.beginPath(); ctx.moveTo(-40, -150); ctx.lineTo(40, -150); ctx.lineTo(47 + sw, hem); ctx.quadraticCurveTo(0, hem + 6, -47 + sw, hem); ctx.closePath(); fs(ctx, c.mundu);
    // kasavu border at hem + vertical fold edge
    ctx.save(); ctx.clip();
    ctx.fillStyle = c.kasavu; ctx.fillRect(-60, hem - 9, 120, 7);
    if (c.lower === 'lungi') { ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 3; for (let y = -140; y < hem; y += 14) { ctx.beginPath(); ctx.moveTo(-60, y); ctx.lineTo(60, y); ctx.stroke(); } for (let x = -40; x < 50; x += 14) { ctx.beginPath(); ctx.moveTo(x, -150); ctx.lineTo(x + 4, hem); ctx.stroke(); } }
    ctx.restore();
    ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(12, -148); ctx.lineTo(18 + sw, hem + 2); ctx.stroke();
  } else {
    // pants: two legs of fabric
    ctx.lineCap = 'round';
    for (const s of [-1, 1]) { ctx.strokeStyle = INK; ctx.lineWidth = 26; ctx.beginPath(); ctx.moveTo(s * 18, -150); ctx.lineTo(s * 16 + s * sw, -14); ctx.stroke(); ctx.strokeStyle = c.mundu; ctx.lineWidth = 15; ctx.stroke(); }
  }
}

function torso(ctx, c) {
  const top = -255, bot = c.lower === 'pants' ? -140 : -138;
  ctx.beginPath(); ctx.moveTo(-30, top); ctx.bezierCurveTo(-48, top + 18, -56, bot - 40, -46, bot); ctx.lineTo(46, bot); ctx.bezierCurveTo(56, bot - 40, 48, top + 18, 30, top); ctx.quadraticCurveTo(0, top - 8, -30, top); ctx.closePath();
  fs(ctx, c.shirt);
  ctx.save(); ctx.clip();
  // soft fixed shade on one side (unlit look)
  ctx.fillStyle = c.shirtDark || 'rgba(0,0,0,.18)'; ctx.globalAlpha = 0.55; ctx.beginPath(); ctx.ellipse(40, bot - 40, 26, 80, 0.1, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
  if (c.banian) { ctx.strokeStyle = 'rgba(0,0,0,.15)'; ctx.lineWidth = 2; for (let x = -40; x < 45; x += 9) { ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, bot); ctx.stroke(); } }
  if (c.collar) { ctx.fillStyle = c.shirtDark; ctx.beginPath(); ctx.moveTo(-22, top - 2); ctx.lineTo(0, top + 22); ctx.lineTo(22, top - 2); ctx.lineTo(10, top + 8); ctx.lineTo(0, top + 4); ctx.lineTo(-10, top + 8); ctx.closePath(); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, top + 22); ctx.lineTo(0, bot); ctx.stroke(); for (let y = top + 34; y < bot - 6; y += 22) { ell(ctx, -6, y, 2.6, 2.6); ctx.fillStyle = INK; ctx.fill(); } }
  if (c.coat) { ctx.fillStyle = '#14161c'; ctx.fillRect(-18, top - 4, 36, 10); ctx.strokeStyle = '#e0b43a'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(0, top + 6); ctx.lineTo(0, bot); ctx.stroke();
    for (let y = top + 18; y < bot - 6; y += 18) { ell(ctx, 0, y, 3.4, 3.4); ctx.fillStyle = '#f0c23a'; ctx.fill(); }
    ctx.strokeStyle = '#f0c23a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(2, top + 62); ctx.quadraticCurveTo(18, top + 78, 30, top + 60); ctx.stroke(); ell(ctx, 31, top + 58, 4, 4); ctx.fillStyle = '#f0c23a'; ctx.fill(); }
  if (c.belt) { ctx.fillStyle = '#4a3020'; ctx.fillRect(-56, bot - 18, 112, 12); ctx.fillStyle = '#f0c23a'; ctx.fillRect(-7, bot - 19, 14, 14); }
  if (c.pocket) { ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.strokeRect(-34, top + 34, 18, 16); ctx.fillStyle = '#f1f1f1'; ctx.fillRect(-30, top + 28, 4, 9); }
  if (c.bare) { ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(-14, top + 40, 10, 0.3, 2.6); ctx.arc(14, top + 40, 10, 0.5, 2.8); ctx.stroke(); }
  ctx.restore();
  ctx.beginPath(); ctx.moveTo(-30, top); ctx.bezierCurveTo(-48, top + 18, -56, bot - 40, -46, bot); ctx.lineTo(46, bot); ctx.bezierCurveTo(56, bot - 40, 48, top + 18, 30, top); ctx.quadraticCurveTo(0, top - 8, -30, top); ctx.closePath(); ctx.lineWidth = OL; ctx.strokeStyle = INK; ctx.stroke();
  if (c.neriyathu) { // shawl over the left shoulder with gold border
    ctx.beginPath(); ctx.moveTo(-28, top - 2); ctx.lineTo(-6, top - 4); ctx.lineTo(42, bot + 2); ctx.lineTo(20, bot + 2); ctx.closePath(); fs(ctx, c.mundu, 4.5);
    ctx.strokeStyle = c.kasavu; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-6, top - 1); ctx.lineTo(40, bot - 2); ctx.stroke();
  }
}

// main draw. o: {expr, L, R, look, lookY, blink, talk, walk, tilt, squash, propL, propR, scale}
export function drawBean(ctx, who, o = {}) {
  const c = typeof who === 'string' ? CAST[who] : who;
  const f = FACES[o.expr || 'neutral'] || FACES.neutral;
  ctx.save();
  const s = (o.scale || 1) * (c.child ? 0.78 : 1);
  ctx.scale(s * (1 + (o.squash || 0) * 0.5), s * (1 - (o.squash || 0)));
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const walk = o.walk || 0, step = Math.sin(walk * Math.PI * 2);
  // legs + shoes
  for (const side of [-1, 1]) {
    const lift = Math.max(0, step * side) * 10, fx = side * 17 + step * side * 6;
    ctx.strokeStyle = INK; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(side * 16, -60); ctx.lineTo(fx, -8 - lift); ctx.stroke();
    ctx.strokeStyle = c.legs; ctx.lineWidth = 4.5; ctx.stroke();
    ell(ctx, fx + side * 5, -5 - lift, 13, 6.5); ctx.fillStyle = c.shoes; ctx.fill(); ctx.lineWidth = 3.5; ctx.strokeStyle = INK; ctx.stroke();
  }
  lowerBody(ctx, c, walk);
  // far arm behind torso when holding across
  const handL = drawArm(ctx, -1, o.L || 'hang', c.shirt, c.skin, 50, 48, o.propL);
  torso(ctx, c);
  const handR = drawArm(ctx, 1, o.R || 'hang', c.shirt, c.skin, 50, 48, o.propR);
  // head
  ctx.save();
  ctx.translate(0, -265); ctx.rotate(((o.tilt || 0) * Math.PI) / 180); ctx.translate(0, 265);
  ctx.translate(0, -312); ctx.scale(1.18, 1.18); ctx.translate(0, 300);
  ell(ctx, 0, -300, 54, 49); fs(ctx, c.skin, OL + 0.5);
  // fixed soft cheek shade + bottom-heavy brush outline
  ctx.save(); ell(ctx, 0, -300, 54, 49); ctx.clip(); ctx.fillStyle = 'rgba(80,30,10,.10)'; ell(ctx, 14, -282, 48, 34); ctx.fill(); ctx.restore();
  ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(0, -300, 54, 49, 0, 0.25, Math.PI - 0.25); ctx.stroke();
  if (!c.silhouette) {
    ctx._skin = c.skin;
    if (c.wrinkles) { ctx.strokeStyle = 'rgba(42,28,23,.45)'; ctx.lineWidth = 2.5; for (const s2 of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s2 * 36, -296); ctx.lineTo(s2 * 42, -300); ctx.stroke(); } }
    eyes(ctx, f.eyes, o.look || 0, o.lookY ?? f.lookY, o.blink || 0);
    if (c.glasses) glasses(ctx);
    brows(ctx, f.brows, f.lift || 0);
    if (c.stache) moustache(ctx);
    mouth(ctx, f.mouth, o.talk || 0, c.stache ? -263 : -270);
    if (f.sweat) { ctx.beginPath(); ctx.moveTo(48, -340); ctx.quadraticCurveTo(58, -322, 50, -316); ctx.quadraticCurveTo(40, -322, 48, -340); fs(ctx, '#9fd8ff', 3); }
    ctx.fillStyle = 'rgba(230,110,90,.28)'; for (const s2 of [-1, 1]) { ell(ctx, s2 * 33, -282, 9, 5); ctx.fill(); }
  }
  if (o.noHat && c.coat && c.glasses) { ctx.fillStyle = '#c9c3bb'; for (const s2 of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s2 * 47, -312, 10, 22, s2 * 0.2, 0, 7); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke(); } ctx.strokeStyle = 'rgba(42,28,23,.3)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, -300, 40, 3.6, 5.8); ctx.stroke(); }
  else if (c.hair) c.hair(ctx);
  if (o.bandage) { ctx.save(); ctx.translate(-34, -272); ctx.rotate(-0.45); ctx.fillStyle = '#fbf6ec'; ctx.fillRect(-22, -9, 44, 18); ctx.strokeStyle = INK; ctx.lineWidth = 3.5; ctx.strokeRect(-22, -9, 44, 18); ctx.strokeStyle = 'rgba(42,28,23,.4)'; ctx.lineWidth = 2; for (const x of [-8, 8]) { ctx.beginPath(); ctx.moveTo(x, -9); ctx.lineTo(x, 9); ctx.stroke(); } ctx.restore(); }
  if (c.cap) { ctx.beginPath(); ctx.moveTo(-50, -322); ctx.bezierCurveTo(-50, -370, 50, -370, 50, -322); ctx.closePath(); fs(ctx, c.cap); ctx.beginPath(); ctx.moveTo(-54, -322); ctx.lineTo(62, -322); ctx.lineTo(56, -312); ctx.lineTo(-54, -314); ctx.closePath(); fs(ctx, '#4a3a22', 4.5); }
  if (c.jasmine) { for (let i = 0; i < 6; i++) { ell(ctx, 22 + i * 1.5, -362 + i * 2, 5, 5); fs(ctx, '#fff', 2.5); } }
  ctx.restore();
  ctx.restore();
  return { handL, handR };
}

// small props held in hands (drawn in hand space, x outward)
export const PROPS = {
  stamp: (ctx) => { ctx.save(); ctx.rotate(-0.1); ctx.beginPath(); ctx.ellipse(0, -46, 12, 12, 0, 0, 7); fs(ctx, '#7a4a2a', 4); ctx.beginPath(); ctx.rect(-6, -36, 12, 30); fs(ctx, '#7a4a2a', 4); ctx.beginPath(); ctx.rect(-30, -8, 60, 18); fs(ctx, '#3a2a20', 4); ctx.fillStyle = '#c8312c'; ctx.fillRect(-28, 8, 56, 5); ctx.restore(); },
  scope: (ctx) => { ctx.save(); ctx.rotate(-1.35); ctx.beginPath(); ctx.rect(-8, -70, 16, 80); fs(ctx, '#b8862a', 4); ctx.beginPath(); ctx.rect(-11, -92, 22, 26); fs(ctx, '#d8a63a', 4); ctx.restore(); },
  rifle: (ctx) => { ctx.save(); ctx.rotate(0.15); ctx.strokeStyle = INK; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(0, 60); ctx.lineTo(0, -120); ctx.stroke(); ctx.strokeStyle = '#6a4a2a'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, 60); ctx.lineTo(0, -30); ctx.stroke(); ctx.strokeStyle = '#5a5a60'; ctx.beginPath(); ctx.moveTo(0, -30); ctx.lineTo(0, -118); ctx.stroke(); ctx.restore(); },
  veena: (ctx) => { ctx.save(); ctx.rotate(-0.9); ctx.beginPath(); ctx.ellipse(0, 40, 34, 30, 0, 0, 7); fs(ctx, '#8a4a22', 4); ctx.beginPath(); ctx.rect(-7, -110, 14, 130); fs(ctx, '#a8622e', 4); ctx.beginPath(); ctx.ellipse(0, -112, 16, 14, 0, 0, 7); fs(ctx, '#8a4a22', 4); ctx.strokeStyle = '#f0c23a'; ctx.lineWidth = 1.5; for (const x of [-3, 0, 3]) { ctx.beginPath(); ctx.moveTo(x, 30); ctx.lineTo(x, -100); ctx.stroke(); } ctx.restore(); },
  sand: (ctx) => { ctx.beginPath(); ctx.moveTo(-26, 2); ctx.quadraticCurveTo(0, -34, 26, 2); ctx.closePath(); fs(ctx, '#3a3430', 4); ctx.fillStyle = '#d9b04a'; for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.arc(-14 + (i % 5) * 7, -4 - Math.floor(i / 5) * 9, 2.5, 0, 7); ctx.fill(); } },
  paper: (ctx) => { ctx.save(); ctx.rotate(-0.2); ctx.beginPath(); ctx.rect(-4, -40, 34, 44); fs(ctx, '#f4ecd6', 4); ctx.strokeStyle = 'rgba(42,28,23,.5)'; ctx.lineWidth = 2; for (let y = -32; y < 0; y += 7) { ctx.beginPath(); ctx.moveTo(2, y); ctx.lineTo(24, y); ctx.stroke(); } ctx.restore(); },
  glass: (ctx) => { ctx.beginPath(); ctx.moveTo(-8, -30); ctx.lineTo(8, -30); ctx.lineTo(6, 2); ctx.lineTo(-6, 2); ctx.closePath(); fs(ctx, '#c58a4a', 4); ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillRect(-6, -28, 12, 6); },
  coin: (ctx) => { ell(ctx, 6, -6, 13, 13); fs(ctx, '#f0c23a', 4); ell(ctx, 6, -6, 7, 7); ctx.strokeStyle = '#b8861a'; ctx.lineWidth = 2.5; ctx.stroke(); },
  flag: (ctx) => { ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, 30); ctx.lineTo(0, -110); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, -108); ctx.lineTo(60, -98); ctx.lineTo(0, -70); ctx.closePath(); fs(ctx, '#c8312c', 4); ell(ctx, 18, -92, 7, 7); fs(ctx, '#f4efe4', 2.5); },
  fish: (ctx) => { ctx.beginPath(); ctx.ellipse(10, 6, 24, 9, 0.2, 0, 7); fs(ctx, '#8fb7c9', 4); ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(-24, -8); ctx.lineTo(-22, 10); ctx.closePath(); fs(ctx, '#8fb7c9', 3.5); },
};
