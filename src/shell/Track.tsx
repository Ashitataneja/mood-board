import { Children, useEffect, useRef, type ReactNode } from 'react';
import type { MotionValue } from 'motion/react';
import { useCharacterWorld } from '../characters/useMood';
import { Reveal } from '../components/Reveal';
import styles from './Track.module.css';

const LERP = 0.12;

export interface TrackProps {
  /** Accessible name for the scroll region */
  label: string;
  children: ReactNode;
  /** 0–1 horizontal progress, written on every scroll frame (no re-render) */
  progress: MotionValue<number>;
  /** Called when the active panel changes */
  onActive?: (index: number) => void;
  /** Panels before this index skip the fade-and-rise entrance */
  revealFrom?: number;
  /** Remember the scroll position under this key and restore it on return */
  memoryKey?: string;
}

const memory = new Map<string, number>();

/**
 * The horizontal track. Native horizontal scrolling (touch, trackpads,
 * scrollbar-less), plus: vertical wheel → horizontal with a lerp glide,
 * arrow keys and PageUp/PageDown step panel by panel, and an "active"
 * panel nearest the left third of the viewport.
 */
export function Track({
  label,
  children,
  progress,
  onActive,
  revealFrom = 0,
  memoryKey,
}: TrackProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { reduced } = useCharacterWorld();
  const onActiveRef = useRef(onActive);
  onActiveRef.current = onActive;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (memoryKey && memory.has(memoryKey)) el.scrollLeft = memory.get(memoryKey)!;
    let pos = el.scrollLeft;
    let target = pos;
    let raf = 0;
    let gliding = false;
    let active = -1;
    let measureQueued = 0;

    const max = () => Math.max(0, el.scrollWidth - el.clientWidth);
    const clamp = (v: number) => Math.min(max(), Math.max(0, v));
    const panels = () => Array.from(el.querySelectorAll<HTMLElement>('[data-panel]'));

    const measure = () => {
      measureQueued = 0;
      const m = max();
      progress.set(m > 0 ? el.scrollLeft / m : 0);
      const box = el.getBoundingClientRect();
      const probe = box.left + el.clientWidth / 3;
      const list = panels();
      let best = 0;
      let bestDist = Infinity;
      list.forEach((p, i) => {
        const r = p.getBoundingClientRect();
        const d = probe < r.left ? r.left - probe : probe > r.right ? probe - r.right : 0;
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      // At the very end, the last panel can't reach the left third: let it win.
      if (m > 0 && el.scrollLeft >= m - 2) best = list.length - 1;
      if (best !== active) {
        list.forEach((p, i) => p.toggleAttribute('data-active', i === best));
        active = best;
        onActiveRef.current?.(best);
      }
    };
    const queueMeasure = () => {
      if (!measureQueued) measureQueued = requestAnimationFrame(measure);
    };

    const tick = () => {
      pos += (target - pos) * LERP;
      if (Math.abs(target - pos) < 0.5) {
        pos = target;
        gliding = false;
      }
      el.scrollLeft = pos;
      if (gliding) raf = requestAnimationFrame(tick);
    };
    const glideTo = (x: number) => {
      target = clamp(x);
      if (reduced) {
        el.scrollLeft = target;
        pos = target;
        return;
      }
      if (!gliding) {
        pos = el.scrollLeft;
        gliding = true;
        raf = requestAnimationFrame(tick);
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return; // pinch-zoom
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return; // already horizontal: native
      if (max() <= 0) return;
      e.preventDefault();
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? el.clientWidth : 1;
      if (!gliding) target = el.scrollLeft;
      glideTo(target + e.deltaY * unit);
    };

    const onScroll = () => {
      if (!gliding) pos = target = el.scrollLeft;
      if (memoryKey) memory.set(memoryKey, el.scrollLeft);
      queueMeasure();
    };

    const step = (dir: 1 | -1 | 'home' | 'end') => {
      const list = panels();
      if (!list.length) return;
      const pad = parseFloat(getComputedStyle(el).paddingLeft) || 0;
      let i = Math.max(0, active);
      if (dir === 'home') i = 0;
      else if (dir === 'end') i = list.length - 1;
      else i = Math.min(list.length - 1, Math.max(0, i + dir));
      glideTo(list[i].offsetLeft - pad);
    };

    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest('input, textarea, select, [contenteditable="true"]')) return;
      const map: Record<string, 1 | -1 | 'home' | 'end'> = {
        ArrowRight: 1,
        PageDown: 1,
        ArrowLeft: -1,
        PageUp: -1,
      };
      if (t === el) {
        map.Home = 'home';
        map.End = 'end';
      }
      const dir = map[e.key];
      if (dir === undefined) return;
      e.preventDefault();
      step(dir);
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('scroll', onScroll, { passive: true });
    el.addEventListener('keydown', onKey);
    window.addEventListener('resize', queueMeasure);
    queueMeasure();

    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('scroll', onScroll);
      el.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', queueMeasure);
      cancelAnimationFrame(raf);
      cancelAnimationFrame(measureQueued);
    };
  }, [progress, reduced, memoryKey]);

  return (
    <div
      ref={ref}
      className={styles.track}
      role="region"
      aria-label={`${label}. Scrolls sideways; use the arrow keys to move between panels.`}
      tabIndex={0}
    >
      {Children.toArray(children).map((child, i) =>
        i < revealFrom ? (
          <div key={i} className={styles.slot}>
            {child}
          </div>
        ) : (
          <Reveal key={i} i={i - revealFrom} className={styles.slot}>
            {child}
          </Reveal>
        ),
      )}
    </div>
  );
}

export type PanelSize = 'hero' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * One stop on the track. `card` panels get a paper surface and, while
 * active, a hard ink shadow; `plain` ones sit straight on the section colour.
 */
export function Panel({
  size = 'md',
  variant = 'card',
  children,
  className,
  labelledBy,
  label,
}: {
  size?: PanelSize;
  /** card: paper surface; plain: on the section colour; bare: shadow only, bring your own surface */
  variant?: 'card' | 'plain' | 'bare';
  children: ReactNode;
  className?: string;
  labelledBy?: string;
  label?: string;
}) {
  return (
    <div data-panel className={[styles.panel, styles[size]].join(' ')}>
      {variant !== 'plain' && <div className={styles.shadow} aria-hidden="true" />}
      <section
        className={[styles.surface, styles[variant], className].filter(Boolean).join(' ')}
        aria-labelledby={labelledBy}
        aria-label={label}
      >
        {children}
      </section>
    </div>
  );
}
