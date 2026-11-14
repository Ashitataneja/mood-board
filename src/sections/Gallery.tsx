import { sectionById } from '../content/sections';
import { ShellTrack } from '../shell/ShellTrack';
import { HeroPanel } from './common';
import { Burst } from './gallery/Burst';

export default function Gallery() {
  const hero = sectionById.gallery.hero;
  return (
    <ShellTrack label="Gallery">
      <HeroPanel title={hero.title} line={hero.line} announce="Gallery" />
      <Burst />
    </ShellTrack>
  );
}
