import { cn } from '@/lib/cn';

interface SparklineProps {
  data: readonly number[];
  width?: number;
  height?: number;
  stroke?: 'accent' | 'cool' | 'warm' | 'muted';
  fill?: boolean;
  className?: string;
}

const strokeClass = {
  accent: 'stroke-accent',
  cool: 'stroke-cool',
  warm: 'stroke-warm',
  muted: 'stroke-muted',
} as const;

const fillClass = {
  accent: 'fill-accent/15',
  cool: 'fill-cool/15',
  warm: 'fill-warm/15',
  muted: 'fill-muted/10',
} as const;

/**
 * Tiny inline chart from a numeric series. SVG, no deps. Server-safe.
 */
export function Sparkline({
  data,
  width = 120,
  height = 32,
  stroke = 'accent',
  fill = true,
  className,
}: SparklineProps) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);

  const points = data.map((value, i) => {
    const x = i * stepX;
    const y = height - ((value - min) / range) * (height - 4) - 2;
    return [x, y] as const;
  });

  const linePath = points
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`)
    .join(' ');

  const areaPath = `${linePath} L${width.toFixed(2)},${height} L0,${height} Z`;

  return (
    <svg
      role="img"
      aria-label="Trend"
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      preserveAspectRatio="none"
      className={cn('overflow-visible', className)}
    >
      {fill && <path d={areaPath} className={fillClass[stroke]} />}
      <path
        d={linePath}
        fill="none"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={strokeClass[stroke]}
      />
    </svg>
  );
}
