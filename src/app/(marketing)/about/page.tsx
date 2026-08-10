import {
  Container,
  Eyebrow,
  ProceduralAvatar,
  Quote,
  Section,
  Stack,
} from '@/components/primitives';

export const metadata = {
  title: 'About',
  description: 'A studio of engineers, designers, and operators building AI-native software.',
};

const team = [
  { name: 'Avery Lin', role: 'Founding partner · AI engineering' },
  { name: 'Marco Tate', role: 'Founding partner · Marketing' },
  { name: 'Priya Joshi', role: 'Design lead' },
  { name: 'Diego Sousa', role: 'Engineering lead' },
  { name: 'Ren Walker', role: 'Eval & telemetry' },
  { name: 'Naima Cole', role: 'Brand & content' },
];

export default function AboutPage() {
  return (
    <Section padding="xl" className="pt-20 sm:pt-28 md:pt-32">
      <Container width="xl">
        <Stack gap="xl">
          <Stack gap="md" className="max-w-3xl">
            <Eyebrow>About</Eyebrow>
            <h1 className="font-display text-display-md tracking-tight sm:text-display-lg lg:text-display-xl">
              A studio of <span className="font-serif text-accent italic">engineers</span>,
              designers, and operators.
            </h1>
            <p className="text-body sm:text-body-lg text-muted">
              Phase 6 will fill this in with a founder letter, values as kinetic type, and a deeper
              team page. For now, the lineup:
            </p>
          </Stack>
          <Quote attribution="Founding partner · Thrivaxis">
            We hire engineers who care about what the user feels at second 30, not second 3.
          </Quote>
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((member) => (
              <div
                key={member.name}
                className="flex items-center gap-3 sm:gap-4 rounded-lg bg-surface p-4 sm:p-5 ring-1 ring-border ring-inset"
              >
                <ProceduralAvatar name={member.name} size="lg" />
                <Stack gap="xs">
                  <span className="font-display text-h3 tracking-tight">{member.name}</span>
                  <span className="font-mono text-caption text-muted">{member.role}</span>
                </Stack>
              </div>
            ))}
          </div>
        </Stack>
      </Container>
    </Section>
  );
}
