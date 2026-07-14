# Project Context

## Purpose and boundary

Z-Plasty Atlas is a browser-local education and two-dimensional geometry reference. It lets users explore a schematic Z construction and inspect exact Euclidean measurements. It is not validated for patient-specific or intraoperative decision-making and must not recommend whether, where, or how to operate.

The UI has no patient-identifying fields. JSON and print exports contain geometry only. Entered values are not sent to an application service. Optional literature links open external pages without including entered values.

## Architecture

- React 19, TypeScript, Vite, Zustand, Vitest, Three.js, React Three Fiber, and Drei.
- `src/geometry/` owns construction, measurement, validation, vectors, and units.
- `src/store/` owns deterministic state and versioned local-file import/export.
- `src/components/viewer/SimulationOverlay.tsx` is the primary accessible SVG editor.
- `src/animation/useAnimationClock.ts` drives playback independently of WebGL.
- the conceptual 3D bundle mounts only after its disclosure is opened and makes no remote asset request.

## Model conventions

- Internal lengths are millimeters; centimeters are an input/display conversion.
- `+x` is right, `+y` is down, and angles increase clockwise.
- A classical case has three equal limbs and two equal angles.
- The classical endpoint span is `L * sqrt(5 - 4*cos(angle))`.
- A 60° case is exactly `√3 L`, or 73.205% theoretical change.
- Every nonclassical input is labeled `entered-planar` and receives coordinate measurements only.
- The reported axis angle is the smaller angle between undirected A–B and C–D lines.
- The schematic final topology follows `A→C` and `B→D`; no rigid-body or tissue deformation is claimed.
- No stress, strain, tension, displacement, perfusion, viability, or outcome estimate is calculated.

## Product structure

- **Learn:** keeps the two lateral limbs and their angles symmetric while allowing an independent central limb; exposes exact literature-reference angle cards.
- **Exact inputs:** independent lengths/angles, units, rotation, reference axis, mirror direction, and point dragging.
- Invalid values retain finite editor fallback geometry but withhold all results and disable print/export.
- Import requires schema version 1 and validates every finite number, boolean, enum, and range before state replacement. Imported measurement snapshots are ignored.

## Verification expectations

Before handoff, run:

```bash
npm test
npm run lint
npx tsc -b --pretty false
npm run build
```

Then verify desktop, tablet, and mobile in a browser: pointer and keyboard editing, phase playback without 3D, invalid-output suppression, import/export, reset, responsive overflow, print, lazy 3D loading, and console/network cleanliness.

## Remaining governance work

Independent reconstructive-surgery, mathematical, clinical human-factors, accessibility, privacy, cybersecurity, and regulatory review remain prerequisites for any patient-care study. The present test suite verifies software behavior and mathematical identities; it is not clinical validation.
