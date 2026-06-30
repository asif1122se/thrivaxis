import { cn } from '@/lib/cn';

interface FluidOrbFallbackProps {
  className?: string;
}

/**
 * Static CSS approximation of the fluid orb — soft cool void with a
 * warm-edged luminous core. Shown when WebGPU is unavailable, when
 * reduced-motion is preferred, and as the warm-frame backdrop while the
 * particle scene initialises.
 */
export function FluidOrbFallback({ className }: FluidOrbFallbackProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('absolute inset-0', className)}
      style={{
        background: `
          radial-gradient(ellipse 30% 28% at 50% 50%, oklch(76% 0.06 240 / 60%) 0%, oklch(40% 0.10 250 / 22%) 38%, transparent 60%),
          radial-gradient(ellipse 16% 14% at 44% 44%, oklch(95% 0.21 130 / 18%) 0%, transparent 65%),
          radial-gradient(circle at 50% 50%, oklch(11% 0.014 270) 0%, oklch(6% 0.012 270) 60%, oklch(3% 0.010 270) 100%)
        `,
      }}
    />
  );
}
