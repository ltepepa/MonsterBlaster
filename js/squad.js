// Cheer squad: brainrot fans on the hill and the banner plane.
const hillY = x => 118 + Math.sin(x * 0.012) * 12 + 6;

function drawTung(x, y, c) {
  ctx.strokeStyle = '#3b2a1a'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - 5, y - 10); ctx.lineTo(x - 6, y); ctx.moveTo(x + 5, y - 10); ctx.lineTo(x + 6, y); ctx.stroke();
  rr(x - 12, y - 50, 24, 42, 9, '#c8955a');
  ctx.strokeStyle = '#a5763f'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(x - 8, y - 20); ctx.lineTo(x + 6, y - 20); ctx.moveTo(x - 6, y - 15); ctx.lineTo(x + 8, y - 15); ctx.stroke();
  ellipse(x - 5, y - 38, 4.5, 5.5, '#fff'); ellipse(x + 5, y - 38, 4.5, 5.5, '#fff');
  ellipse(x - 4, y - 37, 2, 2.6, '#1a1033'); ellipse(x + 6, y - 37, 2, 2.6, '#1a1033');
  ctx.strokeStyle = '#3b2a1a'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x, y - 30, 4, 0.2, Math.PI - 0.2); ctx.stroke();
  // left arm, and right arm swinging the bat
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x - 12, y - 28); ctx.lineTo(x - 20, y - 20 - (c.jump ? 14 : 0)); ctx.stroke();
  const swing = c.jump ? -0.6 + Math.sin(game.t * 0.6) * 0.7 : 0.4;
  ctx.save(); ctx.translate(x + 12, y - 28); ctx.rotate(swing);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(8, -6); ctx.stroke();
  ctx.translate(8, -6); ctx.rotate(-0.5); rr(-3, -26, 7, 28, 3, '#8a5a2b');
  ctx.restore();
}

function drawTralalero(x, y, c) {
  rr(x - 13, y - 5, 11, 6, 3, '#2f6fe4'); rr(x + 2, y - 5, 11, 6, 3, '#2f6fe4');
  ctx.fillStyle = '#fff'; ctx.fillRect(x - 13, y - 1, 11, 2); ctx.fillRect(x + 2, y - 1, 11, 2);
  ctx.strokeStyle = '#4a6fa8'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - 6, y - 14); ctx.lineTo(x - 7, y - 5); ctx.moveTo(x + 6, y - 14); ctx.lineTo(x + 7, y - 5); ctx.stroke();
  ctx.fillStyle = '#5b8fd9';
  ctx.beginPath(); ctx.moveTo(x - 2, y - 52); ctx.lineTo(x + 8, y - 64); ctx.lineTo(x + 8, y - 48); ctx.fill();
  ellipse(x, y - 32, 15, 22, '#5b8fd9');
  ellipse(x, y - 26, 9, 14, '#e8f1ff');
  const wave = c.jump ? Math.sin(game.t * 0.8) * 10 : 0;
  ctx.fillStyle = '#4a7cc4';
  ctx.beginPath(); ctx.moveTo(x - 13, y - 32); ctx.lineTo(x - 26, y - 40 - wave); ctx.lineTo(x - 12, y - 24); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x + 13, y - 32); ctx.lineTo(x + 26, y - 40 + wave); ctx.lineTo(x + 12, y - 24); ctx.fill();
  ellipse(x - 6, y - 42, 3, 3.5, '#1a1033'); ellipse(x + 6, y - 42, 3, 3.5, '#1a1033');
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(x - 7, y - 35);
  for (let i = 0; i <= 7; i++) ctx.lineTo(x - 7 + i * 2, y - 35 + (i % 2 ? 4 : 0));
  ctx.lineTo(x + 7, y - 35); ctx.fill();
}

function drawCappuccina(x, y, c) {
  ctx.save(); ctx.translate(x, 0);
  if (c.jump) ctx.scale(Math.cos(game.t * 0.35), 1); // twirl
  ctx.strokeStyle = '#f6c49b'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-4, y - 16); ctx.lineTo(-3, y); ctx.moveTo(4, y - 16); ctx.lineTo(3, y); ctx.stroke();
  ellipse(0, y - 18, 17, 6, '#ff8fc7'); ellipse(0, y - 20, 13, 5, '#ffb3d9');
  rr(-6, y - 34, 12, 15, 4, '#ff8fc7');
  const up = c.jump ? 1 : 0;
  ctx.beginPath();
  ctx.moveTo(-6, y - 31); ctx.quadraticCurveTo(-16, y - 40 - up * 10, -4 + up * 2, y - 52 - up * 8);
  ctx.moveTo(6, y - 31); ctx.quadraticCurveTo(16, y - 40 - up * 10, 4 - up * 2, y - 52 - up * 8);
  ctx.stroke();
  ctx.fillStyle = '#ffffff'; ctx.beginPath();
  ctx.moveTo(-12, y - 52); ctx.lineTo(12, y - 52); ctx.lineTo(9, y - 34); ctx.lineTo(-9, y - 34); ctx.fill();
  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(12, y - 44, 5, -1.3, 1.3); ctx.stroke();
  ellipse(0, y - 52, 12, 3.5, '#8a5a2b'); ellipse(-2, y - 53, 6, 1.8, '#f3e3c8');
  ellipse(-4, y - 44, 2, 2.5, '#1a1033'); ellipse(4, y - 44, 2, 2.5, '#1a1033');
  ellipse(-7, y - 40, 2.5, 1.5, '#ffb3c7'); ellipse(7, y - 40, 2.5, 1.5, '#ffb3c7');
  ctx.restore();
}

function drawBombardiro(p) {
  const x = p.x, y = p.y + Math.sin(game.t * 0.05) * 6;
  // banner trailing behind
  ctx.font = '700 15px Fredoka, system-ui, sans-serif';
  const text = p.text || 'GO GO BLASTER!', tw = ctx.measureText(text).width + 22;
  const bx = x + 70, wob = Math.sin(game.t * 0.2) * 3;
  ctx.strokeStyle = '#d8dbe8'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(x + 36, y); ctx.lineTo(bx, y - 10 + wob); ctx.moveTo(x + 36, y); ctx.lineTo(bx, y + 10 + wob); ctx.stroke();
  rr(bx, y - 12 + wob, tw, 24, 4, '#ffd23f');
  ctx.fillStyle = '#1a1033'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(text, bx + 11, y + wob + 1);
  // wings, fuselage, tail
  ctx.fillStyle = '#6d7488';
  ctx.beginPath(); ctx.moveTo(x - 6, y); ctx.lineTo(x + 14, y - 26); ctx.lineTo(x + 24, y - 26); ctx.lineTo(x + 14, y); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x + 26, y - 4); ctx.lineTo(x + 38, y - 20); ctx.lineTo(x + 42, y - 20); ctx.lineTo(x + 38, y - 2); ctx.fill();
  ellipse(x + 8, y, 32, 10, '#8a92a8');
  ellipse(x + 8, y + 7, 7, 4, '#3a3f4f'); // bomb hatch
  ctx.fillStyle = '#5d6478';
  ctx.beginPath(); ctx.moveTo(x - 4, y + 2); ctx.lineTo(x + 18, y + 18); ctx.lineTo(x + 26, y + 18); ctx.lineTo(x + 14, y + 2); ctx.fill();
  // crocodile head with a long toothy snout
  rr(x - 50, y - 9, 34, 15, 6, '#4f9a3a');
  rr(x - 50, y + 2, 30, 6, 3, '#3d7a2c');
  ctx.fillStyle = '#fff';
  for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(x - 46 + i * 5, y + 2); ctx.lineTo(x - 44 + i * 5, y + 6); ctx.lineTo(x - 42 + i * 5, y + 2); ctx.fill(); }
  ellipse(x - 24, y - 10, 6, 6, '#4f9a3a'); ellipse(x - 23, y - 11, 3.5, 3.5, '#ffe066'); ellipse(x - 22, y - 11, 1.5, 2.5, '#1a1033');
  ellipse(x - 48, y - 6, 1.5, 1.5, '#1a1033');
  // spinning propeller on its back
  ellipse(x + 8, y - 12, 2, 2, '#3a3f4f');
  ctx.fillStyle = 'rgba(220,225,240,.6)'; ellipse(x + 8, y - 14, 14 * Math.abs(Math.sin(game.t * 0.9)) + 2, 2, 'rgba(220,225,240,.6)');
}

const SQUAD = [
  { x: 362, draw: drawTung, says: ['TUNG TUNG!', 'SAHUR!', 'BONK!'] },
  { x: 468, draw: drawTralalero, says: ['TRALALA!', 'Nice shot!', 'Woo-hoo!'] },
  { x: 572, draw: drawCappuccina, says: ['Bravissimo!', 'Mi mi mi!', 'Bellissimo!'] },
].map(c => ({ ...c, jump: 0, bubble: null }));
const plane = { x: W + 260, y: 72, wait: 200 };
let idleCheer = 300;

function say(c, text) { c.bubble = { text, life: 70 }; }
function cheer(n = 1) {
  const pick = [...SQUAD].sort(() => Math.random() - 0.5).slice(0, n);
  for (const c of pick) { c.jump = 40; say(c, c.says[Math.floor(Math.random() * c.says.length)]); }
}
function cheerAll() { SQUAD.forEach(c => { c.jump = 70; say(c, c.says[0]); }); plane.wait = 0; }
function aww() { SQUAD.forEach((c, i) => { c.jump = 0; say(c, ['Oh no!', 'Eek!', 'Mamma mia!'][i]); }); }

function updateSquad(f) {
  for (const c of SQUAD) {
    c.jump = Math.max(0, c.jump - f);
    if (c.bubble && (c.bubble.life -= f) <= 0) c.bubble = null;
  }
  if (game.state === 'play' && (idleCheer -= f) <= 0) {
    idleCheer = 260 + Math.random() * 200;
    const c = SQUAD[Math.floor(Math.random() * SQUAD.length)];
    if (!c.bubble) say(c, ['GO!', 'You got this!', 'Blast them!'][Math.floor(Math.random() * 3)]);
  }
  if (plane.x > -400) plane.x -= 1.6 * f;
  else if ((plane.wait -= f) <= 0) { plane.x = W + 60; plane.wait = 600 + Math.random() * 400; }
}

function drawSquad() {
  if (plane.x > -400 && plane.x < W + 80) drawBombardiro(plane);
  SQUAD.forEach((c, i) => {
    const hop = c.jump ? Math.abs(Math.sin(c.jump * 0.16)) * 14 : Math.abs(Math.sin(game.t * 0.08 + i)) * 2;
    const y = hillY(c.x) - hop;
    ellipse(c.x, hillY(c.x) + 1, 12, 3, 'rgba(0,0,0,.3)');
    c.draw(c.x, y, c);
  });
  SQUAD.forEach((c, i) => { if (c.bubble) drawBubble(c.x, hillY(c.x) - 66 - (i % 2) * 8, c.bubble.text); });
}
