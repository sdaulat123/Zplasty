import type { Point2D, ZPlastyGeometryResult } from '../types/geometry'
import { easeInOut } from './animationMath'
import { lerp } from '../geometry/vectorMath'

export function interpolatePolygon(from: Point2D[], to: Point2D[], progress: number) {
  const eased = easeInOut(progress)
  return from.map((point, index) => lerp(point, to[index], eased))
}

export function activeFlaps(geometry: ZPlastyGeometryResult, phaseProgress: number) {
  return {
    upper: interpolatePolygon(geometry.upperFlap, geometry.transformedUpperFlap, phaseProgress),
    lower: interpolatePolygon(geometry.lowerFlap, geometry.transformedLowerFlap, phaseProgress),
  }
}
