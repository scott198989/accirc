import { formatNumber } from '../core/format'
import {
  formatQuantityPolar,
  formatQuantitySmart,
  quantityMap,
  type QuantityId,
  type QuantityValue,
  type SolverInputRow,
} from '../core'
import { parseAndNormalizeValue, pickBestUnit, toDisplayValue } from '../core/units'

export type GuidedWaveformExpressionGoal =
  | 'current-sine-expression-from-phasor'
  | 'voltage-sine-expression-from-phasor'

export interface GuidedWaveformExpressionDetail {
  label: string
  value: string
}

export interface GuidedWaveformExpressionStep {
  formula: string
  explanation: string
}

export interface GuidedWaveformExpressionSolvedResult {
  kind: 'waveform-expression'
  status: 'solved'
  answerLabel: string
  expression: string
  note: string
  details: GuidedWaveformExpressionDetail[]
  steps: GuidedWaveformExpressionStep[]
}

export interface GuidedWaveformExpressionIssueResult {
  kind: 'waveform-expression'
  status: 'invalid' | 'incomplete'
  message: string
}

export type GuidedWaveformExpressionResult =
  | GuidedWaveformExpressionSolvedResult
  | GuidedWaveformExpressionIssueResult

interface GuidedWaveformExpressionConfig {
  phasorQuantityId: 'phasorCurrent' | 'phasorSourceVoltage'
  peakQuantityId: 'peakCurrent' | 'peakVoltage'
  rmsQuantityId: 'rmsCurrent' | 'rmsVoltage'
  outputLabel: string
  waveformSymbol: 'i(t)' | 'v(t)'
}

const guidedWaveformExpressionConfig: Record<
  GuidedWaveformExpressionGoal,
  GuidedWaveformExpressionConfig
> = {
  'current-sine-expression-from-phasor': {
    phasorQuantityId: 'phasorCurrent',
    peakQuantityId: 'peakCurrent',
    rmsQuantityId: 'rmsCurrent',
    outputLabel: 'Sinusoidal current expression',
    waveformSymbol: 'i(t)',
  },
  'voltage-sine-expression-from-phasor': {
    phasorQuantityId: 'phasorSourceVoltage',
    peakQuantityId: 'peakVoltage',
    rmsQuantityId: 'rmsVoltage',
    outputLabel: 'Sinusoidal voltage expression',
    waveformSymbol: 'v(t)',
  },
}

export function solveGuidedWaveformExpression(
  goal: GuidedWaveformExpressionGoal,
  rows: SolverInputRow[],
): GuidedWaveformExpressionResult {
  const config = guidedWaveformExpressionConfig[goal]
  const phasorRow = rows.find((row) => row.quantityId === config.phasorQuantityId)
  const omegaRow = rows.find((row) => row.quantityId === 'angularFrequency')

  if (!phasorRow?.rawValue.trim() || !omegaRow?.rawValue.trim()) {
    return {
      kind: 'waveform-expression',
      status: 'incomplete',
      message: `Enter both the ${quantityMap[config.phasorQuantityId].label.toLowerCase()} and angular frequency to write the sinusoidal expression.`,
    }
  }

  const phasorParsed = parseAndNormalizeValue(
    quantityMap[config.phasorQuantityId],
    phasorRow.rawValue,
    phasorRow.unitId,
  )
  if (!phasorParsed.value || phasorParsed.error || phasorParsed.value.kind !== 'complex') {
    return {
      kind: 'waveform-expression',
      status: 'invalid',
      message:
        phasorParsed.error ??
        `Unable to parse ${quantityMap[config.phasorQuantityId].label.toLowerCase()}.`,
    }
  }

  const omegaParsed = parseAndNormalizeValue(
    quantityMap.angularFrequency,
    omegaRow.rawValue,
    omegaRow.unitId,
  )
  if (!omegaParsed.value || omegaParsed.error || omegaParsed.value.kind !== 'scalar') {
    return {
      kind: 'waveform-expression',
      status: 'invalid',
      message: omegaParsed.error ?? 'Unable to parse angular frequency.',
    }
  }

  if (omegaParsed.value.value <= 0) {
    return {
      kind: 'waveform-expression',
      status: 'invalid',
      message: 'Angular frequency must be greater than zero.',
    }
  }

  const rmsMagnitude = Math.hypot(phasorParsed.value.real, phasorParsed.value.imag)
  const phaseRadians = Math.atan2(phasorParsed.value.imag, phasorParsed.value.real)
  const waveformPhaseDegrees = normalizeAngleDegrees((phaseRadians * 180) / Math.PI + 90)
  const peakValue = toScalarValue(config.peakQuantityId, rmsMagnitude * Math.SQRT2)
  const rmsValue = toScalarValue(config.rmsQuantityId, rmsMagnitude)
  const omegaValue = omegaParsed.value.value
  const amplitude = scalarDisplayParts(config.peakQuantityId, peakValue)
  const omegaText = formatAngularFrequencyExpression(omegaValue)
  const phaseTerm = formatExpressionPhase(waveformPhaseDegrees)
  const expression = `${config.waveformSymbol} = ${amplitude.valueText} sin(${omegaText}t${phaseTerm})${amplitude.unitSuffix}`

  return {
    kind: 'waveform-expression',
    status: 'solved',
    answerLabel: config.outputLabel,
    expression,
    note: 'The app uses the textbook phasor convention here: the phasor magnitude stays RMS, the sine-wave magnitude becomes peak, and the sine-wave phase is the phasor angle plus 90 deg.',
    details: [
      {
        label: `${quantityMap[config.phasorQuantityId].symbol} in polar form`,
        value: formatQuantityPolar(config.phasorQuantityId, phasorParsed.value),
      },
      {
        label: `${quantityMap[config.phasorQuantityId].symbol} in rectangular form`,
        value: formatQuantitySmart(config.phasorQuantityId, phasorParsed.value),
      },
      {
        label: `${quantityMap[config.rmsQuantityId].symbol} from the phasor magnitude`,
        value: formatQuantitySmart(config.rmsQuantityId, rmsValue),
      },
      {
        label: `${quantityMap[config.peakQuantityId].symbol} for the sine expression`,
        value: formatQuantitySmart(config.peakQuantityId, peakValue),
      },
      {
        label: 'Sine-wave phase angle used in the time expression',
        value: `${formatNumber(waveformPhaseDegrees)} deg`,
      },
      {
        label: 'omega used in the time expression',
        value: `${omegaText} rad/s`,
      },
    ],
    steps: [
      {
        formula: `${quantityMap[config.rmsQuantityId].symbol} = |${quantityMap[config.phasorQuantityId].symbol}|`,
        explanation: 'Take the magnitude of the RMS phasor to recover the waveform RMS value.',
      },
      {
        formula: `${quantityMap[config.peakQuantityId].symbol} = sqrt(2) ${quantityMap[config.rmsQuantityId].symbol}`,
        explanation: 'Convert the RMS value back to the peak amplitude used in the sine wave.',
      },
      {
        formula: `${config.waveformSymbol} = ${quantityMap[config.peakQuantityId].symbol} sin(omega t + (angle + 90 deg))`,
        explanation: 'Convert the textbook cosine-reference phasor angle back into the sine-wave phase angle, then keep omega unchanged from the problem statement.',
      },
    ],
  }
}

function formatExpressionPhase(angleDegrees: number): string {
  if (Math.abs(angleDegrees) < 1e-9) {
    return ''
  }

  const sign = angleDegrees >= 0 ? ' + ' : ' - '
  return `${sign}${formatNumber(Math.abs(angleDegrees))} deg`
}

function scalarDisplayParts(quantityId: QuantityId, value: QuantityValue): {
  valueText: string
  unitSuffix: string
} {
  const quantity = quantityMap[quantityId]
  const unit = pickBestUnit(quantity, value)
  const displayValue = toDisplayValue(value, unit)
  if (displayValue.kind !== 'scalar') {
    throw new Error(`Expected ${quantity.label} to display as a scalar.`)
  }

  return {
    valueText: formatNumber(displayValue.value),
    unitSuffix: unit.symbol ? ` ${unit.symbol}` : '',
  }
}

function toScalarValue(quantityId: QuantityId, value: number): QuantityValue {
  if (quantityMap[quantityId].kind !== 'scalar') {
    throw new Error(`Expected ${quantityId} to be a scalar quantity.`)
  }

  return {
    kind: 'scalar',
    value,
  }
}

function normalizeAngleDegrees(angle: number): number {
  let normalized = angle
  while (normalized <= -180) {
    normalized += 360
  }
  while (normalized > 180) {
    normalized -= 360
  }
  return normalized
}

function formatAngularFrequencyExpression(value: number): string {
  if (Number.isInteger(value) && Math.abs(value) < 1e9) {
    return value.toString()
  }

  return formatNumber(value)
}
