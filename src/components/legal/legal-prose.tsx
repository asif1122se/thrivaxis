import { cn } from '@/lib/cn';

/** A titled block of legal copy. `id` makes the section linkable (e.g. /terms#sms-program). */
export function LegalSection({
  title,
  id,
  className,
  children,
}: {
  title: string;
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={cn('flex max-w-prose scroll-mt-24 flex-col gap-3', className)}>
      <h2 className="font-display text-h3 tracking-tight">{title}</h2>
      <div className="flex flex-col gap-3 text-muted">{children}</div>
    </section>
  );
}

/** Bulleted list for static legal copy. */
export function LegalList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="flex list-disc flex-col gap-1.5 pl-5">
      {items.map((item, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static legal copy, never reordered
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}
