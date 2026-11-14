import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { caseStudies } from '../content/work';
import { panelMdx } from '../content/caseStudyMdx';
import type { CaseStudy, MoodId } from '../content/types';
import { Character } from '../characters/Character';
import { useDive } from '../dive/context';
import { useBackdropMood } from '../shell/context';
import { Panel } from '../shell/Track';
import { ShellTrack } from '../shell/ShellTrack';
import { HeroPanel, MediaPlaceholder, Tags, Txt } from './common';
import { TiltCard } from './work/TiltCard';
import { caseStudyComponents } from './work/mdxComponents';
import { motion } from 'motion/react';
import NotFound from '../routes/NotFound';
import c from './common.module.css';
import w from './work/Work.module.css';

const pad = (n: number) => String(n).padStart(2, '0');
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
const titleId = (slug: string) => `case-title-${slug}`;

export default function Work({ slug }: { slug?: string }) {
  if (!slug) return <WorkIndex />;
  const i = caseStudies.findIndex((cs) => cs.slug === slug);
  if (i < 0) return <NotFound />;
  return <CaseStudyView cs={caseStudies[i]} next={caseStudies[(i + 1) % caseStudies.length]} />;
}

function WorkIndex() {
  const { setMood } = useBackdropMood();
  useEffect(() => setMood('intense'), [setMood]);

  return (
    <ShellTrack label="Work: case studies" memoryKey="work-index">
      <HeroPanel title="WORK" line="Six case studies. Scroll sideways." announce="Work" />
      {caseStudies.map((cs, i) => (
        <Panel key={cs.slug} size="md" variant="bare" labelledBy={`cs-${cs.slug}`}>
          <TiltCard className={w.card}>
            <p className={c.eyebrow}>{cs.eyebrow}</p>
            <MediaPlaceholder
              label={`${cs.title} cover image`}
              tint={i % 2 ? 'var(--tint-mint)' : 'var(--tint-lilac)'}
            />
            <motion.h2
              id={`cs-${cs.slug}`}
              className={w.cardTitle}
              layoutId={titleId(cs.slug)}
              transition={{ type: 'spring', stiffness: 220, damping: 28 }}
            >
              <Txt>{cs.title}</Txt>
            </motion.h2>
            <p className={c.body}>{cs.summary}</p>
            <Tags tags={cs.tags} />
            <Link
              to={`/work/${cs.slug}`}
              state={{ fromCard: true }}
              className={c.go}
              aria-label={`Go inside ${cs.title}`}
            >
              Go inside →
            </Link>
          </TiltCard>
        </Panel>
      ))}
    </ShellTrack>
  );
}

function CaseStudyView({ cs, next }: { cs: CaseStudy; next: CaseStudy }) {
  const { setMood } = useBackdropMood();
  const { entry } = useDive();
  const fromCard = (useLocation().state as { fromCard?: boolean } | null)?.fromCard;
  const n = cs.panels.length;

  const stageFor = (i: number) =>
    i === 0 || i > n ? null : `${pad(i)} · ${cs.panels[i - 1].stage.toUpperCase()}`;
  const moodFor = (i: number): MoodId | undefined =>
    n === 0 ? 'sleepy' : i === 0 || i > n ? undefined : cs.panels[i - 1].mood;
  const announceFor = (i: number) =>
    i === 0 || i > n
      ? null
      : `Work, case study ${cs.title}, stage ${i} of ${n}: ${cap(cs.panels[i - 1].stage)}`;

  useEffect(() => setMood(moodFor(0) ?? 'intense'), []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ShellTrack
      label={`Case study ${cs.title}`}
      stageFor={stageFor}
      moodFor={moodFor}
      announceFor={announceFor}
      onActive={(i) => setMood(moodFor(i) ?? 'intense')}
      // the hero's title is flying in from the card: don't also fade it in
      revealFrom={fromCard && entry === 'switch' ? 1 : 0}
    >
      <HeroPanel
        title={cs.title}
        eyebrow={cs.eyebrow}
        line={cs.summary}
        announce={`Work, case study ${cs.title}`}
        titleLayoutId={titleId(cs.slug)}
      >
        <Tags tags={cs.tags} />
      </HeroPanel>
      {n === 0 ? (
        <Panel size="md" labelledBy="soon">
          <div className={w.stageRow}>
            <p className={w.chip}>MOOD · SLEEPY</p>
          </div>
          <div aria-hidden="true" className={w.soonFace}>
            <Character id="work" width={168} height={200} mood="sleepy" />
          </div>
          <h2 id="soon" className={w.panelTitle}>
            Coming soon
          </h2>
          <p className={w.body}>Still brewing.</p>
          <Link to={`/work/${next.slug}`} className={`${c.go} ${w.next}`}>
            Next case study →
          </Link>
        </Panel>
      ) : (
        cs.panels.map((p, i) => {
          const Extra = panelMdx(cs.slug, p.stage);
          return (
            <Panel key={p.stage} size={Extra ? 'xl' : p.stat ? 'lg' : 'md'} labelledBy={`st-${i}`}>
              <div className={w.stageRow}>
                <p className={w.stage}>
                  {pad(i + 1)} · {p.stage}
                </p>
                <p className={w.chip}>MOOD · {p.mood.toUpperCase()}</p>
              </div>
              {p.stat && (
                <p className={w.stat} aria-hidden="true">
                  {p.stat}
                </p>
              )}
              <h2 id={`st-${i}`} className={w.panelTitle}>
                {p.stat && <span className="visually-hidden">{p.stat} </span>}
                <Txt>{p.title}</Txt>
              </h2>
              <div className={w.body}>
                <p>
                  <Txt>{p.body}</Txt>
                </p>
                {Extra && (
                  <div className={w.blocks}>
                    <Extra components={caseStudyComponents} />
                  </div>
                )}
              </div>
              {i === n - 1 && (
                <Link to={`/work/${next.slug}`} className={`${c.go} ${w.next}`}>
                  Next case study →
                </Link>
              )}
            </Panel>
          );
        })
      )}
    </ShellTrack>
  );
}
