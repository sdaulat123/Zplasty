import { AlertTriangle, BookOpen, MoveRight, Ruler } from 'lucide-react'
import { phases } from '../../animation/phaseDefinitions'
import { createMeasurementSummary } from '../../geometry/measurements'
import type { ZPlastyGeometryResult } from '../../types/geometry'
import { useSimulationStore } from '../../store/simulationStore'
import { ZPlastyDiagram } from '../diagrams/ZPlastyDiagram'
import { EdgeCorrespondenceDiagram } from '../diagrams/EdgeCorrespondenceDiagram'
import { educationalNotice } from '../../data/educationalContent'

export function RightInspector({ geometry }: { geometry: ZPlastyGeometryResult }) {
  const selectedId = useSimulationStore((state) => state.selectedId)
  const animation = useSimulationStore((state) => state.animation)
  const params = useSimulationStore((state) => state.params)
  const phase = phases.find((item) => item.id === animation.phase)!
  const summary = createMeasurementSummary(geometry)

  const title = selectedId ? selectedId.replace(/([A-Z])/g, ' $1').trim() : 'Z-plasty overview'

  return (
    <aside className="row-span-2 min-h-0 overflow-y-auto bg-[#fff8ea] p-5 max-lg:row-span-1">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a6735]">Context inspector</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-normal text-[#3d2d1a]">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-[#6f5b3d]">{selectedId ? selectedText(selectedId) : educationalNotice}</p>

      <div className="mt-5 rounded-md border border-[#e2cba6] bg-[#fffdf6] p-4">
        <ZPlastyDiagram geometry={geometry} />
      </div>

      <InfoCard icon={<BookOpen size={16} />} title={phase.label} body={phase.purpose} />
      <InfoCard icon={<AlertTriangle size={16} />} title="Educational caution" body={phase.caution} tone="amber" />

      <div className="mt-3 rounded-md border border-[#e2cba6] bg-[#fffdf6] p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#3d2d1a]">
          <Ruler size={16} className="text-[#b55246]" />
          Simplified geometric estimate
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <Metric label="Original" value={summary.originalLength} />
          <Metric label="Final" value={summary.finalLength} />
          <Metric label="Gain" value={`${summary.absoluteGain} (${summary.percentGain})`} />
          <Metric label="Reorientation" value={summary.reorientation} />
          <Metric label="Upper angle" value={`${params.upperAngleDeg.toFixed(0)} deg`} />
          <Metric label="Lower angle" value={`${params.lowerAngleDeg.toFixed(0)} deg`} />
        </dl>
        <p className="mt-3 text-xs leading-5 text-[#7b6545]">
          Actual tissue behavior depends on elasticity, thickness, vascularity, scar characteristics, surrounding anatomy, technique, healing, and other factors.
        </p>
      </div>

      <div className="mt-3 rounded-md border border-[#e2cba6] bg-[#fffdf6] p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#3d2d1a]">
          <MoveRight size={16} className="text-[#258a84]" />
          Edge correspondence
        </div>
        <EdgeCorrespondenceDiagram />
      </div>

      {geometry.warnings.length > 0 && (
        <div className="mt-3 rounded-md border border-[#e4b16c] bg-[#fff4cf] p-4">
          <p className="text-sm font-semibold text-[#6f4d27]">Geometric teaching notices</p>
          <ul className="mt-2 space-y-2 text-sm leading-5 text-[#6f4d27]">
            {geometry.warnings.map((warning) => <li key={warning}>{warning}</li>)}
          </ul>
        </div>
      )}
    </aside>
  )
}

function selectedText(id: string) {
  if (id === 'CentralLimb') return 'The central limb represents the original scar or contracture axis and defines the design axis.'
  if (id.includes('Lateral')) return 'A lateral limb defines triangular flap geometry; angle and length affect theoretical movement.'
  if (id.includes('Flap')) return 'The selected triangular flap transposes across the central axis in this idealized geometry model.'
  if (id.includes('Axis')) return 'Axis overlays compare original and final scar orientation and theoretical central-axis change.'
  return 'Inspect this named simulation object and its role in the current teaching phase.'
}

function InfoCard({ icon, title, body, tone = 'plain' }: { icon: React.ReactNode; title: string; body: string; tone?: 'plain' | 'amber' }) {
  return (
    <div className={`mt-3 rounded-md border p-4 ${tone === 'amber' ? 'border-[#e4b16c] bg-[#fff4cf]' : 'border-[#e2cba6] bg-[#fffdf6]'}`}>
      <div className="flex items-center gap-2 text-sm font-semibold text-[#3d2d1a]">
        <span className="text-[#b55246]">{icon}</span>
        {title}
      </div>
      <p className="mt-3 text-sm leading-6 text-[#6f5b3d]">{body}</p>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-[#9a6735]">{label}</dt>
      <dd className="mt-1 font-semibold text-[#3d2d1a]">{value}</dd>
    </div>
  )
}
