'use client';

import { cn } from '@/lib/cn';

interface NeuralCoreFallbackProps {
  className?: string;
}

export function NeuralCoreFallback({ className }: NeuralCoreFallbackProps) {
  return (
    <div className={cn('absolute inset-0 size-full overflow-hidden', className)}>
      {/* Soft plasma gradient background matching the 3D scene */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--color-accent-soft)_0%,transparent_50%)] opacity-30" />
    </div>
  );
}
