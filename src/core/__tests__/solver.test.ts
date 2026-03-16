import { describe, expect, it } from 'vitest'
import { solveCircuitProblem } from '../solver'

describe('solveCircuitProblem', () => {
  it('solves inductive reactance from frequency and inductance with SI normalization', () => {
    const result = solveCircuitProblem('inductiveReactance', [
      { quantityId: 'frequency', rawValue: '60', unitId: 'hz' },
      { quantityId: 'inductance', rawValue: '50', unitId: 'mh' },
    ])

    expect(result.status).toBe('solved')
    if (result.status !== 'solved') {
      return
    }

    expect(result.value.kind).toBe('scalar')
    if (result.value.kind !== 'scalar') {
      return
    }

    expect(result.value.value).toBeCloseTo(18.8495559, 6)
    expect(result.steps.at(-1)?.formula).toBe('XL = 2pi f L')
  })

  it('uses a derived omega path to solve capacitance from XC and frequency', () => {
    const result = solveCircuitProblem('capacitance', [
      { quantityId: 'frequency', rawValue: '60', unitId: 'hz' },
      { quantityId: 'capacitiveReactance', rawValue: '530.516476', unitId: 'ohm' },
    ])

    expect(result.status).toBe('solved')
    if (result.status !== 'solved' || result.value.kind !== 'scalar') {
      return
    }

    expect(result.value.value).toBeCloseTo(5e-6, 10)
    expect(result.steps).toHaveLength(1)
    expect(result.steps[0].formula).toBe('C = 1 / (2pi f XC)')
  })

  it('solves power factor from power, voltage, and current', () => {
    const result = solveCircuitProblem('powerFactor', [
      { quantityId: 'realPower', rawValue: '960', unitId: 'w' },
      { quantityId: 'voltage', rawValue: '120', unitId: 'v' },
      { quantityId: 'current', rawValue: '10', unitId: 'a' },
    ])

    expect(result.status).toBe('solved')
    if (result.status !== 'solved' || result.value.kind !== 'scalar') {
      return
    }

    expect(result.value.value).toBeCloseTo(0.8, 8)
  })

  it('solves the RC charging equation', () => {
    const result = solveCircuitProblem('rcChargingVoltage', [
      { quantityId: 'finalVoltage', rawValue: '5', unitId: 'v' },
      { quantityId: 'elapsedTime', rawValue: '1', unitId: 'ms' },
      { quantityId: 'timeConstant', rawValue: '1', unitId: 'ms' },
    ])

    expect(result.status).toBe('solved')
    if (result.status !== 'solved' || result.value.kind !== 'scalar') {
      return
    }

    expect(result.value.value).toBeCloseTo(3.16060279, 6)
    expect(result.steps.at(-1)?.formula).toBe('vC(t) = Vfinal (1 - e^(-t/tau))')
  })

  it('solves parallel admittance from conductance and susceptance values', () => {
    const result = solveCircuitProblem('admittanceComplex', [
      { quantityId: 'conductance', rawValue: '0.2', unitId: 's' },
      { quantityId: 'inductiveSusceptance', rawValue: '0.125', unitId: 's' },
      { quantityId: 'capacitiveSusceptance', rawValue: '0.05', unitId: 's' },
    ])

    expect(result.status).toBe('solved')
    if (result.status !== 'solved' || result.value.kind !== 'complex') {
      return
    }

    expect(result.value.real).toBeCloseTo(0.2, 8)
    expect(result.value.imag).toBeCloseTo(-0.075, 8)
    expect(result.steps.at(-1)?.formula).toBe('Y = G + j(BC - BL)')
  })

  it('solves parallel source current magnitude from voltage and admittance magnitude', () => {
    const result = solveCircuitProblem('current', [
      { quantityId: 'voltage', rawValue: '20', unitId: 'v' },
      { quantityId: 'admittanceMagnitude', rawValue: '0.5', unitId: 's' },
    ])

    expect(result.status).toBe('solved')
    if (result.status !== 'solved' || result.value.kind !== 'scalar') {
      return
    }

    expect(result.value.value).toBeCloseTo(10, 8)
    expect(result.steps.at(-1)?.formula).toBe('I = V|Y|')
  })

  it('refuses incomplete requests', () => {
    const result = solveCircuitProblem('inductance', [
      { quantityId: 'inductiveReactance', rawValue: '18.85', unitId: 'ohm' },
    ])

    expect(result.status).toBe('incomplete')
    if (result.status !== 'incomplete') {
      return
    }

    expect(result.requirements.length).toBeGreaterThan(0)
  })

  it('refuses ambiguous direct solves for inductance', () => {
    const result = solveCircuitProblem('inductance', [
      { quantityId: 'inductiveReactance', rawValue: '18.8495559', unitId: 'ohm' },
      { quantityId: 'frequency', rawValue: '60', unitId: 'hz' },
      { quantityId: 'coilRadius', rawValue: '0.5', unitId: 'in' },
      { quantityId: 'coilLength', rawValue: '1.2', unitId: 'in' },
      { quantityId: 'coilTurns', rawValue: '25.5986597', unitId: 'unitless' },
    ])

    expect(result.status).toBe('ambiguous')
    if (result.status !== 'ambiguous') {
      return
    }

    expect(result.candidates.length).toBeGreaterThan(1)
  })

  it('rejects invalid complex input formatting', () => {
    const result = solveCircuitProblem('complexProduct', [
      { quantityId: 'complexFactorA', rawValue: '3+4k', unitId: 'unitless' },
      { quantityId: 'complexFactorB', rawValue: '1-2j', unitId: 'unitless' },
    ])

    expect(result.status).toBe('invalid')
  })
})
