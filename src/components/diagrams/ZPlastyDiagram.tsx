import type { ZPlastyGeometryResult } from '../../types/geometry'

export function ZPlastyDiagram({ geometry }: { geometry: ZPlastyGeometryResult }) {
  const points = geometry.points
  const toSvg = (x: number, y: number) => `${120 + x * 1.2},${80 - y * 1.2}`
  return (
    <svg className="h-36 w-full" viewBox="0 0 240 150" role="img" aria-label="Z-plasty plan diagram">
      <rect width="240" height="150" rx="10" fill="#fff7df" />
      <path d="M20 120 C70 90 100 130 150 90 S205 70 222 28" stroke="#ead7b6" strokeWidth="8" fill="none" />
      <polygon points={[points.centralEnd, points.centralStart, points.lowerEndpoint].map((p) => toSvg(p.x, p.y)).join(' ')} fill="#f3a0a8" opacity="0.38" />
      <polygon points={[points.centralStart, points.centralEnd, points.upperEndpoint].map((p) => toSvg(p.x, p.y)).join(' ')} fill="#7ac9c2" opacity="0.38" />
      <line x1={120 + points.centralStart.x * 1.2} y1={80 - points.centralStart.y * 1.2} x2={120 + points.centralEnd.x * 1.2} y2={80 - points.centralEnd.y * 1.2} stroke="#8d2130" strokeWidth="4" />
      <line x1={120 + points.centralEnd.x * 1.2} y1={80 - points.centralEnd.y * 1.2} x2={120 + points.upperEndpoint.x * 1.2} y2={80 - points.upperEndpoint.y * 1.2} stroke="#d95d5d" strokeWidth="3" />
      <line x1={120 + points.centralStart.x * 1.2} y1={80 - points.centralStart.y * 1.2} x2={120 + points.lowerEndpoint.x * 1.2} y2={80 - points.lowerEndpoint.y * 1.2} stroke="#d95d5d" strokeWidth="3" />
      <text x="16" y="24" fill="#6f4d27" fontSize="11" fontWeight="700">Plan view</text>
    </svg>
  )
}
