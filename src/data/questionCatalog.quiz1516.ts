import {
  outOfScopeQuestion,
  quiz1516Asset,
  supportedQuestion,
  textbookMathOnlyReason,
  type QuestionCatalogEntry,
} from './questionCatalog.shared'

const chapters = ['15', '16']

const assetByQuestion: Record<string, string[]> = {
  '1': quiz1516Asset('screenshot-2026-03-18-054952'),
  '2': quiz1516Asset('screenshot-2026-03-18-055022'),
  '3': quiz1516Asset('screenshot-2026-03-18-055022'),
  '4': quiz1516Asset('screenshot-2026-03-18-055116'),
  '5': quiz1516Asset('screenshot-2026-03-18-055116'),
  '6': quiz1516Asset('screenshot-2026-03-18-055205'),
  '7': quiz1516Asset('screenshot-2026-03-18-055205'),
  '8': quiz1516Asset('screenshot-2026-03-18-055247'),
  '9': quiz1516Asset('screenshot-2026-03-18-055247'),
  '10': quiz1516Asset('screenshot-2026-03-18-055333'),
  '11': quiz1516Asset('screenshot-2026-03-18-055417'),
  '12': quiz1516Asset('screenshot-2026-03-18-055417'),
  '13': quiz1516Asset('screenshot-2026-03-18-055536'),
  '14': quiz1516Asset('screenshot-2026-03-18-055536'),
  '15': quiz1516Asset('screenshot-2026-03-18-055622'),
  '16': quiz1516Asset('screenshot-2026-03-18-055710'),
  '17': quiz1516Asset('screenshot-2026-03-18-055813'),
  '18': quiz1516Asset('screenshot-2026-03-18-055830'),
  '19': quiz1516Asset('screenshot-2026-03-18-055908'),
  '20': quiz1516Asset('screenshot-2026-03-18-055908'),
  '21': quiz1516Asset('screenshot-2026-03-18-055944'),
  '22': quiz1516Asset('screenshot-2026-03-18-060049'),
  '23': quiz1516Asset('screenshot-2026-03-18-060117'),
  '24': quiz1516Asset('screenshot-2026-03-18-060117'),
  '25': quiz1516Asset('screenshot-2026-03-18-060152'),
  '26': quiz1516Asset('screenshot-2026-03-18-060152'),
  '27': quiz1516Asset('screenshot-2026-03-18-060225'),
  '28': quiz1516Asset('screenshot-2026-03-18-060225'),
  '29': quiz1516Asset('screenshot-2026-03-18-060255'),
  '30': quiz1516Asset('screenshot-2026-03-18-060324'),
  '31': quiz1516Asset('screenshot-2026-03-18-060445'),
  '32': quiz1516Asset('screenshot-2026-03-18-060501'),
  '33': quiz1516Asset('screenshot-2026-03-18-060617'),
  '34': quiz1516Asset('screenshot-2026-03-18-060656'),
}

function supportedQuiz1516(input: {
  id: string
  questionNumber: string
  promptText: string
  solverMode: QuestionCatalogEntry['solverMode']
  mappedGoalIds: string[]
  mappedFormulaIds: string[]
  testCaseId?: string
  provenanceNote?: string
}) {
  return supportedQuestion({
    ...input,
    sourceId: 'quiz-15-16',
    chapters,
    assetRefs: assetByQuestion[input.questionNumber],
    solverMode: input.solverMode ?? 'chapter-goal',
  })
}

function outOfScopeQuiz1516(input: {
  id: string
  questionNumber: string
  classification: Exclude<QuestionCatalogEntry['classification'], 'calculation'>
  promptText: string
  outOfScopeReason?: string
  provenanceNote?: string
}) {
  return outOfScopeQuestion({
    ...input,
    sourceId: 'quiz-15-16',
    chapters,
    assetRefs: assetByQuestion[input.questionNumber],
    outOfScopeReason: input.outOfScopeReason ?? textbookMathOnlyReason,
  })
}

export const quiz1516QuestionCatalog: QuestionCatalogEntry[] = [
  supportedQuiz1516({
    id: 'quiz-15-16-1',
    questionNumber: '1',
    promptText: 'Figure 16.4: given source voltage and source current phasors, determine total impedance ZT.',
    solverMode: 'chapter-goal',
    mappedGoalIds: ['impedance-from-source-voltage-and-current-phasors'],
    mappedFormulaIds: ['complex-ohms-law'],
    testCaseId: 'goal-impedance-from-source-voltage-and-current-phasors',
  }),
  outOfScopeQuiz1516({
    id: 'quiz-15-16-2',
    questionNumber: '2',
    classification: 'true-false',
    promptText: 'True or false: the total impedance of two parallel impedances is the sum divided by the product.',
  }),
  outOfScopeQuiz1516({
    id: 'quiz-15-16-3',
    questionNumber: '3',
    classification: 'true-false',
    promptText: 'True or false: a ground-fault circuit interrupter can still allow shock current, but it cuts power quickly.',
  }),
  supportedQuiz1516({
    id: 'quiz-15-16-4',
    questionNumber: '4',
    promptText: 'Figure 16.2: determine the total impedance ZT of the shown circuit.',
    solverMode: 'parallel-builder',
    mappedGoalIds: ['parallel-impedance'],
    mappedFormulaIds: ['parallel-impedance'],
    testCaseId: 'parallel-impedance-basic',
  }),
  outOfScopeQuiz1516({
    id: 'quiz-15-16-5',
    questionNumber: '5',
    classification: 'true-false',
    promptText: 'True or false: if e and i have the same phase angle, the total impedance is purely resistive.',
  }),
  outOfScopeQuiz1516({
    id: 'quiz-15-16-6',
    questionNumber: '6',
    classification: 'concept',
    promptText: 'Figure 16.2: describe how the total impedance changes as frequency increases.',
  }),
  outOfScopeQuiz1516({
    id: 'quiz-15-16-7',
    questionNumber: '7',
    classification: 'true-false',
    promptText: 'True or false: higher frequency improves the short-circuit approximation for XC.',
  }),
  outOfScopeQuiz1516({
    id: 'quiz-15-16-8',
    questionNumber: '8',
    classification: 'true-false',
    promptText: 'True or false: combining impedances can help determine total voltage across a series combination.',
  }),
  outOfScopeQuiz1516({
    id: 'quiz-15-16-9',
    questionNumber: '9',
    classification: 'concept',
    promptText: 'Figure 16.4: choose the correct current relationship for the network.',
  }),
  supportedQuiz1516({
    id: 'quiz-15-16-10',
    questionNumber: '10',
    promptText: 'Figure 16.9: determine the current through the 10 ohm resistor branch.',
    solverMode: 'parallel-builder',
    mappedGoalIds: ['parallel-resistor-current'],
    mappedFormulaIds: ['parallel-branch-current', 'current-divider'],
    testCaseId: 'parallel-resistor-branch-current',
  }),
  outOfScopeQuiz1516({
    id: 'quiz-15-16-11',
    questionNumber: '11',
    classification: 'concept',
    promptText: 'Figure 16.3: choose the equation that correctly describes source voltage E.',
  }),
  outOfScopeQuiz1516({
    id: 'quiz-15-16-12',
    questionNumber: '12',
    classification: 'true-false',
    promptText: 'True or false: ladder networks do not require total impedance to determine total current.',
  }),
  outOfScopeQuiz1516({
    id: 'quiz-15-16-13',
    questionNumber: '13',
    classification: 'true-false',
    promptText: 'True or false: the equivalent circuit is used to determine source current in series-parallel AC networks.',
  }),
  supportedQuiz1516({
    id: 'quiz-15-16-14',
    questionNumber: '14',
    promptText: 'Figure 16.9: determine the current through the 20 ohm resistor branch.',
    solverMode: 'parallel-builder',
    mappedGoalIds: ['parallel-resistor-current'],
    mappedFormulaIds: ['parallel-branch-current', 'current-divider'],
    testCaseId: 'parallel-resistor-branch-current',
    provenanceNote: 'OCR merged Question 13 and Question 14 on one screenshot, so this record was normalized manually.',
  }),
  supportedQuiz1516({
    id: 'quiz-15-16-15',
    questionNumber: '15',
    promptText: 'Figure 16.1: given the applied frequency, determine the inductor value L.',
    solverMode: 'chapter-goal',
    mappedGoalIds: ['inductance-from-reactance-and-frequency'],
    mappedFormulaIds: ['inductance'],
    testCaseId: 'goal-inductance-from-reactance-and-frequency',
  }),
  outOfScopeQuiz1516({
    id: 'quiz-15-16-16',
    questionNumber: '16',
    classification: 'true-false',
    promptText: 'True or false: the current divider rule can be applied to determine the current through the capacitor in Figure 16.1.',
  }),
  outOfScopeQuiz1516({
    id: 'quiz-15-16-17',
    questionNumber: '17',
    classification: 'true-false',
    promptText: 'True or false: source current Is may be found by dividing E by ZT in Figure 16.1.',
  }),
  supportedQuiz1516({
    id: 'quiz-15-16-18',
    questionNumber: '18',
    promptText: 'Figure 16.9: determine the current through the capacitor branch.',
    solverMode: 'parallel-builder',
    mappedGoalIds: ['parallel-capacitor-current'],
    mappedFormulaIds: ['parallel-branch-current', 'current-divider'],
    testCaseId: 'parallel-capacitor-branch-current',
  }),
  outOfScopeQuiz1516({
    id: 'quiz-15-16-19',
    questionNumber: '19',
    classification: 'true-false',
    promptText: 'True or false: the total impedance in Figure 16.1 equals R, XC, and XL in the stated relationship.',
  }),
  outOfScopeQuiz1516({
    id: 'quiz-15-16-20',
    questionNumber: '20',
    classification: 'true-false',
    promptText: 'True or false: a negative total impedance phase angle means the network is capacitive.',
  }),
  supportedQuiz1516({
    id: 'quiz-15-16-21',
    questionNumber: '21',
    promptText: 'Figure 16.1: determine the total impedance ZT of the circuit.',
    solverMode: 'parallel-builder',
    mappedGoalIds: ['parallel-impedance'],
    mappedFormulaIds: ['parallel-impedance'],
    testCaseId: 'parallel-impedance-figure-16-1',
  }),
  supportedQuiz1516({
    id: 'quiz-15-16-22',
    questionNumber: '22',
    promptText: 'Figure 16.5: determine the total admittance YT of the circuit.',
    solverMode: 'parallel-builder',
    mappedGoalIds: ['parallel-admittance'],
    mappedFormulaIds: ['parallel-admittance-complex'],
    testCaseId: 'parallel-admittance-figure-16-5',
  }),
  outOfScopeQuiz1516({
    id: 'quiz-15-16-23',
    questionNumber: '23',
    classification: 'true-false',
    promptText: 'True or false: capacitor effect over the full audio range is negligible and allows AC to pass with little disturbance.',
  }),
  supportedQuiz1516({
    id: 'quiz-15-16-24',
    questionNumber: '24',
    promptText: 'Figure 16.5: determine branch current I2.',
    solverMode: 'parallel-builder',
    mappedGoalIds: ['parallel-inductor-current'],
    mappedFormulaIds: ['parallel-branch-current', 'current-divider'],
    testCaseId: 'parallel-inductor-branch-current',
  }),
  supportedQuiz1516({
    id: 'quiz-15-16-25',
    questionNumber: '25',
    promptText: 'Figure 16.5: determine total current I.',
    solverMode: 'parallel-builder',
    mappedGoalIds: ['parallel-source-current'],
    mappedFormulaIds: ['parallel-source-current'],
    testCaseId: 'parallel-source-current',
  }),
  outOfScopeQuiz1516({
    id: 'quiz-15-16-26',
    questionNumber: '26',
    classification: 'true-false',
    promptText: 'True or false: solving series-parallel AC networks uses a different fundamental concept than solving series-parallel DC networks.',
  }),
  outOfScopeQuiz1516({
    id: 'quiz-15-16-27',
    questionNumber: '27',
    classification: 'true-false',
    promptText: 'True or false: determining source current is the most critical step in solving series-parallel AC networks.',
  }),
  supportedQuiz1516({
    id: 'quiz-15-16-28',
    questionNumber: '28',
    promptText: 'Figure 16.6: determine the total current Is.',
    solverMode: 'series-parallel-builder',
    mappedGoalIds: ['series-parallel-source-current'],
    mappedFormulaIds: ['source-current-phasor', 'mixed-network-reduction'],
    testCaseId: 'series-parallel-source-current',
  }),
  supportedQuiz1516({
    id: 'quiz-15-16-29',
    questionNumber: '29',
    promptText: 'Figure 16.1: given the source current phasor, determine the current through the coil.',
    solverMode: 'parallel-builder',
    mappedGoalIds: ['parallel-inductor-current'],
    mappedFormulaIds: ['parallel-branch-current', 'current-divider'],
    testCaseId: 'parallel-inductor-branch-current',
  }),
  supportedQuiz1516({
    id: 'quiz-15-16-30',
    questionNumber: '30',
    promptText: 'Figure 16.6: determine the total impedance ZT.',
    solverMode: 'series-parallel-builder',
    mappedGoalIds: ['series-parallel-impedance'],
    mappedFormulaIds: ['mixed-network-reduction'],
    testCaseId: 'series-parallel-impedance',
  }),
  outOfScopeQuiz1516({
    id: 'quiz-15-16-31',
    questionNumber: '31',
    classification: 'concept',
    promptText: 'Figure 16.3: choose the equation that correctly describes total impedance ZT.',
  }),
  outOfScopeQuiz1516({
    id: 'quiz-15-16-32',
    questionNumber: '32',
    classification: 'concept',
    promptText: 'Figure 16.4: choose the equation that correctly describes total impedance ZT.',
    provenanceNote: 'Two near-duplicate screenshot exports existed for Question 32; the canonical question record keeps only one question entry.',
  }),
  outOfScopeQuiz1516({
    id: 'quiz-15-16-33',
    questionNumber: '33',
    classification: 'concept',
    promptText: 'Figure 16.3: choose the equation that correctly describes current I2.',
  }),
  outOfScopeQuiz1516({
    id: 'quiz-15-16-34',
    questionNumber: '34',
    classification: 'true-false',
    promptText: 'True or false: the total impedance in Figure 16.1 is independent of applied frequency.',
  }),
]
