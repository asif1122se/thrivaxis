import { ArrowDown, ArrowRight, ArrowUpRight } from 'iconoir-react';
import type { Metadata } from 'next';
import { Fragment } from 'react';
import {
  Container,
  Eyebrow,
  KineticHeading,
  MagneticLink,
  PinnedHorizontalScroll,
  ScrollReveal,
  Stack,
} from '@/components/primitives';
import { FluidOrbCanvas } from '@/components/scenes/fluid-orb-canvas';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

export const metadata: Metadata = {
  title: 'Refractive systems, engineered by hand',
  description:
    'Thrivaxis builds AI systems for ambitious teams in the United States. Real-time WebGPU + TSL, pure math, no assets — every surface inspectable from any angle.',
  alternates: { canonical: '/homepage-demo-sdf' },
};

const ACCENT_GREEN = [0.78, 0.95, 0.32] as const;

export default function HomepageSDF() {
  return (
    <>
      <SiteHeader />

      <Hero />
      <Manifesto />
      <Doctrines />
      <Moment />
      <Process />
      <InProduction />
      <Convictions />
      <ClosingCTA />

      <SiteFooter />
    </>
  );
}

/* ─── Hero ───────────────────────────────────────────────────────────── */

function Hero() {
  return (
    <section className="relative isolate min-h-[110dvh] overflow-hidden">
      <FluidOrbCanvas
        accent={ACCENT_GREEN}
        className="absolute inset-0 -z-10"
        ariaLabel="Fluid-simulated particle orb — real-time WebGPU"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[44vh] bg-gradient-to-b from-transparent via-bg/40 to-bg"
      />

      <div className="relative z-10 flex min-h-[110dvh] flex-col">
        <Container width="xl" className="flex flex-1 flex-col">
          <div className="flex items-start justify-between pt-32 pb-4">
            <ScrollReveal>
              <Eyebrow>WebGPU · TSL · No assets · MMXXVI</Eyebrow>
            </ScrollReveal>
            <ScrollReveal delay={0.05}>
              <span className="hidden font-mono text-ink/60 text-label uppercase sm:inline-flex">
                <span className="mr-2 size-1.5 translate-y-[5px] rounded-full bg-accent" />
                30 000 particles · curl flow · cursor reactive
              </span>
            </ScrollReveal>
          </div>

          <div className="flex flex-1 flex-col justify-end pb-24 sm:pb-36">
            <ScrollReveal delay={0.08}>
              <h1
                className="font-display text-ink text-on-canvas tracking-tight"
                style={{
                  fontSize: 'clamp(3.75rem, 14vw + 1rem, 15rem)',
                  lineHeight: 0.84,
                  letterSpacing: '-0.05em',
                }}
              >
                Refractive
                <br />
                systems.
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={0.18}>
              <p
                className="-mt-3 font-serif text-accent text-on-canvas italic sm:-mt-5"
                style={{
                  fontSize: 'clamp(2.75rem, 12vw + 0.5rem, 12rem)',
                  lineHeight: 0.92,
                  letterSpacing: '-0.04em',
                }}
              >
                Engineered by hand.
              </p>
            </ScrollReveal>

            <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
              <ScrollReveal delay={0.25} className="lg:col-span-7">
                <p className="max-w-2xl text-body-lg text-ink/90 text-on-canvas">
                  A small studio for ambitious teams in the United States. Strategy, design, and
                  engineering for AI systems that have to work — every surface inspectable, every
                  choice written down, no decks.
                </p>
              </ScrollReveal>

              <ScrollReveal delay={0.32} className="lg:col-span-5">
                <Stack direction="row" gap="md" wrap align="center">
                  <MagneticLink href="/contact" variant="primary" size="lg">
                    Open a brief
                    <ArrowUpRight className="size-5" />
                  </MagneticLink>
                  <MagneticLink href="#in-production" variant="outline" size="lg">
                    Selected work
                    <ArrowDown className="size-5" />
                  </MagneticLink>
                </Stack>
              </ScrollReveal>
            </div>
          </div>
        </Container>

        <div className="border-ink/10 border-t backdrop-blur-sm">
          <Container width="xl">
            <div className="flex flex-col items-start justify-between gap-3 py-5 font-mono text-caption text-ink/65 uppercase sm:flex-row sm:items-center">
              <span>Thrivaxis · United States · MMXXVI</span>
              <span className="hidden sm:inline">Move cursor — the field bends with you</span>
              <span className="inline-flex items-center gap-2">
                Refraction index <span className="text-accent">n = 1.50</span>
              </span>
            </div>
          </Container>
        </div>
      </div>
    </section>
  );
}

/* ─── Manifesto ──────────────────────────────────────────────────────── */

function Manifesto() {
  return (
    <section
      aria-label="Manifesto"
      className="relative overflow-hidden border-border/60 border-y bg-bg py-36 sm:py-48"
    >
      <Container width="xl" className="relative">
        <ScrollReveal>
          <p
            className="max-w-6xl text-ink leading-[1.02] tracking-tight"
            style={{
              fontSize: 'clamp(2.25rem, 5vw + 0.5rem, 5rem)',
              letterSpacing: '-0.035em',
            }}
          >
            We don't build slides. We build{' '}
            <span className="font-serif text-accent italic">surfaces</span> — the kind of system
            that holds up to <span className="font-serif italic">light from any angle</span>, six
            months from now, at two a.m.
          </p>
        </ScrollReveal>
      </Container>
    </section>
  );
}

/* ─── Doctrines — type-driven, no italic serif on H2, mono-dot labels ─ */

interface Doctrine {
  title: string;
  italic: string;
  body: string;
  signal: string;
  signalLabel: string;
  tags: readonly string[];
}

const DOCTRINES: readonly Doctrine[] = [
  {
    title: 'Liquid systems',
    italic: 'agents that route, decide, recover',
    body: 'Production AI agents with eval harnesses, structured tools, and recovery paths. They run inside your stack — not a notebook, not a webhook prayer.',
    signal: '4.2s',
    signalLabel: 'p95 first token',
    tags: ['Agents', 'Tool use', 'Eval'],
  },
  {
    title: 'Lattice infrastructure',
    italic: 'pipelines you can step through',
    body: 'Ingest, retrieve, transform. Pipelines that emit traces rich enough that any decision can be inspected and replayed — by you, six months from now, at 2 a.m.',
    signal: '99.97%',
    signalLabel: 'pipeline uptime',
    tags: ['RAG', 'Pipelines', 'Tracing'],
  },
  {
    title: 'Crystalline products',
    italic: 'frontends with the polish of physical objects',
    body: 'Typed, accessible, fast. Built with the craft you would expect from a piece of furniture — every joint considered, every surface intentional, every state designed.',
    signal: 'AA+',
    signalLabel: 'WCAG 2.2 audited',
    tags: ['Next.js', 'Design systems', 'A11y'],
  },
  {
    title: 'Resonant operations',
    italic: 'eval, observability, drift',
    body: "The instruments behind the system. We do not write production AI without the harness that tells us when we are done — or when yesterday's answer no longer holds.",
    signal: '12 min',
    signalLabel: 'mean time to detect',
    tags: ['Eval', 'Observability', 'Drift'],
  },
];

function Doctrines() {
  return (
    <section
      id="doctrines"
      aria-labelledby="doctrines-heading"
      className="relative bg-bg py-32 sm:py-48"
    >
      <Container width="xl">
        <Stack gap="xl">
          <Stack gap="lg" className="max-w-5xl">
            <ScrollReveal>
              <Eyebrow>What we make · Four doctrines</Eyebrow>
            </ScrollReveal>
            <ScrollReveal delay={0.05}>
              <h2
                id="doctrines-heading"
                className="font-display text-ink leading-[0.92] tracking-tight"
                style={{
                  fontSize: 'clamp(2.75rem, 8vw + 0.5rem, 9rem)',
                  letterSpacing: '-0.04em',
                }}
              >
                From the metaphysics down to the moving parts.
              </h2>
            </ScrollReveal>
          </Stack>

          <ol className="flex flex-col">
            {DOCTRINES.map((d, i) => (
              <ScrollReveal key={d.title} delay={0.05}>
                <DoctrineRow doctrine={d} last={i === DOCTRINES.length - 1} />
              </ScrollReveal>
            ))}
          </ol>
        </Stack>
      </Container>
    </section>
  );
}

function DoctrineRow({ doctrine, last }: { doctrine: Doctrine; last: boolean }) {
  return (
    <li
      className={`group grid grid-cols-1 gap-8 border-border/60 border-t py-16 transition-colors hover:bg-surface/20 lg:grid-cols-12 lg:gap-12 lg:py-24 ${last ? 'border-b' : ''}`}
    >
      <div className="flex flex-col gap-3 lg:col-span-3">
        <span
          className="poster-metric font-display leading-none tracking-tight"
          style={{ fontSize: 'clamp(2.5rem, 4.5vw + 0.5rem, 4.5rem)' }}
        >
          {doctrine.signal}
        </span>
        <span className="font-mono text-caption text-muted uppercase tracking-[0.18em]">
          {doctrine.signalLabel}
        </span>
      </div>

      <div className="flex flex-col gap-5 lg:col-span-9">
        <h3
          className="font-display text-ink leading-[0.95] tracking-tight"
          style={{
            fontSize: 'clamp(2.25rem, 5.4vw + 0.5rem, 5.5rem)',
            letterSpacing: '-0.035em',
          }}
        >
          {doctrine.title}
        </h3>
        <p className="font-serif text-h2 text-muted italic">— {doctrine.italic}.</p>
        <p className="max-w-3xl text-body-lg text-ink/85">{doctrine.body}</p>
        <InlineLabels labels={doctrine.tags} />
      </div>
    </li>
  );
}

/**
 * Editorial replacement for chip-style tags — middle-dot separated mono caps,
 * wide letter-spacing, subdued colour. No pill background, no ring.
 */
function InlineLabels({ labels }: { labels: readonly string[] }) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-caption text-muted uppercase tracking-[0.18em]">
      {labels.map((label, i) => (
        <Fragment key={label}>
          {i > 0 && (
            <span aria-hidden="true" className="text-muted/40">
              ·
            </span>
          )}
          <span>{label}</span>
        </Fragment>
      ))}
    </div>
  );
}

/* ─── Moment — single italic line, the rest beat between info blocks ── */

function Moment() {
  return (
    <section
      aria-label="Rest beat"
      className="relative flex min-h-[90dvh] items-center justify-center overflow-hidden bg-bg py-32"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: `
            radial-gradient(ellipse 50% 40% at 50% 50%, oklch(70% 0.20 130 / 8%) 0%, transparent 60%),
            radial-gradient(ellipse 80% 60% at 50% 50%, oklch(50% 0.12 290 / 6%) 0%, transparent 70%)
          `,
        }}
      />
      <Container width="xl" className="relative">
        <KineticHeading
          as="h2"
          className="mx-auto max-w-6xl text-center font-serif text-ink italic leading-[1.04]"
        >
          Light through glass is just math. So, when you look at it the right way, is intelligence.
        </KineticHeading>
      </Container>
    </section>
  );
}

/* ─── Process — pinned horizontal scroll ─────────────────────────────── */

const PROCESS = [
  {
    n: '01',
    title: 'Survey',
    italic: 'read the current state',
    body: 'We map your stack, your data, your constraints, and the human shape of the team that will own what we build.',
  },
  {
    n: '02',
    title: 'Sketch',
    italic: 'define the shape',
    body: 'A small number of sharp choices: which models, which tools, which surfaces. Written down, signed off, costed.',
  },
  {
    n: '03',
    title: 'Sculpt',
    italic: 'build the system',
    body: 'Production-grade engineering — typed, observable, reversible. The eval harness lands before the first feature does.',
  },
  {
    n: '04',
    title: 'Polish',
    italic: 'measure, refine, harden',
    body: 'Drift checks, latency budgets, prompt churn, error budgets. We watch it the way you would watch a flight path.',
  },
  {
    n: '05',
    title: 'Hand off',
    italic: 'your team owns the result',
    body: 'Documented, instrumented, runbooked. We leave when the system runs without us — that is the point.',
  },
];

function Process() {
  return (
    <section
      id="process"
      aria-labelledby="process-heading"
      className="relative overflow-hidden border-border/60 border-y bg-surface/15"
    >
      <PinnedHorizontalScroll scrubMultiplier={0.85}>
        {/* Intro panel — section heading + small caption */}
        <article className="flex h-full w-screen items-center px-8 sm:px-16 lg:px-24">
          <div className="flex max-w-3xl flex-col gap-8">
            <Eyebrow>How we work · Five passes</Eyebrow>
            <h2
              id="process-heading"
              className="font-display text-ink leading-[0.92] tracking-tight"
              style={{
                fontSize: 'clamp(2.75rem, 8vw + 0.5rem, 9rem)',
                letterSpacing: '-0.04em',
              }}
            >
              Each pass closer to the final form.
            </h2>
            <p className="max-w-xl font-mono text-caption text-muted uppercase tracking-[0.18em]">
              Scroll · Drag · Five passes from sheet to ship
            </p>
          </div>
        </article>

        {PROCESS.map((step, i) => (
          <ProcessPanel key={step.n} step={step} index={i} />
        ))}
      </PinnedHorizontalScroll>
    </section>
  );
}

function ProcessPanel({ step, index }: { step: (typeof PROCESS)[number]; index: number }) {
  // Per-panel tonal hue so each pass has its own colour temperature.
  const hues = [130, 200, 60, 290, 25];
  const hue = hues[index % hues.length];

  return (
    <article
      className="relative flex h-full w-screen flex-col justify-center px-8 sm:px-16 lg:px-24"
      style={{
        background: `radial-gradient(ellipse 60% 50% at 30% 40%, oklch(50% 0.16 ${hue} / 8%) 0%, transparent 65%)`,
      }}
    >
      <div className="grid w-full max-w-7xl grid-cols-1 items-end gap-12 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <span
            className="poster-metric block font-display leading-[0.8] tracking-tight"
            style={{
              fontSize: 'clamp(7rem, 18vw + 1rem, 22rem)',
              letterSpacing: '-0.06em',
            }}
          >
            {step.n}
          </span>
        </div>

        <div className="flex flex-col gap-5 lg:col-span-9">
          <h3
            className="font-display text-ink leading-[0.95] tracking-tight"
            style={{
              fontSize: 'clamp(2.5rem, 7vw + 0.5rem, 7.5rem)',
              letterSpacing: '-0.04em',
            }}
          >
            {step.title}
          </h3>
          <p className="font-serif text-h2 text-muted italic">— {step.italic}.</p>
          <p className="max-w-2xl text-body-lg text-ink/85">{step.body}</p>
        </div>
      </div>

      <span className="absolute right-6 bottom-6 font-mono text-label text-muted uppercase tracking-[0.18em] sm:right-12 sm:bottom-12">
        Pass {index + 1} of {PROCESS.length}
      </span>
    </article>
  );
}

/* ─── In production — editorial full-viewport spreads ────────────────── */

interface Case {
  client: string;
  industry: string;
  outcome: string;
  metric: string;
  metricLabel: string;
  tags: readonly string[];
  hue: number;
}

const CASES: readonly Case[] = [
  {
    client: 'LedgerMind',
    industry: 'Fintech · Compliance',
    outcome: 'A continuous-audit AI that replaced a manual review desk.',
    metric: '94%',
    metricLabel: 'cases auto-cleared',
    tags: ['Agents', 'Eval', 'Audit trail'],
    hue: 130,
  },
  {
    client: 'Atlas Grow',
    industry: 'DTC · Marketing',
    outcome: 'A creative & media optimizer that ships variants every night.',
    metric: '3.2×',
    metricLabel: 'ROAS, blended',
    tags: ['Pipelines', 'Generative', 'CDP'],
    hue: 75,
  },
  {
    client: 'Halo Health',
    industry: 'Healthcare · Operations',
    outcome: 'A patient engagement agent that lives inside HIPAA boundaries.',
    metric: '−47%',
    metricLabel: 'no-show rate',
    tags: ['HIPAA', 'Voice', 'Scheduling'],
    hue: 235,
  },
];

function InProduction() {
  return (
    <section id="in-production" aria-labelledby="production-heading" className="relative bg-bg">
      <Container width="xl" className="py-32 sm:py-48">
        <Stack gap="lg" className="max-w-5xl">
          <ScrollReveal>
            <Eyebrow>In production · Three engagements, three results</Eyebrow>
          </ScrollReveal>
          <ScrollReveal delay={0.05}>
            <h2
              id="production-heading"
              className="font-display text-ink leading-[0.92] tracking-tight"
              style={{
                fontSize: 'clamp(2.75rem, 8vw + 0.5rem, 9rem)',
                letterSpacing: '-0.04em',
              }}
            >
              Things we built for teams that ship.
            </h2>
          </ScrollReveal>
        </Stack>
      </Container>

      <ol className="flex flex-col">
        {CASES.map((c, i) => (
          <CaseSpread key={c.client} caseItem={c} index={i} />
        ))}
      </ol>
    </section>
  );
}

function CaseSpread({ caseItem, index }: { caseItem: Case; index: number }) {
  const flipped = index % 2 === 1;
  const accentSoft = `oklch(75% 0.22 ${caseItem.hue} / 14%)`;
  const accentBright = `oklch(80% 0.22 ${caseItem.hue})`;

  return (
    <li
      className="relative isolate border-border/40 border-t"
      style={{
        background: `
          radial-gradient(ellipse 50% 45% at ${flipped ? '80%' : '20%'} 40%, ${accentSoft} 0%, transparent 60%),
          oklch(8% 0.014 270)
        `,
      }}
    >
      <Container width="xl" className="relative min-h-[95dvh] py-28 sm:py-36">
        <div
          className={`grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-20 ${flipped ? 'lg:[&>*:first-child]:order-2' : ''}`}
        >
          {/* Poster column */}
          <ScrollReveal className="flex flex-col gap-6 lg:col-span-5">
            <span
              className="font-mono text-label uppercase tracking-[0.18em]"
              style={{ color: accentBright }}
            >
              {caseItem.industry}
            </span>
            <span
              className="poster-metric font-display leading-[0.85] tracking-tight"
              style={{
                fontSize: 'clamp(5rem, 12vw + 1rem, 15rem)',
                letterSpacing: '-0.055em',
                textShadow: `0 0 100px ${accentSoft}, 0 0 32px rgb(0 0 0 / 55%), 0 4px 18px rgb(0 0 0 / 45%)`,
              }}
            >
              {caseItem.metric}
            </span>
            <span className="font-mono text-caption text-muted uppercase tracking-[0.18em]">
              {caseItem.metricLabel}
            </span>
          </ScrollReveal>

          {/* Editorial column */}
          <ScrollReveal delay={0.08} className="flex flex-col gap-8 lg:col-span-7">
            <h3
              className="font-display text-ink leading-[0.95] tracking-tight"
              style={{
                fontSize: 'clamp(2.5rem, 6.5vw + 0.5rem, 7rem)',
                letterSpacing: '-0.04em',
              }}
            >
              {caseItem.client}
            </h3>
            <p
              className="font-serif text-ink/90 italic leading-[1.16]"
              style={{ fontSize: 'clamp(1.5rem, 2.6vw + 0.5rem, 3rem)' }}
            >
              {caseItem.outcome}
            </p>
            <InlineLabels labels={caseItem.tags} />

            <span className="mt-auto inline-flex items-center gap-2 pt-6 font-mono text-caption text-muted uppercase tracking-[0.18em]">
              Engagement {String(index + 1).padStart(2, '0')} of{' '}
              {String(CASES.length).padStart(2, '0')}
            </span>
          </ScrollReveal>
        </div>
      </Container>
    </li>
  );
}

/* ─── Convictions — three full-viewport italic beats ─────────────────── */

const CONVICTIONS = [
  {
    n: '01',
    headline: 'The eval is the spec.',
    body: 'A model without a measure is a guess. Before we write a feature we write the harness that says when it is done.',
  },
  {
    n: '02',
    headline: 'Streaming is the medium.',
    body: 'Latency is felt, not measured. We design every interface around the first token — not the last.',
  },
  {
    n: '03',
    headline: 'Drift is a deploy event.',
    body: 'Models change. Data changes. We run yesterday against today on a schedule, with a threshold someone owns.',
  },
];

function Convictions() {
  return (
    <section
      id="convictions"
      aria-labelledby="convictions-heading"
      className="relative border-border border-t bg-surface/15"
    >
      <h2 id="convictions-heading" className="sr-only">
        Three convictions
      </h2>
      <ol>
        {CONVICTIONS.map((b, i) => (
          <ConvictionBeat key={b.n} conviction={b} last={i === CONVICTIONS.length - 1} />
        ))}
      </ol>
    </section>
  );
}

function ConvictionBeat({
  conviction,
  last,
}: {
  conviction: (typeof CONVICTIONS)[number];
  last: boolean;
}) {
  return (
    <li
      className={`relative flex min-h-[80dvh] items-center overflow-hidden border-border/40 border-t py-20 ${last ? 'border-b' : ''}`}
    >
      <Container width="xl" className="relative">
        <ScrollReveal>
          <div className="flex flex-col gap-10">
            <span className="font-mono text-label text-muted uppercase tracking-[0.2em]">
              Conviction · {conviction.n}
            </span>
            <p
              className="max-w-6xl font-serif text-ink italic leading-[0.96] tracking-tight"
              style={{
                fontSize: 'clamp(2.75rem, 8vw + 0.5rem, 9rem)',
                letterSpacing: '-0.035em',
              }}
            >
              {conviction.headline}
            </p>
            <p className="max-w-2xl text-body-lg text-ink/80">{conviction.body}</p>
          </div>
        </ScrollReveal>
      </Container>
    </li>
  );
}

/* ─── Closing CTA — type-driven, no orb, mesh-gradient field ─────────── */

function ClosingCTA() {
  return (
    <section
      id="cta"
      aria-labelledby="cta-heading"
      className="relative isolate min-h-[100dvh] overflow-hidden border-border border-t"
    >
      {/* Full-bleed acid-and-violet mesh field — pure CSS, no canvas */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background: `
            radial-gradient(ellipse 60% 45% at 25% 30%, oklch(78% 0.20 130 / 22%) 0%, transparent 60%),
            radial-gradient(ellipse 50% 50% at 80% 70%, oklch(55% 0.20 290 / 18%) 0%, transparent 60%),
            radial-gradient(ellipse 35% 30% at 60% 30%, oklch(72% 0.18 235 / 12%) 0%, transparent 65%),
            radial-gradient(circle at 50% 50%, oklch(10% 0.014 270) 0%, oklch(5% 0.012 270) 100%)
          `,
        }}
      />

      <Container
        width="xl"
        className="relative z-10 flex min-h-[100dvh] flex-col justify-center py-32"
      >
        <Stack gap="xl" className="max-w-6xl">
          <ScrollReveal>
            <Eyebrow>Start a project · One reply within 48 hours</Eyebrow>
          </ScrollReveal>

          <ScrollReveal delay={0.05}>
            <KineticHeading as="h2" className="font-display text-ink leading-[0.88] tracking-tight">
              Have a system worth refracting?
            </KineticHeading>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <p className="max-w-2xl text-body-lg text-ink/90">
              Tell us about the shape of the problem. We will reply with a small number of sharp
              questions, then a price, then a plan. No decks.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.22}>
            <Stack direction="row" gap="md" wrap>
              <MagneticLink href="/contact" variant="primary" size="lg">
                Open a brief
                <ArrowRight className="size-5" />
              </MagneticLink>
              <MagneticLink href="mailto:company@thrivaxis.com" external variant="outline" size="lg">
                company@thrivaxis.com
                <ArrowUpRight className="size-5" />
              </MagneticLink>
            </Stack>
          </ScrollReveal>

          {/* Closing punctuation — a small live stat in mono caps */}
          <ScrollReveal delay={0.3}>
            <div className="mt-16 flex flex-wrap items-center gap-x-6 gap-y-2 border-border/40 border-t pt-6 font-mono text-caption text-muted uppercase tracking-[0.18em]">
              <span>Open</span>
              <span className="text-muted/40" aria-hidden="true">
                ·
              </span>
              <span>Three teams at a time</span>
              <span className="text-muted/40" aria-hidden="true">
                ·
              </span>
              <span>United States · MMXXVI</span>
              <span className="ml-auto inline-flex items-center gap-2">
                Reply · <span className="text-accent">≤ 48 hours</span>
              </span>
            </div>
          </ScrollReveal>
        </Stack>
      </Container>
    </section>
  );
}
