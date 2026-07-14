import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import type { Point2D, SelectableId, ZPlastyGeometryResult } from '../../types/geometry'
import type { SurfaceMode } from '../../types/simulation'
import { useSimulationStore } from '../../store/simulationStore'
import { conceptualSurfaceHeight, type SurfaceLayout } from '../../geometry/surfaceMath'
import { getPhaseVisualState } from '../../animation/phaseVisualState'

export function FlapMesh({ geometryResult, layout }: { geometryResult: ZPlastyGeometryResult; layout: SurfaceLayout }) {
  const animation = useSimulationStore((state) => state.animation)
  const selectedId = useSimulationStore((state) => state.selectedId)
  const hover = useSimulationStore((state) => state.hover)
  const select = useSimulationStore((state) => state.select)
  const params = useSimulationStore((state) => state.params)
  const surfaceMode = useSimulationStore((state) => state.surfaceMode)
  const visual = getPhaseVisualState(animation)
  if (visual.marking <= 0) return null

  const enteredVisibility = Math.min(1, visual.marking * 0.35 + visual.incision * 0.25 + visual.elevation * 0.4)
  const initialOpacity = 0.62 * enteredVisibility * (1 - visual.transposition)
  const finalOpacity = 0.62 * visual.transposition * (1 - visual.closure * 0.45)
  const elevation = 0.8 + visual.elevation * 9.2

  return (
    <group position={[0, 0, elevation]}>
      {initialOpacity > 0 && (
        <>
          <TriangleFlap id="UpperFlap" color="#d86b75" points={geometryResult.upperFlap} selected={selectedId === 'UpperFlap'} opacity={initialOpacity} hover={hover} select={select} params={params} surfaceMode={surfaceMode} layout={layout} />
          <TriangleFlap id="LowerFlap" color="#2f938d" points={geometryResult.lowerFlap} selected={selectedId === 'LowerFlap'} opacity={initialOpacity} hover={hover} select={select} params={params} surfaceMode={surfaceMode} layout={layout} />
        </>
      )}
      {finalOpacity > 0 && (
        <>
          <TriangleFlap id="UpperFlap" color="#d86b75" points={geometryResult.transformedUpperFlap} selected={selectedId === 'UpperFlap'} opacity={finalOpacity} hover={hover} select={select} params={params} surfaceMode={surfaceMode} layout={layout} />
          <TriangleFlap id="LowerFlap" color="#2f938d" points={geometryResult.transformedLowerFlap} selected={selectedId === 'LowerFlap'} opacity={finalOpacity} hover={hover} select={select} params={params} surfaceMode={surfaceMode} layout={layout} />
        </>
      )}
    </group>
  )
}

function TriangleFlap({
  id,
  points,
  color,
  selected,
  opacity,
  hover,
  select,
  params,
  surfaceMode,
  layout,
}: {
  id: Extract<SelectableId, 'UpperFlap' | 'LowerFlap'>
  points: Point2D[]
  color: string
  selected: boolean
  opacity: number
  hover: (id: SelectableId | null) => void
  select: (id: SelectableId | null) => void
  params: { surfaceCurvature: number }
  surfaceMode: SurfaceMode
  layout: SurfaceLayout
}) {
  const geometry = useMemo(() => {
    const flap = new THREE.BufferGeometry()
    flap.setAttribute('position', new THREE.Float32BufferAttribute(points.flatMap((point) => [
      point.x,
      point.y,
      conceptualSurfaceHeight(point, surfaceMode, params.surfaceCurvature, layout) + 0.8,
    ]), 3))
    flap.setIndex([0, 1, 2])
    flap.computeVertexNormals()
    return flap
  }, [layout, params.surfaceCurvature, points, surfaceMode])
  useEffect(() => () => geometry.dispose(), [geometry])

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
      <meshStandardMaterial color={selected ? '#fff0a3' : color} opacity={selected ? Math.min(1, opacity + 0.2) : opacity} side={THREE.DoubleSide} transparent />
    </mesh>
  )
}
