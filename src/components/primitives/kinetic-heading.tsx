'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/cn';
import { gsap, registerGsapPlugins, ScrollTrigger, SplitText } from '@/lib/gsap';

interface KineticHeadingProps {
  as?: 'h1' | 'h2' | 'h3';
  children: string;
  className?: string;
  /** Trigger when in view; if false, plays on mount */
  triggerOnScroll?: boolean;
}

export function KineticHeading({
  as: Tag = 'h2',
  children,
  className,
  triggerOnScroll = true,
}: KineticHeadingProps) {
  const ref = useRef<HTMLHeadingElement | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!ref.current || reduced) return;
    registerGsapPlugins();

    const split = new SplitText(ref.current, {
      type: 'words,chars',
      wordsClass: 'inline-block overflow-hidden',
      charsClass: 'inline-block will-change-transform',
    });

    const tween = gsap.from(split.chars, {
      yPercent: 110,
      duration: 0.95,
      ease: 'expo.out',
      stagger: { each: 0.022, from: 'start' },
      paused: triggerOnScroll,
    });

    let trigger: ScrollTrigger | undefined;
    if (triggerOnScroll) {
      trigger = ScrollTrigger.create({
        trigger: ref.current,
        start: 'top 85%',
        once: true,
        onEnter: () => tween.play(),
      });
    }

    return () => {
      trigger?.kill();
      tween.kill();
      split.revert();
    };
  }, [reduced, triggerOnScroll]);

  // If the heading text needs to change at runtime, remount with a fresh key
  // (e.g. <KineticHeading key={text}>{text}</KineticHeading>) so SplitText re-runs.
  return (
    <Tag ref={ref} className={cn('font-display tracking-tight', className)}>
      {children}
    </Tag>
  );
}
