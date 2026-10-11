// Audio: spooky synth music + sound effects (Web Audio API).
const A = { ctx: null, muted: false, timer: null, step: 0, next: 0, prevMel: null };
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

function initAudio() {
  if (A.ctx) { A.ctx.resume(); return; }
  const C = new (window.AudioContext || window.webkitAudioContext)();
  A.ctx = C;
  A.master = C.createGain(); A.master.gain.value = 0.8; A.master.connect(C.destination);
  A.music = C.createGain(); A.music.gain.value = 0.32; A.music.connect(A.master);
  A.sfx = C.createGain(); A.sfx.gain.value = 0.55; A.sfx.connect(A.master);
  // spooky echo for the melody
  const d = C.createDelay(1); d.delayTime.value = 0.3;
  const fb = C.createGain(); fb.gain.value = 0.35;
  A.echo = C.createGain(); A.echo.gain.value = 0.6;
  A.echo.connect(d); d.connect(fb); fb.connect(d); d.connect(A.music);
  // noise buffer for drums and explosions
  const len = C.sampleRate;
  A.noise = C.createBuffer(1, len, C.sampleRate);
  const data = A.noise.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
}

function env(g, t, vol, a, dur) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
}
function osc(type, freq, t, dur, vol, dest, a = 0.01) {
  const C = A.ctx, o = C.createOscillator(), g = C.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  env(g, t, vol, a, dur); o.connect(g); g.connect(dest);
  o.start(t); o.stop(t + dur + 0.05);
  return o;
}
function noise(t, dur, vol, dest, freq = 8000, type = 'highpass') {
  const C = A.ctx, s = C.createBufferSource(), f = C.createBiquadFilter(), g = C.createGain();
  s.buffer = A.noise; f.type = type; f.frequency.value = freq;
  env(g, t, vol, 0.005, dur); s.connect(f); f.connect(g); g.connect(dest);
  s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05);
  return f;
}

// 4-bar loop in A minor: Am - F - Dm - E (spooky harmonic minor)
const CHORDS = [[57, 60, 64], [53, 57, 60], [50, 53, 57], [52, 56, 59]];
const BASS = [
  [45, 0, 45, 52, 45, 0, 44, 45],
  [41, 0, 41, 48, 41, 0, 40, 41],
  [38, 0, 38, 45, 38, 0, 41, 38],
  [40, 0, 40, 47, 44, 0, 40, 44],
];
const MELODY = [
  [76, 0, 72, 0, 69, 0, 68, 69],
  [72, 0, 0, 71, 72, 0, 77, 0],
  [74, 0, 69, 0, 65, 0, 74, 72],
  [71, 0, 68, 0, 64, 0, 68, 71],
  [76, 0, 77, 76, 75, 76, 0, 0],
  [81, 0, 0, 0, 77, 0, 72, 0],
  [74, 75, 74, 0, 69, 0, 65, 0],
  [68, 0, 0, 71, 0, 0, 64, 0],
];

function stepLen() { return game.boss ? 0.15 : Math.max(0.15, 0.21 - (game.level - 1) * 0.008); }

function scheduleStep(i, t) {
  const sl = stepLen();
  const bar = Math.floor(i / 8) % 8, s = i % 8, chordBar = bar % 4;
  const M = A.music;
  // boss fight: everything drops a semitone, with a growling drone and pounding kicks
  const tr = game.boss ? -1 : 0;
  if (game.boss && s === 0) osc('sawtooth', mtof(33 + tr), t, sl * 8, 0.06, M, 0.05);
  // spooky organ pad at start of each bar
  if (s === 0) for (const n of CHORDS[chordBar]) {
    osc('square', mtof(n + tr), t, sl * 7.5, 0.025, M, 0.15);
    osc('sine', mtof(n - 12 + tr), t, sl * 7.5, 0.04, M, 0.15);
  }
  // bass
  const b = BASS[chordBar][s];
  if (b) osc('triangle', mtof(b - 12 + tr), t, sl * 0.9, 0.35, M);
  // drums: kick on 0 & 4 (every other step in a boss fight), ticky hat off-beats, a clap on 6
  if (s === 0 || s === 4 || (game.boss && s % 2 === 0)) {
    const o = osc('sine', 120, t, 0.25, 0.5, M);
    o.frequency.exponentialRampToValueAtTime(40, t + 0.2);
  }
  if (s % 2 === 1) noise(t, 0.04, 0.06, M);
  if (s === 6 && bar % 2 === 1) noise(t, 0.12, 0.12, M, 1500, 'bandpass');
  // theremin melody: wobbly sine with glide
  const m = MELODY[bar][s] && MELODY[bar][s] + tr;
  if (m) {
    let len = 1;
    while (s + len < 8 && !MELODY[bar][s + len]) len++;
    const C = A.ctx, o = C.createOscillator(), g = C.createGain();
    const lfo = C.createOscillator(), lg = C.createGain();
    o.type = 'sine';
    const f = mtof(m);
    o.frequency.setValueAtTime(A.prevMel || f, t);
    o.frequency.exponentialRampToValueAtTime(f, t + 0.07);
    lfo.frequency.value = 5.5; lg.gain.value = f * 0.018;
    lfo.connect(lg); lg.connect(o.frequency);
    const dur = sl * len * 0.95;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.16, t + 0.05);
    g.gain.setValueAtTime(0.16, t + dur * 0.7);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(M); g.connect(A.echo);
    o.start(t); lfo.start(t); o.stop(t + dur + 0.05); lfo.stop(t + dur + 0.05);
    A.prevMel = f;
  }
}

function startMusic() {
  if (!A.ctx || A.timer) return;
  A.next = A.ctx.currentTime + 0.1;
  A.timer = setInterval(() => {
    while (A.next < A.ctx.currentTime + 0.15) {
      scheduleStep(A.step++, A.next);
      A.next += stepLen();
    }
  }, 25);
}
function stopMusic() { clearInterval(A.timer); A.timer = null; }
function setMuted(m) {
  A.muted = m;
  $('muteBtn').textContent = 'Music: ' + (m ? 'off' : 'on');
  if (A.ctx) A.music.gain.setTargetAtTime(m ? 0 : 0.32, A.ctx.currentTime, 0.05);
}

const sfx = {
  shoot() {
    if (!A.ctx) return; const t = A.ctx.currentTime;
    const o = osc('sawtooth', 600, t, 0.18, 0.15, A.sfx);
    o.frequency.exponentialRampToValueAtTime(120, t + 0.18);
    noise(t, 0.15, 0.2, A.sfx, 1200, 'lowpass');
  },
  boom() {
    if (!A.ctx) return; const t = A.ctx.currentTime;
    const f = noise(t, 0.5, 0.6, A.sfx, 2500, 'lowpass');
    f.frequency.exponentialRampToValueAtTime(100, t + 0.45);
    const o = osc('sine', 160, t, 0.35, 0.5, A.sfx);
    o.frequency.exponentialRampToValueAtTime(35, t + 0.3);
  },
  clang() {
    if (!A.ctx) return; const t = A.ctx.currentTime;
    osc('square', 330, t, 0.12, 0.12, A.sfx); osc('square', 495, t, 0.12, 0.08, A.sfx);
  },
  hurt() {
    if (!A.ctx) return; const t = A.ctx.currentTime;
    const o = osc('square', 300, t, 0.4, 0.15, A.sfx);
    o.frequency.exponentialRampToValueAtTime(80, t + 0.4);
  },
  roar() {
    if (!A.ctx) return; const t = A.ctx.currentTime, C = A.ctx;
    const o = osc('sawtooth', 90, t, 1.4, 0.3, A.sfx, 0.08);
    o.frequency.exponentialRampToValueAtTime(45, t + 1.3);
    const lfo = C.createOscillator(), lg = C.createGain();
    lfo.frequency.value = 18; lg.gain.value = 25; lfo.connect(lg); lg.connect(o.frequency);
    lfo.start(t); lfo.stop(t + 1.5);
    noise(t, 1.2, 0.25, A.sfx, 600, 'lowpass');
  },
  blorp() {
    if (!A.ctx) return; const t = A.ctx.currentTime;
    const o = osc('sine', 140, t, 0.25, 0.35, A.sfx);
    o.frequency.exponentialRampToValueAtTime(520, t + 0.12);
    o.frequency.exponentialRampToValueAtTime(90, t + 0.25);
  },
  squish() {
    if (!A.ctx) return; const t = A.ctx.currentTime;
    const o = osc('sine', 220, t, 0.3, 0.45, A.sfx);
    o.frequency.exponentialRampToValueAtTime(50, t + 0.28);
    noise(t, 0.2, 0.3, A.sfx, 900, 'lowpass');
  },
  animal(kind) {
    if (!A.ctx) return; const t = A.ctx.currentTime;
    if (kind === 'bark') {
      for (const d of [0, 0.16]) {
        const o = osc('square', 340, t + d, 0.1, 0.18, A.sfx);
        o.frequency.exponentialRampToValueAtTime(170, t + d + 0.1);
        noise(t + d, 0.08, 0.2, A.sfx, 900, 'bandpass');
      }
    } else if (kind === 'meow') {
      const o = osc('triangle', 520, t, 0.5, 0.25, A.sfx, 0.05);
      o.frequency.linearRampToValueAtTime(820, t + 0.18); o.frequency.linearRampToValueAtTime(460, t + 0.5);
    } else if (kind === 'squeak') {
      for (const d of [0, 0.12]) { const o = osc('sine', 1200, t + d, 0.09, 0.15, A.sfx); o.frequency.exponentialRampToValueAtTime(1900, t + d + 0.08); }
    } else if (kind === 'oink') {
      for (const d of [0, 0.2]) { const o = osc('sawtooth', 190, t + d, 0.15, 0.12, A.sfx); o.frequency.exponentialRampToValueAtTime(120, t + d + 0.15); }
    } else {
      const o = osc('triangle', 200, t, 0.45, 0.25, A.sfx, 0.05); o.frequency.linearRampToValueAtTime(320, t + 0.4);
    }
  },
  // a different sound for each monster type; killed = final hit
  monsterHit(type, killed) {
    if (!A.ctx) return; const t = A.ctx.currentTime, C = A.ctx;
    const v = 0.9 + Math.random() * 0.2; // small random pitch change so hits don't sound identical
    if (type === 'ghost') {
      // spooky "wooOOooo" wail with a wobble
      const o = osc('sine', 420 * v, t, 0.6, 0.22, A.sfx, 0.04);
      o.frequency.linearRampToValueAtTime(760 * v, t + 0.18);
      o.frequency.exponentialRampToValueAtTime(260 * v, t + 0.6);
      const lfo = C.createOscillator(), lg = C.createGain();
      lfo.frequency.value = 9; lg.gain.value = 30; lfo.connect(lg); lg.connect(o.frequency);
      lfo.start(t); lfo.stop(t + 0.65);
    } else if (type === 'pumpkin') {
      // hollow "BONK" followed by a wet splat
      const o = osc('sine', 260 * v, t, 0.22, 0.45, A.sfx, 0.003);
      o.frequency.exponentialRampToValueAtTime(110 * v, t + 0.2);
      noise(t, 0.06, 0.3, A.sfx, 500, 'bandpass');
      noise(t + 0.08, 0.18, 0.25, A.sfx, 700, 'lowpass');
    } else if (type === 'bat') {
      // three quick high squeaks
      for (const d of [0, 0.07, 0.14]) {
        const o = osc('square', 1700 * v, t + d, 0.05, 0.07, A.sfx, 0.004);
        o.frequency.exponentialRampToValueAtTime(2600 * v, t + d + 0.05);
      }
    } else if (type === 'zombie') {
      if (killed) {
        // long dying groan "uuurrrgh"
        const o = osc('sawtooth', 130 * v, t, 0.8, 0.14, A.sfx, 0.06);
        o.frequency.exponentialRampToValueAtTime(55 * v, t + 0.8);
        const lfo = C.createOscillator(), lg = C.createGain();
        lfo.frequency.value = 14; lg.gain.value = 12; lfo.connect(lg); lg.connect(o.frequency);
        lfo.start(t); lfo.stop(t + 0.85);
        noise(t, 0.5, 0.15, A.sfx, 350, 'lowpass');
      } else {
        // short annoyed "UGH!"
        const o = osc('sawtooth', 170 * v, t, 0.2, 0.15, A.sfx, 0.01);
        o.frequency.exponentialRampToValueAtTime(110 * v, t + 0.2);
      }
    }
  },
  level() {
    if (!A.ctx) return; const t = A.ctx.currentTime;
    [69, 72, 76, 81].forEach((n, i) => osc('triangle', mtof(n), t + i * 0.08, 0.2, 0.2, A.sfx));
  },
  over() {
    if (!A.ctx) return; const t = A.ctx.currentTime;
    [62, 61, 60, 59].forEach((n, i) => {
      const o = osc('sawtooth', mtof(n - 12), t + i * 0.35, i === 3 ? 0.9 : 0.32, 0.12, A.sfx);
      if (i === 3) o.frequency.linearRampToValueAtTime(mtof(n - 13), t + 1.9);
    });
  },
};
