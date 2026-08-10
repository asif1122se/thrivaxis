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
    <div className="relative min-h-screen overflow-hidden bg-bg pt-20 sm:pt-28 md:pt-32 pb-16 sm:pb-24 text-ink">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 sm:mb-24 max-w-3xl">
          <KineticTypography
            as="h1"
            text="System Output."
            className="font-display text-display-md tracking-tighter sm:text-display-lg lg:text-display-2xl"
          />
          <p className="mt-4 sm:mt-6 text-body sm:text-body-lg text-muted">
            We don't build toys. We build scalable, intelligent architectures that solve complex
            business problems. Here is a sample of our recent deployments.
          </p>
        </div>

        <div className="grid gap-8 sm:gap-12 lg:grid-cols-1">
          {concepts.map((c, i) => (
            <Link
              key={c.slug}
              href={`/work/${c.slug}`}
              className={`group flex flex-col ${i % 2 !== 0 ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-6 sm:gap-8 rounded-3xl border border-border bg-surface-2 p-5 sm:p-8 transition-all hover:border-accent/50 hover:bg-surface hover:shadow-[0_0_40px_var(--color-accent-soft)]`}
            >
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border lg:w-3/5">
                <Image
                  src={c.image}
                  alt={c.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="flex w-full flex-col gap-3 sm:gap-4 px-2 sm:px-4 lg:w-2/5">
                <span className="font-bold text-accent text-xs sm:text-sm uppercase tracking-widest">
                  {c.industry}
                </span>
                <h2 className="font-display text-h1 sm:text-display-sm tracking-tight">{c.title}</h2>
                <p className="text-body-sm sm:text-body-lg text-muted">{c.tagline}</p>
                <div className="mt-2 sm:mt-4 flex items-center font-medium text-accent text-sm opacity-100 translate-x-0 lg:opacity-0 lg:-translate-x-4 transition-all duration-300 lg:group-hover:translate-x-0 lg:group-hover:opacity-100">
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
