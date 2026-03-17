import { describe, expect, it } from 'vitest'
import { solveGuidedMathGoal, guidedMathGoalMap } from '../guidedMathGoals'

describe('guidedMathGoals', () => {
  it('solves period from frequency through a chapter goal', () => {
    const result = solveGuidedMathGoal(guidedMathGoalMap['period-from-frequency'], [
      { quantityId: 'frequency', rawValue: '60', unitId: 'hz' },
    ])

    expect(result.status).toBe('solved')
    if (result.status !== 'solved' || 'kind' in result || result.value.kind !== 'scalar') {
      return
    }

    expect(result.value.value).toBeCloseTo(1 / 60, 8)
  })

  it('solves total capacitance from a comma-separated parallel list', () => {
    const result = solveGuidedMathGoal(guidedMathGoalMap['parallel-capacitance-total'], [
      { quantityId: 'parallelCapacitorList', rawValue: '1, 2.2, 4.7', unitId: 'uf' },
    ])

    expect(result.status).toBe('solved')
    if (result.status !== 'solved' || 'kind' in result || result.value.kind !== 'scalar') {
      return
    }

    expect(result.value.value).toBeCloseTo(7.9e-6, 12)
  })

  it('refuses RC charging voltage without enough known values', () => {
    const result = solveGuidedMathGoal(guidedMathGoalMap['rc-charging-voltage'], [
      { quantityId: 'finalVoltage', rawValue: '10', unitId: 'v' },
      { quantityId: 'elapsedTime', rawValue: '1', unitId: 'ms' },
    ])

    expect(result.status).toBe('incomplete')
  })

  it('solves a current phasor from a sine-wave current expression', () => {
    const result = solveGuidedMathGoal(guidedMathGoalMap['current-phasor-from-sine-expression'], [
      { quantityId: 'peakCurrent', rawValue: '10', unitId: 'ma' },
      { quantityId: 'waveformPhaseAngle', rawValue: '40', unitId: 'deg' },
    ])

    expect(result.status).toBe('solved')
    if (result.status !== 'solved' || !('value' in result) || result.value.kind !== 'complex') {
      return
    }

    expect(Math.hypot(result.value.real, result.value.imag)).toBeCloseTo(7.0710678e-3, 10)
    expect(Math.atan2(result.value.imag, result.value.real)).toBeCloseTo((-50 * Math.PI) / 180, 10)
  })

  it('writes a voltage phasor back into a sine-wave voltage expression', () => {
    const result = solveGuidedMathGoal(guidedMathGoalMap['voltage-sine-expression-from-phasor'], [
      { quantityId: 'phasorSourceVoltage', rawValue: '14.1421356@40deg', unitId: 'v' },
      { quantityId: 'angularFrequency', rawValue: '2500', unitId: 'rad_per_s' },
    ])

    expect(result.status).toBe('solved')
    if (result.status !== 'solved' || !('kind' in result) || result.kind !== 'waveform-expression') {
      return
    }

    expect(result.expression).toBe('v(t) = 20 sin(2500t + 130 deg) V')
  })
})
