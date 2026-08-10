'use client';

import { motion } from 'motion/react';
import { cn } from '@/lib/cn';

interface KineticTypographyProps {
  text: string;
  className?: string;
  // biome-ignore lint/suspicious/noExplicitAny: polymorphic 'as' prop — React.ElementType breaks JSX children inference
  as?: any;
  delay?: number;
}

export function KineticTypography({
  text,
  className,
  as: Component = 'div',
  delay = 0,
}: KineticTypographyProps) {
  const words = text.split(' ');

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: delay },
    },
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        type: 'spring',
        damping: 15,
        stiffness: 100,
        // biome-ignore lint/suspicious/noExplicitAny: framer-motion variants
      } as any,
    },
    hidden: {
      opacity: 0,
      y: 30,
      filter: 'blur(12px)',
    },
  };

  return (
    <Component className={cn('flex flex-wrap py-1', className)}>
      <motion.div
        // biome-ignore lint/suspicious/noExplicitAny: framer-motion variants
        variants={container as any}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-10%' }}
        className="flex flex-wrap gap-x-[0.25em]"
      >
        {words.map((word, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: simple word map without reordering
          // biome-ignore lint/suspicious/noExplicitAny: framer-motion variants
          <motion.span variants={child as any} key={index} className="inline-block">
            {word}
          </motion.span>
        ))}
      </motion.div>
    </Component>
  );
}
