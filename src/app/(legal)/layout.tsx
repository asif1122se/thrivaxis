import Link from 'next/link';
import { Container, Eyebrow } from '@/components/primitives';
import { site } from '@/lib/site';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <header className="border-border border-b">
        <Container width="md">
          <div className="flex items-center justify-between py-6">
            <Link href="/" className="font-display text-h3 tracking-tight">
              {site.name}
            </Link>
            <Eyebrow>Legal</Eyebrow>
          </div>
        </Container>
      </header>
      <Container width="md" className="prose-legal flex-1 py-16 sm:py-24">
        {children}
      </Container>
      <footer className="border-border border-t">
        <Container width="md">
          <nav
            aria-label="Legal pages"
            className="flex flex-wrap items-center gap-x-6 gap-y-3 py-6 text-caption text-muted"
          >
            <Link href="/privacy" className="hover:text-ink">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-ink">
              Terms
            </Link>
            <Link href="/cookies" className="hover:text-ink">
              Cookies
            </Link>
            <Link href="/accessibility" className="hover:text-ink">
              Accessibility
            </Link>
            <Link href="/do-not-sell" className="hover:text-ink">
              Do Not Sell or Share
            </Link>
          </nav>
        </Container>
      </footer>
    </div>
  );
}
