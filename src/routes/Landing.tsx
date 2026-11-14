import { Link } from 'react-router-dom';
import { sections, site } from '../content/sections';
import styles from './stub.module.css';

// Phase 1 stub. The crowd arrives in phase 3.
export default function Landing() {
  return (
    <main id="main" className={styles.stage}>
      <h1 className="display">{site.name}</h1>
      <p className="label">{site.tagline}</p>
      <ul className={styles.list}>
        {sections.map((s) => (
          <li key={s.id}>
            <Link
              to={s.path}
              className={styles.chip}
              style={{ background: s.color, color: `var(--${s.text})` }}
            >
              {s.name}
            </Link>
          </li>
        ))}
        <li>
          <Link
            to="/playground"
            className={styles.chip}
            style={{ background: 'var(--paper)', color: 'var(--ink)' }}
          >
            Playground
          </Link>
        </li>
      </ul>
    </main>
  );
}
