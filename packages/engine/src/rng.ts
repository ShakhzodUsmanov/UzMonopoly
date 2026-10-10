export interface RNG {
  next(): number;
  nextInt(min: number, max: number): number;
  shuffle<T>(array: readonly T[]): T[];
}

export function createPRNG(seed: number): RNG {
  let s = seed >>> 0;

  function next(): number {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  function nextInt(min: number, max: number): number {
    const range = max - min + 1;
    return min + Math.floor(next() * range);
  }

  function shuffle<T>(array: readonly T[]): T[] {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = nextInt(0, i);
      const temp = copy[i]!;
      copy[i] = copy[j]!;
      copy[j] = temp;
    }
    return copy;
  }

  return { next, nextInt, shuffle };
}
