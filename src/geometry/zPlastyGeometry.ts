import type { Point2D, ZPlastyGeometryResult, ZPlastyParameters } from '../types/geometry'
import { validateGeometry } from './validation'
import { add, angleBetween, distance, fromAngle, midpoint, subtract } from './vectorMath'
import { polygonArea, polygonPerimeter } from './polygonUtils'

export const defaultParameters: ZPlastyParameters = {
  centralLength: 56,
  upperLimbLength: 56,
  lowerLimbLength: 56,
  upperAngleDeg: 60,
  lowerAngleDeg: 60,
  orientationDeg: 90,
  tissueElasticity: 0.68,
  tissueStiffness: 0.42,
  scarStiffness: 0.56,
  closureTensionScale: 1,
  surfaceCurvature: 0.32,
  transpositionAmount: 1,
  symmetryLock: true,
  snapMode: 'angle15',
}

export function computeZPlastyGeometry(params: ZPlastyParameters): ZPlastyGeometryResult {
  const axis = fromAngle(params.orientationDeg, 1)
  const center: Point2D = { x: 0, y: 0 }
  const half = params.centralLength / 2
  const centralStart = add(center, { x: -axis.x * half, y: -axis.y * half })
  const centralEnd = add(center, { x: axis.x * half, y: axis.y * half })

  const upperEndpoint = add(centralEnd, fromAngle(params.orientationDeg + 180 - params.upperAngleDeg, params.upperLimbLength))
  const lowerEndpoint = add(centralStart, fromAngle(params.orientationDeg - params.lowerAngleDeg, params.lowerLimbLength))

  const upperFlap = [centralEnd, centralStart, lowerEndpoint]
  const lowerFlap = [centralStart, centralEnd, upperEndpoint]

  const upperDestination = add(centralEnd, fromAngle(params.orientationDeg - params.lowerAngleDeg, params.lowerLimbLength))
  const lowerDestination = add(centralStart, fromAngle(params.orientationDeg + 180 - params.upperAngleDeg, params.upperLimbLength))

  const transformedUpperFlap = [centralEnd, centralStart, upperDestination]
  const transformedLowerFlap = [centralStart, centralEnd, lowerDestination]

  const averageAngle = ((params.upperAngleDeg + params.lowerAngleDeg) / 2) * (Math.PI / 180)
  const standardGainFactor = Math.max(0, Math.sin(averageAngle) * 1.35)
  const symmetryPenalty = 1 - Math.min(0.35, Math.abs(params.upperLimbLength - params.lowerLimbLength) / Math.max(params.centralLength, 1))
  const stiffnessPenalty = 1 - params.scarStiffness * 0.12
  const theoreticalLengthGainPercent = standardGainFactor * 100 * symmetryPenalty * stiffnessPenalty
  const absoluteLengthGain = params.centralLength * (theoreticalLengthGainPercent / 100)
  const postoperativeAxisLength = params.centralLength + absoluteLengthGain
  const finalAxis = subtract(midpoint(upperDestination, centralEnd), midpoint(lowerDestination, centralStart))
  const reorientationAngleDeg = angleBetween(axis, finalAxis)

  const symmetryScore =
    1 -
    Math.min(
      1,
      (Math.abs(params.upperAngleDeg - params.lowerAngleDeg) / 90 +
        Math.abs(params.upperLimbLength - params.lowerLimbLength) / Math.max(params.centralLength, 1)) /
        2,
    )

  const upperArea = polygonArea(upperFlap)
  const lowerArea = polygonArea(lowerFlap)
  const flapDisplacement = (distance(lowerEndpoint, upperDestination) + distance(upperEndpoint, lowerDestination)) / 2
  const closureTensionEstimate =
    ((1 - params.tissueElasticity) * 0.9 + params.tissueStiffness * 0.45 + params.scarStiffness * 0.4) *
    params.closureTensionScale

  return {
    points: { centralStart, centralEnd, upperEndpoint, lowerEndpoint, upperDestination, lowerDestination },
    upperFlap,
    lowerFlap,
    transformedUpperFlap,
    transformedLowerFlap,
    preoperativeAxisLength: params.centralLength,
    postoperativeAxisLength,
    absoluteLengthGain,
    theoreticalLengthGain: absoluteLengthGain,
    theoreticalLengthGainPercent,
    reorientationAngleDeg,
    symmetryScore,
    upperAngleDeg: params.upperAngleDeg,
    lowerAngleDeg: params.lowerAngleDeg,
    upperArea,
    lowerArea,
    upperPerimeter: polygonPerimeter(upperFlap),
    lowerPerimeter: polygonPerimeter(lowerFlap),
    flapDisplacement,
    closureTensionEstimate,
    warnings: validateGeometry(params, upperFlap, lowerFlap),
  }
}

export function applySymmetry(params: ZPlastyParameters): ZPlastyParameters {
  if (!params.symmetryLock) return params
  const length = (params.upperLimbLength + params.lowerLimbLength) / 2
  const angle = (params.upperAngleDeg + params.lowerAngleDeg) / 2
  return { ...params, upperLimbLength: length, lowerLimbLength: length, upperAngleDeg: angle, lowerAngleDeg: angle }
}
