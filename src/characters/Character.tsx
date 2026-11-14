import { motion, type MotionValue } from 'motion/react';
import type { CSSProperties } from 'react';
import type { MoodId, SectionId } from '../content/types';
import { sectionById, sections } from '../content/sections';
import { shapePath } from './shapes';
import { Face, type LookTarget } from './Face';
import { faceGeometry } from './geometry';
import { moods, springs } from './moods';
import { useCharacterWorld, useMood } from './useMood';
import styles from './Character.module.css';

export interface CharacterProps {
  id: SectionId;
  width: number;
  height: number;
  /** What the character wants to feel. Defaults to its section mood. */
  mood?: MoodId;
  /** Show the section name under the mouth */
  showName?: boolean;
  /** Ink outline in px (used where a character sits on its own colour) */
  outline?: number;
  /** Rotation of the body only; the face stays upright */
  bodyRotate?: MotionValue<number>;
  look?: LookTarget;
  /** Opt out of global behaviours */
  flinch?: boolean;
  sleep?: boolean;
  breathe?: boolean;
  autoBlink?: boolean;
  blinkSignal?: number;
  blinkDuration?: number;
  className?: string;
  style?: CSSProperties;
}

const castOrder = Object.fromEntries(
  sections.map((s) => [
    s.id,
    ['work', 'about', 'writing', 'gallery', 'contact', 'resume'].indexOf(s.id),
  ]),
) as Record<SectionId, number>;

/** A section character: body, face and the life behaviours. Decorative; wrap it in a button or link. */
export function Character({
  id,
  width: w,
  height: h,
  mood: wanted,
  showName = false,
  outline = 0,
  bodyRotate,
  look,
  flinch = true,
  sleep = true,
  breathe = true,
  autoBlink = true,
  blinkSignal,
  blinkDuration,
  className,
  style,
}: CharacterProps) {
  const s = sectionById[id];
  const { reduced } = useCharacterWorld();
  const order = castOrder[id];
  const { mood, dozing, flinching } = useMood(wanted ?? s.defaultMood, order, { flinch, sleep });
  const d = shapePath(s.shape, w, h);
  const text = `var(--${s.text})`;
  const g = faceGeometry(s.shape, w, h);
  const glow = moods[mood].glow;
  const pad = outline;

  return (
    <div
      className={[styles.root, className].filter(Boolean).join(' ')}
      style={{ width: w, height: h, ...style }}
      data-character={id}
      aria-hidden="true"
    >
      <div
        className={[styles.layer, breathe && !reduced ? styles.breathe : ''].join(' ')}
        style={{ animationDelay: `${-order * 0.57}s` }}
      >
        <motion.div
          className={styles.flinch}
          animate={{ scale: flinching ? 0.97 : 1 }}
          transition={reduced ? { duration: 0 } : springs.default}
        >
          <motion.div
            className={styles.glow}
            initial={false}
            animate={{ opacity: glow ? 1 : 0 }}
            transition={{ duration: reduced ? 0 : 0.4 }}
          />
          <motion.svg
            className={styles.body}
            viewBox={`${-pad} ${-pad} ${w + pad * 2} ${h + pad * 2}`}
            style={{
              inset: -pad,
              width: w + pad * 2,
              height: h + pad * 2,
              rotate: bodyRotate,
            }}
            focusable="false"
          >
            <path
              d={d}
              style={{ fill: s.color, stroke: outline ? 'var(--ink)' : 'none' }}
              strokeWidth={outline}
              strokeLinejoin="round"
            />
          </motion.svg>
          <Face
            className={styles.face}
            shape={s.shape}
            width={w}
            height={h}
            mood={mood}
            bodyColor={s.color}
            textColor={text}
            look={look}
            autoBlink={autoBlink}
            blinkSignal={blinkSignal}
            blinkDuration={blinkDuration}
          />
          {showName && (
            <span
              className={styles.name}
              style={{
                color: text,
                top: g.my + g.mouthW / 2 + g.E * 0.15,
                fontSize: Math.max(12, Math.min(15, g.E * 0.2)),
              }}
            >
              {s.name}
            </span>
          )}
        </motion.div>
      </div>
      {id === 'work' && dozing && !reduced && (
        <span
          className={styles.zzz}
          style={{ left: g.rx + g.E * 0.6, top: g.ey - g.E * 1.2, color: text }}
        >
          <span>z</span>
          <span>z</span>
          <span>z</span>
        </span>
      )}
    </div>
  );
}
