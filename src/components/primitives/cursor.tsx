'use client';

import { motion, useMotionValue, useSpring } from 'motion/react';
import { useEffect, useState } from 'react';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

const HOVER_SELECTOR = 'a, button, [role="button"], [data-cursor-target]';

export function Cursor() {
  const reduced = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 380, damping: 30, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 380, damping: 30, mass: 0.4 });

  useEffect(() => {
    if (reduced) return;
    const fine = window.matchMedia('(pointer: fine)').matches;
    if (!fine) return;
    setEnabled(true);

    const onMove = (event: MouseEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
    };
    const onOver = (event: MouseEvent) => {
      const target = event.target as Element | null;
      setHovering(!!target?.closest(HOVER_SELECTOR));
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseover', onOver);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
    };
    // x.set and y.set are stable bound methods on MotionValue — they never
    // change identity, so this dep array is effectively [reduced] at runtime.
  }, [reduced, x.set, y.set]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden="true"
      style={{ x: sx, y: sy }}
      className="pointer-events-none fixed top-0 left-0 z-[100] -translate-x-1/2 -translate-y-1/2 mix-blend-difference"
    >
      <motion.div
        animate={{ scale: hovering ? 1.6 : 1, opacity: hovering ? 0.9 : 0.7 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="size-3 rounded-full bg-accent"
      />
    </motion.div>
  );
}
