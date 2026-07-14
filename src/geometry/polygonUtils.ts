import type { Point2D } from '../types/geometry'

export function polygonArea(points: Point2D[]): number {
  if (points.length < 3) return 0
  const sum = points.reduce((acc, point, index) => {
    const next = points[(index + 1) % points.length]
    return acc + point.x * next.y - next.x * point.y
  }, 0)
  return Math.abs(sum) / 2
}

export function isValidTriangle(points: Point2D[]): boolean {
  return points.length === 3 && polygonArea(points) > 1e-12
}
