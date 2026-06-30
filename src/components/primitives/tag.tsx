import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'neutral' | 'accent' | 'cool' | 'warm' | 'rose';
type Size = 'sm' | 'md';

const toneClass: Record<Tone, string> = {
  neutral: 'bg-surface-2 text-muted ring-border',
  accent: 'bg-accent-soft text-accent ring-accent/40',
  cool: 'bg-cool-soft text-cool ring-cool/40',
  warm: 'bg-warm-soft text-warm ring-warm/40',
  rose: 'bg-rose/10 text-rose ring-rose/40',
};

const sizeClass: Record<Size, string> = {
  sm: 'h-6 px-2 text-label tracking-wider',
  md: 'h-7 px-2.5 text-caption',
};

interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  size?: Size;
  withDot?: boolean;
  children: ReactNode;
}

export function Tag({
  tone = 'neutral',
  size = 'sm',
  withDot = false,
  className,
  children,
  ...rest
}: TagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-mono uppercase ring-1 ring-inset',
        toneClass[tone],
        sizeClass[size],
        className,
      )}
      {...rest}
    >
      {withDot && (
        <span
          aria-hidden="true"
          className={cn(
            'size-1.5 rounded-full',
            tone === 'accent' && 'bg-accent',
            tone === 'cool' && 'bg-cool',
            tone === 'warm' && 'bg-warm',
            tone === 'rose' && 'bg-rose',
            tone === 'neutral' && 'bg-muted',
          )}
        />
      )}
      {children}
    </span>
  );
}
