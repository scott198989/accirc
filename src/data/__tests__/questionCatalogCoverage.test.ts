import { describe, expect, it } from 'vitest'
import {
  questionCatalog,
  questionCatalogBySourceId,
  supportedQuestionCatalog,
} from '../questionCatalog'

describe('question catalog coverage', () => {
  it('uses unique ids and one canonical question record per source question', () => {
    const ids = questionCatalog.map((entry) => entry.id)
    const signatures = questionCatalog.map(
      (entry) => `${entry.sourceId}:${entry.questionNumber}:${entry.part ?? ''}`,
    )

    expect(new Set(ids).size).toBe(questionCatalog.length)
    expect(new Set(signatures).size).toBe(questionCatalog.length)
  })

  it('keeps every calculation prompt mapped to a supported deterministic solver path', () => {
    const calculationEntries = questionCatalog.filter((entry) => entry.classification === 'calculation')

    expect(calculationEntries.length).toBeGreaterThan(0)
    expect(calculationEntries.every((entry) => entry.coverageStatus === 'supported')).toBe(true)

    for (const entry of supportedQuestionCatalog) {
      expect(entry.solverMode).toBeTruthy()
      expect(entry.mappedGoalIds.length).toBeGreaterThan(0)
      expect(entry.mappedFormulaIds.length).toBeGreaterThan(0)
      expect(entry.testCaseId?.trim().length ?? 0).toBeGreaterThan(0)
    }
  })

  it('only catalogs the five canonical coverage sources and points at the cleaned asset paths', () => {
    expect(Object.keys(questionCatalogBySourceId).sort()).toEqual([
      'hw-15',
      'hw-16',
      'hw-17',
      'quiz-15-16',
      'quiz-17',
    ])

    for (const entry of questionCatalog) {
      expect(entry.assetRefs.length).toBeGreaterThan(0)
      for (const assetRef of entry.assetRefs) {
        expect(assetRef.startsWith('/reference-library/sources/')).toBe(true)
        expect(assetRef.includes('/screenshots/')).toBe(false)
        expect(assetRef.includes('/homework/')).toBe(false)
      }
    }
  })
})
