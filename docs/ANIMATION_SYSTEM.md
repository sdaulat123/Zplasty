# Animation System

Animation is driven by:

- `phase`
- `phaseProgress`
- `isPlaying`
- `playbackSpeed`
- `loopMode`

The current phase is one of:

- `native`
- `marking`
- `incision`
- `elevation`
- `transposition`
- `approximation`
- `closure`
- `comparison`

An application-level animation clock advances normalized progress using a phase-specific duration, so playback continues whether or not the optional 3D view is open. Viewer components do not run independent timers. A shared `getPhaseVisualState` timeline drives both the primary SVG and the optional 3D view, which prevents the two representations from disagreeing. This allows scrubbing, pause, replay, reduced-motion handling, and reversible phase changes.

Each phase owns one transition:

- `native`: holds the original scar/contracture reference without design handles.
- `marking`: stages the three dashed design limbs, flap regions, handles, and measurements.
- `incision`: replaces the marking with a solid staged line drawing. The order is visual organization, not operative instruction.
- `elevation`: emphasizes the two flap regions with a 2D separation shadow and a matching schematic vertical offset in 3D.
- `transposition`: lowers the elevated display while cross-fading between the entered and reciprocal final flap topology. Labels state `A meets C` and `B meets D`.
- `approximation`: draws the new theoretical `C–D` common limb.
- `closure`: emphasizes the final `B–C–D–A` line topology while flap fills recede. It does not depict sutures or closure force.
- `comparison`: overlays the entered `A–B` limb and theoretical `C–D` diagonal for direct comparison.

Transposition is deliberately a schematic crossfade rather than vertex interpolation. Interpolating the triangles would invent a rigid-body or deformable-tissue path that the planar input cannot determine. Correspondence arrows teach which tips meet; they are not motion trajectories. The optional 3D view uses a simple vertical offset for the elevation phase and a stylized display surface. Neither representation models undermining, tension, perfusion, viability, or closure mechanics.
