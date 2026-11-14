import type { ShapeId } from '../content/types';
import { eyeLine } from './shapes';

/** Eye, mouth and label positions for a body box. */
export function faceGeometry(shape: ShapeId, w: number, h: number, eyeSize = 0.2) {
  const E = eyeSize * Math.min(w, h);
  const gap = 0.32 * E;
  const ey = eyeLine(shape, w, h);
  const lx = w / 2 - gap / 2 - E / 2;
  const rx = w / 2 + gap / 2 + E / 2;
  const mouthW = 1.5 * E;
  const my = ey + E * 0.78;
  return { E, gap, ey, lx, rx, mouthW, my, mx: w / 2 - mouthW / 2 };
}
