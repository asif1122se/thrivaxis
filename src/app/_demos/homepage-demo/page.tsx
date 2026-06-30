import { ArrowDown, ArrowRight, ArrowUpRight, Check } from 'iconoir-react';
import Link from 'next/link';
import {
  Container,
  Eyebrow,
  LiveMetric,
  type LogLine,
  LogStream,
  MagneticButton,
  PinnedHorizontalScroll,
  ScrollReveal,
  Sparkline,
  Stack,
  Tag,
  TerminalFrame,
} from '@/components/primitives';
import { SkyOceanCanvas } from '@/components/scenes/sky-ocean-canvas';

export const metadata = { title: 'Homepage demo — Thrivaxis' };

// ────────────────────────────────────────────────────────────────────────────
// Trend data
// ────────────────────────────────────────────────────────────────────────────

const sparkEval = [82, 84, 86, 88, 90, 91, 93, 94, 94, 95, 95, 96, 96] as const;
const sparkCost = [4.1, 3.9, 3.6, 3.2, 2.8, 2.5, 2.2, 2.0, 1.9, 1.8, 1.7] as const;

const traceFeed: readonly LogLine[] = [
  { id: '1', level: 'info', message: 'agent.boot   session=tx_8f2a · model=claude-sonnet-4-6' },
  { id: '2', level: 'ok', message: 'tools.attach 17 capabilities resolved · cache hit' },
  { id: '3', level: 'info', message: 'plan.generate 6 steps · est 4.8s · tokens=3.4k' },
  { id: '4', level: 'info', message: 'rag.retrieve  5 docs · cosine 0.81 / 0.79 / 0.78' },
  { id: '5', level: 'ok', message: 'eval.harness  hallucination_check  ✓  passed (0.96)' },
  { id: '6', level: 'ok', message: 'step.1        fetch_pricing       240ms · cached' },
  { id: '7', level: 'ok', message: 'step.2        calc_eligibility     18ms' },
  { id: '8', level: 'warn', message: 'budget.tokens 92% used · throttling outbound' },
  { id: '9', level: 'ok', message: 'eval.drift    cosine 0.94 vs golden · within band' },
  { id: '10', level: 'ok', message: 'response.stream  642 tokens · 3.2s · TFB 178ms' },
  { id: '11', level: 'info', message: 'trace.export   otel/v1 · 412 spans · sink=ledger' },
];

// ────────────────────────────────────────────────────────────────────────────
// Beat 1 — Hero (naked type on the canvas, no scrim)
// ────────────────────────────────────────────────────────────────────────────

function HeroBeat() {
  return (
    <section className="relative flex min-h-[100dvh] flex-col">
      <Container className="flex flex-1 flex-col justify-between py-10">
        <Stack direction="row" justify="between" align="center" className="flex-wrap gap-4">
          <Eyebrow>Software studio · United States</Eyebrow>
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-caption text-ink/90 text-on-canvas uppercase hover:text-ink"
          >
            ← Home
          </Link>
        </Stack>

        <Stack gap="lg" className="max-w-3xl pb-10">
          <h1 className="font-display text-display-2xl text-on-canvas leading-[0.92] tracking-tight">
            Philosophy. Tech. AI.
            <br />
            <span className="font-serif text-accent italic">
              The three things we ship together.
            </span>
          </h1>
          <p className="max-w-prose text-body-lg text-ink text-on-canvas">
            We're a small American studio that builds AI products. Real ones, that work after the
            launch demo. We come in with a point of view, we leave instrumentation behind, and we
            sweat the parts your customers will actually feel.
          </p>
          <Stack direction="row" gap="md" wrap>
            <MagneticButton variant="primary" size="lg">
              Open a brief <ArrowUpRight className="ml-2 size-5" />
            </MagneticButton>
            <MagneticButton variant="outline" size="lg">
              See selected work
            </MagneticButton>
          </Stack>
        </Stack>

        <Stack direction="row" justify="between" align="center" className="pb-2">
          <p className="font-mono text-caption text-ink/90 text-on-canvas uppercase">
            Cursor · sun &nbsp;·&nbsp; Scroll · time
          </p>
          <span className="inline-flex items-center gap-2 font-mono text-caption text-ink/90 text-on-canvas uppercase">
            Scroll
            <ArrowDown className="size-4 animate-[bounce_1.6s_ease-in-out_infinite]" />
          </span>
        </Stack>
      </Container>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Beat 2 — Identity (off-axis editorial sentence, naked on canvas)
// ────────────────────────────────────────────────────────────────────────────

function IdentityBeat() {
  return (
    <section className="relative flex min-h-[100dvh] items-center py-16 sm:py-20 md:py-24">
      <Container width="xl">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-1 md:pt-3">
            <Eyebrow>02</Eyebrow>
          </div>
          <div className="md:col-span-10 md:col-start-2">
            <ScrollReveal>
              <p className="font-display text-display-2xl text-on-canvas leading-[0.96] tracking-tight">
                AI gets the attention.
                <br />
                <span className="font-serif text-accent italic">We do the work behind it.</span>
              </p>
            </ScrollReveal>
            <div className="mt-12 grid grid-cols-1 gap-x-12 gap-y-6 border-ink/20 border-t pt-8 font-mono text-caption text-ink text-on-canvas uppercase md:grid-cols-3">
              <span className="inline-flex items-center gap-2">
                <Check className="size-3.5 text-accent" /> Three engineers · United States
              </span>
              <span className="inline-flex items-center gap-2">
                <Check className="size-3.5 text-accent" /> Three years shipping AI in production
              </span>
              <span className="inline-flex items-center gap-2">
                <Check className="size-3.5 text-accent" /> Three teams at a time
              </span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Beat 3 — Three things we believe (cutting-edge manifesto posters)
// Each panel has its own layout signature: vertical film-strip, horizontal
// token river, full-bleed sparkline. Headlines are oversized and bleed off
// the safe zone. Editorial micro-marks (edge rail, manifesto stamp) tie the
// section together.
// ────────────────────────────────────────────────────────────────────────────

type ToneSlot = 'accent' | 'cool' | 'warm';

const HEADLINE_SIZE = 'clamp(3.25rem, 12vw, 14rem)';

// ── Editorial chrome — shared across all three panels ─────────────────────

function PanelHeader({
  index,
  category,
  categoryTone,
}: {
  index: string;
  category: string;
  categoryTone: ToneSlot;
}) {
  return (
    <div className="relative flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 sm:gap-4">
        <Eyebrow>03 · Three things we believe</Eyebrow>
        <span aria-hidden="true" className="hidden h-px w-12 bg-ink/25 sm:block" />
        <span className="font-mono text-accent text-caption">
          {index} <span className="text-ink/45">/</span> 03
        </span>
      </div>
      <Tag tone={categoryTone} withDot size="sm">
        {category}
      </Tag>
    </div>
  );
}

function EdgeRail({
  index,
  category,
  figure,
}: {
  index: string;
  category: string;
  figure: string;
}) {
  return (
    <div className="relative flex items-center justify-between border-ink/15 border-t pt-2.5 font-mono text-caption text-ink/55 uppercase tracking-[0.18em]">
      <span className="hidden sm:inline">
        {index} · {category} · Manifesto · 2026/05
      </span>
      <span className="sm:hidden">
        {index} · {category}
      </span>
      <span className="text-ink/45">[fig. {figure}]</span>
    </div>
  );
}

function ManifestoStamp({ index, position }: { index: string; position: 'br' | 'bl' | 'tr' }) {
  const text = `MANIFESTO · ${index} · `.repeat(4);
  const positionClass = {
    br: 'right-6 bottom-16',
    bl: 'left-6 bottom-16',
    tr: 'right-8 top-24',
  }[position];
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute hidden size-32 xl:block ${positionClass}`}
    >
      <svg
        viewBox="0 0 200 200"
        className="size-full"
        style={{ animation: 'var(--animate-stamp-spin)' }}
      >
        <title>Manifesto stamp {index}</title>
        <defs>
          <path
            id={`stamp-${index}`}
            d="M 100,100 m -78,0 a 78,78 0 1,1 156,0 a 78,78 0 1,1 -156,0"
          />
        </defs>
        <circle
          cx="100"
          cy="100"
          r="86"
          fill="none"
          stroke="oklch(99% 0.005 250 / 22%)"
          strokeWidth="0.8"
        />
        <circle
          cx="100"
          cy="100"
          r="68"
          fill="none"
          stroke="oklch(99% 0.005 250 / 14%)"
          strokeWidth="0.8"
        />
        <text fontSize="9.5" letterSpacing="2.5" className="fill-ink/55 font-mono uppercase">
          <textPath href={`#stamp-${index}`}>{text}</textPath>
        </text>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-display font-medium text-accent text-h2">{index}</span>
      </div>
    </div>
  );
}

// ── Panel 01 — Engineering / "The eval is the spec." ──────────────────────

const evalRows: ReadonlyArray<{
  glyph: string;
  tone: string;
  label: string;
  score: string;
}> = [
    { glyph: '✓', tone: 'text-accent', label: 'hallucination_check', score: '0.96' },
    { glyph: '✓', tone: 'text-accent', label: 'factuality_check', score: '0.94' },
    { glyph: '✓', tone: 'text-accent', label: 'tone_consistency', score: '0.91' },
    { glyph: '○', tone: 'text-cool', label: 'drift_baseline', score: '0.94' },
    { glyph: '✗', tone: 'text-rose', label: 'jailbreak_robustness', score: '0.78' },
  ];

function CheckWatermark() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute hidden select-none font-display font-medium text-accent/[0.07] leading-none lg:block"
      style={{
        fontSize: 'clamp(20rem, 38vw, 48rem)',
        right: '24vw',
        top: '8vh',
      }}
    >
      ✓
    </div>
  );
}

function FilmStripScorecard() {
  return (
    <aside className="pointer-events-none absolute top-0 right-0 hidden h-full w-[34vw] max-w-[420px] flex-col justify-center border-ink/20 border-l bg-bg/55 px-8 py-12 lg:flex">
      <div className="mb-8 flex items-center justify-between border-ink/15 border-b pb-4">
        <span className="font-mono text-caption text-muted uppercase tracking-widest">
          Eval harness · v3
        </span>
        <span className="font-mono text-accent text-caption">5 / 5 evaluated</span>
      </div>
      <ul className="flex flex-col font-mono text-caption">
        {evalRows.map((r) => (
          <li
            key={r.label}
            className="flex items-center justify-between gap-4 whitespace-nowrap border-ink/10 border-b py-4"
          >
            <span className="flex items-center gap-3">
              <span className={`w-3 text-center ${r.tone}`}>{r.glyph}</span>
              <span className="text-ink/85">{r.label}</span>
            </span>
            <span className="text-ink">{r.score}</span>
          </li>
        ))}
      </ul>
      <div className="mt-8 flex items-center justify-between border-ink/15 border-t pt-4 font-mono text-caption">
        <span className="text-muted uppercase tracking-widest">Last run</span>
        <span className="text-ink/75">2026-05-07 09:14:23</span>
      </div>
    </aside>
  );
}

function MobileEvalCard() {
  return (
    <div className="rounded-2xl bg-surface/95 p-6 ring-1 ring-border ring-inset lg:hidden">
      <div className="mb-4 flex items-center justify-between border-ink/15 border-b pb-3">
        <span className="font-mono text-caption text-muted uppercase">Eval harness · v3</span>
        <span className="font-mono text-accent text-caption">5 / 5</span>
      </div>
      <ul className="flex flex-col gap-2.5 font-mono text-caption">
        {evalRows.map((r) => (
          <li key={r.label} className="flex items-center justify-between gap-4 whitespace-nowrap">
            <span className="flex items-center gap-3">
              <span className={`w-3 text-center ${r.tone}`}>{r.glyph}</span>
              <span className="text-ink/85">{r.label}</span>
            </span>
            <span className="text-ink">{r.score}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EvalManifestoPanel() {
  return (
    <article className="relative flex h-[100dvh] w-screen shrink-0 flex-col overflow-hidden px-6 py-12 sm:px-10 sm:py-16 md:px-16 lg:px-20">
      {/* Background grid + radial */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage: `
            linear-gradient(to right, oklch(91% 0.21 130 / 8%) 1px, transparent 1px),
            linear-gradient(to bottom, oklch(91% 0.21 130 / 8%) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
        }}
      />
      <CheckWatermark />
      <FilmStripScorecard />
      <ManifestoStamp index="01" position="bl" />

      <PanelHeader index="01" category="Engineering" categoryTone="accent" />

      {/* Headline — bleeds toward the scorecard on the right */}
      <div className="relative flex flex-1 items-center">
        <h3
          className="font-display font-medium text-ink text-on-canvas leading-[0.88] tracking-[-0.02em] lg:max-w-[64vw]"
          style={{ fontSize: HEADLINE_SIZE }}
        >
          The eval
          <br />
          <span className="font-normal font-serif text-accent italic">is the spec.</span>
        </h3>
      </div>

      <div className="relative grid grid-cols-1 gap-8 lg:max-w-[64vw] lg:grid-cols-12">
        <div className="lg:col-span-12">
          <p className="max-w-md text-body text-ink/95 text-on-canvas">
            We don't write a line of production AI before the harness that tells us when we're done.
            Then we ship the harness back, with the build.
          </p>
        </div>
        <div className="lg:hidden">
          <MobileEvalCard />
        </div>
      </div>

      <div className="relative mt-8 lg:max-w-[64vw]">
        <EdgeRail index="01" category="Engineering" figure="01" />
      </div>
    </article>
  );
}

// ── Panel 02 — UX / "Streaming is the medium." ────────────────────────────

interface RiverToken {
  id: string;
  kind: 'word' | 'punct';
  text: string;
  accent?: boolean;
}

const tokenRiver: ReadonlyArray<RiverToken> = (
  [
    { kind: 'word', text: '14-day' },
    { kind: 'word', text: 'return' },
    { kind: 'word', text: 'window', accent: true },
    { kind: 'word', text: 'for' },
    { kind: 'word', text: 'any' },
    { kind: 'word', text: 'hardware', accent: true },
    { kind: 'word', text: 'shipped' },
    { kind: 'word', text: 'to' },
    { kind: 'word', text: 'EU', accent: true },
    { kind: 'punct', text: '·' },
    { kind: 'word', text: 'extended' },
    { kind: 'word', text: 'to' },
    { kind: 'word', text: '30', accent: true },
    { kind: 'word', text: 'days' },
    { kind: 'word', text: 'for' },
    { kind: 'word', text: 'Black', accent: true },
    { kind: 'word', text: 'Friday' },
    { kind: 'word', text: 'units' },
  ] as ReadonlyArray<Omit<RiverToken, 'id'>>
).map((t, i) => ({ ...t, id: `${t.kind}-${i}-${t.text}` }));

function ScanLine() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 hidden h-[2px] overflow-hidden lg:block"
      style={{ top: '52%' }}
    >
      <div
        className="absolute inset-y-0 w-[28%]"
        style={{
          animation: 'var(--animate-scanline)',
          background: 'linear-gradient(90deg, transparent, oklch(72% 0.18 235 / 75%), transparent)',
        }}
      />
    </div>
  );
}

function TokenRiver() {
  return (
    <div className="pointer-events-none absolute inset-x-0 hidden lg:block" style={{ top: '60%' }}>
      <div className="overflow-hidden border-ink/15 border-y py-5">
        <div className="flex items-center gap-2 px-12">
          {tokenRiver.map((t) =>
            t.kind === 'punct' ? (
              <span key={t.id} className="font-mono text-caption text-ink/30">
                {t.text}
              </span>
            ) : (
              <span
                key={t.id}
                className={`inline-flex h-9 items-center whitespace-nowrap rounded-md px-3.5 font-mono text-caption ${t.accent ? 'bg-cool/15 text-cool ring-1 ring-cool/35 ring-inset' : 'text-ink/85'
                  }`}
              >
                {t.text}
              </span>
            ),
          )}
          <span
            aria-hidden="true"
            className="ml-1 inline-block h-7 w-[3px] animate-pulse self-center bg-cool align-middle"
          />
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between px-12 font-mono text-caption text-muted uppercase tracking-widest">
        <span className="inline-flex items-center gap-1.5 text-cool">
          <span className="size-1.5 animate-pulse rounded-full bg-cool" />
          live · TFB 178ms
        </span>
        <span>
          <span className="text-ink/85">142</span> tokens / s
        </span>
      </div>
    </div>
  );
}

function MobileStreamingCard() {
  return (
    <div className="rounded-2xl bg-surface/95 p-6 ring-1 ring-border ring-inset lg:hidden">
      <div className="mb-4 flex items-center justify-between border-ink/15 border-b pb-3">
        <span className="font-mono text-caption text-muted uppercase">response · streaming</span>
        <span className="inline-flex items-center gap-1.5 font-mono text-caption text-cool">
          <span className="size-1.5 animate-pulse rounded-full bg-cool" />
          live · TFB 178ms
        </span>
      </div>
      <p className="mb-4 font-display text-body-lg text-ink/90 leading-snug">
        14-day return window for any hardware shipped to the EU. Extended to thirty for unit
        <span className="text-cool">s shipped during a Black</span>
        <span
          aria-hidden="true"
          className="ml-0.5 inline-block h-[1em] w-[2px] animate-pulse bg-cool align-middle"
        />
      </p>
      <div className="flex items-center justify-between font-mono text-caption text-muted">
        <span>tokens / s</span>
        <span className="text-ink/85">142</span>
      </div>
    </div>
  );
}

function StreamingManifestoPanel() {
  return (
    <article className="relative flex h-[100dvh] w-screen shrink-0 flex-col overflow-hidden px-6 py-12 sm:px-10 sm:py-16 md:px-16 lg:px-20">
      {/* Background stripes + cool haze */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: `repeating-linear-gradient(
            to bottom,
            transparent 0,
            transparent 56px,
            oklch(72% 0.18 235 / 7%) 56px,
            oklch(72% 0.18 235 / 7%) 60px
          )`,
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/4 right-0 h-[60vh] w-[55vw]"
        style={{
          background:
            'radial-gradient(ellipse at right, oklch(72% 0.18 235 / 16%) 0%, transparent 65%)',
        }}
      />

      <ScanLine />
      <TokenRiver />
      <ManifestoStamp index="02" position="br" />

      <PanelHeader index="02" category="UX" categoryTone="cool" />

      <div className="relative flex flex-1 items-center">
        <h3
          className="font-display font-medium text-ink text-on-canvas leading-[0.88] tracking-[-0.02em]"
          style={{ fontSize: HEADLINE_SIZE }}
        >
          Streaming
          <br />
          <span className="font-normal font-serif text-cool italic">is the medium.</span>
        </h3>
      </div>

      <div className="relative grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="max-w-md text-body text-ink/95 text-on-canvas">
            Tokens arrive before sentences. Optimistic states have to hold under partial
            information. The new render budget is per-character, not per-page.
          </p>
        </div>
        <div className="lg:hidden">
          <MobileStreamingCard />
        </div>
      </div>

      <div className="relative mt-8">
        <EdgeRail index="02" category="UX" figure="02" />
      </div>
    </article>
  );
}

// ── Panel 03 — Operations / "Drift is a deploy event." ────────────────────

const driftPoints: ReadonlyArray<number> = [
  0.94, 0.94, 0.95, 0.94, 0.93, 0.94, 0.95, 0.94, 0.93, 0.94, 0.95, 0.94, 0.92, 0.78, 0.72, 0.69,
  0.71, 0.74, 0.78, 0.82, 0.84, 0.85, 0.86, 0.87,
];

interface DriftGeometry {
  w: number;
  h: number;
  linePath: string;
  fillPath: string;
  baselineY: number;
  spike: { x: number; y: number; v: number };
}

function computeDriftGeometry(): DriftGeometry {
  const min = 0.62;
  const max = 1.0;
  const w = 1600;
  const h = 320;
  const pad = 8;
  const xStep = w / (driftPoints.length - 1);

  const points = driftPoints.map((v, i) => ({
    x: i * xStep,
    y: h - ((v - min) / (max - min)) * (h - pad * 2) - pad,
    v,
  }));
  const first = points[0];
  const last = points[points.length - 1];
  const fallbackPoint = { x: 0, y: h, v: 0 };
  const seedFirst = first ?? fallbackPoint;
  const seedLast = last ?? fallbackPoint;

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(' ');
  const fillPath = `${linePath} L${seedLast.x.toFixed(1)},${h} L${seedFirst.x.toFixed(1)},${h} Z`;
  const baselineY = h - ((0.94 - min) / (max - min)) * (h - pad * 2) - pad;

  let spike = seedFirst;
  for (const p of points) if (p.v < spike.v) spike = p;

  return { w, h, linePath, fillPath, baselineY, spike };
}

function FullBleedSparkline() {
  const { w, h, linePath, fillPath, baselineY, spike } = computeDriftGeometry();
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-[58%] lg:block">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        className="h-full w-full"
        aria-hidden="true"
      >
        <title>Drift event sparkline</title>
        <defs>
          <linearGradient id="drift-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(82% 0.16 75 / 28%)" />
            <stop offset="100%" stopColor="oklch(82% 0.16 75 / 0%)" />
          </linearGradient>
        </defs>
        <line
          x1="0"
          y1={baselineY}
          x2={w}
          y2={baselineY}
          stroke="oklch(99% 0.005 250 / 14%)"
          strokeWidth="1"
          strokeDasharray="4 6"
        />
        <path d={fillPath} fill="url(#drift-fill)" />
        <path
          d={linePath}
          fill="none"
          stroke="oklch(82% 0.16 75 / 80%)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx={spike.x}
          cy={spike.y}
          r="9"
          fill="none"
          stroke="oklch(70% 0.21 25 / 60%)"
          strokeWidth="2"
        >
          <animate attributeName="r" from="6" to="22" dur="1.6s" repeatCount="indefinite" />
          <animate attributeName="opacity" from="0.7" to="0" dur="1.6s" repeatCount="indefinite" />
        </circle>
        <circle cx={spike.x} cy={spike.y} r="6" fill="oklch(70% 0.21 25)" />
      </svg>
      {/* Drift event callout, anchored to the spike */}
      <div
        className="absolute"
        style={{
          left: `${(spike.x / w) * 100}%`,
          top: `${(spike.y / h) * 100}%`,
        }}
      >
        <div className="-translate-x-1/2 -translate-y-full pb-4">
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-bg/95 px-2.5 py-1.5 font-mono text-caption text-rose uppercase tracking-widest ring-1 ring-rose/35 ring-inset">
            <span className="size-1.5 animate-pulse rounded-full bg-rose" /> Drift event · 07:43 UTC
          </span>
        </div>
      </div>
    </div>
  );
}

function MobileDriftCard() {
  return (
    <div className="rounded-2xl bg-surface/95 p-6 ring-1 ring-border ring-inset lg:hidden">
      <div className="mb-4 flex items-center justify-between border-ink/15 border-b pb-3">
        <span className="font-mono text-caption text-muted uppercase">
          drift · cosine vs golden
        </span>
        <span className="inline-flex items-center gap-1.5 font-mono text-caption text-rose">
          <span className="size-1.5 animate-pulse rounded-full bg-rose" />
          drift detected
        </span>
      </div>
      <Sparkline data={driftPoints} stroke="warm" width={300} height={56} />
      <div className="mt-4 flex flex-col gap-1.5 font-mono text-caption">
        <div className="flex items-center justify-between">
          <span className="text-muted">baseline</span>
          <span className="text-ink/85">0.94</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted">last 6 hours</span>
          <span className="text-rose">0.71 ↓ 24%</span>
        </div>
      </div>
    </div>
  );
}

function DriftManifestoPanel() {
  return (
    <article className="relative flex h-[100dvh] w-screen shrink-0 flex-col overflow-hidden px-6 py-12 sm:px-10 sm:py-16 md:px-16 lg:px-20">
      {/* Background warm blob + acid spike */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          left: '5vw',
          top: '15vh',
          width: '70vw',
          height: '60vh',
          background:
            'radial-gradient(ellipse 60% 50% at center, oklch(82% 0.16 75 / 16%) 0%, transparent 70%)',
          filter: 'blur(36px)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[35vh] right-[8vw] h-[40vh] w-[30vw]"
        style={{
          background:
            'radial-gradient(ellipse at center, oklch(91% 0.21 130 / 14%) 0%, transparent 65%)',
          filter: 'blur(20px)',
        }}
      />

      <FullBleedSparkline />
      <ManifestoStamp index="03" position="tr" />

      <PanelHeader index="03" category="Operations" categoryTone="warm" />

      <div className="relative flex flex-1 items-center">
        <h3
          className="font-display font-medium text-ink text-on-canvas leading-[0.88] tracking-[-0.02em]"
          style={{ fontSize: HEADLINE_SIZE }}
        >
          Drift is
          <br />
          <span className="font-normal font-serif text-warm italic">a deploy event.</span>
        </h3>
      </div>

      <div className="relative grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <p className="max-w-md text-body text-ink/95 text-on-canvas">
            Models change behind your back. Vendors swap silently, customers shift behavior, and the
            build that passed Wednesday fails Friday. We instrument for it.
          </p>
        </div>
        <div className="lg:hidden">
          <MobileDriftCard />
        </div>
      </div>

      <div className="relative mt-8">
        <EdgeRail index="03" category="Operations" figure="03" />
      </div>
    </article>
  );
}

// ── Composer ───────────────────────────────────────────────────────────────

function BeliefsBeat() {
  return (
    <PinnedHorizontalScroll className="z-20" scrubMultiplier={1.05}>
      <EvalManifestoPanel />
      <StreamingManifestoPanel />
      <DriftManifestoPanel />
    </PinnedHorizontalScroll>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Beat 4 — Agent Trace (bento with floating chips on the trace hero)
// ────────────────────────────────────────────────────────────────────────────

function ChipCard({
  children,
  tone = 'accent',
}: {
  children: React.ReactNode;
  tone?: 'accent' | 'cool' | 'muted';
}) {
  const toneClass: Record<string, string> = {
    accent: 'text-accent ring-accent/35',
    cool: 'text-cool ring-cool/35',
    muted: 'text-ink/85 ring-ink/20',
  };
  return (
    <span
      className={`inline-flex h-8 items-center gap-2 rounded-full bg-bg/95 px-3.5 font-mono text-caption ring-1 ring-inset ${toneClass[tone]}`}
    >
      {children}
    </span>
  );
}

function AgentTraceBeat() {
  return (
    <section className="relative flex min-h-[100dvh] items-center py-16 sm:py-20 md:py-24">
      <Container width="xl">
        <Stack gap="xl">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
            <div className="md:col-span-1 md:pt-2">
              <Eyebrow>04</Eyebrow>
            </div>
            <div className="md:col-span-10 md:col-start-2">
              <ScrollReveal>
                <h2 className="font-display text-display-xl text-on-canvas leading-[0.96] tracking-tight">
                  If we can't see it in production,
                  <br />
                  <span className="font-serif text-accent italic">we don't ship it.</span>
                </h2>
              </ScrollReveal>
              <p className="mt-6 max-w-2xl text-body-lg text-ink/95 text-on-canvas">
                Eval suite, drift detector, cost trace — wired before launch, owned by you after.
                The trace below is a real engagement, replayed at half speed.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Center hero — terminal with floating chip overlays */}
            <div className="relative lg:col-span-8">
              <TerminalFrame title="agent.trace · session tx_8f2a · live">
                <div className="p-6">
                  <LogStream feed={traceFeed} rows={11} intervalMs={1500} />
                </div>
              </TerminalFrame>
              {/* Floating chips — positioned to overlap the terminal corner */}
              <div className="pointer-events-none absolute right-4 bottom-4 hidden flex-col items-end gap-2 sm:flex">
                <ChipCard tone="accent">✓ Hallucination check passed</ChipCard>
                <ChipCard tone="cool">○ Drift 0.94 · in band</ChipCard>
                <ChipCard tone="accent">✓ Trace exported · 412 spans</ChipCard>
              </div>
            </div>

            {/* Right column — metric cards */}
            <div className="flex flex-col gap-4 lg:col-span-4">
              <article className="rounded-2xl bg-surface p-6 ring-1 ring-border ring-inset">
                <LiveMetric
                  label="Eval pass rate"
                  value={96}
                  unit="%"
                  delta={2.4}
                  trend={sparkEval}
                  trendTone="cool"
                />
              </article>
              <article className="rounded-2xl bg-surface p-6 ring-1 ring-border ring-inset">
                <LiveMetric
                  label="Cost per call"
                  value={1.7}
                  precision={1}
                  prefix="$"
                  unit=""
                  delta={-1.4}
                  trend={sparkCost}
                  trendTone="warm"
                />
              </article>
              <article className="rounded-2xl bg-surface p-6 ring-1 ring-border ring-inset">
                <Stack gap="xs">
                  <span className="font-mono text-caption text-muted uppercase">
                    Drift vs golden
                  </span>
                  <Stack direction="row" gap="md" align="end">
                    <span className="font-display text-display-sm tracking-tight">0.94</span>
                    <span className="pb-1 font-mono text-accent text-caption">within band</span>
                  </Stack>
                  <Sparkline data={sparkEval} stroke="accent" width={220} height={36} />
                </Stack>
              </article>
            </div>
          </div>
        </Stack>
      </Container>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Beat 5 — Capabilities (3×2 bright acid card grid, dark type inside)
// ────────────────────────────────────────────────────────────────────────────

const capabilities = [
  {
    name: 'Agentic execution',
    description: 'Plan, use tools, watch what happens, score it, ship.',
    chips: ['plan', 'tools', 'observe', 'eval'],
  },
  {
    name: 'Retrieval pipelines',
    description: 'Hybrid search, structured grounding, multi-tenant safety from day one.',
    chips: ['hybrid', 'grounded', 'multi-tenant'],
  },
  {
    name: 'Real-time UX',
    description: 'Streaming reasoning, GenUI patterns, optimistic states that hold under load.',
    chips: ['streaming', 'GenUI', 'optimistic'],
  },
  {
    name: 'Evaluation suites',
    description: 'Golden sets, drift detectors, harnesses you can extend without us.',
    chips: ['golden sets', 'drift', 'harnesses'],
  },
  {
    name: 'Observability',
    description: 'Traces, costs, failure modes — the boring stuff that pays the bill back.',
    chips: ['OTel', 'cost trace', 'replay'],
  },
  {
    name: 'Compliance',
    description: 'SOC 2, HIPAA, EU AI Act — built into the architecture, not bolted on after.',
    chips: ['SOC 2', 'HIPAA', 'EU AI Act'],
  },
] as const;

function CapabilityCard({ index, cap }: { index: number; cap: (typeof capabilities)[number] }) {
  return (
    <article className="group flex flex-col gap-5 rounded-2xl bg-accent p-7 ring-1 ring-accent-strong/40 transition-transform duration-500 ease-out-expo hover:-translate-y-1 sm:p-8">
      <div className="flex items-start justify-between">
        <span className="font-mono text-bg/55 text-caption">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="inline-flex size-8 items-center justify-center rounded-full bg-bg/10 text-bg/70 ring-1 ring-bg/15 transition-[background,color] duration-300 group-hover:bg-bg group-hover:text-accent">
          <ArrowUpRight className="size-3.5" />
        </span>
      </div>
      <h3 className="font-display text-bg text-display-sm leading-[1.0] tracking-tight">
        {cap.name}
      </h3>
      <p className="text-bg/85 text-body-sm">{cap.description}</p>
      <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
        {cap.chips.map((chip) => (
          <span
            key={chip}
            className="inline-flex h-7 items-center rounded-full bg-bg/12 px-3 font-mono text-bg text-caption ring-1 ring-bg/15"
          >
            {chip}
          </span>
        ))}
      </div>
    </article>
  );
}

function CapabilitiesBeat() {
  return (
    <section className="relative flex min-h-[100dvh] items-center py-16 sm:py-20 md:py-24">
      <Container width="xl">
        <Stack gap="xl">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
            <div className="md:col-span-1 md:pt-2">
              <Eyebrow>05</Eyebrow>
            </div>
            <div className="md:col-span-10 md:col-start-2">
              <ScrollReveal>
                <h2 className="font-display text-display-xl text-on-canvas leading-[0.96] tracking-tight">
                  Six things.
                  <br />
                  <span className="font-serif text-accent italic">One team.</span>
                </h2>
              </ScrollReveal>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {capabilities.map((cap, i) => (
              <ScrollReveal key={cap.name} delay={i * 0.05}>
                <CapabilityCard index={i} cap={cap} />
              </ScrollReveal>
            ))}
          </div>
        </Stack>
      </Container>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Beat 6 — Process (vertical timeline, ghost numerals at 14vw)
// ────────────────────────────────────────────────────────────────────────────

const processSteps = [
  {
    n: '01',
    title: 'Brief',
    body: 'Two days, no slides. We listen for the outcome, the constraints, and the eval data we should be able to read by week two.',
  },
  {
    n: '02',
    title: 'Plan',
    body: 'A scoped, fixed-price plan with rollout gates and a measurable definition of done. We sign it before we open an editor.',
  },
  {
    n: '03',
    title: 'Ship',
    body: 'Two-week iteration cadence. The eval suite runs on every push. First production traffic by day five — small, but real.',
  },
  {
    n: '04',
    title: 'Result',
    body: 'You keep the trace, the eval suite, and the runbook. We come back quarterly to compare against the original criteria.',
  },
] as const;

function ProcessBeat() {
  return (
    <section className="relative flex min-h-[100dvh] items-center py-16 sm:py-20 md:py-24">
      <Container width="xl">
        <Stack gap="xl">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
            <div className="md:col-span-1 md:pt-2">
              <Eyebrow>06</Eyebrow>
            </div>
            <div className="md:col-span-10 md:col-start-2">
              <ScrollReveal>
                <h2 className="font-display text-display-xl text-on-canvas leading-[0.96] tracking-tight">
                  How it goes,
                  <br />
                  <span className="font-serif text-accent italic">when it goes well.</span>
                </h2>
              </ScrollReveal>
            </div>
          </div>

          <div className="flex flex-col">
            {processSteps.map((step, i) => {
              const alignRight = i % 2 === 1;
              return (
                <ScrollReveal key={step.n} delay={i * 0.05}>
                  <div
                    className={`grid grid-cols-1 items-start gap-x-10 gap-y-4 border-ink/15 border-b py-12 md:grid-cols-12 ${alignRight ? 'md:[&>div:last-child]:col-start-7' : ''}`}
                  >
                    <span className="font-display text-[clamp(4rem,14vw,12rem)] text-ink/30 leading-none tracking-tight md:col-span-3">
                      {step.n}
                    </span>
                    <div className="md:col-span-6 md:col-start-4">
                      <h3 className="font-display text-display-md text-on-canvas tracking-tight">
                        {step.title}
                      </h3>
                      <p className="mt-3 max-w-md text-body-lg text-ink text-on-canvas">
                        {step.body}
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </Stack>
      </Container>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Beat 7 — Editorial poster (display-3xl off-axis serif quote, lettermark)
// ────────────────────────────────────────────────────────────────────────────

function EditorialBeat() {
  return (
    <section className="relative flex min-h-[110dvh] items-center py-16 sm:py-20 md:py-24">
      <Container width="xl" className="relative">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-1 md:pt-2">
            <Eyebrow>07</Eyebrow>
          </div>
          <div className="md:col-span-11 md:col-start-2">
            <p className="font-serif text-display-2xl text-on-canvas italic leading-[0.95] tracking-tight md:text-display-3xl">
              <span className="text-accent">"</span>On day one, AI is interesting.
              <br />
              On day forty, <span className="text-accent italic">it has to work.</span>
              <span className="text-accent">"</span>
            </p>
            <div className="mt-12 flex items-center gap-4 border-ink/20 border-t pt-6 font-mono text-caption text-ink text-on-canvas uppercase">
              <span className="size-1.5 rounded-full bg-accent" />
              Founding partner · Thrivaxis
            </div>
          </div>
        </div>

        {/* Lettermark in corner — small, off-canvas-quiet */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-6 bottom-0 hidden font-display text-accent/40 text-display-md leading-none tracking-tight md:block"
        >
          T<span className="text-accent/70">*</span>
        </div>
      </Container>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Beat 8 — Close (single huge CTA, naked type + bright accent button)
// ────────────────────────────────────────────────────────────────────────────

function CloseBeat() {
  return (
    <section className="relative flex min-h-[100dvh] items-center py-16 sm:py-20 md:py-24">
      <Container width="xl">
        <Stack gap="xl">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
            <div className="md:col-span-1 md:pt-2">
              <Eyebrow>08</Eyebrow>
            </div>
            <div className="md:col-span-10 md:col-start-2">
              <ScrollReveal>
                <h2 className="font-display text-display-2xl text-on-canvas leading-[0.92] tracking-tight">
                  We work with three teams
                  <br />
                  <span className="font-serif text-accent italic">at a time.</span>
                </h2>
              </ScrollReveal>
              <p className="mt-8 max-w-2xl text-body-lg text-ink/95 text-on-canvas">
                Bring an outcome you'd like to claim. We'll send a tight scope back within 48 hours
                — or tell you why we're not the right team.
              </p>

              <div className="mt-12 flex flex-col gap-6">
                <Stack direction="row" gap="md" wrap>
                  <MagneticButton variant="primary" size="lg">
                    Open a brief <ArrowRight className="ml-2 size-5" />
                  </MagneticButton>
                  <MagneticButton variant="ghost" size="lg">
                    company@thrivaxis.com
                  </MagneticButton>
                </Stack>
                <p className="font-mono text-caption text-ink/95 text-on-canvas uppercase">
                  <span className="text-accent">·</span> Q3 capacity opens Aug 11 · 2 of 3 slots
                  reserved
                </p>
              </div>
            </div>
          </div>
        </Stack>
      </Container>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Page — fixed canvas + 8 stacked beats; no scrim, premium materials
// ────────────────────────────────────────────────────────────────────────────

export default async function HomepageDemoPage() {
  return (
    <>
      <SkyOceanCanvas className="fixed inset-0 z-0" />

      <div className="relative z-10">
        <HeroBeat />
        <IdentityBeat />
        <BeliefsBeat />
        <AgentTraceBeat />
        <CapabilitiesBeat />
        <ProcessBeat />
        <EditorialBeat />
        <CloseBeat />
      </div>
    </>
  );
}
