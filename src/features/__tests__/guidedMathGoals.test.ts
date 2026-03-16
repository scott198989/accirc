import { describe, expect, it } from 'vitest'
import { solveGuidedMathGoal, guidedMathGoalMap } from '../guidedMathGoals'

describe('guidedMathGoals', () => {
  it('solves period from frequency through a chapter goal', () => {
    const result = solveGuidedMathGoal(guidedMathGoalMap['period-from-frequency'], [
      { quantityId: 'frequency', rawValue: '60', unitId: 'hz' },
    ])

    expect(result.status).toBe('solved')
    if (result.status !== 'solved' || result.value.kind !== 'scalar') {
      return
    }

    expect(result.value.value).toBeCloseTo(1 / 60, 8)
  })

  it('solves total capacitance from a comma-separated parallel list', () => {
    const result = solveGuidedMathGoal(guidedMathGoalMap['parallel-capacitance-total'], [
      { quantityId: 'parallelCapacitorList', rawValue: '1, 2.2, 4.7', unitId: 'uf' },
    ])

    expect(result.status).toBe('solved')
    if (result.status !== 'solved' || result.value.kind !== 'scalar') {
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
})
