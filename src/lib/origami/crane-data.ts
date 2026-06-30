/**
 * Crane geometry — paper panel definitions for the premium R3F scene.
 *
 * Each panel is a flat triangulated polygon in its own 2D local space (Z=0).
 * Local origin sits on the hinge edge, so applying a hinge rotation around
 * the appropriate axis pivots the panel cleanly without translation.
 *
 * Hierarchy:
 *   body (root)
 *   ├── leftWing       (rotZ — wings hinge along the body's longitudinal axis)
 *   ├── rightWing      (rotZ)
 *   ├── tailRoot       (rotX)
 *   │   └── tailTip    (rotX, in tailRoot local)
 *   └── neckRoot       (rotX)
 *       └── head       (rotX, in neckRoot local)
 */

export type Vec2 = readonly [number, number];
export type Vec3 = readonly [number, number, number];
export type Tri = readonly [number, number, number];

export interface PanelGeometry {
  vertices: ReadonlyArray<Vec2>;
  triangles: ReadonlyArray<Tri>;
}

export interface ChildPanel extends PanelGeometry {
  /** Hinge position in parent local space. */
  hinge: Vec3;
  /** Final fold rotation (radians) at end of intro timeline. */
  finalRotation: Vec3;
}

// ────────────────────────────────────────────────────────────────────────────
// Body — kite/diamond on the xz plane (front=+z, right=+x).
// ────────────────────────────────────────────────────────────────────────────

export const body: PanelGeometry = {
  vertices: [
    [0, -0.6], //  0  back
    [0.55, 0], //  1  right
    [0, 0.55], //  2  front
    [-0.55, 0], // 3  left
    [0, 0], //     4  center
  ],
  triangles: [
    [0, 1, 4],
    [1, 2, 4],
    [2, 3, 4],
    [3, 0, 4],
  ],
};

// ────────────────────────────────────────────────────────────────────────────
// Wings — hinge along body's longitudinal axis at x=±0.4.
// Wing extends in -X (left) / +X (right). Rotates around Z (longitudinal).
// ────────────────────────────────────────────────────────────────────────────

export const leftWing: ChildPanel = {
  hinge: [-0.4, 0, 0],
  finalRotation: [0, 0, -1.3], // wings rotate around Z to fold up
  vertices: [
    [0, -0.5], //  0  hinge back
    [0, 0.5], //   1  hinge front
    [-0.85, 0.05], // 2  tip
    [-0.45, -0.25], // 3  mid back
    [-0.45, 0.3], //  4  mid front
  ],
  triangles: [
    [0, 3, 4],
    [0, 4, 1],
    [3, 2, 4],
  ],
};

export const rightWing: ChildPanel = {
  hinge: [0.4, 0, 0],
  finalRotation: [0, 0, 1.3],
  vertices: [
    [0, -0.5],
    [0, 0.5],
    [0.85, 0.05],
    [0.45, -0.25],
    [0.45, 0.3],
  ],
  triangles: [
    [0, 4, 3],
    [0, 1, 4],
    [3, 4, 2],
  ],
};

// ────────────────────────────────────────────────────────────────────────────
// Tail — hinge at body's back vertex.
// ────────────────────────────────────────────────────────────────────────────

export const tailRoot: ChildPanel = {
  hinge: [0, -0.6, 0],
  finalRotation: [0.85, 0, 0], // tail tilts up — rotates around X
  vertices: [
    [-0.18, 0],
    [0.18, 0],
    [0.1, -0.4],
    [-0.1, -0.4],
  ],
  triangles: [
    [0, 1, 2],
    [0, 2, 3],
  ],
};

export const tailTip: ChildPanel = {
  hinge: [0, -0.4, 0],
  finalRotation: [-0.55, 0, 0], // tip droops back down
  vertices: [
    [-0.1, 0],
    [0.1, 0],
    [0, -0.28],
  ],
  triangles: [[0, 1, 2]],
};

// ────────────────────────────────────────────────────────────────────────────
// Neck — long thin panel at body's front vertex.
// ────────────────────────────────────────────────────────────────────────────

export const neckRoot: ChildPanel = {
  hinge: [0, 0.55, 0],
  finalRotation: [-1.05, 0, 0], // neck rises forward and up
  vertices: [
    [-0.1, 0],
    [0.1, 0],
    [0.07, 0.7],
    [-0.07, 0.7],
  ],
  triangles: [
    [0, 1, 2],
    [0, 2, 3],
  ],
};

export const head: ChildPanel = {
  hinge: [0, 0.7, 0],
  finalRotation: [1.55, 0, 0], // head bends down at end of neck
  vertices: [
    [-0.08, 0],
    [0.08, 0],
    [0, 0.32],
  ],
  triangles: [[0, 1, 2]],
};

// ────────────────────────────────────────────────────────────────────────────
// Fold-in timeline — each entry: [start, duration] in seconds.
// ────────────────────────────────────────────────────────────────────────────

export const foldTiming = {
  introDelay: 0.3,
  leftWing: { start: 0.0, duration: 0.85 },
  rightWing: { start: 0.0, duration: 0.85 },
  tailRoot: { start: 0.55, duration: 0.7 },
  tailTip: { start: 0.95, duration: 0.5 },
  neckRoot: { start: 0.65, duration: 0.85 },
  head: { start: 1.25, duration: 0.55 },
} as const;
