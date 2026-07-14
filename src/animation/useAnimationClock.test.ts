import { beforeEach, describe, expect, it } from 'vitest'
import { useSimulationStore } from '../store/simulationStore'
import { advanceAnimation } from './useAnimationClock'

describe('application animation clock', () => {
  beforeEach(() => {
    useSimulationStore.getState().reset()
    useSimulationStore.setState((state) => ({ accessibility: { ...state.accessibility, reducedMotion: false } }))
  })

  it('advances without a mounted WebGL canvas', () => {
    useSimulationStore.getState().setPlaying(true)
    advanceAnimation(1)
    expect(useSimulationStore.getState().animation.phaseProgress).toBeCloseTo(0.26)
  })

  it('moves to the next phase and stops after the final phase', () => {
    useSimulationStore.getState().setPhase('marking')
    useSimulationStore.getState().setPhaseProgress(0.99)
    useSimulationStore.getState().setPlaying(true)
    advanceAnimation(1)
    expect(useSimulationStore.getState().animation.phase).toBe('incision')

    useSimulationStore.getState().setPhase('comparison')
    useSimulationStore.getState().setPhaseProgress(0.99)
    advanceAnimation(1)
    expect(useSimulationStore.getState().animation.isPlaying).toBe(false)
    expect(useSimulationStore.getState().animation.phaseProgress).toBe(1)
  })
})
