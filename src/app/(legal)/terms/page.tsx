// Draft for lawyer review. The "SMS program terms" section is required for US
// A2P 10DLC carrier approval (program name, frequency, rates, STOP, HELP).
import Link from 'next/link';
import { LegalSection } from '@/components/legal/legal-prose';
import { Eyebrow } from '@/components/primitives';
import { site } from '@/lib/site';

export const metadata = {
  title: 'Terms of Service',
  description: `Terms for using the ${site.name} website and services, including SMS program terms.`,
};

const EFFECTIVE_DATE = 'November 16, 2026';

function Term({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <p>
      <strong className="text-ink">{label}:</strong> {children}
    </p>
  );
}

export default function TermsPage() {
  const supportEmail = (
    <a className="text-accent" href={`mailto:${site.contact.email}`}>
      {site.contact.email}
    </a>
  );

  return (
    <article className="flex flex-col gap-10">
      <header className="flex flex-col gap-4">
        <Eyebrow>Compliance</Eyebrow>
        <h1 className="font-display text-display-md tracking-tight">Terms of Service</h1>
        <p className="text-caption text-muted">Effective date: {EFFECTIVE_DATE}</p>
        <p className="max-w-prose text-muted">
          These Terms govern your use of thrivaxis.com and the services of Thrivaxis LLC (&ldquo;
          {site.name}&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;), a Virginia limited liability
          company. By using our website or services, you agree to these Terms.
        </p>
      </header>

      <LegalSection title="Our services">
        <p>
          {site.name} provides AI-powered software development, automation and marketing services.
          Specific projects are governed by a separate written agreement or statement of work, which
          controls if it conflicts with these Terms.
        </p>
      </LegalSection>

      <LegalSection title="SMS program terms" id="sms-program">
        <Term label="Program name">{site.name} Customer Care Text Messages.</Term>
        <Term label="Description">
          When you call a {site.name} business number and the call is not answered, we send a text
          message to the number you called from, offering help. We then reply to your messages about
          your request, service needs and appointment times.
        </Term>
        <Term label="How you opt in">
          By calling our business number, you request that we contact you back. A voice message on
          the missed call tells you a text message will follow. We text only the number that called
          us.
        </Term>
        <Term label="Message frequency">
          Varies based on your conversation with us, typically 1 to 5 messages per inquiry.
        </Term>
        <Term label="Cost">Message and data rates may apply.</Term>
        <Term label="Opt out">
          Reply <strong className="text-ink">STOP</strong>, UNSUBSCRIBE or CANCEL at any time. You
          will receive one confirmation message and no further texts unless you contact us again.
        </Term>
        <Term label="Help">
          Reply <strong className="text-ink">HELP</strong>, or email {supportEmail}.
        </Term>
        <Term label="Carriers">
          Mobile carriers are not liable for delayed or undelivered messages.
        </Term>
        <Term label="Privacy">
          See our{' '}
          <Link className="text-accent" href="/privacy">
            Privacy Policy
          </Link>
          . No mobile information will be shared with third parties or affiliates for marketing or
          promotional purposes.
        </Term>
      </LegalSection>

      <LegalSection title="Acceptable use">
        <p>
          You agree not to misuse our website or services, including by attempting unauthorized
          access, interfering with their operation, sending unlawful content, or using them to
          violate anyone&rsquo;s rights.
        </p>
      </LegalSection>

      <LegalSection title="Intellectual property">
        <p>
          The website, its content and our materials belong to {site.name} or its licensors.
          Ownership of project deliverables is set out in your project agreement.
        </p>
      </LegalSection>

      <LegalSection title="AI-generated content">
        <p>
          Some of our services use artificial intelligence. AI output can contain errors, and you
          are responsible for reviewing it before relying on it.
        </p>
      </LegalSection>

      <LegalSection title="Disclaimers">
        <p>
          The website and services are provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;,
          without warranties of any kind, to the extent the law allows.
        </p>
      </LegalSection>

      <LegalSection title="Limitation of liability">
        <p>
          To the extent the law allows, {site.name} is not liable for indirect, incidental, special
          or consequential damages. Our total liability for any claim is limited to the amount you
          paid us in the 12 months before the claim.
        </p>
      </LegalSection>

      <LegalSection title="Governing law">
        <p>
          These Terms are governed by the laws of the Commonwealth of Virginia, without regard to
          conflict-of-law rules. Disputes will be resolved in the state or federal courts located in
          Virginia.
        </p>
      </LegalSection>

      <LegalSection title="Changes">
        <p>We may update these Terms. The effective date above shows when they last changed.</p>
      </LegalSection>

      <LegalSection title="Contact us">
        <address className="not-italic">
          Thrivaxis LLC
          <br />
          8401 Mayland Dr, Ste A, Richmond, VA 23294, USA
          <br />
          Email: {supportEmail}
        </address>
      </LegalSection>
    </article>
  );
}
