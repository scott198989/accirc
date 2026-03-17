import { startTransition, useState } from 'react'
import { quantityMap, solveCircuitProblem, type QuantityId, type SolveResult } from './core'
import {
  solveGuidedSeriesImpedance,
  type GuidedComponentInput,
  type GuidedComponentKind,
  type GuidedSeriesGoal,
  type GuidedSeriesImpedanceResult,
} from './features/guidedSeriesImpedance'
import {
  solveGuidedParallelCircuit,
  type GuidedParallelCircuitResult,
  type GuidedParallelGoal,
} from './features/guidedParallelCircuit'
import {
  addSeriesParallelChild,
  makeSeriesParallelComponent,
  makeSeriesParallelGroup,
  removeSeriesParallelNode,
  solveGuidedSeriesParallelNetwork,
  updateSeriesParallelNode,
  type GuidedSeriesParallelGoal,
  type GuidedSeriesParallelGroupNode,
  type GuidedSeriesParallelResult,
  type GuidedSeriesParallelTopology,
} from './features/guidedSeriesParallelNetwork'
import {
  guidedMathGoalMap,
  makeGuidedMathRows,
  solveGuidedMathGoal,
} from './features/guidedMathGoals'
import {
  defaultUnitIdForGuidedSymbol,
  makeGuidedSymbolRow,
  solveGuidedSymbolProblem,
  type GuidedSymbolRow,
  type GuidedSymbolTopology,
} from './features/guidedSymbolProblem'
import AppHeader from './features/appShell/AppHeader'
import FormulaWorkspace from './features/appShell/FormulaWorkspace'
import GuidedWorkspace from './features/appShell/GuidedWorkspace'
import {
  cloneSeriesParallelGroup,
  defaultGuidedMathGoal,
  defaultGuidedSymbolPart,
  defaultUnitForGuided,
  defaultValueModeForKind,
  guidedSamples,
  makeFormulaRow,
  makeGuidedComponent,
  makeGuidedMathRow,
  makeGuidedSymbolPart,
  makeSeriesParallelRoot,
  nextGuidedSymbolPartLabel,
  seriesParallelSamples,
  type AppMode,
  type GuidedMathRow,
  type GuidedSeriesParallelNodeUpdates,
  type GuidedSymbolPart,
  type GuidedWorkflow,
  type KnownRow,
} from './features/appShell/appShell'
import { useThemeMode } from './features/appShell/useThemeMode'

function App() {
  const { themeMode, resolvedTheme, setThemeMode } = useThemeMode()
  const [mode, setMode] = useState<AppMode>('guided')
  const [guidedWorkflow, setGuidedWorkflow] = useState<GuidedWorkflow>('symbol-builder')
  const [symbolTopology, setSymbolTopology] = useState<GuidedSymbolTopology>('series')
  const [guidedGoal, setGuidedGoal] = useState<GuidedSeriesGoal>('series-impedance')
  const [parallelGoal, setParallelGoal] = useState<GuidedParallelGoal>('parallel-admittance')
  const [seriesParallelGoal, setSeriesParallelGoal] =
    useState<GuidedSeriesParallelGoal>('series-parallel-impedance')
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
  const [seriesParallelRoot, setSeriesParallelRoot] = useState<GuidedSeriesParallelGroupNode>(() =>
    makeSeriesParallelRoot(),
  )
  const [seriesParallelResult, setSeriesParallelResult] =
    useState<GuidedSeriesParallelResult | null>(null)
  const [symbolParts, setSymbolParts] = useState<GuidedSymbolPart[]>([defaultGuidedSymbolPart])
  const [selectedSymbolPartId, setSelectedSymbolPartId] = useState(defaultGuidedSymbolPart.id)

  const selectedMathGoal = guidedMathGoalMap[guidedMathGoalId] ?? defaultGuidedMathGoal

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

  function openChapter17BuilderFromGoal(goal: GuidedSeriesParallelGoal) {
    startTransition(() => {
      setGuidedWorkflow('series-parallel-builder')
      setSeriesParallelGoal(goal)
      setSeriesParallelResult(null)
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

  function addSeriesParallelComponentTo(parentId: string, kind: GuidedComponentKind) {
    setSeriesParallelRoot((current) =>
      addSeriesParallelChild(current, parentId, makeSeriesParallelComponent(kind)),
    )
    setSeriesParallelResult(null)
  }

  function addSeriesParallelGroupTo(parentId: string, topology: GuidedSeriesParallelTopology) {
    setSeriesParallelRoot((current) =>
      addSeriesParallelChild(current, parentId, makeSeriesParallelGroup(topology)),
    )
    setSeriesParallelResult(null)
  }

  function updateSeriesParallelNodeById(
    nodeId: string,
    updates: GuidedSeriesParallelNodeUpdates,
  ) {
    setSeriesParallelRoot((current) => updateSeriesParallelNode(current, nodeId, updates))
    setSeriesParallelResult(null)
  }

  function removeSeriesParallelTreeNode(nodeId: string) {
    if (nodeId === seriesParallelRoot.id) {
      return
    }

    setSeriesParallelRoot((current) => removeSeriesParallelNode(current, nodeId))
    setSeriesParallelResult(null)
  }

  function resetSeriesParallelBuilder() {
    startTransition(() => {
      setSeriesParallelGoal('series-parallel-impedance')
      setFrequencyRawValue('')
      setFrequencyUnitId('hz')
      setSourceVoltageRawValue('')
      setSourceVoltageUnitId('v')
      setSeriesParallelRoot(makeSeriesParallelRoot())
      setSeriesParallelResult(null)
    })
  }

  function solveSeriesParallelMode() {
    startTransition(() => {
      setSeriesParallelResult(
        solveGuidedSeriesParallelNetwork({
          goal: seriesParallelGoal,
          frequencyRawValue,
          frequencyUnitId,
          sourceVoltageRawValue,
          sourceVoltageUnitId,
          root: seriesParallelRoot,
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
      setSeriesParallelResult(null)
      setSeriesParallelRoot(makeSeriesParallelRoot())
      setFrequencyRawValue(sample.frequencyRawValue)
      setFrequencyUnitId(sample.frequencyUnitId)
      setSourceVoltageRawValue(sample.sourceVoltageRawValue)
      setSourceVoltageUnitId(sample.sourceVoltageUnitId)
      setGuidedComponents(
        sample.components.map((component) =>
          makeGuidedComponent(
            component.kind,
            component.valueMode,
            component.rawValue,
            component.unitId,
          ),
        ),
      )
      setGuidedResult(null)
    })
  }

  function loadSeriesParallelSample(sampleId: string) {
    const sample = seriesParallelSamples.find((entry) => entry.id === sampleId)
    if (!sample) {
      return
    }

    const nextDefaultPart = makeGuidedSymbolPart('Part A')

    startTransition(() => {
      setMode('guided')
      setGuidedWorkflow('series-parallel-builder')
      setGuidedMathResult(null)
      setGuidedResult(null)
      setParallelResult(null)
      setSymbolParts([nextDefaultPart])
      setSelectedSymbolPartId(nextDefaultPart.id)
      setSeriesParallelGoal(sample.goal)
      setFrequencyRawValue(sample.frequencyRawValue)
      setFrequencyUnitId(sample.frequencyUnitId)
      setSourceVoltageRawValue(sample.sourceVoltageRawValue)
      setSourceVoltageUnitId(sample.sourceVoltageUnitId)
      setSeriesParallelRoot(cloneSeriesParallelGroup(sample.root))
      setSeriesParallelResult(null)
    })
  }

  return (
    <div className="shell">
      <AppHeader
        mode={mode}
        resolvedTheme={resolvedTheme}
        themeMode={themeMode}
        onLoadGuidedSample={loadGuidedSample}
        onLoadSeriesParallelSample={loadSeriesParallelSample}
        onModeChange={setMode}
        onThemeChange={setThemeMode}
      />

      {mode === 'guided' ? (
        <GuidedWorkspace
          frequencyRawValue={frequencyRawValue}
          frequencyUnitId={frequencyUnitId}
          guidedComponents={guidedComponents}
          guidedGoal={guidedGoal}
          guidedMathGoalId={guidedMathGoalId}
          guidedMathResult={guidedMathResult}
          guidedMathRows={guidedMathRows}
          guidedResult={guidedResult}
          guidedWorkflow={guidedWorkflow}
          parallelComponents={parallelComponents}
          parallelGoal={parallelGoal}
          parallelResult={parallelResult}
          selectedMathGoal={selectedMathGoal}
          selectedSymbolPartId={selectedSymbolPartId}
          seriesParallelGoal={seriesParallelGoal}
          seriesParallelResult={seriesParallelResult}
          seriesParallelRoot={seriesParallelRoot}
          sourceVoltageRawValue={sourceVoltageRawValue}
          sourceVoltageUnitId={sourceVoltageUnitId}
          symbolParts={symbolParts}
          symbolTopology={symbolTopology}
          onAddGuidedComponent={addGuidedComponent}
          onAddParallelComponent={addParallelComponent}
          onAddSeriesParallelComponent={addSeriesParallelComponentTo}
          onAddSeriesParallelGroup={addSeriesParallelGroupTo}
          onAddSymbolPart={addSymbolPart}
          onAddSymbolRow={addSymbolRow}
          onFrequencyRawValueChange={setFrequencyRawValue}
          onFrequencyUnitIdChange={setFrequencyUnitId}
          onGuidedGoalChange={setGuidedGoal}
          onGuidedMathGoalChange={changeGuidedMathGoal}
          onGuidedWorkflowChange={setGuidedWorkflow}
          onOpenChapter17BuilderFromGoal={openChapter17BuilderFromGoal}
          onParallelGoalChange={setParallelGoal}
          onRemoveGuidedComponent={removeGuidedComponent}
          onRemoveParallelComponent={removeParallelComponent}
          onRemoveSeriesParallelNode={removeSeriesParallelTreeNode}
          onRemoveSymbolPart={removeSymbolPart}
          onRemoveSymbolRow={removeSymbolRow}
          onResetSeriesParallelBuilder={resetSeriesParallelBuilder}
          onSelectSymbolPart={setSelectedSymbolPartId}
          onSeriesParallelGoalChange={setSeriesParallelGoal}
          onSolveGuidedMath={solveGuidedMathMode}
          onSolveGuidedMode={solveGuidedMode}
          onSolveParallelMode={solveParallelMode}
          onSolveSeriesParallelMode={solveSeriesParallelMode}
          onSolveSymbolMode={solveSymbolMode}
          onSourceVoltageRawValueChange={setSourceVoltageRawValue}
          onSourceVoltageUnitIdChange={setSourceVoltageUnitId}
          onSymbolTopologyChange={changeSymbolTopology}
          onUpdateGuidedComponent={updateGuidedComponent}
          onUpdateGuidedMathRow={updateGuidedMathRow}
          onUpdateParallelComponent={updateParallelComponent}
          onUpdateSeriesParallelNode={updateSeriesParallelNodeById}
          onUpdateSymbolRow={updateSymbolRow}
          onLoadSeriesParallelSample={loadSeriesParallelSample}
        />
      ) : (
        <FormulaWorkspace
          formulaResult={formulaResult}
          rows={rows}
          target={target}
          onAddFormulaRow={addFormulaRow}
          onRemoveFormulaRow={removeFormulaRow}
          onSolveFormula={solveFormulaMode}
          onTargetChange={setTarget}
          onUpdateFormulaRow={updateFormulaRow}
        />
      )}
    </div>
  )
}

export default App
