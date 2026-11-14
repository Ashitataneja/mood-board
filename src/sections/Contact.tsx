import { Link } from 'react-router-dom';
import { Panel } from '../shell/Track';
import { ShellTrack } from '../shell/ShellTrack';
import { HeroPanel } from './common';
import c from './common.module.css';
import { sectionById, site } from '../content/sections';

// Phase 8 replaces this with the chat form.
export default function Contact() {
  const hero = sectionById.contact.hero;
  return (
    <ShellTrack label="Contact">
      <HeroPanel title={hero.title} line={hero.line} announce="Contact" />
      <Panel size="md" labelledBy="direct">
        <h2 id="direct" className={c.cardTitleSm}>
          Reach me directly
        </h2>
        <ul className={c.list}>
          <li>
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </li>
          <li>
            <a href={site.linkedin} target="_blank" rel="noreferrer">
              LinkedIn<span className="visually-hidden"> (opens in a new tab)</span>
            </a>
          </li>
          <li>
            <Link to="/resume">Résumé</Link>
          </li>
        </ul>
      </Panel>
    </ShellTrack>
  );
}
