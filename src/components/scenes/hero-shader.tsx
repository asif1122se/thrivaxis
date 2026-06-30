'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec2 uMouse;        // -1..1
  uniform vec2 uResolution;

  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    vec2 uv = vUv;

    // Aspect-correct working coordinates so blobs stay round
    vec2 aspect = uResolution / max(uResolution.x, uResolution.y);
    vec2 p = (uv - 0.5) * aspect + 0.5;

    vec2 m = uMouse * 0.5 + 0.5;

    float t = uTime * 0.18;
    vec2 c1 = vec2(0.28 + 0.18 * sin(t * 1.0),  0.42 + 0.12 * cos(t * 0.7));
    vec2 c2 = vec2(0.72 + 0.14 * sin(t * 0.6),  0.55 + 0.20 * cos(t * 0.9));
    vec2 c3 = vec2(0.50 + 0.10 * sin(t * 1.4),  0.88 + 0.08 * cos(t * 1.1));
    vec2 c4 = m;

    // Metaball-style scalar field (sum of reciprocals)
    float field = 0.0;
    field += 0.16 / (length(p - c1) + 0.05);
    field += 0.13 / (length(p - c2) + 0.05);
    field += 0.10 / (length(p - c3) + 0.05);
    field += 0.07 / (length(p - c4) + 0.05);

    // Bring into 0..1 with a soft threshold
    float intensity = smoothstep(1.6, 4.5, field);

    // Vignette
    float vig = 1.0 - smoothstep(0.45, 0.98, length(uv - 0.5));
    intensity *= vig;

    // Color ramp: dark surface → green-tinted mid → acid green
    vec3 bg     = vec3(0.034, 0.040, 0.054);
    vec3 mid    = vec3(0.18,  0.30,  0.10);
    vec3 accent = vec3(0.77,  1.00,  0.00);

    vec3 color = mix(bg, mid, smoothstep(0.00, 0.55, intensity));
    color      = mix(color, accent, smoothstep(0.60, 1.00, intensity));

    // Film grain
    float grain = (hash(uv * 800.0 + uTime) - 0.5) * 0.035;
    color += grain;

    gl_FragColor = vec4(color, 1.0);
  }
`;

function ShaderPlane({ animate }: { animate: boolean }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const smoothMouse = useRef(new THREE.Vector2(0, 0));

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uResolution: { value: new THREE.Vector2(1, 1) },
    }),
    [],
  );

  useFrame((state) => {
    const mat = matRef.current;
    if (!mat) return;
    const u = mat.uniforms as {
      uTime: { value: number };
      uMouse: { value: THREE.Vector2 };
      uResolution: { value: THREE.Vector2 };
    };
    if (animate) u.uTime.value = state.clock.elapsedTime;
    smoothMouse.current.lerp(state.pointer, 0.05);
    u.uMouse.value.copy(smoothMouse.current);
    u.uResolution.value.set(state.size.width, state.size.height);
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}

/**
 * Full-bleed shader gradient for the home hero. Renders client-only —
 * pre-hydration the parent container shows the matching CSS gradient.
 * Reduced-motion users get a static frame (no time animation).
 */
export function HeroShader() {
  const reduced = useReducedMotion();
  return (
    <Canvas
      orthographic
      dpr={[1, 1.5]}
      gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
      camera={{ near: -1, far: 1, position: [0, 0, 0] }}
      className="absolute inset-0"
      aria-hidden="true"
    >
      <ShaderPlane animate={!reduced} />
    </Canvas>
  );
}
