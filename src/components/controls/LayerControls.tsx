import { useSimulationStore } from '../../store/simulationStore'
import type { OverlayKey } from '../../types/simulation'

const overlayLabels: Record<OverlayKey, string> = {
  centralLength: 'Central length',
  limbLengths: 'Limb lengths',
  angles: 'Angles',
  originalAxis: 'Original axis',
  finalAxis: 'Final axis',
  gain: 'Length change',
  exchangeGuides: 'Tip correspondence',
  grid: 'Grid scale',
  heatmap: 'Illustrative color field',
}

export function LayerControls() {
  const overlays = useSimulationStore((state) => state.overlays)
  const toggleOverlay = useSimulationStore((state) => state.toggleOverlay)

  return (
    <div className="grid grid-cols-2 gap-2 rounded-md border border-[#ead7b6] bg-[#fffdf6] p-3">
      {(Object.keys(overlays) as OverlayKey[]).map((key) => (
        <label className="flex items-center gap-2 text-xs text-[#5f472b]" key={key}>
          <input checked={overlays[key]} onChange={() => toggleOverlay(key)} type="checkbox" />
          {overlayLabels[key]}
        </label>
      ))}
    </div>
  )
}
