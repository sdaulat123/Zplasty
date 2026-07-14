import { describe, expect, it } from 'vitest'
import { getPhaseVisualState, phaseCompletion, stagedLineProgress } from './phaseVisualState'

describe('phase visual timeline', () => {
  it('completes earlier phases while leaving later phases untouched', () => {
    const state = getPhaseVisualState({ phase: 'elevation', phaseProgress: 0.5 })
    expect(state.marking).toBe(1)
    expect(state.incision).toBe(1)
    expect(state.elevation).toBe(0.5)
    expect(state.transposition).toBe(0)
    expect(state.approximation).toBe(0)
  })

  it('lowers the schematic flaps while transposition advances', () => {
    const state = getPhaseVisualState({ phase: 'transposition', phaseProgress: 0.5 })
    expect(state.elevation).toBe(0.5)
    expect(state.transposition).toBe(0.5)
  })

  it('holds the final topology through approximation, closure, and comparison', () => {
    const state = getPhaseVisualState({ phase: 'comparison', phaseProgress: 0.25 })
    expect(state.transposition).toBe(1)
    expect(state.approximation).toBe(1)
    expect(state.closure).toBe(1)
    expect(state.comparison).toBeCloseTo(0.15625)
  })

  it('eases normalized phase progress and stages multi-segment paths', () => {
    expect(phaseCompletion({ phase: 'marking', phaseProgress: 0.25 }, 'marking')).toBeCloseTo(0.15625)
    expect(stagedLineProgress(0.5, 0, 3)).toBe(1)
    expect(stagedLineProgress(0.5, 1, 3)).toBe(0.5)
    expect(stagedLineProgress(0.5, 2, 3)).toBe(0)
  })
})
