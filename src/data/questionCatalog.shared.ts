import type { ReferenceSourceId } from './referenceLibrary'

export type QuestionClassification =
  | 'calculation'
  | 'concept'
  | 'true-false'
  | 'diagram'
  | 'waveform-plot'

export type CoverageStatus = 'supported' | 'out-of-scope'

export type SolverMode =
  | 'chapter-goal'
  | 'series-builder'
  | 'parallel-builder'
  | 'series-parallel-builder'

export interface QuestionCatalogEntry {
  id: string
  sourceId: ReferenceSourceId
  chapters: string[]
  questionNumber: string
  part?: string
  classification: QuestionClassification
  promptText: string
  assetRefs: string[]
  coverageStatus: CoverageStatus
  solverMode?: SolverMode
  mappedGoalIds: string[]
  mappedFormulaIds: string[]
  testCaseId?: string
  outOfScopeReason?: string
  provenanceNote?: string
}

interface SupportedQuestionInput {
  id: string
  sourceId: ReferenceSourceId
  chapters: string[]
  questionNumber: string
  part?: string
  promptText: string
  assetRefs: string[]
  solverMode: SolverMode
  mappedGoalIds: string[]
  mappedFormulaIds?: string[]
  testCaseId?: string
  provenanceNote?: string
}

interface OutOfScopeQuestionInput {
  id: string
  sourceId: ReferenceSourceId
  chapters: string[]
  questionNumber: string
  part?: string
  classification: Exclude<QuestionClassification, 'calculation'>
  promptText: string
  assetRefs: string[]
  outOfScopeReason: string
  provenanceNote?: string
}

export function supportedQuestion(input: SupportedQuestionInput): QuestionCatalogEntry {
  return {
    ...input,
    classification: 'calculation',
    coverageStatus: 'supported',
    mappedFormulaIds: input.mappedFormulaIds ?? [],
  }
}

export function outOfScopeQuestion(input: OutOfScopeQuestionInput): QuestionCatalogEntry {
  return {
    ...input,
    coverageStatus: 'out-of-scope',
    mappedGoalIds: [],
    mappedFormulaIds: [],
  }
}

export const hw15Asset = ['/reference-library/sources/hw-15/scott-tuschl-hw-15.docx']
export const hw16Asset = ['/reference-library/sources/hw-16/scott-tuschl-hw-16.pdf']
export const hw17Asset = ['/reference-library/sources/hw-17/scott-tuschl-hw-17.docx']
export const quiz1516Asset = (slug: string) => [`/reference-library/sources/quiz-15-16/${slug}.png`]
export const quiz17Asset = (slug: string) => [`/reference-library/sources/quiz-17/${slug}.png`]

export const textbookMathOnlyReason =
  'This prompt is a concept, diagram, proof, or waveform-sketch request and stays outside the app’s deterministic math-only scope.'
