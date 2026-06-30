'use client';

import { motion, useReducedMotion } from 'motion/react';
import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import { duration, ease } from '@/lib/motion';
import { type AnimalId, creasePatterns } from '@/lib/origami/animals';

interface CreasePatternProps extends HTMLAttributes<HTMLDivElement> {
  animal: AnimalId;
  /** Show the faceted silhouette overlay instead of just the fold lines. */
  revealed?: boolean;
  /** Trigger draw-in animation on mount. Default true. */
  animateIn?: boolean;
  /** Stagger delay in seconds before the draw-in begins. */
  delay?: number;
}

/**
 * Animated SVG crease pattern.
 *
 * Default state: mountain folds (solid acid-green) and valley folds (dashed)
 * draw in via stroke-dashoffset, origami convention.
 *
 * `revealed` state: the crease lines fade back, the silhouette polygon
 * scales up and fades in, then the inner facet lines retrace last — giving
 * a sense that the fold "completed" rather than just opacity-blending.
 */
export function CreasePattern({
  animal,
  revealed = false,
  animateIn = true,
  delay = 0,
  className,
  ...rest
}: CreasePatternProps) {
  const reduced = useReducedMotion();
  const pattern = creasePatterns[animal];

  const draw = (offset: number) => ({
    pathLength: { duration: reduced ? 0 : 1.4, ease: ease.outExpo, delay: delay + offset },
    opacity: { duration: reduced ? 0 : duration.normal, delay: delay + offset },
  });

  return (
    <div
      className={cn(
        'relative aspect-square w-full overflow-hidden rounded-md',
        'bg-[radial-gradient(circle_at_30%_20%,oklch(14%_0.012_270),oklch(8%_0.012_270))]',
        className,
      )}
      {...rest}
    >
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 size-full"
        fill="none"
        aria-hidden="true"
      >
        {/* Paper outline frame */}
        <rect
          x="2"
          y="2"
          width="96"
          height="96"
          rx="1"
          stroke="oklch(22% 0.013 270)"
          strokeWidth="0.4"
          fill="none"
        />

        {/* Crease layer — fades back when silhouette is revealed */}
        <motion.g
          animate={{ opacity: revealed ? 0.35 : 1 }}
          transition={{ duration: reduced ? 0 : duration.slow, ease: ease.outExpo }}
        >
          {/* Mountain folds (solid) */}
          <motion.path
            d={pattern.mountain}
            stroke="oklch(91% 0.21 130 / 65%)"
            strokeWidth="0.5"
            strokeLinecap="square"
            initial={animateIn ? { pathLength: 0, opacity: 0 } : false}
            whileInView={animateIn ? { pathLength: 1, opacity: 1 } : undefined}
            viewport={{ once: true, margin: '0px 0px -10% 0px' }}
            transition={draw(0)}
          />
          {/* Valley folds (dashed) */}
          <motion.path
            d={pattern.valley}
            stroke="oklch(91% 0.21 130 / 35%)"
            strokeWidth="0.4"
            strokeDasharray="1.2 1.6"
            strokeLinecap="butt"
            initial={animateIn ? { pathLength: 0, opacity: 0 } : false}
            whileInView={animateIn ? { pathLength: 1, opacity: 1 } : undefined}
            viewport={{ once: true, margin: '0px 0px -10% 0px' }}
            transition={draw(0.25)}
          />
        </motion.g>

        {/* Silhouette layer — scales up + fades in on reveal */}
        <motion.g
          initial={false}
          animate={{
            opacity: revealed ? 1 : 0,
            scale: revealed ? 1 : 0.94,
          }}
          transition={{
            duration: reduced ? 0 : duration.slow,
            ease: ease.outExpo,
          }}
          style={{ transformOrigin: '50% 50%', transformBox: 'fill-box' }}
        >
          <path
            d={pattern.silhouette}
            fill="oklch(99% 0.005 250 / 8%)"
            stroke="oklch(99% 0.005 250)"
            strokeWidth="0.65"
            strokeLinejoin="miter"
          />
          <motion.path
            d={pattern.facets}
            stroke="oklch(99% 0.005 250 / 55%)"
            strokeWidth="0.35"
            initial={false}
            animate={{ pathLength: revealed ? 1 : 0 }}
            transition={{
              duration: reduced ? 0 : 0.7,
              ease: ease.outExpo,
              delay: revealed ? 0.18 : 0,
            }}
          />
        </motion.g>
      </svg>
    </div>
  );
}
