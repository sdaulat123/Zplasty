import type { Point2D, ZPlastyParameters } from '../types/geometry'
import { isValidTriangle, polygonsMightOverlap } from './polygonUtils'

export function validateGeometry(params: ZPlastyParameters, upperFlap: Point2D[], lowerFlap: Point2D[]) {
  const warnings: string[] = []

  if (params.upperLimbLength < 10 || params.lowerLimbLength < 10) warnings.push('A very short limb limits readable flap geometry.')
  if (Math.abs(params.upperLimbLength - params.lowerLimbLength) > params.centralLength * 0.25) {
    warnings.push('The lateral limbs are unequal, producing an asymmetric transposition.')
  }
  if (params.upperAngleDeg < 25 || params.lowerAngleDeg < 25) warnings.push('The selected angle produces limited theoretical central-axis lengthening.')
  if (params.upperAngleDeg > 80 || params.lowerAngleDeg > 80) warnings.push('Very obtuse angles may create crowded teaching geometry.')
  if (!isValidTriangle(upperFlap) || !isValidTriangle(lowerFlap)) warnings.push('This configuration creates a degenerate triangular flap.')
  if (polygonsMightOverlap(upperFlap, lowerFlap)) warnings.push('This configuration creates overlapping flap geometry.')
  if (params.tissueElasticity < 0.2 && params.closureTensionScale > 1.4) {
    warnings.push('The simplified model predicts concentrated relative deformation near hinge regions.')
  }

  return warnings
}
