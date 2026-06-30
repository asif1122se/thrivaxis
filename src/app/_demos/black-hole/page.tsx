import { ArrowDown, ArrowUpRight, Check } from 'iconoir-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Container, Eyebrow, Stack } from '@/components/primitives';
import { BlackHoleCanvas } from '@/components/scenes/blackhole-canvas';

export const metadata: Metadata = {
  title: 'Black Hole — Real-time Kerr-Newman renderer',
  description:
    'A spinning, charged black hole rendered live in WebGPU. Photon ring, accretion disk with relativistic Doppler beaming, lensed starfield — pure math, no models, no captures.',
  alternates: { canonical: '/black-hole' },
};

export default function BlackHolePage() {
  return (
    <section className="relative isolate min-h-[100dvh] overflow-hidden">
      <BlackHoleCanvas className="absolute inset-0 -z-10" />

      <Container
        width="xl"
        className="relative z-10 flex min-h-[100dvh] flex-col justify-end pt-32 pb-16"
      >
        <Stack gap="xl" className="max-w-4xl">
          <Eyebrow>Real-time · WebGPU · Pure math · No assets</Eyebrow>

          <h1 className="font-display text-display-2xl text-ink text-on-canvas leading-[0.92] tracking-tight">
            Gravity,
            <br />
            <span className="font-serif text-accent italic">written by hand.</span>
          </h1>

          <p className="max-w-2xl text-body-lg text-ink/90 text-on-canvas">
            A spinning, charged Kerr-Newman black hole, rendered live in your browser. Photon ring,
            accretion disk with relativistic Doppler beaming and gravitational redshift, twin polar
            jets, gravitationally-lensed starfield — every pixel is math, frame after frame. No
            models. No captures. No fallback.
          </p>

          <Stack direction="row" gap="md" wrap>
            <Link
              href="/contact"
              className="inline-flex h-14 items-center gap-2 rounded-lg bg-accent px-7 font-medium text-bg text-body-lg transition-[background,box-shadow] duration-300 hover:bg-accent-strong hover:shadow-[0_0_60px_-10px_var(--color-accent-glow)]"
            >
              Open a brief
              <ArrowUpRight className="size-5" />
            </Link>
            <Link
              href="/#technique"
              className="inline-flex h-14 items-center gap-2 rounded-lg bg-bg/30 px-7 text-body-lg text-ink ring-1 ring-border-strong ring-inset backdrop-blur transition-colors hover:bg-bg/60 hover:ring-ink/40"
            >
              How it works
              <ArrowUpRight className="size-5" />
            </Link>
          </Stack>
        </Stack>

        <div className="mt-20 flex flex-wrap items-center gap-x-8 gap-y-3 border-ink/10 border-t pt-6 font-mono text-caption text-ink/70 uppercase">
          <span className="inline-flex items-center gap-2">
            <Check className="size-3.5 text-accent" /> Kerr a* = 0.99
          </span>
          <span className="inline-flex items-center gap-2">
            <Check className="size-3.5 text-accent" /> Pure WebGPU · no fallback
          </span>
          <span className="inline-flex items-center gap-2">
            <Check className="size-3.5 text-accent" /> Adaptive resolution
          </span>
          <span className="inline-flex items-center gap-2">
            <Check className="size-3.5 text-accent" /> Reduced-motion respected
          </span>
          <span className="ml-auto inline-flex items-center gap-2">
            <ArrowDown className="size-3.5" /> Move cursor to nudge frame
          </span>
        </div>
      </Container>
    </section>
  );
}
