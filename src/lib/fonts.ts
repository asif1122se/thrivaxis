import { Geist, Geist_Mono, Space_Grotesk, Syncopate } from 'next/font/google';

export const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

export const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
  display: 'swap',
});

export const syncopate = Syncopate({
  variable: '--font-syncopate',
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
});

export const fontVariables = [
  geistSans.variable,
  geistMono.variable,
  spaceGrotesk.variable,
  syncopate.variable,
].join(' ');
