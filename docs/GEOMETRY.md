# Geometry Notes

The simulator represents a Z-plasty as a planar geometric construction:

- `centralStart` and `centralEnd` define the original scar or contracture axis.
- `upperEndpoint` and `lowerEndpoint` define the lateral limbs.
- `upperFlap` and `lowerFlap` are triangular teaching polygons.
- `upperDestination` and `lowerDestination` define idealized reciprocal transposition targets.

Core code:

- `src/geometry/zPlastyGeometry.ts`
- `src/geometry/vectorMath.ts`
- `src/geometry/polygonUtils.ts`
- `src/geometry/measurements.ts`
- `src/geometry/validation.ts`

For symmetric standard presets, the display uses a simplified length-gain estimate related to limb angle. For arbitrary or asymmetric designs, measurements are derived from the generated points and polygons.

Warnings are geometric teaching notices only. They describe issues such as acute angles, unequal limbs, overlap, or degenerate triangles.
