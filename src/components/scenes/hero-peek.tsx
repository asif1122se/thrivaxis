'use client';

import { motion, useScroll, useTransform } from 'motion/react';
import { type ReactNode, useRef } from 'react';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/cn';

interface HeroPeekProps {
  children: ReactNode;
  className?: string;
}

/**
 * UI mockup that peeks in from the right side of the hero. Slow parallax on
 * scroll (≈ 0.4× scroll velocity), subtle rotation, hidden below lg.
 * The caller passes the BrowserFrame + mockup as children.
 */
export function HeroPeek({ children, className }: HeroPeekProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 800], [0, reduced ? 0 : -160]);
  const rotate = useTransform(scrollY, [0, 800], [2.5, reduced ? 2.5 : 0]);

  return (
    <motion.div
      ref={ref}
      aria-hidden="true"
      style={{ y, rotate }}
      initial={reduced ? { opacity: 1 } : { opacity: 0, x: 80 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 1.4, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'pointer-events-none absolute top-[18%] right-[-12%] hidden w-[58%] origin-bottom-left lg:block xl:right-[-6%] xl:w-[52%]',
        'drop-shadow-[0_40px_80px_rgb(0_0_0_/_0.5)]',
        className,
      )}
    >
      {children}
    </motion.div>
  );
}
