import { posts } from '../content/writing';
import { sectionById } from '../content/sections';
import { ShellTrack } from '../shell/ShellTrack';
import { HeroPanel } from './common';
import { Dreams } from './writing/Dreams';
import { Reader } from './writing/Reader';
import NotFound from '../routes/NotFound';

export default function Writing({ slug }: { slug?: string }) {
  if (slug) {
    const post = posts.find((p) => p.slug === slug);
    return post ? <Reader post={post} /> : <NotFound />;
  }
  const hero = sectionById.writing.hero;
  return (
    <ShellTrack label="Writing: posts">
      <HeroPanel title={hero.title} line={hero.line} announce="Writing" />
      <Dreams />
    </ShellTrack>
  );
}
