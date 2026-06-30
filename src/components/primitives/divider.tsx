import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  label?: ReactNode;
  align?: 'left' | 'center' | 'right';
}

/**
 * Horizontal rule with optional inline label. Defaults to a hairline border;
 * label segment renders in mono caps.
 */
export function Divider({ label, align = 'left', className, ...rest }: DividerProps) {
  if (!label) {
    return <hr className={cn('h-px w-full border-0 bg-border', className)} {...rest} />;
  }
  return (
    <div className={cn('flex items-center gap-4 text-muted', className)} {...rest}>
      {align !== 'left' && <hr className="h-px flex-1 border-0 bg-border" />}
      <span className="whitespace-nowrap font-mono text-label uppercase">{label}</span>
      {align !== 'right' && <hr className="h-px flex-1 border-0 bg-border" />}
    </div>
  );
}
