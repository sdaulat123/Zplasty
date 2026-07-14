import { useSimulationStore } from '../../store/simulationStore'

export function ViewControls() {
  const cameraMode = useSimulationStore((state) => state.cameraMode)
  const setCameraMode = useSimulationStore((state) => state.setCameraMode)
  const autoRotate = useSimulationStore((state) => state.autoRotate)
  const accessibility = useSimulationStore((state) => state.accessibility)
  const toggleAccessibility = useSimulationStore((state) => state.toggleAccessibility)

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      {(['top', 'perspective', 'oblique', 'side'] as const).map((mode) => (
        <button aria-pressed={cameraMode === mode} className={cameraMode === mode ? 'mini-button-active' : 'mini-button'} key={mode} onClick={() => setCameraMode(mode)} type="button">
          {mode}
        </button>
      ))}
      <button aria-pressed={autoRotate} className={autoRotate ? 'mini-button-active' : 'mini-button'} onClick={() => useSimulationStore.setState({ autoRotate: !autoRotate })} type="button">
        Auto rotate
      </button>
      <button aria-pressed={accessibility.reducedMotion} className={accessibility.reducedMotion ? 'mini-button-active' : 'mini-button'} onClick={() => toggleAccessibility('reducedMotion')} type="button">
        Reduced motion
      </button>
      <button aria-pressed={accessibility.highContrast} className={accessibility.highContrast ? 'mini-button-active' : 'mini-button'} onClick={() => toggleAccessibility('highContrast')} type="button">
        High contrast
      </button>
      <button aria-pressed={accessibility.colorBlindSafe} className={accessibility.colorBlindSafe ? 'mini-button-active' : 'mini-button'} onClick={() => toggleAccessibility('colorBlindSafe')} type="button">
        Color-safe
      </button>
    </div>
  )
}
