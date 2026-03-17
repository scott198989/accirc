import { describe, expect, it } from 'vitest'
import { guidedMathGoalMap, solveGuidedMathGoal } from '../guidedMathGoals'
import {
  solveGuidedSeriesParallelNetwork,
  type GuidedSeriesParallelGroupNode,
} from '../guidedSeriesParallelNetwork'

describe('textbook spot checks', () => {
  it('matches Chapter 10 Problem 23(b) for capacitor charging voltage', () => {
    const goal = guidedMathGoalMap['rc-charging-voltage']
    const result = solveGuidedMathGoal(goal, [
      { quantityId: 'finalVoltage', rawValue: '12', unitId: 'v' },
      { quantityId: 'elapsedTime', rawValue: '50', unitId: 'us' },
      { quantityId: 'timeConstant', rawValue: '100', unitId: 'us' },
    ])

    expect(result.status).toBe('solved')
    if (result.status !== 'solved' || result.value.kind !== 'scalar') {
      return
    }

    expect(result.value.value).toBeCloseTo(4.72, 2)
  })

  it('matches Chapter 10 Problem 57 for stored capacitor energy', () => {
    const goal = guidedMathGoalMap['stored-energy-from-capacitance-and-voltage']
    const result = solveGuidedMathGoal(goal, [
      { quantityId: 'capacitance', rawValue: '120', unitId: 'pf' },
      { quantityId: 'voltage', rawValue: '12', unitId: 'v' },
    ])

    expect(result.status).toBe('solved')
    if (result.status !== 'solved' || result.value.kind !== 'scalar') {
      return
    }

    expect(result.value.value).toBeCloseTo(8.64e-9, 12)
  })

  it('matches the study-guide mica capacitor geometry problem', () => {
    const goal = guidedMathGoalMap['capacitance-from-relative-permittivity-and-geometry']
    const result = solveGuidedMathGoal(goal, [
      { quantityId: 'relativePermittivity', rawValue: '5', unitId: 'unitless' },
      { quantityId: 'plateArea', rawValue: '100', unitId: 'cm2' },
      { quantityId: 'distance', rawValue: '1', unitId: 'mm' },
    ])

    expect(result.status).toBe('solved')
    if (result.status !== 'solved' || result.value.kind !== 'scalar') {
      return
    }

    expect(result.value.value).toBeCloseTo(442.5e-12, 15)
  })

  it('matches the study-guide dielectric-strength maximum-voltage problem', () => {
    const goal = guidedMathGoalMap['maximum-voltage-from-dielectric-strength-and-distance']
    const result = solveGuidedMathGoal(goal, [
      { quantityId: 'dielectricStrength', rawValue: '75', unitId: 'v_per_mil' },
      { quantityId: 'distance', rawValue: '0.05', unitId: 'in' },
    ])

    expect(result.status).toBe('solved')
    if (result.status !== 'solved' || result.value.kind !== 'scalar') {
      return
    }

    expect(result.value.value).toBeCloseTo(3750, 8)
  })

  it('matches Chapter 17 Problem 1 for source current magnitude and phase', () => {
    const root: GuidedSeriesParallelGroupNode = {
      id: 'root',
      type: 'group',
      label: 'ZT',
      topology: 'series',
      children: [
        {
          id: 'xl1',
          type: 'component',
          label: 'XL1',
          kind: 'inductor',
          valueMode: 'reactance',
          rawValue: '4',
          unitId: 'ohm',
        },
        {
          id: 'parallel-block',
          type: 'group',
          label: 'Parallel block',
          topology: 'parallel',
          children: [
            {
              id: 'xc1',
              type: 'component',
              label: 'XC',
              kind: 'capacitor',
              valueMode: 'reactance',
              rawValue: '8',
              unitId: 'ohm',
            },
            {
              id: 'r2',
              type: 'component',
              label: 'R',
              kind: 'resistor',
              valueMode: 'resistance',
              rawValue: '12',
              unitId: 'ohm',
            },
          ],
        },
      ],
    }

    const result = solveGuidedSeriesParallelNetwork({
      goal: 'series-parallel-source-current',
      frequencyRawValue: '',
      frequencyUnitId: 'hz',
      sourceVoltageRawValue: '14',
      sourceVoltageUnitId: 'v',
      root,
    })

    expect(result.status).toBe('solved')
    if (
      result.status !== 'solved' ||
      !result.reference.sourceCurrent ||
      !result.reference.sourceCurrentPhasor
    ) {
      return
    }

    expect(result.reference.sourceCurrent.value).toBeCloseTo(3.5, 2)
    expect(Math.atan2(result.reference.sourceCurrentPhasor.imag, result.reference.sourceCurrentPhasor.real)).toBeCloseTo(
      0.395,
      3,
    )
  })

  it('matches Chapter 17 Problem 7 for V1 and real power', () => {
    const root: GuidedSeriesParallelGroupNode = {
      id: 'root',
      type: 'group',
      label: 'ZT',
      topology: 'parallel',
      children: [
        {
          id: 'xc',
          type: 'component',
          label: 'XC',
          kind: 'capacitor',
          valueMode: 'reactance',
          rawValue: '60',
          unitId: 'ohm',
        },
        {
          id: 'series-branch',
          type: 'group',
          label: 'R1 with shunt branch',
          topology: 'series',
          children: [
            {
              id: 'r1',
              type: 'component',
              label: 'R1',
              kind: 'resistor',
              valueMode: 'resistance',
              rawValue: '10',
              unitId: 'ohm',
            },
            {
              id: 'shunt',
              type: 'group',
              label: 'R2 || XL',
              topology: 'parallel',
              children: [
                {
                  id: 'r2',
                  type: 'component',
                  label: 'R2',
                  kind: 'resistor',
                  valueMode: 'resistance',
                  rawValue: '20',
                  unitId: 'ohm',
                },
                {
                  id: 'xl',
                  type: 'component',
                  label: 'XL',
                  kind: 'inductor',
                  valueMode: 'reactance',
                  rawValue: '80',
                  unitId: 'ohm',
                },
              ],
            },
          ],
        },
      ],
    }

    const result = solveGuidedSeriesParallelNetwork({
      goal: 'series-parallel-real-power',
      frequencyRawValue: '',
      frequencyUnitId: 'hz',
      sourceVoltageRawValue: '40',
      sourceVoltageUnitId: 'v',
      root,
    })

    expect(result.status).toBe('solved')
    if (result.status !== 'solved' || !result.reference.realPower) {
      return
    }

    const v1Node = result.nodeSummaries.find((entry) => entry.label === 'R2 || XL')
    expect(result.reference.realPower.value).toBeCloseTo(54.07, 2)
    expect(v1Node?.voltagePhasor).toBeDefined()
    if (!v1Node?.voltagePhasor) {
      return
    }

    const v1Magnitude = Math.hypot(v1Node.voltagePhasor.real, v1Node.voltagePhasor.imag)
    const v1Angle = Math.atan2(v1Node.voltagePhasor.imag, v1Node.voltagePhasor.real)
    expect(v1Magnitude).toBeCloseTo(26.57, 2)
    expect(v1Angle).toBeCloseTo(0.083, 3)
  })
})
