import type { ZPlastyGeometryResult } from '../types/geometry'

export function formatMm(value: number) {
  return `${value.toFixed(1)} mm`
}

export function formatDeg(value: number) {
  return `${value.toFixed(0)} deg`
}

export function formatPercent(value: number) {
  return `${value.toFixed(0)}%`
}

export function createMeasurementSummary(result: ZPlastyGeometryResult) {
  return {
    originalLength: formatMm(result.preoperativeAxisLength),
    finalLength: formatMm(result.postoperativeAxisLength),
    absoluteGain: formatMm(result.absoluteLengthGain),
    percentGain: formatPercent(result.theoreticalLengthGainPercent),
    reorientation: formatDeg(result.reorientationAngleDeg),
    tension: `${result.closureTensionEstimate.toFixed(2)} relative`,
  }
}
