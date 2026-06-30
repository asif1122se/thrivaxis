'use client';

/**
 * ThrivAxisLoader — animated "arrows open & reveal wordmark" loader
 * TypeScript React component.
 *
 * The forged X splits into two arrow halves that open outward (left & right) to
 * reveal the THRIVAXIS wordmark in the centre.
 *
 * loop=true  → opens, reveals, closes, repeats (page/route spinner).
 * loop=false → opens, reveals, and HOLDS in the revealed state; fires onDone
 *              at the end so a wrapper can fade the whole overlay out.
 *              (This is the fix: a one-shot run no longer snaps the X closed
 *              on its final frame.)
 */
import React, { useEffect } from 'react';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

const DARK_FACETS_L = ['12,12 50,50 40,50', '12,88 50,60 50,50'];
const LIGHT_FACETS_L = ['12,12 50,40 50,50', '12,88 40,50 50,50'];
const RIDGES_L = [
  [12, 12],
  [12, 88],
];

const DARK_FACETS_R = ['88,12 50,40 50,50', '88,88 60,50 50,50'];
const LIGHT_FACETS_R = ['88,12 60,50 50,50', '88,88 50,60 50,50'];
const RIDGES_R = [
  [88, 12],
  [88, 88],
];

const FULL_DARK = [
  '12,12 50,50 40,50',
  '88,12 50,40 50,50',
  '88,88 60,50 50,50',
  '12,88 50,60 50,50',
];
const FULL_LIGHT = [
  '12,12 50,40 50,50',
  '88,12 60,50 50,50',
  '88,88 50,60 50,50',
  '12,88 40,50 50,50',
];
const FULL_RIDGES = [
  [12, 12],
  [88, 12],
  [88, 88],
  [12, 88],
];

interface GradsProps {
  lId: string;
  dId: string;
}

function Grads({ lId, dId }: GradsProps) {
  return (
    <defs>
      <linearGradient id={lId} x1="0" y1="0" x2="0.25" y2="1">
        <stop offset="0" stopColor="#cdf6ff" />
        <stop offset="0.42" stopColor="#57ccff" />
        <stop offset="1" stopColor="#1c84e0" />
      </linearGradient>
      <linearGradient id={dId} x1="0" y1="0" x2="0.25" y2="1">
        <stop offset="0" stopColor="#2f78f0" />
        <stop offset="0.5" stopColor="#143f9e" />
        <stop offset="1" stopColor="#08245f" />
      </linearGradient>
    </defs>
  );
}

interface HalfProps {
  side: 'L' | 'R';
  lId: string;
  dId: string;
}

function Half({ side, lId, dId }: HalfProps) {
  const dark = side === 'L' ? DARK_FACETS_L : DARK_FACETS_R;
  const light = side === 'L' ? LIGHT_FACETS_L : LIGHT_FACETS_R;
  const ridges = side === 'L' ? RIDGES_L : RIDGES_R;
  return (
    <g>
      {dark.map((p) => (
        <polygon key={p} points={p} fill={`url(#${dId})`} />
      ))}
      {light.map((p) => (
        <polygon key={p} points={p} fill={`url(#${lId})`} />
      ))}
      <g stroke="#eafdff" strokeWidth="0.7" strokeLinecap="round" opacity="0.5">
        {ridges.map(([x, y]) => (
          <line key={`${x}-${y}`} x1={x} y1={y} x2="50" y2="50" />
        ))}
      </g>
    </g>
  );
}

interface FullStarProps {
  lId: string;
  dId: string;
  size: number;
}

function FullStar({ lId, dId, size }: FullStarProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      style={{ display: 'block', overflow: 'visible' }}
      aria-hidden="true"
    >
      <Grads lId={lId} dId={dId} />
      {FULL_DARK.map((p) => (
        <polygon key={p} points={p} fill={`url(#${dId})`} />
      ))}
      {FULL_LIGHT.map((p) => (
        <polygon key={p} points={p} fill={`url(#${lId})`} />
      ))}
      <g stroke="#eafdff" strokeWidth="0.7" strokeLinecap="round" opacity="0.5">
        {FULL_RIDGES.map(([x, y]) => (
          <line key={`${x}-${y}`} x1={x} y1={y} x2="50" y2="50" />
        ))}
      </g>
    </svg>
  );
}

export interface ThrivAxisLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Seconds for one full cycle. Lower = faster. */
  speed?: number;
  /** px size of each arrow blade. */
  size?: number;
  /** px each half travels outward. */
  openDistance?: number;
  /** pulsing glow on the blades. */
  glow?: boolean;
  /** 'fade' = word fades in whole | 'type' = letters type in from the centre. */
  reveal?: 'fade' | 'type';
  /** cover the viewport with a fixed overlay. */
  fullscreen?: boolean;
  background?: string;
  /** true = loop forever | false = play once and hold revealed, then call onDone. */
  loop?: boolean;
  onDone?: () => void;
  wordmarkFontSize?: number;
  label?: string;
}

export function ThrivAxisLoader({
  speed = 4.4,
  size = 150,
  openDistance = 300,
  glow = true,
  reveal = 'fade',
  fullscreen = true,
  background = 'radial-gradient(circle at center, #163f66 0%, #091f35 60%, #030a12 100%)',
  loop = true,
  onDone,
  wordmarkFontSize,
  label = 'Loading',
  style,
  ...rest
}: ThrivAxisLoaderProps) {
  const uid = React.useId().replace(/[:]/g, '');
  const lId = `txl-${uid}`;
  const dId = `txd-${uid}`;
  const iter = loop ? 'infinite' : 1;
  const fill = loop ? 'none' : 'forwards';
  const wf = wordmarkFontSize ?? Math.round(size * 0.35);
  const typing = reveal === 'type';
  const once = !loop;

  const CELLS = ['T', 'H', 'R', 'I', 'V', 'A', '\u2605', 'I', 'S'];
  const NC = CELLS.length;
  const cellKeyframes = typing
    ? CELLS.map((ch, i) => {
        const mw = ch === '\u2605' ? '1.8em' : '1.1em';
        const mg = ch === '\u2605' ? `0 ${Math.round(wf * 0.08)}px` : '0';
        if (once) {
          // play once: type in after the arrows open, then HOLD to the end
          const s = 60 + i * (26 / NC);
          return `@keyframes txC${i}-${uid}{0%,${s.toFixed(1)}%{max-width:0;opacity:0;margin:0}${(s + 0.1).toFixed(1)}%,100%{max-width:${mw};opacity:1;margin:${mg}}}`;
        }
        // looping: type in, hold, then clear before the arrows close
        const s = 44 + i * (20 / NC);
        return `@keyframes txC${i}-${uid}{0%,${s.toFixed(1)}%{max-width:0;opacity:0;margin:0}${(s + 0.1).toFixed(1)}%,70%{max-width:${mw};opacity:1;margin:${mg}}74%,100%{max-width:0;opacity:0;margin:0}}`;
      }).join('\n')
    : '';
  const cellClasses = typing
    ? CELLS.map(
        (_, i) =>
          `.txC${i}-${uid}{display:inline-flex;align-items:center;vertical-align:middle;overflow:hidden;white-space:nowrap;animation:txC${i}-${uid} ${speed}s linear ${iter} ${fill}}`,
      ).join('\n')
    : '';

  useEffect(() => {
    if (loop || !onDone) return;
    const t = setTimeout(onDone, speed * 1000);
    return () => clearTimeout(t);
  }, [loop, onDone, speed]);

  const openL = once
    ? `0%,16%{transform:translateX(0)}58%,100%{transform:translateX(-${openDistance}px)}`
    : `0%,20%{transform:translateX(0)}46%,72%{transform:translateX(-${openDistance}px)}96%,100%{transform:translateX(0)}`;
  const openR = once
    ? `0%,16%{transform:translateX(0)}58%,100%{transform:translateX(${openDistance}px)}`
    : `0%,20%{transform:translateX(0)}46%,72%{transform:translateX(${openDistance}px)}96%,100%{transform:translateX(0)}`;
  const wordKf = once
    ? `0%,44%{opacity:0;transform:translate(-50%,-50%) scale(.94);filter:blur(3px)}64%,100%{opacity:1;transform:translate(-50%,-50%) scale(1);filter:blur(0)}`
    : `0%,24%{opacity:0;transform:translate(-50%,-50%) scale(.94);filter:blur(3px)}48%,70%{opacity:1;transform:translate(-50%,-50%) scale(1);filter:blur(0)}92%,100%{opacity:0;transform:translate(-50%,-50%) scale(.94);filter:blur(3px)}`;
  const typeFadeKf = once
    ? `0%,54%{opacity:0}60%,100%{opacity:1}`
    : `0%,40%{opacity:0}44%,70%{opacity:1}74%,100%{opacity:0}`;

  const css = `
@keyframes txOpenL-${uid}{${openL}}
@keyframes txOpenR-${uid}{${openR}}
@keyframes txWord-${uid}{${wordKf}}
@keyframes txGlow-${uid}{0%,100%{filter:drop-shadow(0 0 6px rgba(90,200,255,.45))}50%{filter:drop-shadow(0 0 16px rgba(110,215,255,.95)) drop-shadow(0 0 34px rgba(45,130,255,.6))}}
.txMvL-${uid}{animation:txOpenL-${uid} ${speed}s cubic-bezier(.7,0,.2,1) ${iter} ${fill}}
.txMvR-${uid}{animation:txOpenR-${uid} ${speed}s cubic-bezier(.7,0,.2,1) ${iter} ${fill}}
.txWord-${uid}{animation:txWord-${uid} ${speed}s ease-in-out ${iter} ${fill}}
.txBlade-${uid}{filter:drop-shadow(0 0 7px rgba(90,200,255,.45))}
${glow ? `.txBladeGlow-${uid}{animation:txGlow-${uid} ${(speed / 2.2).toFixed(3)}s ease-in-out infinite}` : ''}
@keyframes txFade-${uid}{${typeFadeKf}}
.txType-${uid}{animation:txFade-${uid} ${speed}s ease ${iter} ${fill}}
${cellKeyframes}
${cellClasses}
@media (prefers-reduced-motion: reduce){.txMvL-${uid},.txMvR-${uid},.txWord-${uid},.txBladeGlow-${uid},.txType-${uid},[class*="txC"]{animation:none!important}.txWord-${uid},.txType-${uid}{opacity:1}[class*="txC"]{max-width:none!important;opacity:1!important}}
`;

  const container: React.CSSProperties = {
    position: fullscreen ? 'fixed' : 'relative',
    inset: fullscreen ? 0 : undefined,
    width: '100%',
    height: fullscreen ? '100%' : Math.round(size * 2),
    minHeight: fullscreen ? '100vh' : undefined,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    background,
    zIndex: fullscreen ? 9999 : undefined,
    ...style,
  };

  const halfStyle: React.CSSProperties = {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%,-50%)',
  };
  const bladeCls = `txBlade-${uid}${glow ? ` txBladeGlow-${uid}` : ''}`;

  const wordStyle: React.CSSProperties = {
    fontFamily: "'Saira', system-ui, -apple-system, Segoe UI, sans-serif",
    fontWeight: 300,
    fontSize: `${wf}px`,
    letterSpacing: `${wf * 0.12}px`,
    lineHeight: 1,
    background: 'linear-gradient(180deg,#e9f9ff,#93ddff 55%,#3aa7e0)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
  };

  return (
    <div role="status" aria-label={label} style={container} {...rest}>
      <style>{css}</style>

      {/* centre wordmark, revealed between the arrows */}
      {typing ? (
        <div
          className={`txType-${uid}`}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%,-50%)',
            display: 'inline-flex',
            alignItems: 'center',
            whiteSpace: 'nowrap',
            lineHeight: 1,
            opacity: 0,
          }}
        >
          {CELLS.map((ch, i) =>
            ch === '\u2605' ? (
              <span
                key={ch + i.toString()}
                className={`txC${i}-${uid}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: `${wf}px`,
                  height: `${wf}px`,
                }}
              >
                <FullStar lId={`${lId}w`} dId={`${dId}w`} size={wf * 1.04} />
              </span>
            ) : (
              <span key={ch + i.toString()} className={`txC${i}-${uid}`} style={{ ...wordStyle }}>
                {ch}
              </span>
            ),
          )}
        </div>
      ) : (
        <div
          className={`txWord-${uid}`}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%,-50%)',
            display: 'flex',
            alignItems: 'center',
            whiteSpace: 'nowrap',
            opacity: 0,
          }}
        >
          <span style={wordStyle}>THRIVA</span>
          <span style={{ margin: `0 ${wf * 0.08}px`, display: 'inline-flex' }}>
            <FullStar lId={`${lId}w`} dId={`${dId}w`} size={wf * 1.04} />
          </span>
          <span style={wordStyle}>IS</span>
        </div>
      )}

      {/* left arrow half */}
      <div style={halfStyle}>
        <svg
          className={`txMvL-${uid}`}
          viewBox="0 0 100 100"
          width={size}
          height={size}
          style={{ display: 'block', overflow: 'visible' }}
        >
          <Grads lId={`${lId}L`} dId={`${dId}L`} />
          <g className={bladeCls}>
            <Half side="L" lId={`${lId}L`} dId={`${dId}L`} />
          </g>
        </svg>
      </div>

      {/* right arrow half */}
      <div style={halfStyle}>
        <svg
          className={`txMvR-${uid}`}
          viewBox="0 0 100 100"
          width={size}
          height={size}
          style={{ display: 'block', overflow: 'visible' }}
        >
          <Grads lId={`${lId}R`} dId={`${dId}R`} />
          <g className={bladeCls}>
            <Half side="R" lId={`${lId}R`} dId={`${dId}R`} />
          </g>
        </svg>
      </div>

      <span
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          overflow: 'hidden',
          clip: 'rect(0 0 0 0)',
        }}
      >
        {label}…
      </span>
    </div>
  );
}

/**
 * GlobalPreloader — fullscreen preloader overlay.
 * Locks scroll, runs the one-shot reveal, holds revealed, then fades out and unmounts.
 */
export function GlobalPreloader() {
  const reduced = useReducedMotion();
  const [isMounted, setIsMounted] = React.useState(true);
  const [isFadingOut, setIsFadingOut] = React.useState(false);

  useEffect(() => {
    if (reduced) {
      setIsMounted(false);
      document.body.style.overflow = '';
      return;
    }
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [reduced]);

  if (!isMounted) return null;

  const handleDone = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      document.body.style.overflow = '';
      setIsMounted(false);
    }, 500);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        transition: 'opacity 0.5s cubic-bezier(0.7, 0, 0.3, 1)',
        opacity: isFadingOut ? 0 : 1,
        pointerEvents: isFadingOut ? 'none' : 'auto',
      }}
    >
      <ThrivAxisLoader loop={false} speed={2.2} reveal="type" onDone={handleDone} />
    </div>
  );
}

export default ThrivAxisLoader;
