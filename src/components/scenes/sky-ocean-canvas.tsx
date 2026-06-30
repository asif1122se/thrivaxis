'use client';

import { useRef } from 'react';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { useSkyOceanRenderer } from '@/lib/canvas/use-sky-ocean-renderer';
import { cn } from '@/lib/cn';
import { SkyOceanFallback } from './sky-ocean-fallback';

interface SkyOceanCanvasProps {
  className?: string;
}

/**
 * Full-bleed WebGPU sky-ocean. Cursor drives the sun (and antipodal moon),
 * scroll feeds the camera path. Browsers without WebGPU, and users with
 * `prefers-reduced-motion: reduce`, get the static gradient fallback —
 * we render no frames in that case to save battery.
 */
export function SkyOceanCanvas({ className }: SkyOceanCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reduced = useReducedMotion();
  const status = useSkyOceanRenderer(canvasRef, { staticFrame: false });

  // For reduced-motion users we skip WebGPU entirely and show the gradient.
  // The animated canvas is the whole point; a still frame from it is roughly
  // equivalent to the CSS fallback at much higher cost, so use the gradient.
  const showFallback = reduced || status === 'unsupported' || status === 'error';

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {showFallback ? (
        <SkyOceanFallback />
      ) : (
        <div aria-hidden="true">
          <SkyOceanFallback
            className={cn(
              'transition-opacity duration-700',
              status === 'ready' ? 'opacity-0' : 'opacity-100',
            )}
          />
          <canvas
            ref={canvasRef}
            className={cn(
              'absolute inset-0 h-full w-full transition-opacity duration-700',
              status === 'ready' ? 'opacity-100' : 'opacity-0',
            )}
          />
        </div>
      )}
    </div>
  );
}
