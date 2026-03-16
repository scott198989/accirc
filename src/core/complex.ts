import type { ComplexValue, QuantityValue, ScalarListValue, ScalarValue } from './types'

const POLAR_SPLITTER = /[∠@]/

export function scalar(value: number): ScalarValue {
  return { kind: 'scalar', value }
}

export function complex(real: number, imag = 0): ComplexValue {
  return { kind: 'complex', real, imag }
}

export function scalarList(values: number[]): ScalarListValue {
  return { kind: 'scalarList', values }
}

export function multiplyValue(value: QuantityValue, factor: number): QuantityValue {
  switch (value.kind) {
    case 'scalar':
      return scalar(value.value * factor)
    case 'complex':
      return complex(value.real * factor, value.imag * factor)
    case 'scalarList':
      return scalarList(value.values.map((entry) => entry * factor))
  }
}

export function asScalar(value: QuantityValue, quantityLabel: string): number {
  if (value.kind !== 'scalar') {
    throw new Error(`${quantityLabel} must be a scalar value.`)
  }

  return value.value
}

export function asComplex(value: QuantityValue, quantityLabel: string): ComplexValue {
  if (value.kind !== 'complex') {
    throw new Error(`${quantityLabel} must be a complex value.`)
  }

  return value
}

export function asScalarList(value: QuantityValue, quantityLabel: string): number[] {
  if (value.kind !== 'scalarList') {
    throw new Error(`${quantityLabel} must be a comma-separated list.`)
  }

  return value.values
}

export function addComplex(left: ComplexValue, right: ComplexValue): ComplexValue {
  return complex(left.real + right.real, left.imag + right.imag)
}

export function subtractComplex(left: ComplexValue, right: ComplexValue): ComplexValue {
  return complex(left.real - right.real, left.imag - right.imag)
}

export function multiplyComplex(left: ComplexValue, right: ComplexValue): ComplexValue {
  return complex(
    left.real * right.real - left.imag * right.imag,
    left.real * right.imag + left.imag * right.real,
  )
}

export function divideComplex(left: ComplexValue, right: ComplexValue): ComplexValue {
  const denominator = right.real ** 2 + right.imag ** 2
  if (denominator === 0) {
    throw new Error('Complex division by zero is not allowed.')
  }

  return complex(
    (left.real * right.real + left.imag * right.imag) / denominator,
    (left.imag * right.real - left.real * right.imag) / denominator,
  )
}

export function magnitude(value: ComplexValue): number {
  return Math.hypot(value.real, value.imag)
}

export function phase(value: ComplexValue): number {
  return Math.atan2(value.imag, value.real)
}

export function fromPolar(magnitudeValue: number, angleRadians: number): ComplexValue {
  return complex(
    magnitudeValue * Math.cos(angleRadians),
    magnitudeValue * Math.sin(angleRadians),
  )
}

export function multiplyByPositiveImaginary(value: ComplexValue): ComplexValue {
  return complex(-value.imag, value.real)
}

export function multiplyByNegativeImaginary(value: ComplexValue): ComplexValue {
  return complex(value.imag, -value.real)
}

export function parseScalar(raw: string): number | undefined {
  const trimmed = raw.trim()
  if (trimmed.length === 0) {
    return undefined
  }

  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : undefined
}

export function parseScalarList(raw: string): number[] | undefined {
  const parts = raw
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)

  if (parts.length === 0) {
    return undefined
  }

  const values = parts.map((part) => Number(part))
  return values.every((value) => Number.isFinite(value)) ? values : undefined
}

export function parseComplex(raw: string): ComplexValue | undefined {
  const normalized = raw.trim().replace(/\s+/g, '').replace(/i/gi, 'j')
  if (normalized.length === 0) {
    return undefined
  }

  if (POLAR_SPLITTER.test(normalized)) {
    return parsePolarComplex(normalized)
  }

  if (!normalized.includes('j')) {
    const real = Number(normalized)
    return Number.isFinite(real) ? complex(real, 0) : undefined
  }

  if (!normalized.endsWith('j')) {
    return undefined
  }

  const body = normalized.slice(0, -1)
  const splitIndex = findImaginarySplit(body)
  if (splitIndex === -1) {
    const imagOnly = parseImaginaryToken(body)
    return imagOnly === undefined ? undefined : complex(0, imagOnly)
  }

  const real = Number(body.slice(0, splitIndex))
  const imag = parseImaginaryToken(body.slice(splitIndex))
  if (!Number.isFinite(real) || imag === undefined) {
    return undefined
  }

  return complex(real, imag)
}

function parsePolarComplex(raw: string): ComplexValue | undefined {
  const [magnitudePart, anglePart] = raw.split(POLAR_SPLITTER)
  if (!magnitudePart || !anglePart) {
    return undefined
  }

  const magnitudeValue = Number(magnitudePart)
  if (!Number.isFinite(magnitudeValue)) {
    return undefined
  }

  const angleMatch = anglePart.match(/^([+-]?\d*\.?\d+(?:e[+-]?\d+)?)(deg|rad|°)$/i)
  if (!angleMatch) {
    return undefined
  }

  const numericAngle = Number(angleMatch[1])
  if (!Number.isFinite(numericAngle)) {
    return undefined
  }

  const angleRadians =
    angleMatch[2].toLowerCase() === 'rad'
      ? numericAngle
      : (numericAngle * Math.PI) / 180

  return fromPolar(magnitudeValue, angleRadians)
}

function findImaginarySplit(body: string): number {
  for (let index = 1; index < body.length; index += 1) {
    const current = body[index]
    const previous = body[index - 1]
    if ((current === '+' || current === '-') && previous !== 'e' && previous !== 'E') {
      return index
    }
  }

  return -1
}

function parseImaginaryToken(token: string): number | undefined {
  if (token === '' || token === '+') {
    return 1
  }

  if (token === '-') {
    return -1
  }

  const parsed = Number(token)
  return Number.isFinite(parsed) ? parsed : undefined
}
