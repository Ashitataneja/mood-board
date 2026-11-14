import { gallery } from '../content/gallery';
import { Panel } from '../shell/Track';
import { ShellTrack } from '../shell/ShellTrack';
import { HeroPanel } from './common';
import c from './common.module.css';
import { sectionById } from '../content/sections';

// Phase 9 replaces this with burst-and-fling.
export default function Gallery() {
  const hero = sectionById.gallery.hero;
  const chunks = [gallery.slice(0, 4), gallery.slice(4, 8), gallery.slice(8, 12)];
  return (
    <ShellTrack label="Gallery">
      <HeroPanel title={hero.title} line={hero.line} announce="Gallery" />
      {chunks.map((chunk, i) => (
        <Panel key={i} size="lg" label={`Images ${i * 4 + 1} to ${i * 4 + chunk.length}`}>
          <ul
            className={c.grid}
            style={{ listStyle: 'none', margin: 0, padding: 0, gridTemplateColumns: '1fr 1fr' }}
          >
            {chunk.map((img) => (
              <li
                key={img.alt}
                role="img"
                aria-label={img.alt}
                style={{
                  background: img.placeholder,
                  borderRadius: 16,
                  border: '3px solid var(--ink)',
                }}
              />
            ))}
          </ul>
        </Panel>
      ))}
    </ShellTrack>
  );
}
