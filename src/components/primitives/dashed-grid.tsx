import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type DashedGridProps = HTMLAttributes<HTMLDivElement> & {
  fade?: boolean;
};

/**
 * Dashed engineering-canvas backdrop. Pure CSS — used as a section overlay.
 * Pair with a positioned parent (relative).
 */
export function DashedGrid({ fade = true, className, ...rest }: DashedGridProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 -z-10',
        '[background-image:linear-gradient(var(--grid-line)_1px,transparent_1px),linear-gradient(90deg,var(--grid-line)_1px,transparent_1px)]',
        '[background-size:var(--grid-size)_var(--grid-size)]',
        fade && '[mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]',
        className,
      )}
      {...rest}
    />
  );
}
