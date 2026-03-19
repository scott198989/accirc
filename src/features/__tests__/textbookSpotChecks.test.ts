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
    if (result.status !== 'solved' || 'kind' in result || result.value.kind !== 'scalar') {
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
    if (result.status !== 'solved' || 'kind' in result || result.value.kind !== 'scalar') {
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
    if (result.status !== 'solved' || 'kind' in result || result.value.kind !== 'scalar') {
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
    if (result.status !== 'solved' || 'kind' in result || result.value.kind !== 'scalar') {
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

  it('matches Chapter 15 Problem 3(a) for the current phasor conversion', () => {
    const goal = guidedMathGoalMap['current-phasor-from-sine-expression']
    const result = solveGuidedMathGoal(goal, [
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

  it('matches Chapter 15 Problem 5(a) for the current and voltage phasor conversion', () => {
    const currentGoal = guidedMathGoalMap['current-phasor-from-sine-expression']
    const currentResult = solveGuidedMathGoal(currentGoal, [
      { quantityId: 'peakCurrent', rawValue: '6', unitId: 'ma' },
      { quantityId: 'waveformPhaseAngle', rawValue: '20', unitId: 'deg' },
    ])

    expect(currentResult.status).toBe('solved')
    if (
      currentResult.status !== 'solved' ||
      !('value' in currentResult) ||
      currentResult.value.kind !== 'complex'
    ) {
      return
    }

    expect(Math.hypot(currentResult.value.real, currentResult.value.imag)).toBeCloseTo(4.2426407e-3, 10)
    expect(Math.atan2(currentResult.value.imag, currentResult.value.real)).toBeCloseTo((-70 * Math.PI) / 180, 10)

    const voltageGoal = guidedMathGoalMap['voltage-phasor-from-sine-expression']
    const voltageResult = solveGuidedMathGoal(voltageGoal, [
      { quantityId: 'peakVoltage', rawValue: '16', unitId: 'v' },
      { quantityId: 'waveformPhaseAngle', rawValue: '110', unitId: 'deg' },
    ])

    expect(voltageResult.status).toBe('solved')
    if (
      voltageResult.status !== 'solved' ||
      !('value' in voltageResult) ||
      voltageResult.value.kind !== 'complex'
    ) {
      return
    }

    expect(Math.hypot(voltageResult.value.real, voltageResult.value.imag)).toBeCloseTo(11.3137085, 7)
    expect(Math.atan2(voltageResult.value.imag, voltageResult.value.real)).toBeCloseTo((20 * Math.PI) / 180, 10)
  })

  it('matches Chapter 15 Problem 7(b) for the capacitor current phasor conversion', () => {
    const goal = guidedMathGoalMap['current-phasor-from-sine-expression']
    const result = solveGuidedMathGoal(goal, [
      { quantityId: 'peakCurrent', rawValue: '5', unitId: 'ua' },
      { quantityId: 'waveformPhaseAngle', rawValue: '-80', unitId: 'deg' },
    ])

    expect(result.status).toBe('solved')
    if (result.status !== 'solved' || !('value' in result) || result.value.kind !== 'complex') {
      return
    }

    expect(Math.hypot(result.value.real, result.value.imag)).toBeCloseTo(3.5355339e-6, 12)
    expect(Math.atan2(result.value.imag, result.value.real)).toBeCloseTo((-170 * Math.PI) / 180, 10)
  })

  it('matches Chapter 15 Problem 17 for capacitance from XC and frequency', () => {
    const goal = guidedMathGoalMap['capacitance-from-reactance-and-frequency']
    const result = solveGuidedMathGoal(goal, [
      { quantityId: 'capacitiveReactance', rawValue: '100', unitId: 'ohm' },
      { quantityId: 'frequency', rawValue: '60', unitId: 'hz' },
    ])

    expect(result.status).toBe('solved')
    if (result.status !== 'solved' || !('value' in result) || result.value.kind !== 'scalar') {
      return
    }

    expect(result.value.value).toBeCloseTo(26.5258e-6, 10)
  })

  it('matches Chapter 15 Problem 3(d) for the sinusoidal voltage writeback', () => {
    const goal = guidedMathGoalMap['voltage-sine-expression-from-phasor']
    const result = solveGuidedMathGoal(goal, [
      { quantityId: 'phasorSourceVoltage', rawValue: '14.1421356@40deg', unitId: 'v' },
      { quantityId: 'angularFrequency', rawValue: '2500', unitId: 'rad_per_s' },
    ])

    expect(result.status).toBe('solved')
    if (result.status !== 'solved' || !('kind' in result) || result.kind !== 'waveform-expression') {
      return
    }

    expect(result.expression).toBe('v(t) = 20 sin(2500t + 130 deg) V')
  })

  it('matches Chapter 15 Problem 7(e) for the capacitor voltage sine-wave writeback', () => {
    const goal = guidedMathGoalMap['voltage-sine-expression-from-phasor']
    const result = solveGuidedMathGoal(goal, [
      { quantityId: 'phasorSourceVoltage', rawValue: '17.6776695@100deg', unitId: 'mv' },
      { quantityId: 'angularFrequency', rawValue: '20000', unitId: 'rad_per_s' },
    ])

    expect(result.status).toBe('solved')
    if (result.status !== 'solved' || !('kind' in result) || result.kind !== 'waveform-expression') {
      return
    }

    expect(result.expression).toBe('v(t) = 25 sin(20000t - 170 deg) mV')
  })

  it('matches quiz Question 14 for rectangular impedance from power, voltage, and power factor', () => {
    const goal = guidedMathGoalMap['impedance-from-power-voltage-and-power-factor']
    const result = solveGuidedMathGoal(goal, [
      { quantityId: 'realPower', rawValue: '100', unitId: 'w' },
      { quantityId: 'voltage', rawValue: '500', unitId: 'v' },
      { quantityId: 'powerFactor', rawValue: '0.8', unitId: 'unitless' },
    ])

    expect(result.status).toBe('solved')
    if (result.status !== 'solved' || !('value' in result) || result.value.kind !== 'complex') {
      return
    }

    expect(result.value.real).toBeCloseTo(1600, 8)
    expect(result.value.imag).toBeCloseTo(1200, 8)
  })

  it('matches Chapter 15 Problem 28 for AC voltage-divider branch voltage', () => {
    const goal = guidedMathGoalMap['branch-voltage-from-source-and-impedances']
    const result = solveGuidedMathGoal(goal, [
      { quantityId: 'phasorSourceVoltage', rawValue: '120@0deg', unitId: 'v' },
      { quantityId: 'branchImpedance', rawValue: '40+30j', unitId: 'ohm' },
      { quantityId: 'totalImpedance', rawValue: '80+30j', unitId: 'ohm' },
    ])

    expect(result.status).toBe('solved')
    if (result.status !== 'solved' || !('value' in result) || result.value.kind !== 'complex') {
      return
    }

    expect(result.value.real).toBeCloseTo(67.39726027, 7)
    expect(result.value.imag).toBeCloseTo(19.72602739, 7)
  })

  it('matches quiz Questions 4 and 7 for total series RL impedance from R and XL', () => {
    const goal = guidedMathGoalMap['series-impedance-from-r-and-xl']
    const result = solveGuidedMathGoal(goal, [
      { quantityId: 'resistance', rawValue: '50', unitId: 'ohm' },
      { quantityId: 'inductiveReactance', rawValue: '20', unitId: 'ohm' },
    ])

    expect(result.status).toBe('solved')
    if (result.status !== 'solved' || !('value' in result) || result.value.kind !== 'complex') {
      return
    }

    expect(result.value.real).toBeCloseTo(50, 8)
    expect(result.value.imag).toBeCloseTo(20, 8)
  })

  it('matches quiz Questions 23 and 28 for total series RLC impedance', () => {
    const goal = guidedMathGoalMap['series-impedance-from-r-xl-xc']
    const result = solveGuidedMathGoal(goal, [
      { quantityId: 'resistance', rawValue: '10', unitId: 'ohm' },
      { quantityId: 'inductiveReactance', rawValue: '20', unitId: 'ohm' },
      { quantityId: 'capacitiveReactance', rawValue: '15', unitId: 'ohm' },
    ])

    expect(result.status).toBe('solved')
    if (result.status !== 'solved' || !('value' in result) || result.value.kind !== 'complex') {
      return
    }

    expect(result.value.real).toBeCloseTo(10, 8)
    expect(result.value.imag).toBeCloseTo(5, 8)
  })

  it('matches quiz Question 18 for the mixed-network impedance magnitude', () => {
    const root: GuidedSeriesParallelGroupNode = {
      id: 'root',
      type: 'group',
      label: 'ZT',
      topology: 'parallel',
      children: [
        {
          id: 'r',
          type: 'component',
          label: '4700 ohm branch',
          kind: 'resistor',
          valueMode: 'resistance',
          rawValue: '4700',
          unitId: 'ohm',
        },
        {
          id: 'coil',
          type: 'group',
          label: 'Coil branch',
          topology: 'series',
          children: [
            {
              id: 'coil-r',
              type: 'component',
              label: 'Coil resistance',
              kind: 'resistor',
              valueMode: 'resistance',
              rawValue: '45',
              unitId: 'ohm',
            },
            {
              id: 'coil-l',
              type: 'component',
              label: 'Coil inductance',
              kind: 'inductor',
              valueMode: 'inductance',
              rawValue: '100',
              unitId: 'mh',
            },
          ],
        },
      ],
    }

    const result = solveGuidedSeriesParallelNetwork({
      goal: 'series-parallel-impedance',
      frequencyRawValue: '500',
      frequencyUnitId: 'hz',
      sourceVoltageRawValue: '',
      sourceVoltageUnitId: 'v',
      root,
    })

    expect(result.status).toBe('solved')
    if (
      result.status !== 'solved' ||
      result.reference.totalImpedanceMagnitude.kind !== 'scalar'
    ) {
      return
    }

    expect(result.reference.totalImpedanceMagnitude.value).toBeCloseTo(313.67, 2)
  })

  it('matches quiz Questions 18 and 34 for the direct resistor-parallel-coil goal', () => {
    const goal = guidedMathGoalMap['parallel-impedance-from-resistor-and-coil']
    const result = solveGuidedMathGoal(goal, [
      { quantityId: 'parallelResistance', rawValue: '4700', unitId: 'ohm' },
      { quantityId: 'coilResistance', rawValue: '45', unitId: 'ohm' },
      { quantityId: 'frequency', rawValue: '500', unitId: 'hz' },
      { quantityId: 'inductance', rawValue: '100', unitId: 'mh' },
    ])

    expect(result.status).toBe('solved')
    if (result.status !== 'solved' || !('value' in result) || result.value.kind !== 'complex') {
      return
    }

    expect(Math.hypot(result.value.real, result.value.imag)).toBeCloseTo(313.67, 2)
  })

  it('matches quiz Question 31 for equivalent parallel RL conversion', () => {
    const resistanceGoal = guidedMathGoalMap['equivalent-parallel-resistance-from-series-r-xl']
    const reactanceGoal = guidedMathGoalMap['equivalent-parallel-reactance-from-series-r-xl']

    const resistanceResult = solveGuidedMathGoal(resistanceGoal, [
      { quantityId: 'resistance', rawValue: '100', unitId: 'ohm' },
      { quantityId: 'inductiveReactance', rawValue: '50', unitId: 'ohm' },
    ])
    const reactanceResult = solveGuidedMathGoal(reactanceGoal, [
      { quantityId: 'resistance', rawValue: '100', unitId: 'ohm' },
      { quantityId: 'inductiveReactance', rawValue: '50', unitId: 'ohm' },
    ])

    expect(resistanceResult.status).toBe('solved')
    expect(reactanceResult.status).toBe('solved')
    if (
      resistanceResult.status !== 'solved' ||
      !('value' in resistanceResult) ||
      resistanceResult.value.kind !== 'scalar' ||
      reactanceResult.status !== 'solved' ||
      !('value' in reactanceResult) ||
      reactanceResult.value.kind !== 'scalar'
    ) {
      return
    }

    expect(resistanceResult.value.value).toBeCloseTo(125, 8)
    expect(reactanceResult.value.value).toBeCloseTo(250, 8)
  })

  it('matches quiz Question 35 for capacitor impedance in rectangular form', () => {
    const goal = guidedMathGoalMap['capacitor-impedance-from-frequency-and-capacitance']
    const result = solveGuidedMathGoal(goal, [
      { quantityId: 'frequency', rawValue: '60', unitId: 'hz' },
      { quantityId: 'capacitance', rawValue: '10', unitId: 'uf' },
    ])

    expect(result.status).toBe('solved')
    if (result.status !== 'solved' || !('value' in result) || result.value.kind !== 'complex') {
      return
    }

    expect(result.value.real).toBeCloseTo(0, 8)
    expect(result.value.imag).toBeCloseTo(-265.258238, 6)
  })

  it('matches quiz Question 38 for capacitive susceptance', () => {
    const goal = guidedMathGoalMap['capacitive-susceptance-from-frequency-and-capacitance']
    const result = solveGuidedMathGoal(goal, [
      { quantityId: 'frequency', rawValue: '1000', unitId: 'hz' },
      { quantityId: 'capacitance', rawValue: '100', unitId: 'uf' },
    ])

    expect(result.status).toBe('solved')
    if (result.status !== 'solved' || !('value' in result) || result.value.kind !== 'scalar') {
      return
    }

    expect(result.value.value).toBeCloseTo(0.62831853, 8)
  })
})
