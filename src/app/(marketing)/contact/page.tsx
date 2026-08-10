import { ArrowUpRight } from 'iconoir-react';
import { AgenticTriage } from '@/components/marketing/agentic-triage';
import { KineticTypography } from '@/components/ui/kinetic-typography';
import { site } from '@/lib/site';

export const metadata = {
  title: 'Initialize Connection',
  description: 'Start a project with Thriveaxis.',
};

export default function ContactPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-bg pt-20 sm:pt-28 md:pt-32 pb-16 sm:pb-24 text-ink">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--color-accent-soft)_0%,transparent_50%)] opacity-20" />

      <div className="container relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:gap-16 lg:grid-cols-2 lg:items-center">
          <div className="flex flex-col gap-6 sm:gap-8">
            <KineticTypography
              as="h1"
              text="Initialize Connection."
              className="font-display text-3xl tracking-tighter sm:text-display-md lg:text-3xl xl:text-display-md max-w-full break-words"
            />
            <p className="max-w-md text-body sm:text-body-lg text-muted">
              We build intelligent systems that redefine operational boundaries. Let's map your
              bottlenecks and architect the solution.
            </p>
            <a
              href={`mailto:${site.contact.email}?subject=Project%20Initialization`}
              className="inline-flex h-14 sm:h-16 w-full sm:w-fit items-center justify-center gap-3 sm:gap-4 rounded-full bg-accent px-6 sm:px-8 font-medium text-bg text-base sm:text-lg transition-all duration-300 hover:scale-105 hover:bg-accent-strong hover:shadow-[0_0_60px_-10px_var(--color-accent-glow)]"
            >
              <span>Direct Intake Protocol</span>
              <ArrowUpRight className="size-5 sm:size-6" />
            </a>
          </div>

          <div className="flex flex-col items-stretch justify-center">
            <AgenticTriage />
          </div>
        </div>
      </div>
    </div>
  );
}
