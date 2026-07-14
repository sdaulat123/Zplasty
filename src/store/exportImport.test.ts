import { describe, expect, it } from 'vitest'
import { computeZPlastyGeometry, defaultParameters } from '../geometry/zPlastyGeometry'
import { createExport, parseImport } from './exportImport'

const animation = { phase: 'marking' as const, phaseProgress: 0.4, isPlaying: true, playbackSpeed: 1, loopMode: 'none' as const }

describe('configuration import and export', () => {
  it('round-trips a complete versioned local configuration', () => {
    const geometry = computeZPlastyGeometry(defaultParameters)
    const text = createExport({
      presetName: '60° symmetric Z-plasty',
      unit: 'cm',
      inputMode: 'learn',
      params: defaultParameters,
      animation,
      geometry,
    })
    const parsed = parseImport(JSON.parse(text) as unknown)
    expect(parsed.schemaVersion).toBe(1)
    expect(parsed.application).toBe('zplasty-atlas')
    expect(parsed.params).toEqual(defaultParameters)
    expect(parsed.unit).toBe('cm')
    expect(parsed.animation.phaseProgress).toBe(0.4)
  })

  it('never trusts imported measurement snapshots', () => {
    const geometry = computeZPlastyGeometry(defaultParameters)
    const raw = JSON.parse(createExport({ presetName: 'Reference', unit: 'mm', inputMode: 'learn', params: defaultParameters, animation, geometry }))
    raw.measurements.finalEndpointSpan = 999_999
    const imported = parseImport(raw)
    const recomputed = computeZPlastyGeometry(imported.params)
    expect(recomputed.finalEndpointSpan).toBeCloseTo(defaultParameters.centralLength * Math.sqrt(3))
    expect(recomputed.finalEndpointSpan).not.toBe(raw.measurements.finalEndpointSpan)
  })

  it.each([
    null,
    {},
    { schemaVersion: 99, application: 'zplasty-atlas' },
    { schemaVersion: 1, application: 'other' },
  ])('rejects unsupported outer structures: %o', (value) => {
    expect(() => parseImport(value)).toThrow()
  })

  it('rejects malformed, non-finite, and internally inconsistent parameters', () => {
    const geometry = computeZPlastyGeometry(defaultParameters)
    const base = JSON.parse(createExport({ presetName: 'Reference', unit: 'mm', inputMode: 'learn', params: defaultParameters, animation, geometry }))

    expect(() => parseImport({ ...base, params: { ...base.params, upperLimbLength: 'oops' } })).toThrow(/upperLimbLength/)
    expect(() => parseImport({ ...base, params: { ...base.params, centralLength: Number.POSITIVE_INFINITY } })).toThrow(/centralLength/)
    expect(() => parseImport({ ...base, params: { ...base.params, upperAngleDeg: 0 } })).toThrow(/angle/i)
    expect(() => parseImport({ ...base, params: { ...base.params, symmetryLock: true, upperLimbLength: 80, lowerLimbLength: 40 } })).toThrow(/unequal/i)
    expect(() => parseImport({ ...base, animation: { ...base.animation, phase: 'unknown' } })).toThrow(/phase/i)
  })

  it('refuses to export calculated values from invalid geometry', () => {
    const params = { ...defaultParameters, centralLength: 0 }
    expect(() => createExport({
      presetName: 'Invalid',
      unit: 'mm',
      inputMode: 'learn',
      params,
      animation,
      geometry: computeZPlastyGeometry(params),
    })).toThrow(/invalid/i)
  })
})
