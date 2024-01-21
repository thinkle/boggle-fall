export function generateDailySeed(n = 0) {
  const today = new Date();
  const seed =
    today.getFullYear() * 10000 +
    (today.getMonth() + 1) * 100 +
    today.getDate();
  return seed + n;
}

function getSeedFromURL() {
  const hash = window.location.hash.substring(1); // Remove the '#' symbol
  return hash ? parseInt(hash, 10) : null;
}

export class PseudoRandomGenerator {
  constructor() {
    this.seed = getSeedFromURL() || generateDailySeed();
    this.prng = this.mulberry32(this.seed);
  }
  updateURLWithSeed() {
    window.location.hash = this.seed;
  }
  mulberry32(a) {
    this.updateURLWithSeed(a);
    return function () {
      let t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  getSeed() {
    return this.seed;
  }

  reset(seed) {
    this.seed = seed;
    this.prng = this.mulberry32(seed);
  }

  random() {
    return this.prng();
  }
}
