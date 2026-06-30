import { ArrowUpRight } from 'iconoir-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Sparkline } from './sparkline';
import { Tag } from './tag';

interface WorkPreviewCardProps {
  href: string;
  industry: string;
  title: string;
  outcome: string;
  metric: {
    label: string;
    value: string;
    trend: readonly number[];
    tone?: 'accent' | 'cool' | 'warm';
  };
  preview: ReactNode;
  className?: string;
}

/**
 * Linked case-study tile. The `preview` slot is meant for a BrowserFrame
 * containing a self-designed UI mockup (no photos). On hover the whole tile
 * lifts subtly and an arrow chip appears.
 */
export function WorkPreviewCard({
  href,
  industry,
  title,
  outcome,
  metric,
  preview,
  className,
}: WorkPreviewCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        'group relative flex flex-col gap-5 overflow-hidden rounded-lg bg-surface p-5 ring-1 ring-border ring-inset',
        'transition-[background,box-shadow,transform] duration-500 ease-out-expo',
        'hover:-translate-y-1 hover:bg-surface-2 hover:shadow-glow hover:ring-border-strong',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <Tag tone="accent" withDot size="sm">
          {industry}
        </Tag>
        <span
          aria-hidden="true"
          className="inline-flex size-9 items-center justify-center rounded-full bg-surface-3 text-muted ring-1 ring-border ring-inset transition-[background,color] duration-300 group-hover:bg-accent group-hover:text-bg"
        >
          <ArrowUpRight className="size-4" />
        </span>
      </div>
      <div className="overflow-hidden rounded-md">{preview}</div>
      <div className="flex flex-col gap-3">
        <h3 className="font-display text-h2 tracking-tight">{title}</h3>
        <p className="text-body-sm text-muted">{outcome}</p>
      </div>
      <div className="mt-auto flex items-end justify-between border-border border-t pt-4">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-label text-muted uppercase">{metric.label}</span>
          <span className="font-display text-h2 tabular-nums tracking-tight">{metric.value}</span>
        </div>
        <Sparkline data={metric.trend} stroke={metric.tone ?? 'accent'} width={120} height={32} />
      </div>
    </Link>
  );
}
