import type { DragHandleId, Point2D, ZPlastyGeometryResult } from '../../types/geometry'
import { useSimulationStore } from '../../store/simulationStore'

export function ControlHandles({ geometryResult }: { geometryResult: ZPlastyGeometryResult }) {
  const p = geometryResult.points
  const handles: Array<{ id: DragHandleId; point: Point2D; label: string }> = [
    { id: 'centralStart', point: p.centralStart, label: 'A' },
    { id: 'centralEnd', point: p.centralEnd, label: 'B' },
    { id: 'upperEndpoint', point: p.upperEndpoint, label: 'C' },
    { id: 'lowerEndpoint', point: p.lowerEndpoint, label: 'D' },
  ]
  const dragHandle = useSimulationStore((state) => state.dragHandle)
  const select = useSimulationStore((state) => state.select)
  const hover = useSimulationStore((state) => state.hover)

  return (
    <group position={[0, 0, 8]}>
      {handles.map((handle) => (
        <mesh
          key={handle.id}
          name={handle.id}
          onClick={(event) => {
            event.stopPropagation()
            select(handle.id)
          }}
          onPointerDown={(event) => {
            event.stopPropagation()
            ;(event.target as HTMLElement).setPointerCapture?.(event.pointerId)
          }}
          onPointerMove={(event) => {
            if (event.buttons !== 1) return
            event.stopPropagation()
            dragHandle(handle.id, event.point.x / 0.035, event.point.y / 0.035)
          }}
          onPointerOut={() => hover(null)}
          onPointerOver={(event) => {
            event.stopPropagation()
            hover(handle.id)
          }}
          position={[handle.point.x, handle.point.y, 0]}
        >
          <sphereGeometry args={[3.1, 24, 16]} />
          <meshStandardMaterial color="#fff0a3" emissive="#b55246" emissiveIntensity={0.16} roughness={0.35} />
        </mesh>
      ))}
    </group>
  )
}
