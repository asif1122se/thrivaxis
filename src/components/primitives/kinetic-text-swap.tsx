'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/cn';
import { duration, ease } from '@/lib/motion';

interface KineticTextSwapProps {
  words: readonly string[];
  intervalMs?: number;
  className?: string;
  ariaLabel?: string;
}

/**
 * Rotates through `words` on a timer. Used inline within a heading for a
 * "we build [agents | pipelines | systems]" effect. Reduced motion shows
 * only the first word.
 */
export function KineticTextSwap({
  words,
  intervalMs = 2400,
  className,
  ariaLabel,
}: KineticTextSwapProps) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const current = words[index % words.length] ?? '';

  useEffect(() => {
    if (reduced || words.length < 2) return;
    const id = setInterval(() => setIndex((prev) => (prev + 1) % words.length), intervalMs);
    return () => clearInterval(id);
  }, [reduced, intervalMs, words.length]);

  return (
    <span className={cn('relative inline-flex overflow-hidden align-baseline', className)}>
      <span className="sr-only">{ariaLabel ?? words.join(', ')}</span>
      <span aria-hidden="true" className="invisible whitespace-pre">
        {[...words].sort((a, b) => b.length - a.length)[0]}
      </span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={current}
          aria-hidden="true"
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: '0.6em' }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? { opacity: 1 } : { opacity: 0, y: '-0.6em' }}
          transition={{ duration: duration.normal, ease: ease.outExpo }}
          className="absolute inset-0 left-0 text-accent"
        >
          {current}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
