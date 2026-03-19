import { complex, divideComplex, magnitude, multiplyComplex, scalar } from '../core/complex'
import { formatQuantityInBaseUnit, formatQuantitySmart } from '../core/format'
import { quantityMap } from '../core/quantities'
import { solveWithRules } from '../core/ruleEngine'
import { solveCircuitProblem } from '../core/solver'
import type { QuantityId, QuantityValue, SolveResult } from '../core/types'
import { parseAndNormalizeValue } from '../core/units'
import type {
  GuidedComponentInput,
  GuidedComputedValue,
  GuidedContribution,
} from './guidedSeriesImpedance'

const EPSILON = 1e-9

export type GuidedParallelGoal =
  | 'parallel-admittance'
  | 'parallel-admittance-angle'
  | 'parallel-impedance'
  | 'parallel-equivalent-series-resistance'
  | 'parallel-equivalent-series-reactance'
  | 'parallel-source-current'
  | 'parallel-power-factor'
  | 'parallel-real-power'
  | 'parallel-resistor-current'
  | 'parallel-inductor-current'
  | 'parallel-capacitor-current'

export interface GuidedParallelCircuitInput {
  goal?: GuidedParallelGoal
  frequencyRawValue: string
  frequencyUnitId: string
  sourceVoltageRawValue?: string
  sourceVoltageUnitId?: string
  sourceCurrentPhasorRawValue?: string
  sourceCurrentPhasorUnitId?: string
  components: GuidedComponentInput[]
}

export interface GuidedParallelCircuitSolved {
  status: 'solved'
  goal: GuidedParallelGoal
  contributions: GuidedContribution[]
  totals: {
    conductance: number
    inductiveSusceptance: number
    capacitiveSusceptance: number
    netSusceptance: number
  }
  output: GuidedComputedValue
  reference: {
    admittanceRectangular: GuidedComputedValue
    admittanceMagnitude: GuidedComputedValue
    admittanceAngle: GuidedComputedValue
    impedanceRectangular: GuidedComputedValue
    impedanceMagnitude: GuidedComputedValue
    equivalentSeriesResistance: GuidedComputedValue
    equivalentSeriesReactance: GuidedComputedValue
    powerFactor: GuidedComputedValue
    sourceVoltagePhasor?: GuidedComputedValue
    sourceCurrent?: GuidedComputedValue
    resistorCurrent?: GuidedComputedValue
    inductorCurrent?: GuidedComputedValue
    capacitorCurrent?: GuidedComputedValue
    realPower?: GuidedComputedValue
  }
}

export interface GuidedParallelCircuitInvalid {
  status: 'invalid'
  message: string
}

export type GuidedParallelCircuitResult =
  | GuidedParallelCircuitSolved
  | GuidedParallelCircuitInvalid

export function solveGuidedParallelCircuit(
  input: GuidedParallelCircuitInput,
): GuidedParallelCircuitResult {
  const goal = input.goal ?? 'parallel-admittance'
  const components = input.components.filter((component) => component.rawValue.trim().length > 0)

  if (components.length === 0) {
    return {
      status: 'invalid',
      message: 'Add at least one parallel branch before solving.',
    }
  }

  const requiresFrequency = components.some((component) =>
    (component.kind === 'inductor' && component.valueMode === 'inductance') ||
    (component.kind === 'capacitor' && component.valueMode === 'capacitance'),
  )

  if (requiresFrequency && input.frequencyRawValue.trim().length === 0) {
    return {
      status: 'invalid',
      message:
        'Frequency is required when any inductor is entered in henrys or any capacitor is entered in farads.',
    }
  }

  const sourceVoltage = parseSourceVoltage(
    input.sourceVoltageRawValue ?? '',
    input.sourceVoltageUnitId ?? 'v',
  )
  if (sourceVoltage.error) {
    return {
      status: 'invalid',
      message: sourceVoltage.error,
    }
  }

  const sourceCurrentPhasor = parseSourceCurrentPhasor(
    input.sourceCurrentPhasorRawValue ?? '',
    input.sourceCurrentPhasorUnitId ?? 'a',
  )
  if (sourceCurrentPhasor.error) {
    return {
      status: 'invalid',
      message: sourceCurrentPhasor.error,
    }
  }

  if (goalNeedsSourceExcitation(goal) && !sourceVoltage.value && !sourceCurrentPhasor.value) {
    return {
      status: 'invalid',
      message:
        'This guided goal needs either the source voltage magnitude or the source current phasor before solving.',
    }
  }

  let totalConductance = 0
  let totalInductiveSusceptance = 0
  let totalCapacitiveSusceptance = 0

  const contributions: GuidedContribution[] = []
  const counters = { resistor: 0, inductor: 0, capacitor: 0 }

  for (const component of components) {
    counters[component.kind] += 1
    const label =
      component.label?.trim() || `${capitalize(component.kind)} ${counters[component.kind]}`
    const processed = processComponent(component, label, input.frequencyRawValue, input.frequencyUnitId)

    if (processed.status === 'invalid') {
      return processed
    }

    contributions.push(processed.contribution)

    if (processed.admittanceType === 'conductance') {
      totalConductance += processed.valueInSiemens
    } else if (processed.admittanceType === 'inductiveSusceptance') {
      totalInductiveSusceptance += processed.valueInSiemens
    } else {
      totalCapacitiveSusceptance += processed.valueInSiemens
    }
  }

  const aggregateRows = [
    { quantityId: 'conductance' as const, rawValue: String(totalConductance), unitId: 's' },
    {
      quantityId: 'inductiveSusceptance' as const,
      rawValue: String(totalInductiveSusceptance),
      unitId: 's',
    },
    {
      quantityId: 'capacitiveSusceptance' as const,
      rawValue: String(totalCapacitiveSusceptance),
      unitId: 's',
    },
  ]

  const admittanceRectangular = solveCircuitProblem('admittanceComplex', aggregateRows)
  const admittanceMagnitude = solveCircuitProblem('admittanceMagnitude', aggregateRows)
  const admittanceAngle = solveCircuitProblem('admittanceAngle', aggregateRows)

  if (
    admittanceRectangular.status !== 'solved' ||
    admittanceMagnitude.status !== 'solved' ||
    admittanceAngle.status !== 'solved'
  ) {
    return {
      status: 'invalid',
      message:
        'The guided component data did not produce a clean admittance solve. Please check the entered values.',
    }
  }

  const impedanceRectangular = solveWithRules({
    target: 'impedanceComplex',
    knowns: {
      admittanceComplex: admittanceRectangular.value,
    },
  })
  const impedanceMagnitude = solveWithRules({
    target: 'impedanceMagnitude',
    knowns: {
      admittanceMagnitude: admittanceMagnitude.value,
    },
  })
  const powerFactor = solveWithRules({
    target: 'powerFactor',
    knowns: {
      conductance: scalar(totalConductance),
      admittanceMagnitude: admittanceMagnitude.value,
    },
  })

  if (
    impedanceRectangular.status !== 'solved' ||
    impedanceMagnitude.status !== 'solved' ||
    powerFactor.status !== 'solved'
  ) {
    return {
      status: 'invalid',
      message:
        'The guided parallel data solved admittance, but impedance or power factor could not be derived.',
    }
  }

  const netSusceptance = totalCapacitiveSusceptance - totalInductiveSusceptance
  const equivalentSeriesResistanceValue =
    impedanceRectangular.value.kind === 'complex' ? impedanceRectangular.value.real : 0
  const equivalentSeriesReactanceValue =
    impedanceRectangular.value.kind === 'complex' ? impedanceRectangular.value.imag : 0
  const reference = {
    admittanceRectangular: makeComputedValue(
      'admittance-rectangular',
      'Total admittance in rectangular form',
      'admittanceComplex',
      admittanceRectangular,
      `Polar form: ${formatQuantitySmart('admittanceMagnitude', admittanceMagnitude.value)} angle ${formatQuantitySmart('admittanceAngle', admittanceAngle.value)}`,
    ),
    admittanceMagnitude: makeComputedValue(
      'admittance-magnitude',
      'Total admittance magnitude',
      'admittanceMagnitude',
      admittanceMagnitude,
      `Rectangular form: ${formatQuantitySmart('admittanceComplex', admittanceRectangular.value)}`,
    ),
    admittanceAngle: makeComputedValue(
      'admittance-angle',
      'Admittance angle',
      'admittanceAngle',
      admittanceAngle,
      `Source current is ${leadLagText(netSusceptance)} relative to the source voltage.`,
    ),
    impedanceRectangular: makeComputedValue(
      'impedance-rectangular',
      'Total impedance in rectangular form',
      'impedanceComplex',
      impedanceRectangular,
      `Magnitude: ${formatQuantitySmart('impedanceMagnitude', impedanceMagnitude.value)}; admittance angle = ${formatQuantitySmart('admittanceAngle', admittanceAngle.value)}`,
    ),
    impedanceMagnitude: makeComputedValue(
      'impedance-magnitude',
      'Total impedance magnitude',
      'impedanceMagnitude',
      impedanceMagnitude,
      `Rectangular form: ${formatQuantitySmart('impedanceComplex', impedanceRectangular.value)}`,
    ),
    equivalentSeriesResistance: makeComputedValue(
      'equivalent-series-resistance',
      'Equivalent series resistance',
      'resistance',
      syntheticSolvedResult('resistance', scalar(equivalentSeriesResistanceValue)),
      'This is the real part of the reduced equivalent series impedance.',
    ),
    equivalentSeriesReactance: makeComputedValue(
      'equivalent-series-reactance',
      'Equivalent series reactance',
      'netReactance',
      syntheticSolvedResult('netReactance', scalar(equivalentSeriesReactanceValue)),
      'This is the imaginary part of the reduced equivalent series impedance.',
    ),
    powerFactor: makeComputedValue(
      'power-factor',
      'Power factor',
      'powerFactor',
      powerFactor,
      `Overall network behavior is ${leadLagText(netSusceptance)}.`,
    ),
  } as GuidedParallelCircuitSolved['reference']

  const excitation = resolveSourceExcitation({
    admittance: admittanceRectangular.value,
    admittanceMagnitude: admittanceMagnitude.value,
    conductance: totalConductance,
    capacitiveSusceptance: totalCapacitiveSusceptance,
    inductiveSusceptance: totalInductiveSusceptance,
    sourceVoltage: sourceVoltage.value,
    sourceCurrentPhasor: sourceCurrentPhasor.value,
  })

  if (excitation.error) {
    return {
      status: 'invalid',
      message: excitation.error,
    }
  }

  if (excitation.value) {
    const {
      sourceVoltagePhasor,
      sourceVoltageMagnitude,
      sourceCurrentMagnitudeResult,
      sourceCurrentPhasorResult,
      resistorCurrentMagnitudeResult,
      resistorCurrentPhasor,
      inductorCurrentMagnitudeResult,
      inductorCurrentPhasor,
      capacitorCurrentMagnitudeResult,
      capacitorCurrentPhasor,
      realPowerResult,
    } = excitation.value

    reference.sourceVoltagePhasor = makeComputedValue(
      'source-voltage-phasor',
      'Source voltage phasor',
      'phasorSourceVoltage',
      sourceVoltagePhasor,
      `Magnitude: ${formatQuantitySmart('voltage', sourceVoltageMagnitude)}`,
    )
    reference.sourceCurrent = makeComputedValue(
      'source-current',
      'Source current',
      'current',
      sourceCurrentMagnitudeResult,
      `Current phasor: ${formatQuantitySmart('phasorCurrent', sourceCurrentPhasorResult.value)}`,
    )
    reference.resistorCurrent = makeComputedValue(
      'resistor-current',
      'Current through the total resistive branch',
      'current',
      resistorCurrentMagnitudeResult,
      `Current phasor: ${formatQuantitySmart('phasorCurrent', resistorCurrentPhasor)}`,
    )
    reference.inductorCurrent = makeComputedValue(
      'inductor-current',
      'Current through the total inductive branch',
      'current',
      inductorCurrentMagnitudeResult,
      `Current phasor: ${formatQuantitySmart('phasorCurrent', inductorCurrentPhasor)}`,
    )
    reference.capacitorCurrent = makeComputedValue(
      'capacitor-current',
      'Current through the total capacitive branch',
      'current',
      capacitorCurrentMagnitudeResult,
      `Current phasor: ${formatQuantitySmart('phasorCurrent', capacitorCurrentPhasor)}`,
    )
    reference.realPower = makeComputedValue(
      'real-power',
      'Real power delivered',
      'realPower',
      realPowerResult,
      `Computed from source voltage and total conductance.`,
    )
  }

  const output = pickGoalOutput(goal, reference)
  if (!output) {
    return {
      status: 'invalid',
      message:
        'The selected guided goal needs source-dependent results, but they were not available. Enter the source voltage or source current phasor and try again.',
    }
  }

  return {
    status: 'solved',
    goal,
    contributions,
    totals: {
      conductance: totalConductance,
      inductiveSusceptance: totalInductiveSusceptance,
      capacitiveSusceptance: totalCapacitiveSusceptance,
      netSusceptance,
    },
    output,
    reference,
  }
}

function pickGoalOutput(
  goal: GuidedParallelGoal,
  reference: GuidedParallelCircuitSolved['reference'],
): GuidedComputedValue | undefined {
  switch (goal) {
    case 'parallel-admittance':
      return reference.admittanceRectangular
    case 'parallel-admittance-angle':
      return reference.admittanceAngle
    case 'parallel-impedance':
      return reference.impedanceRectangular
    case 'parallel-equivalent-series-resistance':
      return reference.equivalentSeriesResistance
    case 'parallel-equivalent-series-reactance':
      return reference.equivalentSeriesReactance
    case 'parallel-source-current':
      return reference.sourceCurrent
    case 'parallel-power-factor':
      return reference.powerFactor
    case 'parallel-real-power':
      return reference.realPower
    case 'parallel-resistor-current':
      return reference.resistorCurrent
    case 'parallel-inductor-current':
      return reference.inductorCurrent
    case 'parallel-capacitor-current':
      return reference.capacitorCurrent
  }
}

function makeComputedValue(
  key: string,
  label: string,
  quantityId: GuidedComputedValue['quantityId'],
  result: SolveResult,
  secondaryText?: string,
): GuidedComputedValue {
  return {
    key,
    label,
    quantityId,
    result,
    secondaryText,
  }
}

function syntheticSolvedResult(quantityId: QuantityId, value: QuantityValue): SolveResult {
  return {
    status: 'solved',
    target: quantityId,
    value,
    steps: [],
  }
}

function parseSourceVoltage(rawValue: string, unitId: string) {
  if (rawValue.trim().length === 0) {
    return {
      value: undefined as ReturnType<typeof scalar> | undefined,
      error: undefined as string | undefined,
    }
  }

  const parsed = parseAndNormalizeValue(quantityMap.voltage, rawValue, unitId)
  if (!parsed.value || parsed.error || parsed.value.kind !== 'scalar') {
    return {
      value: undefined,
      error: parsed.error ?? 'Enter a valid source voltage value.',
    }
  }

  return { value: parsed.value, error: undefined }
}

function parseSourceCurrentPhasor(rawValue: string, unitId: string) {
  if (rawValue.trim().length === 0) {
    return {
      value: undefined as ReturnType<typeof complex> | undefined,
      error: undefined as string | undefined,
    }
  }

  const parsed = parseAndNormalizeValue(quantityMap.phasorCurrent, rawValue, unitId)
  if (!parsed.value || parsed.error || parsed.value.kind !== 'complex') {
    return {
      value: undefined,
      error: parsed.error ?? 'Enter a valid source current phasor.',
    }
  }

  return { value: parsed.value, error: undefined }
}

function processComponent(
  component: GuidedComponentInput,
  label: string,
  frequencyRawValue: string,
  frequencyUnitId: string,
):
  | {
      status: 'solved'
      admittanceType: 'conductance' | 'inductiveSusceptance' | 'capacitiveSusceptance'
      valueInSiemens: number
      contribution: GuidedContribution
    }
  | GuidedParallelCircuitInvalid {
  if (component.kind === 'resistor') {
    const resistanceParsed = parseAndNormalizeValue(quantityMap.resistance, component.rawValue, component.unitId)
    const conductanceSolve = solveCircuitProblem('conductance', [
      { quantityId: 'resistance', rawValue: component.rawValue, unitId: component.unitId },
    ])

    if (
      !resistanceParsed.value ||
      resistanceParsed.error ||
      resistanceParsed.value.kind !== 'scalar' ||
      conductanceSolve.status !== 'solved' ||
      conductanceSolve.value.kind !== 'scalar'
    ) {
      return invalidFor(label, resistanceParsed.error ?? 'The resistor value could not be converted into conductance.')
    }

    return {
      status: 'solved',
      admittanceType: 'conductance',
      valueInSiemens: conductanceSolve.value.value,
      contribution: {
        id: component.id,
        label,
        entered: formatQuantityInBaseUnit('resistance', resistanceParsed.value),
        contributesAs: `Converted to G = ${formatQuantityInBaseUnit('conductance', conductanceSolve.value)}`,
        formulaUsed: conductanceSolve.steps.at(-1)?.formula,
      },
    }
  }

  if (component.kind === 'inductor' && component.valueMode === 'reactance') {
    const reactanceParsed = parseAndNormalizeValue(quantityMap.inductiveReactance, component.rawValue, component.unitId)
    const susceptanceSolve = solveCircuitProblem('inductiveSusceptance', [
      { quantityId: 'inductiveReactance', rawValue: component.rawValue, unitId: component.unitId },
    ])

    if (
      !reactanceParsed.value ||
      reactanceParsed.error ||
      reactanceParsed.value.kind !== 'scalar' ||
      susceptanceSolve.status !== 'solved' ||
      susceptanceSolve.value.kind !== 'scalar'
    ) {
      return invalidFor(label, reactanceParsed.error ?? 'The inductor reactance could not be converted into susceptance.')
    }

    return {
      status: 'solved',
      admittanceType: 'inductiveSusceptance',
      valueInSiemens: susceptanceSolve.value.value,
      contribution: {
        id: component.id,
        label,
        entered: formatQuantityInBaseUnit('inductiveReactance', reactanceParsed.value),
        contributesAs: `Converted to BL = ${formatQuantityInBaseUnit('inductiveSusceptance', susceptanceSolve.value)}`,
        formulaUsed: susceptanceSolve.steps.at(-1)?.formula,
      },
    }
  }

  if (component.kind === 'capacitor' && component.valueMode === 'reactance') {
    const reactanceParsed = parseAndNormalizeValue(quantityMap.capacitiveReactance, component.rawValue, component.unitId)
    const susceptanceSolve = solveCircuitProblem('capacitiveSusceptance', [
      { quantityId: 'capacitiveReactance', rawValue: component.rawValue, unitId: component.unitId },
    ])

    if (
      !reactanceParsed.value ||
      reactanceParsed.error ||
      reactanceParsed.value.kind !== 'scalar' ||
      susceptanceSolve.status !== 'solved' ||
      susceptanceSolve.value.kind !== 'scalar'
    ) {
      return invalidFor(label, reactanceParsed.error ?? 'The capacitor reactance could not be converted into susceptance.')
    }

    return {
      status: 'solved',
      admittanceType: 'capacitiveSusceptance',
      valueInSiemens: susceptanceSolve.value.value,
      contribution: {
        id: component.id,
        label,
        entered: formatQuantityInBaseUnit('capacitiveReactance', reactanceParsed.value),
        contributesAs: `Converted to BC = ${formatQuantityInBaseUnit('capacitiveSusceptance', susceptanceSolve.value)}`,
        formulaUsed: susceptanceSolve.steps.at(-1)?.formula,
      },
    }
  }

  if (component.kind === 'inductor' && component.valueMode === 'inductance') {
    const inductanceParsed = parseAndNormalizeValue(quantityMap.inductance, component.rawValue, component.unitId)
    const reactanceSolve = solveCircuitProblem('inductiveReactance', [
      { quantityId: 'frequency', rawValue: frequencyRawValue, unitId: frequencyUnitId },
      { quantityId: 'inductance', rawValue: component.rawValue, unitId: component.unitId },
    ])
    const susceptanceSolve = solveCircuitProblem('inductiveSusceptance', [
      { quantityId: 'frequency', rawValue: frequencyRawValue, unitId: frequencyUnitId },
      { quantityId: 'inductance', rawValue: component.rawValue, unitId: component.unitId },
    ])

    if (
      !inductanceParsed.value ||
      inductanceParsed.error ||
      inductanceParsed.value.kind !== 'scalar' ||
      reactanceSolve.status !== 'solved' ||
      reactanceSolve.value.kind !== 'scalar' ||
      susceptanceSolve.status !== 'solved' ||
      susceptanceSolve.value.kind !== 'scalar'
    ) {
      return invalidFor(label, inductanceParsed.error ?? 'The inductor value could not be converted into susceptance.')
    }

    return {
      status: 'solved',
      admittanceType: 'inductiveSusceptance',
      valueInSiemens: susceptanceSolve.value.value,
      contribution: {
        id: component.id,
        label,
        entered: formatQuantityInBaseUnit('inductance', inductanceParsed.value),
        contributesAs:
          `Converted to XL = ${formatQuantityInBaseUnit('inductiveReactance', reactanceSolve.value)} and BL = ${formatQuantityInBaseUnit('inductiveSusceptance', susceptanceSolve.value)}`,
        formulaUsed: susceptanceSolve.steps.at(-1)?.formula,
      },
    }
  }

  if (component.kind === 'capacitor' && component.valueMode === 'capacitance') {
    const capacitanceParsed = parseAndNormalizeValue(quantityMap.capacitance, component.rawValue, component.unitId)
    const reactanceSolve = solveCircuitProblem('capacitiveReactance', [
      { quantityId: 'frequency', rawValue: frequencyRawValue, unitId: frequencyUnitId },
      { quantityId: 'capacitance', rawValue: component.rawValue, unitId: component.unitId },
    ])
    const susceptanceSolve = solveCircuitProblem('capacitiveSusceptance', [
      { quantityId: 'frequency', rawValue: frequencyRawValue, unitId: frequencyUnitId },
      { quantityId: 'capacitance', rawValue: component.rawValue, unitId: component.unitId },
    ])

    if (
      !capacitanceParsed.value ||
      capacitanceParsed.error ||
      capacitanceParsed.value.kind !== 'scalar' ||
      reactanceSolve.status !== 'solved' ||
      reactanceSolve.value.kind !== 'scalar' ||
      susceptanceSolve.status !== 'solved' ||
      susceptanceSolve.value.kind !== 'scalar'
    ) {
      return invalidFor(label, capacitanceParsed.error ?? 'The capacitor value could not be converted into susceptance.')
    }

    return {
      status: 'solved',
      admittanceType: 'capacitiveSusceptance',
      valueInSiemens: susceptanceSolve.value.value,
      contribution: {
        id: component.id,
        label,
        entered: formatQuantityInBaseUnit('capacitance', capacitanceParsed.value),
        contributesAs:
          `Converted to XC = ${formatQuantityInBaseUnit('capacitiveReactance', reactanceSolve.value)} and BC = ${formatQuantityInBaseUnit('capacitiveSusceptance', susceptanceSolve.value)}`,
        formulaUsed: susceptanceSolve.steps.at(-1)?.formula,
      },
    }
  }

  return invalidFor(label, 'This component type is not supported in guided parallel mode yet.')
}

function goalNeedsSourceExcitation(goal: GuidedParallelGoal): boolean {
  return (
    goal === 'parallel-source-current' ||
    goal === 'parallel-real-power' ||
    goal === 'parallel-resistor-current' ||
    goal === 'parallel-inductor-current' ||
    goal === 'parallel-capacitor-current'
  )
}

function leadLagText(netSusceptance: number): string {
  if (Math.abs(netSusceptance) <= EPSILON) {
    return 'in phase'
  }

  return netSusceptance > 0 ? 'leading' : 'lagging'
}

function invalidFor(label: string, message: string): GuidedParallelCircuitInvalid {
  return {
    status: 'invalid',
    message: `${label}: ${message}`,
  }
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

type SolvedRuleResult = Extract<SolveResult, { status: 'solved' }>

interface ResolvedSourceExcitation {
  sourceVoltagePhasor: SolvedRuleResult
  sourceVoltageMagnitude: ReturnType<typeof scalar>
  sourceCurrentMagnitudeResult: SolvedRuleResult
  sourceCurrentPhasorResult: SolvedRuleResult
  resistorCurrentMagnitudeResult: SolvedRuleResult
  resistorCurrentPhasor: ReturnType<typeof complex>
  inductorCurrentMagnitudeResult: SolvedRuleResult
  inductorCurrentPhasor: ReturnType<typeof complex>
  capacitorCurrentMagnitudeResult: SolvedRuleResult
  capacitorCurrentPhasor: ReturnType<typeof complex>
  realPowerResult: SolvedRuleResult
}

function resolveSourceExcitation(input: {
  admittance: GuidedParallelCircuitSolved['reference']['admittanceRectangular']['result'] extends SolveResult
    ? Extract<SolveResult, { status: 'solved' }>['value']
    : never
  admittanceMagnitude: GuidedParallelCircuitSolved['reference']['admittanceMagnitude']['result'] extends SolveResult
    ? Extract<SolveResult, { status: 'solved' }>['value']
    : never
  conductance: number
  inductiveSusceptance: number
  capacitiveSusceptance: number
  sourceVoltage?: ReturnType<typeof scalar>
  sourceCurrentPhasor?: ReturnType<typeof complex>
}): { value?: ResolvedSourceExcitation; error?: string } {
  if (!input.sourceVoltage && !input.sourceCurrentPhasor) {
    return { value: undefined, error: undefined }
  }

  const totalAdmittance = input.admittance
  if (totalAdmittance.kind !== 'complex') {
    return { value: undefined, error: 'The total admittance could not be represented as a phasor.' }
  }

  let sourceVoltagePhasor: ReturnType<typeof complex>
  let sourceVoltageMagnitude = input.sourceVoltage ?? scalar(0)
  let sourceCurrentPhasor = input.sourceCurrentPhasor

  if (input.sourceVoltage) {
    sourceVoltagePhasor = complex(input.sourceVoltage.value, 0)
    if (!sourceCurrentPhasor) {
      sourceCurrentPhasor = multiplyComplex(sourceVoltagePhasor, totalAdmittance)
    } else {
      const derivedSourceCurrent = multiplyComplex(sourceVoltagePhasor, totalAdmittance)
      if (!complexesMatch(derivedSourceCurrent, sourceCurrentPhasor)) {
        return {
          value: undefined,
          error:
            'The entered source voltage and source current phasor do not match the network admittance. Clear one of them or correct the values.',
        }
      }
    }
  } else {
    if (Math.abs(totalAdmittance.real) <= EPSILON && Math.abs(totalAdmittance.imag) <= EPSILON) {
      return {
        value: undefined,
        error:
          'The total admittance is zero, so the source voltage cannot be derived from the entered current phasor.',
      }
    }

    sourceVoltagePhasor = divideComplex(sourceCurrentPhasor!, totalAdmittance)
    sourceVoltageMagnitude = scalar(magnitude(sourceVoltagePhasor))
  }

  const sourceCurrentMagnitude = scalar(magnitude(sourceCurrentPhasor!))
  const resistorCurrentPhasor = multiplyComplex(sourceVoltagePhasor, complex(input.conductance, 0))
  const inductorCurrentPhasor = multiplyComplex(
    sourceVoltagePhasor,
    complex(0, -input.inductiveSusceptance),
  )
  const capacitorCurrentPhasor = multiplyComplex(
    sourceVoltagePhasor,
    complex(0, input.capacitiveSusceptance),
  )

  const sourceVoltagePhasorResult = input.sourceVoltage
    ? solveWithRules({
        target: 'phasorSourceVoltage',
        knowns: {
          voltage: input.sourceVoltage,
          polarAngle: scalar(0),
        },
      })
    : manualSolved('phasorSourceVoltage', sourceVoltagePhasor)
  const sourceCurrentMagnitudeResult = input.sourceVoltage
    ? solveWithRules({
        target: 'current',
        knowns: {
          voltage: input.sourceVoltage,
          admittanceMagnitude: input.admittanceMagnitude,
        },
      })
    : manualSolved('current', sourceCurrentMagnitude)
  const sourceCurrentPhasorResult = input.sourceVoltage
    ? solveWithRules({
        target: 'phasorCurrent',
        knowns: {
          phasorSourceVoltage: sourceVoltagePhasor,
          admittanceComplex: totalAdmittance,
        },
      })
    : manualSolved('phasorCurrent', sourceCurrentPhasor!)
  const resistorCurrentMagnitudeResult = input.sourceVoltage
    ? solveWithRules({
        target: 'current',
        knowns: {
          voltage: input.sourceVoltage,
          conductance: scalar(input.conductance),
        },
      })
    : manualSolved('current', scalar(magnitude(resistorCurrentPhasor)))
  const inductorCurrentMagnitudeResult = input.sourceVoltage
    ? solveWithRules({
        target: 'current',
        knowns: {
          voltage: input.sourceVoltage,
          inductiveSusceptance: scalar(input.inductiveSusceptance),
        },
      })
    : manualSolved('current', scalar(magnitude(inductorCurrentPhasor)))
  const capacitorCurrentMagnitudeResult = input.sourceVoltage
    ? solveWithRules({
        target: 'current',
        knowns: {
          voltage: input.sourceVoltage,
          capacitiveSusceptance: scalar(input.capacitiveSusceptance),
        },
      })
    : manualSolved('current', scalar(magnitude(capacitorCurrentPhasor)))
  const realPowerResult = input.sourceVoltage
    ? solveWithRules({
        target: 'realPower',
        knowns: {
          voltage: input.sourceVoltage,
          conductance: scalar(input.conductance),
        },
      })
    : manualSolved('realPower', scalar((sourceVoltageMagnitude.value ** 2) * input.conductance))

  const results = [
    sourceVoltagePhasorResult,
    sourceCurrentMagnitudeResult,
    sourceCurrentPhasorResult,
    resistorCurrentMagnitudeResult,
    inductorCurrentMagnitudeResult,
    capacitorCurrentMagnitudeResult,
    realPowerResult,
  ]
  if (results.some((result) => result.status !== 'solved')) {
    return {
      value: undefined,
      error:
        'The entered source excitation was valid, but one of the parallel phasor quantities could not be determined.',
    }
  }

  return {
    value: {
      sourceVoltagePhasor: sourceVoltagePhasorResult as SolvedRuleResult,
      sourceVoltageMagnitude,
      sourceCurrentMagnitudeResult: sourceCurrentMagnitudeResult as SolvedRuleResult,
      sourceCurrentPhasorResult: sourceCurrentPhasorResult as SolvedRuleResult,
      resistorCurrentMagnitudeResult: resistorCurrentMagnitudeResult as SolvedRuleResult,
      resistorCurrentPhasor,
      inductorCurrentMagnitudeResult: inductorCurrentMagnitudeResult as SolvedRuleResult,
      inductorCurrentPhasor,
      capacitorCurrentMagnitudeResult: capacitorCurrentMagnitudeResult as SolvedRuleResult,
      capacitorCurrentPhasor,
      realPowerResult: realPowerResult as SolvedRuleResult,
    },
    error: undefined,
  }
}

function manualSolved(target: QuantityId, value: QuantityValue): SolveResult {
  return {
    status: 'solved',
    target,
    value,
    steps: [],
  }
}

function complexesMatch(left: ReturnType<typeof complex>, right: ReturnType<typeof complex>) {
  const scale = Math.max(
    Math.hypot(left.real, left.imag),
    Math.hypot(right.real, right.imag),
    1,
  )
  return (
    Math.abs(left.real - right.real) <= scale * 1e-6 &&
    Math.abs(left.imag - right.imag) <= scale * 1e-6
  )
}
