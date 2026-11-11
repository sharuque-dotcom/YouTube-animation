// Cast: expressive cartoon characters (round head, outlined, big readable emotions).
// toon(g, x, y, s, t, opts): (x, y) = feet on the ground (or seat height when seated).
// expr: 'neutral' | 'happy' | 'worried' | 'shock' | 'smug' | 'sad' | 'talk' | 'laugh'
// Arms: armL / armR angles (radians from straight down, + swings outward to the character's side).
import { clamp, lerp, rand } from './engine.js';

const OUT = '#231a33';
export function toon(g, x, y, s, t, o = {}) {
  const {
    expr = 'neutral', skin = '#f2c9a5', hair = '#3b2a1a', hairStyle = 'short', outfit = '#5b6ea8', shirt = '#ffffff', tie = null,
    armL = 0.15, armR = -0.15, look = 0, seated = false, seed = 1, glasses = false, sweat = 0, blush = 0, talk = 0, prop = null, hat = null, legs = '#2b2440',
  } = o;
  const r = rand(seed);
  const ph = r() * 6;
  const bob = Math.sin(t * 2.2 + ph) * 2.5;
  const blink = ((t + r() * 4) % 3.8) < 0.11;
  g.save(); g.translate(x, y + bob); g.scale(s, s);
  g.lineJoin = 'round'; g.lineCap = 'round';
  const line = (w = 5) => { g.strokeStyle = OUT; g.lineWidth = w; };
  // legs
  if (!seated) {
    g.fillStyle = legs; line();
    [[-26, 0], [10, 0]].forEach(([lx]) => { g.beginPath(); g.roundRect(lx, -95, 22, 95, 9); g.fill(); g.stroke(); });
    g.fillStyle = '#1d1630'; [[-32], [6]].forEach(([fx]) => { g.beginPath(); g.ellipse(fx + 16, -4, 22, 10, 0, 0, Math.PI * 2); g.fill(); });
  }
  const by = seated ? 0 : -90; // waist
  // torso
  g.fillStyle = outfit; line();
  g.beginPath(); g.moveTo(-58, by); g.quadraticCurveTo(-64, by - 120, -30, by - 140); g.lineTo(30, by - 140); g.quadraticCurveTo(64, by - 120, 58, by); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = shirt; g.beginPath(); g.moveTo(-20, by - 140); g.lineTo(0, by - 100); g.lineTo(20, by - 140); g.closePath(); g.fill();
  if (tie) { g.fillStyle = tie; g.beginPath(); g.moveTo(-7, by - 128); g.lineTo(7, by - 128); g.lineTo(10, by - 80); g.lineTo(0, by - 70); g.lineTo(-10, by - 80); g.closePath(); g.fill(); }
  // arms (upper + fore as one rounded stroke, hand as a circle)
  const arm = (side, a) => {
    const sx = side * 50, sy = by - 125;
    const ex = sx + Math.sin(a) * side * 70, ey = sy + Math.cos(a) * 70;
    const hx = ex + Math.sin(a * 1.25) * side * 55, hy = ey + Math.cos(a * 1.25) * 55;
    g.strokeStyle = OUT; g.lineWidth = 26; g.beginPath(); g.moveTo(sx, sy); g.lineTo(ex, ey); g.lineTo(hx, hy); g.stroke();
    g.strokeStyle = outfit; g.lineWidth = 17; g.beginPath(); g.moveTo(sx, sy); g.lineTo(ex, ey); g.lineTo(hx, hy); g.stroke();
    g.fillStyle = skin; line(4); g.beginPath(); g.arc(hx, hy, 13, 0, Math.PI * 2); g.fill(); g.stroke();
    return [hx, hy];
  };
  const hl = arm(-1, armL), hr = arm(1, armR);
  if (prop === 'phone') { g.save(); g.translate(hr[0] - 6, hr[1] - 26); g.rotate(-0.2); g.fillStyle = '#1d1630'; g.beginPath(); g.roundRect(-11, -24, 22, 44, 5); g.fill(); g.restore(); }
  if (prop === 'cash') { g.save(); g.translate(hr[0], hr[1] - 8); g.rotate(-0.4); g.fillStyle = '#8fd19e'; line(3); g.beginPath(); g.rect(-30, -14, 60, 28); g.fill(); g.stroke(); g.restore(); }
  if (prop === 'club') { g.save(); g.strokeStyle = '#c9c3d9'; g.lineWidth = 6; g.beginPath(); g.moveTo(hr[0], hr[1]); g.lineTo(hr[0] + 60, hr[1] + 130); g.stroke(); g.fillStyle = '#c9c3d9'; g.fillRect(hr[0] + 50, hr[1] + 126, 30, 10); g.restore(); }
  // neck + head
  const hy = by - 150;
  g.fillStyle = skin; g.fillRect(-12, hy - 8, 24, 18);
  const HR = 62;
  // hair back layer
  g.fillStyle = hair;
  if (hairStyle === 'long') { g.beginPath(); g.ellipse(0, hy - 50, HR + 10, HR + 26, 0, 0, Math.PI * 2); g.fill(); g.fillRect(-HR - 10, hy - 50, HR * 2 + 20, 70); }
  // head
  g.fillStyle = skin; line(5); g.beginPath(); g.ellipse(0, hy - 58, HR, HR * 1.04, 0, 0, Math.PI * 2); g.fill(); g.stroke();
  // ears
  g.beginPath(); g.ellipse(-HR + 2, hy - 54, 10, 15, 0, 0, Math.PI * 2); g.fill(); g.stroke(); g.beginPath(); g.ellipse(HR - 2, hy - 54, 10, 15, 0, 0, Math.PI * 2); g.fill(); g.stroke();
  // hair front
  g.fillStyle = hair; line(4);
  if (hairStyle === 'short' || hairStyle === 'long') { g.beginPath(); g.moveTo(-HR, hy - 60); g.quadraticCurveTo(-HR + 4, hy - 128, 0, hy - 124); g.quadraticCurveTo(HR - 4, hy - 128, HR, hy - 60); g.quadraticCurveTo(HR * 0.4, hy - 96, -HR * 0.2, hy - 88); g.quadraticCurveTo(-HR * 0.7, hy - 84, -HR, hy - 60); g.closePath(); g.fill(); g.stroke(); }
  if (hairStyle === 'bald') { g.beginPath(); g.ellipse(-HR + 8, hy - 66, 10, 22, 0, 0, Math.PI * 2); g.fill(); g.beginPath(); g.ellipse(HR - 8, hy - 66, 10, 22, 0, 0, Math.PI * 2); g.fill(); }
  if (hairStyle === 'grey') { g.fillStyle = '#c9c6d2'; g.beginPath(); g.moveTo(-HR, hy - 56); g.quadraticCurveTo(-HR, hy - 130, 0, hy - 126); g.quadraticCurveTo(HR, hy - 130, HR, hy - 56); g.quadraticCurveTo(10, hy - 100, -HR, hy - 56); g.closePath(); g.fill(); g.stroke(); }
  if (hat === 'cap') { g.fillStyle = '#e2412e'; line(4); g.beginPath(); g.ellipse(0, hy - 104, HR * 0.95, 30, 0, Math.PI, Math.PI * 2); g.fill(); g.stroke(); g.beginPath(); g.ellipse(HR * 0.6, hy - 100, 40, 10, 0, 0, Math.PI * 2); g.fill(); g.stroke(); }
  // face
  const fx = look * 10, fy = hy - 56;
  const eyeY = fy - 8;
  const shock = expr === 'shock', worried = expr === 'worried' || expr === 'sad';
  // brows
  g.strokeStyle = OUT; g.lineWidth = 5;
  const bAng = { neutral: 0, happy: -0.15, worried: 0.35, shock: -0.1, smug: -0.25, sad: 0.4, talk: 0, laugh: -0.2 }[expr] || 0;
  const bLift = shock ? -10 : 0;
  [[-1], [1]].forEach(([sd]) => { g.save(); g.translate(fx + sd * 22, eyeY - 22 + bLift); g.rotate(sd * bAng); g.beginPath(); g.moveTo(-11, 0); g.lineTo(11, 0); g.stroke(); g.restore(); });
  if (expr === 'smug') { g.save(); g.translate(fx + 22, eyeY - 30); g.rotate(-0.3); g.beginPath(); g.moveTo(-11, 0); g.lineTo(11, 0); g.stroke(); g.restore(); }
  // eyes
  const er = shock ? 11 : 8;
  [[-1], [1]].forEach(([sd]) => {
    const ex = fx + sd * 22;
    if (blink || expr === 'laugh') { g.lineWidth = 4; g.beginPath(); if (expr === 'laugh' || expr === 'happy') g.arc(ex, eyeY + 3, 8, Math.PI * 1.1, Math.PI * 1.9); else { g.moveTo(ex - 8, eyeY); g.lineTo(ex + 8, eyeY); } g.stroke(); return; }
    g.fillStyle = '#fff'; g.beginPath(); g.ellipse(ex, eyeY, er, er * 1.15, 0, 0, Math.PI * 2); g.fill(); g.lineWidth = 3; g.stroke();
    g.fillStyle = OUT; g.beginPath(); g.arc(ex + look * 3, eyeY + 1, shock ? 4 : 5, 0, Math.PI * 2); g.fill();
    if (expr === 'smug') { g.fillStyle = skin; g.fillRect(ex - er - 2, eyeY - er * 1.2, er * 2 + 4, er * 0.9); g.strokeStyle = OUT; g.lineWidth = 3; g.beginPath(); g.moveTo(ex - er, eyeY - er * 0.3); g.lineTo(ex + er, eyeY - er * 0.3); g.stroke(); }
  });
  if (glasses) { g.strokeStyle = OUT; g.lineWidth = 3.5; g.beginPath(); g.roundRect(fx - 37, eyeY - 13, 30, 26, 8); g.roundRect(fx + 7, eyeY - 13, 30, 26, 8); g.moveTo(fx - 7, eyeY - 2); g.lineTo(fx + 7, eyeY - 2); g.stroke(); }
  // nose
  g.strokeStyle = 'rgba(35,26,51,0.5)'; g.lineWidth = 3; g.beginPath(); g.moveTo(fx + 2, fy + 4); g.quadraticCurveTo(fx + 8, fy + 14, fx, fy + 16); g.stroke();
  // mouth
  const my = fy + 34, open = talk ? Math.abs(Math.sin(t * 14)) : 0;
  g.strokeStyle = OUT; g.lineWidth = 4.5; g.fillStyle = '#7a2b3a';
  if (expr === 'happy' || expr === 'laugh') { g.beginPath(); g.moveTo(fx - 20, my - 4); g.quadraticCurveTo(fx, my + (expr === 'laugh' ? 26 : 18), fx + 20, my - 4); g.closePath(); g.fill(); g.stroke(); }
  else if (shock) { g.beginPath(); g.ellipse(fx, my + 4, 11, 15, 0, 0, Math.PI * 2); g.fill(); g.stroke(); }
  else if (worried || expr === 'sad') { g.beginPath(); g.moveTo(fx - 16, my + 6); g.quadraticCurveTo(fx - 6, my - 4, fx, my + 2); g.quadraticCurveTo(fx + 8, my + 8, fx + 16, my); g.stroke(); }
  else if (expr === 'smug') { g.beginPath(); g.moveTo(fx - 14, my + 2); g.quadraticCurveTo(fx + 4, my + 8, fx + 20, my - 6); g.stroke(); }
  else if (talk || expr === 'talk') { g.beginPath(); g.ellipse(fx, my + 2, 12, 3 + open * 9, 0, 0, Math.PI * 2); g.fill(); g.stroke(); }
  else { g.beginPath(); g.moveTo(fx - 12, my); g.quadraticCurveTo(fx, my + 6, fx + 12, my); g.stroke(); }
  if (blush) { g.fillStyle = `rgba(255,120,140,${0.45 * blush})`; g.beginPath(); g.ellipse(fx - 36, fy + 16, 12, 7, 0, 0, Math.PI * 2); g.ellipse(fx + 36, fy + 16, 12, 7, 0, 0, Math.PI * 2); g.fill(); }
  if (sweat) for (let i = 0; i < 2; i++) { const ph2 = ((t * 0.8 + i * 0.5) % 1); g.fillStyle = `rgba(120,190,255,${sweat * (1 - ph2)})`; const sx = HR * 0.85 + i * 8, sy = hy - 90 + ph2 * 40; g.beginPath(); g.moveTo(sx, sy - 12); g.quadraticCurveTo(sx + 9, sy + 2, sx, sy + 6); g.quadraticCurveTo(sx - 9, sy + 2, sx, sy - 12); g.fill(); }
  g.restore();
  return { head: [x, y + bob + (hy - 58) * s], handR: [x + hr[0] * s, y + bob + hr[1] * s], handL: [x + hl[0] * s, y + bob + hl[1] * s] };
}

/** A parrot (for the voice-copying analogy). mouth opens with `talk` */
export function parrot(g, x, y, s, t, { talk = 0, look = 1 } = {}) {
  g.save(); g.translate(x, y); g.scale(s * look, s); g.lineJoin = 'round';
  const bob = Math.sin(t * 3) * 3, open = talk ? Math.abs(Math.sin(t * 12)) * 0.5 : 0;
  g.translate(0, bob);
  g.strokeStyle = OUT; g.lineWidth = 5;
  // tail
  g.fillStyle = '#2f7de1'; g.beginPath(); g.moveTo(-20, 60); g.lineTo(-60, 170); g.lineTo(-10, 150); g.lineTo(10, 70); g.closePath(); g.fill(); g.stroke();
  // body
  g.fillStyle = '#e2412e'; g.beginPath(); g.ellipse(0, 20, 55, 85, -0.15, 0, Math.PI * 2); g.fill(); g.stroke();
  // wing
  g.fillStyle = '#ffc93c'; g.beginPath(); g.ellipse(-14, 40, 30, 60, -0.35, 0, Math.PI * 2); g.fill(); g.stroke();
  g.fillStyle = '#2f7de1'; g.beginPath(); g.ellipse(-24, 80, 18, 34, -0.35, 0, Math.PI * 2); g.fill();
  // head
  g.fillStyle = '#e2412e'; g.beginPath(); g.arc(18, -62, 44, 0, Math.PI * 2); g.fill(); g.stroke();
  g.fillStyle = '#fff'; g.beginPath(); g.ellipse(34, -66, 20, 16, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = OUT; g.beginPath(); g.arc(38, -66, 6, 0, Math.PI * 2); g.fill();
  // beak (upper + lower that opens)
  g.fillStyle = '#3a3156'; g.beginPath(); g.moveTo(50, -60); g.quadraticCurveTo(96, -58, 74, -20); g.quadraticCurveTo(66, -40, 50, -42); g.closePath(); g.fill(); g.stroke();
  g.save(); g.translate(52, -40); g.rotate(open * 0.6); g.fillStyle = '#5a5070'; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(24, 6, 18, 18); g.quadraticCurveTo(6, 14, 0, 6); g.closePath(); g.fill(); g.stroke(); g.restore();
  // feet on perch
  g.strokeStyle = '#8a5a2b'; g.lineWidth = 12; g.beginPath(); g.moveTo(-80, 104); g.lineTo(90, 104); g.stroke();
  g.strokeStyle = OUT; g.lineWidth = 6; g.beginPath(); g.moveTo(-10, 98); g.lineTo(-14, 110); g.moveTo(14, 98); g.lineTo(18, 110); g.stroke();
  g.restore();
}
void clamp; void lerp;
