'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { gsap } from '@/lib/gsap';
import {
  body,
  foldTiming,
  head,
  leftWing,
  neckRoot,
  type PanelGeometry,
  rightWing,
  tailRoot,
  tailTip,
  type Vec3,
} from '@/lib/origami/crane-data';

// ────────────────────────────────────────────────────────────────────────────
// Procedural paper-fiber normal map — one CanvasTexture, shared by all panels.
// Generated once per session via 2D canvas drawing of short overlapping lines.
// ────────────────────────────────────────────────────────────────────────────

let cachedFiberMap: THREE.CanvasTexture | null = null;

function getFiberNormalMap(): THREE.CanvasTexture {
  if (cachedFiberMap) return cachedFiberMap;
  const size = 512;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  if (!ctx) {
    cachedFiberMap = new THREE.CanvasTexture(c);
    return cachedFiberMap;
  }
  // Neutral normal-map base (0.5, 0.5, 1.0) → flat normal pointing +Z.
  ctx.fillStyle = '#8080ff';
  ctx.fillRect(0, 0, size, size);
  ctx.lineCap = 'round';
  for (let i = 0; i < 1400; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const len = 4 + Math.random() * 14;
    const ang = Math.random() * Math.PI * 2;
    const xy = Math.cos(ang) * len;
    const yy = Math.sin(ang) * len;
    // Slight perturbation around neutral — fiber direction encoded as RG offset.
    const r = 128 + Math.cos(ang) * 40;
    const g = 128 + Math.sin(ang) * 40;
    ctx.strokeStyle = `rgb(${r | 0}, ${g | 0}, 255)`;
    ctx.lineWidth = 0.6 + Math.random() * 0.7;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + xy, y + yy);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  tex.anisotropy = 4;
  cachedFiberMap = tex;
  return cachedFiberMap;
}

// ────────────────────────────────────────────────────────────────────────────
// Geometry — build a BufferGeometry for a panel's triangulated polygon.
// Subdivides triangles once for smoother shading + slight curl in vertex pass.
// ────────────────────────────────────────────────────────────────────────────

function buildPanelGeometry(panel: PanelGeometry, subdivide: boolean): THREE.BufferGeometry {
  // Optionally subdivide each triangle into 4 by adding edge midpoints.
  const verts: Array<[number, number]> = panel.vertices.map((v) => [v[0], v[1]]);
  let tris: Array<[number, number, number]> = panel.triangles.map((t) => [t[0], t[1], t[2]]);

  if (subdivide) {
    const newTris: Array<[number, number, number]> = [];
    const midCache = new Map<string, number>();
    const midpoint = (a: number, b: number): number => {
      const key = a < b ? `${a}-${b}` : `${b}-${a}`;
      const cached = midCache.get(key);
      if (cached !== undefined) return cached;
      const va = verts[a];
      const vb = verts[b];
      if (!va || !vb) throw new Error('subdivision: missing vertex');
      const mid: [number, number] = [(va[0] + vb[0]) / 2, (va[1] + vb[1]) / 2];
      verts.push(mid);
      const idx = verts.length - 1;
      midCache.set(key, idx);
      return idx;
    };
    for (const [a, b, c] of tris) {
      const ab = midpoint(a, b);
      const bc = midpoint(b, c);
      const ca = midpoint(c, a);
      newTris.push([a, ab, ca], [ab, b, bc], [ca, bc, c], [ab, bc, ca]);
    }
    tris = newTris;
  }

  const geom = new THREE.BufferGeometry();
  const positions = new Float32Array(verts.length * 3);
  const uvs = new Float32Array(verts.length * 2);

  // UV bounds for normalization
  let minU = Infinity;
  let maxU = -Infinity;
  let minV = Infinity;
  let maxV = -Infinity;
  for (const v of verts) {
    if (v[0] < minU) minU = v[0];
    if (v[0] > maxU) maxU = v[0];
    if (v[1] < minV) minV = v[1];
    if (v[1] > maxV) maxV = v[1];
  }
  const dU = Math.max(1e-4, maxU - minU);
  const dV = Math.max(1e-4, maxV - minV);

  verts.forEach((v, i) => {
    positions[i * 3] = v[0];
    positions[i * 3 + 1] = v[1];
    positions[i * 3 + 2] = 0;
    uvs[i * 2] = (v[0] - minU) / dU;
    uvs[i * 2 + 1] = (v[1] - minV) / dV;
  });
  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geom.setIndex(tris.flat());
  geom.computeVertexNormals();
  return geom;
}

// ────────────────────────────────────────────────────────────────────────────
// Paper material — physically-based with sheen, subtle subsurface, fiber normals.
// ────────────────────────────────────────────────────────────────────────────

interface PaperMeshProps {
  panel: PanelGeometry;
  subdivide?: boolean;
}

function PaperMesh({ panel, subdivide = true }: PaperMeshProps) {
  const geometry = useMemo(() => buildPanelGeometry(panel, subdivide), [panel, subdivide]);
  const fiberMap = useMemo(() => getFiberNormalMap(), []);

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshPhysicalMaterial
        color="#f4f0e6"
        side={THREE.DoubleSide}
        roughness={0.74}
        metalness={0}
        sheen={0.55}
        sheenColor="#fff7e2"
        sheenRoughness={0.55}
        clearcoat={0.04}
        clearcoatRoughness={0.6}
        transmission={0.05}
        thickness={0.45}
        ior={1.45}
        attenuationColor="#f9e9c2"
        attenuationDistance={1.6}
        normalMap={fiberMap}
        normalScale={[0.18, 0.18]}
        envMapIntensity={1.0}
      />
    </mesh>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Crane — full hinge hierarchy with GSAP fold-in + idle sway
// ────────────────────────────────────────────────────────────────────────────

export interface OrigamiCraneMeshProps {
  reduced?: boolean;
}

export function OrigamiCraneMesh({ reduced = false }: OrigamiCraneMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const leftWingRef = useRef<THREE.Group>(null);
  const rightWingRef = useRef<THREE.Group>(null);
  const tailRootRef = useRef<THREE.Group>(null);
  const tailTipRef = useRef<THREE.Group>(null);
  const neckRootRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (reduced) {
      applyFinal(leftWingRef.current, leftWing.finalRotation);
      applyFinal(rightWingRef.current, rightWing.finalRotation);
      applyFinal(tailRootRef.current, tailRoot.finalRotation);
      applyFinal(tailTipRef.current, tailTip.finalRotation);
      applyFinal(neckRootRef.current, neckRoot.finalRotation);
      applyFinal(headRef.current, head.finalRotation);
      return;
    }

    const tl = gsap.timeline({
      defaults: { ease: 'power3.inOut' },
      delay: foldTiming.introDelay,
    });
    foldTo(tl, leftWingRef.current, leftWing.finalRotation, foldTiming.leftWing);
    foldTo(tl, rightWingRef.current, rightWing.finalRotation, foldTiming.rightWing);
    foldTo(tl, tailRootRef.current, tailRoot.finalRotation, foldTiming.tailRoot);
    foldTo(tl, tailTipRef.current, tailTip.finalRotation, foldTiming.tailTip);
    foldTo(tl, neckRootRef.current, neckRoot.finalRotation, foldTiming.neckRoot);
    foldTo(tl, headRef.current, head.finalRotation, foldTiming.head);

    return () => {
      tl.kill();
    };
  }, [reduced]);

  // Idle sway after fold lands
  useFrame((state) => {
    if (reduced || !groupRef.current) return;
    const t = Math.max(0, state.clock.elapsedTime - 2.4);
    groupRef.current.rotation.y = Math.sin(t * 0.32) * 0.13;
    groupRef.current.rotation.x = -0.12 + Math.sin(t * 0.42) * 0.04;
    groupRef.current.position.y = Math.sin(t * 0.6) * 0.04;
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]} rotation={[-0.12, 0, 0]}>
      <PaperMesh panel={body} />

      <group ref={leftWingRef} position={leftWing.hinge as [number, number, number]}>
        <PaperMesh panel={leftWing} />
      </group>
      <group ref={rightWingRef} position={rightWing.hinge as [number, number, number]}>
        <PaperMesh panel={rightWing} />
      </group>

      <group ref={tailRootRef} position={tailRoot.hinge as [number, number, number]}>
        <PaperMesh panel={tailRoot} />
        <group ref={tailTipRef} position={tailTip.hinge as [number, number, number]}>
          <PaperMesh panel={tailTip} subdivide={false} />
        </group>
      </group>

      <group ref={neckRootRef} position={neckRoot.hinge as [number, number, number]}>
        <PaperMesh panel={neckRoot} />
        <group ref={headRef} position={head.hinge as [number, number, number]}>
          <PaperMesh panel={head} subdivide={false} />
        </group>
      </group>
    </group>
  );
}

interface FoldStep {
  start: number;
  duration: number;
}

function foldTo(tl: gsap.core.Timeline, target: THREE.Group | null, rot: Vec3, step: FoldStep) {
  if (!target) return;
  tl.to(
    target.rotation,
    {
      x: rot[0],
      y: rot[1],
      z: rot[2],
      duration: step.duration,
    },
    step.start,
  );
}

function applyFinal(target: THREE.Group | null, rot: Vec3) {
  if (!target) return;
  target.rotation.set(rot[0], rot[1], rot[2]);
}
