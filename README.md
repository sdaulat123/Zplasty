# Z-Plasty Surgical Simulation Studio

Interactive reconstructive geometry lab for teaching idealized Z-plasty design, flap transposition, scar-axis reorientation, and simplified tissue-deformation concepts.

This is an educational visualization only. It is not intended for patient-specific planning, clinical decision-making, operative instruction, or outcome prediction.

## Stack

- Vite
- React
- TypeScript
- Three.js
- React Three Fiber
- Drei
- Zustand
- Tailwind CSS
- Vitest

## Run

```bash
npm install
npm run dev
npm run build
npm run test
```

## Architecture

- `src/geometry/` contains deterministic Z-plasty math, vector helpers, measurements, validation, and simplified deformation utilities.
- `src/animation/` defines phase order and progress-driven animation helpers.
- `src/store/` contains Zustand state for geometry, animation, scene, selection, overlays, comparison, and accessibility.
- `src/components/viewer/` contains the React Three Fiber simulation.
- `src/components/layout/` contains the atlas-style panels.
- `src/data/` contains presets, variants, and educational content.

## Geometry System

The standard model is represented by a central limb, two lateral limbs, two triangular flaps, hinge points, original and final axes, and derived measurements. Symmetric presets use idealized planar formulas. Asymmetric and arbitrary configurations are calculated from the generated geometry and clearly labeled as simplified estimates.

## Animation Phases

The simulator uses normalized phase progress so playback, pause, replay, and scrubbing all operate on the same state:

1. Native tissue
2. Design marking
3. Incision
4. Flap elevation
5. Transposition
6. Approximation
7. Closure
8. Outcome comparison

## Add Presets

Add a preset to `src/data/presets.ts` with a unique `id`, `name`, `variant`, `description`, and `params`.

## Add Variants

Add explanatory metadata in `src/data/variants.ts`, then map any special rendering or comparison behavior in the relevant components.

## Edit Educational Content

Concise interface content lives in `src/data/educationalContent.ts`. Longer scope language lives in `docs/EDUCATIONAL_SCOPE.md`.

## Skin Model

The skin model is generated procedurally in `src/components/viewer/SkinSurface.tsx`. Adjust subdivisions, curvature, material color, or heatmap behavior there.

## Known Limitations

- Relative tension and strain values are educational proxies, not validated stress values.
- Flap elevation and transposition are deterministic geometry animations, not biomechanical simulation.
- Drawing and dragging are intentionally constrained to preserve stability and readability.
- Screenshot export captures the central canvas only.

## Performance Notes

The viewer memoizes geometry where practical and uses moderate mesh subdivisions. Keep future labels and overlays bounded to avoid excessive DOM work over the canvas.
