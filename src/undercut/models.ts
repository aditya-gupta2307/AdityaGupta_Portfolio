/**
 * Small, self-contained versions of two ideas from Undercut, used only for
 * the interactive explainers on the case-study page. They run on made-up
 * inputs and are clearly labelled as illustrations — not Undercut's output.
 */

/** Seeded PRNG so the demo gives the same answer for the same inputs. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const gumbel = (rng: () => number) => -Math.log(-Math.log(Math.max(1e-12, rng())));

export interface PLResult {
  exactWin: number[];
  simWin: number[];
  simPodium: number[];
  sims: number;
}

/**
 * Plackett–Luce: a finishing order is drawn by repeatedly "choosing" the next
 * finisher with probability proportional to exp(strength). Adding Gumbel
 * noise to each strength and sorting is an exact way to sample that.
 */
export function simulatePL(strengths: number[], sims = 20000, seed = 7): PLResult {
  const n = strengths.length;
  const rng = mulberry32(seed);
  const wins = new Array(n).fill(0);
  const podium = new Array(n).fill(0);
  const keys = new Array<number>(n);
  const idx = Array.from({ length: n }, (_, i) => i);
  for (let s = 0; s < sims; s++) {
    for (let i = 0; i < n; i++) keys[i] = strengths[i] + gumbel(rng);
    idx.sort((a, b) => keys[b] - keys[a]);
    wins[idx[0]]++;
    for (let p = 0; p < Math.min(3, n); p++) podium[idx[p]]++;
  }
  const z = strengths.reduce((a, s) => a + Math.exp(s), 0);
  return {
    exactWin: strengths.map((s) => Math.exp(s) / z),
    simWin: wins.map((w) => w / sims),
    simPodium: podium.map((w) => w / sims),
    sims,
  };
}

export interface UndercutInput {
  gap: number; // seconds behind the rival when the chaser pits
  fresh: number; // new tyres' pace advantage, s/lap
  wear: number; // extra loss per lap on the rival's old tyres, s/lap
  warmup: number; // out-lap loss while new tyres warm up, s
  laps: number; // laps before the rival responds
}

/** Gap to the rival after each step (positive: chaser still behind). */
export function undercutGap(i: UndercutInput) {
  const out = [{ step: 'Chaser pits', gap: i.gap }];
  let gap = i.gap;
  for (let k = 1; k <= i.laps; k++) {
    gap -= i.fresh + i.wear * (k - 1) - (k === 1 ? i.warmup : 0);
    out.push({ step: k === 1 ? 'Out-lap on new tyres' : `Lap ${k} on new tyres`, gap });
  }
  gap -= i.warmup; // the rival's own cold out-lap
  out.push({ step: 'Rival’s out-lap', gap });
  return out;
}
