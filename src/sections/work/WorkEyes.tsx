import { Face } from '../../characters/Face';
import type { MoodId } from '../../content/types';
import { useViewport } from '../../hooks/useViewport';
import styles from './Work.module.css';

/**
 * Two very large, faint versions of Work's eyes on the back wall. They
 * follow the pointer slowly (a heavier spring), and take on the story's mood
 * inside a case study. You are being watched by someone serious.
 */
export function WorkEyes({ mood = 'intense' }: { mood?: MoodId }) {
  const vp = useViewport();
  const E = Math.min(600, vp.w * 0.36, vp.h * 0.62);
  // A box whose min side is E / 0.6, so Face's eye size (0.6 × min) is exactly E.
  const h = E / 0.6;
  const w = Math.max(h, E * 2.6);

  return (
    <div className={styles.eyes} aria-hidden="true">
      <div style={{ width: w, height: h }}>
        <Face
          shape="square"
          width={w}
          height={h}
          eyeSize={0.6}
          mood={mood}
          bodyColor="var(--work)"
          textColor="rgb(242 232 213 / 0.14)"
          eyeFill="rgb(255 255 255 / 0.08)"
          pupilFill="rgb(255 255 255 / 0.12)"
          mouth={false}
          brows
          eyeSpring={{ stiffness: 40, damping: 16 }}
        />
      </div>
    </div>
  );
}
