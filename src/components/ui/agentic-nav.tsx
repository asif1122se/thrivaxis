'use client';

import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { useState } from 'react';

export function AgenticNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-8 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            className="mb-4 flex items-center border border-border bg-bg shadow-2xl"
          >
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="border-border border-r px-6 py-4 font-mono text-xs uppercase tracking-widest transition-colors hover:bg-surface"
            >
              System
            </Link>
            <Link
              href="/work"
              onClick={() => setIsOpen(false)}
              className="border-border border-r px-6 py-4 font-mono text-xs uppercase tracking-widest transition-colors hover:bg-surface"
            >
              Output
            </Link>
            <Link
              href="/contact"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-6 py-4 font-mono text-accent text-xs uppercase tracking-widest transition-colors hover:bg-surface"
            >
              <div className="h-1.5 w-1.5 animate-pulse bg-accent" />
              Initialize
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The Toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center justify-center gap-3 border border-border bg-bg px-4 py-2 shadow-lg transition-all duration-300 hover:border-accent/50 hover:bg-surface"
        aria-label="Toggle Menu"
      >
        <span className="font-mono text-muted text-xs uppercase tracking-widest transition-colors group-hover:text-ink">
          Menu
        </span>
        <div className="h-1.5 w-1.5 bg-accent" />
      </button>
    </div>
  );
}
