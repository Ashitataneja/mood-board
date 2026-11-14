import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { sectionById } from '../content/sections';
import type { SectionId } from '../content/types';
import { useCharacterWorld } from '../characters/useMood';
import { HurryButton } from '../components/Hurry';
import { useDive } from '../dive/context';
import { isSectionId } from '../dive/routes';
import { sectionBodies } from '../sections/registry';
import { BackdropMoodContext, SectionContext } from '../shell/context';
import type { MoodId } from '../content/types';
import { WorkEyes } from '../sections/work/WorkEyes';
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

  // How the body changes: another section slides; a case study and its
  // index morph (the title flies between them); case to case slides quickly.
  const prevKey = useRef(key);
  const mode: Mode =
    prevKey.current === key
      ? 'slide'
      : prevKey.current.split('/')[0] !== id
        ? 'slide'
        : prevKey.current.includes('/') && key.includes('/')
          ? 'quick'
          : 'morph';
  // update after commit, never during render (StrictMode renders twice)
  useEffect(() => {
    prevKey.current = key;
  }, [key]);
  const variants = useMemo(() => bodyVariants(reduced), [reduced]);

  const [backdropMood, setBackdropMood] = useState<MoodId | undefined>();
  const backdrop = useMemo(
    () => ({ mood: backdropMood, setMood: setBackdropMood }),
    [backdropMood],
  );

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

        <BackdropMoodContext.Provider value={backdrop}>
          <AnimatePresence initial={false}>
            {id === 'work' && (
              <motion.div
                key="work-eyes"
                className={styles.backdrop}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduced ? 0.2 : 0.6 }}
              >
                <WorkEyes mood={backdropMood} />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence initial={false} custom={mode}>
            <motion.div
              key={key}
              className={styles.content}
              custom={mode}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <SectionContext.Provider value={s}>
                <Suspense fallback={null}>
                  <Body slug={slug} />
                </Suspense>
              </SectionContext.Provider>
            </motion.div>
          </AnimatePresence>
        </BackdropMoodContext.Provider>

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

type Mode = 'slide' | 'quick' | 'morph';

function bodyVariants(reduced: boolean) {
  const ease = [0.2, 0.8, 0.2, 1] as const;
  if (reduced) {
    return {
      enter: { opacity: 0 },
      center: { opacity: 1, transition: { duration: 0.2 } },
      exit: { opacity: 0, transition: { duration: 0.2 } },
    };
  }
  return {
    enter: (m: Mode) => (m === 'morph' ? { opacity: 1, x: 0 } : { opacity: 0, x: '18%' }),
    center: (m: Mode) => ({
      opacity: 1,
      x: 0,
      transition: { duration: m === 'quick' ? 0.42 : 0.6, ease },
    }),
    exit: (m: Mode) =>
      m === 'morph'
        ? { opacity: 0, transition: { duration: 0.3 } }
        : { opacity: 0, x: '-18%', transition: { duration: m === 'quick' ? 0.42 : 0.6, ease } },
  };
}
