import { describe, expect, it } from 'vitest'
import {
  makeGuidedSymbolRow,
  placeholderForGuidedSymbol,
  solveGuidedSymbolProblem,
} from '../guidedSymbolProblem'

describe('guidedSymbolProblem', () => {
  it('solves series total impedance from textbook-style labels', () => {
    const result = solveGuidedSymbolProblem({
      topology: 'series',
      seriesGoal: 'series-impedance',
      parallelGoal: 'parallel-admittance',
      rows: [
        { id: 'r', symbolId: 'r', rawValue: '3', unitId: 'ohm' },
        { id: 'xl', symbolId: 'xl', rawValue: '4', unitId: 'ohm' },
        { id: 'xc', symbolId: 'xc', rawValue: '5', unitId: 'ohm' },
      ],
    })

    expect(result.topology).toBe('series')
    expect(result.result.status).toBe('solved')
    if (result.topology !== 'series' || result.result.status !== 'solved') {
      return
    }

    expect(result.result.contributions.map((entry) => entry.label)).toEqual(['R', 'XL', 'XC'])

    const rectangular = result.result.reference.rectangular.result
    expect(rectangular.status).toBe('solved')
    if (rectangular.status !== 'solved' || rectangular.value.kind !== 'complex') {
      return
    }

    expect(rectangular.value.real).toBeCloseTo(3, 8)
    expect(rectangular.value.imag).toBeCloseTo(-1, 8)
  })

  it('combines repeated XL labels like XL1 and XL2 automatically', () => {
    const result = solveGuidedSymbolProblem({
      topology: 'series',
      seriesGoal: 'series-impedance',
      parallelGoal: 'parallel-admittance',
      rows: [
        { id: 'r', symbolId: 'r', rawValue: '1', unitId: 'kohm' },
        { id: 'xl1', symbolId: 'xl1', rawValue: '2', unitId: 'kohm' },
        { id: 'xl2', symbolId: 'xl2', rawValue: '6', unitId: 'kohm' },
        { id: 'xc', symbolId: 'xc', rawValue: '4', unitId: 'kohm' },
      ],
    })

    expect(result.topology).toBe('series')
    expect(result.result.status).toBe('solved')
    if (result.topology !== 'series' || result.result.status !== 'solved') {
      return
    }

    expect(result.result.contributions.map((entry) => entry.label)).toEqual(['R', 'XL1', 'XL2', 'XC'])
    expect(result.result.totals.inductiveReactance).toBeCloseTo(8000, 8)
    expect(result.result.totals.capacitiveReactance).toBeCloseTo(4000, 8)

    const rectangular = result.result.reference.rectangular.result
    expect(rectangular.status).toBe('solved')
    if (rectangular.status !== 'solved' || rectangular.value.kind !== 'complex') {
      return
    }

    expect(rectangular.value.real).toBeCloseTo(1000, 8)
    expect(rectangular.value.imag).toBeCloseTo(4000, 8)
  })

  it('refuses duplicate shared frequency entries', () => {
    const result = solveGuidedSymbolProblem({
      topology: 'series',
      seriesGoal: 'series-impedance',
      parallelGoal: 'parallel-admittance',
      rows: [
        { id: 'f1', symbolId: 'f', rawValue: '1', unitId: 'khz' },
        { id: 'f2', symbolId: 'f', rawValue: '60', unitId: 'hz' },
        { id: 'l1', symbolId: 'l1', rawValue: '47', unitId: 'mh' },
      ],
    })

    expect(result.topology).toBe('series')
    expect(result.result.status).toBe('invalid')
    if (result.topology !== 'series' || result.result.status !== 'invalid') {
      return
    }

    expect(result.result.message).toMatch(/frequency only once/i)
  })

  it('uses textbook-friendly defaults for inductance and capacitance symbols', () => {
    expect(makeGuidedSymbolRow('l2').unitId).toBe('mh')
    expect(makeGuidedSymbolRow('c').unitId).toBe('uf')
    expect(placeholderForGuidedSymbol('l2')).toBe('47')
    expect(placeholderForGuidedSymbol('c')).toBe('0.1')
  })

  it('passes Is into the parallel symbol workflow for current-divider style problems', () => {
    const result = solveGuidedSymbolProblem({
      topology: 'parallel',
      seriesGoal: 'series-impedance',
      parallelGoal: 'parallel-inductor-current',
      rows: [
        { id: 'is', symbolId: 'is', rawValue: '1@80deg', unitId: 'a' },
        { id: 'r', symbolId: 'r', rawValue: '5', unitId: 'ohm' },
        { id: 'xl', symbolId: 'xl', rawValue: '8', unitId: 'ohm' },
      ],
    })

    expect(result.topology).toBe('parallel')
    expect(result.result.status).toBe('solved')
    if (result.topology !== 'parallel' || result.result.status !== 'solved') {
      return
    }

    expect(result.result.reference.sourceVoltagePhasor).toBeDefined()
    expect(result.result.reference.inductorCurrent?.secondaryText).toMatch(/Current phasor:/i)
  })
})
