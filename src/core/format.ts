import { pickBestUnit, toDisplayValue } from './units'
import { quantityMap } from './quantities'
import type { QuantityId, QuantityValue, UnitDefinition } from './types'

export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) {
    return 'NaN'
  }

  if (value === 0) {
    return '0'
  }

  const absValue = Math.abs(value)
  if (absValue >= 1e4 || absValue < 1e-3) {
    return value.toExponential(4).replace(/\.?0+e/, 'e')
  }

  return value.toFixed(6).replace(/\.?0+$/, '')
}

export function formatValue(value: QuantityValue): string {
  switch (value.kind) {
    case 'scalar':
      return formatNumber(value.value)
    case 'complex': {
      const real = formatNumber(value.real)
      const imagMagnitude = formatNumber(Math.abs(value.imag))
      const sign = value.imag >= 0 ? '+' : '-'
      return `${real} ${sign} ${imagMagnitude}j`
    }
    case 'scalarList':
      return value.values.map((entry) => formatNumber(entry)).join(', ')
  }
}

export function formatQuantityValue(
  value: QuantityValue,
  unit: UnitDefinition,
): string {
  const displayValue = toDisplayValue(value, unit)
  const suffix = unit.symbol ? ` ${unit.symbol}` : ''
  return `${formatValue(displayValue)}${suffix}`
}

export function formatQuantityInBaseUnit(quantityId: QuantityId, value: QuantityValue): string {
  const quantity = quantityMap[quantityId]
  const baseUnit =
    quantity.units.find((entry) => entry.id === quantity.defaultUnitId) ?? quantity.units[0]
  return formatQuantityValue(value, baseUnit)
}

export function formatQuantitySmart(quantityId: QuantityId, value: QuantityValue): string {
  const quantity = quantityMap[quantityId]
  const chosenUnit = pickBestUnit(quantity, value)
  return formatQuantityValue(value, chosenUnit)
}

export function formatKnownAssignment(quantityId: QuantityId, value: QuantityValue): string {
  const quantity = quantityMap[quantityId]
  return `${quantity.symbol} = ${formatQuantityInBaseUnit(quantityId, value)}`
}
