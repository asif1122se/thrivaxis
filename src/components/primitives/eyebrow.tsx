import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface EyebrowProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  withDot?: boolean;
}

export function Eyebrow({ children, withDot = true, className, ...rest }: EyebrowProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 font-mono text-label text-muted uppercase',
        className,
      )}
      {...rest}
    >
      {withDot && <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />}
      {children}
    </span>
  );
}
