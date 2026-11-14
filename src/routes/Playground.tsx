import { sections } from '../content/sections';
import styles from './stub.module.css';

const swatches = [
  ['night', 'paper'],
  ['ink', 'paper'],
  ['paper', 'ink'],
  ['work', 'paper'],
  ['about', 'ink'],
  ['writing', 'paper'],
  ['gallery', 'ink'],
  ['contact', 'ink'],
  ['tint-lilac', 'ink'],
  ['tint-mint', 'ink'],
] as const;

// Dev playground. Phase 2 adds all 6 characters × all moods here.
export default function Playground() {
  return (
    <main id="main" className={styles.stage}>
      <p className="label">/playground · tokens and type</p>
      <h1>Playground</h1>

      <section aria-labelledby="pg-colour" className={styles.block}>
        <h2 id="pg-colour">Colour</h2>
        <ul className={styles.swatches}>
          {swatches.map(([bg, fg]) => (
            <li key={bg} style={{ background: `var(--${bg})`, color: `var(--${fg})` }}>
              <span className="label">--{bg}</span>
              <span>Aa on {fg}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="pg-type" className={styles.block}>
        <h2 id="pg-type">Type</h2>
        <p className="display">ANTON 210</p>
        <h1>H1 · Anton 84</h1>
        <h2>H2 · Anton 66</h2>
        <h3>H3 · Anton 40</h3>
        <p>
          Body · Instrument Sans 20–22 / 1.45. <strong>Semibold and bold</strong> are loaded too.
        </p>
        <p className="label">Label · Space Mono 13–15 · 2px tracking</p>
      </section>

      <section aria-labelledby="pg-cast" className={styles.block}>
        <h2 id="pg-cast">Cast (data only, characters arrive in phase 2)</h2>
        <ul className={styles.swatches}>
          {sections.map((s) => (
            <li key={s.id} style={{ background: s.color, color: `var(--${s.text})` }}>
              <span className="label">
                {s.id} · {s.shape} · {s.defaultMood}
              </span>
              <span>{s.hoverLine}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
