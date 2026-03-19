import { describe, expect, it } from 'vitest'
import {
  analyzeFastSolve,
  makeFastKnownRow,
  solveFastProblem,
  type FastKnownRow,
} from '../fastSolve'

function row(
  knownId: FastKnownRow['knownId'],
  rawValue: string,
  unitId: string,
): FastKnownRow {
  return {
    ...makeFastKnownRow(knownId),
    knownId,
    rawValue,
    unitId,
  }
}

describe('fastSolve', () => {
  it('solves resistance directly from voltage and current', () => {
    const outcome = solveFastProblem({
      rows: [row('voltage', '4', 'v'), row('current', '2', 'a')],
      targetId: 'resistance',
      context: { circuitShape: '', branchRole: '' },
    })

    expect(outcome.status).toBe('solved')
    if (outcome.status !== 'solved') {
      return
    }

    expect(outcome.analysis.strategy).toBe('generic')
    expect(outcome.answerValue).toMatch(/2/)
  })

  it('solves XL directly from frequency and inductance', () => {
    const outcome = solveFastProblem({
      rows: [row('frequency', '60', 'hz'), row('inductance', '50', 'mh')],
      targetId: 'inductive-reactance',
      context: { circuitShape: '', branchRole: '' },
    })

    expect(outcome.status).toBe('solved')
    if (outcome.status !== 'solved') {
      return
    }

    expect(outcome.analysis.strategy).toBe('generic')
    expect(outcome.answerValue).toMatch(/18\.8495|18\.85/)
  })

  it('asks for circuit shape when current could be series or parallel', () => {
    const analysis = analyzeFastSolve({
      rows: [
        row('voltage', '120', 'v'),
        row('resistance', '30', 'ohm'),
        row('inductive-reactance', '40', 'ohm'),
      ],
      targetId: 'current',
      context: { circuitShape: '', branchRole: '' },
    })

    expect(analysis.status).toBe('needs-context')
    expect(analysis.requestedContext).toContain('circuitShape')
  })

  it('solves total admittance from G, BL, and BC without asking for topology', () => {
    const outcome = solveFastProblem({
      rows: [
        row('conductance', '0.1', 's'),
        row('inductive-susceptance', '0.05', 's'),
        row('capacitive-susceptance', '0.02', 's'),
      ],
      targetId: 'total-admittance',
      context: { circuitShape: '', branchRole: '' },
    })

    expect(outcome.status).toBe('solved')
    if (outcome.status !== 'solved') {
      return
    }

    expect(outcome.analysis.status).toBe('ready')
    expect(outcome.answerValue).toMatch(/100 - 30j mS|0\.1 - 0\.03j S/)
  })

  it('asks which branch is wanted for a parallel branch-current problem', () => {
    const analysis = analyzeFastSolve({
      rows: [row('voltage', '120', 'v'), row('resistance', '30', 'ohm'), row('inductive-reactance', '40', 'ohm')],
      targetId: 'branch-current',
      context: { circuitShape: 'parallel', branchRole: '' },
    })

    expect(analysis.status).toBe('needs-context')
    expect(analysis.requestedContext).toContain('branchRole')
  })
})
