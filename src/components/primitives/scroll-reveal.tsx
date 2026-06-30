'use client';

import { type HTMLMotionProps, motion } from 'motion/react';
import type { ReactNode } from 'react';
import { duration, ease } from '@/lib/motion';

interface ScrollRevealProps extends HTMLMotionProps<'div'> {
  delay?: number;
  y?: number;
  children: ReactNode;
}

export function ScrollReveal({
  delay = 0,
  y = 32,
  children,
  className,
  ...rest
}: ScrollRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: duration.slow, ease: ease.outExpo, delay }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
