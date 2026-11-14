import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Character } from '../characters/Character';
import { sections } from '../content/sections';
import { fitTo } from '../shell/fit';
import { useViewport } from '../hooks/useViewport';
import styles from './NotFound.module.css';

/** 404: the whole cast, worried, each looking somewhere different. */
export default function NotFound() {
  const vp = useViewport();
  const size = vp.w < 700 ? 92 : 168;
  useEffect(() => {
    document.title = 'Nothing here · Ashita Taneja';
  }, []);
  // Confused: everyone looks off in a different direction.
  const looks = useMemo(
    () => [
      { x: 0, y: 0 },
      { x: vp.w, y: 0 },
      { x: vp.w * 0.5, y: -400 },
      { x: -300, y: vp.h },
      { x: vp.w + 300, y: vp.h * 0.6 },
      { x: vp.w * 0.2, y: -200 },
    ],
    [vp.w, vp.h],
  );
  return (
    <main id="main" className={styles.page}>
      <h1 className={styles.title}>Nothing here.</h1>
      <p className={styles.line}>
        <Link to="/" className={styles.back}>
          Back to the crowd?
        </Link>
      </p>
      <ul className={styles.cast} aria-hidden="true">
        {sections.map((s, i) => {
          const { width, height } = fitTo(s.id, size * (s.id === 'writing' ? 1.4 : 1));
          return (
            <li key={s.id}>
              <Character
                id={s.id}
                width={width}
                height={height}
                mood="worried"
                look={looks[i]}
                showName
              />
            </li>
          );
        })}
      </ul>
    </main>
  );
}
