import { Line } from '@react-three/drei'
import type { ZPlastyGeometryResult } from '../../types/geometry'
import { useSimulationStore } from '../../store/simulationStore'
import { conceptualSurfaceHeight, type SurfaceLayout } from '../../geometry/surfaceMath'

// Retained as a small scene overlay component for compatibility with the 3D viewer.
// It shows point correspondence only; it does not calculate tension or closure force.
export function TensionOverlay({ geometryResult, layout }: { geometryResult: ZPlastyGeometryResult; layout: SurfaceLayout }) {
  const showGuides = useSimulationStore((state) => state.overlays.exchangeGuides)
  const phase = useSimulationStore((state) => state.animation.phase)
  const params = useSimulationStore((state) => state.params)
  const surfaceMode = useSimulationStore((state) => state.surfaceMode)
  const p = geometryResult.points
  const scenePoint = (point: { x: number; y: number }): [number, number, number] => [
    point.x,
    point.y,
    conceptualSurfaceHeight(point, surfaceMode, params.surfaceCurvature, layout) + 12,
  ]

  if (!showGuides || phase !== 'transposition') return null
  return (
    <group>
      <Line color="#7464c8" dashed lineWidth={2} points={[scenePoint(p.centralStart), scenePoint(p.upperEndpoint)]} />
      <Line color="#d28b30" dashed lineWidth={2} points={[scenePoint(p.centralEnd), scenePoint(p.lowerEndpoint)]} />
    </group>
  )
}
