import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Span = 'sm' | 'md' | 'lg' | 'wide' | 'tall' | 'feature';

const spanClass: Record<Span, string> = {
  sm: 'col-span-1 row-span-1',
  md: 'col-span-2 row-span-1',
  lg: 'col-span-2 row-span-2',
  wide: 'col-span-3 row-span-1',
  tall: 'col-span-1 row-span-2',
  feature: 'col-span-3 row-span-2',
};

interface BentoTileProps extends HTMLAttributes<HTMLElement> {
  span?: Span;
  children: ReactNode;
}

/**
 * Card variant tuned for bento grids. Wraps Card with span helpers and a
 * built-in soft glow on hover. Drop inside a `grid grid-cols-3 grid-flow-dense`
 * (or similar) parent.
 */
export function BentoTile({ span = 'sm', className, children, ...rest }: BentoTileProps) {
  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-lg bg-surface ring-1 ring-border ring-inset',
        'transition-[background,box-shadow,transform] duration-500 ease-out-expo',
        'hover:bg-surface-2 hover:shadow-glow hover:ring-border-strong',
        spanClass[span],
        className,
      )}
      {...rest}
    >
      {children}
    </article>
  );
}
