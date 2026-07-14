import { lazy, Suspense, useMemo, useRef, useState } from 'react'
import { Camera, ChevronDown, Download, FileUp, FlaskConical, Printer, RotateCcw, ShieldCheck } from 'lucide-react'
import { computeZPlastyGeometry } from '../geometry/zPlastyGeometry'
import { createMeasurementSummary } from '../geometry/measurements'
import { useAnimationClock } from '../animation/useAnimationClock'
import { useSimulationStore } from '../store/simulationStore'
import { createExport, parseImport } from '../store/exportImport'
import { presets } from '../data/presets'
import { LeftSidebar } from '../components/layout/LeftSidebar'
import { RightInspector } from '../components/layout/RightInspector'
import { BottomTeachingPanel } from '../components/layout/BottomTeachingPanel'
import { SimulationOverlay } from '../components/viewer/SimulationOverlay'
import { AnimationControls } from '../components/controls/AnimationControls'
import { ViewControls } from '../components/controls/ViewControls'
import { ConceptualViewBoundary } from '../components/viewer/ConceptualViewBoundary'

const ZPlastyCanvas = lazy(() => import('../components/viewer/ZPlastyCanvas').then((module) => ({ default: module.ZPlastyCanvas })))
export const APP_VERSION = '0.1.0'

export function App() {
  useAnimationClock()
  const params = useSimulationStore((state) => state.params)
  const activePresetId = useSimulationStore((state) => state.activePresetId)
  const unit = useSimulationStore((state) => state.unit)
  const inputMode = useSimulationStore((state) => state.inputMode)
  const highContrast = useSimulationStore((state) => state.accessibility.highContrast)
  const reset = useSimulationStore((state) => state.reset)
  const [importMessage, setImportMessage] = useState('')
  const [conceptOpen, setConceptOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const geometry = useMemo(() => computeZPlastyGeometry(params), [params])
  const preset = presets.find((item) => item.id === activePresetId)

  const exportJson = () => {
    try {
      const state = useSimulationStore.getState()
      const content = createExport({
        presetName: preset?.name ?? 'Custom drawing',
        params,
        unit,
        inputMode,
        animation: state.animation,
        geometry,
      })
      const link = document.createElement('a')
      link.href = `data:application/json;charset=utf-8,${encodeURIComponent(content)}`
      link.download = 'zplasty-planar-geometry.json'
      document.body.appendChild(link)
      link.click()
      link.remove()
      setImportMessage('Configuration exported locally.')
    } catch (error) {
      setImportMessage(error instanceof Error ? error.message : 'The configuration could not be exported.')
    }
  }

  const importJson = async (file: File | undefined) => {
    if (!file) return
    try {
      const imported = parseImport(JSON.parse(await file.text()) as unknown)
      useSimulationStore.setState({
        params: imported.params,
        unit: imported.unit,
        inputMode: imported.inputMode,
        activePresetId: 'custom',
        animation: { ...imported.animation, isPlaying: false },
        selectedId: null,
        hoveredId: null,
      })
      setImportMessage('Configuration imported and calculations recomputed locally.')
    } catch (error) {
      setImportMessage(error instanceof Error ? error.message : 'The configuration could not be imported.')
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <main className={`app-shell${highContrast ? ' high-contrast' : ''}`}>
      <header className="app-header">
        <div className="brand-mark" aria-hidden="true"><FlaskConical size={22} /></div>
        <div className="brand-copy">
          <span className="eyebrow">Interactive reconstructive geometry</span>
          <h1>Z-Plasty Atlas</h1>
          <p>Planar learning and transparent endpoint calculations</p>
        </div>
        <div className="safety-badge">
          <ShieldCheck size={17} />
          <span><strong>Theoretical outputs</strong>Not clinically validated</span>
        </div>
        <div className="header-actions">
          <button aria-label="Export local configuration" className="icon-button" disabled={!geometry.isValid} onClick={exportJson} title={geometry.isValid ? 'Export local configuration' : 'Correct invalid inputs before export'} type="button"><Download size={18} /></button>
          <button aria-label="Import local configuration" className="icon-button" onClick={() => fileInputRef.current?.click()} title="Import local configuration" type="button"><FileUp size={18} /></button>
          <button aria-label="Print geometry summary" className="icon-button" disabled={!geometry.isValid} onClick={() => window.print()} title={geometry.isValid ? 'Print geometry summary' : 'Correct invalid inputs before print'} type="button"><Printer size={18} /></button>
          <button aria-label="Reset construction" className="icon-button" onClick={reset} title="Reset construction" type="button"><RotateCcw size={18} /></button>
          <input accept="application/json" aria-label="Choose a Z-Plasty Atlas configuration file" className="sr-only" onChange={(event) => importJson(event.target.files?.[0])} ref={fileInputRef} tabIndex={-1} type="file" />
        </div>
      </header>

      <p className="mobile-safety-note"><strong>Not clinically validated.</strong> Do not enter patient identifiers.</p>
      {importMessage && <div className="global-error" role="status">{importMessage}</div>}

      <div className="workbench">
        <section className="workspace-panel" aria-labelledby="workspace-heading">
          <div className="workspace-heading">
            <div>
              <span className="eyebrow">Interactive workspace</span>
              <h2 id="workspace-heading">Drag points or enter exact values</h2>
            </div>
            <div className="privacy-note">Inputs stay in this browser · do not enter identifiers</div>
          </div>
          <SimulationOverlay geometry={geometry} />
          <div className="animation-dock">
            <AnimationControls />
          </div>

          <details className="concept-view" onToggle={(event) => setConceptOpen(event.currentTarget.open)}>
            <summary><Camera size={17} /> Open conceptual 3D teaching view <ChevronDown size={16} /></summary>
            {conceptOpen && (
              <>
                <div className="concept-canvas">
                  <ConceptualViewBoundary>
                    <Suspense fallback={<div className="concept-loading" role="status">Loading the local 3D module…</div>}>
                      <ZPlastyCanvas geometry={geometry} />
                    </Suspense>
                  </ConceptualViewBoundary>
                  <button className="canvas-export" onClick={() => window.dispatchEvent(new CustomEvent('zplasty:screenshot'))} type="button"><Camera size={15} /> Save local image</button>
                </div>
                <ViewControls />
              </>
            )}
            <p>This stylized surface is educational. Its deformation and colors are illustrative—not biomechanical calculations.</p>
          </details>
        </section>

        <LeftSidebar geometry={geometry} />
        <RightInspector geometry={geometry} />
        <BottomTeachingPanel geometry={geometry} />
      </div>

      <PrintSummary geometry={geometry} presetName={preset?.name ?? 'Custom construction'} unit={unit} />

      <footer className="app-footer">
        <strong>Educational planar geometry only.</strong>
        <span>Outputs are theoretical and do not replace surgeon judgment, patient assessment, or institutional protocols.</span>
        <span>Version {APP_VERSION}</span>
      </footer>
    </main>
  )
}

function PrintSummary({ geometry, presetName, unit }: { geometry: ReturnType<typeof computeZPlastyGeometry>; presetName: string; unit: 'mm' | 'cm' }) {
  const summary = createMeasurementSummary(geometry, unit)
  const timestamp = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date())
  return (
    <section className="print-summary">
      <h1>Z-Plasty Atlas — Theoretical Planar Geometry</h1>
      <p>{presetName} · generated {timestamp} · version {APP_VERSION}</p>
      {summary ? (
        <dl>
          <div><dt>Entered central limb</dt><dd>{summary.originalLength}</dd></div>
          <div><dt>Outer-endpoint span</dt><dd>{summary.finalLength}</dd></div>
          <div><dt>Theoretical planar length change</dt><dd>{summary.theoreticalChange} ({summary.percentChange})</dd></div>
          <div><dt>Undirected axis-line angle</dt><dd>{summary.axisLineAngle}</dd></div>
          <div><dt>Construction footprint</dt><dd>{summary.totalSpan}</dd></div>
          <div><dt>Calculation model</dt><dd>{geometry.calculationModel.replace('-', ' ')}</dd></div>
        </dl>
      ) : (
        <p><strong>Calculations withheld:</strong> the entered geometry contains invalid values.</p>
      )}
      <h2>Assumptions</h2>
      <p>Two-dimensional straight-line construction. The final diagram uses schematic reciprocal tip correspondence (A→C and B→D); it is not a rigid-body or tissue-deformation simulation. Calculations do not model tissue mechanics, vascularity, perfusion, tension, contour, technique, healing, or procedural suitability.</p>
      {geometry.issues.length > 0 && <><h2>Geometry issues and notices</h2><ul>{geometry.issues.map((issue) => <li key={issue.code}>{issue.message}</li>)}</ul></>}
      <p className="print-disclaimer">Not clinically validated. This summary does not replace surgeon judgment, patient-specific assessment, or institutional protocols. It contains no patient identifiers.</p>
    </section>
  )
}
