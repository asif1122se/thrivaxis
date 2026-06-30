'use client';

import { type RefObject, useEffect, useState } from 'react';
import {
  BLACKHOLE_UNIFORM_BYTES,
  type BlackHoleUniformValues,
  packBlackHoleUniforms,
} from '@/lib/canvas/blackhole-uniforms';
import {
  BLACKHOLE_BLOOM_WGSL,
  BLACKHOLE_BLUR_H_WGSL,
  BLACKHOLE_BLUR_V_WGSL,
  BLACKHOLE_IMAGE_WGSL,
  BLACKHOLE_STARFIELD_GEN_WGSL,
  BLACKHOLE_WGSL,
} from '@/lib/canvas/wgsl/blackhole';

export type BlackHoleStatus = 'pending' | 'ready' | 'unsupported' | 'error';

export interface UseBlackHoleRendererOptions {
  /** Render a single warmed-up frame, then freeze (battery / reduced-motion). */
  staticFrame: boolean;
  /** Pause the loop when the canvas leaves the viewport. Defaults to true. */
  pauseOffscreen?: boolean;
  /** Hard ceiling on devicePixelRatio. Adaptive tier may lower this further. */
  maxDpr?: number;
}

const DEFAULT_MAX_DPR = 1.5;
const STATIC_FRAME_TIME = 6.0;
const WARMUP_DURATION_S = 1.6;
const HDR_FORMAT: GPUTextureFormat = 'rgba16float';
const STARCUBE_FACE_SIZE = 1024;

/**
 * Static initial camera mapping. Tuned to match the reference image framing:
 *   - distance gives a moderate-size BH (not huge, not microscopic)
 *   - low y so we view the disk near edge-on
 */
const CAM_POS: readonly [number, number, number] = [0.0, -3.0, 35.0];
const CAM_FWD_RAW: readonly [number, number, number] = [0.0, 0.085, -1.0];
const WORLD_UP_HINT: readonly [number, number, number] = [-0.4, 1.0, 0.0];

const DISK_INNER_M = 1.5;
const DISK_OUTER_M = 25.0;
const BH_MASS = 0.5;
const SPIN = 0.99;
const FOV_RAD = 60 * (Math.PI / 180);
const POINTER_LERP = 0.06;

function normalize3(v: readonly [number, number, number]): [number, number, number] {
  const len = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / len, v[1] / len, v[2] / len];
}

function cross3(
  a: readonly [number, number, number],
  b: readonly [number, number, number],
): [number, number, number] {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

interface CameraBasis {
  fwd: [number, number, number];
  right: [number, number, number];
  up: [number, number, number];
}

function computeCameraBasis(): CameraBasis {
  const fwd = normalize3(CAM_FWD_RAW);
  const right = normalize3(cross3(fwd, WORLD_UP_HINT));
  const up = normalize3(cross3(right, fwd));
  return { fwd, right, up };
}

interface TierState {
  dprMul: number;
  frameTimes: number[];
  lastAdjustMs: number;
}

function adjustTier(state: TierState, frameTimeMs: number, nowMs: number): boolean {
  state.frameTimes.push(frameTimeMs);
  if (state.frameTimes.length < 24) return false;
  if (nowMs - state.lastAdjustMs < 1500) return false;

  const sorted = [...state.frameTimes].sort((a, b) => a - b);
  const mid = sorted[Math.floor(sorted.length / 2)] ?? 16;
  state.frameTimes = [];
  state.lastAdjustMs = nowMs;

  const prev = state.dprMul;
  if (mid < 11 && state.dprMul < 1.0) state.dprMul = Math.min(1.0, state.dprMul + 0.1);
  else if (mid > 22 && state.dprMul > 0.5) state.dprMul = Math.max(0.5, state.dprMul - 0.12);
  else if (mid > 32 && state.dprMul > 0.4) state.dprMul = Math.max(0.4, state.dprMul - 0.18);
  return state.dprMul !== prev;
}

/**
 * Multi-pass WebGPU pipeline matching the Shadertoy reference exactly:
 *   Pass A     — GR raytrace + ApplyToneMapping (HDR)        → texA
 *   Pass Bloom — 8-octave mip pyramid in atlas layout        → texBloom
 *   Pass H     — horizontal Gaussian blur of the bloom atlas → texBlurH
 *   Pass V     — vertical Gaussian blur                      → texBlurV
 *   Pass Image — bicubic upsample · sum 8 octaves · final tonemap → canvas
 */
export function useBlackHoleRenderer(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  options: UseBlackHoleRendererOptions,
): BlackHoleStatus {
  const { staticFrame, pauseOffscreen = true, maxDpr = DEFAULT_MAX_DPR } = options;
  const [status, setStatus] = useState<BlackHoleStatus>('pending');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gpu = typeof navigator === 'undefined' ? undefined : navigator.gpu;
    if (!gpu) {
      setStatus('unsupported');
      return;
    }

    let cancelled = false;
    let rafId = 0;
    let device: GPUDevice | null = null;
    let context: GPUCanvasContext | null = null;
    let canvasFormat: GPUTextureFormat = 'bgra8unorm';
    let uniformBuffer: GPUBuffer | null = null;
    let sampler: GPUSampler | null = null;
    let cubeSampler: GPUSampler | null = null;
    let pipelineA: GPURenderPipeline | null = null;
    let pipelineBloom: GPURenderPipeline | null = null;
    let pipelineBlurH: GPURenderPipeline | null = null;
    let pipelineBlurV: GPURenderPipeline | null = null;
    let pipelineImage: GPURenderPipeline | null = null;
    let texA: GPUTexture | null = null;
    let texBloom: GPUTexture | null = null;
    let texBlurH: GPUTexture | null = null;
    let texBlurV: GPUTexture | null = null;
    let texStarCube: GPUTexture | null = null;
    let starCubeViewSampling: GPUTextureView | null = null;
    let bindGroupA: GPUBindGroup | null = null;
    let bindGroupBloom: GPUBindGroup | null = null;
    let bindGroupBlurH: GPUBindGroup | null = null;
    let bindGroupBlurV: GPUBindGroup | null = null;
    let bindGroupImage: GPUBindGroup | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let intersectionObserver: IntersectionObserver | null = null;
    let visible = true;
    let docVisible = true;

    const tier: TierState = { dprMul: 0.85, frameTimes: [], lastAdjustMs: 0 };

    const pointerTarget = { x: 0, y: 0 };
    const pointerSmooth = { x: 0, y: 0 };
    let scroll = 0;
    let lastFrameMs = 0;
    let startTime = performance.now();

    const basis = computeCameraBasis();

    const onPointer = (e: PointerEvent) => {
      pointerTarget.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointerTarget.y = (1 - e.clientY / window.innerHeight) * 2 - 1;
    };
    const onScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      scroll = Math.min(1, Math.max(0, window.scrollY / max));
    };
    const onVisibility = () => {
      docVisible = document.visibilityState === 'visible';
      if (docVisible && visible && !staticFrame && !cancelled && !rafId) {
        startTime = performance.now() - WARMUP_DURATION_S * 1000;
        rafId = requestAnimationFrame(tick);
      }
    };

    const uniformBytes = new ArrayBuffer(BLACKHOLE_UNIFORM_BYTES);
    const uniformValues: BlackHoleUniformValues = {
      resX: 1,
      resY: 1,
      time: 0,
      warmup: 1,
      camPosX: CAM_POS[0],
      camPosY: CAM_POS[1],
      camPosZ: CAM_POS[2],
      spin: SPIN,
      camFwdX: basis.fwd[0],
      camFwdY: basis.fwd[1],
      camFwdZ: basis.fwd[2],
      fov: Math.tan(FOV_RAD / 2),
      camRightX: basis.right[0],
      camRightY: basis.right[1],
      camRightZ: basis.right[2],
      diskInner: DISK_INNER_M,
      camUpX: basis.up[0],
      camUpY: basis.up[1],
      camUpZ: basis.up[2],
      diskOuter: DISK_OUTER_M,
      bhMass: BH_MASS,
      pointerX: 0,
      pointerY: 0,
      bloomIntensity: 1.0,
      scroll: 0,
      backgroundBrightmut: 1.0,
      jetIntensity: 1.0,
      charge: 0.0,
    };

    const createIntermediateTex = (w: number, h: number): GPUTexture => {
      if (!device) throw new Error('device not ready');
      return device.createTexture({
        size: [w, h, 1],
        format: HDR_FORMAT,
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT,
      });
    };

    const recreateIntermediateTextures = (w: number, h: number) => {
      if (
        !device ||
        !pipelineA ||
        !pipelineBloom ||
        !pipelineBlurH ||
        !pipelineBlurV ||
        !pipelineImage
      )
        return;
      texA?.destroy();
      texBloom?.destroy();
      texBlurH?.destroy();
      texBlurV?.destroy();
      texA = createIntermediateTex(w, h);
      texBloom = createIntermediateTex(w, h);
      texBlurH = createIntermediateTex(w, h);
      texBlurV = createIntermediateTex(w, h);

      if (!sampler || !uniformBuffer) return;

      if (!starCubeViewSampling || !cubeSampler) {
        throw new Error('starcube not initialized before bindGroupA creation');
      }
      bindGroupA = device.createBindGroup({
        layout: pipelineA.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: uniformBuffer } },
          { binding: 1, resource: starCubeViewSampling },
          { binding: 2, resource: cubeSampler },
        ],
      });
      bindGroupBloom = device.createBindGroup({
        layout: pipelineBloom.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: uniformBuffer } },
          { binding: 1, resource: texA.createView() },
          { binding: 2, resource: sampler },
        ],
      });
      bindGroupBlurH = device.createBindGroup({
        layout: pipelineBlurH.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: uniformBuffer } },
          { binding: 1, resource: texBloom.createView() },
          { binding: 2, resource: sampler },
        ],
      });
      bindGroupBlurV = device.createBindGroup({
        layout: pipelineBlurV.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: uniformBuffer } },
          { binding: 1, resource: texBlurH.createView() },
          { binding: 2, resource: sampler },
        ],
      });
      bindGroupImage = device.createBindGroup({
        layout: pipelineImage.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: uniformBuffer } },
          { binding: 1, resource: texA.createView() },
          { binding: 2, resource: texBlurV.createView() },
          { binding: 3, resource: sampler },
        ],
      });
    };

    const sizeCanvas = () => {
      if (!canvas) return;
      const baseDpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      const dpr = baseDpr * tier.dprMul;
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      const sizeChanged = canvas.width !== w || canvas.height !== h;
      if (canvas.width !== w) canvas.width = w;
      if (canvas.height !== h) canvas.height = h;
      uniformValues.resX = w;
      uniformValues.resY = h;
      if (sizeChanged) {
        recreateIntermediateTextures(w, h);
      }
    };

    const drawFrame = (nowMs: number) => {
      if (
        !device ||
        !pipelineA ||
        !pipelineBloom ||
        !pipelineBlurH ||
        !pipelineBlurV ||
        !pipelineImage ||
        !context ||
        !uniformBuffer ||
        !texA ||
        !texBloom ||
        !texBlurH ||
        !texBlurV ||
        !bindGroupA ||
        !bindGroupBloom ||
        !bindGroupBlurH ||
        !bindGroupBlurV ||
        !bindGroupImage
      ) {
        return;
      }

      pointerSmooth.x = pointerSmooth.x + (pointerTarget.x - pointerSmooth.x) * POINTER_LERP;
      pointerSmooth.y = pointerSmooth.y + (pointerTarget.y - pointerSmooth.y) * POINTER_LERP;

      const elapsed = (nowMs - startTime) / 1000;
      uniformValues.time = elapsed;
      uniformValues.warmup = Math.max(0, 1 - elapsed / WARMUP_DURATION_S);
      uniformValues.pointerX = pointerSmooth.x;
      uniformValues.pointerY = pointerSmooth.y;
      uniformValues.scroll = scroll;
      packBlackHoleUniforms(uniformBytes, uniformValues);
      device.queue.writeBuffer(uniformBuffer, 0, uniformBytes);

      const encoder = device.createCommandEncoder();

      // Pass A — GR raytrace → texA (HDR)
      {
        const pass = encoder.beginRenderPass({
          colorAttachments: [
            {
              view: texA.createView(),
              clearValue: { r: 0, g: 0, b: 0, a: 1 },
              loadOp: 'clear',
              storeOp: 'store',
            },
          ],
        });
        pass.setPipeline(pipelineA);
        pass.setBindGroup(0, bindGroupA);
        pass.draw(3);
        pass.end();
      }

      // Pass Bloom — mip pyramid → texBloom
      {
        const pass = encoder.beginRenderPass({
          colorAttachments: [
            {
              view: texBloom.createView(),
              clearValue: { r: 0, g: 0, b: 0, a: 1 },
              loadOp: 'clear',
              storeOp: 'store',
            },
          ],
        });
        pass.setPipeline(pipelineBloom);
        pass.setBindGroup(0, bindGroupBloom);
        pass.draw(3);
        pass.end();
      }

      // Pass Blur H → texBlurH
      {
        const pass = encoder.beginRenderPass({
          colorAttachments: [
            {
              view: texBlurH.createView(),
              clearValue: { r: 0, g: 0, b: 0, a: 1 },
              loadOp: 'clear',
              storeOp: 'store',
            },
          ],
        });
        pass.setPipeline(pipelineBlurH);
        pass.setBindGroup(0, bindGroupBlurH);
        pass.draw(3);
        pass.end();
      }

      // Pass Blur V → texBlurV
      {
        const pass = encoder.beginRenderPass({
          colorAttachments: [
            {
              view: texBlurV.createView(),
              clearValue: { r: 0, g: 0, b: 0, a: 1 },
              loadOp: 'clear',
              storeOp: 'store',
            },
          ],
        });
        pass.setPipeline(pipelineBlurV);
        pass.setBindGroup(0, bindGroupBlurV);
        pass.draw(3);
        pass.end();
      }

      // Pass Image — composite + tonemap → canvas
      {
        const view = context.getCurrentTexture().createView();
        const pass = encoder.beginRenderPass({
          colorAttachments: [
            {
              view,
              clearValue: { r: 0, g: 0, b: 0, a: 1 },
              loadOp: 'clear',
              storeOp: 'store',
            },
          ],
        });
        pass.setPipeline(pipelineImage);
        pass.setBindGroup(0, bindGroupImage);
        pass.draw(3);
        pass.end();
      }

      device.queue.submit([encoder.finish()]);
    };

    const tick = (nowMs: number) => {
      if (cancelled) return;
      rafId = 0;
      const frameTime = lastFrameMs ? nowMs - lastFrameMs : 16;
      lastFrameMs = nowMs;

      drawFrame(nowMs);

      if (adjustTier(tier, frameTime, nowMs)) {
        sizeCanvas();
      }

      if (visible && docVisible) {
        rafId = requestAnimationFrame(tick);
      }
    };

    const renderStaticFrame = () => {
      uniformValues.warmup = 0;
      uniformValues.time = STATIC_FRAME_TIME;
      uniformValues.pointerX = 0;
      uniformValues.pointerY = 0;
      pointerSmooth.x = 0;
      pointerSmooth.y = 0;
      drawFrame(performance.now());
    };

    const init = async () => {
      try {
        const adapter = await gpu.requestAdapter({ powerPreference: 'high-performance' });
        if (!adapter || cancelled) {
          if (!cancelled) setStatus('unsupported');
          return;
        }
        device = await adapter.requestDevice();
        if (cancelled) {
          device.destroy();
          device = null;
          return;
        }
        device.lost.then((info) => {
          if (cancelled) return;
          if (info.reason !== 'destroyed') setStatus('error');
        });

        context = canvas.getContext('webgpu');
        if (!context) {
          setStatus('unsupported');
          return;
        }
        canvasFormat = gpu.getPreferredCanvasFormat();
        context.configure({ device, format: canvasFormat, alphaMode: 'opaque' });

        // Build all 5 pipelines
        const moduleA = device.createShaderModule({ code: BLACKHOLE_WGSL });
        const moduleBloom = device.createShaderModule({ code: BLACKHOLE_BLOOM_WGSL });
        const moduleBlurH = device.createShaderModule({ code: BLACKHOLE_BLUR_H_WGSL });
        const moduleBlurV = device.createShaderModule({ code: BLACKHOLE_BLUR_V_WGSL });
        const moduleImage = device.createShaderModule({ code: BLACKHOLE_IMAGE_WGSL });

        pipelineA = device.createRenderPipeline({
          layout: 'auto',
          vertex: { module: moduleA, entryPoint: 'vs_main' },
          fragment: { module: moduleA, entryPoint: 'fs_main', targets: [{ format: HDR_FORMAT }] },
          primitive: { topology: 'triangle-list' },
        });
        pipelineBloom = device.createRenderPipeline({
          layout: 'auto',
          vertex: { module: moduleBloom, entryPoint: 'vs_main' },
          fragment: {
            module: moduleBloom,
            entryPoint: 'fs_main',
            targets: [{ format: HDR_FORMAT }],
          },
          primitive: { topology: 'triangle-list' },
        });
        pipelineBlurH = device.createRenderPipeline({
          layout: 'auto',
          vertex: { module: moduleBlurH, entryPoint: 'vs_main' },
          fragment: {
            module: moduleBlurH,
            entryPoint: 'fs_main',
            targets: [{ format: HDR_FORMAT }],
          },
          primitive: { topology: 'triangle-list' },
        });
        pipelineBlurV = device.createRenderPipeline({
          layout: 'auto',
          vertex: { module: moduleBlurV, entryPoint: 'vs_main' },
          fragment: {
            module: moduleBlurV,
            entryPoint: 'fs_main',
            targets: [{ format: HDR_FORMAT }],
          },
          primitive: { topology: 'triangle-list' },
        });
        pipelineImage = device.createRenderPipeline({
          layout: 'auto',
          vertex: { module: moduleImage, entryPoint: 'vs_main' },
          fragment: {
            module: moduleImage,
            entryPoint: 'fs_main',
            targets: [{ format: canvasFormat }],
          },
          primitive: { topology: 'triangle-list' },
        });

        uniformBuffer = device.createBuffer({
          size: BLACKHOLE_UNIFORM_BYTES,
          usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        sampler = device.createSampler({
          addressModeU: 'clamp-to-edge',
          addressModeV: 'clamp-to-edge',
          magFilter: 'linear',
          minFilter: 'linear',
        });
        cubeSampler = device.createSampler({
          addressModeU: 'clamp-to-edge',
          addressModeV: 'clamp-to-edge',
          addressModeW: 'clamp-to-edge',
          magFilter: 'linear',
          minFilter: 'linear',
        });

        // Generate the starfield cubemap once, via compute shader.
        // Texture is 6-layer 2D for storage writes; viewed as cube for sampling.
        texStarCube = device.createTexture({
          size: [STARCUBE_FACE_SIZE, STARCUBE_FACE_SIZE, 6],
          format: HDR_FORMAT,
          usage:
            GPUTextureUsage.STORAGE_BINDING |
            GPUTextureUsage.TEXTURE_BINDING |
            GPUTextureUsage.COPY_DST,
        });
        const starcubeArrayView = texStarCube.createView({
          dimension: '2d-array',
          arrayLayerCount: 6,
        });
        starCubeViewSampling = texStarCube.createView({
          dimension: 'cube',
          arrayLayerCount: 6,
        });
        const starGenModule = device.createShaderModule({ code: BLACKHOLE_STARFIELD_GEN_WGSL });
        const starGenPipeline = device.createComputePipeline({
          layout: 'auto',
          compute: { module: starGenModule, entryPoint: 'cs_main' },
        });
        const starGenBindGroup = device.createBindGroup({
          layout: starGenPipeline.getBindGroupLayout(0),
          entries: [{ binding: 0, resource: starcubeArrayView }],
        });
        {
          const enc = device.createCommandEncoder();
          const pass = enc.beginComputePass();
          pass.setPipeline(starGenPipeline);
          pass.setBindGroup(0, starGenBindGroup);
          // 1024 × 1024 × 6 = 6.3M invocations; workgroup 8×8×1 → 128×128 groups per face × 6
          pass.dispatchWorkgroups(STARCUBE_FACE_SIZE / 8, STARCUBE_FACE_SIZE / 8, 6);
          pass.end();
          device.queue.submit([enc.finish()]);
        }

        sizeCanvas();
        if (cancelled) return;

        resizeObserver = new ResizeObserver(() => {
          sizeCanvas();
          if (staticFrame) renderStaticFrame();
        });
        resizeObserver.observe(canvas);

        if (pauseOffscreen && 'IntersectionObserver' in window) {
          intersectionObserver = new IntersectionObserver(
            (entries) => {
              for (const entry of entries) {
                visible = entry.isIntersecting;
                if (visible && !staticFrame && !cancelled && !rafId) {
                  startTime = performance.now() - WARMUP_DURATION_S * 1000;
                  rafId = requestAnimationFrame(tick);
                } else if (visible && staticFrame) {
                  renderStaticFrame();
                }
              }
            },
            { threshold: 0 },
          );
          intersectionObserver.observe(canvas);
        }

        if (staticFrame) {
          renderStaticFrame();
        } else {
          window.addEventListener('pointermove', onPointer, { passive: true });
          window.addEventListener('scroll', onScroll, { passive: true });
          document.addEventListener('visibilitychange', onVisibility);
          onScroll();
          startTime = performance.now();
          rafId = requestAnimationFrame(tick);
        }

        setStatus('ready');
      } catch {
        if (!cancelled) setStatus('error');
      }
    };

    void init();

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
      if (resizeObserver) resizeObserver.disconnect();
      if (intersectionObserver) intersectionObserver.disconnect();
      if (uniformBuffer) uniformBuffer.destroy();
      if (texA) texA.destroy();
      if (texBloom) texBloom.destroy();
      if (texBlurH) texBlurH.destroy();
      if (texBlurV) texBlurV.destroy();
      if (texStarCube) texStarCube.destroy();
      if (device) device.destroy();
    };
  }, [canvasRef, staticFrame, pauseOffscreen, maxDpr]);

  return status;
}
