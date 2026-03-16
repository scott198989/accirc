import { quantityMap } from './quantities'
import { solveWithRules } from './ruleEngine'
import type { QuantityId, QuantityValue, SolveResult } from './types'
import { parseAndNormalizeValue } from './units'

export interface SolverInputRow {
  quantityId: QuantityId
  rawValue: string
  unitId: string
}

export function solveCircuitProblem(
  target: QuantityId,
  rows: SolverInputRow[],
): SolveResult {
  const knowns: Partial<Record<QuantityId, QuantityValue>> = {}

  for (const row of rows) {
    const parsed = parseKnownValue(row)
    if (typeof parsed === 'string') {
      return {
        status: 'invalid',
        target,
        message: parsed,
      }
    }

    knowns[row.quantityId] = parsed
  }

  return solveWithRules({
    target,
    knowns,
  })
}

function parseKnownValue(row: SolverInputRow): QuantityValue | string {
  const quantity = quantityMap[row.quantityId]
  const parsed = parseAndNormalizeValue(quantity, row.rawValue, row.unitId)
  if (parsed.error || !parsed.value) {
    return parsed.error ?? `Unable to parse ${quantity.label}.`
  }

  return parsed.value
}
