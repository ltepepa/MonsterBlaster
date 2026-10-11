// Entry point: seeds the title screen and runs the game loop. Load this script last.
// Title screen shows a few monsters parading for the still frame
function seedTitle() {
  game.monsters = [
    { type: 'ghost', lane: 0, x: 520, hp: 1, speed: 0, phase: 0, hit: 0 },
    { type: 'bat', lane: 1, x: 660, hp: 1, speed: 0, phase: 1, hit: 0 },
    { type: 'zombie', lane: 2, x: 600, hp: 2, speed: 0, phase: 2, hit: 0 },
    { type: 'pumpkin', lane: 1, x: 420, hp: 1, speed: 0, phase: 0.5, hit: 0 },
  ];
}
seedTitle();

let last = performance.now();
function loop(now) {
  const f = Math.min(3, (now - last) / 16.67); last = now;
  if (game.state !== 'pause') updateSquad(f);
  if (game.state === 'play') update(f);
  else if (game.state === 'title') { game.t += f; for (const m of game.monsters) m.phase += 0.05 * f; }
  else if (game.state === 'cutscene') { game.t += f; updateCutscene(f); }
  if (game.state === 'cutscene') drawCutscene(); else render();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
