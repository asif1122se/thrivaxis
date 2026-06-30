'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect, useRef, useState } from 'react';
import * as THREE from 'three/webgpu';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/cn';
import { FluidOrbFallback } from './fluid-orb-fallback';
import { FluidOrbScene } from './fluid-orb-scene';

interface FluidOrbCanvasProps {
  accent?: readonly [number, number, number];
  /** Smaller for closing CTA, default for hero. */
  particleSize?: number;
  /** DPR ceiling. Hero default 1.6; cards/CTA can dial down. */
  maxDpr?: number;
  className?: string;
  ariaLabel?: string;
}

const DEFAULT_ACCENT: readonly [number, number, number] = [0.78, 0.95, 0.32];

/**
 * R3F + Three.js WebGPU Canvas hosting the TSL compute-shader fluid orb.
 *
 *   - Probes for `navigator.gpu` + adapter availability before mounting
 *     the renderer. WebGPU-only — no WebGL fallback.
 *   - Pauses rendering when off-screen via IntersectionObserver — no
 *     RAF + compute dispatch costs for sections the user can't see.
 *   - Reduced-motion users + browsers without WebGPU see the CSS fallback.
 */
export function FluidOrbCanvas({
  accent = DEFAULT_ACCENT,
  particleSize = 0.02,
  maxDpr = 1.6,
  className,
  ariaLabel,
}: FluidOrbCanvasProps) {
  const reduced = useReducedMotion();
  const [supported, setSupported] = useState<boolean | null>(null);
  const [visible, setVisible] = useState(true);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Probe WebGPU support — async because requestAdapter is a promise.
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

  // IntersectionObserver — pause render loop when off-screen.
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

  if (reduced || supported === false) {
    return (
      <div ref={wrapperRef} className={cn('relative size-full', className)} {...a11y}>
        <FluidOrbFallback />
      </div>
    );
  }

  // While probing — show the fallback. Avoids a flash of nothing.
  if (supported === null) {
    return (
      <div ref={wrapperRef} className={cn('relative size-full', className)} {...a11y}>
        <FluidOrbFallback />
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className={cn('relative size-full', className)} {...a11y}>
      <FluidOrbFallback className="transition-opacity duration-700" />
      <Canvas
        dpr={[1, maxDpr]}
        camera={{ position: [0, 0, 3.4], fov: 32, near: 0.1, far: 50 }}
        frameloop={visible ? 'always' : 'never'}
        gl={async (props) => {
          // R3F's DefaultGLProps carries a `powerPreference: 'default'` that
          // WebGPURenderer's stricter type rejects, and an OffscreenCanvas
          // typed against a slightly different lib than three's. We narrow
          // both explicitly here.
          const canvas = props.canvas as HTMLCanvasElement;
          const renderer = new THREE.WebGPURenderer({
            canvas,
            antialias: true,
            powerPreference: 'high-performance',
          });
          await renderer.init();
          return renderer;
        }}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.25} />
          <FluidOrbScene accent={accent} particleSize={particleSize} />
        </Suspense>
      </Canvas>
    </div>
  );
}
