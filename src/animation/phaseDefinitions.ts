import type { SimulationPhase } from '../types/simulation'

export type PhaseDefinition = {
  id: SimulationPhase
  label: string
  purpose: string
  caution: string
}

export const phases: PhaseDefinition[] = [
  {
    id: 'native',
    label: 'Native tissue',
    purpose: 'Shows the original scar or contracture axis before design markings are introduced.',
    caution: 'Baseline geometry is idealized and not patient-specific.',
  },
  {
    id: 'marking',
    label: 'Design marking',
    purpose: 'Displays the central limb, lateral limbs, flap outlines, key points, and live measurements.',
    caution: 'Angles and lengths are geometric teaching values.',
  },
  {
    id: 'incision',
    label: 'Incision',
    purpose: 'Animates the incision plan as a clean line-drawing sequence.',
    caution: 'This is not an operative instruction sequence.',
  },
  {
    id: 'elevation',
    label: 'Flap elevation',
    purpose: 'Lifts stylized triangular flaps to reveal simplified dermal thickness and hinge attachment.',
    caution: 'No vascular or wound-healing behavior is modeled.',
  },
  {
    id: 'transposition',
    label: 'Transposition',
    purpose: 'Shows flap movement toward the reciprocal destination positions.',
    caution: 'Movement is an idealized geometric interpolation.',
  },
  {
    id: 'approximation',
    label: 'Approximation',
    purpose: 'Demonstrates edge approach, closure vectors, and simplified relative tissue deformation.',
    caution: 'Tension display is an educational proxy, not a validated stress result.',
  },
  {
    id: 'closure',
    label: 'Closure',
    purpose: 'Shows the final Z-shaped closure and optional simplified interrupted closure markers.',
    caution: 'Closure markers clarify edge correspondence only.',
  },
  {
    id: 'comparison',
    label: 'Outcome comparison',
    purpose: 'Compares original and final axes, theoretical length gain, and scar reorientation.',
    caution: 'Actual outcomes depend on tissue, anatomy, technique, and healing.',
  },
]

export const phaseOrder = phases.map((phase) => phase.id)

export function nextPhase(current: SimulationPhase): SimulationPhase {
  const index = phaseOrder.indexOf(current)
  return phaseOrder[(index + 1) % phaseOrder.length]
}

export function previousPhase(current: SimulationPhase): SimulationPhase {
  const index = phaseOrder.indexOf(current)
  return phaseOrder[(index - 1 + phaseOrder.length) % phaseOrder.length]
}
