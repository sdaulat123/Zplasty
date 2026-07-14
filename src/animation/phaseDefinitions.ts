import type { SimulationPhase } from '../types/simulation'

export type PhaseDefinition = {
  id: SimulationPhase
  label: string
  purpose: string
  caution: string
  durationSeconds: number
}

export const phases: PhaseDefinition[] = [
  {
    id: 'native',
    label: 'Native tissue',
    purpose: 'Shows the original scar or contracture axis before design markings are introduced.',
    caution: 'Baseline geometry is idealized and not patient-specific.',
    durationSeconds: 1.5,
  },
  {
    id: 'marking',
    label: 'Design marking',
    purpose: 'Displays the central limb, lateral limbs, flap outlines, key points, and live measurements.',
    caution: 'Angles and lengths are geometric teaching values.',
    durationSeconds: 2.4,
  },
  {
    id: 'incision',
    label: 'Incision',
    purpose: 'Animates the incision plan as a clean line-drawing sequence.',
    caution: 'This is not an operative instruction sequence.',
    durationSeconds: 2.4,
  },
  {
    id: 'elevation',
    label: 'Flap elevation',
    purpose: 'Highlights both stylized triangular flaps as elevated while their uncut bases remain conceptual hinges.',
    caution: 'No vascular or wound-healing behavior is modeled.',
    durationSeconds: 2,
  },
  {
    id: 'transposition',
    label: 'Transposition',
    purpose: 'Cross-fades the elevated flaps into the reciprocal A→C and B→D topology without inventing a tissue-motion path.',
    caution: 'This is a topology diagram, not a rigid-body or tissue-motion simulation.',
    durationSeconds: 2.8,
  },
  {
    id: 'approximation',
    label: 'Approximation',
    purpose: 'Draws the new C–D common limb after the reciprocal flap-tip correspondence is established.',
    caution: 'The display does not assess whether living tissue can reach or close at these positions.',
    durationSeconds: 1.8,
  },
  {
    id: 'closure',
    label: 'Closure',
    purpose: 'Emphasizes the ideal final B–C–D–A closure topology while the flap fills recede.',
    caution: 'No suturing sequence, closure force, perfusion, or feasibility is modeled.',
    durationSeconds: 2.2,
  },
  {
    id: 'comparison',
    label: 'Outcome comparison',
    purpose: 'Compares the entered A–B line with the theoretical C–D endpoint diagonal and exact planar measurements.',
    caution: 'Actual outcomes depend on tissue, anatomy, technique, and healing.',
    durationSeconds: 2.4,
  },
]

export const phaseOrder = phases.map((phase) => phase.id)

export function phaseDurationSeconds(phase: SimulationPhase) {
  return phases.find((definition) => definition.id === phase)?.durationSeconds ?? 2.4
}

export function nextPhase(current: SimulationPhase): SimulationPhase {
  const index = phaseOrder.indexOf(current)
  return phaseOrder[(index + 1) % phaseOrder.length]
}

export function previousPhase(current: SimulationPhase): SimulationPhase {
  const index = phaseOrder.indexOf(current)
  return phaseOrder[(index - 1 + phaseOrder.length) % phaseOrder.length]
}
