'use client';

import { type HTMLMotionProps, motion, useMotionValue, useSpring } from 'motion/react';
import { forwardRef, type MouseEvent, type ReactNode } from 'react';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'ghost' | 'outline';
type Size = 'sm' | 'md' | 'lg';

const variantClass: Record<Variant, string> = {
  primary:
    'bg-accent text-bg hover:bg-accent-strong shadow-[0_0_0_0_var(--color-accent)] hover:shadow-[0_0_60px_-10px_var(--color-accent-glow)]',
  ghost: 'bg-transparent text-ink hover:bg-surface',
  outline: 'bg-transparent text-ink ring-1 ring-inset ring-border hover:ring-border-strong',
};

const sizeClass: Record<Size, string> = {
  sm: 'h-9 px-4 text-body-sm rounded-md',
  md: 'h-11 px-5 text-body rounded-md',
  lg: 'h-14 px-7 text-body-lg rounded-lg',
};

type MagneticButtonProps = Omit<HTMLMotionProps<'button'>, 'children'> & {
  variant?: Variant;
  size?: Size;
  strength?: number;
  children: ReactNode;
};

export const MagneticButton = forwardRef<HTMLButtonElement, MagneticButtonProps>(
  function MagneticButton(
    { variant = 'primary', size = 'md', strength = 0.35, children, className, ...rest },
    ref,
  ) {
    const reduced = useReducedMotion();
    const mx = useMotionValue(0);
    const my = useMotionValue(0);
    const x = useSpring(mx, { stiffness: 220, damping: 18, mass: 0.6 });
    const y = useSpring(my, { stiffness: 220, damping: 18, mass: 0.6 });

    const onMove = (event: MouseEvent<HTMLButtonElement>) => {
      if (reduced) return;
      const target = event.currentTarget;
      const rect = target.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      mx.set(dx * strength);
      my.set(dy * strength);
    };

    const onLeave = () => {
      mx.set(0);
      my.set(0);
    };

    return (
      <motion.button
        ref={ref}
        style={{ x, y }}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-[background,box-shadow,color] duration-300',
          'select-none will-change-transform',
          variantClass[variant],
          sizeClass[size],
          className,
        )}
        {...rest}
      >
        {children}
      </motion.button>
    );
  },
);
