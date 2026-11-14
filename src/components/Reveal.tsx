import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { useDive } from '../dive/context';
import { useCharacterWorld } from '../characters/useMood';

const base = { dive: 0.12, deep: 0.3, switch: 0.18, none: 0.05 } as const;

/** Section content entrance: fade and rise (opacity 0→1, y 24→0), staggered by `i`. */
export function Reveal({
  i = 0,
  children,
  className,
}: {
  i?: number;
  children: ReactNode;
  className?: string;
}) {
  const { entry } = useDive();
  const { reduced } = useCharacterWorld();
  return (
    <motion.div
      className={className}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduced
          ? { duration: 0.2 }
          : { duration: 0.5, delay: base[entry] + i * 0.07, ease: [0.2, 0.8, 0.2, 1] }
      }
    >
      {children}
    </motion.div>
  );
}
