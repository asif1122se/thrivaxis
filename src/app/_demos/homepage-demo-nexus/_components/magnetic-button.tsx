'use client';

import { motion, useMotionValue, useSpring } from 'motion/react';
import type React from 'react';
import { useRef, useState } from 'react';
import { cn } from '@/lib/cn'; // Assuming this exists based on AGENTS.md

// Omit DOM animation/drag handlers that collide with motion's lifecycle equivalents.
interface MagneticButtonProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    | 'onAnimationStart'
    | 'onAnimationEnd'
    | 'onAnimationIteration'
    | 'onDrag'
    | 'onDragStart'
    | 'onDragEnd'
    | 'onDragOver'
    | 'onDragEnter'
    | 'onDragLeave'
    | 'onDrop'
  > {
  children: React.ReactNode;
  strength?: number;
}

export function MagneticButton({
  children,
  strength = 40,
  className,
  ...props
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [_isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    // Calculate distance from center
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;

    x.set(distanceX * (strength / 100));
    y.set(distanceY * (strength / 100));
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        x: mouseXSpring,
        y: mouseYSpring,
      }}
      className={cn(
        'group relative inline-flex items-center justify-center overflow-hidden rounded-full border border-white/10 bg-black/20 px-8 py-4 font-medium text-white backdrop-blur-md transition-colors duration-300',
        'hover:border-[#9eff00]/50 hover:text-[#9eff00]',
        className,
      )}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>

      {/* Subtle background glow on hover */}
      <motion.div
        className="absolute inset-0 z-0 bg-[#9eff00]/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        initial={false}
      />
    </motion.button>
  );
}
