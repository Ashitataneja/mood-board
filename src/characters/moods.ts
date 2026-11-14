import type { MoodId } from '../content/types';

export type MouthId = 'flat' | 'smile' | 'small' | 'worry' | 'o' | 'open' | 'grin';

export interface MoodSpec {
  /** % closed, 0–100 */
  lidL: number;
  lidR: number;
  /** pupil diameter as a fraction of the eye */
  pupil: number;
  mouth: MouthId;
  brows?: boolean;
  look?: 'up';
  /** soft pink glow, About only */
  glow?: boolean;
}

export const moods: Record<MoodId, MoodSpec> = {
  intense: { lidL: 0, lidR: 0, pupil: 0.56, mouth: 'flat' },
  wink: { lidL: 0, lidR: 100, pupil: 0.45, mouth: 'smile' },
  sleepy: { lidL: 50, lidR: 50, pupil: 0.42, mouth: 'small' },
  open: { lidL: 0, lidR: 0, pupil: 0.38, mouth: 'open' },
  grin: { lidL: 8, lidR: 8, pupil: 0.45, mouth: 'grin' },
  deadpan: { lidL: 38, lidR: 38, pupil: 0.3, mouth: 'flat' },
  worried: { lidL: 12, lidR: 12, pupil: 0.34, mouth: 'worry', brows: true },
  curious: { lidL: 0, lidR: 0, pupil: 0.46, mouth: 'o', look: 'up' },
  surprised: { lidL: 0, lidR: 0, pupil: 0.74, mouth: 'open' },
  smile: { lidL: 10, lidR: 10, pupil: 0.45, mouth: 'smile' },
  proud: { lidL: 100, lidR: 100, pupil: 0.4, mouth: 'grin' },
  asleep: { lidL: 100, lidR: 100, pupil: 0.4, mouth: 'flat' },
  flinch: { lidL: 55, lidR: 55, pupil: 0.24, mouth: 'worry', brows: true },
  blush: { lidL: 20, lidR: 20, pupil: 0.35, mouth: 'small', glow: true },
};

export const moodIds = Object.keys(moods) as MoodId[];

/**
 * Mouths from the brief (60×30 viewBox), rewritten so every one has the same
 * structure: M p0 C … p1 C … p0 Z. The quadratics become cubics, the line
 * mouths retrace themselves, and the "o" is two cubic halves. Because the
 * command list is identical, Motion can morph between any two of them.
 */
type P = [number, number];
const lerp = (a: P, b: P, t: number): P => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const n = (v: number) => Math.round(v * 100) / 100;
const pt = (p: P) => `${n(p[0])} ${n(p[1])}`;

/** quadratic (p0, c, p1) as cubic control points */
const q2c = (p0: P, c: P, p1: P): [P, P] => [lerp(p0, c, 2 / 3), lerp(p1, c, 2 / 3)];

function build(p0: P, fwd: [P, P], p1: P, back: [P, P]): string {
  return `M${pt(p0)} C${pt(fwd[0])} ${pt(fwd[1])} ${pt(p1)} C${pt(back[0])} ${pt(back[1])} ${pt(p0)} Z`;
}

function curveLine(p0: P, c: P, p1: P): string {
  const [a, b] = q2c(p0, c, p1);
  return build(p0, [a, b], p1, [b, a]);
}

function curveFilled(p0: P, c: P, p1: P): string {
  const [a, b] = q2c(p0, c, p1);
  return build(p0, [a, b], p1, [lerp(p1, p0, 1 / 3), lerp(p1, p0, 2 / 3)]);
}

function circle(cx: number, cy: number, r: number): string {
  const k = (4 / 3) * r; // a semicircle as one cubic
  return build(
    [cx - r, cy],
    [
      [cx - r, cy + k],
      [cx + r, cy + k],
    ],
    [cx + r, cy],
    [
      [cx + r, cy - k],
      [cx - r, cy - k],
    ],
  );
}

export const mouths: Record<MouthId, { d: string; filled: boolean }> = {
  flat: { d: curveLine([12, 15], [30, 15], [48, 15]), filled: false },
  smile: { d: curveLine([10, 8], [30, 32], [50, 8]), filled: false },
  small: { d: curveLine([18, 12], [30, 22], [42, 12]), filled: false },
  worry: { d: curveLine([12, 24], [30, 8], [48, 24]), filled: false },
  o: { d: circle(30, 14, 8), filled: true },
  open: { d: curveFilled([14, 6], [30, 36], [46, 6]), filled: true },
  grin: { d: curveFilled([6, 6], [30, 36], [54, 6]), filled: true },
};

/** Hover brightening on the landing: sleepy and deadpan cheer up, others stay. */
export function brighten(m: MoodId): MoodId {
  return m === 'sleepy' || m === 'deadpan' ? 'smile' : m;
}

export const springs = {
  default: { type: 'spring', stiffness: 260, damping: 22 },
  pop: { type: 'spring', stiffness: 400, damping: 18 },
  eyes: { stiffness: 300, damping: 25 },
} as const;
