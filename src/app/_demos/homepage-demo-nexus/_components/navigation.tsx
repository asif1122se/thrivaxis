'use client';

import { MagneticButton } from './magnetic-button';

export function Navigation() {
  return (
    <nav className="pointer-events-none fixed top-0 right-0 left-0 z-50 flex items-center justify-between px-6 py-6 mix-blend-difference md:px-12">
      {/* Brand */}
      <div className="pointer-events-auto flex items-center gap-2" data-cursor-target>
        <div className="h-4 w-4 animate-pulse rounded-sm bg-accent" />
        <span className="font-bold text-white text-xl tracking-tighter">Thrivaxis</span>
      </div>

      {/* Links */}
      <ul className="pointer-events-auto hidden items-center gap-8 md:flex">
        {['Manifesto', 'Capabilities', 'Work', 'Principals'].map((item) => (
          <li key={item}>
            <button
              type="button"
              data-cursor-target
              className="font-medium text-sm text-white/60 transition-colors duration-300 hover:text-white"
            >
              {item}
            </button>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div className="pointer-events-auto">
        <MagneticButton
          strength={20}
          className="border-none bg-white px-6 py-2 text-black text-sm hover:border-none hover:bg-accent hover:text-black"
        >
          Initialize Project
        </MagneticButton>
      </div>
    </nav>
  );
}
