import { useEffect, useRef, useState } from 'react';
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  type MotionValue,
} from 'motion/react';
import { useCharacterWorld } from '../../characters/useMood';
import { aboutFacts, aboutPhoto } from '../../content/about';
import { Txt } from '../common';
import styles from './About.module.css';

const PETALS = 5;
const HINGE = 24; // radius (of 100) where petals fold; the photo sits inside it
// Stop k (of PETALS + 1) sits at progress k / PETALS, where exactly k petals are open.
const SPAN = 1 / PETALS;

const toRad = (d: number) => (d * Math.PI) / 180;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** θ in degrees, 0 = up, clockwise. */
const polar = (theta: number, r: number): [number, number] => [
  50 + r * Math.sin(toRad(theta)),
  50 - r * Math.cos(toRad(theta)),
];

/** One petal: the flower outline r = 39 + 11·cos(5t) between θk ± 36°, down to the hinge arc. */
function petalPath(k: number) {
  const c = k * 72;
  const pts: string[] = [];
  for (let i = 0; i <= 36; i++) {
    const t = c - 36 + i * 2;
    const [x, y] = polar(t, 39 + 11 * Math.cos(5 * toRad(t)));
    pts.push(`${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  const [ax, ay] = polar(c + 36, HINGE);
  const [bx, by] = polar(c - 36, HINGE);
  return `M${pts.join('L')}L${ax.toFixed(2)} ${ay.toFixed(2)}A${HINGE} ${HINGE} 0 0 0 ${bx.toFixed(2)} ${by.toFixed(2)}Z`;
}
const petals = Array.from({ length: PETALS }, (_, k) => ({ k, theta: k * 72, d: petalPath(k) }));

/** How open petal k is (−1 folded over the photo … 1 open) at flower progress p. */
const fold = (p: number, k: number) => -1 + 2 * ease(clamp01((p - k * SPAN) / SPAN));

/**
 * The About flower. Its progress comes from how far the track has scrolled
 * through this (extra-wide) panel; the stage stays pinned while it does.
 */
export function Flower({ stops }: { stops: number }) {
  const { reduced, flinching } = useCharacterWorld();
  const panel = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const progress = useMotionValue(reduced ? 1 : 0);
  const shy = useMotionValue(0);
  const [size, setSize] = useState({ w: 1000, h: 560 });

  // Stage size (re-render on resize only).
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) =>
      setSize({ w: e.contentRect.width, h: e.contentRect.height }),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Progress through the panel, from the track's scroll position.
  useEffect(() => {
    if (reduced) {
      progress.set(1);
      return;
    }
    const el = panel.current;
    const track = el?.closest<HTMLElement>('[role=region]');
    if (!el || !track || !stage.current) return;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const t = track.getBoundingClientRect();
      const pad = parseFloat(getComputedStyle(track).paddingLeft) || 0;
      const range = r.width - stage.current!.offsetWidth;
      progress.set(range > 0 ? clamp01((t.left + pad - r.left) / range) : 1);
    };
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    track.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    return () => {
      track.removeEventListener('scroll', queue);
      window.removeEventListener('resize', queue);
      cancelAnimationFrame(raf);
    };
  }, [progress, reduced]);

  // Shy: a fast pointer makes the petals flinch half-closed and the flower blush.
  // It opens again once the pointer has been calm for 600ms.
  useEffect(() => {
    if (flinching) {
      const a = animate(shy, 1, { type: 'spring', stiffness: 400, damping: 22 });
      return () => a.stop();
    }
    let a: ReturnType<typeof animate> | undefined;
    const t = window.setTimeout(() => {
      a = animate(shy, 0, { type: 'spring', stiffness: 120, damping: 18 });
    }, 600);
    return () => {
      window.clearTimeout(t);
      a?.stop();
    };
  }, [flinching, shy]);

  // Layout
  const narrow = size.w < 820;
  const F = narrow
    ? Math.min(size.w * 0.72, size.h * 0.56, 340)
    : Math.min(size.h * 0.92, 500, size.w * 0.42);
  const cx = size.w / 2;
  const cy = narrow ? F / 2 + 4 : size.h / 2;
  const cardW = narrow ? Math.min(size.w, 340) : 250;
  const gap = 36;
  // Where each fact card ends up: right column for the top/right petals, left for the rest.
  const slots = narrow
    ? petals.map(() => ({ x: cx - cardW / 2, y: F + 18 }))
    : [
        { x: cx + F / 2 + gap, y: cy - F * 0.46 },
        { x: cx + F / 2 + gap, y: cy - F * 0.08 },
        { x: cx + F / 2 + gap, y: cy + F * 0.3 },
        { x: cx - F / 2 - gap - cardW, y: cy + F * 0.12 },
        { x: cx - F / 2 - gap - cardW, y: cy - F * 0.32 },
      ];

  const photoOpacity = useTransform(progress, [0.02, SPAN * 0.8], [0, 1]);

  return (
    <section
      ref={panel}
      className={styles.flowerPanel}
      style={{ ['--stops' as string]: stops }}
      aria-labelledby="about-facts"
    >
      {/* Invisible stops so arrow keys and the active-panel logic step petal by petal. */}
      {Array.from({ length: stops }, (_, i) => (
        <div
          key={i}
          data-panel
          className={styles.stop}
          style={{ left: `calc(${i} * var(--stop-w))` }}
        />
      ))}

      <div ref={stage} className={styles.stage}>
        <h2 id="about-facts" className="visually-hidden">
          Five things about me
        </h2>

        <motion.div
          className={styles.blush}
          style={{
            left: cx - F * 0.75,
            top: cy - F * 0.75,
            width: F * 1.5,
            height: F * 1.5,
            opacity: shy,
          }}
          aria-hidden="true"
        />

        <div
          className={styles.flower}
          style={{ left: cx - F / 2, top: cy - F / 2, width: F, height: F }}
        >
          <div className={styles.photo} style={{ inset: `${50 - HINGE + 1}%` }}>
            <motion.div style={{ opacity: photoOpacity }} className={styles.photoInner}>
              {aboutPhoto.src ? (
                <img src={aboutPhoto.src} alt={aboutPhoto.alt} />
              ) : (
                <div role="img" aria-label={aboutPhoto.alt} className={styles.photoPlaceholder}>
                  <span className="placeholder">[PLACEHOLDER: photo]</span>
                </div>
              )}
            </motion.div>
          </div>
          <svg viewBox="0 0 100 100" className={styles.petals} aria-hidden="true" focusable="false">
            {petals.map((p) => (
              <Petal key={p.k} {...p} progress={progress} shy={shy} />
            ))}
          </svg>
        </div>

        <ol className={styles.facts}>
          {aboutFacts.map((f, k) => (
            <FactCard
              key={f.title}
              k={k}
              title={f.title}
              detail={f.detail}
              progress={progress}
              from={
                polar(petals[k].theta, 42).map(
                  (v, i) => (v / 100) * F + (i === 0 ? cx - F / 2 : cy - F / 2),
                ) as [number, number]
              }
              to={slots[k]}
              width={cardW}
              narrow={narrow}
            />
          ))}
        </ol>
      </div>
    </section>
  );
}

function Petal({
  k,
  theta,
  d,
  progress,
  shy,
}: {
  k: number;
  theta: number;
  d: string;
  progress: MotionValue<number>;
  shy: MotionValue<number>;
}) {
  const g = useRef<SVGGElement>(null);
  const path = useRef<SVGPathElement>(null);
  const [hx, hy] = polar(theta, HINGE);

  const write = () => {
    let s = fold(progress.get(), k);
    // flinch: open petals fold back halfway (to edge-on)
    s -= shy.get() * (s + 1) * 0.5;
    if (Math.abs(s) < 0.02) s = s < 0 ? -0.02 : 0.02;
    g.current?.setAttribute(
      'transform',
      `translate(${hx} ${hy}) rotate(${theta}) scale(1 ${s.toFixed(4)}) rotate(${-theta}) translate(${-hx} ${-hy})`,
    );
    // the back of a petal (still folded) is a shade darker
    path.current?.setAttribute('data-back', s < 0 ? 'true' : 'false');
  };
  useMotionValueEvent(progress, 'change', write);
  useMotionValueEvent(shy, 'change', write);
  useEffect(write); // first paint and after layout changes

  return (
    <g ref={g}>
      <path ref={path} d={d} className={styles.petal} />
    </g>
  );
}

function FactCard({
  k,
  title,
  detail,
  progress,
  from,
  to,
  width,
  narrow,
}: {
  k: number;
  title: string;
  detail: string;
  progress: MotionValue<number>;
  from: [number, number];
  to: { x: number; y: number };
  width: number;
  narrow: boolean;
}) {
  // 0 → 1 once its petal is mostly open; on narrow screens it gives way to the next one.
  const open = useTransform(progress, (p) => {
    const mine = clamp01((fold(p, k) - 0.1) / 0.9);
    if (!narrow || k === PETALS - 1) return mine;
    const nextOpen = clamp01((fold(p, k + 1) - 0.1) / 0.9);
    return mine * (1 - nextOpen);
  });
  const dx = from[0] - (to.x + width / 2);
  const dy = from[1] - to.y;
  const x = useTransform(open, (o) => (narrow ? 0 : (1 - o) * dx));
  const y = useTransform(open, (o) => (narrow ? (1 - o) * 20 : (1 - o) * dy));
  const scale = useTransform(open, [0, 1], [narrow ? 0.96 : 0.5, 1]);

  return (
    <motion.li
      className={styles.fact}
      style={{ left: to.x, top: to.y, width, x, y, scale, opacity: open }}
    >
      <span className={styles.factNo}>{String(k + 1).padStart(2, '0')}</span>
      <span className={styles.factTitle}>{title}</span>
      <span className={styles.factDetail}>
        <Txt>{detail}</Txt>
      </span>
    </motion.li>
  );
}
