import { ArrowUpRight, Cpu, Flash, Leaf, Sparks } from 'iconoir-react';
import Link from 'next/link';
import {
  BentoTile,
  BrowserFrame,
  Card,
  Code,
  Container,
  DashedGrid,
  Divider,
  Eyebrow,
  Glow,
  Grid,
  KineticHeading,
  KineticTextSwap,
  LiveMetric,
  LogStream,
  MagneticButton,
  MarqueeRow,
  ProceduralAvatar,
  Quote,
  ScrollReveal,
  Section,
  Sparkline,
  Stack,
  Tag,
  TerminalFrame,
} from '@/components/primitives';

export const metadata = { title: 'Playground' };

// ────────────────────────────────────────────────────────────────────────────
// Token data
// ────────────────────────────────────────────────────────────────────────────

const tokenSwatches = [
  { name: 'bg', token: 'bg-bg' },
  { name: 'surface', token: 'bg-surface' },
  { name: 'surface-2', token: 'bg-surface-2' },
  { name: 'surface-3', token: 'bg-surface-3' },
  { name: 'border', token: 'bg-border' },
  { name: 'border-strong', token: 'bg-border-strong' },
  { name: 'muted', token: 'bg-muted' },
  { name: 'subtle', token: 'bg-subtle' },
  { name: 'ink', token: 'bg-ink' },
  { name: 'accent', token: 'bg-accent' },
  { name: 'accent-strong', token: 'bg-accent-strong' },
  { name: 'cool', token: 'bg-cool' },
  { name: 'warm', token: 'bg-warm' },
  { name: 'rose', token: 'bg-rose' },
];

const typeSamples: { tag: 'h1' | 'h2' | 'h3' | 'p'; cls: string; label: string; sample: string }[] =
  [
    {
      tag: 'h1',
      cls: 'text-display-2xl font-display tracking-tight',
      label: 'display-2xl',
      sample: 'Aa',
    },
    {
      tag: 'h1',
      cls: 'text-display-xl font-display tracking-tight',
      label: 'display-xl',
      sample: 'Display headline',
    },
    {
      tag: 'h1',
      cls: 'text-display-lg font-display tracking-tight',
      label: 'display-lg',
      sample: 'Display large',
    },
    {
      tag: 'h2',
      cls: 'text-display-md font-display tracking-tight',
      label: 'display-md',
      sample: 'Display medium',
    },
    {
      tag: 'h2',
      cls: 'text-display-sm font-display tracking-tight',
      label: 'display-sm',
      sample: 'Display small',
    },
    {
      tag: 'h2',
      cls: 'text-display-md font-serif italic',
      label: 'serif italic',
      sample: 'Editorial moment',
    },
    { tag: 'h3', cls: 'text-h1', label: 'h1', sample: 'Heading one' },
    { tag: 'h3', cls: 'text-h2', label: 'h2', sample: 'Heading two' },
    { tag: 'h3', cls: 'text-h3', label: 'h3', sample: 'Heading three' },
    {
      tag: 'p',
      cls: 'text-body-lg',
      label: 'body-lg',
      sample:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt.',
    },
    {
      tag: 'p',
      cls: 'text-body',
      label: 'body',
      sample: 'The quick brown fox jumps over the lazy dog.',
    },
    {
      tag: 'p',
      cls: 'text-body-sm text-muted',
      label: 'body-sm muted',
      sample: 'Smaller secondary copy.',
    },
    {
      tag: 'p',
      cls: 'font-mono text-caption text-muted',
      label: 'caption mono',
      sample: 'system / status / log line',
    },
  ];

const sparkAccent = [12, 18, 16, 24, 30, 28, 34, 41, 38, 47, 52, 60, 64, 71, 80] as const;
const sparkCool = [42, 48, 55, 49, 60, 66, 71, 65, 73, 80, 78, 84, 88, 92, 96] as const;
const sparkWarm = [
  3.4, 3.2, 3.0, 2.8, 2.7, 2.5, 2.4, 2.4, 2.2, 2.0, 1.9, 1.8, 1.7, 1.6, 1.5,
] as const;

const sampleCode = `// app/api/agent/route.ts
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  const { messages } = await req.json();
  const model = ai.getGenerativeModel({ model: 'gemini-2.5-pro' });
  const chat = model.startChat({ history: messages });
  const result = await chat.sendMessageStream(messages.at(-1).content);
  return new NextResponse(result.stream as ReadableStream);
}`;

const team = ['Avery Lin', 'Marco Tate', 'Priya Joshi', 'Diego Sousa', 'Ren Walker', 'Naima Cole'];

// ────────────────────────────────────────────────────────────────────────────
// Reusable section header
// ────────────────────────────────────────────────────────────────────────────

function SectionHeader({ index, title, note }: { index: string; title: string; note?: string }) {
  return (
    <Stack gap="sm">
      <Eyebrow>
        {index} · {title}
      </Eyebrow>
      {note && <p className="max-w-prose text-body-sm text-muted">{note}</p>}
    </Stack>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Page
// ────────────────────────────────────────────────────────────────────────────

export default async function Playground() {
  return (
    <>
      <Section padding="md" className="border-border border-b">
        <DashedGrid />
        <Container>
          <Stack direction="row" justify="between" align="center" className="flex-wrap gap-6">
            <Stack direction="column" gap="sm">
              <Eyebrow>Internal</Eyebrow>
              <h1 className="font-display text-display-md tracking-tight">Design playground</h1>
              <p className="max-w-prose text-muted">
                Every token and primitive in one place. Dev-only — ships in build but unlinked from
                public navigation.
              </p>
            </Stack>
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-mono text-caption text-muted uppercase hover:text-ink"
            >
              ← Back to home
            </Link>
          </Stack>
        </Container>
      </Section>

      {/* 01 Color ──────────────────────────────────────────────────────── */}
      <Section padding="md">
        <Container>
          <Stack gap="lg">
            <SectionHeader index="01" title="Color" />
            <Grid cols={4} gap="md">
              {tokenSwatches.map((s) => (
                <Card key={s.name} padding="none">
                  <div className={`${s.token} aspect-video w-full`} />
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="font-mono text-caption">{s.name}</span>
                  </div>
                </Card>
              ))}
            </Grid>
          </Stack>
        </Container>
      </Section>

      {/* 02 Typography ─────────────────────────────────────────────────── */}
      <Section padding="md" className="border-border border-y bg-surface/40">
        <Container>
          <Stack gap="lg">
            <SectionHeader index="02" title="Typography" />
            <Stack gap="md">
              {typeSamples.map((t) => {
                const Tag = t.tag;
                return (
                  <div
                    key={t.label}
                    className="flex flex-col gap-2 border-border border-b py-6 last:border-b-0"
                  >
                    <span className="font-mono text-label text-muted uppercase">{t.label}</span>
                    <Tag className={t.cls}>{t.sample}</Tag>
                  </div>
                );
              })}
            </Stack>
          </Stack>
        </Container>
      </Section>

      {/* 03 Kinetic heading ────────────────────────────────────────────── */}
      <Section padding="md">
        <Container>
          <Stack gap="lg">
            <SectionHeader
              index="03"
              title="Kinetic heading (GSAP SplitText)"
              note="Triggers on scroll by default. This one plays on mount so you can see it."
            />
            <KineticHeading as="h2" className="text-display-lg" triggerOnScroll={false}>
              Premium ships in the details.
            </KineticHeading>
          </Stack>
        </Container>
      </Section>

      {/* 04 Kinetic text swap ──────────────────────────────────────────── */}
      <Section padding="md" className="border-border border-y bg-surface/40">
        <Container>
          <Stack gap="lg">
            <SectionHeader index="04" title="Kinetic text swap" note="Inline word rotator." />
            <h2 className="font-display text-display-md tracking-tight">
              We build{' '}
              <KineticTextSwap
                words={['agents', 'pipelines', 'systems', 'experiences']}
                className="font-serif italic"
              />
              .
            </h2>
          </Stack>
        </Container>
      </Section>

      {/* 05 Buttons ────────────────────────────────────────────────────── */}
      <Section padding="md">
        <Container>
          <Stack gap="lg">
            <SectionHeader index="05" title="Buttons" />
            <Stack direction="row" gap="md" wrap>
              <MagneticButton variant="primary" size="lg">
                Primary <ArrowUpRight className="ml-2 size-5" />
              </MagneticButton>
              <MagneticButton variant="primary" size="md">
                Primary md
              </MagneticButton>
              <MagneticButton variant="outline" size="md">
                Outline
              </MagneticButton>
              <MagneticButton variant="ghost" size="md">
                Ghost
              </MagneticButton>
            </Stack>
          </Stack>
        </Container>
      </Section>

      {/* 06 Tags ───────────────────────────────────────────────────────── */}
      <Section padding="md" className="border-border border-y bg-surface/40">
        <Container>
          <Stack gap="lg">
            <SectionHeader index="06" title="Tags" />
            <Stack direction="row" gap="sm" wrap>
              <Tag>neutral</Tag>
              <Tag tone="accent" withDot>
                accent
              </Tag>
              <Tag tone="cool" withDot>
                cool
              </Tag>
              <Tag tone="warm" withDot>
                warm
              </Tag>
              <Tag tone="rose" withDot>
                rose
              </Tag>
              <Tag size="md" tone="accent">
                size md
              </Tag>
            </Stack>
          </Stack>
        </Container>
      </Section>

      {/* 07 Cards ──────────────────────────────────────────────────────── */}
      <Section padding="md">
        <Container>
          <Stack gap="lg">
            <SectionHeader index="07" title="Cards" />
            <Grid cols={4} gap="md">
              <Card>
                <Stack gap="sm">
                  <Tag tone="accent" withDot size="sm">
                    default
                  </Tag>
                  <p className="font-display text-h3 tracking-tight">Default surface</p>
                  <p className="text-body-sm text-muted">Subtle ring, surface bg.</p>
                </Stack>
              </Card>
              <Card tone="inset">
                <Stack gap="sm">
                  <Tag size="sm">inset</Tag>
                  <p className="font-display text-h3 tracking-tight">Inset surface</p>
                  <p className="text-body-sm text-muted">Slightly recessed feel.</p>
                </Stack>
              </Card>
              <Card tone="raised">
                <Stack gap="sm">
                  <Tag size="sm">raised</Tag>
                  <p className="font-display text-h3 tracking-tight">Raised surface</p>
                  <p className="text-body-sm text-muted">With shadow + stronger ring.</p>
                </Stack>
              </Card>
              <Card tone="accent">
                <Stack gap="sm">
                  <Tag tone="accent" withDot size="sm">
                    accent
                  </Tag>
                  <p className="font-display text-h3 tracking-tight">Accent surface</p>
                  <p className="text-body-sm text-muted">For featured callouts.</p>
                </Stack>
              </Card>
            </Grid>
          </Stack>
        </Container>
      </Section>

      {/* 08 Bento ──────────────────────────────────────────────────────── */}
      <Section padding="md" className="border-border border-y bg-surface/40">
        <Container>
          <Stack gap="lg">
            <SectionHeader index="08" title="Bento" note="Variable-span tiles, dense grid." />
            <div className="grid grid-flow-dense auto-rows-[160px] grid-cols-3 gap-4 sm:grid-cols-4">
              <BentoTile span="lg">
                <div className="flex flex-1 flex-col justify-between p-6">
                  <Tag tone="accent" withDot>
                    feature
                  </Tag>
                  <Stack gap="xs">
                    <Sparks className="size-7 text-accent" />
                    <p className="font-display text-h2 tracking-tight">Agentic execution</p>
                    <p className="text-body-sm text-muted">
                      Plan · tools · observe · respond — wired end to end.
                    </p>
                  </Stack>
                </div>
              </BentoTile>
              <BentoTile span="md">
                <div className="flex flex-1 flex-col justify-between p-6">
                  <Tag tone="cool" withDot>
                    pipeline
                  </Tag>
                  <Stack gap="xs">
                    <Cpu className="size-7 text-cool" />
                    <p className="font-display text-h3 tracking-tight">Retrieval & RAG</p>
                  </Stack>
                </div>
              </BentoTile>
              <BentoTile span="sm">
                <div className="flex flex-1 flex-col justify-between p-5">
                  <Flash className="size-6 text-warm" />
                  <p className="font-display text-body tracking-tight">Performance</p>
                </div>
              </BentoTile>
              <BentoTile span="sm">
                <div className="flex flex-1 flex-col justify-between p-5">
                  <Leaf className="size-6 text-accent" />
                  <p className="font-display text-body tracking-tight">Compliance</p>
                </div>
              </BentoTile>
              <BentoTile span="md">
                <div className="flex flex-1 flex-col justify-between p-6">
                  <Tag tone="warm" withDot>
                    measure
                  </Tag>
                  <p className="font-display text-h3 tracking-tight">Evals & telemetry</p>
                </div>
              </BentoTile>
              <BentoTile span="sm">
                <div className="flex flex-1 flex-col justify-between p-5">
                  <Sparks className="size-6 text-accent" />
                  <p className="font-display text-body tracking-tight">GenUI</p>
                </div>
              </BentoTile>
            </div>
          </Stack>
        </Container>
      </Section>

      {/* 09 Live metrics ───────────────────────────────────────────────── */}
      <Section padding="md">
        <Container>
          <Stack gap="lg">
            <SectionHeader
              index="09"
              title="Live metrics"
              note="Animated counter + sparkline. Counts up on scroll-into-view."
            />
            <Grid cols={3} gap="md">
              <Card padding="lg">
                <LiveMetric
                  label="Activation lift"
                  value={47.2}
                  delta={9.4}
                  unit="%"
                  precision={1}
                  trend={sparkAccent}
                />
              </Card>
              <Card padding="lg">
                <LiveMetric
                  label="Eval pass rate"
                  value={96}
                  delta={2.1}
                  unit="%"
                  trend={sparkCool}
                  trendTone="cool"
                />
              </Card>
              <Card padding="lg">
                <LiveMetric
                  label="Time to first token"
                  value={1.5}
                  delta={-0.6}
                  unit="s"
                  precision={1}
                  trend={sparkWarm}
                  trendTone="warm"
                />
              </Card>
            </Grid>
          </Stack>
        </Container>
      </Section>

      {/* 10 Sparkline (raw) ────────────────────────────────────────────── */}
      <Section padding="md" className="border-border border-y bg-surface/40">
        <Container>
          <Stack gap="lg">
            <SectionHeader index="10" title="Sparkline" note="Standalone, all tones." />
            <Stack direction="row" gap="lg" wrap>
              <Sparkline data={sparkAccent} stroke="accent" width={220} height={48} />
              <Sparkline data={sparkCool} stroke="cool" width={220} height={48} />
              <Sparkline data={sparkWarm} stroke="warm" width={220} height={48} fill={false} />
              <Sparkline data={sparkAccent} stroke="muted" width={220} height={48} fill={false} />
            </Stack>
          </Stack>
        </Container>
      </Section>

      {/* 11 Browser + Terminal frames + Log stream ────────────────────── */}
      <Section padding="md">
        <Container>
          <Stack gap="lg">
            <SectionHeader
              index="11"
              title="Mockup frames"
              note="Code-native substitute for screenshots. Wrap any composition."
            />
            <Grid cols={2} gap="lg">
              <BrowserFrame url="thrivaxis.com/work">
                <div className="relative flex flex-col gap-4 p-6">
                  <Glow size="sm" tone="accent" position="top" />
                  <Tag tone="accent" withDot>
                    case study
                  </Tag>
                  <p className="font-display text-h2 tracking-tight">
                    Cut activation time by 47% with an AI guidance agent.
                  </p>
                  <Stack direction="row" gap="md">
                    <LiveMetric label="Activation" value={47} unit="%" />
                    <LiveMetric label="Eval" value={96} unit="%" trendTone="cool" />
                  </Stack>
                </div>
              </BrowserFrame>
              <TerminalFrame title="thrivaxis ~ agent.run">
                <div className="p-5">
                  <LogStream rows={7} intervalMs={1700} />
                </div>
              </TerminalFrame>
            </Grid>
          </Stack>
        </Container>
      </Section>

      {/* 12 Code (Shiki) ───────────────────────────────────────────────── */}
      <Section padding="md" className="border-border border-y bg-surface/40">
        <Container>
          <Stack gap="lg">
            <SectionHeader
              index="12"
              title="Code"
              note="Shiki, server-rendered. No client JS for highlighting."
            />
            <Code code={sampleCode} lang="ts" title="Gemini route handler" />
          </Stack>
        </Container>
      </Section>

      {/* 13 Quote ──────────────────────────────────────────────────────── */}
      <Section padding="md">
        <Container width="md">
          <Stack gap="lg">
            <SectionHeader index="13" title="Quote" />
            <Quote size="xl" attribution="Founding partner · Thrivaxis">
              We build software the way premium products are made — patient, in code, every pixel
              earned.
            </Quote>
          </Stack>
        </Container>
      </Section>

      {/* 14 Procedural avatars ─────────────────────────────────────────── */}
      <Section padding="md" className="border-border border-y bg-surface/40">
        <Container>
          <Stack gap="lg">
            <SectionHeader
              index="14"
              title="Procedural avatars"
              note="Deterministic gradient + initials. Replaces team headshots."
            />
            <Stack direction="row" gap="md" wrap>
              {team.map((name) => (
                <Stack key={name} align="center" gap="xs">
                  <ProceduralAvatar name={name} size="xl" />
                  <span className="font-mono text-caption text-muted">{name}</span>
                </Stack>
              ))}
            </Stack>
            <Stack direction="row" gap="md" align="end">
              <ProceduralAvatar name="Avery Lin" size="sm" />
              <ProceduralAvatar name="Avery Lin" size="md" />
              <ProceduralAvatar name="Avery Lin" size="lg" />
              <ProceduralAvatar name="Avery Lin" size="xl" />
              <ProceduralAvatar name="Avery Lin" shape="square" size="lg" />
            </Stack>
          </Stack>
        </Container>
      </Section>

      {/* 15 Marquee ────────────────────────────────────────────────────── */}
      <Section padding="md">
        <Container>
          <Stack gap="lg">
            <SectionHeader index="15" title="Marquee" />
            <MarqueeRow speed="normal">
              {[
                'Vercel',
                'Linear',
                'Anthropic',
                'OpenAI',
                'Stripe',
                'Notion',
                'Mercury',
                'Resend',
              ].map((name) => (
                <span
                  key={name}
                  className="whitespace-nowrap font-display text-display-sm text-muted transition-colors hover:text-ink"
                >
                  {name}
                </span>
              ))}
            </MarqueeRow>
          </Stack>
        </Container>
      </Section>

      {/* 16 Glow + Divider ─────────────────────────────────────────────── */}
      <Section padding="md" className="border-border border-y bg-surface/40">
        <Container>
          <Stack gap="lg">
            <SectionHeader index="16" title="Glow + Divider" />
            <Card padding="none" className="relative h-72 overflow-hidden">
              <Glow size="lg" tone="accent" pulse />
              <DashedGrid fade={false} className="opacity-30" />
              <div className="relative flex h-full items-center justify-center">
                <p className="font-display text-display-md tracking-tight">
                  <KineticTextSwap words={['glow', 'halo', 'aura']} />
                </p>
              </div>
            </Card>
            <Divider label="Divider — left" align="left" />
            <Divider label="Divider — center" align="center" />
            <Divider />
          </Stack>
        </Container>
      </Section>

      {/* 17 Easings ────────────────────────────────────────────────────── */}
      <Section padding="md">
        <Container>
          <Stack gap="lg">
            <SectionHeader
              index="17"
              title="Easings"
              note="Hover any tile to play. CSS tokens align with src/lib/motion.ts."
            />
            <Grid cols={3} gap="md">
              {[
                { name: 'ease-out-expo', cls: 'ease-out-expo' },
                { name: 'ease-in-out-expo', cls: 'ease-in-out-expo' },
                { name: 'ease-out-quart', cls: 'ease-out-quart' },
                { name: 'ease-in-out-quart', cls: 'ease-in-out-quart' },
                { name: 'ease-spring-soft', cls: 'ease-spring-soft' },
                { name: 'ease-spring-snap', cls: 'ease-spring-snap' },
              ].map((e) => (
                <Card key={e.name} padding="md">
                  <span className="font-mono text-caption">{e.name}</span>
                  <div className="relative mt-3 h-2 overflow-hidden rounded-full bg-surface-3">
                    <div
                      className={`absolute inset-y-0 left-0 w-1/4 rounded-full bg-accent transition-[transform] duration-1000 ${e.cls} group-hover:translate-x-[300%]`}
                    />
                  </div>
                </Card>
              ))}
            </Grid>
          </Stack>
        </Container>
      </Section>

      {/* 18 Scroll reveal demo (kept) ──────────────────────────────────── */}
      <Section padding="md" className="border-border border-y bg-surface/40">
        <Container>
          <Stack gap="lg">
            <SectionHeader index="18" title="Scroll reveal" note="Each tile staggers in." />
            <Grid cols={3} gap="md">
              {(['one', 'two', 'three', 'four', 'five', 'six'] as const).map((slug, i) => (
                <ScrollReveal key={slug} delay={i * 0.05}>
                  <Card>
                    <Stack gap="sm">
                      <Tag tone={i % 3 === 0 ? 'accent' : i % 3 === 1 ? 'cool' : 'warm'} withDot>
                        item {i + 1}
                      </Tag>
                      <p className="font-display text-h3 tracking-tight">Reveal tile</p>
                      <p className="text-body-sm text-muted">
                        Slides up + fades in once 90% in view.
                      </p>
                    </Stack>
                  </Card>
                </ScrollReveal>
              ))}
            </Grid>
          </Stack>
        </Container>
      </Section>
    </>
  );
}
