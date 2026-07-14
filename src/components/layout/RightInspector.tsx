import { AlertTriangle, ArrowUpRight, CheckCircle2, Info, Printer, ShieldAlert } from 'lucide-react'
import { createMeasurementSummary, formatLength } from '../../geometry/measurements'
import type { ZPlastyGeometryResult } from '../../types/geometry'
import { useSimulationStore } from '../../store/simulationStore'
import { ZPlastyDiagram } from '../diagrams/ZPlastyDiagram'

export function RightInspector({ geometry }: { geometry: ZPlastyGeometryResult }) {
  const params = useSimulationStore((state) => state.params)
  const unit = useSimulationStore((state) => state.unit)
  const summary = createMeasurementSummary(geometry, unit)
  const notices = geometry.issues.filter((issue) => issue.severity === 'notice')
  const errors = geometry.issues.filter((issue) => issue.severity === 'error')
  const withheld = '—'

  return (
    <aside className="results-panel" aria-label="Calculated outputs">
      <div className="panel-heading results-heading">
        <span className="eyebrow">Transparent calculations</span>
        <h2>Theoretical planar geometry</h2>
        <p>{geometry.calculationModel === 'classical-symmetric' ? 'Classical three-equal-limb construction' : 'Coordinate measurements of the entered drawing only'}</p>
      </div>

      {(errors.length > 0 || notices.length > 0) && (
        <div className={errors.length > 0 ? 'issue-box error' : 'issue-box'} role={errors.length > 0 ? 'alert' : 'status'}>
          <div className="issue-title">
            {errors.length > 0 ? <AlertTriangle size={17} /> : <Info size={17} />}
            {errors.length > 0 ? 'Input needs attention' : 'Interpretation notices'}
          </div>
          <ul>
            {[...errors, ...notices].map((issue) => <li key={issue.code}>{issue.message}</li>)}
          </ul>
        </div>
      )}

      <div className="result-hero">
        <div>
          <span>Theoretical length change</span>
          <strong>{summary?.percentChange ?? withheld}</strong>
          <small>{summary ? `${summary.theoreticalChange} in the ideal planar drawing` : 'Correct the inputs to calculate'}</small>
        </div>
        {summary ? <ZPlastyDiagram geometry={geometry} mode="after" /> : <div className="withheld-diagram">No calculated diagram</div>}
      </div>

      <div className="metrics-grid">
        <ExplainedMetric label="Entered central limb" value={summary?.originalLength ?? withheld} explanation="The entered distance from A to B. It is the original reference axis in this planar construction." />
        <ExplainedMetric label="Outer-endpoint span" value={summary?.finalLength ?? withheld} explanation={geometry.calculationModel === 'classical-symmetric' ? 'The C–D distance that becomes the ideal final common limb in the classical planar construction. Living tissue may not reproduce it.' : 'The straight-line C–D distance in the entered drawing. For arbitrary inputs, this is not a predicted postoperative length.'} />
        <ExplainedMetric label="Undirected axis-line angle" value={summary?.axisLineAngle ?? withheld} explanation="The smaller angle between the original A–B line and the C–D line. Because both are treated as undirected lines, this convention can differ from published directed-rotation tables." />
        <ExplainedMetric label="Construction footprint" value={summary?.totalSpan ?? withheld} explanation="The greatest straight-line distance among A, B, C, and D. It describes the drawing footprint only." />
        <ExplainedMetric label="Perpendicular C–D component" value={summary?.transverseComponent ?? withheld} explanation="The component of the C–D endpoint diagonal perpendicular to A–B. It is not tissue movement, shortening, or wound tension." />
        <ExplainedMetric label="Reference-axis offset" value={summary?.axisReferenceOffset ?? withheld} explanation="The smaller angle between the A–B construction axis and the optional scar or contracture reference axis." />
      </div>

      <div className="symmetry-status">
        {geometry.calculationModel === 'classical-symmetric' ? <CheckCircle2 size={17} /> : <ArrowUpRight size={17} />}
        <div>
          <strong>{geometry.calculationModel === 'classical-symmetric' ? 'Classical symmetric reference case' : 'General entered-planar case'}</strong>
          <span>{geometry.isValid ? `Left ${formatLength(params.upperLimbLength, unit)} at ${params.upperAngleDeg.toFixed(0)}° · Right ${formatLength(params.lowerLimbLength, unit)} at ${params.lowerAngleDeg.toFixed(0)}°` : 'Calculated values are withheld until every input is valid.'}</span>
        </div>
      </div>

      <button className="primary-button full print-trigger" disabled={!geometry.isValid} onClick={() => window.print()} type="button">
        <Printer size={17} /> Print geometry summary
      </button>

      <div className="boundary-card">
        <ShieldAlert size={18} />
        <div>
          <strong>Clinical-use boundary</strong>
          <p>This tool does not evaluate perfusion, vascular anatomy, tissue quality, wound tension, infection, prior radiation, scar biology, comorbidities, or procedural suitability. It does not replace surgeon judgment or institutional protocols.</p>
        </div>
      </div>
    </aside>
  )
}

function ExplainedMetric({ label, value, explanation }: { label: string; value: string; explanation: string }) {
  return (
    <details className="metric-card">
      <summary>
        <span>{label}</span>
        <strong>{value}</strong>
      </summary>
      <p>{explanation}</p>
    </details>
  )
}
