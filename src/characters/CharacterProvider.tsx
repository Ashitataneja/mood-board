import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { motionValue, useReducedMotion } from 'motion/react';
import { CharacterContext, type CharacterWorld } from './context';

const FLINCH_SPEED = 4.5; // px per ms
const FLINCH_MS = 450;
const IDLE_MS = 9000;

/**
 * One pointer listener, one idle timer, shared by every character.
 * Pointer position lives in motion values; only flinch and sleep (rare,
 * discrete events) touch React state.
 */
export function CharacterProvider({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion() ?? false;
  const [flinching, setFlinching] = useState(false);
  const [asleep, setAsleep] = useState(false);

  const pointer = useMemo(
    () => ({
      x: motionValue(typeof window === 'undefined' ? 0 : window.innerWidth / 2),
      y: motionValue(typeof window === 'undefined' ? 0 : window.innerHeight / 3),
    }),
    [],
  );

  const lastInput = useRef(performance.now());
  const asleepRef = useRef(false);
  const flinchTimer = useRef<number>();
  const last = useRef({ x: 0, y: 0, t: 0 });

  const flinch = useCallback(() => {
    setFlinching(true);
    window.clearTimeout(flinchTimer.current);
    flinchTimer.current = window.setTimeout(() => setFlinching(false), FLINCH_MS);
  }, []);

  const wake = useCallback(() => {
    lastInput.current = performance.now();
    if (asleepRef.current) {
      asleepRef.current = false;
      setAsleep(false);
    }
  }, []);

  const sleep = useCallback(() => {
    asleepRef.current = true;
    setAsleep(true);
  }, []);

  useEffect(() => {
    const onPointer = (e: PointerEvent) => {
      // y first, then x: faces recompute once per frame either way
      pointer.y.set(e.clientY);
      pointer.x.set(e.clientX);
      wake();

      if (reduced || e.pointerType === 'touch') return;
      const now = e.timeStamp;
      const l = last.current;
      const dt = now - l.t;
      if (dt >= 8 && dt < 100) {
        const speed = Math.hypot(e.clientX - l.x, e.clientY - l.y) / dt;
        if (speed > FLINCH_SPEED) flinch();
      }
      if (dt >= 8 || dt < 0) last.current = { x: e.clientX, y: e.clientY, t: now };
    };
    const onInput = () => wake();

    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('pointerdown', onPointer, { passive: true });
    window.addEventListener('keydown', onInput);
    window.addEventListener('wheel', onInput, { passive: true });
    window.addEventListener('scroll', onInput, { passive: true, capture: true });

    const idle = window.setInterval(() => {
      if (!asleepRef.current && performance.now() - lastInput.current > IDLE_MS) sleep();
    }, 500);

    return () => {
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('pointerdown', onPointer);
      window.removeEventListener('keydown', onInput);
      window.removeEventListener('wheel', onInput);
      window.removeEventListener('scroll', onInput, { capture: true });
      window.clearInterval(idle);
      window.clearTimeout(flinchTimer.current);
    };
  }, [pointer, reduced, wake, sleep, flinch]);

  const value = useMemo<CharacterWorld>(
    () => ({
      pointerX: pointer.x,
      pointerY: pointer.y,
      flinching,
      asleep,
      reduced,
      debug: { flinch, sleep, wake },
    }),
    [pointer, flinching, asleep, reduced, flinch, sleep, wake],
  );

  return <CharacterContext.Provider value={value}>{children}</CharacterContext.Provider>;
}
