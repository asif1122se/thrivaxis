'use client';

import { motion } from 'motion/react';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/cn';

interface HeroHeadlineProps {
  className?: string;
}

/**
 * Two-line hero headline. Words rise + un-blur in a staggered cascade.
 * Reduced motion = static, no entrance.
 */
export function HeroHeadline({ className }: HeroHeadlineProps) {
  const reduced = useReducedMotion();

  const itemVariants = {
    hidden: reduced ? { opacity: 1 } : { opacity: 0, y: 36, filter: 'blur(10px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.95, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <motion.h1
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { delayChildren: 0.18, staggerChildren: 0.16 } },
      }}
      className={cn(
        'font-display text-display-xl leading-[0.92] tracking-tight sm:text-display-2xl',
        className,
      )}
    >
      <motion.span variants={itemVariants} className="block">
        Production-grade AI,
      </motion.span>
      <motion.span variants={itemVariants} className="block font-serif text-accent italic">
        in code.
      </motion.span>
    </motion.h1>
  );
}
