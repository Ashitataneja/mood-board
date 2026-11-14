import type { ShapeId } from '../content/types';

type Pt = [number, number];

const f = (n: number) => Math.round(n * 100) / 100;

function toPath(pts: Pt[]): string {
  return 'M' + pts.map(([x, y]) => `${f(x)} ${f(y)}`).join('L') + 'Z';
}

/** Superellipse filling the box: x = sign(cos t)·|cos t|^(2/n). */
function superellipse(n: number, w: number, h: number, steps = 160): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const c = Math.cos(t);
    const s = Math.sin(t);
    const x = Math.sign(c) * Math.pow(Math.abs(c), 2 / n);
    const y = Math.sign(s) * Math.pow(Math.abs(s), 2 / n);
    pts.push([w / 2 + (x * w) / 2, h / 2 + (y * h) / 2]);
  }
  return pts;
}

/** Polar curve defined in a 100-unit box, stretched to w×h. θ = 0 points up. */
function polar(r: (theta: number) => number, w: number, h: number, steps = 240): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i < steps; i++) {
    const theta = (i / steps) * Math.PI * 2;
    const rad = r(theta);
    const a = theta - Math.PI / 2;
    pts.push([((50 + rad * Math.cos(a)) * w) / 100, ((50 + rad * Math.sin(a)) * h) / 100]);
  }
  return pts;
}

function starburst(w: number, h: number): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i < 28; i++) {
    const rad = i % 2 === 0 ? 50 : 40;
    const a = (i / 28) * Math.PI * 2 - Math.PI / 2;
    pts.push([((50 + rad * Math.cos(a)) * w) / 100, ((50 + rad * Math.sin(a)) * h) / 100]);
  }
  return pts;
}

function arch(w: number, h: number): string {
  const r = w / 2;
  return `M0 ${f(h)}L0 ${f(r)}A${f(r)} ${f(r)} 0 0 1 ${f(w)} ${f(r)}L${f(w)} ${f(h)}Z`;
}

const cache = new Map<string, string>();

/** SVG path for a character body, in a w×h box with its origin at top-left. Memoised. */
export function shapePath(shape: ShapeId, width: number, height: number): string {
  const key = `${shape}:${width}:${height}`;
  const hit = cache.get(key);
  if (hit) return hit;
  let d: string;
  switch (shape) {
    case 'squircle':
      d = toPath(superellipse(4.2, width, height));
      break;
    case 'square':
      d = toPath(superellipse(9, width, height));
      break;
    case 'flower':
      // a petal points up because θ = 0 is up and cos(0) is the maximum
      d = toPath(polar((t) => 39 + 11 * Math.cos(5 * t), width, height));
      break;
    case 'starburst':
      d = toPath(starburst(width, height));
      break;
    case 'cloud':
      d = toPath(polar((t) => 43 + 7 * Math.abs(Math.sin(4 * t)), width, height));
      break;
    case 'arch':
      d = arch(width, height);
      break;
  }
  cache.set(key, d);
  return d;
}

/** Where the eyes sit, as a y coordinate inside the body box. */
export function eyeLine(shape: ShapeId, w: number, h: number): number {
  if (shape === 'squircle') return 0.27 * h;
  if (shape === 'arch') return 0.38 * w;
  return 0.33 * h;
}
