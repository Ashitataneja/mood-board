import type { CrowdSlot, SectionId } from '../content/types';
import { sections } from '../content/sections';

export interface CrowdLayout {
  kind: 'wide' | 'tall';
  /** reference canvas size */
  width: number;
  height: number;
  slots: Record<SectionId, CrowdSlot>;
  /** title block */
  name: { x: number; y: number; size: number; lines: string[] };
  tagline: { x: number; y: number; width: number };
  /** crowd shuffle: max push and the distance it fades over */
  push: number;
  reach: number;
  rise: number;
}

/** Desktop: the brief's 1440×900 canvas. Positions come from sections.ts. */
export const wide: CrowdLayout = {
  kind: 'wide',
  width: 1440,
  height: 900,
  slots: Object.fromEntries(sections.map((s) => [s.id, s.crowd])) as Record<SectionId, CrowdSlot>,
  name: { x: 60, y: 26, size: 212, lines: ['ASHITA TANEJA'] },
  tagline: { x: 64, y: 252, width: 1300 },
  push: 60,
  reach: 560,
  rise: 28,
};

/** Tablet and phone: a tighter two-column huddle on a portrait canvas. */
export const tall: CrowdLayout = {
  kind: 'tall',
  width: 420,
  height: 900,
  slots: {
    writing: { x: 236, y: 318, w: 150, h: 300 },
    gallery: { x: 24, y: 334, w: 196, h: 196 },
    about: { x: -6, y: 520, w: 214, h: 214 },
    work: { x: 176, y: 484, w: 230, h: 274 },
    contact: { x: 22, y: 702, w: 196, h: 196 },
    resume: { x: 268, y: 748, w: 140, h: 140 },
  },
  name: { x: 22, y: 84, size: 100, lines: ['ASHITA', 'TANEJA'] },
  tagline: { x: 24, y: 252, width: 372 },
  push: 26,
  reach: 260,
  rise: 18,
};

/** Wide canvas when the window is landscape and at least 1024px wide. */
export function pickLayout(vw: number, vh: number): CrowdLayout {
  return vw >= 1024 && vw / vh >= 1 ? wide : tall;
}
