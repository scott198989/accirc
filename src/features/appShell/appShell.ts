import { quantityDefinitions, quantityMap, type QuantityId, type SolverInputRow } from '../../core'
import { guidedMathGoalGroups, guidedMathGoals } from '../guidedMathGoals'
import {
  updateSeriesParallelNode,
  makeSeriesParallelGroup,
  type GuidedSeriesParallelGoal,
  type GuidedSeriesParallelGroupNode,
  type GuidedSeriesParallelTopology,
} from '../guidedSeriesParallelNetwork'
import {
  makeGuidedSymbolRow,
  type GuidedSymbolProblemResult,
  type GuidedSymbolRow,
} from '../guidedSymbolProblem'
import type {
  GuidedComponentInput,
  GuidedComponentKind,
  GuidedSeriesGoal,
  GuidedValueMode,
} from '../guidedSeriesImpedance'
import type { GuidedParallelGoal } from '../guidedParallelCircuit'

export type AppMode = 'guided' | 'formula'

export type GuidedWorkflow =
  | 'chapter-goal'
  | 'symbol-builder'
  | 'series-builder'
  | 'parallel-builder'
  | 'series-parallel-builder'

export type GuidedSeriesParallelNodeUpdates = Parameters<typeof updateSeriesParallelNode>[2]
export type ThemeMode = 'light' | 'dark' | 'system'

export interface KnownRow extends SolverInputRow {
  id: string
}

export interface GuidedMathRow extends SolverInputRow {
  id: string
}

export interface GuidedSymbolPart {
  id: string
  label: string
  rows: GuidedSymbolRow[]
  result: GuidedSymbolProblemResult | null
}

export interface GuidedGoalOption {
  value: GuidedSeriesGoal
  label: string
  description: string
}

export interface ParallelGoalOption {
  value: GuidedParallelGoal
  label: string
  description: string
}

export interface SeriesParallelGoalOption {
  value: GuidedSeriesParallelGoal
  label: string
  description: string
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

export const quantityGroups = groupByCategory()
export const defaultGuidedMathGoal = guidedMathGoalGroups[0]?.goals[0] ?? guidedMathGoals[0]
export const defaultGuidedSymbolPart = makeGuidedSymbolPart('Part A')
export const THEME_STORAGE_KEY = 'accirc-theme-mode'
export const chapter17GoalRedirectPrefix = 'chapter17:'

export const chapter17QuestionGoals: Array<{
  value: string
  goal: GuidedSeriesParallelGoal
  label: string
}> = [
  {
    value: `${chapter17GoalRedirectPrefix}series-parallel-impedance`,
    goal: 'series-parallel-impedance',
    label: 'Open the Chapter 17 builder for total impedance',
  },
  {
    value: `${chapter17GoalRedirectPrefix}series-parallel-source-current`,
    goal: 'series-parallel-source-current',
    label: 'Open the Chapter 17 builder for source current',
  },
  {
    value: `${chapter17GoalRedirectPrefix}series-parallel-real-power`,
    goal: 'series-parallel-real-power',
    label: 'Open the Chapter 17 builder for real power',
  },
]

export const guidedGoalOptions: GuidedGoalOption[] = [
  {
    value: 'series-impedance',
    label: 'Total impedance of a series circuit',
    description: 'Best for problems asking for Z in rectangular and polar form.',
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
    value: 'series-source-current',
    label: 'Source current in a series circuit',
    description: 'Needs the source voltage magnitude.',
  },
  {
    value: 'series-resistor-voltage',
    label: 'Voltage across the total series resistance',
    description: 'Needs the source voltage magnitude.',
  },
  {
    value: 'series-inductor-voltage',
    label: 'Voltage across the total series inductance',
    description: 'Needs the source voltage magnitude.',
  },
  {
    value: 'series-capacitor-voltage',
    label: 'Voltage across the total series capacitance',
    description: 'Needs the source voltage magnitude.',
  },
  {
    value: 'series-real-power',
    label: 'Real power delivered to a series circuit',
    description: 'Needs the source voltage magnitude.',
  },
]

export const parallelGoalOptions: ParallelGoalOption[] = [
  {
    value: 'parallel-admittance',
    label: 'Total admittance of a parallel circuit',
    description: 'Best for Chapter 16 problems asking for Y in rectangular and polar form.',
  },
  {
    value: 'parallel-admittance-angle',
    label: 'Admittance angle of a parallel circuit',
    description: 'Shows whether source current leads or lags the source voltage.',
  },
  {
    value: 'parallel-impedance',
    label: 'Total impedance of a parallel circuit',
    description: 'Converts the total admittance into total impedance.',
  },
  {
    value: 'parallel-source-current',
    label: 'Source current in a parallel circuit',
    description: 'Needs the source voltage magnitude.',
  },
  {
    value: 'parallel-power-factor',
    label: 'Power factor of a parallel circuit',
    description: 'Uses total conductance and admittance magnitude.',
  },
  {
    value: 'parallel-real-power',
    label: 'Real power delivered to a parallel circuit',
    description: 'Needs the source voltage magnitude.',
  },
  {
    value: 'parallel-resistor-current',
    label: 'Current through the total resistive branch',
    description: 'Needs the source voltage magnitude.',
  },
  {
    value: 'parallel-inductor-current',
    label: 'Current through the total inductive branch',
    description: 'Needs the source voltage magnitude.',
  },
  {
    value: 'parallel-capacitor-current',
    label: 'Current through the total capacitive branch',
    description: 'Needs the source voltage magnitude.',
  },
]

export const seriesParallelGoalOptions: SeriesParallelGoalOption[] = [
  {
    value: 'series-parallel-impedance',
    label: 'Total impedance of a series-parallel network',
    description: 'Reduces the full Chapter 17 network into one total impedance.',
  },
  {
    value: 'series-parallel-source-current',
    label: 'Source current in a series-parallel network',
    description: 'Needs the source voltage magnitude to compute the current phasor.',
  },
  {
    value: 'series-parallel-real-power',
    label: 'Real power delivered to a series-parallel network',
    description: 'Needs the source voltage magnitude to compute real power.',
  },
]

export const guidedSamples: GuidedSample[] = [
  {
    id: 'figure-a',
    title: 'Figure 15.86 (a)',
    frequencyRawValue: '',
    frequencyUnitId: 'hz',
    sourceVoltageRawValue: '',
    sourceVoltageUnitId: 'v',
    components: [
      { kind: 'resistor', valueMode: 'resistance', rawValue: '3', unitId: 'ohm' },
      { kind: 'inductor', valueMode: 'reactance', rawValue: '4', unitId: 'ohm' },
      { kind: 'capacitor', valueMode: 'reactance', rawValue: '5', unitId: 'ohm' },
    ],
  },
  {
    id: 'figure-b',
    title: 'Figure 15.86 (b)',
    frequencyRawValue: '',
    frequencyUnitId: 'hz',
    sourceVoltageRawValue: '',
    sourceVoltageUnitId: 'v',
    components: [
      { kind: 'resistor', valueMode: 'resistance', rawValue: '1', unitId: 'kohm' },
      { kind: 'inductor', valueMode: 'reactance', rawValue: '2', unitId: 'kohm' },
      { kind: 'inductor', valueMode: 'reactance', rawValue: '6', unitId: 'kohm' },
      { kind: 'capacitor', valueMode: 'reactance', rawValue: '4', unitId: 'kohm' },
    ],
  },
  {
    id: 'figure-c',
    title: 'Figure 15.86 (c)',
    frequencyRawValue: '1',
    frequencyUnitId: 'khz',
    sourceVoltageRawValue: '',
    sourceVoltageUnitId: 'v',
    components: [
      { kind: 'resistor', valueMode: 'resistance', rawValue: '470', unitId: 'ohm' },
      { kind: 'inductor', valueMode: 'inductance', rawValue: '47', unitId: 'mh' },
      { kind: 'inductor', valueMode: 'inductance', rawValue: '200', unitId: 'mh' },
      { kind: 'capacitor', valueMode: 'capacitance', rawValue: '0.1', unitId: 'uf' },
    ],
  },
]

export const seriesParallelSamples: SeriesParallelSample[] = [
  {
    id: 'figure-17-29',
    title: 'Figure 17.29',
    goal: 'series-parallel-source-current',
    frequencyRawValue: '',
    frequencyUnitId: 'hz',
    sourceVoltageRawValue: '14',
    sourceVoltageUnitId: 'v',
    root: {
      id: 'sample-17-29-root',
      type: 'group',
      label: 'ZT',
      topology: 'series',
      children: [
        {
          id: 'sample-17-29-xl',
          type: 'component',
          label: 'XL1',
          kind: 'inductor',
          valueMode: 'reactance',
          rawValue: '4',
          unitId: 'ohm',
        },
        {
          id: 'sample-17-29-parallel',
          type: 'group',
          label: 'Parallel block',
          topology: 'parallel',
          children: [
            {
              id: 'sample-17-29-xc',
              type: 'component',
              label: 'XC',
              kind: 'capacitor',
              valueMode: 'reactance',
              rawValue: '8',
              unitId: 'ohm',
            },
            {
              id: 'sample-17-29-r',
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
  {
    id: 'figure-17-35',
    title: 'Figure 17.35',
    goal: 'series-parallel-real-power',
    frequencyRawValue: '',
    frequencyUnitId: 'hz',
    sourceVoltageRawValue: '40',
    sourceVoltageUnitId: 'v',
    root: {
      id: 'sample-17-35-root',
      type: 'group',
      label: 'ZT',
      topology: 'parallel',
      children: [
        {
          id: 'sample-17-35-xc',
          type: 'component',
          label: 'XC',
          kind: 'capacitor',
          valueMode: 'reactance',
          rawValue: '60',
          unitId: 'ohm',
        },
        {
          id: 'sample-17-35-series',
          type: 'group',
          label: 'R1 with shunt branch',
          topology: 'series',
          children: [
            {
              id: 'sample-17-35-r1',
              type: 'component',
              label: 'R1',
              kind: 'resistor',
              valueMode: 'resistance',
              rawValue: '10',
              unitId: 'ohm',
            },
            {
              id: 'sample-17-35-parallel',
              type: 'group',
              label: 'R2 || XL',
              topology: 'parallel',
              children: [
                {
                  id: 'sample-17-35-r2',
                  type: 'component',
                  label: 'R2',
                  kind: 'resistor',
                  valueMode: 'resistance',
                  rawValue: '20',
                  unitId: 'ohm',
                },
                {
                  id: 'sample-17-35-xl',
                  type: 'component',
                  label: 'XL',
                  kind: 'inductor',
                  valueMode: 'reactance',
                  rawValue: '80',
                  unitId: 'ohm',
                },
              ],
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
): GuidedMathRow {
  return {
    id: crypto.randomUUID(),
    quantityId,
    rawValue,
    unitId,
  }
}

export function makeGuidedSymbolPart(label: string): GuidedSymbolPart {
  return {
    id: crypto.randomUUID(),
    label,
    rows: [makeGuidedSymbolRow('r')],
    result: null,
  }
}

export function nextGuidedSymbolPartLabel(index: number): string {
  const nextCode = 65 + index
  return nextCode <= 90 ? `Part ${String.fromCharCode(nextCode)}` : `Part ${index + 1}`
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

function groupByCategory() {
  const grouped = new Map<string, typeof quantityDefinitions>()

  for (const definition of quantityDefinitions) {
    const current = grouped.get(definition.category) ?? []
    current.push(definition)
    grouped.set(definition.category, current)
  }

  return Array.from(grouped.entries())
}
