'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { WebgpuShape } from './webgpu-shape';

export function BentoCapabilities() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !gridRef.current) return;

    const cards = gsap.utils.toArray('.bento-card', gridRef.current) as HTMLElement[];

    // Reveal cards on scroll
    gsap.fromTo(
      cards,
      { y: 100, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        stagger: 0.1,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      },
    );

    return () => {
      ScrollTrigger.getAll().forEach((t) => {
        t.kill();
      });
    };
  }, []);

  return (
    <section ref={containerRef} className="relative z-20 bg-bg px-6 py-32 md:px-12 lg:px-24">
      {/* Editorial Header */}
      <div className="mb-20 max-w-4xl">
        <h2 className="mb-6 font-sans text-display-md text-ink tracking-tight">
          Architecting <span className="font-serif text-muted italic">Intelligence</span>
        </h2>
        <p className="max-w-2xl text-body-lg text-muted">
          We construct protocol-compliant digital surfaces that position your agency directly into
          LLM reasoning paths and ultra-premium human experiences.
        </p>
      </div>

      {/* Bento Grid */}
      <div
        ref={gridRef}
        className="grid auto-rows-[300px] grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4"
      >
        {/* Card 1: Agentic Commerce (Large) */}
        <div
          data-cursor-target
          className="bento-card group relative col-span-1 row-span-2 flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-surface p-8 transition-colors duration-500 hover:border-accent/40 md:col-span-2 lg:col-span-2"
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom_right,transparent_40%,var(--color-surface-2))] transition-all duration-700 group-hover:bg-[linear-gradient(to_bottom_right,transparent_30%,var(--color-accent-soft))]" />

          {/* Micro-animation WebGPU */}
          <div className="relative mb-8 h-32 w-32 opacity-90 mix-blend-screen transition-opacity duration-500 group-hover:opacity-100">
            <WebgpuShape shape="torus_knot" color={[0.62, 1.0, 0.0]} />
          </div>

          <div className="relative z-10">
            <h3 className="mb-4 font-sans text-display-sm text-ink tracking-tight">
              Agentic Commerce
            </h3>
            <p className="text-body-lg text-muted">
              Protocol-compliant product feeds (UCP/ACP) optimized for OpenAI and Google's discovery
              engines.
            </p>
          </div>
        </div>

        {/* Card 2: High-Performance UI */}
        <div
          data-cursor-target
          className="bento-card group relative col-span-1 row-span-1 flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-surface p-8 transition-colors duration-500 hover:border-accent/40 md:col-span-1 lg:col-span-2"
        >
          {/* Aesthetic Background WebGPU */}
          <div className="pointer-events-none absolute -top-16 -right-16 z-0 h-64 w-64 opacity-10 mix-blend-screen transition-opacity duration-500 group-hover:opacity-30">
            <WebgpuShape shape="hex_prism" color={[0.62, 1.0, 0.0]} />
          </div>

          <div className="relative z-10 flex items-start justify-between">
            <h3 className="text-h2 text-ink tracking-tight">Zero-JS LCP</h3>
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border transition-colors group-hover:border-accent group-hover:bg-accent-soft">
              <span className="h-2 w-2 rounded-full bg-muted group-hover:animate-ping group-hover:bg-accent" />
            </div>
          </div>
          <p className="relative z-10 mt-8 text-body text-muted">
            Sub-second rendering architectures using server-first streaming and progressive
            enhancement.
          </p>
        </div>

        {/* Card 3: Code-Native Identity */}
        <div
          data-cursor-target
          className="bento-card group relative col-span-1 row-span-1 flex flex-col justify-end overflow-hidden rounded-2xl border border-border bg-surface p-8 transition-colors duration-500 hover:border-accent/40 md:col-span-2 lg:col-span-1"
        >
          {/* Aesthetic Background WebGPU */}
          <div className="pointer-events-none absolute -top-12 -right-12 h-56 w-56 opacity-20 mix-blend-screen transition-opacity duration-500 group-hover:opacity-60">
            <WebgpuShape shape="boolean_core" color={[0.62, 1.0, 0.0]} />
          </div>
          <h3 className="relative z-10 mb-2 text-h2 text-ink tracking-tight">Code-Native</h3>
          <p className="relative z-10 text-body-sm text-muted">
            No stock imagery. Pure procedural aesthetics.
          </p>
        </div>

        {/* Card 4: Autonomous Systems */}
        <div
          data-cursor-target
          className="bento-card group relative col-span-1 row-span-1 flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-surface p-8 transition-colors duration-500 hover:border-accent/40 md:col-span-1 lg:col-span-1"
        >
          {/* Aesthetic Background WebGPU */}
          <div className="pointer-events-none absolute -right-16 -bottom-16 z-0 h-64 w-64 opacity-10 mix-blend-screen transition-opacity duration-500 group-hover:opacity-30">
            <WebgpuShape shape="fractal" color={[0.62, 1.0, 0.0]} />
          </div>

          <h3 className="relative z-10 text-h2 text-ink tracking-tight">Autonomous</h3>
          <div className="relative z-10 mt-8 h-1 w-full overflow-hidden rounded-full bg-border">
            <div className="h-full w-1/3 bg-accent transition-all duration-1000 ease-in-out-expo group-hover:w-full" />
          </div>
          <p className="relative z-10 mt-4 text-body-sm text-muted">Self-healing data pipelines.</p>
        </div>
      </div>
    </section>
  );
}
