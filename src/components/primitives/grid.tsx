import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Columns = 1 | 2 | 3 | 4 | 6 | 12;
type Gap = 'sm' | 'md' | 'lg' | 'xl';

const colsClass: Record<Columns, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
  12: 'grid-cols-12',
};

const gapClass: Record<Gap, string> = {
  sm: 'gap-3',
  md: 'gap-5',
  lg: 'gap-8',
  xl: 'gap-12',
};

interface GridProps extends HTMLAttributes<HTMLDivElement> {
  cols?: Columns;
  gap?: Gap;
  children: ReactNode;
}

export function Grid({ cols = 3, gap = 'md', className, children, ...rest }: GridProps) {
  return (
    <div className={cn('grid', colsClass[cols], gapClass[gap], className)} {...rest}>
      {children}
    </div>
  );
}
