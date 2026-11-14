import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { useCharacterWorld } from '../../characters/useMood';
import type { GalleryImage } from '../../content/types';
import { Txt } from '../common';
import { Picture } from './Burst';
import styles from './Gallery.module.css';

/** One image, large. ←/→ step through, Escape closes. */
export function Lightbox({
  items,
  index,
  onIndex,
  onClose,
}: {
  items: GalleryImage[];
  index: number | null;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const { reduced } = useCharacterWorld();
  const box = useRef<HTMLDivElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const dir = useRef(1);
  const isOpen = index !== null;

  const go = (d: 1 | -1) => {
    if (index === null) return;
    dir.current = d;
    onIndex((index + d + items.length) % items.length);
  };

  useEffect(() => {
    if (!isOpen) return;
    close.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation(); // don't also leave the section
        onClose();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        go(1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        go(-1);
      } else if (e.key === 'Tab' && box.current) {
        const f = Array.from(box.current.querySelectorAll<HTMLElement>('button'));
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  });

  const img = index !== null ? items[index] : null;

  return createPortal(
    <AnimatePresence>
      {img && index !== null && (
        <motion.div
          ref={box}
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label={`Image ${index + 1} of ${items.length}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0.15 : 0.25 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <AnimatePresence mode="popLayout" initial={false} custom={dir.current}>
            <motion.figure
              key={index}
              className={styles.big}
              custom={dir.current}
              initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.86, x: dir.current * 60 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, x: dir.current * -60 }}
              transition={
                reduced ? { duration: 0.15 } : { type: 'spring', stiffness: 300, damping: 28 }
              }
            >
              <div
                className={styles.bigFrame}
                style={{
                  aspectRatio: `${img.width} / ${img.height}`,
                  // as large as fits: full width, unless that would be too tall
                  width: `min(100%, calc((100dvh - 260px) * ${img.width / img.height}))`,
                }}
              >
                <Picture img={img} large />
              </div>
              <figcaption>
                <span className={styles.count}>
                  {String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
                </span>
                <span>
                  <Txt>{img.caption}</Txt>
                </span>
              </figcaption>
            </motion.figure>
          </AnimatePresence>
          <div className={styles.controls}>
            <button type="button" onClick={() => go(-1)} aria-label="Previous image">
              ←
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Next image">
              →
            </button>
            <button ref={close} type="button" onClick={onClose}>
              Close
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
