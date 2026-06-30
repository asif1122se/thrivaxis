'use client';

import { type ReactNode, useEffect, useRef } from 'react';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/cn';
import { gsap, registerGsapPlugins, ScrollTrigger } from '@/lib/gsap';

interface PinnedHorizontalScrollProps {
  children: ReactNode;
  className?: string;
  /** Extra scroll distance multiplier applied beyond the natural width. Default 1 (no extra). */
  scrubMultiplier?: number;
}

/**
 * Pins a section to the viewport while its inner track translates horizontally
 * in step with vertical scroll. Reduced-motion users get a regular vertical
 * stack of children — no pinning, no horizontal motion.
 *
 * Children should set their own width — typically each is a `w-screen` panel.
 */
export function PinnedHorizontalScroll({
  children,
  className,
  scrubMultiplier = 1,
}: PinnedHorizontalScrollProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    registerGsapPlugins();

    const wrapper = wrapperRef.current;
    const track = trackRef.current;
    if (!wrapper || !track) return;

    const ctx = gsap.context(() => {
      const getTotal = () => Math.max(0, track.scrollWidth - window.innerWidth);
      const trigger = ScrollTrigger.create({
        trigger: wrapper,
        start: 'top top',
        end: () => `+=${getTotal() * scrubMultiplier}`,
        pin: true,
        scrub: 0.6,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          gsap.set(track, { x: -getTotal() * self.progress });
        },
      });
      return () => {
        trigger.kill();
      };
    }, wrapper);

    return () => ctx.revert();
  }, [reduced, scrubMultiplier]);

  if (reduced) {
    return <div className={cn('flex flex-col gap-6', className)}>{children}</div>;
  }

  return (
    <section
      ref={wrapperRef}
      className={cn('relative h-[100dvh] w-full overflow-hidden', className)}
    >
      <div ref={trackRef} className="flex h-full w-max items-stretch will-change-transform">
        {children}
      </div>
    </section>
  );
}
