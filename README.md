# Thrivaxis

Marketing site for **Thrivaxis** — a USA-based agency offering AI-powered software
development and marketing.

## Visual direction

Generative AI-tech canon. Code-native only — no photographs, video, or stock imagery.
Dark surface with an acid-green accent. Geist (display + UI), Instrument Serif (editorial),
Geist Mono (code). Each visual is a shader, procedural 3D primitive, self-designed UI
mockup, animated SVG diagram, or variable-type display.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16.2 (App Router, Turbopack, `cacheComponents`) |
| Language | TypeScript 5 strict |
| Runtime | React 19.2 |
| Styling | Tailwind v4, CSS-first `@theme` |
| Component motion | Motion (Framer Motion v12) |
| Scroll choreography | GSAP + ScrollTrigger + SplitText + Flip |
| Smooth scroll | Lenis |
| 3D | React Three Fiber + Drei + post-processing (WebGPU progressive) |
| Icons | Iconoir + Hugeicons |
| Forms | react-hook-form + zod |
| Lint/format | Biome |
| Tests | Vitest + Playwright + axe-core |
| Hooks | Husky + lint-staged + commitlint |

## Develop

```bash
nvm use            # Node 22
pnpm install
pnpm dev           # http://localhost:3000
```

Routes worth checking now:
- `/` — temporary holding home
- `/playground` — every token + primitive in one place

## Project structure

```
src/
  app/               # Next.js App Router
    (legal)/         # Privacy, Terms, Cookies, Accessibility, Do Not Sell
    playground/      # Internal tokens + primitives showcase
    layout.tsx       # Root layout — fonts, Lenis, Cursor
    page.tsx         # Home (holding page until Phase 3)
    globals.css      # All design tokens via @theme
  components/
    primitives/      # Container, Section, Grid, Stack, DashedGrid,
                     # ScrollReveal, KineticHeading, MagneticButton,
                     # MarqueeRow, Cursor, Eyebrow
    providers/       # LenisProvider
  lib/
    cn.ts            # className merger (clsx + tailwind-merge)
    fonts.ts         # next/font wiring
    gsap.ts          # GSAP plugin registration
    motion.ts        # Motion presets (durations, easings, variants)
    site.ts          # Static site metadata
  hooks/
    use-reduced-motion.ts
```

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Turbopack dev server |
| `pnpm build` | Production build |
| `pnpm start` | Production server |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` / `pnpm lint:fix` | Biome |
| `pnpm format` | Biome format |
| `pnpm test` / `pnpm test:run` | Vitest |
| `pnpm e2e` | Playwright |

## Compliance scope

CCPA/CPRA + 19 state privacy laws, WCAG 2.2 AA, CAN-SPAM, TCPA, FTC AI Comply,
GPC honoring, IAB GPP signal. All in `src/app/(legal)/` — currently stubbed,
finalized in Phase 7.

## Phases

- **Phase 1** ✓ Foundation — tokens, primitives, motion runtime, playground
- **Phase 2** Design system + motion language hardening
- **Phase 3** Home + WebGPU shader hero
- **Phase 4** CMS + Work / Case Studies
- **Phase 5** Services pages
- **Phase 6** About, Insights, Contact + Gemini chatbot widget
- **Phase 7** Compliance + accessibility hardening
- **Phase 8** Performance, SEO, launch
