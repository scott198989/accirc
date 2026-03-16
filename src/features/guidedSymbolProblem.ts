import { quantityMap } from '../core'
import {
  solveGuidedSeriesImpedance,
  type GuidedComponentInput,
  type GuidedComponentKind,
  type GuidedSeriesGoal,
  type GuidedSeriesImpedanceResult,
  type GuidedValueMode,
} from './guidedSeriesImpedance'
import {
  solveGuidedParallelCircuit,
  type GuidedParallelCircuitResult,
  type GuidedParallelGoal,
} from './guidedParallelCircuit'

export type GuidedSymbolTopology = 'series' | 'parallel'

type GuidedSymbolQuantityId =
  | 'frequency'
  | 'voltage'
  | 'resistance'
  | 'inductiveReactance'
  | 'capacitiveReactance'
  | 'inductance'
  | 'capacitance'

interface BaseGuidedSymbolDefinition {
  id: string
  label: string
  description: string
  quantityId: GuidedSymbolQuantityId
  preferredUnitId?: string
  placeholder?: string
}

interface ComponentGuidedSymbolDefinition extends BaseGuidedSymbolDefinition {
  kind: 'component'
  componentKind: GuidedComponentKind
  valueMode: GuidedValueMode
}

interface GlobalGuidedSymbolDefinition extends BaseGuidedSymbolDefinition {
  kind: 'frequency' | 'sourceVoltage'
}

export type GuidedSymbolDefinition =
  | ComponentGuidedSymbolDefinition
  | GlobalGuidedSymbolDefinition

export interface GuidedSymbolRow {
  id: string
  symbolId: string
  rawValue: string
  unitId: string
}

export type GuidedSymbolProblemResult =
  | {
      topology: 'series'
      result: GuidedSeriesImpedanceResult
    }
  | {
      topology: 'parallel'
      result: GuidedParallelCircuitResult
    }

export interface SolveGuidedSymbolProblemInput {
  topology: GuidedSymbolTopology
  seriesGoal: GuidedSeriesGoal
  parallelGoal: GuidedParallelGoal
  rows: GuidedSymbolRow[]
}

function makeRepeatedComponentSymbols(
  prefix: string,
  quantityId: GuidedSymbolQuantityId,
  componentKind: GuidedComponentKind,
  valueMode: GuidedValueMode,
  description: string,
  options?: {
    preferredUnitId?: string
    placeholder?: string
  },
  count = 6,
): GuidedSymbolDefinition[] {
  return Array.from({ length: count + 1 }, (_, index) => {
    const suffix = index === 0 ? '' : String(index)
    return {
      id: `${prefix.toLowerCase()}${suffix}`,
      label: `${prefix}${suffix}`,
      description,
      quantityId,
      kind: 'component',
      componentKind,
      valueMode,
      preferredUnitId: options?.preferredUnitId,
      placeholder: options?.placeholder,
    }
  })
}

export const guidedSymbolDefinitions: GuidedSymbolDefinition[] = [
  ...makeRepeatedComponentSymbols(
    'R',
    'resistance',
    'resistor',
    'resistance',
    'Resistance written directly in the problem statement.',
  ),
  ...makeRepeatedComponentSymbols(
    'XL',
    'inductiveReactance',
    'inductor',
    'reactance',
    'Inductive reactance written directly in the problem statement.',
  ),
  ...makeRepeatedComponentSymbols(
    'XC',
    'capacitiveReactance',
    'capacitor',
    'reactance',
    'Capacitive reactance written directly in the problem statement.',
  ),
  ...makeRepeatedComponentSymbols(
    'L',
    'inductance',
    'inductor',
    'inductance',
    'Inductance that the app will convert into XL when frequency is provided.',
    {
      preferredUnitId: 'mh',
      placeholder: '47',
    },
  ),
  ...makeRepeatedComponentSymbols(
    'C',
    'capacitance',
    'capacitor',
    'capacitance',
    'Capacitance that the app will convert into XC when frequency is provided.',
    {
      preferredUnitId: 'uf',
      placeholder: '0.1',
    },
  ),
  {
    id: 'f',
    label: 'f',
    description: 'Frequency for any L or C values that must be converted into reactance.',
    quantityId: 'frequency',
    kind: 'frequency',
  },
  {
    id: 'e',
    label: 'E',
    description: 'Source voltage magnitude.',
    quantityId: 'voltage',
    kind: 'sourceVoltage',
  },
  {
    id: 'v',
    label: 'V',
    description: 'Source voltage magnitude when the problem labels the source as V.',
    quantityId: 'voltage',
    kind: 'sourceVoltage',
  },
]

export const guidedSymbolDefinitionMap = Object.fromEntries(
  guidedSymbolDefinitions.map((definition) => [definition.id, definition]),
) as Record<string, GuidedSymbolDefinition>

export const guidedSymbolGroups = [
  {
    key: 'resistance',
    label: 'Resistance symbols',
    symbols: guidedSymbolDefinitions.filter((definition) => definition.label.startsWith('R')),
  },
  {
    key: 'inductive-reactance',
    label: 'Inductive reactance symbols',
    symbols: guidedSymbolDefinitions.filter((definition) => definition.label.startsWith('XL')),
  },
  {
    key: 'capacitive-reactance',
    label: 'Capacitive reactance symbols',
    symbols: guidedSymbolDefinitions.filter((definition) => definition.label.startsWith('XC')),
  },
  {
    key: 'inductance',
    label: 'Inductance symbols',
    symbols: guidedSymbolDefinitions.filter(
      (definition) => definition.label.startsWith('L') && !definition.label.startsWith('XL'),
    ),
  },
  {
    key: 'capacitance',
    label: 'Capacitance symbols',
    symbols: guidedSymbolDefinitions.filter(
      (definition) => definition.label.startsWith('C') && !definition.label.startsWith('XC'),
    ),
  },
  {
    key: 'global',
    label: 'Global symbols',
    symbols: guidedSymbolDefinitions.filter(
      (definition) => definition.kind === 'frequency' || definition.kind === 'sourceVoltage',
    ),
  },
]

export function makeGuidedSymbolRow(symbolId = guidedSymbolDefinitions[0].id): GuidedSymbolRow {
  return {
    id: crypto.randomUUID(),
    symbolId,
    rawValue: '',
    unitId: defaultUnitIdForGuidedSymbol(symbolId),
  }
}

export function unitOptionsForGuidedSymbol(symbolId: string) {
  const definition = guidedSymbolDefinitionMap[symbolId]
  return quantityMap[definition.quantityId].units
}

export function defaultUnitIdForGuidedSymbol(symbolId: string) {
  const definition = guidedSymbolDefinitionMap[symbolId]
  return definition.preferredUnitId ?? quantityMap[definition.quantityId].defaultUnitId
}

export function placeholderForGuidedSymbol(symbolId: string) {
  const definition = guidedSymbolDefinitionMap[symbolId]
  return definition.placeholder ?? quantityMap[definition.quantityId].placeholder
}

export function solveGuidedSymbolProblem(
  input: SolveGuidedSymbolProblemInput,
): GuidedSymbolProblemResult {
  let frequencyRawValue = ''
  let frequencyUnitId = quantityMap.frequency.defaultUnitId
  let sourceVoltageRawValue = ''
  let sourceVoltageUnitId = quantityMap.voltage.defaultUnitId

  const components: GuidedComponentInput[] = []

  for (const row of input.rows) {
    if (row.rawValue.trim().length === 0) {
      continue
    }

    const definition = guidedSymbolDefinitionMap[row.symbolId]
    if (!definition) {
      return invalidResult(input.topology, `Unknown problem symbol "${row.symbolId}".`)
    }

    if (definition.kind === 'frequency') {
      if (frequencyRawValue.trim().length > 0) {
        return invalidResult(
          input.topology,
          'Enter the frequency only once in variable mode. Use one f row for the shared frequency.',
        )
      }

      frequencyRawValue = row.rawValue
      frequencyUnitId = row.unitId
      continue
    }

    if (definition.kind === 'sourceVoltage') {
      if (sourceVoltageRawValue.trim().length > 0) {
        return invalidResult(
          input.topology,
          'Enter the source voltage only once in variable mode. Use one E or V row for the shared source value.',
        )
      }

      sourceVoltageRawValue = row.rawValue
      sourceVoltageUnitId = row.unitId
      continue
    }

    if (definition.kind !== 'component') {
      return invalidResult(input.topology, `The symbol ${definition.label} is not a component entry.`)
    }

    components.push({
      id: row.id,
      label: definition.label,
      kind: definition.componentKind,
      valueMode: definition.valueMode,
      rawValue: row.rawValue,
      unitId: row.unitId,
    })
  }

  if (input.topology === 'series') {
    return {
      topology: 'series',
      result: solveGuidedSeriesImpedance({
        goal: input.seriesGoal,
        frequencyRawValue,
        frequencyUnitId,
        sourceVoltageRawValue,
        sourceVoltageUnitId,
        components,
      }),
    }
  }

  return {
    topology: 'parallel',
    result: solveGuidedParallelCircuit({
      goal: input.parallelGoal,
      frequencyRawValue,
      frequencyUnitId,
      sourceVoltageRawValue,
      sourceVoltageUnitId,
      components,
    }),
  }
}

function invalidResult(topology: GuidedSymbolTopology, message: string): GuidedSymbolProblemResult {
  if (topology === 'series') {
    return {
      topology,
      result: {
        status: 'invalid',
        message,
      },
    }
  }

  return {
    topology,
    result: {
      status: 'invalid',
      message,
    },
  }
}
