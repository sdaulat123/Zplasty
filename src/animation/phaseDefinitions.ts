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
    purpose: 'Separates the stylized plan triangles from the display surface before the correspondence diagram.',
    caution: 'No vascular or wound-healing behavior is modeled.',
  },
  {
    id: 'transposition',
    label: 'Transposition',
    purpose: 'Cross-fades from the entered triangles to the A→C and B→D reciprocal point correspondence.',
    caution: 'This is a topology diagram, not a rigid-body or tissue-motion simulation.',
  },
  {
    id: 'approximation',
    label: 'Approximation',
    purpose: 'Shows the ideal planar triangles sharing the new C–D common limb.',
    caution: 'The display does not assess whether living tissue can reach or close at these positions.',
  },
  {
    id: 'closure',
    label: 'Closure',
    purpose: 'Shows the ideal final B–C–D–A line topology in the planar drawing.',
    caution: 'No suturing sequence, closure force, perfusion, or feasibility is modeled.',
  },
  {
    id: 'comparison',
    label: 'Outcome comparison',
    purpose: 'Compares the entered A–B line with the theoretical C–D endpoint diagonal and exact planar measurements.',
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
