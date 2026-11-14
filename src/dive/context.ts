import { createContext, useContext } from 'react';
import type { SectionId } from '../content/types';

/** How the current section was arrived at. Drives the content entrance. */
export type Entry = 'dive' | 'deep' | 'switch' | 'none';

export interface DiveApi {
  /** Character the dive is focused on (look beat), or null */
  diving: SectionId | null;
  /** Screen point the rest of the crowd glances at during a dive */
  glance: { x: number; y: number } | null;
  entry: Entry;
  /** Last character returned to, with a counter that changes on every return */
  returned: { id: SectionId; n: number } | null;
  enter: (id: SectionId) => void;
  exit: () => void;
  busy: boolean;
}

export const DiveContext = createContext<DiveApi | null>(null);

export function useDive(): DiveApi {
  const ctx = useContext(DiveContext);
  if (!ctx) throw new Error('useDive must be used inside <DiveProvider>');
  return ctx;
}
