import { describe, expect, it } from 'vitest'
import { solveGuidedSeriesImpedance } from '../guidedSeriesImpedance'

describe('solveGuidedSeriesImpedance', () => {
  it('solves figure 15.86(a) from plain component inputs', () => {
    const result = solveGuidedSeriesImpedance({
      goal: 'series-impedance',
      frequencyRawValue: '',
      frequencyUnitId: 'hz',
      sourceVoltageRawValue: '',
      sourceVoltageUnitId: 'v',
      components: [
        {
          id: 'r1',
          kind: 'resistor',
          valueMode: 'resistance',
          rawValue: '3',
          unitId: 'ohm',
        },
        {
          id: 'l1',
          kind: 'inductor',
          valueMode: 'reactance',
          rawValue: '4',
          unitId: 'ohm',
        },
        {
          id: 'c1',
          kind: 'capacitor',
          valueMode: 'reactance',
          rawValue: '5',
          unitId: 'ohm',
        },
      ],
    })

    expect(result.status).toBe('solved')
    if (result.status !== 'solved') {
      return
    }

    expect(result.totals.netReactance).toBeCloseTo(-1, 8)
    if (
      result.output.result.status !== 'solved' ||
      result.output.result.value.kind !== 'complex' ||
      result.reference.magnitude.result.status !== 'solved' ||
      result.reference.magnitude.result.value.kind !== 'scalar' ||
      result.reference.phase.result.status !== 'solved' ||
      result.reference.phase.result.value.kind !== 'scalar'
    ) {
      throw new Error('Guided result did not produce solved outputs.')
    }

    expect(result.output.result.value.real).toBeCloseTo(3, 8)
    expect(result.output.result.value.imag).toBeCloseTo(-1, 8)
    expect(result.reference.magnitude.result.value.value).toBeCloseTo(3.16227766, 6)
    expect(result.reference.phase.result.value.value).toBeCloseTo(-0.32175055, 6)
  })

  it('converts inductance and capacitance before solving figure 15.86(c)', () => {
    const result = solveGuidedSeriesImpedance({
      goal: 'series-impedance',
      frequencyRawValue: '1',
      frequencyUnitId: 'khz',
      sourceVoltageRawValue: '',
      sourceVoltageUnitId: 'v',
      components: [
        {
          id: 'r1',
          kind: 'resistor',
          valueMode: 'resistance',
          rawValue: '470',
          unitId: 'ohm',
        },
        {
          id: 'l1',
          kind: 'inductor',
          valueMode: 'inductance',
          rawValue: '47',
          unitId: 'mh',
        },
        {
          id: 'l2',
          kind: 'inductor',
          valueMode: 'inductance',
          rawValue: '200',
          unitId: 'mh',
        },
        {
          id: 'c1',
          kind: 'capacitor',
          valueMode: 'capacitance',
          rawValue: '0.1',
          unitId: 'uf',
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

    expect(result.totals.inductiveReactance).toBeCloseTo(1551.94677, 5)
    expect(result.totals.capacitiveReactance).toBeCloseTo(1591.54943, 5)
    expect(result.output.result.value.real).toBeCloseTo(470, 8)
    expect(result.output.result.value.imag).toBeCloseTo(-39.60266, 4)
  })

  it('requires frequency when a component is entered in henrys or farads', () => {
    const result = solveGuidedSeriesImpedance({
      goal: 'series-impedance',
      frequencyRawValue: '',
      frequencyUnitId: 'hz',
      sourceVoltageRawValue: '',
      sourceVoltageUnitId: 'v',
      components: [
        {
          id: 'l1',
          kind: 'inductor',
          valueMode: 'inductance',
          rawValue: '47',
          unitId: 'mh',
        },
      ],
    })

    expect(result.status).toBe('invalid')
  })
})
