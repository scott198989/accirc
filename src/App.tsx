import { startTransition, useState } from 'react'
import {
  formulaCount,
  formatQuantityInBaseUnit,
  formatQuantitySmart,
  formulaFamilies,
  quantityDefinitions,
  quantityMap,
  solveCircuitProblem,
  type QuantityId,
  type SolveResult,
  type SolverInputRow,
} from './core'
import {
  solveGuidedSeriesImpedance,
  type GuidedComponentInput,
  type GuidedComponentKind,
  type GuidedComputedValue,
  type GuidedSeriesGoal,
  type GuidedSeriesImpedanceResult,
  type GuidedValueMode,
} from './features/guidedSeriesImpedance'
import {
  solveGuidedParallelCircuit,
  type GuidedParallelCircuitResult,
  type GuidedParallelGoal,
} from './features/guidedParallelCircuit'
import {
  guidedMathGoalGroups,
  guidedMathGoalMap,
  guidedMathGoals,
  makeGuidedMathRows,
  solveGuidedMathGoal,
  type GuidedMathGoalDefinition,
} from './features/guidedMathGoals'
import {
  defaultUnitIdForGuidedSymbol,
  guidedSymbolDefinitionMap,
  guidedSymbolGroups,
  makeGuidedSymbolRow,
  placeholderForGuidedSymbol,
  solveGuidedSymbolProblem,
  unitOptionsForGuidedSymbol,
  type GuidedSymbolProblemResult,
  type GuidedSymbolRow,
  type GuidedSymbolTopology,
} from './features/guidedSymbolProblem'

type AppMode = 'guided' | 'formula'
type GuidedWorkflow = 'chapter-goal' | 'symbol-builder' | 'series-builder' | 'parallel-builder'

interface KnownRow extends SolverInputRow {
  id: string
}

interface GuidedMathRow extends SolverInputRow {
  id: string
}

interface GuidedSymbolPart {
  id: string
  label: string
  rows: GuidedSymbolRow[]
  result: GuidedSymbolProblemResult | null
}

const quantityGroups = groupByCategory()
const defaultGuidedMathGoal = guidedMathGoals[0]
const defaultGuidedSymbolPart = makeGuidedSymbolPart('Part A')

const guidedGoalOptions: Array<{
  value: GuidedSeriesGoal
  label: string
  description: string
}> = [
  {
    value: 'series-impedance',
    label: 'Total impedance of a series circuit',
    description: 'Best for problems asking for Z in rectangular and polar form.',
  },
  {
    value: 'series-phase-angle',
    label: 'Phase angle of a series circuit',
    description: 'Uses the total net reactance and resistance to find the impedance angle.',
  },
  {
    value: 'series-power-factor',
    label: 'Power factor of a series circuit',
    description: 'Finds the power factor from the impedance angle.',
  },
  {
    value: 'series-source-current',
    label: 'Source current in a series circuit',
    description: 'Needs the source voltage magnitude.',
  },
  {
    value: 'series-resistor-voltage',
    label: 'Voltage across the total series resistance',
    description: 'Needs the source voltage magnitude.',
  },
  {
    value: 'series-inductor-voltage',
    label: 'Voltage across the total series inductance',
    description: 'Needs the source voltage magnitude.',
  },
  {
    value: 'series-capacitor-voltage',
    label: 'Voltage across the total series capacitance',
    description: 'Needs the source voltage magnitude.',
  },
  {
    value: 'series-real-power',
    label: 'Real power delivered to a series circuit',
    description: 'Needs the source voltage magnitude.',
  },
]

const parallelGoalOptions: Array<{
  value: GuidedParallelGoal
  label: string
  description: string
}> = [
  {
    value: 'parallel-admittance',
    label: 'Total admittance of a parallel circuit',
    description: 'Best for Chapter 16 problems asking for Y in rectangular and polar form.',
  },
  {
    value: 'parallel-admittance-angle',
    label: 'Admittance angle of a parallel circuit',
    description: 'Shows whether source current leads or lags the source voltage.',
  },
  {
    value: 'parallel-impedance',
    label: 'Total impedance of a parallel circuit',
    description: 'Converts the total admittance into total impedance.',
  },
  {
    value: 'parallel-source-current',
    label: 'Source current in a parallel circuit',
    description: 'Needs the source voltage magnitude.',
  },
  {
    value: 'parallel-power-factor',
    label: 'Power factor of a parallel circuit',
    description: 'Uses total conductance and admittance magnitude.',
  },
  {
    value: 'parallel-real-power',
    label: 'Real power delivered to a parallel circuit',
    description: 'Needs the source voltage magnitude.',
  },
  {
    value: 'parallel-resistor-current',
    label: 'Current through the total resistive branch',
    description: 'Needs the source voltage magnitude.',
  },
  {
    value: 'parallel-inductor-current',
    label: 'Current through the total inductive branch',
    description: 'Needs the source voltage magnitude.',
  },
  {
    value: 'parallel-capacitor-current',
    label: 'Current through the total capacitive branch',
    description: 'Needs the source voltage magnitude.',
  },
]

const guidedSamples: Array<{
  id: string
  title: string
  frequencyRawValue: string
  frequencyUnitId: string
  sourceVoltageRawValue: string
  sourceVoltageUnitId: string
  components: Array<Omit<GuidedComponentInput, 'id'>>
}> = [
  {
    id: 'figure-a',
    title: 'Figure 15.86 (a)',
    frequencyRawValue: '',
    frequencyUnitId: 'hz',
    sourceVoltageRawValue: '',
    sourceVoltageUnitId: 'v',
    components: [
      { kind: 'resistor', valueMode: 'resistance', rawValue: '3', unitId: 'ohm' },
      { kind: 'inductor', valueMode: 'reactance', rawValue: '4', unitId: 'ohm' },
      { kind: 'capacitor', valueMode: 'reactance', rawValue: '5', unitId: 'ohm' },
    ],
  },
  {
    id: 'figure-b',
    title: 'Figure 15.86 (b)',
    frequencyRawValue: '',
    frequencyUnitId: 'hz',
    sourceVoltageRawValue: '',
    sourceVoltageUnitId: 'v',
    components: [
      { kind: 'resistor', valueMode: 'resistance', rawValue: '1', unitId: 'kohm' },
      { kind: 'inductor', valueMode: 'reactance', rawValue: '2', unitId: 'kohm' },
      { kind: 'inductor', valueMode: 'reactance', rawValue: '6', unitId: 'kohm' },
      { kind: 'capacitor', valueMode: 'reactance', rawValue: '4', unitId: 'kohm' },
    ],
  },
  {
    id: 'figure-c',
    title: 'Figure 15.86 (c)',
    frequencyRawValue: '1',
    frequencyUnitId: 'khz',
    sourceVoltageRawValue: '',
    sourceVoltageUnitId: 'v',
    components: [
      { kind: 'resistor', valueMode: 'resistance', rawValue: '470', unitId: 'ohm' },
      { kind: 'inductor', valueMode: 'inductance', rawValue: '47', unitId: 'mh' },
      { kind: 'inductor', valueMode: 'inductance', rawValue: '200', unitId: 'mh' },
      { kind: 'capacitor', valueMode: 'capacitance', rawValue: '0.1', unitId: 'uf' },
    ],
  },
]

function App() {
  const [mode, setMode] = useState<AppMode>('guided')
  const [guidedWorkflow, setGuidedWorkflow] = useState<GuidedWorkflow>('symbol-builder')
  const [symbolTopology, setSymbolTopology] = useState<GuidedSymbolTopology>('series')
  const [guidedGoal, setGuidedGoal] = useState<GuidedSeriesGoal>('series-impedance')
  const [parallelGoal, setParallelGoal] = useState<GuidedParallelGoal>('parallel-admittance')
  const [guidedMathGoalId, setGuidedMathGoalId] = useState(defaultGuidedMathGoal.id)
  const [target, setTarget] = useState<QuantityId>('inductiveReactance')
  const [rows, setRows] = useState<KnownRow[]>([makeFormulaRow('frequency')])
  const [formulaResult, setFormulaResult] = useState<SolveResult | null>(null)
  const [guidedMathRows, setGuidedMathRows] = useState<GuidedMathRow[]>(
    makeGuidedMathRows(defaultGuidedMathGoal).map((row) => makeGuidedMathRow(row.quantityId)),
  )
  const [guidedMathResult, setGuidedMathResult] = useState<SolveResult | null>(null)
  const [frequencyRawValue, setFrequencyRawValue] = useState('')
  const [frequencyUnitId, setFrequencyUnitId] = useState('hz')
  const [sourceVoltageRawValue, setSourceVoltageRawValue] = useState('')
  const [sourceVoltageUnitId, setSourceVoltageUnitId] = useState('v')
  const [guidedComponents, setGuidedComponents] = useState<GuidedComponentInput[]>([
    makeGuidedComponent('resistor'),
  ])
  const [guidedResult, setGuidedResult] = useState<GuidedSeriesImpedanceResult | null>(null)
  const [parallelComponents, setParallelComponents] = useState<GuidedComponentInput[]>([
    makeGuidedComponent('resistor'),
  ])
  const [parallelResult, setParallelResult] = useState<GuidedParallelCircuitResult | null>(null)
  const [symbolParts, setSymbolParts] = useState<GuidedSymbolPart[]>([defaultGuidedSymbolPart])
  const [selectedSymbolPartId, setSelectedSymbolPartId] = useState(defaultGuidedSymbolPart.id)

  const targetDefinition = quantityMap[target]
  const selectedGoal = guidedGoalOptions.find((goal) => goal.value === guidedGoal) ?? guidedGoalOptions[0]
  const selectedParallelGoal =
    parallelGoalOptions.find((goal) => goal.value === parallelGoal) ?? parallelGoalOptions[0]
  const selectedMathGoal = guidedMathGoalMap[guidedMathGoalId] ?? defaultGuidedMathGoal
  const selectedSymbolGoal = symbolTopology === 'series' ? selectedGoal : selectedParallelGoal
  const selectedSymbolPart =
    symbolParts.find((part) => part.id === selectedSymbolPartId) ?? symbolParts[0]

  function addFormulaRow() {
    setRows((current) => [...current, makeFormulaRow('voltage')])
  }

  function updateFormulaRow(rowId: string, updates: Partial<KnownRow>) {
    setRows((current) =>
      current.map((row) => {
        if (row.id !== rowId) {
          return row
        }

        if (updates.quantityId) {
          const nextQuantity = quantityMap[updates.quantityId]
          return {
            ...row,
            quantityId: updates.quantityId,
            unitId: nextQuantity.defaultUnitId,
            rawValue: '',
          }
        }

        return { ...row, ...updates }
      }),
    )
  }

  function removeFormulaRow(rowId: string) {
    setRows((current) => (current.length === 1 ? current : current.filter((row) => row.id !== rowId)))
  }

  function solveFormulaMode() {
    startTransition(() => {
      setFormulaResult(
        solveCircuitProblem(
          target,
          rows.map((row) => ({
            quantityId: row.quantityId,
            rawValue: row.rawValue,
            unitId: row.unitId,
          })),
        ),
      )
    })
  }

  function changeGuidedMathGoal(goalId: string) {
    const nextGoal = guidedMathGoalMap[goalId]
    if (!nextGoal) {
      return
    }

    startTransition(() => {
      setGuidedMathGoalId(goalId)
      setGuidedMathRows(
        makeGuidedMathRows(nextGoal).map((row) =>
          makeGuidedMathRow(row.quantityId, row.rawValue, row.unitId),
        ),
      )
      setGuidedMathResult(null)
    })
  }

  function updateGuidedMathRow(rowId: string, updates: Partial<GuidedMathRow>) {
    setGuidedMathRows((current) =>
      current.map((row) => (row.id === rowId ? { ...row, ...updates } : row)),
    )
  }

  function solveGuidedMathMode() {
    startTransition(() => {
      setGuidedMathResult(
        solveGuidedMathGoal(
          selectedMathGoal,
          guidedMathRows.map((row) => ({
            quantityId: row.quantityId,
            rawValue: row.rawValue,
            unitId: row.unitId,
          })),
        ),
      )
    })
  }

  function changeSymbolTopology(topology: GuidedSymbolTopology) {
    const nextDefaultPart = makeGuidedSymbolPart('Part A')

    startTransition(() => {
      setSymbolTopology(topology)
      setSymbolParts([nextDefaultPart])
      setSelectedSymbolPartId(nextDefaultPart.id)
    })
  }

  function addSymbolPart() {
    const nextPart = makeGuidedSymbolPart(nextGuidedSymbolPartLabel(symbolParts.length))

    startTransition(() => {
      setSymbolParts((current) => [...current, nextPart])
      setSelectedSymbolPartId(nextPart.id)
    })
  }

  function removeSymbolPart(partId: string) {
    if (symbolParts.length === 1) {
      return
    }

    const remaining = symbolParts.filter((part) => part.id !== partId)
    const nextSelectedId =
      selectedSymbolPartId === partId ? (remaining[0]?.id ?? selectedSymbolPartId) : selectedSymbolPartId

    startTransition(() => {
      setSymbolParts(remaining)
      setSelectedSymbolPartId(nextSelectedId)
    })
  }

  function addSymbolRow() {
    setSymbolParts((current) =>
      current.map((part) =>
        part.id === selectedSymbolPartId
          ? {
              ...part,
              rows: [...part.rows, makeGuidedSymbolRow('r')],
              result: null,
            }
          : part,
      ),
    )
  }

  function updateSymbolRow(rowId: string, updates: Partial<GuidedSymbolRow>) {
    setSymbolParts((current) =>
      current.map((part) => {
        if (part.id !== selectedSymbolPartId) {
          return part
        }

        return {
          ...part,
          result: null,
          rows: part.rows.map((row) => {
            if (row.id !== rowId) {
              return row
            }

            if (updates.symbolId) {
              return {
                ...row,
                symbolId: updates.symbolId,
                unitId: defaultUnitIdForGuidedSymbol(updates.symbolId),
                rawValue: '',
              }
            }

            return { ...row, ...updates }
          }),
        }
      }),
    )
  }

  function removeSymbolRow(rowId: string) {
    setSymbolParts((current) =>
      current.map((part) =>
        part.id === selectedSymbolPartId
          ? {
              ...part,
              result: null,
              rows:
                part.rows.length === 1
                  ? part.rows
                  : part.rows.filter((row) => row.id !== rowId),
            }
          : part,
      ),
    )
  }

  function solveSymbolMode() {
    startTransition(() => {
      setSymbolParts((current) =>
        current.map((part) => ({
          ...part,
          result: solveGuidedSymbolProblem({
            topology: symbolTopology,
            seriesGoal: guidedGoal,
            parallelGoal,
            rows: part.rows,
          }),
        })),
      )
    })
  }

  function addGuidedComponent() {
    setGuidedComponents((current) => [...current, makeGuidedComponent('inductor')])
  }

  function updateGuidedComponent(componentId: string, updates: Partial<GuidedComponentInput>) {
    setGuidedComponents((current) =>
      current.map((component) => {
        if (component.id !== componentId) {
          return component
        }

        if (updates.kind) {
          const nextValueMode = defaultValueModeForKind(updates.kind)
          return {
            ...component,
            kind: updates.kind,
            valueMode: nextValueMode,
            unitId: defaultUnitForGuided(nextValueMode),
            rawValue: '',
          }
        }

        if (updates.valueMode) {
          return {
            ...component,
            valueMode: updates.valueMode,
            unitId: defaultUnitForGuided(updates.valueMode),
            rawValue: '',
          }
        }

        return { ...component, ...updates }
      }),
    )
  }

  function removeGuidedComponent(componentId: string) {
    setGuidedComponents((current) =>
      current.length === 1 ? current : current.filter((component) => component.id !== componentId),
    )
  }

  function solveGuidedMode() {
    startTransition(() => {
      setGuidedResult(
        solveGuidedSeriesImpedance({
          goal: guidedGoal,
          frequencyRawValue,
          frequencyUnitId,
          sourceVoltageRawValue,
          sourceVoltageUnitId,
          components: guidedComponents,
        }),
      )
    })
  }

  function addParallelComponent() {
    setParallelComponents((current) => [...current, makeGuidedComponent('inductor')])
  }

  function updateParallelComponent(componentId: string, updates: Partial<GuidedComponentInput>) {
    setParallelComponents((current) =>
      current.map((component) => {
        if (component.id !== componentId) {
          return component
        }

        if (updates.kind) {
          const nextValueMode = defaultValueModeForKind(updates.kind)
          return {
            ...component,
            kind: updates.kind,
            valueMode: nextValueMode,
            unitId: defaultUnitForGuided(nextValueMode),
            rawValue: '',
          }
        }

        if (updates.valueMode) {
          return {
            ...component,
            valueMode: updates.valueMode,
            unitId: defaultUnitForGuided(updates.valueMode),
            rawValue: '',
          }
        }

        return { ...component, ...updates }
      }),
    )
  }

  function removeParallelComponent(componentId: string) {
    setParallelComponents((current) =>
      current.length === 1 ? current : current.filter((component) => component.id !== componentId),
    )
  }

  function solveParallelMode() {
    startTransition(() => {
      setParallelResult(
        solveGuidedParallelCircuit({
          goal: parallelGoal,
          frequencyRawValue,
          frequencyUnitId,
          sourceVoltageRawValue,
          sourceVoltageUnitId,
          components: parallelComponents,
        }),
      )
    })
  }

  function loadGuidedSample(sampleId: string) {
    const sample = guidedSamples.find((entry) => entry.id === sampleId)
    if (!sample) {
      return
    }

    const nextDefaultPart = makeGuidedSymbolPart('Part A')

    startTransition(() => {
      setMode('guided')
      setGuidedWorkflow('series-builder')
      setGuidedMathResult(null)
      setSymbolParts([nextDefaultPart])
      setSelectedSymbolPartId(nextDefaultPart.id)
      setParallelResult(null)
      setFrequencyRawValue(sample.frequencyRawValue)
      setFrequencyUnitId(sample.frequencyUnitId)
      setSourceVoltageRawValue(sample.sourceVoltageRawValue)
      setSourceVoltageUnitId(sample.sourceVoltageUnitId)
      setGuidedComponents(
        sample.components.map((component) =>
          makeGuidedComponent(component.kind, component.valueMode, component.rawValue, component.unitId),
        ),
      )
      setGuidedResult(null)
    })
  }

  return (
    <div className="shell">
      <header className="hero">
        <div className="hero__copy">
          <p className="eyebrow">Offline. Deterministic. Transparent.</p>
          <h1>AC Circuits Formula Selector and Solver</h1>
          <p className="hero__lede">
            Guided mode now lets the user solve from chapter goals, from the exact variable
            labels printed in the book, or from circuit diagrams, all while keeping the
            solve path deterministic and transparent.
          </p>
          <div className="hero__stats">
            <span>{formulaFamilies.length} formula families</span>
            <span>{formulaCount} solve variants</span>
            <span>Chapter 11-17 guided workflows</span>
            <span>No network needed at runtime</span>
          </div>
        </div>

        <aside className="hero__panel">
          <p className="panel__label">Textbook quick loads</p>
          <div className="sample-list">
            {guidedSamples.map((sample) => (
              <button
                key={sample.id}
                className="sample-button"
                onClick={() => loadGuidedSample(sample.id)}
                type="button"
              >
                {sample.title}
              </button>
            ))}
          </div>
          <p className="panel__note">
            I reviewed Chapters 11-17 and am using that structure to expand guided workflows
            around the actual problem families in the book, not just isolated formulas.
          </p>
        </aside>
      </header>

      <div className="mode-switch" role="tablist" aria-label="App mode">
        <button
          className={mode === 'guided' ? 'mode-switch__button is-active' : 'mode-switch__button'}
          onClick={() => setMode('guided')}
          role="tab"
          type="button"
        >
          Guided mode
        </button>
        <button
          className={mode === 'formula' ? 'mode-switch__button is-active' : 'mode-switch__button'}
          onClick={() => setMode('formula')}
          role="tab"
          type="button"
        >
          Formula mode
        </button>
      </div>

      {mode === 'guided' ? (
        <main className="workspace">
          <section className="card builder">
            <div className="card__header">
              <div>
                <p className="eyebrow">Guided Problem Mode</p>
                <h2>
                  {guidedWorkflow === 'chapter-goal'
                    ? 'Pick the answer the textbook problem wants'
                    : guidedWorkflow === 'symbol-builder'
                      ? 'Choose the exact textbook labels the problem gives you'
                    : guidedWorkflow === 'series-builder'
                      ? 'Tell the app what the series-circuit problem is asking for'
                      : 'Tell the app what the parallel-circuit problem is asking for'}
                </h2>
              </div>
              {(guidedWorkflow === 'symbol-builder' ||
                guidedWorkflow === 'series-builder' ||
                guidedWorkflow === 'parallel-builder') && (
                <button
                  className="ghost-button"
                  onClick={
                    guidedWorkflow === 'symbol-builder'
                      ? addSymbolPart
                      : guidedWorkflow === 'series-builder'
                        ? addGuidedComponent
                        : addParallelComponent
                  }
                  type="button"
                >
                  {guidedWorkflow === 'symbol-builder'
                    ? 'Add part'
                    : guidedWorkflow === 'series-builder'
                      ? 'Add component'
                      : 'Add branch'}
                </button>
              )}
            </div>

            <div className="workflow-switch" role="tablist" aria-label="Guided workflow">
              <button
                className={
                  guidedWorkflow === 'symbol-builder'
                    ? 'workflow-switch__button is-active'
                    : 'workflow-switch__button'
                }
                onClick={() => setGuidedWorkflow('symbol-builder')}
                role="tab"
                type="button"
              >
                Textbook labels
              </button>
              <button
                className={
                  guidedWorkflow === 'chapter-goal'
                    ? 'workflow-switch__button is-active'
                    : 'workflow-switch__button'
                }
                onClick={() => setGuidedWorkflow('chapter-goal')}
                role="tab"
                type="button"
              >
                Chapter math goal
              </button>
              <button
                className={
                  guidedWorkflow === 'series-builder'
                    ? 'workflow-switch__button is-active'
                    : 'workflow-switch__button'
                }
                onClick={() => setGuidedWorkflow('series-builder')}
                role="tab"
                type="button"
              >
                Series circuit from diagram
              </button>
              <button
                className={
                  guidedWorkflow === 'parallel-builder'
                    ? 'workflow-switch__button is-active'
                    : 'workflow-switch__button'
                }
                onClick={() => setGuidedWorkflow('parallel-builder')}
                role="tab"
                type="button"
              >
                Parallel circuit from diagram
              </button>
            </div>

            {guidedWorkflow === 'chapter-goal' ? (
              <>
                <div className="help-card">
                  <p className="detail-card__eyebrow">How chapter-guided mode works</p>
                  <p>1. Pick the exact kind of answer the textbook problem wants.</p>
                  <p>2. Enter only the numbers the problem gives you.</p>
                  <p>3. Click solve and let the deterministic rules engine pick the formula path.</p>
                </div>
              </>
            ) : guidedWorkflow === 'symbol-builder' ? (
              <div className="help-card">
                <p className="detail-card__eyebrow">How as-labeled variable mode works</p>
                <p>1. Pick whether the problem is a series or parallel circuit question.</p>
                <p>2. Add the exact symbols you see in the book, like R, XL1, XL2, XC, L2, C, f, or E.</p>
                <p>3. Enter them in any order. The app combines repeated R, XL, and XC values automatically.</p>
                <p>4. Click solve to get the deterministic rectangular and polar results when the goal needs them.</p>
              </div>
            ) : (
              <div className="help-card">
                <p className="detail-card__eyebrow">
                  {guidedWorkflow === 'series-builder'
                    ? 'How series-diagram mode works'
                    : 'How parallel-diagram mode works'}
                </p>
                <p>1. Pick the final answer the question wants.</p>
                <p>
                  2. Enter the {guidedWorkflow === 'series-builder' ? 'components' : 'parallel branches'} you see in the diagram.
                </p>
                <p>3. If the question gives H or F values, also enter frequency.</p>
                <p>4. If the question asks for current or power, also enter source voltage.</p>
                <p>5. If the problem labels values as R, XL1, XC, L2, or C, switch to Textbook labels mode above.</p>
              </div>
            )}

            {guidedWorkflow === 'chapter-goal' ? (
              <>
                <label className="field">
                  <span>Question goal</span>
                  <select
                    value={guidedMathGoalId}
                    onChange={(event) => changeGuidedMathGoal(event.target.value)}
                  >
                    {guidedMathGoalGroups.map((group) => (
                      <optgroup key={group.key} label={group.label}>
                        {group.goals.map((goal) => (
                          <option key={goal.id} value={goal.id}>
                            {goal.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <small>{selectedMathGoal.description}</small>
                </label>

                <article className="detail-card detail-card--goal">
                  <p className="detail-card__eyebrow">
                    Chapter {selectedMathGoal.chapter} - {selectedMathGoal.section}
                  </p>
                  <p>{selectedMathGoal.description}</p>
                  {selectedMathGoal.note && <p>{selectedMathGoal.note}</p>}
                </article>

                <div className="rows">
                  {guidedMathRows.map((row) => {
                    const definition = quantityMap[row.quantityId]

                    return (
                      <article className="row-card row-card--symbol" key={row.id}>
                        <div>
                          <p className="detail-card__eyebrow">{definition.label}</p>
                          <h3>
                            {definition.symbol} · Chapter {definition.chapter}
                          </h3>
                          <p className="row-card__hint">
                            {definition.description} Example: {definition.placeholder}
                          </p>
                        </div>

                        <label className="field">
                          <span>Value</span>
                          <input
                            value={row.rawValue}
                            onChange={(event) =>
                              updateGuidedMathRow(row.id, { rawValue: event.target.value })
                            }
                            placeholder={definition.placeholder}
                          />
                        </label>

                        <label className="field">
                          <span>Unit</span>
                          <select
                            value={row.unitId}
                            onChange={(event) =>
                              updateGuidedMathRow(row.id, { unitId: event.target.value })
                            }
                          >
                            {definition.units.map((unit) => (
                              <option key={unit.id} value={unit.id}>
                                {unit.label}
                              </option>
                            ))}
                          </select>
                        </label>
                      </article>
                    )
                  })}
                </div>

                <div className="builder__footer">
                  <p>
                    Chapter-guided mode locks the expected inputs to the selected textbook
                    math pattern so the user only fills in the numbers and units.
                  </p>
                  <button className="primary-button" onClick={solveGuidedMathMode} type="button">
                    Solve chapter goal
                  </button>
                </div>
              </>
            ) : guidedWorkflow === 'symbol-builder' ? (
              <>
                <div className="workflow-switch" role="tablist" aria-label="Variable topology">
                  <button
                    className={
                      symbolTopology === 'series'
                        ? 'workflow-switch__button is-active'
                        : 'workflow-switch__button'
                    }
                    onClick={() => changeSymbolTopology('series')}
                    role="tab"
                    type="button"
                  >
                    Series variables
                  </button>
                  <button
                    className={
                      symbolTopology === 'parallel'
                        ? 'workflow-switch__button is-active'
                        : 'workflow-switch__button'
                    }
                    onClick={() => changeSymbolTopology('parallel')}
                    role="tab"
                    type="button"
                  >
                    Parallel variables
                  </button>
                </div>

                <label className="field">
                  <span>Question goal</span>
                  <select
                    value={symbolTopology === 'series' ? guidedGoal : parallelGoal}
                    onChange={(event) =>
                      symbolTopology === 'series'
                        ? setGuidedGoal(event.target.value as GuidedSeriesGoal)
                        : setParallelGoal(event.target.value as GuidedParallelGoal)
                    }
                  >
                    {(symbolTopology === 'series' ? guidedGoalOptions : parallelGoalOptions).map((goal) => (
                      <option key={goal.value} value={goal.value}>
                        {goal.label}
                      </option>
                    ))}
                  </select>
                  <small>{selectedSymbolGoal.description}</small>
                </label>

                <article className="detail-card detail-card--goal">
                  <p className="detail-card__eyebrow">
                    {symbolTopology === 'series' ? 'Series circuit variable input' : 'Parallel circuit variable input'}
                  </p>
                  <p>
                    Enter the exact symbols from the problem statement in any order. Use this
                    mode whenever the book gives labels like R, XL1, XL2, XC, L2, C, f, or E.
                    The app keeps those labels in the trace so you can match them back to the diagram.
                  </p>
                </article>

                <div className="workflow-switch" role="tablist" aria-label="Problem parts">
                  {symbolParts.map((part) => (
                    <button
                      key={part.id}
                      className={
                        part.id === selectedSymbolPartId
                          ? 'workflow-switch__button is-active'
                          : 'workflow-switch__button'
                      }
                      onClick={() => setSelectedSymbolPartId(part.id)}
                      role="tab"
                      type="button"
                    >
                      {part.label}
                    </button>
                  ))}
                </div>

                {selectedSymbolPart && (
                  <div className="builder__footer">
                    <p>
                      {selectedSymbolPart.label} stays separate from every other part, so
                      circuits like (a), (b), and (c) are solved independently instead of being merged.
                    </p>
                    {symbolParts.length > 1 && (
                      <button
                        className="ghost-button ghost-button--danger"
                        onClick={() => removeSymbolPart(selectedSymbolPart.id)}
                        type="button"
                      >
                        Remove current part
                      </button>
                    )}
                  </div>
                )}

                <div className="rows">
                  {selectedSymbolPart?.rows.map((row) => {
                    const definition = guidedSymbolDefinitionMap[row.symbolId]

                    return (
                      <article className="row-card row-card--chapter" key={row.id}>
                        <div>
                          <p className="detail-card__eyebrow">Problem variable</p>
                          <h3>{definition.label}</h3>
                          <p className="row-card__hint">{definition.description}</p>
                        </div>

                        <label className="field">
                          <span>Symbol</span>
                          <select
                            value={row.symbolId}
                            onChange={(event) =>
                              updateSymbolRow(row.id, { symbolId: event.target.value })
                            }
                          >
                            {guidedSymbolGroups.map((group) => (
                              <optgroup key={group.key} label={group.label}>
                                {group.symbols.map((symbol) => (
                                  <option key={symbol.id} value={symbol.id}>
                                    {symbol.label}
                                  </option>
                                ))}
                              </optgroup>
                            ))}
                          </select>
                        </label>

                        <label className="field">
                          <span>Value</span>
                          <input
                            value={row.rawValue}
                            onChange={(event) =>
                              updateSymbolRow(row.id, { rawValue: event.target.value })
                            }
                            placeholder={placeholderForGuidedSymbol(row.symbolId)}
                          />
                        </label>

                        <label className="field">
                          <span>Unit</span>
                          <select
                            value={row.unitId}
                            onChange={(event) =>
                              updateSymbolRow(row.id, { unitId: event.target.value })
                            }
                          >
                            {unitOptionsForGuidedSymbol(row.symbolId).map((unit) => (
                              <option key={unit.id} value={unit.id}>
                                {unit.label}
                              </option>
                            ))}
                          </select>
                        </label>

                        <button
                          className="ghost-button ghost-button--danger"
                          onClick={() => removeSymbolRow(row.id)}
                          type="button"
                        >
                          Remove
                        </button>
                      </article>
                    )
                  })}
                </div>

                <div className="builder__footer">
                  <p>
                    Add symbols to {selectedSymbolPart?.label ?? 'this part'} and then solve.
                    Each part is evaluated with the same selected goal, but the inputs stay isolated.
                  </p>
                  <button className="ghost-button" onClick={addSymbolRow} type="button">
                    Add symbol to current part
                  </button>
                  <button className="primary-button" onClick={solveSymbolMode} type="button">
                    Solve from variables
                  </button>
                </div>
              </>
            ) : (
              <>
                <label className="field">
                  <span>Question goal</span>
                  <select
                    value={guidedWorkflow === 'series-builder' ? guidedGoal : parallelGoal}
                    onChange={(event) =>
                      guidedWorkflow === 'series-builder'
                        ? setGuidedGoal(event.target.value as GuidedSeriesGoal)
                        : setParallelGoal(event.target.value as GuidedParallelGoal)
                    }
                  >
                    {(guidedWorkflow === 'series-builder' ? guidedGoalOptions : parallelGoalOptions).map((goal) => (
                      <option key={goal.value} value={goal.value}>
                        {goal.label}
                      </option>
                    ))}
                  </select>
                  <small>
                    {guidedWorkflow === 'series-builder'
                      ? selectedGoal.description
                      : selectedParallelGoal.description}
                  </small>
                </label>

                <div className="detail-grid detail-grid--inputs">
                  <article className="detail-card">
                    <p className="detail-card__eyebrow">Frequency if needed</p>
                    <div className="frequency-row">
                      <label className="field">
                        <span>Value</span>
                        <input
                          value={frequencyRawValue}
                          onChange={(event) => setFrequencyRawValue(event.target.value)}
                          placeholder="1"
                        />
                      </label>

                      <label className="field">
                        <span>Unit</span>
                        <select
                          value={frequencyUnitId}
                          onChange={(event) => setFrequencyUnitId(event.target.value)}
                        >
                          {quantityMap.frequency.units.map((unit) => (
                            <option key={unit.id} value={unit.id}>
                              {unit.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </article>

                  <article className="detail-card">
                    <p className="detail-card__eyebrow">Source voltage if needed</p>
                    <div className="frequency-row">
                      <label className="field">
                        <span>Value</span>
                        <input
                          value={sourceVoltageRawValue}
                          onChange={(event) => setSourceVoltageRawValue(event.target.value)}
                          placeholder="120"
                        />
                      </label>

                      <label className="field">
                        <span>Unit</span>
                        <select
                          value={sourceVoltageUnitId}
                          onChange={(event) => setSourceVoltageUnitId(event.target.value)}
                        >
                          {quantityMap.voltage.units.map((unit) => (
                            <option key={unit.id} value={unit.id}>
                              {unit.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </article>
                </div>

                <div className="rows">
                  {(guidedWorkflow === 'series-builder' ? guidedComponents : parallelComponents).map((component) => (
                    <article className="row-card row-card--guided" key={component.id}>
                      <label className="field">
                        <span>Component</span>
                        <select
                          value={component.kind}
                          onChange={(event) =>
                            guidedWorkflow === 'series-builder'
                              ? updateGuidedComponent(component.id, {
                                  kind: event.target.value as GuidedComponentKind,
                                })
                              : updateParallelComponent(component.id, {
                                  kind: event.target.value as GuidedComponentKind,
                                })
                          }
                        >
                          <option value="resistor">Resistor</option>
                          <option value="inductor">Inductor</option>
                          <option value="capacitor">Capacitor</option>
                        </select>
                      </label>

                      <label className="field">
                        <span>Given as</span>
                        <select
                          value={component.valueMode}
                          onChange={(event) =>
                            guidedWorkflow === 'series-builder'
                              ? updateGuidedComponent(component.id, {
                                  valueMode: event.target.value as GuidedValueMode,
                                })
                              : updateParallelComponent(component.id, {
                                  valueMode: event.target.value as GuidedValueMode,
                                })
                          }
                        >
                          {valueModesForKind(component.kind).map((modeOption) => (
                            <option key={modeOption.value} value={modeOption.value}>
                              {modeOption.label}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="field">
                        <span>Value</span>
                        <input
                          value={component.rawValue}
                          onChange={(event) =>
                            guidedWorkflow === 'series-builder'
                              ? updateGuidedComponent(component.id, { rawValue: event.target.value })
                              : updateParallelComponent(component.id, { rawValue: event.target.value })
                          }
                          placeholder={placeholderForGuided(component.valueMode)}
                        />
                      </label>

                      <label className="field">
                        <span>Unit</span>
                        <select
                          value={component.unitId}
                          onChange={(event) =>
                            guidedWorkflow === 'series-builder'
                              ? updateGuidedComponent(component.id, { unitId: event.target.value })
                              : updateParallelComponent(component.id, { unitId: event.target.value })
                          }
                        >
                          {unitsForGuided(component.valueMode).map((unit) => (
                            <option key={unit.id} value={unit.id}>
                              {unit.label}
                            </option>
                          ))}
                        </select>
                      </label>

                      <button
                        className="ghost-button ghost-button--danger"
                        onClick={() =>
                          guidedWorkflow === 'series-builder'
                            ? removeGuidedComponent(component.id)
                            : removeParallelComponent(component.id)
                        }
                        type="button"
                      >
                        Remove
                      </button>
                    </article>
                  ))}
                </div>

                <div className="builder__footer">
                  <p>
                    {guidedWorkflow === 'series-builder'
                      ? 'The app aggregates the series elements, converts L and C into reactance when needed, and then solves the final target with the deterministic rules engine.'
                      : 'The app aggregates the parallel branches, converts them into total conductance and susceptance, and then solves the final target with the deterministic rules engine.'}
                  </p>
                  <button
                    className="primary-button"
                    onClick={guidedWorkflow === 'series-builder' ? solveGuidedMode : solveParallelMode}
                    type="button"
                  >
                    {guidedWorkflow === 'series-builder'
                      ? 'Solve guided problem'
                      : 'Solve parallel problem'}
                  </button>
                </div>
              </>
            )}
          </section>

          <section className="card results">
            <div className="card__header">
              <div>
                <p className="eyebrow">
                  {guidedWorkflow === 'chapter-goal' ? 'Chapter Goal Output' : 'Guided Output'}
                </p>
                <h2>
                  {guidedWorkflow === 'chapter-goal'
                    ? 'Deterministic formula trail'
                    : 'What the app figured out'}
                </h2>
                {guidedWorkflow === 'symbol-builder' && selectedSymbolPart && (
                  <p>{selectedSymbolPart.label}</p>
                )}
              </div>
            </div>

            {guidedWorkflow === 'chapter-goal' ? (
              <GuidedMathResultPanel goal={selectedMathGoal} result={guidedMathResult} />
            ) : guidedWorkflow === 'symbol-builder' ? (
              <>
                <GuidedSymbolPartOverview
                  parts={symbolParts}
                  selectedPartId={selectedSymbolPartId}
                  onSelect={setSelectedSymbolPartId}
                />

                {symbolTopology === 'parallel' ? (
                  <GuidedParallelResultPanel
                    emptyMessage={`Pick ${selectedSymbolPart?.label ?? 'a part'}, enter the labeled variables from the problem, and run the solve.`}
                    result={
                      selectedSymbolPart?.result?.topology === 'parallel'
                        ? selectedSymbolPart.result.result
                        : null
                    }
                  />
                ) : (
                  <GuidedSeriesResultPanel
                    emptyMessage={`Pick ${selectedSymbolPart?.label ?? 'a part'}, enter the labeled variables from the problem, and run the solve.`}
                    result={
                      selectedSymbolPart?.result?.topology === 'series'
                        ? selectedSymbolPart.result.result
                        : null
                    }
                  />
                )}
              </>
            ) : guidedWorkflow === 'parallel-builder' ? (
              <GuidedParallelResultPanel
                emptyMessage="Select a goal, enter the parallel branches you see, and run the guided solve."
                result={parallelResult}
              />
            ) : (
              <GuidedSeriesResultPanel
                emptyMessage="Select a goal, enter the components you see, and run the guided solve."
                result={guidedResult}
              />
            )}
          </section>
        </main>
      ) : (
        <main className="workspace">
          <section className="card builder">
            <div className="card__header">
              <div>
                <p className="eyebrow">Formula Mode</p>
                <h2>Known values and target</h2>
              </div>
              <button className="ghost-button" onClick={addFormulaRow} type="button">
                Add known
              </button>
            </div>

            <label className="field">
              <span>Target quantity</span>
              <select value={target} onChange={(event) => setTarget(event.target.value as QuantityId)}>
                {quantityGroups.map(([category, items]) => (
                  <optgroup key={category} label={category}>
                    {items.map((definition) => (
                      <option key={definition.id} value={definition.id}>
                        {definition.label} ({definition.symbol})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <small>{targetDefinition.description}</small>
            </label>

            <div className="rows">
              {rows.map((row) => {
                const definition = quantityMap[row.quantityId]

                return (
                  <article className="row-card" key={row.id}>
                    <label className="field">
                      <span>Quantity</span>
                      <select
                        value={row.quantityId}
                        onChange={(event) =>
                          updateFormulaRow(row.id, { quantityId: event.target.value as QuantityId })
                        }
                      >
                        {quantityGroups.map(([category, items]) => (
                          <optgroup key={category} label={category}>
                            {items.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.label} ({item.symbol})
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </label>

                    <label className="field">
                      <span>Value</span>
                      <input
                        value={row.rawValue}
                        onChange={(event) => updateFormulaRow(row.id, { rawValue: event.target.value })}
                        placeholder={definition.placeholder}
                      />
                    </label>

                    <label className="field">
                      <span>Unit</span>
                      <select
                        value={row.unitId}
                        onChange={(event) => updateFormulaRow(row.id, { unitId: event.target.value })}
                      >
                        {definition.units.map((unit) => (
                          <option key={unit.id} value={unit.id}>
                            {unit.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <button
                      className="ghost-button ghost-button--danger"
                      onClick={() => removeFormulaRow(row.id)}
                      type="button"
                    >
                      Remove
                    </button>

                    <p className="row-card__hint">
                      {definition.description} Example: {definition.placeholder}
                    </p>
                  </article>
                )
              })}
            </div>

            <div className="builder__footer">
              <p>
                Formula mode is still here if you already know the exact electrical quantities.
              </p>
              <button className="primary-button" onClick={solveFormulaMode} type="button">
                Solve deterministically
              </button>
            </div>
          </section>

          <section className="card results">
            <div className="card__header">
              <div>
                <p className="eyebrow">Trace</p>
                <h2>Decision trail</h2>
              </div>
            </div>

            {!formulaResult && (
              <div className="empty-state">
                <p>Run a formula-mode solve to see the selected formula path.</p>
              </div>
            )}

            {formulaResult?.status === 'invalid' && (
              <ResultBanner tone="warning" title="Input issue" body={formulaResult.message} />
            )}

            {formulaResult?.status === 'incomplete' && (
              <>
                <ResultBanner tone="warning" title="Need more information" body={formulaResult.message} />
                <div className="list-stack">
                  {formulaResult.requirements.map((requirement) => (
                    <article className="detail-card" key={`${requirement.formulaId}-${requirement.formula}`}>
                      <p className="detail-card__eyebrow">Closest formula</p>
                      <h3>{requirement.formula}</h3>
                      <p>
                        Missing:{' '}
                        {requirement.missing.length > 0
                          ? requirement.missing.map((item) => quantityMap[item].label).join(', ')
                          : 'Formula exists, but the current values fail its domain checks.'}
                      </p>
                    </article>
                  ))}
                </div>
              </>
            )}

            {formulaResult?.status === 'ambiguous' && (
              <>
                <ResultBanner tone="warning" title="Ambiguous solve" body={formulaResult.message} />
                <div className="list-stack">
                  {formulaResult.candidates.map((candidate) => (
                    <article className="detail-card" key={candidate.formulaId}>
                      <p className="detail-card__eyebrow">Candidate path</p>
                      <h3>{candidate.formula}</h3>
                      <p>{candidate.derivedStepCount} step(s) in the derivation path.</p>
                    </article>
                  ))}
                </div>
              </>
            )}

            {formulaResult?.status === 'solved' && (
              <>
                <div className="answer-panel">
                  <p className="detail-card__eyebrow">Final answer</p>
                  <h3>
                    {quantityMap[formulaResult.target].label}:{' '}
                    {formatQuantitySmart(formulaResult.target, formulaResult.value)}
                  </h3>
                  <p>
                    {formulaResult.steps[formulaResult.steps.length - 1]?.formula} selected in{' '}
                    {formulaResult.steps.length} step(s).
                  </p>
                </div>

                <FormulaTrace result={formulaResult} />
              </>
            )}
          </section>
        </main>
      )}
    </div>
  )
}

function ResultBanner({
  tone,
  title,
  body,
}: {
  tone: 'warning'
  title: string
  body: string
}) {
  return (
    <div className={`banner banner--${tone}`}>
      <p className="detail-card__eyebrow">{title}</p>
      <p>{body}</p>
    </div>
  )
}

function ComputedValueCard({ value }: { value: GuidedComputedValue }) {
  if (value.result.status !== 'solved') {
    return null
  }

  return (
    <article className="detail-card">
      <p className="detail-card__eyebrow">{value.label}</p>
      <h3>{formatQuantitySmart(value.quantityId, value.result.value)}</h3>
      {value.secondaryText && <p>{value.secondaryText}</p>}
    </article>
  )
}

function GuidedSeriesResultPanel({
  result,
  emptyMessage,
}: {
  result: GuidedSeriesImpedanceResult | null
  emptyMessage: string
}) {
  if (!result) {
    return (
      <div className="empty-state">
        <p>{emptyMessage}</p>
      </div>
    )
  }

  if (result.status === 'invalid') {
    return <ResultBanner tone="warning" title="Need a clearer input" body={result.message} />
  }

  if (result.output.result.status !== 'solved') {
    return null
  }

  return (
    <>
      <div className="answer-panel">
        <p className="detail-card__eyebrow">{result.output.label}</p>
        <h3>{formatQuantitySmart(result.output.quantityId, result.output.result.value)}</h3>
        {result.output.secondaryText && <p>{result.output.secondaryText}</p>}
      </div>

      <div className="detail-grid">
        <article className="detail-card">
          <p className="detail-card__eyebrow">Totals the app built</p>
          <p>R total = {formatQuantityInBaseUnit('resistance', toScalar(result.totals.resistance))}</p>
          <p>
            XL total ={' '}
            {formatQuantityInBaseUnit('inductiveReactance', toScalar(result.totals.inductiveReactance))}
          </p>
          <p>
            XC total ={' '}
            {formatQuantityInBaseUnit('capacitiveReactance', toScalar(result.totals.capacitiveReactance))}
          </p>
          <p>X net = {formatQuantityInBaseUnit('netReactance', toScalar(result.totals.netReactance))}</p>
        </article>

        <article className="detail-card">
          <p className="detail-card__eyebrow">Impedance diagram</p>
          <ImpedanceDiagram resistance={result.totals.resistance} reactance={result.totals.netReactance} />
        </article>
      </div>

      <div className="detail-grid detail-grid--reference">
        <ComputedValueCard value={result.reference.rectangular} />
        <ComputedValueCard value={result.reference.magnitude} />
        <ComputedValueCard value={result.reference.phase} />
        <ComputedValueCard value={result.reference.powerFactor} />
        {result.reference.sourceCurrent && <ComputedValueCard value={result.reference.sourceCurrent} />}
        {result.reference.resistorVoltage && <ComputedValueCard value={result.reference.resistorVoltage} />}
        {result.reference.inductorVoltage && <ComputedValueCard value={result.reference.inductorVoltage} />}
        {result.reference.capacitorVoltage && <ComputedValueCard value={result.reference.capacitorVoltage} />}
        {result.reference.realPower && <ComputedValueCard value={result.reference.realPower} />}
      </div>

      <FormulaTrace result={result.output.result} />

      <div className="list-stack">
        {result.contributions.map((contribution) => (
          <article className="detail-card" key={contribution.id}>
            <p className="detail-card__eyebrow">{contribution.label}</p>
            <h3>{contribution.entered}</h3>
            <p>{contribution.contributesAs}</p>
            {contribution.formulaUsed && <p>Formula used: {contribution.formulaUsed}</p>}
          </article>
        ))}
      </div>
    </>
  )
}

function GuidedSymbolPartOverview({
  parts,
  selectedPartId,
  onSelect,
}: {
  parts: GuidedSymbolPart[]
  selectedPartId: string
  onSelect: (partId: string) => void
}) {
  if (parts.length < 2 && parts.every((part) => !part.result)) {
    return null
  }

  return (
    <div className="list-stack">
      {parts.map((part) => {
        const summary = summarizeGuidedSymbolPart(part.result)

        return (
          <article
            className={
              part.id === selectedPartId ? 'detail-card detail-card--selected' : 'detail-card'
            }
            key={part.id}
          >
            <div className="detail-card__header">
              <div>
                <p className="detail-card__eyebrow">Problem part</p>
                <h3>{part.label}</h3>
              </div>
              <button className="ghost-button" onClick={() => onSelect(part.id)} type="button">
                {part.id === selectedPartId ? 'Viewing details' : 'View details'}
              </button>
            </div>
            <p className="result-line">{summary.primary}</p>
            {summary.secondary && <p className="part-summary__detail">{summary.secondary}</p>}
          </article>
        )
      })}
    </div>
  )
}

function GuidedMathResultPanel({
  goal,
  result,
}: {
  goal: GuidedMathGoalDefinition
  result: SolveResult | null
}) {
  if (!result) {
    return (
      <div className="empty-state">
        <p>Pick a chapter goal, enter the values the problem gives you, and solve.</p>
      </div>
    )
  }

  if (result.status === 'invalid') {
    return <ResultBanner tone="warning" title="Input issue" body={result.message} />
  }

  if (result.status === 'incomplete') {
    return (
      <>
        <ResultBanner tone="warning" title="Need more information" body={result.message} />
        <div className="list-stack">
          {result.requirements.map((requirement) => (
            <article className="detail-card" key={`${requirement.formulaId}-${requirement.formula}`}>
              <p className="detail-card__eyebrow">Closest formula</p>
              <h3>{requirement.formula}</h3>
              <p>
                Missing:{' '}
                {requirement.missing.length > 0
                  ? requirement.missing.map((item) => quantityMap[item].label).join(', ')
                  : 'Formula exists, but the current values fail its domain checks.'}
              </p>
            </article>
          ))}
        </div>
      </>
    )
  }

  if (result.status === 'ambiguous') {
    return (
      <>
        <ResultBanner tone="warning" title="Ambiguous solve" body={result.message} />
        <div className="list-stack">
          {result.candidates.map((candidate) => (
            <article className="detail-card" key={candidate.formulaId}>
              <p className="detail-card__eyebrow">Candidate path</p>
              <h3>{candidate.formula}</h3>
              <p>{candidate.derivedStepCount} step(s) in the derivation path.</p>
            </article>
          ))}
        </div>
      </>
    )
  }

  return (
    <>
      <div className="answer-panel">
        <p className="detail-card__eyebrow">Chapter {goal.chapter} goal answer</p>
        <h3>
          {goal.label}: {formatQuantitySmart(result.target, result.value)}
        </h3>
        <p>
          {result.steps[result.steps.length - 1]?.formula} selected in {result.steps.length} step(s).
        </p>
      </div>

      <FormulaTrace result={result} />
    </>
  )
}

function GuidedParallelResultPanel({
  result,
  emptyMessage,
}: {
  result: GuidedParallelCircuitResult | null
  emptyMessage: string
}) {
  if (!result) {
    return (
      <div className="empty-state">
        <p>{emptyMessage}</p>
      </div>
    )
  }

  if (result.status === 'invalid') {
    return <ResultBanner tone="warning" title="Need a clearer input" body={result.message} />
  }

  if (result.output.result.status !== 'solved') {
    return null
  }

  return (
    <>
      <div className="answer-panel">
        <p className="detail-card__eyebrow">{result.output.label}</p>
        <h3>{formatQuantitySmart(result.output.quantityId, result.output.result.value)}</h3>
        {result.output.secondaryText && <p>{result.output.secondaryText}</p>}
      </div>

      <div className="detail-grid">
        <article className="detail-card">
          <p className="detail-card__eyebrow">Totals the app built</p>
          <p>G total = {formatQuantityInBaseUnit('conductance', toScalar(result.totals.conductance))}</p>
          <p>BL total = {formatQuantityInBaseUnit('inductiveSusceptance', toScalar(result.totals.inductiveSusceptance))}</p>
          <p>BC total = {formatQuantityInBaseUnit('capacitiveSusceptance', toScalar(result.totals.capacitiveSusceptance))}</p>
          <p>B net = {formatQuantityInBaseUnit('netSusceptance', toScalar(result.totals.netSusceptance))}</p>
        </article>

        <article className="detail-card">
          <p className="detail-card__eyebrow">Admittance diagram</p>
          <AdmittanceDiagram
            conductance={result.totals.conductance}
            susceptance={result.totals.netSusceptance}
          />
        </article>
      </div>

      <div className="detail-grid detail-grid--reference">
        <ComputedValueCard value={result.reference.admittanceRectangular} />
        <ComputedValueCard value={result.reference.admittanceMagnitude} />
        <ComputedValueCard value={result.reference.admittanceAngle} />
        <ComputedValueCard value={result.reference.impedanceRectangular} />
        <ComputedValueCard value={result.reference.impedanceMagnitude} />
        <ComputedValueCard value={result.reference.powerFactor} />
        {result.reference.sourceCurrent && <ComputedValueCard value={result.reference.sourceCurrent} />}
        {result.reference.realPower && <ComputedValueCard value={result.reference.realPower} />}
        {result.reference.resistorCurrent && <ComputedValueCard value={result.reference.resistorCurrent} />}
        {result.reference.inductorCurrent && <ComputedValueCard value={result.reference.inductorCurrent} />}
        {result.reference.capacitorCurrent && <ComputedValueCard value={result.reference.capacitorCurrent} />}
      </div>

      <FormulaTrace result={result.output.result} />

      <div className="list-stack">
        {result.contributions.map((contribution) => (
          <article className="detail-card" key={contribution.id}>
            <p className="detail-card__eyebrow">{contribution.label}</p>
            <h3>{contribution.entered}</h3>
            <p>{contribution.contributesAs}</p>
            {contribution.formulaUsed && <p>Formula used: {contribution.formulaUsed}</p>}
          </article>
        ))}
      </div>
    </>
  )
}

function summarizeGuidedSymbolPart(result: GuidedSymbolProblemResult | null): {
  primary: string
  secondary?: string
} {
  if (!result) {
    return {
      primary: 'Not solved yet',
      secondary: 'Enter the labeled variables for this part and run the solve.',
    }
  }

  const solve = result.result
  if (solve.status === 'invalid') {
    return {
      primary: 'Need clearer input',
      secondary: solve.message,
    }
  }

  if (solve.output.result.status !== 'solved') {
    return {
      primary: solve.output.label,
      secondary: 'The deterministic rules did not produce a final answer for this part.',
    }
  }

  return {
    primary: formatQuantitySmart(solve.output.quantityId, solve.output.result.value),
    secondary: solve.output.secondaryText ?? solve.output.label,
  }
}

function FormulaTrace({ result }: { result: SolveResult }) {
  if (result.status !== 'solved') {
    return null
  }

  return (
    <div className="list-stack">
      {result.steps.map((step) => (
        <article className="detail-card" key={`${step.formulaId}-${step.target}`}>
          <div className="detail-card__header">
            <p className="detail-card__eyebrow">
              Chapter {step.chapter} · {step.familyLabel}
            </p>
            <strong>{step.formula}</strong>
          </div>
          <p>{step.whySelected}</p>
          <div>
            <p className="detail-card__eyebrow">Substituted values</p>
            <ul className="plain-list">
              {step.substitutedValues.map((assignment) => (
                <li key={assignment}>{assignment}</li>
              ))}
            </ul>
          </div>
          <p className="result-line">
            Result: {quantityMap[step.target].symbol} = {formatQuantitySmart(step.target, step.output)}
          </p>
        </article>
      ))}
    </div>
  )
}

function ImpedanceDiagram({
  resistance,
  reactance,
}: {
  resistance: number
  reactance: number
}) {
  const width = 280
  const height = 200
  const originX = 36
  const originY = 152
  const usableX = 190
  const usableY = 96
  const scaleBase = Math.max(Math.abs(resistance), Math.abs(reactance), 1)
  const scale = Math.min(usableX / scaleBase, usableY / scaleBase)
  const x = originX + resistance * scale
  const y = originY - reactance * scale
  const reactanceLabel = reactance >= 0 ? 'X (+)' : 'X (-)'

  return (
    <svg className="diagram" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Impedance diagram">
      <line x1={originX} y1={originY} x2={originX + usableX} y2={originY} />
      <line x1={originX} y1={originY + usableY / 2} x2={originX} y2={originY - usableY} />
      <line x1={originX} y1={originY} x2={x} y2={originY} className="diagram__axis" />
      <line x1={x} y1={originY} x2={x} y2={y} className="diagram__reactance" />
      <line x1={originX} y1={originY} x2={x} y2={y} className="diagram__impedance" />
      <circle cx={originX} cy={originY} r="3" />
      <circle cx={x} cy={y} r="3" />
      <text x={originX + usableX - 12} y={originY - 8}>R</text>
      <text x={originX + 8} y={originY - usableY + 10}>{reactanceLabel}</text>
      <text x={(originX + x) / 2} y={originY - 10}>R</text>
      <text x={x + 8} y={(originY + y) / 2}>{reactance >= 0 ? '+X' : '-X'}</text>
      <text x={(originX + x) / 2 + 10} y={(originY + y) / 2 - 10}>Z</text>
    </svg>
  )
}

function AdmittanceDiagram({
  conductance,
  susceptance,
}: {
  conductance: number
  susceptance: number
}) {
  const width = 280
  const height = 200
  const originX = 36
  const originY = 152
  const usableX = 190
  const usableY = 96
  const scaleBase = Math.max(Math.abs(conductance), Math.abs(susceptance), 1e-3)
  const scale = Math.min(usableX / scaleBase, usableY / scaleBase)
  const x = originX + conductance * scale
  const y = originY - susceptance * scale
  const susceptanceLabel = susceptance >= 0 ? 'B (+)' : 'B (-)'

  return (
    <svg className="diagram" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Admittance diagram">
      <line x1={originX} y1={originY} x2={originX + usableX} y2={originY} />
      <line x1={originX} y1={originY + usableY / 2} x2={originX} y2={originY - usableY} />
      <line x1={originX} y1={originY} x2={x} y2={originY} className="diagram__axis" />
      <line x1={x} y1={originY} x2={x} y2={y} className="diagram__reactance" />
      <line x1={originX} y1={originY} x2={x} y2={y} className="diagram__impedance" />
      <circle cx={originX} cy={originY} r="3" />
      <circle cx={x} cy={y} r="3" />
      <text x={originX + usableX - 12} y={originY - 8}>G</text>
      <text x={originX + 8} y={originY - usableY + 10}>{susceptanceLabel}</text>
      <text x={(originX + x) / 2} y={originY - 10}>G</text>
      <text x={x + 8} y={(originY + y) / 2}>{susceptance >= 0 ? '+B' : '-B'}</text>
      <text x={(originX + x) / 2 + 10} y={(originY + y) / 2 - 10}>Y</text>
    </svg>
  )
}

function makeFormulaRow(
  quantityId: QuantityId,
  rawValue = '',
  unitId = quantityMap[quantityId].defaultUnitId,
): KnownRow {
  return {
    id: crypto.randomUUID(),
    quantityId,
    rawValue,
    unitId,
  }
}

function makeGuidedMathRow(
  quantityId: QuantityId,
  rawValue = '',
  unitId = quantityMap[quantityId].defaultUnitId,
): GuidedMathRow {
  return {
    id: crypto.randomUUID(),
    quantityId,
    rawValue,
    unitId,
  }
}

function makeGuidedSymbolPart(label: string): GuidedSymbolPart {
  return {
    id: crypto.randomUUID(),
    label,
    rows: [makeGuidedSymbolRow('r')],
    result: null,
  }
}

function nextGuidedSymbolPartLabel(index: number): string {
  const nextCode = 65 + index
  return nextCode <= 90 ? `Part ${String.fromCharCode(nextCode)}` : `Part ${index + 1}`
}

function makeGuidedComponent(
  kind: GuidedComponentKind,
  valueMode = defaultValueModeForKind(kind),
  rawValue = '',
  unitId = defaultUnitForGuided(valueMode),
): GuidedComponentInput {
  return {
    id: crypto.randomUUID(),
    kind,
    valueMode,
    rawValue,
    unitId,
  }
}

function defaultValueModeForKind(kind: GuidedComponentKind): GuidedValueMode {
  if (kind === 'resistor') {
    return 'resistance'
  }

  return 'reactance'
}

function defaultUnitForGuided(valueMode: GuidedValueMode): string {
  switch (valueMode) {
    case 'resistance':
    case 'reactance':
      return 'ohm'
    case 'inductance':
      return 'mh'
    case 'capacitance':
      return 'uf'
  }
}

function valueModesForKind(kind: GuidedComponentKind) {
  if (kind === 'resistor') {
    return [{ value: 'resistance', label: 'Resistance (ohms)' }]
  }

  if (kind === 'inductor') {
    return [
      { value: 'reactance', label: 'Reactance already given (ohms)' },
      { value: 'inductance', label: 'Inductance given (H, mH, uH)' },
    ]
  }

  return [
    { value: 'reactance', label: 'Reactance already given (ohms)' },
    { value: 'capacitance', label: 'Capacitance given (F, uF, nF)' },
  ]
}

function unitsForGuided(valueMode: GuidedValueMode) {
  switch (valueMode) {
    case 'resistance':
    case 'reactance':
      return quantityMap.resistance.units
    case 'inductance':
      return quantityMap.inductance.units
    case 'capacitance':
      return quantityMap.capacitance.units
  }
}

function placeholderForGuided(valueMode: GuidedValueMode): string {
  switch (valueMode) {
    case 'resistance':
      return '470'
    case 'reactance':
      return '4'
    case 'inductance':
      return '47'
    case 'capacitance':
      return '0.1'
  }
}

function groupByCategory() {
  const grouped = new Map<string, typeof quantityDefinitions>()

  for (const definition of quantityDefinitions) {
    const current = grouped.get(definition.category) ?? []
    current.push(definition)
    grouped.set(definition.category, current)
  }

  return Array.from(grouped.entries())
}

function toScalar(value: number) {
  return { kind: 'scalar' as const, value }
}

export default App
