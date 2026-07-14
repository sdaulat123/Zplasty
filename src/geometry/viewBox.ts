import type { Point2D } from '../types/geometry'

export type ViewBox = { x: number; y: number; width: number; height: number }

export function fitViewBox(points: Point2D[]): ViewBox {
  const minX = Math.min(...points.map((point) => point.x))
  const maxX = Math.max(...points.map((point) => point.x))
  const minY = Math.min(...points.map((point) => point.y))
  const maxY = Math.max(...points.map((point) => point.y))
  const centerX = (minX + maxX) / 2
  const centerY = (minY + maxY) / 2
  const padding = Math.max(18, Math.max(maxX - minX, maxY - minY) * 0.12)
  let width = Math.max(220, maxX - minX + padding * 2)
  let height = Math.max(160, maxY - minY + padding * 2)
  const targetAspect = 220 / 160
  if (width / height > targetAspect) height = width / targetAspect
  else width = height * targetAspect
  return { x: centerX - width / 2, y: centerY - height / 2, width, height }
}
