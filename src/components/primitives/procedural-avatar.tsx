import { cn } from '@/lib/cn';

interface ProceduralAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'capsule' | 'square';
  className?: string;
}

const sizeClass = {
  sm: 'size-8 text-caption',
  md: 'size-12 text-body',
  lg: 'size-16 text-h3',
  xl: 'size-24 text-h2',
} as const;

const shapeClass = {
  capsule: 'rounded-full',
  square: 'rounded-md',
} as const;

/**
 * Deterministic gradient capsule with initials. Replaces team headshots.
 * Same `name` always renders the same gradient — useful for repeat use.
 */
export function ProceduralAvatar({
  name,
  size = 'md',
  shape = 'capsule',
  className,
}: ProceduralAvatarProps) {
  const initials = nameToInitials(name);
  const { hue1, hue2, chroma } = nameToGradient(name);
  const gradient = `linear-gradient(135deg, oklch(78% ${chroma} ${hue1}), oklch(58% ${chroma} ${hue2}))`;

  return (
    <span
      aria-hidden="true"
      role="presentation"
      style={{ backgroundImage: gradient }}
      className={cn(
        'relative inline-flex select-none items-center justify-center font-display font-medium text-bg ring-1 ring-black/10 ring-inset',
        sizeClass[size],
        shapeClass[shape],
        className,
      )}
    >
      <span className="relative drop-shadow-sm">{initials}</span>
    </span>
  );
}

function nameToInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '·';
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts.at(-1)?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}

function nameToGradient(name: string): {
  hue1: number;
  hue2: number;
  chroma: number;
} {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  const hue1 = hash % 360;
  const hue2 = (hue1 + 60 + (hash % 80)) % 360;
  const chroma = 0.16 + ((hash >> 8) % 7) * 0.01;
  return { hue1, hue2, chroma };
}
