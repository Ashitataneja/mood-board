import { Link } from 'react-router-dom';
import { caseStudies } from '../content/work';
import type { CaseStudy, MoodId } from '../content/types';
import { Character } from '../characters/Character';
import { Panel } from '../shell/Track';
import { ShellTrack } from '../shell/ShellTrack';
import { HeroPanel, MediaPlaceholder, Tags, Txt } from './common';
import c from './common.module.css';
import NotFound from '../routes/NotFound';

const pad = (n: number) => String(n).padStart(2, '0');
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

export default function Work({ slug }: { slug?: string }) {
  if (!slug) return <WorkIndex />;
  const i = caseStudies.findIndex((cs) => cs.slug === slug);
  if (i < 0) return <NotFound />;
  return <CaseStudyView cs={caseStudies[i]} next={caseStudies[(i + 1) % caseStudies.length]} />;
}

function WorkIndex() {
  return (
    <ShellTrack label="Work: case studies">
      <HeroPanel title="WORK" line="Six case studies. Scroll sideways." announce="Work" />
      {caseStudies.map((cs, i) => (
        <Panel key={cs.slug} size="md" labelledBy={`cs-${cs.slug}`}>
          <p className={c.eyebrow}>{cs.eyebrow}</p>
          <MediaPlaceholder
            label={`${cs.title} cover image`}
            tint={i % 2 ? 'var(--tint-mint)' : 'var(--tint-lilac)'}
          />
          <h2 id={`cs-${cs.slug}`} className={c.cardTitle}>
            <Txt>{cs.title}</Txt>
          </h2>
          <p className={c.body}>{cs.summary}</p>
          <Tags tags={cs.tags} />
          <Link to={`/work/${cs.slug}`} className={c.go} aria-label={`Go inside ${cs.title}`}>
            Go inside →
          </Link>
        </Panel>
      ))}
    </ShellTrack>
  );
}

function CaseStudyView({ cs, next }: { cs: CaseStudy; next: CaseStudy }) {
  const n = cs.panels.length;
  const stageFor = (i: number) =>
    i === 0 || i > n ? null : `${pad(i)} · ${cs.panels[i - 1].stage.toUpperCase()}`;
  const moodFor = (i: number): MoodId | undefined =>
    n === 0 ? 'sleepy' : i === 0 || i > n ? undefined : cs.panels[i - 1].mood;
  const announceFor = (i: number) =>
    i === 0 || i > n
      ? null
      : `Work, case study ${cs.title}, stage ${i} of ${n}: ${cap(cs.panels[i - 1].stage)}`;

  return (
    <ShellTrack
      label={`Case study ${cs.title}`}
      stageFor={stageFor}
      moodFor={moodFor}
      announceFor={announceFor}
    >
      <HeroPanel
        title={cs.title}
        eyebrow={cs.eyebrow}
        line={cs.summary}
        announce={`Work, case study ${cs.title}`}
      >
        <Tags tags={cs.tags} />
      </HeroPanel>
      {n === 0 ? (
        <Panel size="md" labelledBy="soon">
          <p className={c.chip}>MOOD · SLEEPY</p>
          <div aria-hidden="true" style={{ alignSelf: 'center' }}>
            <Character id="work" width={180} height={214} mood="sleepy" />
          </div>
          <h2 id="soon" className={c.cardTitleSm}>
            Coming soon
          </h2>
          <p className={c.body}>Still brewing.</p>
          <Link to="/work" className={c.go}>
            ← All case studies
          </Link>
        </Panel>
      ) : (
        cs.panels.map((p, i) => (
          <Panel key={p.stage} size={p.stat ? 'lg' : 'md'} labelledBy={`st-${i}`}>
            <p className={c.eyebrow}>
              {pad(i + 1)} · {p.stage}
            </p>
            <p className={c.chip}>MOOD · {p.mood.toUpperCase()}</p>
            {p.stat && (
              <p className={c.stat} aria-hidden="true">
                {p.stat}
              </p>
            )}
            <h2 id={`st-${i}`} className={c.cardTitleSm}>
              {p.stat && <span className="visually-hidden">{p.stat} </span>}
              <Txt>{p.title}</Txt>
            </h2>
            <p className={c.body}>
              <Txt>{p.body}</Txt>
            </p>
            {i === n - 1 && (
              <Link to={`/work/${next.slug}`} className={c.go}>
                Next case study →
              </Link>
            )}
          </Panel>
        ))
      )}
    </ShellTrack>
  );
}
