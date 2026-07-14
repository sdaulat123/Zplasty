import { ArrowRight, BookOpen, MoveHorizontal, Triangle } from 'lucide-react'
import type { ZPlastyGeometryResult } from '../../types/geometry'
import { phases } from '../../animation/phaseDefinitions'
import { computeZPlastyGeometry, defaultParameters } from '../../geometry/zPlastyGeometry'
import { teachingCards } from '../../data/educationalContent'
import { useSimulationStore } from '../../store/simulationStore'

const referenceAngles = [30, 45, 60, 75, 90]

export function BottomTeachingPanel({ geometry }: { geometry: ZPlastyGeometryResult }) {
  const animation = useSimulationStore((state) => state.animation)
  const setPhase = useSimulationStore((state) => state.setPhase)
  const setParams = useSimulationStore((state) => state.setParams)
  const setInputMode = useSimulationStore((state) => state.setInputMode)
  const activePhase = phases.find((phase) => phase.id === animation.phase) ?? phases[0]

  return (
    <section className="learning-panel" aria-labelledby="learn-heading">
      <div className="learning-intro">
        <span className="eyebrow">Learn by changing the geometry</span>
        <h2 id="learn-heading">Why the Z changes direction</h2>
        <p>The central tips correspond to the opposite outer endpoints (A→C and B→D). In the ideal planar construction, C–D becomes the final common limb. The diagram is geometric; it does not simulate tissue mechanics.</p>
      </div>

      <div className="angle-comparison" aria-label="Classical symmetric angle comparison">
        {referenceAngles.map((angle) => {
          const result = computeZPlastyGeometry({ ...defaultParameters, upperAngleDeg: angle, lowerAngleDeg: angle })
          const active = Math.abs(geometry.upperAngleDeg - angle) < 0.01 && geometry.calculationModel === 'classical-symmetric'
          return (
            <button
              aria-label={`${angle} degree reference: ${result.theoreticalLengthChangePercent.toFixed(1)} percent theoretical length change and ${result.axisLineAngleDeg.toFixed(1)} degree undirected axis-line angle`}
              aria-pressed={active}
              className={active ? 'angle-card active' : 'angle-card'}
              key={angle}
              onClick={() => {
                setInputMode('learn')
                const length = useSimulationStore.getState().params.centralLength
                setParams({ upperAngleDeg: angle, lowerAngleDeg: angle, upperLimbLength: length, lowerLimbLength: length, symmetryLock: true })
              }}
              type="button"
            >
              <span>{angle}°</span>
              <strong>{result.theoreticalLengthChangePercent.toFixed(1)}%</strong>
              <small>exact length change</small>
              <em>{result.axisLineAngleDeg.toFixed(1)}° line angle</em>
              <i style={{ transform: `rotate(${result.axisLineAngleDeg}deg)` }} />
            </button>
          )
        })}
      </div>

      <div className="phase-learning">
        <div className="phase-nav" aria-label="Teaching sequence">
          {phases.map((phase, index) => (
            <button aria-current={animation.phase === phase.id ? 'step' : undefined} className={animation.phase === phase.id ? 'active' : ''} key={phase.id} onClick={() => setPhase(phase.id)} type="button">
              <span>{index + 1}</span>{phase.label}
            </button>
          ))}
        </div>
        <div className="phase-explanation">
          <BookOpen size={20} />
          <div>
            <h3>{activePhase.label}</h3>
            <p>{activePhase.purpose}</p>
            <span>{activePhase.caution}</span>
          </div>
        </div>
      </div>

      <div className="concept-grid">
        <Concept icon={<Triangle size={18} />} title="Planar geometry" body={teachingCards[1].body} />
        <Concept icon={<ArrowRight size={18} />} title="Scar direction" body="The endpoint line changes orientation relative to the entered central axis. This is a theoretical planar direction, not a guaranteed healed-scar direction." />
        <Concept icon={<MoveHorizontal size={18} />} title="Living tissue differs" body="Skin thickness, mobility, vascularity, scar, contour, technique, and healing can all prevent the mathematical construction from being reproduced." />
      </div>
      <p className="literature-note">
        Geometry basis: <a href="https://doi.org/10.1016/S0007-1226(71)80034-6" rel="noreferrer" target="_blank">Furnas &amp; Fischer (1971)</a>,{' '}
        <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC2772284/" rel="noreferrer" target="_blank">Ellur &amp; Guido (2009)</a>, and the{' '}
        <a href="https://www.jposna.org/~jposna/index.php/jposna/article/view/700/856" rel="noreferrer" target="_blank">JPOSNA geometric review</a>. External links never include entered values.
      </p>
    </section>
  )
}

function Concept({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <article className="concept-card">
      <span>{icon}</span>
      <h3>{title}</h3>
      <p>{body}</p>
    </article>
  )
}
