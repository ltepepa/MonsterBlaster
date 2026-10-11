// Regular monsters: spawning and drawing.
function spawnMonster() {
  const pool = Object.keys(TYPES).filter(k => TYPES[k].from <= game.level);
  const type = pool[Math.floor(Math.random() * pool.length)];
  const T = TYPES[type];
  game.monsters.push({
    type, lane: Math.floor(Math.random() * 3), x: W + 40, hp: T.hp,
    speed: T.speed * (1 + (game.level - 1) * 0.12) * (0.9 + Math.random() * 0.2),
    phase: Math.random() * 6.28, hit: 0,
  });
}

function drawGhost(x, y, m) {
  y += Math.sin(m.phase) * 8 - 18;
  ctx.globalAlpha = 0.92;
  ctx.fillStyle = m.hit ? '#ffe066' : '#f4f2ff';
  ctx.beginPath(); ctx.arc(x, y - 10, 28, Math.PI, 0); ctx.lineTo(x + 28, y + 24);
  for (let i = 0; i < 4; i++) { const bx = x + 28 - (i + 1) * 14; ctx.quadraticCurveTo(bx + 7, y + 24 + (i % 2 ? -8 : 10) + Math.sin(m.phase * 2 + i) * 3, bx, y + 24); }
  ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
  ellipse(x - 10, y - 12, 5, 8, '#1a1033'); ellipse(x + 6, y - 12, 5, 8, '#1a1033');
  ellipse(x - 3, y + 4, 6, 8, '#1a1033');
  ellipse(x - 16, y - 2, 4, 2.5, '#ffb3c7'); ellipse(x + 13, y - 2, 4, 2.5, '#ffb3c7');
}

function drawPumpkin(x, y, m) {
  const hop = Math.abs(Math.sin(m.phase * 1.4)) * 16;
  y -= 20 + hop;
  ellipse(x, y + 26 + hop, 24, 5, 'rgba(0,0,0,.25)');
  const c = m.hit ? '#ffe066' : '#ff8a1f';
  ellipse(x - 14, y, 18, 24, '#e2700c'); ellipse(x + 14, y, 18, 24, '#e2700c'); ellipse(x, y, 20, 26, c);
  rr(x - 3, y - 34, 7, 12, 3, '#5dbb3a');
  ctx.fillStyle = '#ffe066';
  ctx.beginPath(); ctx.moveTo(x - 15, y - 2); ctx.lineTo(x - 9, y - 12); ctx.lineTo(x - 3, y - 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x + 3, y - 2); ctx.lineTo(x + 9, y - 12); ctx.lineTo(x + 15, y - 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - 16, y + 6);
  for (let i = 0; i <= 8; i++) ctx.lineTo(x - 16 + i * 4, y + 6 + (i % 2 ? 5 : 0));
  ctx.lineTo(x + 14, y + 14); ctx.quadraticCurveTo(x, y + 22, x - 14, y + 14); ctx.fill();
}

function drawBat(x, y, m) {
  y += Math.sin(m.phase * 1.5) * 18 - 40;
  const flap = Math.sin(m.phase * 6) * 14;
  const c = m.hit ? '#ffe066' : '#7b4fd1';
  ctx.fillStyle = c;
  for (const s of [-1, 1]) {
    ctx.beginPath(); ctx.moveTo(x, y);
    ctx.lineTo(x + s * 34, y - 10 - flap); ctx.lineTo(x + s * 28, y + 4 - flap / 2);
    ctx.lineTo(x + s * 20, y - 2); ctx.lineTo(x + s * 14, y + 8); ctx.closePath(); ctx.fill();
  }
  ellipse(x, y, 15, 14, m.hit ? '#ffe066' : '#5c38a8');
  ctx.fillStyle = '#5c38a8';
  ctx.beginPath(); ctx.moveTo(x - 11, y - 8); ctx.lineTo(x - 8, y - 20); ctx.lineTo(x - 3, y - 11); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x + 11, y - 8); ctx.lineTo(x + 8, y - 20); ctx.lineTo(x + 3, y - 11); ctx.fill();
  ellipse(x - 5, y - 2, 4, 4, '#ffe066'); ellipse(x + 5, y - 2, 4, 4, '#ffe066');
  ellipse(x - 6, y - 2, 1.6, 2.4, '#1a1033'); ellipse(x + 4, y - 2, 1.6, 2.4, '#1a1033');
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.moveTo(x - 4, y + 6); ctx.lineTo(x - 2, y + 11); ctx.lineTo(x, y + 6); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x + 1, y + 6); ctx.lineTo(x + 3, y + 11); ctx.lineTo(x + 5, y + 6); ctx.fill();
}

function drawZombie(x, y, m) {
  const step = Math.sin(m.phase * 2);
  ellipse(x, y + 12, 24, 6, 'rgba(0,0,0,.3)');
  rr(x - 10 + step * 4, y - 14, 9, 26, 4, '#5a4632'); rr(x + 2 - step * 4, y - 14, 9, 26, 4, '#5a4632');
  rr(x - 17, y - 52, 34, 42, 8, m.hp < 2 ? '#2f6f9e' : '#3c8dbc');
  ctx.fillStyle = '#244d6b'; ctx.fillRect(x - 17, y - 22, 34, 4);
  // arms reaching left
  const skin = m.hit ? '#ffe066' : '#86c96a';
  rr(x - 46, y - 48 + step * 2, 34, 10, 5, skin); rr(x - 44, y - 34 - step * 2, 32, 10, 5, skin);
  // head
  rr(x - 18, y - 88, 36, 36, 10, skin);
  ctx.fillStyle = '#2d4a1e'; ctx.fillRect(x - 18, y - 88, 36, 8);
  ellipse(x - 8, y - 70, 7, 7, '#fff'); ellipse(x + 7, y - 70, 5, 5, '#fff');
  ellipse(x - 10, y - 70, 3, 3, '#1a1033'); ellipse(x + 5, y - 70, 2.5, 2.5, '#1a1033');
  ctx.strokeStyle = '#2d4a1e'; ctx.lineWidth = 2; ctx.beginPath();
  ctx.moveTo(x - 10, y - 60); ctx.lineTo(x + 8, y - 58); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + 10, y - 84); ctx.lineTo(x + 14, y - 76);
  ctx.moveTo(x + 9, y - 80); ctx.lineTo(x + 15, y - 81); ctx.stroke();
  if (m.hp < 2) { rr(x - 14, y - 86, 30, 6, 2, '#f4f2ff'); }
}

const DRAW = { ghost: drawGhost, pumpkin: drawPumpkin, bat: drawBat, zombie: drawZombie };
