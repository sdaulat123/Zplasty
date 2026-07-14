import type { Point2D, ZPlastyGeometryResult } from '../../types/geometry'

export function ZPlastyDiagram({ geometry, mode = 'before' }: { geometry: ZPlastyGeometryResult; mode?: 'before' | 'after' }) {
  const points = geometry.points
  const allPoints = Object.values(points)
  const minX = Math.min(...allPoints.map((point) => point.x))
  const maxX = Math.max(...allPoints.map((point) => point.x))
  const minY = Math.min(...allPoints.map((point) => point.y))
  const maxY = Math.max(...allPoints.map((point) => point.y))
  const center = { x: (minX + maxX) / 2, y: (minY + maxY) / 2 }
  const scale = Math.min(170 / Math.max(1, maxX - minX), 92 / Math.max(1, maxY - minY))
  const toSvgPoint = (point: Point2D) => ({ x: 120 + (point.x - center.x) * scale, y: 80 + (point.y - center.y) * scale })
  const toSvg = (point: Point2D) => {
    const mapped = toSvgPoint(point)
    return `${mapped.x},${mapped.y}`
  }
  const line = (from: Point2D, to: Point2D, color: string, width: number, key: string) => {
    const a = toSvgPoint(from)
    const b = toSvgPoint(to)
    return <line key={key} stroke={color} strokeWidth={width} x1={a.x} x2={b.x} y1={a.y} y2={b.y} />
  }

  return (
    <svg className="mini-diagram" viewBox="0 0 240 150" role="img" aria-label={mode === 'after' ? 'Ideal planar final common-limb diagram' : 'Entered Z-plasty plan diagram'}>
      <rect width="240" height="150" rx="10" fill="#fff7df" />
      <path d="M20 120 C70 90 100 130 150 90 S205 70 222 28" stroke="#ead7b6" strokeWidth="8" fill="none" />
      {(mode === 'before' ? [geometry.upperFlap, geometry.lowerFlap] : [geometry.transformedUpperFlap, geometry.transformedLowerFlap]).map((polygon, index) => (
        <polygon key={index} points={polygon.map(toSvg).join(' ')} fill={index === 0 ? '#f3a0a8' : '#7ac9c2'} opacity="0.38" />
      ))}
      {mode === 'before' ? (
        <>
          {line(points.centralStart, points.centralEnd, '#8d2130', 4, 'central')}
          {line(points.centralEnd, points.upperEndpoint, '#d95d5d', 3, 'upper')}
          {line(points.centralStart, points.lowerEndpoint, '#d95d5d', 3, 'lower')}
        </>
      ) : (
        <>
          {line(points.centralEnd, points.upperEndpoint, '#d95d5d', 3, 'upper')}
          {line(points.upperEndpoint, points.lowerEndpoint, '#167d78', 5, 'final')}
          {line(points.lowerEndpoint, points.centralStart, '#d95d5d', 3, 'lower')}
        </>
      )}
      <text x="16" y="24" fill="#6f4d27" fontSize="11" fontWeight="700">{mode === 'after' ? 'Ideal planar final' : 'Entered plan'}</text>
    </svg>
  )
}
