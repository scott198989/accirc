import { quantityMap, type QuantityId, type SolveResult } from '../../core'
import { quantityGroups, type KnownRow } from './appShell'
import { FormulaResultPanel } from './AppPanels'

interface FormulaWorkspaceProps {
  formulaResult: SolveResult | null
  rows: KnownRow[]
  target: QuantityId
  onAddFormulaRow: () => void
  onRemoveFormulaRow: (rowId: string) => void
  onSolveFormula: () => void
  onTargetChange: (target: QuantityId) => void
  onUpdateFormulaRow: (rowId: string, updates: Partial<KnownRow>) => void
}

export default function FormulaWorkspace({
  formulaResult,
  rows,
  target,
  onAddFormulaRow,
  onRemoveFormulaRow,
  onSolveFormula,
  onTargetChange,
  onUpdateFormulaRow,
}: FormulaWorkspaceProps) {
  const targetDefinition = quantityMap[target]

  return (
    <main className="workspace">
      <section className="card builder">
        <div className="card__header">
          <div>
            <p className="eyebrow">Formula Mode</p>
            <h2>Known values and target</h2>
          </div>
          <button className="ghost-button" onClick={onAddFormulaRow} type="button">
            Add known
          </button>
        </div>

        <label className="field">
          <span>Target quantity</span>
          <select value={target} onChange={(event) => onTargetChange(event.target.value as QuantityId)}>
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
                      onUpdateFormulaRow(row.id, { quantityId: event.target.value as QuantityId })
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
                    onChange={(event) => onUpdateFormulaRow(row.id, { rawValue: event.target.value })}
                    placeholder={definition.placeholder}
                  />
                </label>

                <label className="field">
                  <span>Unit</span>
                  <select
                    value={row.unitId}
                    onChange={(event) => onUpdateFormulaRow(row.id, { unitId: event.target.value })}
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
                  onClick={() => onRemoveFormulaRow(row.id)}
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
          <p>Formula mode is still here if you already know the exact electrical quantities.</p>
          <button className="primary-button" onClick={onSolveFormula} type="button">
            Solve deterministically
          </button>
        </div>
      </section>

      <FormulaResultPanel formulaResult={formulaResult} />
    </main>
  )
}
