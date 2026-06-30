'use client';

/**
 * LogoMark — animated inline SVG of the Thrivaxis AxisStar-X.
 *
 * Two animation layers:
 *  1. Persistent idle: a radial "light sweep" that orbits the center diamond,
 *     simulating a point source rotating around the X blades.
 *  2. Scroll-driven: when `isOpen` is true the four blade tips spread outward
 *     and the whole mark scales up slightly — an "open" state that snaps back
 *     as the user scrolls further. Powered by Framer Motion.
 *
 * Reduced-motion: all Framer Motion transitions are skipped; the CSS shimmer
 * keyframe is also paused via the global `prefers-reduced-motion` guard in
 * globals.css.
 */

import { motion, useReducedMotion } from 'motion/react';
import { type SVGProps, useId } from 'react';
import { duration } from '@/lib/motion';

export interface LogoMarkProps extends SVGProps<SVGSVGElement> {
  /** When true the blades animate to their open/spread state */
  isOpen?: boolean;
  /** Size in px — applied to both width and height */
  size?: number;
}

// ---------------------------------------------------------------------------
// Blade geometry
// The X is made of four kite-shaped blades meeting at centre (50, 50).
// Each blade is defined as a path so we can animate the tip independently
// via Motion.
//
// Original polygon: 12,12 50,40 88,12 60,50 88,88 50,60 12,88 40,50
//   → decomposed into 4 triangular blades:
//     top    : [50,40]  tip → (50, 12-ish)  → spread → (50, 4)
//     right  : [60,50]  tip → (88, 50)      → spread → (96, 50)
//     bottom : [50,60]  tip → (50, 88-ish)  → spread → (50, 96)
//     left   : [40,50]  tip → (12, 50-ish)  → spread → (4, 50)
// ---------------------------------------------------------------------------

const BLADES = [
  // top blade
  {
    key: 'top',
    idle: 'M50,40 L88,12 L60,50 L50,42 L40,50 L12,12 Z',
    open: 'M50,28 L88,4  L62,44 L50,36 L38,44 L12,4 Z',
  },
  // right blade
  {
    key: 'right',
    idle: 'M60,50 L88,12 L88,88 L58,60 L58,40 Z',
    open: 'M68,50 L96,12 L96,88 L66,62 L66,38 Z',
  },
  // bottom blade
  {
    key: 'bottom',
    idle: 'M50,60 L88,88 L12,88 L40,50 L50,58 L60,50 Z',
    open: 'M50,72 L88,96 L12,96 L38,56 L50,64 L62,56 Z',
  },
  // left blade
  {
    key: 'left',
    idle: 'M40,50 L12,88 L12,12 L42,40 L42,60 Z',
    open: 'M32,50 L4,88  L4,12  L34,38 L34,62 Z',
  },
] as const;

// Framer Motion spring for the blade morph
const BLADE_SPRING = {
  type: 'spring' as const,
  stiffness: 200,
  damping: 22,
  mass: 0.6,
};

// ---------------------------------------------------------------------------

export function LogoMark({ isOpen = false, size = 32, className, ...rest }: LogoMarkProps) {
  const id = useId();
  const reduced = useReducedMotion();

  const gradId = `${id}-grad`;
  const glowId = `${id}-glow`;
  const shimId = `${id}-shim`;
  const clipId = `${id}-clip`;

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      aria-hidden="true"
      className={className}
      // Subtle scale-up when open
      animate={
        reduced
          ? {}
          : {
              scale: isOpen ? 1.08 : 1,
              rotate: isOpen ? 22.5 : 0,
            }
      }
      transition={{
        scale: { ...BLADE_SPRING },
        rotate: {
          type: 'spring',
          stiffness: 120,
          damping: 18,
          mass: 0.8,
        },
      }}
      {...(rest as object)}
    >
      <defs>
        {/* Main blade gradient — cyan → cobalt → navy (matches brand PNG) */}
        <linearGradient id={gradId} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#45c8f5" />
          <stop offset="0.55" stopColor="#1f7fe6" />
          <stop offset="1" stopColor="#0b3fb0" />
        </linearGradient>

        {/* Radial glow behind the whole mark */}
        <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#45c8f5" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#1f7fe6" stopOpacity="0" />
        </radialGradient>

        {/* Shimmer sweep — a thin diagonal highlight stripe */}
        <linearGradient id={shimId} x1="-1" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="45%" stopColor="white" stopOpacity="0" />
          <stop offset="50%" stopColor="white" stopOpacity="0.55" />
          <stop offset="55%" stopColor="white" stopOpacity="0" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>

        {/* Clip path to constrain shimmer within X shape */}
        <clipPath id={clipId}>
          <polygon points="12,12 50,40 88,12 60,50 88,88 50,60 12,88 40,50" />
        </clipPath>
      </defs>

      {/* ── Background glow disc ── */}
      <circle cx="50" cy="50" r="50" fill={`url(#${glowId})`} opacity="0.6" />

      {/* ── Animated X blades ── */}
      {BLADES.map((blade) => (
        <motion.path
          key={blade.key}
          fill={`url(#${gradId})`}
          d={blade.idle}
          animate={reduced ? {} : { d: isOpen ? blade.open : blade.idle }}
          transition={BLADE_SPRING}
        />
      ))}

      {/* ── Static fill for blade overlap seam at center ── */}
      <polygon
        points="12,12 50,40 88,12 60,50 88,88 50,60 12,88 40,50"
        fill={`url(#${gradId})`}
        opacity="0"
      />

      {/* ── Full X shape fill (base) ── */}
      <polygon points="12,12 50,40 88,12 60,50 88,88 50,60 12,88 40,50" fill={`url(#${gradId})`} />

      {/* ── Shimmer light sweep (CSS animation via className) ── */}
      <rect
        x="-100%"
        y="0"
        width="300%"
        height="100%"
        fill={`url(#${shimId})`}
        clipPath={`url(#${clipId})`}
        className="logo-shimmer"
      />

      {/* ── Center diamond "lens" ── */}
      <motion.polygon
        points="50,42 58,50 50,58 42,50"
        fill="#eafaff"
        animate={
          reduced
            ? {}
            : {
                opacity: isOpen ? [0.6, 1, 0.6] : [0.75, 1, 0.75],
                scale: isOpen ? 1.4 : 1,
              }
        }
        transition={
          reduced
            ? {}
            : {
                opacity: {
                  duration: isOpen ? duration.slow : 2.8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
                scale: BLADE_SPRING,
              }
        }
        style={{ transformOrigin: '50px 50px' }}
      />

      {/* ── Radial "light burst" overlay — visible when open ── */}
      <motion.circle
        cx="50"
        cy="50"
        r="8"
        fill="white"
        animate={reduced ? {} : { opacity: isOpen ? 0.45 : 0, scale: isOpen ? 2.5 : 1 }}
        transition={BLADE_SPRING}
        style={{ transformOrigin: '50px 50px' }}
      />
    </motion.svg>
  );
}
