import { ArrowUpRight } from 'iconoir-react';
import Link from 'next/link';
import { Container, Eyebrow } from '@/components/primitives';
import { footerNav } from '@/lib/nav';
import { site } from '@/lib/site';

export function SiteFooter() {
  return (
    <footer className="relative border-border border-t bg-bg">
      <Container width="xl" className="py-16 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="flex flex-col gap-8 lg:col-span-5">
            <div className="flex flex-col gap-4">
              <Eyebrow>Get in touch</Eyebrow>
              <p className="font-display text-display-sm leading-[1.05] tracking-tight">
                Have a project in mind?{' '}
                <span className="font-serif text-accent italic">Let&rsquo;s build it.</span>
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex h-12 w-fit items-center gap-2 rounded-md bg-accent px-5 font-medium text-bg text-body transition-[background,box-shadow] duration-300 hover:bg-accent-strong hover:shadow-[0_0_60px_-10px_var(--color-accent-glow)]"
            >
              Start a project
              <ArrowUpRight className="size-5" />
            </Link>
            <a
              href={`mailto:${site.contact.email}`}
              className="font-mono text-caption text-muted transition-colors hover:text-ink"
            >
              {site.contact.email}
            </a>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
            {footerNav.map((column) => (
              <div key={column.title} className="flex flex-col gap-4">
                <h3 className="font-mono text-label text-muted uppercase">{column.title}</h3>
                <ul className="flex flex-col gap-2">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-body-sm text-ink/85 transition-colors hover:text-accent"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </Container>

      <div className="border-border border-t">
        <Container width="xl">
          <div className="flex flex-col items-start justify-between gap-3 py-6 text-caption text-muted sm:flex-row sm:items-center">
            <span>
              © {site.copyrightYear} {site.legalName} · USA
            </span>
            <span className="font-mono">Built in code · No photography · No video</span>
          </div>
        </Container>
      </div>
    </footer>
  );
}
