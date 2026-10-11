// Scene rendering: background, kid, rockets, HUD and the main render pass.
const stars = Array.from({ length: 50 }, () => ({ x: Math.random() * W, y: Math.random() * 120, r: Math.random() * 1.6 + 0.4, p: Math.random() * 6 }));
const graves = Array.from({ length: 9 }, (_, i) => ({ x: 40 + i * 95 + Math.random() * 30, h: 26 + Math.random() * 18, cross: Math.random() < 0.3 }));

function drawBackground() {
  const g = ctx.createLinearGradient(0, 0, 0, 140);
  g.addColorStop(0, '#120b2e'); g.addColorStop(1, '#3b2470');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, 140);
  for (const s of stars) { ctx.globalAlpha = 0.5 + 0.5 * Math.sin(game.t * 0.05 + s.p); ellipse(s.x, s.y, s.r, s.r, '#fff7d6'); }
  ctx.globalAlpha = 1;
  // moon
  ellipse(680, 58, 44, 44, 'rgba(255,240,180,.15)');
  ellipse(680, 58, 34, 34, '#fff3c4');
  ellipse(668, 50, 6, 6, '#eedb9c'); ellipse(692, 68, 8, 8, '#eedb9c'); ellipse(690, 44, 4, 4, '#eedb9c');
  // hills + graves
  ctx.fillStyle = '#1d1440';
  ctx.beginPath(); ctx.moveTo(0, 140);
  for (let x = 0; x <= W; x += 40) ctx.lineTo(x, 118 + Math.sin(x * 0.012) * 12);
  ctx.lineTo(W, 140); ctx.fill();
  for (const gv of graves) {
    if (gv.cross) { rr(gv.x + 7, 132 - gv.h, 6, gv.h, 2, '#4b4378'); rr(gv.x, 138 - gv.h, 20, 6, 2, '#4b4378'); }
    else { ctx.fillStyle = '#4b4378'; ctx.beginPath(); ctx.roundRect(gv.x, 140 - gv.h, 22, gv.h, [11, 11, 0, 0]); ctx.fill(); }
  }
  // three lane paths
  for (let i = 0; i < 3; i++) {
    const top = 140 + i * 103.3;
    ctx.fillStyle = i % 2 ? '#24543a' : '#2a6143'; ctx.fillRect(0, top, W, 104);
    ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(0, LANES[i] + 6, W, 10);
    ctx.fillStyle = 'rgba(255,255,255,.04)';
    for (let x = (i * 37) % 60; x < W; x += 60) ctx.fillRect(x, top + 20 + (x % 50), 3, 8);
  }
  // the kid's lane glows
  ctx.fillStyle = 'rgba(140,242,90,.07)';
  ctx.fillRect(0, 140 + game.kid.lane * 103.3, W, 104);
  // drifting fog
  ctx.fillStyle = 'rgba(200,190,255,.06)';
  for (let i = 0; i < 6; i++) {
    const x = ((i * 170 - game.t * 0.4) % (W + 200) + W + 200) % (W + 200) - 100;
    ellipse(x, 150 + (i % 3) * 100, 120, 18, 'rgba(200,190,255,.06)');
  }
}

function drawKid() {
  const k = game.kid;
  drawKidFigure(KID_X - k.recoil, k.y + Math.sin(game.t * 0.15) * 1.5, { recoil: k.recoil });
}

// The kid standing at (x, y). bazooka: false draws empty arms instead (used by the cutscene).
function drawKidFigure(x, y, o = {}) {
  ellipse(x, y + 12, 26, 6, 'rgba(0,0,0,.3)');
  // legs + sneakers
  rr(x - 12, y - 14, 9, 24, 4, '#2b4fa8'); rr(x + 3, y - 14, 9, 24, 4, '#2b4fa8');
  rr(x - 16, y + 6, 15, 7, 3, '#ffffff'); rr(x + 1, y + 6, 15, 7, 3, '#ffffff');
  // hoodie
  rr(x - 18, y - 50, 36, 40, 12, '#ff4d6d');
  rr(x - 6, y - 32, 12, 8, 3, '#d93556');
  // head
  ellipse(x, y - 66, 18, 18, '#f6c49b');
  ctx.fillStyle = '#5a3420'; ctx.beginPath(); ctx.arc(x, y - 70, 18, Math.PI, 0); ctx.fill();
  rr(x - 2, y - 88, 26, 7, 3, '#ffd23f'); // cap brim
  ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(x, y - 78, 14, Math.PI, 0); ctx.fill();
  ellipse(x + 6, y - 66, 3, 3.5, '#1a1033'); ellipse(x + 13, y - 66, 3, 3.5, '#1a1033');
  ellipse(x + 7, y - 67, 1, 1, '#fff'); ellipse(x + 14, y - 67, 1, 1, '#fff');
  ctx.strokeStyle = '#1a1033'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x + 9, y - 59, 5, 0.2, Math.PI - 0.2); ctx.stroke();
  if (o.bazooka === false) { if (o.arms !== 'none') drawKidArms(x, y, o.arms); return; }
  // bazooka on shoulder
  rr(x - 30, y - 34, 92, 18, 7, '#4f8a3a');
  rr(x + 52, y - 37, 14, 24, 4, '#3d6d2c');
  rr(x - 34, y - 36, 10, 22, 3, '#3d6d2c');
  rr(x - 2, y - 18, 8, 14, 2, '#3d6d2c');
  ctx.fillStyle = '#ffd23f'; ctx.fillRect(x + 10, y - 31, 26, 4);
  // hand
  ellipse(x + 4, y - 20, 6, 6, '#f6c49b');
  // muzzle flash
  if (o.recoil > 4) {
    ctx.fillStyle = '#ffe066'; ctx.beginPath();
    for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5, r = i % 2 ? 8 : 18; ctx.lineTo(x + 74 + Math.cos(a) * r, y - 25 + Math.sin(a) * r); }
    ctx.fill();
  }
}

// Empty arms for the kid: 'hug' reaches forward, 'up' cheers, anything else hangs down.
function drawKidArms(x, y, pose) {
  const arm = (sx, sy, ex, ey) => {
    ctx.strokeStyle = '#ff4d6d'; ctx.lineWidth = 9; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
    ellipse(ex, ey, 5.5, 5.5, '#f6c49b');
  };
  if (pose === 'hug') { arm(x + 8, y - 44, x + 40, y - 50); arm(x - 10, y - 40, x + 36, y - 32); }
  else if (pose === 'up') { const w = Math.sin(game.t * 0.3) * 4; arm(x - 12, y - 44, x - 26, y - 76 + w); arm(x + 12, y - 44, x + 26, y - 76 - w); }
  else { arm(x - 12, y - 44, x - 18, y - 20); arm(x + 12, y - 44, x + 18, y - 20); }
}

function drawRocket(r) {
  const x = r.x, y = r.y;
  ctx.fillStyle = Math.random() < 0.5 ? '#ffd23f' : '#ff8a1f';
  ctx.beginPath(); ctx.moveTo(x - 14, y - 5); ctx.lineTo(x - 28 - Math.random() * 10, y); ctx.lineTo(x - 14, y + 5); ctx.fill();
  rr(x - 16, y - 6, 26, 12, 5, '#d8dbe8');
  ctx.fillStyle = '#ff4d6d'; ctx.beginPath(); ctx.moveTo(x + 10, y - 6); ctx.lineTo(x + 20, y); ctx.lineTo(x + 10, y + 6); ctx.fill();
  ctx.fillStyle = '#ff4d6d'; ctx.beginPath(); ctx.moveTo(x - 16, y - 6); ctx.lineTo(x - 20, y - 11); ctx.lineTo(x - 8, y - 6); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - 16, y + 6); ctx.lineTo(x - 20, y + 11); ctx.lineTo(x - 8, y + 6); ctx.fill();
}

function drawHUD() {
  rr(10, 10, 300, 40, 12, 'rgba(10,6,28,.6)');
  ctx.font = '600 20px Fredoka, system-ui, sans-serif'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  ctx.fillStyle = '#f3eefe'; ctx.fillText('Score ' + game.score, 22, 31);
  ctx.fillStyle = '#8cf25a'; ctx.fillText('Level ' + game.level, 150, 31);
  for (let i = 0; i < 3; i++) heart(254 + i * 22, 21, i < game.hearts);
  ctx.textAlign = 'right'; ctx.fillStyle = '#b7acd9'; ctx.font = '600 16px Fredoka, system-ui, sans-serif';
  ctx.fillText('Best ' + Math.max(best, game.score), W - 16, 31);
}

function render() {
  ctx.save();
  if (game.shake) ctx.translate((Math.random() - 0.5) * game.shake, (Math.random() - 0.5) * game.shake);
  drawBackground();
  drawSquad();
  // draw by lane so lower lanes overlap upper
  for (let lane = 0; lane < 3; lane++) {
    for (const m of game.monsters) if (m.lane === lane) DRAW[m.type](m.x, LANES[lane], m);
  }
  if (game.boss) drawBoss(game.boss);
  const r = game.rescue;
  if (r && r.phase === 'follow') drawRescue(r);
  if (!(game.kid.inv > 0 && Math.floor(game.kid.inv / 5) % 2)) drawKid();
  if (r && r.phase !== 'follow') drawRescue(r);
  drawLoves();
  for (const s of game.shots) drawShot(s);
  for (const r of game.rockets) drawRocket(r);
  for (const p of game.parts) { ctx.globalAlpha = Math.max(0, p.life / 60); ellipse(p.x, p.y, p.r, p.r, p.c); }
  ctx.globalAlpha = 1;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const t of game.texts) {
    ctx.globalAlpha = Math.min(1, t.life / 20);
    ctx.font = (t.big ? '64px' : '34px') + ' Creepster, Fredoka, system-ui';
    ctx.lineWidth = 6; ctx.strokeStyle = '#1a1033'; ctx.strokeText(t.s, t.x, t.y);
    ctx.fillStyle = t.bad ? '#ff4d6d' : t.big ? '#8cf25a' : '#ffd23f'; ctx.fillText(t.s, t.x, t.y);
  }
  ctx.globalAlpha = 1;
  ctx.restore();
  if (game.hurtFlash) { ctx.fillStyle = `rgba(255,77,109,${game.hurtFlash / 60})`; ctx.fillRect(0, 0, W, H); }
  drawHUD();
}
