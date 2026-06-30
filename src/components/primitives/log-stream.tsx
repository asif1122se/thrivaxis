'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/cn';

type LogLevel = 'info' | 'ok' | 'warn' | 'err';
export interface LogLine {
  id: string;
  level: LogLevel;
  message: string;
}

const levelClass: Record<LogLevel, string> = {
  info: 'text-cool',
  ok: 'text-accent',
  warn: 'text-warm',
  err: 'text-rose',
};

const levelGlyph: Record<LogLevel, string> = {
  info: '·',
  ok: '✓',
  warn: '!',
  err: '×',
};

interface LogStreamProps {
  initial?: readonly LogLine[];
  feed?: readonly LogLine[];
  intervalMs?: number;
  rows?: number;
  className?: string;
}

const SAMPLE: LogLine[] = [
  { id: '1', level: 'info', message: 'agent.boot()  ↳ session_id=tx_8f2a' },
  { id: '2', level: 'ok', message: 'tools.attached  17 capabilities resolved' },
  { id: '3', level: 'info', message: 'context.window  128k · prefilled 3.4k tokens' },
  { id: '4', level: 'ok', message: 'plan.generated  6 steps · est 4.8s' },
  { id: '5', level: 'info', message: 'rag.retrieve  5 docs · cosine 0.81 / 0.79 / 0.78' },
  { id: '6', level: 'warn', message: 'rate.budget  92% used · throttling outbound' },
  { id: '7', level: 'ok', message: 'step.1 complete  fetch_pricing → 240ms' },
  { id: '8', level: 'ok', message: 'step.2 complete  calc_eligibility → 18ms' },
  { id: '9', level: 'info', message: 'eval.score 0.94  on bench/ai_agent_v3' },
  { id: '10', level: 'ok', message: 'response.streamed  642 tokens · 3.2s' },
];

/**
 * Faux log stream — emits a new line on an interval. Self-contained sample
 * data unless you pass `feed`. Pauses for reduced-motion users.
 */
export function LogStream({
  initial,
  feed,
  intervalMs = 1500,
  rows = 6,
  className,
}: LogStreamProps) {
  const reduced = useReducedMotion();
  const source = feed ?? SAMPLE;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [lines, setLines] = useState<readonly LogLine[]>(initial ?? source.slice(0, rows));
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) setVisible(entry.isIntersecting);
      },
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reduced || !visible) return;
    let i = (initial?.length ?? rows) % source.length;
    const id = setInterval(() => {
      setLines((prev) => {
        const next = source[i % source.length];
        i += 1;
        if (!next) return prev;
        return [...prev.slice(-(rows - 1)), { ...next, id: `${next.id}-${i}` }];
      });
    }, intervalMs);
    return () => clearInterval(id);
  }, [reduced, visible, intervalMs, rows, source, initial]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex flex-col gap-1 font-mono text-caption text-muted leading-relaxed',
        className,
      )}
      role="log"
      aria-live="polite"
      aria-label="Activity stream"
    >
      <AnimatePresence initial={false}>
        {lines.map((line) => (
          <motion.div
            key={line.id}
            layout
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-3 whitespace-nowrap"
          >
            <span className={cn('w-3 text-center', levelClass[line.level])}>
              {levelGlyph[line.level]}
            </span>
            <span className="text-ink/90">{line.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
