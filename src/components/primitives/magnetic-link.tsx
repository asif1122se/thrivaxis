'use client';

import { motion, useMotionValue, useSpring } from 'motion/react';
import Link from 'next/link';
import type { MouseEvent, ReactNode } from 'react';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'outline' | 'ghost';
type Size = 'md' | 'lg';

const variantClass: Record<Variant, string> = {
  primary:
    'bg-accent text-bg hover:bg-accent-strong hover:shadow-[0_0_60px_-10px_var(--color-accent-glow)]',
  outline:
    'bg-bg/30 text-ink ring-1 ring-inset ring-border-strong backdrop-blur-md hover:bg-bg/60 hover:ring-ink/40',
  ghost: 'bg-transparent text-ink hover:bg-surface',
};

const sizeClass: Record<Size, string> = {
  md: 'h-11 px-5 text-body rounded-md gap-2',
  lg: 'h-14 px-7 text-body-lg rounded-lg gap-2',
};

interface MagneticLinkProps {
  href: string;
  variant?: Variant;
  size?: Size;
  strength?: number;
  className?: string;
  children: ReactNode;
  /** Use a plain anchor (e.g. mailto / external) instead of next/link. */
  external?: boolean;
}

/**
 * `MagneticButton`'s sibling for navigation. The anchor itself does the
 * magnetic pull — legal HTML (no nested interactives), looks identical to
 * `MagneticButton`. Reduced-motion users get a stationary version.
 */
export function MagneticLink({
  href,
  variant = 'primary',
  size = 'lg',
  strength = 0.35,
  className,
  children,
  external = false,
}: MagneticLinkProps) {
  const reduced = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 220, damping: 18, mass: 0.6 });
  const y = useSpring(my, { stiffness: 220, damping: 18, mass: 0.6 });

  const onMove = (e: MouseEvent<HTMLAnchorElement>) => {
    if (reduced) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    mx.set(dx * strength);
    my.set(dy * strength);
  };

  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  const baseClassName = cn(
    'inline-flex items-center justify-center font-medium transition-[background,box-shadow,color] duration-300',
    'select-none will-change-transform',
    variantClass[variant],
    sizeClass[size],
    className,
  );

  if (external) {
    return (
      <motion.a
        href={href}
        style={{ x, y }}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className={baseClassName}
      >
        {children}
      </motion.a>
    );
  }

  // motion(Link) plays nicely; we just need an inline-flex wrapper for the spring transform.
  return (
    <motion.span style={{ x, y }} className="inline-flex">
      <Link href={href} onMouseMove={onMove} onMouseLeave={onLeave} className={baseClassName}>
        {children}
      </Link>
    </motion.span>
  );
}
