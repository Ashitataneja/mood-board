import { createContext, useContext } from 'react';
import type { Section } from '../content/types';

export const SectionContext = createContext<Section | null>(null);

export function useSection(): Section {
  const s = useContext(SectionContext);
  if (!s) throw new Error('useSection must be used inside a section');
  return s;
}

/**
 * Lets a section body steer things that live in the persistent shell
 * (Work's big background eyes) without remounting them.
 */
export interface BackdropMood {
  mood: import('../content/types').MoodId | undefined;
  setMood: (m: import('../content/types').MoodId | undefined) => void;
}
export const BackdropMoodContext = createContext<BackdropMood>({
  mood: undefined,
  setMood: () => {},
});
export const useBackdropMood = () => useContext(BackdropMoodContext);
