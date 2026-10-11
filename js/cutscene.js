// Ending cutscene: plays after the final boss. Every animal the kid rescued celebrates, plays together,
// runs home to their family, joins a giant feast and throws a thank-you party for the kid. Then: game over (you win!).
const ENDING_LEN = 32;               // seconds
const SCENE_CUTS = [6, 12, 18, 24];  // fade through black at each scene change
const CAPTIONS = [
  [0, 'The last evil boss is gone! You defeated the monsters!'],
  [3, 'All the animals you rescued come out to celebrate!'],
  [6, 'Everyone plays together in the sunshine.'],
  [12, 'Then each friend runs home to their family...'],
  [15, '...and gets the biggest welcome-home hug ever!'],
  [18, 'Time for a giant feast! NOM NOM NOM!'],
  [24, 'And then... a great big party for the hero who saved them!'],
  [28, 'THANK YOU for saving us from the evil monsters!'],
];
const FOOD = { 'German Shepherd': 'bowl', Kitten: 'fish', Bunny: 'carrot', Piglet: 'apple', Penguin: 'fish', 'Panda Cub': 'bamboo' };
const CONFETTI = ['#ff4d6d', '#ffd23f', '#8cf25a', '#4cc9f0', '#f15bb5', '#ffffff'];
const CHEERS = ['YAY!', 'HOORAY!', 'WOO-HOO!', 'THANK YOU!', 'HERO!'];
const CUES = [
  [0.2, () => sfx.level()],
  [3, () => cast().forEach((a, i) => setTimeout(() => sfx.animal(a.sound), i * 180))],
  [8, () => sfx.boing()], [9.5, () => sfx.boing()], [11, () => sfx.boing()],
  ...[0, 1, 2, 3, 4, 5].map(i => [12 + arrivalTime(i), () => { const a = cast()[i]; if (a) sfx.animal(a.sound); }]),
  ...[19, 19.8, 20.6, 21.4, 22.2, 23].map(t => [t, () => sfx.chomp()]),
  [24.3, () => sfx.level()],
  [28, () => { sfx.level(); cs.texts.push({ x: W / 2, y: 200, s: 'THANK YOU!', life: 140, big: true }); }],
].sort((a, b) => a[0] - b[0]);

const cs = { t: 0, cue: 0, caption: '', hearts: [], texts: [], confetti: [] };
const lerp = (a, b, k) => a + (b - a) * Math.max(0, Math.min(1, k));
const spread = (n, a, b) => Array.from({ length: n }, (_, i) => (n === 1 ? (a + b) / 2 : a + (b - a) * i / (n - 1)));
// the rescued animals, in the order they were saved
const cast = () => game.rescued.map(name => ANIMALS.find(a => a.name === name)).filter(Boolean);
function arrivalTime(i) { return 0.3 + i * 0.3 + 2.2; } // when animal i reaches its family in the "go home" scene

function startEnding() {
  game.state = 'cutscene';
  game.texts = []; game.loves = [];
  Object.assign(cs, { t: 0, cue: 0, caption: '', hearts: [], texts: [], confetti: [] });
  cheerAll();
  $('skipBtn').hidden = false;
}

function endEnding() {
  if (game.state !== 'cutscene') return;
  $('skipBtn').hidden = true;
  $('csCaption').textContent = '';
  gameOver(true);
}

function updateCutscene(f) {
  const prev = cs.t;
  cs.t += f / 60;
  const t = cs.t, every = p => Math.floor(t / p) !== Math.floor(prev / p), n = cast().length;
  while (cs.cue < CUES.length && CUES[cs.cue][0] <= t) CUES[cs.cue++][1]();
  const caption = CAPTIONS.filter(c => c[0] <= t).pop()[1];
  if (caption !== cs.caption) { cs.caption = caption; $('csCaption').textContent = caption; }

  const partying = t < 6 || t > 24;
  if (partying && !reduceMotion) for (let i = 0; i < 2; i++) if (Math.random() < 0.6 * f) {
    cs.confetti.push({ x: Math.random() * W, y: -10, vy: 1.5 + Math.random() * 1.5, sway: Math.random() * 6, c: CONFETTI[Math.floor(Math.random() * CONFETTI.length)], r: Math.random() * 6 });
  }
  if (partying && every(0.6)) cs.texts.push({ x: 120 + Math.random() * 560, y: 250, s: CHEERS[Math.floor(Math.random() * CHEERS.length)], life: 40 });
  if (t > 24 && every(0.3)) cs.hearts.push({ x: 370 + Math.random() * 60, y: 270, life: 60 });
  if (t > 12 && t < 18) {
    const slots = spread(n, 90, 710);
    slots.forEach((x, i) => { if (t - 12 > arrivalTime(i) && every(0.45)) cs.hearts.push({ x: x - 10 + Math.random() * 20, y: 300, life: 50 }); });
  }
  if (t > 18.5 && t < 24 && every(0.9)) cs.texts.push({ x: 100 + Math.random() * 600, y: 290, s: 'NOM NOM!', life: 40 });

  for (const h of cs.hearts) { h.y -= 0.9 * f; h.x += Math.sin(h.life * 0.2) * 0.5; h.life -= f; }
  for (const p of cs.texts) { p.y -= 0.7 * f; p.life -= f; }
  for (const c of cs.confetti) { c.y += c.vy * f; c.r += 0.1 * f; }
  cs.hearts = cs.hearts.filter(h => h.life > 0);
  cs.texts = cs.texts.filter(p => p.life > 0);
  cs.confetti = cs.confetti.filter(c => c.y < H + 10);
  if (t >= ENDING_LEN) endEnding();
}

function drawCutscene() {
  const t = cs.t;
  if (t < 6) sceneVictory(t);
  else if (t < 12) scenePlay(t - 6);
  else if (t < 18) sceneGoHome(t - 12);
  else if (t < 24) sceneFeast(t - 18);
  else sceneParty(t - 24);
  drawCutsceneEffects();
  drawCaption(cs.caption);
  let fade = Math.max(0, 1 - t / 0.5, 1 - (ENDING_LEN - t) / 0.5);
  for (const c of SCENE_CUTS) fade = Math.max(fade, 1 - Math.abs(t - c) / 0.35);
  if (fade > 0) { ctx.fillStyle = `rgba(10,6,28,${Math.min(1, fade)})`; ctx.fillRect(0, 0, W, H); }
}

// ---------- Scenes (t = seconds since the scene started) ----------
// Animals bounce around the cheering kid: the left group faces right, the right group faces left.
function drawCheeringCrowd(y) {
  const animals = cast(), half = Math.ceil(animals.length / 2);
  const left = spread(half, 110, 300), right = spread(animals.length - half, 500, 690);
  drawKidFigure(400, y, { bazooka: false, arms: 'up' });
  animals.forEach((a, i) => {
    const x = i < half ? left[i] : right[i - half];
    const hop = Math.abs(Math.sin(game.t * 0.14 + i * 0.9)) * 22;
    csAnimal(a, x, y + 15 - hop, { face: i < half ? 'right' : 'left', happy: true, shadowY: y + 15 });
  });
}

function sceneVictory(t) {
  drawBackground(); drawSquad();
  drawCheeringCrowd(345);
}

function scenePlay(t) {
  drawHomeBackdrop({});
  const animals = cast(), base = spread(animals.length, 120, 680), y = 370;
  drawKidFigure(400, 340, { bazooka: false, arms: t % 2 < 1 ? 'up' : 'down' });
  animals.forEach((a, i) => {
    // everyone scampers back and forth; some hop for joy
    const k = game.t * 0.03 + i * 1.7, x = base[i] + Math.sin(k) * 45;
    const hop = i % 2 ? Math.abs(Math.sin(game.t * 0.15 + i)) * 16 : 0;
    csAnimal(a, x, y - hop, { face: Math.cos(k) > 0 ? 'right' : 'left', moving: true, happy: true, shadowY: y });
  });
  // a ball bouncing back and forth over everyone
  const leg = Math.floor(t / 1.5), k = t / 1.5 - leg, from = leg % 2 ? 680 : 120;
  const bx = lerp(from, 800 - from, k), by = y - 50 - Math.sin(k * Math.PI) * 150;
  ellipse(bx, y + 2, 9, 3, 'rgba(0,0,0,.2)');
  ellipse(bx, by, 10, 10, '#ffd23f');
  ctx.strokeStyle = '#e0a800'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(bx, by, 10, 0.6, 2.6); ctx.stroke();
}

function sceneGoHome(t) {
  const animals = cast(), slots = spread(animals.length, 90, 710), y = 372;
  drawHomeBackdrop({ houses: slots });
  animals.forEach((a, i) => {
    const x = slots[i], arrived = t > arrivalTime(i);
    const hop = arrived ? Math.abs(Math.sin(game.t * 0.16 + i)) * 10 : 0;
    // mom or dad waits in front of home; the rescued one races in from the left
    csAnimal(a, x + 26, y - (arrived ? hop : 0), { scale: 1.15, happy: true, lick: arrived, shadowY: y });
    const runX = lerp(-60, x - 24, (t - 0.3 - i * 0.3) / 2.2);
    csAnimal(a, runX, y - hop, { scale: 0.8, face: 'right', moving: !arrived, happy: true, shadowY: y });
  });
}

function sceneFeast(t) {
  drawHomeBackdrop({});
  // a big checkered picnic blanket
  for (let r = 0; r < 4; r++) for (let c = 0; c < 20; c++) {
    ctx.fillStyle = (r + c) % 2 ? '#ffffff' : '#e8505b';
    ctx.fillRect(40 + c * 36, 320 + r * 18, 36, 18);
  }
  const animals = cast(), half = Math.ceil(animals.length / 2);
  const left = spread(half, 90, 270), right = spread(animals.length - half, 530, 710), y = 375;
  drawKidFigure(400, 325, { bazooka: false, arms: 'up' });
  drawCake(400, 372);
  animals.forEach((a, i) => {
    const x = i < half ? left[i] : right[i - half], face = i < half ? 'right' : 'left';
    drawFood(FOOD[a.name], x + (face === 'right' ? 42 : -42), y, 1 - t / 6);
    const munch = Math.abs(Math.sin(game.t * 0.25 + i)) * 0.12;
    csAnimal(a, x, y, { face, happy: true, tilt: -0.2 - munch, pivot: -12 });
  });
}

function sceneParty(t) {
  drawHomeBackdrop({ night: true });
  // the plane flies over with a special banner
  drawBombardiro({ x: lerp(W + 60, -420, t / 8), y: 160, text: 'THANK YOU, BLASTER!' });
  drawCheeringCrowd(350);
}

// ---------- Cutscene drawing helpers ----------
// Animal `a` at (x, y). face: 'right' mirrors it; tilt rotates it around a point `pivot` px from its middle.
function csAnimal(a, x, y, o = {}) {
  const s = o.scale || 1, p = o.pivot || 0;
  ellipse(x, (o.shadowY ?? y) + 2, 24 * s, 4 * s, 'rgba(0,0,0,.25)');
  ctx.save(); ctx.translate(x, y);
  if (o.face === 'right') ctx.scale(-1, 1);
  ctx.scale(s, s);
  ctx.translate(p, 0); if (o.tilt) ctx.rotate(o.tilt); ctx.translate(-p, 0);
  a.draw(0, 0, { moving: o.moving, happy: o.happy, lick: o.lick && a.licks });
  ctx.restore();
}

function drawFood(kind, x, y, left) {
  left = Math.max(0.2, left);
  if (kind === 'bowl') {
    ellipse(x, y - 10, 18, 6 * left + 1, '#a0612e');
    ctx.fillStyle = '#d93556'; ctx.beginPath(); ctx.moveTo(x - 20, y - 10); ctx.lineTo(x + 20, y - 10); ctx.lineTo(x + 15, y + 2); ctx.lineTo(x - 15, y + 2); ctx.fill();
  } else if (kind === 'fish') {
    const w = 16 * left + 4;
    ellipse(x, y - 4, w, 6, '#7fb3d5');
    ctx.fillStyle = '#7fb3d5'; ctx.beginPath(); ctx.moveTo(x + w - 2, y - 4); ctx.lineTo(x + w + 9, y - 11); ctx.lineTo(x + w + 9, y + 3); ctx.fill();
    ellipse(x - w + 6, y - 6, 1.6, 1.6, '#1a1033');
  } else if (kind === 'carrot') {
    const len = 26 * left + 6;
    ctx.fillStyle = '#ff8a1f'; ctx.beginPath(); ctx.moveTo(x - len / 2, y - 9); ctx.lineTo(x + len / 2, y - 4); ctx.lineTo(x - len / 2, y + 1); ctx.fill();
    ctx.fillStyle = '#5dbb3a'; ctx.beginPath(); ctx.moveTo(x - len / 2, y - 4); ctx.lineTo(x - len / 2 - 10, y - 12); ctx.lineTo(x - len / 2 - 8, y + 2); ctx.fill();
  } else if (kind === 'apple') {
    ellipse(x, y - 9, 10 * left + 3, 10 * left + 3, '#e63946');
    rr(x - 1, y - 24 + (1 - left) * 8, 3, 7, 1, '#6b3d1f');
  } else {
    for (const dx of [-6, 0, 6]) rr(x + dx - 2, y - 34 * left - 6, 5, 34 * left + 6, 2, '#5dbb3a');
    ellipse(x + 8, y - 30 * left, 7, 3, '#8cf25a');
  }
}

function drawCake(x, y) {
  rr(x - 52, y - 30, 104, 30, 6, '#f7a8c0');
  rr(x - 36, y - 56, 72, 28, 6, '#fff3e6');
  for (let i = 0; i < 7; i++) ellipse(x - 45 + i * 15, y - 30, 7, 5, '#ff6fae');
  ctx.font = '700 13px Fredoka, system-ui, sans-serif'; ctx.fillStyle = '#d93556';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('HERO', x, y - 42);
  for (const dx of [-20, 0, 20]) {
    rr(x + dx - 2, y - 72, 5, 16, 2, '#4cc9f0');
    ellipse(x + dx + 0.5, y - 77 + Math.sin(game.t * 0.4 + dx) * 1.2, 3, 5, '#ffd23f');
  }
}

function drawHomeBackdrop(o) {
  const g = ctx.createLinearGradient(0, 0, 0, 300);
  if (o.night) { g.addColorStop(0, '#120b2e'); g.addColorStop(1, '#4a2a7a'); }
  else { g.addColorStop(0, '#5b3c9e'); g.addColorStop(0.55, '#ff7e9a'); g.addColorStop(1, '#ffc078'); }
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, 300);
  if (o.night) for (const s of stars) { ctx.globalAlpha = 0.5 + 0.5 * Math.sin(game.t * 0.05 + s.p); ellipse(s.x, s.y, s.r, s.r, '#fff7d6'); }
  else { ellipse(150, 215, 48, 48, 'rgba(255,240,180,.35)'); ellipse(150, 215, 34, 34, '#fff1b8'); } // setting sun
  ctx.globalAlpha = 1;
  ctx.fillStyle = o.night ? '#2c5e3a' : '#4f9a5a';
  ctx.beginPath(); ctx.moveTo(0, 300);
  for (let x = 0; x <= W; x += 40) ctx.lineTo(x, 245 + Math.sin(x * 0.01) * 16);
  ctx.lineTo(W, 300); ctx.fill();
  // little family homes along the hill
  (o.houses || []).forEach((hx, i) => {
    const c = ['#d9534f', '#4cc9f0', '#ffd23f', '#9b5de5', '#f15bb5', '#5dbb3a'][i % 6];
    rr(hx - 34, 206, 68, 52, 4, c);
    ctx.fillStyle = '#7a2e2b'; ctx.beginPath(); ctx.moveTo(hx - 42, 210); ctx.lineTo(hx, 178); ctx.lineTo(hx + 42, 210); ctx.fill();
    ctx.fillStyle = '#3a1c1a'; ctx.beginPath(); ctx.roundRect(hx - 11, 232, 22, 26, [11, 11, 0, 0]); ctx.fill();
    rr(hx + 14, 218, 12, 12, 2, '#fff1b8');
  });
  ctx.fillStyle = o.night ? '#3f8a4a' : '#5dbb63'; ctx.fillRect(0, 290, W, H - 290);
  // picket fence
  ctx.fillStyle = o.night ? '#b8a6c8' : '#f0dcc8'; ctx.fillRect(0, 258, W, 6); ctx.fillRect(0, 280, W, 6);
  for (let x = 0; x < W; x += 26) rr(x + 4, 244, 14, 52, 5, o.night ? '#d6c8e4' : '#fff3e6');
  if (o.night) drawPartyDecor();
}

function drawPartyDecor() {
  // string lights swooping across the top
  for (let s = 0; s < 2; s++) {
    const x0 = s * 400;
    ctx.strokeStyle = '#2c2358'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x0, 20); ctx.quadraticCurveTo(x0 + 200, 90, x0 + 400, 20); ctx.stroke();
    for (let i = 1; i < 12; i++) {
      const k = i / 12, x = x0 + 400 * k, y = 20 + 2 * k * (1 - k) * 70;
      const on = Math.floor(game.t * 0.08 + i + s) % 2;
      ellipse(x, y + 5, 5, 6, on ? CONFETTI[i % 5] : 'rgba(255,255,255,.25)');
    }
  }
  // the big thank-you banner
  rr(250, 92, 300, 44, 10, '#ff4d6d');
  ctx.font = '30px Creepster, Fredoka, system-ui'; ctx.fillStyle = '#fff';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('THANK YOU, HERO!', 400, 115);
  // balloons bobbing on both sides
  [[60, '#ffd23f'], [110, '#4cc9f0'], [690, '#f15bb5'], [740, '#8cf25a']].forEach(([bx, c], i) => {
    const by = 190 + Math.sin(game.t * 0.05 + i) * 8;
    ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(bx, by + 24); ctx.lineTo(bx + 4, by + 80); ctx.stroke();
    ellipse(bx, by, 18, 23, c); ellipse(bx - 6, by - 8, 4, 6, 'rgba(255,255,255,.5)');
  });
}

function drawCutsceneEffects() {
  for (const c of cs.confetti) {
    ctx.save(); ctx.translate(c.x + Math.sin(c.r) * c.sway, c.y); ctx.rotate(c.r);
    ctx.fillStyle = c.c; ctx.fillRect(-4, -2, 8, 4); ctx.restore();
  }
  for (const h of cs.hearts) {
    ctx.save(); ctx.globalAlpha = Math.min(1, h.life / 25);
    ctx.translate(h.x, h.y); ctx.scale(0.8, 0.8); heart(0, 0, true);
    ctx.restore();
  }
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const p of cs.texts) {
    ctx.globalAlpha = Math.min(1, p.life / 20);
    ctx.font = (p.big ? '80px' : '30px') + ' Creepster, Fredoka, system-ui';
    ctx.lineWidth = 6; ctx.strokeStyle = '#1a1033'; ctx.strokeText(p.s, p.x, p.y);
    ctx.fillStyle = p.big ? '#8cf25a' : '#ffd23f'; ctx.fillText(p.s, p.x, p.y);
  }
  ctx.globalAlpha = 1;
}

function drawCaption(text) {
  ctx.font = '600 19px Fredoka, system-ui, sans-serif';
  const w = Math.min(W - 40, ctx.measureText(text).width + 36);
  rr(W / 2 - w / 2, H - 52, w, 38, 12, 'rgba(10,6,28,.78)');
  ctx.fillStyle = '#f3eefe'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, W / 2, H - 32);
}
