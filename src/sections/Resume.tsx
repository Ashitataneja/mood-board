import { Panel } from '../shell/Track';
import { ShellTrack } from '../shell/ShellTrack';
import { HeroPanel, Txt } from './common';
import c from './common.module.css';
import { sectionById, site } from '../content/sections';
import { resume } from '../content/resume';

// Phase 9 makes this the rigid typewriter grid.
export default function Resume() {
  const hero = sectionById.resume.hero;
  const rows = (items: { what: string; where: string; when: string }[]) => (
    <ul className={c.list}>
      {items.map((r, i) => (
        <li key={i}>
          <Txt>{r.what}</Txt>, {r.where} · <Txt>{r.when}</Txt>
        </li>
      ))}
    </ul>
  );
  return (
    <ShellTrack label="Résumé">
      <HeroPanel title={hero.title} line={hero.line} announce="Résumé" />
      <Panel size="md" labelledBy="edu">
        <h2 id="edu" className={c.cardTitleSm}>
          Education
        </h2>
        {rows(resume.education)}
      </Panel>
      <Panel size="md" labelledBy="exp">
        <h2 id="exp" className={c.cardTitleSm}>
          Experience
        </h2>
        {rows(resume.experience)}
      </Panel>
      <Panel size="sm" labelledBy="skills">
        <h2 id="skills" className={c.cardTitleSm}>
          Skills
        </h2>
        <p className={c.body}>
          <Txt>{resume.skills.join(', ')}</Txt>
        </p>
      </Panel>
      <Panel size="sm" labelledBy="pubs">
        <h2 id="pubs" className={c.cardTitleSm}>
          Publications
        </h2>
        <p className={c.body}>
          <Txt>{resume.publications.join(', ')}</Txt>
        </p>
      </Panel>
      <Panel size="sm" labelledBy="pdf">
        <h2 id="pdf" className={c.cardTitleSm}>
          One page
        </h2>
        <a href={site.resumePdf} download className={c.go}>
          Download PDF ↓
        </a>
      </Panel>
    </ShellTrack>
  );
}
