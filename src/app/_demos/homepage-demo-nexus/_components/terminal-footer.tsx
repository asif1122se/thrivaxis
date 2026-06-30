'use client';

import { MagneticButton } from './magnetic-button';

export function TerminalFooter() {
  return (
    <section className="relative z-20 flex min-h-[80vh] flex-col items-center justify-between overflow-hidden border-border/50 border-t bg-bg pt-32 pb-12">
      {/* Background radial glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 h-[500px] w-full max-w-4xl -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,var(--color-surface-3),transparent_70%)]" />

      <div className="z-10 flex flex-1 flex-col items-center justify-center text-center">
        <h2 className="mb-12 font-sans text-display-md tracking-tight md:text-display-xl">
          Ready to engineer
          <br />
          <span className="font-serif text-accent italic">the future?</span>
        </h2>

        <div data-cursor-target className="inline-block">
          <MagneticButton
            strength={30}
            className="border-white/20 px-12 py-6 text-lg hover:border-accent"
          >
            Deploy Next Protocol
          </MagneticButton>
        </div>
      </div>

      {/* Footer Links & Meta */}
      <div className="z-10 mt-20 flex w-full max-w-7xl flex-col items-center justify-between gap-6 px-6 font-mono text-label text-muted uppercase md:flex-row">
        <div className="flex items-center gap-6">
          <span className="text-ink">© 2026 Thrivaxis</span>
          <a href="/" className="transition-colors hover:text-accent">
            Twitter
          </a>
          <a href="/" className="transition-colors hover:text-accent">
            GitHub
          </a>
          <a href="/" className="transition-colors hover:text-accent">
            LinkedIn
          </a>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-accent" />
          <span>All Systems Nominal</span>
        </div>
      </div>
    </section>
  );
}
