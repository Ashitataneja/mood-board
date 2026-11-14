import { createContext, useContext } from 'react';
import type { Section } from '../content/types';

export const SectionContext = createContext<Section | null>(null);

export function useSection(): Section {
  const s = useContext(SectionContext);
  if (!s) throw new Error('useSection must be used inside a section');
  return s;
}
