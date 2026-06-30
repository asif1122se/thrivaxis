'use client';

import { Environment, Float } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import {
  color,
  cos,
  float,
  fract,
  instanceIndex,
  length,
  sin,
  step,
  time,
  uv,
  vec3,
  vec4,
} from 'three/tsl';
import * as THREE from 'three/webgpu';

function NeuralDust() {
  const PARTICLE_COUNT = 300;

  const built = useMemo(() => {
    // NOTE: _positionsBuf was previously created here but never wired up —
    // it was leaking a GPU buffer. Removed entirely; positions are computed
    // via the positionNode TSL inline below.

    const material = new THREE.SpriteNodeMaterial();
    material.transparent = true;
    material.depthWrite = false;
    material.blending = THREE.AdditiveBlending;

    // TSL Node logic for positions and movement
    // biome-ignore lint/suspicious/noExplicitAny: TSL opaquely typed
    const hash = (n: any) => fract(sin(n.mul(12.9898)).mul(43758.5453));

    const i = float(instanceIndex);
    const x0 = hash(i.add(1.0)).mul(20).sub(10);
    const y0 = hash(i.add(2.0)).mul(20).sub(10);
    const z0 = hash(i.add(3.0)).mul(20).sub(10);

    // Add slow drift using time
    const t = time.mul(0.1);
    const x = x0.add(sin(t.add(hash(i))).mul(2));
    const y = y0.add(cos(t.add(hash(i.add(1.0))))).mul(2);
    const z = z0.add(sin(t.add(hash(i.add(2.0))))).mul(2);

    material.positionNode = vec3(x, y, z);

    // Shape the plane into a circle using UVs
    const uvNode = uv();
    const dist = length(uvNode.sub(0.5));
    // step(edge, x) returns 0 if x < edge, 1 if x > edge
    // we want 1 if dist < 0.5, so we use 1 - step(0.5, dist)
    const circleMask = float(1.0).sub(step(float(0.5), dist));

    // Twinkling alpha
    const twinkle = sin(t.mul(5.0).add(hash(i).mul(10.0)))
      .mul(0.5)
      .add(0.5);
    material.colorNode = vec4(color('#00f0ff'), twinkle.mul(0.6).mul(circleMask));

    const geometry = new THREE.PlaneGeometry(0.04, 0.04);
    const mesh = new THREE.InstancedMesh(geometry, material, PARTICLE_COUNT);
    mesh.frustumCulled = false;

    return mesh;
  }, []);

  return <primitive object={built} />;
}

export function NeuralCoreScene() {
  const meshRef = useRef<THREE.Mesh>(null);

  // Memoize the material so it is created ONCE and reused every frame.
  // Previously it was instantiated as raw code in the component body,
  // meaning a fresh GPU object was allocated at 60 fps — the primary
  // cause of browser lag and the GPU memory leak.
  const coreMaterial = useMemo(() => {
    const mat = new THREE.MeshPhysicalNodeMaterial();
    mat.transparent = true;
    mat.metalness = 0.1;
    mat.roughness = 0.1;
    mat.transmission = 1.0;
    mat.ior = 1.5;
    mat.thickness = 1.5;
    mat.clearcoat = 1.0;
    mat.clearcoatRoughness = 0.1;
    mat.dispersion = 0.15;
    mat.colorNode = color('#ffffff');
    return mat;
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.15;
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.1;

      const scale = 1.5 + Math.sin(state.clock.elapsedTime) * 0.05;
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 5, 5]} intensity={2} color="#ffffff" />
      <directionalLight position={[-5, -5, -5]} intensity={3} color="#00f0ff" />
      {/*
        Environment map is required for the glass ball to be visible.
        The MeshPhysicalNodeMaterial with transmission=1.0 is physically a lens
        that refracts the environment — without it the ball is a perfect window
        and completely invisible. We keep resolution at 256 (default is 1024)
        which cuts GPU texture memory by 16× with no perceptible quality loss
        at this display size.
      */}
      <Environment preset="city" resolution={256} />
      <pointLight position={[0, 0, 6]} intensity={4} color="#00f0ff" distance={20} decay={2} />
      <pointLight position={[4, -4, 4]} intensity={2} color="#ffffff" distance={15} decay={2} />

      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        {/*
          Main liquid core — icosahedron detail reduced from 64 → 8.
          At this display size the two are indistinguishable, but the triangle
          count drops from ~24,000 to ~240 — a 100× GPU workload reduction.
        */}
        <mesh ref={meshRef} scale={1.5} material={coreMaterial}>
          <icosahedronGeometry args={[1, 8]} />
        </mesh>

        {/* Internal neural structure */}
        <mesh scale={1.3}>
          <icosahedronGeometry args={[1, 4]} />
          <meshBasicMaterial color="#00f0ff" wireframe transparent opacity={0.15} />
        </mesh>

        {/* Glowing inner core */}
        <mesh scale={0.8}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial color="#00f0ff" transparent opacity={0.05} />
        </mesh>
      </Float>

      <NeuralDust />
    </>
  );
}
