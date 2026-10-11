// Reusable canvas drawing primitives.
function ellipse(x, y, rx, ry, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill(); }
function rr(x, y, w, h, r, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill(); }

function legs(xs, y, h, c, step) {
  xs.forEach((lx, i) => rr(lx, y - h + (i % 2 ? step : -step) * 0.3, 6, h, 3, c));
}

function heart(x, y, full) {
  ctx.fillStyle = full ? '#ff4d6d' : 'rgba(255,255,255,.15)';
  ctx.beginPath(); ctx.moveTo(x, y + 6);
  ctx.bezierCurveTo(x, y + 2, x - 10, y - 4, x - 10, y + 4);
  ctx.bezierCurveTo(x - 10, y + 10, x - 2, y + 14, x, y + 18);
  ctx.bezierCurveTo(x + 2, y + 14, x + 10, y + 10, x + 10, y + 4);
  ctx.bezierCurveTo(x + 10, y - 4, x, y + 2, x, y + 6); ctx.fill();
}

function drawBubble(x, y, text) {
  ctx.font = '700 13px Fredoka, system-ui, sans-serif';
  const w = ctx.measureText(text).width + 14;
  x = Math.max(w / 2 + 4, Math.min(W - w / 2 - 4, x));
  rr(x - w / 2, y - 22, w, 20, 8, '#ffffff');
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(x - 4, y - 3); ctx.lineTo(x, y + 4); ctx.lineTo(x + 4, y - 3); ctx.fill();
  ctx.fillStyle = '#1a1033'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, x, y - 11);
}
