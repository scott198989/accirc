import { describe, expect, it } from 'vitest'
import {
  solveGuidedSeriesParallelNetwork,
  type GuidedSeriesParallelGroupNode,
} from '../guidedSeriesParallelNetwork'

describe('solveGuidedSeriesParallelNetwork', () => {
  it('solves Boylestad Chapter 17 Problem 1 / Fig. 17.29', () => {
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

    expect(result.reference.totalImpedanceMagnitude.value).toBeCloseTo(4, 2)
    expect(result.reference.phaseAngle.value).toBeCloseTo(-0.395, 3)
    expect(result.reference.sourceCurrent.value).toBeCloseTo(3.5, 2)
    expect(result.reference.sourceCurrentPhasor.real).toBeCloseTo(3.232, 2)
    expect(result.reference.sourceCurrentPhasor.imag).toBeCloseTo(1.351, 2)
  })

  it('reduces the Fig. 17.31 topology deterministically', () => {
    const root: GuidedSeriesParallelGroupNode = {
      id: 'root',
      type: 'group',
      label: 'ZT',
      topology: 'parallel',
      children: [
        {
          id: 'xl1',
          type: 'component',
          label: 'XL1',
          kind: 'inductor',
          valueMode: 'reactance',
          rawValue: '12',
          unitId: 'ohm',
        },
        {
          id: 'branch2',
          type: 'group',
          label: 'Branch 2',
          topology: 'series',
          children: [
            {
              id: 'r2',
              type: 'component',
              label: 'R2',
              kind: 'resistor',
              valueMode: 'resistance',
              rawValue: '12',
              unitId: 'ohm',
            },
            {
              id: 'xc',
              type: 'component',
              label: 'XC',
              kind: 'capacitor',
              valueMode: 'reactance',
              rawValue: '12',
              unitId: 'ohm',
            },
          ],
        },
      ],
    }

    const result = solveGuidedSeriesParallelNetwork({
      goal: 'series-parallel-real-power',
      frequencyRawValue: '',
      frequencyUnitId: 'hz',
      sourceVoltageRawValue: '60',
      sourceVoltageUnitId: 'v',
      root,
    })

    expect(result.status).toBe('solved')
    if (
      result.status !== 'solved' ||
      !result.reference.sourceCurrent ||
      !result.reference.sourceCurrentPhasor ||
      !result.reference.realPower
    ) {
      return
    }

    expect(result.reference.totalImpedanceMagnitude.value).toBeCloseTo(16.97, 2)
    expect(result.reference.phaseAngle.value).toBeCloseTo(0.785, 3)
    expect(result.reference.sourceCurrent.value).toBeCloseTo(3.54, 2)
    expect(result.reference.realPower.value).toBeCloseTo(150, 2)

    const branch2 = result.nodeSummaries.find((entry) => entry.label === 'Branch 2')
    const xc = result.nodeSummaries.find((entry) => entry.label === 'XC')
    expect(branch2?.currentPhasor?.real).toBeCloseTo(2.5, 1)
    expect(branch2?.currentPhasor?.imag).toBeCloseTo(2.5, 1)
    expect(xc?.voltagePhasor?.real).toBeCloseTo(30, 1)
    expect(xc?.voltagePhasor?.imag).toBeCloseTo(-30, 1)
  })
})
