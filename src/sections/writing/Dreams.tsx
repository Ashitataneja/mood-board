import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Character } from '../../characters/Character';
import { useViewport } from '../../hooks/useViewport';
import { posts } from '../../content/writing';
import { Txt } from '../common';
import styles from './Writing.module.css';

// Where each bubble floats, as % of the dream panel (cycled if there are more posts).
const spots = [
  { x: 30, y: 4 },
  { x: 62, y: 30 },
  { x: 24, y: 52 },
  { x: 70, y: 2 },
  { x: 50, y: 62 },
  { x: 4, y: 20 },
];
// Each blob gets a slightly different outline.
const blobs = [
  '58% 42% 55% 45% / 52% 60% 40% 48%',
  '45% 55% 40% 60% / 60% 45% 55% 40%',
  '52% 48% 62% 38% / 44% 56% 44% 56%',
];

/**
 * Writing's dreams: posts float as thought bubbles on slow sine-ish paths,
 * slightly out of focus, until you hover one.
 */
export function Dreams() {
  const [focus, setFocus] = useState<number | null>(null);
  // Phones: a wider panel with the bubbles in a zig-zag, so they never pile up.
  const small = useViewport().w < 1024;
  const n = posts.length;

  return (
    <section
      className={styles.dreams}
      data-panel
      aria-labelledby="dreams-title"
      style={small ? { width: `${Math.max(1, n) * 78 + 30}vw` } : undefined}
    >
      <h2 id="dreams-title" className="visually-hidden">
        Posts
      </h2>
      <ul className={styles.bubbleList}>
        {posts.map((p, i) => {
          const spot = small
            ? { x: (i * 100) / (n + 0.4) + 8, y: i % 2 ? 34 : 2 }
            : spots[i % spots.length];
          const state = focus === null ? undefined : focus === i ? 'focus' : 'dim';
          return (
            <li
              key={p.slug}
              className={styles.bubbleSpot}
              style={{
                left: `${spot.x}%`,
                top: `${spot.y}%`,
                animationDuration: `${9 + (i % 3) * 2.6}s`,
                animationDelay: `${-i * 1.7}s`,
              }}
            >
              <Link
                to={`/writing/${p.slug}`}
                className={styles.bubble}
                data-state={state}
                style={{ borderRadius: blobs[i % blobs.length] }}
                onPointerEnter={() => setFocus(i)}
                onPointerLeave={() => setFocus(null)}
                onFocus={() => setFocus(i)}
                onBlur={() => setFocus(null)}
              >
                <span className={styles.bubbleDate}>{p.date}</span>
                <span className={styles.bubbleTitle}>
                  <Txt>{p.title}</Txt>
                </span>
                <span className={styles.bubbleStand}>
                  <Txt>{p.standfirst}</Txt>
                </span>
              </Link>
              <span className={styles.trail} aria-hidden="true">
                <span />
                <span />
              </span>
            </li>
          );
        })}
      </ul>
      <div className={styles.sleeper} aria-hidden="true">
        <Character
          id="writing"
          width={small ? 60 : 110}
          height={small ? 120 : 220}
          mood="sleepy"
          outline={3}
        />
      </div>
    </section>
  );
}
