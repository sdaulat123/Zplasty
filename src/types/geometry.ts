export type Point2D = {
  x: number
  y: number
}

export type ZPlastyParameters = {
  centralLength: number
  upperLimbLength: number
  lowerLimbLength: number
  upperAngleDeg: number
  lowerAngleDeg: number
  orientationDeg: number
  tissueElasticity: number
  tissueStiffness: number
  scarStiffness: number
  closureTensionScale: number
  surfaceCurvature: number
  transpositionAmount: number
  symmetryLock: boolean
  snapMode: SnapMode
}

export type SnapMode = 'none' | 'angle5' | 'angle15' | 'equalLimbs' | 'symmetry' | 'grid'

export type ZPlastyPoints = {
  centralStart: Point2D
  centralEnd: Point2D
  upperEndpoint: Point2D
  lowerEndpoint: Point2D
  upperDestination: Point2D
  lowerDestination: Point2D
}

export type ZPlastyGeometryResult = {
  points: ZPlastyPoints
  upperFlap: Point2D[]
  lowerFlap: Point2D[]
  transformedUpperFlap: Point2D[]
  transformedLowerFlap: Point2D[]
  preoperativeAxisLength: number
  postoperativeAxisLength: number
  absoluteLengthGain: number
  theoreticalLengthGain: number
  theoreticalLengthGainPercent: number
  reorientationAngleDeg: number
  symmetryScore: number
  upperAngleDeg: number
  lowerAngleDeg: number
  upperArea: number
  lowerArea: number
  upperPerimeter: number
  lowerPerimeter: number
  flapDisplacement: number
  closureTensionEstimate: number
  warnings: string[]
}

export type DragHandleId = 'centralStart' | 'centralEnd' | 'upperEndpoint' | 'lowerEndpoint'

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
  | 'ClosureVectorUpper'
  | 'ClosureVectorLower'
  | 'DeepTissuePlane'
  | 'GridPlane'
  | DragHandleId

export type VariantKind =
  | 'standard'
  | 'asymmetric'
  | 'serial'
  | 'fourFlap'
  | 'jumpingMan'
  | 'doubleOpposing'
  | 'planimetric'
  | 'contracture'
