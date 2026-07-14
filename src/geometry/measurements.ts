import type { LinearUnit, ZPlastyGeometryResult } from '../types/geometry'

export function toDisplayUnit(valueMm: number, unit: LinearUnit): number {
  return unit === 'cm' ? valueMm / 10 : valueMm
}

export function fromDisplayUnit(value: number, unit: LinearUnit): number {
  return unit === 'cm' ? value * 10 : value
}

export function formatLength(valueMm: number, unit: LinearUnit = 'mm') {
  const value = toDisplayUnit(valueMm, unit)
  return `${value.toFixed(unit === 'cm' ? 2 : 1)} ${unit}`
}

export const formatMm = (value: number) => formatLength(value, 'mm')

export function formatDeg(value: number) {
  return `${value.toFixed(1)}°`
}

export function formatPercent(value: number) {
  return `${value.toFixed(1)}%`
}

export function createMeasurementSummary(result: ZPlastyGeometryResult, unit: LinearUnit = 'mm') {
  if (!result.isValid) return null
  return {
    originalLength: formatLength(result.originalAxisLength, unit),
    finalLength: formatLength(result.finalEndpointSpan, unit),
    theoreticalChange: formatLength(result.theoreticalLengthChange, unit),
    percentChange: formatPercent(result.theoreticalLengthChangePercent),
    axisLineAngle: formatDeg(result.axisLineAngleDeg),
    totalSpan: formatLength(result.totalConstructionSpan, unit),
    transverseComponent: formatLength(result.finalAxisTransverseComponent, unit),
    axisReferenceOffset: formatDeg(result.axisReferenceOffsetDeg),
  }
}
