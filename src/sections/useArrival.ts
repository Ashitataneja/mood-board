import { useEffect, useRef } from 'react';
import { useAnnounce } from '../components/Announcer';

/**
 * On arrival: announce the view in the live region and move focus to its
 * title, so keyboard and screen reader users land inside.
 */
export function useArrival<T extends HTMLElement>(announce: string) {
  const ref = useRef<T>(null);
  const say = useAnnounce();
  useEffect(() => {
    say(announce);
    const t = window.setTimeout(() => ref.current?.focus({ preventScroll: true }), 60);
    return () => window.clearTimeout(t);
  }, [announce, say]);
  return ref;
}
