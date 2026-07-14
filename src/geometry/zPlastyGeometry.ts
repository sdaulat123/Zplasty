import type { DragHandleId, Point2D, ZPlastyGeometryResult, ZPlastyParameters } from '../types/geometry'
import { validateGeometry, validateParameters } from './validation'
import { add, angleBetween, angleOf, clamp, distance, fromAngle, midpoint, subtract } from './vectorMath'

export const GEOMETRY_EPSILON = 1e-8

export const defaultParameters: ZPlastyParameters = {
  centralLength: 56,
  upperLimbLength: 56,
  lowerLimbLength: 56,
  upperAngleDeg: 60,
  lowerAngleDeg: 60,
  orientationDeg: 90,
  illustrativeFlexibility: 0.68,
  deformationIntensity: 1,
  surfaceCurvature: 0.32,
  symmetryLock: true,
  centerX: 0,
  centerY: 0,
  reverseFlaps: false,
  contractureAxisDeg: 90,
}

function safeParameters(params: ZPlastyParameters): ZPlastyParameters {
  const safeNumber = (value: number, fallback: number) => Number.isFinite(value) ? value : fallback
  return {
    ...params,
    centralLength: Math.max(GEOMETRY_EPSILON, safeNumber(params.centralLength, defaultParameters.centralLength)),
    upperLimbLength: Math.max(GEOMETRY_EPSILON, safeNumber(params.upperLimbLength, defaultParameters.upperLimbLength)),
    lowerLimbLength: Math.max(GEOMETRY_EPSILON, safeNumber(params.lowerLimbLength, defaultParameters.lowerLimbLength)),
    upperAngleDeg: safeNumber(params.upperAngleDeg, defaultParameters.upperAngleDeg),
    lowerAngleDeg: safeNumber(params.lowerAngleDeg, defaultParameters.lowerAngleDeg),
    orientationDeg: safeNumber(params.orientationDeg, defaultParameters.orientationDeg),
    contractureAxisDeg: safeNumber(params.contractureAxisDeg, defaultParameters.contractureAxisDeg),
    centerX: safeNumber(params.centerX, 0),
    centerY: safeNumber(params.centerY, 0),
    illustrativeFlexibility: clamp(safeNumber(params.illustrativeFlexibility, defaultParameters.illustrativeFlexibility), 0, 1),
    deformationIntensity: clamp(safeNumber(params.deformationIntensity, defaultParameters.deformationIntensity), 0.1, 3),
    surfaceCurvature: clamp(safeNumber(params.surfaceCurvature, defaultParameters.surfaceCurvature), 0, 1),
  }
}

function smallerAxisAngle(a: Point2D, b: Point2D): number {
  const directed = angleBetween(a, b)
  return Math.min(directed, 180 - directed)
}

export function computeZPlastyGeometry(params: ZPlastyParameters): ZPlastyGeometryResult {
  const parameterIssues = validateParameters(params)
  const safe = safeParameters(params)
  const axis = fromAngle(safe.orientationDeg, 1)
  const center: Point2D = { x: safe.centerX, y: safe.centerY }
  const half = safe.centralLength / 2
  const centralStart = add(center, { x: -axis.x * half, y: -axis.y * half })
  const centralEnd = add(center, { x: axis.x * half, y: axis.y * half })
  const side = safe.reverseFlaps ? -1 : 1

  const upperEndpoint = add(
    centralEnd,
    fromAngle(safe.orientationDeg + 180 - safe.upperAngleDeg * side, safe.upperLimbLength),
  )
  const lowerEndpoint = add(
    centralStart,
    fromAngle(safe.orientationDeg - safe.lowerAngleDeg * side, safe.lowerLimbLength),
  )

  const upperFlap = [centralEnd, centralStart, lowerEndpoint]
  const lowerFlap = [centralStart, centralEnd, upperEndpoint]
  // These final triangles encode the published tip correspondences A→C and B→D.
  // They are used as a schematic before/after diagram, not as a rigid-body or tissue deformation model.
  const transformedUpperFlap = [centralEnd, upperEndpoint, lowerEndpoint]
  const transformedLowerFlap = [centralStart, lowerEndpoint, upperEndpoint]

  const finalAxis = subtract(lowerEndpoint, upperEndpoint)
  const finalEndpointSpan = distance(upperEndpoint, lowerEndpoint)
  const theoreticalLengthChange = finalEndpointSpan - safe.centralLength
  const theoreticalLengthChangePercent = (theoreticalLengthChange / safe.centralLength) * 100
  const axisLineAngleDeg = smallerAxisAngle(axis, finalAxis)
  const axisReferenceOffsetDeg = smallerAxisAngle(fromAngle(safe.contractureAxisDeg, 1), axis)

  const allPoints = [centralStart, centralEnd, upperEndpoint, lowerEndpoint]
  let totalConstructionSpan = 0
  for (let i = 0; i < allPoints.length; i += 1) {
    for (let j = i + 1; j < allPoints.length; j += 1) {
      totalConstructionSpan = Math.max(totalConstructionSpan, distance(allPoints[i], allPoints[j]))
    }
  }
  const perpendicular = { x: -axis.y, y: axis.x }
  const finalAxisTransverseComponent = Math.abs(finalAxis.x * perpendicular.x + finalAxis.y * perpendicular.y)
  const geometryIssues = validateGeometry(safe, upperFlap, lowerFlap)
  const issueMap = new Map([...parameterIssues, ...geometryIssues].map((issue) => [issue.code, issue]))
  const issues = [...issueMap.values()]
  const symmetric =
    Math.abs(safe.upperAngleDeg - safe.lowerAngleDeg) < GEOMETRY_EPSILON &&
    Math.abs(safe.upperLimbLength - safe.lowerLimbLength) < GEOMETRY_EPSILON &&
    Math.abs(safe.centralLength - safe.upperLimbLength) < GEOMETRY_EPSILON

  return {
    points: { centralStart, centralEnd, upperEndpoint, lowerEndpoint },
    upperFlap,
    lowerFlap,
    transformedUpperFlap,
    transformedLowerFlap,
    originalAxisLength: safe.centralLength,
    finalEndpointSpan,
    theoreticalLengthChange,
    theoreticalLengthChangePercent,
    axisLineAngleDeg,
    upperAngleDeg: safe.upperAngleDeg,
    lowerAngleDeg: safe.lowerAngleDeg,
    finalAxisStart: upperEndpoint,
    finalAxisEnd: lowerEndpoint,
    totalConstructionSpan,
    finalAxisTransverseComponent,
    axisReferenceOffsetDeg,
    calculationModel: symmetric ? 'classical-symmetric' : 'entered-planar',
    isValid: !issues.some((issue) => issue.severity === 'error'),
    issues,
    warnings: issues.map((issue) => issue.message),
  }
}

export function classicalSymmetricLength(angleDeg: number, limbLength: number): number {
  const angleRad = (angleDeg * Math.PI) / 180
  return limbLength * Math.sqrt(5 - 4 * Math.cos(angleRad))
}

export function classicalSymmetricLengthChangePercent(angleDeg: number): number {
  return (classicalSymmetricLength(angleDeg, 1) - 1) * 100
}

export function applySymmetry(params: ZPlastyParameters): ZPlastyParameters {
  if (!params.symmetryLock) return params
  const length = (params.upperLimbLength + params.lowerLimbLength) / 2
  const angle = (params.upperAngleDeg + params.lowerAngleDeg) / 2
  return { ...params, upperLimbLength: length, lowerLimbLength: length, upperAngleDeg: angle, lowerAngleDeg: angle }
}

export function parametersFromHandleDrag(
  params: ZPlastyParameters,
  id: DragHandleId,
  point: Point2D,
): ZPlastyParameters {
  if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) return params
  const geometry = computeZPlastyGeometry(params)
  const p = geometry.points

  if (id === 'center') return { ...params, centerX: point.x, centerY: point.y }

  if (id === 'centralStart' || id === 'centralEnd') {
    const fixed = id === 'centralStart' ? p.centralEnd : p.centralStart
    const start = id === 'centralStart' ? point : fixed
    const end = id === 'centralEnd' ? point : fixed
    const vector = subtract(end, start)
    const nextLength = distance(start, end)
    if (nextLength <= GEOMETRY_EPSILON) return params
    return {
      ...params,
      centralLength: nextLength,
      orientationDeg: ((angleOf(vector) % 360) + 360) % 360,
      centerX: midpoint(start, end).x,
      centerY: midpoint(start, end).y,
    }
  }

  const hinge = id === 'upperEndpoint' ? p.centralEnd : p.centralStart
  const vector = subtract(point, hinge)
  const nextLength = Math.hypot(vector.x, vector.y)
  if (nextLength <= GEOMETRY_EPSILON) return params
  const side = params.reverseFlaps ? -1 : 1
  const rawAngle = id === 'upperEndpoint'
    ? (params.orientationDeg + 180 - angleOf(vector)) * side
    : (params.orientationDeg - angleOf(vector)) * side
  const normalizedAngle = ((rawAngle % 360) + 360) % 360
  const angle = normalizedAngle > 180 ? 360 - normalizedAngle : normalizedAngle
  const patch = id === 'upperEndpoint'
    ? { upperLimbLength: nextLength, upperAngleDeg: angle }
    : { lowerLimbLength: nextLength, lowerAngleDeg: angle }
  if (!params.symmetryLock) return { ...params, ...patch }
  return {
    ...params,
    upperLimbLength: nextLength,
    lowerLimbLength: nextLength,
    upperAngleDeg: angle,
    lowerAngleDeg: angle,
  }
}
