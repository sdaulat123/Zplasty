import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GeometryControls } from './GeometryControls'
import { defaultParameters } from '../../geometry/zPlastyGeometry'
import { useSimulationStore } from '../../store/simulationStore'

describe('GeometryControls', () => {
  beforeEach(() => {
    useSimulationStore.setState({ params: { ...defaultParameters }, inputMode: 'learn', unit: 'mm', activePresetId: 'sym-60' })
  })

  it('shows central and symmetric-lateral inputs in Learn mode', () => {
    render(<GeometryControls />)
    expect(screen.getByRole('button', { name: 'Learn' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByLabelText('Central limb')).toBeInTheDocument()
    expect(screen.getByLabelText('Both lateral limbs')).toBeInTheDocument()
    expect(screen.getByLabelText('Symmetric angle')).toBeInTheDocument()
    expect(screen.queryByLabelText('Left / upper angle')).not.toBeInTheDocument()
  })

  it('exposes independent inputs in Exact inputs mode', () => {
    render(<GeometryControls />)
    fireEvent.click(screen.getByRole('button', { name: 'Exact inputs' }))
    expect(screen.getByLabelText('Central limb')).toBeInTheDocument()
    expect(screen.getByLabelText('Left / upper angle')).toBeInTheDocument()
    expect(screen.getByLabelText('Right / lower angle')).toBeInTheDocument()
  })

  it('converts centimeter entry back to internal millimeters', () => {
    render(<GeometryControls />)
    fireEvent.click(screen.getByRole('button', { name: 'Exact inputs' }))
    fireEvent.click(screen.getByRole('button', { name: 'cm' }))
    fireEvent.change(screen.getByLabelText('Central limb'), { target: { value: '6.2' } })
    expect(useSimulationStore.getState().params.centralLength).toBeCloseTo(62)
  })

  it('applies the 90 degree reference without calling it recommended', () => {
    render(<GeometryControls />)
    fireEvent.click(screen.getByRole('button', { name: '90°' }))
    expect(useSimulationStore.getState().params.upperAngleDeg).toBe(90)
    expect(useSimulationStore.getState().params.lowerAngleDeg).toBe(90)
    expect(screen.getByText('Exact geometric references—not procedural recommendations.')).toBeInTheDocument()
  })

  it('keeps the lateral limbs equal without overwriting the central limb', () => {
    render(<GeometryControls />)
    fireEvent.change(screen.getByLabelText('Central limb'), { target: { value: '72' } })
    fireEvent.change(screen.getByLabelText('Both lateral limbs'), { target: { value: '64' } })
    const { params } = useSimulationStore.getState()
    expect(params.centralLength).toBe(72)
    expect(params.upperLimbLength).toBe(64)
    expect(params.lowerLimbLength).toBe(64)
  })
})
