import { Line } from '@react-three/drei'
import type { Point2D, SelectableId, ZPlastyGeometryResult } from '../../types/geometry'
import { useSimulationStore } from '../../store/simulationStore'
import { conceptualSurfaceHeight, type SurfaceLayout } from '../../geometry/surfaceMath'
import { getPhaseVisualState, stagedLineProgress } from '../../animation/phaseVisualState'

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

  const visual = getPhaseVisualState(animation)
  const markingOpacity = visual.marking * (1 - visual.incision * 0.72)

  return (
    <group>
      {markingOpacity > 0 && (
        <group name="DesignMarkings">
          <NamedLine id="CentralLimb" selected={false} points={[points.centralStart, points.centralEnd]} progress={stagedLineProgress(visual.marking, 0, 3)} opacity={markingOpacity} dashed onHover={hover} onSelect={select} toScenePoint={toScenePoint} />
          <NamedLine id="UpperLateralLimb" selected={false} points={[points.centralEnd, points.upperEndpoint]} progress={stagedLineProgress(visual.marking, 1, 3)} opacity={markingOpacity} dashed onHover={hover} onSelect={select} toScenePoint={toScenePoint} />
          <NamedLine id="LowerLateralLimb" selected={false} points={[points.centralStart, points.lowerEndpoint]} progress={stagedLineProgress(visual.marking, 2, 3)} opacity={markingOpacity} dashed onHover={hover} onSelect={select} toScenePoint={toScenePoint} />
        </group>
      )}
      {visual.incision > 0 && (
        <>
          <NamedLine id="CentralLimb" selected={selected === 'CentralLimb'} points={[points.centralStart, points.centralEnd]} progress={stagedLineProgress(visual.incision, 0, 3)} opacity={1 - visual.transposition} onHover={hover} onSelect={select} toScenePoint={toScenePoint} />
          <NamedLine id="UpperLateralLimb" selected={selected === 'UpperLateralLimb'} points={[points.centralEnd, points.upperEndpoint]} progress={stagedLineProgress(visual.incision, 1, 3)} opacity={1} onHover={hover} onSelect={select} toScenePoint={toScenePoint} />
          <NamedLine id="LowerLateralLimb" selected={selected === 'LowerLateralLimb'} points={[points.centralStart, points.lowerEndpoint]} progress={stagedLineProgress(visual.incision, 2, 3)} opacity={1} onHover={hover} onSelect={select} toScenePoint={toScenePoint} />
        </>
      )}
      {visual.approximation > 0 && (
        <NamedLine id="FinalAxis" selected={selected === 'FinalAxis'} points={[points.upperEndpoint, points.lowerEndpoint]} progress={visual.approximation} opacity={1} onHover={hover} onSelect={select} toScenePoint={toScenePoint} />
      )}
      {visual.closure > 0 && (
        <group name="FinalClosureTopology">
          <NamedLine id="UpperLateralLimb" selected={false} points={[points.centralEnd, points.upperEndpoint]} progress={visual.closure} opacity={visual.closure} emphasis onHover={hover} onSelect={select} toScenePoint={toScenePoint} />
          <NamedLine id="FinalAxis" selected={false} points={[points.upperEndpoint, points.lowerEndpoint]} progress={visual.closure} opacity={visual.closure} emphasis onHover={hover} onSelect={select} toScenePoint={toScenePoint} />
          <NamedLine id="LowerLateralLimb" selected={false} points={[points.lowerEndpoint, points.centralStart]} progress={visual.closure} opacity={visual.closure} emphasis onHover={hover} onSelect={select} toScenePoint={toScenePoint} />
        </group>
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
  emphasis,
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
  emphasis?: boolean
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
      <Line color={selected ? '#fff0a3' : emphasis ? '#365d58' : color} dashed={dashed} lineWidth={selected ? 8 : emphasis ? 8 : id === 'FinalAxis' ? 7 : 5} opacity={opacity} points={[toScenePoint(points[0]), toScenePoint(end)]} transparent />
    </group>
  )
}
