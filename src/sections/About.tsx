import { Panel } from '../shell/Track';
import { ShellTrack } from '../shell/ShellTrack';
import { HeroPanel, Txt } from './common';
import { Flower } from './about/Flower';
import { aboutBio, aboutPhotos } from '../content/about';
import c from './common.module.css';
import a from './about/About.module.css';

// one stop for the closed bud, one per petal
const STOPS = 6;

export default function About() {
  return (
    <ShellTrack label="About Ashita">
      <HeroPanel title="ABOUT" line="It opens up slowly." announce="About" />
      <Flower stops={STOPS} />
      <Panel size="md" labelledBy="bio">
        <h2 id="bio" className={c.cardTitleSm}>
          In a few sentences
        </h2>
        <p className={c.body}>
          <Txt>{aboutBio}</Txt>
        </p>
      </Panel>
      <Panel size="xl" label="Photos">
        <ul className={a.photos}>
          {aboutPhotos.map((p) => (
            <li key={p.alt}>
              {p.src ? (
                <img src={p.src} alt={p.alt} loading="lazy" />
              ) : (
                <span role="img" aria-label={p.alt}>
                  <Txt>{p.alt}</Txt>
                </span>
              )}
            </li>
          ))}
        </ul>
      </Panel>
    </ShellTrack>
  );
}
