import { useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { sectionById } from '../content/sections';
import { useCharacterWorld } from '../characters/useMood';
import { HurryButton } from '../components/Hurry';
import { Reveal } from '../components/Reveal';
import { useDive } from '../dive/context';
import { isSectionId } from '../dive/routes';
import NotFound from './NotFound';
import styles from './SectionRoute.module.css';

/**
 * One component for every section URL, so it stays mounted when you move
 * between sections and can cross-fade and slide instead of remounting.
 * Phase 5 turns the body into the horizontal shell.
 */
export default function SectionRoute() {
  const { section, slug } = useParams();
  if (!isSectionId(section)) return <NotFound />;
  return <SectionView id={section} slug={slug} />;
}

function SectionView({ id, slug }: { id: keyof typeof sectionById; slug?: string }) {
  const s = sectionById[id];
  const { reduced } = useCharacterWorld();
  const dive = useDive();
  const title = useRef<HTMLHeadingElement>(null);
  const text = `var(--${s.text})`;
  const key = slug ? `${id}/${slug}` : id;

  // Move focus to the new section's title so keyboard and screen reader users land inside.
  useEffect(() => {
    const t = window.setTimeout(() => title.current?.focus({ preventScroll: true }), 50);
    return () => window.clearTimeout(t);
  }, [key]);

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
    <main
      id="main"
      className={styles.shell}
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
        <HurryButton tone={s.text} />
      </div>

      <AnimatePresence initial={false}>
        <motion.div key={key} className={styles.content} {...slide}>
          <Reveal i={0}>
            <h1 ref={title} tabIndex={-1} className={`display ${styles.title}`}>
              {s.hero.title}
            </h1>
          </Reveal>
          <Reveal i={1}>
            <p className={styles.line}>{s.hero.line}</p>
          </Reveal>
          {slug && (
            <Reveal i={2}>
              <p className="label">{slug}</p>
            </Reveal>
          )}
          <Reveal i={3}>
            <p className={`label ${styles.note}`}>
              Phase 4 placeholder. The horizontal shell arrives in phase 5. Press Escape to go back.
            </p>
          </Reveal>
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
