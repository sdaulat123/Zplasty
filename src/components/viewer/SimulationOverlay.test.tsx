import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { computeZPlastyGeometry, defaultParameters } from '../../geometry/zPlastyGeometry'
import { useSimulationStore } from '../../store/simulationStore'
import { fitViewBox } from '../../geometry/viewBox'
import { SimulationOverlay } from './SimulationOverlay'

describe('SimulationOverlay', () => {
  beforeEach(() => {
    useSimulationStore.getState().reset()
    useSimulationStore.setState({ params: { ...defaultParameters }, unit: 'mm', selectedId: null })
  })

  it('provides keyboard-operable geometry handles', () => {
    const geometry = computeZPlastyGeometry(useSimulationStore.getState().params)
    render(<SimulationOverlay geometry={geometry} />)
    const handle = screen.getByRole('button', { name: 'Move point C' })
    expect(handle).toHaveAttribute('r', '16')
    const previousLength = useSimulationStore.getState().params.upperLimbLength
    fireEvent.keyDown(handle, { key: 'ArrowLeft' })
    expect(useSimulationStore.getState().params.upperLimbLength).not.toBe(previousLength)
  })

  it('moves the entire construction with the center handle', () => {
    const geometry = computeZPlastyGeometry(useSimulationStore.getState().params)
    render(<SimulationOverlay geometry={geometry} />)
    fireEvent.keyDown(screen.getByRole('button', { name: 'Move entire construction' }), { key: 'ArrowRight', shiftKey: true })
    expect(useSimulationStore.getState().params.centerX).toBe(5)
  })

  it('auto-fits large or translated drawings into the viewBox', () => {
    const viewBox = fitViewBox([{ x: -500, y: -30 }, { x: 700, y: 90 }])
    expect(viewBox.x).toBeLessThan(-500)
    expect(viewBox.x + viewBox.width).toBeGreaterThan(700)
    expect(viewBox.y).toBeLessThan(-30)
    expect(viewBox.y + viewBox.height).toBeGreaterThan(90)
  })

  it('shows only the original scar in the Native tissue phase', () => {
    useSimulationStore.getState().setPhase('native')
    const geometry = computeZPlastyGeometry(useSimulationStore.getState().params)
    render(<SimulationOverlay geometry={geometry} />)
    expect(screen.getByRole('button', { name: 'Select Central Limb' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Move point C' })).not.toBeInTheDocument()
  })
})
