import { Line } from '@react-three/drei'
import type { ZPlastyGeometryResult } from '../../types/geometry'
import { useSimulationStore } from '../../store/simulationStore'

export function TensionOverlay({ geometryResult }: { geometryResult: ZPlastyGeometryResult }) {
  const overlays = useSimulationStore((state) => state.overlays)
  const animation = useSimulationStore((state) => state.animation)
  const p = geometryResult.points

  if (!overlays.closureVectors && !overlays.tensionVectors && !overlays.edgeCorrespondence) return null
  const showClosure = ['approximation', 'closure', 'comparison'].includes(animation.phase)

  return (
    <group position={[0, 0, 9]}>
      {overlays.edgeCorrespondence && (
        <>
          <Line color="#7464c8" dashed lineWidth={2} points={[[p.upperEndpoint.x, p.upperEndpoint.y, 0], [p.lowerDestination.x, p.lowerDestination.y, 0]]} />
          <Line color="#d28b30" dashed lineWidth={2} points={[[p.lowerEndpoint.x, p.lowerEndpoint.y, 0], [p.upperDestination.x, p.upperDestination.y, 0]]} />
        </>
      )}
      {showClosure && overlays.closureVectors && (
        <>
          <Line color="#258a84" lineWidth={3} points={[[p.upperDestination.x, p.upperDestination.y, 0], [p.centralStart.x, p.centralStart.y, 0]]} />
          <Line color="#258a84" lineWidth={3} points={[[p.lowerDestination.x, p.lowerDestination.y, 0], [p.centralEnd.x, p.centralEnd.y, 0]]} />
        </>
      )}
      {showClosure && overlays.sutures && Array.from({ length: 7 }).map((_, index) => (
        <mesh key={index} position={[p.centralStart.x + ((p.centralEnd.x - p.centralStart.x) * index) / 6, p.centralStart.y + ((p.centralEnd.y - p.centralStart.y) * index) / 6, 0]}>
          <torusGeometry args={[2, 0.35, 8, 18]} />
          <meshStandardMaterial color="#5a3d2c" roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}
