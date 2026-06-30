/**
 * Kerr-Newman black hole renderer (iteration 3 — proper geodesic port).
 *
 * Faithful WGSL translation of the reference Shadertoy Buffer A geometry +
 * integrator, with simplified disk/jet for the first checkpoint pass.
 *
 * Implements:
 *   - Kerr-Schild metric: g_uv = eta_uv + f * l_u * l_v
 *   - KerrSchildRadius (BL r from Cartesian X, with sign tracking)
 *   - ComputeGeometryScalars / ComputeGeometryGradients (metric + ∂)
 *   - RaiseIndex / LowerIndex via the Kerr-Schild form
 *   - GetInitialMomentum: Schmidt orthogonalization in curved spacetime
 *   - 4th-order Runge-Kutta geodesic integrator with Hamiltonian energy
 *     correction and ringularity sign tracking
 *   - TraceRay: integrates each pixel's geodesic backward, terminates on
 *     horizon / escape / disk hit
 *
 * Geometric units: M = CONST_M = 0.5 (matches reference). Spin a* dimensionless;
 * physical spin a = a* · M = a* · 0.5.
 *
 * For this checkpoint pass the disk is a thin annulus in the y=0 plane with
 * Doppler-shifted blackbody emission. The full volumetric disk + jet ports
 * land in the next iteration.
 *
 * Uniform layout MUST stay in lock-step with src/lib/canvas/blackhole-uniforms.ts.
 */

export const BLACKHOLE_WGSL = /* wgsl */ `
struct Uniforms {
  res: vec2f,
  time: f32,
  warmup: f32,

  camPos: vec3f,
  spin: f32,

  camFwd: vec3f,
  fov: f32,

  camRight: vec3f,
  diskInner: f32,

  camUp: vec3f,
  diskOuter: f32,

  bhMass: f32,
  pointerX: f32,
  pointerY: f32,
  bloomIntensity: f32,

  scroll: f32,
  backgroundBrightmut: f32,
  jetIntensity: f32,
  charge: f32,
}

@group(0) @binding(0) var<uniform> u: Uniforms;
@group(0) @binding(1) var starCube: texture_cube<f32>;
@group(0) @binding(2) var starSampler: sampler;

const PI: f32       = 3.14159265359;
const TWO_PI: f32   = 6.28318530718;
const CONST_M: f32  = 0.5;
const EPS: f32      = 1.0e-6;
// Reference MaxStep = 150 + 300/(1 + 1000·(1-a²-q²)²); for a*=0.99, q=0 → ~365.
// More steps let photon-ring-orbiting rays accumulate ThetaInShell to saturation.
const MAX_STEPS: i32 = 360;

// ────────────────────────────────────────────────────────────────────────
// Hash + value noise (used by disk/star)
// ────────────────────────────────────────────────────────────────────────
fn hash21(p: vec2f) -> f32 {
  let q = p - 289.0 * floor(p / 289.0);
  return fract(sin(dot(q, vec2f(127.1, 311.7))) * 43758.5453);
}

fn hash31(p: vec3f) -> f32 {
  let q = p - 289.0 * floor(p / 289.0);
  return fract(sin(dot(q, vec3f(12.9898, 78.233, 45.164))) * 43758.5453);
}

fn hash33(p: vec3f) -> vec3f {
  return vec3f(
    hash31(p),
    hash31(p + vec3f(11.4, 23.7, 71.2)),
    hash31(p + vec3f(53.1, 97.3, 13.9))
  );
}

fn vnoise2(p: vec2f) -> f32 {
  let i = floor(p);
  let f = fract(p);
  let su = f * f * (3.0 - 2.0 * f);
  let a = hash21(i);
  let b = hash21(i + vec2f(1.0, 0.0));
  let c = hash21(i + vec2f(0.0, 1.0));
  let d = hash21(i + vec2f(1.0, 1.0));
  return mix(mix(a, b, su.x), mix(c, d, su.x), su.y);
}

fn fbm2(p: vec2f) -> f32 {
  var sum: f32 = 0.0;
  var amp: f32 = 0.5;
  var pp = p;
  for (var i: i32 = 0; i < 5; i = i + 1) {
    sum = sum + amp * vnoise2(pp);
    pp = pp * 2.03 + vec2f(11.0, 7.0);
    amp = amp * 0.5;
  }
  return sum;
}

// 3D Perlin noise (signed -1..1) — direct port of reference PerlinNoise.
// Uses cubic interpolation (3x² - 2x³) and 8 hashed corner values.
fn cubic_interp(x: f32) -> f32 {
  return 3.0 * x * x - 2.0 * x * x * x;
}

fn perlin3(pos: vec3f) -> f32 {
  let pi = floor(pos);
  let pf = fract(pos);
  let sx = cubic_interp(pf.x);
  let sy = cubic_interp(pf.y);
  let sz = cubic_interp(pf.z);
  let h = vec3f(12.9898, 78.233, 213.765);
  let v000 = 2.0 * fract(sin(dot(vec3f(pi.x,       pi.y,       pi.z      ), h)) * 43758.5453) - 1.0;
  let v100 = 2.0 * fract(sin(dot(vec3f(pi.x + 1.0, pi.y,       pi.z      ), h)) * 43758.5453) - 1.0;
  let v010 = 2.0 * fract(sin(dot(vec3f(pi.x,       pi.y + 1.0, pi.z      ), h)) * 43758.5453) - 1.0;
  let v110 = 2.0 * fract(sin(dot(vec3f(pi.x + 1.0, pi.y + 1.0, pi.z      ), h)) * 43758.5453) - 1.0;
  let v001 = 2.0 * fract(sin(dot(vec3f(pi.x,       pi.y,       pi.z + 1.0), h)) * 43758.5453) - 1.0;
  let v101 = 2.0 * fract(sin(dot(vec3f(pi.x + 1.0, pi.y,       pi.z + 1.0), h)) * 43758.5453) - 1.0;
  let v011 = 2.0 * fract(sin(dot(vec3f(pi.x,       pi.y + 1.0, pi.z + 1.0), h)) * 43758.5453) - 1.0;
  let v111 = 2.0 * fract(sin(dot(vec3f(pi.x + 1.0, pi.y + 1.0, pi.z + 1.0), h)) * 43758.5453) - 1.0;
  return mix(mix(mix(v000, v100, sx), mix(v010, v110, sx), sy),
             mix(mix(v001, v101, sx), mix(v011, v111, sx), sy), sz);
}

// GenerateAccretionDiskNoise — multiplicative turbulence with log-contrast.
// Direct port of reference: accumulates 3^i-frequency Perlin samples weighted
// by a window function over [start, end], multiplies them, then log-contrast.
// The multiplicative accumulation produces high-contrast detail unlike additive fbm.
fn generate_disk_noise(pos: vec3f, startLevel: f32, endLevel: f32, contrast: f32) -> f32 {
  var acc: f32 = 10.0;
  let iStart = i32(floor(startLevel));
  let iEnd = i32(ceil(endLevel));
  let maxIters = iEnd - iStart;
  for (var d: i32 = 0; d < 12; d = d + 1) {
    if (d >= maxIters) { break; }
    let iFloat = f32(iStart + d);
    let w = max(0.0, min(endLevel, iFloat + 1.0) - max(startLevel, iFloat));
    if (w <= 0.0) { continue; }
    let freq = pow(3.0, iFloat);
    let n = perlin3(freq * pos);
    acc = acc * (1.0 + 0.1 * n * w);
  }
  return log(1.0 + pow(0.1 * acc, contrast));
}

// SoftSaturate — smooth approach to 1 (used by reference for thickness perturb)
fn soft_saturate(x: f32) -> f32 {
  return 1.0 - 1.0 / (max(x, 0.0) + 1.0);
}

// Beta-style density profile (peak at α/(α+β), normalized to peak = 1)
fn shape_alpha_beta(x: f32, alpha: f32, beta: f32) -> f32 {
  let k = pow(alpha + beta, alpha + beta) / (pow(alpha, alpha) * pow(beta, beta));
  return k * pow(max(x, 0.0), alpha) * pow(max(1.0 - x, 0.0), beta);
}

// SpiralTheta — proper Kerr spiral angle integrated from r=0 to PosR.
// Cubic-root expansion for small spin, full closed-form for larger spin.
// Reference: derived from Kerr geodesic integration for circular orbits.
fn spiral_theta(posR: f32, spinA: f32) -> f32 {
  let u = sqrt(max(1.0e-6, posR));
  let kCubed = spinA * 0.70710678;  // a / sqrt(2)
  let absKC = abs(kCubed);
  if (absKC < 0.001 * u * u * u) {
    let invU = 1.0 / u;
    let eps3 = kCubed * invU * invU * invU;
    return -16.9705627 * invU * (1.0 - 0.25 * eps3 + 0.142857 * eps3 * eps3);
  }
  let k = sign(kCubed) * pow(absKC, 0.33333333);
  let denom = (u + k) * (u + k);
  let logArg = (posR - k * u + k * k) / max(1.0e-9, denom);
  return (5.6568542 / k) *
         (0.5 * log(max(1.0e-9, logArg)) +
          1.7320508 * (atan2(2.0 * u - k, 1.7320508 * k) - 1.5707963));
}

// WavelengthToRgb — direct port of reference. Maps λ in nm to a normalized
// RGB color, with brightness rolloff at the visible-spectrum edges.
fn wavelength_to_rgb(wavelength: f32) -> vec3f {
  var color = vec3f(0.0);
  if (wavelength <= 380.0) {
    color = vec3f(1.0, 0.0, 1.0);
  } else if (wavelength < 440.0) {
    color = vec3f(-(wavelength - 440.0) / 60.0, 0.0, 1.0);
  } else if (wavelength < 490.0) {
    color = vec3f(0.0, (wavelength - 440.0) / 50.0, 1.0);
  } else if (wavelength < 510.0) {
    color = vec3f(0.0, 1.0, -(wavelength - 510.0) / 20.0);
  } else if (wavelength < 580.0) {
    color = vec3f((wavelength - 510.0) / 70.0, 1.0, 0.0);
  } else if (wavelength < 645.0) {
    color = vec3f(1.0, -(wavelength - 645.0) / 65.0, 0.0);
  } else {
    color = vec3f(1.0, 0.0, 0.0);
  }
  var factor: f32 = 0.3;
  if (wavelength >= 380.0 && wavelength < 420.0) {
    factor = 0.3 + 0.7 * (wavelength - 380.0) / 40.0;
  } else if (wavelength >= 420.0 && wavelength < 645.0) {
    factor = 1.0;
  } else if (wavelength >= 645.0 && wavelength <= 750.0) {
    factor = 0.3 + 0.7 * (750.0 - wavelength) / 105.0;
  }
  let mag = pow(color.r * color.r + 2.25 * color.g * color.g + 0.36 * color.b * color.b, 0.5);
  let brightness = 0.1 * (color.r + color.g + color.b) + 0.9;
  return color * factor / max(mag, 1.0e-6) * brightness;
}

// Vec2ToTheta — angle between two 2D vectors via atan2. Reference's custom
// formula reproduces atan2(cross, dot).
fn vec2_to_theta(v1: vec2f, v2: vec2f) -> f32 {
  let d = dot(v1, v2);
  let c = v1.x * v2.y - v1.y * v2.x;
  return atan2(c, d);
}

// ────────────────────────────────────────────────────────────────────────
// Blackbody emission (rough Planckian, normalized)
// ────────────────────────────────────────────────────────────────────────
fn blackbody(kelvin: f32) -> vec3f {
  let k = clamp(kelvin, 800.0, 30000.0);
  let teff = (k - 6500.0) / (6500.0 * k * 2.2);
  var c = vec3f(
    exp(2.05539304e4 * teff),
    exp(2.63463675e4 * teff),
    exp(3.30145739e4 * teff)
  );
  let m = max(max(1.5 * c.r, c.g), c.b);
  c = c / max(m, 1e-6);
  if (k < 1000.0) { c = c * ((k - 400.0) / 600.0); }
  return c;
}

// ────────────────────────────────────────────────────────────────────────
// Starfield + faint nebula dust (sampled with the asymptotic outgoing
// direction of an escaping geodesic — gives gravitational lensing for free)
// ────────────────────────────────────────────────────────────────────────
fn starfield(rd: vec3f) -> vec3f {
  let absRd = abs(rd);
  let p = rd / max(max(absRd.x, absRd.y), absRd.z);

  // Two-octave grid — denser stars overall + a sparse layer of brighter ones
  var col = vec3f(0.0);

  // Dense layer
  {
    let gridRes = 380.0;
    let g = p * gridRes;
    let id = floor(g);
    let fr = fract(g) - vec3f(0.5);
    let h = hash33(id * 1.731);
    let starThresh = 0.965;
    if (h.x >= starThresh) {
      let normalized = (h.x - starThresh) / (1.0 - starThresh);
      let offset = (h * 2.0 - vec3f(1.0)) * 0.34;
      let d = length(fr - offset);
      let size = 0.010 + 0.030 * normalized;
      let core = exp(-d * d / (size * size) * 3.0);
      let temp = mix(3500.0, 12000.0, h.y * h.y);
      let twinkle = 0.85 + 0.15 * sin(u.time * (0.4 + h.z * 1.4) + h.y * TWO_PI);
      col = col + blackbody(temp) * core * twinkle * 2.2 * normalized;
    }
  }

  // Sparse bright layer (the showy white pinpoints)
  {
    let gridRes = 90.0;
    let g = p * gridRes;
    let id = floor(g);
    let fr = fract(g) - vec3f(0.5);
    let h = hash33(id * 4.317);
    let starThresh = 0.982;
    if (h.x >= starThresh) {
      let normalized = (h.x - starThresh) / (1.0 - starThresh);
      let offset = (h * 2.0 - vec3f(1.0)) * 0.30;
      let d = length(fr - offset);
      let size = 0.020 + 0.045 * normalized;
      let core = exp(-d * d / (size * size) * 2.4);
      let temp = mix(5500.0, 14000.0, h.y);
      col = col + blackbody(temp) * core * 4.5 * normalized;
    }
  }

  return col;
}

fn nebula_dust(rd: vec3f) -> vec3f {
  let n1 = vnoise2(rd.xy * 2.4 + vec2f(rd.z * 1.7, 0.0));
  let n2 = vnoise2(rd.xy * 5.5 - vec2f(rd.z * 2.1, 0.0));
  let dust = max(0.0, n1 * 0.55 + n2 * 0.45 - 0.42);
  return vec3f(0.035, 0.045, 0.085) * dust * 1.4;
}

// Reference SampleBackground — samples starfield CUBEMAP (matches canonical
// version; the Shadertoy version used procedural stars only because it
// can't bind cubemaps). Per-channel wavelength shift via WavelengthToRgb,
// then renormalize to preserve perceived brightness, × shift⁴ × iBackgroundBrightmut.
fn sample_background(rd: vec3f, shift: f32) -> vec3f {
  let raw = textureSampleLevel(starCube, starSampler, rd, 0.0).rgb;
  let safeShift = max(shift, 0.001);
  let shiftedR = wavelength_to_rgb(max(453.0, 645.0 / safeShift));
  let shiftedG = wavelength_to_rgb(max(416.0, 510.0 / safeShift));
  let shiftedB = wavelength_to_rgb(max(380.0, 440.0 / safeShift));
  var colored = raw.r * 1.0 * shiftedR + raw.g * 1.5 * shiftedG + raw.b * 0.6 * shiftedB;
  let oStrength = 0.3 * raw.r + 0.6 * raw.g + 0.1 * raw.b;
  let rStrength = 0.3 * colored.r + 0.6 * colored.g + 0.1 * colored.b;
  colored = colored * oStrength / max(rStrength, 0.001);
  return u.backgroundBrightmut * colored * pow(safeShift, 4.0);
}

// ════════════════════════════════════════════════════════════════════════
// KERR-SCHILD METRIC
//
// Coordinates: Cartesian (x, y, z, t) with +y as the BH spin axis.
// Metric: g_uv = eta_uv + f · l_u · l_v   (eta = diag(1, 1, 1, -1))
// where l is the Kerr-Schild null vector and f is the gravitational potential:
//   f = (2Mr - Q²) · r² / (r⁴ + a²·y²)
// In the Schwarzschild limit (a=0): f = 2M/r - Q²/r².
//
// r is the Boyer-Lindquist radial coordinate, recovered from Cartesian X via
// the quartic equation; r_sign tracks crossings of the ringularity disk
// (r=0 lives on a disk of radius |a| in the y=0 plane).
// ════════════════════════════════════════════════════════════════════════

fn kerr_schild_radius(p: vec3f, spinA: f32, r_sign: f32) -> f32 {
  if (spinA == 0.0) {
    return r_sign * length(p);
  }
  let a2 = spinA * spinA;
  let rho2 = p.x * p.x + p.z * p.z;
  let y2 = p.y * p.y;
  let b = rho2 + y2 - a2;
  let det = sqrt(b * b + 4.0 * a2 * y2);
  var r2: f32;
  if (b >= 0.0) {
    r2 = 0.5 * (b + det);
  } else {
    r2 = (2.0 * a2 * y2) / max(1.0e-20, det - b);
  }
  return r_sign * sqrt(r2);
}

struct KerrGeometry {
  r: f32,
  r2: f32,
  a2: f32,
  f: f32,
  grad_r: vec3f,
  grad_f: vec3f,
  l_up: vec4f,    // l^μ = (lx, ly, lz, -1)
  l_down: vec4f,  // l_μ = (lx, ly, lz,  1)
  inv_r2_a2: f32,
  inv_den_f: f32,
  num_f: f32,
}

fn compute_geometry_scalars(
  X: vec3f, spinA: f32, Q: f32, fade: f32, r_sign: f32
) -> KerrGeometry {
  var geo: KerrGeometry;
  geo.a2 = spinA * spinA;

  if (spinA == 0.0) {
    geo.r = r_sign * length(X);
    geo.r2 = geo.r * geo.r;
    let inv_r = 1.0 / geo.r;
    let inv_r2 = inv_r * inv_r;
    geo.l_up = vec4f(X * inv_r, -1.0);
    geo.l_down = vec4f(X * inv_r, 1.0);
    geo.num_f = 2.0 * CONST_M * geo.r - Q * Q;
    geo.f = (2.0 * CONST_M * inv_r - Q * Q * inv_r2) * fade;
    geo.inv_r2_a2 = inv_r2;
    geo.inv_den_f = 0.0;
    geo.grad_r = vec3f(0.0);
    geo.grad_f = vec3f(0.0);
    return geo;
  }

  geo.r = kerr_schild_radius(X, spinA, r_sign);
  geo.r2 = geo.r * geo.r;
  let r3 = geo.r2 * geo.r;
  let z_coord = X.y;
  let z2 = z_coord * z_coord;
  geo.inv_r2_a2 = 1.0 / (geo.r2 + geo.a2);

  let lx = (geo.r * X.x - spinA * X.z) * geo.inv_r2_a2;
  let ly = X.y / geo.r;
  let lz = (geo.r * X.z + spinA * X.x) * geo.inv_r2_a2;
  geo.l_up   = vec4f(lx, ly, lz, -1.0);
  geo.l_down = vec4f(lx, ly, lz,  1.0);

  geo.num_f = 2.0 * CONST_M * r3 - Q * Q * geo.r2;
  let den_f = geo.r2 * geo.r2 + geo.a2 * z2;
  geo.inv_den_f = 1.0 / max(1.0e-20, den_f);
  geo.f = (geo.num_f * geo.inv_den_f) * fade;

  geo.grad_r = vec3f(0.0);
  geo.grad_f = vec3f(0.0);
  return geo;
}

fn compute_geometry_gradients(
  X: vec3f, spinA: f32, Q: f32, fade: f32,
  geo: ptr<function, KerrGeometry>
) {
  let inv_r = 1.0 / (*geo).r;

  if (spinA == 0.0) {
    let inv_r2 = inv_r * inv_r;
    (*geo).grad_r = X * inv_r;
    let df_dr = (-2.0 * CONST_M + 2.0 * Q * Q * inv_r) * inv_r2 * fade;
    (*geo).grad_f = df_dr * (*geo).grad_r;
    return;
  }

  let R2 = dot(X, X);
  let D = 2.0 * (*geo).r2 - R2 + (*geo).a2;
  var denom_grad = (*geo).r * D;
  if (abs(denom_grad) < 1.0e-9) {
    denom_grad = sign((*geo).r) * 1.0e-9;
  }
  let inv_denom_grad = 1.0 / denom_grad;

  (*geo).grad_r = vec3f(
    X.x * (*geo).r2,
    X.y * ((*geo).r2 + (*geo).a2),
    X.z * (*geo).r2
  ) * inv_denom_grad;

  let z_coord = X.y;
  let z2 = z_coord * z_coord;

  let term_M  = -2.0 * CONST_M * (*geo).r2 * (*geo).r2 * (*geo).r;
  let term_Q  =  2.0 * Q * Q * (*geo).r2 * (*geo).r2;
  let term_Ma =  6.0 * CONST_M * (*geo).a2 * (*geo).r * z2;
  let term_Qa = -2.0 * Q * Q * (*geo).a2 * z2;
  let df_dr_num = term_M + term_Q + term_Ma + term_Qa;
  let df_dr = ((*geo).r * df_dr_num) * ((*geo).inv_den_f * (*geo).inv_den_f);
  let df_dy = -((*geo).num_f * 2.0 * (*geo).a2 * z_coord) *
              ((*geo).inv_den_f * (*geo).inv_den_f);

  var grad_f = df_dr * (*geo).grad_r;
  grad_f.y = grad_f.y + df_dy;
  (*geo).grad_f = grad_f * fade;
}

// Index ops via the Kerr-Schild form (skip a full mat4 multiply):
//   g^μν = η^μν - f · l^μ · l^ν   →   P^μ = P_flat^μ - f · (l·P) · l^μ
//   g_μν = η_μν + f · l_μ · l_ν   →   P_μ = P_flat_μ + f · (l·P) · l_μ
fn raise_index(P_cov: vec4f, geo: KerrGeometry) -> vec4f {
  let P_flat = vec4f(P_cov.xyz, -P_cov.w);
  let L_dot_P = dot(geo.l_up, P_cov);
  return P_flat - geo.f * L_dot_P * geo.l_up;
}

fn lower_index(P_contra: vec4f, geo: KerrGeometry) -> vec4f {
  let P_flat = vec4f(P_contra.xyz, -P_contra.w);
  let L_dot_P = dot(geo.l_down, P_contra);
  return P_flat + geo.f * L_dot_P * geo.l_down;
}

// ════════════════════════════════════════════════════════════════════════
// CAMERA RAY → COVARIANT MOMENTUM
//
// Static observer 4-velocity, then Schmidt-orthogonalize the screen-basis
// vectors (radial / theta / phi) against U_μ in the curved metric. The
// resulting orthonormal tetrad lets us decompose the flat-space ray
// direction into properly-normalized covariant momentum components.
// ════════════════════════════════════════════════════════════════════════
fn get_initial_momentum(
  rayDir: vec3f, X: vec4f, universeSign: f32,
  spinA: f32, Q: f32, fade: f32
) -> vec4f {
  var geo = compute_geometry_scalars(X.xyz, spinA, Q, fade, universeSign);

  // Static observer: U^t = 1 / sqrt(-g_tt), other components zero.
  let g_tt = -1.0 + geo.f;
  let time_comp = 1.0 / sqrt(max(1.0e-9, -g_tt));
  let U_up = vec4f(0.0, 0.0, 0.0, time_comp);
  let U_down = lower_index(U_up, geo);

  // Flat-space reference basis: radial inward, plus a perpendicular pair
  let m_r = -normalize(X.xyz);
  var worldUp = vec3f(0.0, 1.0, 0.0);
  if (abs(dot(m_r, worldUp)) > 0.999) {
    worldUp = vec3f(1.0, 0.0, 0.0);
  }
  let m_phi   = normalize(cross(worldUp, m_r));
  let m_theta = cross(m_phi, m_r);

  let k_r     = dot(rayDir, m_r);
  let k_theta = dot(rayDir, m_theta);
  let k_phi   = dot(rayDir, m_phi);

  // Build orthonormal tetrad e1, e2, e3 (spatial) in curved spacetime.
  // Each step: project onto previous basis vectors, subtract, renormalize
  // using the curved-metric inner product ⟨v, v⟩ = v_μ v^μ.
  var e1 = vec4f(m_r, 0.0);
  e1 = e1 + dot(e1, U_down) * U_up;
  var e1_d = lower_index(e1, geo);
  let n1 = sqrt(max(1.0e-9, dot(e1, e1_d)));
  e1 = e1 / n1;
  e1_d = e1_d / n1;

  var e2 = vec4f(m_theta, 0.0);
  e2 = e2 + dot(e2, U_down) * U_up;
  e2 = e2 - dot(e2, e1_d) * e1;
  var e2_d = lower_index(e2, geo);
  let n2 = sqrt(max(1.0e-9, dot(e2, e2_d)));
  e2 = e2 / n2;
  e2_d = e2_d / n2;

  var e3 = vec4f(m_phi, 0.0);
  e3 = e3 + dot(e3, U_down) * U_up;
  e3 = e3 - dot(e3, e1_d) * e1;
  e3 = e3 - dot(e3, e2_d) * e2;
  var e3_d = lower_index(e3, geo);
  let n3 = sqrt(max(1.0e-9, dot(e3, e3_d)));
  e3 = e3 / n3;

  // Photon contravariant momentum: U^μ minus the spatial components
  // (incoming light, so negative direction relative to observer)
  let P_up = U_up - (k_r * e1 + k_theta * e2 + k_phi * e3);

  // Covariant momentum P_μ — what the integrator carries
  return lower_index(P_up, geo);
}

// ════════════════════════════════════════════════════════════════════════
// GEODESIC INTEGRATOR (Hamiltonian RK4)
//
// State: X^μ (position) and P_μ (covariant momentum).
//   dX^μ/dλ = ∂H/∂P_μ = g^μν P_ν
//   dP_μ/dλ = -∂H/∂X^μ = -½ ∂g^αβ/∂X^μ · P_α P_β
// In Kerr-Schild form: g^αβ = η^αβ - f l^α l^β, so the Hamiltonian becomes
//   H = ½ (P_flat·P_flat - f (l·P)²)
// and the force splits into gradients of f and of l_μ.
// ════════════════════════════════════════════════════════════════════════
struct State {
  X: vec4f,
  P: vec4f,
}

fn get_derivatives(
  S: State, spinA: f32, Q: f32, fade: f32,
  geo: ptr<function, KerrGeometry>
) -> State {
  var deriv: State;
  compute_geometry_gradients(S.X.xyz, spinA, Q, fade, geo);

  let l_dot_P = dot((*geo).l_up.xyz, S.P.xyz) + (*geo).l_up.w * S.P.w;

  // dX/dλ = g^μν P_ν = P_flat - f (l·P) l^μ
  let P_flat = vec4f(S.P.xyz, -S.P.w);
  deriv.X = P_flat - (*geo).f * l_dot_P * (*geo).l_up;

  // ∂(1/(r²+a²))/∂X = -2 r (r²+a²)^-2 · ∂r/∂X
  let grad_A = (-2.0 * (*geo).r * (*geo).inv_r2_a2) * (*geo).inv_r2_a2 * (*geo).grad_r;

  let rx_az = (*geo).r * S.X.x - spinA * S.X.z;
  let rz_ax = (*geo).r * S.X.z + spinA * S.X.x;

  // ∂lx/∂X — product rule on (r·X.x - a·X.z) / (r²+a²)
  var d_num_lx = S.X.x * (*geo).grad_r;
  d_num_lx.x = d_num_lx.x + (*geo).r;
  d_num_lx.z = d_num_lx.z - spinA;
  let grad_lx = (*geo).inv_r2_a2 * d_num_lx + rx_az * grad_A;

  // ∂ly/∂X = (r·ŷ - X.y · ∂r/∂X) / r²
  let grad_ly = ((*geo).r * vec3f(0.0, 1.0, 0.0) - S.X.y * (*geo).grad_r) / (*geo).r2;

  // ∂lz/∂X
  var d_num_lz = S.X.z * (*geo).grad_r;
  d_num_lz.z = d_num_lz.z + (*geo).r;
  d_num_lz.x = d_num_lz.x + spinA;
  let grad_lz = (*geo).inv_r2_a2 * d_num_lz + rz_ax * grad_A;

  // P_α · ∂l_α/∂X (only spatial l components contribute since l_t = ±1 const)
  let P_dot_grad_l = S.P.x * grad_lx + S.P.y * grad_ly + S.P.z * grad_lz;

  // Force = -∂H/∂X = ½ (l·P)² ∂f/∂X + f (l·P) · ∂l/∂X · P
  let Force = 0.5 * (
    (l_dot_P * l_dot_P) * (*geo).grad_f +
    (2.0 * (*geo).f * l_dot_P) * P_dot_grad_l
  );

  deriv.P = vec4f(Force, 0.0);  // P_t (energy) is conserved → ∂P_t/∂λ = 0
  return deriv;
}

// Sign tracking when the geodesic crosses the ringularity disk (y=0,
// rho < |a|). The Boyer-Lindquist r flips sign through the ring, so we
// must detect the crossing and flip universeSign to keep r consistent.
fn get_intermediate_sign(
  startX: vec4f, currentX: vec4f, currentSign: f32, spinA: f32
) -> f32 {
  if (startX.y * currentX.y < 0.0) {
    let t = startX.y / (startX.y - currentX.y);
    let cross_xz = mix(startX.xz, currentX.xz, t);
    let rho_cross = length(cross_xz);
    if (rho_cross < abs(spinA)) {
      return -currentSign;
    }
  }
  return currentSign;
}

// Hamiltonian energy correction: rescale P spatial part to keep H = 0
// (null geodesic constraint). Drift accumulates over RK4 steps; this keeps
// the integration on-shell.
fn apply_hamiltonian_correction(
  P: ptr<function, vec4f>, X: vec4f, E: f32,
  spinA: f32, Q: f32, fade: f32, r_sign: f32
) {
  (*P).w = -E;
  let p = (*P).xyz;

  let geo = compute_geometry_scalars(X.xyz, spinA, Q, fade, r_sign);

  let L_dot_p_s = dot(geo.l_up.xyz, p);
  let Pt = (*P).w;

  let p2 = dot(p, p);
  let A_co = p2 - geo.f * L_dot_p_s * L_dot_p_s;
  let B_co = 2.0 * geo.f * L_dot_p_s * Pt;
  let C_co = -Pt * Pt * (1.0 + geo.f);

  let disc = B_co * B_co - 4.0 * A_co * C_co;
  if (disc < 0.0) { return; }
  let sqrtDisc = sqrt(disc);
  let denom = 2.0 * A_co;
  if (abs(denom) < 1.0e-9) { return; }

  let k1 = (-B_co + sqrtDisc) / denom;
  let k2 = (-B_co - sqrtDisc) / denom;
  let dist1 = abs(k1 - 1.0);
  let dist2 = abs(k2 - 1.0);
  var k = k2;
  if (dist1 < dist2) { k = k1; }

  // Soft-blend back to k=1 if the correction is excessive (avoids blow-ups
  // in the strongly-curved region where the quadratic is ill-conditioned)
  let blend = clamp(abs(k - 1.0) / 0.1 - 1.0, 0.0, 1.0);
  let kSoft = mix(k, 1.0, blend);
  (*P) = vec4f((*P).xyz * kSoft, (*P).w);
}

// One RK4 step. Reuses the precomputed k1 derivative + geometry from the
// outer caller (saves one geometry+gradient evaluation per step).
fn step_geodesic_rk4(
  state: ptr<function, State>, E: f32, dt: f32,
  spinA: f32, Q: f32, fade: f32, r_sign: f32, k1: State
) {
  let s0 = *state;

  var s1: State;
  s1.X = s0.X + 0.5 * dt * k1.X;
  s1.P = s0.P + 0.5 * dt * k1.P;
  let sign1 = get_intermediate_sign(s0.X, s1.X, r_sign, spinA);
  var geo1 = compute_geometry_scalars(s1.X.xyz, spinA, Q, fade, sign1);
  let k2 = get_derivatives(s1, spinA, Q, fade, &geo1);

  var s2: State;
  s2.X = s0.X + 0.5 * dt * k2.X;
  s2.P = s0.P + 0.5 * dt * k2.P;
  let sign2 = get_intermediate_sign(s0.X, s2.X, r_sign, spinA);
  var geo2 = compute_geometry_scalars(s2.X.xyz, spinA, Q, fade, sign2);
  let k3 = get_derivatives(s2, spinA, Q, fade, &geo2);

  var s3: State;
  s3.X = s0.X + dt * k3.X;
  s3.P = s0.P + dt * k3.P;
  let sign3 = get_intermediate_sign(s0.X, s3.X, r_sign, spinA);
  var geo3 = compute_geometry_scalars(s3.X.xyz, spinA, Q, fade, sign3);
  let k4 = get_derivatives(s3, spinA, Q, fade, &geo3);

  var finalX = s0.X + (dt / 6.0) * (k1.X + 2.0 * k2.X + 2.0 * k3.X + k4.X);
  var finalP = s0.P + (dt / 6.0) * (k1.P + 2.0 * k2.P + 2.0 * k3.P + k4.P);

  let finalSign = get_intermediate_sign(s0.X, finalX, r_sign, spinA);
  if (finalSign > 0.0) {
    apply_hamiltonian_correction(&finalP, finalX, E, spinA, Q, fade, finalSign);
  }
  (*state).X = finalX;
  (*state).P = finalP;
}

// ════════════════════════════════════════════════════════════════════════
// VOLUMETRIC DISK SAMPLING (faithful port of Buffer A's DiskColor structure)
//
// Called per RK4 step from trace_ray with the segment midpoint. Samples
// the disk volume — thickness profile (thin + hopper · max(0, r-3)),
// vertical density falloff, spiral noise pattern, Novikov-Thorne
// temperature, analytical Kerr equatorial Doppler factor — then
// front-to-back composites emission with Beer-Lambert absorption.
//
// State (accumColor, transmittance) is carried through trace_ray; once
// transmittance drops below threshold the geodesic terminates early.
// ════════════════════════════════════════════════════════════════════════
// Reference DiskColor constants (matching reference defines):
//   iReddening = 0.3, iSaturation = 0.5, iBlackbodyIntensityExponent = 0.5,
//   iRedShiftColorExponent = 3.0, iRedShiftIntensityExponent = 4.0,
//   iBrightmut = 1.0, iDarkmut = 0.5, iPhotonRingBoost = 7.0,
//   iPhotonRingColorTempBoost = 2.0, iBoostRot = 0.75
const DISK_REDDENING: f32 = 0.3;
const DISK_SATURATION: f32 = 0.5;
const DISK_BB_INTENSITY_EXP: f32 = 0.5;
const DISK_REDSHIFT_COLOR_EXP: f32 = 3.0;
const DISK_REDSHIFT_INT_EXP: f32 = 4.0;
const DISK_SHIFT_MAX: f32 = 1.0;
const DISK_BRIGHTMUT: f32 = 1.0;
const DISK_DARKMUT: f32 = 0.5;
const DISK_PHOTON_RING_BOOST: f32 = 7.0;
const DISK_PHOTON_RING_TEMP_BOOST: f32 = 2.0;
const DISK_BOOST_ROT: f32 = 0.75;
// PeakTemperature for default iBlackHoleMassSol = 1e7, iAccretionRate = 5e-4
const DISK_TEMP_PEAK: f32 = 4570.0;

// Keplerian angular velocity at radius r in equatorial Kerr-Newman.
// Matches reference GetKeplerianAngularVelocity exactly.
fn keplerian_omega(r: f32, M: f32, spinA: f32, Q: f32) -> f32 {
  let MrQ2 = M * r - Q * Q;
  if (MrQ2 < 0.0) { return 0.0; }
  let sqrtTerm = sqrt(MrQ2);
  return sqrtTerm / max(1.0e-9, r * r + spinA * sqrtTerm);
}

// Faithful port of reference DiskColor's per-sample logic:
//   - EffectiveRadius via quadratic transform of normalized r
//   - DenAndThiFactor via Shape(α=0.9, β=1.5) on EffectiveRadius
//   - PerturbedThickness modulated by ThickNoise (separate 3D Perlin sample)
//   - Inner cloud bound for the dust layer near ISCO
//   - BrightWithoutRedshift formula (DirVec.y mix + edge falloff + BB intensity)
//   - All 5 DiskColor multipliers applied in reference order
//   - ThetaInShell-driven photon-ring boost
//   - Reddening/Saturation chromatic compositing
fn accumulate_disk_emission(
  pos: vec3f, P_cov: vec4f, E_obs: f32,
  spinA: f32, Q: f32, M: f32,
  rIn: f32, rOut: f32, thin: f32, hopper: f32,
  thetaInShell: f32, rdBent: vec3f,
  t: f32, dl: f32,
  accumColor: ptr<function, vec3f>,
  transmittance: ptr<function, f32>
) {
  let r = length(pos.xz);
  if (r < rIn || r > rOut) { return; }

  let geomThin = thin + max(0.0, (r - 3.0) * hopper);

  // EffectiveRadius — reference's quadratic transform mapping normalized
  // radius to a remapped coordinate that concentrates resolution near ISCO
  let x = (r - rIn) / max(1.0e-6, rOut - rIn);
  let a_param = max(1.0, (rOut - rIn) / 10.0);
  var effectiveRadius: f32;
  if (abs(a_param - 1.0) < 1.0e-6) {
    effectiveRadius = x;
  } else {
    let disc = 1.0 + 4.0 * a_param * a_param * x - 4.0 * x * a_param;
    effectiveRadius = (-1.0 + sqrt(max(0.0, disc))) / (2.0 * a_param - 2.0);
  }

  // DenAndThiFactor — beta-distribution density profile peaks just outside ISCO
  let denAndThi = shape_alpha_beta(effectiveRadius, 0.9, 1.5);

  // ThickNoise — perturbs the geometric thickness per-position
  let noiseLevel = max(0.0, 2.0 - 0.6 * geomThin);
  let rotPosR_thick = r + (0.25 / 3.0) * t;
  let posLogTheta_thick = vec2_to_theta(
    pos.zx,
    vec2f(cos(-2.0 * log(max(1.0e-6, r))), sin(-2.0 * log(max(1.0e-6, r))))
  );
  let thickNoise = generate_disk_noise(
    vec3f(1.5 * posLogTheta_thick, rotPosR_thick, 0.0),
    -0.7 + noiseLevel, 1.3 + noiseLevel, 80.0
  );

  let thickWeight = 0.4 + 0.6 * clamp(geomThin - 0.5, 0.0, 2.5) / 2.5;
  let perturbedThickness = max(1.0e-6, geomThin * denAndThi *
    (thickWeight + (1.0 - thickWeight) * soft_saturate(thickNoise)));

  // Inner cloud bound — separate dust layer near ISCO
  let interCloudEffR = (r - rIn) / min(rOut - rIn, 12.0);
  let innerCloudBound = max(geomThin, thin) *
    max(0.0, 1.0 - 5.0 * pow(interCloudEffR, 2.0));
  let unionBound = max(geomThin * 1.5, max(0.0, innerCloudBound));

  let yAbs = abs(pos.y);
  if (yAbs > unionBound) { return; }

  let inMainDisk = yAbs < perturbedThickness;
  let inInnerCloud = yAbs < innerCloudBound;
  if (!inMainDisk && !inInnerCloud) { return; }

  // Spiral angles
  let spiralRot = spiral_theta(r, spinA);
  let posTheta = vec2_to_theta(pos.zx, vec2f(cos(-spiralRot), sin(-spiralRot)));

  // Doppler/redshift via analytical Kerr equatorial frame
  let omega_kep = keplerian_omega(r, M, spinA, Q);
  let inv_r = 1.0 / max(r, 1.0e-3);
  let Vpot = (2.0 * M * r - Q * Q) * inv_r * inv_r;
  let g_tt = -(1.0 - Vpot);
  let g_tphi = -spinA * Vpot;
  let g_phiphi = r * r + spinA * spinA + spinA * spinA * Vpot;
  let norm_metric = g_tt + 2.0 * omega_kep * g_tphi + omega_kep * omega_kep * g_phiphi;
  let u_t = inverseSqrt(max(0.01, -norm_metric));
  let L_phi = -pos.x * P_cov.z + pos.z * P_cov.x;
  let E_emit = u_t * (E_obs - omega_kep * L_phi);
  let freqRatio = 1.0 / max(0.15, E_emit);

  // Disk temperature (Novikov-Thorne with boundary T → 0 at ISCO)
  let isco = rIn;
  let novikov = max(0.0, 1.0 - sqrt(isco / max(r, isco)));
  let diskTemp = pow(
    pow(DISK_TEMP_PEAK, 4.0) * pow(isco / max(r, 1.0e-3), 3.0) * novikov,
    0.25
  );
  var visionTemp = diskTemp * pow(freqRatio, DISK_REDSHIFT_COLOR_EXP);

  // BrightWithoutRedshift — reference's complex brightness factor with
  // DirVec.y angle mix and edge falloff via EffectiveRadius
  let dirY = abs(rdBent.y);
  let brightAngleMix = mix(0.2 + 0.8 * dirY, 1.0, clamp(geomThin - 0.8, 0.2, 1.0));
  var brightWithoutRedshift =
    0.05 * min(rOut / 1000.0, 1000.0 / rOut) +
    0.55 / exp(5.0 * effectiveRadius) * brightAngleMix;
  brightWithoutRedshift = brightWithoutRedshift *
    pow(max(diskTemp / DISK_TEMP_PEAK, 1.0e-4), DISK_BB_INTENSITY_EXP);

  // Main disk noise — 3D Perlin with multiplicative accumulation
  let rotPosR = r + (0.25 / 3.0) * t;
  var density = denAndThi;
  var sampleColor = vec4f(0.0);

  if (inMainDisk) {
    let levelMut = 0.91 * log(1.0 + (0.06 / 0.91 * max(0.0, min(1000.0, r) - 10.0)));
    let conMut   = 80.0 * log(1.0 + (0.1 * 0.06 * max(0.0, min(1000000.0, r) - 10.0)));
    let mainNoise = generate_disk_noise(
      vec3f(0.1 * rotPosR, 0.1 * pos.y, 0.02 * pow(rOut, 0.7) * posTheta),
      noiseLevel + 2.0 - levelMut, noiseLevel + 4.0 - levelMut, 80.0 - conMut
    );
    sampleColor = vec4f(mainNoise);

    // VerticalMixFactor + density modulation (matches reference exactly)
    let verticalMix = max(0.0, 1.0 - yAbs / perturbedThickness);
    density = density * 0.7 * verticalMix * density;
    sampleColor = vec4f(
      sampleColor.xyz * density * 1.4,
      sampleColor.a * density * density / 0.3
    );

    // RelHeight modulation (brightens edges of disk)
    let relHeight = clamp(yAbs / perturbedThickness, 0.0, 1.0);
    sampleColor = vec4f(
      sampleColor.xyz * max(0.0, 0.2 + 2.0 * sqrt(max(0.0, relHeight * relHeight + 0.001))),
      sampleColor.a
    );
  }

  // Photon ring boost — driven by ThetaInShell (accumulated angular sweep
  // near photon sphere). Reference: iPhotonRingBoost = 7.0 (8x peak),
  // iPhotonRingColorTempBoost = 2.0 (3x peak). Activates at ThetaInShell > 1/3.
  let photonBoostFactor = clamp(0.3 * thetaInShell - 0.1, 0.0, 1.0);
  let photonRingMul = 1.0 + DISK_PHOTON_RING_BOOST * photonBoostFactor;
  let photonRingTempMul = 1.0 + DISK_PHOTON_RING_TEMP_BOOST * photonBoostFactor;
  sampleColor = vec4f(sampleColor.xyz * photonRingMul, sampleColor.a);
  visionTemp = visionTemp * photonRingTempMul;

  // Inner cloud detail layer (near ISCO dust haze)
  if (inInnerCloud) {
    let dustDenom = max(geomThin * max(1.0 - 5.0 * pow(interCloudEffR, 2.0), 0.0001), 1.0e-6);
    let dustIntensity = max(1.0 - pow(pos.y / dustDenom, 2.0), 0.0);
    if (dustIntensity > 0.0) {
      let innerAngVel = keplerian_omega(3.0, 1.0, spinA, Q);
      let innerCloudPhase = innerAngVel * t;
      let innerRotArg = 0.6666 * innerCloudPhase;
      let posThetaInner = vec2_to_theta(
        pos.zx, vec2f(cos(innerRotArg), sin(innerRotArg))
      );
      let dustNoise = generate_disk_noise(
        vec3f(
          1.5 * fract((1.5 * posThetaInner + innerCloudPhase) / TWO_PI) * TWO_PI,
          r,
          pos.y
        ),
        0.0, 6.0, 80.0
      );
      let dustVal = dustIntensity * dustNoise;
      sampleColor = sampleColor +
        0.02 * vec4f(vec3f(dustVal), 0.2 * dustVal) *
        sqrt(max(0.0, 1.0001 - dirY * dirY));
    }
  }

  // Apply blackbody color × BrightWithoutRedshift
  let bb = blackbody(visionTemp);
  sampleColor = vec4f(sampleColor.xyz * brightWithoutRedshift * bb, sampleColor.a);

  // Doppler intensity multiplier (capped at ShiftMax = 1.0 — receding side
  // gets dimmed by D⁴, approaching side capped at 1)
  sampleColor = vec4f(
    sampleColor.xyz * min(pow(freqRatio, DISK_REDSHIFT_INT_EXP), DISK_SHIFT_MAX),
    sampleColor.a
  );

  // Outer disk fade
  sampleColor = vec4f(
    sampleColor.xyz * min(1.0, 1.3 * (rOut - r) / max(rOut - rIn, 1.0e-6)),
    sampleColor.a
  );
  sampleColor.a = sampleColor.a * 0.125;

  // BoostFactor — parameter-dependent multiplier (peaks at inner disk)
  let factor1Inner = 5.0 / max(thin + hopper * 0.5 * rOut, 0.001);
  let factor1Outer = 100.0 / max(rOut, 1.0e-6);
  let factor2Outer = 0.3 + 0.7 * 100.0 / max(rOut, 1.0e-6);
  let outerWeight = exp(-pow(20.0 * r / max(rOut, 1.0e-6), 2.0));
  let boostA = vec4f(factor1Inner);
  let boostB = mix(vec4f(factor1Outer), vec4f(vec3f(factor2Outer), 1.0), outerWeight);
  let boostFactor = max(boostA, boostB);
  sampleColor = sampleColor * boostFactor;

  // DirVec.y angle boost (when looking edge-on, brighten emission)
  let dirYBoost = mix(
    1.0,
    max(1.0, dirY / 0.2),
    clamp(0.3 - 0.6 * (perturbedThickness / max(1.0e-6, density) - 1.0), 0.0, 0.3)
  );
  sampleColor = vec4f(sampleColor.xyz * dirYBoost, sampleColor.a);

  // Thin/Hopper geometry boost
  let thinBoost = 1.0 + 1.2 * max(0.0,
    max(0.0, min(1.0, 3.0 - 2.0 * thin)) * min(0.5, 1.0 - 5.0 * hopper)
  );
  sampleColor = vec4f(sampleColor.xyz * thinBoost, sampleColor.a);

  // Brightmut/Darkmut radial boosts — peak 4×/5× at ISCO, ramp to 1× at outer
  let radialNorm = (r - rIn) / max(1.0e-6, rOut - rIn);
  sampleColor = vec4f(
    sampleColor.xyz * DISK_BRIGHTMUT * clamp(4.0 - 18.0 * radialNorm, 1.0, 4.0),
    sampleColor.a * DISK_DARKMUT * clamp(5.0 - 24.0 * radialNorm, 1.0, 5.0)
  );

  // StepColor = SampleColor × dt
  let stepColor = sampleColor * dl;

  // Reddening/Saturation chromatic compositing (reference's exact formula)
  let alpha = 1.0 - (*transmittance);
  let oneMinusA = max(1.0 - alpha, 0.0);
  let aR = 1.0 + DISK_REDDENING * 0.0;  // = 1.0
  let aG = 1.0 + DISK_REDDENING * 2.0;  // = 1.6
  let aB = 1.0 + DISK_REDDENING * 5.0;  // = 2.5
  let trR = pow(oneMinusA, aR);
  let trG = pow(oneMinusA, aG);
  let trB = pow(oneMinusA, aB);
  let denom = stepColor.r * trR + stepColor.g * trG + stepColor.b * trB;
  if (denom > 1.0e-6) {
    let sumRgb = (stepColor.r + stepColor.g + stepColor.b) * trG;
    var r0 = sumRgb * stepColor.r * trR / denom;
    var g0 = sumRgb * stepColor.g * trG / denom;
    var b0 = sumRgb * stepColor.b * trB / denom;
    let totalRgb = max(r0 + g0 + b0, 1.0e-6);
    let satR = pow(max(3.0 * r0 / totalRgb, 0.0), DISK_SATURATION);
    let satG = pow(max(3.0 * g0 / totalRgb, 0.0), DISK_SATURATION);
    let satB = pow(max(3.0 * b0 / totalRgb, 0.0), DISK_SATURATION);
    *accumColor = (*accumColor) + vec3f(r0 * satR, g0 * satG, b0 * satB);
  }
  let newAlpha = alpha + stepColor.a * (1.0 - alpha);
  *transmittance = max(0.0, 1.0 - newAlpha);
}

// ════════════════════════════════════════════════════════════════════════
// VOLUMETRIC JETS (port of Buffer A's JetColor)
//
// Twin polar cones along ±Y. Two layers per cone: an inner core (narrow,
// near-axis) and an outer shell (wider). Bulk flow at ~0.9c along ±Y plus
// a small azimuthal twist. Doppler factor uses the proper 4-velocity
// normalized through the Kerr-Schild metric (not a flat-space approx).
// ════════════════════════════════════════════════════════════════════════
fn accumulate_jet_emission(
  pos: vec3f, P_cov: vec4f,
  spinA: f32, Q: f32,
  rIn: f32, rOut: f32,
  t: f32, dl: f32, jetMul: f32,
  accumColor: ptr<function, vec3f>
) {
  let posY = pos.y;
  let absY = abs(posY);
  if (absY < 0.5 || absY > rOut) { return; }

  let rho = length(pos.xz);
  let rhoSq = rho * rho;
  let posR = sqrt(rhoSq + posY * posY);

  var rawIntensity: f32 = 0.0;
  var inJet: bool = false;

  // --- Inner core (narrow, hugs the axis) ---
  if (rhoSq < 2.0 * rIn * rIn + 0.0009 * posY * posY && posR < 1.41421 * rOut) {
    inJet = true;
    let shape = 1.0 / sqrt(max(1.0e-9, rIn * rIn + 0.0004 * posY * posY));
    let drift = 0.7 + 0.3 * vnoise2(vec2f(absY * 0.4 + t * 0.6, rho * 0.6));
    var v = max(0.0, 1.0 - 5.0 * shape * abs(1.0 - pow(rho * shape, 2.0))) * shape;
    v = v * drift;
    v = v * max(0.0, 1.0 - exp(-0.0001 * posY * posY / max(1.0e-6, rIn * rIn)));
    v = v * exp(-2.0 * posR * posR / max(1.0e-6, rOut * rOut));
    rawIntensity = rawIntensity + v * 0.5;
  }

  // --- Outer shell (wider, encloses the core) ---
  let wid = absY;
  if (rho < 1.3 * rIn + 0.25 * wid && rho > 0.7 * rIn + 0.15 * wid && posR < 30.0 * rIn) {
    inJet = true;
    let shape = 1.0 / max(1.0e-9, rIn + 0.2 * wid);
    var v = max(0.0, 1.0 - 2.0 * abs(1.0 - pow(rho * shape, 2.0))) * shape;
    v = v * (1.0 - exp(-posY * posY / max(1.0e-6, rIn * rIn)));
    v = v * exp(-0.005 * posY * posY / max(1.0e-6, rIn * rIn));
    rawIntensity = rawIntensity + v * 0.5;
  }

  if (!inJet || rawIntensity < 0.001) { return; }

  // Proper 4-velocity normalization via the Kerr-Schild metric
  let geo = compute_geometry_scalars(pos, spinA, Q, 1.0, 1.0);
  let jetSpatial = vec3f(0.0, sign(posY) * 0.9, 0.0);
  let rotSpatial = vec3f(pos.z, 0.0, -pos.x) / max(rho, 0.01);
  let finalSpatial = jetSpatial + rotSpatial * 0.05;

  let U_unnorm = vec4f(finalSpatial, 1.0);
  let U_lower = lower_index(U_unnorm, geo);
  let norm_sq = dot(U_unnorm, U_lower);
  let U_jet = U_unnorm * inverseSqrt(max(1.0e-6, abs(norm_sq)));

  let E_emit = -dot(P_cov, U_jet);
  let freqRatio = 1.0 / max(1.0e-6, E_emit);

  let jetTemp = 100000.0 * freqRatio;
  let bb = blackbody(jetTemp);
  let beam = min(pow(freqRatio, 2.0), 4.0);

  *accumColor = (*accumColor) + bb * rawIntensity * beam * jetMul * dl * 0.4;
}

// ════════════════════════════════════════════════════════════════════════
// TRACE RAY — geodesic stepping with volumetric disk + horizon + escape
//
// Carries (accumColor, transmittance) state through the integration. Each
// RK4 step samples the disk at its midpoint, accumulating emission +
// absorption. Terminates on horizon, escape past escapeR, or full disk
// opacity (transmittance < threshold).
// ════════════════════════════════════════════════════════════════════════
struct TraceResult {
  rgb: vec3f,
  escapeDir: vec3f,
  transmittance: f32,  // remaining for caller to blend background through
  shift: f32,
  status: i32,  // 0=absorbed/horizon, 1=escaped to sky, 2=disk-saturated
  minR: f32,    // minimum BL radius the geodesic reached (for photon-ring boost)
}

fn trace_ray(
  rdWorld: vec3f, roWorld: vec3f,
  spinA: f32, Q: f32,
  rIn: f32, rOut: f32,
  thin: f32, hopper: f32,
  jetMul: f32,
  t: f32
) -> TraceResult {
  var res: TraceResult;
  res.rgb = vec3f(0.0);
  res.escapeDir = vec3f(0.0);
  res.transmittance = 1.0;
  res.shift = 1.0;
  res.status = 0;
  res.minR = 1.0e10;

  let M = CONST_M;

  // Boundary radius for geodesic integration
  let escapeR = max(rOut + 4.0, 60.0);

  // Event horizon r_+ = M + sqrt(M² - a² - Q²); naked singularity if disc < 0
  let horizonDisc = M * M - spinA * spinA - Q * Q;
  let nakedSingularity = horizonDisc < 0.0;
  let rHorizon = M + sqrt(max(0.0, horizonDisc));

  // Initial state: position + covariant momentum from camera ray
  let X0 = vec4f(roWorld, 0.0);
  let P0 = get_initial_momentum(rdWorld, X0, 1.0, spinA, Q, 1.0);
  let E_conserved = -P0.w;

  var state: State;
  state.X = X0;
  state.P = P0;
  var universeSign: f32 = 1.0;

  var lastPos: vec3f = roWorld;
  var lastR_BL: f32 = kerr_schild_radius(roWorld, spinA, universeSign);
  var accumColor = vec3f(0.0);
  var transmittance: f32 = 1.0;
  var thetaInShell: f32 = 0.0;

  // Photon-shell radius (reference: 1.6 + |a*|^(2/3) for prograde).
  // Canonical clamp: qFactor [0, 1.0]  (Shadertoy version had 2.0 — wrong)
  let aDimensionless = spinA / CONST_M;
  let qDimensionless = Q / CONST_M;
  let photonShellRadius = 1.6 + pow(abs(aDimensionless), 0.6666);
  let qFactor = clamp(11.0 - 10.0 * (aDimensionless * aDimensionless +
                                      qDimensionless * qDimensionless), 0.0, 1.0);

  for (var i: i32 = 0; i < MAX_STEPS; i = i + 1) {
    let pos = state.X.xyz;
    let R = length(pos);
    if (R < res.minR) { res.minR = R; }

    // Escape — outgoing direction from contravariant momentum
    if (R > escapeR) {
      var geoEsc = compute_geometry_scalars(pos, spinA, Q, 1.0, universeSign);
      let dirContra = raise_index(state.P, geoEsc);
      let outDir = -normalize(dirContra.xyz);
      res.status = 1;
      res.escapeDir = outDir;
      res.rgb = accumColor;
      res.transmittance = transmittance;
      res.shift = 1.0 / max(1.0e-3, E_conserved);
      return res;
    }

    // Horizon — only the disk emission accumulated so far is visible
    if (!nakedSingularity && universeSign > 0.0) {
      let r_BL = kerr_schild_radius(pos, spinA, universeSign);
      if (r_BL < rHorizon * 1.02 && r_BL > 0.0) {
        res.status = 0;
        res.rgb = accumColor;
        res.transmittance = 0.0;
        return res;
      }
    }

    // Adaptive step size
    var dLambda: f32;
    if (R < 4.0) {
      dLambda = 0.08;
    } else if (R < 20.0) {
      dLambda = 0.08 + 0.10 * (R - 4.0);
    } else {
      dLambda = clamp(R * 0.18, 1.7, 8.0);
    }

    var geo0 = compute_geometry_scalars(pos, spinA, Q, 1.0, universeSign);
    let k1 = get_derivatives(state, spinA, Q, 1.0, &geo0);

    // Step backward (negative dλ — tracing from camera into the past)
    step_geodesic_rk4(&state, E_conserved, -dLambda,
                      spinA, Q, 1.0, universeSign, k1);

    let newPos = state.X.xyz;
    let stepVec = newPos - lastPos;
    let dl = length(stepVec);
    let newR_BL = kerr_schild_radius(newPos, spinA, universeSign);

    // ThetaInShell — accumulated angular sweep near the photon sphere.
    // Reference: increments when r < 1.6 + |a*|^(2/3), weighted by
    //   step_length / avg_r / (1 + 1000 * (dr/dλ)²) * rotFact * qFactor
    // where rotFact rewards prograde motion.
    if (newR_BL < photonShellRadius && newR_BL > 0.0 && dl > 1.0e-9) {
      let drdl = (newR_BL - lastR_BL) / dl;
      let xz_len = length(newPos.xz);
      var rotFact: f32 = 1.0;
      if (xz_len > 1.0e-6) {
        let dotTerm = dot(-stepVec, vec3f(newPos.z, 0.0, -newPos.x)) /
                      (dl * xz_len);
        // Canonical clamp: rotFact [0, 2.0] (Shadertoy version had 1.0 — wrong)
        rotFact = clamp(1.0 + DISK_BOOST_ROT * dotTerm *
                              clamp(aDimensionless, -1.0, 1.0), 0.0, 2.0);
      }
      let avgR = 0.5 * (lastR_BL + newR_BL);
      thetaInShell = thetaInShell +
        dl / max(avgR, 1.0e-9) /
        (1.0 + 1000.0 * drdl * drdl) *
        rotFact * qFactor;
    }

    // Volumetric disk + jet sample at segment midpoint
    let midPos = 0.5 * (lastPos + newPos);
    let rdBent = stepVec / max(dl, 1.0e-9);

    // Canonical clamps spin passed to DiskColor at ±0.49 for numerical stability
    let diskSpinA = clamp(spinA, -0.49, 0.49);
    accumulate_disk_emission(
      midPos, state.P, E_conserved,
      diskSpinA, Q, M, rIn, rOut, thin, hopper,
      thetaInShell, rdBent,
      t, dl,
      &accumColor, &transmittance
    );
    if (jetMul > 0.001) {
      accumulate_jet_emission(
        midPos, state.P, spinA, Q, rIn, rOut,
        t, dl, jetMul,
        &accumColor
      );
    }

    if (transmittance < 0.02) {
      res.status = 2;
      res.rgb = accumColor;
      res.transmittance = 0.0;
      return res;
    }

    universeSign = get_intermediate_sign(
      vec4f(lastPos, 0.0), state.X, universeSign, spinA
    );

    lastPos = newPos;
    lastR_BL = newR_BL;
  }

  // Step budget exhausted — surface accumulated emission, no background
  res.status = 0;
  res.rgb = accumColor;
  res.transmittance = 0.0;
  return res;
}

// ────────────────────────────────────────────────────────────────────────
// Vertex — fullscreen triangle
// ────────────────────────────────────────────────────────────────────────
@vertex
fn vs_main(@builtin(vertex_index) idx: u32) -> @builtin(position) vec4f {
  let x = f32((idx << 1u) & 2u);
  let y = f32(idx & 2u);
  return vec4f(x * 2.0 - 1.0, y * 2.0 - 1.0, 0.0, 1.0);
}

// ────────────────────────────────────────────────────────────────────────
// Fragment
// ────────────────────────────────────────────────────────────────────────
@fragment
fn fs_main(@builtin(position) coord: vec4f) -> @location(0) vec4f {
  let fragCoord = vec2f(coord.x, u.res.y - coord.y);
  let uv = (fragCoord - 0.5 * u.res) / u.res.y;

  let pointerOffset = vec2f(u.pointerX, u.pointerY) * 0.04;
  let rdLocal = normalize(vec3f((uv.x + pointerOffset.x) * u.fov,
                                (uv.y + pointerOffset.y) * u.fov,
                                -1.0));
  let rd = normalize(
    u.camRight * rdLocal.x +
    u.camUp * rdLocal.y +
    u.camFwd * (-rdLocal.z)
  );
  let ro = u.camPos;

  let physicalSpinA = u.spin * CONST_M;
  let physicalQ = u.charge * CONST_M;

  // Reference iThinRs = 0.75, iHopper = 0.24 (Rs-units, matches my units since CONST_M = 0.5 → Rs = 1)
  let thin = 0.75;
  let hopper = 0.24;

  // Reference iBlackHoleTime = 2.0 * iTime (faster disk evolution than iTime alone)
  let blackHoleTime = 2.0 * u.time;

  // Reference jet gate: jet brightness ≈ 0 at default iAccretionRate = 5e-4
  // because (0.5 + 0.5 * tanh(log(5e-4) + 1)) ≈ 0.0005. Mostly off in default config.
  let accretionRate = 5.0e-4;
  let jetGate = 0.5 + 0.5 * tanh(log(max(accretionRate, 1.0e-6)) + 1.0);
  let jetMul = u.jetIntensity * jetGate;

  let trace = trace_ray(
    rd, ro, physicalSpinA, physicalQ,
    u.diskInner, u.diskOuter, thin, hopper,
    jetMul,
    blackHoleTime
  );

  // Composite: accumulated disk emission (with proper ThetaInShell-driven
  // photon-ring boost applied per-sample inside trace_ray) + lensed background
  var raw = trace.rgb;
  if (trace.status == 1 && trace.transmittance > 1.0e-3) {
    let bg = sample_background(trace.escapeDir, trace.shift);
    raw = raw + bg * trace.transmittance;
  }

  // ApplyToneMapping: range expansion (reference's pre-bloom HDR boost).
  // For x ∈ [0, 1): -4 · log(1 - x^2.2) gives a smooth HDR ramp.
  // For x ≥ 1: clamped to BloomMax · channelFactor — preserves channel
  // ratios (color) at saturation instead of clipping to gray.
  let totalRgb = max(raw.r + raw.g + raw.b, 1.0e-6);
  let redFactor   = 3.0 * raw.r / totalRgb;
  let greenFactor = 3.0 * raw.g / totalRgb;
  let blueFactor  = 3.0 * raw.b / totalRgb;
  let bloomMax    = max(8.0, trace.shift);

  var mappedR: f32;
  var mappedG: f32;
  var mappedB: f32;
  if (raw.r < 0.9999) {
    mappedR = min(-4.0 * log(1.0 - pow(max(raw.r, 0.0), 2.2)), bloomMax * redFactor);
  } else {
    mappedR = bloomMax * redFactor;
  }
  if (raw.g < 0.9999) {
    mappedG = min(-4.0 * log(1.0 - pow(max(raw.g, 0.0), 2.2)), bloomMax * greenFactor);
  } else {
    mappedG = bloomMax * greenFactor;
  }
  if (raw.b < 0.9999) {
    mappedB = min(-4.0 * log(1.0 - pow(max(raw.b, 0.0), 2.2)), bloomMax * blueFactor);
  } else {
    mappedB = bloomMax * blueFactor;
  }

  let fadeIn = 1.0 - clamp(u.warmup, 0.0, 1.0);
  return vec4f(vec3f(mappedR, mappedG, mappedB) * fadeIn, 1.0);
}
`;

// ════════════════════════════════════════════════════════════════════════
// STARFIELD CUBEMAP GENERATOR (compute, runs once at init)
//
// Procedurally fills a 6-layer (cubemap) texture with sparse, bright stars
// on a TRULY BLACK background. The reference image's deep-black sky comes
// from a real Milky-Way cubemap; we approximate with a high-quality
// procedural one. Sampled per-pixel in Buffer A via texture_cube — no
// per-frame procedural cost, no temporal noise.
// ════════════════════════════════════════════════════════════════════════
export const BLACKHOLE_STARFIELD_GEN_WGSL = /* wgsl */ `
@group(0) @binding(0) var cubemap : texture_storage_2d_array<rgba16float, write>;

const FACE_SIZE: u32 = 1024u;
const TWO_PI: f32 = 6.28318530718;

fn cube_face_dir(face: u32, uv: vec2f) -> vec3f {
  let u = uv.x * 2.0 - 1.0;
  let v = uv.y * 2.0 - 1.0;
  var dir: vec3f;
  switch face {
    case 0u: { dir = vec3f( 1.0, -v, -u); }
    case 1u: { dir = vec3f(-1.0, -v,  u); }
    case 2u: { dir = vec3f( u,  1.0,  v); }
    case 3u: { dir = vec3f( u, -1.0, -v); }
    case 4u: { dir = vec3f( u, -v,  1.0); }
    default: { dir = vec3f(-u, -v, -1.0); }
  }
  return normalize(dir);
}

fn hash31(p: vec3f) -> f32 {
  let q = p - 289.0 * floor(p / 289.0);
  return fract(sin(dot(q, vec3f(12.9898, 78.233, 45.164))) * 43758.5453);
}

fn hash33(p: vec3f) -> vec3f {
  return vec3f(
    hash31(p),
    hash31(p + vec3f(11.4, 23.7, 71.2)),
    hash31(p + vec3f(53.1, 97.3, 13.9))
  );
}

fn blackbody(kelvin: f32) -> vec3f {
  let k = clamp(kelvin, 800.0, 30000.0);
  let teff = (k - 6500.0) / (6500.0 * k * 2.2);
  var c = vec3f(
    exp(2.05539304e4 * teff),
    exp(2.63463675e4 * teff),
    exp(3.30145739e4 * teff)
  );
  let m = max(max(1.5 * c.r, c.g), c.b);
  c = c / max(m, 1.0e-6);
  if (k < 1000.0) { c = c * ((k - 400.0) / 600.0); }
  return c;
}

// Multi-layer star sampling — 3 octaves of grids (different densities/sizes)
fn sample_stars_for_dir(dir: vec3f) -> vec3f {
  var col = vec3f(0.0);

  // Layer 1: very sparse, very bright "showy" stars
  {
    let gridRes = 60.0;
    let g = dir * gridRes;
    let id = floor(g);
    let fr = fract(g) - vec3f(0.5);
    let h = hash33(id * 4.317);
    let thresh = 0.992;
    if (h.x >= thresh) {
      let n = (h.x - thresh) / (1.0 - thresh);
      let off = (h * 2.0 - vec3f(1.0)) * 0.28;
      let d = length(fr - off);
      let size = 0.025 + 0.07 * n;
      let core = exp(-d * d / (size * size) * 2.0);
      let temp = mix(5500.0, 14000.0, h.y);
      col = col + blackbody(temp) * core * n * 12.0;
    }
  }

  // Layer 2: medium density, medium brightness
  {
    let gridRes = 220.0;
    let g = dir * gridRes;
    let id = floor(g);
    let fr = fract(g) - vec3f(0.5);
    let h = hash33(id * 1.731);
    let thresh = 0.978;
    if (h.x >= thresh) {
      let n = (h.x - thresh) / (1.0 - thresh);
      let off = (h * 2.0 - vec3f(1.0)) * 0.30;
      let d = length(fr - off);
      let size = 0.012 + 0.04 * n;
      let core = exp(-d * d / (size * size) * 3.0);
      let temp = mix(3500.0, 12000.0, h.y * h.y);
      col = col + blackbody(temp) * core * n * 4.0;
    }
  }

  // Layer 3: dense faint background stars
  {
    let gridRes = 600.0;
    let g = dir * gridRes;
    let id = floor(g);
    let fr = fract(g) - vec3f(0.5);
    let h = hash33(id * 9.713);
    let thresh = 0.965;
    if (h.x >= thresh) {
      let n = (h.x - thresh) / (1.0 - thresh);
      let off = (h * 2.0 - vec3f(1.0)) * 0.35;
      let d = length(fr - off);
      let size = 0.008 + 0.020 * n;
      let core = exp(-d * d / (size * size) * 3.5);
      let temp = mix(3000.0, 11000.0, h.y);
      col = col + blackbody(temp) * core * n * 1.2;
    }
  }

  return col;
}

@compute @workgroup_size(8, 8, 1)
fn cs_main(@builtin(global_invocation_id) gid: vec3u) {
  if (gid.x >= FACE_SIZE || gid.y >= FACE_SIZE) { return; }
  let uv = (vec2f(f32(gid.x), f32(gid.y)) + vec2f(0.5)) / f32(FACE_SIZE);
  let dir = cube_face_dir(gid.z, uv);
  let color = sample_stars_for_dir(dir);
  textureStore(cubemap, vec2i(i32(gid.x), i32(gid.y)), i32(gid.z), vec4f(color, 1.0));
}
`;

// ════════════════════════════════════════════════════════════════════════
// BUFFER B — bloom mip pyramid in atlas layout
//
// Reads Buffer A's HDR output. Writes 8 octaves of the source downsampled
// at scales 2× through 256×, packed into one texture per the reference's
// CalcOffset layout. Each octave is a box-filter average of the source.
// ════════════════════════════════════════════════════════════════════════
export const BLACKHOLE_BLOOM_WGSL = /* wgsl */ `
struct Uniforms {
  res: vec2f,
  time: f32,
  warmup: f32,
  camPos: vec3f,
  spin: f32,
  camFwd: vec3f,
  fov: f32,
  camRight: vec3f,
  diskInner: f32,
  camUp: vec3f,
  diskOuter: f32,
  bhMass: f32,
  pointerX: f32,
  pointerY: f32,
  bloomIntensity: f32,
  scroll: f32,
  backgroundBrightmut: f32,
  jetIntensity: f32,
  charge: f32,
}

@group(0) @binding(0) var<uniform> u: Uniforms;
@group(0) @binding(1) var srcTex: texture_2d<f32>;
@group(0) @binding(2) var srcSampler: sampler;

fn color_fetch(coord: vec2f) -> vec3f {
  return textureSampleLevel(srcTex, srcSampler, coord, 0.0).rgb;
}

fn calc_offset(octave: f32) -> vec2f {
  var offset = vec2f(0.0);
  let padding = vec2f(10.0) / u.res;
  offset.x = -min(1.0, floor(octave / 3.0)) * (0.25 + padding.x);
  offset.y = -(1.0 - (1.0 / exp2(octave))) - padding.y * octave;
  offset.y = offset.y + min(1.0, floor(octave / 3.0)) * 0.35;
  return offset;
}

fn grab1(coord: vec2f, octave: f32, offset: vec2f) -> vec3f {
  let scale = exp2(octave);
  var c = coord + offset;
  c = c * scale;
  if (c.x < 0.0 || c.x > 1.0 || c.y < 0.0 || c.y > 1.0) { return vec3f(0.0); }
  return color_fetch(c);
}

fn grab4(coord: vec2f, octave: f32, offset: vec2f) -> vec3f {
  let scale = exp2(octave);
  var c = coord + offset;
  c = c * scale;
  if (c.x < 0.0 || c.x > 1.0 || c.y < 0.0 || c.y > 1.0) { return vec3f(0.0); }
  var color = vec3f(0.0);
  for (var i: i32 = 0; i < 4; i = i + 1) {
    for (var j: i32 = 0; j < 4; j = j + 1) {
      let off = (vec2f(f32(i), f32(j)) - vec2f(2.0)) / u.res * scale / 4.0;
      color = color + color_fetch(c + off);
    }
  }
  return color / 16.0;
}

fn grab8(coord: vec2f, octave: f32, offset: vec2f) -> vec3f {
  let scale = exp2(octave);
  var c = coord + offset;
  c = c * scale;
  if (c.x < 0.0 || c.x > 1.0 || c.y < 0.0 || c.y > 1.0) { return vec3f(0.0); }
  var color = vec3f(0.0);
  for (var i: i32 = 0; i < 8; i = i + 1) {
    for (var j: i32 = 0; j < 8; j = j + 1) {
      let off = (vec2f(f32(i), f32(j)) - vec2f(4.0)) / u.res * scale / 8.0;
      color = color + color_fetch(c + off);
    }
  }
  return color / 64.0;
}

@vertex
fn vs_main(@builtin(vertex_index) idx: u32) -> @builtin(position) vec4f {
  let x = f32((idx << 1u) & 2u);
  let y = f32(idx & 2u);
  return vec4f(x * 2.0 - 1.0, y * 2.0 - 1.0, 0.0, 1.0);
}

@fragment
fn fs_main(@builtin(position) coord: vec4f) -> @location(0) vec4f {
  let uv = coord.xy / u.res;
  var color = vec3f(0.0);
  color = color + grab1(uv, 1.0, vec2f(0.0));
  color = color + grab4(uv, 2.0, calc_offset(1.0));
  color = color + grab8(uv, 3.0, calc_offset(2.0));
  color = color + grab8(uv, 4.0, calc_offset(3.0));
  color = color + grab8(uv, 5.0, calc_offset(4.0));
  color = color + grab8(uv, 6.0, calc_offset(5.0));
  color = color + grab8(uv, 7.0, calc_offset(6.0));
  color = color + grab8(uv, 8.0, calc_offset(7.0));
  return vec4f(color, 1.0);
}
`;

// ════════════════════════════════════════════════════════════════════════
// BUFFER C — horizontal Gaussian blur (matches reference weights/offsets)
// ════════════════════════════════════════════════════════════════════════
export const BLACKHOLE_BLUR_H_WGSL = /* wgsl */ `
struct Uniforms {
  res: vec2f,
  time: f32,
  warmup: f32,
  camPos: vec3f,
  spin: f32,
  camFwd: vec3f,
  fov: f32,
  camRight: vec3f,
  diskInner: f32,
  camUp: vec3f,
  diskOuter: f32,
  bhMass: f32,
  pointerX: f32,
  pointerY: f32,
  bloomIntensity: f32,
  scroll: f32,
  backgroundBrightmut: f32,
  jetIntensity: f32,
  charge: f32,
}

@group(0) @binding(0) var<uniform> u: Uniforms;
@group(0) @binding(1) var srcTex: texture_2d<f32>;
@group(0) @binding(2) var srcSampler: sampler;

fn color_fetch(coord: vec2f) -> vec3f {
  return textureSampleLevel(srcTex, srcSampler, coord, 0.0).rgb;
}

const W0: f32 = 0.19638062;
const W1: f32 = 0.29675293;
const W2: f32 = 0.09442139;
const W3: f32 = 0.01037598;
const W4: f32 = 0.00025940;
const O1: f32 = 1.41176471;
const O2: f32 = 3.29411765;
const O3: f32 = 5.17647059;
const O4: f32 = 7.05882353;

@vertex
fn vs_main(@builtin(vertex_index) idx: u32) -> @builtin(position) vec4f {
  let x = f32((idx << 1u) & 2u);
  let y = f32(idx & 2u);
  return vec4f(x * 2.0 - 1.0, y * 2.0 - 1.0, 0.0, 1.0);
}

@fragment
fn fs_main(@builtin(position) coord: vec4f) -> @location(0) vec4f {
  let uv = coord.xy / u.res;
  // Reference early-out: only the bloom atlas region (left ~52%) needs blurring
  if (uv.x >= 0.52) { return vec4f(0.0, 0.0, 0.0, 1.0); }

  var color = vec3f(0.0);
  var weightSum: f32 = 0.0;

  color = color + color_fetch(uv) * W0;
  weightSum = weightSum + W0;

  let off = vec2f(0.5, 0.0) / u.res;

  color = color + color_fetch(uv + off * O1) * W1;
  color = color + color_fetch(uv - off * O1) * W1;
  weightSum = weightSum + W1 * 2.0;

  color = color + color_fetch(uv + off * O2) * W2;
  color = color + color_fetch(uv - off * O2) * W2;
  weightSum = weightSum + W2 * 2.0;

  color = color + color_fetch(uv + off * O3) * W3;
  color = color + color_fetch(uv - off * O3) * W3;
  weightSum = weightSum + W3 * 2.0;

  color = color + color_fetch(uv + off * O4) * W4;
  color = color + color_fetch(uv - off * O4) * W4;
  weightSum = weightSum + W4 * 2.0;

  return vec4f(color / weightSum, 1.0);
}
`;

// ════════════════════════════════════════════════════════════════════════
// BUFFER D — vertical Gaussian blur (same kernel as C, vertical offsets)
// ════════════════════════════════════════════════════════════════════════
export const BLACKHOLE_BLUR_V_WGSL = /* wgsl */ `
struct Uniforms {
  res: vec2f,
  time: f32,
  warmup: f32,
  camPos: vec3f,
  spin: f32,
  camFwd: vec3f,
  fov: f32,
  camRight: vec3f,
  diskInner: f32,
  camUp: vec3f,
  diskOuter: f32,
  bhMass: f32,
  pointerX: f32,
  pointerY: f32,
  bloomIntensity: f32,
  scroll: f32,
  backgroundBrightmut: f32,
  jetIntensity: f32,
  charge: f32,
}

@group(0) @binding(0) var<uniform> u: Uniforms;
@group(0) @binding(1) var srcTex: texture_2d<f32>;
@group(0) @binding(2) var srcSampler: sampler;

fn color_fetch(coord: vec2f) -> vec3f {
  return textureSampleLevel(srcTex, srcSampler, coord, 0.0).rgb;
}

const W0: f32 = 0.19638062;
const W1: f32 = 0.29675293;
const W2: f32 = 0.09442139;
const W3: f32 = 0.01037598;
const W4: f32 = 0.00025940;
const O1: f32 = 1.41176471;
const O2: f32 = 3.29411765;
const O3: f32 = 5.17647059;
const O4: f32 = 7.05882353;

@vertex
fn vs_main(@builtin(vertex_index) idx: u32) -> @builtin(position) vec4f {
  let x = f32((idx << 1u) & 2u);
  let y = f32(idx & 2u);
  return vec4f(x * 2.0 - 1.0, y * 2.0 - 1.0, 0.0, 1.0);
}

@fragment
fn fs_main(@builtin(position) coord: vec4f) -> @location(0) vec4f {
  let uv = coord.xy / u.res;
  if (uv.x >= 0.52) { return vec4f(0.0, 0.0, 0.0, 1.0); }

  var color = vec3f(0.0);
  var weightSum: f32 = 0.0;

  color = color + color_fetch(uv) * W0;
  weightSum = weightSum + W0;

  let off = vec2f(0.0, 0.5) / u.res;

  color = color + color_fetch(uv + off * O1) * W1;
  color = color + color_fetch(uv - off * O1) * W1;
  weightSum = weightSum + W1 * 2.0;

  color = color + color_fetch(uv + off * O2) * W2;
  color = color + color_fetch(uv - off * O2) * W2;
  weightSum = weightSum + W2 * 2.0;

  color = color + color_fetch(uv + off * O3) * W3;
  color = color + color_fetch(uv - off * O3) * W3;
  weightSum = weightSum + W3 * 2.0;

  color = color + color_fetch(uv + off * O4) * W4;
  color = color + color_fetch(uv - off * O4) * W4;
  weightSum = weightSum + W4 * 2.0;

  return vec4f(color / weightSum, 1.0);
}
`;

// ════════════════════════════════════════════════════════════════════════
// IMAGE — composite Buffer A (sharp scene) + Buffer D (blurred bloom atlas)
// with bicubic upsampling, then the reference's exact tonemap chain:
//   smoothed Reinhard → smoothstep → cool grade (1.3, 1.2, 1.0) → 0.7/2.2 gamma
// ════════════════════════════════════════════════════════════════════════
export const BLACKHOLE_IMAGE_WGSL = /* wgsl */ `
struct Uniforms {
  res: vec2f,
  time: f32,
  warmup: f32,
  camPos: vec3f,
  spin: f32,
  camFwd: vec3f,
  fov: f32,
  camRight: vec3f,
  diskInner: f32,
  camUp: vec3f,
  diskOuter: f32,
  bhMass: f32,
  pointerX: f32,
  pointerY: f32,
  bloomIntensity: f32,
  scroll: f32,
  backgroundBrightmut: f32,
  jetIntensity: f32,
  charge: f32,
}

@group(0) @binding(0) var<uniform> u: Uniforms;
@group(0) @binding(1) var sceneTex: texture_2d<f32>;
@group(0) @binding(2) var bloomTex: texture_2d<f32>;
@group(0) @binding(3) var srcSampler: sampler;

fn color_fetch(coord: vec2f) -> vec3f {
  return textureSampleLevel(sceneTex, srcSampler, coord, 0.0).rgb;
}

fn cubic(x: f32) -> vec4f {
  let x2 = x * x;
  let x3 = x2 * x;
  return vec4f(
    -x3 + 3.0*x2 - 3.0*x + 1.0,
    3.0*x3 - 6.0*x2       + 4.0,
    -3.0*x3 + 3.0*x2 + 3.0*x + 1.0,
    x3
  ) / 6.0;
}

fn bicubic_bloom(coord_in: vec2f) -> vec4f {
  var coord = coord_in * u.res;
  let fx = fract(coord.x);
  let fy = fract(coord.y);
  coord.x = coord.x - fx;
  coord.y = coord.y - fy;
  let fx_adj = fx - 0.5;
  let fy_adj = fy - 0.5;
  let xc = cubic(fx_adj);
  let yc = cubic(fy_adj);

  let c = vec4f(coord.x - 0.5, coord.x + 1.5, coord.y - 0.5, coord.y + 1.5);
  let s = vec4f(xc.x + xc.y, xc.z + xc.w, yc.x + yc.y, yc.z + yc.w);
  let off = c + vec4f(xc.y, xc.w, yc.y, yc.w) / s;

  let s0 = textureSampleLevel(bloomTex, srcSampler, vec2f(off.x, off.z) / u.res, 0.0);
  let s1 = textureSampleLevel(bloomTex, srcSampler, vec2f(off.y, off.z) / u.res, 0.0);
  let s2 = textureSampleLevel(bloomTex, srcSampler, vec2f(off.x, off.w) / u.res, 0.0);
  let s3 = textureSampleLevel(bloomTex, srcSampler, vec2f(off.y, off.w) / u.res, 0.0);

  let sx = s.x / (s.x + s.y);
  let sy = s.z / (s.z + s.w);
  return mix(mix(s3, s2, sx), mix(s1, s0, sx), sy);
}

fn calc_offset(octave: f32) -> vec2f {
  var offset = vec2f(0.0);
  let padding = vec2f(10.0) / u.res;
  offset.x = -min(1.0, floor(octave / 3.0)) * (0.25 + padding.x);
  offset.y = -(1.0 - (1.0 / exp2(octave))) - padding.y * octave;
  offset.y = offset.y + min(1.0, floor(octave / 3.0)) * 0.35;
  return offset;
}

fn grab(coord: vec2f, octave: f32, offset: vec2f) -> vec3f {
  let scale = exp2(octave);
  var c = coord / scale;
  c = c - offset;
  return bicubic_bloom(c).rgb;
}

fn get_bloom(coord: vec2f) -> vec3f {
  var bloom = vec3f(0.0);
  bloom = bloom + grab(coord, 1.0, calc_offset(0.0)) * 1.0;
  bloom = bloom + grab(coord, 2.0, calc_offset(1.0)) * 1.5;
  bloom = bloom + grab(coord, 3.0, calc_offset(2.0)) * 1.0;
  bloom = bloom + grab(coord, 4.0, calc_offset(3.0)) * 1.5;
  bloom = bloom + grab(coord, 5.0, calc_offset(4.0)) * 1.8;
  bloom = bloom + grab(coord, 6.0, calc_offset(5.0)) * 1.0;
  bloom = bloom + grab(coord, 7.0, calc_offset(6.0)) * 1.0;
  bloom = bloom + grab(coord, 8.0, calc_offset(7.0)) * 1.0;
  return bloom;
}

@vertex
fn vs_main(@builtin(vertex_index) idx: u32) -> @builtin(position) vec4f {
  let x = f32((idx << 1u) & 2u);
  let y = f32(idx & 2u);
  return vec4f(x * 2.0 - 1.0, y * 2.0 - 1.0, 0.0, 1.0);
}

@fragment
fn fs_main(@builtin(position) coord: vec4f) -> @location(0) vec4f {
  let uv = coord.xy / u.res;
  var color = color_fetch(uv);
  // Reference Image-pass: bloom * 0.08
  color = color + get_bloom(uv) * 0.08 * u.bloomIntensity;

  // Reference Image-pass tonemap chain:
  //   smoothed-Reinhard with split gamma, then smoothstep punch,
  //   cool grade (R/G darken, B preserved), saturate, harsh final gamma.
  color = pow(max(color, vec3f(0.0)), vec3f(1.5));
  color = color / (1.0 + color);
  color = pow(max(color, vec3f(0.0)), vec3f(1.0 / 1.5));

  color = color * color * (3.0 - 2.0 * color);
  color = pow(max(color, vec3f(0.0)), vec3f(1.3, 1.20, 1.0));
  color = clamp(color * 1.01, vec3f(0.0), vec3f(1.0));
  color = pow(max(color, vec3f(0.0)), vec3f(0.7 / 2.2));

  return vec4f(color, 1.0);
}
`;
