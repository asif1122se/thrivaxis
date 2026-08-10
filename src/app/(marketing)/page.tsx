'use client';

import { useGSAP } from '@gsap/react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useRef } from 'react';
import { StackMarquee } from '@/components/marketing/stack-marquee';
import { NeuralCoreFallback } from '@/components/scenes/neural-core-fallback';
import { KineticTypography } from '@/components/ui/kinetic-typography';
import { gsap, ScrollTrigger } from '@/lib/gsap';

const NeuralCoreCanvas = dynamic(
  () => import('@/components/scenes/neural-core-canvas').then((mod) => mod.NeuralCoreCanvas),
  { ssr: false, loading: () => <NeuralCoreFallback /> },
);

export default function MarketingPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Animate the cards in The Proof section
      gsap.from('.proof-card', {
        scrollTrigger: {
          trigger: '.proof-section',
          start: 'top 70%',
        },
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: 'power3.out',
      });

      // Animate the Playbook text items
      const playbookItems = gsap.utils.toArray('.playbook-item');
      // biome-ignore lint/suspicious/noExplicitAny: GSAP returns any
      playbookItems.forEach((item: any) => {
        gsap.from(item, {
          scrollTrigger: {
            trigger: item,
            start: 'top 80%',
          },
          x: item.classList.contains('md:flex-row-reverse') ? 50 : -50,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
        });
      });

      // Animate the Process steps
      gsap.from('.process-step', {
        scrollTrigger: {
          trigger: '.process-section',
          start: 'top 75%',
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'back.out(1.7)',
      });
      // Refresh ScrollTrigger after Lenis has mounted and taken over native scroll.
      // Without this, GSAP measures scroll heights before Lenis intercepts them,
      // causing triggers to fire at incorrect scroll positions.
      ScrollTrigger.refresh();
    },
    { scope: containerRef },
  );

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden bg-bg text-ink">
      <div className="relative z-10">
        {/* Section 1: The Hook */}
        <section className="relative flex min-h-[100dvh] items-center overflow-hidden border-border/50 border-b px-4 sm:px-6 pt-24 sm:pt-32 pb-12">
          {/* 3D Background layer scoped to hero */}
          <div className="pointer-events-none absolute inset-0 z-0">
            <NeuralCoreCanvas />
          </div>

          <div className="container relative z-10 mx-auto flex max-w-7xl flex-col items-start justify-center">
            <div className="mb-6 sm:mb-8 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-3.5 sm:px-4 py-1.5 sm:py-2 backdrop-blur-md">
              <div className="h-2 w-2 animate-pulse rounded-full bg-accent" />
              <span className="font-mono text-accent text-[11px] sm:text-xs uppercase tracking-wider sm:tracking-widest">
                US Based AI Development Agency
              </span>
            </div>
            <KineticTypography
              as="h1"
              text="Software that thinks for itself."
              className="max-w-3xl text-left font-display text-3xl xs:text-4xl leading-tight tracking-tight md:text-5xl lg:text-6xl"
            />
            <p className="mt-6 sm:mt-8 max-w-xl text-body sm:text-body-md text-muted/80 md:text-body-lg">
              We build intelligent products that give you an unfair advantage. No jargon, just
              real-world capabilities powered by the latest AI architectures.
            </p>
          </div>
        </section>

        {/* Section 1.5: The Stack (Marquee) */}
        <section className="relative flex flex-col items-center overflow-hidden border-border/50 border-b bg-bg py-6 sm:py-8">
          <StackMarquee />
        </section>

        {/* Section 2: The Proof */}
        <section className="proof-section relative min-h-screen border-border/50 border-b bg-bg px-4 sm:px-6 py-12 sm:py-16 md:py-24">
          <div className="container mx-auto max-w-7xl">
            <h2 className="mb-8 text-center font-display text-display-sm sm:mb-12 md:mb-16 md:text-display-md">
              What we've built.
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* Card 1 */}
              <div className="proof-card group relative overflow-hidden rounded-2xl border border-border bg-surface">
                <div className="relative aspect-[16/9] sm:aspect-[4/3] w-full overflow-hidden">
                  <Image
                    src="/mockups/mockup_dashboard_1779359048585.png"
                    alt="AI Dashboard"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-5 sm:p-6">
                  <h3 className="mb-2 font-medium text-accent text-h3">Enterprise Analytics</h3>
                  <p className="text-muted text-sm">
                    A real-time predictive dashboard built for scale.
                  </p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="proof-card group relative overflow-hidden rounded-2xl border border-border bg-surface lg:translate-y-12">
                <div className="relative aspect-[16/9] sm:aspect-[4/3] w-full overflow-hidden">
                  <Image
                    src="/mockups/mockup_mobile_1779359073731.png"
                    alt="Mobile Concierge"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-5 sm:p-6">
                  <h3 className="mb-2 font-medium text-accent text-h3">Conversational UI</h3>
                  <p className="text-muted text-sm">
                    An AI concierge that guides users organically.
                  </p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="proof-card group relative overflow-hidden rounded-2xl border border-border bg-surface md:col-span-2 lg:col-span-1">
                <div className="relative aspect-[16/9] sm:aspect-[4/3] w-full overflow-hidden">
                  <Image
                    src="/mockups/mockup_dataviz_1779359098527.png"
                    alt="Data Visualization"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-5 sm:p-6">
                  <h3 className="mb-2 font-medium text-accent text-h3">Spatial Intelligence</h3>
                  <p className="text-muted text-sm">
                    Complex data streams visualized in interactive 3D.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: The Playbook */}
        <section className="relative min-h-screen border-border/50 border-t bg-surface-2 px-4 sm:px-6 py-16 sm:py-24 md:py-32">
          <div className="container mx-auto max-w-5xl space-y-16 sm:space-y-24 md:space-y-32">
            <div className="playbook-item flex flex-col gap-6 sm:gap-8 md:flex-row md:items-center md:gap-12">
              <h2 className="font-display text-display-sm sm:text-display-md md:w-1/2">Talk to your data.</h2>
              <p className="text-body sm:text-body-lg text-muted md:w-1/2">
                Forget messy spreadsheets. We build conversational interfaces that let you ask
                plain-English questions and get instant, accurate insights from your proprietary
                databases.
              </p>
            </div>

            <div className="playbook-item flex flex-col gap-6 sm:gap-8 md:flex-row-reverse md:items-center md:gap-12">
              <h2 className="font-display text-display-sm sm:text-display-md md:w-1/2">Automate the mundane.</h2>
              <p className="text-body sm:text-body-lg text-muted md:w-1/2">
                If a task takes 10 clicks, it's 9 too many. We deploy autonomous agents to handle
                routing, scheduling, and repetitive workflows, freeing your team for high-leverage
                work.
              </p>
            </div>

            <div className="playbook-item flex flex-col gap-6 sm:gap-8 md:flex-row md:items-center md:gap-12">
              <h2 className="font-display text-display-sm sm:text-display-md md:w-1/2">Products that create.</h2>
              <p className="text-body sm:text-body-lg text-muted md:w-1/2">
                We don't just add an AI wrapper. We integrate powerful generative models directly
                into your core product, enabling your users to generate assets, copy, and designs
                seamlessly.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3.5: The Architecture */}
        <section className="relative border-border/50 border-y bg-bg px-4 sm:px-6 py-12 sm:py-20 md:py-24">
          <div className="container mx-auto max-w-7xl">
            <h2 className="mb-10 sm:mb-16 border-border border-b pb-4 sm:pb-6 text-left font-display text-display-xs md:text-display-sm">
              [ Core Capabilities ]
            </h2>
            <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:gap-y-16 md:grid-cols-2 lg:grid-cols-4">
              <div className="border-accent/30 border-l pl-4 sm:pl-6">
                <div className="mb-4 font-mono text-accent text-xs tracking-widest">01</div>
                <h3 className="mb-3 font-medium text-h4">RAG Systems</h3>
                <p className="text-muted text-sm leading-relaxed">
                  Retrieval-Augmented Generation architectures that securely index your proprietary
                  knowledge bases for instant, hallucination-free reasoning.
                </p>
              </div>
              <div className="border-accent/30 border-l pl-4 sm:pl-6">
                <div className="mb-4 font-mono text-accent text-xs tracking-widest">02</div>
                <h3 className="mb-3 font-medium text-h4">Autonomous Agents</h3>
                <p className="text-muted text-sm leading-relaxed">
                  Multi-agent systems capable of planning, tool-use, and executing complex workflows
                  without human intervention.
                </p>
              </div>
              <div className="border-accent/30 border-l pl-4 sm:pl-6">
                <div className="mb-4 font-mono text-accent text-xs tracking-widest">03</div>
                <h3 className="mb-3 font-medium text-h4">Computer Vision</h3>
                <p className="text-muted text-sm leading-relaxed">
                  Real-time spatial intelligence and image analysis pipelines for industrial,
                  medical, and security applications.
                </p>
              </div>
              <div className="border-accent/30 border-l pl-4 sm:pl-6">
                <div className="mb-4 font-mono text-accent text-xs tracking-widest">04</div>
                <h3 className="mb-3 font-medium text-h4">Generative UI</h3>
                <p className="text-muted text-sm leading-relaxed">
                  Interfaces that stream and render bespoke React components on the fly based on
                  user intent and contextual state.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: The Process */}
        <section className="process-section relative border-border/50 border-b bg-surface-3 px-4 sm:px-6 py-12 sm:py-20 md:py-24">
          <div className="container mx-auto max-w-4xl text-center">
            <KineticTypography
              text="From napkin sketch to intelligent product in weeks, not months."
              className="mb-8 sm:mb-12 justify-center font-display text-display-sm md:text-display-md"
            />
            <div className="grid grid-cols-1 gap-4 sm:gap-6 text-left md:grid-cols-3">
              <div className="process-step rounded-xl border border-border bg-bg p-5 sm:p-6 md:p-8 shadow-glow transition-shadow hover:shadow-accent-glow">
                <h3 className="mb-2 font-display text-accent text-h3">01. Discovery</h3>
                <p className="text-muted text-sm">
                  We map your operational bottlenecks and identify high-ROI AI opportunities.
                </p>
              </div>
              <div className="process-step rounded-xl border border-border bg-bg p-5 sm:p-6 md:p-8 shadow-glow transition-shadow hover:shadow-accent-glow">
                <h3 className="mb-2 font-display text-accent text-h3">02. Prototyping</h3>
                <p className="text-muted text-sm">
                  Rapid development of a functional proof-of-concept to validate the architecture.
                </p>
              </div>
              <div className="process-step rounded-xl border border-border bg-bg p-5 sm:p-6 md:p-8 shadow-glow transition-shadow hover:shadow-accent-glow">
                <h3 className="mb-2 font-display text-accent text-h3">03. Deployment</h3>
                <p className="text-muted text-sm">
                  Production-ready, highly performant deployment focused on security and scale.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: The Gateway */}
        <section className="relative flex min-h-[50vh] sm:min-h-[60vh] items-center justify-center bg-bg px-4 sm:px-6 pt-16 sm:pt-24 pb-24 sm:pb-36 md:pb-48">
          <div className="relative z-10 mx-auto w-full max-w-2xl rounded-3xl border border-border/30 bg-surface p-6 sm:p-8 text-center shadow-[0_0_80px_-20px_var(--color-accent-glow)] md:p-12">
            <h2 className="mb-6 sm:mb-8 font-display text-display-sm sm:text-display-md md:text-display-lg">
              Let's build your next era.
            </h2>
            <button
              type="button"
              className="w-full sm:w-auto rounded-full bg-accent px-6 py-3.5 sm:px-8 sm:py-4 font-medium text-base text-bg tracking-wide transition-all hover:scale-105 hover:opacity-90 md:px-10 md:py-5 md:text-lg"
            >
              Initialize Contact
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
