import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type ContainerWidth = 'sm' | 'md' | 'lg' | 'xl' | 'full';

const widthClass: Record<ContainerWidth, string> = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-7xl',
  xl: 'max-w-[88rem]',
  full: 'max-w-none',
};

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  width?: ContainerWidth;
  children: ReactNode;
}

export function Container({ width = 'lg', className, children, ...rest }: ContainerProps) {
  return (
    <div
      className={cn('mx-auto w-full px-4 sm:px-8 lg:px-12', widthClass[width], className)}
      {...rest}
    >
      {children}
    </div>
  );
}
