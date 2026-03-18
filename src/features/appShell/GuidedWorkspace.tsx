import { quantityMap, type QuantityId } from '../../core'
import { type GuidedMathGoalDefinition, type GuidedMathResult } from '../guidedMathGoals'
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
import { GuidedResultsPanel, SeriesParallelNodeEditor } from './AppPanels'
import {
  guidedGoalOptions,
  guidedMathGoalGroups,
  guidedWorkflowOptions,
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
  guidedResult: GuidedSeriesImpedanceResult | null
  guidedWorkflow: GuidedWorkflow
  selectedMathGoal: GuidedMathGoalDefinition
  seriesParallelGoal: GuidedSeriesParallelGoal
  seriesParallelResult: GuidedSeriesParallelResult | null
  seriesParallelRoot: GuidedSeriesParallelGroupNode
  sourceVoltageRawValue: string
  sourceVoltageUnitId: string
  onAddGuidedMathRow: () => void
  onAddGuidedComponent: () => void
  onAddSeriesParallelComponent: (parentId: string, kind: GuidedComponentKind) => void
  onAddSeriesParallelGroup: (parentId: string, topology: GuidedSeriesParallelTopology) => void
  onFrequencyRawValueChange: (value: string) => void
  onFrequencyUnitIdChange: (unitId: string) => void
  onGuidedGoalChange: (goal: GuidedSeriesGoal) => void
  onGuidedMathGoalChange: (goalId: string) => void
  onGuidedWorkflowChange: (workflow: GuidedWorkflow) => void
  onRemoveGuidedMathRow: (rowId: string) => void
  onRemoveGuidedComponent: (componentId: string) => void
  onRemoveSeriesParallelNode: (nodeId: string) => void
  onResetSeriesParallelBuilder: () => void
  onSeriesParallelGoalChange: (goal: GuidedSeriesParallelGoal) => void
  onSolveGuidedMath: () => void
  onSolveGuidedMode: () => void
  onSolveSeriesParallelMode: () => void
  onSourceVoltageRawValueChange: (value: string) => void
  onSourceVoltageUnitIdChange: (unitId: string) => void
  onUpdateGuidedComponent: (componentId: string, updates: Partial<GuidedComponentInput>) => void
  onUpdateGuidedMathRow: (rowId: string, updates: Partial<GuidedMathRow>) => void
  onUpdateSeriesParallelNode: (
    nodeId: string,
    updates: GuidedSeriesParallelNodeUpdates,
  ) => void
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
  selectedMathGoal,
  seriesParallelGoal,
  seriesParallelResult,
  seriesParallelRoot,
  sourceVoltageRawValue,
  sourceVoltageUnitId,
  onAddGuidedMathRow,
  onAddGuidedComponent,
  onAddSeriesParallelComponent,
  onAddSeriesParallelGroup,
  onFrequencyRawValueChange,
  onFrequencyUnitIdChange,
  onGuidedGoalChange,
  onGuidedMathGoalChange,
  onGuidedWorkflowChange,
  onRemoveGuidedMathRow,
  onRemoveGuidedComponent,
  onRemoveSeriesParallelNode,
  onResetSeriesParallelBuilder,
  onSeriesParallelGoalChange,
  onSolveGuidedMath,
  onSolveGuidedMode,
  onSolveSeriesParallelMode,
  onSourceVoltageRawValueChange,
  onSourceVoltageUnitIdChange,
  onUpdateGuidedComponent,
  onUpdateGuidedMathRow,
  onUpdateSeriesParallelNode,
  onLoadSeriesParallelSample,
}: GuidedWorkspaceProps) {
  const selectedGoal = guidedGoalOptions.find((goal) => goal.value === guidedGoal) ?? guidedGoalOptions[0]
  const selectedSeriesParallelGoal =
    seriesParallelGoalOptions.find((goal) => goal.value === seriesParallelGoal) ??
    seriesParallelGoalOptions[0]

  const addAction =
    guidedWorkflow === 'chapter-goal'
      ? { label: 'Add known', onClick: onAddGuidedMathRow }
      : guidedWorkflow === 'series-builder'
        ? { label: 'Add component known', onClick: onAddGuidedComponent }
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
        guidedResult={guidedResult}
        guidedWorkflow={guidedWorkflow}
        selectedMathGoal={selectedMathGoal}
        seriesParallelResult={seriesParallelResult}
      />
    </main>
  )
}

function builderTitle(guidedWorkflow: GuidedWorkflow) {
  if (guidedWorkflow === 'chapter-goal') {
    return 'Pick the exact quiz math answer type'
  }

  if (guidedWorkflow === 'series-builder') {
    return 'Enter the values from the series diagram'
  }

  return 'Build the mixed network exactly as it is drawn'
}

function renderWorkflowHelp(guidedWorkflow: GuidedWorkflow) {
  if (guidedWorkflow === 'chapter-goal') {
    return (
      <div className="help-card">
        <p className="detail-card__eyebrow">How quiz-goal mode works</p>
        <p>1. Pick the exact kind of answer the quiz asks for.</p>
        <p>2. The required knowns load automatically, and you can add extra knowns when the quiz gives more values than the base pattern.</p>
        <p>3. Click solve and let the deterministic rules engine pick the formula path.</p>
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
        <span>Question goal</span>
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

      <article className="detail-card detail-card--goal">
        <p className="detail-card__eyebrow">Quiz math family</p>
        <h3>{selectedMathGoal.section}</h3>
        <p>{selectedMathGoal.description}</p>
        {selectedMathGoal.formulaSummary && selectedMathGoal.formulaSummary.length > 0 && (
          <div className="formula-summary">
            <p className="detail-card__eyebrow">Formula path</p>
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
