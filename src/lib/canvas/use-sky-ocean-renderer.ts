'use client';

import { type RefObject, useEffect, useState } from 'react';
import {
  packSkyOceanUniforms,
  SKY_OCEAN_UNIFORM_BYTES,
  type SkyOceanUniformValues,
} from '@/lib/canvas/sky-ocean-uniforms';
import { SKY_OCEAN_WGSL } from '@/lib/canvas/wgsl/sky-ocean';

export type SkyOceanStatus = 'pending' | 'ready' | 'unsupported' | 'error';

export interface UseSkyOceanRendererOptions {
  /** Render a single warmed-up frame, then freeze (battery / reduced-motion). */
  staticFrame: boolean;
  /**
   * Pause the loop when the canvas leaves the viewport. Re-renders the latest
   * uniform state when it returns. Defaults to true.
   */
  pauseOffscreen?: boolean;
  /** Max device pixel ratio. Clamped against window.devicePixelRatio. */
  maxDpr?: number;
}

const DEFAULT_MAX_DPR = 1.75;
const STATIC_FRAME_TIME = 4.0;
const STATIC_FRAME_SUN_ALT = 0.45;
const GRAIN_STRENGTH = 0.018;

/**
 * Sun-altitude curve as a function of total scroll progress (0..1 across
 * the document height). Mid-afternoon → golden hour → dusk → deep night
 * → pre-dawn → dawn break. Values are smoothstep'd between key points
 * for buttery transitions.
 */
const SUN_ALTITUDE_KEYS: ReadonlyArray<readonly [number, number]> = [
  [0.0, 0.55],
  [0.32, 0.18],
  [0.55, -0.04],
  [0.78, -0.2],
  [1.0, 0.08],
];

function smoothstep01(t: number): number {
  const x = Math.max(0, Math.min(1, t));
  return x * x * (3 - 2 * x);
}

function scrollToSunAltitude(scroll: number): number {
  for (let i = 0; i < SUN_ALTITUDE_KEYS.length - 1; i++) {
    const a = SUN_ALTITUDE_KEYS[i];
    const b = SUN_ALTITUDE_KEYS[i + 1];
    if (!a || !b) continue;
    if (scroll <= b[0]) {
      const span = b[0] - a[0];
      const t = span > 1e-6 ? (scroll - a[0]) / span : 0;
      return a[1] + (b[1] - a[1]) * smoothstep01(t);
    }
  }
  const last = SUN_ALTITUDE_KEYS[SUN_ALTITUDE_KEYS.length - 1];
  return last ? last[1] : 0;
}

/**
 * Drives a fullscreen WebGPU pass into the supplied canvas.
 *
 * - **Scroll position** drives `u_sunAltitude` along a five-keypoint day/night
 *   curve, so the sky cycles from afternoon → night → dawn as the visitor
 *   moves down the page.
 * - **Cursor** adds a small offset on top (`±0.18` altitude tilt + free
 *   azimuth rotation), so the mechanic survives across all sections.
 *
 * Returns `'unsupported'` on browsers without WebGPU so callers can render
 * a static fallback.
 */
export function useSkyOceanRenderer(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  options: UseSkyOceanRendererOptions,
): SkyOceanStatus {
  const { staticFrame, pauseOffscreen = true, maxDpr = DEFAULT_MAX_DPR } = options;
  const [status, setStatus] = useState<SkyOceanStatus>('pending');

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
    let uniformBuffer: GPUBuffer | null = null;
    let pipeline: GPURenderPipeline | null = null;
    let bindGroup: GPUBindGroup | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let intersectionObserver: IntersectionObserver | null = null;
    let visible = true;

    const target = { x: 0, y: 0 };
    const smooth = { x: 0, y: 0 };
    let scroll = 0;
    let sunAltitudeSmoothed = SUN_ALTITUDE_KEYS[0]?.[1] ?? 0.55;
    let startTime = performance.now();

    const onPointer = (e: PointerEvent) => {
      target.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.y = (1 - e.clientY / window.innerHeight) * 2 - 1;
    };
    const onScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      scroll = Math.min(1, Math.max(0, window.scrollY / max));
    };

    const uniformBytes = new ArrayBuffer(SKY_OCEAN_UNIFORM_BYTES);
    const uniformValues: SkyOceanUniformValues = {
      resX: 1,
      resY: 1,
      time: 0,
      warp: 0,
      mouseX: 0,
      mouseY: 0,
      waveTime: 0,
      waveHeight: 0.05,
      waveEnergy: 2.2,
      scroll: 0,
      camY: 0,
      camPitch: 0,
      camFov: 1.12,
      starDensity: 700,
      warmup: 0,
      detailFade: 1,
      sunAltitude: SUN_ALTITUDE_KEYS[0]?.[1] ?? 0.55,
      grainStrength: GRAIN_STRENGTH,
    };

    const sizeCanvas = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w) canvas.width = w;
      if (canvas.height !== h) canvas.height = h;
      uniformValues.resX = w;
      uniformValues.resY = h;
    };

    const drawFrame = (now: number) => {
      if (!device || !pipeline || !bindGroup || !context || !uniformBuffer) return;

      // Lerp pointer + sun altitude toward targets for buttery transitions.
      smooth.x = smooth.x + (target.x - smooth.x) * 0.06;
      smooth.y = smooth.y + (target.y - smooth.y) * 0.06;
      const targetAltitude = scrollToSunAltitude(scroll);
      sunAltitudeSmoothed = sunAltitudeSmoothed + (targetAltitude - sunAltitudeSmoothed) * 0.1;

      const elapsed = (now - startTime) / 1000;
      uniformValues.time = elapsed;
      uniformValues.waveTime = elapsed;
      uniformValues.mouseX = smooth.x;
      uniformValues.mouseY = smooth.y;
      uniformValues.scroll = scroll;
      uniformValues.sunAltitude = sunAltitudeSmoothed;
      uniformValues.warmup = Math.max(0, 1 - elapsed * 0.6);
      packSkyOceanUniforms(uniformBytes, uniformValues);
      device.queue.writeBuffer(uniformBuffer, 0, uniformBytes);

      const view = context.getCurrentTexture().createView();
      const encoder = device.createCommandEncoder();
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
      pass.setPipeline(pipeline);
      pass.setBindGroup(0, bindGroup);
      pass.draw(3);
      pass.end();
      device.queue.submit([encoder.finish()]);
    };

    const tick = (now: number) => {
      if (cancelled) return;
      drawFrame(now);
      if (visible) {
        rafId = requestAnimationFrame(tick);
      }
    };

    const renderStaticFrame = () => {
      uniformValues.warmup = 0;
      uniformValues.time = STATIC_FRAME_TIME;
      uniformValues.waveTime = STATIC_FRAME_TIME;
      uniformValues.mouseX = 0;
      uniformValues.mouseY = 0;
      uniformValues.scroll = 0;
      uniformValues.sunAltitude = STATIC_FRAME_SUN_ALT;
      sunAltitudeSmoothed = STATIC_FRAME_SUN_ALT;
      drawFrame(performance.now());
    };

    const init = async () => {
      try {
        const adapter = await gpu.requestAdapter({
          powerPreference: 'high-performance',
        });
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
        const format = gpu.getPreferredCanvasFormat();
        context.configure({
          device,
          format,
          alphaMode: 'opaque',
        });

        const module = device.createShaderModule({ code: SKY_OCEAN_WGSL });
        pipeline = device.createRenderPipeline({
          layout: 'auto',
          vertex: { module, entryPoint: 'vs_main' },
          fragment: { module, entryPoint: 'fs_main', targets: [{ format }] },
          primitive: { topology: 'triangle-list' },
        });

        uniformBuffer = device.createBuffer({
          size: SKY_OCEAN_UNIFORM_BYTES,
          usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        bindGroup = device.createBindGroup({
          layout: pipeline.getBindGroupLayout(0),
          entries: [{ binding: 0, resource: { buffer: uniformBuffer } }],
        });

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
                if (visible && !staticFrame && !cancelled) {
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
      if (resizeObserver) resizeObserver.disconnect();
      if (intersectionObserver) intersectionObserver.disconnect();
      if (uniformBuffer) uniformBuffer.destroy();
      if (device) device.destroy();
    };
  }, [canvasRef, staticFrame, pauseOffscreen, maxDpr]);

  return status;
}
