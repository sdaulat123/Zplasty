import { useMemo, useRef } from 'react'
import { Activity, Camera, Download, FileUp, RotateCcw } from 'lucide-react'
import { computeZPlastyGeometry } from '../geometry/zPlastyGeometry'
import { useSimulationStore } from '../store/simulationStore'
import { createExport, validateImport } from '../store/exportImport'
import { presets } from '../data/presets'
import { educationalNotice } from '../data/educationalContent'
import { LeftSidebar } from '../components/layout/LeftSidebar'
import { RightInspector } from '../components/layout/RightInspector'
import { BottomTeachingPanel } from '../components/layout/BottomTeachingPanel'
import { ZPlastyCanvas } from '../components/viewer/ZPlastyCanvas'
import { SimulationOverlay } from '../components/viewer/SimulationOverlay'
import { AnimationControls } from '../components/controls/AnimationControls'
import { ViewControls } from '../components/controls/ViewControls'

export function App() {
  const params = useSimulationStore((state) => state.params)
  const activePresetId = useSimulationStore((state) => state.activePresetId)
  const viewMode = useSimulationStore((state) => state.viewMode)
  const animation = useSimulationStore((state) => state.animation)
  const setParams = useSimulationStore((state) => state.setParams)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const geometry = useMemo(() => computeZPlastyGeometry(params), [params])
  const preset = presets.find((item) => item.id === activePresetId)

  const exportJson = () => {
    const content = createExport({
      presetName: preset?.name ?? 'Custom design',
      params,
      viewMode,
      animation,
      measurements: {
        preoperativeAxisLength: geometry.preoperativeAxisLength,
        postoperativeAxisLength: geometry.postoperativeAxisLength,
        absoluteLengthGain: geometry.absoluteLengthGain,
        theoreticalLengthGainPercent: geometry.theoreticalLengthGainPercent,
        reorientationAngleDeg: geometry.reorientationAngleDeg,
        warnings: geometry.warnings,
      },
    })
    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'zplasty-configuration.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  const importJson = async (file: File | undefined) => {
    if (!file) return
    const parsed = JSON.parse(await file.text())
    if (validateImport(parsed)) setParams(parsed.params)
  }

  return (
    <main className="min-h-screen bg-[#efe1c7] text-[#3d2d1a]">
      <div className="grid h-screen grid-cols-[310px_minmax(0,1fr)_360px] grid-rows-[minmax(0,1fr)_190px] overflow-hidden max-xl:grid-cols-[280px_minmax(0,1fr)_320px] max-lg:h-auto max-lg:grid-cols-1 max-lg:grid-rows-none">
        <LeftSidebar geometry={geometry} />

        <section className="relative flex min-h-0 flex-col border-x border-[#d7bd94] bg-[#f3e4c8] bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.5),transparent_28%),linear-gradient(0deg,rgba(117,83,43,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(117,83,43,0.045)_1px,transparent_1px)] bg-[length:auto,24px_24px,24px_24px]">
          <header className="z-10 flex items-center justify-between border-b border-[#d7bd94] bg-[#fff6e3]/88 px-6 py-4 backdrop-blur">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9a6735]">Interactive reconstructive geometry lab</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-normal text-[#2f2112]">Z-Plasty Surgical Simulation Studio</h1>
              <p className="mt-1 text-sm text-[#76583b]">Interactive reconstructive geometry lab</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="icon-button" onClick={exportJson} title="Export configuration" type="button">
                <Download size={18} />
              </button>
              <button className="icon-button" onClick={() => fileInputRef.current?.click()} title="Import configuration" type="button">
                <FileUp size={18} />
              </button>
              <button className="icon-button" onClick={() => window.dispatchEvent(new CustomEvent('zplasty:screenshot'))} title="Export viewer screenshot" type="button">
                <Camera size={18} />
              </button>
              <button className="icon-button" onClick={() => useSimulationStore.getState().reset()} title="Reset simulation" type="button">
                <RotateCcw size={18} />
              </button>
              <input
                accept="application/json"
                className="hidden"
                onChange={(event) => importJson(event.target.files?.[0])}
                ref={fileInputRef}
                type="file"
              />
            </div>
          </header>

          <div className="relative min-h-[520px] flex-1">
            <ZPlastyCanvas geometry={geometry} />
            <SimulationOverlay geometry={geometry} />
            <div className="pointer-events-none absolute left-6 top-6 z-20 max-w-[330px] rounded-md border border-[#e1c798] bg-[#fff8e8]/82 p-4 shadow-sm backdrop-blur">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#3d2d1a]">
                <Activity size={16} className="text-[#b55246]" />
                Educational geometric simulation only
              </div>
              <p className="mt-2 text-sm leading-6 text-[#6f5b3d]">{educationalNotice}</p>
            </div>
          </div>

          <div className="border-t border-[#d7bd94] bg-[#fff8ea]/92 p-3">
            <AnimationControls />
            <ViewControls />
          </div>
        </section>

        <RightInspector geometry={geometry} />
        <BottomTeachingPanel geometry={geometry} />
      </div>
    </main>
  )
}
