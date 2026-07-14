import type { Point2D, ZPlastyGeometryResult, ZPlastyParameters } from '../types/geometry'
import { distance } from './vectorMath'

export function deformationWeight(point: Point2D, geometry: ZPlastyGeometryResult, params: ZPlastyParameters) {
  const hingeDistance = Math.min(distance(point, geometry.points.centralStart), distance(point, geometry.points.centralEnd))
  const flapDistance = Math.min(distance(point, geometry.points.upperEndpoint), distance(point, geometry.points.lowerEndpoint))
  const falloff = Math.exp(-(hingeDistance * hingeDistance) / 2600) + Math.exp(-(flapDistance * flapDistance) / 4200)
  return Math.min(1, falloff * (1 - params.tissueElasticity + params.closureTensionScale * 0.28))
}

export function strainColor(weight: number, colorBlindSafe = false) {
  if (colorBlindSafe) {
    if (weight < 0.33) return '#2c7bb6'
    if (weight < 0.66) return '#ffff8c'
    return '#d7191c'
  }
  if (weight < 0.33) return '#39b56a'
  if (weight < 0.66) return '#f3b33f'
  return '#cf4e45'
}
