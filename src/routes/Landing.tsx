import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Character } from '../characters/Character';
import { brighten, springs } from '../characters/moods';
import { useCharacterWorld } from '../characters/useMood';
import { HurryButton } from '../components/Hurry';
import { sections, site } from '../content/sections';
import type { Section, SectionId } from '../content/types';
import { useViewport } from '../hooks/useViewport';
import { useDive } from '../dive/context';
import { lastInputWasKeyboard } from '../hooks/inputModality';
import type { LookTarget } from '../characters/Face';
import { pickLayout, type CrowdLayout } from '../landing/layout';
import styles from './Landing.module.css';

/** Tab order runs left to right; stacking order comes from `z`. */
const tabOrder = [...sections].sort((a, b) => a.crowd.x - b.crowd.x);

export default function Landing() {
  const vp = useViewport();
  const layout = pickLayout(vp.w, vp.h);
  const k = Math.min(vp.w / layout.width, vp.h / layout.height);
  const { reduced } = useCharacterWorld();
  const dive = useDive();

  const [active, setActive] = useState<SectionId | null>(null);
  const [bounce, setBounce] = useState(0);
  const lastPointer = useRef<string>('mouse');
  const lastDown = useRef(0);

  const enter = useCallback((s: Section) => dive.enter(s.id), [dive]);

  // Coming back out of a section: that character blinks once (handled in the
  // Face via blinkSignal) and, for keyboard users, gets focus back.
  useEffect(() => {
    if (!dive.returned || !lastInputWasKeyboard()) return;
    document
      .querySelector<HTMLButtonElement>(`[data-crowd-id="${dive.returned.id}"]`)
      ?.focus({ preventScroll: true });
  }, [dive.returned]);

  // Tap outside the crowd (touch) clears the selection.
  useEffect(() => {
    const clear = (e: PointerEvent) => {
      lastPointer.current = e.pointerType;
      lastDown.current = performance.now();
      if (!(e.target as Element).closest('[data-crowd]')) setActive(null);
    };
    window.addEventListener('pointerdown', clear);
    return () => window.removeEventListener('pointerdown', clear);
  }, []);

  const centres = useMemo(
    () =>
      Object.fromEntries(
        sections.map((s) => [s.id, layout.slots[s.id].x + layout.slots[s.id].w / 2]),
      ) as Record<SectionId, number>,
    [layout],
  );

  const activeSection = active ? sections.find((s) => s.id === active)! : null;

  return (
    <main
      id="main"
      className={styles.page}
      style={dive.busy ? { pointerEvents: 'none' } : undefined}
    >
      <h1 className="visually-hidden">Ashita Taneja, designer and researcher</h1>
      <div
        className={styles.hurry}
        style={
          layout.kind === 'wide'
            ? {
                top: vp.h - layout.height * k + (layout.tagline.y - 12) * k,
                right: Math.max(16, vp.w / 2 - (layout.width / 2 - 40) * k),
              }
            : undefined
        }
      >
        <HurryButton compact={layout.kind === 'tall'} />
      </div>
      <div
        className={styles.stage}
        style={{
          width: layout.width,
          height: layout.height,
          transform: `translateX(-50%) scale(${k})`,
        }}
      >
        <p
          className={styles.name}
          aria-hidden="true"
          style={{ left: layout.name.x, top: layout.name.y, fontSize: layout.name.size }}
        >
          {layout.name.lines.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </p>
        <p
          className={`label ${styles.tagline}`}
          style={{
            left: layout.tagline.x,
            top:
              layout.kind === 'wide'
                ? layout.tagline.y
                : layout.name.y + layout.name.size * 1.8 + 14,
            maxWidth: layout.tagline.width,
          }}
        >
          {layout.kind === 'wide'
            ? site.tagline
            : 'DESIGNER + RESEARCHER · TAP TO MEET THE MOODS · TAP AGAIN TO GO INSIDE'}
        </p>

        <ul className={styles.crowd} aria-label="Sections">
          {tabOrder.map((s) => (
            <CrowdMember
              key={s.id}
              s={s}
              layout={layout}
              active={active}
              centres={centres}
              reduced={reduced}
              bounce={active === s.id ? bounce : 0}
              look={
                dive.diving === s.id
                  ? 'viewer'
                  : dive.diving && dive.glance
                    ? dive.glance
                    : 'pointer'
              }
              blink={dive.returned?.id === s.id ? dive.returned.n : 0}
              onActivate={(on, via) => {
                // A tap focuses the button before its click: let the click decide.
                const tapping =
                  via === 'focus' &&
                  lastPointer.current !== 'mouse' &&
                  performance.now() - lastDown.current < 600;
                if (on && tapping) return;
                setActive((cur) => (on ? s.id : cur === s.id ? null : cur));
              }}
              onPress={() => {
                if (lastPointer.current === 'touch' && active !== s.id) {
                  setActive(s.id);
                  setBounce((b) => b + 1);
                  return;
                }
                enter(s);
              }}
            />
          ))}
        </ul>

        <AnimatePresence>
          {activeSection && (
            <Bubble
              key={activeSection.id}
              s={activeSection}
              layout={layout}
              reduced={reduced}
              onEnter={() => enter(activeSection)}
            />
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

interface MemberProps {
  s: Section;
  layout: CrowdLayout;
  active: SectionId | null;
  centres: Record<SectionId, number>;
  reduced: boolean;
  bounce: number;
  look: LookTarget;
  blink: number;
  onActivate: (on: boolean, via: 'pointer' | 'focus') => void;
  onPress: () => void;
}

function CrowdMember({
  s,
  layout,
  active,
  centres,
  reduced,
  bounce,
  look,
  blink,
  onActivate,
  onPress,
}: MemberProps) {
  const slot = layout.slots[s.id];
  const isActive = active === s.id;

  let target = { x: 0, y: 0, scale: 1 };
  if (isActive) {
    target = { x: 0, y: -layout.rise, scale: 1.07 };
  } else if (active) {
    const dx = centres[s.id] - centres[active];
    const push = layout.push * Math.max(0, 1 - Math.abs(dx) / layout.reach);
    target = { x: Math.sign(dx || 1) * push, y: 6, scale: 0.97 };
  }

  const transition = reduced ? { duration: 0 } : isActive ? springs.pop : springs.default;

  return (
    <li
      className={styles.slot}
      style={{ left: slot.x, top: slot.y, width: slot.w, height: slot.h, zIndex: s.z }}
    >
      <motion.button
        type="button"
        data-crowd
        data-crowd-id={s.id}
        className={styles.member}
        style={{ ['--focus-color' as string]: 'var(--paper)' }}
        aria-label={`${s.name}. ${s.hoverLine} Opens the section.`}
        initial={false}
        animate={target}
        transition={transition}
        onPointerEnter={(e) => e.pointerType === 'mouse' && onActivate(true, 'pointer')}
        onPointerLeave={(e) => e.pointerType === 'mouse' && onActivate(false, 'pointer')}
        onFocus={() => onActivate(true, 'focus')}
        onBlur={() => onActivate(false, 'focus')}
        onClick={onPress}
      >
        <motion.div
          key={bounce}
          className={styles.bounce}
          initial={bounce && !reduced ? { y: 0 } : false}
          animate={bounce && !reduced ? { y: [0, -16, 0] } : undefined}
          transition={{ duration: 0.38, ease: 'easeOut' }}
        >
          <Character
            id={s.id}
            width={slot.w}
            height={slot.h}
            mood={isActive ? brighten(s.defaultMood) : undefined}
            showName
            look={look}
            blinkSignal={blink}
            blinkDuration={0.22}
          />
        </motion.div>
      </motion.button>
    </li>
  );
}

function Bubble({
  s,
  layout,
  reduced,
  onEnter,
}: {
  s: Section;
  layout: CrowdLayout;
  reduced: boolean;
  onEnter: () => void;
}) {
  const slot = layout.slots[s.id];
  const width = layout.kind === 'wide' ? 380 : 300;
  const cx = slot.x + slot.w / 2;
  const left = Math.min(Math.max(cx - width / 2, 16), layout.width - width - 16);
  const bottom = layout.height - (slot.y - layout.rise - 14);
  // Tail points at the character's centre, clamped inside the bubble.
  const tail = Math.min(Math.max(cx - left, 40), width - 40);

  return (
    <motion.div
      className={styles.bubble}
      data-crowd
      style={{
        left,
        bottom,
        width,
        ['--accent' as string]: s.color,
        ['--tail' as string]: `${tail}px`,
        transformOrigin: `${tail}px 100%`,
      }}
      initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.7, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={
        reduced ? { opacity: 0 } : { opacity: 0, scale: 0.85, y: 6, transition: { duration: 0.12 } }
      }
      transition={reduced ? { duration: 0.15 } : springs.pop}
      onClick={onEnter}
      aria-hidden="true"
    >
      <span className={styles.bubbleName}>{s.name}</span>
      <span className={styles.bubbleLine}>{s.hoverLine}</span>
    </motion.div>
  );
}
