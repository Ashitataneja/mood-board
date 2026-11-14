import { Link, useParams } from 'react-router-dom';
import { sectionById } from '../content/sections';
import type { SectionId } from '../content/types';
import styles from './stub.module.css';

// Phase 1 stub: proves routing and deep links. Replaced by the section shell in phase 5.
export default function SectionStub({ id }: { id: SectionId }) {
  const s = sectionById[id];
  const { slug } = useParams();
  return (
    <main
      id="main"
      className={styles.stage}
      style={{
        background: s.color,
        color: `var(--${s.text})`,
        ['--focus-color' as string]: `var(--${s.text === 'ink' ? 'ink' : 'paper'})`,
      }}
    >
      <Link to="/" className={styles.pill}>
        ← Back to the crowd
      </Link>
      <h1 className="display">{s.hero.title}</h1>
      <p>{s.hero.line}</p>
      {slug && <p className="label">slug: {slug}</p>}
    </main>
  );
}
