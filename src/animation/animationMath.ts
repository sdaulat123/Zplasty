import type { SimulationPhase } from '../types/simulation'
import { clamp } from '../geometry/vectorMath'

export function phaseVisibility(phase: SimulationPhase, current: SimulationPhase, progress: number) {
  const order: SimulationPhase[] = ['native', 'marking', 'incision', 'elevation', 'transposition', 'approximation', 'closure', 'comparison']
  const phaseIndex = order.indexOf(phase)
  const currentIndex = order.indexOf(current)
  if (phaseIndex < currentIndex) return 1
  if (phaseIndex > currentIndex) return 0
  return clamp(progress, 0, 1)
}

export function easeInOut(t: number) {
  const clamped = clamp(t, 0, 1)
  return clamped * clamped * (3 - 2 * clamped)
}
