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

export type CameraMode = 'perspective' | 'top' | 'oblique' | 'side'

export type OverlayKey =
  | 'centralLength'
  | 'limbLengths'
  | 'angles'
  | 'originalAxis'
  | 'finalAxis'
  | 'gain'
  | 'exchangeGuides'
  | 'grid'
  | 'heatmap'

export type AccessibilityState = {
  reducedMotion: boolean
  highContrast: boolean
  colorBlindSafe: boolean
}
