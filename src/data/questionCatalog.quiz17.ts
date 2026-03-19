import {
  outOfScopeQuestion,
  quiz17Asset,
  supportedQuestion,
  textbookMathOnlyReason,
  type QuestionCatalogEntry,
} from './questionCatalog.shared'

const chapters = ['17']
const manualFigureNote =
  'This quiz grouping is organized as the separate Chapter 17 quiz in the app, even though the screenshots still preserve textbook figure labels in the 16.x range.'

const assetByQuestion: Record<string, string[]> = {
  '1': quiz17Asset('screenshot-2026-03-18-061621'),
  '2': quiz17Asset('screenshot-2026-03-18-061621'),
  '3': quiz17Asset('screenshot-2026-03-18-061651'),
  '4': quiz17Asset('screenshot-2026-03-18-061724'),
  '5': quiz17Asset('screenshot-2026-03-18-061724'),
  '6': quiz17Asset('screenshot-2026-03-18-061738'),
  '7': quiz17Asset('screenshot-2026-03-18-061738'),
  '8': quiz17Asset('screenshot-2026-03-18-061816'),
  '9': quiz17Asset('screenshot-2026-03-18-061816'),
  '10': quiz17Asset('screenshot-2026-03-18-061854'),
  '11': quiz17Asset('screenshot-2026-03-18-061924'),
  '12': quiz17Asset('screenshot-2026-03-18-061924'),
  '13': quiz17Asset('screenshot-2026-03-18-062023'),
  '14': quiz17Asset('screenshot-2026-03-18-062042'),
  '15': quiz17Asset('screenshot-2026-03-18-062126'),
  '16': quiz17Asset('screenshot-2026-03-18-062126'),
  '17': quiz17Asset('screenshot-2026-03-18-062143'),
  '18': quiz17Asset('screenshot-2026-03-18-062143'),
  '19': quiz17Asset('screenshot-2026-03-18-062231'),
  '20': quiz17Asset('screenshot-2026-03-18-062248'),
  '21': quiz17Asset('screenshot-2026-03-18-062317'),
  '22': quiz17Asset('screenshot-2026-03-18-062317'),
  '23': quiz17Asset('screenshot-2026-03-18-062354'),
  '24': quiz17Asset('screenshot-2026-03-18-062410'),
  '25': quiz17Asset('screenshot-2026-03-18-062410'),
  '26': quiz17Asset('screenshot-2026-03-18-062443'),
  '27': quiz17Asset('screenshot-2026-03-18-062509'),
  '28': quiz17Asset('screenshot-2026-03-18-062509'),
  '29': quiz17Asset('screenshot-2026-03-18-062543'),
  '30': quiz17Asset('screenshot-2026-03-18-062559'),
  '31': quiz17Asset('screenshot-2026-03-18-062624'),
  '32': quiz17Asset('screenshot-2026-03-18-062624'),
  '33': quiz17Asset('screenshot-2026-03-18-062710'),
  '34': quiz17Asset('screenshot-2026-03-18-062751'),
}

function supportedQuiz17(input: {
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
    sourceId: 'quiz-17',
    chapters,
    assetRefs: assetByQuestion[input.questionNumber],
    solverMode: input.solverMode ?? 'chapter-goal',
    provenanceNote: input.provenanceNote ?? manualFigureNote,
  })
}

function outOfScopeQuiz17(input: {
  id: string
  questionNumber: string
  classification: Exclude<QuestionCatalogEntry['classification'], 'calculation'>
  promptText: string
  outOfScopeReason?: string
  provenanceNote?: string
}) {
  return outOfScopeQuestion({
    ...input,
    sourceId: 'quiz-17',
    chapters,
    assetRefs: assetByQuestion[input.questionNumber],
    outOfScopeReason: input.outOfScopeReason ?? textbookMathOnlyReason,
    provenanceNote: input.provenanceNote ?? manualFigureNote,
  })
}

export const quiz17QuestionCatalog: QuestionCatalogEntry[] = [
  outOfScopeQuiz17({
    id: 'quiz-17-1',
    questionNumber: '1',
    classification: 'true-false',
    promptText: 'True or false: the equivalent circuit is used to determine source current in series-parallel AC networks.',
  }),
  supportedQuiz17({
    id: 'quiz-17-2',
    questionNumber: '2',
    promptText: 'Figure 16.5: determine branch current I1 from the shown source and branch impedances.',
    solverMode: 'parallel-builder',
    mappedGoalIds: ['parallel-resistor-current'],
    mappedFormulaIds: ['parallel-branch-current', 'current-divider'],
    testCaseId: 'parallel-resistor-branch-current',
  }),
  outOfScopeQuiz17({
    id: 'quiz-17-3',
    questionNumber: '3',
    classification: 'concept',
    promptText: 'Figure 16.3: choose the current relationship that correctly describes branch current I1.',
  }),
  supportedQuiz17({
    id: 'quiz-17-4',
    questionNumber: '4',
    promptText: 'Figure 16.5: determine total admittance YT.',
    solverMode: 'parallel-builder',
    mappedGoalIds: ['parallel-admittance'],
    mappedFormulaIds: ['parallel-admittance-complex'],
    testCaseId: 'parallel-admittance-figure-16-5',
  }),
  supportedQuiz17({
    id: 'quiz-17-5',
    questionNumber: '5',
    promptText: 'Figure 16.6: determine total impedance ZT.',
    solverMode: 'series-parallel-builder',
    mappedGoalIds: ['series-parallel-impedance'],
    mappedFormulaIds: ['mixed-network-reduction'],
    testCaseId: 'series-parallel-impedance',
  }),
  outOfScopeQuiz17({
    id: 'quiz-17-6',
    questionNumber: '6',
    classification: 'true-false',
    promptText: 'True or false: the total impedance of two parallel impedances equals the sum of the impedances divided by their product.',
  }),
  outOfScopeQuiz17({
    id: 'quiz-17-7',
    questionNumber: '7',
    classification: 'true-false',
    promptText: 'True or false: the Figure 16.2 circuit statement about purely resistive total impedance is correct.',
  }),
  supportedQuiz17({
    id: 'quiz-17-8',
    questionNumber: '8',
    promptText: 'Figure 16.2: determine total impedance ZT.',
    solverMode: 'parallel-builder',
    mappedGoalIds: ['parallel-impedance'],
    mappedFormulaIds: ['parallel-impedance'],
    testCaseId: 'parallel-impedance-basic',
  }),
  supportedQuiz17({
    id: 'quiz-17-9',
    questionNumber: '9',
    promptText: 'Figure 16.9: determine the current through the capacitor branch.',
    solverMode: 'parallel-builder',
    mappedGoalIds: ['parallel-capacitor-current'],
    mappedFormulaIds: ['parallel-branch-current', 'current-divider'],
    testCaseId: 'parallel-capacitor-branch-current',
  }),
  outOfScopeQuiz17({
    id: 'quiz-17-10',
    questionNumber: '10',
    classification: 'concept',
    promptText: 'Figure 16.4: choose the correct current relationship for the mixed network.',
  }),
  supportedQuiz17({
    id: 'quiz-17-11',
    questionNumber: '11',
    promptText: 'Figure 16.1: determine total impedance ZT.',
    solverMode: 'parallel-builder',
    mappedGoalIds: ['parallel-impedance'],
    mappedFormulaIds: ['parallel-impedance'],
    testCaseId: 'parallel-impedance-figure-16-1',
  }),
  outOfScopeQuiz17({
    id: 'quiz-17-12',
    questionNumber: '12',
    classification: 'true-false',
    promptText: 'True or false: the fundamental concept for solving series-parallel AC networks is different from the DC case.',
  }),
  outOfScopeQuiz17({
    id: 'quiz-17-13',
    questionNumber: '13',
    classification: 'true-false',
    promptText: 'True or false: a negative total impedance phase angle means the network is capacitive in nature.',
  }),
  supportedQuiz17({
    id: 'quiz-17-14',
    questionNumber: '14',
    promptText: 'Figure 16.6: determine total current I.',
    solverMode: 'series-parallel-builder',
    mappedGoalIds: ['series-parallel-source-current'],
    mappedFormulaIds: ['source-current-phasor', 'mixed-network-reduction'],
    testCaseId: 'series-parallel-source-current',
  }),
  supportedQuiz17({
    id: 'quiz-17-15',
    questionNumber: '15',
    promptText: 'Figure 16.5: determine the value of branch current I1.',
    solverMode: 'parallel-builder',
    mappedGoalIds: ['parallel-resistor-current'],
    mappedFormulaIds: ['parallel-branch-current', 'current-divider'],
    testCaseId: 'parallel-resistor-branch-current',
  }),
  outOfScopeQuiz17({
    id: 'quiz-17-16',
    questionNumber: '16',
    classification: 'true-false',
    promptText: 'True or false: combining the impedance of more than one element can help determine total voltage across a series combination.',
  }),
  outOfScopeQuiz17({
    id: 'quiz-17-17',
    questionNumber: '17',
    classification: 'true-false',
    promptText: 'True or false: at higher frequency, XC is better approximated as a short circuit for AC conditions.',
  }),
  supportedQuiz17({
    id: 'quiz-17-18',
    questionNumber: '18',
    promptText: 'Figure 16.9: determine the current through the 20 ohm resistor.',
    solverMode: 'parallel-builder',
    mappedGoalIds: ['parallel-resistor-current'],
    mappedFormulaIds: ['parallel-branch-current', 'current-divider'],
    testCaseId: 'parallel-resistor-branch-current',
  }),
  supportedQuiz17({
    id: 'quiz-17-19',
    questionNumber: '19',
    promptText: 'Figure 16.4: given source voltage and source current phasors, determine total impedance ZT.',
    solverMode: 'chapter-goal',
    mappedGoalIds: ['impedance-from-source-voltage-and-current-phasors'],
    mappedFormulaIds: ['complex-ohms-law'],
    testCaseId: 'goal-impedance-from-source-voltage-and-current-phasors',
  }),
  outOfScopeQuiz17({
    id: 'quiz-17-20',
    questionNumber: '20',
    classification: 'true-false',
    promptText: 'True or false: the total impedance in Figure 16.1 is independent of applied frequency.',
  }),
  outOfScopeQuiz17({
    id: 'quiz-17-21',
    questionNumber: '21',
    classification: 'true-false',
    promptText: 'True or false: the current divider rule can be applied to determine the current through the capacitor in Figure 16.1.',
  }),
  outOfScopeQuiz17({
    id: 'quiz-17-22',
    questionNumber: '22',
    classification: 'true-false',
    promptText: 'True or false: the capacitor effect in the stated dual analog is negligible and allows AC to pass with little disturbance.',
  }),
  supportedQuiz17({
    id: 'quiz-17-23',
    questionNumber: '23',
    promptText: 'Figure 16.1: given the applied frequency, determine the inductor value L.',
    solverMode: 'chapter-goal',
    mappedGoalIds: ['inductance-from-reactance-and-frequency'],
    mappedFormulaIds: ['inductance'],
    testCaseId: 'goal-inductance-from-reactance-and-frequency',
  }),
  outOfScopeQuiz17({
    id: 'quiz-17-24',
    questionNumber: '24',
    classification: 'true-false',
    promptText: 'True or false: current I2 may be found by dividing E by ZP in Figure 16.1.',
  }),
  outOfScopeQuiz17({
    id: 'quiz-17-25',
    questionNumber: '25',
    classification: 'true-false',
    promptText: 'True or false: a ground-fault circuit interrupter does not prevent all shock current, but it does cut power quickly.',
  }),
  outOfScopeQuiz17({
    id: 'quiz-17-26',
    questionNumber: '26',
    classification: 'concept',
    promptText: 'Figure 16.3: choose the equation that correctly describes source voltage E.',
  }),
  supportedQuiz17({
    id: 'quiz-17-27',
    questionNumber: '27',
    promptText: 'Figure 16.9: determine the current through the 20 ohm resistor.',
    solverMode: 'parallel-builder',
    mappedGoalIds: ['parallel-resistor-current'],
    mappedFormulaIds: ['parallel-branch-current', 'current-divider'],
    testCaseId: 'parallel-resistor-branch-current',
  }),
  outOfScopeQuiz17({
    id: 'quiz-17-28',
    questionNumber: '28',
    classification: 'true-false',
    promptText: 'True or false: ladder networks do not require the total impedance to be known before determining total current.',
  }),
  supportedQuiz17({
    id: 'quiz-17-29',
    questionNumber: '29',
    promptText: 'Figure 16.1: given the source current phasor, determine the current through the coil.',
    solverMode: 'parallel-builder',
    mappedGoalIds: ['parallel-inductor-current'],
    mappedFormulaIds: ['parallel-branch-current', 'current-divider'],
    testCaseId: 'parallel-inductor-branch-current',
  }),
  outOfScopeQuiz17({
    id: 'quiz-17-30',
    questionNumber: '30',
    classification: 'concept',
    promptText: 'Figure 16.3: choose the equation that correctly describes total impedance ZT.',
  }),
  outOfScopeQuiz17({
    id: 'quiz-17-31',
    questionNumber: '31',
    classification: 'concept',
    promptText: 'Figure 16.4: choose the equation that correctly describes total impedance ZT.',
  }),
  outOfScopeQuiz17({
    id: 'quiz-17-32',
    questionNumber: '32',
    classification: 'true-false',
    promptText: 'True or false: determining source current is the most critical step in solving series-parallel AC networks.',
  }),
  outOfScopeQuiz17({
    id: 'quiz-17-33',
    questionNumber: '33',
    classification: 'true-false',
    promptText: 'True or false: the Figure 16.1 relationship comparing ZT with R, XC, and XL is correct.',
  }),
  outOfScopeQuiz17({
    id: 'quiz-17-34',
    questionNumber: '34',
    classification: 'concept',
    promptText: 'Figure 16.2: describe how total impedance changes as frequency increases.',
  }),
]
