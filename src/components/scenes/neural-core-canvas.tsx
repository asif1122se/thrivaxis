'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect, useRef, useState } from 'react';
import * as THREE from 'three/webgpu';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/cn';
import { NeuralCoreFallback } from './neural-core-fallback';
import { NeuralCoreScene } from './neural-core-scene';

interface NeuralCoreCanvasProps {
  maxDpr?: number;
  className?: string;
  ariaLabel?: string;
}

/**
 * R3F + Three.js WebGPU Canvas hosting the TSL-based neural core.
 *
 *   - Probes for `navigator.gpu` before mounting the renderer. WebGPU-only.
 *   - Pauses rendering when off-screen via IntersectionObserver.
 *   - Reduced-motion users + browsers without WebGPU see the CSS fallback.
 */
export function NeuralCoreCanvas({
  maxDpr = 1.5,
  className,
  ariaLabel,
}: NeuralCoreCanvasProps = {}) {
  const reduced = useReducedMotion();
  const [supported, setSupported] = useState<boolean | null>(null);
  const [visible, setVisible] = useState(true);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Probe WebGPU support
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const gpu = (typeof navigator !== 'undefined' ? navigator : undefined)?.gpu;
        if (!gpu) {
          if (!cancelled) setSupported(false);
          return;
        }
        const adapter = await gpu.requestAdapter({ powerPreference: 'high-performance' });
        if (!cancelled) setSupported(Boolean(adapter));
      } catch {
        if (!cancelled) setSupported(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // IntersectionObserver to pause rendering off-screen
  useEffect(() => {
    if (!wrapperRef.current || !('IntersectionObserver' in window)) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) setVisible(entry.isIntersecting);
      },
      { threshold: 0, rootMargin: '200px 0px' },
    );
    obs.observe(wrapperRef.current);
    return () => obs.disconnect();
  }, []);

  const a11y = ariaLabel ? ({ role: 'img', 'aria-label': ariaLabel } as const) : {};

  if (reduced || supported === false || supported === null) {
    return (
      <div ref={wrapperRef} className={cn('relative size-full', className)} {...a11y}>
        <NeuralCoreFallback />
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className={cn('relative size-full', className)} {...a11y}>
      {/* Fallback is omitted here because WebGPU is supported and the canvas will render */}
      <Canvas
        dpr={[1, maxDpr]}
        camera={{ position: [0, 0, 8], fov: 35 }}
        frameloop={visible ? 'always' : 'never'}
        gl={async (props) => {
          const canvas = props.canvas as HTMLCanvasElement;
          const renderer = new THREE.WebGPURenderer({
            canvas,
            antialias: true,
            powerPreference: 'high-performance',
            alpha: true,
          });
          await renderer.init();
          return renderer;
        }}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        <Suspense fallback={null}>
          <NeuralCoreScene />
        </Suspense>
      </Canvas>
    </div>
  );
}
