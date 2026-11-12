// The black leather jacket (stands in for Huang; real people are never drawn as faces).
// Drawn around its collar-to-hem centre: about 450 wide, 340 tall at scale 1.
export function jacketOnly(g, t, x, y, s, { lit = 1 } = {}) {
  g.save(); g.translate(x, y); g.scale(s, s); g.lineJoin = 'round';
  const body = () => { g.beginPath(); g.moveTo(-46, -292); g.quadraticCurveTo(-110, -286, -152, -258); g.lineTo(-138, 34); g.quadraticCurveTo(0, 52, 138, 34); g.lineTo(152, -258); g.quadraticCurveTo(110, -286, 46, -292); g.lineTo(0, -236); g.closePath(); };
  const sleeve = (d) => { g.beginPath(); g.moveTo(d * 150, -260); g.quadraticCurveTo(d * 212, -236, d * 222, -150); g.lineTo(d * 236, 30); g.quadraticCurveTo(d * 206, 48, d * 176, 36); g.lineTo(d * 142, -150); g.closePath(); };
  // sleeves behind the body, slightly lighter on the key (left) side
  for (const d of [-1, 1]) { const sg = g.createLinearGradient(d * 236, 0, d * 140, 0); sg.addColorStop(0, d < 0 ? '#3a3542' : '#22202a'); sg.addColorStop(1, '#0c0b10'); g.fillStyle = sg; sleeve(d); g.fill(); g.fillStyle = '#08070b'; g.beginPath(); g.moveTo(d * 233, 4); g.lineTo(d * 236, 30); g.quadraticCurveTo(d * 206, 48, d * 176, 36); g.lineTo(d * 172, 10); g.closePath(); g.fill(); }
  const jg = g.createLinearGradient(-160, -300, 160, 60); jg.addColorStop(0, '#35313d'); jg.addColorStop(0.45, '#18161d'); jg.addColorStop(1, '#070609');
  g.fillStyle = jg; body(); g.fill();
  // hem band, yoke seams, pockets
  g.fillStyle = 'rgba(0,0,0,0.45)'; g.beginPath(); g.moveTo(-139, 10); g.quadraticCurveTo(0, 28, 139, 10); g.lineTo(138, 34); g.quadraticCurveTo(0, 52, -138, 34); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(0,0,0,0.55)'; g.lineWidth = 3; g.beginPath(); g.moveTo(-148, -190); g.quadraticCurveTo(-90, -170, -30, -196); g.moveTo(148, -190); g.quadraticCurveTo(90, -170, 30, -196); g.stroke();
  g.strokeStyle = '#8f8a9c'; g.lineWidth = 3.5; g.beginPath(); g.moveTo(-104, -70); g.lineTo(-58, -40); g.moveTo(104, -70); g.lineTo(58, -40); g.moveTo(44, -150); g.lineTo(96, -158); g.stroke();
  // wide collar and lapels
  g.fillStyle = '#2a2731'; g.strokeStyle = 'rgba(0,0,0,0.6)'; g.lineWidth = 2;
  for (const d of [-1, 1]) { g.beginPath(); g.moveTo(d * 46, -292); g.lineTo(d * 108, -276); g.lineTo(d * 74, -178); g.lineTo(d * 6, -120); g.lineTo(0, -236); g.closePath(); g.fill(); g.stroke(); }
  g.fillStyle = '#0a090d'; g.beginPath(); g.moveTo(-46, -292); g.lineTo(0, -236); g.lineTo(46, -292); g.quadraticCurveTo(0, -304, -46, -292); g.fill();
  // zip
  g.strokeStyle = '#b4afc0'; g.lineWidth = 4; g.beginPath(); g.moveTo(3, -122); g.lineTo(3, 40); g.stroke(); g.fillStyle = '#d8d3e4'; g.fillRect(-3, -60 + Math.sin(t * 1.3) * 2, 12, 16);
  // leather sheen: narrow warm highlights on the key side, a thin cool edge on the other
  g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.5 * lit;
  [[-112, -252, 46, 9, -0.35], [-205, -150, 7, 86, -0.06], [-92, -60, 7, 60, 0.05], [84, -250, 34, 7, 0.35], [-60, -236, 6, 40, -0.5]].forEach(([a, b, rx, ry, rot]) => { const m = Math.max(rx, ry), hg = g.createRadialGradient(0, 0, 0, 0, 0, m); hg.addColorStop(0, 'rgba(255,225,190,0.8)'); hg.addColorStop(1, 'rgba(255,225,190,0)'); g.save(); g.translate(a, b); g.rotate(rot); g.scale(rx / m, ry / m); g.fillStyle = hg; g.beginPath(); g.arc(0, 0, m, 0, Math.PI * 2); g.fill(); g.restore(); });
  g.restore();
  g.strokeStyle = `rgba(255,220,180,${0.55 * lit})`; g.lineWidth = 3; g.beginPath(); g.moveTo(-46, -292); g.quadraticCurveTo(-110, -286, -152, -258); g.quadraticCurveTo(-212, -236, -222, -150); g.lineTo(-230, -40); g.stroke();
  g.strokeStyle = `rgba(130,150,255,${0.4 * lit})`; g.lineWidth = 2.5; g.beginPath(); g.moveTo(222, -150); g.lineTo(236, 30); g.stroke();
  g.restore();
}
