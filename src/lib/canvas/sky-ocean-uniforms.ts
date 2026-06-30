/**
 * Per-frame uniform block for the sky-ocean shader. Layout matches the
 * `Uniforms` struct in src/lib/canvas/wgsl/sky-ocean.ts — keep them in sync.
 *
 * WGSL alignment rules: f32 = 4, vec2f = 8. Struct alignment is the max
 * member alignment (8). Buffer is padded to 80 bytes (16-byte aligned)
 * for safe binding alignment with future additions.
 */

export interface SkyOceanUniformValues {
  resX: number;
  resY: number;
  time: number;
  warp: number;
  mouseX: number;
  mouseY: number;
  waveTime: number;
  waveHeight: number;
  waveEnergy: number;
  scroll: number;
  camY: number;
  camPitch: number;
  camFov: number;
  starDensity: number;
  warmup: number;
  detailFade: number;
  /** Base sun altitude (-0.30 night → 1.0 noon). Scroll-driven. */
  sunAltitude: number;
  /** Post-pass grain intensity, 0..0.05. */
  grainStrength: number;
}

export const SKY_OCEAN_UNIFORM_BYTES = 80;

export function packSkyOceanUniforms(buffer: ArrayBuffer, v: SkyOceanUniformValues): void {
  const f = new Float32Array(buffer);
  f[0] = v.resX;
  f[1] = v.resY;
  f[2] = v.time;
  f[3] = v.warp;
  f[4] = v.mouseX;
  f[5] = v.mouseY;
  f[6] = v.waveTime;
  f[7] = v.waveHeight;
  f[8] = v.waveEnergy;
  f[9] = v.scroll;
  f[10] = v.camY;
  f[11] = v.camPitch;
  f[12] = v.camFov;
  f[13] = v.starDensity;
  f[14] = v.warmup;
  f[15] = v.detailFade;
  f[16] = v.sunAltitude;
  f[17] = v.grainStrength;
  // f[18], f[19] reserved padding to 80 bytes.
}
