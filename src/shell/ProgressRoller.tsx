import { useEffect, useRef } from 'react';
import { motion, useMotionValueEvent, useTransform, type MotionValue } from 'motion/react';
import { Character } from '../characters/Character';
import { useCharacterWorld } from '../characters/useMood';
import type { MoodId, ShapeId } from '../content/types';
import { useViewport } from '../hooks/useViewport';
import { fitTo } from './fit';
import { useSection } from './context';
import styles from './Shell.module.css';

const deg = (rad: number) => (rad * 180) / Math.PI;

/** How each body travels a distance d (px) along the line. */
function motionFor(shape: ShapeId, d: number, r: number) {
  const a = d / r; // radians rolled
  switch (shape) {
    case 'squircle': // tumbles: rolls, lifting on its corners
      return { rotate: deg(a), y: -5 * Math.abs(Math.sin(2 * a)) };
    case 'flower': // spins faster than it rolls
      return { rotate: deg(a) * 1.5, y: 0 };
    case 'arch': // can't roll a flat bottom: waddles ±8°
      return { rotate: 8 * Math.sin(d / 16), y: -2 * Math.abs(Math.sin(d / 16)) };
    case 'starburst':
      return { rotate: deg(a), y: 0 };
    case 'cloud': // rolls with a little bounce
      return { rotate: deg(a), y: -5 * Math.abs(Math.sin(d / 14)) };
    case 'square': // square things don't roll: it slides
      return { rotate: 0, y: 0 };
  }
}

/**
 * A 76px copy of the section's character rolling along a line at the bottom
 * as you scroll. The body turns, the face stays upright.
 */
export function ProgressRoller({
  progress,
  stage,
  mood,
  lineEnd,
}: {
  progress: MotionValue<number>;
  /** e.g. "03 · INSIGHT"; when absent the label shows a percentage */
  stage?: string | null;
  mood?: MoodId;
  /** right edge of the line, in px from the left of the viewport */
  lineEnd: number;
}) {
  const s = useSection();
  const { reduced } = useCharacterWorld();
  const vp = useViewport();
  // 76px as specified; a little smaller on phones so the panels keep their height
  const { width, height } = fitTo(s.id, vp.w < 1024 ? 56 : 76);
  const start = vp.w < 1024 ? 16 : 40;
  const length = Math.max(120, lineEnd - start - width);
  const radius = Math.min(width, height) / 2;

  const x = useTransform(progress, (p) => start + p * length);
  const rotate = useTransform(progress, (p) =>
    reduced ? 0 : motionFor(s.shape, p * length, radius).rotate,
  );
  const y = useTransform(progress, (p) => (reduced ? 0 : motionFor(s.shape, p * length, radius).y));

  // Percentage label written straight to the DOM: no re-render per scroll frame.
  const pct = useRef<HTMLSpanElement>(null);
  const write = (p: number) => {
    if (pct.current) pct.current.textContent = `${Math.round(p * 100)}%`;
  };
  useMotionValueEvent(progress, 'change', write);
  useEffect(() => write(progress.get()), [progress, stage]);

  return (
    <div className={styles.roller} aria-hidden="true" style={{ color: `var(--${s.text})` }}>
      <div className={styles.line} style={{ left: start, width: length + width }} />
      <motion.div className={styles.rollerBody} style={{ x, y, width }}>
        <span className={styles.rollerLabel}>
          {s.name.toUpperCase()} · {stage ? stage : <span ref={pct}>0%</span>}
        </span>
        <Character
          id={s.id}
          width={width}
          height={height}
          outline={4}
          mood={mood}
          bodyRotate={rotate}
          breathe={false}
        />
      </motion.div>
    </div>
  );
}
