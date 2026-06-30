import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type SectionPadding = 'sm' | 'md' | 'lg' | 'xl';

const paddingClass: Record<SectionPadding, string> = {
  sm: 'py-12 sm:py-16',
  md: 'py-16 sm:py-24',
  lg: 'py-24 sm:py-32',
  xl: 'py-32 sm:py-48',
};

interface SectionProps extends HTMLAttributes<HTMLElement> {
  padding?: SectionPadding;
  children: ReactNode;
}

export function Section({ padding = 'lg', className, children, ...rest }: SectionProps) {
  return (
    <section className={cn('relative', paddingClass[padding], className)} {...rest}>
      {children}
    </section>
  );
}
