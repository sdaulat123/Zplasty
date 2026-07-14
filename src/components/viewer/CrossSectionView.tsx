import type { ZPlastyGeometryResult } from '../../types/geometry'
import { useSimulationStore } from '../../store/simulationStore'

export function CrossSectionView({ geometryResult: _geometryResult }: { geometryResult: ZPlastyGeometryResult }) {
  const viewMode = useSimulationStore((state) => state.viewMode)
  const phase = useSimulationStore((state) => state.animation.phase)
  if (viewMode !== 'crossSection') return null
  const elevation = phase === 'elevation' || phase === 'transposition' ? 0.12 : 0.03

  return (
    <group position={[0, -1.15, 1.55]}>
      <mesh name="CrossSectionSkin">
        <boxGeometry args={[2.6, 0.12, 0.52]} />
        <meshStandardMaterial color="#f2b6a8" />
      </mesh>
      <mesh position={[0, -0.09, 0]} name="CrossSectionDermis">
        <boxGeometry args={[2.6, 0.12, 0.52]} />
        <meshStandardMaterial color="#d98e7d" />
      </mesh>
      <mesh position={[-0.38, elevation, 0]} name="CrossSectionFlap">
        <boxGeometry args={[0.82, 0.08, 0.44]} />
        <meshStandardMaterial color="#f3a0a8" />
      </mesh>
      <mesh position={[0.38, elevation, 0]} name="CrossSectionFlapLower">
        <boxGeometry args={[0.82, 0.08, 0.44]} />
        <meshStandardMaterial color="#7ac9c2" />
      </mesh>
      <mesh position={[0, 0.18, 0]}>
        <sphereGeometry args={[0.035, 16, 10]} />
        <meshStandardMaterial color="#8d2130" />
      </mesh>
    </group>
  )
}
