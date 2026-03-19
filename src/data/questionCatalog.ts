import { homeworkQuestionCatalog } from './questionCatalog.homework'
import { quiz1516QuestionCatalog } from './questionCatalog.quiz1516'
import { quiz17QuestionCatalog } from './questionCatalog.quiz17'
import type { QuestionCatalogEntry } from './questionCatalog.shared'

function withDefaultTestCase(entry: QuestionCatalogEntry): QuestionCatalogEntry {
  if (entry.coverageStatus !== 'supported' || entry.testCaseId) {
    return entry
  }

  return {
    ...entry,
    testCaseId: entry.mappedGoalIds.join('__'),
  }
}

export const questionCatalog: QuestionCatalogEntry[] = [
  ...homeworkQuestionCatalog,
  ...quiz1516QuestionCatalog,
  ...quiz17QuestionCatalog,
].map(withDefaultTestCase)

export const questionCatalogById = Object.fromEntries(
  questionCatalog.map((entry) => [entry.id, entry]),
) as Record<string, QuestionCatalogEntry>

export const questionCatalogBySourceId = questionCatalog.reduce<
  Partial<Record<QuestionCatalogEntry['sourceId'], QuestionCatalogEntry[]>>
>((groups, entry) => {
  const current = groups[entry.sourceId] ?? []
  current.push(entry)
  groups[entry.sourceId] = current
  return groups
}, {})

export const supportedQuestionCatalog = questionCatalog.filter(
  (entry) => entry.coverageStatus === 'supported',
)
