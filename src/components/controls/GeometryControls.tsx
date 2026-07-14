import { useSimulationStore } from '../../store/simulationStore'

export function GeometryControls() {
  const params = useSimulationStore((state) => state.params)
  const setParams = useSimulationStore((state) => state.setParams)

  return (
    <div className="grid gap-3 rounded-md border border-[#ead7b6] bg-[#fffdf6] p-3">
      <Range label="Central limb" value={params.centralLength} min={24} max={90} unit="mm" onChange={(centralLength) => setParams({ centralLength })} />
      <Range label="Upper limb" value={params.upperLimbLength} min={18} max={90} unit="mm" onChange={(upperLimbLength) => setParams({ upperLimbLength })} />
      <Range label="Lower limb" value={params.lowerLimbLength} min={18} max={90} unit="mm" onChange={(lowerLimbLength) => setParams({ lowerLimbLength })} />
      <Range label="Upper angle" value={params.upperAngleDeg} min={25} max={80} unit="deg" onChange={(upperAngleDeg) => setParams({ upperAngleDeg })} />
      <Range label="Lower angle" value={params.lowerAngleDeg} min={25} max={80} unit="deg" onChange={(lowerAngleDeg) => setParams({ lowerAngleDeg })} />
      <Range label="Orientation" value={params.orientationDeg} min={0} max={180} unit="deg" onChange={(orientationDeg) => setParams({ orientationDeg })} />
      <label className="flex items-center justify-between gap-2 text-sm text-[#5f472b]">
        Symmetry lock
        <input checked={params.symmetryLock} onChange={(event) => setParams({ symmetryLock: event.target.checked })} type="checkbox" />
      </label>
      <label className="grid gap-1 text-sm text-[#5f472b]">
        Snap mode
        <select className="rounded border border-[#d8bd91] bg-white px-2 py-1" value={params.snapMode} onChange={(event) => setParams({ snapMode: event.target.value as never })}>
          <option value="none">No snapping</option>
          <option value="angle5">5 deg angle snapping</option>
          <option value="angle15">15 deg angle snapping</option>
          <option value="equalLimbs">Equal-limb snapping</option>
          <option value="symmetry">Symmetry lock</option>
          <option value="grid">Grid snapping</option>
        </select>
      </label>
    </div>
  )
}

function Range({ label, value, min, max, unit, onChange }: { label: string; value: number; min: number; max: number; unit: string; onChange: (value: number) => void }) {
  return (
    <label className="grid gap-1 text-sm text-[#5f472b]">
      <span className="flex justify-between">
        {label}
        <strong>{value.toFixed(0)} {unit}</strong>
      </span>
      <input min={min} max={max} onChange={(event) => onChange(Number(event.target.value))} type="range" value={value} />
    </label>
  )
}
