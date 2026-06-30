'use client';

import { useRef } from 'react';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { useBlackHoleRenderer } from '@/lib/canvas/use-blackhole-renderer';
import { cn } from '@/lib/cn';
import { BlackHoleFallback } from './blackhole-fallback';

interface BlackHoleCanvasProps {
  className?: string;
}

/**
 * Full-bleed WebGPU Kerr-Newman black hole renderer.
 * Pointer adds a subtle camera nudge; scroll progress is collected for
 * future framing work. Browsers without WebGPU and reduced-motion users
 * see the static fallback (no frames rendered, zero GPU cost).
 */
export function BlackHoleCanvas({ className }: BlackHoleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reduced = useReducedMotion();
  const status = useBlackHoleRenderer(canvasRef, { staticFrame: false });

  const showFallbackOnly = reduced || status === 'unsupported' || status === 'error';

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {showFallbackOnly ? (
        <BlackHoleFallback />
      ) : (
        <div aria-hidden="true">
          <BlackHoleFallback
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
