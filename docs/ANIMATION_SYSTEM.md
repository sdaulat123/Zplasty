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

An application-level animation clock advances normalized progress, so playback continues whether or not the optional 3D view is open. Viewer components do not run independent timers. This allows scrubbing, pause, replay, reduced-motion handling, and reversible phase changes.

Transposition is a schematic crossfade between the entered triangles and the final reciprocal-tip topology (A→C and B→D). Correspondence arrows teach which tips meet; no rigid-body path or tissue deformation is calculated. The optional 3D view uses a simple vertical offset for the elevation phase and a stylized display surface. Neither represents undermining, tension, perfusion, viability, or closure mechanics.
