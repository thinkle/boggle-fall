function generateSeedFromDate(d: Date) {
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function getDateFromSeed(seed: number) {
  const year = Math.floor(seed / 10000);
  const month = Math.floor((seed % 10000) / 100);
  const day = seed % 100;
  return new Date(year, month - 1, day);
}

export function generateDailySeed() {
  const today = new Date();
  return generateSeedFromDate(today);
}

function getSeedFromURL(): { seed: number; mode: "daily" | "random" } {
  const hash = window.location.hash.substring(1); // Remove the '#' symbol
  if (hash) {
    const mode = hash[0];
    const seed = hash.substring(1);
    if (mode == "r") {
      return {
        seed: parseInt(seed, 36),
        mode: "random",
      };
    } else if (mode == "d") {
      console.log("Get seed for ", seed, new Date(seed));
      // Add T:00:00:00 to make it local time -- otherwise we can lose a day on each
      // page reload in the wrong timezone!
      return {
        seed: generateSeedFromDate(new Date(seed + "T00:00:00")),
        mode: "daily",
      };
    }
  }
  return {
    seed: generateDailySeed(),
    mode: "daily",
  };
}

export class PseudoRandomGenerator {
  seed: number;
  mode: "daily" | "random" = "daily";

  constructor() {
    const { seed, mode } = getSeedFromURL();
    this.seed = seed;
    this.mode = mode;
    getSeedFromURL() || generateDailySeed();
    console.log("Our seed is", this.seed);
    this.prng = this.mulberry32(this.seed);
  }
  updateURLWithSeed() {
    if (this.mode === "daily") {
      let date = getDateFromSeed(this.seed);
      let now = new Date();
      if (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth() &&
        date.getDate() === now.getDate()
      ) {
        window.location.hash = "#today";
      } else {
        window.location.hash =
          "d" + getDateFromSeed(this.seed).toISOString().substring(0, 10);
      }
    } else {
      window.location.hash = "r" + this.seed.toString(36);
    }
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

  reset(seed, mode: "random" | "daily" = "random") {
    this.seed = seed;
    this.mode = mode;
    this.prng = this.mulberry32(seed);
  }

  random() {
    return this.prng();
  }
}
