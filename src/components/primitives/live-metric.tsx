'use client';

import { animate, motion, useInView, useMotionValue, useTransform } from 'motion/react';
import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/cn';
import { duration as d, ease } from '@/lib/motion';
import { Sparkline } from './sparkline';

interface LiveMetricProps {
  label: string;
  value: number;
  delta?: number;
  unit?: string;
  prefix?: string;
  precision?: number;
  trend?: readonly number[];
  trendTone?: 'accent' | 'cool' | 'warm';
  className?: string;
}

/**
 * Animated counter with optional sparkline. Counts up on first scroll-into-view.
 * Respects reduced motion (renders the final number without animation).
 */
export function LiveMetric({
  label,
  value,
  delta,
  unit,
  prefix,
  precision = 0,
  trend,
  trendTone = 'accent',
  className,
}: LiveMetricProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: '-15%' });

  const motionValue = useMotionValue(reduced ? value : 0);
  const formatted = useTransform(motionValue, (latest) =>
    latest.toLocaleString('en-US', {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    }),
  );

  useEffect(() => {
    if (reduced) {
      motionValue.set(value);
      return;
    }
    if (!inView) return;
    const controls = animate(motionValue, value, {
      duration: d.cinema,
      ease: ease.outExpo,
    });
    return () => controls.stop();
  }, [inView, value, reduced, motionValue]);

  const deltaPositive = delta !== undefined && delta >= 0;

  return (
    <div ref={ref} className={cn('flex flex-col gap-2', className)}>
      <span className="font-mono text-label text-muted uppercase">{label}</span>
      <div className="flex items-baseline gap-2 tabular-nums">
        {prefix && <span className="font-display text-h2 text-muted">{prefix}</span>}
        <motion.span className="font-display text-display-sm tracking-tight">
          {formatted}
        </motion.span>
        {unit && <span className="font-display text-h3 text-muted">{unit}</span>}
      </div>
      <div className="flex items-center justify-between gap-3">
        {delta !== undefined && (
          <span
            className={cn(
              'inline-flex items-center gap-1 font-mono text-caption',
              deltaPositive ? 'text-accent' : 'text-rose',
            )}
          >
            <span aria-hidden="true">{deltaPositive ? '↑' : '↓'}</span>
            {Math.abs(delta).toFixed(precision)}
            {unit ?? ''}
          </span>
        )}
        {trend && <Sparkline data={trend} stroke={trendTone} width={140} height={28} />}
      </div>
    </div>
  );
}
