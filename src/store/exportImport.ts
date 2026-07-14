import type { ZPlastyGeometryResult, ZPlastyParameters } from '../types/geometry'
import type { AnimationState, ViewMode } from '../types/simulation'

export type ExportedConfiguration = {
  presetName: string
  params: ZPlastyParameters
  viewMode: ViewMode
  animation: AnimationState
  measurements: Pick<
    ZPlastyGeometryResult,
    'preoperativeAxisLength' | 'postoperativeAxisLength' | 'absoluteLengthGain' | 'theoreticalLengthGainPercent' | 'reorientationAngleDeg' | 'warnings'
  >
}

export function createExport(configuration: ExportedConfiguration) {
  return JSON.stringify(configuration, null, 2)
}

export function validateImport(value: unknown): value is ExportedConfiguration {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<ExportedConfiguration>
  return Boolean(candidate.params && typeof candidate.params.centralLength === 'number' && candidate.animation?.phase)
}
