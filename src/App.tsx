import { startTransition, useState } from 'react'
import { quantityMap, solveCircuitProblem, type QuantityId, type SolveResult } from './core'
import {
  solveGuidedParallelCircuit,
  type GuidedParallelCircuitResult,
  type GuidedParallelGoal,
} from './features/guidedParallelCircuit'
import {
  solveGuidedSeriesImpedance,
  type GuidedComponentInput,
  type GuidedComponentKind,
  type GuidedSeriesGoal,
  type GuidedSeriesImpedanceResult,
} from './features/guidedSeriesImpedance'
import {
  makeGuidedSymbolRow,
  solveGuidedSymbolProblem,
  type GuidedSymbolProblemResult,
  type GuidedSymbolRow,
  type GuidedSymbolTopology,
} from './features/guidedSymbolProblem'
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
  type GuidedMathResult,
} from './features/guidedMathGoals'
import AppHeader from './features/appShell/AppHeader'
import AppModeSwitch from './features/appShell/AppModeSwitch'
import FormulaWorkspace from './features/appShell/FormulaWorkspace'
import GuidedWorkspace from './features/appShell/GuidedWorkspace'
import ReferenceLibraryPanel from './features/appShell/ReferenceLibraryPanel'
import {
  cloneSeriesParallelGroup,
  defaultGuidedMathGoal,
  defaultUnitForGuided,
  defaultValueModeForKind,
  guidedSamples,
  makeFormulaRow,
  makeGuidedComponent,
  makeGuidedMathRow,
  makeSeriesParallelRoot,
  seriesParallelSamples,
  type AppMode,
  type GuidedMathRow,
  type GuidedSeriesParallelNodeUpdates,
  type GuidedWorkflow,
  type KnownRow,
} from './features/appShell/appShell'
import { useThemeMode } from './features/appShell/useThemeMode'

function App() {
  const { themeMode, resolvedTheme, setThemeMode } = useThemeMode()
  const [mode, setMode] = useState<AppMode>('guided')
  const [guidedWorkflow, setGuidedWorkflow] = useState<GuidedWorkflow>('chapter-goal')
  const [guidedGoal, setGuidedGoal] = useState<GuidedSeriesGoal>('series-impedance')
  const [parallelGoal, setParallelGoal] = useState<GuidedParallelGoal>('parallel-admittance')
  const [seriesParallelGoal, setSeriesParallelGoal] =
    useState<GuidedSeriesParallelGoal>('series-parallel-impedance')
  const [guidedMathGoalId, setGuidedMathGoalId] = useState(defaultGuidedMathGoal.id)
  const [target, setTarget] = useState<QuantityId>('inductiveReactance')
  const [rows, setRows] = useState<KnownRow[]>([makeFormulaRow('frequency')])
  const [formulaResult, setFormulaResult] = useState<SolveResult | null>(null)
  const [guidedMathRows, setGuidedMathRows] = useState<GuidedMathRow[]>(
    makeGuidedMathRows(defaultGuidedMathGoal).map((row) =>
      makeGuidedMathRow(row.quantityId, row.rawValue, row.unitId, true),
    ),
  )
  const [guidedMathResult, setGuidedMathResult] = useState<GuidedMathResult | null>(null)
  const [frequencyRawValue, setFrequencyRawValue] = useState('')
  const [frequencyUnitId, setFrequencyUnitId] = useState('hz')
  const [sourceVoltageRawValue, setSourceVoltageRawValue] = useState('')
  const [sourceVoltageUnitId, setSourceVoltageUnitId] = useState('v')
  const [sourceCurrentPhasorRawValue, setSourceCurrentPhasorRawValue] = useState('')
  const [sourceCurrentPhasorUnitId, setSourceCurrentPhasorUnitId] = useState('a')
  const [guidedComponents, setGuidedComponents] = useState<GuidedComponentInput[]>([
    makeGuidedComponent('resistor'),
  ])
  const [guidedResult, setGuidedResult] = useState<GuidedSeriesImpedanceResult | null>(null)
  const [parallelResult, setParallelResult] = useState<GuidedParallelCircuitResult | null>(null)
  const [seriesParallelRoot, setSeriesParallelRoot] = useState<GuidedSeriesParallelGroupNode>(() =>
    makeSeriesParallelRoot(),
  )
  const [seriesParallelResult, setSeriesParallelResult] =
    useState<GuidedSeriesParallelResult | null>(null)
  const [seriesParallelTargetNodeId, setSeriesParallelTargetNodeId] = useState('')
  const [symbolTopology, setSymbolTopology] = useState<GuidedSymbolTopology>('series')
  const [symbolRows, setSymbolRows] = useState<GuidedSymbolRow[]>([makeGuidedSymbolRow()])
  const [symbolResult, setSymbolResult] = useState<GuidedSymbolProblemResult | null>(null)

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
          rows
            .filter((row) => row.rawValue.trim().length > 0)
            .map((row) => ({
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
          makeGuidedMathRow(row.quantityId, row.rawValue, row.unitId, true),
        ),
      )
      setGuidedMathResult(null)
    })
  }

  function addGuidedMathRow() {
    setGuidedMathRows((current) => [...current, makeGuidedMathRow('voltage', '', 'v', false)])
  }

  function updateGuidedMathRow(rowId: string, updates: Partial<GuidedMathRow>) {
    setGuidedMathRows((current) =>
      current.map((row) => {
        if (row.id !== rowId) {
          return row
        }

        if (updates.quantityId) {
          return {
            ...row,
            quantityId: updates.quantityId,
            unitId: quantityMap[updates.quantityId].defaultUnitId,
            rawValue: '',
          }
        }

        return { ...row, ...updates }
      }),
    )
  }

  function removeGuidedMathRow(rowId: string) {
    setGuidedMathRows((current) => current.filter((row) => row.id !== rowId || row.isRequired))
  }

  function solveGuidedMathMode() {
    startTransition(() => {
      setGuidedMathResult(
        solveGuidedMathGoal(
          selectedMathGoal,
          guidedMathRows
            .filter((row) => row.isRequired || row.rawValue.trim().length > 0)
            .map((row) => ({
              quantityId: row.quantityId,
              rawValue: row.rawValue,
              unitId: row.unitId,
            })),
        ),
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

  function solveParallelMode() {
    startTransition(() => {
      setParallelResult(
        solveGuidedParallelCircuit({
          goal: parallelGoal,
          frequencyRawValue,
          frequencyUnitId,
          sourceVoltageRawValue,
          sourceVoltageUnitId,
          sourceCurrentPhasorRawValue,
          sourceCurrentPhasorUnitId,
          components: guidedComponents,
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
      setSeriesParallelTargetNodeId('')
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
          selectedNodeId: seriesParallelTargetNodeId,
          root: seriesParallelRoot,
        }),
      )
    })
  }

  function addGuidedSymbolRow() {
    setSymbolRows((current) => [...current, makeGuidedSymbolRow()])
  }

  function updateGuidedSymbolRow(rowId: string, updates: Partial<GuidedSymbolRow>) {
    setSymbolRows((current) =>
      current.map((row) => {
        if (row.id !== rowId) {
          return row
        }

        if (updates.symbolId) {
          const nextRow = makeGuidedSymbolRow(updates.symbolId)
          return {
            ...row,
            symbolId: updates.symbolId,
            rawValue: '',
            unitId: nextRow.unitId,
          }
        }

        return { ...row, ...updates }
      }),
    )
  }

  function removeGuidedSymbolRow(rowId: string) {
    setSymbolRows((current) => (current.length === 1 ? current : current.filter((row) => row.id !== rowId)))
  }

  function solveSymbolMode() {
    startTransition(() => {
      setSymbolResult(
        solveGuidedSymbolProblem({
          topology: symbolTopology,
          seriesGoal: guidedGoal,
          parallelGoal,
          rows: symbolRows,
        }),
      )
    })
  }

  function loadGuidedSample(sampleId: string) {
    const sample = guidedSamples.find((entry) => entry.id === sampleId)
    if (!sample) {
      return
    }

    startTransition(() => {
      setMode('guided')
      setGuidedWorkflow('series-builder')
      setGuidedMathResult(null)
      setParallelResult(null)
      setSeriesParallelResult(null)
      setSymbolResult(null)
      setSeriesParallelRoot(makeSeriesParallelRoot())
      setFrequencyRawValue(sample.frequencyRawValue)
      setFrequencyUnitId(sample.frequencyUnitId)
      setSourceVoltageRawValue(sample.sourceVoltageRawValue)
      setSourceVoltageUnitId(sample.sourceVoltageUnitId)
      setSourceCurrentPhasorRawValue('')
      setSourceCurrentPhasorUnitId('a')
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

    startTransition(() => {
      setMode('guided')
      setGuidedWorkflow('series-parallel-builder')
      setGuidedMathResult(null)
      setGuidedResult(null)
      setParallelResult(null)
      setSymbolResult(null)
      setSeriesParallelGoal(sample.goal)
      setFrequencyRawValue(sample.frequencyRawValue)
      setFrequencyUnitId(sample.frequencyUnitId)
      setSourceVoltageRawValue(sample.sourceVoltageRawValue)
      setSourceVoltageUnitId(sample.sourceVoltageUnitId)
      setSourceCurrentPhasorRawValue('')
      setSourceCurrentPhasorUnitId('a')
      setSeriesParallelRoot(cloneSeriesParallelGroup(sample.root))
      setSeriesParallelTargetNodeId('')
      setSeriesParallelResult(null)
    })
  }

  return (
    <div className="shell">
      <AppHeader
        resolvedTheme={resolvedTheme}
        themeMode={themeMode}
        onLoadGuidedSample={loadGuidedSample}
        onLoadSeriesParallelSample={loadSeriesParallelSample}
        onThemeChange={setThemeMode}
      />

      <ReferenceLibraryPanel />
      <AppModeSwitch mode={mode} onModeChange={setMode} />

      {mode === 'guided' ? (
        <GuidedWorkspace
          frequencyRawValue={frequencyRawValue}
          frequencyUnitId={frequencyUnitId}
          guidedComponents={guidedComponents}
          guidedGoal={guidedGoal}
          guidedMathGoalId={guidedMathGoalId}
          guidedMathResult={guidedMathResult}
          guidedMathRows={guidedMathRows}
          parallelGoal={parallelGoal}
          parallelResult={parallelResult}
          guidedResult={guidedResult}
          guidedWorkflow={guidedWorkflow}
          selectedMathGoal={selectedMathGoal}
          seriesParallelGoal={seriesParallelGoal}
          seriesParallelResult={seriesParallelResult}
          seriesParallelRoot={seriesParallelRoot}
          seriesParallelTargetNodeId={seriesParallelTargetNodeId}
          sourceCurrentPhasorRawValue={sourceCurrentPhasorRawValue}
          sourceCurrentPhasorUnitId={sourceCurrentPhasorUnitId}
          sourceVoltageRawValue={sourceVoltageRawValue}
          sourceVoltageUnitId={sourceVoltageUnitId}
          onAddGuidedMathRow={addGuidedMathRow}
          onAddGuidedComponent={addGuidedComponent}
          onAddGuidedSymbolRow={addGuidedSymbolRow}
          onAddSeriesParallelComponent={addSeriesParallelComponentTo}
          onAddSeriesParallelGroup={addSeriesParallelGroupTo}
          onFrequencyRawValueChange={setFrequencyRawValue}
          onFrequencyUnitIdChange={setFrequencyUnitId}
          onGuidedGoalChange={setGuidedGoal}
          onGuidedMathGoalChange={changeGuidedMathGoal}
          onGuidedWorkflowChange={setGuidedWorkflow}
          onParallelGoalChange={setParallelGoal}
          onRemoveGuidedMathRow={removeGuidedMathRow}
          onRemoveGuidedComponent={removeGuidedComponent}
          onRemoveGuidedSymbolRow={removeGuidedSymbolRow}
          onRemoveSeriesParallelNode={removeSeriesParallelTreeNode}
          onResetSeriesParallelBuilder={resetSeriesParallelBuilder}
          onSeriesParallelGoalChange={setSeriesParallelGoal}
          onSeriesParallelTargetNodeIdChange={setSeriesParallelTargetNodeId}
          onSolveGuidedMath={solveGuidedMathMode}
          onSolveGuidedMode={solveGuidedMode}
          onSolveParallelMode={solveParallelMode}
          onSolveSymbolMode={solveSymbolMode}
          onSolveSeriesParallelMode={solveSeriesParallelMode}
          onSourceCurrentPhasorRawValueChange={setSourceCurrentPhasorRawValue}
          onSourceCurrentPhasorUnitIdChange={setSourceCurrentPhasorUnitId}
          onSourceVoltageRawValueChange={setSourceVoltageRawValue}
          onSourceVoltageUnitIdChange={setSourceVoltageUnitId}
          onUpdateGuidedComponent={updateGuidedComponent}
          onUpdateGuidedMathRow={updateGuidedMathRow}
          onUpdateGuidedSymbolRow={updateGuidedSymbolRow}
          onUpdateSeriesParallelNode={updateSeriesParallelNodeById}
          onLoadSeriesParallelSample={loadSeriesParallelSample}
          symbolResult={symbolResult}
          symbolRows={symbolRows}
          symbolTopology={symbolTopology}
          onSymbolTopologyChange={setSymbolTopology}
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
