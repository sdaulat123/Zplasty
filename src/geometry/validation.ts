import type { GeometryIssue, Point2D, ZPlastyParameters } from '../types/geometry'
import { isValidTriangle } from './polygonUtils'

export const MIN_LIMB_LENGTH_MM = 1
export const MAX_LIMB_LENGTH_MM = 120
export const MIN_LATERAL_ANGLE_DEG = 1
export const MAX_LATERAL_ANGLE_DEG = 179

const finiteFields: Array<keyof ZPlastyParameters> = [
  'centralLength',
  'upperLimbLength',
  'lowerLimbLength',
  'upperAngleDeg',
  'lowerAngleDeg',
  'orientationDeg',
  'contractureAxisDeg',
  'centerX',
  'centerY',
  'illustrativeFlexibility',
  'deformationIntensity',
  'surfaceCurvature',
]

export function validateParameters(params: ZPlastyParameters): GeometryIssue[] {
  const issues: GeometryIssue[] = []
  for (const field of finiteFields) {
    if (!Number.isFinite(params[field])) {
      issues.push({ code: `non-finite-${field}`, severity: 'error', message: `${field} must be a finite number.` })
    }
  }
  if (
    params.centralLength < MIN_LIMB_LENGTH_MM || params.centralLength > MAX_LIMB_LENGTH_MM ||
    params.upperLimbLength < MIN_LIMB_LENGTH_MM || params.upperLimbLength > MAX_LIMB_LENGTH_MM ||
    params.lowerLimbLength < MIN_LIMB_LENGTH_MM || params.lowerLimbLength > MAX_LIMB_LENGTH_MM
  ) {
    issues.push({ code: 'length-out-of-range', severity: 'error', message: `This interface supports limb lengths from ${MIN_LIMB_LENGTH_MM} to ${MAX_LIMB_LENGTH_MM} mm.` })
  }
  if (
    params.upperAngleDeg < MIN_LATERAL_ANGLE_DEG || params.upperAngleDeg > MAX_LATERAL_ANGLE_DEG ||
    params.lowerAngleDeg < MIN_LATERAL_ANGLE_DEG || params.lowerAngleDeg > MAX_LATERAL_ANGLE_DEG
  ) {
    issues.push({ code: 'angle-out-of-range', severity: 'error', message: `This interface supports lateral-limb angles from ${MIN_LATERAL_ANGLE_DEG}° to ${MAX_LATERAL_ANGLE_DEG}°.` })
  }
  const nearlyCollinear = (angle: number) => angle > 0 && angle < 180 && Math.min(angle, 180 - angle) < 0.01
  if (nearlyCollinear(params.upperAngleDeg) || nearlyCollinear(params.lowerAngleDeg)) {
    issues.push({ code: 'nearly-collinear-angle', severity: 'error', message: 'An angle within 0.01° of a straight line is numerically degenerate.' })
  }
  if (params.orientationDeg < 0 || params.orientationDeg > 360 || params.contractureAxisDeg < 0 || params.contractureAxisDeg > 360) {
    issues.push({ code: 'axis-angle-out-of-range', severity: 'error', message: 'Construction and reference-axis rotations must be between 0° and 360°.' })
  }
  if (params.illustrativeFlexibility < 0 || params.illustrativeFlexibility > 1 || params.surfaceCurvature < 0 || params.surfaceCurvature > 1) {
    issues.push({ code: 'conceptual-display-range', severity: 'error', message: 'Conceptual display sliders must remain between 0 and 1.' })
  }
  if (params.deformationIntensity < 0.1 || params.deformationIntensity > 3) {
    issues.push({ code: 'deformation-scale-range', severity: 'error', message: 'The conceptual deformation scale must remain between 0.1 and 3.' })
  }
  return issues
}

export function validateGeometry(params: ZPlastyParameters, upperFlap: Point2D[], lowerFlap: Point2D[]): GeometryIssue[] {
  const issues: GeometryIssue[] = []

  if (params.upperLimbLength < 5 || params.lowerLimbLength < 5) {
    issues.push({ code: 'small-display-geometry', severity: 'notice', message: 'A limb below 5 mm may be difficult to manipulate on screen.' })
  }
  if (Math.abs(params.upperLimbLength - params.lowerLimbLength) > params.centralLength * 0.25) {
    issues.push({ code: 'asymmetric-lengths', severity: 'notice', message: 'Unequal lateral limbs create an asymmetric planar construction; classical symmetric estimates do not apply.' })
  }
  if (
    Math.abs(params.upperLimbLength - params.lowerLimbLength) <= params.centralLength * 0.25 &&
    (Math.abs(params.upperLimbLength - params.centralLength) > 0.01 || Math.abs(params.lowerLimbLength - params.centralLength) > 0.01)
  ) {
    issues.push({ code: 'non-classical-limb-ratio', severity: 'notice', message: 'The lateral limbs do not both equal the central limb; results are direct measurements of the entered drawing.' })
  }
  if (Math.abs(params.upperAngleDeg - params.lowerAngleDeg) > 0.01) {
    issues.push({ code: 'asymmetric-angles', severity: 'notice', message: 'Unequal angles create an asymmetric planar construction; interpret endpoint measurements only.' })
  }
  if (params.upperAngleDeg < 30 || params.lowerAngleDeg < 30 || params.upperAngleDeg > 90 || params.lowerAngleDeg > 90) {
    issues.push({ code: 'outside-reference-range', severity: 'notice', message: 'At least one angle is outside the 30°–90° range represented by the reference presets.' })
  }
  if (params.upperAngleDeg > 60 || params.lowerAngleDeg > 60) {
    issues.push({ code: 'high-angle-limit', severity: 'notice', message: 'A larger angle increases theoretical span, but literature also describes more demanding transposition and closure. This tool does not assess tissue availability or tension.' })
  }
  if (!isValidTriangle(upperFlap) || !isValidTriangle(lowerFlap)) {
    issues.push({ code: 'degenerate-flap', severity: 'error', message: 'The construction creates a degenerate triangular flap.' })
  }

  return issues
}
