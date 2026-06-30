'use client';

import {
  siFramer,
  siGreensock,
  siNextdotjs,
  siReact,
  siTailwindcss,
  siThreedotjs,
  siVercel,
  siWebgl,
} from 'simple-icons';
import { cn } from '@/lib/cn';

interface TechLogo {
  name: string;
  path: string;
  hex: string;
}

const stack: TechLogo[] = [
  { name: 'Next.js 16', path: siNextdotjs.path, hex: siNextdotjs.hex },
  { name: 'React 19', path: siReact.path, hex: siReact.hex },
  { name: 'Turbopack', path: siVercel.path, hex: siVercel.hex }, // Using Vercel logo for Turbopack as it's part of the ecosystem
  { name: 'WebGL2', path: siWebgl.path, hex: siWebgl.hex },
  { name: 'Three.js', path: siThreedotjs.path, hex: siThreedotjs.hex },
  { name: 'Framer Motion', path: siFramer.path, hex: siFramer.hex },
  { name: 'GSAP', path: siGreensock.path, hex: siGreensock.hex },
  { name: 'Tailwind v4', path: siTailwindcss.path, hex: siTailwindcss.hex },
];

export function StackMarquee({ className }: { className?: string }) {
  return (
    <div className={cn('flex w-full items-center overflow-hidden', className)}>
      {/* Container that is wide enough to hold two sets of items and animates them */}
      <div
        className="flex items-center"
        style={{
          width: 'max-content',
          animation: 'var(--animate-marquee)',
          willChange: 'transform',
        }}
      >
        {/* Two copies rendered — translating by -50% creates a seamless infinite loop.
            Previously 4× (32 DOM nodes + large GPU composite layer); 2× halves that cost. */}
        {[0, 1]
          .flatMap((chunkIndex) =>
            stack.map((tech) => ({ ...tech, id: `${tech.name}-${chunkIndex}` })),
          )
          .map((tech) => (
            <div
              key={tech.id}
              className="group mx-8 flex items-center gap-3 rounded-full border border-border/50 bg-surface/30 px-4 py-2 transition-all duration-300 hover:border-border hover:bg-surface"
            >
              <svg
                role="img"
                viewBox="0 0 24 24"
                className="h-5 w-5 text-muted transition-colors duration-300 group-hover:text-ink"
                fill="currentColor"
              >
                <title>{tech.name}</title>
                <path d={tech.path} />
              </svg>
              <span className="font-mono text-muted/60 text-xs uppercase tracking-widest transition-colors duration-300 group-hover:text-muted">
                {tech.name}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
