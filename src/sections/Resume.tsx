import { useState } from 'react';
import { Character } from '../characters/Character';
import { useCharacterWorld } from '../characters/useMood';
import { resume } from '../content/resume';
import { site } from '../content/sections';
import { ShellTrack } from '../shell/ShellTrack';
import { Line, Typewriter } from './resume/Typewriter';
import { useArrival } from './useArrival';
import styles from './resume/Resume.module.css';

type Row = { what: string; where: string; when: string };
const row = (r: Row) => `${r.what}, ${r.where}`;

/**
 * Résumé: "the joke is that nothing moves". A rigid grid, typed out once.
 * The square sits in the corner and blinks, slowly, when the typing stops.
 */
export default function Resume() {
  const { reduced } = useCharacterWorld();
  const title = useArrival<HTMLHeadingElement>('Résumé');
  const [blink, setBlink] = useState(0);

  // Every typed line, in reading order. Indices are used below.
  const lines = [
    'RÉSUMÉ', // 0
    'ASHITA TANEJA · DESIGNER + RESEARCHER', // 1
    'EDUCATION', // 2
    ...resume.education.flatMap((r) => [row(r), r.when]), // 3..
  ];
  const at = (s: string) => lines.indexOf(s);
  const push = (s: string) => {
    lines.push(s);
    return lines.length - 1;
  };
  const exp = {
    head: push('EXPERIENCE'),
    rows: resume.experience.map((r) => [push(row(r)), push(r.when)]),
  };
  const skills = { head: push('SKILLS'), rows: resume.skills.map(push) };
  const pubs = { head: push('PUBLICATIONS'), rows: resume.publications.map(push) };
  const dl = push('DOWNLOAD PDF ↓');

  return (
    <ShellTrack label="Résumé" revealFrom={99}>
      <section data-panel className={styles.sheet} aria-labelledby="resume-title">
        <Typewriter lines={lines} instant={reduced} onDone={() => setBlink(1)}>
          <header className={styles.head}>
            <h1 id="resume-title" ref={title} tabIndex={-1} className={styles.title}>
              <Line i={0} text={lines[0]} />
            </h1>
            <p className={styles.who}>
              <Line i={1} text={lines[1]} />
            </p>
            <a href={site.resumePdf} download className={styles.download}>
              <Line i={dl} text={lines[dl]} />
            </a>
          </header>

          <div className={styles.grid}>
            <section aria-labelledby="r-edu">
              <h2 id="r-edu">
                <Line i={2} text="EDUCATION" />
              </h2>
              <dl>
                {resume.education.map((r) => (
                  <div key={row(r)}>
                    <dt>
                      <Line i={at(row(r))} text={row(r)} />
                    </dt>
                    <dd>
                      <Line i={at(r.when)} text={r.when} />
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
            <section aria-labelledby="r-exp">
              <h2 id="r-exp">
                <Line i={exp.head} text="EXPERIENCE" />
              </h2>
              <dl>
                {resume.experience.map((_, k) => (
                  <div key={k}>
                    <dt>
                      <Line i={exp.rows[k][0]} text={lines[exp.rows[k][0]]} />
                    </dt>
                    <dd>
                      <Line i={exp.rows[k][1]} text={lines[exp.rows[k][1]]} />
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
            <section aria-labelledby="r-skills">
              <h2 id="r-skills">
                <Line i={skills.head} text="SKILLS" />
              </h2>
              <ul>
                {skills.rows.map((i) => (
                  <li key={i}>
                    <Line i={i} text={lines[i]} />
                  </li>
                ))}
              </ul>
            </section>
            <section aria-labelledby="r-pubs">
              <h2 id="r-pubs">
                <Line i={pubs.head} text="PUBLICATIONS" />
              </h2>
              <ul>
                {pubs.rows.map((i) => (
                  <li key={i}>
                    <Line i={i} text={lines[i]} />
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </Typewriter>

        <div className={styles.square} aria-hidden="true">
          <Character
            id="resume"
            width={96}
            height={96}
            mood="deadpan"
            outline={2}
            look="viewer"
            breathe={false}
            flinch={false}
            sleep={false}
            autoBlink={false}
            blinkSignal={blink}
            blinkDuration={0.9}
          />
        </div>
      </section>
    </ShellTrack>
  );
}
