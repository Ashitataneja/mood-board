import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { useArrival } from './useArrival';
import { Panel } from '../shell/Track';
import styles from './common.module.css';

/**
 * Renders content text, marking any "[PLACEHOLDER …]" so it's visibly unfinished.
 */
export function Txt({ children }: { children: string }) {
  const parts = children.split(/(\[[^\]]*\])/g).filter(Boolean);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('[') ? (
          <span key={i} className="placeholder">
            {p}
          </span>
        ) : (
          p
        ),
      )}
    </>
  );
}

/**
 * First panel of every section: the display title (focused on arrival so
 * keyboard and screen reader users land inside) and one line.
 */
export function HeroPanel({
  title,
  line,
  eyebrow,
  announce,
  children,
  titleLayoutId,
}: {
  title: string;
  line?: string;
  eyebrow?: string;
  /** Read out in the live region when this view opens */
  announce: string;
  children?: ReactNode;
  /** Shared-layout id: the title flies in from an element with the same id */
  titleLayoutId?: string;
}) {
  const h1 = useArrival<HTMLHeadingElement>(announce);

  return (
    <Panel size="hero" variant="plain">
      {eyebrow && <p className="label">{eyebrow}</p>}
      <motion.h1
        ref={h1}
        tabIndex={-1}
        className={`display ${styles.heroTitle}`}
        data-section-title
        layoutId={titleLayoutId}
        transition={{ type: 'spring', stiffness: 220, damping: 28 }}
      >
        {title}
      </motion.h1>
      {line && (
        <p className={styles.heroLine}>
          <Txt>{line}</Txt>
        </p>
      )}
      {children}
      <p className={`label ${styles.hint}`} aria-hidden="true">
        Scroll sideways →
      </p>
    </Panel>
  );
}

export function Tags({ tags }: { tags: string[] }) {
  return (
    <ul className={styles.tags} aria-label="Tags">
      {tags.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  );
}

/** A tinted box standing in for an image until real media arrives. */
export function MediaPlaceholder({
  label,
  tint = 'var(--tint-lilac)',
}: {
  label: string;
  tint?: string;
}) {
  return (
    <div className={styles.media} style={{ background: tint }} role="img" aria-label={label}>
      <span className="placeholder">[PLACEHOLDER: {label}]</span>
    </div>
  );
}
