# Thrivaxis — agent operating notes

> Brand is **Thrivaxis** (no `e` in the middle). Working directory is `thriveaxis`.

## Stack
- Next.js **16.2** with App Router, Turbopack default, `cacheComponents: true`.
- React 19.2, TypeScript 5 strict + `noUncheckedIndexedAccess`.
- Tailwind v4 — CSS-first via `@theme` in `src/app/globals.css`. **Do not** create a `tailwind.config.js`.
- Motion (Framer Motion v12) for component-level animation.
- GSAP + ScrollTrigger + SplitText + Flip for scroll choreography. Register plugins via `src/lib/gsap.ts`.
- Lenis for smooth scroll, mounted globally via `src/components/providers/lenis-provider.tsx`.
- React Three Fiber for 3D primitives. WebGPU progressive, WebGL2 fallback.
- Iconoir + Hugeicons for icons. **Never** hand-roll generic icons.
- Geist + Instrument Serif + Geist Mono via `next/font`. Trial fonts; swap to PP Neue Montreal + Migra later.

## Hard rules
- **Code-native only.** No photographs, no video B-roll, no stock imagery, no AI-generated photoreal imagery. Every visual ships as code: shaders, procedural 3D, self-designed UI mockups, animated SVG diagrams, variable type.
- Dark surface, acid-green accent. Use accent for highlights only — never body text.
- Each page must be **distinctive**. No template-y reuse beyond the shared primitive kit.
- All animation must respect `prefers-reduced-motion` — `useReducedMotion` hook + global CSS guard already in place.
- USA compliance is in scope. Stub routes live under `src/app/(legal)/`.

## Conventions
- Files: kebab-case (`magnetic-button.tsx`).
- Components: PascalCase exports.
- Imports: use `@/` alias for `src/`.
- Class merging: `cn()` from `src/lib/cn.ts`.
- Motion presets: pull from `src/lib/motion.ts` — never hard-code durations/easings.
- Server Components by default; add `'use client'` only when needed (hooks, GSAP, Motion).
- All `params`/`searchParams`/`cookies()`/`headers()` are **async** in Next.js 16. Always `await`.

## Scripts
- `pnpm dev` — Turbopack dev server.
- `pnpm build` — production build (Turbopack default; pass `--webpack` to opt out).
- `pnpm typecheck` — `tsc --noEmit`.
- `pnpm lint` / `pnpm lint:fix` — Biome.
- `pnpm test` / `pnpm test:run` — Vitest.
- `pnpm e2e` — Playwright.

## Commits
Conventional Commits enforced via commitlint + Husky `commit-msg` hook. Pre-commit runs Biome on staged files via lint-staged.
