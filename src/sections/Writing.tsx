import { Link } from 'react-router-dom';
import { posts } from '../content/writing';
import { Panel } from '../shell/Track';
import { ShellTrack } from '../shell/ShellTrack';
import { HeroPanel, Txt } from './common';
import c from './common.module.css';
import { sectionById } from '../content/sections';
import NotFound from '../routes/NotFound';

// Phase 9 turns these into drifting thought bubbles and a vertical reading mode.
export default function Writing({ slug }: { slug?: string }) {
  const hero = sectionById.writing.hero;
  if (slug) {
    const post = posts.find((p) => p.slug === slug);
    if (!post) return <NotFound />;
    const Body = post.Body;
    return (
      <ShellTrack label={post.title}>
        <HeroPanel
          title="WRITING"
          eyebrow={post.date}
          line={post.standfirst}
          announce={`Writing, ${post.title}`}
        />
        <Panel size="xl" labelledBy="post-title">
          <h2 id="post-title" className={c.cardTitleSm}>
            <Txt>{post.title}</Txt>
          </h2>
          <div className={c.body}>
            <Body />
          </div>
        </Panel>
      </ShellTrack>
    );
  }
  return (
    <ShellTrack label="Writing: posts">
      <HeroPanel title={hero.title} line={hero.line} announce="Writing" />
      {posts.map((p) => (
        <Panel key={p.slug} size="sm" labelledBy={`post-${p.slug}`}>
          <p className={c.eyebrow}>{p.date}</p>
          <h2 id={`post-${p.slug}`} className={c.cardTitleSm}>
            <Txt>{p.title}</Txt>
          </h2>
          <p className={c.body}>
            <Txt>{p.standfirst}</Txt>
          </p>
          <Link to={`/writing/${p.slug}`} className={c.go} aria-label={`Read ${p.title}`}>
            Read →
          </Link>
        </Panel>
      ))}
    </ShellTrack>
  );
}
