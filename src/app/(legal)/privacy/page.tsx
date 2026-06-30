import { Eyebrow } from '@/components/primitives';
import { site } from '@/lib/site';

export const metadata = {
  title: 'Privacy Policy',
  description: `Privacy policy for ${site.name}.`,
};

export default function PrivacyPage() {
  return (
    <article className="flex flex-col gap-8">
      <header className="flex flex-col gap-4">
        <Eyebrow>Compliance</Eyebrow>
        <h1 className="font-display text-display-md tracking-tight">Privacy Policy</h1>
        <p className="text-muted">
          To be drafted in Phase 7. Will cover CCPA/CPRA, VCDPA, CPA, CTDPA, UCPA, TDPSA, and
          state-by-state rights notices, alongside GDPR and PIPEDA stances. Reach out to{' '}
          <a className="text-accent" href={`mailto:${site.contact.privacyEmail}`}>
            {site.contact.privacyEmail}
          </a>{' '}
          with any privacy inquiry.
        </p>
      </header>
    </article>
  );
}
