import { useId, useState, type ReactNode } from 'react';
import { Txt } from '../common';
import styles from './blocks.module.css';

/**
 * Building blocks for case-study MDX. Use them in
 * src/content/work/<slug>/<stage>.mdx, e.g.
 *
 *   <Stat value="23" label="conversations" />
 *   <Quote by="Participant, NAB Delhi">…</Quote>
 *   <Figure src="/img/x.jpg" alt="…" caption="…" />
 *   <BeforeAfter before={{ src, alt }} after={{ src, alt }} />
 */

export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <p className={styles.stat}>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>
        <Txt>{label}</Txt>
      </span>
    </p>
  );
}

export function Quote({ children, by }: { children: ReactNode; by?: string }) {
  return (
    <figure className={styles.quote}>
      <blockquote>{children}</blockquote>
      {by && (
        <figcaption>
          <Txt>{by}</Txt>
        </figcaption>
      )}
    </figure>
  );
}

interface Media {
  src?: string;
  alt: string;
  video?: boolean;
}

function MediaEl({ src, alt, video }: Media) {
  if (!src) {
    return (
      <div className={styles.placeholder} role="img" aria-label={alt}>
        <span className="placeholder">[PLACEHOLDER: {alt}]</span>
      </div>
    );
  }
  if (video) {
    return (
      <video
        className={styles.media}
        src={src}
        aria-label={alt}
        controls
        muted
        playsInline
        preload="metadata"
      />
    );
  }
  return <img className={styles.media} src={src} alt={alt} loading="lazy" decoding="async" />;
}

export function Figure({ caption, ...media }: Media & { caption?: string }) {
  return (
    <figure className={styles.figure}>
      <MediaEl {...media} />
      {caption && (
        <figcaption>
          <Txt>{caption}</Txt>
        </figcaption>
      )}
    </figure>
  );
}

/**
 * Before/after comparison. A real range input drives it, so it works with
 * the keyboard and screen readers. The reveal uses transforms only.
 */
export function BeforeAfter({
  before,
  after,
  label = 'Before and after',
}: {
  before: Media;
  after: Media;
  label?: string;
}) {
  const [p, setP] = useState(50);
  const id = useId();
  return (
    <figure className={styles.ba}>
      <div className={styles.baStage}>
        <div className={styles.baLayer}>
          <MediaEl {...before} />
          <span className={styles.baTag}>Before</span>
        </div>
        {/* The window slides left while its content slides right by the same amount. */}
        <div className={styles.baWindow} style={{ transform: `translateX(${p}%)` }}>
          <div className={styles.baLayer} style={{ transform: `translateX(${-p}%)` }}>
            <MediaEl {...after} />
            <span className={`${styles.baTag} ${styles.baTagAfter}`}>After</span>
          </div>
        </div>
        <div
          className={styles.baHandle}
          style={{ transform: `translateX(${p}%)` }}
          aria-hidden="true"
        />
      </div>
      <label htmlFor={id} className={styles.baLabel}>
        {label}: drag to compare
      </label>
      <input
        id={id}
        className={styles.baRange}
        type="range"
        min={0}
        max={100}
        value={p}
        onChange={(e) => setP(Number(e.target.value))}
        aria-valuetext={`${100 - p}% after showing`}
      />
    </figure>
  );
}
