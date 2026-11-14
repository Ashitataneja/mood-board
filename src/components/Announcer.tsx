import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

const AnnounceContext = createContext<(msg: string) => void>(() => {});

/** One polite live region for the whole site. */
export function AnnouncerProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState('');
  const t = useRef<number>();
  const announce = useCallback((m: string) => {
    // clear first so repeating the same message is still read out
    setMsg('');
    window.clearTimeout(t.current);
    t.current = window.setTimeout(() => setMsg(m), 60);
  }, []);
  const value = useMemo(() => announce, [announce]);
  return (
    <AnnounceContext.Provider value={value}>
      {children}
      <div className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">
        {msg}
      </div>
    </AnnounceContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAnnounce = () => useContext(AnnounceContext);
