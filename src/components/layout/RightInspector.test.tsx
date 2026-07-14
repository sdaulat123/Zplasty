import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { computeZPlastyGeometry, defaultParameters } from '../../geometry/zPlastyGeometry'
import { useSimulationStore } from '../../store/simulationStore'
import { RightInspector } from './RightInspector'

describe('RightInspector', () => {
  beforeEach(() => {
    useSimulationStore.setState({ params: { ...defaultParameters }, unit: 'mm' })
  })

  it('shows the exact theoretical length change for valid classical geometry', () => {
    render(<RightInspector geometry={computeZPlastyGeometry(defaultParameters)} />)
    expect(screen.getByText('73.2%')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /print geometry summary/i })).toBeEnabled()
  })

  it('withholds every calculated result and disables print for invalid geometry', () => {
    const invalid = computeZPlastyGeometry({ ...defaultParameters, centralLength: 0 })
    render(<RightInspector geometry={invalid} />)
    expect(screen.getByText('No calculated diagram')).toBeInTheDocument()
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(6)
    expect(screen.getByRole('button', { name: /print geometry summary/i })).toBeDisabled()
    expect(screen.queryByText('112.0 mm')).not.toBeInTheDocument()
  })
})
