import { ArrowDown, ArrowUpRight, Check, Mail, Scissor } from 'iconoir-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { MenagerieCard } from '@/components/origami/menagerie-card';
import { ProcessSequence } from '@/components/origami/process-sequence';
import { Wordmark, WordmarkGlyph } from '@/components/origami/wordmark';
import {
  Container,
  DashedGrid,
  Divider,
  Eyebrow,
  MagneticButton,
  ScrollReveal,
  Stack,
} from '@/components/primitives';
import { OrigamiCanvas } from '@/components/scenes/origami-canvas';
import { capabilities } from '@/lib/origami/animals';

export const metadata: Metadata = {
  title: 'Origami — Thrivaxis homepage demo',
  description:
    'AI development studio. Strategy, design, and engineering for teams that need their AI to ship — not just demo.',
  alternates: { canonical: '/homepage-demo-origami' },
};

// ════════════════════════════════════════════════════════════════════════════
// 1 — Top nav (sticky, paper-thin border)
// ════════════════════════════════════════════════════════════════════════════

function NavBar() {
  return (
    <header className="sticky top-0 z-40 border-border/40 border-b bg-bg/70 backdrop-blur-md">
      <Container width="xl" className="flex h-16 items-center justify-between gap-6">
        <Link href="/" aria-label="Thrivaxis home" className="shrink-0">
          <Wordmark />
        </Link>
        <nav className="hidden items-center gap-7 font-mono text-caption text-muted uppercase md:flex">
          <Link href="#menagerie" className="transition-colors hover:text-ink">
            What we do
          </Link>
          <Link href="#process" className="transition-colors hover:text-ink">
            How we work
          </Link>
          <Link href="#work" className="transition-colors hover:text-ink">
            Selected work
          </Link>
          <Link href="#beliefs" className="transition-colors hover:text-ink">
            Beliefs
          </Link>
        </nav>
        <Link
          href="#contact"
          className="inline-flex h-10 items-center gap-2 rounded-md bg-accent px-4 font-medium text-bg text-body-sm transition-[background,box-shadow] duration-300 hover:bg-accent-strong hover:shadow-[0_0_40px_-8px_var(--color-accent-glow)]"
        >
          Start a project
          <ArrowUpRight className="size-4" />
        </Link>
      </Container>
    </header>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 2 — Hero
//   Placeholder hero specimen on the right; Phase B swaps for R3F crane.
// ════════════════════════════════════════════════════════════════════════════

function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <DashedGrid />
      <Container
        width="xl"
        className="relative grid gap-16 pt-20 pb-24 lg:grid-cols-[1.15fr_1fr] lg:gap-20 lg:pt-24 lg:pb-32"
      >
        {/* Left — type column */}
        <div className="flex flex-col justify-center gap-8">
          <Eyebrow>AI development studio · United States</Eyebrow>

          <h1 className="font-display text-display-2xl text-ink leading-[0.92] tracking-[-0.04em]">
            We turn ideas
            <br />
            into AI that
            <br />
            <span className="font-serif text-accent italic">ships.</span>
          </h1>

          <p className="max-w-xl text-body-lg text-muted leading-relaxed">
            Strategy, design, and engineering for teams that need their AI to work in production —
            not just demo on a Friday. Senior end-to-end teams. Crisp deliverables. No interns
            learning on your dollar.
          </p>

          <Stack direction="row" gap="md" wrap>
            <MagneticButton variant="primary" size="lg">
              Start a project
              <ArrowUpRight className="ml-2 size-5" />
            </MagneticButton>
            <MagneticButton variant="outline" size="lg">
              See selected work
            </MagneticButton>
          </Stack>

          <div className="mt-2 grid grid-cols-2 gap-x-8 gap-y-3 border-border/60 border-t pt-6 font-mono text-caption text-muted uppercase sm:grid-cols-4">
            <span className="inline-flex items-center gap-2">
              <Check className="size-3.5 text-accent" /> Senior teams
            </span>
            <span className="inline-flex items-center gap-2">
              <Check className="size-3.5 text-accent" /> End-to-end
            </span>
            <span className="inline-flex items-center gap-2">
              <Check className="size-3.5 text-accent" /> Eval-first
            </span>
            <span className="inline-flex items-center gap-2">
              <Check className="size-3.5 text-accent" /> US-based
            </span>
          </div>
        </div>

        {/* Right — hero specimen (Phase B swaps for R3F crane scene) */}
        <HeroSpecimen />
      </Container>

      {/* Bottom scroll indicator */}
      <Container width="xl" className="relative pb-8">
        <Divider
          label={
            <span className="inline-flex items-center gap-2">
              <ArrowDown className="size-3 animate-[bounce_1.6s_ease-in-out_infinite]" />
              Scroll · The four folds of our work
            </span>
          }
          align="left"
        />
      </Container>
    </section>
  );
}

function HeroSpecimen() {
  return (
    <div
      id="hero-specimen"
      className="relative aspect-square w-full self-center overflow-hidden rounded-xl border border-border bg-surface/40"
    >
      {/* Specimen plate gridding */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(var(--grid-line)_1px,transparent_1px),linear-gradient(90deg,var(--grid-line)_1px,transparent_1px)] [background-size:32px_32px]"
      />
      {/* Corner labels */}
      <div className="absolute top-3 right-3 left-3 flex items-start justify-between font-mono text-label text-muted uppercase tracking-[0.08em]">
        <span>Specimen 01 · Crane</span>
        <span>Bird base · 100mm</span>
      </div>
      <div className="absolute right-3 bottom-3 left-3 flex items-end justify-between font-mono text-label text-muted uppercase tracking-[0.08em]">
        <span>22 folds</span>
        <span>Discover · Design · Build · Operate</span>
      </div>
      {/* R3F crane scene — folds itself in on mount, idles with subtle sway */}
      <div className="absolute inset-0">
        <OrigamiCanvas />
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 3 — Manifesto strip
// ════════════════════════════════════════════════════════════════════════════

function ManifestoStrip() {
  return (
    <section className="relative border-border/40 border-y bg-surface/30 py-16 sm:py-20">
      <Container width="xl">
        <ScrollReveal>
          <p className="font-display text-display-lg text-ink leading-[1] tracking-[-0.035em]">
            Crisp folds. <span className="text-muted">Sharp models.</span>{' '}
            <span className="font-serif text-accent italic">Built to ship.</span>
          </p>
        </ScrollReveal>
      </Container>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 4 — Menagerie (capabilities)
// ════════════════════════════════════════════════════════════════════════════

function Menagerie() {
  return (
    <section id="menagerie" className="relative py-24 sm:py-32">
      <Container width="xl">
        <Stack gap="xl">
          <Stack gap="md" className="max-w-3xl">
            <Eyebrow>What we do · The menagerie</Eyebrow>
            <h2 className="font-display text-display-xl text-ink leading-[0.95] tracking-[-0.04em]">
              Four shapes of work,
              <br />
              <span className="font-serif text-accent italic">folded the same way.</span>
            </h2>
            <p className="max-w-2xl text-body-lg text-muted leading-relaxed">
              We work in four discrete capabilities. You can hire us for one fold or all four — most
              clients start with Discover, then commit to the rest once the brief is in hand.
            </p>
          </Stack>

          <div className="grid gap-6 md:grid-cols-2">
            {capabilities.map((capability, index) => (
              <MenagerieCard key={capability.id} capability={capability} index={index} />
            ))}
          </div>
        </Stack>
      </Container>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 5 — Process (4-step fold sequence)
//   Phase D upgrades to a pinned scroll-scrubbed sequence.
// ════════════════════════════════════════════════════════════════════════════

const processSteps = [
  {
    label: 'Sheet',
    service: 'Discover',
    headline: 'We start at the flat sheet.',
    body: 'Every project begins with a two-week Discover sprint — interviews, workflow audit, opportunity map, and a written brief. You leave Week 2 with a decision-grade document.',
    duration: 'Wk 1–2',
  },
  {
    label: 'Crease',
    service: 'Design',
    headline: 'We mark the folds before we make them.',
    body: 'Architecture, model selection, eval strategy, and a clickable prototype. By the end of Design your stakeholders have touched the product before it exists.',
    duration: 'Wk 3–6',
  },
  {
    label: 'Form',
    service: 'Build',
    headline: 'We engineer the product end to end.',
    body: 'Senior engineers ship frontend, backend, infra, and observability. Evals run in CI from day one. We deploy to your environment with full handover.',
    duration: 'Wk 7–18',
  },
  {
    label: 'Animal',
    service: 'Operate',
    headline: 'We keep it sharp after launch.',
    body: 'Drift checks, eval regression detection, model upgrade pipeline, incident response, quarterly review. Your AI stays as sharp the day after launch as the day of.',
    duration: 'Ongoing',
  },
] as const;

function Process() {
  return (
    <section id="process" className="relative border-border/40 border-y bg-surface/30">
      {/* Intro band — sticky-relative, sits above the pinned sequence */}
      <Container width="xl" className="py-24 sm:py-32">
        <Stack gap="md" className="max-w-3xl">
          <Eyebrow>How we work · The four folds</Eyebrow>
          <h2 className="font-display text-display-xl text-ink leading-[0.95] tracking-[-0.04em]">
            From flat paper
            <br />
            to <span className="font-serif text-accent italic">flying bird.</span>
          </h2>
          <p className="max-w-2xl text-body-lg text-muted leading-relaxed">
            One linear path, four discrete folds. Each step ends with a deliverable you can hold.
            Scroll to watch the sheet become the crane.
          </p>
        </Stack>
      </Container>

      {/* Pinned scrub sequence */}
      <Container width="xl" className="pb-24 sm:pb-32">
        <ProcessSequence steps={processSteps} />
      </Container>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 6 — Selected work
// ════════════════════════════════════════════════════════════════════════════

const selectedWork = [
  {
    industry: 'Fintech · Series B',
    headline: 'Underwriting copilot that cut decision time 4×.',
    metric: '4×',
    metricLabel: 'faster decisions',
    body: 'Built a multi-agent underwriting assistant that ingests loan packets, runs eligibility checks, and writes the decision memo. Deployed to 80 underwriters in 14 weeks.',
    capability: 'Discover → Build',
  },
  {
    industry: 'Healthcare · Public co.',
    headline: 'Clinical note pipeline with eval-first guardrails.',
    metric: '99.4%',
    metricLabel: 'PHI redaction',
    body: 'Replaced a brittle template system with an eval-driven note generator. PHI redaction runs at 99.4% on the golden set; clinicians review and sign rather than write.',
    capability: 'Design → Operate',
  },
  {
    industry: 'B2B SaaS · Seed',
    headline: 'Onboarding agent that lifted activation 38%.',
    metric: '+38%',
    metricLabel: 'activation lift',
    body: 'Conversational onboarding agent replaced a 14-step wizard. Picks up where users get stuck, hands off to a human only when needed. Live in 9 weeks.',
    capability: 'Discover → Build → Operate',
  },
] as const;

function SelectedWork() {
  return (
    <section id="work" className="relative py-24 sm:py-32">
      <Container width="xl">
        <Stack gap="xl">
          <Stack gap="md" className="max-w-3xl">
            <Eyebrow>Selected work · Production, not demo</Eyebrow>
            <h2 className="font-display text-display-xl text-ink leading-[0.95] tracking-[-0.04em]">
              Three projects.
              <br />
              <span className="font-serif text-accent italic">All in production.</span>
            </h2>
          </Stack>

          <div className="grid gap-6 md:grid-cols-3">
            {selectedWork.map((piece, index) => (
              <ScrollReveal
                key={piece.headline}
                delay={index * 0.08}
                className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-surface/40 transition-[background,border-color,box-shadow] duration-500 hover:border-border-strong hover:shadow-[0_0_120px_-32px_var(--color-accent-glow)]"
              >
                {/* Specimen-plate header */}
                <div className="flex items-baseline justify-between border-border/60 border-b px-6 py-3.5 font-mono text-label text-muted uppercase tracking-[0.08em]">
                  <span>Specimen {String(index + 1).padStart(2, '0')}</span>
                  <span>{piece.industry}</span>
                </div>

                {/* Big metric */}
                <div className="flex flex-col gap-1 px-6 pt-7">
                  <span className="poster-metric font-display text-display-2xl text-ink leading-[0.9] tracking-[-0.04em]">
                    {piece.metric}
                  </span>
                  <span className="font-mono text-caption text-muted uppercase tracking-[0.06em]">
                    {piece.metricLabel}
                  </span>
                </div>

                {/* Body */}
                <div className="flex flex-1 flex-col gap-4 px-6 pt-6 pb-7">
                  <h3 className="font-display text-h1 text-ink leading-[1.1] tracking-[-0.02em]">
                    {piece.headline}
                  </h3>
                  <p className="text-body-sm text-muted leading-relaxed">{piece.body}</p>
                </div>

                {/* Capability tag */}
                <div className="flex items-center justify-between border-border/60 border-t px-6 py-3.5">
                  <span className="font-mono text-accent text-caption uppercase tracking-[0.04em]">
                    {piece.capability}
                  </span>
                  <ArrowUpRight className="size-4 text-muted transition-[color,transform] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent" />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </Stack>
      </Container>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 7 — Beliefs
// ════════════════════════════════════════════════════════════════════════════

const beliefs = [
  {
    headline: 'Demos are easy. Production is the work.',
    body: "Anyone can wire an LLM into a chat box. Making it reliable, fast, and cheap enough to bet a business on — that's the part that takes the senior engineers, the eval harnesses, and the four-week debugging spirals nobody talks about.",
    pull: '01',
  },
  {
    headline: 'Strategy first. Code second.',
    body: "We pick the right thing to build before we build it. Half the AI projects we've audited didn't need an LLM at all — they needed a clearer workflow. We'll tell you that, even if it costs us the engagement.",
    pull: '02',
  },
  {
    headline: 'Fewer hands. Better outcome.',
    body: 'Small senior teams, end to end. No handoff seams between strategy and design and engineering. No juniors learning on your dollar. The same three or four people who scoped your project are still on it the day it ships.',
    pull: '03',
  },
] as const;

function Beliefs() {
  return (
    <section
      id="beliefs"
      className="relative border-border/40 border-y bg-surface/30 py-24 sm:py-32"
    >
      <Container width="xl">
        <Stack gap="xl">
          <Stack gap="md" className="max-w-3xl">
            <Eyebrow>What we believe · Three convictions</Eyebrow>
            <h2 className="font-display text-display-xl text-ink leading-[0.95] tracking-[-0.04em]">
              The way we think
              <br />
              about <span className="font-serif text-accent italic">your project.</span>
            </h2>
          </Stack>

          <div className="flex flex-col gap-px">
            {beliefs.map((belief, index) => (
              <ScrollReveal
                key={belief.pull}
                delay={index * 0.06}
                className="grid gap-8 border-border/60 border-t py-12 first:border-t-0 md:grid-cols-[auto_1fr_auto] md:gap-16 md:py-16"
              >
                <span className="font-mono text-accent text-label uppercase tracking-[0.08em]">
                  Belief {belief.pull}
                </span>
                <div className="flex flex-col gap-5">
                  <h3 className="font-display text-display-md text-ink leading-[1.05] tracking-[-0.03em]">
                    {belief.headline}
                  </h3>
                  <p className="max-w-2xl font-serif text-body-lg text-muted italic leading-relaxed">
                    {belief.body}
                  </p>
                </div>
                <Scissor
                  aria-hidden="true"
                  className="hidden size-6 self-start text-accent md:block"
                />
              </ScrollReveal>
            ))}
          </div>
        </Stack>
      </Container>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 8 — Contact
// ════════════════════════════════════════════════════════════════════════════

function Contact() {
  return (
    <section id="contact" className="relative py-32 sm:py-40">
      <Container width="lg">
        <ScrollReveal>
          <div className="relative overflow-hidden rounded-xl border border-border bg-surface/40 p-10 sm:p-16">
            {/* Folded-corner accent */}
            <div
              aria-hidden="true"
              className="absolute top-0 right-0 size-24 bg-[linear-gradient(225deg,oklch(91%_0.21_130_/_18%)_0%,oklch(91%_0.21_130_/_0%)_60%)]"
            />
            <div
              aria-hidden="true"
              className="absolute top-6 right-6 h-px w-20 origin-left -rotate-45 bg-accent/40"
            />

            <Stack gap="xl">
              <Eyebrow>Start a project · One reply within 48 hours</Eyebrow>

              <h2 className="font-display text-display-xl text-ink leading-[0.95] tracking-[-0.04em]">
                Have a problem
                <br />
                <span className="font-serif text-accent italic">worth folding?</span>
              </h2>

              <p className="max-w-2xl text-body-lg text-muted leading-relaxed">
                Tell us the rough shape of the problem. If we're a fit, we'll come back with a
                two-week Discover proposal. If we're not, we'll point you to who is.
              </p>

              <Stack direction="row" gap="md" wrap align="center">
                <Link
                  href="mailto:company@thrivaxis.com"
                  className="inline-flex h-14 items-center gap-3 rounded-lg bg-accent px-7 font-medium text-bg text-body-lg transition-[background,box-shadow] duration-300 hover:bg-accent-strong hover:shadow-[0_0_60px_-10px_var(--color-accent-glow)]"
                >
                  <Mail className="size-5" />
                  company@thrivaxis.com
                </Link>
                <span className="font-mono text-caption text-muted uppercase tracking-[0.04em]">
                  or
                </span>
                <Link
                  href="/contact"
                  className="inline-flex h-14 items-center gap-2 rounded-lg bg-bg/30 px-7 font-medium text-body-lg text-ink ring-1 ring-border-strong ring-inset transition-colors hover:bg-bg/60 hover:ring-ink/40"
                >
                  Fill out the brief form
                  <ArrowUpRight className="size-5" />
                </Link>
              </Stack>
            </Stack>
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 9 — Footer
// ════════════════════════════════════════════════════════════════════════════

function Footer() {
  return (
    <footer className="relative border-border/40 border-t pt-16 pb-10">
      <Container width="xl">
        <Stack gap="xl">
          {/* Top row — wordmark + nav */}
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div className="flex flex-col gap-4">
              <Wordmark size={32} />
              <p className="max-w-xs text-body-sm text-muted leading-relaxed">
                AI development studio. Strategy, design, and engineering for teams that need their
                AI to work.
              </p>
            </div>

            <FooterColumn
              label="Capabilities"
              links={[
                { href: '#menagerie', label: 'Discover' },
                { href: '#menagerie', label: 'Design' },
                { href: '#menagerie', label: 'Build' },
                { href: '#menagerie', label: 'Operate' },
              ]}
            />
            <FooterColumn
              label="Studio"
              links={[
                { href: '#beliefs', label: 'Beliefs' },
                { href: '#work', label: 'Work' },
                { href: '#process', label: 'Process' },
                { href: '#contact', label: 'Contact' },
              ]}
            />
            <FooterColumn
              label="Legal"
              links={[
                { href: '/privacy', label: 'Privacy' },
                { href: '/terms', label: 'Terms' },
                { href: '/accessibility', label: 'Accessibility' },
                { href: '/contact', label: 'CCPA' },
              ]}
            />
          </div>

          {/* Acid-green crease divider */}
          <div className="relative h-px bg-border">
            <div className="absolute inset-y-0 left-0 w-1/3 bg-accent/30" />
          </div>

          {/* Bottom row — copyright + status */}
          <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-caption text-muted uppercase tracking-[0.06em]">
            <span className="inline-flex items-center gap-2">
              <WordmarkGlyph className="size-4" />© 2026 Thrivaxis Studio LLC · United States
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-accent" />
              Currently taking briefs for Q3
            </span>
          </div>
        </Stack>
      </Container>
    </footer>
  );
}

interface FooterColumnProps {
  label: string;
  links: ReadonlyArray<{ href: string; label: string }>;
}

function FooterColumn({ label, links }: FooterColumnProps) {
  return (
    <div className="flex flex-col gap-4">
      <span className="font-mono text-label text-muted uppercase tracking-[0.08em]">{label}</span>
      <ul className="flex flex-col gap-2.5">
        {links.map((link) => (
          <li key={`${label}-${link.label}`}>
            <Link
              href={link.href}
              className="text-body-sm text-ink/80 transition-colors hover:text-accent"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Page
// ════════════════════════════════════════════════════════════════════════════

export default function OrigamiHomepage() {
  return (
    <div className="relative isolate flex flex-col bg-bg">
      <NavBar />
      <Hero />
      <ManifestoStrip />
      <Menagerie />
      <Process />
      <SelectedWork />
      <Beliefs />
      <Contact />
      <Footer />
    </div>
  );
}
