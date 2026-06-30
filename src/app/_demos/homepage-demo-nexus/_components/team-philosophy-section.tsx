'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

export function TeamPhilosophySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !textRef.current) return;

    gsap.fromTo(
      textRef.current,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
        },
      },
    );
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative z-20 border-border border-y bg-surface px-6 py-40 md:px-12 lg:px-24"
    >
      <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
        <div className="mb-12 flex h-16 w-16 items-center justify-center rounded-full border border-accent/50">
          <div className="h-2 w-2 animate-ping rounded-full bg-accent" />
        </div>

        <h2 className="mb-12 font-sans text-display-md text-ink leading-tight tracking-tight md:text-display-lg">
          No Juniors.
          <br />
          <span className="font-serif text-accent italic">Only Principals.</span>
        </h2>

        <p
          ref={textRef}
          className="max-w-3xl font-light text-body-lg text-muted leading-relaxed sm:text-h3"
        >
          We operate exclusively with Principal-level engineers and designers. When you partner with
          Thrivaxis, there is no bait-and-switch. The experts you speak with are the ones writing
          your shaders, optimizing your infrastructure, and deploying your commerce engines.
        </p>
      </div>
    </section>
  );
}
