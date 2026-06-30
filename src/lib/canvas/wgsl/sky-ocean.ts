/**
 * Procedural sky-ocean shader (Thrivaxis Acid mood).
 *
 * A single fullscreen pass: ray from camera, intersect sky/ocean plane,
 * shade with multi-octave waves, fresnel, sun + moon, stars, clouds,
 * post-graded with ACES into the Thrivaxis acid-green palette.
 *
 * Sun altitude is driven primarily by `u_sunAltitude` (scroll progress
 * across the page); the cursor adds a small offset on top so visitors
 * can still nudge the sun. Sun and moon are antipodal, so as the sun
 * sets, the moon rises and the sky cross-fades through dusk into night.
 *
 * Uniform layout must match src/lib/canvas/sky-ocean-uniforms.ts.
 */
export const SKY_OCEAN_WGSL = /* wgsl */ `
struct Uniforms {
  res: vec2f,
  time: f32,
  warp: f32,
  mouse: vec2f,
  waveTime: f32,
  waveHeight: f32,
  waveEnergy: f32,
  scroll: f32,
  camY: f32,
  camPitch: f32,
  camFov: f32,
  starDensity: f32,
  warmup: f32,
  detailFade: f32,
  sunAltitude: f32,
  grainStrength: f32,
}

@group(0) @binding(0) var<uniform> u: Uniforms;

// ────────────────────────────────────────────────────────────────────────
// Thrivaxis Acid mood — pre-tonemap linear values
// Deep slate ocean with bioluminescent acid-green caustics, cool slate
// sky for contrast, no orange anywhere — all "sunset" warmth shifts to
// brand acid green.
// ────────────────────────────────────────────────────────────────────────
const WATER_BASE       = vec3f(0.005, 0.008, 0.012);
const WATER_CREST      = vec3f(0.32, 0.62, 0.06);
const SUN_CORE         = vec3f(1.00, 0.99, 0.92);
const SUN_GLOW         = vec3f(0.78, 1.00, 0.30);
const SUNSET_HORIZON   = vec3f(0.55, 1.00, 0.18);
const MOON_DARK        = vec3f(0.08, 0.11, 0.09);
const MOON_LIGHT       = vec3f(0.74, 0.95, 0.70);
const MOON_GLOW        = vec3f(0.42, 0.95, 0.35);
const SKY_DAY_ZENITH   = vec3f(0.045, 0.060, 0.090);
const SKY_DAY_HORIZON  = vec3f(0.06,  0.10,  0.08);
const SKY_NIGHT_ZENITH = vec3f(0.0006, 0.0010, 0.0014);
const SKY_NIGHT_HORIZON= vec3f(0.003,  0.008,  0.005);
const STAR_TINT        = vec3f(0.92,  1.00,  0.95);
const NEBULA_TINT      = vec3f(0.04,  0.10,  0.05);
const CLOUD_DAY        = vec3f(0.50,  0.62,  0.50);
const CLOUD_NIGHT      = vec3f(0.008, 0.014, 0.010);

const ROT_MICRO = mat2x2f(0.8, -0.6, 0.6, 0.8);
const ROT_CLOUD = mat2x2f(1.6,  1.2, -1.2, 1.6);

// ────────────────────────────────────────────────────────────────────────
// Hash + value noise
// ────────────────────────────────────────────────────────────────────────
fn hash2(p_in: vec2f) -> f32 {
  let p = p_in - 289.0 * floor(p_in / 289.0);
  return fract(sin(dot(p, vec2f(12.9898, 78.233))) * 43758.5453);
}
fn hash3(p_in: vec3f) -> f32 {
  let p = p_in - 289.0 * floor(p_in / 289.0);
  return fract(sin(dot(p, vec3f(12.9898, 78.233, 45.164))) * 43758.5453);
}
fn noise2(p: vec2f) -> f32 {
  let i = floor(p);
  let f = fract(p);
  let uu = f * f * (3.0 - 2.0 * f);
  let a = hash2(i);
  let b = hash2(i + vec2f(1.0, 0.0));
  let c = hash2(i + vec2f(0.0, 1.0));
  let d = hash2(i + vec2f(1.0, 1.0));
  return mix(mix(a, b, uu.x), mix(c, d, uu.x), uu.y);
}

// ────────────────────────────────────────────────────────────────────────
// Water height field (multi-octave sines + value noise)
// ────────────────────────────────────────────────────────────────────────
fn getWaterHeight(p: vec3f, micro: bool, dist: f32) -> f32 {
  let t = u.waveTime;
  let uv = p.xz * 0.75;
  var nVal = 0.5;
  if (micro && u.detailFade > 0.01) {
    nVal = noise2(uv * 0.3 + t * 0.1) * (1.0 - u.warmup);
  }
  let dots = vec3f(
    dot(uv, vec2f( 0.64018,  0.76822)) * 1.5 + t * 0.8,
    dot(uv, vec2f(-0.78086,  0.62469)) * 2.8 - t * 1.2,
    dot(uv, vec2f( 0.19611, -0.98058)) * 5.0 + t * 1.5,
  );
  var sines = sin(dots) * 0.5 + 0.5;
  sines = sines * sines;
  let amps = vec3f(1.5 * (0.85 + 0.3 * nVal), 0.8, 0.4) * u.waveHeight;
  var h = dot(sines, amps);
  let dots2 = vec2f(
    dot(uv, vec2f(-0.8137, -0.5812)) * 3.5 + t * 0.6,
    dot(uv, vec2f( 0.9486, -0.3162)) * 8.0 - t * 2.0,
  );
  var sines2 = sin(dots2) * 0.5 + 0.5;
  sines2 = sines2 * sines2;
  let amps2 = vec2f(0.25 * (0.8 + 0.4 * nVal), 0.15) * u.waveHeight;
  h = h + dot(sines2, amps2);
  if (micro && u.detailFade > 0.01) {
    let uv1 = ROT_MICRO * uv * 8.0;
    h = h + noise2(uv1 + vec2f(t, t)) * 0.5 * u.waveHeight * 0.18 * u.detailFade * (1.0 - u.warmup);
  }
  return h - u.waveHeight * 0.5;
}

fn getNormal(p: vec3f, micro: bool, dist: f32) -> vec3f {
  let e = 0.012 + dist * 0.00045;
  let h = getWaterHeight(p, micro, dist);
  let naturalY = 0.05 + u.waveHeight * 0.4;
  return normalize(vec3f(
    h - getWaterHeight(p - vec3f(e, 0.0, 0.0), false, dist),
    naturalY,
    h - getWaterHeight(p - vec3f(0.0, 0.0, e), false, dist),
  ));
}

// ────────────────────────────────────────────────────────────────────────
// Stars (hash-grid, twinkle, warp fade)
// ────────────────────────────────────────────────────────────────────────
fn getStars(rd: vec3f, nightFactor: f32, isRef: bool) -> vec3f {
  if (nightFactor < 0.01) {
    return vec3f(0.0);
  }
  var starRd = rd;
  if (isRef) {
    starRd = normalize(vec3f(rd.x, abs(rd.y), rd.z));
  }
  let gridRes = 460.0;
  let p = starRd * gridRes;
  let gId = floor(p);
  let gUv = fract(p) - vec3f(0.5);
  let baseHash = hash3(gId);
  var densityFactor = u.starDensity;
  if (isRef) { densityFactor = densityFactor * 0.5; }
  let thresh = 1.0 - densityFactor / 280000.0;
  let starIntensity = smoothstep(thresh, 1.0, baseHash);
  if (starIntensity <= 0.0) {
    return vec3f(0.0);
  }
  let offset = vec3f(hash3(gId + 11.0), hash3(gId + 42.0), hash3(gId + 93.0)) * 0.9 - vec3f(0.45);
  let d = length(gUv - offset);
  let fw = 2.0 / max(u.res.y, 400.0) * gridRes;
  let physicalSize = 0.0009 + hash3(gId + 17.3) * 0.0028;
  let renderSize = max(physicalSize, fw);
  let starShape = exp(-pow(d / renderSize, 2.0) * 4.0);
  let starPhase = hash3(gId + 45.2) * 6.28318;
  let starFreq = 0.3 + hash3(gId + 9.3) * 0.8;
  let twinkle = 0.92 + 0.08 * sin(u.time * starFreq + starPhase);
  let warpFade = 1.0 - smoothstep(0.1, 0.7, u.warp);
  var refMult = 1.0;
  if (isRef) { refMult = 0.2; }
  return starIntensity * starShape * twinkle * nightFactor * refMult * warpFade * STAR_TINT * 60.0;
}

// ────────────────────────────────────────────────────────────────────────
// Clouds
// ────────────────────────────────────────────────────────────────────────
fn getClouds(rd: vec3f, t: f32, isRef: bool) -> f32 {
  var uv = rd.xz / (rd.y + 0.01) * 0.3;
  uv.x = uv.x - t * 0.03;
  var f = noise2(uv * 1.5);
  if (!isRef) {
    uv = ROT_CLOUD * uv;
    f = f + 0.5 * noise2(uv * 2.0 + vec2f(t * 0.02, 0.0));
    f = smoothstep(0.18, 0.70, f);
  } else {
    f = smoothstep(0.32, 0.92, f);
  }
  return f * smoothstep(-0.05, 0.20, rd.y);
}

fn getCloudColor(rd: vec3f, sunDir: vec3f) -> vec3f {
  let cloudDayFact = smoothstep(-0.10, 0.15, sunDir.y);
  var cColor = mix(CLOUD_NIGHT, mix(SUNSET_HORIZON * 0.85, CLOUD_DAY, smoothstep(-0.05, 0.25, sunDir.y)), cloudDayFact);
  let sDot = max(0.0, dot(rd, sunDir));
  cColor = cColor + SUN_GLOW * exp2(5.0 * log2(sDot + 0.0001)) * smoothstep(-0.10, 0.30, sunDir.y) * 0.4;
  return cColor;
}

// ────────────────────────────────────────────────────────────────────────
// Vertex — fullscreen triangle from vertex_index, no buffer needed
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
  let t = u.time * 0.3;

  let solarEase = u.warp * u.warp * (3.0 - 2.0 * u.warp);
  let shake = u.warp * u.warp * u.warp * u.warp * u.warp * 0.04;
  let cameraShake = vec2f(sin(u.time * 150.0), cos(u.time * 130.0)) * shake;
  let uvFov = (uv + cameraShake) * u.camFov;

  // Sun altitude: scroll-driven base + small cursor offset.
  // Cursor X still rotates azimuth so visitors can spin the sun.
  let cursorTilt = u.mouse.y * 0.18;
  let baseAlt = u.sunAltitude + cursorTilt;
  let currentSunY = mix(baseAlt, 0.6, solarEase);
  let sunDir  = normalize(vec3f( u.mouse.x,  currentSunY,        1.0));
  let moonDir = normalize(vec3f(-u.mouse.x, -currentSunY - 0.10, 1.0));

  let ro = vec3f(
    u.scroll * 4.0,
    1.5 + solarEase * 3.0 + u.camY,
    t * 2.0 + solarEase * 12.0 + u.scroll * 6.0,
  );
  let rd = normalize(vec3f(
    uvFov.x,
    uvFov.y - 0.10 + solarEase * 0.15 + u.camPitch,
    1.10 + solarEase * 0.20,
  ));

  let dayFactor = smoothstep(-0.02, 0.15, sunDir.y);
  let nightFactor = 1.0 - dayFactor;
  let trueNight = smoothstep(-0.02, -0.18, sunDir.y);

  let zenith = mix(SKY_NIGHT_ZENITH, SKY_DAY_ZENITH, dayFactor);
  let horizonDay = mix(SUNSET_HORIZON * 0.4, SKY_DAY_HORIZON, smoothstep(0.0, 0.4, sunDir.y));
  let horizon = mix(SKY_NIGHT_HORIZON, horizonDay, dayFactor);

  let sunMask  = smoothstep(-0.05, 0.02, sunDir.y);
  let moonMask = smoothstep(-0.05, 0.02, moonDir.y);
  let sunDot   = max(0.0, dot(rd, sunDir));
  let moonDot  = max(0.0, dot(rd, moonDir));

  // Sky base — bottom-up gradient with a sunset bloom near the horizon
  let sunsetGlow = smoothstep(-0.20, 0.10, sunDir.y) * smoothstep(0.40, -0.05, sunDir.y);
  var horizonGlow = horizon + SUNSET_HORIZON * sunsetGlow * pow(clamp(sunDot, 0.0, 1.0), 1.5) * 0.65;
  var col = mix(horizonGlow, zenith, smoothstep(-0.12, 0.55, rd.y));

  // Atmospheric horizon scatter — narrow band lit by sun azimuth
  let sunAz = normalize(vec3f(sunDir.x, 0.0, sunDir.z));
  let scatterBand = exp(-rd.y * rd.y * 220.0);
  let scatterAlong = pow(max(0.0, dot(normalize(vec3f(rd.x, 0.0, rd.z)), sunAz)), 6.0);
  col = col + SUNSET_HORIZON * scatterBand * scatterAlong * 0.55 * smoothstep(-0.20, 0.30, sunDir.y);

  // Stars + nebula (upper hemisphere only)
  if (rd.y >= 0.0) {
    if (trueNight > 0.05) {
      let nebUV = rd.xz / (abs(rd.y) + 0.001);
      let neb = noise2(nebUV * 2.0 + vec2f(u.time * 0.01, 0.0)) * noise2(nebUV * 4.0 - vec2f(u.time * 0.01, 0.0));
      col = col + NEBULA_TINT * neb * trueNight * smoothstep(0.0, 0.3, rd.y) * 0.7 * (1.0 - smoothstep(0.2, 0.8, u.warp));
      col = col + getStars(rd, trueNight, false) * smoothstep(-0.10, 0.20, rd.y);
    }
    let cloudAlpha = getClouds(rd, u.time, false);
    if (cloudAlpha > 0.0) {
      col = mix(col, getCloudColor(rd, sunDir), cloudAlpha * 0.95);
    }
  }

  // Sun disc + bloom — sharp pinhole core, controlled outer glow
  let sunAltD = max(0.0, sunDir.y);
  let coreColor = mix(SUN_GLOW, SUN_CORE, smoothstep(0.0, 0.30, sunAltD));
  let glowColor = mix(SUNSET_HORIZON, SUN_GLOW, smoothstep(0.0, 0.40, sunAltD));
  var cinSun = coreColor * smoothstep(0.99965, 0.99995, sunDot) * 3.0;
  cinSun = cinSun + coreColor * pow(clamp(sunDot, 0.0, 1.0), 4096.0) * 4.0;
  cinSun = cinSun + glowColor * pow(clamp(sunDot, 0.0, 1.0), 320.0) * 1.6;
  cinSun = cinSun + glowColor * pow(clamp(sunDot, 0.0, 1.0), 60.0) * 0.30;
  col = col + cinSun * sunMask;

  // Moon disc + craters + halo
  let moonRight = normalize(cross(vec3f(0.0, 1.0, 0.0), moonDir));
  let moonUp = cross(moonDir, moonRight);
  let moonUV = vec2f(dot(rd, moonRight), dot(rd, moonUp)) * 45.0;
  var craters = 0.5;
  if (moonDot > 0.998) {
    craters = noise2(moonUV * 8.0) * 0.6 + noise2(moonUV * 20.0) * 0.4;
  }
  let moonSurface = mix(MOON_DARK, MOON_LIGHT, craters);
  let moonDist = clamp((1.0 - moonDot) / (1.0 - 0.9993), 0.0, 1.0);
  var cinMoon = moonSurface * sqrt(max(0.0, 1.0 - moonDist * moonDist)) * smoothstep(0.9993, 0.99945, moonDot) * 2.4;
  cinMoon = cinMoon + MOON_GLOW * (pow(clamp(moonDot, 0.0, 1.0), 200.0) * 1.4 + pow(clamp(moonDot, 0.0, 1.0), 70.0) * 0.55);
  col = col + cinMoon * trueNight * moonMask;
  col = col + MOON_GLOW * 0.10 * (pow(clamp(moonDot, 0.0, 1.0), 8.0) * 0.15 + pow(clamp(moonDot, 0.0, 1.0), 25.0) * 0.08) * trueNight;

  // Ocean — ray vs y=0 plane
  if (rd.y < 0.0) {
    let d = -ro.y / min(rd.y, -0.0001);
    if (d < 460.0) {
      var p = ro + rd * d;
      let doMicro = (d < 50.0);
      let hOff = getWaterHeight(p, false, d);
      p = p + rd * (hOff / max(abs(rd.y), 0.05));
      var nSmooth = getNormal(p, false, d);
      let horizonFlatten = smoothstep(40.0, 130.0, d);
      nSmooth = normalize(mix(nSmooth, vec3f(0.0, 1.0, 0.0), horizonFlatten));
      var nSharp = nSmooth;
      var nSpec = nSmooth;
      if (d < 80.0) {
        nSharp = getNormal(p, true, d);
        let lodFade = smoothstep(80.0, 40.0, d);
        nSpec = normalize(mix(nSmooth, nSharp, 0.95 * lodFade));
      }
      let refRPlanar = reflect(rd, vec3f(0.0, 1.0, 0.0));
      var reflectedSky = mix(horizon, zenith, smoothstep(-0.20, 0.60, reflect(rd, nSmooth).y));
      if (trueNight > 0.05 && !doMicro) {
        reflectedSky = reflectedSky + NEBULA_TINT * 0.5 * noise2(refRPlanar.xz * 2.0) * trueNight * smoothstep(0.0, 0.30, refRPlanar.y);
        reflectedSky = reflectedSky + getStars(refRPlanar, trueNight, true);
      }
      let refCloudAlpha = getClouds(refRPlanar, u.time, true);
      if (refCloudAlpha > 0.0) {
        reflectedSky = mix(reflectedSky, getCloudColor(refRPlanar, sunDir), refCloudAlpha * 0.55);
      }

      // Fresnel — sharper drop-off so water reads dark from above
      let cosI = max(0.0, dot(-rd, nSharp));
      let fresnel = pow(clamp(1.0 - cosI, 0.0, 1.0), 5.0);

      // Crest tint is Fresnel-gated AND height-gated AND distance-faded —
      // green flashes only on actual reflective wave faces, not flat sea.
      let waveLocalH = getWaterHeight(p, false, d);
      let crestHeight = smoothstep(0.0, u.waveHeight * 1.2, waveLocalH);
      let crestFresnelGate = smoothstep(0.05, 0.55, fresnel);
      let crestNear = 1.0 - smoothstep(40.0, 220.0, d);
      let crestMix = crestHeight * crestFresnelGate * crestNear;
      let crestCol = mix(WATER_BASE, WATER_CREST, crestMix * 0.85);

      let nightWater = WATER_BASE * (0.25 + max(0.0, moonDir.y) * 0.6);
      var waterBase = mix(nightWater, crestCol, dayFactor);
      var waterCol = mix(waterBase * 0.85, reflectedSky, 0.08 + 0.92 * fresnel);

      let waterSunDir  = normalize(vec3f(sunDir.x,  max(sunDir.y,  0.001), sunDir.z));
      let waterMoonDir = normalize(vec3f(moonDir.x, max(moonDir.y, 0.001), moonDir.z));
      let specPower = 540.0;
      let smoothSpecDot = max(0.0, dot(nSmooth, normalize(-rd + waterSunDir)));
      let specDistFade = 1.0 - smoothstep(30.0, 120.0, d);

      let sunSpecHi = pow(clamp(dot(nSpec, normalize(-rd + waterSunDir)), 0.0, 1.0), specPower) * 5.0;
      let sunSpecLo = pow(clamp(smoothSpecDot, 0.0, 1.0), 90.0) * 0.85;
      let specTermSun = (sunSpecHi + sunSpecLo) * specDistFade;
      waterCol = waterCol + mix(SUNSET_HORIZON, SUN_GLOW, smoothstep(0.0, 0.30, waterSunDir.y)) * specTermSun * sunMask;

      // Acid micro-glints — Thrivaxis signature, sharper now
      let glints = pow(clamp(dot(nSharp, normalize(-rd + waterSunDir)), 0.0, 1.0), 1800.0) * 9.0 * specDistFade;
      waterCol = waterCol + WATER_CREST * 1.8 * glints * sunMask;

      let smoothMoonSpecDot = max(0.0, dot(nSmooth, normalize(-rd + waterMoonDir)));
      let moonSpecHi = pow(clamp(dot(nSpec, normalize(-rd + waterMoonDir)), 0.0, 1.0), specPower + 120.0) * 3.0;
      let moonSpecLo = pow(clamp(smoothMoonSpecDot, 0.0, 1.0), 90.0) * 0.85;
      let moonSpecIntensity = (moonSpecHi + moonSpecLo) * specDistFade;
      waterCol = waterCol + MOON_GLOW * moonSpecIntensity * trueNight * moonMask;

      let diffuseMoon = max(0.0, dot(nSmooth, waterMoonDir));
      waterCol = waterCol + (MOON_GLOW * 0.05 + crestCol * 0.10) * diffuseMoon * 0.4 * trueNight;

      let fogFactor = smoothstep(50.0, 420.0, d);
      waterCol = mix(waterCol, horizon, fogFactor * 0.30);
      col = mix(waterCol, col, smoothstep(120.0, 458.0, d));
    }
  }

  // ── Post: Thrivaxis Acid grade — mild green push, crush blacks
  var graded = pow(max(vec3f(0.0), col * vec3f(0.96, 1.02, 0.97)), vec3f(1.20)) * 0.94;

  // ACES filmic tonemap
  let aces = (graded * (2.51 * graded + vec3f(0.03))) / (graded * (2.43 * graded + vec3f(0.59)) + vec3f(0.14));
  var outCol = pow(max(vec3f(0.0), aces), vec3f(1.0 / 2.2));

  // Subtle film grain
  let grain = (hash2(coord.xy + vec2f(u.time * 0.7, u.time * 1.1)) - 0.5) * u.grainStrength;
  outCol = outCol + vec3f(grain);

  return vec4f(outCol, 1.0);
}
`;
