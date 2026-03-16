import { complex, scalar } from '../core/complex'
import { formatQuantityInBaseUnit, formatQuantitySmart } from '../core/format'
import { quantityMap } from '../core/quantities'
import { solveWithRules } from '../core/ruleEngine'
import { solveCircuitProblem } from '../core/solver'
import type { QuantityId, QuantityValue, SolveResult } from '../core/types'
import { parseAndNormalizeValue } from '../core/units'

export type GuidedComponentKind = 'resistor' | 'inductor' | 'capacitor'
export type GuidedValueMode = 'resistance' | 'reactance' | 'inductance' | 'capacitance'
export type GuidedSeriesGoal =
  | 'series-impedance'
  | 'series-phase-angle'
  | 'series-power-factor'
  | 'series-source-current'
  | 'series-resistor-voltage'
  | 'series-inductor-voltage'
  | 'series-capacitor-voltage'
  | 'series-real-power'

export interface GuidedComponentInput {
  id: string
  label?: string
  kind: GuidedComponentKind
  valueMode: GuidedValueMode
  rawValue: string
  unitId: string
}

export interface GuidedSeriesImpedanceInput {
  goal?: GuidedSeriesGoal
  frequencyRawValue: string
  frequencyUnitId: string
  sourceVoltageRawValue?: string
  sourceVoltageUnitId?: string
  components: GuidedComponentInput[]
}

export interface GuidedContribution {
  id: string
  label: string
  entered: string
  contributesAs: string
  formulaUsed?: string
  valueInOhms?: number
}

export interface GuidedComputedValue {
  key: string
  label: string
  quantityId: QuantityId
  result: SolveResult
  secondaryText?: string
}

export interface GuidedSeriesImpedanceSolved {
  status: 'solved'
  goal: GuidedSeriesGoal
  contributions: GuidedContribution[]
  totals: {
    resistance: number
    inductiveReactance: number
    capacitiveReactance: number
    netReactance: number
  }
  output: GuidedComputedValue
  reference: {
    rectangular: GuidedComputedValue
    magnitude: GuidedComputedValue
    phase: GuidedComputedValue
    powerFactor: GuidedComputedValue
    sourceCurrent?: GuidedComputedValue
    resistorVoltage?: GuidedComputedValue
    inductorVoltage?: GuidedComputedValue
    capacitorVoltage?: GuidedComputedValue
    realPower?: GuidedComputedValue
  }
}

export interface GuidedSeriesImpedanceInvalid {
  status: 'invalid'
  message: string
}

export type GuidedSeriesImpedanceResult =
  | GuidedSeriesImpedanceSolved
  | GuidedSeriesImpedanceInvalid

export function solveGuidedSeriesImpedance(
  input: GuidedSeriesImpedanceInput,
): GuidedSeriesImpedanceResult {
  const goal = input.goal ?? 'series-impedance'
  const components = input.components.filter((component) => component.rawValue.trim().length > 0)

  if (components.length === 0) {
    return {
      status: 'invalid',
      message: 'Add at least one component before solving.',
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

  if (goalNeedsSourceVoltage(goal) && !sourceVoltage.value) {
    return {
      status: 'invalid',
      message:
        'This guided goal needs the source voltage. Enter the supply voltage magnitude and unit before solving.',
    }
  }

  let totalResistance = 0
  let totalInductiveReactance = 0
  let totalCapacitiveReactance = 0

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

    if (processed.reactanceType === 'resistance') {
      totalResistance += processed.valueInOhms
    } else if (processed.reactanceType === 'inductiveReactance') {
      totalInductiveReactance += processed.valueInOhms
    } else {
      totalCapacitiveReactance += processed.valueInOhms
    }
  }

  const aggregateRows = [
    { quantityId: 'resistance' as const, rawValue: String(totalResistance), unitId: 'ohm' },
    {
      quantityId: 'inductiveReactance' as const,
      rawValue: String(totalInductiveReactance),
      unitId: 'ohm',
    },
    {
      quantityId: 'capacitiveReactance' as const,
      rawValue: String(totalCapacitiveReactance),
      unitId: 'ohm',
    },
  ]

  const rectangular = solveCircuitProblem('impedanceComplex', aggregateRows)
  const magnitude = solveCircuitProblem('impedanceMagnitude', aggregateRows)
  const phase = solveCircuitProblem('phaseAngle', aggregateRows)

  if (
    rectangular.status !== 'solved' ||
    magnitude.status !== 'solved' ||
    phase.status !== 'solved'
  ) {
    return {
      status: 'invalid',
      message:
        'The guided component data did not produce a clean impedance solve. Please check the entered values.',
    }
  }

  const powerFactor = solveWithRules({
    target: 'powerFactor',
    knowns: {
      phaseAngle: phase.value,
    },
  })

  if (powerFactor.status !== 'solved') {
    return {
      status: 'invalid',
      message: 'Power factor could not be derived from the phase angle.',
    }
  }

  const reference = {
    rectangular: makeComputedValue(
      'rectangular',
      'Total impedance in rectangular form',
      'impedanceComplex',
      rectangular,
      `Polar form: ${formatQuantitySmart('impedanceMagnitude', magnitude.value)} angle ${formatQuantitySmart('phaseAngle', phase.value)}`,
    ),
    magnitude: makeComputedValue(
      'magnitude',
      'Total impedance magnitude',
      'impedanceMagnitude',
      magnitude,
      `Rectangular form: ${formatQuantitySmart('impedanceComplex', rectangular.value)}`,
    ),
    phase: makeComputedValue(
      'phase',
      'Phase angle',
      'phaseAngle',
      phase,
      `Power factor: ${formatQuantitySmart('powerFactor', powerFactor.value)}`,
    ),
    powerFactor: makeComputedValue(
      'power-factor',
      'Power factor',
      'powerFactor',
      powerFactor,
      `Phase angle: ${formatQuantitySmart('phaseAngle', phase.value)}`,
    ),
  } as GuidedSeriesImpedanceSolved['reference']

  if (sourceVoltage.value) {
    const currentMagnitude = solveWithRules({
      target: 'current',
      knowns: {
        voltage: sourceVoltage.value,
        impedanceMagnitude: magnitude.value,
      },
    })

    const currentPhasor = solveWithRules({
      target: 'phasorCurrent',
      knowns: {
        phasorSourceVoltage: complex(sourceVoltage.value.value, 0),
        impedanceComplex: rectangular.value,
      },
    })

    if (currentMagnitude.status !== 'solved' || currentPhasor.status !== 'solved') {
      return {
        status: 'invalid',
        message: 'Source current could not be derived from the source voltage and total impedance.',
      }
    }

    const resistorVoltage = solveWithRules({
      target: 'resistorVoltagePhasor',
      knowns: {
        phasorCurrent: currentPhasor.value,
        resistance: scalar(totalResistance),
      },
    })

    const inductorVoltage = solveWithRules({
      target: 'inductorVoltagePhasor',
      knowns: {
        phasorCurrent: currentPhasor.value,
        inductiveReactance: scalar(totalInductiveReactance),
      },
    })

    const capacitorVoltage = solveWithRules({
      target: 'capacitorVoltagePhasor',
      knowns: {
        phasorCurrent: currentPhasor.value,
        capacitiveReactance: scalar(totalCapacitiveReactance),
      },
    })

    const realPower = solveWithRules({
      target: 'realPower',
      knowns: {
        current: currentMagnitude.value,
        resistance: scalar(totalResistance),
      },
    })

    if (
      resistorVoltage.status !== 'solved' ||
      inductorVoltage.status !== 'solved' ||
      capacitorVoltage.status !== 'solved' ||
      realPower.status !== 'solved'
    ) {
      return {
        status: 'invalid',
        message: 'The source voltage was valid, but one of the series output quantities could not be determined.',
      }
    }

    reference.sourceCurrent = makeComputedValue(
      'source-current',
      'Source current',
      'current',
      currentMagnitude,
      `Current phasor: ${formatQuantitySmart('phasorCurrent', currentPhasor.value)}`,
    )
    reference.resistorVoltage = makeComputedValue(
      'resistor-voltage',
      'Voltage across total series resistance',
      'resistorVoltagePhasor',
      resistorVoltage,
      `Magnitude: ${formatMagnitudeAsVoltage(resistorVoltage.value)}`,
    )
    reference.inductorVoltage = makeComputedValue(
      'inductor-voltage',
      'Voltage across total series inductance',
      'inductorVoltagePhasor',
      inductorVoltage,
      `Magnitude: ${formatMagnitudeAsVoltage(inductorVoltage.value)}`,
    )
    reference.capacitorVoltage = makeComputedValue(
      'capacitor-voltage',
      'Voltage across total series capacitance',
      'capacitorVoltagePhasor',
      capacitorVoltage,
      `Magnitude: ${formatMagnitudeAsVoltage(capacitorVoltage.value)}`,
    )
    reference.realPower = makeComputedValue(
      'real-power',
      'Real power delivered',
      'realPower',
      realPower,
      `Computed with the total series resistance and current.`,
    )
  }

  const output = pickGoalOutput(goal, reference)
  if (!output) {
    return {
      status: 'invalid',
      message:
        'The selected guided goal needs source-dependent results, but they were not available. Enter a source voltage and try again.',
    }
  }

  return {
    status: 'solved',
    goal,
    contributions,
    totals: {
      resistance: totalResistance,
      inductiveReactance: totalInductiveReactance,
      capacitiveReactance: totalCapacitiveReactance,
      netReactance: totalInductiveReactance - totalCapacitiveReactance,
    },
    output,
    reference,
  }
}

function pickGoalOutput(
  goal: GuidedSeriesGoal,
  reference: GuidedSeriesImpedanceSolved['reference'],
): GuidedComputedValue | undefined {
  switch (goal) {
    case 'series-impedance':
      return reference.rectangular
    case 'series-phase-angle':
      return reference.phase
    case 'series-power-factor':
      return reference.powerFactor
    case 'series-source-current':
      return reference.sourceCurrent
    case 'series-resistor-voltage':
      return reference.resistorVoltage
    case 'series-inductor-voltage':
      return reference.inductorVoltage
    case 'series-capacitor-voltage':
      return reference.capacitorVoltage
    case 'series-real-power':
      return reference.realPower
  }
}

function makeComputedValue(
  key: string,
  label: string,
  quantityId: QuantityId,
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

function parseSourceVoltage(rawValue: string, unitId: string) {
  if (rawValue.trim().length === 0) {
    return { value: undefined as ReturnType<typeof scalar> | undefined, error: undefined as string | undefined }
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

function processComponent(
  component: GuidedComponentInput,
  label: string,
  frequencyRawValue: string,
  frequencyUnitId: string,
):
  | {
      status: 'solved'
      reactanceType: 'resistance' | 'inductiveReactance' | 'capacitiveReactance'
      valueInOhms: number
      contribution: GuidedContribution
    }
  | GuidedSeriesImpedanceInvalid {
  if (component.kind === 'resistor') {
    const parsed = parseAndNormalizeValue(quantityMap.resistance, component.rawValue, component.unitId)
    if (!parsed.value || parsed.error || parsed.value.kind !== 'scalar') {
      return invalidFor(label, parsed.error ?? 'Enter a valid resistance value.')
    }

    return {
      status: 'solved',
      reactanceType: 'resistance',
      valueInOhms: parsed.value.value,
      contribution: {
        id: component.id,
        label,
        entered: formatQuantityInBaseUnit('resistance', parsed.value),
        contributesAs: `Series resistance contribution: ${formatQuantityInBaseUnit('resistance', parsed.value)}`,
      },
    }
  }

  if (component.kind === 'inductor' && component.valueMode === 'reactance') {
    const parsed = parseAndNormalizeValue(quantityMap.inductiveReactance, component.rawValue, component.unitId)
    if (!parsed.value || parsed.error || parsed.value.kind !== 'scalar') {
      return invalidFor(label, parsed.error ?? 'Enter a valid inductive reactance value.')
    }

    return {
      status: 'solved',
      reactanceType: 'inductiveReactance',
      valueInOhms: parsed.value.value,
      contribution: {
        id: component.id,
        label,
        entered: formatQuantityInBaseUnit('inductiveReactance', parsed.value),
        contributesAs: `Inductive reactance contribution: ${formatQuantityInBaseUnit('inductiveReactance', parsed.value)}`,
      },
    }
  }

  if (component.kind === 'capacitor' && component.valueMode === 'reactance') {
    const parsed = parseAndNormalizeValue(quantityMap.capacitiveReactance, component.rawValue, component.unitId)
    if (!parsed.value || parsed.error || parsed.value.kind !== 'scalar') {
      return invalidFor(label, parsed.error ?? 'Enter a valid capacitive reactance value.')
    }

    return {
      status: 'solved',
      reactanceType: 'capacitiveReactance',
      valueInOhms: parsed.value.value,
      contribution: {
        id: component.id,
        label,
        entered: formatQuantityInBaseUnit('capacitiveReactance', parsed.value),
        contributesAs: `Capacitive reactance contribution: ${formatQuantityInBaseUnit('capacitiveReactance', parsed.value)}`,
      },
    }
  }

  if (component.kind === 'inductor' && component.valueMode === 'inductance') {
    const reactanceSolve = solveCircuitProblem('inductiveReactance', [
      { quantityId: 'frequency', rawValue: frequencyRawValue, unitId: frequencyUnitId },
      { quantityId: 'inductance', rawValue: component.rawValue, unitId: component.unitId },
    ])

    if (reactanceSolve.status !== 'solved' || reactanceSolve.value.kind !== 'scalar') {
      return invalidFor(label, 'The inductor value could not be converted into reactance.')
    }

    const inductanceParsed = parseAndNormalizeValue(quantityMap.inductance, component.rawValue, component.unitId)
    if (!inductanceParsed.value || inductanceParsed.value.kind !== 'scalar') {
      return invalidFor(label, 'Enter a valid inductance value.')
    }

    return {
      status: 'solved',
      reactanceType: 'inductiveReactance',
      valueInOhms: reactanceSolve.value.value,
      contribution: {
        id: component.id,
        label,
        entered: formatQuantityInBaseUnit('inductance', inductanceParsed.value),
        contributesAs: `Converted to XL = ${formatQuantityInBaseUnit('inductiveReactance', reactanceSolve.value)}`,
        formulaUsed: reactanceSolve.steps.at(-1)?.formula,
      },
    }
  }

  if (component.kind === 'capacitor' && component.valueMode === 'capacitance') {
    const reactanceSolve = solveCircuitProblem('capacitiveReactance', [
      { quantityId: 'frequency', rawValue: frequencyRawValue, unitId: frequencyUnitId },
      { quantityId: 'capacitance', rawValue: component.rawValue, unitId: component.unitId },
    ])

    if (reactanceSolve.status !== 'solved' || reactanceSolve.value.kind !== 'scalar') {
      return invalidFor(label, 'The capacitor value could not be converted into reactance.')
    }

    const capacitanceParsed = parseAndNormalizeValue(quantityMap.capacitance, component.rawValue, component.unitId)
    if (!capacitanceParsed.value || capacitanceParsed.value.kind !== 'scalar') {
      return invalidFor(label, 'Enter a valid capacitance value.')
    }

    return {
      status: 'solved',
      reactanceType: 'capacitiveReactance',
      valueInOhms: reactanceSolve.value.value,
      contribution: {
        id: component.id,
        label,
        entered: formatQuantityInBaseUnit('capacitance', capacitanceParsed.value),
        contributesAs: `Converted to XC = ${formatQuantityInBaseUnit('capacitiveReactance', reactanceSolve.value)}`,
        formulaUsed: reactanceSolve.steps.at(-1)?.formula,
      },
    }
  }

  return invalidFor(label, 'This component type is not supported in guided impedance mode yet.')
}

function goalNeedsSourceVoltage(goal: GuidedSeriesGoal): boolean {
  return (
    goal === 'series-source-current' ||
    goal === 'series-resistor-voltage' ||
    goal === 'series-inductor-voltage' ||
    goal === 'series-capacitor-voltage' ||
    goal === 'series-real-power'
  )
}

function formatMagnitudeAsVoltage(value: QuantityValue): string {
  if (value.kind !== 'complex') {
    return ''
  }

  const magnitudeValue = Math.hypot(value.real, value.imag)
  return formatQuantitySmart('voltage', scalar(magnitudeValue))
}

function invalidFor(label: string, message: string): GuidedSeriesImpedanceInvalid {
  return {
    status: 'invalid',
    message: `${label}: ${message}`,
  }
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
