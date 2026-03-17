import { quantityMap, type SolveResult } from '../../core'
import {
  guidedMathGoalGroups,
  type GuidedMathGoalDefinition,
} from '../guidedMathGoals'
import type {
  GuidedParallelCircuitResult,
  GuidedParallelGoal,
} from '../guidedParallelCircuit'
import type {
  GuidedComponentInput,
  GuidedComponentKind,
  GuidedSeriesGoal,
  GuidedSeriesImpedanceResult,
  GuidedValueMode,
} from '../guidedSeriesImpedance'
import type {
  GuidedSeriesParallelGoal,
  GuidedSeriesParallelGroupNode,
  GuidedSeriesParallelResult,
  GuidedSeriesParallelTopology,
} from '../guidedSeriesParallelNetwork'
import {
  guidedSymbolDefinitionMap,
  guidedSymbolGroups,
  placeholderForGuidedSymbol,
  unitOptionsForGuidedSymbol,
  type GuidedSymbolRow,
  type GuidedSymbolTopology,
} from '../guidedSymbolProblem'
import { GuidedResultsPanel, SeriesParallelNodeEditor } from './AppPanels'
import {
  chapter17GoalRedirectPrefix,
  chapter17QuestionGoals,
  guidedGoalOptions,
  parallelGoalOptions,
  placeholderForGuided,
  seriesParallelGoalOptions,
  seriesParallelSamples,
  unitsForGuided,
  valueModesForKind,
  type GuidedMathRow,
  type GuidedSeriesParallelNodeUpdates,
  type GuidedSymbolPart,
  type GuidedWorkflow,
} from './appShell'

interface GuidedWorkspaceProps {
  frequencyRawValue: string
  frequencyUnitId: string
  guidedComponents: GuidedComponentInput[]
  guidedGoal: GuidedSeriesGoal
  guidedMathGoalId: string
  guidedMathResult: SolveResult | null
  guidedMathRows: GuidedMathRow[]
  guidedResult: GuidedSeriesImpedanceResult | null
  guidedWorkflow: GuidedWorkflow
  parallelComponents: GuidedComponentInput[]
  parallelGoal: GuidedParallelGoal
  parallelResult: GuidedParallelCircuitResult | null
  selectedMathGoal: GuidedMathGoalDefinition
  selectedSymbolPartId: string
  seriesParallelGoal: GuidedSeriesParallelGoal
  seriesParallelResult: GuidedSeriesParallelResult | null
  seriesParallelRoot: GuidedSeriesParallelGroupNode
  sourceVoltageRawValue: string
  sourceVoltageUnitId: string
  symbolParts: GuidedSymbolPart[]
  symbolTopology: GuidedSymbolTopology
  onAddGuidedComponent: () => void
  onAddParallelComponent: () => void
  onAddSeriesParallelComponent: (parentId: string, kind: GuidedComponentKind) => void
  onAddSeriesParallelGroup: (parentId: string, topology: GuidedSeriesParallelTopology) => void
  onAddSymbolPart: () => void
  onAddSymbolRow: () => void
  onFrequencyRawValueChange: (value: string) => void
  onFrequencyUnitIdChange: (unitId: string) => void
  onGuidedGoalChange: (goal: GuidedSeriesGoal) => void
  onGuidedMathGoalChange: (goalId: string) => void
  onGuidedWorkflowChange: (workflow: GuidedWorkflow) => void
  onOpenChapter17BuilderFromGoal: (goal: GuidedSeriesParallelGoal) => void
  onParallelGoalChange: (goal: GuidedParallelGoal) => void
  onRemoveGuidedComponent: (componentId: string) => void
  onRemoveParallelComponent: (componentId: string) => void
  onRemoveSeriesParallelNode: (nodeId: string) => void
  onRemoveSymbolPart: (partId: string) => void
  onRemoveSymbolRow: (rowId: string) => void
  onResetSeriesParallelBuilder: () => void
  onSelectSymbolPart: (partId: string) => void
  onSeriesParallelGoalChange: (goal: GuidedSeriesParallelGoal) => void
  onSolveGuidedMath: () => void
  onSolveGuidedMode: () => void
  onSolveParallelMode: () => void
  onSolveSeriesParallelMode: () => void
  onSolveSymbolMode: () => void
  onSourceVoltageRawValueChange: (value: string) => void
  onSourceVoltageUnitIdChange: (unitId: string) => void
  onSymbolTopologyChange: (topology: GuidedSymbolTopology) => void
  onUpdateGuidedComponent: (componentId: string, updates: Partial<GuidedComponentInput>) => void
  onUpdateGuidedMathRow: (rowId: string, updates: Partial<GuidedMathRow>) => void
  onUpdateParallelComponent: (componentId: string, updates: Partial<GuidedComponentInput>) => void
  onUpdateSeriesParallelNode: (
    nodeId: string,
    updates: GuidedSeriesParallelNodeUpdates,
  ) => void
  onUpdateSymbolRow: (rowId: string, updates: Partial<GuidedSymbolRow>) => void
  onLoadSeriesParallelSample: (sampleId: string) => void
}

export default function GuidedWorkspace({
  frequencyRawValue,
  frequencyUnitId,
  guidedComponents,
  guidedGoal,
  guidedMathGoalId,
  guidedMathResult,
  guidedMathRows,
  guidedResult,
  guidedWorkflow,
  parallelComponents,
  parallelGoal,
  parallelResult,
  selectedMathGoal,
  selectedSymbolPartId,
  seriesParallelGoal,
  seriesParallelResult,
  seriesParallelRoot,
  sourceVoltageRawValue,
  sourceVoltageUnitId,
  symbolParts,
  symbolTopology,
  onAddGuidedComponent,
  onAddParallelComponent,
  onAddSeriesParallelComponent,
  onAddSeriesParallelGroup,
  onAddSymbolPart,
  onAddSymbolRow,
  onFrequencyRawValueChange,
  onFrequencyUnitIdChange,
  onGuidedGoalChange,
  onGuidedMathGoalChange,
  onGuidedWorkflowChange,
  onOpenChapter17BuilderFromGoal,
  onParallelGoalChange,
  onRemoveGuidedComponent,
  onRemoveParallelComponent,
  onRemoveSeriesParallelNode,
  onRemoveSymbolPart,
  onRemoveSymbolRow,
  onResetSeriesParallelBuilder,
  onSelectSymbolPart,
  onSeriesParallelGoalChange,
  onSolveGuidedMath,
  onSolveGuidedMode,
  onSolveParallelMode,
  onSolveSeriesParallelMode,
  onSolveSymbolMode,
  onSourceVoltageRawValueChange,
  onSourceVoltageUnitIdChange,
  onSymbolTopologyChange,
  onUpdateGuidedComponent,
  onUpdateGuidedMathRow,
  onUpdateParallelComponent,
  onUpdateSeriesParallelNode,
  onUpdateSymbolRow,
  onLoadSeriesParallelSample,
}: GuidedWorkspaceProps) {
  const selectedGoal = guidedGoalOptions.find((goal) => goal.value === guidedGoal) ?? guidedGoalOptions[0]
  const selectedParallelGoal =
    parallelGoalOptions.find((goal) => goal.value === parallelGoal) ?? parallelGoalOptions[0]
  const selectedSeriesParallelGoal =
    seriesParallelGoalOptions.find((goal) => goal.value === seriesParallelGoal) ??
    seriesParallelGoalOptions[0]
  const selectedSymbolGoal = symbolTopology === 'series' ? selectedGoal : selectedParallelGoal
  const selectedSymbolPart =
    symbolParts.find((part) => part.id === selectedSymbolPartId) ?? symbolParts[0]

  const addAction =
    guidedWorkflow === 'symbol-builder'
      ? { label: 'Add part', onClick: onAddSymbolPart }
      : guidedWorkflow === 'series-builder'
        ? { label: 'Add component', onClick: onAddGuidedComponent }
        : guidedWorkflow === 'parallel-builder'
          ? { label: 'Add branch', onClick: onAddParallelComponent }
          : null

  return (
    <main className="workspace">
      <section className="card builder">
        <div className="card__header">
          <div>
            <p className="eyebrow">Guided Problem Mode</p>
            <h2>{builderTitle(guidedWorkflow)}</h2>
          </div>
          {addAction && (
            <button className="ghost-button" onClick={addAction.onClick} type="button">
              {addAction.label}
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
            onClick={() => onGuidedWorkflowChange('symbol-builder')}
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
            onClick={() => onGuidedWorkflowChange('chapter-goal')}
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
            onClick={() => onGuidedWorkflowChange('series-builder')}
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
            onClick={() => onGuidedWorkflowChange('parallel-builder')}
            role="tab"
            type="button"
          >
            Parallel circuit from diagram
          </button>
          <button
            className={
              guidedWorkflow === 'series-parallel-builder'
                ? 'workflow-switch__button is-active'
                : 'workflow-switch__button'
            }
            onClick={() => onGuidedWorkflowChange('series-parallel-builder')}
            role="tab"
            type="button"
          >
            Series-parallel network
          </button>
        </div>

        {renderWorkflowHelp(guidedWorkflow)}

        {guidedWorkflow === 'chapter-goal' ? (
          <ChapterGoalBuilder
            guidedMathGoalId={guidedMathGoalId}
            guidedMathRows={guidedMathRows}
            onGuidedMathGoalChange={onGuidedMathGoalChange}
            onOpenChapter17BuilderFromGoal={onOpenChapter17BuilderFromGoal}
            onSolveGuidedMath={onSolveGuidedMath}
            onUpdateGuidedMathRow={onUpdateGuidedMathRow}
            selectedMathGoal={selectedMathGoal}
          />
        ) : guidedWorkflow === 'symbol-builder' ? (
          <TextbookLabelsBuilder
            guidedGoal={guidedGoal}
            parallelGoal={parallelGoal}
            selectedSymbolGoal={selectedSymbolGoal}
            selectedSymbolPart={selectedSymbolPart}
            selectedSymbolPartId={selectedSymbolPartId}
            symbolParts={symbolParts}
            symbolTopology={symbolTopology}
            onAddSymbolRow={onAddSymbolRow}
            onGuidedGoalChange={onGuidedGoalChange}
            onParallelGoalChange={onParallelGoalChange}
            onRemoveSymbolPart={onRemoveSymbolPart}
            onRemoveSymbolRow={onRemoveSymbolRow}
            onSelectSymbolPart={onSelectSymbolPart}
            onSolveSymbolMode={onSolveSymbolMode}
            onSymbolTopologyChange={onSymbolTopologyChange}
            onUpdateSymbolRow={onUpdateSymbolRow}
          />
        ) : guidedWorkflow === 'series-parallel-builder' ? (
          <SeriesParallelBuilder
            frequencyRawValue={frequencyRawValue}
            frequencyUnitId={frequencyUnitId}
            onAddSeriesParallelComponent={onAddSeriesParallelComponent}
            onAddSeriesParallelGroup={onAddSeriesParallelGroup}
            onFrequencyRawValueChange={onFrequencyRawValueChange}
            onFrequencyUnitIdChange={onFrequencyUnitIdChange}
            onLoadSeriesParallelSample={onLoadSeriesParallelSample}
            onRemoveSeriesParallelNode={onRemoveSeriesParallelNode}
            onResetSeriesParallelBuilder={onResetSeriesParallelBuilder}
            onSeriesParallelGoalChange={onSeriesParallelGoalChange}
            onSolveSeriesParallelMode={onSolveSeriesParallelMode}
            onSourceVoltageRawValueChange={onSourceVoltageRawValueChange}
            onSourceVoltageUnitIdChange={onSourceVoltageUnitIdChange}
            onUpdateSeriesParallelNode={onUpdateSeriesParallelNode}
            selectedSeriesParallelGoal={selectedSeriesParallelGoal}
            seriesParallelGoal={seriesParallelGoal}
            seriesParallelRoot={seriesParallelRoot}
            sourceVoltageRawValue={sourceVoltageRawValue}
            sourceVoltageUnitId={sourceVoltageUnitId}
          />
        ) : (
          <DiagramBuilder
            frequencyRawValue={frequencyRawValue}
            frequencyUnitId={frequencyUnitId}
            guidedComponents={guidedComponents}
            guidedWorkflow={guidedWorkflow}
            parallelComponents={parallelComponents}
            selectedGoal={selectedGoal}
            selectedParallelGoal={selectedParallelGoal}
            sourceVoltageRawValue={sourceVoltageRawValue}
            sourceVoltageUnitId={sourceVoltageUnitId}
            onFrequencyRawValueChange={onFrequencyRawValueChange}
            onFrequencyUnitIdChange={onFrequencyUnitIdChange}
            onGuidedGoalChange={onGuidedGoalChange}
            onParallelGoalChange={onParallelGoalChange}
            onRemoveGuidedComponent={onRemoveGuidedComponent}
            onRemoveParallelComponent={onRemoveParallelComponent}
            onSolveGuidedMode={onSolveGuidedMode}
            onSolveParallelMode={onSolveParallelMode}
            onSourceVoltageRawValueChange={onSourceVoltageRawValueChange}
            onSourceVoltageUnitIdChange={onSourceVoltageUnitIdChange}
            onUpdateGuidedComponent={onUpdateGuidedComponent}
            onUpdateParallelComponent={onUpdateParallelComponent}
          />
        )}
      </section>

      <GuidedResultsPanel
        guidedMathResult={guidedMathResult}
        guidedResult={guidedResult}
        guidedWorkflow={guidedWorkflow}
        onSelectSymbolPart={onSelectSymbolPart}
        parallelResult={parallelResult}
        selectedMathGoal={selectedMathGoal}
        selectedSymbolPartId={selectedSymbolPartId}
        seriesParallelResult={seriesParallelResult}
        symbolParts={symbolParts}
        symbolTopology={symbolTopology}
      />
    </main>
  )
}

function builderTitle(guidedWorkflow: GuidedWorkflow) {
  if (guidedWorkflow === 'chapter-goal') {
    return 'Pick the answer the textbook problem wants'
  }

  if (guidedWorkflow === 'symbol-builder') {
    return 'Choose the exact textbook labels the problem gives you'
  }

  if (guidedWorkflow === 'series-builder') {
    return 'Tell the app what the series-circuit problem is asking for'
  }

  if (guidedWorkflow === 'parallel-builder') {
    return 'Tell the app what the parallel-circuit problem is asking for'
  }

  return 'Build the Chapter 17 network exactly as it is drawn'
}

function renderWorkflowHelp(guidedWorkflow: GuidedWorkflow) {
  if (guidedWorkflow === 'chapter-goal') {
    return (
      <div className="help-card">
        <p className="detail-card__eyebrow">How chapter-guided mode works</p>
        <p>1. Pick the exact kind of answer the textbook problem wants.</p>
        <p>2. Enter only the numbers the problem gives you.</p>
        <p>3. Click solve and let the deterministic rules engine pick the formula path.</p>
      </div>
    )
  }

  if (guidedWorkflow === 'symbol-builder') {
    return (
      <div className="help-card">
        <p className="detail-card__eyebrow">How as-labeled variable mode works</p>
        <p>1. Pick whether the problem is a series or parallel circuit question.</p>
        <p>
          2. Add the exact symbols you see in the book, like R, XL1, XL2, XC, L2, C, f, or E.
        </p>
        <p>3. Enter them in any order. The app combines repeated R, XL, and XC values automatically.</p>
        <p>
          4. Click solve to get the deterministic rectangular and polar results when the goal needs
          them.
        </p>
      </div>
    )
  }

  if (guidedWorkflow === 'series-parallel-builder') {
    return (
      <div className="help-card">
        <p className="detail-card__eyebrow">How Chapter 17 reduction mode works</p>
        <p>1. Make the root match the outermost topology of the network.</p>
        <p>2. Add nested series and parallel groups until the drawing structure matches the book.</p>
        <p>3. Enter reactances directly in ohms, or enter L and C values with frequency.</p>
        <p>4. If the question asks for current or power, also enter the source voltage.</p>
        <p>5. Solve to see the reduction sequence plus voltage and current phasors at every solved node.</p>
      </div>
    )
  }

  return (
    <div className="help-card">
      <p className="detail-card__eyebrow">
        {guidedWorkflow === 'series-builder'
          ? 'How series-diagram mode works'
          : 'How parallel-diagram mode works'}
      </p>
      <p>1. Pick the final answer the question wants.</p>
      <p>
        2. Enter the {guidedWorkflow === 'series-builder' ? 'components' : 'parallel branches'} you
        see in the diagram.
      </p>
      <p>3. If the question gives H or F values, also enter frequency.</p>
      <p>4. If the question asks for current or power, also enter source voltage.</p>
      <p>
        5. If the problem labels values as R, XL1, XC, L2, or C, switch to Textbook labels mode
        above.
      </p>
    </div>
  )
}

function ChapterGoalBuilder({
  guidedMathGoalId,
  guidedMathRows,
  onGuidedMathGoalChange,
  onOpenChapter17BuilderFromGoal,
  onSolveGuidedMath,
  onUpdateGuidedMathRow,
  selectedMathGoal,
}: {
  guidedMathGoalId: string
  guidedMathRows: GuidedMathRow[]
  onGuidedMathGoalChange: (goalId: string) => void
  onOpenChapter17BuilderFromGoal: (goal: GuidedSeriesParallelGoal) => void
  onSolveGuidedMath: () => void
  onUpdateGuidedMathRow: (rowId: string, updates: Partial<GuidedMathRow>) => void
  selectedMathGoal: GuidedMathGoalDefinition
}) {
  return (
    <>
      <label className="field">
        <span>Question goal</span>
        <select
          value={guidedMathGoalId}
          onChange={(event) => {
            const nextValue = event.target.value
            if (nextValue.startsWith(chapter17GoalRedirectPrefix)) {
              const redirect = chapter17QuestionGoals.find((goal) => goal.value === nextValue)
              if (redirect) {
                onOpenChapter17BuilderFromGoal(redirect.goal)
              }
              return
            }

            onGuidedMathGoalChange(nextValue)
          }}
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
          <optgroup label="Chapter 17 - Series-parallel AC reduction">
            {chapter17QuestionGoals.map((goal) => (
              <option key={goal.value} value={goal.value}>
                {goal.label}
              </option>
            ))}
          </optgroup>
        </select>
        <small>
          {selectedMathGoal.description} Chapter 17 entries open the network builder because those
          problems need topology entry.
        </small>
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
                <h3>{definition.symbol} - Chapter {definition.chapter}</h3>
                <p className="row-card__hint">
                  {definition.description} Example: {definition.placeholder}
                </p>
              </div>

              <label className="field">
                <span>Value</span>
                <input
                  value={row.rawValue}
                  onChange={(event) => onUpdateGuidedMathRow(row.id, { rawValue: event.target.value })}
                  placeholder={definition.placeholder}
                />
              </label>

              <label className="field">
                <span>Unit</span>
                <select
                  value={row.unitId}
                  onChange={(event) => onUpdateGuidedMathRow(row.id, { unitId: event.target.value })}
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
          Chapter-guided mode locks the expected inputs to the selected textbook math pattern so the
          user only fills in the numbers and units.
        </p>
        <button className="primary-button" onClick={onSolveGuidedMath} type="button">
          Solve chapter goal
        </button>
      </div>
    </>
  )
}

function TextbookLabelsBuilder({
  guidedGoal,
  parallelGoal,
  selectedSymbolGoal,
  selectedSymbolPart,
  selectedSymbolPartId,
  symbolParts,
  symbolTopology,
  onAddSymbolRow,
  onGuidedGoalChange,
  onParallelGoalChange,
  onRemoveSymbolPart,
  onRemoveSymbolRow,
  onSelectSymbolPart,
  onSolveSymbolMode,
  onSymbolTopologyChange,
  onUpdateSymbolRow,
}: {
  guidedGoal: GuidedSeriesGoal
  parallelGoal: GuidedParallelGoal
  selectedSymbolGoal: (typeof guidedGoalOptions)[number] | (typeof parallelGoalOptions)[number]
  selectedSymbolPart: GuidedSymbolPart | undefined
  selectedSymbolPartId: string
  symbolParts: GuidedSymbolPart[]
  symbolTopology: GuidedSymbolTopology
  onAddSymbolRow: () => void
  onGuidedGoalChange: (goal: GuidedSeriesGoal) => void
  onParallelGoalChange: (goal: GuidedParallelGoal) => void
  onRemoveSymbolPart: (partId: string) => void
  onRemoveSymbolRow: (rowId: string) => void
  onSelectSymbolPart: (partId: string) => void
  onSolveSymbolMode: () => void
  onSymbolTopologyChange: (topology: GuidedSymbolTopology) => void
  onUpdateSymbolRow: (rowId: string, updates: Partial<GuidedSymbolRow>) => void
}) {
  return (
    <>
      <div className="workflow-switch" role="tablist" aria-label="Variable topology">
        <button
          className={
            symbolTopology === 'series'
              ? 'workflow-switch__button is-active'
              : 'workflow-switch__button'
          }
          onClick={() => onSymbolTopologyChange('series')}
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
          onClick={() => onSymbolTopologyChange('parallel')}
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
              ? onGuidedGoalChange(event.target.value as GuidedSeriesGoal)
              : onParallelGoalChange(event.target.value as GuidedParallelGoal)
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
          {symbolTopology === 'series'
            ? 'Series circuit variable input'
            : 'Parallel circuit variable input'}
        </p>
        <p>
          Enter the exact symbols from the problem statement in any order. Use this mode whenever
          the book gives labels like R, XL1, XL2, XC, L2, C, f, or E. The app keeps those labels in
          the trace so you can match them back to the diagram.
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
            onClick={() => onSelectSymbolPart(part.id)}
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
            {selectedSymbolPart.label} stays separate from every other part, so circuits like (a),
            (b), and (c) are solved independently instead of being merged.
          </p>
          {symbolParts.length > 1 && (
            <button
              className="ghost-button ghost-button--danger"
              onClick={() => onRemoveSymbolPart(selectedSymbolPart.id)}
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
                  onChange={(event) => onUpdateSymbolRow(row.id, { symbolId: event.target.value })}
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
                  onChange={(event) => onUpdateSymbolRow(row.id, { rawValue: event.target.value })}
                  placeholder={placeholderForGuidedSymbol(row.symbolId)}
                />
              </label>

              <label className="field">
                <span>Unit</span>
                <select
                  value={row.unitId}
                  onChange={(event) => onUpdateSymbolRow(row.id, { unitId: event.target.value })}
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
                onClick={() => onRemoveSymbolRow(row.id)}
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
          Add symbols to {selectedSymbolPart?.label ?? 'this part'} and then solve. Each part is
          evaluated with the same selected goal, but the inputs stay isolated.
        </p>
        <button className="ghost-button" onClick={onAddSymbolRow} type="button">
          Add symbol to current part
        </button>
        <button className="primary-button" onClick={onSolveSymbolMode} type="button">
          Solve from variables
        </button>
      </div>
    </>
  )
}

function SeriesParallelBuilder({
  frequencyRawValue,
  frequencyUnitId,
  onAddSeriesParallelComponent,
  onAddSeriesParallelGroup,
  onFrequencyRawValueChange,
  onFrequencyUnitIdChange,
  onLoadSeriesParallelSample,
  onRemoveSeriesParallelNode,
  onResetSeriesParallelBuilder,
  onSeriesParallelGoalChange,
  onSolveSeriesParallelMode,
  onSourceVoltageRawValueChange,
  onSourceVoltageUnitIdChange,
  onUpdateSeriesParallelNode,
  selectedSeriesParallelGoal,
  seriesParallelGoal,
  seriesParallelRoot,
  sourceVoltageRawValue,
  sourceVoltageUnitId,
}: {
  frequencyRawValue: string
  frequencyUnitId: string
  onAddSeriesParallelComponent: (parentId: string, kind: GuidedComponentKind) => void
  onAddSeriesParallelGroup: (parentId: string, topology: GuidedSeriesParallelTopology) => void
  onFrequencyRawValueChange: (value: string) => void
  onFrequencyUnitIdChange: (unitId: string) => void
  onLoadSeriesParallelSample: (sampleId: string) => void
  onRemoveSeriesParallelNode: (nodeId: string) => void
  onResetSeriesParallelBuilder: () => void
  onSeriesParallelGoalChange: (goal: GuidedSeriesParallelGoal) => void
  onSolveSeriesParallelMode: () => void
  onSourceVoltageRawValueChange: (value: string) => void
  onSourceVoltageUnitIdChange: (unitId: string) => void
  onUpdateSeriesParallelNode: (
    nodeId: string,
    updates: GuidedSeriesParallelNodeUpdates,
  ) => void
  selectedSeriesParallelGoal: (typeof seriesParallelGoalOptions)[number]
  seriesParallelGoal: GuidedSeriesParallelGoal
  seriesParallelRoot: GuidedSeriesParallelGroupNode
  sourceVoltageRawValue: string
  sourceVoltageUnitId: string
}) {
  return (
    <>
      <label className="field">
        <span>Question goal</span>
        <select
          value={seriesParallelGoal}
          onChange={(event) => onSeriesParallelGoalChange(event.target.value as GuidedSeriesParallelGoal)}
        >
          {seriesParallelGoalOptions.map((goal) => (
            <option key={goal.value} value={goal.value}>
              {goal.label}
            </option>
          ))}
        </select>
        <small>{selectedSeriesParallelGoal.description}</small>
      </label>

      <article className="detail-card detail-card--goal">
        <p className="detail-card__eyebrow">Chapter 17 - Series-parallel AC reduction</p>
        <p>
          This mode reduces nested AC networks one block at a time, preserving the actual series
          and parallel structure from the diagram instead of forcing the problem into a flat
          component list.
        </p>
      </article>

      <FrequencyAndSourceInputs
        frequencyRawValue={frequencyRawValue}
        frequencyUnitId={frequencyUnitId}
        sourceVoltageRawValue={sourceVoltageRawValue}
        sourceVoltageUnitId={sourceVoltageUnitId}
        onFrequencyRawValueChange={onFrequencyRawValueChange}
        onFrequencyUnitIdChange={onFrequencyUnitIdChange}
        onSourceVoltageRawValueChange={onSourceVoltageRawValueChange}
        onSourceVoltageUnitIdChange={onSourceVoltageUnitIdChange}
        sourceVoltagePlaceholder="60"
      />

      <article className="detail-card">
        <div className="detail-card__header">
          <div>
            <p className="detail-card__eyebrow">Quick load</p>
            <h3>Textbook samples for Chapter 17</h3>
          </div>
          <div className="sample-list">
            {seriesParallelSamples.map((sample) => (
              <button
                key={sample.id}
                className="sample-button"
                onClick={() => onLoadSeriesParallelSample(sample.id)}
                type="button"
              >
                {sample.title}
              </button>
            ))}
          </div>
        </div>
        <p>
          Quick loads populate the reduction tree so you can verify the solver against the book
          examples without rebuilding the topology by hand.
        </p>
      </article>

      <SeriesParallelNodeEditor
        node={seriesParallelRoot}
        rootId={seriesParallelRoot.id}
        onAddComponent={onAddSeriesParallelComponent}
        onAddGroup={onAddSeriesParallelGroup}
        onRemoveNode={onRemoveSeriesParallelNode}
        onUpdateNode={onUpdateSeriesParallelNode}
      />

      <div className="builder__footer">
        <p>
          Build the network tree to match the printed diagram, then let the app reduce each series
          and parallel block deterministically.
        </p>
        <div className="builder__actions">
          <button className="ghost-button" onClick={onResetSeriesParallelBuilder} type="button">
            Reset network
          </button>
          <button className="primary-button" onClick={onSolveSeriesParallelMode} type="button">
            Solve Chapter 17 network
          </button>
        </div>
      </div>
    </>
  )
}

function DiagramBuilder({
  frequencyRawValue,
  frequencyUnitId,
  guidedComponents,
  guidedWorkflow,
  parallelComponents,
  selectedGoal,
  selectedParallelGoal,
  sourceVoltageRawValue,
  sourceVoltageUnitId,
  onFrequencyRawValueChange,
  onFrequencyUnitIdChange,
  onGuidedGoalChange,
  onParallelGoalChange,
  onRemoveGuidedComponent,
  onRemoveParallelComponent,
  onSolveGuidedMode,
  onSolveParallelMode,
  onSourceVoltageRawValueChange,
  onSourceVoltageUnitIdChange,
  onUpdateGuidedComponent,
  onUpdateParallelComponent,
}: {
  frequencyRawValue: string
  frequencyUnitId: string
  guidedComponents: GuidedComponentInput[]
  guidedWorkflow: GuidedWorkflow
  parallelComponents: GuidedComponentInput[]
  selectedGoal: (typeof guidedGoalOptions)[number]
  selectedParallelGoal: (typeof parallelGoalOptions)[number]
  sourceVoltageRawValue: string
  sourceVoltageUnitId: string
  onFrequencyRawValueChange: (value: string) => void
  onFrequencyUnitIdChange: (unitId: string) => void
  onGuidedGoalChange: (goal: GuidedSeriesGoal) => void
  onParallelGoalChange: (goal: GuidedParallelGoal) => void
  onRemoveGuidedComponent: (componentId: string) => void
  onRemoveParallelComponent: (componentId: string) => void
  onSolveGuidedMode: () => void
  onSolveParallelMode: () => void
  onSourceVoltageRawValueChange: (value: string) => void
  onSourceVoltageUnitIdChange: (unitId: string) => void
  onUpdateGuidedComponent: (componentId: string, updates: Partial<GuidedComponentInput>) => void
  onUpdateParallelComponent: (componentId: string, updates: Partial<GuidedComponentInput>) => void
}) {
  const isSeriesBuilder = guidedWorkflow === 'series-builder'
  const components = isSeriesBuilder ? guidedComponents : parallelComponents

  return (
    <>
      <label className="field">
        <span>Question goal</span>
        <select
          value={isSeriesBuilder ? selectedGoal.value : selectedParallelGoal.value}
          onChange={(event) =>
            isSeriesBuilder
              ? onGuidedGoalChange(event.target.value as GuidedSeriesGoal)
              : onParallelGoalChange(event.target.value as GuidedParallelGoal)
          }
        >
          {(isSeriesBuilder ? guidedGoalOptions : parallelGoalOptions).map((goal) => (
            <option key={goal.value} value={goal.value}>
              {goal.label}
            </option>
          ))}
        </select>
        <small>{isSeriesBuilder ? selectedGoal.description : selectedParallelGoal.description}</small>
      </label>

      <FrequencyAndSourceInputs
        frequencyRawValue={frequencyRawValue}
        frequencyUnitId={frequencyUnitId}
        sourceVoltageRawValue={sourceVoltageRawValue}
        sourceVoltageUnitId={sourceVoltageUnitId}
        onFrequencyRawValueChange={onFrequencyRawValueChange}
        onFrequencyUnitIdChange={onFrequencyUnitIdChange}
        onSourceVoltageRawValueChange={onSourceVoltageRawValueChange}
        onSourceVoltageUnitIdChange={onSourceVoltageUnitIdChange}
        sourceVoltagePlaceholder={isSeriesBuilder ? '120' : '120'}
      />

      <GuidedComponentRows
        components={components}
        guidedWorkflow={guidedWorkflow}
        onRemoveGuidedComponent={onRemoveGuidedComponent}
        onRemoveParallelComponent={onRemoveParallelComponent}
        onUpdateGuidedComponent={onUpdateGuidedComponent}
        onUpdateParallelComponent={onUpdateParallelComponent}
      />

      <div className="builder__footer">
        <p>
          {isSeriesBuilder
            ? 'The app aggregates the series elements, converts L and C into reactance when needed, and then solves the final target with the deterministic rules engine.'
            : 'The app aggregates the parallel branches, converts them into total conductance and susceptance, and then solves the final target with the deterministic rules engine.'}
        </p>
        <button
          className="primary-button"
          onClick={isSeriesBuilder ? onSolveGuidedMode : onSolveParallelMode}
          type="button"
        >
          {isSeriesBuilder ? 'Solve guided problem' : 'Solve parallel problem'}
        </button>
      </div>
    </>
  )
}

function FrequencyAndSourceInputs({
  frequencyRawValue,
  frequencyUnitId,
  sourceVoltageRawValue,
  sourceVoltageUnitId,
  onFrequencyRawValueChange,
  onFrequencyUnitIdChange,
  onSourceVoltageRawValueChange,
  onSourceVoltageUnitIdChange,
  sourceVoltagePlaceholder,
}: {
  frequencyRawValue: string
  frequencyUnitId: string
  sourceVoltageRawValue: string
  sourceVoltageUnitId: string
  onFrequencyRawValueChange: (value: string) => void
  onFrequencyUnitIdChange: (unitId: string) => void
  onSourceVoltageRawValueChange: (value: string) => void
  onSourceVoltageUnitIdChange: (unitId: string) => void
  sourceVoltagePlaceholder: string
}) {
  return (
    <div className="detail-grid detail-grid--inputs">
      <article className="detail-card">
        <p className="detail-card__eyebrow">Frequency if needed</p>
        <div className="frequency-row">
          <label className="field">
            <span>Value</span>
            <input
              value={frequencyRawValue}
              onChange={(event) => onFrequencyRawValueChange(event.target.value)}
              placeholder="1"
            />
          </label>

          <label className="field">
            <span>Unit</span>
            <select value={frequencyUnitId} onChange={(event) => onFrequencyUnitIdChange(event.target.value)}>
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
              onChange={(event) => onSourceVoltageRawValueChange(event.target.value)}
              placeholder={sourceVoltagePlaceholder}
            />
          </label>

          <label className="field">
            <span>Unit</span>
            <select
              value={sourceVoltageUnitId}
              onChange={(event) => onSourceVoltageUnitIdChange(event.target.value)}
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
  )
}

function GuidedComponentRows({
  components,
  guidedWorkflow,
  onRemoveGuidedComponent,
  onRemoveParallelComponent,
  onUpdateGuidedComponent,
  onUpdateParallelComponent,
}: {
  components: GuidedComponentInput[]
  guidedWorkflow: GuidedWorkflow
  onRemoveGuidedComponent: (componentId: string) => void
  onRemoveParallelComponent: (componentId: string) => void
  onUpdateGuidedComponent: (componentId: string, updates: Partial<GuidedComponentInput>) => void
  onUpdateParallelComponent: (componentId: string, updates: Partial<GuidedComponentInput>) => void
}) {
  const isSeriesBuilder = guidedWorkflow === 'series-builder'

  return (
    <div className="rows">
      {components.map((component) => (
        <article className="row-card row-card--guided" key={component.id}>
          <label className="field">
            <span>Component</span>
            <select
              value={component.kind}
              onChange={(event) =>
                isSeriesBuilder
                  ? onUpdateGuidedComponent(component.id, {
                      kind: event.target.value as GuidedComponentKind,
                    })
                  : onUpdateParallelComponent(component.id, {
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
                isSeriesBuilder
                  ? onUpdateGuidedComponent(component.id, {
                      valueMode: event.target.value as GuidedValueMode,
                    })
                  : onUpdateParallelComponent(component.id, {
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
                isSeriesBuilder
                  ? onUpdateGuidedComponent(component.id, { rawValue: event.target.value })
                  : onUpdateParallelComponent(component.id, { rawValue: event.target.value })
              }
              placeholder={placeholderForGuided(component.valueMode)}
            />
          </label>

          <label className="field">
            <span>Unit</span>
            <select
              value={component.unitId}
              onChange={(event) =>
                isSeriesBuilder
                  ? onUpdateGuidedComponent(component.id, { unitId: event.target.value })
                  : onUpdateParallelComponent(component.id, { unitId: event.target.value })
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
              isSeriesBuilder
                ? onRemoveGuidedComponent(component.id)
                : onRemoveParallelComponent(component.id)
            }
            type="button"
          >
            Remove
          </button>
        </article>
      ))}
    </div>
  )
}
