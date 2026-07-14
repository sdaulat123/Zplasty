import type { ZPlastyGeometryResult } from '../../types/geometry'
import { phases } from '../../animation/phaseDefinitions'
import { presets } from '../../data/presets'
import { teachingCards } from '../../data/educationalContent'
import { useSimulationStore } from '../../store/simulationStore'
import { formatPercent } from '../../geometry/measurements'

export function BottomTeachingPanel({ geometry }: { geometry: ZPlastyGeometryResult }) {
  const animation = useSimulationStore((state) => state.animation)
  const comparisonIds = useSimulationStore((state) => state.comparisonIds)
  const setPhase = useSimulationStore((state) => state.setPhase)

  return (
    <section className="col-start-2 flex min-h-0 gap-4 overflow-x-auto border-t border-[#d7bd94] bg-[#fff8ea] p-4 max-lg:col-start-auto">
      <div className="w-64 shrink-0">
        <p className="text-sm font-semibold text-[#3d2d1a]">Step timeline</p>
        <div className="mt-3 grid gap-1">
          {phases.map((phase) => (
            <button className={animation.phase === phase.id ? 'timeline-step-active' : 'timeline-step'} key={phase.id} onClick={() => setPhase(phase.id)} type="button">
              {phase.label}
            </button>
          ))}
        </div>
      </div>
      <div className="w-64 shrink-0 rounded-md border border-[#e2cba6] bg-[#fffdf6] p-4">
        <p className="text-sm font-semibold text-[#3d2d1a]">Geometry graph</p>
        <div className="mt-3 h-20 rounded bg-[linear-gradient(90deg,#ead7b6_1px,transparent_1px),linear-gradient(0deg,#ead7b6_1px,transparent_1px)] bg-[length:20px_20px]">
          <div className="h-full rounded bg-gradient-to-r from-[#b55246]/20 via-[#258a84]/20 to-[#7464c8]/20" />
        </div>
        <p className="mt-2 text-xs text-[#6f5b3d]">Gain {formatPercent(geometry.theoreticalLengthGainPercent)} · reorientation {geometry.reorientationAngleDeg.toFixed(0)} deg</p>
      </div>
      <div className="flex shrink-0 gap-3">
        {comparisonIds.map((id) => {
          const preset = presets.find((item) => item.id === id)!
          return (
            <div className="w-52 rounded-md border border-[#e2cba6] bg-[#fffdf6] p-4" key={id}>
              <p className="text-sm font-semibold text-[#3d2d1a]">{preset.name}</p>
              <p className="mt-2 text-xs leading-5 text-[#6f5b3d]">{preset.description}</p>
            </div>
          )
        })}
      </div>
      <div className="flex shrink-0 gap-3">
        {teachingCards.map((card) => (
          <details className="w-56 rounded-md border border-[#e2cba6] bg-[#fffdf6] p-4" key={card.title}>
            <summary className="cursor-pointer text-sm font-semibold text-[#3d2d1a]">{card.title}</summary>
            <p className="mt-2 text-xs leading-5 text-[#6f5b3d]">{card.body}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
