import { create } from 'zustand'
import type { AccessibilityState, AnimationState, CameraMode, OverlayKey, SurfaceMode, ViewMode } from '../types/simulation'
import type { DragHandleId, SelectableId, ZPlastyParameters } from '../types/geometry'
import { defaultParameters } from '../geometry/zPlastyGeometry'
import { phaseOrder } from '../animation/phaseDefinitions'
import { presets } from '../data/presets'

type SimulationStore = {
  params: ZPlastyParameters
  animation: AnimationState
  selectedId: SelectableId | null
  hoveredId: SelectableId | null
  activePresetId: string
  surfaceMode: SurfaceMode
  cameraMode: CameraMode
  viewMode: ViewMode
  comparisonIds: string[]
  serialUnits: number
  overlays: Record<OverlayKey, boolean>
  autoRotate: boolean
  ghostOverlay: boolean
  teachingMode: boolean
  accessibility: AccessibilityState
  setParams: (params: Partial<ZPlastyParameters>) => void
  loadPreset: (id: string) => void
  setPhase: (phase: AnimationState['phase']) => void
  setPhaseProgress: (progress: number) => void
  setPlaying: (isPlaying: boolean) => void
  setPlaybackSpeed: (speed: number) => void
  setLoopMode: (mode: AnimationState['loopMode']) => void
  nextPhase: () => void
  previousPhase: () => void
  select: (id: SelectableId | null) => void
  hover: (id: SelectableId | null) => void
  dragHandle: (id: DragHandleId, x: number, y: number) => void
  toggleOverlay: (key: OverlayKey) => void
  setSurfaceMode: (mode: SurfaceMode) => void
  setCameraMode: (mode: CameraMode) => void
  setViewMode: (mode: ViewMode) => void
  toggleAccessibility: (key: keyof AccessibilityState) => void
  reset: () => void
}

const defaultOverlays: Record<OverlayKey, boolean> = {
  centralLength: true,
  limbLengths: true,
  angles: true,
  originalAxis: true,
  finalAxis: true,
  gain: true,
  flapDisplacement: false,
  closureVectors: true,
  tensionVectors: false,
  grid: true,
  surfaceNormal: false,
  edgeCorrespondence: true,
  sutures: true,
  orientation: true,
  heatmap: false,
}

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  params: defaultParameters,
  animation: { phase: 'native', phaseProgress: 0, isPlaying: false, playbackSpeed: 1, loopMode: 'none' },
  selectedId: null,
  hoveredId: null,
  activePresetId: 'sym-60',
  surfaceMode: 'curved',
  cameraMode: 'top',
  viewMode: 'geometry',
  comparisonIds: ['sym-30', 'sym-45', 'sym-60'],
  serialUnits: 4,
  overlays: defaultOverlays,
  autoRotate: false,
  ghostOverlay: true,
  teachingMode: true,
  accessibility: { reducedMotion: false, highContrast: false, colorBlindSafe: false },
  setParams: (params) => set((state) => ({ params: { ...state.params, ...params } })),
  loadPreset: (id) => {
    const preset = presets.find((item) => item.id === id)
    if (!preset) return
    set({ params: preset.params, activePresetId: id, serialUnits: preset.serialUnits ?? get().serialUnits })
  },
  setPhase: (phase) => set((state) => ({ animation: { ...state.animation, phase, phaseProgress: 0 } })),
  setPhaseProgress: (phaseProgress) => set((state) => ({ animation: { ...state.animation, phaseProgress } })),
  setPlaying: (isPlaying) => set((state) => ({ animation: { ...state.animation, isPlaying } })),
  setPlaybackSpeed: (playbackSpeed) => set((state) => ({ animation: { ...state.animation, playbackSpeed } })),
  setLoopMode: (loopMode) => set((state) => ({ animation: { ...state.animation, loopMode } })),
  nextPhase: () => {
    const current = get().animation.phase
    const index = phaseOrder.indexOf(current)
    get().setPhase(phaseOrder[(index + 1) % phaseOrder.length])
  },
  previousPhase: () => {
    const current = get().animation.phase
    const index = phaseOrder.indexOf(current)
    get().setPhase(phaseOrder[(index - 1 + phaseOrder.length) % phaseOrder.length])
  },
  select: (selectedId) => set({ selectedId }),
  hover: (hoveredId) => set({ hoveredId }),
  dragHandle: (id, x, y) =>
    set((state) => {
      if (id === 'centralStart' || id === 'centralEnd') {
        const nextLength = Math.max(18, Math.min(90, Math.hypot(x, y) * 2))
        return { params: { ...state.params, centralLength: nextLength } }
      }
      if (id === 'upperEndpoint') return { params: { ...state.params, upperLimbLength: Math.max(12, Math.min(90, Math.hypot(x, y))), symmetryLock: false } }
      return { params: { ...state.params, lowerLimbLength: Math.max(12, Math.min(90, Math.hypot(x, y))), symmetryLock: false } }
    }),
  toggleOverlay: (key) => set((state) => ({ overlays: { ...state.overlays, [key]: !state.overlays[key] } })),
  setSurfaceMode: (surfaceMode) => set({ surfaceMode }),
  setCameraMode: (cameraMode) => set({ cameraMode }),
  setViewMode: (viewMode) => set({ viewMode }),
  toggleAccessibility: (key) => set((state) => ({ accessibility: { ...state.accessibility, [key]: !state.accessibility[key] } })),
  reset: () => set({ params: defaultParameters, animation: { phase: 'native', phaseProgress: 0, isPlaying: false, playbackSpeed: 1, loopMode: 'none' }, selectedId: null, hoveredId: null }),
}))
