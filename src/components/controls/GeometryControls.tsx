import { useId } from 'react'
import { Lock, RotateCcw, Ruler, UnfoldHorizontal } from 'lucide-react'
import { fromDisplayUnit, toDisplayUnit } from '../../geometry/measurements'
import { clamp } from '../../geometry/vectorMath'
import { useSimulationStore } from '../../store/simulationStore'
import type { LinearUnit } from '../../types/geometry'
import { MAX_LATERAL_ANGLE_DEG, MAX_LIMB_LENGTH_MM, MIN_LATERAL_ANGLE_DEG, MIN_LIMB_LENGTH_MM } from '../../geometry/validation'

export function GeometryControls() {
  const params = useSimulationStore((state) => state.params)
  const setParams = useSimulationStore((state) => state.setParams)
  const inputMode = useSimulationStore((state) => state.inputMode)
  const setInputMode = useSimulationStore((state) => state.setInputMode)
  const unit = useSimulationStore((state) => state.unit)
  const setUnit = useSimulationStore((state) => state.setUnit)
  const reset = useSimulationStore((state) => state.reset)

  const setLength = (key: 'centralLength' | 'upperLimbLength' | 'lowerLimbLength', value: number) => {
    setParams({ [key]: fromDisplayUnit(value, unit) })
  }
  const setLateralLengths = (value: number) => {
    const length = fromDisplayUnit(value, unit)
    setParams({ upperLimbLength: length, lowerLimbLength: length, symmetryLock: true })
  }
  const display = (value: number) => toDisplayUnit(value, unit)
  const max = unit === 'cm' ? MAX_LIMB_LENGTH_MM / 10 : MAX_LIMB_LENGTH_MM
  const min = unit === 'cm' ? MIN_LIMB_LENGTH_MM / 10 : MIN_LIMB_LENGTH_MM
  const step = unit === 'cm' ? 0.1 : 1

  return (
    <div className="control-stack">
      <div className="segmented" aria-label="Input workflow">
        <button aria-pressed={inputMode === 'learn'} className={inputMode === 'learn' ? 'is-active' : ''} onClick={() => setInputMode('learn')} type="button">
          Learn
        </button>
        <button aria-pressed={inputMode === 'plan'} className={inputMode === 'plan' ? 'is-active' : ''} onClick={() => setInputMode('plan')} type="button">
          Exact inputs
        </button>
      </div>

      <div className="control-row compact">
        <span className="control-label"><Ruler size={15} /> Units</span>
        <div className="segmented small" aria-label="Measurement units">
          {(['mm', 'cm'] as LinearUnit[]).map((candidate) => (
            <button aria-pressed={unit === candidate} className={unit === candidate ? 'is-active' : ''} key={candidate} onClick={() => setUnit(candidate)} type="button">
              {candidate}
            </button>
          ))}
        </div>
      </div>

      {inputMode === 'learn' ? (
        <>
          <NumberRange
            label="Central limb"
            max={max}
            min={min}
            onChange={(value) => setLength('centralLength', value)}
            step={step}
            unit={unit}
            value={display(params.centralLength)}
          />
          <NumberRange
            label="Both lateral limbs"
            max={max}
            min={min}
            onChange={setLateralLengths}
            step={step}
            unit={unit}
            value={display(params.upperLimbLength)}
          />
        </>
      ) : (
        <>
          <NumberRange label="Central limb" max={max} min={min} onChange={(value) => setLength('centralLength', value)} step={step} unit={unit} value={display(params.centralLength)} />
          <NumberRange label="Left / upper limb" max={max} min={min} onChange={(value) => setLength('upperLimbLength', value)} step={step} unit={unit} value={display(params.upperLimbLength)} />
          <NumberRange label="Right / lower limb" max={max} min={min} onChange={(value) => setLength('lowerLimbLength', value)} step={step} unit={unit} value={display(params.lowerLimbLength)} />
        </>
      )}

      {inputMode === 'learn' ? (
        <>
          <NumberRange
            label="Symmetric angle"
            max={90}
            min={30}
            onChange={(value) => setParams({ upperAngleDeg: value, lowerAngleDeg: value, symmetryLock: true })}
            step={1}
            unit="°"
            value={params.upperAngleDeg}
          />
          <div className="angle-presets" aria-label="Angle presets">
            {[30, 45, 60, 75, 90].map((angle) => (
              <button key={angle} onClick={() => setParams({ upperAngleDeg: angle, lowerAngleDeg: angle, symmetryLock: true })} type="button">
                {angle}°
              </button>
            ))}
          </div>
          <p className="field-note">Exact geometric references—not procedural recommendations.</p>
        </>
      ) : (
        <>
          <NumberRange label="Left / upper angle" max={MAX_LATERAL_ANGLE_DEG} min={MIN_LATERAL_ANGLE_DEG} onChange={(upperAngleDeg) => setParams({ upperAngleDeg })} step={1} unit="°" value={params.upperAngleDeg} />
          <NumberRange label="Right / lower angle" max={MAX_LATERAL_ANGLE_DEG} min={MIN_LATERAL_ANGLE_DEG} onChange={(lowerAngleDeg) => setParams({ lowerAngleDeg })} step={1} unit="°" value={params.lowerAngleDeg} />
        </>
      )}

      <NumberRange label="Construction rotation" max={360} min={0} onChange={(orientationDeg) => setParams({ orientationDeg })} step={1} unit="°" value={params.orientationDeg} />
      <NumberRange label="Scar / contracture reference axis" max={360} min={0} onChange={(contractureAxisDeg) => setParams({ contractureAxisDeg })} step={1} unit="°" value={params.contractureAxisDeg} />

      {inputMode === 'plan' && (
        <label className="toggle-row">
          <span><Lock size={15} /> Link lateral values</span>
          <input checked={params.symmetryLock} onChange={(event) => setParams({ symmetryLock: event.target.checked })} type="checkbox" />
        </label>
      )}
      <label className="toggle-row">
        <span><UnfoldHorizontal size={15} /> Mirror construction</span>
        <input checked={params.reverseFlaps} onChange={(event) => setParams({ reverseFlaps: event.target.checked })} type="checkbox" />
      </label>
      <button className="secondary-button full" onClick={reset} type="button">
        <RotateCcw size={16} /> Reset classical 60° reference
      </button>
    </div>
  )
}

type NumberRangeProps = {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit: string
  onChange: (value: number) => void
}

function NumberRange({ label, value, min, max, step, unit, onChange }: NumberRangeProps) {
  const helpId = useId()
  const invalid = !Number.isFinite(value) || value < min || value > max
  const handleChange = (raw: string) => {
    const next = Number(raw)
    if (Number.isFinite(next)) onChange(next)
  }
  return (
    <div className="number-range">
      <label>
        <span>{label}</span>
        <span className="number-input-wrap">
          <input
            aria-describedby={helpId}
            aria-invalid={invalid}
            aria-label={label}
            max={max}
            min={min}
            onChange={(event) => handleChange(event.target.value)}
            step={step}
            type="number"
            value={Number(value.toFixed(step < 1 ? 2 : 1))}
          />
          <span>{unit}</span>
        </span>
      </label>
      <span className="sr-only" id={helpId}>Allowed range: {min} to {max} {unit}.</span>
      <input aria-label={`${label} slider`} max={max} min={min} onChange={(event) => handleChange(event.target.value)} step={step} type="range" value={clamp(value, min, max)} />
    </div>
  )
}
