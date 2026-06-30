/**
 * Static CSS gradient that mirrors the shader's resting palette. Renders
 * server-side as the hero backdrop while the WebGL canvas hydrates on top.
 */
export function HeroShaderFallback() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 -z-10"
      style={{
        background: `
          radial-gradient(60% 50% at 30% 40%, oklch(45% 0.18 130 / 35%) 0%, transparent 70%),
          radial-gradient(50% 50% at 75% 60%, oklch(38% 0.16 145 / 28%) 0%, transparent 70%),
          radial-gradient(40% 40% at 50% 90%, oklch(50% 0.20 130 / 22%) 0%, transparent 60%),
          oklch(8% 0.012 270)
        `,
      }}
    />
  );
}
