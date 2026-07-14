import type { Point2D } from '../types/geometry'
import { distance } from './vectorMath'

export function polygonArea(points: Point2D[]): number {
  if (points.length < 3) return 0
  const sum = points.reduce((acc, point, index) => {
    const next = points[(index + 1) % points.length]
    return acc + point.x * next.y - next.x * point.y
  }, 0)
  return Math.abs(sum) / 2
}

export function polygonPerimeter(points: Point2D[]): number {
  if (points.length < 2) return 0
  return points.reduce((acc, point, index) => acc + distance(point, points[(index + 1) % points.length]), 0)
}

export function isValidTriangle(points: Point2D[]): boolean {
  return points.length === 3 && polygonArea(points) > 0.01
}

function orientation(a: Point2D, b: Point2D, c: Point2D) {
  return Math.sign((b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y))
}

function segmentsIntersect(a: Point2D, b: Point2D, c: Point2D, d: Point2D): boolean {
  const o1 = orientation(a, b, c)
  const o2 = orientation(a, b, d)
  const o3 = orientation(c, d, a)
  const o4 = orientation(c, d, b)
  return o1 !== o2 && o3 !== o4
}

export function polygonsMightOverlap(a: Point2D[], b: Point2D[]): boolean {
  for (let i = 0; i < a.length; i += 1) {
    for (let j = 0; j < b.length; j += 1) {
      if (segmentsIntersect(a[i], a[(i + 1) % a.length], b[j], b[(j + 1) % b.length])) return true
    }
  }
  return false
}
