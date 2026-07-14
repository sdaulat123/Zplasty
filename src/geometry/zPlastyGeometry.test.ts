import { describe, expect, it } from 'vitest'
import { presets } from '../data/presets'
import {
  applySymmetry,
  classicalSymmetricLength,
  classicalSymmetricLengthChangePercent,
  computeZPlastyGeometry,
  defaultParameters,
  parametersFromHandleDrag,
} from './zPlastyGeometry'
import { degToRad, distance, fromAngle } from './vectorMath'
import { isValidTriangle } from './polygonUtils'
import { fromDisplayUnit, toDisplayUnit } from './measurements'

describe('vector math', () => {
  it('converts degrees to radians and constructs vectors', () => {
    expect(degToRad(180)).toBeCloseTo(Math.PI)
    expect(fromAngle(0, 10)).toEqual({ x: 10, y: 0 })
  })
})

describe('Z-plasty planar geometry', () => {
  it('constructs each lateral limb from the correct hinge', () => {
    const result = computeZPlastyGeometry(defaultParameters)
    expect(distance(result.points.centralEnd, result.points.upperEndpoint)).toBeCloseTo(defaultParameters.upperLimbLength)
    expect(distance(result.points.centralStart, result.points.lowerEndpoint)).toBeCloseTo(defaultParameters.lowerLimbLength)
    expect(isValidTriangle(result.upperFlap)).toBe(true)
    expect(isValidTriangle(result.lowerFlap)).toBe(true)
  })

  it('uses the reciprocal A→C and B→D topology in the schematic final triangles', () => {
    const result = computeZPlastyGeometry(defaultParameters)
    const { centralStart: a, centralEnd: b, upperEndpoint: c, lowerEndpoint: d } = result.points
    expect(result.upperFlap).toEqual([b, a, d])
    expect(result.lowerFlap).toEqual([a, b, c])
    expect(result.transformedUpperFlap).toEqual([b, c, d])
    expect(result.transformedLowerFlap).toEqual([a, d, c])
    expect(result.transformedUpperFlap).toContain(c)
    expect(result.transformedUpperFlap).toContain(d)
    expect(result.transformedLowerFlap).toContain(c)
    expect(result.transformedLowerFlap).toContain(d)
  })

  it('calculates the exact classical 60° result', () => {
    const result = computeZPlastyGeometry(defaultParameters)
    expect(result.theoreticalLengthChangePercent).toBeCloseTo(73.2050808, 6)
    expect(result.finalEndpointSpan).toBeCloseTo(defaultParameters.centralLength * Math.sqrt(3), 8)
    expect(result.axisLineAngleDeg).toBeCloseTo(90, 8)
    expect(result.calculationModel).toBe('classical-symmetric')
  })

  it.each([
    [30, 23.931, 53.794],
    [45, 47.363, 73.675],
    [60, 73.205, 90.0],
    [75, 99.116, 75.981],
    [90, 123.607, 63.435],
  ])('matches exact classical length and undirected line-angle references at %i°', (angle, expectedChange, expectedLineAngle) => {
    const result = computeZPlastyGeometry({ ...defaultParameters, upperAngleDeg: angle, lowerAngleDeg: angle })
    expect(result.finalEndpointSpan).toBeCloseTo(classicalSymmetricLength(angle, defaultParameters.centralLength), 8)
    expect(result.theoreticalLengthChangePercent).toBeCloseTo(expectedChange, 2)
    expect(classicalSymmetricLengthChangePercent(angle)).toBeCloseTo(expectedChange, 2)
    expect(result.axisLineAngleDeg).toBeCloseTo(expectedLineAngle, 2)
  })

  it.each([
    [56, 56, 56, 40, 70],
    [80, 35, 61, 25, 91],
    [22, 100, 18, 120, 15],
    [140, 41, 93, 50, 52],
  ])('matches the independent general C–D identity', (central, upper, lower, alpha, beta) => {
    const result = computeZPlastyGeometry({
      ...defaultParameters,
      centralLength: central,
      upperLimbLength: upper,
      lowerLimbLength: lower,
      upperAngleDeg: alpha,
      lowerAngleDeg: beta,
      symmetryLock: false,
    })
    const toRad = (degrees: number) => degrees * Math.PI / 180
    const expectedSquared = central ** 2 + upper ** 2 + lower ** 2
      - 2 * central * (upper * Math.cos(toRad(alpha)) + lower * Math.cos(toRad(beta)))
      + 2 * upper * lower * Math.cos(toRad(alpha - beta))
    expect(result.finalEndpointSpan ** 2).toBeCloseTo(expectedSquared, 7)
  })

  it('is invariant to translation, construction rotation, and mirror direction', () => {
    const baseline = computeZPlastyGeometry(defaultParameters)
    for (const patch of [
      { centerX: 137, centerY: -82 },
      { orientationDeg: 217 },
      { reverseFlaps: true },
    ]) {
      const result = computeZPlastyGeometry({ ...defaultParameters, ...patch })
      expect(result.finalEndpointSpan).toBeCloseTo(baseline.finalEndpointSpan, 8)
      expect(result.theoreticalLengthChangePercent).toBeCloseTo(baseline.theoreticalLengthChangePercent, 8)
      expect(result.axisLineAngleDeg).toBeCloseTo(baseline.axisLineAngleDeg, 8)
    }
  })

  it('scales every length without changing percentages or angles', () => {
    const baseline = computeZPlastyGeometry(defaultParameters)
    const scaled = computeZPlastyGeometry({
      ...defaultParameters,
      centralLength: 112,
      upperLimbLength: 112,
      lowerLimbLength: 112,
    })
    expect(scaled.finalEndpointSpan).toBeCloseTo(baseline.finalEndpointSpan * 2)
    expect(scaled.theoreticalLengthChangePercent).toBeCloseTo(baseline.theoreticalLengthChangePercent)
    expect(scaled.axisLineAngleDeg).toBeCloseTo(baseline.axisLineAngleDeg)
  })

  it('keeps conceptual display sliders out of exact geometry calculations', () => {
    const baseline = computeZPlastyGeometry(defaultParameters)
    const changed = computeZPlastyGeometry({
      ...defaultParameters,
      illustrativeFlexibility: 0,
      deformationIntensity: 3,
      surfaceCurvature: 1,
    })
    expect(changed.finalEndpointSpan).toBe(baseline.finalEndpointSpan)
    expect(changed.theoreticalLengthChangePercent).toBe(baseline.theoreticalLengthChangePercent)
    expect(changed.axisLineAngleDeg).toBe(baseline.axisLineAngleDeg)
  })

  it.each([
    { centralLength: 0 },
    { centralLength: -10 },
    { centralLength: 121 },
    { upperLimbLength: Number.NaN },
    { lowerLimbLength: Number.POSITIVE_INFINITY },
    { upperAngleDeg: 0 },
    { upperAngleDeg: 0.5 },
    { lowerAngleDeg: 180 },
    { upperAngleDeg: 179.999 },
    { illustrativeFlexibility: 1.1 },
    { deformationIntensity: 0 },
    { orientationDeg: -1 },
    { contractureAxisDeg: 361 },
  ])('rejects invalid and non-finite parameters while retaining finite edit geometry: %o', (patch) => {
    const result = computeZPlastyGeometry({ ...defaultParameters, ...patch })
    expect(result.isValid).toBe(false)
    expect(result.issues.some((issue) => issue.severity === 'error')).toBe(true)
    expect(Number.isFinite(result.finalEndpointSpan)).toBe(true)
  })

  it('labels arbitrary inputs as entered-planar measurements', () => {
    const result = computeZPlastyGeometry({
      ...defaultParameters,
      symmetryLock: false,
      upperLimbLength: 72,
      lowerLimbLength: 41,
      upperAngleDeg: 70,
      lowerAngleDeg: 35,
    })
    expect(result.calculationModel).toBe('entered-planar')
    expect(result.issues.some((issue) => issue.code === 'asymmetric-lengths')).toBe(true)
    expect(result.issues.some((issue) => issue.code === 'asymmetric-angles')).toBe(true)
  })

  it('flags equal lateral limbs that do not equal the central limb as non-classical', () => {
    const result = computeZPlastyGeometry({
      ...defaultParameters,
      centralLength: 80,
      upperLimbLength: 56,
      lowerLimbLength: 56,
    })
    expect(result.calculationModel).toBe('entered-planar')
    expect(result.issues.some((issue) => issue.code === 'non-classical-limb-ratio')).toBe(true)
  })

  it('derives footprint, perpendicular component, and reference-axis offset from vectors', () => {
    const result = computeZPlastyGeometry({ ...defaultParameters, orientationDeg: 120, contractureAxisDeg: 90 })
    expect(result.totalConstructionSpan).toBeCloseTo(result.finalEndpointSpan)
    expect(result.finalAxisTransverseComponent).toBeCloseTo(result.finalEndpointSpan)
    expect(result.axisReferenceOffsetDeg).toBeCloseTo(30)
  })

  it('applies symmetry constraints and derives dragged lateral inputs from the correct hinge', () => {
    const symmetric = applySymmetry({ ...defaultParameters, upperLimbLength: 80, lowerLimbLength: 40, upperAngleDeg: 70, lowerAngleDeg: 30 })
    expect(symmetric.upperLimbLength).toBe(60)
    expect(symmetric.lowerLimbLength).toBe(60)
    expect(symmetric.upperAngleDeg).toBe(50)
    expect(symmetric.lowerAngleDeg).toBe(50)

    const initial = { ...defaultParameters, symmetryLock: false }
    const hinge = computeZPlastyGeometry(initial).points.centralEnd
    const target = { x: hinge.x - 30, y: hinge.y - 40 }
    const dragged = parametersFromHandleDrag(initial, 'upperEndpoint', target)
    expect(dragged.upperLimbLength).toBeCloseTo(50)
    expect(dragged.lowerLimbLength).toBe(initial.lowerLimbLength)
  })

  it('supports repeated drags without accumulating non-finite state', () => {
    let current = { ...defaultParameters, symmetryLock: false }
    for (let index = 0; index < 100; index += 1) {
      const point = computeZPlastyGeometry(current).points.upperEndpoint
      current = parametersFromHandleDrag(current, 'upperEndpoint', { x: point.x + 0.2, y: point.y - 0.1 })
    }
    const result = computeZPlastyGeometry(current)
    expect(result.isValid).toBe(true)
    expect(Number.isFinite(result.finalEndpointSpan)).toBe(true)
  })

  it('loads every implemented preset as valid geometry', () => {
    for (const preset of presets) expect(computeZPlastyGeometry(preset.params).isValid).toBe(true)
  })

  it('converts display units without changing internal millimeters', () => {
    expect(toDisplayUnit(56, 'cm')).toBeCloseTo(5.6)
    expect(fromDisplayUnit(5.6, 'cm')).toBeCloseTo(56)
    expect(fromDisplayUnit(toDisplayUnit(123.45, 'cm'), 'cm')).toBeCloseTo(123.45)
  })
})
