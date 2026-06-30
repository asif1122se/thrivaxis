'use client';

import { motion, useReducedMotion } from 'motion/react';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { gsap, registerGsapPlugins, ScrollTrigger } from '@/lib/gsap';
import { duration, ease } from '@/lib/motion';
import { creasePatterns } from '@/lib/origami/animals';

interface ProcessStep {
  label: string;
  service: string;
  headline: string;
  body: string;
  duration: string;
}

interface ProcessSequenceProps {
  steps: ReadonlyArray<ProcessStep>;
}

/**
 * Scroll-pinned fold-progression sequence.
 *
 * Section is 4× viewport tall. As the user scrolls through it, the inner
 * sticky container stays fixed and a 4-stage fold visualization scrubs
 * forward: empty sheet → first creases → full crease pattern → folded
 * crane silhouette. The active step's text fades in/out beside the visual.
 *
 * Reduced-motion users get a static stack of all four steps with the
 * final crane silhouette rendered statically.
 */
export function ProcessSequence({ steps }: ProcessSequenceProps) {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) {
      setProgress(1);
      return;
    }
    registerGsapPlugins();
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const trigger = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.4,
        onUpdate: (self) => setProgress(self.progress),
      });
      return () => trigger.kill();
    }, section);

    return () => ctx.revert();
  }, [reduced]);

  if (reduced) {
    return (
      <div className="grid gap-12 lg:grid-cols-2">
        <FoldVisual progress={1} />
        <div className="flex flex-col gap-10">
          {steps.map((step, i) => (
            <StepText key={step.label} step={step} index={i} />
          ))}
        </div>
      </div>
    );
  }

  const activeIndex = Math.min(steps.length - 1, Math.floor(progress * steps.length));

  return (
    <div ref={sectionRef} className="relative h-[400dvh]">
      <div className="sticky top-0 flex h-[100dvh] items-center">
        <div className="grid w-full gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          {/* Visual */}
          <div className="relative aspect-square w-full max-w-2xl self-center">
            <FoldVisual progress={progress} />
            <ProgressTicks count={steps.length} active={activeIndex} />
          </div>

          {/* Active step text */}
          <div className="flex flex-col justify-center gap-6">
            <ProgressBar progress={progress} steps={steps.length} />
            {steps.map((step, i) => (
              <ActiveStepBlock key={step.label} step={step} index={i} active={i === activeIndex} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Fold visual — paper square that gathers crease lines, then a silhouette
// ────────────────────────────────────────────────────────────────────────────

function FoldVisual({ progress }: { progress: number }) {
  // Layer opacity ramps — additive then a fade-back for the crease layer
  // once the silhouette dominates.
  const ramp = (start: number, end: number) =>
    Math.max(0, Math.min(1, (progress - start) / Math.max(1e-6, end - start)));

  const stage1Opacity = ramp(0.05, 0.2); // initial diagonals
  const stage2Opacity = ramp(0.3, 0.55); // full crease pattern
  const silhouetteOpacity = ramp(0.6, 0.85); // crane silhouette
  // Crease pattern fades back once silhouette dominates.
  const creaseFade = 1 - 0.6 * silhouetteOpacity;

  const crane = creasePatterns.crane;

  return (
    <div className="relative size-full overflow-hidden rounded-xl border border-border bg-bg/40">
      {/* Engineering grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(var(--grid-line)_1px,transparent_1px),linear-gradient(90deg,var(--grid-line)_1px,transparent_1px)] [background-size:32px_32px]"
      />

      {/* Specimen labels */}
      <div className="absolute top-4 right-4 left-4 flex items-start justify-between font-mono text-label text-muted uppercase tracking-[0.08em]">
        <span>Fold sequence · Crane</span>
        <span>{(progress * 100).toFixed(0)}%</span>
      </div>

      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 size-full p-12"
        preserveAspectRatio="xMidYMid meet"
        fill="none"
        aria-hidden="true"
      >
        {/* Paper outline — always present */}
        <rect
          x="6"
          y="6"
          width="88"
          height="88"
          rx="0.5"
          stroke="oklch(22% 0.013 270)"
          strokeWidth="0.4"
          fill="oklch(8% 0.012 270 / 70%)"
        />

        {/* Stage 1 — initial diagonals */}
        <g style={{ opacity: stage1Opacity * creaseFade }}>
          <line
            x1="6"
            y1="6"
            x2="94"
            y2="94"
            stroke="oklch(91% 0.21 130 / 70%)"
            strokeWidth="0.5"
          />
          <line
            x1="94"
            y1="6"
            x2="6"
            y2="94"
            stroke="oklch(91% 0.21 130 / 70%)"
            strokeWidth="0.5"
          />
          <line
            x1="50"
            y1="6"
            x2="50"
            y2="94"
            stroke="oklch(91% 0.21 130 / 35%)"
            strokeWidth="0.4"
            strokeDasharray="1.2 1.6"
          />
          <line
            x1="6"
            y1="50"
            x2="94"
            y2="50"
            stroke="oklch(91% 0.21 130 / 35%)"
            strokeWidth="0.4"
            strokeDasharray="1.2 1.6"
          />
        </g>

        {/* Stage 2 — full bird-base crease pattern (crane petal folds) */}
        <g style={{ opacity: stage2Opacity * creaseFade }}>
          <path
            d="M 50 6 L 6 50 M 50 6 L 94 50 M 50 94 L 6 50 M 50 94 L 94 50"
            stroke="oklch(91% 0.21 130 / 50%)"
            strokeWidth="0.4"
            strokeDasharray="1.2 1.6"
          />
        </g>

        {/* Stage 3 — silhouette + facets */}
        <g style={{ opacity: silhouetteOpacity }}>
          <path
            d={crane.silhouette}
            fill="oklch(99% 0.005 250 / 10%)"
            stroke="oklch(99% 0.005 250)"
            strokeWidth="0.65"
            strokeLinejoin="miter"
          />
          <path d={crane.facets} stroke="oklch(99% 0.005 250 / 55%)" strokeWidth="0.35" />
        </g>
      </svg>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Side widgets — progress bar + tick markers
// ────────────────────────────────────────────────────────────────────────────

function ProgressBar({ progress, steps }: { progress: number; steps: number }) {
  return (
    <div className="flex items-center gap-4 font-mono text-label text-muted uppercase tracking-[0.1em]">
      <span>Fold</span>
      <div className="relative h-px flex-1 bg-border">
        <div
          className="absolute inset-y-0 left-0 bg-accent transition-[width] duration-300 ease-out"
          style={{ width: `${progress * 100}%` }}
        />
        {Array.from({ length: steps }).map((_, i) => (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: stable index, fixed-length array
            key={i}
            className="absolute size-1.5 -translate-y-1/2 rounded-full bg-bg ring-1 ring-border-strong"
            style={{
              left: `${(i / (steps - 1)) * 100}%`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </div>
      <span className="tabular-nums">{(progress * 100).toFixed(0).padStart(2, '0')}%</span>
    </div>
  );
}

function ProgressTicks({ count, active }: { count: number; active: number }) {
  return (
    <div className="absolute right-4 bottom-4 left-4 flex items-center justify-between font-mono text-label text-muted uppercase tracking-[0.08em]">
      {Array.from({ length: count }).map((_, i) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: stable index
          key={i}
          className={cn(
            'inline-flex items-center gap-1.5 transition-colors duration-300',
            i === active && 'text-accent',
          )}
        >
          <span
            className={cn(
              'size-1 rounded-full transition-colors duration-300',
              i <= active ? 'bg-accent' : 'bg-border-strong',
            )}
          />
          0{i + 1}
        </span>
      ))}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Step text blocks — only the active one is fully visible
// ────────────────────────────────────────────────────────────────────────────

function ActiveStepBlock({
  step,
  index,
  active,
}: {
  step: ProcessStep;
  index: number;
  active: boolean;
}) {
  return (
    <motion.div
      animate={{
        opacity: active ? 1 : 0.2,
        y: active ? 0 : 4,
      }}
      transition={{ duration: duration.slow, ease: ease.outExpo }}
      className={cn(
        'flex flex-col gap-3 border-border/40 border-t pt-6',
        active && 'border-accent',
      )}
    >
      <div className="flex items-baseline justify-between font-mono text-caption text-muted uppercase tracking-[0.08em]">
        <span>
          Fold {String(index + 1).padStart(2, '0')} ·{' '}
          <span className={cn('text-ink', active && 'text-accent')}>{step.label}</span>
        </span>
        <span>{step.duration}</span>
      </div>
      <h3 className="font-display text-display-md text-ink leading-[1.05] tracking-[-0.03em]">
        {step.headline} <span className="font-serif text-accent italic">→ {step.service}</span>
      </h3>
      <p className="max-w-xl text-body text-muted leading-relaxed">{step.body}</p>
    </motion.div>
  );
}

function StepText({ step, index }: { step: ProcessStep; index: number }): ReactNode {
  return (
    <div className="flex flex-col gap-3 border-border/40 border-t pt-6">
      <div className="flex items-baseline justify-between font-mono text-caption text-muted uppercase tracking-[0.08em]">
        <span>
          Fold {String(index + 1).padStart(2, '0')} · {step.label}
        </span>
        <span>{step.duration}</span>
      </div>
      <h3 className="font-display text-display-md text-ink leading-[1.05] tracking-[-0.03em]">
        {step.headline} <span className="font-serif text-accent italic">→ {step.service}</span>
      </h3>
      <p className="max-w-xl text-body text-muted leading-relaxed">{step.body}</p>
    </div>
  );
}
