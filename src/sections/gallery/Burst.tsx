import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { useCharacterWorld } from '../../characters/useMood';
import { useDive } from '../../dive/context';
import { gallery } from '../../content/gallery';
import type { GalleryImage } from '../../content/types';
import { seeded } from '../../lib/random';
import { useViewport } from '../../hooks/useViewport';
import { Lightbox } from './Lightbox';
import styles from './Gallery.module.css';

interface Placed {
  img: GalleryImage;
  x: number;
  y: number;
  w: number;
  h: number;
  r: number;
}

/** Scatter the images across the area: two loose rows, jittered, tilted −8°…8°. */
function scatter(areaW: number, areaH: number, tileW: number, neat: boolean): Placed[] {
  const rand = seeded(7);
  const cols = Math.ceil(gallery.length / 2);
  const cellW = areaW / cols;
  return gallery.map((img, i) => {
    const w = tileW;
    const h = Math.min(areaH * 0.46, (w * img.height) / img.width);
    const col = Math.floor(i / 2);
    const row = i % 2;
    const half = areaH / 2;
    const jx = neat ? (cellW - w) / 2 : rand() * Math.max(0, cellW - w);
    const jy = neat ? (half - h) / 2 : rand() * Math.max(0, half - h);
    return {
      img,
      w,
      h,
      x: col * cellW + jx,
      y: row * half + jy,
      r: neat ? 0 : -8 + rand() * 16,
    };
  });
}

/**
 * Gallery: "it can't contain itself". On entry everything bursts out of the
 * centre and lands scattered; every image can be dragged and flung, and
 * glides to a stop inside the area. Click one to see it large.
 */
export function Burst() {
  const { reduced } = useCharacterWorld();
  const { entry } = useDive();
  // Start once the panel itself has faded in (and any dive or eyelids have cleared).
  const burstAt = { dive: 0.35, deep: 0.6, switch: 0.4, none: 0.2 }[entry];
  const vp = useViewport();
  const area = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const [open, setOpen] = useState<number | null>(null);
  const dragged = useRef(false);
  const tiles = useRef<(HTMLButtonElement | null)[]>([]);

  const small = vp.w < 1024;
  const areaW = Math.round(small ? vp.w * 3.2 : Math.max(2000, vp.w * 1.9));

  useEffect(() => {
    const el = area.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setSize({ w: r.width, h: r.height });
      // burst from the middle of the screen, in area coordinates
      setOrigin({ x: window.innerWidth / 2 - r.left, y: r.height / 2 });
    };
    measure();
    const ro = new ResizeObserver(() => setSize({ w: el.offsetWidth, h: el.offsetHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const placed = useMemo(
    () => (size ? scatter(size.w, size.h, small ? 150 : 270, reduced) : []),
    [size, small, reduced],
  );

  return (
    <section
      className={styles.panel}
      data-panel
      aria-labelledby="gallery-title"
      style={{ width: areaW }}
    >
      <h2 id="gallery-title" className="visually-hidden">
        Images. Drag them around, or open one to see it large.
      </h2>
      <motion.div
        ref={area}
        className={styles.area}
        // while the lightbox is open, the rest is out of reach for keyboard and screen readers
        {...(open !== null ? { inert: '' } : {})}
        animate={open === null ? { opacity: 1, scale: 1 } : { opacity: 0.3, scale: 0.97 }}
        transition={reduced ? { duration: 0.15 } : { type: 'spring', stiffness: 260, damping: 24 }}
      >
        <ul className={styles.tiles}>
          {placed.map((p, i) => (
            <li key={p.img.alt} style={{ left: p.x, top: p.y, width: p.w, height: p.h, zIndex: i }}>
              <motion.button
                ref={(el) => {
                  tiles.current[i] = el;
                }}
                type="button"
                className={styles.tile}
                aria-label={`Open image ${i + 1} of ${placed.length}: ${p.img.alt}`}
                initial={
                  reduced
                    ? { opacity: 0, rotate: 0 }
                    : {
                        opacity: 0,
                        scale: 0.2,
                        rotate: 0,
                        x: origin.x - (p.x + p.w / 2),
                        y: origin.y - (p.y + p.h / 2),
                      }
                }
                animate={{ opacity: 1, scale: 1, rotate: p.r, x: 0, y: 0 }}
                transition={
                  reduced
                    ? { duration: 0.3, delay: i * 0.03 }
                    : { type: 'spring', stiffness: 110, damping: 14, delay: burstAt + i * 0.045 }
                }
                drag
                dragConstraints={area}
                dragElastic={0.12}
                dragMomentum={!reduced}
                dragTransition={{ power: 0.35, timeConstant: 260 }}
                whileDrag={reduced ? undefined : { scale: 1.05, zIndex: 50, cursor: 'grabbing' }}
                onPointerDown={() => (dragged.current = false)}
                onDragStart={() => (dragged.current = true)}
                onClick={() => {
                  if (!dragged.current) setOpen(i);
                }}
              >
                <Picture img={p.img} />
              </motion.button>
            </li>
          ))}
        </ul>
      </motion.div>
      <Lightbox
        items={placed.map((p) => p.img)}
        index={open}
        onIndex={setOpen}
        onClose={() => {
          const i = open;
          setOpen(null);
          if (i !== null) tiles.current[i]?.focus({ preventScroll: true });
        }}
      />
    </section>
  );
}

/** A real image, or a coloured placeholder until one is added. */
export function Picture({ img, large = false }: { img: GalleryImage; large?: boolean }) {
  if (img.src) {
    return (
      <img
        className={styles.img}
        src={img.src}
        alt={large ? img.alt : ''}
        width={img.width}
        height={img.height}
        loading={large ? 'eager' : 'lazy'}
        decoding="async"
        draggable={false}
      />
    );
  }
  return (
    // The label is CSS content, so it isn't read as the button's text (the button is named by its alt).
    <span
      className={styles.ph}
      style={{ background: img.placeholder }}
      data-label={img.caption}
      role={large ? 'img' : undefined}
      aria-label={large ? img.alt : undefined}
    />
  );
}
