# Geometry and Literature Audit

## Scope

The application calculates Euclidean measurements for a straight-line Z construction on a two-dimensional plane. It does not calculate tissue deformation, stress, strain, closure force, perfusion, viability, healing, or a patient-specific result.

All internal lengths are millimeters. Centimeters are converted only at the input and display boundary. Plan coordinates use `+x` to the right and `+y` downward; angles increase clockwise from `+x`.

## Points and topology

- `A = centralStart`
- `B = centralEnd`
- `C = upperEndpoint`
- `D = lowerEndpoint`
- `AB = c`, `BC = u`, and `AD = l`
- the two entered lateral angles are `α` and `β`

The entered triangular regions are `ABC` and `BAD`. The ideal reciprocal point correspondence is:

- tip `A → C`, giving schematic final triangle `BCD`;
- tip `B → D`, giving schematic final triangle `ADC`.

The two entered triangles share `AB`; the two schematic final triangles share `CD`. The final line drawing is `B–C–D–A`. The UI cross-fades between these two topologies. It deliberately does not interpolate a rigid flap or claim to simulate tissue motion.

## General outer-endpoint identity

For arbitrary positive limb lengths and lateral angles:

`CD² = c² + u² + l² - 2c(u cos α + l cos β) + 2ul cos(α - β)`

The implementation constructs C and D from their hinges and reports their direct Euclidean distance. Tests compare that coordinate result with the independent identity over multiple asymmetric cases.

When all three limbs equal `L` but the angles differ:

`CD = L * sqrt(3 - 2(cos α + cos β) + 2 cos(α - β))`

When all three limbs equal `L` and both angles equal `θ`:

`CD = L * sqrt(5 - 4 cos θ)`

The displayed theoretical length change is:

`change percent = ((CD - AB) / AB) * 100`

Exact classical values are:

| Lateral angle | Exact theoretical change | Common rounded teaching value |
| ---: | ---: | ---: |
| 30° | 23.931% | about 25% |
| 45° | 47.363% | about 50% |
| 60° | 73.205% | about 75% |
| 75° | 99.116% | about 100% |
| 90° | 123.607% | about 125% |

For 60°, `CD = √3 L`; it is not exactly `1.75 L`.

## Axis-angle convention

The UI reports the smaller angle between the undirected A–B and C–D lines. Exact values at 30°, 45°, 60°, 75°, and 90° are approximately 53.794°, 73.675°, 90°, 75.981°, and 63.435°.

This is not Ellur and Guido’s directed common-limb rotation convention. Their symmetric formula is:

`R = acos((1 - 2 cos θ) / sqrt(5 - 4 cos θ))`

Their directed values are 126.2°, 106.3°, 90°, 76.0°, and 63.5°. Below 60°, the app’s undirected line angle is `180° - R`. The UI uses no arrowhead on the final common limb so it does not imply a direction that the reported value does not have.

## Calculation labels

`classical-symmetric` requires three equal limbs and two equal angles. Every other valid input is `entered-planar` and is labeled as a coordinate measurement of the entered drawing—not a postoperative prediction.

- **Outer-endpoint span:** direct C–D distance.
- **Theoretical length change:** C–D minus A–B, with a percentage relative to A–B.
- **Undirected axis-line angle:** smaller angle between A–B and C–D.
- **Construction footprint:** greatest pairwise distance among A, B, C, and D.
- **Perpendicular C–D component:** magnitude of the C–D vector projected perpendicular to A–B. It is not tissue movement or shortening.
- **Reference-axis offset:** smaller angle between A–B and the optional entered scar/contracture reference.

No symmetry score, flap displacement, closure-force estimate, stress, strain, or tension result is calculated.

## Validation

Validation rejects:

- non-finite numeric fields;
- limb lengths outside the interface-supported 1–120 mm range;
- lateral-limb angles outside the interface-supported 1°–179° range;
- construction or reference-axis rotations outside 0°–360°;
- angles within 0.01° of collinearity;
- degenerate entered triangles;
- conceptual display values outside their defined visual ranges.

Invalid input still receives finite fallback coordinates so the editor can recover, but every calculated output is withheld and print/export actions are disabled. Imported JSON uses a versioned, exhaustive runtime schema. Imported measurement snapshots are ignored and recalculated from validated parameters.

## Literature boundary

The formulas describe ideal planar geometry. Furnas and Fischer’s biomechanical work, Roggendorf’s planimetric study, and later simulation studies show that living-tissue behavior can differ materially from a diagonal construction. Wider angles increase theoretical span but can require more demanding transposition and closure; this app does not calculate that demand.

Primary and peer-reviewed references:

- [Furnas & Fischer, “The Z-plasty: biomechanics and mathematics” (1971)](https://doi.org/10.1016/S0007-1226(71)80034-6)
- [Roggendorf, “Planimetric elongation of skin by Z-plasty” (1982)](https://pubmed.ncbi.nlm.nih.gov/7054800/)
- [Chu, “Mathematical principle of planar Z-plasty” (2000)](https://pubmed.ncbi.nlm.nih.gov/10626978/)
- [Ellur & Guido, “A mathematical model to predict the change in direction…” (2009)](https://pmc.ncbi.nlm.nih.gov/articles/PMC2772284/)
- [Matsumoto, Liang & Mahadevan, “Topology, Geometry, and Mechanics of Z-Plasty” (2018)](https://doi.org/10.1103/PhysRevLett.120.068101)
- [JPOSNA two-part Z-plasty geometric review (2023)](https://www.jposna.org/~jposna/index.php/jposna/article/view/700/856)

The implementation and wording still require reconstructive-surgery, clinical human-factors, and regulatory review before any study of patient-care use.
