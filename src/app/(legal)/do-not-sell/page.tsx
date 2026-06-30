import { Eyebrow } from '@/components/primitives';
import { site } from '@/lib/site';

export const metadata = {
  title: 'Do Not Sell or Share My Personal Information',
  description:
    'Submit a CCPA/CPRA opt-out request for the sale or sharing of personal information.',
};

export default function DoNotSellPage() {
  return (
    <article className="flex flex-col gap-8">
      <header className="flex flex-col gap-4">
        <Eyebrow>California consumer rights</Eyebrow>
        <h1 className="font-display text-display-md tracking-tight">
          Do Not Sell or Share My Personal Information
        </h1>
        <p className="max-w-prose text-muted">
          Under the California Consumer Privacy Act (CCPA) as amended by the CPRA, and analogous
          laws in Colorado, Connecticut, Texas, Oregon and other states, you have the right to opt
          out of the sale or sharing of your personal information.
        </p>
        <p className="max-w-prose text-muted">
          Submission form will be wired to our DSAR pipeline in Phase 7. Until then, email{' '}
          <a className="text-accent" href={`mailto:${site.contact.privacyEmail}`}>
            {site.contact.privacyEmail}
          </a>{' '}
          with the subject line <code>DSAR — Do Not Sell or Share</code> and include enough
          information for us to verify your identity.
        </p>
        <p className="text-caption text-muted">
          {site.name} also honors the Global Privacy Control (GPC) signal automatically.
        </p>
      </header>
    </article>
  );
}
