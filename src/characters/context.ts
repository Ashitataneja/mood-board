import { createContext } from 'react';
import type { MotionValue } from 'motion/react';

export interface CharacterWorld {
  /** Last pointer position in viewport px. Read with motion values; never causes re-renders. */
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
  flinching: boolean;
  asleep: boolean;
  reduced: boolean;
  /** Dev helpers for /playground */
  debug: { flinch: () => void; sleep: () => void; wake: () => void };
}

export const CharacterContext = createContext<CharacterWorld | null>(null);
