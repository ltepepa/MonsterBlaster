// Boss fights: spawning, behaviour, hits and drawing.
const BOSS_HP = 10;
const BOSS_Y_MIN = LANES[0] - 35, BOSS_Y_MAX = LANES[2] - 35;
const BOSS_LOOKS = [
  { name: 'GRUBBLOTT', body: '#8a7aa0', belly: '#c3b6d3', shade: '#5e4f75' },
  { name: 'MOTHER MAGGOT', body: '#7f9a6c', belly: '#c4d6b2', shade: '#55704a' },
  { name: 'THE GUZZLER', body: '#a87482', belly: '#dcb5bc', shade: '#784955' },
];

function startBoss() {
  for (const m of game.monsters) burst(m.x, LANES[m.lane] - 20, ['#b7acd9', '#ffffff'], 10);
  game.monsters = [];
  game.boss = {
    x: W + 130, y: LANES[1] - 35, dir: Math.random() < 0.5 ? -1 : 1, hp: BOSS_HP, hit: 0, mouth: 0,
    cool: 90, entering: true, dying: 0, blink: 0, look: BOSS_LOOKS[(game.level - 1) % BOSS_LOOKS.length],
    speed: 1.3 + game.level * 0.25,
  };
  game.texts.push({ x: W / 2, y: 230, s: 'BOSS FIGHT!', life: 110, big: true, bad: true });
  sfx.roar();
  SQUAD.forEach((c, i) => say(c, ['Mamma mia!', 'So BIG!', 'Eek! Eek!'][i]));
}

function bossShoot(b) {
  b.mouth = 22; sfx.blorp();
  const speed = 4 + game.level * 0.5;
  const spread = game.level >= 2 && Math.random() < 0.35 ? [-1.1, 0, 1.1] : [0];
  for (const vy of spread) game.shots.push({ x: b.x - 52, y: b.y + 18, vx: -speed, vy, t: 0 });
  b.cool = Math.max(45, 110 - game.level * 12) * (0.8 + Math.random() * 0.4);
}

function updateBoss(f) {
  const b = game.boss, k = game.kid;
  b.hit = Math.max(0, b.hit - f); b.mouth = Math.max(0, b.mouth - f);
  b.blink = b.blink > 0 ? b.blink - f : (Math.random() < 0.01 ? 8 : 0);
  if (b.dying) {
    b.dying -= f;
    if (Math.floor(b.dying) % 8 === 0) {
      burst(b.x + (Math.random() - 0.5) * 140, b.y + (Math.random() - 0.5) * 120, [b.look.body, b.look.belly, '#8cf25a', '#ffe066'], 14);
      sfx.boom();
    }
    if (b.dying <= 0) defeatBoss();
    return;
  }
  if (b.entering) {
    b.x -= 2.2 * f;
    if (b.x <= 655) { b.x = 655; b.entering = false; }
    return;
  }
  // only moves up and down
  b.y += b.dir * b.speed * f;
  if (b.y < BOSS_Y_MIN) { b.y = BOSS_Y_MIN; b.dir = 1; }
  if (b.y > BOSS_Y_MAX) { b.y = BOSS_Y_MAX; b.dir = -1; }
  if (Math.random() < 0.006 * f) b.dir *= -1;
  b.cool -= f;
  if (b.cool <= 0) bossShoot(b);
}

function hitBoss(r) {
  const b = game.boss;
  r.dead = true; b.hp--; b.hit = 14;
  burst(r.x, r.y, ['#ffe066', '#ffffff', b.look.belly], 12);
  game.shake = reduceMotion ? 0 : 6; sfx.squish();
  game.texts.push({ x: b.x - 40, y: b.y - 60, s: ['SPLAT!', 'OUCH!', 'BLORP!', 'WHAM!'][b.hp % 4], life: 40 });
  if (b.hp % 3 === 0) cheer(1);
  if (b.hp <= 0) { b.dying = 90; game.shots = []; sfx.roar(); }
}

function defeatBoss() {
  const b = game.boss;
  burst(b.x, b.y, [b.look.body, b.look.belly, '#8cf25a', '#ffe066', '#ff4d6d'], 60);
  game.boss = null; game.shake = reduceMotion ? 0 : 18;
  game.score += 100; game.level++;
  game.goal = game.score + 120 + (game.level - 1) * 30;
  sfx.level(); cheerAll();
  game.texts.push({ x: W / 2, y: 200, s: 'BOSS DEFEATED! +100', life: 100, big: true });
  // the boss had a trapped animal inside: free it
  const a = ANIMALS[game.rescued.length % ANIMALS.length];
  game.rescue = { a, x: b.x, y: Math.min(LANES[2], b.y + 60), t: 0, phase: 'pop', hop: 0 };
  game.texts.push({ x: b.x, y: b.y - 40, s: 'RESCUED!', life: 70 });
}

function drawBoss(b) {
  const L = b.look, k = game.kid;
  const x = b.x + (b.dying ? (Math.random() - 0.5) * 12 : 0), y = b.y;
  const j = Math.sin(game.t * 0.12) * 0.035 + (b.hit ? Math.sin(b.hit * 1.3) * 0.08 : 0);
  ctx.save(); ctx.translate(x, y); ctx.scale(1.18 * (1 + j), 1.12 * (1 - j));
  // tiny useless bat wings
  const flap = Math.sin(game.t * 0.5) * 12;
  ctx.fillStyle = '#3b2a4f';
  for (const s of [-1, 1]) {
    ctx.beginPath(); ctx.moveTo(s * 30, -50);
    ctx.lineTo(s * 70, -95 - flap); ctx.lineTo(s * 62, -72 - flap / 2); ctx.lineTo(s * 80, -70 - flap);
    ctx.lineTo(s * 55, -45); ctx.closePath(); ctx.fill();
  }
  // stubby arms and feet
  ellipse(-80, 18, 16, 11, L.shade); ellipse(80, 18, 16, 11, L.shade);
  ellipse(-34, 70, 18, 9, L.shade); ellipse(34, 70, 18, 9, L.shade);
  // the huge fat body
  ellipse(0, 0, 86, 74, L.body);
  ellipse(10, 20, 62, 48, L.belly);
  // fat rolls
  ctx.strokeStyle = L.shade; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(0, 24, 80, Math.PI * 1.18, Math.PI * 1.82); ctx.stroke();
  ctx.beginPath(); ctx.arc(10, 40, 62, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke();
  ctx.beginPath(); ctx.arc(10, 56, 50, Math.PI * 0.2, Math.PI * 0.8); ctx.stroke();
  // stitched scar and belly button
  ctx.strokeStyle = '#4a2a3a'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(34, -2); ctx.lineTo(46, 50); ctx.stroke();
  for (let i = 0; i < 5; i++) { const sy = 4 + i * 10, sx = 35 + i * 2.4; ctx.beginPath(); ctx.moveTo(sx - 6, sy); ctx.lineTo(sx + 6, sy + 2); ctx.stroke(); }
  ellipse(18, 44, 4, 6, L.shade);
  // lots of eyes, all staring at the kid
  const look = Math.max(-1, Math.min(1, (k.y - 35 - y) / 80));
  const eyes = [[-14, -40, 16], [-48, -26, 8], [18, -52, 10], [40, -30, 6], [-36, -54, 5]];
  for (const [ex, ey, r] of eyes) {
    ellipse(ex, ey, r, r, '#f4f0d0');
    if (b.blink > 0 || b.dying) { ctx.fillStyle = L.shade; ctx.fillRect(ex - r, ey - r, r * 2, r * 2); continue; }
    ellipse(ex - r * 0.35, ey + look * r * 0.35, r * 0.6, r * 0.6, '#d62828');
    ellipse(ex - r * 0.45, ey + look * r * 0.35, r * 0.28, r * 0.42, '#120a0a');
  }
  // giant drooling mouth with crooked teeth
  const open = b.mouth ? 26 : 12;
  const mx = -34, my = 16;
  ctx.fillStyle = '#4a0f1c';
  ctx.beginPath(); ctx.ellipse(mx, my, 40, open, -0.08, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#f2e6b0';
  for (let i = 0; i < 7; i++) {
    const tx = mx - 32 + i * 10, h = 7 + (i * 7) % 5;
    ctx.beginPath(); ctx.moveTo(tx - 4, my - open + 4); ctx.lineTo(tx, my - open + 4 + h); ctx.lineTo(tx + 4, my - open + 4); ctx.fill();
    if (i % 2) { ctx.beginPath(); ctx.moveTo(tx - 3, my + open - 3); ctx.lineTo(tx + 1, my + open - 3 - h * 0.7); ctx.lineTo(tx + 4, my + open - 3); ctx.fill(); }
  }
  const drip = (game.t * 0.6) % 30;
  ctx.fillStyle = '#9bea6a';
  ctx.fillRect(mx - 18, my + open - 2, 4, 6 + drip);
  ellipse(mx - 16, my + open + 6 + drip, 4, 5, '#9bea6a');
  if (b.hit) { ctx.globalAlpha = b.hit / 20; ellipse(0, 0, 86, 74, '#ffffff'); ctx.globalAlpha = 1; }
  ctx.restore();

  // name and 10-hit health bar above the boss
  if (!b.entering) {
    const bw = 220, bx = b.x - bw / 2, by = Math.max(14, b.y - 128);
    rr(bx - 6, by - 4, bw + 12, 36, 10, 'rgba(10,6,28,.75)');
    ctx.font = '15px Creepster, Fredoka, system-ui'; ctx.fillStyle = '#ff4d6d';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(L.name, b.x, by + 7);
    for (let i = 0; i < BOSS_HP; i++) rr(bx + i * 22 + 1, by + 16, 20, 9, 3, i < b.hp ? '#8cf25a' : 'rgba(255,255,255,.15)');
  }
}

function drawShot(s) {
  for (let i = 1; i <= 3; i++) ellipse(s.x + i * 9, s.y - s.vy * i * 2, 5 - i, 5 - i, 'rgba(155,234,106,.6)');
  const wob = Math.sin(s.t * 0.5) * 1.5;
  ellipse(s.x, s.y, 13 + wob, 13 - wob, '#9bea6a');
  ellipse(s.x - 4, s.y - 3, 3, 4, '#2d5a12'); ellipse(s.x + 4, s.y - 3, 3, 4, '#2d5a12');
  ctx.fillStyle = '#2d5a12'; ctx.fillRect(s.x - 5, s.y + 4, 10, 2);
}
