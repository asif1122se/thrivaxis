import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'default' | 'inset' | 'raised' | 'accent';
type Padding = 'none' | 'sm' | 'md' | 'lg';

const toneClass: Record<Tone, string> = {
  default: 'bg-surface ring-1 ring-inset ring-border',
  inset: 'bg-surface-2 ring-1 ring-inset ring-border',
  raised: 'bg-surface ring-1 ring-inset ring-border-strong shadow-card',
  accent:
    'bg-accent-soft ring-1 ring-inset ring-accent text-ink shadow-[inset_0_1px_0_0_var(--color-accent-glow)]',
};

const paddingClass: Record<Padding, string> = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: Tone;
  padding?: Padding;
  interactive?: boolean;
  children: ReactNode;
}

export function Card({
  tone = 'default',
  padding = 'md',
  interactive = false,
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg',
        toneClass[tone],
        paddingClass[padding],
        interactive &&
          'transition-[background,box-shadow,transform] duration-300 ease-out-expo hover:bg-surface-2 hover:ring-border-strong',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
