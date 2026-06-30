import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Speed = 'slow' | 'normal' | 'fast';

const speedClass: Record<Speed, string> = {
  slow: 'animate-[marquee_60s_linear_infinite]',
  normal: 'animate-marquee',
  fast: 'animate-marquee-fast',
};

interface MarqueeRowProps {
  children: ReactNode;
  speed?: Speed;
  reverse?: boolean;
  fade?: boolean;
  className?: string;
}

export function MarqueeRow({
  children,
  speed = 'normal',
  reverse = false,
  fade = true,
  className,
}: MarqueeRowProps) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden',
        fade && '[mask-image:linear-gradient(90deg,transparent,black_15%,black_85%,transparent)]',
        className,
      )}
    >
      <div
        className={cn(
          'flex w-max gap-12 will-change-transform',
          speedClass[speed],
          reverse && '[animation-direction:reverse]',
          'group-hover:[animation-play-state:paused]',
        )}
      >
        <div className="flex shrink-0 items-center gap-12">{children}</div>
        <div aria-hidden="true" className="flex shrink-0 items-center gap-12">
          {children}
        </div>
      </div>
    </div>
  );
}
