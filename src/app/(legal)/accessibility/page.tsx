import { Eyebrow } from '@/components/primitives';
import { site } from '@/lib/site';

export const metadata = {
  title: 'Accessibility Statement',
  description: `Accessibility commitments and conformance status for ${site.name}.`,
};

export default function AccessibilityPage() {
  return (
    <article className="flex flex-col gap-8">
      <header className="flex flex-col gap-4">
        <Eyebrow>Compliance</Eyebrow>
        <h1 className="font-display text-display-md tracking-tight">Accessibility Statement</h1>
        <p className="max-w-prose text-muted">
          {site.name} is committed to <strong>WCAG 2.2 Level AA</strong> conformance across the
          entire site. The site is built with semantic HTML, keyboard navigation, accessible color
          contrast, focus indicators, and a global respect for <code>prefers-reduced-motion</code>.
          The full statement — conformance level, contact address, last-tested date, known
          limitations, and remediation timeline — is finalized in Phase 7.
        </p>
        <p className="text-muted">
          Report a barrier:{' '}
          <a className="text-accent" href={`mailto:${site.contact.email}`}>
            {site.contact.email}
          </a>
        </p>
      </header>
    </article>
  );
}
