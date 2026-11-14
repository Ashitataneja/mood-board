import { sections } from '../content/sections';

/** A character's landing proportions scaled so its longer side is `size`. */
export function fitTo(id: string, size: number) {
  const { w, h } = sections.find((s) => s.id === id)!.crowd;
  const k = size / Math.max(w, h);
  return { width: Math.round(w * k), height: Math.round(h * k) };
}

/** Scaled to a fixed width, so every face reads at the same size (tall shapes just hang lower). */
export function fitWidth(id: string, width: number) {
  const { w, h } = sections.find((s) => s.id === id)!.crowd;
  return { width, height: Math.round((h * width) / w) };
}
