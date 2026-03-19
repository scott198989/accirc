import { quantityMap, type QuantityId } from '../../core'
import { type GuidedMathGoalDefinition, type GuidedMathResult } from '../guidedMathGoals'
import { type GuidedParallelCircuitResult, type GuidedParallelGoal } from '../guidedParallelCircuit'
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
  type GuidedSymbolProblemResult,
  type GuidedSymbolRow,
  type GuidedSymbolTopology,
} from '../guidedSymbolProblem'
import { GuidedResultsPanel, SeriesParallelNodeEditor } from './AppPanels'
import {
  guidedGoalOptions,
  guidedMathQuickPicks,
  guidedMathGoalGroups,
  parallelGoalOptions,
  guidedWorkflowOptions,
  listSeriesParallelTargets,
  placeholderForGuided,
  quantityGroups,
  seriesParallelGoalOptions,
  seriesParallelSamples,
  unitsForGuided,
  valueModesForKind,
  type GuidedMathRow,
  type GuidedSeriesParallelNodeUpdates,
  type GuidedWorkflow,
} from './appShell'

interface GuidedWorkspaceProps {
  frequencyRawValue: string
  frequencyUnitId: string
  guidedComponents: GuidedComponentInput[]
  guidedGoal: GuidedSeriesGoal
  guidedMathGoalId: string
  guidedMathResult: GuidedMathResult | null
  guidedMathRows: GuidedMathRow[]
  parallelGoal: GuidedParallelGoal
  parallelResult: GuidedParallelCircuitResult | null
  guidedResult: GuidedSeriesImpedanceResult | null
  guidedWorkflow: GuidedWorkflow
  selectedMathGoal: GuidedMathGoalDefinition
  seriesParallelGoal: GuidedSeriesParallelGoal
  seriesParallelResult: GuidedSeriesParallelResult | null
  seriesParallelRoot: GuidedSeriesParallelGroupNode
  seriesParallelTargetNodeId: string
  sourceCurrentPhasorRawValue: string
  sourceCurrentPhasorUnitId: string
  sourceVoltageRawValue: string
  sourceVoltageUnitId: string
  onAddGuidedMathRow: () => void
  onAddGuidedComponent: () => void
  onAddGuidedSymbolRow: () => void
  onAddSeriesParallelComponent: (parentId: string, kind: GuidedComponentKind) => void
  onAddSeriesParallelGroup: (parentId: string, topology: GuidedSeriesParallelTopology) => void
  onFrequencyRawValueChange: (value: string) => void
  onFrequencyUnitIdChange: (unitId: string) => void
  onGuidedGoalChange: (goal: GuidedSeriesGoal) => void
  onGuidedMathGoalChange: (goalId: string) => void
  onGuidedWorkflowChange: (workflow: GuidedWorkflow) => void
  onParallelGoalChange: (goal: GuidedParallelGoal) => void
  onRemoveGuidedMathRow: (rowId: string) => void
  onRemoveGuidedComponent: (componentId: string) => void
  onRemoveGuidedSymbolRow: (rowId: string) => void
  onRemoveSeriesParallelNode: (nodeId: string) => void
  onResetSeriesParallelBuilder: () => void
  onSeriesParallelGoalChange: (goal: GuidedSeriesParallelGoal) => void
  onSeriesParallelTargetNodeIdChange: (nodeId: string) => void
  onSolveGuidedMath: () => void
  onSolveGuidedMode: () => void
  onSolveParallelMode: () => void
  onSolveSymbolMode: () => void
  onSolveSeriesParallelMode: () => void
  onSourceCurrentPhasorRawValueChange: (value: string) => void
  onSourceCurrentPhasorUnitIdChange: (unitId: string) => void
  onSourceVoltageRawValueChange: (value: string) => void
  onSourceVoltageUnitIdChange: (unitId: string) => void
  onUpdateGuidedComponent: (componentId: string, updates: Partial<GuidedComponentInput>) => void
  onUpdateGuidedMathRow: (rowId: string, updates: Partial<GuidedMathRow>) => void
  onUpdateGuidedSymbolRow: (rowId: string, updates: Partial<GuidedSymbolRow>) => void
  onUpdateSeriesParallelNode: (
    nodeId: string,
    updates: GuidedSeriesParallelNodeUpdates,
  ) => void
  onLoadSeriesParallelSample: (sampleId: string) => void
  symbolResult: GuidedSymbolProblemResult | null
  symbolRows: GuidedSymbolRow[]
  symbolTopology: GuidedSymbolTopology
  onSymbolTopologyChange: (topology: GuidedSymbolTopology) => void
}

export default function GuidedWorkspace({
  frequencyRawValue,
  frequencyUnitId,
  guidedComponents,
  guidedGoal,
  guidedMathGoalId,
  guidedMathResult,
  guidedMathRows,
  parallelGoal,
  parallelResult,
  guidedResult,
  guidedWorkflow,
  selectedMathGoal,
  seriesParallelGoal,
  seriesParallelResult,
  seriesParallelRoot,
  seriesParallelTargetNodeId,
  sourceCurrentPhasorRawValue,
  sourceCurrentPhasorUnitId,
  sourceVoltageRawValue,
  sourceVoltageUnitId,
  onAddGuidedMathRow,
  onAddGuidedComponent,
  onAddGuidedSymbolRow,
  onAddSeriesParallelComponent,
  onAddSeriesParallelGroup,
  onFrequencyRawValueChange,
  onFrequencyUnitIdChange,
  onGuidedGoalChange,
  onGuidedMathGoalChange,
  onGuidedWorkflowChange,
  onParallelGoalChange,
  onRemoveGuidedMathRow,
  onRemoveGuidedComponent,
  onRemoveGuidedSymbolRow,
  onRemoveSeriesParallelNode,
  onResetSeriesParallelBuilder,
  onSeriesParallelGoalChange,
  onSeriesParallelTargetNodeIdChange,
  onSolveGuidedMath,
  onSolveGuidedMode,
  onSolveParallelMode,
  onSolveSymbolMode,
  onSolveSeriesParallelMode,
  onSourceCurrentPhasorRawValueChange,
  onSourceCurrentPhasorUnitIdChange,
  onSourceVoltageRawValueChange,
  onSourceVoltageUnitIdChange,
  onUpdateGuidedComponent,
  onUpdateGuidedMathRow,
  onUpdateGuidedSymbolRow,
  onUpdateSeriesParallelNode,
  onLoadSeriesParallelSample,
  symbolResult,
  symbolRows,
  symbolTopology,
  onSymbolTopologyChange,
}: GuidedWorkspaceProps) {
  const selectedGoal = guidedGoalOptions.find((goal) => goal.value === guidedGoal) ?? guidedGoalOptions[0]
  const selectedParallelGoal =
    parallelGoalOptions.find((goal) => goal.value === parallelGoal) ?? parallelGoalOptions[0]
  const selectedSeriesParallelGoal =
    seriesParallelGoalOptions.find((goal) => goal.value === seriesParallelGoal) ??
    seriesParallelGoalOptions[0]

  const addAction =
    guidedWorkflow === 'chapter-goal'
      ? { label: 'Add known', onClick: onAddGuidedMathRow }
      : guidedWorkflow === 'series-builder' || guidedWorkflow === 'parallel-builder'
        ? { label: 'Add component known', onClick: onAddGuidedComponent }
        : guidedWorkflow === 'symbol-builder'
          ? { label: 'Add symbol known', onClick: onAddGuidedSymbolRow }
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
          {guidedWorkflowOptions.map((option) => (
            <button
              key={option.value}
              className={
                guidedWorkflow === option.value
                  ? 'workflow-switch__button is-active'
                  : 'workflow-switch__button'
              }
              onClick={() => onGuidedWorkflowChange(option.value)}
              role="tab"
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>

        {renderWorkflowHelp(guidedWorkflow)}

        {guidedWorkflow === 'chapter-goal' ? (
          <ChapterGoalBuilder
            guidedMathGoalId={guidedMathGoalId}
            guidedMathRows={guidedMathRows}
            onGuidedMathGoalChange={onGuidedMathGoalChange}
            onRemoveGuidedMathRow={onRemoveGuidedMathRow}
            onSolveGuidedMath={onSolveGuidedMath}
            onUpdateGuidedMathRow={onUpdateGuidedMathRow}
            selectedMathGoal={selectedMathGoal}
          />
        ) : guidedWorkflow === 'parallel-builder' ? (
          <ParallelBuilder
            frequencyRawValue={frequencyRawValue}
            frequencyUnitId={frequencyUnitId}
            guidedComponents={guidedComponents}
            parallelGoal={parallelGoal}
            selectedParallelGoal={selectedParallelGoal}
            sourceCurrentPhasorRawValue={sourceCurrentPhasorRawValue}
            sourceCurrentPhasorUnitId={sourceCurrentPhasorUnitId}
            sourceVoltageRawValue={sourceVoltageRawValue}
            sourceVoltageUnitId={sourceVoltageUnitId}
            onFrequencyRawValueChange={onFrequencyRawValueChange}
            onFrequencyUnitIdChange={onFrequencyUnitIdChange}
            onParallelGoalChange={onParallelGoalChange}
            onRemoveGuidedComponent={onRemoveGuidedComponent}
            onSolveParallelMode={onSolveParallelMode}
            onSourceCurrentPhasorRawValueChange={onSourceCurrentPhasorRawValueChange}
            onSourceCurrentPhasorUnitIdChange={onSourceCurrentPhasorUnitIdChange}
            onSourceVoltageRawValueChange={onSourceVoltageRawValueChange}
            onSourceVoltageUnitIdChange={onSourceVoltageUnitIdChange}
            onUpdateGuidedComponent={onUpdateGuidedComponent}
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
            onSeriesParallelTargetNodeIdChange={onSeriesParallelTargetNodeIdChange}
            onSolveSeriesParallelMode={onSolveSeriesParallelMode}
            onSourceVoltageRawValueChange={onSourceVoltageRawValueChange}
            onSourceVoltageUnitIdChange={onSourceVoltageUnitIdChange}
            onUpdateSeriesParallelNode={onUpdateSeriesParallelNode}
            selectedSeriesParallelGoal={selectedSeriesParallelGoal}
            seriesParallelGoal={seriesParallelGoal}
            seriesParallelRoot={seriesParallelRoot}
            seriesParallelTargetNodeId={seriesParallelTargetNodeId}
            sourceVoltageRawValue={sourceVoltageRawValue}
            sourceVoltageUnitId={sourceVoltageUnitId}
          />
        ) : guidedWorkflow === 'symbol-builder' ? (
          <SymbolBuilder
            guidedGoal={guidedGoal}
            onGuidedGoalChange={onGuidedGoalChange}
            onParallelGoalChange={onParallelGoalChange}
            onRemoveGuidedSymbolRow={onRemoveGuidedSymbolRow}
            onSolveSymbolMode={onSolveSymbolMode}
            onSymbolTopologyChange={onSymbolTopologyChange}
            onUpdateGuidedSymbolRow={onUpdateGuidedSymbolRow}
            parallelGoal={parallelGoal}
            symbolRows={symbolRows}
            symbolTopology={symbolTopology}
          />
        ) : (
          <DiagramBuilder
            frequencyRawValue={frequencyRawValue}
            frequencyUnitId={frequencyUnitId}
            guidedComponents={guidedComponents}
            selectedGoal={selectedGoal}
            sourceVoltageRawValue={sourceVoltageRawValue}
            sourceVoltageUnitId={sourceVoltageUnitId}
            onFrequencyRawValueChange={onFrequencyRawValueChange}
            onFrequencyUnitIdChange={onFrequencyUnitIdChange}
            onGuidedGoalChange={onGuidedGoalChange}
            onRemoveGuidedComponent={onRemoveGuidedComponent}
            onSolveGuidedMode={onSolveGuidedMode}
            onSourceVoltageRawValueChange={onSourceVoltageRawValueChange}
            onSourceVoltageUnitIdChange={onSourceVoltageUnitIdChange}
            onUpdateGuidedComponent={onUpdateGuidedComponent}
          />
        )}
      </section>

      <GuidedResultsPanel
        guidedMathResult={guidedMathResult}
        parallelResult={parallelResult}
        guidedResult={guidedResult}
        guidedWorkflow={guidedWorkflow}
        selectedMathGoal={selectedMathGoal}
        seriesParallelResult={seriesParallelResult}
        symbolResult={symbolResult}
      />
    </main>
  )
}

function builderTitle(guidedWorkflow: GuidedWorkflow) {
  if (guidedWorkflow === 'chapter-goal') {
    return 'Match the question wording'
  }

  if (guidedWorkflow === 'series-builder') {
    return 'Enter the values from the series diagram'
  }

  if (guidedWorkflow === 'parallel-builder') {
    return 'Enter the values from the parallel diagram'
  }

  if (guidedWorkflow === 'symbol-builder') {
    return 'Type the textbook labels exactly as they appear'
  }

  return 'Build the mixed network exactly as it is drawn'
}

function renderWorkflowHelp(guidedWorkflow: GuidedWorkflow) {
  if (guidedWorkflow === 'chapter-goal') {
    return (
      <div className="help-card">
        <p className="detail-card__eyebrow">How wording-match mode works</p>
        <p>1. Ignore the formula name and match the words the question uses.</p>
        <p>2. Look for what the problem wants and what givens it shows, such as XL and f or E and I.</p>
        <p>3. The needed inputs load automatically, so you only type the givens and solve.</p>
      </div>
    )
  }

  if (guidedWorkflow === 'series-builder') {
    return (
      <div className="help-card">
        <p className="detail-card__eyebrow">How the series builder works</p>
        <p>1. Pick the exact quantity the quiz asks for.</p>
        <p>2. Add each component known in the order the diagram shows it.</p>
        <p>3. Enter reactance directly in ohms, or enter L or C with frequency.</p>
        <p>4. Add the source voltage only when the selected goal needs it.</p>
      </div>
    )
  }

  if (guidedWorkflow === 'parallel-builder') {
    return (
      <div className="help-card">
        <p className="detail-card__eyebrow">How the parallel builder works</p>
        <p>1. Add the resistor, inductor, and capacitor branches exactly as the Chapter 16 diagram shows them.</p>
        <p>2. Enter reactance directly in ohms, or enter L and C with the shared frequency.</p>
        <p>3. Enter either the source voltage magnitude or the source current phasor when the problem asks for source-dependent values.</p>
        <p>4. Solve to see the reduced Y and Z values plus branch-current phasors.</p>
      </div>
    )
  }

  if (guidedWorkflow === 'symbol-builder') {
    return (
      <div className="help-card">
        <p className="detail-card__eyebrow">How textbook-label mode works</p>
        <p>1. Pick whether the printed problem is a series or parallel circuit.</p>
        <p>2. Add only the labels you see in the screenshot or homework, such as R, XL, XC, L, C, f, E, V, or Is.</p>
        <p>3. Choose the answer type the question asks for, then solve without rebuilding the full diagram by hand.</p>
      </div>
    )
  }

  return (
    <div className="help-card">
      <p className="detail-card__eyebrow">How the mixed-network builder works</p>
      <p>1. Recreate the nested series and parallel blocks from the quiz diagram.</p>
      <p>2. Use the network editor buttons to add each component known and any nested branch group the diagram shows.</p>
      <p>3. Enter frequency when any inductor is given in henrys or any capacitor is given in farads.</p>
      <p>4. Add the source voltage only when the selected goal needs it.</p>
      <p>5. Solve to reduce the full network into one total impedance.</p>
    </div>
  )
}

function ChapterGoalBuilder({
  guidedMathGoalId,
  guidedMathRows,
  onGuidedMathGoalChange,
  onRemoveGuidedMathRow,
  onSolveGuidedMath,
  onUpdateGuidedMathRow,
  selectedMathGoal,
}: {
  guidedMathGoalId: string
  guidedMathRows: GuidedMathRow[]
  onGuidedMathGoalChange: (goalId: string) => void
  onRemoveGuidedMathRow: (rowId: string) => void
  onSolveGuidedMath: () => void
  onUpdateGuidedMathRow: (rowId: string, updates: Partial<GuidedMathRow>) => void
  selectedMathGoal: GuidedMathGoalDefinition
}) {
  return (
    <>
      <label className="field">
        <span>Best match for the question</span>
        <select value={guidedMathGoalId} onChange={(event) => onGuidedMathGoalChange(event.target.value)}>
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

      <article className="detail-card quick-picks-card">
        <p className="detail-card__eyebrow">If the problem says...</p>
        <div className="quick-picks">
          {guidedMathQuickPicks.map((goal) => (
            <button
              key={goal.id}
              className={
                goal.id === guidedMathGoalId
                  ? 'quick-pick-button quick-pick-button--active'
                  : 'quick-pick-button'
              }
              onClick={() => onGuidedMathGoalChange(goal.id)}
              type="button"
            >
              {goal.questionCue ?? goal.label}
            </button>
          ))}
        </div>
        <p className="row-card__hint">
          Start with the button that sounds closest to the wording on the page. You can still use
          the full dropdown below it any time.
        </p>
      </article>

      <article className="detail-card detail-card--goal">
        <p className="detail-card__eyebrow">Use this when the question says something like</p>
        <h3>{selectedMathGoal.questionCue ?? selectedMathGoal.label}</h3>
        <p>{selectedMathGoal.description}</p>
        <p>
          <strong>Look for these givens:</strong> {goalInputSummary(selectedMathGoal)}
        </p>
        <p>
          <strong>This goal solves for:</strong> {goalOutputSummary(selectedMathGoal)}
        </p>
        {selectedMathGoal.formulaSummary && selectedMathGoal.formulaSummary.length > 0 && (
          <div className="formula-summary">
            <p className="detail-card__eyebrow">Behind-the-scenes formula path</p>
            <ul className="formula-summary__list">
              {selectedMathGoal.formulaSummary.map((formula) => (
                <li key={`${selectedMathGoal.id}-${formula}`}>{formula}</li>
              ))}
            </ul>
          </div>
        )}
        {selectedMathGoal.note && <p>{selectedMathGoal.note}</p>}
      </article>

      <div className="rows">
        {guidedMathRows.map((row) => {
          const definition = quantityMap[row.quantityId]

          return (
            <article className="row-card row-card--symbol" key={row.id}>
              {row.isRequired ? (
                <div>
                  <p className="detail-card__eyebrow">Required known</p>
                  <h3>{definition.symbol}</h3>
                  <p className="row-card__hint">
                    {definition.label}. {definition.description} Example: {definition.placeholder}
                  </p>
                </div>
              ) : (
                <label className="field">
                  <span>Known quantity</span>
                  <select
                    value={row.quantityId}
                    onChange={(event) =>
                      onUpdateGuidedMathRow(row.id, { quantityId: event.target.value as QuantityId })
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
              )}

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

              {row.isRequired ? null : (
                <>
                  <button
                    className="ghost-button ghost-button--danger"
                    onClick={() => onRemoveGuidedMathRow(row.id)}
                    type="button"
                  >
                    Remove
                  </button>

                  <p className="row-card__hint">
                    Optional extra known. {definition.description} Example: {definition.placeholder}
                  </p>
                </>
              )}
            </article>
          )
        })}
      </div>

      <div className="builder__footer">
        <p>
          Quiz-goal mode preloads the required knowns for the selected pattern, and any extra known
          rows you add are optional helpers for similar quiz variations.
        </p>
        <button className="primary-button" onClick={onSolveGuidedMath} type="button">
          Solve quiz goal
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
  onSeriesParallelTargetNodeIdChange,
  onSolveSeriesParallelMode,
  onSourceVoltageRawValueChange,
  onSourceVoltageUnitIdChange,
  onUpdateSeriesParallelNode,
  selectedSeriesParallelGoal,
  seriesParallelGoal,
  seriesParallelRoot,
  seriesParallelTargetNodeId,
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
  onSeriesParallelTargetNodeIdChange: (nodeId: string) => void
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
  seriesParallelTargetNodeId: string
  sourceVoltageRawValue: string
  sourceVoltageUnitId: string
}) {
  const targetOptions = listSeriesParallelTargets(seriesParallelRoot)
  const needsTarget = needsSeriesParallelTarget(seriesParallelGoal)

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

      {needsTarget && (
        <label className="field">
          <span>Branch or reduced block target</span>
          <select
            value={seriesParallelTargetNodeId}
            onChange={(event) => onSeriesParallelTargetNodeIdChange(event.target.value)}
          >
            <option value="">Pick a target</option>
            {targetOptions.map((target) => (
              <option key={target.id} value={target.id}>
                {target.label} ({target.kind})
              </option>
            ))}
          </select>
          <small>
            Select the exact branch or reduced subnetwork the homework is asking about.
          </small>
        </label>
      )}

      <article className="detail-card detail-card--goal">
        <p className="detail-card__eyebrow">Mixed-network reduction</p>
        <p>
          This mode reduces nested AC networks one block at a time while preserving the actual
          series and parallel structure from the quiz diagram.
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
            <h3>Quiz-ready mixed-network samples</h3>
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
          Quick loads populate the reduction tree so you can verify the solver against the quiz
          diagrams without rebuilding the topology by hand.
        </p>
      </article>

      <article className="detail-card">
        <p className="detail-card__eyebrow">Known network values</p>
        <p>
          Add resistor, inductor, capacitor, series-group, and parallel-group knowns directly in
          the tree editor below until the structure matches the printed network.
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
            Solve mixed network
          </button>
        </div>
      </div>
    </>
  )
}

function ParallelBuilder({
  frequencyRawValue,
  frequencyUnitId,
  guidedComponents,
  parallelGoal,
  selectedParallelGoal,
  sourceCurrentPhasorRawValue,
  sourceCurrentPhasorUnitId,
  sourceVoltageRawValue,
  sourceVoltageUnitId,
  onFrequencyRawValueChange,
  onFrequencyUnitIdChange,
  onParallelGoalChange,
  onRemoveGuidedComponent,
  onSolveParallelMode,
  onSourceCurrentPhasorRawValueChange,
  onSourceCurrentPhasorUnitIdChange,
  onSourceVoltageRawValueChange,
  onSourceVoltageUnitIdChange,
  onUpdateGuidedComponent,
}: {
  frequencyRawValue: string
  frequencyUnitId: string
  guidedComponents: GuidedComponentInput[]
  parallelGoal: GuidedParallelGoal
  selectedParallelGoal: (typeof parallelGoalOptions)[number]
  sourceCurrentPhasorRawValue: string
  sourceCurrentPhasorUnitId: string
  sourceVoltageRawValue: string
  sourceVoltageUnitId: string
  onFrequencyRawValueChange: (value: string) => void
  onFrequencyUnitIdChange: (unitId: string) => void
  onParallelGoalChange: (goal: GuidedParallelGoal) => void
  onRemoveGuidedComponent: (componentId: string) => void
  onSolveParallelMode: () => void
  onSourceCurrentPhasorRawValueChange: (value: string) => void
  onSourceCurrentPhasorUnitIdChange: (unitId: string) => void
  onSourceVoltageRawValueChange: (value: string) => void
  onSourceVoltageUnitIdChange: (unitId: string) => void
  onUpdateGuidedComponent: (componentId: string, updates: Partial<GuidedComponentInput>) => void
}) {
  return (
    <>
      <label className="field">
        <span>Question goal</span>
        <select
          value={parallelGoal}
          onChange={(event) => onParallelGoalChange(event.target.value as GuidedParallelGoal)}
        >
          {parallelGoalOptions.map((goal) => (
            <option key={goal.value} value={goal.value}>
              {goal.label}
            </option>
          ))}
        </select>
        <small>{selectedParallelGoal.description}</small>
      </label>

      <article className="detail-card detail-card--goal">
        <p className="detail-card__eyebrow">Parallel AC reduction</p>
        <p>
          This mode is built for the Chapter 16 screenshot and homework style: enter the parallel
          branches exactly as drawn, then let the app reduce the total admittance, total
          impedance, and branch-current phasors.
        </p>
      </article>

      <FrequencyAndSourceInputs
        frequencyRawValue={frequencyRawValue}
        frequencyUnitId={frequencyUnitId}
        sourceCurrentPhasorPlaceholder="1@80deg"
        sourceCurrentPhasorRawValue={sourceCurrentPhasorRawValue}
        sourceCurrentPhasorUnitId={sourceCurrentPhasorUnitId}
        sourceVoltageRawValue={sourceVoltageRawValue}
        sourceVoltageUnitId={sourceVoltageUnitId}
        onFrequencyRawValueChange={onFrequencyRawValueChange}
        onFrequencyUnitIdChange={onFrequencyUnitIdChange}
        onSourceCurrentPhasorRawValueChange={onSourceCurrentPhasorRawValueChange}
        onSourceCurrentPhasorUnitIdChange={onSourceCurrentPhasorUnitIdChange}
        onSourceVoltageRawValueChange={onSourceVoltageRawValueChange}
        onSourceVoltageUnitIdChange={onSourceVoltageUnitIdChange}
        sourceVoltagePlaceholder="120"
      />

      <GuidedComponentRows
        components={guidedComponents}
        onRemoveGuidedComponent={onRemoveGuidedComponent}
        onUpdateGuidedComponent={onUpdateGuidedComponent}
      />

      <div className="builder__footer">
        <p>
          Enter either the source voltage magnitude or the source current phasor when the problem
          asks for branch-current or power outputs. If both are entered, the app checks that they
          agree with the reduced admittance instead of guessing.
        </p>
        <button className="primary-button" onClick={onSolveParallelMode} type="button">
          Solve parallel circuit
        </button>
      </div>
    </>
  )
}

function DiagramBuilder({
  frequencyRawValue,
  frequencyUnitId,
  guidedComponents,
  selectedGoal,
  sourceVoltageRawValue,
  sourceVoltageUnitId,
  onFrequencyRawValueChange,
  onFrequencyUnitIdChange,
  onGuidedGoalChange,
  onRemoveGuidedComponent,
  onSolveGuidedMode,
  onSourceVoltageRawValueChange,
  onSourceVoltageUnitIdChange,
  onUpdateGuidedComponent,
}: {
  frequencyRawValue: string
  frequencyUnitId: string
  guidedComponents: GuidedComponentInput[]
  selectedGoal: (typeof guidedGoalOptions)[number]
  sourceVoltageRawValue: string
  sourceVoltageUnitId: string
  onFrequencyRawValueChange: (value: string) => void
  onFrequencyUnitIdChange: (unitId: string) => void
  onGuidedGoalChange: (goal: GuidedSeriesGoal) => void
  onRemoveGuidedComponent: (componentId: string) => void
  onSolveGuidedMode: () => void
  onSourceVoltageRawValueChange: (value: string) => void
  onSourceVoltageUnitIdChange: (unitId: string) => void
  onUpdateGuidedComponent: (componentId: string, updates: Partial<GuidedComponentInput>) => void
}) {
  return (
    <>
      <label className="field">
        <span>Question goal</span>
        <select
          value={selectedGoal.value}
          onChange={(event) => onGuidedGoalChange(event.target.value as GuidedSeriesGoal)}
        >
          {guidedGoalOptions.map((goal) => (
            <option key={goal.value} value={goal.value}>
              {goal.label}
            </option>
          ))}
        </select>
        <small>{selectedGoal.description}</small>
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
        sourceVoltagePlaceholder="120"
      />

      <GuidedComponentRows
        components={guidedComponents}
        onRemoveGuidedComponent={onRemoveGuidedComponent}
        onUpdateGuidedComponent={onUpdateGuidedComponent}
      />

      <div className="builder__footer">
        <p>
          The app aggregates the entered known components, converts L and C into reactance when
          needed, and then solves the final target with the deterministic rules engine.
        </p>
        <button className="primary-button" onClick={onSolveGuidedMode} type="button">
          Solve series circuit
        </button>
      </div>
    </>
  )
}

function SymbolBuilder({
  guidedGoal,
  onGuidedGoalChange,
  onParallelGoalChange,
  onRemoveGuidedSymbolRow,
  onSolveSymbolMode,
  onSymbolTopologyChange,
  onUpdateGuidedSymbolRow,
  parallelGoal,
  symbolRows,
  symbolTopology,
}: {
  guidedGoal: GuidedSeriesGoal
  onGuidedGoalChange: (goal: GuidedSeriesGoal) => void
  onParallelGoalChange: (goal: GuidedParallelGoal) => void
  onRemoveGuidedSymbolRow: (rowId: string) => void
  onSolveSymbolMode: () => void
  onSymbolTopologyChange: (topology: GuidedSymbolTopology) => void
  onUpdateGuidedSymbolRow: (rowId: string, updates: Partial<GuidedSymbolRow>) => void
  parallelGoal: GuidedParallelGoal
  symbolRows: GuidedSymbolRow[]
  symbolTopology: GuidedSymbolTopology
}) {
  const selectedSeriesGoal =
    guidedGoalOptions.find((goal) => goal.value === guidedGoal) ?? guidedGoalOptions[0]
  const selectedParallelGoal =
    parallelGoalOptions.find((goal) => goal.value === parallelGoal) ?? parallelGoalOptions[0]

  return (
    <>
      <label className="field">
        <span>Problem topology</span>
        <select
          value={symbolTopology}
          onChange={(event) => onSymbolTopologyChange(event.target.value as GuidedSymbolTopology)}
        >
          <option value="series">Series textbook labels</option>
          <option value="parallel">Parallel textbook labels</option>
        </select>
        <small>Pick the structure that matches the screenshot or homework statement.</small>
      </label>

      <label className="field">
        <span>Question goal</span>
        {symbolTopology === 'series' ? (
          <select
            value={guidedGoal}
            onChange={(event) => onGuidedGoalChange(event.target.value as GuidedSeriesGoal)}
          >
            {guidedGoalOptions.map((goal) => (
              <option key={goal.value} value={goal.value}>
                {goal.label}
              </option>
            ))}
          </select>
        ) : (
          <select
            value={parallelGoal}
            onChange={(event) => onParallelGoalChange(event.target.value as GuidedParallelGoal)}
          >
            {parallelGoalOptions.map((goal) => (
              <option key={goal.value} value={goal.value}>
                {goal.label}
              </option>
            ))}
          </select>
        )}
        <small>
          {symbolTopology === 'series'
            ? selectedSeriesGoal.description
            : selectedParallelGoal.description}
        </small>
      </label>

      <article className="detail-card detail-card--goal">
        <p className="detail-card__eyebrow">Textbook-label entry</p>
        <p>
          This mode is best when the screenshot already uses labels like R, XL, XC, L, C, f, E,
          V, or Is and you want to enter those labels directly instead of rebuilding the diagram.
        </p>
      </article>

      <div className="rows">
        {symbolRows.map((row) => {
          const definition = guidedSymbolDefinitionMap[row.symbolId]
          const unitOptions = unitOptionsForGuidedSymbol(row.symbolId)

          return (
            <article className="row-card row-card--symbol" key={row.id}>
              <label className="field">
                <span>Symbol</span>
                <select
                  value={row.symbolId}
                  onChange={(event) =>
                    onUpdateGuidedSymbolRow(row.id, { symbolId: event.target.value })
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
                  onChange={(event) => onUpdateGuidedSymbolRow(row.id, { rawValue: event.target.value })}
                  placeholder={placeholderForGuidedSymbol(row.symbolId)}
                />
              </label>

              <label className="field">
                <span>Unit</span>
                <select
                  value={row.unitId}
                  onChange={(event) => onUpdateGuidedSymbolRow(row.id, { unitId: event.target.value })}
                >
                  {unitOptions.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.label}
                    </option>
                  ))}
                </select>
              </label>

              <button
                className="ghost-button ghost-button--danger"
                onClick={() => onRemoveGuidedSymbolRow(row.id)}
                type="button"
              >
                Remove
              </button>

              <p className="row-card__hint">{definition.description}</p>
            </article>
          )
        })}
      </div>

      <div className="builder__footer">
        <p>
          Use this when the screenshot is already written in textbook symbols. The app will map
          those labels onto the guided solver for the selected series or parallel answer type.
        </p>
        <button className="primary-button" onClick={onSolveSymbolMode} type="button">
          Solve textbook labels
        </button>
      </div>
    </>
  )
}

function FrequencyAndSourceInputs({
  frequencyRawValue,
  frequencyUnitId,
  sourceCurrentPhasorPlaceholder,
  sourceCurrentPhasorRawValue,
  sourceCurrentPhasorUnitId,
  sourceVoltageRawValue,
  sourceVoltageUnitId,
  onFrequencyRawValueChange,
  onFrequencyUnitIdChange,
  onSourceCurrentPhasorRawValueChange,
  onSourceCurrentPhasorUnitIdChange,
  onSourceVoltageRawValueChange,
  onSourceVoltageUnitIdChange,
  sourceVoltagePlaceholder,
}: {
  frequencyRawValue: string
  frequencyUnitId: string
  sourceCurrentPhasorPlaceholder?: string
  sourceCurrentPhasorRawValue?: string
  sourceCurrentPhasorUnitId?: string
  sourceVoltageRawValue: string
  sourceVoltageUnitId: string
  onFrequencyRawValueChange: (value: string) => void
  onFrequencyUnitIdChange: (unitId: string) => void
  onSourceCurrentPhasorRawValueChange?: (value: string) => void
  onSourceCurrentPhasorUnitIdChange?: (unitId: string) => void
  onSourceVoltageRawValueChange: (value: string) => void
  onSourceVoltageUnitIdChange: (unitId: string) => void
  sourceVoltagePlaceholder: string
}) {
  return (
    <div className="detail-grid detail-grid--inputs">
      <article className="detail-card">
        <p className="detail-card__eyebrow">Known frequency if needed</p>
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
        <p className="detail-card__eyebrow">Known source voltage if needed</p>
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

      {typeof sourceCurrentPhasorRawValue === 'string' &&
        typeof sourceCurrentPhasorUnitId === 'string' &&
        onSourceCurrentPhasorRawValueChange &&
        onSourceCurrentPhasorUnitIdChange && (
          <article className="detail-card">
            <p className="detail-card__eyebrow">Known source current phasor if needed</p>
            <div className="frequency-row">
              <label className="field">
                <span>Value</span>
                <input
                  value={sourceCurrentPhasorRawValue}
                  onChange={(event) => onSourceCurrentPhasorRawValueChange(event.target.value)}
                  placeholder={sourceCurrentPhasorPlaceholder ?? '1@80deg'}
                />
              </label>

              <label className="field">
                <span>Unit</span>
                <select
                  value={sourceCurrentPhasorUnitId}
                  onChange={(event) => onSourceCurrentPhasorUnitIdChange(event.target.value)}
                >
                  {quantityMap.phasorCurrent.units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </article>
        )}
    </div>
  )
}

function GuidedComponentRows({
  components,
  onRemoveGuidedComponent,
  onUpdateGuidedComponent,
}: {
  components: GuidedComponentInput[]
  onRemoveGuidedComponent: (componentId: string) => void
  onUpdateGuidedComponent: (componentId: string, updates: Partial<GuidedComponentInput>) => void
}) {
  return (
    <div className="rows">
      {components.map((component) => (
        <article className="row-card row-card--guided" key={component.id}>
          <label className="field">
            <span>Component</span>
            <select
              value={component.kind}
              onChange={(event) =>
                onUpdateGuidedComponent(component.id, {
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
                onUpdateGuidedComponent(component.id, {
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
                onUpdateGuidedComponent(component.id, { rawValue: event.target.value })
              }
              placeholder={placeholderForGuided(component.valueMode)}
            />
          </label>

          <label className="field">
            <span>Unit</span>
            <select
              value={component.unitId}
              onChange={(event) =>
                onUpdateGuidedComponent(component.id, { unitId: event.target.value })
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
            onClick={() => onRemoveGuidedComponent(component.id)}
            type="button"
          >
            Remove
          </button>
        </article>
      ))}
    </div>
  )
}

function needsSeriesParallelTarget(goal: GuidedSeriesParallelGoal) {
  return goal === 'series-parallel-branch-voltage' || goal === 'series-parallel-branch-current'
}

function goalInputSummary(goal: GuidedMathGoalDefinition) {
  return goal.inputs
    .map((quantityId) => `${quantityMap[quantityId].symbol} (${quantityMap[quantityId].label})`)
    .join(', ')
}

function goalOutputSummary(goal: GuidedMathGoalDefinition) {
  if (goal.target) {
    return `${quantityMap[goal.target].symbol} (${quantityMap[goal.target].label})`
  }

  if (goal.waveformGoal === 'current-sine-expression-from-phasor') {
    return 'the sinusoidal current expression i(t)'
  }

  if (goal.waveformGoal === 'voltage-sine-expression-from-phasor') {
    return 'the sinusoidal voltage expression v(t)'
  }

  return 'the requested expression'
}
