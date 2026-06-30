/**
 * Per-frame uniform block for the black hole shader. Layout MUST match the
 * `Uniforms` struct in src/lib/canvas/wgsl/blackhole.ts — keep them in sync.
 *
 * WGSL std140-ish alignment rules:
 *   f32   align 4,  size 4
 *   vec2f align 8,  size 8
 *   vec3f align 16, size 12  (the gotcha — 16-byte aligned but only 12 bytes)
 *
 * Packing each vec3f next to a single f32 fills the 16-byte slot exactly.
 * Buffer is 112 bytes (16-byte aligned).
 */

export interface BlackHoleUniformValues {
  resX: number;
  resY: number;
  /** Seconds since renderer started — drives disk rotation, jet flow, twinkle. */
  time: number;
  /** 1 → 0 fade-in over the warmup window. Render multiplies output by (1 - warmup). */
  warmup: number;

  camPosX: number;
  camPosY: number;
  camPosZ: number;
  /** Dimensionless Kerr spin parameter a*. -1..1. Drives shadow asymmetry + Doppler direction. */
  spin: number;

  camFwdX: number;
  camFwdY: number;
  camFwdZ: number;
  /** tan(fov/2). ~0.577 for 60deg. */
  fov: number;

  camRightX: number;
  camRightY: number;
  camRightZ: number;
  /** Disk inner radius in M-units. */
  diskInner: number;

  camUpX: number;
  camUpY: number;
  camUpZ: number;
  /** Disk outer radius in M-units. */
  diskOuter: number;

  /** Geometric mass M (gravitational radius). 1.0 = Rs of 2.0. */
  bhMass: number;
  /** Pointer offset, normalized -1..1 (gentle camera nudge). */
  pointerX: number;
  pointerY: number;
  /** Bloom strength multiplier 0..1. */
  bloomIntensity: number;

  /** Scroll progress 0..1 — reserved for future scroll-driven framing. */
  scroll: number;
  /** Background (starfield cubemap) brightness multiplier. Reference iBackgroundBrightmut. */
  backgroundBrightmut: number;
  /** Jet brightness multiplier 0..1. */
  jetIntensity: number;
  /** Dimensionless Kerr-Newman charge q* = Q/M. 0 for uncharged. Combined with
   *  spin a* must satisfy a*² + q*² ≤ 1 to keep a horizon. */
  charge: number;
}

export const BLACKHOLE_UNIFORM_BYTES = 112;

export function packBlackHoleUniforms(buffer: ArrayBuffer, v: BlackHoleUniformValues): void {
  const f = new Float32Array(buffer);
  // res(2) time warmup
  f[0] = v.resX;
  f[1] = v.resY;
  f[2] = v.time;
  f[3] = v.warmup;
  // camPos(3) spin
  f[4] = v.camPosX;
  f[5] = v.camPosY;
  f[6] = v.camPosZ;
  f[7] = v.spin;
  // camFwd(3) fov
  f[8] = v.camFwdX;
  f[9] = v.camFwdY;
  f[10] = v.camFwdZ;
  f[11] = v.fov;
  // camRight(3) diskInner
  f[12] = v.camRightX;
  f[13] = v.camRightY;
  f[14] = v.camRightZ;
  f[15] = v.diskInner;
  // camUp(3) diskOuter
  f[16] = v.camUpX;
  f[17] = v.camUpY;
  f[18] = v.camUpZ;
  f[19] = v.diskOuter;
  // bhMass pointerX pointerY bloomIntensity
  f[20] = v.bhMass;
  f[21] = v.pointerX;
  f[22] = v.pointerY;
  f[23] = v.bloomIntensity;
  // scroll backgroundBrightmut jetIntensity charge
  f[24] = v.scroll;
  f[25] = v.backgroundBrightmut;
  f[26] = v.jetIntensity;
  f[27] = v.charge;
}
