// Draft for lawyer review. The "SMS and mobile information" section is required
// for US A2P 10DLC carrier approval. Twilio's reviewers look for its first
// sentence word for word ("We do not sell or share your SMS opt-in data...").
import Link from 'next/link';
import { LegalList, LegalSection } from '@/components/legal/legal-prose';
import { Eyebrow } from '@/components/primitives';
import { site } from '@/lib/site';

export const metadata = {
  title: 'Privacy Policy',
  description: `How ${site.name} collects, uses and protects your information, including SMS data.`,
};

const EFFECTIVE_DATE = 'November 16, 2026';

export default function PrivacyPage() {
  const privacyEmail = (
    <a className="text-accent" href={`mailto:${site.contact.privacyEmail}`}>
      {site.contact.privacyEmail}
    </a>
  );

  return (
    <article className="flex flex-col gap-10">
      <header className="flex flex-col gap-4">
        <Eyebrow>Compliance</Eyebrow>
        <h1 className="font-display text-display-md tracking-tight">Privacy Policy</h1>
        <p className="text-caption text-muted">Effective date: {EFFECTIVE_DATE}</p>
        <p className="max-w-prose text-muted">
          This Privacy Policy explains how Thrivaxis LLC (&ldquo;{site.name}&rdquo;,
          &ldquo;we&rdquo;, &ldquo;us&rdquo;) collects, uses and protects information when you visit{' '}
          thrivaxis.com, contact us, or receive text messages from us.
        </p>
      </header>

      <LegalSection title="Information we collect">
        <LegalList
          items={[
            <>
              <strong className="text-ink">Contact details</strong> you give us: name, email
              address, phone number, company name and the details of your request.
            </>,
            <>
              <strong className="text-ink">Phone and SMS data:</strong> when you call our business
              number, we receive your phone number and call status. If you text us, we receive your
              number and the content of your messages.
            </>,
            <>
              <strong className="text-ink">Website data:</strong> pages visited, browser type,
              device type and approximate location, collected through standard server logs and
              cookies.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection title="How we use information">
        <LegalList
          items={[
            'To answer your calls, texts and inquiries, and to arrange callbacks or appointments.',
            'To deliver the services you request from us.',
            'To send service-related text messages you asked for by contacting us.',
            'To operate, secure and improve our website and services.',
            'To meet legal and regulatory obligations.',
          ]}
        />
      </LegalSection>

      <LegalSection title="SMS and mobile information">
        <p>
          <strong className="text-ink">
            We do not sell or share your SMS opt-in data or personal information with third parties
            for marketing purposes.
          </strong>{' '}
          This applies to all text messages sent by Thrivaxis LLC.
        </p>
        <p>
          <strong className="text-ink">
            No mobile information will be shared with third parties or affiliates for marketing or
            promotional purposes.
          </strong>{' '}
          Text messaging originator opt-in data and consent will not be shared with any third
          parties, except service providers that deliver our messages (such as our SMS carrier
          platform) and only to provide that service.
        </p>
        <p>
          You can opt out of text messages at any time by replying{' '}
          <strong className="text-ink">STOP</strong>. Reply{' '}
          <strong className="text-ink">HELP</strong> for help. Message and data rates may apply. See
          our{' '}
          <Link className="text-accent" href="/terms#sms-program">
            Terms of Service
          </Link>{' '}
          for the full SMS program terms.
        </p>
      </LegalSection>

      <LegalSection title="How we share information">
        <p>We do not sell your personal information. We share it only with:</p>
        <LegalList
          items={[
            'Service providers who help us run our business, such as hosting, telephony and SMS delivery, email, scheduling and AI processing providers, under obligations to protect it.',
            'Authorities, when the law requires it or to protect our rights and the safety of others.',
            'A buyer or successor, if our business is merged or sold, subject to this policy.',
          ]}
        />
      </LegalSection>

      <LegalSection title="Data retention and security">
        <p>
          We keep information only as long as needed for the purposes above or as the law requires.
          We use reasonable technical and organizational safeguards, but no method of transmission
          or storage is completely secure.
        </p>
      </LegalSection>

      <LegalSection title="Your rights">
        <p>
          Depending on where you live (including California, Virginia, Colorado, Connecticut and
          other US states), you may have the right to access, correct, delete or obtain a copy of
          your personal information, and to opt out of certain processing. To make a request, email{' '}
          {privacyEmail}. We will not discriminate against you for exercising these rights.
        </p>
      </LegalSection>

      <LegalSection title="Children">
        <p>
          Our services are not directed to children under 13, and we do not knowingly collect their
          information.
        </p>
      </LegalSection>

      <LegalSection title="Changes to this policy">
        <p>We may update this policy. The effective date above shows when it last changed.</p>
      </LegalSection>

      <LegalSection title="Contact us">
        <address className="not-italic">
          Thrivaxis LLC
          <br />
          8401 Mayland Dr, Ste A, Richmond, VA 23294, USA
          <br />
          Email: {privacyEmail}
        </address>
      </LegalSection>
    </article>
  );
}
