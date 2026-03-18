import { describe, expect, it } from 'vitest'
import { complex, scalar, scalarList } from '../complex'
import { formulaVariants } from '../formulaLibrary'
import { quantityMap } from '../quantities'
import { solveCircuitProblem } from '../solver'
import type { KnownValueMap, QuantityValue } from '../types'
import { guidedMathGoalMap } from '../../features/guidedMathGoals'

const representativeKnowns: KnownValueMap = {
  frequency: scalar(60),
  period: scalar(1 / 60),
  cycleCount: scalar(3),
  elapsedTime: scalar(0.05),
  angleDegrees: scalar(45),
  angleRadians: scalar(Math.PI / 4),
  angularFrequency: scalar(2 * Math.PI * 60),
  voltage: scalar(120),
  current: scalar(10),
  resistance: scalar(12),
  coilResistance: scalar(45),
  parallelResistance: scalar(4700),
  conductance: scalar(1 / 12),
  electricForce: scalar(0.36),
  electricFieldStrength: scalar(60500),
  distance: scalar(0.000794),
  plateArea: scalar(2.581e-3),
  permittivity: scalar(250 * 8.85e-12),
  relativePermittivity: scalar(250),
  airCapacitance: scalar(28.8e-12),
  dielectricStrength: scalar(80 / 0.0000254),
  inductiveReactance: scalar(2 * Math.PI * 60 * 0.05),
  capacitiveReactance: scalar(1 / (2 * Math.PI * 60 * 5e-6)),
  inductiveSusceptance: scalar(1 / (2 * Math.PI * 60 * 0.05)),
  capacitiveSusceptance: scalar(2 * Math.PI * 60 * 5e-6),
  netSusceptance: scalar(2 * Math.PI * 60 * 5e-6 - 1 / (2 * Math.PI * 60 * 0.05)),
  dvDt: scalar(250),
  diDt: scalar(5),
  magneticFluxRate: scalar(0.02),
  impedanceMagnitude: scalar(20),
  admittanceMagnitude: scalar(0.2),
  powerFactor: scalar(0.8),
  realPower: scalar(960),
  peakCurrent: scalar(14.1421356237),
  rmsCurrent: scalar(10),
  peakVoltage: scalar(169.705627485),
  rmsVoltage: scalar(120),
  waveformPhaseAngle: scalar((-80 * Math.PI) / 180),
  inductiveImpedance: complex(0, 18.8495559215),
  capacitiveImpedance: complex(0, -530.516476973),
  inductorVoltagePhasor: complex(0, 188.495559215),
  capacitorVoltagePhasor: complex(0, -5305.16476973),
  impedanceComplex: complex(12, -511.667213806),
  admittanceComplex: complex(0.0833333333, -0.0517266042),
  netReactance: scalar(-511.667213806),
  phaseAngle: scalar(Math.acos(0.8)),
  admittanceAngle: scalar(-0.555),
  inductance: scalar(0.05),
  capacitance: scalar(5e-6),
  phasorCurrent: complex(2, -1),
  phasorSourceVoltage: complex(120, 0),
  resistorVoltagePhasor: complex(24, -12),
  branchVoltagePhasor: complex(60, 10),
  branchImpedance: complex(10, 5),
  totalImpedance: complex(20, 10),
  charge: scalar(6e-4),
  parallelCapacitorList: scalarList([1e-6, 2.2e-6, 4.7e-6]),
  seriesCapacitorList: scalarList([1e-6, 2.2e-6, 4.7e-6]),
  totalCapacitance: scalar(7.9e-6),
  timeConstant: scalar(1e-3),
  rcChargingVoltage: scalar(3.16060279),
  rcChargingCurrent: scalar(0.3678794412),
  rcDischargingVoltage: scalar(3.6787944117),
  rcDischargingCurrent: scalar(0.3678794412),
  finalVoltage: scalar(5),
  storedEnergy: scalar(0.036),
  rlGrowthCurrent: scalar(3.16060279),
  finalCurrent: scalar(5),
  inducedVoltage: scalar(1),
  turnCount: scalar(50),
  complexRectangular: complex(3, 4),
  polarMagnitude: scalar(5),
  polarAngle: scalar(Math.atan2(4, 3)),
  complexFactorA: complex(3, 4),
  complexFactorB: complex(1, -2),
  complexProduct: complex(11, -2),
  coilRadius: scalar(0.5 * 0.0254),
  coilLength: scalar(1.2 * 0.0254),
  coilTurns: scalar(25.5986597),
}

function expectFiniteValue(value: QuantityValue) {
  if (value.kind === 'scalar') {
    expect(Number.isFinite(value.value)).toBe(true)
    return
  }

  if (value.kind === 'complex') {
    expect(Number.isFinite(value.real)).toBe(true)
    expect(Number.isFinite(value.imag)).toBe(true)
    return
  }

  for (const entry of value.values) {
    expect(Number.isFinite(entry)).toBe(true)
  }
}

describe('formula audit', () => {
  it('computes a finite output for every formula variant with representative inputs', () => {
    for (const variant of formulaVariants) {
      const inputs = Object.fromEntries(
        variant.inputs.map((quantityId) => [quantityId, representativeKnowns[quantityId]]),
      ) as KnownValueMap

      expect(variant.validate?.(inputs), variant.id).toBeUndefined()
      expectFiniteValue(variant.compute(inputs))
    }
  })

  it('shows chapter 11 labels for RL and induced-voltage traces', () => {
    const tauResult = solveCircuitProblem('timeConstant', [
      { quantityId: 'inductance', rawValue: '50', unitId: 'mh' },
      { quantityId: 'resistance', rawValue: '2', unitId: 'ohm' },
    ])

    expect(tauResult.status).toBe('solved')
    if (tauResult.status !== 'solved') {
      return
    }

    expect(tauResult.steps.at(-1)?.chapter).toBe('11')

    const emfResult = solveCircuitProblem('inducedVoltage', [
      { quantityId: 'turnCount', rawValue: '50', unitId: 'unitless' },
      { quantityId: 'magneticFluxRate', rawValue: '0.02', unitId: 'wb_per_s' },
    ])

    expect(emfResult.status).toBe('solved')
    if (emfResult.status !== 'solved') {
      return
    }

    expect(emfResult.steps.at(-1)?.chapter).toBe('11')
  })

  it('shows chapter 10 labels for capacitor traces', () => {
    const chargeResult = solveCircuitProblem('charge', [
      { quantityId: 'capacitance', rawValue: '12', unitId: 'uf' },
      { quantityId: 'voltage', rawValue: '10', unitId: 'v' },
    ])

    expect(chargeResult.status).toBe('solved')
    if (chargeResult.status !== 'solved') {
      return
    }

    expect(chargeResult.steps.at(-1)?.chapter).toBe('10')

    const dischargeResult = solveCircuitProblem('rcDischargingVoltage', [
      { quantityId: 'voltage', rawValue: '20', unitId: 'v' },
      { quantityId: 'elapsedTime', rawValue: '100', unitId: 'ms' },
      { quantityId: 'timeConstant', rawValue: '100', unitId: 'ms' },
    ])

    expect(dischargeResult.status).toBe('solved')
    if (dischargeResult.status !== 'solved') {
      return
    }

    expect(dischargeResult.steps.at(-1)?.chapter).toBe('10')
  })

  it('uses chapter labels that match the textbook flow for chapter 14 and 15 solves', () => {
    const inductanceResult = solveCircuitProblem('inductance', [
      { quantityId: 'inductiveReactance', rawValue: '2', unitId: 'kohm' },
      { quantityId: 'frequency', rawValue: '14.47', unitId: 'khz' },
    ])

    expect(inductanceResult.status).toBe('solved')
    if (inductanceResult.status !== 'solved') {
      return
    }

    expect(inductanceResult.steps.at(-1)?.chapter).toBe('14')

    const impedanceResult = solveCircuitProblem('impedanceComplex', [
      { quantityId: 'resistance', rawValue: '3', unitId: 'ohm' },
      { quantityId: 'inductiveReactance', rawValue: '4', unitId: 'ohm' },
      { quantityId: 'capacitiveReactance', rawValue: '5', unitId: 'ohm' },
    ])

    expect(impedanceResult.status).toBe('solved')
    if (impedanceResult.status !== 'solved') {
      return
    }

    expect(impedanceResult.steps.at(-1)?.chapter).toBe('15')
  })

  it('keeps quantity and guided-goal chapter metadata aligned with the shipped coverage', () => {
    expect(quantityMap.capacitance.chapter).toBe('10/14')
    expect(quantityMap.charge.chapter).toBe('10')
    expect(quantityMap.electricFieldStrength.chapter).toBe('10')
    expect(quantityMap.distance.chapter).toBe('10')
    expect(quantityMap.relativePermittivity.chapter).toBe('10')
    expect(quantityMap.dielectricStrength.chapter).toBe('10')
    expect(quantityMap.rcChargingVoltage.chapter).toBe('10')
    expect(quantityMap.storedEnergy.chapter).toBe('10')
    expect(quantityMap.inductiveReactance.chapter).toBe('14')
    expect(quantityMap.powerFactor.chapter).toBe('14')
    expect(quantityMap.impedanceComplex.chapter).toBe('15')
    expect(quantityMap.waveformPhaseAngle.chapter).toBe('15')
    expect(quantityMap.inducedVoltage.chapter).toBe('11')
    expect(quantityMap.turnCount.chapter).toBe('11')
    expect(quantityMap.phasorCurrent.chapter).toBe('15')

    expect(guidedMathGoalMap['charge-from-capacitance-and-voltage']?.chapter).toBe('10')
    expect(guidedMathGoalMap['air-capacitance-from-plate-geometry']?.chapter).toBe('10')
    expect(
      guidedMathGoalMap['maximum-voltage-from-dielectric-strength-and-distance']?.chapter,
    ).toBe('10')
    expect(guidedMathGoalMap['rc-charging-voltage']?.chapter).toBe('10')
    expect(guidedMathGoalMap['stored-energy-from-capacitance-and-voltage']?.chapter).toBe('10')
    expect(guidedMathGoalMap['inductive-reactance-from-frequency-and-inductance']?.chapter).toBe(
      '14',
    )
    expect(guidedMathGoalMap['inductance-from-reactance-and-frequency']?.chapter).toBe('14')
    expect(guidedMathGoalMap['power-factor-from-phase-angle']?.chapter).toBe('14')
  })
})
