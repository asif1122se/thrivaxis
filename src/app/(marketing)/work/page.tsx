import Image from 'next/image';
import Link from 'next/link';
import { KineticTypography } from '@/components/ui/kinetic-typography';

export const metadata = {
  title: 'System Output',
  description: 'The products we have built.',
};

const concepts = [
  {
    slug: 'enterprise-analytics',
    industry: 'Enterprise',
    title: 'Nexus Data Core',
    tagline: 'Real-time predictive models built for high-scale environments.',
    image: '/mockups/mockup_dashboard_1779359048585.png',
  },
  {
    slug: 'conversational-ui',
    industry: 'Consumer Tech',
    title: 'Aura Concierge',
    tagline: 'An intuitive AI agent seamlessly integrated into mobile workflows.',
    image: '/mockups/mockup_mobile_1779359073731.png',
  },
  {
    slug: 'spatial-intelligence',
    industry: 'Data Science',
    title: 'Astra Visualization',
    tagline: 'Complex global data streams visualized in interactive 3D space.',
    image: '/mockups/mockup_dataviz_1779359098527.png',
  },
];

export default function WorkIndexPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-bg pt-32 pb-24 text-ink">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="mb-24 max-w-3xl">
          <KineticTypography
            as="h1"
            text="System Output."
            className="font-display text-display-lg tracking-tighter lg:text-display-2xl"
          />
          <p className="mt-6 text-body-lg text-muted">
            We don't build toys. We build scalable, intelligent architectures that solve complex
            business problems. Here is a sample of our recent deployments.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-1">
          {concepts.map((c, i) => (
            <Link
              key={c.slug}
              href={`/work/${c.slug}`}
              className={`group flex flex-col ${i % 2 !== 0 ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-8 rounded-3xl border border-border bg-surface-2 p-8 transition-all hover:border-accent/50 hover:bg-surface hover:shadow-[0_0_40px_var(--color-accent-soft)]`}
            >
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border lg:w-3/5">
                <Image
                  src={c.image}
                  alt={c.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="flex w-full flex-col gap-4 px-4 lg:w-2/5">
                <span className="font-bold text-accent text-sm uppercase tracking-widest">
                  {c.industry}
                </span>
                <h2 className="font-display text-display-sm tracking-tight">{c.title}</h2>
                <p className="text-body-lg text-muted">{c.tagline}</p>
                <div className="mt-4 flex -translate-x-4 items-center font-medium text-accent text-sm opacity-0 transition-opacity duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                  View Architecture →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
