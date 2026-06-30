import { Eyebrow } from '@/components/primitives';

export const metadata = {
  title: 'Terms of Service',
  description: 'Terms of service for using the Thrivaxis website and services.',
};

export default function TermsPage() {
  return (
    <article className="flex flex-col gap-8">
      <header className="flex flex-col gap-4">
        <Eyebrow>Compliance</Eyebrow>
        <h1 className="font-display text-display-md tracking-tight">Terms of Service</h1>
        <p className="text-muted">
          To be drafted in Phase 7. Will cover acceptable use, AI no-warranty, IP/training-data,
          indemnification, governing law, and arbitration clauses.
        </p>
      </header>
    </article>
  );
}
