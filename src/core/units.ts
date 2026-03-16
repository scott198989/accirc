import {
  multiplyValue,
  parseComplex,
  parseScalar,
  parseScalarList,
  scalar,
  scalarList,
} from './complex'
import type { QuantityDefinition, QuantityValue, UnitDefinition } from './types'

export function unit(id: string, label: string, symbol: string, factor: number): UnitDefinition {
  return { id, label, symbol, factor }
}

export function parseAndNormalizeValue(
  quantity: QuantityDefinition,
  rawValue: string,
  unitId: string,
): { value?: QuantityValue; error?: string } {
  const chosenUnit = quantity.units.find((candidate) => candidate.id === unitId)
  if (!chosenUnit) {
    return { error: `Unknown unit "${unitId}" for ${quantity.label}.` }
  }

  let parsedValue: QuantityValue | undefined

  if (quantity.kind === 'scalar') {
    const scalarValue = parseScalar(rawValue)
    parsedValue = scalarValue === undefined ? undefined : scalar(scalarValue)
  } else if (quantity.kind === 'complex') {
    parsedValue = parseComplex(rawValue)
  } else {
    const listValue = parseScalarList(rawValue)
    parsedValue = listValue === undefined ? undefined : scalarList(listValue)
  }

  if (!parsedValue) {
    return {
      error:
        quantity.kind === 'complex'
          ? `Enter ${quantity.label} as a rectangular value like 3+4j or a polar value like 5∠30deg.`
          : quantity.kind === 'scalarList'
            ? `Enter ${quantity.label} as a comma-separated list of numbers.`
            : `Enter a valid numeric value for ${quantity.label}.`,
    }
  }

  return { value: multiplyValue(parsedValue, chosenUnit.factor) }
}

export function toDisplayValue(value: QuantityValue, unit: UnitDefinition): QuantityValue {
  return multiplyValue(value, 1 / unit.factor)
}

export function pickBestUnit(quantity: QuantityDefinition, value: QuantityValue): UnitDefinition {
  const candidates = quantity.units
  const defaultUnit = candidates.find((entry) => entry.id === quantity.defaultUnitId) ?? candidates[0]
  if (!defaultUnit) {
    throw new Error(`No units configured for ${quantity.label}.`)
  }

  const magnitude = measureMagnitude(value)
  if (magnitude === 0) {
    return defaultUnit
  }

  const preferred = candidates.find((candidate) => {
    const normalized = magnitude / candidate.factor
    return normalized >= 1 && normalized < 1000
  })

  return preferred ?? defaultUnit
}

function measureMagnitude(value: QuantityValue): number {
  switch (value.kind) {
    case 'scalar':
      return Math.abs(value.value)
    case 'complex':
      return Math.hypot(value.real, value.imag)
    case 'scalarList':
      return Math.max(...value.values.map((entry) => Math.abs(entry)), 0)
  }
}

export const UNIT_SETS = {
  unitless: [unit('unitless', 'Unitless', '', 1)],
  frequency: [
    unit('hz', 'Hertz', 'Hz', 1),
    unit('khz', 'Kilohertz', 'kHz', 1e3),
    unit('mhz', 'Megahertz', 'MHz', 1e6),
  ],
  time: [
    unit('s', 'Seconds', 's', 1),
    unit('ms', 'Milliseconds', 'ms', 1e-3),
    unit('us', 'Microseconds', 'us', 1e-6),
  ],
  angle: [
    unit('rad', 'Radians', 'rad', 1),
    unit('deg', 'Degrees', 'deg', Math.PI / 180),
  ],
  angularFrequency: [
    unit('rad_per_s', 'Radians per second', 'rad/s', 1),
    unit('krad_per_s', 'Kil radians per second', 'krad/s', 1e3),
  ],
  voltage: [
    unit('v', 'Volts', 'V', 1),
    unit('mv', 'Millivolts', 'mV', 1e-3),
    unit('kv', 'Kilovolts', 'kV', 1e3),
  ],
  current: [
    unit('a', 'Amperes', 'A', 1),
    unit('ma', 'Milliamperes', 'mA', 1e-3),
    unit('ua', 'Microamperes', 'uA', 1e-6),
  ],
  admittance: [
    unit('s', 'Siemens', 'S', 1),
    unit('msiemens', 'Millisiemens', 'mS', 1e-3),
    unit('usiemens', 'Microsiemens', 'uS', 1e-6),
  ],
  resistance: [
    unit('ohm', 'Ohms', 'Ohm', 1),
    unit('kohm', 'Kilo-ohms', 'kOhm', 1e3),
    unit('mohm', 'Mega-ohms', 'MOhm', 1e6),
  ],
  inductance: [
    unit('h', 'Henrys', 'H', 1),
    unit('mh', 'Millihenrys', 'mH', 1e-3),
    unit('uh', 'Microhenrys', 'uH', 1e-6),
  ],
  capacitance: [
    unit('f', 'Farads', 'F', 1),
    unit('mf', 'Millifarads', 'mF', 1e-3),
    unit('uf', 'Microfarads', 'uF', 1e-6),
    unit('nf', 'Nanofarads', 'nF', 1e-9),
    unit('pf', 'Picofarads', 'pF', 1e-12),
  ],
  power: [
    unit('w', 'Watts', 'W', 1),
    unit('mw', 'Milliwatts', 'mW', 1e-3),
    unit('kw', 'Kilowatts', 'kW', 1e3),
  ],
  charge: [
    unit('c', 'Coulombs', 'C', 1),
    unit('mc', 'Millicoulombs', 'mC', 1e-3),
    unit('uc', 'Microcoulombs', 'uC', 1e-6),
    unit('nc', 'Nanocoulombs', 'nC', 1e-9),
  ],
  voltageRate: [
    unit('v_per_s', 'Volts per second', 'V/s', 1),
    unit('v_per_ms', 'Volts per millisecond', 'V/ms', 1e3),
  ],
  currentRate: [
    unit('a_per_s', 'Amperes per second', 'A/s', 1),
    unit('a_per_ms', 'Amperes per millisecond', 'A/ms', 1e3),
  ],
  fluxRate: [
    unit('wb_per_s', 'Webers per second', 'Wb/s', 1),
    unit('mwb_per_s', 'Milliwebers per second', 'mWb/s', 1e-3),
  ],
  length: [
    unit('m', 'Meters', 'm', 1),
    unit('cm', 'Centimeters', 'cm', 1e-2),
    unit('mm', 'Millimeters', 'mm', 1e-3),
    unit('in', 'Inches', 'in', 0.0254),
  ],
} as const
