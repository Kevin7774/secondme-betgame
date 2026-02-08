function xmur3(input: string) {
  let hash = 1779033703 ^ input.length;
  for (let i = 0; i < input.length; i += 1) {
    hash = Math.imul(hash ^ input.charCodeAt(i), 3432918353);
    hash = (hash << 13) | (hash >>> 19);
  }
  return () => {
    hash = Math.imul(hash ^ (hash >>> 16), 2246822507);
    hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
    hash ^= hash >>> 16;
    return hash >>> 0;
  };
}

export function createSeededRandom(seed: string) {
  const seedFn = xmur3(seed);
  let a = seedFn();

  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomInt(min: number, max: number, rand: () => number) {
  const low = Math.ceil(min);
  const high = Math.floor(max);
  return Math.floor(rand() * (high - low + 1)) + low;
}

export function pickOne<T>(items: T[], rand: () => number): T {
  return items[Math.floor(rand() * items.length)] as T;
}
