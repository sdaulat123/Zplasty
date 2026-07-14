import { describe, expect, it } from 'vitest'
import { presets } from '../data/presets'
import { computeZPlastyGeometry, defaultParameters, applySymmetry } from './zPlastyGeometry'
import { degToRad, distance, fromAngle } from './vectorMath'
import { isValidTriangle } from './polygonUtils'

describe('vector math', () => {
  it('converts degrees to radians', () => {
    expect(degToRad(180)).toBeCloseTo(Math.PI)
  })

  it('creates vectors from angles', () => {
    const vector = fromAngle(0, 10)
    expect(vector.x).toBeCloseTo(10)
    expect(vector.y).toBeCloseTo(0)
  })
})

describe('z-plasty geometry', () => {
  it('creates symmetric geometry with equal lateral limbs', () => {
    const result = computeZPlastyGeometry(defaultParameters)
    expect(distance(result.points.centralEnd, result.points.upperEndpoint)).toBeCloseTo(defaultParameters.upperLimbLength)
    expect(distance(result.points.centralStart, result.points.lowerEndpoint)).toBeCloseTo(defaultParameters.lowerLimbLength)
  })

  it('keeps flap polygons valid for default design', () => {
    const result = computeZPlastyGeometry(defaultParameters)
    expect(isValidTriangle(result.upperFlap)).toBe(true)
    expect(isValidTriangle(result.lowerFlap)).toBe(true)
  })

  it('calculates positive theoretical gain for a 60 degree design', () => {
    const result = computeZPlastyGeometry(defaultParameters)
    expect(result.theoreticalLengthGainPercent).toBeGreaterThan(0)
    expect(result.postoperativeAxisLength).toBeGreaterThan(result.preoperativeAxisLength)
  })

  it('calculates reorientation', () => {
    const result = computeZPlastyGeometry(defaultParameters)
    expect(result.reorientationAngleDeg).toBeGreaterThanOrEqual(0)
  })

  it('applies equal-limb and angle constraints with symmetry helper', () => {
    const result = applySymmetry({ ...defaultParameters, upperLimbLength: 80, lowerLimbLength: 40, upperAngleDeg: 70, lowerAngleDeg: 30 })
    expect(result.upperLimbLength).toBeCloseTo(result.lowerLimbLength)
    expect(result.upperAngleDeg).toBeCloseTo(result.lowerAngleDeg)
  })

  it('flags invalid or crowded teaching geometry', () => {
    const result = computeZPlastyGeometry({ ...defaultParameters, upperAngleDeg: 20, lowerAngleDeg: 20, upperLimbLength: 4 })
    expect(result.warnings.length).toBeGreaterThan(0)
  })

  it('detects asymmetric designs through symmetry score', () => {
    const symmetric = computeZPlastyGeometry(defaultParameters)
    const asymmetric = computeZPlastyGeometry({ ...defaultParameters, symmetryLock: false, upperLimbLength: 80, lowerLimbLength: 35 })
    expect(asymmetric.symmetryScore).toBeLessThan(symmetric.symmetryScore)
  })

  it('loads all presets into valid geometry results', () => {
    for (const preset of presets) {
      const result = computeZPlastyGeometry(preset.params)
      expect(result.preoperativeAxisLength).toBeGreaterThan(0)
    }
  })

  it('keeps transformed flap polygons structurally consistent', () => {
    const result = computeZPlastyGeometry(defaultParameters)
    expect(result.transformedUpperFlap).toHaveLength(result.upperFlap.length)
    expect(result.transformedLowerFlap).toHaveLength(result.lowerFlap.length)
  })

  it('provides a state-reset baseline through default parameters', () => {
    const result = computeZPlastyGeometry(defaultParameters)
    expect(result.preoperativeAxisLength).toBe(defaultParameters.centralLength)
  })
})
