export type SimulationPhase =
  | 'native'
  | 'marking'
  | 'incision'
  | 'elevation'
  | 'transposition'
  | 'approximation'
  | 'closure'
  | 'comparison'

export type LoopMode = 'none' | 'phase' | 'full'

export type AnimationState = {
  phase: SimulationPhase
  phaseProgress: number
  isPlaying: boolean
  playbackSpeed: number
  loopMode: LoopMode
}

export type SurfaceMode = 'flat' | 'curved' | 'cylindrical' | 'joint'

export type CameraMode = 'perspective' | 'orthographic' | 'top' | 'oblique' | 'side' | 'split'

export type ViewMode =
  | 'geometry'
  | 'surgical'
  | 'deformation'
  | 'tension'
  | 'comparison'
  | 'variant'
  | 'crossSection'

export type OverlayKey =
  | 'centralLength'
  | 'limbLengths'
  | 'angles'
  | 'originalAxis'
  | 'finalAxis'
  | 'gain'
  | 'flapDisplacement'
  | 'closureVectors'
  | 'tensionVectors'
  | 'grid'
  | 'surfaceNormal'
  | 'edgeCorrespondence'
  | 'sutures'
  | 'orientation'
  | 'heatmap'

export type AccessibilityState = {
  reducedMotion: boolean
  highContrast: boolean
  colorBlindSafe: boolean
}
