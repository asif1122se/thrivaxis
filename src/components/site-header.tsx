'use client';

import { ArrowUpRight, Menu, Xmark } from 'iconoir-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { primaryNav } from '@/lib/nav';
import { site } from '@/lib/site';

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    void pathname;
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 transition-[background-color,backdrop-filter,border-color] duration-300',
        scrolled
          ? 'border-border/80 border-b bg-bg/70 backdrop-blur-xl'
          : 'border-transparent border-b bg-transparent',
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-[88rem] items-center justify-between px-4 sm:px-8 lg:px-12">
        {/* Logo — uses static PNG lockup */}
        <Link href="/" aria-label={`${site.name} home`} className="flex items-center">
          <Image
            src="/logo/logo-dark.png"
            alt={site.name}
            width={160}
            height={60}
            className="h-9 sm:h-10 md:h-12 w-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:block" aria-label="Primary">
          <ul className="flex items-center gap-1">
            {primaryNav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'inline-flex h-9 items-center rounded-md px-3 text-body-sm transition-colors',
                      active ? 'text-ink' : 'text-muted hover:text-ink',
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/contact"
            className="inline-flex h-9 items-center rounded-md px-3 text-body-sm text-muted transition-colors hover:text-ink"
          >
            Contact
          </Link>
          <Link
            href="/contact"
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-accent px-4 font-medium text-bg text-body-sm transition-[background,box-shadow] duration-300 hover:bg-accent-strong hover:shadow-[0_0_60px_-10px_var(--color-accent-glow)]"
          >
            Start a project
            <ArrowUpRight className="size-4" />
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex size-10 items-center justify-center rounded-md ring-1 ring-border ring-inset transition-colors hover:ring-border-strong md:hidden"
        >
          {open ? <Xmark className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile menu — positioned absolutely so it overlay content without taking up flow height */}
      <div
        id="mobile-menu"
        aria-hidden={!open}
        className={cn(
          'absolute inset-x-0 top-full max-h-[calc(100dvh-4rem)] overflow-y-auto border-border border-b bg-bg/95 backdrop-blur-xl md:hidden',
          'transition-[opacity,transform,visibility] duration-200 ease-out',
          open
            ? 'pointer-events-auto visible translate-y-0 opacity-100'
            : 'pointer-events-none invisible -translate-y-2 opacity-0',
        )}
      >
        <nav aria-label="Primary mobile" className="px-6 py-6 sm:px-8">
          <ul className="flex flex-col gap-1">
            {primaryNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-md px-3 py-3 font-display text-h3 text-ink tracking-tight transition-colors hover:bg-surface"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/contact"
                className="block rounded-md px-3 py-3 font-display text-accent text-h3 tracking-tight transition-colors hover:bg-surface"
              >
                Start a project →
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
