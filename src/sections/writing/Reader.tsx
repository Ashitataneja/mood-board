import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Character } from '../../characters/Character';
import { useCharacterWorld } from '../../characters/useMood';
import type { posts } from '../../content/writing';
import { Txt } from '../common';
import { useArrival } from '../useArrival';
import styles from './Writing.module.css';

type Post = (typeof posts)[number];

/**
 * "Lights down": everything but the post fades to near-black and the post
 * opens as a centred reading column. Here, and only here, content scrolls
 * vertically. The Writing character wakes up when you reach the end.
 */
export function Reader({ post }: { post: Post }) {
  const { reduced } = useCharacterWorld();
  const title = useArrival<HTMLHeadingElement>(`Writing, ${post.title}`);
  const end = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const [finished, setFinished] = useState(false);
  const Body = post.Body;

  useEffect(() => {
    const el = end.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setFinished(true), {
      root: scroller.current,
      threshold: 1,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const t = (delay: number) =>
    reduced ? { duration: 0.2 } : { duration: 0.6, delay, ease: [0.2, 0.8, 0.2, 1] as const };

  return (
    <div className={styles.reader} data-reading>
      <motion.div
        className={styles.lights}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={t(0)}
        aria-hidden="true"
      />
      <div ref={scroller} className={styles.readerScroll}>
        <motion.article
          className={styles.article}
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={t(0.25)}
        >
          <p className={styles.meta}>{post.date}</p>
          <h1 ref={title} tabIndex={-1} className={styles.postTitle}>
            <Txt>{post.title}</Txt>
          </h1>
          <p className={styles.standfirst}>
            <Txt>{post.standfirst}</Txt>
          </p>
          <div className={styles.prose}>
            <Body />
          </div>
          <div ref={end} className={styles.end}>
            <span aria-hidden="true">· · ·</span>
            <span className="visually-hidden">End of post.</span>
          </div>
        </motion.article>
      </div>
      <div className={styles.readerSleeper} aria-hidden="true">
        <Character
          id="writing"
          width={80}
          height={160}
          mood={finished ? 'smile' : 'sleepy'}
          outline={3}
          sleep={!finished}
        />
      </div>
    </div>
  );
}
