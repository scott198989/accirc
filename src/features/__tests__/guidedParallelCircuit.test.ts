import { describe, expect, it } from 'vitest'
import { solveGuidedParallelCircuit } from '../guidedParallelCircuit'

describe('solveGuidedParallelCircuit', () => {
  it('solves example 16.2 style parallel admittance and impedance', () => {
    const result = solveGuidedParallelCircuit({
      goal: 'parallel-impedance',
      frequencyRawValue: '',
      frequencyUnitId: 'hz',
      sourceVoltageRawValue: '',
      sourceVoltageUnitId: 'v',
      components: [
        {
          id: 'r1',
          kind: 'resistor',
          valueMode: 'resistance',
          rawValue: '5',
          unitId: 'ohm',
        },
        {
          id: 'l1',
          kind: 'inductor',
          valueMode: 'reactance',
          rawValue: '8',
          unitId: 'ohm',
        },
        {
          id: 'c1',
          kind: 'capacitor',
          valueMode: 'reactance',
          rawValue: '20',
          unitId: 'ohm',
        },
      ],
    })

    expect(result.status).toBe('solved')
    if (
      result.status !== 'solved' ||
      result.output.result.status !== 'solved' ||
      result.output.result.value.kind !== 'complex'
    ) {
      return
    }

    expect(result.totals.conductance).toBeCloseTo(0.2, 8)
    expect(result.totals.inductiveSusceptance).toBeCloseTo(0.125, 8)
    expect(result.totals.capacitiveSusceptance).toBeCloseTo(0.05, 8)
    expect(result.totals.netSusceptance).toBeCloseTo(-0.075, 8)
    expect(result.output.result.value.real).toBeCloseTo(4.384, 3)
    expect(result.output.result.value.imag).toBeCloseTo(1.644, 3)
  })

  it('converts inductance and capacitance into susceptance before solving', () => {
    const result = solveGuidedParallelCircuit({
      goal: 'parallel-admittance',
      frequencyRawValue: '1',
      frequencyUnitId: 'khz',
      sourceVoltageRawValue: '20',
      sourceVoltageUnitId: 'v',
      components: [
        {
          id: 'r1',
          kind: 'resistor',
          valueMode: 'resistance',
          rawValue: '5',
          unitId: 'ohm',
        },
        {
          id: 'l1',
          kind: 'inductor',
          valueMode: 'inductance',
          rawValue: '1.2732395447',
          unitId: 'mh',
        },
        {
          id: 'c1',
          kind: 'capacitor',
          valueMode: 'capacitance',
          rawValue: '7.9577471546',
          unitId: 'uf',
        },
      ],
    })

    expect(result.status).toBe('solved')
    if (
      result.status !== 'solved' ||
      result.reference.admittanceRectangular.result.status !== 'solved' ||
      result.reference.admittanceRectangular.result.value.kind !== 'complex'
    ) {
      return
    }

    expect(result.reference.admittanceRectangular.result.value.real).toBeCloseTo(0.2, 8)
    expect(result.reference.admittanceRectangular.result.value.imag).toBeCloseTo(-0.075, 4)
  })

  it('requires source voltage for source-current goals', () => {
    const result = solveGuidedParallelCircuit({
      goal: 'parallel-source-current',
      frequencyRawValue: '',
      frequencyUnitId: 'hz',
      sourceVoltageRawValue: '',
      sourceVoltageUnitId: 'v',
      components: [
        {
          id: 'r1',
          kind: 'resistor',
          valueMode: 'resistance',
          rawValue: '20',
          unitId: 'ohm',
        },
      ],
    })

    expect(result.status).toBe('invalid')
  })
})
