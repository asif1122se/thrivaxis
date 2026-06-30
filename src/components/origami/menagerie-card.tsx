'use client';

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'motion/react';
import { type PointerEvent, useState } from 'react';
import { CreasePattern } from '@/components/origami/crease-pattern';
import { cn } from '@/lib/cn';
import { duration, ease } from '@/lib/motion';
import type { AnimalCapability } from '@/lib/origami/animals';

interface MenagerieCardProps {
  capability: AnimalCapability;
  index: number;
}

/**
 * Specimen-plate capability card.
 *
 * Crease pattern at the top, service + body + bullets below. On hover/focus:
 * - the silhouette fades over the crease pattern
 * - the card lifts via a subtle 3D tilt that tracks the cursor
 * - the frame picks up an acid-green halo
 *
 * Reduced-motion users get the static state with no transforms.
 */
export function MenagerieCard({ capability, index }: MenagerieCardProps) {
  const [revealed, setRevealed] = useState(false);
  const reduced = useReducedMotion();

  // Cursor-tracked tilt — anchored to card center, capped at ±6 degrees.
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const sprX = useSpring(tiltX, { stiffness: 180, damping: 22, mass: 0.6 });
  const sprY = useSpring(tiltY, { stiffness: 180, damping: 22, mass: 0.6 });
  const transform = useMotionTemplate`perspective(1200px) rotateX(${sprX}deg) rotateY(${sprY}deg)`;

  const onMove = (event: PointerEvent<HTMLElement>) => {
    if (reduced) return;
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    tiltY.set(px * 8);
    tiltX.set(-py * 6);
  };

  const onLeave = () => {
    setRevealed(false);
    tiltX.set(0);
    tiltY.set(0);
  };

  return (
    <motion.article
      initial={reduced ? false : { opacity: 0, y: 24 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{
        duration: duration.slow,
        ease: ease.outExpo,
        delay: index * 0.07,
      }}
      onPointerEnter={() => setRevealed(true)}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      onFocus={() => setRevealed(true)}
      onBlur={() => setRevealed(false)}
      tabIndex={0}
      style={{ transform, willChange: 'transform' }}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl border border-border bg-surface/40',
        'transition-[background,border-color,box-shadow] duration-500',
        'hover:border-border-strong hover:bg-surface focus-visible:border-accent',
        revealed && 'shadow-[0_0_140px_-32px_var(--color-accent-glow)]',
      )}
    >
      {/* Specimen plate header */}
      <div className="flex items-baseline justify-between border-border/60 border-b px-6 py-3.5 font-mono text-label text-muted uppercase tracking-[0.08em]">
        <span>Specimen {String(index + 1).padStart(2, '0')}</span>
        <span>{capability.id}</span>
      </div>

      {/* Crease pattern panel — large, centered */}
      <div className="relative flex aspect-[5/3] items-center justify-center overflow-hidden border-border/60 border-b bg-bg/40 p-8">
        {/* Engineering grid */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-25 [background-image:linear-gradient(var(--grid-line)_1px,transparent_1px),linear-gradient(90deg,var(--grid-line)_1px,transparent_1px)] [background-size:24px_24px]"
        />
        <CreasePattern
          animal={capability.id}
          revealed={revealed}
          delay={index * 0.08}
          className="size-full max-w-[18rem]"
        />
        {/* Acid-green corner ticks — registration marks */}
        <CornerTicks />
      </div>

      {/* Content block */}
      <div className="flex flex-1 flex-col gap-5 p-7">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-display font-semibold text-display-sm text-ink leading-[1] tracking-[-0.025em]">
            {capability.service}
          </h3>
          <span className="font-mono text-accent text-caption uppercase tracking-[0.04em]">
            Fold {String(index + 1).padStart(2, '0')}
          </span>
        </div>

        <p className="font-serif text-accent text-body-lg italic leading-snug">
          {capability.tagline}
        </p>

        <p className="text-body text-muted leading-relaxed">{capability.body}</p>

        <ul className="mt-auto flex flex-col gap-2 border-border/60 border-t pt-5">
          {capability.bullets.map((bullet) => (
            <li
              key={bullet}
              className="flex items-center gap-2.5 font-mono text-caption text-ink/80 uppercase tracking-[0.04em]"
            >
              <span aria-hidden="true" className="block size-1 shrink-0 rounded-full bg-accent" />
              {bullet}
            </li>
          ))}
        </ul>
      </div>
    </motion.article>
  );
}

/**
 * Four small registration marks in the corners of the crease-pattern panel.
 * Reads as a printer's specimen plate without adding visual noise.
 */
function CornerTicks() {
  return (
    <>
      <span
        aria-hidden="true"
        className="absolute top-3 left-3 size-2 border-accent/70 border-t border-l"
      />
      <span
        aria-hidden="true"
        className="absolute top-3 right-3 size-2 border-accent/70 border-t border-r"
      />
      <span
        aria-hidden="true"
        className="absolute bottom-3 left-3 size-2 border-accent/70 border-b border-l"
      />
      <span
        aria-hidden="true"
        className="absolute right-3 bottom-3 size-2 border-accent/70 border-r border-b"
      />
    </>
  );
}
