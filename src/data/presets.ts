import type { VariantKind, ZPlastyParameters } from '../types/geometry'
import { defaultParameters } from '../geometry/zPlastyGeometry'

export type ZPlastyPreset = {
  id: string
  name: string
  variant: VariantKind
  description: string
  advanced?: boolean
  serialUnits?: number
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
  { id: 'sym-30', name: '30 deg symmetric Z-plasty', variant: 'standard', description: 'Low-angle teaching design with limited theoretical lengthening.', params: symmetric(30) },
  { id: 'sym-45', name: '45 deg symmetric Z-plasty', variant: 'standard', description: 'Balanced introductory design for angle comparison.', params: symmetric(45) },
  { id: 'sym-60', name: '60 deg symmetric Z-plasty', variant: 'standard', description: 'Classic teaching preset with strong reorientation and length-gain display.', params: symmetric(60) },
  { id: 'sym-75', name: '75 deg symmetric Z-plasty', variant: 'standard', description: 'High-angle design demonstrating crowded geometry.', params: symmetric(75) },
  {
    id: 'asym',
    name: 'Asymmetric Z-plasty',
    variant: 'asymmetric',
    description: 'Educational asymmetric design showing unequal limb behavior.',
    params: { ...defaultParameters, symmetryLock: false, upperAngleDeg: 55, lowerAngleDeg: 38, upperLimbLength: 62, lowerLimbLength: 46 },
  },
  { id: 'serial', name: 'Multiple serial Z-plasties', variant: 'serial', advanced: true, serialUnits: 4, description: 'Demonstrates repeated alternating Z units along a contracture axis.', params: { ...symmetric(50), centralLength: 34 } },
  { id: 'four-flap', name: 'Four-flap Z-plasty', variant: 'fourFlap', advanced: true, description: 'Related local-flap teaching variant, not interchangeable with every standard Z-plasty.', params: symmetric(60) },
  { id: 'jumping-man', name: 'Five-flap jumping-man concept', variant: 'jumpingMan', advanced: true, description: 'Advanced conceptual variant shown for geometric comparison only.', params: symmetric(55) },
  { id: 'double-opposing', name: 'Double-opposing Z-plasty', variant: 'doubleOpposing', advanced: true, description: 'Conceptual opposing-flap demonstration on a stylized surface.', params: symmetric(60) },
  { id: 'planimetric', name: 'Planimetric teaching mode', variant: 'planimetric', description: 'Top-down geometry lab for measurements and handle editing.', params: { ...symmetric(60), surfaceCurvature: 0 } },
  { id: 'contracture', name: 'Contracture release demonstration', variant: 'contracture', description: 'Shows scar-axis lengthening concepts on a simplified contracture band.', params: { ...symmetric(60), scarStiffness: 0.78 } },
]
