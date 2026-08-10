import { Container, Eyebrow, Section, Stack, Tag } from '@/components/primitives';

export const metadata = {
  title: 'Capabilities',
  description: 'AI engineering, AI marketing, and the systems that make them ship.',
};

const capabilities = [
  {
    id: 'engineering',
    title: 'AI engineering',
    items: ['Agents & workflows', 'Retrieval & RAG', 'Fine-tuning', 'GenUI', 'MLOps & deployment'],
  },
  {
    id: 'marketing',
    title: 'AI marketing',
    items: [
      'Performance media',
      'Creative & copy',
      'SEO & content',
      'Lifecycle & CRM',
      'Brand systems',
    ],
  },
  {
    id: 'agents',
    title: 'Agents & workflows',
    items: [
      'Customer support',
      'Internal ops',
      'Knowledge agents',
      'Document processing',
      'Browser & tool use',
    ],
  },
  {
    id: 'eval',
    title: 'Eval & observability',
    items: [
      'Eval pipelines',
      'Telemetry (OTel)',
      'Production guards',
      'Prompt management',
      'A/B testing',
    ],
  },
];

export default function ServicesPage() {
  return (
    <Section padding="xl" className="pt-20 sm:pt-28 md:pt-32">
      <Container width="xl">
        <Stack gap="xl">
          <Stack gap="md" className="max-w-3xl">
            <Eyebrow>Capabilities</Eyebrow>
            <h1 className="font-display text-display-md tracking-tight sm:text-display-lg lg:text-display-xl">
              Build with us across <span className="font-serif text-accent italic">software</span>{' '}
              and <span className="font-serif text-accent italic">marketing</span>.
            </h1>
            <p className="text-body sm:text-body-lg text-muted">
              The full services pages — interactive capability diagrams and live mock dashboards —
              ship in Phase 5.
            </p>
          </Stack>
          <div className="grid gap-6 sm:grid-cols-2">
            {capabilities.map((cap) => (
              <div
                key={cap.id}
                id={cap.id}
                className="flex flex-col gap-4 rounded-lg bg-surface p-5 sm:p-6 ring-1 ring-border ring-inset"
              >
                <h2 className="font-display text-h2 sm:text-h1 tracking-tight">{cap.title}</h2>
                <Stack direction="row" gap="sm" wrap>
                  {cap.items.map((item) => (
                    <Tag key={item} size="md">
                      {item}
                    </Tag>
                  ))}
                </Stack>
              </div>
            ))}
          </div>
        </Stack>
      </Container>
    </Section>
  );
}
