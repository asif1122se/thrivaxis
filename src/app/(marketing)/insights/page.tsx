import { Container, Eyebrow, Section, Stack, Tag } from '@/components/primitives';

export const metadata = {
  title: 'Insights',
  description: 'Field notes from a code-native AI studio.',
};

const drafts = [
  {
    title: 'Why we don’t mock data anymore',
    tag: 'Engineering',
    excerpt: 'The case for live Suspense + cached components over staged demos.',
  },
  {
    title: 'Eval is a feature',
    tag: 'AI',
    excerpt: 'Treat your eval suite like a product surface. Your users already do.',
  },
  {
    title: 'Code-native or bust',
    tag: 'Design',
    excerpt: 'How we ship marketing pages without a single piece of stock photography.',
  },
];

export default function InsightsPage() {
  return (
    <Section padding="xl" className="pt-32">
      <Container width="xl">
        <Stack gap="xl">
          <Stack gap="md" className="max-w-3xl">
            <Eyebrow>Insights</Eyebrow>
            <h1 className="font-display text-display-lg tracking-tight sm:text-display-xl">
              Field notes from a code-native studio.
            </h1>
            <p className="text-body-lg text-muted">
              An MDX-driven writing pipeline ships in Phase 6. Three drafts in the queue:
            </p>
          </Stack>
          <ul className="flex flex-col divide-y divide-border">
            {drafts.map((draft) => (
              <li
                key={draft.title}
                className="group flex flex-col gap-3 py-8 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:gap-8"
              >
                <Tag tone="accent" withDot size="sm" className="sm:w-32">
                  {draft.tag}
                </Tag>
                <div className="flex flex-1 flex-col gap-1">
                  <h2 className="font-display text-h1 tracking-tight transition-colors group-hover:text-accent">
                    {draft.title}
                  </h2>
                  <p className="text-body-sm text-muted">{draft.excerpt}</p>
                </div>
              </li>
            ))}
          </ul>
        </Stack>
      </Container>
    </Section>
  );
}
