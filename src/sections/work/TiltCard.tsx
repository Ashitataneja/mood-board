import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import type { ReactNode } from 'react';
import { useCharacterWorld } from '../../characters/useMood';
import styles from './Work.module.css';

const MAX = 6; // degrees

/** A card that tilts toward the pointer (max 6°) with a glare that follows it. */
export function TiltCard({ children, className }: { children: ReactNode; className?: string }) {
  const { reduced } = useCharacterWorld();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const hover = useMotionValue(0);
  const spring = { stiffness: 220, damping: 20 };
  const rx = useSpring(
    useTransform(() => (py.get() - 0.5) * -2 * MAX * hover.get()),
    spring,
  );
  const ry = useSpring(
    useTransform(() => (px.get() - 0.5) * 2 * MAX * hover.get()),
    spring,
  );
  const glareO = useSpring(useTransform(hover, [0, 1], [0, 1]), spring);
  const gx = useTransform(px, (v) => `${(v - 0.5) * 100}%`);
  const gy = useTransform(py, (v) => `${(v - 0.5) * 100}%`);

  const move = (e: React.PointerEvent<HTMLElement>) => {
    if (reduced || e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
    hover.set(1);
  };

  return (
    <div className={styles.tiltScene}>
      <motion.article
        className={className}
        style={{ rotateX: rx, rotateY: ry }}
        onPointerMove={move}
        onPointerLeave={() => hover.set(0)}
      >
        {children}
        <div className={styles.glareClip} aria-hidden="true">
          <motion.div className={styles.glare} style={{ x: gx, y: gy, opacity: glareO }} />
        </div>
      </motion.article>
    </div>
  );
}
