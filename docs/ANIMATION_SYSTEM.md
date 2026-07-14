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

All viewer components read normalized progress rather than running their own uncontrolled timers. This allows scrubbing, pause, replay, and reversible phase changes.

Flap motion is currently an idealized interpolation between original and destination polygons. Elevation is represented by a clean vertical offset and a schematic cross-section mode.
