'use client';

import { useEffect, useRef } from 'react';
import { gsap, SplitText } from '@/lib/gsap';
import { WebgpuCore } from './webgpu-core';

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef1 = useRef<HTMLHeadingElement>(null);
  const textRef2 = useRef<HTMLHeadingElement>(null);
  const subtextRef = useRef<HTMLParagraphElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!textRef1.current || !textRef2.current || !subtextRef.current || !coreRef.current) return;

    // Use SplitText for the dramatic typographic reveal
    const split1 = new SplitText(textRef1.current, { type: 'words,chars' });
    const split2 = new SplitText(textRef2.current, { type: 'words,chars' });

    const tl = gsap.timeline({ delay: 0.2 }); // Wait a bit after preloader

    tl.fromTo(
      [...split1.chars, ...split2.chars],
      { opacity: 0, y: 50, rotateX: -90 },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        stagger: 0.015,
        duration: 1.2,
        ease: 'power4.out',
      },
    )
      .fromTo(
        subtextRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out' },
        '-=0.8',
      )
      .fromTo(
        coreRef.current,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 2, ease: 'power3.out' },
        '-=1',
      );

    // Pinning and parallax on scroll
    gsap.to(containerRef.current, {
      y: 100,
      opacity: 0,
      scale: 0.95,
      ease: 'none',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });

    return () => {
      split1.revert();
      split2.revert();
      tl.kill();
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative z-10 flex min-h-[100dvh] flex-col items-start justify-center px-6 pt-20 md:px-12 lg:px-24"
      style={{ perspective: '1200px' }}
    >
      <div className="flex w-full flex-col items-center justify-between gap-12 lg:flex-row">
        {/* Left Column: Typographic Focus */}
        <div className="z-10 flex w-full flex-col items-start lg:w-[60%]">
          <h1 className="mb-2 font-sans text-display-lg text-ink leading-[0.85] tracking-tight md:text-display-xl lg:text-display-2xl">
            <span ref={textRef1} className="block">
              The New
            </span>
            <span ref={textRef2} className="block font-light font-serif text-accent italic">
              Standard.
            </span>
          </h1>

          <p
            ref={subtextRef}
            className="mt-12 max-w-xl font-light text-body-lg text-muted sm:text-h3"
          >
            We engineer code-native, high-performance systems for the next era of digital commerce
            and AI interaction. Built by principals, for industry leaders.
          </p>

          <div className="mt-12 flex items-center gap-6">
            <button
              type="button"
              data-cursor-target
              className="rounded-full bg-accent px-8 py-4 font-medium text-bg transition-colors duration-300 hover:bg-accent-strong"
            >
              Initialize Terminal
            </button>
            <button
              type="button"
              data-cursor-target
              className="rounded-full border border-border px-8 py-4 text-ink transition-colors duration-300 hover:border-accent/50"
            >
              Read Documentation
            </button>
          </div>
        </div>

        {/* Right Column: Code-Native Diagram */}
        <div ref={coreRef} className="flex w-full justify-center lg:w-[40%] lg:justify-end">
          <WebgpuCore />
        </div>
      </div>
    </section>
  );
}
