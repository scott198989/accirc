import {
  formatQuantityInBaseUnit,
  formatQuantityPolar,
  formatQuantitySmart,
  quantityMap,
  type SolveResult,
} from '../../core'
import type { GuidedMathGoalDefinition, GuidedMathResult } from '../guidedMathGoals'
import type { GuidedParallelCircuitResult } from '../guidedParallelCircuit'
import type {
  GuidedWaveformExpressionDetail,
  GuidedWaveformExpressionResult,
  GuidedWaveformExpressionSolvedResult,
  GuidedWaveformExpressionStep,
} from '../guidedWaveformExpressions'
import type {
  GuidedComponentKind,
  GuidedComputedValue,
  GuidedSeriesImpedanceResult,
  GuidedValueMode,
} from '../guidedSeriesImpedance'
import type {
  GuidedSeriesParallelNode,
  GuidedSeriesParallelResult,
  GuidedSeriesParallelTopology,
} from '../guidedSeriesParallelNetwork'
import type { GuidedSymbolProblemResult } from '../guidedSymbolProblem'
import {
  defaultSeriesParallelComponentLabel,
  defaultSeriesParallelGroupLabel,
  placeholderForGuided,
  topologyLabel,
  toScalar,
  unitsForGuided,
  valueModesForKind,
  type GuidedSeriesParallelNodeUpdates,
  type GuidedWorkflow,
} from './appShell'

export function GuidedResultsPanel({
  guidedMathResult,
  parallelResult,
  guidedResult,
  guidedWorkflow,
  selectedMathGoal,
  seriesParallelResult,
  symbolResult,
}: {
  guidedMathResult: GuidedMathResult | null
  parallelResult: GuidedParallelCircuitResult | null
  guidedResult: GuidedSeriesImpedanceResult | null
  guidedWorkflow: GuidedWorkflow
  selectedMathGoal: GuidedMathGoalDefinition
  seriesParallelResult: GuidedSeriesParallelResult | null
  symbolResult: GuidedSymbolProblemResult | null
}) {
  return (
    <section className="card results">
      <div className="card__header">
        <div>
          <p className="eyebrow">
            {guidedWorkflow === 'chapter-goal' ? 'Quiz Goal Output' : 'Guided Output'}
          </p>
          <h2>
            {guidedWorkflow === 'chapter-goal'
              ? 'Deterministic formula trail'
              : 'What the app figured out'}
          </h2>
        </div>
      </div>

      {guidedWorkflow === 'chapter-goal' ? (
        <GuidedMathResultPanel goal={selectedMathGoal} result={guidedMathResult} />
      ) : guidedWorkflow === 'parallel-builder' ? (
        <GuidedParallelResultPanel
          emptyMessage="Enter the Chapter 16 branch values, add source voltage or source current if the ask needs it, and run the solve."
          result={parallelResult}
        />
      ) : guidedWorkflow === 'series-parallel-builder' ? (
        <GuidedSeriesParallelResultPanel
          emptyMessage="Build the mixed network, enter frequency or source voltage when needed, and run the solve."
          result={seriesParallelResult}
        />
      ) : guidedWorkflow === 'symbol-builder' ? (
        <GuidedSymbolResultPanel result={symbolResult} />
      ) : (
        <GuidedSeriesResultPanel
          emptyMessage="Select a goal, enter the components you see, and run the guided solve."
          result={guidedResult}
        />
      )}
    </section>
  )
}

export function FormulaResultPanel({ formulaResult }: { formulaResult: SolveResult | null }) {
  return (
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

          {formulaResult.value.kind === 'complex' && (
            <ComplexFormsPanel quantityId={formulaResult.target} value={formulaResult.value} />
          )}

          <FormulaTrace result={formulaResult} />
        </>
      )}
    </section>
  )
}

export function SeriesParallelNodeEditor({
  node,
  rootId,
  onAddComponent,
  onAddGroup,
  onRemoveNode,
  onUpdateNode,
}: {
  node: GuidedSeriesParallelNode
  rootId: string
  onAddComponent: (parentId: string, kind: GuidedComponentKind) => void
  onAddGroup: (parentId: string, topology: GuidedSeriesParallelTopology) => void
  onRemoveNode: (nodeId: string) => void
  onUpdateNode: (nodeId: string, updates: GuidedSeriesParallelNodeUpdates) => void
}) {
  if (node.type === 'component') {
    return (
      <article className="row-card row-card--network" key={node.id}>
        <div>
          <p className="detail-card__eyebrow">Component leaf</p>
          <h3>{node.label.trim() || defaultSeriesParallelComponentLabel(node.kind)}</h3>
          <p className="row-card__hint">
            This element contributes impedance directly to its parent reduction block.
          </p>
        </div>

        <label className="field">
          <span>Label</span>
          <input
            value={node.label}
            onChange={(event) => onUpdateNode(node.id, { label: event.target.value })}
            placeholder={defaultSeriesParallelComponentLabel(node.kind)}
          />
        </label>

        <label className="field">
          <span>Component</span>
          <select
            value={node.kind}
            onChange={(event) =>
              onUpdateNode(node.id, { kind: event.target.value as GuidedComponentKind })
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
            value={node.valueMode}
            onChange={(event) =>
              onUpdateNode(node.id, { valueMode: event.target.value as GuidedValueMode })
            }
          >
            {valueModesForKind(node.kind).map((modeOption) => (
              <option key={modeOption.value} value={modeOption.value}>
                {modeOption.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Value</span>
          <input
            value={node.rawValue}
            onChange={(event) => onUpdateNode(node.id, { rawValue: event.target.value })}
            placeholder={placeholderForGuided(node.valueMode)}
          />
        </label>

        <label className="field">
          <span>Unit</span>
          <select
            value={node.unitId}
            onChange={(event) => onUpdateNode(node.id, { unitId: event.target.value })}
          >
            {unitsForGuided(node.valueMode).map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.label}
              </option>
            ))}
          </select>
        </label>

        <button
          className="ghost-button ghost-button--danger"
          onClick={() => onRemoveNode(node.id)}
          type="button"
        >
          Remove
        </button>
      </article>
    )
  }

  const groupLabel = node.label.trim() || defaultSeriesParallelGroupLabel(node.topology)

  return (
    <section className={node.id === rootId ? 'network-node network-node--root' : 'network-node'}>
      <div className="detail-card__header">
        <div>
          <p className="detail-card__eyebrow">{node.id === rootId ? 'Network root' : 'Reduction group'}</p>
          <h3>{groupLabel}</h3>
          <p>
            This block is reduced as a {topologyLabel(node.topology).toLowerCase()} connection
            before it contributes to its parent.
          </p>
        </div>
        {node.id !== rootId && (
          <button
            className="ghost-button ghost-button--danger"
            onClick={() => onRemoveNode(node.id)}
            type="button"
          >
            Remove group
          </button>
        )}
      </div>

      <div className="network-node__controls">
        <label className="field">
          <span>Group label</span>
          <input
            value={node.label}
            onChange={(event) => onUpdateNode(node.id, { label: event.target.value })}
            placeholder={defaultSeriesParallelGroupLabel(node.topology)}
          />
        </label>

        <label className="field">
          <span>Topology</span>
          <select
            value={node.topology}
            onChange={(event) =>
              onUpdateNode(node.id, {
                topology: event.target.value as GuidedSeriesParallelTopology,
              })
            }
          >
            <option value="series">Series</option>
            <option value="parallel">Parallel</option>
          </select>
        </label>
      </div>

      <div className="network-node__toolbar">
        <button className="ghost-button" onClick={() => onAddComponent(node.id, 'resistor')} type="button">
          Add resistor
        </button>
        <button className="ghost-button" onClick={() => onAddComponent(node.id, 'inductor')} type="button">
          Add inductor
        </button>
        <button className="ghost-button" onClick={() => onAddComponent(node.id, 'capacitor')} type="button">
          Add capacitor
        </button>
        <button className="ghost-button" onClick={() => onAddGroup(node.id, 'series')} type="button">
          Add series group
        </button>
        <button className="ghost-button" onClick={() => onAddGroup(node.id, 'parallel')} type="button">
          Add parallel group
        </button>
      </div>

      <div className="network-node__children">
        {node.children.map((child) => (
          <SeriesParallelNodeEditor
            key={child.id}
            node={child}
            rootId={rootId}
            onAddComponent={onAddComponent}
            onAddGroup={onAddGroup}
            onRemoveNode={onRemoveNode}
            onUpdateNode={onUpdateNode}
          />
        ))}
      </div>
    </section>
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
            {formatQuantityInBaseUnit(
              'inductiveReactance',
              toScalar(result.totals.inductiveReactance),
            )}
          </p>
          <p>
            XC total ={' '}
            {formatQuantityInBaseUnit(
              'capacitiveReactance',
              toScalar(result.totals.capacitiveReactance),
            )}
          </p>
          <p>
            X net = {formatQuantityInBaseUnit('netReactance', toScalar(result.totals.netReactance))}
          </p>
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
    return <ResultBanner tone="warning" title="Need a clearer parallel input" body={result.message} />
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
          <p>
            BL total ={' '}
            {formatQuantityInBaseUnit(
              'inductiveSusceptance',
              toScalar(result.totals.inductiveSusceptance),
            )}
          </p>
          <p>
            BC total ={' '}
            {formatQuantityInBaseUnit(
              'capacitiveSusceptance',
              toScalar(result.totals.capacitiveSusceptance),
            )}
          </p>
          <p>
            B net = {formatQuantityInBaseUnit('netSusceptance', toScalar(result.totals.netSusceptance))}
          </p>
        </article>

        <article className="detail-card">
          <p className="detail-card__eyebrow">Parallel-circuit notes</p>
          <p>
            The builder adds branch admittances directly, then inverts the result to show the
            equivalent series impedance.
          </p>
          <p>
            Entering a source voltage or source current phasor unlocks the source and branch-current
            phasors used in the Chapter 16 homework problems.
          </p>
        </article>
      </div>

      <div className="detail-grid detail-grid--reference">
        <ComputedValueCard value={result.reference.admittanceRectangular} />
        <ComputedValueCard value={result.reference.admittanceMagnitude} />
        <ComputedValueCard value={result.reference.admittanceAngle} />
        <ComputedValueCard value={result.reference.impedanceRectangular} />
        <ComputedValueCard value={result.reference.impedanceMagnitude} />
        <ComputedValueCard value={result.reference.equivalentSeriesResistance} />
        <ComputedValueCard value={result.reference.equivalentSeriesReactance} />
        <ComputedValueCard value={result.reference.powerFactor} />
        {result.reference.sourceVoltagePhasor && <ComputedValueCard value={result.reference.sourceVoltagePhasor} />}
        {result.reference.sourceCurrent && <ComputedValueCard value={result.reference.sourceCurrent} />}
        {result.reference.resistorCurrent && <ComputedValueCard value={result.reference.resistorCurrent} />}
        {result.reference.inductorCurrent && <ComputedValueCard value={result.reference.inductorCurrent} />}
        {result.reference.capacitorCurrent && <ComputedValueCard value={result.reference.capacitorCurrent} />}
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

function GuidedSymbolResultPanel({ result }: { result: GuidedSymbolProblemResult | null }) {
  if (!result) {
    return (
      <div className="empty-state">
        <p>Pick the textbook labels from the screenshot, enter the knowns, and solve.</p>
      </div>
    )
  }

  return result.topology === 'series' ? (
    <GuidedSeriesResultPanel
      emptyMessage="Enter the textbook labels you see, then solve."
      result={result.result}
    />
  ) : (
    <GuidedParallelResultPanel
      emptyMessage="Enter the textbook labels you see, then solve."
      result={result.result}
    />
  )
}

function GuidedMathResultPanel({
  goal,
  result,
}: {
  goal: GuidedMathGoalDefinition
  result: GuidedMathResult | null
}) {
  if (!result) {
    return (
      <div className="empty-state">
        <p>Pick a quiz math goal, enter the values the problem gives you, and solve.</p>
      </div>
    )
  }

  if (isGuidedWaveformExpressionResult(result)) {
    if (result.status === 'invalid') {
      return <ResultBanner tone="warning" title="Input issue" body={result.message} />
    }

    if (result.status === 'incomplete') {
      return <ResultBanner tone="warning" title="Need more information" body={result.message} />
    }

    if (!isSolvedGuidedWaveformExpressionResult(result)) {
      return null
    }

    return (
      <>
        <div className="answer-panel">
          <p className="detail-card__eyebrow">Quiz math answer</p>
          <h3>{result.expression}</h3>
          <p>{result.note}</p>
        </div>

        <div className="detail-grid detail-grid--reference">
          {result.details.map((detail: GuidedWaveformExpressionDetail) => (
            <article className="detail-card" key={`${result.answerLabel}-${detail.label}`}>
              <p className="detail-card__eyebrow">{detail.label}</p>
              <h3>{detail.value}</h3>
            </article>
          ))}
        </div>

        <div className="list-stack">
          {result.steps.map((step: GuidedWaveformExpressionStep) => (
            <article className="detail-card" key={`${result.answerLabel}-${step.formula}`}>
              <p className="detail-card__eyebrow">Conversion step</p>
              <h3>{step.formula}</h3>
              <p>{step.explanation}</p>
            </article>
          ))}
        </div>
      </>
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
        <p className="detail-card__eyebrow">Quiz math answer</p>
        <h3>
          {goal.label}: {formatQuantitySmart(result.target, result.value)}
        </h3>
        <p>
          {result.steps[result.steps.length - 1]?.formula} selected in {result.steps.length} step(s).
        </p>
      </div>

      {result.value.kind === 'complex' && (
        <ComplexFormsPanel quantityId={result.target} value={result.value} />
      )}

      <FormulaTrace result={result} />
    </>
  )
}

function ComplexFormsPanel({
  quantityId,
  value,
}: {
  quantityId: keyof typeof quantityMap
  value: Extract<SolveResult, { status: 'solved' }>['value']
}) {
  if (value.kind !== 'complex') {
    return null
  }

  return (
    <div className="detail-grid">
      <article className="detail-card">
        <p className="detail-card__eyebrow">Rectangular form</p>
        <h3>{formatQuantitySmart(quantityId, value)}</h3>
      </article>

      <article className="detail-card">
        <p className="detail-card__eyebrow">Polar form</p>
        <h3>{formatQuantityPolar(quantityId, value)}</h3>
      </article>
    </div>
  )
}

function isGuidedWaveformExpressionResult(
  result: GuidedMathResult,
): result is GuidedWaveformExpressionResult {
  return 'kind' in result && result.kind === 'waveform-expression'
}

function isSolvedGuidedWaveformExpressionResult(
  result: GuidedWaveformExpressionResult,
): result is GuidedWaveformExpressionSolvedResult {
  return result.status === 'solved'
}

function GuidedSeriesParallelResultPanel({
  result,
  emptyMessage,
}: {
  result: GuidedSeriesParallelResult | null
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
    return <ResultBanner tone="warning" title="Need a clearer network" body={result.message} />
  }

  return (
    <>
      <div className="answer-panel">
        <p className="detail-card__eyebrow">{result.output.label}</p>
        <h3>{formatQuantitySmart(result.output.quantityId, result.output.value)}</h3>
        {result.output.secondaryText && <p>{result.output.secondaryText}</p>}
      </div>

      <div className="detail-grid">
        <article className="detail-card">
          <p className="detail-card__eyebrow">Network reference values</p>
          <p>Z total = {formatQuantityInBaseUnit('impedanceComplex', result.reference.totalImpedance)}</p>
          <p>
            |Z| = {formatQuantitySmart('impedanceMagnitude', result.reference.totalImpedanceMagnitude)}
          </p>
          <p>Phase = {formatQuantitySmart('phaseAngle', result.reference.phaseAngle)}</p>
          {result.reference.sourceCurrent && (
            <p>Source current = {formatQuantitySmart('current', result.reference.sourceCurrent)}</p>
          )}
          {result.reference.sourceCurrentPhasor && (
            <p>
              Source current phasor ={' '}
              {formatQuantityInBaseUnit('phasorCurrent', result.reference.sourceCurrentPhasor)}
            </p>
          )}
          {result.reference.realPower && (
            <p>Real power = {formatQuantitySmart('realPower', result.reference.realPower)}</p>
          )}
          {result.reference.selectedNode && (
            <p>
              Selected target = {result.reference.selectedNode.label} (
              {result.reference.selectedNode.kind})
            </p>
          )}
        </article>

        <article className="detail-card">
          <p className="detail-card__eyebrow">Reduction summary</p>
          <p>{result.reductions.length} group reduction step(s) were evaluated deterministically.</p>
          <p>
            Series groups add impedances directly. Parallel groups sum branch admittances and then
            invert back to impedance.
          </p>
          {result.nodeSummaries.length === 0 && (
            <p>Enter a source voltage to expand node voltages and currents after the reduction.</p>
          )}
        </article>
      </div>

      <div className="list-stack">
        {result.reductions.map((step) => (
          <article className="detail-card" key={step.id}>
            <p className="detail-card__eyebrow">{topologyLabel(step.topology)} reduction</p>
            <h3>{step.label}</h3>
            <p>Combined: {step.childLabels.join(', ')}</p>
            <p>Z = {formatQuantityInBaseUnit('impedanceComplex', step.rectangular)}</p>
          </article>
        ))}
      </div>

      {result.nodeSummaries.length > 0 && (
        <div className="list-stack">
          {result.nodeSummaries.map((summary) => (
            <article className="detail-card" key={summary.id}>
              <p className="detail-card__eyebrow">
                {summary.kind === 'group'
                  ? `${topologyLabel(summary.topology ?? 'series')} group`
                  : 'Component node'}
              </p>
              <h3>{summary.label}</h3>
              <p>Z = {formatQuantityInBaseUnit('impedanceComplex', summary.impedance)}</p>
              {summary.voltagePhasor && (
                <p>V = {formatQuantityInBaseUnit('branchVoltagePhasor', summary.voltagePhasor)}</p>
              )}
              {summary.currentPhasor && (
                <p>I = {formatQuantityInBaseUnit('phasorCurrent', summary.currentPhasor)}</p>
              )}
            </article>
          ))}
        </div>
      )}
    </>
  )
}

function FormulaTrace({ result }: { result: SolveResult }) {
  if (result.status !== 'solved' || result.steps.length === 0) {
    return null
  }

  return (
    <div className="list-stack">
      {result.steps.map((step) => (
        <article className="detail-card" key={`${step.formulaId}-${step.target}`}>
          <div className="detail-card__header">
            <div>
              <p className="detail-card__eyebrow">Formula family</p>
              <h3>{step.familyLabel}</h3>
            </div>
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
