'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

export function Preloader({ onComplete }: { onComplete?: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const percentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Lock body scroll
    document.body.style.overflow = 'hidden';

    const tl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = '';
        if (onComplete) onComplete();
      },
    });

    // Simulate loading progress
    const proxy = { value: 0 };
    tl.to(proxy, {
      value: 100,
      duration: 2,
      ease: 'power3.inOut',
      onUpdate: () => {
        if (percentRef.current) {
          // Keep leading zeros for technical look: 00, 01 ... 100
          percentRef.current.innerText = Math.round(proxy.value).toString().padStart(2, '0');
        }
      },
    })
      .to(percentRef.current, {
        opacity: 0,
        y: -50,
        duration: 0.5,
        ease: 'power2.in',
      })
      .to(
        containerRef.current,
        {
          yPercent: -100,
          duration: 1.2,
          ease: 'power4.inOut',
        },
        '-=0.2',
      );

    return () => {
      document.body.style.overflow = '';
      tl.kill();
    };
  }, [onComplete]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[999] flex flex-col items-center justify-center border-border border-b bg-bg text-ink"
    >
      <div className="flex items-baseline gap-2 overflow-hidden">
        <div ref={percentRef} className="font-sans text-display-3xl leading-none tracking-tighter">
          00
        </div>
      </div>

      <div className="absolute right-8 bottom-8 left-8 flex justify-between font-mono text-label text-muted uppercase">
        <span>Terminal Boot Sequence</span>
        <span>Thrivaxis OS</span>
      </div>
    </div>
  );
}
