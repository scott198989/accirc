import { describe, expect, it } from 'vitest'
import { parseComplex } from '../complex'
import { quantityMap } from '../quantities'
import { parseAndNormalizeValue } from '../units'

describe('complex parsing', () => {
  it('accepts ASCII and Unicode polar formats', () => {
    const ascii = parseComplex('5@30deg')
    const unicodeAngle = parseComplex('5∠30deg')
    const unicodeDegree = parseComplex('5@30°')

    for (const parsed of [ascii, unicodeAngle, unicodeDegree]) {
      expect(parsed).toBeDefined()
      expect(parsed?.kind).toBe('complex')
      if (!parsed || parsed.kind !== 'complex') {
        continue
      }

      expect(parsed.real).toBeCloseTo(4.3301270189, 8)
      expect(parsed.imag).toBeCloseTo(2.5, 8)
    }
  })

  it('shows a clean complex-format validation message', () => {
    const parsed = parseAndNormalizeValue(quantityMap.phasorCurrent, 'not-a-complex', 'a')

    expect(parsed.value).toBeUndefined()
    expect(parsed.error).toContain('3+4j')
    expect(parsed.error).toContain('5@30deg')
    expect(parsed.error).not.toMatch(/[Ââ]/)
  })
})
