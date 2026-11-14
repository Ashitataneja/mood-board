import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { sections, site } from '../content/sections';
import { caseStudies } from '../content/work';
import { useCharacterWorld } from '../characters/useMood';
import styles from './Hurry.module.css';

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** "In a hurry?" pill plus the plain-list overlay. Works with no playful interaction at all. */
export function HurryButton({
  tone = 'paper',
  compact = false,
}: {
  tone?: 'paper' | 'ink';
  /** Hide the "Plain list" hint visually (it stays in the accessible name) */
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const opener = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button
        ref={opener}
        type="button"
        className={styles.pill}
        data-tone={tone}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        In a hurry? <span className={compact ? 'visually-hidden' : styles.pillSub}>Plain list</span>
      </button>
      {createPortal(
        <AnimatePresence>
          {open && (
            <HurryOverlay
              onClose={() => {
                setOpen(false);
                opener.current?.focus();
              }}
            />
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}

function HurryOverlay({ onClose }: { onClose: () => void }) {
  const { reduced } = useCharacterWorld();
  const ref = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    title.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
      if (e.key === 'Tab' && ref.current) {
        const items = Array.from(ref.current.querySelectorAll<HTMLElement>(FOCUSABLE));
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (
          e.shiftKey &&
          (document.activeElement === first || document.activeElement === title.current)
        ) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => {
      window.removeEventListener('keydown', onKey, true);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const t = reduced ? { duration: 0.2 } : { duration: 0.32, ease: [0.2, 0.8, 0.2, 1] as const };
  const order = ['work', 'about', 'writing', 'gallery', 'contact', 'resume'];
  const ordered = [...sections].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));

  return (
    <motion.div
      ref={ref}
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="hurry-title"
      initial={{ opacity: 0, y: reduced ? 0 : 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: reduced ? 0 : 24 }}
      transition={t}
    >
      <div className={styles.inner}>
        <div className={styles.top}>
          <h2 id="hurry-title" ref={title} tabIndex={-1} className={styles.title}>
            THE QUICK VERSION
          </h2>
          <button type="button" className={styles.close} onClick={onClose}>
            ← Back to the moods
          </button>
        </div>
        <p className={styles.intro}>
          Ashita Taneja. Designer and researcher. M.Des, Smart Product Design, IIT Jodhpur
          (2024–2026).
        </p>

        <nav aria-label="Sections">
          <ul className={styles.sections}>
            {ordered.map((s) => (
              <li key={s.id}>
                <Link
                  to={s.path}
                  onClick={onClose}
                  className={styles.section}
                  style={{ background: s.color, color: `var(--${s.text})` }}
                >
                  <span className={styles.sectionName}>{s.name}</span>
                  <span className={styles.sectionLine}>{s.hoverLine}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <section aria-labelledby="hurry-work" className={styles.block}>
          <h3 id="hurry-work" className={styles.blockTitle}>
            Case studies
          </h3>
          <ol className={styles.cases}>
            {caseStudies.map((c) => (
              <li key={c.slug}>
                <Link to={`/work/${c.slug}`} onClick={onClose} className={styles.case}>
                  <span className={styles.caseEyebrow}>{c.eyebrow}</span>
                  <span className={styles.caseTitle}>{c.title}</span>
                  <span className={styles.caseSummary}>{c.summary}</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="hurry-contact" className={styles.block}>
          <h3 id="hurry-contact" className={styles.blockTitle}>
            Résumé and contact
          </h3>
          <ul className={styles.links}>
            <li>
              <a href={site.resumePdf} download className={styles.link}>
                Download résumé (PDF) ↓
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className={styles.link}>
                {site.email}
              </a>
            </li>
            <li>
              <a href={site.linkedin} className={styles.link} target="_blank" rel="noreferrer">
                LinkedIn ↗<span className="visually-hidden"> (opens in a new tab)</span>
              </a>
            </li>
            <li>
              <Link to="/contact" onClick={onClose} className={styles.link}>
                Contact form →
              </Link>
            </li>
          </ul>
        </section>
      </div>
    </motion.div>
  );
}
