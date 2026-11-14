import { useEffect, useId, useRef } from 'react';
import {
  animate,
  cancelFrame,
  frame,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react';
import type { MoodId, ShapeId } from '../content/types';
import { faceGeometry } from './geometry';
import { moods, mouths, springs } from './moods';
import { useCharacterWorld } from './useMood';

export type LookTarget = 'pointer' | 'viewer' | { x: number; y: number };

export interface FaceProps {
  shape: ShapeId;
  /** body box in SVG units (usually the rendered px size) */
  width: number;
  height: number;
  mood: MoodId;
  bodyColor: string;
  textColor: string;
  look?: LookTarget;
  /** Turn off the idle blink (Résumé only blinks on cue) */
  autoBlink?: boolean;
  /** Change this number to trigger one blink */
  blinkSignal?: number;
  blinkDuration?: number;
  /** Heavier pupil spring, for the big background eyes */
  eyeSpring?: { stiffness: number; damping: number };
  /** Size of each eye as a fraction of min(w, h). Default 0.2 */
  eyeSize?: number;
  /** Draw the mouth and brows (off for faces that only peek) */
  mouth?: boolean;
  /** Draw brows when the mood asks for them. Defaults to `mouth`. */
  brows?: boolean;
  /** Override eye and pupil fills (the faint background eyes use translucent white) */
  eyeFill?: string;
  pupilFill?: string;
  /** Colour of the lid edge and closed-eye strokes. Defaults to textColor. */
  lineColor?: string;
  className?: string;
}

const instant = { duration: 0 } as const;

/**
 * Two eyes, pupils, lids, optional brows and a mouth. Every value that moves
 * is a motion value, so pointer tracking never re-renders React.
 */
export function Face({
  shape,
  width: w,
  height: h,
  mood,
  bodyColor,
  textColor,
  look = 'pointer',
  autoBlink = true,
  blinkSignal,
  blinkDuration = 0.14,
  eyeSpring = springs.eyes,
  eyeSize,
  mouth = true,
  brows,
  eyeFill = 'var(--white)',
  pupilFill = 'var(--ink)',
  lineColor,
  className,
}: FaceProps) {
  const { pointerX, pointerY, reduced } = useCharacterWorld();
  const uid = useId().replace(/:/g, '');
  const svgRef = useRef<SVGSVGElement>(null);
  const g = faceGeometry(shape, w, h, eyeSize);
  const { E, ey, lx, rx } = g;
  const spec = moods[mood];

  // --- mood-driven values -------------------------------------------------
  const lidL = useMotionValue(spec.lidL / 100);
  const lidR = useMotionValue(spec.lidR / 100);
  const pupil = useMotionValue(spec.pupil);
  const blink = useMotionValue(0);

  useEffect(() => {
    const t = reduced ? instant : springs.default;
    const a = [
      animate(lidL, spec.lidL / 100, t),
      animate(lidR, spec.lidR / 100, t),
      animate(pupil, spec.pupil, t),
    ];
    return () => a.forEach((x) => x.stop());
  }, [spec.lidL, spec.lidR, spec.pupil, reduced, lidL, lidR, pupil]);

  const shownL = useTransform([lidL, blink] as MotionValue<number>[], (v: number[]) =>
    Math.max(v[0], v[1]),
  );
  const shownR = useTransform([lidR, blink] as MotionValue<number>[], (v: number[]) =>
    Math.max(v[0], v[1]),
  );
  const lineYL = useTransform(shownL, (v) => v * E);
  const lineYR = useTransform(shownR, (v) => v * E);
  // The lid's edge line shows while the lid is partly closed, then hands over
  // to a curved "closed eye" stroke once the eye is shut.
  const lineOL = useTransform(shownL, [0, 0.04, 0.82, 0.92], [0, 1, 1, 0]);
  const lineOR = useTransform(shownR, [0, 0.04, 0.82, 0.92], [0, 1, 1, 0]);
  const shutOL = useTransform(shownL, [0.82, 0.95], [0, 1]);
  const shutOR = useTransform(shownR, [0.82, 0.95], [0, 1]);

  // --- blinking -----------------------------------------------------------
  const lidsShut = spec.lidL >= 100 && spec.lidR >= 100;
  useEffect(() => {
    if (!autoBlink || reduced || lidsShut) return;
    let timer: number;
    const loop = () => {
      timer = window.setTimeout(
        () => {
          animate(blink, [0, 1, 0], { duration: 0.14, ease: 'easeInOut' });
          loop();
        },
        4000 + Math.random() * 3000,
      );
    };
    loop();
    return () => window.clearTimeout(timer);
  }, [autoBlink, reduced, lidsShut, blink]);

  useEffect(() => {
    if (blinkSignal === undefined || blinkSignal === 0) return;
    if (reduced) return;
    animate(blink, [0, 1, 0], { duration: blinkDuration, ease: 'easeInOut' });
  }, [blinkSignal, blinkDuration, reduced, blink]);

  // --- pupil tracking -----------------------------------------------------
  const lpX = useSpring(0, eyeSpring);
  const lpY = useSpring(0, eyeSpring);
  const rpX = useSpring(0, eyeSpring);
  const rpY = useSpring(0, eyeSpring);
  const lookUp = spec.look === 'up' ? -0.14 * E : 0;

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const offset = (cx: number, cy: number, tx: number, ty: number) => {
      const dx = tx - cx;
      const dy = ty - cy;
      const dist = Math.hypot(dx, dy);
      if (dist < 0.001) return [0, 0];
      const m = Math.min(1, dist / 260) * 0.2 * E;
      return [(dx / dist) * m, (dy / dist) * m];
    };

    const compute = () => {
      const r = svg.getBoundingClientRect();
      if (r.width === 0) return;
      const k = w / r.width;
      const toScreen = (x: number, y: number): [number, number] => [r.left + x / k, r.top + y / k];
      const [lcx, lcy] = toScreen(lx, ey);
      const [rcx, rcy] = toScreen(rx, ey);
      let tx: number;
      let ty: number;
      if (look === 'viewer') {
        // snap, don't glide: this is the "look at you" beat of the eye dive
        lpX.jump(0);
        lpY.jump(lookUp);
        rpX.jump(0);
        rpY.jump(lookUp);
        return;
      } else if (look === 'pointer') {
        tx = pointerX.get();
        ty = pointerY.get();
      } else {
        tx = look.x;
        ty = look.y;
      }
      const [lox, loy] = offset(lcx, lcy, tx, ty);
      const [rox, roy] = offset(rcx, rcy, tx, ty);
      if (reduced) {
        lpX.jump(lox);
        lpY.jump(loy + lookUp);
        rpX.jump(rox);
        rpY.jump(roy + lookUp);
      } else {
        lpX.set(lox);
        lpY.set(loy + lookUp);
        rpX.set(rox);
        rpY.set(roy + lookUp);
      }
    };

    // Batch to at most once per frame, however many events arrive.
    const schedule = () => frame.read(compute);
    schedule();
    const unX = pointerX.on('change', schedule);
    const unY = pointerY.on('change', schedule);
    window.addEventListener('resize', schedule);
    return () => {
      unX();
      unY();
      window.removeEventListener('resize', schedule);
      cancelFrame(compute);
    };
  }, [look, w, E, ey, lx, rx, lookUp, reduced, pointerX, pointerY, lpX, lpY, rpX, rpY]);

  // --- render -------------------------------------------------------------
  const lineW = Math.max(1.5, E * 0.06);
  const line = lineColor ?? textColor;
  const showBrows = brows ?? mouth;
  const browOpacity = spec.brows ? 1 : 0;
  const m = mouths[spec.mouth];
  const moodT = reduced ? instant : springs.default;
  const mouthT = reduced ? instant : { duration: 0.32, ease: [0.2, 0.8, 0.2, 1] as const };

  const eye = (cx: number, side: 'L' | 'R') => {
    const lid = side === 'L' ? shownL : shownR;
    const px = side === 'L' ? lpX : rpX;
    const py = side === 'L' ? lpY : rpY;
    const lineY = side === 'L' ? lineYL : lineYR;
    const lineO = side === 'L' ? lineOL : lineOR;
    const shutO = side === 'L' ? shutOL : shutOR;
    return (
      <g key={side}>
        <clipPath id={`${uid}-${side}`}>
          <circle cx={cx} cy={ey} r={E / 2} />
        </clipPath>
        <clipPath id={`${uid}-${side}-lid`}>
          <circle cx={cx} cy={ey} r={E / 2 + 1} />
        </clipPath>
        <circle cx={cx} cy={ey} r={E / 2} style={{ fill: eyeFill }} />
        <g clipPath={`url(#${uid}-${side})`}>
          <motion.circle
            data-pupil={side}
            cx={cx}
            cy={ey}
            r={E / 2}
            style={{ fill: pupilFill, x: px, y: py, scale: pupil }}
          />
        </g>
        <g clipPath={`url(#${uid}-${side}-lid)`}>
          <motion.rect
            x={cx - E / 2 - 1}
            y={ey - E / 2 - 1}
            width={E + 2}
            height={E + 2}
            style={{ fill: bodyColor, scaleY: lid, originY: 0 }}
          />
          <motion.line
            x1={cx - E / 2}
            x2={cx + E / 2}
            y1={ey - E / 2}
            y2={ey - E / 2}
            strokeWidth={lineW}
            strokeLinecap="round"
            style={{
              stroke: line,
              y: lineY,
              opacity: lineO,
            }}
          />
        </g>
        <motion.path
          d={`M${cx - E * 0.4} ${ey + E * 0.04} Q${cx} ${ey + E * 0.42} ${cx + E * 0.4} ${ey + E * 0.04}`}
          fill="none"
          strokeWidth={Math.max(1.5, E * 0.09)}
          strokeLinecap="round"
          style={{ stroke: line, opacity: shutO }}
        />
      </g>
    );
  };

  return (
    <svg
      ref={svgRef}
      className={className}
      viewBox={`0 0 ${w} ${h}`}
      width="100%"
      height="100%"
      aria-hidden="true"
      focusable="false"
      style={{ overflow: 'visible' }}
    >
      {eye(lx, 'L')}
      {eye(rx, 'R')}
      {showBrows && (
        <motion.g initial={false} animate={{ opacity: browOpacity }} transition={moodT}>
          <rect
            x={lx - E * 0.35}
            y={ey - E * 0.86}
            width={E * 0.7}
            height={E * 0.14}
            rx={E * 0.07}
            transform={`rotate(-14 ${lx} ${ey - E * 0.79})`}
            style={{ fill: line }}
          />
          <rect
            x={rx - E * 0.35}
            y={ey - E * 0.86}
            width={E * 0.7}
            height={E * 0.14}
            rx={E * 0.07}
            transform={`rotate(14 ${rx} ${ey - E * 0.79})`}
            style={{ fill: line }}
          />
        </motion.g>
      )}
      {mouth && (
        <g transform={`translate(${g.mx} ${g.my}) scale(${g.mouthW / 60})`}>
          <motion.path
            initial={false}
            animate={{ d: m.d, fillOpacity: m.filled ? 1 : 0 }}
            transition={mouthT}
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ stroke: textColor, fill: 'var(--ink)' }}
          />
        </g>
      )}
    </svg>
  );
}
