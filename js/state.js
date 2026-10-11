// Game state and monster definitions.
const TYPES = {
  ghost:   { hp: 1, speed: 1.3, pts: 10, r: 30, from: 1 },
  pumpkin: { hp: 1, speed: 1.5, pts: 10, r: 28, from: 1 },
  bat:     { hp: 1, speed: 2.2, pts: 15, r: 26, from: 2 },
  zombie:  { hp: 2, speed: 0.9, pts: 25, r: 32, from: 3 },
};
const FINAL_LEVEL = 7; // beating this level's boss wins the game
const WORDS = ['POW!', 'BOOM!', 'ZAP!', 'KA-BLAM!', 'BYE!'];

const game = {
  state: 'title', score: 0, level: 1, hearts: 3, t: 0,
  kid: { lane: 1, y: LANES[1], cool: 0, recoil: 0, inv: 0 },
  monsters: [], rockets: [], parts: [], texts: [], spawn: 60, shake: 0, hurtFlash: 0,
  boss: null, shots: [], goal: 120, rescue: null, rescued: [], loves: [], ending: 0,
};

function reset() {
  Object.assign(game, { score: 0, level: 1, hearts: 3, t: 0, monsters: [], rockets: [], parts: [], texts: [], spawn: 60, shake: 0, hurtFlash: 0, boss: null, shots: [], goal: 120, rescue: null, rescued: [], loves: [], ending: 0 });
  Object.assign(game.kid, { lane: 1, y: LANES[1], cool: 0, recoil: 0, inv: 0 });
}

const COLORS = { ghost: ['#ffffff', '#cfe8ff', '#ffe066'], pumpkin: ['#ff8a1f', '#ffd23f', '#5dbb3a'], bat: ['#9b5de5', '#f15bb5', '#ffe066'], zombie: ['#8cf25a', '#4cc9f0', '#ffe066'] };
