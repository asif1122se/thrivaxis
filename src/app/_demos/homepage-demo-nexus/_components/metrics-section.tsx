'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

export function MetricsSection() {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Parallax effect for the metrics background
    gsap.to(containerRef.current, {
      backgroundPosition: '50% 100%',
      ease: 'none',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative z-20 overflow-hidden bg-bg px-6 py-40 md:px-12 lg:px-24"
      style={{
        backgroundImage:
          'radial-gradient(circle at 50% 0%, var(--color-surface-3) 0%, transparent 60%)',
        backgroundPosition: '50% 0%',
        backgroundSize: '100% 200%',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="grid grid-cols-1 gap-12 text-center md:grid-cols-3 lg:gap-24">
        <div className="flex flex-col items-center">
          <div className="poster-metric mb-4 font-sans text-display-2xl leading-none tracking-tighter md:text-display-3xl">
            100
          </div>
          <p className="mb-2 font-sans text-h3 text-ink">Lighthouse</p>
          <p className="font-mono text-body-sm text-muted uppercase tracking-widest">
            Performance Score
          </p>
        </div>

        <div className="flex flex-col items-center">
          <div className="poster-metric mb-4 font-sans text-display-2xl leading-none tracking-tighter md:text-display-3xl">
            60
          </div>
          <p className="mb-2 font-sans text-h3 text-ink">Frames/Second</p>
          <p className="font-mono text-body-sm text-muted uppercase tracking-widest">
            WebGL / WebGPU
          </p>
        </div>

        <div className="flex flex-col items-center">
          <div className="poster-metric mb-4 font-sans text-display-2xl leading-none tracking-tighter md:text-display-3xl">
            0.8
          </div>
          <p className="mb-2 font-sans text-h3 text-ink">Seconds LCP</p>
          <p className="font-mono text-body-sm text-muted uppercase tracking-widest">Render Time</p>
        </div>
      </div>
    </section>
  );
}
