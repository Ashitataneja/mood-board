import { Suspense } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { sectionById } from '../content/sections';
import type { SectionId } from '../content/types';
import { useCharacterWorld } from '../characters/useMood';
import { HurryButton } from '../components/Hurry';
import { useDive } from '../dive/context';
import { isSectionId } from '../dive/routes';
import { sectionBodies } from '../sections/registry';
import { SectionContext } from '../shell/context';
import { Peeks } from '../shell/Peeks';
import { useViewport } from '../hooks/useViewport';
import NotFound from './NotFound';
import styles from './SectionRoute.module.css';

/**
 * The section shell, shared by every section URL. It stays mounted while
 * you move between sections: the colour cross-fades, the body slides, and
 * the pills and peeking characters stay put.
 */
export default function SectionRoute() {
  const { section, slug } = useParams();
  if (!isSectionId(section)) return <NotFound />;
  return <SectionShell id={section} slug={slug} />;
}

function SectionShell({ id, slug }: { id: SectionId; slug?: string }) {
  const s = sectionById[id];
  const { reduced } = useCharacterWorld();
  const dive = useDive();
  const text = `var(--${s.text})`;
  const key = slug ? `${id}/${slug}` : id;
  const Body = sectionBodies[id];
  const narrow = useViewport().w < 600;

  const back = slug
    ? { to: `/${id}`, label: `← Back to ${s.name}` }
    : { to: '/', label: '← Back to the crowd' };

  const slide = reduced
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.2 },
      }
    : {
        initial: { opacity: 0, x: '18%' },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: '-18%' },
        transition: { duration: 0.6, ease: [0.2, 0.8, 0.2, 1] as const },
      };

  return (
    <SectionContext.Provider value={s}>
      <main
        id="main"
        className={styles.shell}
        data-section={id}
        style={{ color: text, ['--focus-color' as string]: text }}
      >
        {/* Background colour cross-fades when switching sections. */}
        <AnimatePresence initial={false}>
          <motion.div
            key={id}
            className={styles.bg}
            style={{ background: s.color }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 1, transition: { duration: reduced ? 0.2 : 0.6 } }}
            transition={{ duration: reduced ? 0.2 : 0.6 }}
          />
        </AnimatePresence>

        <AnimatePresence initial={false}>
          <motion.div key={key} className={styles.content} {...slide}>
            <SectionContext.Provider value={s}>
              <Suspense fallback={null}>
                <Body slug={slug} />
              </Suspense>
            </SectionContext.Provider>
          </motion.div>
        </AnimatePresence>

        <div className={styles.top}>
          <Link
            to={back.to}
            className={styles.pill}
            onClick={(e) => {
              if (slug || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
              e.preventDefault();
              dive.exit();
            }}
          >
            {back.label}
          </Link>
          <HurryButton tone={s.text} compact={narrow} />
        </div>

        <Peeks />
      </main>
    </SectionContext.Provider>
  );
}
