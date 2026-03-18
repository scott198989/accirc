import { quantityDefinitions, quantityMap, type QuantityId, type SolverInputRow } from '../../core'
import { guidedMathGoals as allGuidedMathGoals } from '../guidedMathGoals'
import {
  updateSeriesParallelNode,
  makeSeriesParallelGroup,
  type GuidedSeriesParallelGoal,
  type GuidedSeriesParallelGroupNode,
  type GuidedSeriesParallelTopology,
} from '../guidedSeriesParallelNetwork'
import type {
  GuidedComponentInput,
  GuidedComponentKind,
  GuidedSeriesGoal,
  GuidedValueMode,
} from '../guidedSeriesImpedance'

export type AppMode = 'guided' | 'formula'

export type GuidedWorkflow = 'chapter-goal' | 'series-builder' | 'series-parallel-builder'

export type GuidedSeriesParallelNodeUpdates = Parameters<typeof updateSeriesParallelNode>[2]
export type ThemeMode = 'light' | 'dark' | 'system'

export interface KnownRow extends SolverInputRow {
  id: string
}

export interface GuidedMathRow extends SolverInputRow {
  id: string
  isRequired: boolean
}

export interface GuidedGoalOption {
  value: GuidedSeriesGoal
  label: string
  description: string
}

export interface SeriesParallelGoalOption {
  value: GuidedSeriesParallelGoal
  label: string
  description: string
}

export interface GuidedWorkflowOption {
  value: GuidedWorkflow
  label: string
}

export interface GuidedSample {
  id: string
  title: string
  frequencyRawValue: string
  frequencyUnitId: string
  sourceVoltageRawValue: string
  sourceVoltageUnitId: string
  components: Array<Omit<GuidedComponentInput, 'id'>>
}

export interface SeriesParallelSample {
  id: string
  title: string
  goal: GuidedSeriesParallelGoal
  frequencyRawValue: string
  frequencyUnitId: string
  sourceVoltageRawValue: string
  sourceVoltageUnitId: string
  root: GuidedSeriesParallelGroupNode
}

const quizMathGoalIds = new Set([
  'inductive-reactance-from-frequency-and-inductance',
  'capacitive-reactance-from-frequency-and-capacitance',
  'power-factor-from-phase-angle',
  'series-impedance-from-r-and-xl',
  'series-impedance-from-r-and-xc',
  'series-impedance-from-r-xl-xc',
  'series-impedance-magnitude-from-r-f-l',
  'series-impedance-magnitude-from-r-f-c',
  'net-reactance-from-frequency-inductance-and-capacitance',
  'inductor-impedance-from-frequency-and-inductance',
  'capacitor-impedance-from-frequency-and-capacitance',
  'voltage-phasor-from-magnitude-and-angle',
  'impedance-from-power-voltage-and-power-factor',
  'impedance-from-source-voltage-and-current-phasors',
  'equivalent-parallel-resistance-from-series-r-xl',
  'equivalent-parallel-reactance-from-series-r-xl',
  'parallel-impedance-from-resistor-and-coil',
  'capacitive-susceptance-from-frequency-and-capacitance',
])

const quizMathQuantityIds = new Set<QuantityId>([
  'frequency',
  'voltage',
  'current',
  'resistance',
  'coilResistance',
  'parallelResistance',
  'inductance',
  'capacitance',
  'inductiveReactance',
  'capacitiveReactance',
  'capacitiveSusceptance',
  'netReactance',
  'impedanceMagnitude',
  'powerFactor',
  'realPower',
  'phaseAngle',
  'polarAngle',
  'phasorCurrent',
  'phasorSourceVoltage',
  'inductiveImpedance',
  'capacitiveImpedance',
  'impedanceComplex',
  'equivalentParallelResistance',
  'equivalentParallelInductiveReactance',
])

export const quantityGroups = groupByCategory(
  quantityDefinitions.filter((definition) => quizMathQuantityIds.has(definition.id)),
)
export const guidedMathGoals = allGuidedMathGoals.filter((goal) => quizMathGoalIds.has(goal.id))
const guidedMathGoalById = Object.fromEntries(guidedMathGoals.map((goal) => [goal.id, goal])) as Record<
  string,
  (typeof guidedMathGoals)[number]
>

const scopedGoalGroups = [
  {
    key: 'reactance-and-basics',
    label: 'Reactance and phasor basics',
    goalIds: [
      'inductive-reactance-from-frequency-and-inductance',
      'capacitive-reactance-from-frequency-and-capacitance',
      'inductor-impedance-from-frequency-and-inductance',
      'capacitor-impedance-from-frequency-and-capacitance',
      'voltage-phasor-from-magnitude-and-angle',
    ],
  },
  {
    key: 'series-ac-direct',
    label: 'Direct series impedance questions',
    goalIds: [
      'series-impedance-from-r-and-xl',
      'series-impedance-from-r-and-xc',
      'series-impedance-from-r-xl-xc',
      'series-impedance-magnitude-from-r-f-l',
      'series-impedance-magnitude-from-r-f-c',
      'net-reactance-from-frequency-inductance-and-capacitance',
    ],
  },
  {
    key: 'power-and-relationships',
    label: 'Power and source relationships',
    goalIds: [
      'power-factor-from-phase-angle',
      'impedance-from-power-voltage-and-power-factor',
      'impedance-from-source-voltage-and-current-phasors',
    ],
  },
  {
    key: 'equivalent-networks',
    label: 'Equivalent networks',
    goalIds: [
      'equivalent-parallel-resistance-from-series-r-xl',
      'equivalent-parallel-reactance-from-series-r-xl',
      'parallel-impedance-from-resistor-and-coil',
    ],
  },
  {
    key: 'parallel-ac',
    label: 'Parallel AC and admittance',
    goalIds: ['capacitive-susceptance-from-frequency-and-capacitance'],
  },
]

export const guidedMathGoalGroups = scopedGoalGroups
  .map((group) => ({
    key: group.key,
    label: group.label,
    goals: group.goalIds
      .map((goalId) => guidedMathGoalById[goalId])
      .filter(Boolean),
  }))
  .filter((group) => group.goals.length > 0)
export const defaultGuidedMathGoal = guidedMathGoalGroups[0]?.goals[0] ?? guidedMathGoals[0]
export const THEME_STORAGE_KEY = 'accirc-theme-mode'

export const guidedWorkflowOptions: GuidedWorkflowOption[] = [
  { value: 'chapter-goal', label: 'Quiz math goal' },
  { value: 'series-builder', label: 'Series circuit from diagram' },
  { value: 'series-parallel-builder', label: 'Mixed series-parallel network' },
]

export const guidedGoalOptions: GuidedGoalOption[] = [
  {
    value: 'series-impedance',
    label: 'Total impedance of a series circuit',
    description: 'Best for problems asking for Z in rectangular and polar form.',
  },
  {
    value: 'series-source-current',
    label: 'Source current of a series circuit',
    description: 'Uses the source voltage and total series impedance to find the circuit current.',
  },
  {
    value: 'series-resistor-voltage',
    label: 'Voltage across total series resistance',
    description: 'Finds the phasor voltage dropped across the full resistive portion of the series path.',
  },
  {
    value: 'series-inductor-voltage',
    label: 'Voltage across total series inductance',
    description: 'Finds the phasor voltage across the combined inductive reactance.',
  },
  {
    value: 'series-capacitor-voltage',
    label: 'Voltage across total series capacitance',
    description: 'Finds the phasor voltage across the combined capacitive reactance.',
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
    value: 'series-real-power',
    label: 'Real power of a series circuit',
    description: 'Uses the source voltage, derived current, and total series resistance to find real power.',
  },
]

export const seriesParallelGoalOptions: SeriesParallelGoalOption[] = [
  {
    value: 'series-parallel-impedance',
    label: 'Total impedance of a mixed series-parallel network',
    description: 'Reduces the entered mixed network into one total impedance.',
  },
  {
    value: 'series-parallel-source-current',
    label: 'Source current of a mixed series-parallel network',
    description: 'Uses the source voltage and reduced total impedance to find the source current.',
  },
  {
    value: 'series-parallel-real-power',
    label: 'Real power of a mixed series-parallel network',
    description: 'Uses the reduced network, source current, and phase angle to find real power.',
  },
]

export const guidedSamples: GuidedSample[] = [
  {
    id: 'figure-15-2',
    title: 'Figure 15.2 series RL',
    frequencyRawValue: '',
    frequencyUnitId: 'hz',
    sourceVoltageRawValue: '',
    sourceVoltageUnitId: 'v',
    components: [
      { kind: 'resistor', valueMode: 'resistance', rawValue: '50', unitId: 'ohm' },
      { kind: 'inductor', valueMode: 'reactance', rawValue: '20', unitId: 'ohm' },
    ],
  },
  {
    id: 'figure-15-6',
    title: 'Figure 15.6 series RL',
    frequencyRawValue: '',
    frequencyUnitId: 'hz',
    sourceVoltageRawValue: '',
    sourceVoltageUnitId: 'v',
    components: [
      { kind: 'resistor', valueMode: 'resistance', rawValue: '100', unitId: 'ohm' },
      { kind: 'inductor', valueMode: 'reactance', rawValue: '50', unitId: 'ohm' },
    ],
  },
  {
    id: 'figure-15-3',
    title: 'Figure 15.3 series RLC',
    frequencyRawValue: '',
    frequencyUnitId: 'hz',
    sourceVoltageRawValue: '',
    sourceVoltageUnitId: 'v',
    components: [
      { kind: 'resistor', valueMode: 'resistance', rawValue: '10', unitId: 'ohm' },
      { kind: 'inductor', valueMode: 'reactance', rawValue: '20', unitId: 'ohm' },
      { kind: 'capacitor', valueMode: 'reactance', rawValue: '15', unitId: 'ohm' },
    ],
  },
]

export const seriesParallelSamples: SeriesParallelSample[] = [
  {
    id: 'question-18',
    title: 'Question 18 resistor || coil',
    goal: 'series-parallel-impedance',
    frequencyRawValue: '500',
    frequencyUnitId: 'hz',
    sourceVoltageRawValue: '',
    sourceVoltageUnitId: 'v',
    root: {
      id: 'sample-q18-root',
      type: 'group',
      label: 'ZT',
      topology: 'parallel',
      children: [
        {
          id: 'sample-q18-r',
          type: 'component',
          label: '4700 ohm branch',
          kind: 'resistor',
          valueMode: 'resistance',
          rawValue: '4700',
          unitId: 'ohm',
        },
        {
          id: 'sample-q18-coil-branch',
          type: 'group',
          label: 'Coil branch',
          topology: 'series',
          children: [
            {
              id: 'sample-q18-coil-r',
              type: 'component',
              label: 'Coil resistance',
              kind: 'resistor',
              valueMode: 'resistance',
              rawValue: '45',
              unitId: 'ohm',
            },
            {
              id: 'sample-q18-coil-l',
              type: 'component',
              label: 'Coil inductance',
              kind: 'inductor',
              valueMode: 'inductance',
              rawValue: '100',
              unitId: 'mh',
            },
          ],
        },
      ],
    },
  },
  {
    id: 'chapter-17-problem-1',
    title: 'Chapter 17 Problem 1 source current',
    goal: 'series-parallel-source-current',
    frequencyRawValue: '',
    frequencyUnitId: 'hz',
    sourceVoltageRawValue: '14',
    sourceVoltageUnitId: 'v',
    root: {
      id: 'sample-ch17-p1-root',
      type: 'group',
      label: 'ZT',
      topology: 'series',
      children: [
        {
          id: 'sample-ch17-p1-xl1',
          type: 'component',
          label: 'XL1',
          kind: 'inductor',
          valueMode: 'reactance',
          rawValue: '4',
          unitId: 'ohm',
        },
        {
          id: 'sample-ch17-p1-parallel',
          type: 'group',
          label: 'Parallel block',
          topology: 'parallel',
          children: [
            {
              id: 'sample-ch17-p1-xc',
              type: 'component',
              label: 'XC',
              kind: 'capacitor',
              valueMode: 'reactance',
              rawValue: '8',
              unitId: 'ohm',
            },
            {
              id: 'sample-ch17-p1-r',
              type: 'component',
              label: 'R',
              kind: 'resistor',
              valueMode: 'resistance',
              rawValue: '12',
              unitId: 'ohm',
            },
          ],
        },
      ],
    },
  },
]

export function makeFormulaRow(
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

export function makeGuidedMathRow(
  quantityId: QuantityId,
  rawValue = '',
  unitId = quantityMap[quantityId].defaultUnitId,
  isRequired = true,
): GuidedMathRow {
  return {
    id: crypto.randomUUID(),
    quantityId,
    rawValue,
    unitId,
    isRequired,
  }
}

export function makeGuidedComponent(
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

export function defaultValueModeForKind(kind: GuidedComponentKind): GuidedValueMode {
  if (kind === 'resistor') {
    return 'resistance'
  }

  return 'reactance'
}

export function defaultUnitForGuided(valueMode: GuidedValueMode): string {
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

export function valueModesForKind(
  kind: GuidedComponentKind,
): Array<{ value: GuidedValueMode; label: string }> {
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

export function unitsForGuided(valueMode: GuidedValueMode) {
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

export function placeholderForGuided(valueMode: GuidedValueMode): string {
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

export function makeSeriesParallelRoot(): GuidedSeriesParallelGroupNode {
  return makeSeriesParallelGroup('series', 'ZT')
}

export function cloneSeriesParallelGroup(
  node: GuidedSeriesParallelGroupNode,
): GuidedSeriesParallelGroupNode {
  return {
    ...node,
    children: node.children.map((child) =>
      child.type === 'group' ? cloneSeriesParallelGroup(child) : { ...child },
    ),
  }
}

export function topologyLabel(topology: GuidedSeriesParallelTopology): string {
  return topology === 'series' ? 'Series' : 'Parallel'
}

export function defaultSeriesParallelComponentLabel(kind: GuidedComponentKind): string {
  return kind.charAt(0).toUpperCase() + kind.slice(1)
}

export function defaultSeriesParallelGroupLabel(topology: GuidedSeriesParallelTopology): string {
  return topology === 'series' ? 'Series group' : 'Parallel group'
}

export function toScalar(value: number) {
  return { kind: 'scalar' as const, value }
}

function groupByCategory(definitions = quantityDefinitions) {
  const grouped = new Map<string, typeof quantityDefinitions>()

  for (const definition of definitions) {
    const current = grouped.get(definition.category) ?? []
    current.push(definition)
    grouped.set(definition.category, current)
  }

  return Array.from(grouped.entries())
}
