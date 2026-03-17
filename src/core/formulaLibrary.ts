import {
  addComplex,
  asComplex,
  asScalar,
  asScalarList,
  complex,
  divideComplex,
  fromPolar,
  magnitude,
  multiplyByNegativeImaginary,
  multiplyByPositiveImaginary,
  multiplyComplex,
  scalar,
} from './complex'
import type { FormulaFamily, FormulaVariant, KnownValueMap, QuantityId } from './types'

const TAU = Math.PI * 2
const INCH_IN_METERS = 0.0254
const UH_IN_H = 1e-6
const EPSILON = 1e-9
const VACUUM_PERMITTIVITY = 8.85e-12
const COULOMB_CONSTANT = 9e9

function family(
  id: string,
  label: string,
  chapter: string,
  variants: Omit<FormulaVariant, 'familyId' | 'familyLabel' | 'chapter'>[],
): FormulaFamily {
  return {
    id,
    label,
    chapter,
    variants: variants.map((variant) => ({
      ...variant,
      familyId: id,
      familyLabel: label,
      chapter,
    })),
  }
}

function positive(value: number, label: string): string | undefined {
  return value > 0 ? undefined : `${label} must be greater than zero.`
}

function nonZero(value: number, label: string): string | undefined {
  return Math.abs(value) > EPSILON ? undefined : `${label} must not be zero.`
}

function validateAll(...messages: Array<string | undefined>): string | undefined {
  return messages.find(Boolean)
}

function getScalar(values: KnownValueMap, id: QuantityId): number {
  const value = values[id]
  if (!value) {
    throw new Error(`Missing scalar input ${id}.`)
  }

  return asScalar(value, id)
}

function getComplex(values: KnownValueMap, id: QuantityId) {
  const value = values[id]
  if (!value) {
    throw new Error(`Missing complex input ${id}.`)
  }

  return asComplex(value, id)
}

function getScalarList(values: KnownValueMap, id: QuantityId) {
  const value = values[id]
  if (!value) {
    throw new Error(`Missing list input ${id}.`)
  }

  return asScalarList(value, id)
}

export const formulaFamilies: FormulaFamily[] = [
  family('period-frequency', 'Frequency and period', '13', [
    {
      id: 'period-from-frequency',
      target: 'period',
      inputs: ['frequency'],
      displayFormula: 'T = 1 / f',
      description: 'Computes period from frequency.',
      priority: 7,
      validate: (values) => positive(getScalar(values, 'frequency'), 'Frequency'),
      compute: (values) => scalar(1 / getScalar(values, 'frequency')),
    },
    {
      id: 'frequency-from-period',
      target: 'frequency',
      inputs: ['period'],
      displayFormula: 'f = 1 / T',
      description: 'Computes frequency from period.',
      priority: 7,
      validate: (values) => positive(getScalar(values, 'period'), 'Period'),
      compute: (values) => scalar(1 / getScalar(values, 'period')),
    },
  ]),
  family('time-cycles', 'Cycles and elapsed time', '13', [
    {
      id: 'time-from-cycles-and-period',
      target: 'elapsedTime',
      inputs: ['cycleCount', 'period'],
      displayFormula: 't = N * T',
      description: 'Computes elapsed time from cycles and period.',
      priority: 6,
      compute: (values) => scalar(getScalar(values, 'cycleCount') * getScalar(values, 'period')),
    },
    {
      id: 'cycles-from-time-and-period',
      target: 'cycleCount',
      inputs: ['elapsedTime', 'period'],
      displayFormula: 'N = t / T',
      description: 'Computes cycles from elapsed time and period.',
      priority: 6,
      validate: (values) => positive(getScalar(values, 'period'), 'Period'),
      compute: (values) => scalar(getScalar(values, 'elapsedTime') / getScalar(values, 'period')),
    },
    {
      id: 'period-from-time-and-cycles',
      target: 'period',
      inputs: ['elapsedTime', 'cycleCount'],
      displayFormula: 'T = t / N',
      description: 'Computes period from elapsed time and cycles.',
      priority: 6,
      validate: (values) => nonZero(getScalar(values, 'cycleCount'), 'Cycle count'),
      compute: (values) => scalar(getScalar(values, 'elapsedTime') / getScalar(values, 'cycleCount')),
    },
  ]),
  family('angle-conversion', 'Degree and radian conversion', 'Study Guide', [
    {
      id: 'radians-from-degrees',
      target: 'angleRadians',
      inputs: ['angleDegrees'],
      displayFormula: 'rad = deg * pi / 180',
      description: 'Converts degrees to radians.',
      priority: 7,
      compute: (values) => scalar((getScalar(values, 'angleDegrees') * Math.PI) / 180),
    },
    {
      id: 'degrees-from-radians',
      target: 'angleDegrees',
      inputs: ['angleRadians'],
      displayFormula: 'deg = rad * 180 / pi',
      description: 'Converts radians to degrees.',
      priority: 7,
      compute: (values) => scalar((getScalar(values, 'angleRadians') * 180) / Math.PI),
    },
  ]),
  family('angular-frequency', 'Angular frequency', '13', [
    {
      id: 'omega-from-period',
      target: 'angularFrequency',
      inputs: ['period'],
      displayFormula: 'omega = 2pi / T',
      description: 'Computes angular frequency from period.',
      priority: 7,
      validate: (values) => positive(getScalar(values, 'period'), 'Period'),
      compute: (values) => scalar(TAU / getScalar(values, 'period')),
    },
    {
      id: 'period-from-omega',
      target: 'period',
      inputs: ['angularFrequency'],
      displayFormula: 'T = 2pi / omega',
      description: 'Computes period from angular frequency.',
      priority: 7,
      validate: (values) => positive(getScalar(values, 'angularFrequency'), 'Angular frequency'),
      compute: (values) => scalar(TAU / getScalar(values, 'angularFrequency')),
    },
    {
      id: 'frequency-from-omega',
      target: 'frequency',
      inputs: ['angularFrequency'],
      displayFormula: 'f = omega / (2pi)',
      description: 'Computes frequency from angular frequency.',
      priority: 7,
      validate: (values) => positive(getScalar(values, 'angularFrequency'), 'Angular frequency'),
      compute: (values) => scalar(getScalar(values, 'angularFrequency') / TAU),
    },
    {
      id: 'omega-from-frequency',
      target: 'angularFrequency',
      inputs: ['frequency'],
      displayFormula: 'omega = 2pi f',
      description: 'Computes angular frequency from frequency.',
      priority: 7,
      validate: (values) => positive(getScalar(values, 'frequency'), 'Frequency'),
      compute: (values) => scalar(TAU * getScalar(values, 'frequency')),
    },
  ]),
  family('ohms-law', 'Ohm law', '13', [
    {
      id: 'current-from-voltage-and-resistance',
      target: 'current',
      inputs: ['voltage', 'resistance'],
      displayFormula: 'i = v / R',
      description: 'Computes current from voltage and resistance.',
      priority: 8,
      validate: (values) => nonZero(getScalar(values, 'resistance'), 'Resistance'),
      compute: (values) => scalar(getScalar(values, 'voltage') / getScalar(values, 'resistance')),
    },
    {
      id: 'voltage-from-current-and-resistance',
      target: 'voltage',
      inputs: ['current', 'resistance'],
      displayFormula: 'v = iR',
      description: 'Computes voltage from current and resistance.',
      priority: 8,
      compute: (values) => scalar(getScalar(values, 'current') * getScalar(values, 'resistance')),
    },
    {
      id: 'resistance-from-voltage-and-current',
      target: 'resistance',
      inputs: ['voltage', 'current'],
      displayFormula: 'R = v / i',
      description: 'Computes resistance from voltage and current.',
      priority: 8,
      validate: (values) => nonZero(getScalar(values, 'current'), 'Current'),
      compute: (values) => scalar(getScalar(values, 'voltage') / getScalar(values, 'current')),
    },
  ]),
  family('inductive-reactance-frequency', 'Inductive reactance from frequency', '14', [
    {
      id: 'xl-from-frequency-and-inductance',
      target: 'inductiveReactance',
      inputs: ['frequency', 'inductance'],
      displayFormula: 'XL = 2pi f L',
      description: 'Computes inductive reactance from frequency and inductance.',
      priority: 8,
      validate: (values) =>
        validateAll(
          positive(getScalar(values, 'frequency'), 'Frequency'),
          positive(getScalar(values, 'inductance'), 'Inductance'),
        ),
      compute: (values) =>
        scalar(TAU * getScalar(values, 'frequency') * getScalar(values, 'inductance')),
    },
    {
      id: 'frequency-from-xl-and-inductance',
      target: 'frequency',
      inputs: ['inductiveReactance', 'inductance'],
      displayFormula: 'f = XL / (2pi L)',
      description: 'Computes frequency from inductive reactance and inductance.',
      priority: 8,
      validate: (values) =>
        validateAll(
          positive(getScalar(values, 'inductiveReactance'), 'Inductive reactance'),
          positive(getScalar(values, 'inductance'), 'Inductance'),
        ),
      compute: (values) =>
        scalar(
          getScalar(values, 'inductiveReactance') /
            (TAU * getScalar(values, 'inductance')),
        ),
    },
    {
      id: 'inductance-from-xl-and-frequency',
      target: 'inductance',
      inputs: ['inductiveReactance', 'frequency'],
      displayFormula: 'L = XL / (2pi f)',
      description: 'Computes inductance from inductive reactance and frequency.',
      priority: 8,
      validate: (values) =>
        validateAll(
          positive(getScalar(values, 'inductiveReactance'), 'Inductive reactance'),
          positive(getScalar(values, 'frequency'), 'Frequency'),
        ),
      compute: (values) =>
        scalar(
          getScalar(values, 'inductiveReactance') / (TAU * getScalar(values, 'frequency')),
        ),
    },
  ]),
  family('inductive-reactance-omega', 'Inductive reactance from angular frequency', '14', [
    {
      id: 'xl-from-omega-and-inductance',
      target: 'inductiveReactance',
      inputs: ['angularFrequency', 'inductance'],
      displayFormula: 'XL = omega L',
      description: 'Computes inductive reactance from angular frequency and inductance.',
      priority: 8,
      validate: (values) =>
        validateAll(
          positive(getScalar(values, 'angularFrequency'), 'Angular frequency'),
          positive(getScalar(values, 'inductance'), 'Inductance'),
        ),
      compute: (values) =>
        scalar(getScalar(values, 'angularFrequency') * getScalar(values, 'inductance')),
    },
    {
      id: 'omega-from-xl-and-inductance',
      target: 'angularFrequency',
      inputs: ['inductiveReactance', 'inductance'],
      displayFormula: 'omega = XL / L',
      description: 'Computes angular frequency from inductive reactance and inductance.',
      priority: 8,
      validate: (values) =>
        validateAll(
          positive(getScalar(values, 'inductiveReactance'), 'Inductive reactance'),
          positive(getScalar(values, 'inductance'), 'Inductance'),
        ),
      compute: (values) =>
        scalar(getScalar(values, 'inductiveReactance') / getScalar(values, 'inductance')),
    },
    {
      id: 'inductance-from-xl-and-omega',
      target: 'inductance',
      inputs: ['inductiveReactance', 'angularFrequency'],
      displayFormula: 'L = XL / omega',
      description: 'Computes inductance from inductive reactance and angular frequency.',
      priority: 8,
      validate: (values) =>
        validateAll(
          positive(getScalar(values, 'inductiveReactance'), 'Inductive reactance'),
          positive(getScalar(values, 'angularFrequency'), 'Angular frequency'),
        ),
      compute: (values) =>
        scalar(getScalar(values, 'inductiveReactance') / getScalar(values, 'angularFrequency')),
    },
  ]),
  family('capacitive-reactance-frequency', 'Capacitive reactance from frequency', '14', [
    {
      id: 'xc-from-frequency-and-capacitance',
      target: 'capacitiveReactance',
      inputs: ['frequency', 'capacitance'],
      displayFormula: 'XC = 1 / (2pi f C)',
      description: 'Computes capacitive reactance from frequency and capacitance.',
      priority: 8,
      validate: (values) =>
        validateAll(
          positive(getScalar(values, 'frequency'), 'Frequency'),
          positive(getScalar(values, 'capacitance'), 'Capacitance'),
        ),
      compute: (values) =>
        scalar(1 / (TAU * getScalar(values, 'frequency') * getScalar(values, 'capacitance'))),
    },
    {
      id: 'capacitance-from-frequency-and-xc',
      target: 'capacitance',
      inputs: ['frequency', 'capacitiveReactance'],
      displayFormula: 'C = 1 / (2pi f XC)',
      description: 'Computes capacitance from frequency and capacitive reactance.',
      priority: 8,
      validate: (values) =>
        validateAll(
          positive(getScalar(values, 'frequency'), 'Frequency'),
          positive(getScalar(values, 'capacitiveReactance'), 'Capacitive reactance'),
        ),
      compute: (values) =>
        scalar(
          1 /
            (TAU *
              getScalar(values, 'frequency') *
              getScalar(values, 'capacitiveReactance')),
        ),
    },
    {
      id: 'frequency-from-xc-and-capacitance',
      target: 'frequency',
      inputs: ['capacitiveReactance', 'capacitance'],
      displayFormula: 'f = 1 / (2pi XC C)',
      description: 'Computes frequency from capacitive reactance and capacitance.',
      priority: 8,
      validate: (values) =>
        validateAll(
          positive(getScalar(values, 'capacitiveReactance'), 'Capacitive reactance'),
          positive(getScalar(values, 'capacitance'), 'Capacitance'),
        ),
      compute: (values) =>
        scalar(
          1 /
            (TAU *
              getScalar(values, 'capacitiveReactance') *
              getScalar(values, 'capacitance')),
        ),
    },
  ]),
  family('capacitor-current', 'Capacitor current', '10', [
    {
      id: 'current-from-capacitance-and-dvdt',
      target: 'current',
      inputs: ['capacitance', 'dvDt'],
      displayFormula: 'i = C dv/dt',
      description: 'Computes current from capacitance and dv/dt.',
      priority: 7,
      compute: (values) => scalar(getScalar(values, 'capacitance') * getScalar(values, 'dvDt')),
    },
    {
      id: 'capacitance-from-current-and-dvdt',
      target: 'capacitance',
      inputs: ['current', 'dvDt'],
      displayFormula: 'C = i / (dv/dt)',
      description: 'Computes capacitance from current and dv/dt.',
      priority: 7,
      validate: (values) => nonZero(getScalar(values, 'dvDt'), 'dv/dt'),
      compute: (values) => scalar(getScalar(values, 'current') / getScalar(values, 'dvDt')),
    },
    {
      id: 'dvdt-from-current-and-capacitance',
      target: 'dvDt',
      inputs: ['current', 'capacitance'],
      displayFormula: 'dv/dt = i / C',
      description: 'Computes dv/dt from current and capacitance.',
      priority: 7,
      validate: (values) => nonZero(getScalar(values, 'capacitance'), 'Capacitance'),
      compute: (values) => scalar(getScalar(values, 'current') / getScalar(values, 'capacitance')),
    },
  ]),
  family('impedance-magnitude', 'Impedance magnitude from V and I', '13', [
    {
      id: 'impedance-from-voltage-and-current',
      target: 'impedanceMagnitude',
      inputs: ['voltage', 'current'],
      displayFormula: 'Z = V / I',
      description: 'Computes impedance magnitude from voltage and current.',
      priority: 7,
      validate: (values) => nonZero(getScalar(values, 'current'), 'Current'),
      compute: (values) => scalar(getScalar(values, 'voltage') / getScalar(values, 'current')),
    },
    {
      id: 'voltage-from-current-and-impedance',
      target: 'voltage',
      inputs: ['current', 'impedanceMagnitude'],
      displayFormula: 'V = ZI',
      description: 'Computes voltage from current and impedance magnitude.',
      priority: 7,
      compute: (values) =>
        scalar(getScalar(values, 'current') * getScalar(values, 'impedanceMagnitude')),
    },
    {
      id: 'current-from-voltage-and-impedance',
      target: 'current',
      inputs: ['voltage', 'impedanceMagnitude'],
      displayFormula: 'I = V / Z',
      description: 'Computes current from voltage and impedance magnitude.',
      priority: 7,
      validate: (values) => nonZero(getScalar(values, 'impedanceMagnitude'), 'Impedance'),
      compute: (values) => scalar(getScalar(values, 'voltage') / getScalar(values, 'impedanceMagnitude')),
    },
  ]),
  family('conductance', 'Conductance and resistance', '16', [
    {
      id: 'conductance-from-resistance',
      target: 'conductance',
      inputs: ['resistance'],
      displayFormula: 'G = 1 / R',
      description: 'Computes conductance from resistance.',
      priority: 8,
      validate: (values) => positive(getScalar(values, 'resistance'), 'Resistance'),
      compute: (values) => scalar(1 / getScalar(values, 'resistance')),
    },
    {
      id: 'resistance-from-conductance',
      target: 'resistance',
      inputs: ['conductance'],
      displayFormula: 'R = 1 / G',
      description: 'Computes resistance from conductance.',
      priority: 8,
      validate: (values) => positive(getScalar(values, 'conductance'), 'Conductance'),
      compute: (values) => scalar(1 / getScalar(values, 'conductance')),
    },
  ]),
  family('inductive-susceptance', 'Inductive susceptance', '16', [
    {
      id: 'bl-from-xl',
      target: 'inductiveSusceptance',
      inputs: ['inductiveReactance'],
      displayFormula: 'BL = 1 / XL',
      description: 'Computes inductive susceptance from inductive reactance.',
      priority: 8,
      validate: (values) => positive(getScalar(values, 'inductiveReactance'), 'Inductive reactance'),
      compute: (values) => scalar(1 / getScalar(values, 'inductiveReactance')),
    },
    {
      id: 'xl-from-bl',
      target: 'inductiveReactance',
      inputs: ['inductiveSusceptance'],
      displayFormula: 'XL = 1 / BL',
      description: 'Computes inductive reactance from inductive susceptance.',
      priority: 8,
      validate: (values) => positive(getScalar(values, 'inductiveSusceptance'), 'Inductive susceptance'),
      compute: (values) => scalar(1 / getScalar(values, 'inductiveSusceptance')),
    },
  ]),
  family('capacitive-susceptance', 'Capacitive susceptance', '16', [
    {
      id: 'bc-from-xc',
      target: 'capacitiveSusceptance',
      inputs: ['capacitiveReactance'],
      displayFormula: 'BC = 1 / XC',
      description: 'Computes capacitive susceptance from capacitive reactance.',
      priority: 8,
      validate: (values) => positive(getScalar(values, 'capacitiveReactance'), 'Capacitive reactance'),
      compute: (values) => scalar(1 / getScalar(values, 'capacitiveReactance')),
    },
    {
      id: 'xc-from-bc',
      target: 'capacitiveReactance',
      inputs: ['capacitiveSusceptance'],
      displayFormula: 'XC = 1 / BC',
      description: 'Computes capacitive reactance from capacitive susceptance.',
      priority: 8,
      validate: (values) => positive(getScalar(values, 'capacitiveSusceptance'), 'Capacitive susceptance'),
      compute: (values) => scalar(1 / getScalar(values, 'capacitiveSusceptance')),
    },
  ]),
  family('net-susceptance', 'Net susceptance', '16', [
    {
      id: 'net-susceptance-from-branches',
      target: 'netSusceptance',
      inputs: ['capacitiveSusceptance', 'inductiveSusceptance'],
      displayFormula: 'B = BC - BL',
      description: 'Computes net susceptance from capacitive and inductive susceptance.',
      priority: 8,
      compute: (values) =>
        scalar(getScalar(values, 'capacitiveSusceptance') - getScalar(values, 'inductiveSusceptance')),
    },
    {
      id: 'bc-from-net-and-bl',
      target: 'capacitiveSusceptance',
      inputs: ['netSusceptance', 'inductiveSusceptance'],
      displayFormula: 'BC = B + BL',
      description: 'Computes capacitive susceptance from net and inductive susceptance.',
      priority: 7,
      compute: (values) =>
        scalar(getScalar(values, 'netSusceptance') + getScalar(values, 'inductiveSusceptance')),
    },
    {
      id: 'bl-from-bc-and-net',
      target: 'inductiveSusceptance',
      inputs: ['capacitiveSusceptance', 'netSusceptance'],
      displayFormula: 'BL = BC - B',
      description: 'Computes inductive susceptance from capacitive and net susceptance.',
      priority: 7,
      compute: (values) =>
        scalar(getScalar(values, 'capacitiveSusceptance') - getScalar(values, 'netSusceptance')),
    },
  ]),
  family('parallel-admittance-complex', 'Complex admittance of a parallel network', '16', [
    {
      id: 'admittance-from-g-bl-bc',
      target: 'admittanceComplex',
      inputs: ['conductance', 'inductiveSusceptance', 'capacitiveSusceptance'],
      displayFormula: 'Y = G + j(BC - BL)',
      description: 'Computes complex admittance from total conductance and susceptances.',
      priority: 8,
      compute: (values) =>
        complex(
          getScalar(values, 'conductance'),
          getScalar(values, 'capacitiveSusceptance') - getScalar(values, 'inductiveSusceptance'),
        ),
    },
    {
      id: 'conductance-from-admittance',
      target: 'conductance',
      inputs: ['admittanceComplex'],
      displayFormula: 'G = Re(Y)',
      description: 'Computes conductance from complex admittance.',
      priority: 7,
      compute: (values) => scalar(getComplex(values, 'admittanceComplex').real),
    },
    {
      id: 'net-susceptance-from-admittance',
      target: 'netSusceptance',
      inputs: ['admittanceComplex'],
      displayFormula: 'B = Im(Y)',
      description: 'Computes net susceptance from complex admittance.',
      priority: 7,
      compute: (values) => scalar(getComplex(values, 'admittanceComplex').imag),
    },
  ]),
  family('parallel-admittance-magnitude', 'Admittance magnitude', '16', [
    {
      id: 'admittance-magnitude-from-g-and-b',
      target: 'admittanceMagnitude',
      inputs: ['conductance', 'netSusceptance'],
      displayFormula: '|Y| = sqrt(G^2 + B^2)',
      description: 'Computes the magnitude of the total admittance.',
      priority: 8,
      compute: (values) =>
        scalar(
          Math.hypot(getScalar(values, 'conductance'), getScalar(values, 'netSusceptance')),
        ),
    },
    {
      id: 'admittance-magnitude-from-complex-admittance',
      target: 'admittanceMagnitude',
      inputs: ['admittanceComplex'],
      displayFormula: '|Y| = sqrt(Re(Y)^2 + Im(Y)^2)',
      description: 'Computes the magnitude of a complex admittance.',
      priority: 7,
      compute: (values) => scalar(magnitude(getComplex(values, 'admittanceComplex'))),
    },
  ]),
  family('parallel-admittance-angle', 'Admittance angle', '16', [
    {
      id: 'admittance-angle-from-g-and-b',
      target: 'admittanceAngle',
      inputs: ['conductance', 'netSusceptance'],
      displayFormula: 'thetaY = atan2(B, G)',
      description: 'Computes the total admittance angle from conductance and net susceptance.',
      priority: 8,
      compute: (values) =>
        scalar(Math.atan2(getScalar(values, 'netSusceptance'), getScalar(values, 'conductance'))),
    },
    {
      id: 'admittance-angle-from-complex-admittance',
      target: 'admittanceAngle',
      inputs: ['admittanceComplex'],
      displayFormula: 'thetaY = atan2(Im(Y), Re(Y))',
      description: 'Computes the angle of a complex admittance.',
      priority: 7,
      compute: (values) => {
        const admittance = getComplex(values, 'admittanceComplex')
        return scalar(Math.atan2(admittance.imag, admittance.real))
      },
    },
  ]),
  family('impedance-admittance-reciprocal', 'Impedance and admittance reciprocal', '16', [
    {
      id: 'impedance-from-admittance',
      target: 'impedanceComplex',
      inputs: ['admittanceComplex'],
      displayFormula: 'Z = 1 / Y',
      description: 'Computes complex impedance from complex admittance.',
      priority: 8,
      validate: (values) => {
        const admittance = getComplex(values, 'admittanceComplex')
        return nonZero(admittance.real ** 2 + admittance.imag ** 2, 'Admittance')
      },
      compute: (values) => divideComplex(complex(1, 0), getComplex(values, 'admittanceComplex')),
    },
    {
      id: 'admittance-from-impedance',
      target: 'admittanceComplex',
      inputs: ['impedanceComplex'],
      displayFormula: 'Y = 1 / Z',
      description: 'Computes complex admittance from complex impedance.',
      priority: 8,
      validate: (values) => {
        const impedance = getComplex(values, 'impedanceComplex')
        return nonZero(impedance.real ** 2 + impedance.imag ** 2, 'Impedance')
      },
      compute: (values) => divideComplex(complex(1, 0), getComplex(values, 'impedanceComplex')),
    },
    {
      id: 'impedance-magnitude-from-admittance-magnitude',
      target: 'impedanceMagnitude',
      inputs: ['admittanceMagnitude'],
      displayFormula: '|Z| = 1 / |Y|',
      description: 'Computes impedance magnitude from admittance magnitude.',
      priority: 8,
      validate: (values) => positive(getScalar(values, 'admittanceMagnitude'), 'Admittance magnitude'),
      compute: (values) => scalar(1 / getScalar(values, 'admittanceMagnitude')),
    },
    {
      id: 'admittance-magnitude-from-impedance-magnitude',
      target: 'admittanceMagnitude',
      inputs: ['impedanceMagnitude'],
      displayFormula: '|Y| = 1 / |Z|',
      description: 'Computes admittance magnitude from impedance magnitude.',
      priority: 8,
      validate: (values) => positive(getScalar(values, 'impedanceMagnitude'), 'Impedance magnitude'),
      compute: (values) => scalar(1 / getScalar(values, 'impedanceMagnitude')),
    },
  ]),
  family('parallel-source-current', 'Parallel source current', '16', [
    {
      id: 'current-from-voltage-and-admittance',
      target: 'current',
      inputs: ['voltage', 'admittanceMagnitude'],
      displayFormula: 'I = V|Y|',
      description: 'Computes current magnitude from source voltage and total admittance magnitude.',
      priority: 8,
      compute: (values) => scalar(getScalar(values, 'voltage') * getScalar(values, 'admittanceMagnitude')),
    },
    {
      id: 'parallel-current-phasor-from-source-and-admittance',
      target: 'phasorCurrent',
      inputs: ['phasorSourceVoltage', 'admittanceComplex'],
      displayFormula: 'I = EY',
      description: 'Computes source current phasor from source voltage phasor and total admittance.',
      priority: 8,
      compute: (values) =>
        multiplyComplex(getComplex(values, 'phasorSourceVoltage'), getComplex(values, 'admittanceComplex')),
    },
  ]),
  family('parallel-branch-current', 'Parallel branch currents', '16', [
    {
      id: 'resistive-branch-current-from-voltage-and-conductance',
      target: 'current',
      inputs: ['voltage', 'conductance'],
      displayFormula: 'IR = VG',
      description: 'Computes the resistive branch current magnitude from voltage and conductance.',
      priority: 8,
      compute: (values) => scalar(getScalar(values, 'voltage') * getScalar(values, 'conductance')),
    },
    {
      id: 'inductive-branch-current-from-voltage-and-susceptance',
      target: 'current',
      inputs: ['voltage', 'inductiveSusceptance'],
      displayFormula: 'IL = VBL',
      description: 'Computes the inductive branch current magnitude from voltage and inductive susceptance.',
      priority: 8,
      compute: (values) =>
        scalar(getScalar(values, 'voltage') * getScalar(values, 'inductiveSusceptance')),
    },
    {
      id: 'capacitive-branch-current-from-voltage-and-susceptance',
      target: 'current',
      inputs: ['voltage', 'capacitiveSusceptance'],
      displayFormula: 'IC = VBC',
      description: 'Computes the capacitive branch current magnitude from voltage and capacitive susceptance.',
      priority: 8,
      compute: (values) =>
        scalar(getScalar(values, 'voltage') * getScalar(values, 'capacitiveSusceptance')),
    },
  ]),
  family('parallel-power', 'Parallel circuit power', '16', [
    {
      id: 'parallel-power-from-voltage-and-conductance',
      target: 'realPower',
      inputs: ['voltage', 'conductance'],
      displayFormula: 'P = V^2 G',
      description: 'Computes real power from source voltage and conductance.',
      priority: 8,
      compute: (values) =>
        scalar((getScalar(values, 'voltage') ** 2) * getScalar(values, 'conductance')),
    },
    {
      id: 'conductance-from-parallel-power-and-voltage',
      target: 'conductance',
      inputs: ['realPower', 'voltage'],
      displayFormula: 'G = P / V^2',
      description: 'Computes conductance from real power and source voltage.',
      priority: 8,
      validate: (values) => nonZero(getScalar(values, 'voltage') ** 2, 'V^2'),
      compute: (values) => scalar(getScalar(values, 'realPower') / (getScalar(values, 'voltage') ** 2)),
    },
  ]),
  family('parallel-power-factor', 'Parallel power factor from admittance', '16', [
    {
      id: 'pf-from-conductance-and-admittance',
      target: 'powerFactor',
      inputs: ['conductance', 'admittanceMagnitude'],
      displayFormula: 'pf = G / |Y|',
      description: 'Computes power factor from conductance and admittance magnitude.',
      priority: 8,
      validate: (values) => nonZero(getScalar(values, 'admittanceMagnitude'), '|Y|'),
      compute: (values) =>
        scalar(getScalar(values, 'conductance') / getScalar(values, 'admittanceMagnitude')),
    },
  ]),
  family('power-factor-vi', 'Power factor from power, voltage, and current', '14', [
    {
      id: 'pf-from-power-voltage-current',
      target: 'powerFactor',
      inputs: ['realPower', 'voltage', 'current'],
      displayFormula: 'pf = P / (VI)',
      description: 'Computes power factor from power, voltage, and current.',
      priority: 7,
      validate: (values) =>
        validateAll(
          nonZero(getScalar(values, 'voltage'), 'Voltage'),
          nonZero(getScalar(values, 'current'), 'Current'),
        ),
      compute: (values) =>
        scalar(
          getScalar(values, 'realPower') /
            (getScalar(values, 'voltage') * getScalar(values, 'current')),
        ),
    },
    {
      id: 'power-from-pf-voltage-current',
      target: 'realPower',
      inputs: ['powerFactor', 'voltage', 'current'],
      displayFormula: 'P = pf * V * I',
      description: 'Computes real power from power factor, voltage, and current.',
      priority: 7,
      compute: (values) =>
        scalar(
          getScalar(values, 'powerFactor') *
            getScalar(values, 'voltage') *
            getScalar(values, 'current'),
        ),
    },
    {
      id: 'voltage-from-power-pf-current',
      target: 'voltage',
      inputs: ['realPower', 'powerFactor', 'current'],
      displayFormula: 'V = P / (pf * I)',
      description: 'Computes voltage from power, power factor, and current.',
      priority: 7,
      validate: (values) =>
        validateAll(
          nonZero(getScalar(values, 'powerFactor'), 'Power factor'),
          nonZero(getScalar(values, 'current'), 'Current'),
        ),
      compute: (values) =>
        scalar(
          getScalar(values, 'realPower') /
            (getScalar(values, 'powerFactor') * getScalar(values, 'current')),
        ),
    },
    {
      id: 'current-from-power-pf-voltage',
      target: 'current',
      inputs: ['realPower', 'powerFactor', 'voltage'],
      displayFormula: 'I = P / (pf * V)',
      description: 'Computes current from power, power factor, and voltage.',
      priority: 7,
      validate: (values) =>
        validateAll(
          nonZero(getScalar(values, 'powerFactor'), 'Power factor'),
          nonZero(getScalar(values, 'voltage'), 'Voltage'),
        ),
      compute: (values) =>
        scalar(
          getScalar(values, 'realPower') /
            (getScalar(values, 'powerFactor') * getScalar(values, 'voltage')),
        ),
    },
  ]),
  family('rms-current', 'Peak and RMS current', '13', [
    {
      id: 'irms-from-im',
      target: 'rmsCurrent',
      inputs: ['peakCurrent'],
      displayFormula: 'Irms = Im / sqrt(2)',
      description: 'Computes RMS current from peak current.',
      priority: 7,
      compute: (values) => scalar(getScalar(values, 'peakCurrent') / Math.SQRT2),
    },
    {
      id: 'im-from-irms',
      target: 'peakCurrent',
      inputs: ['rmsCurrent'],
      displayFormula: 'Im = sqrt(2) Irms',
      description: 'Computes peak current from RMS current.',
      priority: 7,
      compute: (values) => scalar(getScalar(values, 'rmsCurrent') * Math.SQRT2),
    },
  ]),
  family('rms-voltage', 'Peak and RMS voltage', '13', [
    {
      id: 'vrms-from-vm',
      target: 'rmsVoltage',
      inputs: ['peakVoltage'],
      displayFormula: 'Vrms = Vm / sqrt(2)',
      description: 'Computes RMS voltage from peak voltage.',
      priority: 7,
      compute: (values) => scalar(getScalar(values, 'peakVoltage') / Math.SQRT2),
    },
    {
      id: 'vm-from-vrms',
      target: 'peakVoltage',
      inputs: ['rmsVoltage'],
      displayFormula: 'Vm = sqrt(2) Vrms',
      description: 'Computes peak voltage from RMS voltage.',
      priority: 7,
      compute: (values) => scalar(getScalar(values, 'rmsVoltage') * Math.SQRT2),
    },
  ]),
  family('inductive-impedance', 'Inductor impedance', '14', [
    {
      id: 'zl-from-xl',
      target: 'inductiveImpedance',
      inputs: ['inductiveReactance'],
      displayFormula: 'ZL = jXL',
      description: 'Converts inductive reactance to complex impedance.',
      priority: 7,
      compute: (values) => complex(0, getScalar(values, 'inductiveReactance')),
    },
    {
      id: 'xl-from-zl',
      target: 'inductiveReactance',
      inputs: ['inductiveImpedance'],
      displayFormula: 'XL = imag(ZL)',
      description: 'Extracts inductive reactance from complex impedance.',
      priority: 7,
      validate: (values) => {
        const impedance = getComplex(values, 'inductiveImpedance')
        return Math.abs(impedance.real) < EPSILON && impedance.imag >= 0
          ? undefined
          : 'ZL must be a purely positive imaginary impedance.'
      },
      compute: (values) => scalar(getComplex(values, 'inductiveImpedance').imag),
    },
  ]),
  family('inductor-voltage-phasor', 'Inductor voltage phasor', '15', [
    {
      id: 'vl-from-xl-and-current',
      target: 'inductorVoltagePhasor',
      inputs: ['inductiveReactance', 'phasorCurrent'],
      displayFormula: 'VL = jXL I',
      description: 'Computes inductor voltage from reactance and current phasor.',
      priority: 7,
      compute: (values) => {
        const current = getComplex(values, 'phasorCurrent')
        const reactance = getScalar(values, 'inductiveReactance')
        return multiplyByPositiveImaginary(
          complex(current.real * reactance, current.imag * reactance),
        )
      },
    },
    {
      id: 'current-from-vl-and-xl',
      target: 'phasorCurrent',
      inputs: ['inductorVoltagePhasor', 'inductiveReactance'],
      displayFormula: 'I = VL / (jXL)',
      description: 'Computes current phasor from inductor voltage and reactance.',
      priority: 7,
      validate: (values) => nonZero(getScalar(values, 'inductiveReactance'), 'Inductive reactance'),
      compute: (values) => {
        const voltage = getComplex(values, 'inductorVoltagePhasor')
        const rotated = multiplyByNegativeImaginary(voltage)
        const reactance = getScalar(values, 'inductiveReactance')
        return complex(rotated.real / reactance, rotated.imag / reactance)
      },
    },
  ]),
  family('capacitor-voltage-phasor', 'Capacitor voltage phasor', '14', [
    {
      id: 'vc-from-xc-and-current',
      target: 'capacitorVoltagePhasor',
      inputs: ['capacitiveReactance', 'phasorCurrent'],
      displayFormula: 'VC = -jXC I',
      description: 'Computes capacitor voltage from reactance and current phasor.',
      priority: 7,
      compute: (values) => {
        const current = getComplex(values, 'phasorCurrent')
        const reactance = getScalar(values, 'capacitiveReactance')
        const scaled = complex(current.real * reactance, current.imag * reactance)
        return multiplyByNegativeImaginary(scaled)
      },
    },
    {
      id: 'current-from-vc-and-xc',
      target: 'phasorCurrent',
      inputs: ['capacitorVoltagePhasor', 'capacitiveReactance'],
      displayFormula: 'I = VC / (-jXC)',
      description: 'Computes current phasor from capacitor voltage and reactance.',
      priority: 7,
      validate: (values) => nonZero(getScalar(values, 'capacitiveReactance'), 'Capacitive reactance'),
      compute: (values) => {
        const voltage = getComplex(values, 'capacitorVoltagePhasor')
        const rotated = multiplyByPositiveImaginary(voltage)
        const reactance = getScalar(values, 'capacitiveReactance')
        return complex(rotated.real / reactance, rotated.imag / reactance)
      },
    },
  ]),
  family('net-reactance', 'Net reactance', '15', [
    {
      id: 'net-reactance-from-xl-and-xc',
      target: 'netReactance',
      inputs: ['inductiveReactance', 'capacitiveReactance'],
      displayFormula: 'X = XL - XC',
      description: 'Computes net reactance from inductive and capacitive reactance.',
      priority: 7,
      compute: (values) =>
        scalar(getScalar(values, 'inductiveReactance') - getScalar(values, 'capacitiveReactance')),
    },
    {
      id: 'xl-from-net-reactance-and-xc',
      target: 'inductiveReactance',
      inputs: ['netReactance', 'capacitiveReactance'],
      displayFormula: 'XL = X + XC',
      description: 'Computes inductive reactance from net reactance and capacitive reactance.',
      priority: 7,
      compute: (values) =>
        scalar(getScalar(values, 'netReactance') + getScalar(values, 'capacitiveReactance')),
    },
    {
      id: 'xc-from-xl-and-net-reactance',
      target: 'capacitiveReactance',
      inputs: ['inductiveReactance', 'netReactance'],
      displayFormula: 'XC = XL - X',
      description: 'Computes capacitive reactance from inductive reactance and net reactance.',
      priority: 7,
      compute: (values) =>
        scalar(getScalar(values, 'inductiveReactance') - getScalar(values, 'netReactance')),
    },
  ]),
  family('complex-impedance', 'Complex impedance', '15', [
    {
      id: 'complex-impedance-from-r-xl-xc',
      target: 'impedanceComplex',
      inputs: ['resistance', 'inductiveReactance', 'capacitiveReactance'],
      displayFormula: 'Z = R + j(XL - XC)',
      description: 'Computes complex impedance from resistance and reactances.',
      priority: 8,
      compute: (values) =>
        complex(
          getScalar(values, 'resistance'),
          getScalar(values, 'inductiveReactance') - getScalar(values, 'capacitiveReactance'),
        ),
    },
    {
      id: 'impedance-magnitude-from-r-and-x',
      target: 'impedanceMagnitude',
      inputs: ['resistance', 'netReactance'],
      displayFormula: '|Z| = sqrt(R^2 + X^2)',
      description: 'Computes impedance magnitude from resistance and net reactance.',
      priority: 7,
      compute: (values) =>
        scalar(
          Math.hypot(getScalar(values, 'resistance'), getScalar(values, 'netReactance')),
        ),
    },
    {
      id: 'phase-angle-from-x-and-r',
      target: 'phaseAngle',
      inputs: ['netReactance', 'resistance'],
      displayFormula: 'theta = atan(X / R)',
      description: 'Computes phase angle from net reactance and resistance.',
      priority: 7,
      validate: (values) => nonZero(getScalar(values, 'resistance'), 'Resistance'),
      compute: (values) =>
        scalar(Math.atan2(getScalar(values, 'netReactance'), getScalar(values, 'resistance'))),
    },
    {
      id: 'net-reactance-from-angle-and-resistance',
      target: 'netReactance',
      inputs: ['phaseAngle', 'resistance'],
      displayFormula: 'X = R tan(theta)',
      description: 'Computes net reactance from phase angle and resistance.',
      priority: 7,
      compute: (values) =>
        scalar(getScalar(values, 'resistance') * Math.tan(getScalar(values, 'phaseAngle'))),
    },
    {
      id: 'resistance-from-angle-and-reactance',
      target: 'resistance',
      inputs: ['phaseAngle', 'netReactance'],
      displayFormula: 'R = X / tan(theta)',
      description: 'Computes resistance from phase angle and net reactance.',
      priority: 7,
      validate: (values) => nonZero(Math.tan(getScalar(values, 'phaseAngle')), 'tan(theta)'),
      compute: (values) =>
        scalar(getScalar(values, 'netReactance') / Math.tan(getScalar(values, 'phaseAngle'))),
    },
  ]),
  family('capacitance-omega', 'Capacitance from angular frequency', '14', [
    {
      id: 'capacitance-from-omega-and-xc',
      target: 'capacitance',
      inputs: ['angularFrequency', 'capacitiveReactance'],
      displayFormula: 'C = 1 / (omega XC)',
      description: 'Computes capacitance from angular frequency and capacitive reactance.',
      priority: 8,
      validate: (values) =>
        validateAll(
          positive(getScalar(values, 'angularFrequency'), 'Angular frequency'),
          positive(getScalar(values, 'capacitiveReactance'), 'Capacitive reactance'),
        ),
      compute: (values) =>
        scalar(
          1 /
            (getScalar(values, 'angularFrequency') * getScalar(values, 'capacitiveReactance')),
        ),
    },
    {
      id: 'omega-from-capacitance-and-xc',
      target: 'angularFrequency',
      inputs: ['capacitance', 'capacitiveReactance'],
      displayFormula: 'omega = 1 / (C XC)',
      description: 'Computes angular frequency from capacitance and capacitive reactance.',
      priority: 8,
      validate: (values) =>
        validateAll(
          positive(getScalar(values, 'capacitance'), 'Capacitance'),
          positive(getScalar(values, 'capacitiveReactance'), 'Capacitive reactance'),
        ),
      compute: (values) =>
        scalar(
          1 / (getScalar(values, 'capacitance') * getScalar(values, 'capacitiveReactance')),
        ),
    },
    {
      id: 'xc-from-capacitance-and-omega',
      target: 'capacitiveReactance',
      inputs: ['capacitance', 'angularFrequency'],
      displayFormula: 'XC = 1 / (omega C)',
      description: 'Computes capacitive reactance from capacitance and angular frequency.',
      priority: 8,
      validate: (values) =>
        validateAll(
          positive(getScalar(values, 'capacitance'), 'Capacitance'),
          positive(getScalar(values, 'angularFrequency'), 'Angular frequency'),
        ),
      compute: (values) =>
        scalar(1 / (getScalar(values, 'capacitance') * getScalar(values, 'angularFrequency'))),
    },
  ]),
  family('phasor-current', 'Current from voltage and impedance', '15', [
    {
      id: 'phasor-current-from-source-and-impedance',
      target: 'phasorCurrent',
      inputs: ['phasorSourceVoltage', 'impedanceComplex'],
      displayFormula: 'I = E / Z',
      description: 'Computes current phasor from source voltage and impedance.',
      priority: 8,
      validate: (values) => {
        const impedance = getComplex(values, 'impedanceComplex')
        return nonZero(impedance.real ** 2 + impedance.imag ** 2, 'Impedance')
      },
      compute: (values) =>
        divideComplex(getComplex(values, 'phasorSourceVoltage'), getComplex(values, 'impedanceComplex')),
    },
    {
      id: 'source-from-current-and-impedance',
      target: 'phasorSourceVoltage',
      inputs: ['phasorCurrent', 'impedanceComplex'],
      displayFormula: 'E = IZ',
      description: 'Computes source voltage phasor from current and impedance.',
      priority: 8,
      compute: (values) =>
        multiplyComplex(getComplex(values, 'phasorCurrent'), getComplex(values, 'impedanceComplex')),
    },
    {
      id: 'impedance-from-source-and-current',
      target: 'impedanceComplex',
      inputs: ['phasorSourceVoltage', 'phasorCurrent'],
      displayFormula: 'Z = E / I',
      description: 'Computes complex impedance from source voltage and current.',
      priority: 8,
      validate: (values) => {
        const current = getComplex(values, 'phasorCurrent')
        return nonZero(current.real ** 2 + current.imag ** 2, 'Current phasor')
      },
      compute: (values) =>
        divideComplex(getComplex(values, 'phasorSourceVoltage'), getComplex(values, 'phasorCurrent')),
    },
  ]),
  family('resistor-voltage-phasor', 'Resistor voltage phasor', '15', [
    {
      id: 'vr-from-current-and-resistance',
      target: 'resistorVoltagePhasor',
      inputs: ['phasorCurrent', 'resistance'],
      displayFormula: 'VR = IR',
      description: 'Computes resistor voltage phasor from current and resistance.',
      priority: 7,
      compute: (values) => {
        const current = getComplex(values, 'phasorCurrent')
        const resistance = getScalar(values, 'resistance')
        return complex(current.real * resistance, current.imag * resistance)
      },
    },
    {
      id: 'current-from-vr-and-resistance',
      target: 'phasorCurrent',
      inputs: ['resistorVoltagePhasor', 'resistance'],
      displayFormula: 'I = VR / R',
      description: 'Computes current phasor from resistor voltage and resistance.',
      priority: 7,
      validate: (values) => nonZero(getScalar(values, 'resistance'), 'Resistance'),
      compute: (values) => {
        const voltage = getComplex(values, 'resistorVoltagePhasor')
        const resistance = getScalar(values, 'resistance')
        return complex(voltage.real / resistance, voltage.imag / resistance)
      },
    },
  ]),
  family('source-voltage-sum', 'Summing phasor voltages', '15', [
    {
      id: 'source-from-vr-vl-vc',
      target: 'phasorSourceVoltage',
      inputs: ['resistorVoltagePhasor', 'inductorVoltagePhasor', 'capacitorVoltagePhasor'],
      displayFormula: 'E = VR + VL + VC',
      description: 'Computes source voltage phasor from component voltages.',
      priority: 7,
      compute: (values) =>
        addComplex(
          addComplex(
            getComplex(values, 'resistorVoltagePhasor'),
            getComplex(values, 'inductorVoltagePhasor'),
          ),
          getComplex(values, 'capacitorVoltagePhasor'),
        ),
    },
    {
      id: 'vr-from-source-vl-vc',
      target: 'resistorVoltagePhasor',
      inputs: ['phasorSourceVoltage', 'inductorVoltagePhasor', 'capacitorVoltagePhasor'],
      displayFormula: 'VR = E - VL - VC',
      description: 'Computes resistor voltage phasor from the other phasor voltages.',
      priority: 7,
      compute: (values) =>
        addComplex(
          getComplex(values, 'phasorSourceVoltage'),
          complex(
            -getComplex(values, 'inductorVoltagePhasor').real -
              getComplex(values, 'capacitorVoltagePhasor').real,
            -getComplex(values, 'inductorVoltagePhasor').imag -
              getComplex(values, 'capacitorVoltagePhasor').imag,
          ),
        ),
    },
  ]),
  family('power-i2r', 'Power from current and resistance', '15', [
    {
      id: 'power-from-current-and-resistance',
      target: 'realPower',
      inputs: ['current', 'resistance'],
      displayFormula: 'P = I^2 R',
      description: 'Computes power from current and resistance.',
      priority: 8,
      compute: (values) =>
        scalar(getScalar(values, 'current') ** 2 * getScalar(values, 'resistance')),
    },
    {
      id: 'current-from-power-and-resistance',
      target: 'current',
      inputs: ['realPower', 'resistance'],
      displayFormula: 'I = sqrt(P / R)',
      description: 'Computes current from power and resistance.',
      priority: 8,
      validate: (values) =>
        validateAll(
          positive(getScalar(values, 'realPower'), 'Power'),
          positive(getScalar(values, 'resistance'), 'Resistance'),
        ),
      compute: (values) =>
        scalar(Math.sqrt(getScalar(values, 'realPower') / getScalar(values, 'resistance'))),
    },
    {
      id: 'resistance-from-power-and-current',
      target: 'resistance',
      inputs: ['realPower', 'current'],
      displayFormula: 'R = P / I^2',
      description: 'Computes resistance from power and current.',
      priority: 8,
      validate: (values) =>
        validateAll(
          positive(getScalar(values, 'realPower'), 'Power'),
          nonZero(getScalar(values, 'current'), 'Current'),
        ),
      compute: (values) => scalar(getScalar(values, 'realPower') / (getScalar(values, 'current') ** 2)),
    },
  ]),
  family('power-v-i-angle', 'Power from voltage, current, and phase angle', '15', [
    {
      id: 'power-from-v-i-angle',
      target: 'realPower',
      inputs: ['voltage', 'current', 'phaseAngle'],
      displayFormula: 'P = VI cos(phi)',
      description: 'Computes power from voltage, current, and phase angle.',
      priority: 7,
      compute: (values) =>
        scalar(
          getScalar(values, 'voltage') *
            getScalar(values, 'current') *
            Math.cos(getScalar(values, 'phaseAngle')),
        ),
    },
    {
      id: 'phase-from-p-v-i',
      target: 'phaseAngle',
      inputs: ['realPower', 'voltage', 'current'],
      displayFormula: 'phi = arccos(P / (VI))',
      description: 'Computes phase angle from power, voltage, and current.',
      priority: 7,
      validate: (values) => {
        const denominator = getScalar(values, 'voltage') * getScalar(values, 'current')
        if (Math.abs(denominator) < EPSILON) {
          return 'Voltage and current must not both collapse the denominator to zero.'
        }

        const ratio = getScalar(values, 'realPower') / denominator
        return ratio >= -1 && ratio <= 1 ? undefined : 'P / (VI) must stay within [-1, 1].'
      },
      compute: (values) =>
        scalar(
          Math.acos(
            getScalar(values, 'realPower') /
              (getScalar(values, 'voltage') * getScalar(values, 'current')),
          ),
        ),
    },
    {
      id: 'current-from-p-v-angle',
      target: 'current',
      inputs: ['realPower', 'voltage', 'phaseAngle'],
      displayFormula: 'I = P / (V cos(phi))',
      description: 'Computes current from power, voltage, and phase angle.',
      priority: 7,
      validate: (values) =>
        nonZero(getScalar(values, 'voltage') * Math.cos(getScalar(values, 'phaseAngle')), 'V cos(phi)'),
      compute: (values) =>
        scalar(
          getScalar(values, 'realPower') /
            (getScalar(values, 'voltage') * Math.cos(getScalar(values, 'phaseAngle'))),
        ),
    },
    {
      id: 'voltage-from-p-i-angle',
      target: 'voltage',
      inputs: ['realPower', 'current', 'phaseAngle'],
      displayFormula: 'V = P / (I cos(phi))',
      description: 'Computes voltage from power, current, and phase angle.',
      priority: 7,
      validate: (values) =>
        nonZero(getScalar(values, 'current') * Math.cos(getScalar(values, 'phaseAngle')), 'I cos(phi)'),
      compute: (values) =>
        scalar(
          getScalar(values, 'realPower') /
            (getScalar(values, 'current') * Math.cos(getScalar(values, 'phaseAngle'))),
        ),
    },
  ]),
  family('power-factor-angle', 'Power factor and phase angle', '14', [
    {
      id: 'pf-from-phase-angle',
      target: 'powerFactor',
      inputs: ['phaseAngle'],
      displayFormula: 'pf = cos(phi)',
      description: 'Computes power factor from phase angle.',
      priority: 7,
      compute: (values) => scalar(Math.cos(getScalar(values, 'phaseAngle'))),
    },
    {
      id: 'phase-angle-from-pf',
      target: 'phaseAngle',
      inputs: ['powerFactor'],
      displayFormula: 'phi = arccos(pf)',
      description: 'Computes phase angle from power factor.',
      priority: 7,
      validate: (values) => {
        const factor = getScalar(values, 'powerFactor')
        return factor >= -1 && factor <= 1 ? undefined : 'Power factor must be between -1 and 1.'
      },
      compute: (values) => scalar(Math.acos(getScalar(values, 'powerFactor'))),
    },
  ]),
  family('voltage-divider', 'AC voltage divider', '15', [
    {
      id: 'branch-voltage-from-divider',
      target: 'branchVoltagePhasor',
      inputs: ['phasorSourceVoltage', 'branchImpedance', 'totalImpedance'],
      displayFormula: 'Vx = E (Zx / Zt)',
      description: 'Computes branch voltage using the AC voltage divider.',
      priority: 8,
      validate: (values) => {
        const total = getComplex(values, 'totalImpedance')
        return nonZero(total.real ** 2 + total.imag ** 2, 'Total impedance')
      },
      compute: (values) =>
        multiplyComplex(
          getComplex(values, 'phasorSourceVoltage'),
          divideComplex(getComplex(values, 'branchImpedance'), getComplex(values, 'totalImpedance')),
        ),
    },
  ]),
  family('electric-field-force-charge', 'Electric field, force, and charge', '10', [
    {
      id: 'electric-field-from-force-and-charge',
      target: 'electricFieldStrength',
      inputs: ['electricForce', 'charge'],
      displayFormula: 'E = F / Q',
      description: 'Computes electric field strength from electric force and charge.',
      priority: 8,
      validate: (values) => nonZero(getScalar(values, 'charge'), 'Charge'),
      compute: (values) =>
        scalar(getScalar(values, 'electricForce') / getScalar(values, 'charge')),
    },
    {
      id: 'force-from-electric-field-and-charge',
      target: 'electricForce',
      inputs: ['electricFieldStrength', 'charge'],
      displayFormula: 'F = EQ',
      description: 'Computes electric force from electric field strength and charge.',
      priority: 8,
      compute: (values) =>
        scalar(getScalar(values, 'electricFieldStrength') * getScalar(values, 'charge')),
    },
    {
      id: 'charge-from-electric-force-and-field',
      target: 'charge',
      inputs: ['electricForce', 'electricFieldStrength'],
      displayFormula: 'Q = F / E',
      description: 'Computes charge from electric force and field strength.',
      priority: 8,
      validate: (values) => nonZero(getScalar(values, 'electricFieldStrength'), 'Electric field strength'),
      compute: (values) =>
        scalar(getScalar(values, 'electricForce') / getScalar(values, 'electricFieldStrength')),
    },
  ]),
  family('point-charge-electric-field', 'Electric field of a point charge', '10', [
    {
      id: 'electric-field-from-charge-and-distance',
      target: 'electricFieldStrength',
      inputs: ['charge', 'distance'],
      displayFormula: 'E = kQ / d^2',
      description: 'Computes point-charge electric field strength from charge and distance.',
      priority: 8,
      validate: (values) => positive(getScalar(values, 'distance'), 'Distance'),
      compute: (values) =>
        scalar(
          (COULOMB_CONSTANT * getScalar(values, 'charge')) /
            getScalar(values, 'distance') ** 2,
        ),
    },
    {
      id: 'charge-from-point-electric-field-and-distance',
      target: 'charge',
      inputs: ['electricFieldStrength', 'distance'],
      displayFormula: 'Q = Ed^2 / k',
      description: 'Computes the point charge that creates the electric field.',
      priority: 8,
      validate: (values) => positive(getScalar(values, 'distance'), 'Distance'),
      compute: (values) =>
        scalar(
          (getScalar(values, 'electricFieldStrength') * getScalar(values, 'distance') ** 2) /
            COULOMB_CONSTANT,
        ),
    },
    {
      id: 'distance-from-point-electric-field-and-charge',
      target: 'distance',
      inputs: ['electricFieldStrength', 'charge'],
      displayFormula: 'd = sqrt(kQ / E)',
      description: 'Computes the distance from a point charge for the requested field strength.',
      priority: 8,
      validate: (values) => {
        const field = getScalar(values, 'electricFieldStrength')
        const charge = getScalar(values, 'charge')
        const ratio = (COULOMB_CONSTANT * charge) / field
        return validateAll(
          nonZero(field, 'Electric field strength'),
          ratio > 0 ? undefined : 'kQ / E must be greater than zero.',
        )
      },
      compute: (values) =>
        scalar(
          Math.sqrt(
            (COULOMB_CONSTANT * getScalar(values, 'charge')) /
              getScalar(values, 'electricFieldStrength'),
          ),
        ),
    },
  ]),
  family('plate-electric-field', 'Electric field between capacitor plates', '10', [
    {
      id: 'electric-field-from-voltage-and-distance',
      target: 'electricFieldStrength',
      inputs: ['voltage', 'distance'],
      displayFormula: 'E = V / d',
      description: 'Computes electric field strength between capacitor plates.',
      priority: 8,
      validate: (values) => nonZero(getScalar(values, 'distance'), 'Distance'),
      compute: (values) => scalar(getScalar(values, 'voltage') / getScalar(values, 'distance')),
    },
    {
      id: 'voltage-from-electric-field-and-distance',
      target: 'voltage',
      inputs: ['electricFieldStrength', 'distance'],
      displayFormula: 'V = Ed',
      description: 'Computes applied voltage from field strength and spacing.',
      priority: 8,
      compute: (values) =>
        scalar(getScalar(values, 'electricFieldStrength') * getScalar(values, 'distance')),
    },
    {
      id: 'distance-from-voltage-and-electric-field',
      target: 'distance',
      inputs: ['voltage', 'electricFieldStrength'],
      displayFormula: 'd = V / E',
      description: 'Computes plate spacing from voltage and field strength.',
      priority: 8,
      validate: (values) => nonZero(getScalar(values, 'electricFieldStrength'), 'Electric field strength'),
      compute: (values) => scalar(getScalar(values, 'voltage') / getScalar(values, 'electricFieldStrength')),
    },
  ]),
  family('relative-permittivity', 'Permittivity and dielectric constant', '10', [
    {
      id: 'relative-permittivity-from-permittivity',
      target: 'relativePermittivity',
      inputs: ['permittivity'],
      displayFormula: 'eps_r = epsilon / epsilon_0',
      description: 'Computes relative permittivity from absolute permittivity.',
      priority: 8,
      compute: (values) => scalar(getScalar(values, 'permittivity') / VACUUM_PERMITTIVITY),
    },
    {
      id: 'permittivity-from-relative-permittivity',
      target: 'permittivity',
      inputs: ['relativePermittivity'],
      displayFormula: 'epsilon = eps_r epsilon_0',
      description: 'Computes absolute permittivity from relative permittivity.',
      priority: 8,
      compute: (values) =>
        scalar(getScalar(values, 'relativePermittivity') * VACUUM_PERMITTIVITY),
    },
  ]),
  family('dielectric-capacitance-ratio', 'Capacitance change from dielectric insertion', '10', [
    {
      id: 'capacitance-from-relative-permittivity-and-air-capacitance',
      target: 'capacitance',
      inputs: ['relativePermittivity', 'airCapacitance'],
      displayFormula: 'C = eps_r C0',
      description: 'Computes capacitor value after dielectric insertion.',
      priority: 8,
      compute: (values) =>
        scalar(getScalar(values, 'relativePermittivity') * getScalar(values, 'airCapacitance')),
    },
    {
      id: 'relative-permittivity-from-capacitance-ratio',
      target: 'relativePermittivity',
      inputs: ['capacitance', 'airCapacitance'],
      displayFormula: 'eps_r = C / C0',
      description: 'Computes dielectric constant from the capacitance ratio.',
      priority: 8,
      validate: (values) => positive(getScalar(values, 'airCapacitance'), 'Air capacitance'),
      compute: (values) =>
        scalar(getScalar(values, 'capacitance') / getScalar(values, 'airCapacitance')),
    },
    {
      id: 'air-capacitance-from-capacitance-and-relative-permittivity',
      target: 'airCapacitance',
      inputs: ['capacitance', 'relativePermittivity'],
      displayFormula: 'C0 = C / eps_r',
      description: 'Computes the air-capacitor value before dielectric insertion.',
      priority: 8,
      validate: (values) => nonZero(getScalar(values, 'relativePermittivity'), 'Relative permittivity'),
      compute: (values) =>
        scalar(getScalar(values, 'capacitance') / getScalar(values, 'relativePermittivity')),
    },
  ]),
  family('air-parallel-plate-capacitance', 'Air capacitor plate geometry', '10', [
    {
      id: 'capacitance-from-air-geometry',
      target: 'capacitance',
      inputs: ['plateArea', 'distance'],
      displayFormula: 'C = epsilon_0 A / d',
      description: 'Computes air-capacitor capacitance from plate area and spacing.',
      priority: 8,
      validate: (values) =>
        validateAll(
          positive(getScalar(values, 'plateArea'), 'Plate area'),
          positive(getScalar(values, 'distance'), 'Distance'),
        ),
      compute: (values) =>
        scalar(
          (VACUUM_PERMITTIVITY * getScalar(values, 'plateArea')) /
            getScalar(values, 'distance'),
        ),
    },
    {
      id: 'air-capacitance-from-air-geometry',
      target: 'airCapacitance',
      inputs: ['plateArea', 'distance'],
      displayFormula: 'C0 = epsilon_0 A / d',
      description: 'Computes the reference air-capacitor value from geometry.',
      priority: 7,
      validate: (values) =>
        validateAll(
          positive(getScalar(values, 'plateArea'), 'Plate area'),
          positive(getScalar(values, 'distance'), 'Distance'),
        ),
      compute: (values) =>
        scalar(
          (VACUUM_PERMITTIVITY * getScalar(values, 'plateArea')) /
            getScalar(values, 'distance'),
        ),
    },
    {
      id: 'plate-area-from-air-capacitance-and-distance',
      target: 'plateArea',
      inputs: ['capacitance', 'distance'],
      displayFormula: 'A = Cd / epsilon_0',
      description: 'Computes plate area for an air capacitor.',
      priority: 8,
      validate: (values) =>
        validateAll(
          positive(getScalar(values, 'capacitance'), 'Capacitance'),
          positive(getScalar(values, 'distance'), 'Distance'),
        ),
      compute: (values) =>
        scalar(
          (getScalar(values, 'capacitance') * getScalar(values, 'distance')) /
            VACUUM_PERMITTIVITY,
        ),
    },
    {
      id: 'distance-from-air-capacitance-and-area',
      target: 'distance',
      inputs: ['capacitance', 'plateArea'],
      displayFormula: 'd = epsilon_0 A / C',
      description: 'Computes air-capacitor spacing from capacitance and plate area.',
      priority: 8,
      validate: (values) =>
        validateAll(
          positive(getScalar(values, 'capacitance'), 'Capacitance'),
          positive(getScalar(values, 'plateArea'), 'Plate area'),
        ),
      compute: (values) =>
        scalar(
          (VACUUM_PERMITTIVITY * getScalar(values, 'plateArea')) /
            getScalar(values, 'capacitance'),
        ),
    },
  ]),
  family('parallel-plate-capacitance-permittivity', 'Capacitor plate geometry with permittivity', '10', [
    {
      id: 'capacitance-from-permittivity-area-and-distance',
      target: 'capacitance',
      inputs: ['permittivity', 'plateArea', 'distance'],
      displayFormula: 'C = epsilon A / d',
      description: 'Computes capacitor value from absolute permittivity, area, and spacing.',
      priority: 8,
      validate: (values) =>
        validateAll(
          positive(getScalar(values, 'permittivity'), 'Permittivity'),
          positive(getScalar(values, 'plateArea'), 'Plate area'),
          positive(getScalar(values, 'distance'), 'Distance'),
        ),
      compute: (values) =>
        scalar(
          (getScalar(values, 'permittivity') * getScalar(values, 'plateArea')) /
            getScalar(values, 'distance'),
        ),
    },
    {
      id: 'permittivity-from-capacitance-area-and-distance',
      target: 'permittivity',
      inputs: ['capacitance', 'plateArea', 'distance'],
      displayFormula: 'epsilon = Cd / A',
      description: 'Computes absolute permittivity from capacitance geometry.',
      priority: 8,
      validate: (values) =>
        validateAll(
          positive(getScalar(values, 'capacitance'), 'Capacitance'),
          positive(getScalar(values, 'plateArea'), 'Plate area'),
        ),
      compute: (values) =>
        scalar(
          (getScalar(values, 'capacitance') * getScalar(values, 'distance')) /
            getScalar(values, 'plateArea'),
        ),
    },
    {
      id: 'plate-area-from-capacitance-permittivity-and-distance',
      target: 'plateArea',
      inputs: ['capacitance', 'permittivity', 'distance'],
      displayFormula: 'A = Cd / epsilon',
      description: 'Computes plate area from capacitance, permittivity, and spacing.',
      priority: 8,
      validate: (values) =>
        validateAll(
          positive(getScalar(values, 'capacitance'), 'Capacitance'),
          positive(getScalar(values, 'permittivity'), 'Permittivity'),
        ),
      compute: (values) =>
        scalar(
          (getScalar(values, 'capacitance') * getScalar(values, 'distance')) /
            getScalar(values, 'permittivity'),
        ),
    },
    {
      id: 'distance-from-capacitance-permittivity-and-area',
      target: 'distance',
      inputs: ['capacitance', 'permittivity', 'plateArea'],
      displayFormula: 'd = epsilon A / C',
      description: 'Computes plate spacing from capacitance, permittivity, and area.',
      priority: 8,
      validate: (values) =>
        validateAll(
          positive(getScalar(values, 'capacitance'), 'Capacitance'),
          positive(getScalar(values, 'permittivity'), 'Permittivity'),
          positive(getScalar(values, 'plateArea'), 'Plate area'),
        ),
      compute: (values) =>
        scalar(
          (getScalar(values, 'permittivity') * getScalar(values, 'plateArea')) /
            getScalar(values, 'capacitance'),
        ),
    },
  ]),
  family('parallel-plate-capacitance-relative', 'Capacitor plate geometry with dielectric constant', '10', [
    {
      id: 'capacitance-from-relative-permittivity-area-and-distance',
      target: 'capacitance',
      inputs: ['relativePermittivity', 'plateArea', 'distance'],
      displayFormula: 'C = eps_r epsilon_0 A / d',
      description: 'Computes capacitor value from dielectric constant, area, and spacing.',
      priority: 9,
      validate: (values) =>
        validateAll(
          positive(getScalar(values, 'relativePermittivity'), 'Relative permittivity'),
          positive(getScalar(values, 'plateArea'), 'Plate area'),
          positive(getScalar(values, 'distance'), 'Distance'),
        ),
      compute: (values) =>
        scalar(
          (getScalar(values, 'relativePermittivity') *
            VACUUM_PERMITTIVITY *
            getScalar(values, 'plateArea')) /
            getScalar(values, 'distance'),
        ),
    },
    {
      id: 'relative-permittivity-from-capacitance-area-and-distance',
      target: 'relativePermittivity',
      inputs: ['capacitance', 'plateArea', 'distance'],
      displayFormula: 'eps_r = Cd / (epsilon_0 A)',
      description: 'Computes dielectric constant from capacitance geometry.',
      priority: 9,
      validate: (values) =>
        validateAll(
          positive(getScalar(values, 'capacitance'), 'Capacitance'),
          positive(getScalar(values, 'plateArea'), 'Plate area'),
          positive(getScalar(values, 'distance'), 'Distance'),
        ),
      compute: (values) =>
        scalar(
          (getScalar(values, 'capacitance') * getScalar(values, 'distance')) /
            (VACUUM_PERMITTIVITY * getScalar(values, 'plateArea')),
        ),
    },
    {
      id: 'plate-area-from-capacitance-relative-permittivity-and-distance',
      target: 'plateArea',
      inputs: ['capacitance', 'relativePermittivity', 'distance'],
      displayFormula: 'A = Cd / (eps_r epsilon_0)',
      description: 'Computes plate area from capacitance, dielectric constant, and spacing.',
      priority: 9,
      validate: (values) =>
        validateAll(
          positive(getScalar(values, 'capacitance'), 'Capacitance'),
          positive(getScalar(values, 'relativePermittivity'), 'Relative permittivity'),
          positive(getScalar(values, 'distance'), 'Distance'),
        ),
      compute: (values) =>
        scalar(
          (getScalar(values, 'capacitance') * getScalar(values, 'distance')) /
            (getScalar(values, 'relativePermittivity') * VACUUM_PERMITTIVITY),
        ),
    },
    {
      id: 'distance-from-capacitance-relative-permittivity-and-area',
      target: 'distance',
      inputs: ['capacitance', 'relativePermittivity', 'plateArea'],
      displayFormula: 'd = eps_r epsilon_0 A / C',
      description: 'Computes plate spacing from capacitance, dielectric constant, and area.',
      priority: 9,
      validate: (values) =>
        validateAll(
          positive(getScalar(values, 'capacitance'), 'Capacitance'),
          positive(getScalar(values, 'relativePermittivity'), 'Relative permittivity'),
          positive(getScalar(values, 'plateArea'), 'Plate area'),
        ),
      compute: (values) =>
        scalar(
          (getScalar(values, 'relativePermittivity') *
            VACUUM_PERMITTIVITY *
            getScalar(values, 'plateArea')) /
            getScalar(values, 'capacitance'),
        ),
    },
  ]),
  family('dielectric-breakdown-voltage', 'Breakdown field and maximum voltage', '10', [
    {
      id: 'voltage-from-dielectric-strength-and-distance',
      target: 'voltage',
      inputs: ['dielectricStrength', 'distance'],
      displayFormula: 'Vmax = Emax d',
      description: 'Computes the maximum safe voltage from dielectric strength and spacing.',
      priority: 8,
      compute: (values) =>
        scalar(getScalar(values, 'dielectricStrength') * getScalar(values, 'distance')),
    },
    {
      id: 'dielectric-strength-from-voltage-and-distance',
      target: 'dielectricStrength',
      inputs: ['voltage', 'distance'],
      displayFormula: 'Emax = Vmax / d',
      description: 'Computes dielectric strength from maximum voltage and spacing.',
      priority: 8,
      validate: (values) => nonZero(getScalar(values, 'distance'), 'Distance'),
      compute: (values) => scalar(getScalar(values, 'voltage') / getScalar(values, 'distance')),
    },
    {
      id: 'distance-from-voltage-and-dielectric-strength',
      target: 'distance',
      inputs: ['voltage', 'dielectricStrength'],
      displayFormula: 'd = Vmax / Emax',
      description: 'Computes required spacing from maximum voltage and dielectric strength.',
      priority: 8,
      validate: (values) => nonZero(getScalar(values, 'dielectricStrength'), 'Dielectric strength'),
      compute: (values) => scalar(getScalar(values, 'voltage') / getScalar(values, 'dielectricStrength')),
    },
  ]),
  family('charge-voltage-capacitance', 'Charge, voltage, and capacitance', '10', [
    {
      id: 'charge-from-capacitance-and-voltage',
      target: 'charge',
      inputs: ['capacitance', 'voltage'],
      displayFormula: 'Q = CV',
      description: 'Computes charge from capacitance and voltage.',
      priority: 8,
      compute: (values) => scalar(getScalar(values, 'capacitance') * getScalar(values, 'voltage')),
    },
    {
      id: 'capacitance-from-charge-and-voltage',
      target: 'capacitance',
      inputs: ['charge', 'voltage'],
      displayFormula: 'C = Q / V',
      description: 'Computes capacitance from charge and voltage.',
      priority: 8,
      validate: (values) => nonZero(getScalar(values, 'voltage'), 'Voltage'),
      compute: (values) => scalar(getScalar(values, 'charge') / getScalar(values, 'voltage')),
    },
    {
      id: 'voltage-from-charge-and-capacitance',
      target: 'voltage',
      inputs: ['charge', 'capacitance'],
      displayFormula: 'V = Q / C',
      description: 'Computes voltage from charge and capacitance.',
      priority: 8,
      validate: (values) => nonZero(getScalar(values, 'capacitance'), 'Capacitance'),
      compute: (values) => scalar(getScalar(values, 'charge') / getScalar(values, 'capacitance')),
    },
  ]),
  family('parallel-capacitors', 'Parallel capacitors', '10', [
    {
      id: 'total-capacitance-parallel',
      target: 'totalCapacitance',
      inputs: ['parallelCapacitorList'],
      displayFormula: 'CT = sum(Cn)',
      description: 'Computes total capacitance for capacitors in parallel.',
      priority: 8,
      validate: (values) =>
        getScalarList(values, 'parallelCapacitorList').every((entry) => entry > 0)
          ? undefined
          : 'All parallel capacitor values must be positive.',
      compute: (values) =>
        scalar(getScalarList(values, 'parallelCapacitorList').reduce((total, entry) => total + entry, 0)),
    },
  ]),
  family('series-capacitors', 'Series capacitors', '10', [
    {
      id: 'total-capacitance-series',
      target: 'totalCapacitance',
      inputs: ['seriesCapacitorList'],
      displayFormula: '1 / CT = sum(1 / Cn)',
      description: 'Computes total capacitance for capacitors in series.',
      priority: 8,
      validate: (values) =>
        getScalarList(values, 'seriesCapacitorList').every((entry) => entry > 0)
          ? undefined
          : 'All series capacitor values must be positive.',
      compute: (values) => {
        const denominator = getScalarList(values, 'seriesCapacitorList').reduce(
          (total, entry) => total + 1 / entry,
          0,
        )
        return scalar(1 / denominator)
      },
    },
  ]),
  family('tau-rc', 'RC time constant', '10', [
    {
      id: 'tau-from-r-and-c',
      target: 'timeConstant',
      inputs: ['resistance', 'capacitance'],
      displayFormula: 'tau = RC',
      description: 'Computes RC time constant.',
      priority: 8,
      compute: (values) => scalar(getScalar(values, 'resistance') * getScalar(values, 'capacitance')),
    },
    {
      id: 'resistance-from-tau-and-c',
      target: 'resistance',
      inputs: ['timeConstant', 'capacitance'],
      displayFormula: 'R = tau / C',
      description: 'Computes resistance from RC time constant and capacitance.',
      priority: 8,
      validate: (values) => nonZero(getScalar(values, 'capacitance'), 'Capacitance'),
      compute: (values) => scalar(getScalar(values, 'timeConstant') / getScalar(values, 'capacitance')),
    },
    {
      id: 'capacitance-from-tau-and-r',
      target: 'capacitance',
      inputs: ['timeConstant', 'resistance'],
      displayFormula: 'C = tau / R',
      description: 'Computes capacitance from RC time constant and resistance.',
      priority: 8,
      validate: (values) => nonZero(getScalar(values, 'resistance'), 'Resistance'),
      compute: (values) => scalar(getScalar(values, 'timeConstant') / getScalar(values, 'resistance')),
    },
  ]),
  family('tau-rl', 'RL time constant', '11', [
    {
      id: 'tau-from-l-and-r',
      target: 'timeConstant',
      inputs: ['inductance', 'resistance'],
      displayFormula: 'tau = L / R',
      description: 'Computes RL time constant.',
      priority: 8,
      validate: (values) => nonZero(getScalar(values, 'resistance'), 'Resistance'),
      compute: (values) => scalar(getScalar(values, 'inductance') / getScalar(values, 'resistance')),
    },
    {
      id: 'inductance-from-tau-and-r',
      target: 'inductance',
      inputs: ['timeConstant', 'resistance'],
      displayFormula: 'L = tau R',
      description: 'Computes inductance from RL time constant and resistance.',
      priority: 8,
      compute: (values) => scalar(getScalar(values, 'timeConstant') * getScalar(values, 'resistance')),
    },
    {
      id: 'resistance-from-l-and-tau',
      target: 'resistance',
      inputs: ['inductance', 'timeConstant'],
      displayFormula: 'R = L / tau',
      description: 'Computes resistance from inductance and RL time constant.',
      priority: 8,
      validate: (values) => nonZero(getScalar(values, 'timeConstant'), 'Time constant'),
      compute: (values) => scalar(getScalar(values, 'inductance') / getScalar(values, 'timeConstant')),
    },
  ]),
  family('rc-charging', 'RC charging equation', '10', [
    {
      id: 'rc-voltage-from-final-time-tau',
      target: 'rcChargingVoltage',
      inputs: ['finalVoltage', 'elapsedTime', 'timeConstant'],
      displayFormula: 'vC(t) = Vfinal (1 - e^(-t/tau))',
      description: 'Computes capacitor charging voltage at time t.',
      priority: 8,
      validate: (values) => positive(getScalar(values, 'timeConstant'), 'Time constant'),
      compute: (values) =>
        scalar(
          getScalar(values, 'finalVoltage') *
            (1 - Math.exp(-getScalar(values, 'elapsedTime') / getScalar(values, 'timeConstant'))),
        ),
    },
    {
      id: 'time-from-rc-voltage-final-and-tau',
      target: 'elapsedTime',
      inputs: ['rcChargingVoltage', 'finalVoltage', 'timeConstant'],
      displayFormula: 't = -tau ln(1 - vC / Vfinal)',
      description: 'Computes elapsed time from the RC charging voltage.',
      priority: 8,
      validate: (values) => {
        const finalVoltage = getScalar(values, 'finalVoltage')
        const ratio = getScalar(values, 'rcChargingVoltage') / finalVoltage
        return validateAll(
          positive(getScalar(values, 'timeConstant'), 'Time constant'),
          nonZero(finalVoltage, 'Final voltage'),
          ratio > 0 && ratio < 1
            ? undefined
            : 'vC / Vfinal must stay strictly between 0 and 1 for the inverse charging solve.',
        )
      },
      compute: (values) =>
        scalar(
          -getScalar(values, 'timeConstant') *
            Math.log(1 - getScalar(values, 'rcChargingVoltage') / getScalar(values, 'finalVoltage')),
        ),
    },
    {
      id: 'final-voltage-from-rc-voltage-time-and-tau',
      target: 'finalVoltage',
      inputs: ['rcChargingVoltage', 'elapsedTime', 'timeConstant'],
      displayFormula: 'Vfinal = vC / (1 - e^(-t/tau))',
      description: 'Computes final voltage from RC charging voltage, time, and time constant.',
      priority: 8,
      validate: (values) => {
        const denominator = 1 - Math.exp(-getScalar(values, 'elapsedTime') / getScalar(values, 'timeConstant'))
        return validateAll(
          positive(getScalar(values, 'timeConstant'), 'Time constant'),
          nonZero(denominator, '1 - e^(-t/tau)'),
        )
      },
      compute: (values) =>
        scalar(
          getScalar(values, 'rcChargingVoltage') /
            (1 - Math.exp(-getScalar(values, 'elapsedTime') / getScalar(values, 'timeConstant'))),
        ),
    },
  ]),
  family('rc-charging-current', 'RC charging current', '10', [
    {
      id: 'rc-current-from-initial-time-and-tau',
      target: 'rcChargingCurrent',
      inputs: ['current', 'elapsedTime', 'timeConstant'],
      displayFormula: 'iC(t) = Iinitial e^(-t/tau)',
      description: 'Computes capacitor charging current at time t.',
      priority: 8,
      validate: (values) => positive(getScalar(values, 'timeConstant'), 'Time constant'),
      compute: (values) =>
        scalar(
          getScalar(values, 'current') *
            Math.exp(-getScalar(values, 'elapsedTime') / getScalar(values, 'timeConstant')),
        ),
    },
    {
      id: 'time-from-rc-current-initial-and-tau',
      target: 'elapsedTime',
      inputs: ['rcChargingCurrent', 'current', 'timeConstant'],
      displayFormula: 't = -tau ln(iC / Iinitial)',
      description: 'Computes elapsed time from capacitor charging current.',
      priority: 8,
      validate: (values) => {
        const initialCurrent = getScalar(values, 'current')
        const ratio = getScalar(values, 'rcChargingCurrent') / initialCurrent
        return validateAll(
          positive(getScalar(values, 'timeConstant'), 'Time constant'),
          nonZero(initialCurrent, 'Initial current'),
          ratio > 0 && ratio < 1
            ? undefined
            : 'iC / Iinitial must stay strictly between 0 and 1 for the inverse charging-current solve.',
        )
      },
      compute: (values) =>
        scalar(
          -getScalar(values, 'timeConstant') *
            Math.log(getScalar(values, 'rcChargingCurrent') / getScalar(values, 'current')),
        ),
    },
    {
      id: 'initial-current-from-rc-current-time-and-tau',
      target: 'current',
      inputs: ['rcChargingCurrent', 'elapsedTime', 'timeConstant'],
      displayFormula: 'Iinitial = iC / e^(-t/tau)',
      description: 'Computes initial charging current from the current at time t.',
      priority: 8,
      validate: (values) => positive(getScalar(values, 'timeConstant'), 'Time constant'),
      compute: (values) =>
        scalar(
          getScalar(values, 'rcChargingCurrent') /
            Math.exp(-getScalar(values, 'elapsedTime') / getScalar(values, 'timeConstant')),
        ),
    },
  ]),
  family('rc-discharging-voltage', 'RC discharging voltage', '10', [
    {
      id: 'rc-discharge-voltage-from-initial-time-and-tau',
      target: 'rcDischargingVoltage',
      inputs: ['voltage', 'elapsedTime', 'timeConstant'],
      displayFormula: 'vC(t) = Vinitial e^(-t/tau)',
      description: 'Computes capacitor discharging voltage at time t.',
      priority: 8,
      validate: (values) => positive(getScalar(values, 'timeConstant'), 'Time constant'),
      compute: (values) =>
        scalar(
          getScalar(values, 'voltage') *
            Math.exp(-getScalar(values, 'elapsedTime') / getScalar(values, 'timeConstant')),
        ),
    },
    {
      id: 'time-from-rc-discharge-voltage-initial-and-tau',
      target: 'elapsedTime',
      inputs: ['rcDischargingVoltage', 'voltage', 'timeConstant'],
      displayFormula: 't = -tau ln(vC / Vinitial)',
      description: 'Computes elapsed time from capacitor discharging voltage.',
      priority: 8,
      validate: (values) => {
        const initialVoltage = getScalar(values, 'voltage')
        const ratio = getScalar(values, 'rcDischargingVoltage') / initialVoltage
        return validateAll(
          positive(getScalar(values, 'timeConstant'), 'Time constant'),
          nonZero(initialVoltage, 'Initial voltage'),
          ratio > 0 && ratio < 1
            ? undefined
            : 'vC / Vinitial must stay strictly between 0 and 1 for the inverse discharging-voltage solve.',
        )
      },
      compute: (values) =>
        scalar(
          -getScalar(values, 'timeConstant') *
            Math.log(getScalar(values, 'rcDischargingVoltage') / getScalar(values, 'voltage')),
        ),
    },
    {
      id: 'initial-voltage-from-rc-discharge-voltage-time-and-tau',
      target: 'voltage',
      inputs: ['rcDischargingVoltage', 'elapsedTime', 'timeConstant'],
      displayFormula: 'Vinitial = vC / e^(-t/tau)',
      description: 'Computes initial capacitor voltage from the discharging voltage at time t.',
      priority: 8,
      validate: (values) => positive(getScalar(values, 'timeConstant'), 'Time constant'),
      compute: (values) =>
        scalar(
          getScalar(values, 'rcDischargingVoltage') /
            Math.exp(-getScalar(values, 'elapsedTime') / getScalar(values, 'timeConstant')),
        ),
    },
  ]),
  family('rc-discharging-current', 'RC discharging current', '10', [
    {
      id: 'rc-discharge-current-from-initial-time-and-tau',
      target: 'rcDischargingCurrent',
      inputs: ['current', 'elapsedTime', 'timeConstant'],
      displayFormula: 'iC(t) = Iinitial e^(-t/tau)',
      description: 'Computes capacitor discharging current at time t.',
      priority: 8,
      validate: (values) => positive(getScalar(values, 'timeConstant'), 'Time constant'),
      compute: (values) =>
        scalar(
          getScalar(values, 'current') *
            Math.exp(-getScalar(values, 'elapsedTime') / getScalar(values, 'timeConstant')),
        ),
    },
    {
      id: 'time-from-rc-discharge-current-initial-and-tau',
      target: 'elapsedTime',
      inputs: ['rcDischargingCurrent', 'current', 'timeConstant'],
      displayFormula: 't = -tau ln(iC / Iinitial)',
      description: 'Computes elapsed time from capacitor discharging current.',
      priority: 8,
      validate: (values) => {
        const initialCurrent = getScalar(values, 'current')
        const ratio = getScalar(values, 'rcDischargingCurrent') / initialCurrent
        return validateAll(
          positive(getScalar(values, 'timeConstant'), 'Time constant'),
          nonZero(initialCurrent, 'Initial current'),
          ratio > 0 && ratio < 1
            ? undefined
            : 'iC / Iinitial must stay strictly between 0 and 1 for the inverse discharging-current solve.',
        )
      },
      compute: (values) =>
        scalar(
          -getScalar(values, 'timeConstant') *
            Math.log(getScalar(values, 'rcDischargingCurrent') / getScalar(values, 'current')),
        ),
    },
    {
      id: 'initial-current-from-rc-discharge-current-time-and-tau',
      target: 'current',
      inputs: ['rcDischargingCurrent', 'elapsedTime', 'timeConstant'],
      displayFormula: 'Iinitial = iC / e^(-t/tau)',
      description: 'Computes initial discharging current from the current at time t.',
      priority: 8,
      validate: (values) => positive(getScalar(values, 'timeConstant'), 'Time constant'),
      compute: (values) =>
        scalar(
          getScalar(values, 'rcDischargingCurrent') /
            Math.exp(-getScalar(values, 'elapsedTime') / getScalar(values, 'timeConstant')),
        ),
    },
  ]),
  family('capacitor-energy', 'Energy stored by a capacitor', '10', [
    {
      id: 'energy-from-capacitance-and-voltage',
      target: 'storedEnergy',
      inputs: ['capacitance', 'voltage'],
      displayFormula: 'W = 0.5 C V^2',
      description: 'Computes stored energy from capacitance and voltage.',
      priority: 7,
      validate: (values) => positive(getScalar(values, 'capacitance'), 'Capacitance'),
      compute: (values) =>
        scalar(0.5 * getScalar(values, 'capacitance') * getScalar(values, 'voltage') ** 2),
    },
    {
      id: 'energy-from-charge-and-voltage',
      target: 'storedEnergy',
      inputs: ['charge', 'voltage'],
      displayFormula: 'W = 0.5 QV',
      description: 'Computes stored energy from charge and voltage.',
      priority: 7,
      compute: (values) => scalar(0.5 * getScalar(values, 'charge') * getScalar(values, 'voltage')),
    },
    {
      id: 'energy-from-charge-and-capacitance',
      target: 'storedEnergy',
      inputs: ['charge', 'capacitance'],
      displayFormula: 'W = Q^2 / (2C)',
      description: 'Computes stored energy from charge and capacitance.',
      priority: 7,
      validate: (values) => positive(getScalar(values, 'capacitance'), 'Capacitance'),
      compute: (values) =>
        scalar(getScalar(values, 'charge') ** 2 / (2 * getScalar(values, 'capacitance'))),
    },
    {
      id: 'voltage-from-energy-and-capacitance',
      target: 'voltage',
      inputs: ['storedEnergy', 'capacitance'],
      displayFormula: 'V = sqrt(2W / C)',
      description: 'Computes voltage from stored energy and capacitance.',
      priority: 7,
      validate: (values) =>
        validateAll(
          positive(getScalar(values, 'storedEnergy'), 'Stored energy'),
          positive(getScalar(values, 'capacitance'), 'Capacitance'),
        ),
      compute: (values) =>
        scalar(
          Math.sqrt((2 * getScalar(values, 'storedEnergy')) / getScalar(values, 'capacitance')),
        ),
    },
    {
      id: 'capacitance-from-energy-and-voltage',
      target: 'capacitance',
      inputs: ['storedEnergy', 'voltage'],
      displayFormula: 'C = 2W / V^2',
      description: 'Computes capacitance from stored energy and voltage.',
      priority: 7,
      validate: (values) =>
        validateAll(
          positive(getScalar(values, 'storedEnergy'), 'Stored energy'),
          nonZero(getScalar(values, 'voltage'), 'Voltage'),
        ),
      compute: (values) =>
        scalar((2 * getScalar(values, 'storedEnergy')) / getScalar(values, 'voltage') ** 2),
    },
    {
      id: 'charge-from-energy-and-voltage',
      target: 'charge',
      inputs: ['storedEnergy', 'voltage'],
      displayFormula: 'Q = 2W / V',
      description: 'Computes charge from stored energy and voltage.',
      priority: 7,
      validate: (values) =>
        validateAll(
          positive(getScalar(values, 'storedEnergy'), 'Stored energy'),
          nonZero(getScalar(values, 'voltage'), 'Voltage'),
        ),
      compute: (values) =>
        scalar((2 * getScalar(values, 'storedEnergy')) / getScalar(values, 'voltage')),
    },
    {
      id: 'charge-from-energy-and-capacitance',
      target: 'charge',
      inputs: ['storedEnergy', 'capacitance'],
      displayFormula: 'Q = sqrt(2WC)',
      description: 'Computes charge from stored energy and capacitance.',
      priority: 7,
      validate: (values) =>
        validateAll(
          positive(getScalar(values, 'storedEnergy'), 'Stored energy'),
          positive(getScalar(values, 'capacitance'), 'Capacitance'),
        ),
      compute: (values) =>
        scalar(
          Math.sqrt(2 * getScalar(values, 'storedEnergy') * getScalar(values, 'capacitance')),
        ),
    },
  ]),
  family('rl-growth', 'RL growth equation', '11', [
    {
      id: 'rl-current-from-final-time-tau',
      target: 'rlGrowthCurrent',
      inputs: ['finalCurrent', 'elapsedTime', 'timeConstant'],
      displayFormula: 'i(t) = Ifinal (1 - e^(-t/tau))',
      description: 'Computes RL current growth at time t.',
      priority: 8,
      validate: (values) => positive(getScalar(values, 'timeConstant'), 'Time constant'),
      compute: (values) =>
        scalar(
          getScalar(values, 'finalCurrent') *
            (1 - Math.exp(-getScalar(values, 'elapsedTime') / getScalar(values, 'timeConstant'))),
        ),
    },
    {
      id: 'time-from-rl-current-final-and-tau',
      target: 'elapsedTime',
      inputs: ['rlGrowthCurrent', 'finalCurrent', 'timeConstant'],
      displayFormula: 't = -tau ln(1 - i / Ifinal)',
      description: 'Computes elapsed time from RL growth current.',
      priority: 8,
      validate: (values) => {
        const finalCurrent = getScalar(values, 'finalCurrent')
        const ratio = getScalar(values, 'rlGrowthCurrent') / finalCurrent
        return validateAll(
          positive(getScalar(values, 'timeConstant'), 'Time constant'),
          nonZero(finalCurrent, 'Final current'),
          ratio > 0 && ratio < 1
            ? undefined
            : 'i / Ifinal must stay strictly between 0 and 1 for the inverse growth solve.',
        )
      },
      compute: (values) =>
        scalar(
          -getScalar(values, 'timeConstant') *
            Math.log(1 - getScalar(values, 'rlGrowthCurrent') / getScalar(values, 'finalCurrent')),
        ),
    },
    {
      id: 'final-current-from-growth-time-and-tau',
      target: 'finalCurrent',
      inputs: ['rlGrowthCurrent', 'elapsedTime', 'timeConstant'],
      displayFormula: 'Ifinal = i / (1 - e^(-t/tau))',
      description: 'Computes final current from RL growth current, time, and time constant.',
      priority: 8,
      validate: (values) => {
        const denominator = 1 - Math.exp(-getScalar(values, 'elapsedTime') / getScalar(values, 'timeConstant'))
        return validateAll(
          positive(getScalar(values, 'timeConstant'), 'Time constant'),
          nonZero(denominator, '1 - e^(-t/tau)'),
        )
      },
      compute: (values) =>
        scalar(
          getScalar(values, 'rlGrowthCurrent') /
            (1 - Math.exp(-getScalar(values, 'elapsedTime') / getScalar(values, 'timeConstant'))),
        ),
    },
  ]),
  family('inductor-voltage', 'Inductor voltage', '11', [
    {
      id: 'voltage-from-l-and-didt',
      target: 'voltage',
      inputs: ['inductance', 'diDt'],
      displayFormula: 'v = L di/dt',
      description: 'Computes voltage from inductance and di/dt.',
      priority: 7,
      compute: (values) => scalar(getScalar(values, 'inductance') * getScalar(values, 'diDt')),
    },
    {
      id: 'inductance-from-voltage-and-didt',
      target: 'inductance',
      inputs: ['voltage', 'diDt'],
      displayFormula: 'L = v / (di/dt)',
      description: 'Computes inductance from voltage and di/dt.',
      priority: 7,
      validate: (values) => nonZero(getScalar(values, 'diDt'), 'di/dt'),
      compute: (values) => scalar(getScalar(values, 'voltage') / getScalar(values, 'diDt')),
    },
    {
      id: 'didt-from-voltage-and-l',
      target: 'diDt',
      inputs: ['voltage', 'inductance'],
      displayFormula: 'di/dt = v / L',
      description: 'Computes di/dt from voltage and inductance.',
      priority: 7,
      validate: (values) => nonZero(getScalar(values, 'inductance'), 'Inductance'),
      compute: (values) => scalar(getScalar(values, 'voltage') / getScalar(values, 'inductance')),
    },
  ]),
  family('induced-emf', 'Induced emf', '11', [
    {
      id: 'induced-voltage-from-turns-and-flux-rate',
      target: 'inducedVoltage',
      inputs: ['turnCount', 'magneticFluxRate'],
      displayFormula: 'e = N dPhi/dt',
      description: 'Computes induced emf from turns and flux rate.',
      priority: 8,
      compute: (values) => scalar(getScalar(values, 'turnCount') * getScalar(values, 'magneticFluxRate')),
    },
    {
      id: 'turns-from-induced-voltage-and-flux-rate',
      target: 'turnCount',
      inputs: ['inducedVoltage', 'magneticFluxRate'],
      displayFormula: 'N = e / (dPhi/dt)',
      description: 'Computes turns from induced voltage and flux rate.',
      priority: 8,
      validate: (values) => nonZero(getScalar(values, 'magneticFluxRate'), 'dPhi/dt'),
      compute: (values) => scalar(getScalar(values, 'inducedVoltage') / getScalar(values, 'magneticFluxRate')),
    },
    {
      id: 'flux-rate-from-induced-voltage-and-turns',
      target: 'magneticFluxRate',
      inputs: ['inducedVoltage', 'turnCount'],
      displayFormula: 'dPhi/dt = e / N',
      description: 'Computes flux rate from induced voltage and turns.',
      priority: 8,
      validate: (values) => nonZero(getScalar(values, 'turnCount'), 'Turns'),
      compute: (values) => scalar(getScalar(values, 'inducedVoltage') / getScalar(values, 'turnCount')),
    },
  ]),
  family('polar-rectangular', 'Polar and rectangular conversion', 'Study Guide', [
    {
      id: 'rectangular-from-polar',
      target: 'complexRectangular',
      inputs: ['polarMagnitude', 'polarAngle'],
      displayFormula: 'z = r (cos(theta) + j sin(theta))',
      description: 'Converts polar magnitude and angle to rectangular form.',
      priority: 8,
      compute: (values) => fromPolar(getScalar(values, 'polarMagnitude'), getScalar(values, 'polarAngle')),
    },
    {
      id: 'magnitude-from-rectangular',
      target: 'polarMagnitude',
      inputs: ['complexRectangular'],
      displayFormula: 'r = sqrt(a^2 + b^2)',
      description: 'Computes polar magnitude from a complex number.',
      priority: 8,
      compute: (values) => scalar(magnitude(getComplex(values, 'complexRectangular'))),
    },
    {
      id: 'angle-from-rectangular',
      target: 'polarAngle',
      inputs: ['complexRectangular'],
      displayFormula: 'theta = atan2(b, a)',
      description: 'Computes polar angle from a complex number.',
      priority: 8,
      compute: (values) =>
        scalar(
          Math.atan2(
            getComplex(values, 'complexRectangular').imag,
            getComplex(values, 'complexRectangular').real,
          ),
        ),
    },
  ]),
  family('complex-multiplication', 'Complex multiplication', 'Study Guide', [
    {
      id: 'complex-product-from-factors',
      target: 'complexProduct',
      inputs: ['complexFactorA', 'complexFactorB'],
      displayFormula: 'z = z1 * z2',
      description: 'Computes the product of two complex values.',
      priority: 8,
      compute: (values) =>
        multiplyComplex(getComplex(values, 'complexFactorA'), getComplex(values, 'complexFactorB')),
    },
  ]),
  family('wheeler-air-core', 'Wheeler single-layer air-core coil', '15', [
    {
      id: 'inductance-from-wheeler-single-layer',
      target: 'inductance',
      inputs: ['coilRadius', 'coilLength', 'coilTurns'],
      displayFormula: 'L(uH) = (r^2 n^2) / (9r + 10l)',
      description: 'Computes single-layer air-core inductance with the Wheeler formula.',
      priority: 8,
      validate: (values) =>
        validateAll(
          positive(getScalar(values, 'coilRadius'), 'Coil radius'),
          positive(getScalar(values, 'coilLength'), 'Coil length'),
          positive(getScalar(values, 'coilTurns'), 'Coil turns'),
        ),
      compute: (values) => {
        const radiusInches = getScalar(values, 'coilRadius') / INCH_IN_METERS
        const lengthInches = getScalar(values, 'coilLength') / INCH_IN_METERS
        const turns = getScalar(values, 'coilTurns')
        const inductanceMicrohenry =
          (radiusInches ** 2 * turns ** 2) / (9 * radiusInches + 10 * lengthInches)
        return scalar(inductanceMicrohenry * UH_IN_H)
      },
    },
    {
      id: 'coil-turns-from-wheeler-single-layer',
      target: 'coilTurns',
      inputs: ['inductance', 'coilRadius', 'coilLength'],
      displayFormula: 'n = sqrt(L(uH) (9r + 10l) / r^2)',
      description: 'Computes turns for the single-layer Wheeler air-core coil formula.',
      priority: 8,
      validate: (values) =>
        validateAll(
          positive(getScalar(values, 'inductance'), 'Inductance'),
          positive(getScalar(values, 'coilRadius'), 'Coil radius'),
          positive(getScalar(values, 'coilLength'), 'Coil length'),
        ),
      compute: (values) => {
        const radiusInches = getScalar(values, 'coilRadius') / INCH_IN_METERS
        const lengthInches = getScalar(values, 'coilLength') / INCH_IN_METERS
        const inductanceMicrohenry = getScalar(values, 'inductance') / UH_IN_H
        return scalar(
          Math.sqrt(
            (inductanceMicrohenry * (9 * radiusInches + 10 * lengthInches)) /
              (radiusInches ** 2),
          ),
        )
      },
    },
  ]),
]

export const formulaVariants = formulaFamilies.flatMap((familyEntry) => familyEntry.variants)

export const variantsByTarget = formulaVariants.reduce<Record<QuantityId, FormulaVariant[]>>(
  (accumulator, variant) => {
    const current = accumulator[variant.target] ?? []
    current.push(variant)
    accumulator[variant.target] = current
    return accumulator
  },
  {} as Record<QuantityId, FormulaVariant[]>,
)
