'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import {
  clamp,
  cos,
  deltaTime,
  Fn,
  float,
  fract,
  instancedArray,
  instanceIndex,
  length,
  max,
  min,
  mix,
  oneMinus,
  sin,
  time,
  uniform,
  vec3,
  vec4,
} from 'three/tsl';
import * as THREE from 'three/webgpu';

const PARTICLE_COUNT = 30000;
const TARGET_RADIUS = 1.15;

interface FluidOrbSceneProps {
  /** RGB triplet 0..1 — colour the further-aged particles drift toward. */
  accent: readonly [number, number, number];
  /** Per-particle quad size in world units; smaller = denser-feeling cloud. */
  particleSize?: number;
}

/**
 * TSL compute-shader particle orb.
 *
 *  - 30 000 particles distributed on a Fibonacci sphere at init.
 *  - Each frame: curl-like swirling velocity + radial spring back to the
 *    target radius + cursor repulsion. Damped, integrated, looped.
 *  - Rendered as billboarded sprites with additive blending; colour blends
 *    white → accent across the cloud, with soft alpha falloff at the edge.
 *  - Runs on the WebGPU compute backend exclusively; the wrapper falls
 *    back to a static CSS gradient on browsers without WebGPU.
 */
export function FluidOrbScene({ accent, particleSize = 0.02 }: FluidOrbSceneProps) {
  const gl = useThree((s) => s.gl);
  const initialized = useRef(false);

  const built = useMemo(() => {
    // Storage buffers — three vec3/float per-particle arrays in GPU memory.
    const positionsBuf = instancedArray(PARTICLE_COUNT, 'vec3');
    const velocitiesBuf = instancedArray(PARTICLE_COUNT, 'vec3');
    const seedsBuf = instancedArray(PARTICLE_COUNT, 'float');

    // Live uniforms — driven from React via .value.
    const cursorPos = uniform(new THREE.Vector3(5, 5, 5));
    const accentColor = uniform(new THREE.Color(accent[0], accent[1], accent[2]));
    const targetR = uniform(TARGET_RADIUS);

    // Inline TSL helpers — composed at graph-build time, not called at runtime.
    // biome-ignore lint/suspicious/noExplicitAny: TSL nodes are opaquely typed
    const hash = (n: any) => fract(sin(n.mul(12.9898)).mul(43758.5453));

    // Cheap "curl-like" swirling vector field — interlocking sin/cos lobes
    // give the cloud its flowing motion without a real curl-noise gradient.
    // biome-ignore lint/suspicious/noExplicitAny: TSL nodes are opaquely typed
    const swirl = (p: any) => {
      const t = time.mul(0.15);
      const x = sin(p.y.mul(1.7).add(t.mul(0.7))).mul(cos(p.z.mul(1.9).add(t.mul(0.4))));
      const y = sin(p.z.mul(1.3).add(t.mul(0.9))).mul(cos(p.x.mul(1.6).add(t.mul(0.6))));
      const z = sin(p.x.mul(1.5).add(t.mul(0.5))).mul(cos(p.y.mul(1.8).add(t.mul(0.8))));
      return vec3(x, y, z);
    };

    // Init kernel — Fibonacci sphere distribution + zero velocity + random seed.
    const computeInit = Fn(() => {
      const i = float(instanceIndex);
      const total = float(PARTICLE_COUNT);
      const phi = i.mul(2.39996323);
      const z = i.div(total).mul(2.0).sub(1.0);
      const r = float(1.0).sub(z.mul(z)).sqrt();
      const x = r.mul(cos(phi));
      const y = r.mul(sin(phi));
      const wobble = hash(i.add(0.13)).mul(0.05);
      const radius = float(TARGET_RADIUS).add(wobble);
      positionsBuf.element(instanceIndex).assign(vec3(x, y, z).mul(radius));
      velocitiesBuf.element(instanceIndex).assign(vec3(0.0));
      seedsBuf.element(instanceIndex).assign(hash(i.add(7.3)));
    })().compute(PARTICLE_COUNT);

    // Update kernel — swirl + radial spring + cursor repulsion + damping.
    const computeUpdate = Fn(() => {
      const p = positionsBuf.element(instanceIndex);
      const v = velocitiesBuf.element(instanceIndex);

      const swirlForce = swirl(p.mul(0.5)).mul(0.32);

      const len = length(p);
      const safeLen = max(len, float(0.001));
      const dir = p.div(safeLen);
      const radial = dir.mul(targetR.sub(len)).mul(0.85);

      const cursorVec = p.sub(cursorPos);
      const cursorDist = length(cursorVec);
      const safeCD = max(cursorDist, float(0.001));
      const repelMag = max(float(0.0), float(0.7).sub(cursorDist)).mul(3.6);
      const repel = cursorVec.div(safeCD).mul(repelMag);

      const newV = v.add(swirlForce).add(radial).add(repel).mul(0.93);
      const dt = min(deltaTime, float(0.05));
      const newP = p.add(newV.mul(dt));

      positionsBuf.element(instanceIndex).assign(newP);
      velocitiesBuf.element(instanceIndex).assign(newV);
    })().compute(PARTICLE_COUNT);

    // Render material — billboarded sprite, additive, soft-edge falloff.
    const material = new THREE.SpriteNodeMaterial();
    material.positionNode = positionsBuf.element(instanceIndex);

    const seed = seedsBuf.element(instanceIndex);
    const pHere = positionsBuf.element(instanceIndex);
    const lenHere = length(pHere);

    const baseCol = vec3(0.92, 0.97, 1.0);
    const colorMix = mix(baseCol, accentColor, seed.mul(0.85));

    // Particles deep inside the orb stay bright; outer-edge ones fade out.
    const edge = clamp(lenHere.sub(float(TARGET_RADIUS - 0.25)).div(0.55), 0, 1);
    const fall = oneMinus(edge);
    const alpha = float(0.55).mul(fall).add(0.18);

    material.colorNode = vec4(colorMix, alpha);
    material.depthWrite = false;
    material.transparent = true;
    material.blending = THREE.AdditiveBlending;

    const geometry = new THREE.PlaneGeometry(particleSize, particleSize);
    const mesh = new THREE.InstancedMesh(geometry, material, PARTICLE_COUNT);
    mesh.frustumCulled = false;

    return { mesh, computeInit, computeUpdate, cursorPos };
    // accent.length is a primitive triplet so deps are reference-stable enough;
    // intentional dependency list — recreating on accent change is the point.
  }, [accent, particleSize]);

  // Initial compute pass — fire once when the WebGPU renderer is live.
  useEffect(() => {
    // biome-ignore lint/suspicious/noExplicitAny: WebGPURenderer typed via three/webgpu, not three core
    const renderer: any = gl;
    if (typeof renderer?.computeAsync !== 'function' || initialized.current) return;
    renderer
      .computeAsync(built.computeInit)
      .then(() => {
        initialized.current = true;
      })
      .catch(() => {
        /* surfaced via wrapper's WebGPU probe — silent here */
      });
  }, [gl, built]);

  // Per-frame: dispatch update compute + sync cursor uniform.
  useFrame((state) => {
    // biome-ignore lint/suspicious/noExplicitAny: WebGPURenderer typed via three/webgpu
    const renderer: any = state.gl;
    if (typeof renderer?.computeAsync !== 'function') return;
    if (initialized.current) {
      renderer.computeAsync(built.computeUpdate).catch(() => {});
    }
    built.cursorPos.value.set(state.pointer.x * 1.6, state.pointer.y * 1.1, 0.2);
  });

  return <primitive object={built.mesh} />;
}
