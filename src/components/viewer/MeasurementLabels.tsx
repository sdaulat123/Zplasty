import { Html, Line } from '@react-three/drei'
import type { Point2D, ZPlastyGeometryResult } from '../../types/geometry'
import { midpoint } from '../../geometry/vectorMath'
import { useSimulationStore } from '../../store/simulationStore'

export function MeasurementLabels({ geometryResult }: { geometryResult: ZPlastyGeometryResult }) {
  const overlays = useSimulationStore((state) => state.overlays)
  const params = useSimulationStore((state) => state.params)
  const p = geometryResult.points

  const labels: Array<{ show: boolean; label: string; from: Point2D; to: Point2D; at: Point2D; color: string }> = [
    { show: overlays.centralLength, label: `${geometryResult.preoperativeAxisLength.toFixed(1)} mm`, from: p.centralStart, to: p.centralEnd, at: midpoint(p.centralStart, p.centralEnd), color: '#8d2130' },
    { show: overlays.limbLengths, label: `upper ${params.upperLimbLength.toFixed(1)} mm`, from: p.centralEnd, to: p.upperEndpoint, at: midpoint(p.centralEnd, p.upperEndpoint), color: '#d95d5d' },
    { show: overlays.limbLengths, label: `lower ${params.lowerLimbLength.toFixed(1)} mm`, from: p.centralStart, to: p.lowerEndpoint, at: midpoint(p.centralStart, p.lowerEndpoint), color: '#d95d5d' },
    { show: overlays.angles, label: `${params.upperAngleDeg.toFixed(0)} deg`, from: p.centralEnd, to: p.upperEndpoint, at: { x: p.centralEnd.x - 20, y: p.centralEnd.y - 10 }, color: '#258a84' },
    { show: overlays.angles, label: `${params.lowerAngleDeg.toFixed(0)} deg`, from: p.centralStart, to: p.lowerEndpoint, at: { x: p.centralStart.x + 20, y: p.centralStart.y + 10 }, color: '#258a84' },
    { show: overlays.gain, label: `gain ${geometryResult.theoreticalLengthGainPercent.toFixed(0)}%`, from: p.centralStart, to: p.centralEnd, at: { x: 40, y: 42 }, color: '#7464c8' },
  ]

  return (
    <group position={[0, 0, 6]}>
      {labels.filter((item) => item.show).map((item) => (
        <group key={item.label}>
          <Line color={item.color} lineWidth={1.6} points={[[item.from.x, item.from.y, 0], [item.to.x, item.to.y, 0]]} transparent opacity={0.45} />
          <Html center distanceFactor={7} position={[item.at.x, item.at.y, 0]}>
            <span className="rounded-full border border-[#c79b63] bg-[#fff8e8]/95 px-3 py-1 text-xs font-bold text-[#5e3f1e] shadow-md">
              {item.label}
            </span>
          </Html>
        </group>
      ))}
      {overlays.orientation && (
        <>
          <Html center distanceFactor={7} position={[0, 64, 0]}>
            <span className="label-chip">Superior / +Y</span>
          </Html>
          <Html center distanceFactor={7} position={[72, 0, 0]}>
            <span className="label-chip">Lateral / +X</span>
          </Html>
        </>
      )}
    </group>
  )
}
