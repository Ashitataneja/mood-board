import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Character } from '../characters/Character';
import { faceGeometry } from '../characters/geometry';
import { springs } from '../characters/moods';
import { useCharacterWorld } from '../characters/useMood';
import { sections } from '../content/sections';
import type { Section } from '../content/types';
import { useViewport } from '../hooks/useViewport';
import { fitWidth } from './fit';
import { useSection } from './context';
import styles from './Shell.module.css';

const order = ['work', 'about', 'writing', 'gallery', 'contact', 'resume'];

/** Every other section's character peeks up from below the screen edge. This is the navigation. */
export function Peeks() {
  const current = useSection();
  const vp = useViewport();
  const small = vp.w < 1024;
  const others = sections
    .filter((s) => s.id !== current.id)
    .sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));

  return (
    <nav className={styles.peeks} aria-label="Other sections" data-small={small || undefined}>
      <ul>
        {others.map((s) => (
          <Peek key={s.id} s={s} size={small ? 58 : 96} small={small} />
        ))}
      </ul>
    </nav>
  );
}

function Peek({ s, size, small }: { s: Section; size: number; small: boolean }) {
  const { reduced } = useCharacterWorld();
  const [up, setUp] = useState(false);
  const { width, height } = fitWidth(s.id, size);
  const g = faceGeometry(s.shape, width, height);
  // Show the top of the head and the eyes; on small screens a little less.
  // The <li> is only as tall as the visible part; the rest hangs below the screen edge.
  const visible = Math.min(height, g.ey + g.E * (small ? 0.7 : 0.95));
  const rise = small ? 22 : 46;

  return (
    <li style={{ width, height: visible }}>
      <Link
        to={s.path}
        className={styles.peek}
        aria-label={`Go to ${s.name}`}
        onPointerEnter={() => setUp(true)}
        onPointerLeave={() => setUp(false)}
        onFocus={() => setUp(true)}
        onBlur={() => setUp(false)}
      >
        <motion.span
          className={styles.peekBody}
          initial={false}
          animate={{ y: up ? -rise : 0 }}
          transition={reduced ? { duration: 0 } : springs.pop}
        >
          <Character id={s.id} width={width} height={height} />
        </motion.span>
        <motion.span
          className={styles.peekName}
          initial={false}
          animate={{ opacity: up ? 1 : 0, y: up ? -rise - 10 : 0 }}
          transition={reduced ? { duration: 0 } : springs.pop}
          aria-hidden="true"
        >
          {s.name}
        </motion.span>
      </Link>
    </li>
  );
}
