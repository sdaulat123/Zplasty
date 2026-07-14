import { validateParameters } from '../geometry/validation'
import type { InputMode, LinearUnit, ZPlastyGeometryResult, ZPlastyParameters } from '../types/geometry'
import type { AnimationState, LoopMode, SimulationPhase } from '../types/simulation'

export const EXPORT_SCHEMA_VERSION = 1

type StoredAnimation = Pick<AnimationState, 'phase' | 'phaseProgress' | 'playbackSpeed' | 'loopMode'>

export type ExportedConfiguration = {
  schemaVersion: typeof EXPORT_SCHEMA_VERSION
  application: 'zplasty-atlas'
  exportedAt: string
  presetName: string
  unit: LinearUnit
  inputMode: InputMode
  params: ZPlastyParameters
  animation: StoredAnimation
  measurements: {
    model: ZPlastyGeometryResult['calculationModel']
    originalAxisLength: number
    finalEndpointSpan: number
    theoreticalLengthChange: number
    theoreticalLengthChangePercent: number
    axisLineAngleDeg: number
    notices: string[]
  }
}

type CreateExportInput = {
  presetName: string
  unit: LinearUnit
  inputMode: InputMode
  params: ZPlastyParameters
  animation: AnimationState
  geometry: ZPlastyGeometryResult
}

export function createExport(input: CreateExportInput) {
  if (!input.geometry.isValid) throw new Error('Correct the invalid inputs before exporting calculated geometry.')
  const configuration: ExportedConfiguration = {
    schemaVersion: EXPORT_SCHEMA_VERSION,
    application: 'zplasty-atlas',
    exportedAt: new Date().toISOString(),
    presetName: input.presetName,
    unit: input.unit,
    inputMode: input.inputMode,
    params: { ...input.params },
    animation: {
      phase: input.animation.phase,
      phaseProgress: input.animation.phaseProgress,
      playbackSpeed: input.animation.playbackSpeed,
      loopMode: input.animation.loopMode,
    },
    measurements: {
      model: input.geometry.calculationModel,
      originalAxisLength: input.geometry.originalAxisLength,
      finalEndpointSpan: input.geometry.finalEndpointSpan,
      theoreticalLengthChange: input.geometry.theoreticalLengthChange,
      theoreticalLengthChangePercent: input.geometry.theoreticalLengthChangePercent,
      axisLineAngleDeg: input.geometry.axisLineAngleDeg,
      notices: input.geometry.warnings,
    },
  }
  return JSON.stringify(configuration, null, 2)
}

const phases: SimulationPhase[] = ['native', 'marking', 'incision', 'elevation', 'transposition', 'approximation', 'closure', 'comparison']
const loopModes: LoopMode[] = ['none', 'phase', 'full']
const numericParameterKeys: Array<keyof ZPlastyParameters> = [
  'centralLength',
  'upperLimbLength',
  'lowerLimbLength',
  'upperAngleDeg',
  'lowerAngleDeg',
  'orientationDeg',
  'illustrativeFlexibility',
  'deformationIntensity',
  'surfaceCurvature',
  'centerX',
  'centerY',
  'contractureAxisDeg',
]

export function parseImport(value: unknown): ExportedConfiguration {
  if (!isRecord(value)) throw new Error('The selected file is not a Z-Plasty Atlas configuration object.')
  if (value.schemaVersion !== EXPORT_SCHEMA_VERSION || value.application !== 'zplasty-atlas') {
    throw new Error(`Unsupported configuration format. Expected Z-Plasty Atlas schema ${EXPORT_SCHEMA_VERSION}.`)
  }
  if (typeof value.presetName !== 'string' || !['mm', 'cm'].includes(String(value.unit)) || !['learn', 'plan'].includes(String(value.inputMode))) {
    throw new Error('The configuration metadata is incomplete or invalid.')
  }
  if (!isRecord(value.params)) throw new Error('The configuration does not contain a complete parameter set.')

  for (const key of numericParameterKeys) {
    if (typeof value.params[key] !== 'number' || !Number.isFinite(value.params[key])) {
      throw new Error(`Invalid parameter: ${key} must be a finite number.`)
    }
  }
  if (typeof value.params.symmetryLock !== 'boolean' || typeof value.params.reverseFlaps !== 'boolean') {
    throw new Error('Invalid parameter: symmetry and direction settings must be true or false.')
  }
  const params = value.params as ZPlastyParameters
  const parameterError = validateParameters(params).find((issue) => issue.severity === 'error')
  if (parameterError) throw new Error(`Invalid parameter set: ${parameterError.message}`)
  if (
    params.symmetryLock &&
    (Math.abs(params.upperLimbLength - params.lowerLimbLength) > 1e-8 || Math.abs(params.upperAngleDeg - params.lowerAngleDeg) > 1e-8)
  ) {
    throw new Error('The configuration locks both sides but contains unequal lateral values.')
  }
  if (value.inputMode === 'learn' && !params.symmetryLock) {
    throw new Error('Learn mode requires linked lateral values.')
  }

  if (!isRecord(value.animation)) throw new Error('The configuration animation settings are missing.')
  if (!phases.includes(value.animation.phase as SimulationPhase)) throw new Error('The configuration contains an unknown animation phase.')
  if (!loopModes.includes(value.animation.loopMode as LoopMode)) throw new Error('The configuration contains an unknown loop mode.')
  if (
    typeof value.animation.phaseProgress !== 'number' ||
    value.animation.phaseProgress < 0 ||
    value.animation.phaseProgress > 1 ||
    typeof value.animation.playbackSpeed !== 'number' ||
    value.animation.playbackSpeed < 0.25 ||
    value.animation.playbackSpeed > 2
  ) {
    throw new Error('The configuration animation values are outside supported ranges.')
  }

  return {
    schemaVersion: EXPORT_SCHEMA_VERSION,
    application: 'zplasty-atlas',
    exportedAt: typeof value.exportedAt === 'string' ? value.exportedAt : '',
    presetName: value.presetName,
    unit: value.unit as LinearUnit,
    inputMode: value.inputMode as InputMode,
    params: { ...params },
    animation: {
      phase: value.animation.phase as SimulationPhase,
      phaseProgress: value.animation.phaseProgress,
      playbackSpeed: value.animation.playbackSpeed,
      loopMode: value.animation.loopMode as LoopMode,
    },
    measurements: isRecord(value.measurements)
      ? value.measurements as ExportedConfiguration['measurements']
      : {
          model: 'entered-planar',
          originalAxisLength: 0,
          finalEndpointSpan: 0,
          theoreticalLengthChange: 0,
          theoreticalLengthChangePercent: 0,
          axisLineAngleDeg: 0,
          notices: [],
        },
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}
