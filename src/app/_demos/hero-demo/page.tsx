import {
  ArrowDown,
  ArrowUpRight,
  Compass,
  Cpu,
  Flash,
  Leaf,
  ShieldCheck,
  Sparks,
  Wifi,
} from 'iconoir-react';
import Link from 'next/link';
import {
  BentoTile,
  BrowserFrame,
  Container,
  Eyebrow,
  Glow,
  KineticHeading,
  LiveMetric,
  LogStream,
  MagneticButton,
  Quote,
  ScrollReveal,
  Stack,
  Tag,
  TerminalFrame,
  WorkPreviewCard,
} from '@/components/primitives';
import { SkyOceanCanvas } from '@/components/scenes/sky-ocean-canvas';

export const metadata = { title: 'Hero — sky-ocean WebGPU' };

// Trend data for case-study sparklines
const sparkActivation = [22, 28, 31, 35, 38, 41, 47, 52, 55, 60, 64, 68, 73, 78, 84] as const;
const sparkLatency = [3.4, 3.2, 3.1, 2.9, 2.7, 2.4, 2.1, 1.9, 1.7, 1.6, 1.5] as const;
const sparkAdoption = [12, 14, 19, 24, 30, 37, 44, 52, 61, 70, 82, 95] as const;

// ────────────────────────────────────────────────────────────────────────────
// Section 1 — Hero (afternoon → golden hour)
// ────────────────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="relative flex min-h-[100dvh] flex-col">
      <Container className="flex flex-1 flex-col justify-between py-10">
        <Stack direction="row" justify="between" align="center" className="flex-wrap gap-4">
          <Eyebrow>Code-native · Procedural · Real-time</Eyebrow>
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-caption text-muted uppercase hover:text-ink"
          >
            ← Back to home
          </Link>
        </Stack>

        <Stack gap="lg" className="max-w-3xl pb-12">
          <h1 className="font-display text-display-xl leading-[0.92] tracking-tight sm:text-display-2xl">
            Move the sun.
            <br />
            <span className="font-serif text-accent italic">Watch the world</span> respond.
          </h1>
          <p className="max-w-prose text-body-lg text-ink/85">
            A single WebGPU pass — no textures, no models, no video. The cursor steers the sun; the
            moon rises antipodally. Scroll, and the world cycles through a day.
          </p>
          <Stack direction="row" gap="md" wrap>
            <MagneticButton variant="primary" size="lg">
              Start a project <ArrowUpRight className="ml-2 size-5" />
            </MagneticButton>
            <MagneticButton variant="outline" size="lg">
              How we built this
            </MagneticButton>
          </Stack>
        </Stack>

        <Stack direction="row" justify="between" align="center" className="pb-2">
          <p className="font-mono text-caption text-ink/60">
            <span className="text-accent">·</span> Cursor moves the sun · scroll advances time
          </p>
          <ScrollCue />
        </Stack>
      </Container>
    </section>
  );
}

function ScrollCue() {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-caption text-ink/60 uppercase">
      Scroll
      <ArrowDown className="size-4 animate-[bounce_1.6s_ease-in-out_infinite]" />
    </span>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Section 2 — Capabilities (late afternoon)
// ────────────────────────────────────────────────────────────────────────────

function CapabilitiesSection() {
  return (
    <section className="relative flex min-h-[100dvh] items-center py-24">
      <Container>
        <Stack gap="xl">
          <Stack gap="md">
            <Eyebrow>Section 02 · What we build</Eyebrow>
            <KineticHeading
              as="h2"
              className="max-w-3xl font-display text-display-lg tracking-tight sm:text-display-xl"
            >
              Systems that earn their compute.
            </KineticHeading>
            <p className="max-w-2xl text-body-lg text-ink/80">
              Agentic execution, retrieval pipelines, evals, and the UX layer where any of it
              actually lands. End-to-end, in production, on your real users.
            </p>
          </Stack>

          <div className="grid grid-flow-dense auto-rows-[180px] grid-cols-3 gap-4 sm:grid-cols-4">
            <BentoTile span="lg">
              <div className="flex flex-1 flex-col justify-between p-6">
                <Tag tone="accent" withDot>
                  agents
                </Tag>
                <Stack gap="xs">
                  <Sparks className="size-7 text-accent" />
                  <p className="font-display text-h2 tracking-tight">Agentic execution</p>
                  <p className="text-body-sm text-muted">
                    Plan · tools · observe · respond — wired end to end with eval-grade determinism.
                  </p>
                </Stack>
              </div>
            </BentoTile>

            <BentoTile span="md">
              <div className="flex flex-1 flex-col justify-between p-6">
                <Tag tone="cool" withDot>
                  retrieval
                </Tag>
                <Stack gap="xs">
                  <Cpu className="size-7 text-cool" />
                  <p className="font-display text-h3 tracking-tight">RAG pipelines</p>
                </Stack>
              </div>
            </BentoTile>

            <BentoTile span="sm">
              <div className="flex flex-1 flex-col justify-between p-5">
                <Flash className="size-6 text-warm" />
                <p className="font-display text-body tracking-tight">Real-time UX</p>
              </div>
            </BentoTile>

            <BentoTile span="sm">
              <div className="flex flex-1 flex-col justify-between p-5">
                <ShieldCheck className="size-6 text-accent" />
                <p className="font-display text-body tracking-tight">Compliance</p>
              </div>
            </BentoTile>

            <BentoTile span="md">
              <div className="flex flex-1 flex-col justify-between p-6">
                <Tag tone="warm" withDot>
                  measure
                </Tag>
                <Stack gap="xs">
                  <Compass className="size-7 text-warm" />
                  <p className="font-display text-h3 tracking-tight">Evals & telemetry</p>
                </Stack>
              </div>
            </BentoTile>

            <BentoTile span="sm">
              <div className="flex flex-1 flex-col justify-between p-5">
                <Wifi className="size-6 text-accent" />
                <p className="font-display text-body tracking-tight">GenUI</p>
              </div>
            </BentoTile>

            <BentoTile span="sm">
              <div className="flex flex-1 flex-col justify-between p-5">
                <Leaf className="size-6 text-cool" />
                <p className="font-display text-body tracking-tight">Carbon-aware</p>
              </div>
            </BentoTile>
          </div>
        </Stack>
      </Container>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Section 3 — Selected work (dusk)
// ────────────────────────────────────────────────────────────────────────────

function WorkSection() {
  return (
    <section className="relative flex min-h-[100dvh] items-center py-24">
      <Container>
        <Stack gap="xl">
          <Stack gap="md">
            <Eyebrow>Section 03 · Selected work</Eyebrow>
            <KineticHeading
              as="h2"
              className="max-w-3xl font-display text-display-lg tracking-tight sm:text-display-xl"
            >
              Outcomes, not demos.
            </KineticHeading>
            <p className="max-w-2xl text-body-lg text-ink/80">
              Twelve months of shipped work — every metric is post-launch, measured against the
              agreed acceptance criteria. No rehearsed pitches.
            </p>
          </Stack>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <ScrollReveal>
              <WorkPreviewCard
                href="#"
                industry="Fintech onboarding"
                title="Cut activation time by 47% with a guidance agent."
                outcome="Replaced a 14-step wizard with an agentic concierge that adapts to the applicant's prior answers."
                metric={{
                  label: 'Activation',
                  value: '+47%',
                  trend: sparkActivation,
                  tone: 'accent',
                }}
                preview={
                  <BrowserFrame url="bank.thrivaxis.dev/onboard">
                    <div className="flex flex-col gap-3 p-5">
                      <Tag tone="accent" withDot size="sm">
                        live agent
                      </Tag>
                      <p className="font-display text-h3 tracking-tight">
                        Just a few quick checks.
                      </p>
                      <LiveMetric label="Step" value={4} unit=" / 5" />
                    </div>
                  </BrowserFrame>
                }
              />
            </ScrollReveal>

            <ScrollReveal delay={0.08}>
              <WorkPreviewCard
                href="#"
                industry="Enterprise search"
                title="Knowledge concierge with 96% eval-pass rate."
                outcome="Hybrid retrieval + structured grounding for 1.4M internal docs across 11 languages."
                metric={{ label: 'Eval pass', value: '96%', trend: sparkAdoption, tone: 'cool' }}
                preview={
                  <BrowserFrame url="search.thrivaxis.dev">
                    <div className="flex flex-col gap-3 p-5">
                      <Tag tone="cool" withDot size="sm">
                        retrieval
                      </Tag>
                      <p className="font-display text-h3 tracking-tight">
                        Structured answers with sources.
                      </p>
                      <LiveMetric label="Eval" value={96} unit="%" trendTone="cool" />
                    </div>
                  </BrowserFrame>
                }
              />
            </ScrollReveal>

            <ScrollReveal delay={0.16}>
              <WorkPreviewCard
                href="#"
                industry="Health systems"
                title="-15s mean latency on care-navigator triage."
                outcome="Streaming reasoning + cached retrieval pinned p95 below the SLA."
                metric={{
                  label: 'Mean latency',
                  value: '1.5 s',
                  trend: sparkLatency,
                  tone: 'warm',
                }}
                preview={
                  <TerminalFrame title="navigator.run">
                    <div className="p-4">
                      <LogStream rows={4} intervalMs={2400} />
                    </div>
                  </TerminalFrame>
                }
              />
            </ScrollReveal>
          </div>
        </Stack>
      </Container>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Section 4 — How we build (deep night)
// ────────────────────────────────────────────────────────────────────────────

const processSteps = [
  {
    n: '01',
    title: 'Brief',
    body: 'Two-day discovery: the outcome, the constraints, the eval data we need to see by week two.',
  },
  {
    n: '02',
    title: 'Plan',
    body: 'A scoped, price-fixed plan with rollout gates and a measurable definition of done.',
  },
  {
    n: '03',
    title: 'Ship',
    body: 'Two-week iteration cadence. Eval suite runs every push. Production from day five.',
  },
  {
    n: '04',
    title: 'Result',
    body: 'Post-launch instrumentation lives with you. Quarterly reviews tied to the original acceptance criteria.',
  },
] as const;

function ProcessSection() {
  return (
    <section className="relative flex min-h-[100dvh] items-center py-24">
      <Container>
        <Stack gap="xl">
          <Stack gap="md">
            <Eyebrow>Section 04 · How we build</Eyebrow>
            <KineticHeading
              as="h2"
              className="max-w-3xl font-display text-display-lg tracking-tight sm:text-display-xl"
            >
              Brief → Plan → Ship → Result.
            </KineticHeading>
            <p className="max-w-2xl text-body-lg text-ink/80">
              No "phase one" theatre. Every project starts with the eval that tells us when we're
              done, and every release is gated on it.
            </p>
          </Stack>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {processSteps.map((step, i) => (
              <ScrollReveal key={step.n} delay={i * 0.06}>
                <article className="relative h-full overflow-hidden rounded-lg bg-surface/90 p-6 ring-1 ring-border ring-inset">
                  <Glow size="sm" tone="accent" position="top" />
                  <Stack gap="md">
                    <span className="font-mono text-accent text-caption">{step.n}</span>
                    <p className="font-display text-h2 tracking-tight">{step.title}</p>
                    <p className="text-body-sm text-muted">{step.body}</p>
                  </Stack>
                </article>
              </ScrollReveal>
            ))}
          </div>

          <div className="max-w-3xl pt-8">
            <Quote
              size="lg"
              attribution="Founding partner · Thrivaxis"
              className="rounded-3xl bg-surface/85 p-8 ring-1 ring-border ring-inset"
            >
              We build software the way premium products are made — patient, in code, every pixel
              earned.
            </Quote>
          </div>
        </Stack>
      </Container>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Section 5 — Contact (pre-dawn → sunrise)
// ────────────────────────────────────────────────────────────────────────────

function ContactSection() {
  return (
    <section className="relative flex min-h-[100dvh] items-center py-24">
      <Container width="md">
        <Stack gap="xl">
          <Stack gap="md">
            <Eyebrow>Section 05 · Build with us</Eyebrow>
            <KineticHeading
              as="h2"
              className="font-display text-display-lg tracking-tight sm:text-display-xl"
            >
              We take three projects per quarter.
            </KineticHeading>
            <p className="max-w-prose text-body-lg text-ink/80">
              Bring an outcome you'd like to claim. We'll send a tight scope back within 48 hours —
              or tell you why we're not the right team.
            </p>
          </Stack>

          <div className="rounded-3xl bg-surface/85 p-8 ring-1 ring-border ring-inset">
            <Stack gap="lg">
              <Stack direction="row" gap="md" wrap>
                <MagneticButton variant="primary" size="lg">
                  Start a project <ArrowUpRight className="ml-2 size-5" />
                </MagneticButton>
                <MagneticButton variant="outline" size="lg">
                  Or email company@thrivaxis.com
                </MagneticButton>
              </Stack>
              <p className="font-mono text-caption text-ink/60">
                <span className="text-accent">·</span> Q2 capacity opens May 19 · 2 of 3 slots still
                available
              </p>
            </Stack>
          </div>
        </Stack>
      </Container>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Page — fixed canvas behind 5 stacked sections; scroll drives the day/night
// cycle, cursor adds fine sun-altitude offset and azimuth.
// ────────────────────────────────────────────────────────────────────────────

export default async function HeroDemoPage() {
  return (
    <>
      {/* Fixed shader canvas at z-0; content wrapper sits above at z-10 so the
       stacking is explicit and doesn't depend on negative z-index quirks. */}
      <SkyOceanCanvas className="fixed inset-0 z-0" />

      <div className="relative z-10">
        <HeroSection />
        <CapabilitiesSection />
        <WorkSection />
        <ProcessSection />
        <ContactSection />
      </div>
    </>
  );
}
