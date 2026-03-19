import { startTransition, useState } from 'react'
import {
  analyzeFastSolve,
  defaultUnitIdForFastKnown,
  fastKnownDefinitions,
  fastScopeOptions,
  fastTargetDefinitions,
  makeFastKnownRow,
  placeholderForFastKnown,
  solveFastProblem,
  supportsFastScope,
  unitOptionsForFastKnown,
  type FastKnownRow,
  type FastScopeId,
  type FastSolveContext,
  type FastSolveOutcome,
  type FastTargetId,
} from '../fastSolve'

export default function FastSolveWorkspace() {
  const [rows, setRows] = useState<FastKnownRow[]>([makeFastKnownRow('voltage')])
  const [targetId, setTargetId] = useState<FastTargetId>('resistance')
  const [context, setContext] = useState<FastSolveContext>({
    circuitShape: '',
    branchRole: '',
  })
  const [outcome, setOutcome] = useState<FastSolveOutcome | null>(null)

  const analysis = analyzeFastSolve({
    rows,
    targetId,
    context,
  })

  function updateRow(rowId: string, updates: Partial<FastKnownRow>) {
    setRows((current) =>
      current.map((row) => {
        if (row.id !== rowId) {
          return row
        }

        if (updates.knownId) {
          return {
            ...row,
            knownId: updates.knownId,
            unitId: defaultUnitIdForFastKnown(updates.knownId),
            rawValue: '',
            scopeId: supportsFastScope(updates.knownId) ? row.scopeId : 'auto',
          }
        }

        return { ...row, ...updates }
      }),
    )
    setOutcome(null)
  }

  function addRow() {
    setRows((current) => [...current, makeFastKnownRow('current')])
    setOutcome(null)
  }

  function removeRow(rowId: string) {
    setRows((current) => (current.length === 1 ? current : current.filter((row) => row.id !== rowId)))
    setOutcome(null)
  }

  function updateContext(updates: Partial<FastSolveContext>) {
    setContext((current) => {
      const next = { ...current, ...updates }

      if (updates.circuitShape && updates.circuitShape !== 'parallel') {
        next.branchRole = ''
      }

      return next
    })
    setOutcome(null)
  }

  function handleSolve() {
    startTransition(() => {
      setOutcome(
        solveFastProblem({
          rows,
          targetId,
          context,
        }),
      )
    })
  }

  return (
    <main className="workspace">
      <section className="card builder">
        <div className="card__header">
          <div>
            <p className="eyebrow">Fast Solve</p>
            <h2>Tell the app what you have and what you need</h2>
          </div>
          <button className="ghost-button" onClick={addRow} type="button">
            Add known
          </button>
        </div>

        <article className="help-card">
          <p className="detail-card__eyebrow">Default workflow</p>
          <p>1. Enter the known values exactly as the problem gives them.</p>
          <p>2. Choose what the question wants.</p>
          <p>3. Only answer the extra context question if the same numbers could fit more than one circuit relationship.</p>
        </article>

        <section className="builder-section">
          <div className="builder-section__header">
            <div>
              <p className="eyebrow">What I Have</p>
              <h3>Known values</h3>
            </div>
          </div>

          <div className="rows">
            {rows.map((row) => (
              <article className="row-card row-card--fast-known" key={row.id}>
                <label className="field">
                  <span>Quantity</span>
                  <select
                    value={row.knownId}
                    onChange={(event) =>
                      updateRow(row.id, { knownId: event.target.value as FastKnownRow['knownId'] })
                    }
                  >
                    {fastKnownDefinitions.map((definition) => (
                      <option key={definition.id} value={definition.id}>
                        {definition.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span>Value</span>
                  <input
                    value={row.rawValue}
                    onChange={(event) => updateRow(row.id, { rawValue: event.target.value })}
                    placeholder={placeholderForFastKnown(row.knownId)}
                  />
                </label>

                <label className="field">
                  <span>Unit</span>
                  <select
                    value={row.unitId}
                    onChange={(event) => updateRow(row.id, { unitId: event.target.value })}
                  >
                    {unitOptionsForFastKnown(row.knownId).map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.label}
                      </option>
                    ))}
                  </select>
                </label>

                {supportsFastScope(row.knownId) ? (
                  <label className="field">
                    <span>Scope</span>
                    <select
                      value={row.scopeId}
                      onChange={(event) =>
                        updateRow(row.id, { scopeId: event.target.value as FastScopeId })
                      }
                    >
                      {fastScopeOptions().map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <div className="field field--spacer" aria-hidden="true" />
                )}

                <button
                  className="ghost-button ghost-button--danger"
                  onClick={() => removeRow(row.id)}
                  type="button"
                >
                  Remove
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="builder-section">
          <div className="builder-section__header">
            <div>
              <p className="eyebrow">What I Need</p>
              <h3>Target answer</h3>
            </div>
          </div>

          <label className="field">
            <span>Question target</span>
            <select
              value={targetId}
              onChange={(event) => {
                setTargetId(event.target.value as FastTargetId)
                setOutcome(null)
              }}
            >
              {fastTargetDefinitions.map((definition) => (
                <option key={definition.id} value={definition.id}>
                  {definition.label}
                </option>
              ))}
            </select>
          </label>
        </section>

        {(analysis.requestedContext.length > 0 ||
          context.circuitShape.length > 0 ||
          context.branchRole.length > 0) && (
          <section className="builder-section">
            <div className="builder-section__header">
              <div>
                <p className="eyebrow">Optional Context</p>
                <h3>Only shown because the solve needs it</h3>
              </div>
            </div>

            <div className="detail-grid detail-grid--inputs">
              {(analysis.requestedContext.includes('circuitShape') ||
                context.circuitShape.length > 0) && (
                <label className="field">
                  <span>Circuit shape</span>
                  <select
                    value={context.circuitShape}
                    onChange={(event) =>
                      updateContext({
                        circuitShape: event.target.value as FastSolveContext['circuitShape'],
                      })
                    }
                  >
                    <option value="">Choose only if needed</option>
                    <option value="series">Series</option>
                    <option value="parallel">Parallel</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </label>
              )}

              {(analysis.requestedContext.includes('branchRole') ||
                context.branchRole.length > 0) && (
                <label className="field">
                  <span>Requested branch</span>
                  <select
                    value={context.branchRole}
                    onChange={(event) =>
                      updateContext({
                        branchRole: event.target.value as FastSolveContext['branchRole'],
                      })
                    }
                  >
                    <option value="">Choose branch</option>
                    <option value="resistor">Resistor branch</option>
                    <option value="inductor">Inductor branch</option>
                    <option value="capacitor">Capacitor branch</option>
                  </select>
                </label>
              )}
            </div>
          </section>
        )}

        <div className="builder__footer">
          <p>
            The app chooses the shortest solve path it can justify. Manual Override stays available
            below for exact builder-driven problems.
          </p>
          <button
            className="primary-button"
            disabled={analysis.status !== 'ready'}
            onClick={handleSolve}
            type="button"
          >
            Solve
          </button>
        </div>
      </section>

      <section className="card results">
        <div className="card__header">
          <div>
            <p className="eyebrow">Live Feedback</p>
            <h2>What the app sees right now</h2>
          </div>
        </div>

        {outcome?.status === 'solved' ? (
          <>
            <div className="answer-panel">
              <p className="detail-card__eyebrow">Final answer</p>
              <h3>
                {outcome.answerLabel}: {outcome.answerValue}
              </h3>
              <p>{outcome.pathSummary}</p>
            </div>

            <div className="detail-grid detail-grid--reference">
              <article className="detail-card">
                <p className="detail-card__eyebrow">Recognized pattern</p>
                <h3>{outcome.analysis.recognizedPattern ?? 'Solve path ready'}</h3>
                <p>{outcome.analysis.summary}</p>
              </article>

              <article className="detail-card">
                <p className="detail-card__eyebrow">Inputs used</p>
                <ul className="plain-list">
                  {outcome.inputsUsed.map((entry) => (
                    <li key={entry}>{entry}</li>
                  ))}
                </ul>
              </article>
            </div>

            <details className="reference-details">
              <summary>Show steps</summary>
              <ul className="reference-link-list">
                {outcome.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
            </details>

            <details className="reference-details">
              <summary>Why this path was chosen</summary>
              <ul className="reference-link-list">
                {outcome.debugTrail.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </details>
          </>
        ) : (
          <div className="list-stack">
            <article className="detail-card">
              <p className="detail-card__eyebrow">Recognized pattern</p>
              <h3>{analysis.recognizedPattern ?? 'Still analyzing'}</h3>
              <p>{analysis.summary}</p>
            </article>

            {analysis.missingInputs.length > 0 && (
              <article className="detail-card">
                <p className="detail-card__eyebrow">Missing required inputs</p>
                <ul className="plain-list">
                  {analysis.missingInputs.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            )}

            {analysis.ambiguity && (
              <article className="detail-card detail-card--selected">
                <p className="detail-card__eyebrow">Ambiguity detected</p>
                <p>{analysis.ambiguity}</p>
              </article>
            )}

            {analysis.requestedContext.length > 0 && (
              <article className="detail-card">
                <p className="detail-card__eyebrow">Extra question needed</p>
                <p>
                  {analysis.requestedContext.includes('circuitShape')
                    ? 'Pick the circuit shape so the app can choose between a series and parallel reduction.'
                    : 'Pick the branch type so the app knows which branch current to report.'}
                </p>
              </article>
            )}

            {analysis.status === 'manual-override' && (
              <article className="detail-card">
                <p className="detail-card__eyebrow">Manual Override recommended</p>
                <p>{analysis.manualOverrideReason}</p>
              </article>
            )}

            {outcome?.status === 'invalid' && (
              <article className="banner banner--warning">
                <p className="detail-card__eyebrow">Could not solve</p>
                <p>{outcome.message}</p>
              </article>
            )}
          </div>
        )}
      </section>
    </main>
  )
}
