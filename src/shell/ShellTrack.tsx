import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useMotionValue } from 'motion/react';
import type { MoodId } from '../content/types';
import { useViewport } from '../hooks/useViewport';
import { useAnnounce } from '../components/Announcer';
import { ProgressRoller } from './ProgressRoller';
import { Track } from './Track';
import { useSection } from './context';

export interface ShellTrackProps {
  label: string;
  children: ReactNode;
  /** Label for the rolling character at panel i, e.g. "03 · INSIGHT" (else a percentage) */
  stageFor?: (i: number) => string | null | undefined;
  /** Mood for the rolling character at panel i */
  moodFor?: (i: number) => MoodId | undefined;
  /** Live-region text when panel i becomes active (stage changes) */
  announceFor?: (i: number) => string | null | undefined;
  onActive?: (i: number) => void;
}

/** Horizontal track plus the rolling progress character, bound together. */
export function ShellTrack({
  label,
  children,
  stageFor,
  moodFor,
  announceFor,
  onActive,
}: ShellTrackProps) {
  const s = useSection();
  const vp = useViewport();
  const announce = useAnnounce();
  const progress = useMotionValue(0);
  const [active, setActive] = useState(0);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const msg = announceFor?.(active);
    if (msg) announce(msg);
  }, [active, announceFor, announce]);

  // The line stops short of the peeking characters.
  const lineEnd = vp.w < 1024 ? vp.w - 16 : Math.min(940, vp.w - 560);

  return (
    <>
      <Track
        label={label}
        progress={progress}
        onActive={(i) => {
          setActive(i);
          onActive?.(i);
        }}
      >
        {children}
      </Track>
      <ProgressRoller
        key={s.id}
        progress={progress}
        stage={stageFor?.(active)}
        mood={moodFor?.(active)}
        lineEnd={lineEnd}
      />
    </>
  );
}
