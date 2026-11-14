import { useEffect, useState } from 'react';

const read = () => ({
  w: typeof window === 'undefined' ? 1440 : window.innerWidth,
  h: typeof window === 'undefined' ? 900 : window.innerHeight,
});

/** Viewport size, updated on resize (rAF-throttled). */
export function useViewport() {
  const [size, setSize] = useState(read);
  useEffect(() => {
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setSize(read()));
    };
    window.addEventListener('resize', on);
    return () => {
      window.removeEventListener('resize', on);
      cancelAnimationFrame(raf);
    };
  }, []);
  return size;
}
