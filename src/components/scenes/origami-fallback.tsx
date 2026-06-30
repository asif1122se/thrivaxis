import { CreasePattern } from '@/components/origami/crease-pattern';
import { cn } from '@/lib/cn';

interface OrigamiFallbackProps {
  className?: string;
}

/**
 * Static SVG fallback for the origami crane — shown when WebGL is unavailable
 * or the user has prefers-reduced-motion enabled. Reuses the crease-pattern
 * primitive with the silhouette pre-revealed so it reads as a crane, not a
 * placeholder.
 */
export function OrigamiFallback({ className }: OrigamiFallbackProps) {
  return (
    <div className={cn('flex size-full items-center justify-center p-12', className)}>
      <CreasePattern animal="crane" revealed animateIn={false} className="size-full max-w-md" />
    </div>
  );
}
