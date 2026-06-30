import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface QuoteProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  attribution?: ReactNode;
  size?: 'md' | 'lg' | 'xl';
}

const sizeClass = {
  md: 'text-h1',
  lg: 'text-display-sm',
  xl: 'text-display-md',
} as const;

/**
 * Editorial pullquote — Instrument Serif italic display, with mono attribution.
 */
export function Quote({ children, attribution, size = 'lg', className, ...rest }: QuoteProps) {
  return (
    <figure className={cn('flex flex-col gap-6', className)} {...rest}>
      <blockquote
        className={cn('font-serif text-ink italic leading-[1.05] tracking-tight', sizeClass[size])}
      >
        <span aria-hidden="true" className="text-accent">
          “
        </span>
        {children}
        <span aria-hidden="true" className="text-accent">
          ”
        </span>
      </blockquote>
      {attribution && (
        <figcaption className="font-mono text-label text-muted uppercase">
          — {attribution}
        </figcaption>
      )}
    </figure>
  );
}
