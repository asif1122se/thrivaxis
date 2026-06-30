import type { HTMLAttributes, SVGAttributes } from 'react';
import { cn } from '@/lib/cn';

interface WordmarkProps extends HTMLAttributes<HTMLSpanElement> {
  /** Show the "Thrivaxis" wordmark text next to the glyph. Default true. */
  showText?: boolean;
  /** Glyph size in px. Default 28. */
  size?: number;
}

/**
 * Thrivaxis lockup — a folded "T" glyph + the wordmark in display sans.
 *
 * Glyph: a capital T composed of triangulated paper panels with a single
 * acid-green crease running down the center fold. The two halves of the
 * crossbar and stem render at slightly different ink weights so the fold
 * reads as a 3D crease, not a flat decoration.
 */
export function Wordmark({ showText = true, size = 28, className, ...rest }: WordmarkProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5 leading-none', className)} {...rest}>
      <WordmarkGlyph aria-hidden="true" style={{ width: size, height: size }} />
      {showText && (
        <span className="font-display font-semibold text-[1.05rem] text-ink tracking-[-0.02em]">
          Thrivaxis
        </span>
      )}
    </span>
  );
}

/**
 * Standalone glyph — use when you need just the icon (favicon, footer mark).
 */
export function WordmarkGlyph({ className, ...rest }: SVGAttributes<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={cn('shrink-0', className)} {...rest}>
      <title>Thrivaxis</title>
      {/* Crossbar — left facet (lit) */}
      <path d="M 5 7 L 16 7 L 16 13 L 5 13 Z" fill="oklch(99% 0.005 250)" />
      {/* Crossbar — right facet (folded, slightly darker) */}
      <path d="M 16 7 L 27 7 L 27 13 L 16 13 Z" fill="oklch(74% 0.012 270)" />
      {/* Stem — left facet */}
      <path d="M 13.5 13 L 16 13 L 16 26 L 13.5 26 Z" fill="oklch(99% 0.005 250)" />
      {/* Stem — right facet (folded) */}
      <path d="M 16 13 L 18.5 13 L 18.5 26 L 16 26 Z" fill="oklch(74% 0.012 270)" />
      {/* Center fold (acid-green crease) */}
      <line
        x1="16"
        y1="7"
        x2="16"
        y2="26"
        stroke="oklch(91% 0.21 130)"
        strokeWidth="0.6"
        strokeLinecap="square"
      />
      {/* Crossbar bottom shadow line — gives the fold dimension */}
      <line
        x1="5"
        y1="13"
        x2="27"
        y2="13"
        stroke="oklch(8% 0.012 270)"
        strokeWidth="0.5"
        opacity="0.6"
      />
    </svg>
  );
}
