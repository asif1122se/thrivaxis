import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface TerminalFrameProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  children: ReactNode;
}

/**
 * Mock terminal chrome. Pair with monospace content (Code, LogStream).
 */
export function TerminalFrame({
  title = 'thrivaxis ~ session',
  className,
  children,
  ...rest
}: TerminalFrameProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg bg-bg shadow-card ring-1 ring-border-strong ring-inset',
        className,
      )}
      {...rest}
    >
      <div className="flex items-center gap-3 border-border border-b bg-surface px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <span aria-hidden="true" className="size-2.5 rounded-full bg-rose/80" />
          <span aria-hidden="true" className="size-2.5 rounded-full bg-warm/80" />
          <span aria-hidden="true" className="size-2.5 rounded-full bg-accent/80" />
        </div>
        <span className="flex-1 text-center font-mono text-label text-muted uppercase">
          {title}
        </span>
        <span aria-hidden="true" className="size-2.5" />
      </div>
      <div className="font-mono text-body-sm">{children}</div>
    </div>
  );
}
