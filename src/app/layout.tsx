import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Cursor } from '@/components/primitives/cursor';
import { LenisProvider } from '@/components/providers/lenis-provider';
import { SiteHeader } from '@/components/site-header';
import { GlobalPreloader } from '@/components/thrivaxis-loader';
import { cn } from '@/lib/cn';
import { fontVariables } from '@/lib/fonts';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — AI-powered software development & marketing`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name }],
  creator: site.name,
  publisher: site.legalName,
  icons: {
    icon: [
      { url: '/logo/AxisStar-X-color-1024.png', sizes: '1024x1024', type: 'image/png' },
      { url: '/logo/AxisStar-X-color.svg', type: 'image/svg+xml' },
    ],
    apple: { url: '/logo/AxisStar-X-color-1024.png', sizes: '1024x1024', type: 'image/png' },
    shortcut: '/logo/AxisStar-X-color-1024.png',
  },
  openGraph: {
    type: 'website',
    locale: site.locale,
    siteName: site.name,
    title: site.name,
    description: site.description,
    url: site.url,
  },
  twitter: {
    card: 'summary_large_image',
    creator: site.social.twitter,
    title: site.name,
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  alternates: { canonical: '/' },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0a0b0f' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0b0f' },
  ],
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: site.name,
  legalName: site.legalName,
  url: site.url,
  description: site.description,
  email: site.contact.email,
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'US',
  },
  sameAs: [`https://twitter.com/${site.social.twitter.replace('@', '')}`],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={cn(fontVariables, 'h-full antialiased')}>
      <body className="relative flex min-h-full flex-col bg-bg font-sans text-ink">
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: static, non-user-controlled JSON-LD
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <a
          href="#main"
          className="sr-only z-50 m-3 rounded-md bg-accent px-4 py-2 font-medium text-bg focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        <LenisProvider>
          <GlobalPreloader />
          <Cursor />
          <SiteHeader />
          <main id="main" className="flex flex-1 flex-col">
            {children}
          </main>
        </LenisProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
