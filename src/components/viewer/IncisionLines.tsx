import { Line } from '@react-three/drei'
import type { Point2D, SelectableId, ZPlastyGeometryResult } from '../../types/geometry'
import { useSimulationStore } from '../../store/simulationStore'
import { conceptualSurfaceHeight, type SurfaceLayout } from '../../geometry/surfaceMath'

type LimbId = Extract<SelectableId, 'CentralLimb' | 'UpperLateralLimb' | 'LowerLateralLimb' | 'FinalAxis'>

export function IncisionLines({ geometryResult, layout }: { geometryResult: ZPlastyGeometryResult; layout: SurfaceLayout }) {
  const selected = useSimulationStore((state) => state.selectedId)
  const hover = useSimulationStore((state) => state.hover)
  const select = useSimulationStore((state) => state.select)
  const animation = useSimulationStore((state) => state.animation)
  const params = useSimulationStore((state) => state.params)
  const surfaceMode = useSimulationStore((state) => state.surfaceMode)
  const points = geometryResult.points
  const toScenePoint = (point: Point2D): [number, number, number] => [
    point.x,
    point.y,
    conceptualSurfaceHeight(point, surfaceMode, params.surfaceCurvature, layout) + 1.5,
  ]

  if (animation.phase === 'native') {
    return (
      <group>
        <NamedLine id="CentralLimb" selected={selected === 'CentralLimb'} points={[points.centralStart, points.centralEnd]} progress={1} opacity={1} onHover={hover} onSelect={select} toScenePoint={toScenePoint} />
      </group>
    )
  }

  const finalProgress = animation.phase === 'transposition'
    ? animation.phaseProgress
    : ['approximation', 'closure', 'comparison'].includes(animation.phase) ? 1 : 0
  const incisionProgress = animation.phase === 'incision' ? animation.phaseProgress : 1
  const initialOpacity = 1 - finalProgress
  const dashed = animation.phase === 'marking'

  return (
    <group>
      {initialOpacity > 0 && (
        <>
          <NamedLine id="CentralLimb" selected={selected === 'CentralLimb'} points={[points.centralStart, points.centralEnd]} progress={incisionProgress} opacity={initialOpacity} dashed={dashed} onHover={hover} onSelect={select} toScenePoint={toScenePoint} />
          <NamedLine id="UpperLateralLimb" selected={selected === 'UpperLateralLimb'} points={[points.centralEnd, points.upperEndpoint]} progress={incisionProgress} opacity={initialOpacity} dashed={dashed} onHover={hover} onSelect={select} toScenePoint={toScenePoint} />
          <NamedLine id="LowerLateralLimb" selected={selected === 'LowerLateralLimb'} points={[points.centralStart, points.lowerEndpoint]} progress={incisionProgress} opacity={initialOpacity} dashed={dashed} onHover={hover} onSelect={select} toScenePoint={toScenePoint} />
        </>
      )}
      {finalProgress > 0 && (
        <>
          <NamedLine id="UpperLateralLimb" selected={selected === 'UpperLateralLimb'} points={[points.centralEnd, points.upperEndpoint]} progress={1} opacity={finalProgress} onHover={hover} onSelect={select} toScenePoint={toScenePoint} />
          <NamedLine id="FinalAxis" selected={selected === 'FinalAxis'} points={[points.upperEndpoint, points.lowerEndpoint]} progress={1} opacity={finalProgress} onHover={hover} onSelect={select} toScenePoint={toScenePoint} />
          <NamedLine id="LowerLateralLimb" selected={selected === 'LowerLateralLimb'} points={[points.lowerEndpoint, points.centralStart]} progress={1} opacity={finalProgress} onHover={hover} onSelect={select} toScenePoint={toScenePoint} />
        </>
      )}
    </group>
  )
}

function NamedLine({
  id,
  points,
  progress,
  opacity,
  dashed,
  selected,
  onHover,
  onSelect,
  toScenePoint,
}: {
  id: LimbId
  points: Point2D[]
  progress: number
  opacity: number
  dashed?: boolean
  selected: boolean
  onHover: (id: SelectableId | null) => void
  onSelect: (id: SelectableId) => void
  toScenePoint: (point: Point2D) => [number, number, number]
}) {
  const end = {
    x: points[0].x + (points[1].x - points[0].x) * progress,
    y: points[0].y + (points[1].y - points[0].y) * progress,
  }
  const color = id === 'CentralLimb' ? '#8d2130' : id === 'FinalAxis' ? '#167d78' : '#d95d5d'
  return (
    <group
      name={id}
      onClick={(event) => {
        event.stopPropagation()
        onSelect(id)
      }}
      onPointerOut={() => onHover(null)}
      onPointerOver={(event) => {
        event.stopPropagation()
        onHover(id)
      }}
    >
      <Line color={selected ? '#fff0a3' : color} dashed={dashed} lineWidth={selected ? 8 : id === 'FinalAxis' ? 7 : 5} opacity={opacity} points={[toScenePoint(points[0]), toScenePoint(end)]} transparent />
    </group>
  )
}
