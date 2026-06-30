'use client';

import { Canvas } from '@react-three/fiber';
import { useEffect, useState } from 'react';
import * as THREE from 'three';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/cn';
import { OrigamiFallback } from './origami-fallback';
import { OrigamiScene } from './origami-scene';

interface OrigamiCanvasProps {
  className?: string;
}

/**
 * Premium R3F crane canvas.
 *
 * Pipeline:
 *   - WebGL2 renderer with NoToneMapping (post handles ACES)
 *   - Physical paper material with sheen + slight transmission + procedural
 *     fiber normals
 *   - Procedural Lightformer environment (no photographic HDRIs)
 *   - 5-light cinematic rig + ContactShadows
 *   - Sparkles dust + slow camera orbit
 *   - Bloom · DoF · Chromatic Aberration · Vignette · Film-grain · ACES
 *
 * Reduced-motion users and clients without WebGL2 see the SVG crease-pattern
 * fallback (silhouette pre-revealed).
 */
export function OrigamiCanvas({ className }: OrigamiCanvasProps) {
  const reduced = useReducedMotion();
  const supported = useWebGL2Support();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={cn('relative size-full', className)}>
        <OrigamiFallback />
      </div>
    );
  }

  if (!supported) {
    return (
      <div className={cn('relative size-full', className)}>
        <OrigamiFallback />
      </div>
    );
  }

  return (
    <div className={cn('relative size-full', className)}>
      <Canvas
        dpr={[1, 1.6]}
        camera={{ position: [0, 0.95, 3.4], fov: 32, near: 0.1, far: 50 }}
        shadows
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.NoToneMapping,
        }}
      >
        <fog attach="fog" args={['#05070d', 4.8, 10.5]} />
        <OrigamiScene reduced={reduced} />
      </Canvas>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// WebGL2 capability probe — same shape as the blackhole canvas guard.
// ────────────────────────────────────────────────────────────────────────────

function useWebGL2Support(): boolean {
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2');
      setSupported(Boolean(gl));
    } catch {
      setSupported(false);
    }
  }, []);

  return supported;
}
