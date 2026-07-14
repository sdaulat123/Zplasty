import { Line } from '@react-three/drei'
import type { Point2D, ZPlastyGeometryResult } from '../../types/geometry'
import { useSimulationStore } from '../../store/simulationStore'

type LimbId = 'CentralLimb' | 'UpperLateralLimb' | 'LowerLateralLimb'

export function IncisionLines({ geometryResult }: { geometryResult: ZPlastyGeometryResult }) {
  const selected = useSimulationStore((state) => state.selectedId)
  const hover = useSimulationStore((state) => state.hover)
  const select = useSimulationStore((state) => state.select)
  const animation = useSimulationStore((state) => state.animation)
  const progress = animation.phase === 'incision' ? animation.phaseProgress : ['elevation', 'transposition', 'approximation', 'closure', 'comparison'].includes(animation.phase) ? 1 : 0.8
  const points = geometryResult.points

  return (
    <group position={[0, 0, 2.2]}>
      <NamedLine id="CentralLimb" selected={selected === 'CentralLimb'} points={[points.centralStart, points.centralEnd]} progress={progress} onHover={hover} onSelect={select} />
      <NamedLine id="UpperLateralLimb" selected={selected === 'UpperLateralLimb'} points={[points.centralEnd, points.upperEndpoint]} progress={progress} onHover={hover} onSelect={select} />
      <NamedLine id="LowerLateralLimb" selected={selected === 'LowerLateralLimb'} points={[points.centralStart, points.lowerEndpoint]} progress={progress} onHover={hover} onSelect={select} />
    </group>
  )
}

function NamedLine({
  id,
  points,
  progress,
  selected,
  onHover,
  onSelect,
}: {
  id: LimbId
  points: Point2D[]
  progress: number
  selected: boolean
  onHover: (id: LimbId | null) => void
  onSelect: (id: LimbId) => void
}) {
  const end = {
    x: points[0].x + (points[1].x - points[0].x) * progress,
    y: points[0].y + (points[1].y - points[0].y) * progress,
  }
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
      <Line color={selected ? '#fff0a3' : id === 'CentralLimb' ? '#8d2130' : '#d95d5d'} lineWidth={selected ? 8 : 5} points={[[points[0].x, points[0].y, 0], [end.x, end.y, 0]]} />
    </group>
  )
}
