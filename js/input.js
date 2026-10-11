// Keyboard, touch and button input.
addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if ([' ', 'arrowup', 'arrowdown'].includes(k) && e.target.tagName !== 'BUTTON') e.preventDefault();
  if (game.state === 'title' && (k === ' ' || k === 'enter') && e.target.tagName !== 'BUTTON') return start();
  if (k === 'arrowup' || k === 'w') move(-1);
  else if (k === 'arrowdown' || k === 's') move(1);
  else if ((k === ' ' || k === 'enter' || k === 'arrowright' || k === 'd') && game.state === 'play') { e.preventDefault(); fire(); }
  else if (k === 'p' || k === 'escape') pause(game.state === 'play');
  else if (k === 'm') setMuted(!A.muted);
});
const tap = (id, fn) => $(id).addEventListener('pointerdown', e => { e.preventDefault(); fn(); });
tap('tUp', () => move(-1)); tap('tDown', () => move(1)); tap('tFire', fire);
// tapping the game screen also fires; tapping above/below the kid changes lane
$('screen').addEventListener('pointerdown', e => {
  if (game.state !== 'play' || e.target !== canvas) return;
  const rect = canvas.getBoundingClientRect();
  const y = (e.clientY - rect.top) / rect.height * H;
  let lane = 0; LANES.forEach((ly, i) => { if (Math.abs(y - ly + 30) < Math.abs(y - LANES[lane] + 30)) lane = i; });
  if (lane !== game.kid.lane) game.kid.lane = lane; else fire();
});
$('startBtn').addEventListener('click', start);
$('againBtn').addEventListener('click', start);
$('resumeBtn').addEventListener('click', () => pause(false));
$('muteBtn').addEventListener('click', e => { setMuted(!A.muted); e.currentTarget.blur(); });
document.addEventListener('visibilitychange', () => { if (document.hidden && game.state === 'play') pause(true); });
