import type { VariantKind, ZPlastyParameters } from '../types/geometry'
import { defaultParameters } from '../geometry/zPlastyGeometry'

export type ZPlastyPreset = {
  id: string
  name: string
  variant: VariantKind
  description: string
  params: ZPlastyParameters
}

const symmetric = (angle: number): ZPlastyParameters => ({
  ...defaultParameters,
  upperAngleDeg: angle,
  lowerAngleDeg: angle,
  upperLimbLength: defaultParameters.centralLength,
  lowerLimbLength: defaultParameters.centralLength,
  symmetryLock: true,
})

export const presets: ZPlastyPreset[] = [
  { id: 'sym-30', name: '30° symmetric Z-plasty', variant: 'standard', description: 'Low-angle geometric reference with a narrow idealized flap.', params: symmetric(30) },
  { id: 'sym-45', name: '45° symmetric Z-plasty', variant: 'standard', description: 'Intermediate reference for comparing exact planar geometry.', params: symmetric(45) },
  { id: 'sym-60', name: '60° symmetric Z-plasty', variant: 'standard', description: 'Classical equal-limb reference: exactly 73.2% theoretical change.', params: symmetric(60) },
  { id: 'sym-75', name: '75° symmetric Z-plasty', variant: 'standard', description: 'High-angle geometry; closure feasibility is not modeled.', params: symmetric(75) },
  { id: 'sym-90', name: '90° symmetric Z-plasty', variant: 'standard', description: 'Mathematical boundary reference, not a recommendation.', params: symmetric(90) },
  {
    id: 'asym',
    name: 'Asymmetric Z-plasty',
    variant: 'asymmetric',
    description: 'Unequal inputs reported only as an entered planar drawing.',
    params: { ...defaultParameters, symmetryLock: false, upperAngleDeg: 55, lowerAngleDeg: 38, upperLimbLength: 62, lowerLimbLength: 46 },
  },
]
