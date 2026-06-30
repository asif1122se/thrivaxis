'use client';

/**
 * ThrivAxis — Forged Axis logo
 * React TypeScript component.
 */
import React from 'react';

const STOPS = {
  light: [
    ['0', '#cdf6ff'],
    ['0.42', '#57ccff'],
    ['1', '#1c84e0'],
  ],
  dark: [
    ['0', '#2f78f0'],
    ['0.5', '#143f9e'],
    ['1', '#08245f'],
  ],
} as const;

const DARK_FACETS = [
  '12,12 50,50 40,50',
  '88,12 50,40 50,50',
  '88,88 60,50 50,50',
  '12,88 50,60 50,50',
] as const;

const LIGHT_FACETS = [
  '12,12 50,40 50,50',
  '88,12 60,50 50,50',
  '88,88 50,60 50,50',
  '12,88 40,50 50,50',
] as const;

const RIDGES = [
  [12, 12],
  [88, 12],
  [88, 88],
  [12, 88],
] as const;

const FULL_STAR = '12,12 50,40 88,12 60,50 88,88 50,60 12,88 40,50';

export interface ThrivAxisMarkProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  variant?: 'color' | 'white' | 'mono';
  glow?: boolean;
  title?: string;
}

/** The four-point forged star mark. */
export function ThrivAxisMark({
  size = 64,
  variant = 'color',
  glow = false,
  title = 'ThrivAxis',
  style,
  ...rest
}: ThrivAxisMarkProps) {
  const uid = React.useId().replace(/[:]/g, '');
  const lId = `txl-${uid}`;
  const dId = `txd-${uid}`;
  const flat = variant === 'white' ? '#ffffff' : variant === 'mono' ? '#1565c0' : null;

  const glowStyle = glow
    ? {
        filter:
          'drop-shadow(0 0 6px rgba(90,200,255,.45)) drop-shadow(0 0 16px rgba(45,130,255,.35))',
      }
    : undefined;

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      role="img"
      aria-label={title}
      style={{ display: 'block', overflow: 'visible', ...glowStyle, ...style }}
      {...rest}
    >
      <title>{title}</title>
      {flat ? (
        <polygon points={FULL_STAR} fill={flat} />
      ) : (
        <>
          <defs>
            <linearGradient id={lId} x1="0" y1="0" x2="0.25" y2="1">
              {STOPS.light.map(([o, c]) => (
                <stop key={o} offset={o} stopColor={c} />
              ))}
            </linearGradient>
            <linearGradient id={dId} x1="0" y1="0" x2="0.25" y2="1">
              {STOPS.dark.map(([o, c]) => (
                <stop key={o} offset={o} stopColor={c} />
              ))}
            </linearGradient>
          </defs>
          {DARK_FACETS.map((p) => (
            <polygon key={p} points={p} fill={`url(#${dId})`} />
          ))}
          {LIGHT_FACETS.map((p) => (
            <polygon key={p} points={p} fill={`url(#${lId})`} />
          ))}
          <g stroke="#eafdff" strokeWidth="0.7" strokeLinecap="round" opacity="0.5">
            {RIDGES.map(([x, y]) => (
              <line key={`${x}-${y}`} x1={x} y1={y} x2={50} y2={50} />
            ))}
          </g>
        </>
      )}
    </svg>
  );
}

export interface ThrivAxisLogoProps extends React.HTMLAttributes<HTMLSpanElement> {
  height?: number;
  variant?: 'color' | 'white' | 'mono';
  glow?: boolean;
  title?: string;
}

/** Full THRIVAXIS wordmark with the mark set as the "X". */
export function ThrivAxisLogo({
  height = 40,
  variant = 'color',
  glow = false,
  title = 'ThrivAxis',
  style,
  ...rest
}: ThrivAxisLogoProps) {
  const cap = height; // cap height ≈ font size for Saira Light
  const markSize = cap * 1.04;
  const textStyle: React.CSSProperties = {
    fontFamily: "'Saira', system-ui, -apple-system, Segoe UI, sans-serif",
    fontWeight: 300,
    fontSize: `${cap}px`,
    lineHeight: 1,
    letterSpacing: `${cap * 0.11}px`,
    whiteSpace: 'nowrap',
    ...(variant === 'white'
      ? { color: '#ffffff' }
      : variant === 'mono'
        ? { color: '#155bab' }
        : {
            background: 'linear-gradient(180deg,#e9f9ff,#93ddff 55%,#3aa7e0)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }),
  };
  // On a dark background the "color" wordmark reads better in the brighter ramp.
  if (variant === 'color') {
    textStyle.background = 'linear-gradient(180deg,#3f8be2,#155bab 60%,#0c3d8c)';
    textStyle.WebkitBackgroundClip = 'text';
    textStyle.backgroundClip = 'text';
    textStyle.color = 'transparent';
  }

  return (
    <span
      role="img"
      aria-label={title}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: `${cap * 0.05}px`,
        ...style,
      }}
      {...rest}
    >
      <span style={textStyle}>THRIVA</span>
      <ThrivAxisMark size={markSize} variant={variant} glow={glow} title={title} />
      <span style={textStyle}>IS</span>
    </span>
  );
}

// Export for backward compatibility with lowercase "i"
export { ThrivAxisLogo as ThrivaxisLogo };
export default ThrivAxisLogo;
