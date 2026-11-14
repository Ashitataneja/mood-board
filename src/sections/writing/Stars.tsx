import { motion, useTransform } from 'motion/react';
import { useMemo } from 'react';
import { useCharacterWorld } from '../../characters/useMood';
import { seeded } from '../../lib/random';
import styles from './Writing.module.css';

const LAYERS = [
  { count: 46, size: [1.5, 2.2], opacity: 0.35, parallax: 0.012, drift: 70 },
  { count: 28, size: [2.4, 3.4], opacity: 0.6, parallax: 0.03, drift: 52 },
];

/** Slow drifting dots, parallaxing gently with the pointer. Decorative. */
export function Stars() {
  const { pointerX, pointerY, reduced } = useCharacterWorld();
  const layers = useMemo(
    () =>
      LAYERS.map((l, li) => {
        const r = seeded(17 + li * 31);
        return Array.from({ length: l.count }, () => ({
          x: r() * 100,
          y: r() * 100,
          s: l.size[0] + r() * (l.size[1] - l.size[0]),
          tw: 3 + r() * 5,
        }));
      }),
    [],
  );
  return (
    <div className={styles.stars} aria-hidden="true">
      {LAYERS.map((l, li) => (
        <StarLayer
          key={li}
          dots={layers[li]}
          opacity={l.opacity}
          parallax={reduced ? 0 : l.parallax}
          drift={reduced ? 0 : l.drift}
          pointerX={pointerX}
          pointerY={pointerY}
        />
      ))}
    </div>
  );
}

function StarLayer({
  dots,
  opacity,
  parallax,
  drift,
  pointerX,
  pointerY,
}: {
  dots: { x: number; y: number; s: number; tw: number }[];
  opacity: number;
  parallax: number;
  drift: number;
  pointerX: ReturnType<typeof useCharacterWorld>['pointerX'];
  pointerY: ReturnType<typeof useCharacterWorld>['pointerY'];
}) {
  const x = useTransform(pointerX, (v) => -(v - window.innerWidth / 2) * parallax);
  const y = useTransform(pointerY, (v) => -(v - window.innerHeight / 2) * parallax);
  return (
    <motion.div className={styles.starLayer} style={{ x, y }}>
      <div className={drift ? styles.drift : undefined} style={{ animationDuration: `${drift}s` }}>
        {dots.map((d, i) => (
          <span
            key={i}
            className={styles.star}
            style={{ left: `${d.x}%`, top: `${d.y}%`, width: d.s, height: d.s, opacity }}
          />
        ))}
      </div>
    </motion.div>
  );
}
