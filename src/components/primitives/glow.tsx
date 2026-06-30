import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type GlowSize = 'sm' | 'md' | 'lg' | 'xl';
type GlowTone = 'accent' | 'cool' | 'warm';
type GlowPosition = 'center' | 'top' | 'bottom' | 'left' | 'right';

const sizeClass: Record<GlowSize, string> = {
  sm: 'size-32 blur-2xl',
  md: 'size-64 blur-3xl',
  lg: 'size-[28rem] blur-[80px]',
  xl: 'size-[48rem] blur-[120px]',
};

const toneClass: Record<GlowTone, string> = {
  accent: 'bg-accent/30',
  cool: 'bg-cool/25',
  warm: 'bg-warm/25',
};

const positionClass: Record<GlowPosition, string> = {
  center: 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
  top: 'left-1/2 top-0 -translate-x-1/2 -translate-y-1/2',
  bottom: 'left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2',
  left: 'top-1/2 left-0 -translate-x-1/2 -translate-y-1/2',
  right: 'top-1/2 right-0 translate-x-1/2 -translate-y-1/2',
};

interface GlowProps extends HTMLAttributes<HTMLDivElement> {
  size?: GlowSize;
  tone?: GlowTone;
  position?: GlowPosition;
  pulse?: boolean;
}

/**
 * Decorative blurred halo. Place inside a `relative` container.
 * Always aria-hidden — purely visual.
 */
export function Glow({
  size = 'md',
  tone = 'accent',
  position = 'center',
  pulse = false,
  className,
  ...rest
}: GlowProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute -z-10 rounded-full',
        sizeClass[size],
        toneClass[tone],
        positionClass[position],
        pulse && 'animate-glow-pulse',
        className,
      )}
      {...rest}
    />
  );
}
