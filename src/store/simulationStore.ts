import { create } from 'zustand'
import type { AccessibilityState, AnimationState, CameraMode, OverlayKey, SurfaceMode } from '../types/simulation'
import type { DragHandleId, InputMode, LinearUnit, SelectableId, ZPlastyParameters } from '../types/geometry'
import { applySymmetry, defaultParameters, parametersFromHandleDrag } from '../geometry/zPlastyGeometry'
import { phaseOrder } from '../animation/phaseDefinitions'
import { presets } from '../data/presets'
import { clamp } from '../geometry/vectorMath'
import { MAX_LATERAL_ANGLE_DEG, MAX_LIMB_LENGTH_MM, MIN_LATERAL_ANGLE_DEG, MIN_LIMB_LENGTH_MM } from '../geometry/validation'

type SimulationStore = {
  params: ZPlastyParameters
  animation: AnimationState
  selectedId: SelectableId | null
  hoveredId: SelectableId | null
  activePresetId: string
  surfaceMode: SurfaceMode
  cameraMode: CameraMode
  overlays: Record<OverlayKey, boolean>
  autoRotate: boolean
  inputMode: InputMode
  unit: LinearUnit
  accessibility: AccessibilityState
  setParams: (params: Partial<ZPlastyParameters>) => void
  setInputMode: (mode: InputMode) => void
  setUnit: (unit: LinearUnit) => void
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
  exchangeGuides: true,
  grid: true,
  heatmap: false,
}

const geometryParameterKeys = new Set<keyof ZPlastyParameters>([
  'centralLength',
  'upperLimbLength',
  'lowerLimbLength',
  'upperAngleDeg',
  'lowerAngleDeg',
  'orientationDeg',
  'symmetryLock',
  'centerX',
  'centerY',
  'reverseFlaps',
  'contractureAxisDeg',
])

function mergeParameterPatch(current: ZPlastyParameters, patch: Partial<ZPlastyParameters>): ZPlastyParameters {
  let next = { ...current, ...patch }
  if (!next.symmetryLock) return next

  const bothLengths = patch.upperLimbLength !== undefined && patch.lowerLimbLength !== undefined
  const bothAngles = patch.upperAngleDeg !== undefined && patch.lowerAngleDeg !== undefined
  if (bothLengths) {
    const length = (patch.upperLimbLength! + patch.lowerLimbLength!) / 2
    next = { ...next, upperLimbLength: length, lowerLimbLength: length }
  } else if (patch.upperLimbLength !== undefined) {
    next = { ...next, lowerLimbLength: patch.upperLimbLength }
  } else if (patch.lowerLimbLength !== undefined) {
    next = { ...next, upperLimbLength: patch.lowerLimbLength }
  }
  if (bothAngles) {
    const angle = (patch.upperAngleDeg! + patch.lowerAngleDeg!) / 2
    next = { ...next, upperAngleDeg: angle, lowerAngleDeg: angle }
  } else if (patch.upperAngleDeg !== undefined) {
    next = { ...next, lowerAngleDeg: patch.upperAngleDeg }
  } else if (patch.lowerAngleDeg !== undefined) {
    next = { ...next, upperAngleDeg: patch.lowerAngleDeg }
  }
  if (patch.symmetryLock === true && !bothLengths && patch.upperLimbLength === undefined && patch.lowerLimbLength === undefined && !bothAngles && patch.upperAngleDeg === undefined && patch.lowerAngleDeg === undefined) {
    next = applySymmetry(next)
  }
  return next
}

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  params: defaultParameters,
  animation: { phase: 'marking', phaseProgress: 1, isPlaying: false, playbackSpeed: 1, loopMode: 'none' },
  selectedId: null,
  hoveredId: null,
  activePresetId: 'sym-60',
  surfaceMode: 'curved',
  cameraMode: 'top',
  overlays: defaultOverlays,
  autoRotate: false,
  inputMode: 'learn',
  unit: 'mm',
  accessibility: { reducedMotion: false, highContrast: false, colorBlindSafe: false },
  setParams: (patch) => set((state) => {
    const params = mergeParameterPatch(state.params, patch)
    const geometryChanged = (Object.keys(patch) as Array<keyof ZPlastyParameters>).some((key) => geometryParameterKeys.has(key))
    return { params, activePresetId: geometryChanged ? 'custom' : state.activePresetId }
  }),
  setInputMode: (inputMode) => set((state) => ({
    inputMode,
    params: inputMode === 'learn' ? applySymmetry({ ...state.params, symmetryLock: true }) : state.params,
    activePresetId: inputMode === 'learn' && state.activePresetId === 'asym' ? 'custom' : state.activePresetId,
  })),
  setUnit: (unit) => set({ unit }),
  loadPreset: (id) => {
    const preset = presets.find((item) => item.id === id)
    if (!preset) return
    set({ params: { ...preset.params }, activePresetId: id, inputMode: preset.variant === 'asymmetric' ? 'plan' : 'learn' })
  },
  setPhase: (phase) => set((state) => ({ animation: { ...state.animation, phase, phaseProgress: 0 } })),
  setPhaseProgress: (phaseProgress) => set((state) => ({ animation: { ...state.animation, phaseProgress: clamp(phaseProgress, 0, 1) } })),
  setPlaying: (isPlaying) => set((state) => ({ animation: { ...state.animation, isPlaying } })),
  setPlaybackSpeed: (playbackSpeed) => set((state) => ({ animation: { ...state.animation, playbackSpeed: clamp(playbackSpeed, 0.25, 2) } })),
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
  dragHandle: (id, x, y) => set((state) => {
    let params = parametersFromHandleDrag(state.params, id, { x, y })
    if (id !== 'center') {
      params = {
        ...params,
        centralLength: clamp(params.centralLength, MIN_LIMB_LENGTH_MM, MAX_LIMB_LENGTH_MM),
        upperLimbLength: clamp(params.upperLimbLength, MIN_LIMB_LENGTH_MM, MAX_LIMB_LENGTH_MM),
        lowerLimbLength: clamp(params.lowerLimbLength, MIN_LIMB_LENGTH_MM, MAX_LIMB_LENGTH_MM),
        upperAngleDeg: clamp(params.upperAngleDeg, state.inputMode === 'learn' ? 30 : MIN_LATERAL_ANGLE_DEG, state.inputMode === 'learn' ? 90 : MAX_LATERAL_ANGLE_DEG),
        lowerAngleDeg: clamp(params.lowerAngleDeg, state.inputMode === 'learn' ? 30 : MIN_LATERAL_ANGLE_DEG, state.inputMode === 'learn' ? 90 : MAX_LATERAL_ANGLE_DEG),
      }
    }
    if (state.inputMode === 'learn' && id !== 'center') params = { ...params, symmetryLock: true }
    return { params, activePresetId: 'custom' }
  }),
  toggleOverlay: (key) => set((state) => ({ overlays: { ...state.overlays, [key]: !state.overlays[key] } })),
  setSurfaceMode: (surfaceMode) => set({ surfaceMode }),
  setCameraMode: (cameraMode) => set({ cameraMode }),
  toggleAccessibility: (key) => set((state) => {
    const enabled = !state.accessibility[key]
    return {
      accessibility: { ...state.accessibility, [key]: enabled },
      animation: key === 'reducedMotion' && enabled ? { ...state.animation, isPlaying: false } : state.animation,
    }
  }),
  reset: () => set({ params: { ...defaultParameters }, activePresetId: 'sym-60', inputMode: 'learn', unit: 'mm', animation: { phase: 'marking', phaseProgress: 1, isPlaying: false, playbackSpeed: 1, loopMode: 'none' }, selectedId: null, hoveredId: null }),
}))
