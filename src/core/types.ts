export type ValueKind = 'scalar' | 'complex' | 'scalarList'

export type QuantityId =
  | 'frequency'
  | 'period'
  | 'cycleCount'
  | 'elapsedTime'
  | 'angleDegrees'
  | 'angleRadians'
  | 'angularFrequency'
  | 'voltage'
  | 'current'
  | 'resistance'
  | 'conductance'
  | 'electricForce'
  | 'electricFieldStrength'
  | 'distance'
  | 'plateArea'
  | 'permittivity'
  | 'relativePermittivity'
  | 'airCapacitance'
  | 'dielectricStrength'
  | 'inductiveReactance'
  | 'capacitiveReactance'
  | 'inductiveSusceptance'
  | 'capacitiveSusceptance'
  | 'netSusceptance'
  | 'dvDt'
  | 'diDt'
  | 'magneticFluxRate'
  | 'impedanceMagnitude'
  | 'admittanceMagnitude'
  | 'powerFactor'
  | 'realPower'
  | 'peakCurrent'
  | 'rmsCurrent'
  | 'peakVoltage'
  | 'rmsVoltage'
  | 'waveformPhaseAngle'
  | 'inductiveImpedance'
  | 'capacitiveImpedance'
  | 'inductorVoltagePhasor'
  | 'capacitorVoltagePhasor'
  | 'impedanceComplex'
  | 'admittanceComplex'
  | 'netReactance'
  | 'phaseAngle'
  | 'admittanceAngle'
  | 'inductance'
  | 'capacitance'
  | 'phasorCurrent'
  | 'phasorSourceVoltage'
  | 'resistorVoltagePhasor'
  | 'branchVoltagePhasor'
  | 'branchImpedance'
  | 'totalImpedance'
  | 'equivalentParallelResistance'
  | 'equivalentParallelInductiveReactance'
  | 'charge'
  | 'parallelCapacitorList'
  | 'seriesCapacitorList'
  | 'totalCapacitance'
  | 'timeConstant'
  | 'rcChargingVoltage'
  | 'rcChargingCurrent'
  | 'rcDischargingVoltage'
  | 'rcDischargingCurrent'
  | 'finalVoltage'
  | 'storedEnergy'
  | 'rlGrowthCurrent'
  | 'finalCurrent'
  | 'inducedVoltage'
  | 'turnCount'
  | 'complexRectangular'
  | 'polarMagnitude'
  | 'polarAngle'
  | 'complexFactorA'
  | 'complexFactorB'
  | 'complexProduct'
  | 'coilRadius'
  | 'coilLength'
  | 'coilTurns'

export interface ScalarValue {
  kind: 'scalar'
  value: number
}

export interface ComplexValue {
  kind: 'complex'
  real: number
  imag: number
}

export interface ScalarListValue {
  kind: 'scalarList'
  values: number[]
}

export type QuantityValue = ScalarValue | ComplexValue | ScalarListValue

export type KnownValueMap = Partial<Record<QuantityId, QuantityValue>>

export interface UnitDefinition {
  id: string
  label: string
  symbol: string
  factor: number
}

export interface QuantityDefinition {
  id: QuantityId
  label: string
  symbol: string
  kind: ValueKind
  category: string
  chapter: string
  description: string
  defaultUnitId: string
  units: UnitDefinition[]
  placeholder: string
}

export interface FormulaVariant {
  id: string
  familyId: string
  familyLabel: string
  chapter: string
  target: QuantityId
  inputs: QuantityId[]
  displayFormula: string
  description: string
  priority: number
  compute: (values: KnownValueMap) => QuantityValue
  validate?: (values: KnownValueMap) => string | undefined
}

export interface FormulaFamily {
  id: string
  label: string
  chapter: string
  variants: FormulaVariant[]
}

export interface SolveRequest {
  target: QuantityId
  knowns: KnownValueMap
}

export interface SolveStepInput {
  quantityId: QuantityId
  label: string
  symbol: string
  value: QuantityValue
  source: 'known' | 'derived'
}

export interface SolveStep {
  formulaId: string
  familyId: string
  familyLabel: string
  chapter: string
  target: QuantityId
  formula: string
  whySelected: string
  substitutedValues: string[]
  output: QuantityValue
}

export interface RequirementHint {
  formulaId: string
  formula: string
  missing: QuantityId[]
}

export interface AmbiguousCandidate {
  formulaId: string
  formula: string
  target: QuantityId
  derivedStepCount: number
}

export interface SolvedResult {
  status: 'solved'
  target: QuantityId
  value: QuantityValue
  steps: SolveStep[]
}

export interface IncompleteResult {
  status: 'incomplete'
  target: QuantityId
  message: string
  requirements: RequirementHint[]
}

export interface AmbiguousResult {
  status: 'ambiguous'
  target: QuantityId
  message: string
  candidates: AmbiguousCandidate[]
}

export interface InvalidResult {
  status: 'invalid'
  target: QuantityId
  message: string
}

export type SolveResult =
  | SolvedResult
  | IncompleteResult
  | AmbiguousResult
  | InvalidResult
