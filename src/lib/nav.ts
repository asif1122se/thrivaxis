export const primaryNav = [
  { label: 'Work', href: '/work' },
  { label: 'Services', href: '/services' },
  { label: 'About', href: '/about' },
  { label: 'Insights', href: '/insights' },
] as const;

export const footerNav: ReadonlyArray<{
  title: string;
  links: ReadonlyArray<{ label: string; href: string }>;
}> = [
  {
    title: 'Studio',
    links: [
      { label: 'Work', href: '/work' },
      { label: 'Services', href: '/services' },
      { label: 'About', href: '/about' },
      { label: 'Insights', href: '/insights' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Capabilities',
    links: [
      { label: 'AI engineering', href: '/services#engineering' },
      { label: 'AI marketing', href: '/services#marketing' },
      { label: 'Agents & workflows', href: '/services#agents' },
      { label: 'Eval & observability', href: '/services#eval' },
    ],
  },
  {
    title: 'Compliance',
    links: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
      { label: 'Cookies', href: '/cookies' },
      { label: 'Accessibility', href: '/accessibility' },
      { label: 'Do Not Sell or Share', href: '/do-not-sell' },
    ],
  },
];
