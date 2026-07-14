import { Pause, Play, Rewind, SkipBack, SkipForward, RotateCcw } from 'lucide-react'
import { phases } from '../../animation/phaseDefinitions'
import { useSimulationStore } from '../../store/simulationStore'
import type { LoopMode } from '../../types/simulation'

export function AnimationControls() {
  const animation = useSimulationStore((state) => state.animation)
  const setPlaying = useSimulationStore((state) => state.setPlaying)
  const setPhaseProgress = useSimulationStore((state) => state.setPhaseProgress)
  const setPlaybackSpeed = useSimulationStore((state) => state.setPlaybackSpeed)
  const setLoopMode = useSimulationStore((state) => state.setLoopMode)
  const setPhase = useSimulationStore((state) => state.setPhase)
  const nextPhase = useSimulationStore((state) => state.nextPhase)
  const previousPhase = useSimulationStore((state) => state.previousPhase)
  const reducedMotion = useSimulationStore((state) => state.accessibility.reducedMotion)

  return (
    <div className="animation-controls" aria-label="Teaching animation controls" role="group">
      <button className="atlas-button" disabled={reducedMotion} onClick={() => setPlaying(!animation.isPlaying)} title={reducedMotion ? 'Automatic playback is disabled by reduced motion' : undefined} type="button">
        {animation.isPlaying ? <Pause size={16} /> : <Play size={16} />}
        {animation.isPlaying ? 'Pause' : 'Play'}
      </button>
      <button aria-label="Previous phase" className="icon-button" onClick={previousPhase} title="Previous phase" type="button">
        <SkipBack size={16} />
      </button>
      <button aria-label="Next phase" className="icon-button" onClick={nextPhase} title="Next phase" type="button">
        <SkipForward size={16} />
      </button>
      <button aria-label="Restart phase" className="icon-button" onClick={() => setPhaseProgress(0)} title="Restart phase" type="button">
        <Rewind size={16} />
      </button>
      <button aria-label="Reset construction" className="icon-button" onClick={() => useSimulationStore.getState().reset()} title="Reset" type="button">
        <RotateCcw size={16} />
      </button>
      <label className="scrub-control">
        Scrub
        <input
          max={1}
          min={0}
          onChange={(event) => setPhaseProgress(Number(event.target.value))}
          step={0.01}
          type="range"
          value={animation.phaseProgress}
        />
      </label>
      <label className="sr-only" htmlFor="playback-speed">Playback speed</label>
      <select aria-label="Playback speed" className="control-select" id="playback-speed" value={animation.playbackSpeed} onChange={(event) => setPlaybackSpeed(Number(event.target.value))}>
        {[0.25, 0.5, 1, 1.5, 2].map((speed) => (
          <option key={speed} value={speed}>{speed}x</option>
        ))}
      </select>
      <select aria-label="Loop mode" className="control-select" value={animation.loopMode} onChange={(event) => setLoopMode(event.target.value as LoopMode)}>
        <option value="none">No loop</option>
        <option value="phase">Loop phase</option>
        <option value="full">Loop full</option>
      </select>
      <div className="phase-pills">
        {phases.map((phase) => (
          <button aria-pressed={animation.phase === phase.id} className={animation.phase === phase.id ? 'phase-pill-active' : 'phase-pill'} key={phase.id} onClick={() => setPhase(phase.id)} type="button">
            {phase.label}
          </button>
        ))}
      </div>
    </div>
  )
}
