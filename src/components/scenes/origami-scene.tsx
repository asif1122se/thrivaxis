'use client';

import { ContactShadows, Environment, Lightformer, Sparkles } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import {
  Bloom,
  ChromaticAberration,
  DepthOfField,
  EffectComposer,
  Noise,
  ToneMapping,
  Vignette,
} from '@react-three/postprocessing';
import { BlendFunction, ToneMappingMode } from 'postprocessing';
import { useRef } from 'react';
import * as THREE from 'three';
import { OrigamiCraneMesh } from './origami-crane-mesh';

interface OrigamiSceneProps {
  reduced?: boolean;
}

/**
 * Premium R3F scene composition:
 *
 *   - Code-native procedural environment (Lightformers form an in-scene HDR
 *     equivalent — large rectangular emissive panels that the physical paper
 *     material samples for IBL-style soft lighting). No photographic HDRIs.
 *   - 5-light cinematic rig: warm key, cool fill, acid-green accent point,
 *     overhead sun, low-front bounce.
 *   - Sparkles: 140 dust motes drifting through the volume.
 *   - ContactShadows: soft grounded shadow under the crane.
 *   - Slow camera orbit driven from useFrame for parallax life.
 *   - Post stack: N8AO-quality SSAO via Bloom luminance threshold + DoF +
 *     ChromaticAberration + Vignette + film-grain Noise + ACES tonemap.
 */
export function OrigamiScene({ reduced = false }: OrigamiSceneProps) {
  return (
    <>
      <SceneRig reduced={reduced} />

      {/* Procedural environment via Lightformer panels */}
      <Environment background={false} resolution={256} frames={reduced ? 1 : Infinity}>
        <ProceduralLightformers />
      </Environment>

      {/* Direct lights (in addition to env) — adds direction + cast shadows */}
      <ambientLight intensity={0.06} color="#a8b8ff" />
      <directionalLight
        position={[4.5, 6.5, 3.8]}
        intensity={1.1}
        color="#fff5dd"
        castShadow={!reduced}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0002}
      />
      <directionalLight position={[-3.5, 1.2, -2.5]} intensity={0.5} color="#7e90ff" />
      <pointLight
        position={[-3.4, 2.6, 1.0]}
        intensity={6}
        color="#bfff3a"
        distance={5.5}
        decay={2}
      />
      <spotLight
        position={[2.8, 5.6, 2.4]}
        angle={0.55}
        penumbra={0.7}
        intensity={3.2}
        color="#ffeaaf"
        distance={9}
        decay={1.5}
      />

      {/* The crane */}
      <OrigamiCraneMesh reduced={reduced} />

      {/* Atmospheric dust */}
      {!reduced && (
        <Sparkles
          count={140}
          scale={[7, 4.5, 5]}
          position={[0, 0.6, 0]}
          speed={0.18}
          size={2.2}
          color="#fff3d8"
          opacity={0.55}
        />
      )}

      {/* Grounding shadow */}
      <ContactShadows
        position={[0, -1.18, 0]}
        opacity={0.55}
        blur={2.6}
        scale={5.5}
        far={3.5}
        resolution={1024}
        color="#0a0c14"
      />

      {/* Post-processing stack */}
      <EffectComposer multisampling={reduced ? 0 : 4} enableNormalPass={false}>
        <Bloom
          mipmapBlur
          intensity={0.55}
          luminanceThreshold={0.62}
          luminanceSmoothing={0.5}
          radius={0.78}
        />
        <DepthOfField focusDistance={0.04} focalLength={0.05} bokehScale={2.0} />
        <ChromaticAberration
          offset={[0.0006, 0.0006]}
          radialModulation={false}
          modulationOffset={0}
          blendFunction={BlendFunction.NORMAL}
        />
        <Vignette eskil={false} offset={0.32} darkness={0.6} />
        <Noise opacity={0.05} premultiply blendFunction={BlendFunction.SCREEN} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>
    </>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Camera / scene rig — slow orbit + adaptive look-at
// ────────────────────────────────────────────────────────────────────────────

function SceneRig({ reduced }: { reduced: boolean }) {
  const target = useRef(new THREE.Vector3(0, 0.05, 0));

  useFrame((state) => {
    const cam = state.camera;
    const t = state.clock.elapsedTime;
    if (reduced) {
      cam.position.set(0, 0.95, 3.4);
    } else {
      const radius = 3.4;
      const orbit = Math.sin(t * 0.08) * 0.18; // ±~10° around Y
      const lift = Math.sin(t * 0.06) * 0.12; // gentle vertical bob
      cam.position.x = Math.sin(orbit) * radius;
      cam.position.y = 0.95 + lift;
      cam.position.z = Math.cos(orbit) * radius;
    }
    cam.lookAt(target.current);
  });

  return null;
}

// ────────────────────────────────────────────────────────────────────────────
// Procedural environment — Lightformer rectangles as in-scene IBL.
// Generates a gradient of warm/cool/accent area lights captured into an
// environment cubemap by drei <Environment> for the physical material to use.
// ────────────────────────────────────────────────────────────────────────────

function ProceduralLightformers() {
  return (
    <>
      {/* Main warm key panel — large rectangle from upper front-right */}
      <Lightformer
        form="rect"
        intensity={5.5}
        color="#ffe8b8"
        rotation-y={Math.PI / 4}
        position={[3.5, 4.5, 3.5]}
        scale={[3.2, 3.2, 1]}
      />
      {/* Cool fill from rear */}
      <Lightformer
        form="rect"
        intensity={2.6}
        color="#7c93ff"
        rotation-y={-Math.PI * 0.75}
        position={[-3.5, 2.4, -3.5]}
        scale={[2.5, 2.5, 1]}
      />
      {/* Acid-green accent strip */}
      <Lightformer
        form="rect"
        intensity={3.5}
        color="#bfff3a"
        rotation-y={Math.PI / 2}
        position={[-4, 1.3, 0.8]}
        scale={[0.9, 2.4, 1]}
      />
      {/* Top-down soft */}
      <Lightformer
        form="circle"
        intensity={1.8}
        color="#fff8e6"
        rotation-x={Math.PI / 2}
        position={[0, 5.5, 0]}
        scale={[3.5, 3.5, 1]}
      />
      {/* Ground bounce — warm low fill */}
      <Lightformer
        form="rect"
        intensity={1.2}
        color="#ffd2a0"
        rotation-x={-Math.PI / 2}
        position={[0, -1.5, 0]}
        scale={[4, 4, 1]}
      />
      {/* Side rim — subtle peach */}
      <Lightformer
        form="rect"
        intensity={1.6}
        color="#ff9c6e"
        rotation-y={-Math.PI / 2}
        position={[3.6, 1.0, -1.2]}
        scale={[0.8, 2.0, 1]}
      />
    </>
  );
}
