import { Eyebrow } from '@/components/primitives';

export const metadata = {
  title: 'Cookie Policy',
  description: 'Information about cookies and tracking technologies used on Thrivaxis.',
};

export default function CookiesPage() {
  return (
    <article className="flex flex-col gap-8">
      <header className="flex flex-col gap-4">
        <Eyebrow>Compliance</Eyebrow>
        <h1 className="font-display text-display-md tracking-tight">Cookie Policy</h1>
        <p className="text-muted">
          To be drafted in Phase 7. Will list every cookie, purpose, vendor, and duration, alongside
          the consent banner behavior (GPC honoring, IAB GPP signal, opt-in for EU visitors).
        </p>
      </header>
    </article>
  );
}
