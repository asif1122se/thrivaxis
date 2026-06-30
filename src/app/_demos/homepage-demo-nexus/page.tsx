'use client';

import { useState } from 'react';
import { BentoCapabilities } from './_components/bento-capabilities';
import { CaseStudiesSection } from './_components/case-studies-section';
import { HeroSection } from './_components/hero-section';
import { ManifestoSection } from './_components/manifesto-section';
import { MetricsSection } from './_components/metrics-section';
import { Navigation } from './_components/navigation';
import { Preloader } from './_components/preloader';
import { TeamPhilosophySection } from './_components/team-philosophy-section';
import { TerminalFooter } from './_components/terminal-footer';

export default function HomepageDemoNexus() {
  const [preloaderFinished, setPreloaderFinished] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg text-ink selection:bg-accent selection:text-bg">
      {!preloaderFinished && <Preloader onComplete={() => setPreloaderFinished(true)} />}

      <Navigation />

      {/* 
        Main Page Content
        GSAP measures these immediately, but intro animations delay for the preloader.
      */}
      <div className="relative z-10 flex flex-col">
        <HeroSection />
        <ManifestoSection />
        <BentoCapabilities />
        <CaseStudiesSection />
        <TeamPhilosophySection />
        <MetricsSection />
        <TerminalFooter />
      </div>
    </div>
  );
}
