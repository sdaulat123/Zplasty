import { phaseOrder } from './phaseDefinitions'
import type { AnimationState, SimulationPhase } from '../types/simulation'

export type PhaseVisualState = {
  marking: number
  incision: number
  elevation: number
  transposition: number
  approximation: number
  closure: number
  comparison: number
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0))
}

export function easePhaseProgress(progress: number) {
  const value = clamp01(progress)
  return value * value * (3 - 2 * value)
}

export function phaseCompletion(animation: Pick<AnimationState, 'phase' | 'phaseProgress'>, target: SimulationPhase) {
  const currentIndex = phaseOrder.indexOf(animation.phase)
  const targetIndex = phaseOrder.indexOf(target)
  if (currentIndex < targetIndex) return 0
  if (currentIndex > targetIndex) return 1
  return easePhaseProgress(animation.phaseProgress)
}

export function getPhaseVisualState(animation: Pick<AnimationState, 'phase' | 'phaseProgress'>): PhaseVisualState {
  const transposition = phaseCompletion(animation, 'transposition')
  return {
    marking: phaseCompletion(animation, 'marking'),
    incision: phaseCompletion(animation, 'incision'),
    elevation: animation.phase === 'elevation'
      ? easePhaseProgress(animation.phaseProgress)
      : animation.phase === 'transposition'
        ? 1 - transposition
        : 0,
    transposition,
    approximation: phaseCompletion(animation, 'approximation'),
    closure: phaseCompletion(animation, 'closure'),
    comparison: phaseCompletion(animation, 'comparison'),
  }
}

export function stagedLineProgress(progress: number, index: number, count: number) {
  if (count <= 0) return 0
  return clamp01(progress * count - index)
}
