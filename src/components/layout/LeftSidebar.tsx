import { BookOpen, ChevronDown, Compass, Layers3, SlidersHorizontal } from 'lucide-react'
import { presets } from '../../data/presets'
import type { ZPlastyGeometryResult } from '../../types/geometry'
import { useSimulationStore } from '../../store/simulationStore'
import { GeometryControls } from '../controls/GeometryControls'
import { TissueControls } from '../controls/TissueControls'
import { LayerControls } from '../controls/LayerControls'

export function LeftSidebar({ geometry }: { geometry: ZPlastyGeometryResult }) {
  const activePresetId = useSimulationStore((state) => state.activePresetId)
  const loadPreset = useSimulationStore((state) => state.loadPreset)
  const inputMode = useSimulationStore((state) => state.inputMode)

  return (
    <aside className="controls-panel" aria-label="Z-plasty inputs">
      <div className="panel-heading">
        <span className="eyebrow">{inputMode === 'learn' ? 'Learning controls' : 'Exact geometry inputs'}</span>
        <h2>Shape the construction</h2>
        <p>Enter measurements or drag the labeled points. Calculations run in this browser; do not enter patient identifiers.</p>
      </div>

      <p className="sidebar-boundary"><strong>Not clinically validated.</strong> This tool measures an ideal planar drawing and does not determine procedural suitability.</p>

      <section className="panel-section">
        <h3><SlidersHorizontal size={17} /> Geometry</h3>
        <GeometryControls />
      </section>

      <details className="panel-disclosure">
        <summary><Compass size={17} /> Reference presets <ChevronDown size={16} /></summary>
        <div className="preset-grid">
          {presets.map((preset) => (
            <button aria-pressed={activePresetId === preset.id} className={activePresetId === preset.id ? 'is-active' : ''} key={preset.id} onClick={() => loadPreset(preset.id)} type="button">
              <strong>{preset.name}</strong>
              <span>{preset.description}</span>
            </button>
          ))}
        </div>
      </details>

      <details className="panel-disclosure">
        <summary><Layers3 size={17} /> Diagram layers <ChevronDown size={16} /></summary>
        <LayerControls />
      </details>

      <details className="panel-disclosure">
        <summary><BookOpen size={17} /> Conceptual tissue display <ChevronDown size={16} /></summary>
        <p className="field-note">These sliders change a schematic surface only. They do not calculate tissue viability, stress, strain, wound tension, or clinical outcomes.</p>
        <TissueControls />
      </details>

      <div className={`validity-chip ${geometry.isValid ? 'valid' : 'invalid'}`} role="status">
        {geometry.isValid ? 'Geometry can be calculated' : 'Fix invalid geometry before interpreting outputs'}
      </div>
    </aside>
  )
}
