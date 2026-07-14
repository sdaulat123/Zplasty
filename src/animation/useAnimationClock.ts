import { useEffect } from 'react'
import { phaseOrder } from './phaseDefinitions'
import { useSimulationStore } from '../store/simulationStore'

const PHASES_PER_SECOND = 0.26

export function advanceAnimation(deltaSeconds: number) {
  const state = useSimulationStore.getState()
  const { animation } = state
  if (!animation.isPlaying || state.accessibility.reducedMotion) return
  const nextProgress = animation.phaseProgress + Math.max(0, deltaSeconds) * PHASES_PER_SECOND * animation.playbackSpeed
  if (nextProgress < 1) {
    state.setPhaseProgress(nextProgress)
    return
  }

  const index = phaseOrder.indexOf(animation.phase)
  if (animation.loopMode === 'phase') {
    state.setPhaseProgress(0)
  } else if (animation.loopMode === 'full' || index < phaseOrder.length - 1) {
    state.setPhase(phaseOrder[(index + 1) % phaseOrder.length])
  } else {
    state.setPlaying(false)
    state.setPhaseProgress(1)
  }
}

export function useAnimationClock() {
  useEffect(() => {
    let frame = 0
    let previousTime = 0

    const tick = (time: number) => {
      const delta = previousTime === 0 ? 0 : Math.min((time - previousTime) / 1000, 0.1)
      previousTime = time
      advanceAnimation(delta)
      if (useSimulationStore.getState().animation.isPlaying) frame = requestAnimationFrame(tick)
    }
    const start = () => {
      if (frame || !useSimulationStore.getState().animation.isPlaying) return
      previousTime = 0
      frame = requestAnimationFrame(tick)
    }
    const stop = () => {
      if (frame) cancelAnimationFrame(frame)
      frame = 0
      previousTime = 0
    }

    const unsubscribe = useSimulationStore.subscribe((state, previous) => {
      if (state.animation.isPlaying && !previous.animation.isPlaying) start()
      if (!state.animation.isPlaying && previous.animation.isPlaying) stop()
    })
    start()
    return () => {
      unsubscribe()
      stop()
    }
  }, [])
}
