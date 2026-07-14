import { Ruler, SlidersHorizontal, Layers, Compass, FlaskConical } from 'lucide-react'
import { presets } from '../../data/presets'
import type { ZPlastyGeometryResult } from '../../types/geometry'
import { useSimulationStore } from '../../store/simulationStore'
import { GeometryControls } from '../controls/GeometryControls'
import { TissueControls } from '../controls/TissueControls'
import { LayerControls } from '../controls/LayerControls'

export function LeftSidebar({ geometry }: { geometry: ZPlastyGeometryResult }) {
  const activePresetId = useSimulationStore((state) => state.activePresetId)
  const loadPreset = useSimulationStore((state) => state.loadPreset)
  const viewMode = useSimulationStore((state) => state.viewMode)
  const setViewMode = useSimulationStore((state) => state.setViewMode)

  return (
    <aside className="row-span-2 flex min-h-0 flex-col border-r border-[#dcc29c] bg-[#fff8ea] max-lg:row-span-1">
      <div className="border-b border-[#e2cba6] p-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-[#f3c7bd] text-[#9a332e]">
          <FlaskConical size={22} />
        </div>
        <h2 className="mt-4 text-xl font-semibold tracking-normal text-[#3d2d1a]">Z-Plasty Atlas</h2>
        <p className="mt-2 text-sm leading-6 text-[#6f5b3d]">
          Explore limb angle, limb length, flap transposition, and simplified tissue mechanics.
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        <PanelTitle icon={<Compass size={16} />} label="Design presets" />
        <div className="mt-3 grid gap-2">
          {presets.map((preset) => (
            <button
              className={[
                'rounded-md border p-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#b55246]',
                activePresetId === preset.id ? 'border-[#b55246] bg-[#fff0d0]' : 'border-[#ead7b6] bg-[#fffdf6] hover:bg-[#fff3d2]',
              ].join(' ')}
              key={preset.id}
              onClick={() => loadPreset(preset.id)}
              type="button"
            >
              <span className="block text-sm font-semibold text-[#3d2d1a]">{preset.name}</span>
              <span className="mt-1 block text-xs leading-5 text-[#7b6545]">
                {preset.advanced ? 'Educational demonstration' : preset.variant}
              </span>
            </button>
          ))}
        </div>

        <PanelTitle icon={<Ruler size={16} />} label="Geometry controls" />
        <GeometryControls />
        <PanelTitle icon={<SlidersHorizontal size={16} />} label="Tissue controls" />
        <TissueControls />
        <PanelTitle icon={<Layers size={16} />} label="Layer visibility" />
        <LayerControls />

        <PanelTitle icon={<Compass size={16} />} label="Variant navigation" />
        <div className="mt-3 grid grid-cols-2 gap-2">
          {(['geometry', 'surgical', 'deformation', 'tension', 'comparison', 'variant', 'crossSection'] as const).map((mode) => (
            <button
              className={viewMode === mode ? 'mini-button-active' : 'mini-button'}
              key={mode}
              onClick={() => setViewMode(mode)}
              type="button"
            >
              {mode}
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-md border border-[#e7cfa7] bg-[#fff4cf] p-3 text-sm text-[#6f4d27]">
          Simplified geometric estimate: {geometry.theoreticalLengthGainPercent.toFixed(0)}% gain,{' '}
          {geometry.reorientationAngleDeg.toFixed(0)} deg reorientation.
        </div>
      </div>
    </aside>
  )
}

function PanelTitle({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="mb-2 mt-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#8c6a3d] first:mt-0">
      {icon}
      {label}
    </div>
  )
}
