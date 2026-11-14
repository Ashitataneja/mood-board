import { useState } from 'react';
import { Character } from '../characters/Character';
import { moodIds } from '../characters/moods';
import { useCharacterWorld } from '../characters/useMood';
import { sections } from '../content/sections';
import type { MoodId, SectionId } from '../content/types';
import styles from './Playground.module.css';

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

/** Fit a character's landing proportions into a box of the given height. */
function fit(id: SectionId, maxH: number, maxW = maxH) {
  const { w, h } = sections.find((s) => s.id === id)!.crowd;
  const k = Math.min(maxH / h, maxW / w);
  return { width: Math.round(w * k), height: Math.round(h * k) };
}

export default function Playground() {
  const world = useCharacterWorld();
  const [mood, setMood] = useState<MoodId | 'default'>('default');
  const [blink, setBlink] = useState(0);
  const [rotate, setRotate] = useState(false);

  return (
    <main id="main" className={styles.page}>
      <header className={styles.head}>
        <p className="label">/playground · phase 2 · characters</p>
        <h1>Playground</h1>
        <p className={styles.note}>
          Move the pointer: everyone watches it. Move it very fast: they flinch. Leave everything
          alone for 9 seconds: they fall asleep one by one.
        </p>
      </header>

      <section aria-labelledby="pg-controls" className={styles.controls}>
        <h2 id="pg-controls" className="visually-hidden">
          Controls
        </h2>
        <fieldset className={styles.fieldset}>
          <legend className="label">Mood for everyone</legend>
          <div className={styles.chips}>
            {(['default', ...moodIds] as const).map((m) => (
              <button
                key={m}
                type="button"
                className={styles.chip}
                aria-pressed={mood === m}
                onClick={() => setMood(m)}
              >
                {m}
              </button>
            ))}
          </div>
        </fieldset>
        <div className={styles.chips}>
          <button type="button" className={styles.action} onClick={() => setBlink((b) => b + 1)}>
            Blink
          </button>
          <button type="button" className={styles.action} onClick={world.debug.flinch}>
            Flinch
          </button>
          <button type="button" className={styles.action} onClick={world.debug.sleep}>
            Sleep now
          </button>
          <button type="button" className={styles.action} onClick={world.debug.wake}>
            Wake
          </button>
          <button
            type="button"
            className={styles.action}
            aria-pressed={rotate}
            onClick={() => setRotate((r) => !r)}
          >
            Spin bodies (face stays upright)
          </button>
          <span className="label" aria-live="polite">
            {world.reduced ? 'Reduced motion: on' : 'Reduced motion: off'} ·{' '}
            {world.asleep ? 'asleep' : 'awake'}
          </span>
        </div>
      </section>

      <section aria-labelledby="pg-cast" className={styles.block}>
        <h2 id="pg-cast">The cast</h2>
        <ul className={styles.cast}>
          {sections.map((s) => {
            const size = fit(s.id, 260, 240);
            return (
              <li key={s.id} className={styles.castItem}>
                <div className={rotate ? styles.spin : undefined}>
                  <Character
                    id={s.id}
                    {...size}
                    mood={mood === 'default' ? undefined : mood}
                    showName
                    blinkSignal={blink}
                  />
                </div>
                <p className="label">
                  {s.shape} · {mood === 'default' ? s.defaultMood : mood}
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="pg-small" className={styles.block}>
        <h2 id="pg-small">Progress size (76px, ink outline)</h2>
        <ul className={styles.strip}>
          {sections.map((s) => (
            <li key={s.id} style={{ background: s.color }} className={styles.stripItem}>
              <Character
                id={s.id}
                {...fit(s.id, 76)}
                outline={4}
                mood={mood === 'default' ? undefined : mood}
                blinkSignal={blink}
              />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="pg-matrix" className={styles.block}>
        <h2 id="pg-matrix">Every character × every mood</h2>
        <div className={styles.matrixWrap} role="region" aria-label="Mood matrix" tabIndex={0}>
          <table className={styles.matrix}>
            <thead>
              <tr>
                <th scope="col" className="label">
                  mood
                </th>
                {sections.map((s) => (
                  <th key={s.id} scope="col" className="label">
                    {s.id}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {moodIds.map((m) => (
                <tr key={m}>
                  <th scope="row" className="label">
                    {m}
                  </th>
                  {sections.map((s) => (
                    <td key={s.id}>
                      <Character
                        id={s.id}
                        {...fit(s.id, 96)}
                        mood={m}
                        flinch={false}
                        sleep={false}
                        breathe={false}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

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
        <p className={styles.h1}>H1 · Anton 84</p>
        <p className={styles.h2}>H2 · Anton 66</p>
        <p className={styles.h3}>H3 · Anton 40</p>
        <p>Body · Instrument Sans 20–22 / 1.45.</p>
        <p className="label">Label · Space Mono 13–15 · 2px tracking</p>
      </section>
    </main>
  );
}
