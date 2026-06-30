'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, SplitText } from '@/lib/gsap';

export function ManifestoSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!textRef.current || !containerRef.current) return;

    const split = new SplitText(textRef.current, { type: 'words' });

    gsap.fromTo(
      split.words,
      { opacity: 0.1, y: 10 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.1,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 70%',
          end: 'bottom 80%',
          scrub: true,
        },
      },
    );

    return () => {
      split.revert();
      ScrollTrigger.getAll().forEach((t) => {
        t.kill();
      });
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative z-20 flex min-h-[80vh] items-center justify-center bg-bg px-6 py-40 md:px-12 lg:px-24"
    >
      <div className="max-w-6xl">
        <h2
          ref={textRef}
          className="font-sans text-display-sm text-ink leading-[1.1] tracking-tight md:text-display-md lg:text-display-lg"
        >
          We do not use templates. We do not use generic builders. We engineer{' '}
          <span className="font-serif text-accent italic">code-native</span>, sub-second performance
          systems. Our architecture is the direct manifestation of deep engineering principles
          designed specifically for the next era of intelligent interaction.
        </h2>

        <div className="mt-20 flex items-center gap-4">
          <div className="h-px flex-1 bg-border" />
          <span className="font-mono text-label text-muted uppercase tracking-widest">
            Core Philosophy
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>
      </div>
    </section>
  );
}
