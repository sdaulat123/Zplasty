import { Pause, Play, Rewind, SkipBack, SkipForward, RotateCcw } from 'lucide-react'
import { phases } from '../../animation/phaseDefinitions'
import { useSimulationStore } from '../../store/simulationStore'

export function AnimationControls() {
  const animation = useSimulationStore((state) => state.animation)
  const setPlaying = useSimulationStore((state) => state.setPlaying)
  const setPhaseProgress = useSimulationStore((state) => state.setPhaseProgress)
  const setPlaybackSpeed = useSimulationStore((state) => state.setPlaybackSpeed)
  const setLoopMode = useSimulationStore((state) => state.setLoopMode)
  const setPhase = useSimulationStore((state) => state.setPhase)
  const nextPhase = useSimulationStore((state) => state.nextPhase)
  const previousPhase = useSimulationStore((state) => state.previousPhase)

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button className="atlas-button" onClick={() => setPlaying(!animation.isPlaying)} type="button">
        {animation.isPlaying ? <Pause size={16} /> : <Play size={16} />}
        {animation.isPlaying ? 'Pause' : 'Play'}
      </button>
      <button className="icon-button" onClick={previousPhase} title="Previous phase" type="button">
        <SkipBack size={16} />
      </button>
      <button className="icon-button" onClick={nextPhase} title="Next phase" type="button">
        <SkipForward size={16} />
      </button>
      <button className="icon-button" onClick={() => setPhaseProgress(0)} title="Restart phase" type="button">
        <Rewind size={16} />
      </button>
      <button className="icon-button" onClick={() => useSimulationStore.getState().reset()} title="Reset" type="button">
        <RotateCcw size={16} />
      </button>
      <label className="flex min-w-[220px] flex-1 items-center gap-2 text-xs font-semibold text-[#6f5b3d]">
        Scrub
        <input
          className="w-full"
          max={1}
          min={0}
          onChange={(event) => setPhaseProgress(Number(event.target.value))}
          step={0.01}
          type="range"
          value={animation.phaseProgress}
        />
      </label>
      <select className="control-select" value={animation.playbackSpeed} onChange={(event) => setPlaybackSpeed(Number(event.target.value))}>
        {[0.25, 0.5, 1, 1.5, 2].map((speed) => (
          <option key={speed} value={speed}>{speed}x</option>
        ))}
      </select>
      <select className="control-select" value={animation.loopMode} onChange={(event) => setLoopMode(event.target.value as never)}>
        <option value="none">No loop</option>
        <option value="phase">Loop phase</option>
        <option value="full">Loop full</option>
      </select>
      <div className="flex flex-wrap gap-1">
        {phases.map((phase) => (
          <button className={animation.phase === phase.id ? 'phase-pill-active' : 'phase-pill'} key={phase.id} onClick={() => setPhase(phase.id)} type="button">
            {phase.label}
          </button>
        ))}
      </div>
    </div>
  )
}
