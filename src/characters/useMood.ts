import { useContext, useEffect, useState } from 'react';
import type { MoodId } from '../content/types';
import { CharacterContext, type CharacterWorld } from './context';

export function useCharacterWorld(): CharacterWorld {
  const ctx = useContext(CharacterContext);
  if (!ctx) throw new Error('useCharacterWorld must be used inside <CharacterProvider>');
  return ctx;
}

const SLEEP_STAGGER = 300;
const CAST_SIZE = 6;

/**
 * The mood a character actually shows, given what it wants to show.
 * Sleep wins (staggered by `order`, waking in reverse order), then flinch.
 */
export function useMood(base: MoodId, order = 0, opts: { flinch?: boolean; sleep?: boolean } = {}) {
  const { asleep, flinching } = useCharacterWorld();
  const canSleep = opts.sleep !== false;
  const canFlinch = opts.flinch !== false;
  const [dozing, setDozing] = useState(false);

  useEffect(() => {
    if (!canSleep) {
      setDozing(false);
      return;
    }
    const delay = (asleep ? order : CAST_SIZE - 1 - order) * SLEEP_STAGGER;
    const t = window.setTimeout(() => setDozing(asleep), Math.max(0, delay));
    return () => window.clearTimeout(t);
  }, [asleep, order, canSleep]);

  let mood: MoodId = base;
  if (dozing) mood = 'asleep';
  else if (flinching && canFlinch) mood = 'flinch';
  return { mood, dozing, flinching: flinching && canFlinch && !dozing };
}
