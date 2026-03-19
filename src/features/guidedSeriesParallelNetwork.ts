import {
  addComplex,
  complex,
  divideComplex,
  magnitude,
  multiplyComplex,
  phase,
  scalar,
} from '../core/complex'
import { formatQuantityInBaseUnit } from '../core/format'
import { quantityMap } from '../core/quantities'
import { solveCircuitProblem } from '../core/solver'
import type { ComplexValue, QuantityId, ScalarValue } from '../core/types'
import { parseAndNormalizeValue } from '../core/units'
import type { GuidedComponentKind, GuidedValueMode } from './guidedSeriesImpedance'

const EPSILON = 1e-9

export type GuidedSeriesParallelGoal =
  | 'series-parallel-impedance'
  | 'series-parallel-source-current'
  | 'series-parallel-real-power'
  | 'series-parallel-branch-voltage'
  | 'series-parallel-branch-current'

export type GuidedSeriesParallelTopology = 'series' | 'parallel'

export interface GuidedSeriesParallelComponentNode {
  id: string
  type: 'component'
  label: string
  kind: GuidedComponentKind
  valueMode: GuidedValueMode
  rawValue: string
  unitId: string
}

export interface GuidedSeriesParallelGroupNode {
  id: string
  type: 'group'
  label: string
  topology: GuidedSeriesParallelTopology
  children: GuidedSeriesParallelNode[]
}

export type GuidedSeriesParallelNode =
  | GuidedSeriesParallelComponentNode
  | GuidedSeriesParallelGroupNode

export interface GuidedSeriesParallelInput {
  goal?: GuidedSeriesParallelGoal
  frequencyRawValue: string
  frequencyUnitId: string
  sourceVoltageRawValue?: string
  sourceVoltageUnitId?: string
  selectedNodeId?: string
  root: GuidedSeriesParallelGroupNode
}

export interface GuidedSeriesParallelReductionStep {
  id: string
  label: string
  topology: GuidedSeriesParallelTopology
  childLabels: string[]
  rectangular: ComplexValue
}

export interface GuidedSeriesParallelNodeSummary {
  id: string
  label: string
  kind: 'component' | 'group'
  topology?: GuidedSeriesParallelTopology
  impedance: ComplexValue
  voltagePhasor?: ComplexValue
  currentPhasor?: ComplexValue
}

export interface GuidedSeriesParallelOutput {
  label: string
  quantityId: QuantityId
  value: ComplexValue | ScalarValue
  secondaryText?: string
}

export interface GuidedSeriesParallelSolved {
  status: 'solved'
  goal: GuidedSeriesParallelGoal
  output: GuidedSeriesParallelOutput
  reference: {
    totalImpedance: ComplexValue
    totalImpedanceMagnitude: ScalarValue
    phaseAngle: ScalarValue
    sourceCurrent?: ScalarValue
    sourceCurrentPhasor?: ComplexValue
    realPower?: ScalarValue
    selectedNode?: GuidedSeriesParallelNodeSummary
  }
  reductions: GuidedSeriesParallelReductionStep[]
  nodeSummaries: GuidedSeriesParallelNodeSummary[]
}

export interface GuidedSeriesParallelInvalid {
  status: 'invalid'
  message: string
}

export type GuidedSeriesParallelResult =
  | GuidedSeriesParallelSolved
  | GuidedSeriesParallelInvalid

interface EvaluatedNode {
  id: string
  label: string
  type: 'component' | 'group'
  topology?: GuidedSeriesParallelTopology
  impedance: ComplexValue
  children: EvaluatedNode[]
}

export function makeSeriesParallelGroup(
  topology: GuidedSeriesParallelTopology = 'series',
  label?: string,
): GuidedSeriesParallelGroupNode {
  return {
    id: crypto.randomUUID(),
    type: 'group',
    label: label ?? (topology === 'series' ? 'Series group' : 'Parallel group'),
    topology,
    children: [makeSeriesParallelComponent()],
  }
}

export function makeSeriesParallelComponent(
  kind: GuidedComponentKind = 'resistor',
  valueMode = defaultValueModeForKind(kind),
): GuidedSeriesParallelComponentNode {
  return {
    id: crypto.randomUUID(),
    type: 'component',
    label: '',
    kind,
    valueMode,
    rawValue: '',
    unitId: defaultUnitForValueMode(valueMode),
  }
}

export function addSeriesParallelChild(
  root: GuidedSeriesParallelGroupNode,
  parentId: string,
  child: GuidedSeriesParallelNode,
): GuidedSeriesParallelGroupNode {
  return mapNetworkTree(root, (node) => {
    if (node.type === 'group' && node.id === parentId) {
      return {
        ...node,
        children: [...node.children, child],
      }
    }

    return node
  })
}

export function updateSeriesParallelNode(
  root: GuidedSeriesParallelGroupNode,
  nodeId: string,
  updates:
    | Partial<Pick<GuidedSeriesParallelComponentNode, 'label' | 'rawValue' | 'unitId'>>
    | Partial<
        Pick<
          GuidedSeriesParallelComponentNode,
          'label' | 'kind' | 'valueMode' | 'rawValue' | 'unitId'
        >
      >
    | Partial<Pick<GuidedSeriesParallelGroupNode, 'label' | 'topology'>>,
): GuidedSeriesParallelGroupNode {
  return mapNetworkTree(root, (node) => {
    if (node.id !== nodeId) {
      return node
    }

    if (node.type === 'component') {
      const componentUpdates = updates as Partial<GuidedSeriesParallelComponentNode>
      if (componentUpdates.kind) {
        const nextValueMode = defaultValueModeForKind(componentUpdates.kind)
        return {
          ...node,
          kind: componentUpdates.kind,
          valueMode: nextValueMode,
          unitId: defaultUnitForValueMode(nextValueMode),
          rawValue: '',
          label: componentUpdates.label ?? node.label,
        }
      }

      if (componentUpdates.valueMode) {
        return {
          ...node,
          valueMode: componentUpdates.valueMode,
          unitId: defaultUnitForValueMode(componentUpdates.valueMode),
          rawValue: '',
          label: componentUpdates.label ?? node.label,
        }
      }

      return { ...node, ...componentUpdates }
    }

    const groupUpdates = updates as Partial<GuidedSeriesParallelGroupNode>
    return { ...node, ...groupUpdates }
  })
}

export function removeSeriesParallelNode(
  root: GuidedSeriesParallelGroupNode,
  nodeId: string,
): GuidedSeriesParallelGroupNode {
  return removeNode(root, nodeId) ?? root
}

export function solveGuidedSeriesParallelNetwork(
  input: GuidedSeriesParallelInput,
): GuidedSeriesParallelResult {
  const goal = input.goal ?? 'series-parallel-impedance'

  if (goalNeedsSourceVoltage(goal) && !input.sourceVoltageRawValue?.trim()) {
    return {
      status: 'invalid',
      message: 'This mixed-network goal needs the source voltage. Enter the source magnitude before solving.',
    }
  }

  const requiresFrequency = networkNeedsFrequency(input.root)
  if (requiresFrequency && !input.frequencyRawValue.trim()) {
    return {
      status: 'invalid',
      message:
        'Frequency is required when any inductor is entered in henrys or any capacitor is entered in farads.',
    }
  }

  const sourceVoltage = parseSourceVoltage(
    input.sourceVoltageRawValue ?? '',
    input.sourceVoltageUnitId ?? 'v',
  )
  if (sourceVoltage.error) {
    return {
      status: 'invalid',
      message: sourceVoltage.error,
    }
  }

  const evaluated = evaluateNode(input.root, input.frequencyRawValue, input.frequencyUnitId)
  if (isInvalidEvaluation(evaluated)) {
    return evaluated
  }

  const totalImpedanceMagnitude = scalar(magnitude(evaluated.impedance))
  if (Math.abs(totalImpedanceMagnitude.value) <= EPSILON) {
    return {
      status: 'invalid',
      message: 'The reduced total impedance is zero, so the network cannot be solved safely.',
    }
  }

  const phaseAngle = scalar(phase(evaluated.impedance))
  const reductions = collectReductionSteps(evaluated)
  const reference: GuidedSeriesParallelSolved['reference'] = {
    totalImpedance: evaluated.impedance,
    totalImpedanceMagnitude,
    phaseAngle,
  }

  let nodeSummaries: GuidedSeriesParallelNodeSummary[] = []
  if (sourceVoltage.value) {
    const sourcePhasor = complex(sourceVoltage.value.value, 0)
    const sourceCurrentPhasor = divideComplex(sourcePhasor, evaluated.impedance)
    const sourceCurrent = scalar(magnitude(sourceCurrentPhasor))
    const realPower = scalar(
      sourceVoltage.value.value * sourceCurrent.value * Math.cos(reference.phaseAngle.value),
    )

    reference.sourceCurrent = sourceCurrent
    reference.sourceCurrentPhasor = sourceCurrentPhasor
    reference.realPower = realPower

    nodeSummaries = summarizeNode(evaluated, sourcePhasor, sourceCurrentPhasor)
  }

  if (goalNeedsTargetNode(goal)) {
    if (!input.selectedNodeId?.trim()) {
      return {
        status: 'invalid',
        message: 'Choose the branch or reduced block you want before solving this mixed-network target.',
      }
    }

    if (input.selectedNodeId === input.root.id) {
      return {
        status: 'invalid',
        message: 'Pick a branch or reduced subnetwork, not the overall root network, for this target.',
      }
    }

    const selectedNode = nodeSummaries.find((summary) => summary.id === input.selectedNodeId)
    if (!selectedNode) {
      return {
        status: 'invalid',
        message: 'The selected branch target is no longer present in the current network tree. Pick it again and re-solve.',
      }
    }

    reference.selectedNode = selectedNode
  }

  const output = pickOutput(goal, reference)

  return {
    status: 'solved',
    goal,
    output,
    reference,
    reductions,
    nodeSummaries,
  }
}

function pickOutput(
  goal: GuidedSeriesParallelGoal,
  reference: GuidedSeriesParallelSolved['reference'],
): GuidedSeriesParallelOutput {
  switch (goal) {
    case 'series-parallel-source-current':
      return {
        label: 'Source current',
        quantityId: 'current',
        value: reference.sourceCurrent ?? scalar(0),
        secondaryText: reference.sourceCurrentPhasor
          ? `Current phasor: ${formatQuantityInBaseUnit('phasorCurrent', reference.sourceCurrentPhasor)}`
          : undefined,
      }
    case 'series-parallel-real-power':
      return {
        label: 'Real power delivered',
        quantityId: 'realPower',
        value: reference.realPower ?? scalar(0),
        secondaryText: `Computed from source voltage, source current, and the network phase angle.`,
      }
    case 'series-parallel-branch-voltage':
      return {
        label: reference.selectedNode
          ? `Voltage at ${reference.selectedNode.label}`
          : 'Selected branch voltage',
        quantityId: 'branchVoltagePhasor',
        value: reference.selectedNode?.voltagePhasor ?? complex(0, 0),
        secondaryText: reference.selectedNode
          ? `Target impedance: ${formatQuantityInBaseUnit('impedanceComplex', reference.selectedNode.impedance)}`
          : undefined,
      }
    case 'series-parallel-branch-current':
      return {
        label: reference.selectedNode
          ? `Current through ${reference.selectedNode.label}`
          : 'Selected branch current',
        quantityId: 'phasorCurrent',
        value: reference.selectedNode?.currentPhasor ?? complex(0, 0),
        secondaryText: reference.selectedNode
          ? `Target impedance: ${formatQuantityInBaseUnit('impedanceComplex', reference.selectedNode.impedance)}`
          : undefined,
      }
    default:
      return {
        label: 'Total impedance',
        quantityId: 'impedanceComplex',
        value: reference.totalImpedance,
        secondaryText:
          `Polar form: ${formatQuantityInBaseUnit('impedanceMagnitude', reference.totalImpedanceMagnitude)} angle ${formatQuantityInBaseUnit('phaseAngle', reference.phaseAngle)}`,
      }
  }
}

function evaluateNode(
  node: GuidedSeriesParallelNode,
  frequencyRawValue: string,
  frequencyUnitId: string,
): EvaluatedNode | GuidedSeriesParallelInvalid {
  if (node.type === 'component') {
    return evaluateComponent(node, frequencyRawValue, frequencyUnitId)
  }

  const children = node.children.filter((child) => hasAnyValue(child))
  if (children.length === 0) {
    return {
      status: 'invalid',
      message: `${node.label || 'This group'} needs at least one child before solving.`,
    }
  }

  const evaluatedChildren: EvaluatedNode[] = []
  for (const child of children) {
    const evaluatedChild = evaluateNode(child, frequencyRawValue, frequencyUnitId)
    if (isInvalidEvaluation(evaluatedChild)) {
      return evaluatedChild
    }

    evaluatedChildren.push(evaluatedChild)
  }

  const impedance =
    node.topology === 'series'
      ? evaluatedChildren.reduce((total, child) => addComplex(total, child.impedance), complex(0, 0))
      : reduceParallelImpedance(evaluatedChildren)

  if (!impedance) {
    return {
      status: 'invalid',
      message: `${node.label || 'This group'} includes a zero-ohm branch that cannot be reduced in parallel safely.`,
    }
  }

  return {
    id: node.id,
    label: node.label.trim() || defaultGroupLabel(node.topology),
    type: 'group',
    topology: node.topology,
    impedance,
    children: evaluatedChildren,
  }
}

function evaluateComponent(
  node: GuidedSeriesParallelComponentNode,
  frequencyRawValue: string,
  frequencyUnitId: string,
): EvaluatedNode | GuidedSeriesParallelInvalid {
  const label = node.label.trim() || defaultComponentLabel(node.kind)

  if (node.kind === 'resistor') {
    const parsed = parseAndNormalizeValue(quantityMap.resistance, node.rawValue, node.unitId)
    if (!parsed.value || parsed.error || parsed.value.kind !== 'scalar') {
      return invalidFor(label, parsed.error ?? 'Enter a valid resistance value.')
    }

    return makeComponentNode(node, label, complex(parsed.value.value, 0))
  }

  if (node.kind === 'inductor' && node.valueMode === 'reactance') {
    const parsed = parseAndNormalizeValue(quantityMap.inductiveReactance, node.rawValue, node.unitId)
    if (!parsed.value || parsed.error || parsed.value.kind !== 'scalar') {
      return invalidFor(label, parsed.error ?? 'Enter a valid inductive reactance value.')
    }

    return makeComponentNode(node, label, complex(0, parsed.value.value))
  }

  if (node.kind === 'capacitor' && node.valueMode === 'reactance') {
    const parsed = parseAndNormalizeValue(quantityMap.capacitiveReactance, node.rawValue, node.unitId)
    if (!parsed.value || parsed.error || parsed.value.kind !== 'scalar') {
      return invalidFor(label, parsed.error ?? 'Enter a valid capacitive reactance value.')
    }

    return makeComponentNode(node, label, complex(0, -parsed.value.value))
  }

  if (node.kind === 'inductor' && node.valueMode === 'inductance') {
    const reactanceSolve = solveCircuitProblem('inductiveReactance', [
      { quantityId: 'frequency', rawValue: frequencyRawValue, unitId: frequencyUnitId },
      { quantityId: 'inductance', rawValue: node.rawValue, unitId: node.unitId },
    ])

    if (reactanceSolve.status !== 'solved' || reactanceSolve.value.kind !== 'scalar') {
      return invalidFor(label, 'The inductor value could not be converted into reactance.')
    }

    return makeComponentNode(node, label, complex(0, reactanceSolve.value.value))
  }

  if (node.kind === 'capacitor' && node.valueMode === 'capacitance') {
    const reactanceSolve = solveCircuitProblem('capacitiveReactance', [
      { quantityId: 'frequency', rawValue: frequencyRawValue, unitId: frequencyUnitId },
      { quantityId: 'capacitance', rawValue: node.rawValue, unitId: node.unitId },
    ])

    if (reactanceSolve.status !== 'solved' || reactanceSolve.value.kind !== 'scalar') {
      return invalidFor(label, 'The capacitor value could not be converted into reactance.')
    }

    return makeComponentNode(node, label, complex(0, -reactanceSolve.value.value))
  }

  return invalidFor(label, 'This component type is not supported in mixed-network mode yet.')
}

function makeComponentNode(
  node: GuidedSeriesParallelComponentNode,
  label: string,
  impedance: ComplexValue,
): EvaluatedNode {
  return {
    id: node.id,
    label,
    type: 'component',
    impedance,
    children: [],
  }
}

function reduceParallelImpedance(children: EvaluatedNode[]): ComplexValue | undefined {
  let totalAdmittance = complex(0, 0)

  for (const child of children) {
    if (Math.abs(child.impedance.real) <= EPSILON && Math.abs(child.impedance.imag) <= EPSILON) {
      return undefined
    }

    totalAdmittance = addComplex(totalAdmittance, divideComplex(complex(1, 0), child.impedance))
  }

  return divideComplex(complex(1, 0), totalAdmittance)
}

function collectReductionSteps(node: EvaluatedNode): GuidedSeriesParallelReductionStep[] {
  if (node.type !== 'group') {
    return []
  }

  return [
    ...node.children.flatMap((child) => collectReductionSteps(child)),
    {
      id: node.id,
      label: node.label,
      topology: node.topology ?? 'series',
      childLabels: node.children.map((child) => child.label),
      rectangular: node.impedance,
    },
  ]
}

function summarizeNode(
  node: EvaluatedNode,
  voltagePhasor: ComplexValue,
  currentPhasor: ComplexValue,
): GuidedSeriesParallelNodeSummary[] {
  const summary: GuidedSeriesParallelNodeSummary = {
    id: node.id,
    label: node.label,
    kind: node.type,
    topology: node.topology,
    impedance: node.impedance,
    voltagePhasor,
    currentPhasor,
  }

  if (node.type === 'component') {
    return [summary]
  }

  const childSummaries =
    node.topology === 'series'
      ? node.children.flatMap((child) =>
          summarizeNode(child, multiplyComplex(currentPhasor, child.impedance), currentPhasor),
        )
      : node.children.flatMap((child) =>
          summarizeNode(child, voltagePhasor, divideComplex(voltagePhasor, child.impedance)),
        )

  return [summary, ...childSummaries]
}

function parseSourceVoltage(rawValue: string, unitId: string) {
  if (rawValue.trim().length === 0) {
    return {
      value: undefined as ScalarValue | undefined,
      error: undefined as string | undefined,
    }
  }

  const parsed = parseAndNormalizeValue(quantityMap.voltage, rawValue, unitId)
  if (!parsed.value || parsed.error || parsed.value.kind !== 'scalar') {
    return {
      value: undefined,
      error: parsed.error ?? 'Enter a valid source voltage value.',
    }
  }

  return { value: parsed.value, error: undefined }
}

function isInvalidEvaluation(
  value: EvaluatedNode | GuidedSeriesParallelInvalid,
): value is GuidedSeriesParallelInvalid {
  return 'status' in value
}

function mapNetworkTree(
  node: GuidedSeriesParallelGroupNode,
  updater: (node: GuidedSeriesParallelNode) => GuidedSeriesParallelNode,
): GuidedSeriesParallelGroupNode {
  const nextChildren = node.children.map((child) =>
    child.type === 'group' ? mapNetworkTree(child, updater) : updater(child),
  )
  return updater({ ...node, children: nextChildren }) as GuidedSeriesParallelGroupNode
}

function removeNode(
  node: GuidedSeriesParallelGroupNode,
  nodeId: string,
): GuidedSeriesParallelGroupNode | undefined {
  const nextChildren = node.children
    .filter((child) => child.id !== nodeId)
    .map((child) => (child.type === 'group' ? removeNode(child, nodeId) : child))
    .filter(Boolean) as GuidedSeriesParallelNode[]

  return {
    ...node,
    children: nextChildren.length > 0 ? nextChildren : [makeSeriesParallelComponent()],
  }
}

function networkNeedsFrequency(node: GuidedSeriesParallelNode): boolean {
  if (node.type === 'component') {
    return (
      (node.kind === 'inductor' && node.valueMode === 'inductance') ||
      (node.kind === 'capacitor' && node.valueMode === 'capacitance')
    )
  }

  return node.children.some((child) => networkNeedsFrequency(child))
}

function hasAnyValue(node: GuidedSeriesParallelNode): boolean {
  if (node.type === 'component') {
    return node.rawValue.trim().length > 0
  }

  return node.children.some((child) => hasAnyValue(child))
}

function goalNeedsSourceVoltage(goal: GuidedSeriesParallelGoal): boolean {
  return (
    goal === 'series-parallel-source-current' ||
    goal === 'series-parallel-real-power' ||
    goal === 'series-parallel-branch-voltage' ||
    goal === 'series-parallel-branch-current'
  )
}

function goalNeedsTargetNode(goal: GuidedSeriesParallelGoal): boolean {
  return goal === 'series-parallel-branch-voltage' || goal === 'series-parallel-branch-current'
}

function invalidFor(label: string, message: string): GuidedSeriesParallelInvalid {
  return {
    status: 'invalid',
    message: `${label}: ${message}`,
  }
}

function defaultComponentLabel(kind: GuidedComponentKind): string {
  return kind.charAt(0).toUpperCase() + kind.slice(1)
}

function defaultGroupLabel(topology: GuidedSeriesParallelTopology): string {
  return topology === 'series' ? 'Series group' : 'Parallel group'
}

function defaultValueModeForKind(kind: GuidedComponentKind): GuidedValueMode {
  if (kind === 'resistor') {
    return 'resistance'
  }

  return 'reactance'
}

function defaultUnitForValueMode(valueMode: GuidedValueMode) {
  switch (valueMode) {
    case 'inductance':
      return 'mh'
    case 'capacitance':
      return 'uf'
    default:
      return 'ohm'
  }
}
