// Game flow (start, pause, game over), player actions and the per-frame update.
function start() {
  initAudio(); reset();
  if (document.activeElement) document.activeElement.blur();
  game.state = 'play';
  $('startOverlay').hidden = true; $('overOverlay').hidden = true; $('pauseOverlay').hidden = true;
  A.step = 0; A.prevMel = null; startMusic();
}
function pause(p) {
  if (game.state !== 'play' && game.state !== 'pause') return;
  game.state = p ? 'pause' : 'play';
  $('pauseOverlay').hidden = !p;
  if (p) stopMusic(); else startMusic();
}
function gameOver(won = false) {
  game.state = 'over'; stopMusic();
  if (won) sfx.level(); else sfx.over();
  const newBest = game.score > best;
  if (newBest) { best = game.score; try { localStorage.setItem('mb-best', best); } catch (e) {} }
  $('overTitle').textContent = won ? 'Game Over: You Win!' : 'The monsters got by!';
  $('overText').textContent = (won ? `You beat all ${FINAL_LEVEL} levels and saved every animal from the evil monsters! You scored ${game.score} points.`
    : `You scored ${game.score} points and reached level ${game.level}.`) + (newBest ? ' That is a new best score!' : ` Best: ${best}.`)
    + (game.rescued.length && !won ? ` Animals you rescued: ${game.rescued.join(', ')}.` : '');
  $('overOverlay').hidden = false;
  setTimeout(() => $('againBtn').focus(), 50);
}

function move(d) {
  if (game.state !== 'play') return;
  game.kid.lane = Math.max(0, Math.min(2, game.kid.lane + d));
}
function fire() {
  if (game.state !== 'play' || game.kid.cool > 0) return;
  game.kid.cool = 14; game.kid.recoil = 8;
  game.rockets.push({ x: KID_X + 62, lane: game.kid.lane, y: LANES[game.kid.lane] - 22 });
  sfx.shoot();
}

function burst(x, y, colors, n = 22) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, s = 2 + Math.random() * 5;
    game.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1, life: 40 + Math.random() * 20, c: colors[i % colors.length], r: 3 + Math.random() * 5 });
  }
}

function hurtKid(y, word) {
  const k = game.kid;
  if (k.inv > 0) return;
  k.inv = 70; game.hearts--; game.hurtFlash = 20; game.shake = reduceMotion ? 0 : 14; sfx.hurt(); aww();
  game.texts.push({ x: KID_X + 40, y: y - 70, s: word, life: 50, bad: true });
  if (game.hearts <= 0) gameOver();
}

// ---------- Update ----------
function update(f) {
  game.t += f;
  const k = game.kid;
  k.y += (LANES[k.lane] - k.y) * Math.min(1, 0.3 * f);
  k.cool = Math.max(0, k.cool - f); k.recoil = Math.max(0, k.recoil - f); k.inv = Math.max(0, k.inv - f);
  game.shake = Math.max(0, game.shake - f); game.hurtFlash = Math.max(0, game.hurtFlash - f);

  updateRescue(f);
  const rescuing = game.rescue && game.rescue.phase !== 'follow';
  if (game.boss) updateBoss(f);
  else if (game.ending) { if ((game.ending -= f) <= 0) startEnding(); }
  else if (!rescuing && (game.spawn -= f) <= 0) {
    spawnMonster();
    game.spawn = Math.max(42, 115 - game.level * 9) * (0.7 + Math.random() * 0.6);
  }

  for (const r of game.rockets) r.x += 10 * f;
  // boss slime balls
  for (const s of game.shots) {
    s.x += s.vx * f; s.y += s.vy * f; s.t += f;
    if (s.y < BOSS_Y_MIN || s.y > BOSS_Y_MAX + 30) s.vy *= -1;
    for (const r of game.rockets) {
      if (!r.dead && !s.dead && Math.abs(r.x - s.x) < 18 && Math.abs(r.y - s.y) < 22) {
        r.dead = s.dead = true; burst(s.x, s.y, ['#8cf25a', '#4f9a3a'], 10); sfx.clang();
      }
    }
    if (!s.dead && s.x < KID_X + 35 && s.x > KID_X - 25 && Math.abs(s.y - (k.y - 35)) < 38) {
      s.dead = true; burst(s.x, s.y, ['#8cf25a', '#4f9a3a'], 14); hurtKid(k.y, 'SLIMED!');
    }
  }
  const b = game.boss;
  if (b && !b.entering && !b.dying) {
    for (const r of game.rockets) {
      if (!r.dead && r.x > b.x - 92 && r.y > b.y - 80 && r.y < b.y + 76) hitBoss(r);
    }
  }
  for (const m of game.monsters) { m.x -= m.speed * f; m.phase += 0.08 * f; m.hit = Math.max(0, m.hit - f); }

  for (const r of game.rockets) {
    for (const m of game.monsters) {
      if (r.dead || m.dead || r.lane !== m.lane) continue;
      if (Math.abs(r.x - m.x) < TYPES[m.type].r + 8) {
        r.dead = true; m.hp--; m.hit = 10;
        const my = LANES[m.lane] - 20;
        if (m.hp <= 0) {
          m.dead = true;
          game.score += TYPES[m.type].pts;
          burst(m.x, my, COLORS[m.type]);
          game.texts.push({ x: m.x, y: my - 30, s: WORDS[Math.floor(Math.random() * WORDS.length)], life: 45 });
          game.shake = reduceMotion ? 0 : 8; sfx.boom(); sfx.monsterHit(m.type, true); cheer(m.type === 'zombie' ? 2 : 1);
          if (!game.boss && game.score >= game.goal) startBoss();
        } else {
          m.x += 18; burst(r.x, my, ['#ffe066', '#ffffff'], 8); sfx.clang(); sfx.monsterHit(m.type, false);
        }
      }
    }
  }

  for (const m of game.monsters) {
    if (!m.dead && m.x < KID_X + 30) {
      m.dead = true;
      if (game.kid.inv > 0) burst(m.x, LANES[m.lane] - 20, ['#b7acd9', '#ffffff'], 10);
      else hurtKid(LANES[m.lane], 'BOO!');
    }
  }

  for (const p of game.parts) { p.x += p.vx * f; p.y += p.vy * f; p.vy += 0.15 * f; p.life -= f; }
  for (const t of game.texts) { t.y -= 0.7 * f; t.life -= f; }

  game.rockets = game.rockets.filter(r => !r.dead && r.x < W + 40);
  game.shots = game.shots.filter(s => !s.dead && s.x > -30);
  game.monsters = game.monsters.filter(m => !m.dead);
  game.parts = game.parts.filter(p => p.life > 0);
  game.texts = game.texts.filter(t => t.life > 0);
}
