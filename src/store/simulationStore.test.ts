import { beforeEach, describe, expect, it } from 'vitest'
import { defaultParameters } from '../geometry/zPlastyGeometry'
import { useSimulationStore } from './simulationStore'

describe('simulation store invariants', () => {
  beforeEach(() => {
    useSimulationStore.getState().reset()
  })

  it('normalizes conflicting two-sided patches while symmetry is locked', () => {
    useSimulationStore.getState().setParams({
      upperLimbLength: 80,
      lowerLimbLength: 40,
      upperAngleDeg: 70,
      lowerAngleDeg: 30,
      symmetryLock: true,
    })
    const { params } = useSimulationStore.getState()
    expect(params.upperLimbLength).toBe(60)
    expect(params.lowerLimbLength).toBe(60)
    expect(params.upperAngleDeg).toBe(50)
    expect(params.lowerAngleDeg).toBe(50)
  })

  it('mirrors a single lateral edit while symmetry is locked', () => {
    useSimulationStore.getState().setParams({ upperLimbLength: 77, upperAngleDeg: 64 })
    const { params } = useSimulationStore.getState()
    expect(params.lowerLimbLength).toBe(77)
    expect(params.lowerAngleDeg).toBe(64)
  })

  it('normalizes hidden asymmetric values when entering Learn mode', () => {
    useSimulationStore.setState({
      inputMode: 'plan',
      params: { ...defaultParameters, symmetryLock: false, upperLimbLength: 80, lowerLimbLength: 40, upperAngleDeg: 70, lowerAngleDeg: 30 },
    })
    useSimulationStore.getState().setInputMode('learn')
    const { params, inputMode } = useSimulationStore.getState()
    expect(inputMode).toBe('learn')
    expect(params.symmetryLock).toBe(true)
    expect(params.upperLimbLength).toBe(params.lowerLimbLength)
    expect(params.upperAngleDeg).toBe(params.lowerAngleDeg)
  })

  it('switches to exact inputs for the asymmetric reference preset', () => {
    useSimulationStore.getState().loadPreset('asym')
    expect(useSimulationStore.getState().inputMode).toBe('plan')
    expect(useSimulationStore.getState().params.symmetryLock).toBe(false)
  })

  it('does not mark exact geometry custom when only conceptual display sliders change', () => {
    useSimulationStore.setState({ activePresetId: 'sym-60' })
    useSimulationStore.getState().setParams({ surfaceCurvature: 0.9 })
    expect(useSimulationStore.getState().activePresetId).toBe('sym-60')
  })

  it('preserves symmetric lateral limbs during direct manipulation in Learn mode', () => {
    useSimulationStore.getState().dragHandle('upperEndpoint', -52, 3)
    const { params } = useSimulationStore.getState()
    expect(params.lowerLimbLength).toBeCloseTo(params.upperLimbLength)
    expect(params.centralLength).toBe(defaultParameters.centralLength)
  })

  it('keeps direct manipulation inside the documented Learn-mode ranges', () => {
    useSimulationStore.getState().dragHandle('upperEndpoint', -1_000, -1_000)
    const { params } = useSimulationStore.getState()
    expect(params.centralLength).toBe(defaultParameters.centralLength)
    expect(params.upperLimbLength).toBe(120)
    expect(params.lowerLimbLength).toBe(120)
    expect(params.upperAngleDeg).toBeGreaterThanOrEqual(30)
    expect(params.upperAngleDeg).toBeLessThanOrEqual(90)
  })

  it('lets a Learn-mode central drag change the central limb independently', () => {
    useSimulationStore.getState().dragHandle('centralEnd', 0, 48)
    const { params } = useSimulationStore.getState()
    expect(params.centralLength).not.toBe(defaultParameters.centralLength)
    expect(params.upperLimbLength).toBe(defaultParameters.upperLimbLength)
    expect(params.lowerLimbLength).toBe(defaultParameters.lowerLimbLength)
  })

  it('clamps phase progress and stops playback when reduced motion is enabled', () => {
    useSimulationStore.getState().setPhaseProgress(4)
    expect(useSimulationStore.getState().animation.phaseProgress).toBe(1)
    useSimulationStore.getState().setPlaying(true)
    useSimulationStore.getState().toggleAccessibility('reducedMotion')
    expect(useSimulationStore.getState().animation.isPlaying).toBe(false)
  })
})
