import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Types registered lines out one at a time (~8ms per character), then stops.
 * Every line's full text is always in the DOM (the untyped part is just
 * transparent), so screen readers and copy-paste get everything at once.
 */
const MS_PER_CHAR = 8;

interface Ctx {
  /** characters revealed so far, across all lines in order */
  shown: number;
  /** start offset of line i */
  offsets: number[];
}
const TypeContext = createContext<Ctx>({ shown: Infinity, offsets: [] });

export function Typewriter({
  lines,
  instant,
  onDone,
  children,
}: {
  /** every line's text, in typing order */
  lines: string[];
  instant: boolean;
  onDone: () => void;
  children: ReactNode;
}) {
  const total = lines.reduce((n, l) => n + l.length, 0);
  const offsets: number[] = [];
  lines.forEach((_, i) => offsets.push(i === 0 ? 0 : offsets[i - 1] + lines[i - 1].length));
  const [shown, setShown] = useState(instant ? total : 0);
  const done = useRef(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (instant) {
      setShown(total);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const n = Math.min(total, Math.floor((now - start) / MS_PER_CHAR));
      setShown(n);
      if (n < total) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [instant, total]);

  useEffect(() => {
    if (shown >= total && !done.current) {
      done.current = true;
      onDoneRef.current();
    }
  }, [shown, total]);

  return <TypeContext.Provider value={{ shown, offsets }}>{children}</TypeContext.Provider>;
}

/**
 * One typed line. `i` is its index in the Typewriter's `lines`.
 *
 * The full text sits in one node that never moves (transparent until typed,
 * and what screen readers read); the typed part is an overlay on top with the
 * same wrapping, which only ever grows at its end. Splitting the text into
 * typed/untyped nodes instead made the untyped node move with every
 * character, which browsers count as dozens of layout shifts.
 */
export function Line({ i, text }: { i: number; text: string }) {
  const { shown, offsets } = useContext(TypeContext);
  const start = offsets[i] ?? 0;
  const n = Math.max(0, Math.min(text.length, shown - start));
  return (
    <span className="tw">
      <span className="tw-full" data-done={n >= text.length || undefined}>
        {text}
      </span>
      <span className="tw-typed" aria-hidden="true">
        {text.slice(0, n)}
      </span>
    </span>
  );
}
