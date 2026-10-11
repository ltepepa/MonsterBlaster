// Rescued animals: freed after each boss, then follow the kid as sidekicks.
function updateRescue(f) {
  const r = game.rescue, k = game.kid;
  if (!r) return;
  r.t += f;
  if (r.phase === 'pop') {
    r.hop = Math.abs(Math.sin(r.t * 0.12)) * 30;
    if (r.t > 55) { r.phase = 'run'; r.hop = 0; sfx.animal(r.a.sound); }
  } else if (r.phase === 'run') {
    r.x -= 5 * f;
    r.y += (k.y - r.y) * Math.min(1, 0.12 * f);
    if (r.x <= KID_X + 44) {
      r.x = KID_X + 44; r.phase = 'thank'; r.t = 0;
      game.rescued.push(r.a.name);
      say(r, r.a.says);
    }
  } else if (r.phase === 'thank') {
    r.y += (k.y - r.y) * Math.min(1, 0.3 * f);
    r.hop = Math.abs(Math.sin(r.t * 0.16)) * 22;
    if (Math.floor(r.t) % 20 === 0 && Math.floor(r.t - f) % 20 !== 0) {
      game.loves.push({ x: KID_X + 10 + Math.random() * 30, y: k.y - 80, life: 60 });
      game.texts.push({ x: KID_X + 30 + Math.random() * 30, y: k.y - 100, s: r.a.word, life: 35 });
      sfx.animal(r.a.sound);
    }
    if (r.t > 170) {
      r.phase = 'follow'; r.hop = 0; r.bubble = null; game.spawn = 60;
      game.texts.push({ x: W / 2, y: 270, s: 'LEVEL ' + game.level + '!', life: 110, big: true });
    }
  } else {
    // sidekick: trots along behind the kid
    r.x += (KID_X - 50 - r.x) * Math.min(1, 0.1 * f);
    r.y += (k.y - r.y) * Math.min(1, 0.15 * f);
  }
  if (r.bubble && (r.bubble.life -= f) <= 0) r.bubble = null;
  for (const l of game.loves) { l.y -= 0.9 * f; l.x += Math.sin(l.life * 0.2) * 0.5; l.life -= f; }
  game.loves = game.loves.filter(l => l.life > 0);
}

function drawDog(x, y, o) {
  const step = o.moving ? Math.sin(game.t * 0.6) * 5 : 0;
  ctx.strokeStyle = '#c98a45'; ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x + 26, y - 26); ctx.quadraticCurveTo(x + 40, y - 26 + Math.sin(game.t * 0.8) * 6, x + 44, y - 38); ctx.stroke();
  legs([x - 16 + step, x - 8 - step, x + 14 + step, x + 21 - step], y, 20, '#9c6430', step);
  ellipse(x + 4, y - 24, 27, 12, '#c98a45');
  ellipse(x + 8, y - 30, 20, 7, '#2a1d14');
  ellipse(x - 20, y - 36, 12, 11, '#c98a45');
  ellipse(x - 31, y - 32, 10, 6, '#3a2a1e');
  ellipse(x - 40, y - 34, 3.5, 3, '#111');
  ctx.fillStyle = '#3a2a1e';
  ctx.beginPath(); ctx.moveTo(x - 22, y - 44); ctx.lineTo(x - 18, y - 62); ctx.lineTo(x - 12, y - 44); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - 29, y - 44); ctx.lineTo(x - 27, y - 60); ctx.lineTo(x - 21, y - 45); ctx.fill();
  ellipse(x - 24, y - 39, 2.4, 2.8, '#111'); ellipse(x - 25, y - 40, 0.9, 0.9, '#fff');
  if (o.lick) {
    // big slobbery lick toward the kid's face
    const reach = Math.abs(Math.sin(game.t * 0.3)) * 14;
    ctx.fillStyle = '#ff7aa2'; ctx.beginPath();
    ctx.ellipse(x - 38 - reach / 2, y - 30 - reach * 0.6, 4 + reach / 2, 4, -0.6, 0, Math.PI * 2); ctx.fill();
  } else if (o.happy) rr(x - 36, y - 30, 6, 9, 3, '#ff7aa2');
}

function drawKitten(x, y, o) {
  const step = o.moving ? Math.sin(game.t * 0.6) * 4 : 0;
  ctx.strokeStyle = '#e08a3c'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x + 18, y - 18); ctx.quadraticCurveTo(x + 32, y - 22, x + 26 + Math.sin(game.t * 0.2) * 3, y - 42); ctx.stroke();
  legs([x - 10 + step, x - 4 - step, x + 8 + step, x + 13 - step], y, 12, '#e08a3c', step);
  ellipse(x + 2, y - 16, 19, 10, '#f4a259');
  ctx.strokeStyle = '#c96f25'; ctx.lineWidth = 2;
  for (const sx of [-2, 5, 12]) { ctx.beginPath(); ctx.moveTo(sx, y - 25); ctx.lineTo(sx + 2, y - 18); ctx.stroke(); }
  ellipse(x - 14, y - 27, 12, 11, '#f4a259');
  ctx.fillStyle = '#f4a259';
  ctx.beginPath(); ctx.moveTo(x - 24, y - 32); ctx.lineTo(x - 22, y - 45); ctx.lineTo(x - 15, y - 36); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - 12, y - 36); ctx.lineTo(x - 6, y - 45); ctx.lineTo(x - 4, y - 31); ctx.fill();
  if (o.happy) { ctx.strokeStyle = '#1a1033'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(x - 19, y - 28, 2.5, Math.PI, 0); ctx.stroke(); ctx.beginPath(); ctx.arc(x - 10, y - 28, 2.5, Math.PI, 0); ctx.stroke(); }
  else { ellipse(x - 19, y - 28, 2, 2.6, '#1a1033'); ellipse(x - 10, y - 28, 2, 2.6, '#1a1033'); }
  ellipse(x - 15, y - 23, 2, 1.5, '#ff7aa2');
  ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x - 20, y - 22); ctx.lineTo(x - 32, y - 24); ctx.moveTo(x - 20, y - 21); ctx.lineTo(x - 31, y - 19); ctx.stroke();
}

function drawBunny(x, y, o) {
  const hop = o.moving ? Math.abs(Math.sin(game.t * 0.3)) * 8 : 0;
  y -= hop;
  ellipse(x + 20, y - 16, 6, 6, '#ffffff');
  ellipse(x + 4, y - 14, 17, 13, '#ece8f5');
  ellipse(x - 8, y - 4, 8, 4, '#ece8f5'); ellipse(x + 12, y - 3, 8, 4, '#ece8f5');
  ellipse(x - 12, y - 25, 11, 10, '#ece8f5');
  ctx.fillStyle = '#ece8f5'; ctx.beginPath(); ctx.ellipse(x - 16, y - 44, 4.5, 14, -0.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x - 7, y - 44, 4.5, 14, 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffb3c7'; ctx.beginPath(); ctx.ellipse(x - 16, y - 44, 2, 10, -0.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x - 7, y - 44, 2, 10, 0.2, 0, Math.PI * 2); ctx.fill();
  ellipse(x - 15, y - 27, 2, 2.6, '#1a1033');
  ellipse(x - 22, y - 23, 2, 1.6, '#ff7aa2');
}

function drawPiglet(x, y, o) {
  const step = o.moving ? Math.sin(game.t * 0.6) * 4 : 0;
  ctx.strokeStyle = '#e58aa6'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.arc(x + 25, y - 22, 4, 0, Math.PI * 1.6); ctx.stroke();
  legs([x - 12 + step, x - 5 - step, x + 8 + step, x + 14 - step], y, 12, '#e58aa6', step);
  ellipse(x + 2, y - 18, 23, 14, '#f7a8c0');
  ellipse(x - 18, y - 23, 12, 11, '#f7a8c0');
  ctx.fillStyle = '#e58aa6';
  ctx.beginPath(); ctx.moveTo(x - 22, y - 31); ctx.lineTo(x - 24, y - 42); ctx.lineTo(x - 15, y - 33); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - 12, y - 32); ctx.lineTo(x - 8, y - 42); ctx.lineTo(x - 6, y - 29); ctx.fill();
  ellipse(x - 29, y - 21, 6, 5, '#e58aa6');
  ellipse(x - 31, y - 21, 1.2, 1.8, '#9c4a63'); ellipse(x - 27, y - 21, 1.2, 1.8, '#9c4a63');
  ellipse(x - 20, y - 28, 2, 2.4, '#1a1033');
}

function drawPenguin(x, y, o) {
  const waddle = o.moving ? Math.sin(game.t * 0.5) * 0.15 : 0;
  ctx.save(); ctx.translate(x, y); ctx.rotate(waddle);
  ellipse(-7, -2, 7, 3.5, '#ff9f1c'); ellipse(7, -2, 7, 3.5, '#ff9f1c');
  ellipse(0, -24, 15, 23, '#1d2433');
  ellipse(-3, -21, 10, 17, '#f4f2f8');
  ctx.fillStyle = '#1d2433'; ctx.beginPath(); ctx.ellipse(12, -24, 4, 12, 0.4 + (o.happy ? Math.sin(game.t * 0.6) * 0.5 : 0), 0, Math.PI * 2); ctx.fill();
  ellipse(-6, -38, 2.2, 2.6, '#fff'); ellipse(-6.5, -38, 1.2, 1.5, '#1a1033');
  ctx.fillStyle = '#ff9f1c'; ctx.beginPath(); ctx.moveTo(-12, -36); ctx.lineTo(-22, -33); ctx.lineTo(-12, -31); ctx.fill();
  ellipse(-8, -30, 2.5, 1.6, '#ffb3c7');
  ctx.restore();
}

function drawPanda(x, y, o) {
  const step = o.moving ? Math.sin(game.t * 0.5) * 4 : 0;
  legs([x - 12 + step, x - 4 - step, x + 10 + step, x + 17 - step], y, 13, '#1d2433', step);
  ellipse(x + 3, y - 19, 22, 14, '#f4f2f8');
  ctx.fillStyle = '#1d2433'; ctx.fillRect(x - 8, y - 32, 10, 26);
  ellipse(x - 26, y - 41, 5, 5, '#1d2433'); ellipse(x - 10, y - 42, 5, 5, '#1d2433');
  ellipse(x - 17, y - 29, 13, 12, '#f4f2f8');
  ctx.fillStyle = '#1d2433'; ctx.beginPath(); ctx.ellipse(x - 22, y - 30, 3.5, 4.5, 0.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x - 12, y - 30, 3.5, 4.5, -0.5, 0, Math.PI * 2); ctx.fill();
  ellipse(x - 22, y - 31, 1.2, 1.2, '#fff'); ellipse(x - 12, y - 31, 1.2, 1.2, '#fff');
  ellipse(x - 17, y - 23, 2.5, 1.8, '#1d2433');
}

const ANIMALS = [
  { name: 'German Shepherd', draw: drawDog, word: 'LICK!', says: 'Woof! My hero!', sound: 'bark', licks: true },
  { name: 'Kitten', draw: drawKitten, word: 'PURR!', says: 'Meow! Thank you!', sound: 'meow' },
  { name: 'Bunny', draw: drawBunny, word: 'BOOP!', says: 'Hop hop hooray!', sound: 'squeak' },
  { name: 'Piglet', draw: drawPiglet, word: 'OINK!', says: 'You saved me!', sound: 'oink' },
  { name: 'Penguin', draw: drawPenguin, word: 'HUG!', says: 'Squawk! Thanks!', sound: 'squeak' },
  { name: 'Panda Cub', draw: drawPanda, word: 'BEAR HUG!', says: 'You are the best!', sound: 'hum' },
];

function drawRescue(r) {
  const scale = r.phase === 'follow' ? 0.8 : 1;
  ctx.save(); ctx.translate(r.x, r.y - r.hop); ctx.scale(scale, scale);
  ellipse(0, r.hop / scale + 2, 22, 4, 'rgba(0,0,0,.25)');
  r.a.draw(0, 0, { moving: r.phase === 'run' || (r.phase === 'follow' && Math.abs(game.kid.y - r.y) > 4), happy: r.phase !== 'pop', lick: r.phase === 'thank' && r.a.licks });
  ctx.restore();
  if (r.phase === 'pop') {
    ctx.strokeStyle = 'rgba(255,224,102,.8)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(r.x, r.y - 25 - r.hop, 40 + Math.sin(r.t * 0.3) * 4, 0, Math.PI * 2); ctx.stroke();
  }
  if (r.bubble) drawBubble(r.x + 10, r.y - 72, r.bubble.text);
}

function drawLoves() {
  for (const l of game.loves) {
    ctx.save(); ctx.globalAlpha = Math.min(1, l.life / 25);
    ctx.translate(l.x, l.y); ctx.scale(0.8, 0.8); heart(0, 0, true);
    ctx.restore();
  }
}
