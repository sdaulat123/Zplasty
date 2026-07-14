import type { Point2D } from '../types/geometry'
import type { SurfaceMode } from '../types/simulation'

export type SurfaceLayout = {
  centerX: number
  centerY: number
  width: number
  height: number
}

/**
 * Height for the optional conceptual surface. This is display geometry only;
 * it is deliberately isolated from every Z-plasty measurement.
 */
export function conceptualSurfaceHeight(
  point: Point2D,
  mode: SurfaceMode,
  curvature: number,
  layout: SurfaceLayout,
) {
  if (mode === 'flat') return 0
  const x = point.x - layout.centerX
  const y = point.y - layout.centerY
  if (mode === 'cylindrical') {
    return Math.sin((x / layout.width) * Math.PI) * curvature * 24
  }
  if (mode === 'joint') {
    return Math.exp(-(x * x) / (layout.width * layout.width * 0.08)) * curvature * 28
  }
  return (
    Math.sin((x / layout.width) * Math.PI) +
    Math.cos((y / layout.height) * Math.PI)
  ) * curvature * 8
}
