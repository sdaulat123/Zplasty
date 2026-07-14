export type Point2D = {
  x: number
  y: number
}

export type LinearUnit = 'mm' | 'cm'

export type InputMode = 'learn' | 'plan'

export type GeometryIssue = {
  code: string
  severity: 'error' | 'notice'
  message: string
}

export type ZPlastyParameters = {
  centralLength: number
  upperLimbLength: number
  lowerLimbLength: number
  upperAngleDeg: number
  lowerAngleDeg: number
  orientationDeg: number
  illustrativeFlexibility: number
  deformationIntensity: number
  surfaceCurvature: number
  symmetryLock: boolean
  centerX: number
  centerY: number
  reverseFlaps: boolean
  contractureAxisDeg: number
}

export type ZPlastyPoints = {
  centralStart: Point2D
  centralEnd: Point2D
  upperEndpoint: Point2D
  lowerEndpoint: Point2D
}

export type ZPlastyGeometryResult = {
  points: ZPlastyPoints
  upperFlap: Point2D[]
  lowerFlap: Point2D[]
  transformedUpperFlap: Point2D[]
  transformedLowerFlap: Point2D[]
  originalAxisLength: number
  finalEndpointSpan: number
  theoreticalLengthChange: number
  theoreticalLengthChangePercent: number
  axisLineAngleDeg: number
  upperAngleDeg: number
  lowerAngleDeg: number
  finalAxisStart: Point2D
  finalAxisEnd: Point2D
  totalConstructionSpan: number
  finalAxisTransverseComponent: number
  axisReferenceOffsetDeg: number
  calculationModel: 'classical-symmetric' | 'entered-planar'
  isValid: boolean
  issues: GeometryIssue[]
  warnings: string[]
}

export type DragHandleId = 'centralStart' | 'centralEnd' | 'upperEndpoint' | 'lowerEndpoint' | 'center'

export type SelectableId =
  | 'SkinSurface'
  | 'ScarBand'
  | 'CentralLimb'
  | 'UpperLateralLimb'
  | 'LowerLateralLimb'
  | 'UpperFlap'
  | 'LowerFlap'
  | 'UpperHinge'
  | 'LowerHinge'
  | 'OriginalAxis'
  | 'FinalAxis'
  | 'GridPlane'
  | DragHandleId

export type VariantKind = 'standard' | 'asymmetric'
