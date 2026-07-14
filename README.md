# Z-Plasty Atlas

Local-first interactive atlas for learning and measuring idealized two-dimensional Z-plasty geometry.

Outputs are theoretical Euclidean measurements. The application is not clinically validated, does not model living tissue, and does not replace surgeon judgment, patient assessment, or institutional protocols. Do not enter patient identifiers.

## Run locally

```bash
npm install
npm run dev
npm test
npm run lint
npx tsc -b --pretty false
npm run build
```

The Vite development server prints the local URL. No remote service is required by the application at runtime; the optional 3D module is bundled and loaded only when its disclosure is opened.

## What is implemented

- **Learn:** keeps the two lateral limbs and angles symmetric, allows an independent central limb, and compares exact 30°/45°/60°/75°/90° planar references.
- **Exact inputs:** accepts independent central/lateral lengths and angles, millimeters or centimeters, construction rotation, a reference axis, mirrored direction, and direct point manipulation.
- **Calculated outputs:** outer-endpoint span, theoretical planar length change, undirected axis-line angle, drawing footprint, perpendicular endpoint component, and reference-axis offset.
- **Schematic sequence:** shows the entered Z and the ideal reciprocal `A→C`, `B→D` topology without claiming rigid or biomechanical motion.
- **Local files:** versioned JSON import/export with exhaustive runtime validation and a geometry-only print summary.
- **Accessibility:** keyboard point movement, visible focus, reduced automatic motion, high contrast, color-safe conceptual display, responsive layouts, and touch-sized handles.

## Architecture

- `src/geometry/`: deterministic construction, measurement, validation, vectors, and unit conversion.
- `src/animation/`: phase definitions and the application-level playback clock.
- `src/store/`: Zustand state and versioned import/export.
- `src/components/viewer/SimulationOverlay.tsx`: primary SVG editor and phase display.
- `src/components/viewer/`: lazily loaded conceptual Three.js surface.
- `src/components/controls/` and `src/components/layout/`: inputs, results, education, and safety boundary.
- `docs/GEOMETRY.md`: formulas, conventions, validation behavior, and literature references.
- `docs/EDUCATIONAL_SCOPE.md`: product and clinical-use boundary.

## Mathematical model

The classical equal-limb, equal-angle endpoint span is:

`CD = L * sqrt(5 - 4 cos θ)`

At 60°, `CD = √3 L`, an exact 73.205% theoretical change conventionally rounded to about 75%. Arbitrary valid inputs are labeled `entered-planar` and report coordinate measurements of the drawing only. See [docs/GEOMETRY.md](docs/GEOMETRY.md) for the general identity and rotation convention.

## Known limitations

- No stress, strain, tension, perfusion, viability, closure-feasibility, or clinical-outcome calculation exists.
- The schematic transposition cross-fades between topology states; it is not tissue or rigid-body simulation.
- Three-dimensional curvature and colors are illustrative visual controls only.
- Clinical terminology and workflow need specialist review before any patient-care study.
