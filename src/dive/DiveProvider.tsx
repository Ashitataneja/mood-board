import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { animate } from 'motion/react';
import { sectionById } from '../content/sections';
import type { SectionId } from '../content/types';
import { useCharacterWorld } from '../characters/useMood';
import { DiveContext, type DiveApi, type Entry } from './context';
import { sectionFromPath } from './routes';
import styles from './Dive.module.css';

const EASE_DIVE = [0.7, 0, 0.2, 1] as const;
const EASE_OUT = [0.2, 0.8, 0.2, 1] as const;

const wait = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));
const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));
const preloadSection = () => import('../routes/SectionRoute');

/** Wait (up to `timeout`) for an element to exist, e.g. a lazy route's pupil. */
async function waitFor<T extends Element>(selector: string, timeout = 1200): Promise<T | null> {
  const start = performance.now();
  while (performance.now() - start < timeout) {
    const el = document.querySelector<T>(selector);
    if (el) return el;
    await nextFrame();
  }
  return null;
}

function pupilOf(id: SectionId) {
  return `[data-character="${id}"] [data-pupil="L"]`;
}

/** Radius that covers the whole viewport from a point. */
function coverRadius(x: number, y: number) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  return Math.hypot(Math.max(x, w - x), Math.max(y, h - y)) + 4;
}

/**
 * Owns the signature transition. Navigation still goes through React Router;
 * this layer decides how each location change looks:
 *   landing → section (character click)   eye dive
 *   landing → section (link, forward)      eye-open
 *   first load on a section (deep link)    eye-open
 *   section → landing (back, Escape, pill) reverse dive into the pupil
 *   section → section                      switch (handled by SectionRoute)
 */
export function DiveProvider({ children }: { children: ReactNode }) {
  const { reduced } = useCharacterWorld();
  const navigate = useNavigate();
  const location = useLocation();

  const [diving, setDiving] = useState<SectionId | null>(null);
  const [glance, setGlance] = useState<{ x: number; y: number } | null>(null);
  const [entry, setEntry] = useState<Entry>('none');
  const [returned, setReturned] = useState<DiveApi['returned']>(null);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const handled = useRef(false);
  const prevPath = useRef<string | null>(null);
  const returnCount = useRef(0);

  const root = useRef<HTMLDivElement>(null);
  const pupil = useRef<HTMLDivElement>(null);
  const colour = useRef<HTMLDivElement>(null);
  const lidTop = useRef<HTMLDivElement>(null);
  const lidBottom = useRef<HTMLDivElement>(null);

  const reset = useCallback(() => {
    for (const el of [
      root.current,
      pupil.current,
      colour.current,
      lidTop.current,
      lidBottom.current,
    ]) {
      if (!el) continue;
      el.style.display = 'none';
      el.style.opacity = '';
      el.style.transform = '';
      el.style.clipPath = '';
    }
    busyRef.current = false;
    setBusy(false);
  }, []);

  const begin = () => {
    busyRef.current = true;
    setBusy(true);
    root.current!.style.display = 'block';
  };

  // ---------------------------------------------------------------- enter
  const enter = useCallback(
    async (id: SectionId) => {
      if (busyRef.current) return;
      const s = sectionById[id];
      preloadSection();
      begin();

      if (reduced) {
        const c = colour.current!;
        c.style.background = s.color;
        c.style.display = 'block';
        c.style.clipPath = 'none';
        await animate(c, { opacity: [0, 1] }, { duration: 0.1 });
        handled.current = true;
        setEntry('dive');
        navigate(s.path);
        await nextFrame();
        await animate(c, { opacity: [1, 0] }, { duration: 0.1 });
        reset();
        return;
      }

      // 1. Look (0–150ms): it looks at you, the others glance at it.
      const body = document.querySelector(`[data-character="${id}"]`)?.getBoundingClientRect();
      setGlance(body ? { x: body.left + body.width / 2, y: body.top + body.height * 0.35 } : null);
      setDiving(id);
      await wait(150);

      // 2. Pupil grows (150–650ms) from its own position until it covers the screen.
      const r = document.querySelector(pupilOf(id))?.getBoundingClientRect();
      const d = r && r.width > 0 ? r.width : 24;
      const cx = r ? r.left + r.width / 2 : window.innerWidth / 2;
      const cy = r ? r.top + r.height / 2 : window.innerHeight / 2;
      const p = pupil.current!;
      Object.assign(p.style, {
        display: 'block',
        width: `${d}px`,
        height: `${d}px`,
        left: `${cx - d / 2}px`,
        top: `${cy - d / 2}px`,
      });
      await animate(
        p,
        { scale: [1, coverRadius(cx, cy) / (d / 2)] },
        { duration: 0.5, ease: EASE_DIVE },
      );

      // 3. Colour (650–900ms): the section opens from the centre, content rises in.
      handled.current = true;
      setEntry('dive');
      navigate(s.path);
      setDiving(null);
      setGlance(null);
      const c = colour.current!;
      c.style.background = s.color;
      c.style.display = 'block';
      await animate(
        c,
        { clipPath: ['circle(0% at 50% 50%)', 'circle(150% at 50% 50%)'] },
        { duration: 0.25, ease: EASE_OUT },
      );
      reset();
    },
    [navigate, reduced, reset],
  );

  // ----------------------------------------------------------------- exit
  /** Reverse dive. The colour cover goes up synchronously so nothing flashes. */
  const runExit = useCallback(
    async (id: SectionId, doNavigate: boolean) => {
      const s = sectionById[id];
      begin();
      const c = colour.current!;
      c.style.background = s.color;
      c.style.display = 'block';
      c.style.clipPath = 'none';
      c.style.opacity = '1';
      if (doNavigate) {
        handled.current = true;
        navigate('/');
      }
      setEntry('none');

      const done = () => {
        returnCount.current += 1;
        setReturned({ id, n: returnCount.current });
        reset();
      };

      if (reduced) {
        await nextFrame();
        await animate(c, { opacity: [1, 0] }, { duration: 0.2 });
        done();
        return;
      }

      const el = await waitFor<SVGCircleElement>(pupilOf(id));
      // let the face settle its pupils before we aim at them
      await nextFrame();
      const r = el?.getBoundingClientRect();
      const d = r && r.width > 0 ? r.width : 24;
      const cx = r ? r.left + r.width / 2 : window.innerWidth / 2;
      const cy = r ? r.top + r.height / 2 : window.innerHeight / 2;
      const S = coverRadius(cx, cy) / (d / 2);

      // Black pupil sits fully grown under the colour.
      const p = pupil.current!;
      Object.assign(p.style, {
        display: 'block',
        width: `${d}px`,
        height: `${d}px`,
        left: `${cx - d / 2}px`,
        top: `${cy - d / 2}px`,
        transform: `scale(${S})`,
        opacity: '1',
      });

      // 1. Colour shrinks to a pupil.
      await animate(
        c,
        {
          clipPath: [
            `circle(${coverRadius(cx, cy)}px at ${cx}px ${cy}px)`,
            `circle(${d / 2}px at ${cx}px ${cy}px)`,
          ],
        },
        { duration: 0.25, ease: EASE_DIVE },
      );
      c.style.display = 'none';
      // 2. The pupil shrinks back into the eye.
      await animate(p, { scale: [S, 1] }, { duration: 0.5, ease: EASE_DIVE });
      await animate(p, { opacity: [1, 0] }, { duration: 0.08 });
      // 3. The character blinks (Landing reacts to `returned`).
      done();
    },
    [navigate, reduced, reset],
  );

  const exit = useCallback(() => {
    if (busyRef.current) return;
    const id = sectionFromPath(location.pathname);
    if (id) runExit(id, true);
  }, [location.pathname, runExit]);

  // ------------------------------------------------------------ eye-open
  const runEyeOpen = useCallback(async () => {
    setEntry('deep');
    if (reduced) return;
    begin();
    const t = lidTop.current!;
    const b = lidBottom.current!;
    t.style.display = 'block';
    b.style.display = 'block';
    await nextFrame();
    await Promise.all([
      animate(t, { y: ['0%', '-101%'] }, { duration: 0.45, delay: 0.1, ease: EASE_DIVE }),
      animate(b, { y: ['0%', '101%'] }, { duration: 0.45, delay: 0.1, ease: EASE_DIVE }),
    ]);
    reset();
  }, [reduced, reset]);

  // -------------------------------------------- react to every location change
  useLayoutEffect(() => {
    const path = location.pathname;
    const prev = prevPath.current;
    prevPath.current = path;
    if (prev === path) return;
    if (handled.current) {
      handled.current = false;
      return;
    }
    const prevS = prev === null ? null : sectionFromPath(prev);
    const nextS = sectionFromPath(path);

    if (prev === null) {
      if (nextS) runEyeOpen();
      return;
    }
    if (busyRef.current) return;
    if (!prevS && nextS) runEyeOpen();
    else if (prevS && path === '/') runExit(prevS, false);
    else if (prevS && nextS) setEntry('switch');
  }, [location.pathname, runEyeOpen, runExit]);

  // ------------------------------------------------- Escape goes back a level
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented) return;
      const t = e.target as HTMLElement | null;
      if (t && t.closest('input, textarea, select, [contenteditable="true"]')) return;
      const id = sectionFromPath(location.pathname);
      if (!id) return;
      const depth = location.pathname.split('/').filter(Boolean).length;
      if (depth > 1) navigate(`/${id}`);
      else exit();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [location.pathname, navigate, exit]);

  const value = useMemo<DiveApi>(
    () => ({ diving, glance, entry, returned, enter, exit, busy }),
    [diving, glance, entry, returned, enter, exit, busy],
  );

  return (
    <DiveContext.Provider value={value}>
      {children}
      <div ref={root} className={styles.overlay} aria-hidden="true">
        <div ref={pupil} className={styles.pupil} />
        <div ref={lidTop} className={`${styles.lid} ${styles.lidTop}`} />
        <div ref={lidBottom} className={`${styles.lid} ${styles.lidBottom}`} />
        <div ref={colour} className={styles.colour} />
      </div>
    </DiveContext.Provider>
  );
}
