import { Panel } from '../shell/Track';
import { ShellTrack } from '../shell/ShellTrack';
import { HeroPanel, MediaPlaceholder, Txt } from './common';
import c from './common.module.css';
import { aboutFacts, aboutBio } from '../content/about';

// Phase 7 replaces the fact cards with the unfolding flower.
export default function About() {
  return (
    <ShellTrack label="About Ashita">
      <HeroPanel title="ABOUT" line="It opens up slowly." announce="About" />
      {aboutFacts.map((f, i) => (
        <Panel key={f.title} size="sm" labelledBy={`fact-${i}`}>
          <p className={c.eyebrow}>{String(i + 1).padStart(2, '0')} / 05</p>
          <h2 id={`fact-${i}`} className={c.cardTitleSm}>
            {f.title}
          </h2>
          <p className={c.body}>
            <Txt>{f.detail}</Txt>
          </p>
        </Panel>
      ))}
      <Panel size="md" labelledBy="bio">
        <h2 id="bio" className={c.cardTitleSm}>
          In a few sentences
        </h2>
        <p className={c.body}>
          <Txt>{aboutBio}</Txt>
        </p>
      </Panel>
      <Panel size="lg" label="Photos">
        <MediaPlaceholder label="a row of photos" tint="var(--tint-mint)" />
      </Panel>
    </ShellTrack>
  );
}
