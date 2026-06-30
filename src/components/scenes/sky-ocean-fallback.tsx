import { cn } from '@/lib/cn';

/**
 * Static CSS gradient that approximates the sky-ocean scene at sun-rising
 * altitude in the Thrivaxis-acid palette. Shown on browsers that lack
 * WebGPU and as the warm-frame backdrop while the canvas hydrates.
 */
export function SkyOceanFallback({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn('absolute inset-0', className)}
      style={{
        background: `
          radial-gradient(60% 35% at 50% 28%, oklch(72% 0.20 130 / 28%) 0%, transparent 70%),
          radial-gradient(120% 70% at 50% 42%, oklch(35% 0.10 140 / 18%) 0%, transparent 75%),
          linear-gradient(
            to bottom,
            oklch(6%  0.012 270) 0%,
            oklch(10% 0.020 250) 38%,
            oklch(14% 0.060 145) 50%,
            oklch(8%  0.030 250) 62%,
            oklch(5%  0.015 260) 100%
          )
        `,
      }}
    />
  );
}
