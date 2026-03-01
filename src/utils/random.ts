// Simple seeded PRNG (Mulberry32)
export function createSeedGenerator(seed: number) {
    return function () {
        let t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

export class Random {
    private rng: () => number;

    constructor(seed: number) {
        this.rng = createSeedGenerator(seed);
    }

    next(): number {
        return this.rng();
    }

    range(min: number, max: number): number {
        return min + this.next() * (max - min);
    }

    choice<T>(items: T[]): T {
        return items[Math.floor(this.next() * items.length)];
    }

    boolean(chance: number = 0.5): boolean {
        return this.next() < chance;
    }
}
