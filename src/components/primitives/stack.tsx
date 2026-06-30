import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Direction = 'row' | 'column';
type Align = 'start' | 'center' | 'end' | 'stretch';
type Justify = 'start' | 'center' | 'end' | 'between' | 'around';
type Gap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const directionClass: Record<Direction, string> = {
  row: 'flex-row',
  column: 'flex-col',
};

const alignClass: Record<Align, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

const justifyClass: Record<Justify, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
};

const gapClass: Record<Gap, string> = {
  none: 'gap-0',
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-10',
};

interface StackProps extends HTMLAttributes<HTMLDivElement> {
  direction?: Direction;
  align?: Align;
  justify?: Justify;
  gap?: Gap;
  wrap?: boolean;
  children: ReactNode;
}

export function Stack({
  direction = 'column',
  align = 'stretch',
  justify = 'start',
  gap = 'md',
  wrap = false,
  className,
  children,
  ...rest
}: StackProps) {
  return (
    <div
      className={cn(
        'flex',
        directionClass[direction],
        alignClass[align],
        justifyClass[justify],
        gapClass[gap],
        wrap && 'flex-wrap',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
