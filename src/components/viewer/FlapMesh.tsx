import { useMemo } from 'react'
import * as THREE from 'three'
import type { Point2D, SelectableId, ZPlastyGeometryResult } from '../../types/geometry'
import { useSimulationStore } from '../../store/simulationStore'
import { activeFlaps } from '../../animation/flapTransforms'

export function FlapMesh({ geometryResult }: { geometryResult: ZPlastyGeometryResult }) {
  const animation = useSimulationStore((state) => state.animation)
  const selectedId = useSimulationStore((state) => state.selectedId)
  const hover = useSimulationStore((state) => state.hover)
  const select = useSimulationStore((state) => state.select)
  const transpositionProgress = animation.phase === 'transposition' ? animation.phaseProgress : ['approximation', 'closure', 'comparison'].includes(animation.phase) ? 1 : 0
  const elevation = animation.phase === 'elevation' ? animation.phaseProgress * 10 : ['transposition', 'approximation'].includes(animation.phase) ? 10 : animation.phase === 'closure' || animation.phase === 'comparison' ? 1.2 : 0.8
  const flaps = activeFlaps(geometryResult, transpositionProgress)

  return (
    <group position={[0, 0, elevation]}>
      <TriangleFlap id="UpperFlap" color="#f3a0a8" points={flaps.upper} selected={selectedId === 'UpperFlap'} hover={hover} select={select} />
      <TriangleFlap id="LowerFlap" color="#7ac9c2" points={flaps.lower} selected={selectedId === 'LowerFlap'} hover={hover} select={select} />
      {animation.phase === 'transposition' && (
        <group position={[0, 0, -1.4]}>
          <TriangleFlap id="UpperFlap" color="#f3a0a8" points={geometryResult.upperFlap} ghost selected={false} hover={hover} select={select} />
          <TriangleFlap id="LowerFlap" color="#7ac9c2" points={geometryResult.lowerFlap} ghost selected={false} hover={hover} select={select} />
        </group>
      )}
    </group>
  )
}

function TriangleFlap({
  id,
  points,
  color,
  selected,
  ghost,
  hover,
  select,
}: {
  id: Extract<SelectableId, 'UpperFlap' | 'LowerFlap'>
  points: Point2D[]
  color: string
  selected: boolean
  ghost?: boolean
  hover: (id: SelectableId | null) => void
  select: (id: SelectableId | null) => void
}) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape(points.map((point) => new THREE.Vector2(point.x, point.y)))
    return new THREE.ShapeGeometry(shape)
  }, [points])

  return (
    <mesh
      geometry={geometry}
      name={id}
      onClick={(event) => {
        event.stopPropagation()
        select(id)
      }}
      onPointerOut={() => hover(null)}
      onPointerOver={(event) => {
        event.stopPropagation()
        hover(id)
      }}
      renderOrder={2}
    >
      <meshStandardMaterial color={selected ? '#fff0a3' : color} opacity={ghost ? 0.16 : selected ? 0.88 : 0.62} side={THREE.DoubleSide} transparent />
    </mesh>
  )
}
