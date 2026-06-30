import { notFound } from 'next/navigation';
import { Container, Eyebrow, Section, Stack, Tag } from '@/components/primitives';

const concepts = {
  ledgermind: {
    industry: 'Fintech',
    title: 'LedgerMind',
    headline: 'Continuous-audit AI for a Series-C fintech.',
    summary:
      'Mapped 42 SOC-2 controls to live evidence streams, with an agent that drafts findings against Annex IV requirements.',
  },
  'atlas-grow': {
    industry: 'DTC commerce',
    title: 'Atlas Grow',
    headline: 'AI-driven creative + media optimizer.',
    summary:
      'Replaced a 9-month CAC payback with a 3.2-month one by closing the loop between creative variant generation, ad delivery, and on-site personalization.',
  },
  'halo-health': {
    industry: 'Healthcare',
    title: 'Halo Health',
    headline: 'Patient engagement agent with HIPAA-grade evals.',
    summary:
      'Cut 30-day readmits by 65% across a 12,400-patient cohort. Eval suite covers PII, hallucination, clinical correctness, and tone.',
  },
} as const;

type Slug = keyof typeof concepts;

export function generateStaticParams() {
  return Object.keys(concepts).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const concept = concepts[slug as Slug];
  if (!concept) return {};
  return { title: concept.title, description: concept.headline };
}

export default async function CaseStudyStubPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const concept = concepts[slug as Slug];
  if (!concept) notFound();

  return (
    <Section padding="xl" className="pt-32">
      <Container width="md">
        <Stack gap="xl">
          <Stack gap="md">
            <Tag tone="accent" withDot>
              {concept.industry}
            </Tag>
            <h1 className="font-display text-display-lg leading-[1.02] tracking-tight sm:text-display-xl">
              {concept.title}
            </h1>
            <p className="font-serif text-accent text-display-sm italic leading-tight">
              {concept.headline}
            </p>
            <p className="text-body-lg text-muted">{concept.summary}</p>
          </Stack>
          <Stack gap="sm">
            <Eyebrow>Phase 4 — coming soon</Eyebrow>
            <p className="text-body-sm text-muted">
              The full case-study layout — scroll-driven hero scene, pinned results bar, animated
              flow diagrams, code excerpts — is built in Phase 4 from a CMS schema.
            </p>
          </Stack>
        </Stack>
      </Container>
    </Section>
  );
}
