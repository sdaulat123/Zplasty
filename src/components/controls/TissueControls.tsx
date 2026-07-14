import { useSimulationStore } from '../../store/simulationStore'
import type { SurfaceMode } from '../../types/simulation'

export function TissueControls() {
  const params = useSimulationStore((state) => state.params)
  const setParams = useSimulationStore((state) => state.setParams)
  const surfaceMode = useSimulationStore((state) => state.surfaceMode)
  const setSurfaceMode = useSimulationStore((state) => state.setSurfaceMode)

  return (
    <div className="grid gap-3 rounded-md border border-[#ead7b6] bg-[#fffdf6] p-3">
      <TissueRange label="Illustrative flexibility" value={params.illustrativeFlexibility} onChange={(illustrativeFlexibility) => setParams({ illustrativeFlexibility })} />
      <TissueRange label="Illustrative deformation intensity" value={params.deformationIntensity} min={0.1} max={3} onChange={(deformationIntensity) => setParams({ deformationIntensity })} />
      <TissueRange label="Surface curvature" value={params.surfaceCurvature} onChange={(surfaceCurvature) => setParams({ surfaceCurvature })} />
      <label className="grid gap-1 text-sm text-[#5f472b]">
        Surface model
        <select className="rounded border border-[#d8bd91] bg-white px-2 py-1" value={surfaceMode} onChange={(event) => setSurfaceMode(event.target.value as SurfaceMode)}>
          <option value="flat">Flat teaching plane</option>
          <option value="curved">Gently curved skin patch</option>
          <option value="cylindrical">Cylindrical surface</option>
          <option value="joint">Simplified joint-flexion surface</option>
        </select>
      </label>
    </div>
  )
}

function TissueRange({ label, value, min = 0, max = 1, onChange }: { label: string; value: number; min?: number; max?: number; onChange: (value: number) => void }) {
  return (
    <label className="grid gap-1 text-sm text-[#5f472b]">
      <span className="flex justify-between">
        {label}
        <strong>{value.toFixed(2)}</strong>
      </span>
      <input min={min} max={max} step={0.01} onChange={(event) => onChange(Number(event.target.value))} type="range" value={value} />
    </label>
  )
}
