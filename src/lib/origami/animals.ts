/**
 * Origami animal data — crease patterns + faceted silhouettes for each capability.
 *
 * Crease patterns are stylized (not physically flat-foldable). They read as
 * origami crease diagrams: mountain folds = solid lines, valley folds = dashed.
 * Silhouettes are faceted polygons that suggest the folded animal.
 *
 * All paths use a 0–100 viewBox.
 */

export type AnimalId = 'crane' | 'fox' | 'koi' | 'crow';

export interface AnimalCapability {
  id: AnimalId;
  service: string;
  tagline: string;
  body: string;
  bullets: readonly string[];
}

export interface CreasePattern {
  /** Solid fold lines (mountain folds in conventional notation). */
  mountain: string;
  /** Dashed fold lines (valley folds). */
  valley: string;
  /** Faceted silhouette path — the result of the fold. */
  silhouette: string;
  /** Sub-strokes inside the silhouette for facet definition. */
  facets: string;
}

// ────────────────────────────────────────────────────────────────────────────
// Capability copy (customer-grade plain English)
// ────────────────────────────────────────────────────────────────────────────

export const capabilities: readonly AnimalCapability[] = [
  {
    id: 'crane',
    service: 'Discover',
    tagline: 'Find the AI worth building.',
    body: 'A two-week sprint where senior engineers and a strategist sit with your team, find the part of the business AI can actually move, and write the brief for the build.',
    bullets: [
      'Stakeholder interviews',
      'Workflow + data audit',
      'AI opportunity map',
      'Build brief & estimate',
    ],
  },
  {
    id: 'fox',
    service: 'Design',
    tagline: 'Shape it before you build.',
    body: 'Architecture, model selection, evaluation strategy, and a working prototype your stakeholders can touch — before a line of production code is written.',
    bullets: [
      'System architecture',
      'Model selection & guardrails',
      'Eval harness design',
      'Clickable prototype',
    ],
  },
  {
    id: 'koi',
    service: 'Build',
    tagline: 'Engineer the product end to end.',
    body: 'Senior engineers ship the product — frontend, backend, infra, observability — with the same care a top product team would. No interns learning on your dollar.',
    bullets: [
      'Full-stack engineering',
      'RAG + agent infrastructure',
      'Observability & evals in CI',
      'Prod deploy & handover',
    ],
  },
  {
    id: 'crow',
    service: 'Operate',
    tagline: 'Keep it sharp in production.',
    body: 'Monthly drift checks, eval regressions caught early, model upgrades managed without breakage. Your AI stays as sharp the day after launch as the day of.',
    bullets: [
      'Drift & eval monitoring',
      'Model upgrade pipeline',
      'Incident response',
      'Quarterly review & roadmap',
    ],
  },
] as const;

// ────────────────────────────────────────────────────────────────────────────
// Crease patterns (stylized — not physically foldable)
// ────────────────────────────────────────────────────────────────────────────

export const creasePatterns: Record<AnimalId, CreasePattern> = {
  // Bird base — the foundation of a real crane fold. Square + diagonals + petal folds.
  crane: {
    mountain: 'M 8 8 L 92 8 L 92 92 L 8 92 Z M 8 8 L 92 92 M 92 8 L 8 92',
    valley:
      'M 8 50 L 92 50 M 50 8 L 50 92 M 50 8 L 8 50 M 50 8 L 92 50 M 50 92 L 8 50 M 50 92 L 92 50',
    silhouette:
      'M 50 14 L 60 28 L 84 22 L 80 38 L 92 50 L 74 56 L 68 84 L 56 70 L 50 86 L 44 70 L 32 84 L 26 56 L 8 50 L 20 38 L 16 22 L 40 28 Z',
    facets:
      'M 50 14 L 50 86 M 50 50 L 8 50 M 50 50 L 92 50 M 50 50 L 26 56 M 50 50 L 74 56 M 60 28 L 50 50 M 40 28 L 50 50',
  },
  // Fox — triangular ears + diamond face + snout.
  fox: {
    mountain:
      'M 8 12 L 92 12 L 92 92 L 8 92 Z M 8 12 L 50 50 L 92 12 M 50 50 L 8 92 M 50 50 L 92 92',
    valley: 'M 50 12 L 50 92 M 8 12 L 50 30 L 92 12 M 30 36 L 50 30 L 70 36 M 50 50 L 50 88',
    silhouette:
      'M 50 14 L 30 28 L 16 18 L 22 42 L 12 56 L 26 60 L 32 76 L 50 84 L 68 76 L 74 60 L 88 56 L 78 42 L 84 18 L 70 28 Z',
    facets:
      'M 50 14 L 50 84 M 26 60 L 50 60 M 74 60 L 50 60 M 22 42 L 50 50 M 78 42 L 50 50 M 32 76 L 50 60 M 68 76 L 50 60',
  },
  // Koi — diamond + fan tail + head.
  koi: {
    mountain: 'M 8 50 L 50 14 L 92 50 L 50 86 Z M 8 50 L 92 50 M 50 14 L 50 86',
    valley: 'M 28 32 L 72 68 M 72 32 L 28 68 M 38 50 L 62 50 M 50 32 L 50 68',
    silhouette:
      'M 14 50 L 28 30 L 50 22 L 70 32 L 78 50 L 70 68 L 50 78 L 28 70 Z M 78 50 L 92 36 L 88 50 L 92 64 Z M 18 46 L 22 50 L 18 54',
    facets:
      'M 14 50 L 78 50 M 50 22 L 50 78 M 28 30 L 70 68 M 28 70 L 70 32 M 70 32 L 78 50 M 70 68 L 78 50',
  },
  // Crow — bird base, sharper proportions, sharper beak.
  crow: {
    mountain: 'M 8 14 L 92 14 L 92 86 L 8 86 Z M 8 14 L 92 86 M 92 14 L 8 86 M 50 14 L 50 86',
    valley:
      'M 8 50 L 92 50 M 50 14 L 8 50 M 50 14 L 92 50 M 50 86 L 8 50 M 50 86 L 92 50 M 32 50 L 50 32 L 68 50',
    silhouette:
      'M 50 18 L 58 30 L 88 22 L 78 44 L 92 50 L 76 54 L 70 78 L 56 66 L 54 86 L 64 90 L 36 90 L 46 86 L 44 66 L 30 78 L 24 54 L 8 50 L 22 44 L 12 22 L 42 30 Z',
    facets:
      'M 50 18 L 50 86 M 50 50 L 8 50 M 50 50 L 92 50 M 50 50 L 30 78 M 50 50 L 70 78 M 58 30 L 50 50 M 42 30 L 50 50',
  },
};
