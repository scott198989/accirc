import {
  formatQuantitySmart,
  quantityMap,
  solveCircuitProblem,
  type QuantityId,
  type SolverInputRow,
} from '../core'
import {
  solveGuidedParallelCircuit,
  type GuidedParallelCircuitResult,
  type GuidedParallelGoal,
} from './guidedParallelCircuit'
import {
  solveGuidedSeriesImpedance,
  type GuidedComponentInput,
  type GuidedSeriesGoal,
  type GuidedSeriesImpedanceResult,
} from './guidedSeriesImpedance'

export type FastKnownId =
  | 'voltage'
  | 'current'
  | 'source-current-phasor'
  | 'source-voltage-phasor'
  | 'resistance'
  | 'inductive-reactance'
  | 'capacitive-reactance'
  | 'impedance'
  | 'admittance'
  | 'conductance'
  | 'inductive-susceptance'
  | 'capacitive-susceptance'
  | 'frequency'
  | 'inductance'
  | 'capacitance'
  | 'power'
  | 'power-factor'
  | 'phase-angle'

export type FastTargetId =
  | 'resistance'
  | 'current'
  | 'voltage'
  | 'inductive-reactance'
  | 'capacitive-reactance'
  | 'inductance'
  | 'capacitance'
  | 'conductance'
  | 'inductive-susceptance'
  | 'capacitive-susceptance'
  | 'net-susceptance'
  | 'total-impedance'
  | 'total-admittance'
  | 'power'
  | 'power-factor'
  | 'phase-angle'
  | 'equivalent-series-resistance'
  | 'equivalent-series-reactance'
  | 'voltage-across-resistor'
  | 'voltage-across-inductor'
  | 'voltage-across-capacitor'
  | 'branch-current'

export type FastScopeId =
  | 'auto'
  | 'source-total'
  | 'branch'
  | 'resistor-branch'
  | 'inductor-branch'
  | 'capacitor-branch'

export type FastCircuitShape = 'series' | 'parallel' | 'mixed'
export type FastBranchRole = 'resistor' | 'inductor' | 'capacitor'

export interface FastKnownDefinition {
  id: FastKnownId
  label: string
  aliases: string[]
  quantityId: QuantityId
  description: string
  preferredUnitId?: string
  placeholder?: string
  supportsScope?: boolean
}

export interface FastTargetDefinition {
  id: FastTargetId
  label: string
  description: string
  genericTargetId?: QuantityId
  seriesGoal?: GuidedSeriesGoal
  parallelGoal?: GuidedParallelGoal
  topologySensitive?: boolean
}

export interface FastKnownRow {
  id: string
  knownId: FastKnownId
  rawValue: string
  unitId: string
  scopeId: FastScopeId
}

export interface FastSolveContext {
  circuitShape: '' | FastCircuitShape
  branchRole: '' | FastBranchRole
}

export interface FastSolveAnalysis {
  status: 'ready' | 'needs-more-input' | 'needs-context' | 'manual-override'
  strategy: 'generic' | 'series' | 'parallel' | 'mixed' | 'none'
  target: FastTargetDefinition
  recognizedPattern?: string
  summary: string
  missingInputs: string[]
  ambiguity?: string
  requestedContext: Array<'circuitShape' | 'branchRole'>
  manualOverrideReason?: string
}

export interface FastSolveSuccess {
  status: 'solved'
  analysis: FastSolveAnalysis
  answerLabel: string
  answerValue: string
  pathSummary: string
  inputsUsed: string[]
  steps: string[]
  debugTrail: string[]
}

export interface FastSolveBlocked {
  status: 'blocked'
  analysis: FastSolveAnalysis
}

export interface FastSolveInvalid {
  status: 'invalid'
  analysis: FastSolveAnalysis
  message: string
}

export type FastSolveOutcome = FastSolveSuccess | FastSolveBlocked | FastSolveInvalid

interface StrategyReadiness {
  applicable: boolean
  missingInputs: string[]
  summary: string
}

const sourceNeededBySeriesGoal = new Set<GuidedSeriesGoal>([
  'series-source-current',
  'series-resistor-voltage',
  'series-inductor-voltage',
  'series-capacitor-voltage',
  'series-real-power',
])

const sourceNeededByParallelGoal = new Set<GuidedParallelGoal>([
  'parallel-source-current',
  'parallel-real-power',
  'parallel-resistor-current',
  'parallel-inductor-current',
  'parallel-capacitor-current',
])

const scopeOptions: Array<{ id: FastScopeId; label: string }> = [
  { id: 'auto', label: 'Auto' },
  { id: 'source-total', label: 'Source / total' },
  { id: 'branch', label: 'Branch' },
  { id: 'resistor-branch', label: 'Resistor branch' },
  { id: 'inductor-branch', label: 'Inductor branch' },
  { id: 'capacitor-branch', label: 'Capacitor branch' },
]

export const fastKnownDefinitions: FastKnownDefinition[] = [
  {
    id: 'voltage',
    label: 'Voltage (V, E)',
    aliases: ['voltage', 'v', 'e'],
    quantityId: 'voltage',
    description: 'Use for source or branch voltage magnitudes.',
    supportsScope: true,
  },
  {
    id: 'current',
    label: 'Current (I)',
    aliases: ['current', 'i', 'it', 'ir', 'il', 'ic'],
    quantityId: 'current',
    description: 'Use for scalar current magnitudes.',
    supportsScope: true,
  },
  {
    id: 'source-current-phasor',
    label: 'Source current phasor (Is)',
    aliases: ['source current', 'source current phasor', 'is'],
    quantityId: 'phasorCurrent',
    description: 'Use when the problem gives the source current as a phasor like 1@80deg.',
  },
  {
    id: 'source-voltage-phasor',
    label: 'Source voltage phasor (E)',
    aliases: ['source voltage phasor', 'phasor voltage', 'e phasor'],
    quantityId: 'phasorSourceVoltage',
    description: 'Use when the problem gives the source voltage directly as a phasor.',
  },
  {
    id: 'resistance',
    label: 'Resistance (R)',
    aliases: ['resistance', 'r'],
    quantityId: 'resistance',
    description: 'Resistance entered directly in ohms or scaled ohm units.',
  },
  {
    id: 'inductive-reactance',
    label: 'Reactance XL',
    aliases: ['xl', 'inductive reactance'],
    quantityId: 'inductiveReactance',
    description: 'Inductive reactance entered directly.',
  },
  {
    id: 'capacitive-reactance',
    label: 'Reactance XC',
    aliases: ['xc', 'capacitive reactance'],
    quantityId: 'capacitiveReactance',
    description: 'Capacitive reactance entered directly.',
  },
  {
    id: 'impedance',
    label: 'Impedance (Z, ZT)',
    aliases: ['impedance', 'z', 'zt', 'total impedance'],
    quantityId: 'impedanceComplex',
    description: 'Complex impedance in rectangular form or polar form.',
  },
  {
    id: 'admittance',
    label: 'Admittance (Y, YT)',
    aliases: ['admittance', 'y', 'yt', 'total admittance'],
    quantityId: 'admittanceComplex',
    description: 'Complex admittance in rectangular form or polar form.',
  },
  {
    id: 'conductance',
    label: 'Conductance (G)',
    aliases: ['conductance', 'g'],
    quantityId: 'conductance',
    description: 'Resistive branch conductance.',
  },
  {
    id: 'inductive-susceptance',
    label: 'Inductive susceptance (BL)',
    aliases: ['bl', 'inductive susceptance'],
    quantityId: 'inductiveSusceptance',
    description: 'Inductive branch susceptance.',
  },
  {
    id: 'capacitive-susceptance',
    label: 'Capacitive susceptance (BC)',
    aliases: ['bc', 'capacitive susceptance'],
    quantityId: 'capacitiveSusceptance',
    description: 'Capacitive branch susceptance.',
  },
  {
    id: 'frequency',
    label: 'Frequency (f)',
    aliases: ['frequency', 'f'],
    quantityId: 'frequency',
    description: 'Signal frequency.',
  },
  {
    id: 'inductance',
    label: 'Inductance (L)',
    aliases: ['inductance', 'l'],
    quantityId: 'inductance',
    description: 'Inductance when the problem gives the coil in henrys.',
    preferredUnitId: 'mh',
    placeholder: '47',
  },
  {
    id: 'capacitance',
    label: 'Capacitance (C)',
    aliases: ['capacitance', 'c'],
    quantityId: 'capacitance',
    description: 'Capacitance when the problem gives the capacitor in farads.',
    preferredUnitId: 'uf',
    placeholder: '0.1',
  },
  {
    id: 'power',
    label: 'Power (P)',
    aliases: ['power', 'p', 'real power'],
    quantityId: 'realPower',
    description: 'Average or real power.',
  },
  {
    id: 'power-factor',
    label: 'Power factor (pf)',
    aliases: ['power factor', 'pf'],
    quantityId: 'powerFactor',
    description: 'Power factor as a unitless ratio.',
  },
  {
    id: 'phase-angle',
    label: 'Phase angle (theta)',
    aliases: ['phase angle', 'theta', 'phi'],
    quantityId: 'phaseAngle',
    description: 'Phase angle in degrees or radians.',
  },
]

export const fastKnownDefinitionMap = Object.fromEntries(
  fastKnownDefinitions.map((definition) => [definition.id, definition]),
) as Record<FastKnownId, FastKnownDefinition>

export const fastTargetDefinitions: FastTargetDefinition[] = [
  {
    id: 'resistance',
    label: 'Resistance',
    description: 'Solve for resistance from the known values.',
    genericTargetId: 'resistance',
  },
  {
    id: 'current',
    label: 'Current',
    description: 'Solve for the requested current magnitude.',
    genericTargetId: 'current',
    seriesGoal: 'series-source-current',
    parallelGoal: 'parallel-source-current',
    topologySensitive: true,
  },
  {
    id: 'voltage',
    label: 'Voltage',
    description: 'Solve for voltage from the known values.',
    genericTargetId: 'voltage',
  },
  {
    id: 'inductive-reactance',
    label: 'Inductive reactance',
    description: 'Solve for XL.',
    genericTargetId: 'inductiveReactance',
  },
  {
    id: 'capacitive-reactance',
    label: 'Capacitive reactance',
    description: 'Solve for XC.',
    genericTargetId: 'capacitiveReactance',
  },
  {
    id: 'inductance',
    label: 'Inductance',
    description: 'Solve for L.',
    genericTargetId: 'inductance',
  },
  {
    id: 'capacitance',
    label: 'Capacitance',
    description: 'Solve for C.',
    genericTargetId: 'capacitance',
  },
  {
    id: 'conductance',
    label: 'Conductance',
    description: 'Solve for G.',
    genericTargetId: 'conductance',
  },
  {
    id: 'inductive-susceptance',
    label: 'Inductive susceptance',
    description: 'Solve for BL.',
    genericTargetId: 'inductiveSusceptance',
  },
  {
    id: 'capacitive-susceptance',
    label: 'Capacitive susceptance',
    description: 'Solve for BC.',
    genericTargetId: 'capacitiveSusceptance',
  },
  {
    id: 'net-susceptance',
    label: 'Susceptance',
    description: 'Solve for the net susceptance B.',
    genericTargetId: 'netSusceptance',
  },
  {
    id: 'total-impedance',
    label: 'Total impedance',
    description: 'Solve for the total circuit impedance.',
    genericTargetId: 'impedanceComplex',
    seriesGoal: 'series-impedance',
    parallelGoal: 'parallel-impedance',
    topologySensitive: true,
  },
  {
    id: 'total-admittance',
    label: 'Total admittance',
    description: 'Solve for the total circuit admittance.',
    genericTargetId: 'admittanceComplex',
    parallelGoal: 'parallel-admittance',
  },
  {
    id: 'power',
    label: 'Power',
    description: 'Solve for real power.',
    genericTargetId: 'realPower',
    seriesGoal: 'series-real-power',
    parallelGoal: 'parallel-real-power',
    topologySensitive: true,
  },
  {
    id: 'power-factor',
    label: 'Power factor',
    description: 'Solve for the circuit power factor.',
    genericTargetId: 'powerFactor',
    seriesGoal: 'series-power-factor',
    parallelGoal: 'parallel-power-factor',
    topologySensitive: true,
  },
  {
    id: 'phase-angle',
    label: 'Phase angle',
    description: 'Solve for the circuit phase angle.',
    genericTargetId: 'phaseAngle',
    seriesGoal: 'series-phase-angle',
    parallelGoal: 'parallel-admittance-angle',
    topologySensitive: true,
  },
  {
    id: 'equivalent-series-resistance',
    label: 'Equivalent series resistance',
    description: 'Read the real part of the reduced parallel impedance.',
    parallelGoal: 'parallel-equivalent-series-resistance',
  },
  {
    id: 'equivalent-series-reactance',
    label: 'Equivalent series reactance',
    description: 'Read the imaginary part of the reduced parallel impedance.',
    parallelGoal: 'parallel-equivalent-series-reactance',
  },
  {
    id: 'voltage-across-resistor',
    label: 'Voltage across resistor',
    description: 'Solve for the resistor voltage drop in a series circuit.',
    seriesGoal: 'series-resistor-voltage',
  },
  {
    id: 'voltage-across-inductor',
    label: 'Voltage across inductor',
    description: 'Solve for the inductor voltage drop in a series circuit.',
    seriesGoal: 'series-inductor-voltage',
  },
  {
    id: 'voltage-across-capacitor',
    label: 'Voltage across capacitor',
    description: 'Solve for the capacitor voltage drop in a series circuit.',
    seriesGoal: 'series-capacitor-voltage',
  },
  {
    id: 'branch-current',
    label: 'Branch current',
    description: 'Solve for the current in a selected branch.',
    seriesGoal: 'series-source-current',
    topologySensitive: true,
  },
]

export const fastTargetDefinitionMap = Object.fromEntries(
  fastTargetDefinitions.map((definition) => [definition.id, definition]),
) as Record<FastTargetId, FastTargetDefinition>

export function makeFastKnownRow(knownId: FastKnownId = 'voltage'): FastKnownRow {
  return {
    id: crypto.randomUUID(),
    knownId,
    rawValue: '',
    unitId: defaultUnitIdForFastKnown(knownId),
    scopeId: 'auto',
  }
}

export function unitOptionsForFastKnown(knownId: FastKnownId) {
  return quantityMap[fastKnownDefinitionMap[knownId].quantityId].units
}

export function defaultUnitIdForFastKnown(knownId: FastKnownId) {
  const definition = fastKnownDefinitionMap[knownId]
  return definition.preferredUnitId ?? quantityMap[definition.quantityId].defaultUnitId
}

export function placeholderForFastKnown(knownId: FastKnownId) {
  const definition = fastKnownDefinitionMap[knownId]
  return definition.placeholder ?? quantityMap[definition.quantityId].placeholder
}

export function supportsFastScope(knownId: FastKnownId) {
  return fastKnownDefinitionMap[knownId].supportsScope === true
}

export function fastScopeOptions() {
  return scopeOptions
}

export function analyzeFastSolve(input: {
  rows: FastKnownRow[]
  targetId: FastTargetId
  context: FastSolveContext
}): FastSolveAnalysis {
  const target = fastTargetDefinitionMap[input.targetId]
  const filledRows = input.rows.filter((row) => row.rawValue.trim().length > 0)

  if (filledRows.length === 0) {
    return {
      status: 'needs-more-input',
      strategy: 'none',
      target,
      recognizedPattern: 'Waiting for known values',
      summary: 'Add the values you know, then pick what the question wants.',
      missingInputs: ['Add at least one known value.'],
      requestedContext: [],
    }
  }

  if (input.context.circuitShape === 'mixed') {
    return {
      status: 'manual-override',
      strategy: 'mixed',
      target,
      recognizedPattern: 'Mixed network',
      summary:
        'A mixed series-parallel problem needs the small network builder so the app can see the structure.',
      missingInputs: [],
      requestedContext: [],
      manualOverrideReason:
        'Mixed networks need the Manual Override builder because the numbers alone do not encode the branch structure.',
    }
  }

  const generic = analyzeGenericStrategy(filledRows, target)
  const series = analyzeSeriesStrategy(filledRows, target)
  const parallel = analyzeParallelStrategy(filledRows, target, input.context.branchRole)

  if (input.context.circuitShape === 'series') {
    return toStrategyAnalysis('series', target, series)
  }

  if (input.context.circuitShape === 'parallel') {
    if (target.id === 'branch-current' && input.context.branchRole === '') {
      return needsBranchRoleAnalysis(target)
    }

    return toStrategyAnalysis('parallel', target, parallel)
  }

  if (
    target.topologySensitive &&
    series.applicable &&
    parallel.applicable &&
    rowsNeedCircuitShape(filledRows, target)
  ) {
    return {
      status: 'needs-context',
      strategy: 'none',
      target,
      recognizedPattern: 'Topology-sensitive solve',
      summary:
        'These knowns could belong to either a series reduction or a parallel reduction.',
      missingInputs: [],
      ambiguity: 'I need the circuit shape before I can choose the correct reduction path.',
      requestedContext: ['circuitShape'],
    }
  }

  if (generic.status === 'ready') {
    return generic
  }

  if (series.applicable && !parallel.applicable) {
    return toStrategyAnalysis('series', target, series)
  }

  if (parallel.applicable && !series.applicable) {
    if (target.id === 'branch-current' && input.context.branchRole === '') {
      return needsBranchRoleAnalysis(target)
    }

    return toStrategyAnalysis('parallel', target, parallel)
  }

  if (generic.status !== 'not-applicable') {
    return generic
  }

  if (series.applicable) {
    return toStrategyAnalysis('series', target, series)
  }

  if (parallel.applicable) {
    return toStrategyAnalysis('parallel', target, parallel)
  }

  return {
    status: 'needs-more-input',
    strategy: 'none',
    target,
    recognizedPattern: 'No clear solve path yet',
    summary: 'The current knowns do not identify a direct Chapter 15-17 solve path yet.',
    missingInputs: [
      'Add one or more more directly related known values, or open Manual Override for a diagram-driven problem.',
    ],
    requestedContext: [],
  }
}

export function solveFastProblem(input: {
  rows: FastKnownRow[]
  targetId: FastTargetId
  context: FastSolveContext
}): FastSolveOutcome {
  const analysis = analyzeFastSolve(input)
  const filledRows = input.rows.filter((row) => row.rawValue.trim().length > 0)

  if (analysis.status === 'needs-context' || analysis.status === 'manual-override') {
    return {
      status: 'blocked',
      analysis,
    }
  }

  if (analysis.strategy === 'generic') {
    return solveGenericFastProblem(input.targetId, filledRows, analysis)
  }

  if (analysis.strategy === 'series') {
    return solveSeriesFastProblem(input.targetId, filledRows, analysis)
  }

  if (analysis.strategy === 'parallel') {
    return solveParallelFastProblem(input.targetId, input.context.branchRole, filledRows, analysis)
  }

  return {
    status: 'blocked',
    analysis,
  }
}

function solveGenericFastProblem(
  targetId: FastTargetId,
  rows: FastKnownRow[],
  analysis: FastSolveAnalysis,
): FastSolveOutcome {
  const targetDefinition = fastTargetDefinitionMap[targetId]
  const genericRows = toGenericSolverRows(rows)
  if (typeof genericRows === 'string') {
    return {
      status: 'invalid',
      analysis,
      message: genericRows,
    }
  }

  const result = solveCircuitProblem(targetDefinition.genericTargetId!, genericRows)
  if (result.status !== 'solved') {
    return {
      status: 'invalid',
      analysis,
      message: result.message,
    }
  }

  return {
    status: 'solved',
    analysis,
    answerLabel: targetDefinition.label,
    answerValue: formatQuantitySmart(result.target, result.value),
    pathSummary:
      result.steps.at(-1)?.whySelected ?? 'Solved with the shortest direct formula path.',
    inputsUsed: summarizeUsedRows(rows),
    steps: result.steps.map(
      (step) => `${step.formula} -> ${formatQuantitySmart(step.target, step.output)}`,
    ),
    debugTrail: result.steps.map(
      (step) => `${step.familyLabel}: ${step.formula} | ${step.substitutedValues.join(', ')}`,
    ),
  }
}

function solveSeriesFastProblem(
  targetId: FastTargetId,
  rows: FastKnownRow[],
  analysis: FastSolveAnalysis,
): FastSolveOutcome {
  const goal = fastTargetDefinitionMap[targetId].seriesGoal
  if (!goal) {
    return {
      status: 'invalid',
      analysis,
      message: 'This target does not map to a series solve.',
    }
  }

  const seriesInput = buildSeriesInput(rows, goal)
  if ('error' in seriesInput) {
    return {
      status: 'invalid',
      analysis,
      message: seriesInput.error ?? 'The series reduction input could not be prepared.',
    }
  }

  return toGuidedOutcome(analysis, rows, solveGuidedSeriesImpedance(seriesInput))
}

function solveParallelFastProblem(
  targetId: FastTargetId,
  branchRole: FastSolveContext['branchRole'],
  rows: FastKnownRow[],
  analysis: FastSolveAnalysis,
): FastSolveOutcome {
  const goal = resolveParallelGoal(targetId, branchRole)
  if (!goal) {
    return {
      status: 'invalid',
      analysis,
      message: 'This target does not map to a parallel solve.',
    }
  }

  const parallelInput = buildParallelInput(rows, goal)
  if ('error' in parallelInput) {
    return {
      status: 'invalid',
      analysis,
      message: parallelInput.error ?? 'The parallel reduction input could not be prepared.',
    }
  }

  return toGuidedOutcome(analysis, rows, solveGuidedParallelCircuit(parallelInput))
}

function analyzeGenericStrategy(
  rows: FastKnownRow[],
  target: FastTargetDefinition,
): FastSolveAnalysis | { status: 'not-applicable' } {
  if (!target.genericTargetId) {
    return { status: 'not-applicable' }
  }

  const genericRows = toGenericSolverRows(rows)
  if (typeof genericRows === 'string') {
    return {
      status: 'manual-override',
      strategy: 'generic',
      target,
      recognizedPattern: 'Repeated known family',
      summary:
        'Some of these knowns repeat the same engine quantity, which usually means this is a diagram-driven circuit reduction rather than one direct formula.',
      missingInputs: [],
      requestedContext: [],
      manualOverrideReason: genericRows,
    }
  }

  const result = solveCircuitProblem(target.genericTargetId, genericRows)
  if (result.status === 'solved') {
    return {
      status: 'ready',
      strategy: 'generic',
      target,
      recognizedPattern: 'Direct formula path',
      summary:
        'The knowns already identify one direct dependency path to the requested answer.',
      missingInputs: [],
      requestedContext: [],
    }
  }

  if (result.status === 'ambiguous') {
    return {
      status: 'manual-override',
      strategy: 'generic',
      target,
      recognizedPattern: 'Multiple valid formula families',
      summary:
        'More than one valid formula family can solve this target from the entered knowns.',
      missingInputs: [],
      requestedContext: [],
      manualOverrideReason:
        'Use Manual Override to force the exact path when multiple valid formula families fit the same knowns.',
    }
  }

  if (result.status === 'incomplete') {
    return {
      status: 'needs-more-input',
      strategy: 'generic',
      target,
      recognizedPattern: 'Direct formula path not complete yet',
      summary:
        'The rule engine found nearby formulas, but the current knowns still leave gaps.',
      missingInputs: result.requirements
        .flatMap((requirement) =>
          requirement.missing.map((missingId) => quantityMap[missingId].label),
        )
        .filter((label, index, items) => items.indexOf(label) === index)
        .slice(0, 5),
      requestedContext: [],
    }
  }

  return {
    status: 'needs-more-input',
    strategy: 'generic',
    target,
    recognizedPattern: 'Input issue',
    summary: 'One of the entered knowns could not be parsed cleanly.',
    missingInputs: [result.message],
    requestedContext: [],
  }
}

function analyzeSeriesStrategy(
  rows: FastKnownRow[],
  target: FastTargetDefinition,
): StrategyReadiness {
  if (!target.seriesGoal) {
    return {
      applicable: false,
      missingInputs: [],
      summary: '',
    }
  }

  const componentRows = rows.filter((row) => isSeriesComponentKnown(row.knownId))
  if (componentRows.length === 0) {
    return {
      applicable: false,
      missingInputs: [],
      summary: '',
    }
  }

  const missingInputs: string[] = []
  if (componentRows.some((row) => needsFrequency(row.knownId)) && !hasKnown(rows, 'frequency')) {
    missingInputs.push('Frequency')
  }

  if (sourceNeededBySeriesGoal.has(target.seriesGoal) && !hasKnown(rows, 'voltage')) {
    missingInputs.push('Source voltage')
  }

  return {
    applicable: true,
    missingInputs,
    summary:
      'This looks like a series reduction: add the component-like knowns together, reduce the total impedance, then solve the requested output.',
  }
}

function analyzeParallelStrategy(
  rows: FastKnownRow[],
  target: FastTargetDefinition,
  branchRole: FastSolveContext['branchRole'],
): StrategyReadiness {
  const parallelGoal = resolveParallelGoal(target.id, branchRole)
  if (!parallelGoal) {
    return {
      applicable: false,
      missingInputs: [],
      summary: '',
    }
  }

  const componentRows = rows.filter((row) => isParallelComponentKnown(row.knownId))
  if (componentRows.length === 0) {
    return {
      applicable: false,
      missingInputs: [],
      summary: '',
    }
  }

  const missingInputs: string[] = []
  if (componentRows.some((row) => needsFrequency(row.knownId)) && !hasKnown(rows, 'frequency')) {
    missingInputs.push('Frequency')
  }

  if (
    sourceNeededByParallelGoal.has(parallelGoal) &&
    !hasKnown(rows, 'voltage') &&
    !hasKnown(rows, 'source-current-phasor')
  ) {
    missingInputs.push('Source voltage or source current phasor')
  }

  if (target.id === 'branch-current' && branchRole === '') {
    return {
      applicable: true,
      missingInputs: [],
      summary:
        'This looks like a parallel branch-current problem, but the requested branch has not been identified yet.',
    }
  }

  return {
    applicable: true,
    missingInputs,
    summary:
      'This looks like a parallel admittance reduction: convert each branch to G, BL, or BC, add the total admittance, then solve the requested output.',
  }
}

function toStrategyAnalysis(
  strategy: 'series' | 'parallel',
  target: FastTargetDefinition,
  readiness: StrategyReadiness,
): FastSolveAnalysis {
  return {
    status: readiness.missingInputs.length === 0 ? 'ready' : 'needs-more-input',
    strategy,
    target,
    recognizedPattern: strategy === 'series' ? 'Series reduction' : 'Parallel reduction',
    summary: readiness.summary,
    missingInputs: readiness.missingInputs,
    requestedContext: [],
  }
}

function needsBranchRoleAnalysis(target: FastTargetDefinition): FastSolveAnalysis {
  return {
    status: 'needs-context',
    strategy: 'parallel',
    target,
    recognizedPattern: 'Parallel branch current',
    summary: 'I can solve this once you tell me which branch current the question wants.',
    missingInputs: [],
    ambiguity: 'The target says branch current, but the branch type is not specified yet.',
    requestedContext: ['branchRole'],
  }
}

function rowsNeedCircuitShape(rows: FastKnownRow[], target: FastTargetDefinition) {
  const seriesRows = rows.some((row) => isSeriesComponentKnown(row.knownId))
  const parallelRows = rows.some((row) => isParallelComponentKnown(row.knownId))

  if (!seriesRows || !parallelRows) {
    return false
  }

  return target.topologySensitive === true
}

function toGenericSolverRows(rows: FastKnownRow[]): SolverInputRow[] | string {
  const seen = new Set<QuantityId>()
  const genericRows: SolverInputRow[] = []

  for (const row of rows) {
    const definition = fastKnownDefinitionMap[row.knownId]
    const quantityId = definition.quantityId

    if (seen.has(quantityId)) {
      return `Multiple ${quantityMap[quantityId].label.toLowerCase()} entries were entered. Use Manual Override when the problem has repeated components or repeated branch values.`
    }

    seen.add(quantityId)
    genericRows.push({
      quantityId,
      rawValue: row.rawValue,
      unitId: row.unitId,
    })
  }

  return genericRows
}

function buildSeriesInput(rows: FastKnownRow[], goal: GuidedSeriesGoal) {
  const components: GuidedComponentInput[] = []
  let frequencyRawValue = ''
  let frequencyUnitId = quantityMap.frequency.defaultUnitId
  let sourceVoltageRawValue = ''
  let sourceVoltageUnitId = quantityMap.voltage.defaultUnitId

  for (const row of rows) {
    if (row.knownId === 'frequency') {
      if (frequencyRawValue.trim().length > 0) {
        return { error: 'Enter the frequency only once for a series reduction.' }
      }

      frequencyRawValue = row.rawValue
      frequencyUnitId = row.unitId
      continue
    }

    if (row.knownId === 'voltage') {
      if (sourceVoltageRawValue.trim().length > 0) {
        return { error: 'Enter the source voltage only once for a series reduction.' }
      }

      sourceVoltageRawValue = row.rawValue
      sourceVoltageUnitId = row.unitId
      continue
    }

    if (row.knownId === 'resistance') {
      components.push(makeGuidedComponent(row, 'resistor', 'resistance'))
      continue
    }

    if (row.knownId === 'inductive-reactance') {
      components.push(makeGuidedComponent(row, 'inductor', 'reactance'))
      continue
    }

    if (row.knownId === 'capacitive-reactance') {
      components.push(makeGuidedComponent(row, 'capacitor', 'reactance'))
      continue
    }

    if (row.knownId === 'inductance') {
      components.push(makeGuidedComponent(row, 'inductor', 'inductance'))
      continue
    }

    if (row.knownId === 'capacitance') {
      components.push(makeGuidedComponent(row, 'capacitor', 'capacitance'))
    }
  }

  return {
    goal,
    frequencyRawValue,
    frequencyUnitId,
    sourceVoltageRawValue,
    sourceVoltageUnitId,
    components,
  }
}

function buildParallelInput(rows: FastKnownRow[], goal: GuidedParallelGoal) {
  const components: GuidedComponentInput[] = []
  let frequencyRawValue = ''
  let frequencyUnitId = quantityMap.frequency.defaultUnitId
  let sourceVoltageRawValue = ''
  let sourceVoltageUnitId = quantityMap.voltage.defaultUnitId
  let sourceCurrentPhasorRawValue = ''
  let sourceCurrentPhasorUnitId = quantityMap.phasorCurrent.defaultUnitId

  for (const row of rows) {
    if (row.knownId === 'frequency') {
      if (frequencyRawValue.trim().length > 0) {
        return { error: 'Enter the frequency only once for a parallel reduction.' }
      }

      frequencyRawValue = row.rawValue
      frequencyUnitId = row.unitId
      continue
    }

    if (row.knownId === 'voltage') {
      if (sourceVoltageRawValue.trim().length > 0) {
        return { error: 'Enter the source voltage only once for a parallel reduction.' }
      }

      sourceVoltageRawValue = row.rawValue
      sourceVoltageUnitId = row.unitId
      continue
    }

    if (row.knownId === 'source-current-phasor') {
      if (sourceCurrentPhasorRawValue.trim().length > 0) {
        return { error: 'Enter the source current phasor only once for a parallel reduction.' }
      }

      sourceCurrentPhasorRawValue = row.rawValue
      sourceCurrentPhasorUnitId = row.unitId
      continue
    }

    if (row.knownId === 'resistance') {
      components.push(makeGuidedComponent(row, 'resistor', 'resistance'))
      continue
    }

    if (row.knownId === 'conductance') {
      const converted = convertScalarKnown(row, 'resistance')
      if (typeof converted === 'string') {
        return { error: converted }
      }

      components.push({
        id: row.id,
        label: rowLabel(row),
        kind: 'resistor',
        valueMode: 'resistance',
        rawValue: converted.rawValue,
        unitId: 'ohm',
      })
      continue
    }

    if (row.knownId === 'inductive-reactance') {
      components.push(makeGuidedComponent(row, 'inductor', 'reactance'))
      continue
    }

    if (row.knownId === 'inductive-susceptance') {
      const converted = convertScalarKnown(row, 'inductiveReactance')
      if (typeof converted === 'string') {
        return { error: converted }
      }

      components.push({
        id: row.id,
        label: rowLabel(row),
        kind: 'inductor',
        valueMode: 'reactance',
        rawValue: converted.rawValue,
        unitId: 'ohm',
      })
      continue
    }

    if (row.knownId === 'inductance') {
      components.push(makeGuidedComponent(row, 'inductor', 'inductance'))
      continue
    }

    if (row.knownId === 'capacitive-reactance') {
      components.push(makeGuidedComponent(row, 'capacitor', 'reactance'))
      continue
    }

    if (row.knownId === 'capacitive-susceptance') {
      const converted = convertScalarKnown(row, 'capacitiveReactance')
      if (typeof converted === 'string') {
        return { error: converted }
      }

      components.push({
        id: row.id,
        label: rowLabel(row),
        kind: 'capacitor',
        valueMode: 'reactance',
        rawValue: converted.rawValue,
        unitId: 'ohm',
      })
      continue
    }

    if (row.knownId === 'capacitance') {
      components.push(makeGuidedComponent(row, 'capacitor', 'capacitance'))
    }
  }

  return {
    goal,
    frequencyRawValue,
    frequencyUnitId,
    sourceVoltageRawValue,
    sourceVoltageUnitId,
    sourceCurrentPhasorRawValue,
    sourceCurrentPhasorUnitId,
    components,
  }
}

function resolveParallelGoal(
  targetId: FastTargetId,
  branchRole: FastSolveContext['branchRole'],
): GuidedParallelGoal | undefined {
  const target = fastTargetDefinitionMap[targetId]
  if (target.parallelGoal) {
    return target.parallelGoal
  }

  if (targetId !== 'branch-current') {
    return undefined
  }

  if (branchRole === 'resistor') {
    return 'parallel-resistor-current'
  }

  if (branchRole === 'inductor') {
    return 'parallel-inductor-current'
  }

  if (branchRole === 'capacitor') {
    return 'parallel-capacitor-current'
  }

  return undefined
}

function hasKnown(rows: FastKnownRow[], knownId: FastKnownId) {
  return rows.some((row) => row.knownId === knownId)
}

function needsFrequency(knownId: FastKnownId) {
  return knownId === 'inductance' || knownId === 'capacitance'
}

function isSeriesComponentKnown(knownId: FastKnownId) {
  return (
    knownId === 'resistance' ||
    knownId === 'inductive-reactance' ||
    knownId === 'capacitive-reactance' ||
    knownId === 'inductance' ||
    knownId === 'capacitance'
  )
}

function isParallelComponentKnown(knownId: FastKnownId) {
  return (
    knownId === 'resistance' ||
    knownId === 'conductance' ||
    knownId === 'inductive-reactance' ||
    knownId === 'inductive-susceptance' ||
    knownId === 'inductance' ||
    knownId === 'capacitive-reactance' ||
    knownId === 'capacitive-susceptance' ||
    knownId === 'capacitance'
  )
}

function convertScalarKnown(row: FastKnownRow, target: QuantityId) {
  const definition = fastKnownDefinitionMap[row.knownId]
  const result = solveCircuitProblem(target, [
    {
      quantityId: definition.quantityId,
      rawValue: row.rawValue,
      unitId: row.unitId,
    },
  ])

  if (result.status !== 'solved' || result.value.kind !== 'scalar') {
    return `${rowLabel(row)} could not be converted into ${quantityMap[target].label.toLowerCase()}.`
  }

  return {
    rawValue: String(result.value.value),
  }
}

function makeGuidedComponent(
  row: FastKnownRow,
  kind: GuidedComponentInput['kind'],
  valueMode: GuidedComponentInput['valueMode'],
): GuidedComponentInput {
  return {
    id: row.id,
    label: rowLabel(row),
    kind,
    valueMode,
    rawValue: row.rawValue,
    unitId: row.unitId,
  }
}

function rowLabel(row: FastKnownRow) {
  const definition = fastKnownDefinitionMap[row.knownId]
  const scopeLabel =
    row.scopeId === 'auto'
      ? ''
      : ` (${scopeOptions.find((option) => option.id === row.scopeId)?.label ?? row.scopeId})`
  return `${definition.label}${scopeLabel}`
}

function summarizeUsedRows(rows: FastKnownRow[]) {
  return rows.map((row) => `${rowLabel(row)} = ${row.rawValue} ${unitSymbol(row)}`.trim())
}

function unitSymbol(row: FastKnownRow) {
  const unit = quantityMap[fastKnownDefinitionMap[row.knownId].quantityId].units.find(
    (candidate) => candidate.id === row.unitId,
  )
  return unit?.symbol ?? ''
}

function toGuidedOutcome(
  analysis: FastSolveAnalysis,
  rows: FastKnownRow[],
  result: GuidedSeriesImpedanceResult | GuidedParallelCircuitResult,
): FastSolveOutcome {
  if (result.status !== 'solved') {
    return {
      status: 'invalid',
      analysis,
      message: result.message,
    }
  }

  if (result.output.result.status !== 'solved') {
    return {
      status: 'invalid',
      analysis,
      message:
        'The reduction completed, but the requested final answer could not be extracted cleanly.',
    }
  }

  return {
    status: 'solved',
    analysis,
    answerLabel: result.output.label,
    answerValue: formatQuantitySmart(result.output.quantityId, result.output.result.value),
    pathSummary:
      analysis.strategy === 'series'
        ? 'Used the series reduction path for the entered component-style knowns.'
        : 'Used the parallel admittance reduction path for the entered branch-style knowns.',
    inputsUsed: summarizeUsedRows(rows),
    steps: result.contributions.map(
      (contribution) => `${contribution.label}: ${contribution.contributesAs}`,
    ),
    debugTrail: result.contributions.map((contribution) =>
      contribution.formulaUsed
        ? `${contribution.label}: ${contribution.formulaUsed}`
        : `${contribution.label}: ${contribution.entered}`,
    ),
  }
}
