import { cn } from '@/lib/cn';

/**
 * Static CSS approximation of the black hole — radial dark void with a
 * warm-orange ring (the photon ring + accretion-disk silhouette), shown
 * on browsers without WebGPU and as the warm-frame backdrop while the
 * canvas hydrates. No animation; the live render is the whole point.
 */
export function BlackHoleFallback({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn('absolute inset-0', className)}
      style={{
        background: `
          radial-gradient(circle at 50% 52%, rgb(0 0 0 / 100%) 0%, rgb(0 0 0 / 100%) 8%, transparent 9%),
          radial-gradient(circle at 50% 52%, oklch(78% 0.18 50 / 95%) 8.2%, oklch(60% 0.18 35 / 70%) 11%, oklch(35% 0.14 30 / 30%) 16%, transparent 22%),
          radial-gradient(ellipse 60% 18% at 50% 52%, oklch(72% 0.18 60 / 55%) 0%, oklch(45% 0.16 40 / 28%) 35%, transparent 65%),
          radial-gradient(circle at 50% 50%, oklch(12% 0.04 270) 0%, oklch(6% 0.018 270) 55%, oklch(3% 0.010 270) 100%)
        `,
      }}
    />
  );
}
