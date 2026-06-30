'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { MagneticButton } from './magnetic-button';
import { WebgpuShape } from './webgpu-shape';

const cases = [
  {
    id: '01',
    title: 'CCTV Dammam',
    meta: 'Bilingual Security Infrastructure',
    tech: 'Next.js 16 • Tailwind v4',
    svg: (
      <div className="h-48 w-48 opacity-60 mix-blend-screen transition-opacity duration-500 group-hover:opacity-100">
        <WebgpuShape shape="capsule" color={[0.62, 1.0, 0.0]} />
      </div>
    ),
  },
  {
    id: '02',
    title: 'RWA Terminal',
    meta: 'Institutional Yield Platform',
    tech: 'WebGPU • Tokenization',
    svg: (
      <div className="h-48 w-48 opacity-60 mix-blend-screen transition-opacity duration-500 group-hover:opacity-100">
        <WebgpuShape shape="octahedron" color={[0.62, 1.0, 0.0]} />
      </div>
    ),
  },
  {
    id: '03',
    title: 'Kalshi Sniper',
    meta: 'Ultra-Low Latency Engine',
    tech: 'Rust • tokio • MEV',
    svg: (
      <div className="h-48 w-48 opacity-60 mix-blend-screen transition-opacity duration-500 group-hover:opacity-100">
        <WebgpuShape shape="pyramid" color={[0.62, 1.0, 0.0]} />
      </div>
    ),
  },
];

export function CaseStudiesSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const cards = gsap.utils.toArray('.case-card', containerRef.current);

    gsap.fromTo(
      cards,
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        stagger: 0.15,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 75%',
          toggleActions: 'play none none reverse',
        },
      },
    );
  }, []);

  return (
    <section ref={containerRef} className="relative z-20 bg-bg px-6 py-32 md:px-12 lg:px-24">
      <div className="mb-20 flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <div>
          <h2 className="mb-4 font-sans text-display-md text-ink tracking-tight">
            Recent <span className="font-serif text-muted italic">Deployments</span>
          </h2>
          <p className="max-w-xl text-body-lg text-muted">
            Selected case studies demonstrating our capacity to build high-performance
            infrastructure across complex operational domains.
          </p>
        </div>

        <div data-cursor-target>
          <MagneticButton
            strength={20}
            className="border border-border px-6 py-3 text-sm hover:border-accent"
          >
            View All Indexes
          </MagneticButton>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {cases.map((c) => (
          <div
            key={c.id}
            data-cursor-target
            className="case-card group relative flex h-[500px] flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-colors duration-700 hover:bg-accent"
          >
            {/* Abstract Visual Top Half */}
            <div className="flex flex-1 items-center justify-center border-border border-b bg-surface-2 p-12 transition-colors duration-700 group-hover:border-ink/20 group-hover:bg-accent-strong">
              {c.svg}
            </div>

            {/* Meta Bottom Half */}
            <div className="p-8 transition-colors duration-700 group-hover:text-bg">
              <div className="mb-4 flex items-baseline justify-between">
                <span className="font-mono text-muted text-sm group-hover:text-bg/60">{c.id}</span>
                <span className="font-mono text-accent text-xs uppercase tracking-widest group-hover:text-bg/80">
                  {c.tech}
                </span>
              </div>
              <h3 className="mb-2 font-sans text-h2 tracking-tight group-hover:text-bg">
                {c.title}
              </h3>
              <p className="text-muted group-hover:text-bg/70">{c.meta}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
