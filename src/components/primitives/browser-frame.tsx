import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface BrowserFrameProps extends HTMLAttributes<HTMLDivElement> {
  url?: string;
  children: ReactNode;
}

/**
 * Mock browser chrome around children. Used to wrap fake-but-plausible
 * UI mockups designed by us — the code-native substitute for a screenshot.
 */
export function BrowserFrame({
  url = 'thrivaxis.com',
  className,
  children,
  ...rest
}: BrowserFrameProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg bg-surface shadow-card ring-1 ring-border ring-inset',
        className,
      )}
      {...rest}
    >
      <div className="flex items-center gap-3 border-border border-b bg-surface-2 px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span aria-hidden="true" className="size-2.5 rounded-full bg-rose/80" />
          <span aria-hidden="true" className="size-2.5 rounded-full bg-warm/80" />
          <span aria-hidden="true" className="size-2.5 rounded-full bg-accent/80" />
        </div>
        <div className="flex h-7 flex-1 items-center justify-center rounded-md bg-bg/60 px-3 ring-1 ring-border ring-inset">
          <span className="truncate font-mono text-label text-muted">{url}</span>
        </div>
        <div className="flex items-center gap-1.5 opacity-50">
          <span aria-hidden="true" className="block size-1 rounded-full bg-muted" />
          <span aria-hidden="true" className="block size-1 rounded-full bg-muted" />
          <span aria-hidden="true" className="block size-1 rounded-full bg-muted" />
        </div>
      </div>
      <div className="bg-bg">{children}</div>
    </div>
  );
}
