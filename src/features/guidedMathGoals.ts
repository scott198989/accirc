import { quantityMap, solveCircuitProblem, type QuantityId, type SolveResult, type SolverInputRow } from '../core'
import {
  solveGuidedWaveformExpression,
  type GuidedWaveformExpressionGoal,
  type GuidedWaveformExpressionResult,
} from './guidedWaveformExpressions'

export interface GuidedMathGoalDefinition {
  id: string
  chapter: string
  section: string
  label: string
  description: string
  formulaSummary?: string[]
  target?: QuantityId
  waveformGoal?: GuidedWaveformExpressionGoal
  inputs: QuantityId[]
  note?: string
}

export type GuidedMathResult = SolveResult | GuidedWaveformExpressionResult

export const guidedMathGoals: GuidedMathGoalDefinition[] = [
  {
    id: 'electric-field-from-force-and-charge',
    chapter: '10',
    section: 'Electrostatics',
    label: 'Find electric field from force and charge',
    description: 'Use this when the problem gives F and Q and asks for field strength.',
    target: 'electricFieldStrength',
    inputs: ['electricForce', 'charge'],
  },
  {
    id: 'point-electric-field-from-charge-and-distance',
    chapter: '10',
    section: 'Electrostatics',
    label: 'Find point-charge electric field from charge and distance',
    description: 'Use this when the problem gives Q and distance from the charge.',
    target: 'electricFieldStrength',
    inputs: ['charge', 'distance'],
  },
  {
    id: 'plate-electric-field-from-voltage-and-distance',
    chapter: '10',
    section: 'Electrostatics',
    label: 'Find electric field from voltage and plate spacing',
    description: 'Use this when the problem gives applied voltage and plate spacing.',
    target: 'electricFieldStrength',
    inputs: ['voltage', 'distance'],
  },
  {
    id: 'air-capacitance-from-plate-geometry',
    chapter: '10',
    section: 'Capacitor geometry',
    label: 'Find air-capacitor capacitance from plate area and spacing',
    description: 'Use this for parallel-plate air capacitors when only A and d are given.',
    target: 'capacitance',
    inputs: ['plateArea', 'distance'],
  },
  {
    id: 'capacitance-from-relative-permittivity-and-geometry',
    chapter: '10',
    section: 'Capacitor geometry',
    label: 'Find capacitance from dielectric constant, area, and spacing',
    description: 'Use this when the problem gives eps_r, A, and d.',
    target: 'capacitance',
    inputs: ['relativePermittivity', 'plateArea', 'distance'],
  },
  {
    id: 'relative-permittivity-from-permittivity',
    chapter: '10',
    section: 'Capacitor geometry',
    label: 'Find relative permittivity from permittivity',
    description: 'Use this when the problem gives epsilon and asks for eps_r.',
    target: 'relativePermittivity',
    inputs: ['permittivity'],
  },
  {
    id: 'capacitance-from-relative-permittivity-and-air-capacitance',
    chapter: '10',
    section: 'Capacitor geometry',
    label: 'Find capacitance from dielectric constant and air capacitance',
    description: 'Use this when the problem gives eps_r and the original air-capacitor value C0.',
    target: 'capacitance',
    inputs: ['relativePermittivity', 'airCapacitance'],
  },
  {
    id: 'maximum-voltage-from-dielectric-strength-and-distance',
    chapter: '10',
    section: 'Dielectric limits',
    label: 'Find maximum voltage from dielectric strength and spacing',
    description: 'Use this when the problem asks for the breakdown-limited Vmax.',
    target: 'voltage',
    inputs: ['dielectricStrength', 'distance'],
  },
  {
    id: 'period-from-frequency',
    chapter: '13',
    section: 'Waveforms and frequency',
    label: 'Find period from frequency',
    description: 'Best when the problem gives f and asks for one cycle time.',
    target: 'period',
    inputs: ['frequency'],
  },
  {
    id: 'frequency-from-period',
    chapter: '13',
    section: 'Waveforms and frequency',
    label: 'Find frequency from period',
    description: 'Best when the problem gives T and asks for hertz.',
    target: 'frequency',
    inputs: ['period'],
  },
  {
    id: 'time-from-cycles-and-period',
    chapter: '13',
    section: 'Waveforms and frequency',
    label: 'Find elapsed time from cycles and period',
    description: 'Use this when the problem gives N cycles and T.',
    target: 'elapsedTime',
    inputs: ['cycleCount', 'period'],
  },
  {
    id: 'omega-from-frequency',
    chapter: '13',
    section: 'Waveforms and frequency',
    label: 'Find angular frequency from frequency',
    description: 'Converts hertz into radians per second.',
    target: 'angularFrequency',
    inputs: ['frequency'],
  },
  {
    id: 'rms-voltage-from-peak',
    chapter: '13',
    section: 'Waveform magnitudes',
    label: 'Find RMS voltage from peak voltage',
    description: 'Best when the question gives Vm and asks for Vrms.',
    target: 'rmsVoltage',
    inputs: ['peakVoltage'],
  },
  {
    id: 'peak-voltage-from-rms',
    chapter: '13',
    section: 'Waveform magnitudes',
    label: 'Find peak voltage from RMS voltage',
    description: 'Best when the question gives Vrms and asks for Vm.',
    target: 'peakVoltage',
    inputs: ['rmsVoltage'],
  },
  {
    id: 'rms-current-from-peak',
    chapter: '13',
    section: 'Waveform magnitudes',
    label: 'Find RMS current from peak current',
    description: 'Best when the question gives Im and asks for Irms.',
    target: 'rmsCurrent',
    inputs: ['peakCurrent'],
  },
  {
    id: 'degrees-to-radians',
    chapter: '13',
    section: 'Angle conversion',
    label: 'Convert degrees to radians',
    description: 'Turns an angle in degrees into radians.',
    target: 'angleRadians',
    inputs: ['angleDegrees'],
  },
  {
    id: 'radians-to-degrees',
    chapter: '13',
    section: 'Angle conversion',
    label: 'Convert radians to degrees',
    description: 'Turns an angle in radians into degrees.',
    target: 'angleDegrees',
    inputs: ['angleRadians'],
  },
  {
    id: 'capacitive-reactance-from-frequency-and-capacitance',
    chapter: '14',
    section: 'Capacitors',
    label: 'Find capacitive reactance from frequency and capacitance',
    description: 'Use this when the problem gives f and C and asks for XC.',
    target: 'capacitiveReactance',
    inputs: ['frequency', 'capacitance'],
  },
  {
    id: 'charge-from-capacitance-and-voltage',
    chapter: '10',
    section: 'Capacitors',
    label: 'Find charge from capacitance and voltage',
    description: 'Use this when the problem gives C and V and asks for Q.',
    target: 'charge',
    inputs: ['capacitance', 'voltage'],
  },
  {
    id: 'current-from-capacitance-and-dvdt',
    chapter: '10',
    section: 'Capacitor current',
    label: 'Find capacitor current from capacitance and dv/dt',
    description: 'Use this when the problem gives C and the voltage rate of change.',
    target: 'current',
    inputs: ['capacitance', 'dvDt'],
  },
  {
    id: 'parallel-capacitance-total',
    chapter: '10',
    section: 'Capacitor combinations',
    label: 'Find total capacitance of capacitors in parallel',
    description: 'Enter all capacitor values in one comma-separated list.',
    target: 'totalCapacitance',
    inputs: ['parallelCapacitorList'],
    note: 'Enter values like 1, 2.2, 4.7 and then choose the unit once.',
  },
  {
    id: 'series-capacitance-total',
    chapter: '10',
    section: 'Capacitor combinations',
    label: 'Find total capacitance of capacitors in series',
    description: 'Enter all capacitor values in one comma-separated list.',
    target: 'totalCapacitance',
    inputs: ['seriesCapacitorList'],
    note: 'Enter values like 1, 2.2, 4.7 and then choose the unit once.',
  },
  {
    id: 'tau-from-r-and-c',
    chapter: '10',
    section: 'RC transients',
    label: 'Find RC time constant from resistance and capacitance',
    description: 'Use this when the problem asks for tau in an RC circuit.',
    target: 'timeConstant',
    inputs: ['resistance', 'capacitance'],
  },
  {
    id: 'rc-charging-voltage',
    chapter: '10',
    section: 'RC transients',
    label: 'Find capacitor charging voltage at time t',
    description: 'Use this when the problem gives final voltage, time, and tau.',
    target: 'rcChargingVoltage',
    inputs: ['finalVoltage', 'elapsedTime', 'timeConstant'],
  },
  {
    id: 'rc-charging-current',
    chapter: '10',
    section: 'RC transients',
    label: 'Find capacitor charging current at time t',
    description: 'Use this when the problem gives the initial charging current, time, and tau.',
    target: 'rcChargingCurrent',
    inputs: ['current', 'elapsedTime', 'timeConstant'],
  },
  {
    id: 'rc-discharging-voltage',
    chapter: '10',
    section: 'RC transients',
    label: 'Find capacitor discharging voltage at time t',
    description: 'Use this when the problem gives the initial voltage, time, and tau.',
    target: 'rcDischargingVoltage',
    inputs: ['voltage', 'elapsedTime', 'timeConstant'],
  },
  {
    id: 'rc-discharging-current',
    chapter: '10',
    section: 'RC transients',
    label: 'Find capacitor discharging current at time t',
    description: 'Use this when the problem gives the initial discharging current, time, and tau.',
    target: 'rcDischargingCurrent',
    inputs: ['current', 'elapsedTime', 'timeConstant'],
  },
  {
    id: 'stored-energy-from-capacitance-and-voltage',
    chapter: '10',
    section: 'Capacitor energy',
    label: 'Find stored energy from capacitance and voltage',
    description: 'Use this when the problem gives C and V and asks for stored energy.',
    target: 'storedEnergy',
    inputs: ['capacitance', 'voltage'],
  },
  {
    id: 'inductive-reactance-from-frequency-and-inductance',
    chapter: '14',
    section: 'Basic elements and phasors',
    label: 'Find inductive reactance from frequency and inductance',
    description: 'Use this when the problem gives f and L and asks for XL.',
    formulaSummary: ['XL = 2pi f L'],
    target: 'inductiveReactance',
    inputs: ['frequency', 'inductance'],
  },
  {
    id: 'inductance-from-reactance-and-frequency',
    chapter: '14',
    section: 'Basic elements and phasors',
    label: 'Find inductance from reactance and frequency',
    description: 'Use this when the problem gives XL and f and asks for L.',
    target: 'inductance',
    inputs: ['inductiveReactance', 'frequency'],
  },
  {
    id: 'power-factor-from-phase-angle',
    chapter: '14',
    section: 'Average power and power factor',
    label: 'Find power factor from phase angle',
    description: 'Use this when the problem gives theta and asks for the power factor.',
    formulaSummary: ['pf = cos(theta)', 'Use the sign or context to label the result leading or lagging.'],
    target: 'powerFactor',
    inputs: ['phaseAngle'],
  },
  {
    id: 'series-impedance-from-r-and-xl',
    chapter: '15',
    section: 'Series AC impedance',
    label: 'Find total series RL impedance from resistance and XL',
    description: 'Use this when the problem gives R and XL and asks for total impedance in rectangular or polar form.',
    formulaSummary: ['Z = R + jXL', '|Z| = sqrt(R^2 + XL^2)', 'theta = atan(XL / R)'],
    target: 'impedanceComplex',
    inputs: ['resistance', 'inductiveReactance'],
    note: 'The answer panel shows both rectangular and polar form for the same solve.',
  },
  {
    id: 'series-impedance-from-r-and-xc',
    chapter: '15',
    section: 'Series AC impedance',
    label: 'Find total series RC impedance from resistance and XC',
    description: 'Use this when the problem gives R and XC and asks for total impedance in rectangular or polar form.',
    formulaSummary: ['Z = R - jXC', '|Z| = sqrt(R^2 + XC^2)', 'theta = atan(-XC / R)'],
    target: 'impedanceComplex',
    inputs: ['resistance', 'capacitiveReactance'],
    note: 'The answer panel shows both rectangular and polar form for the same solve.',
  },
  {
    id: 'series-impedance-from-r-xl-xc',
    chapter: '15',
    section: 'Series AC impedance',
    label: 'Find total series impedance from resistance, XL, and XC',
    description: 'Use this when the problem gives R, XL, and XC and asks for total impedance in rectangular or polar form.',
    formulaSummary: ['X = XL - XC', 'Z = R + j(XL - XC)', '|Z| = sqrt(R^2 + X^2)'],
    target: 'impedanceComplex',
    inputs: ['resistance', 'inductiveReactance', 'capacitiveReactance'],
    note: 'This is the cleanest match for series RLC quiz questions like Figure 15.3 or direct ZT multiple-choice prompts.',
  },
  {
    id: 'series-impedance-magnitude-from-r-f-l',
    chapter: '15',
    section: 'Series AC impedance',
    label: 'Find coil or series RL impedance magnitude from resistance, frequency, and inductance',
    description: 'Use this when the problem gives internal R, f, and L for a coil or RL branch.',
    formulaSummary: ['XL = 2pi f L', '|Z| = sqrt(R^2 + XL^2)'],
    target: 'impedanceMagnitude',
    inputs: ['resistance', 'frequency', 'inductance'],
  },
  {
    id: 'series-impedance-magnitude-from-r-f-c',
    chapter: '15',
    section: 'Series AC impedance',
    label: 'Find RC series impedance magnitude from resistance, frequency, and capacitance',
    description: 'Use this when the problem gives R, f, and C for an RC branch.',
    formulaSummary: ['XC = 1 / (2pi f C)', '|Z| = sqrt(R^2 + XC^2)'],
    target: 'impedanceMagnitude',
    inputs: ['resistance', 'frequency', 'capacitance'],
  },
  {
    id: 'net-reactance-from-frequency-inductance-and-capacitance',
    chapter: '15',
    section: 'Series AC impedance',
    label: 'Find net reactance from frequency, inductance, and capacitance',
    description: 'Use this when the problem gives f, L, and C and asks for the overall reactance.',
    formulaSummary: ['XL = 2pi f L', 'XC = 1 / (2pi f C)', 'X = XL - XC'],
    target: 'netReactance',
    inputs: ['frequency', 'inductance', 'capacitance'],
  },
  {
    id: 'inductor-impedance-from-frequency-and-inductance',
    chapter: '15',
    section: 'Basic elements and phasors',
    label: 'Find inductor impedance from frequency and inductance',
    description: 'Use this when the problem gives f and L and asks for the inductor impedance.',
    formulaSummary: ['XL = 2pi f L', 'ZL = jXL = XL angle +90 deg'],
    target: 'inductiveImpedance',
    inputs: ['frequency', 'inductance'],
  },
  {
    id: 'capacitor-impedance-from-frequency-and-capacitance',
    chapter: '15',
    section: 'Basic elements and phasors',
    label: 'Find capacitor impedance in rectangular form from frequency and capacitance',
    description: 'Use this when the problem gives f and C and asks for capacitor impedance, especially in rectangular form.',
    formulaSummary: ['XC = 1 / (2pi f C)', 'ZC = -jXC = XC angle -90 deg'],
    target: 'capacitiveImpedance',
    inputs: ['frequency', 'capacitance'],
  },
  {
    id: 'voltage-phasor-from-magnitude-and-angle',
    chapter: '15',
    section: 'Waveform and phasor conversion',
    label: 'Convert a voltage phasor from polar to rectangular form',
    description: 'Use this when the problem gives a voltage magnitude and a polar angle and asks for the rectangular equation.',
    formulaSummary: ['Vx = V cos(theta)', 'Vy = V sin(theta)', 'V = Vx + jVy'],
    target: 'phasorSourceVoltage',
    inputs: ['voltage', 'polarAngle'],
  },
  {
    id: 'current-phasor-from-sine-expression',
    chapter: '15',
    section: 'Waveform and phasor conversion',
    label: 'Find current phasor from a sinusoidal current expression',
    description: 'Use this when the problem gives a sine-wave current amplitude and phase and asks for the phasor.',
    target: 'phasorCurrent',
    inputs: ['peakCurrent', 'waveformPhaseAngle'],
    note: 'Enter the peak current and the phase angle exactly as they appear in the sine expression. The app converts that into the textbook RMS phasor by shifting the angle by -90 deg.',
  },
  {
    id: 'voltage-phasor-from-sine-expression',
    chapter: '15',
    section: 'Waveform and phasor conversion',
    label: 'Find voltage phasor from a sinusoidal voltage expression',
    description: 'Use this when the problem gives a sine-wave voltage amplitude and phase and asks for the phasor.',
    target: 'phasorSourceVoltage',
    inputs: ['peakVoltage', 'waveformPhaseAngle'],
    note: 'Enter the peak voltage and the phase angle exactly as they appear in the sine expression. The app converts that into the textbook RMS phasor by shifting the angle by -90 deg.',
  },
  {
    id: 'current-sine-expression-from-phasor',
    chapter: '15',
    section: 'Waveform and phasor conversion',
    label: 'Write a current phasor as a sinusoidal current expression',
    description: 'Use this when the problem gives an RMS current phasor and omega and asks for i(t).',
    waveformGoal: 'current-sine-expression-from-phasor',
    inputs: ['phasorCurrent', 'angularFrequency'],
    note: 'Enter the textbook RMS phasor in rectangular or polar form plus omega. The app converts the phasor angle back to the sine-wave angle by adding 90 deg and then writes the peak-value sine expression.',
  },
  {
    id: 'voltage-sine-expression-from-phasor',
    chapter: '15',
    section: 'Waveform and phasor conversion',
    label: 'Write a voltage phasor as a sinusoidal voltage expression',
    description: 'Use this when the problem gives an RMS voltage phasor and omega and asks for v(t).',
    waveformGoal: 'voltage-sine-expression-from-phasor',
    inputs: ['phasorSourceVoltage', 'angularFrequency'],
    note: 'Enter the textbook RMS phasor in rectangular or polar form plus omega. The app converts the phasor angle back to the sine-wave angle by adding 90 deg and then writes the peak-value sine expression.',
  },
  {
    id: 'real-power-from-current-and-resistance',
    chapter: '15',
    section: 'Series AC power',
    label: 'Find real power from current and resistance',
    description: 'Use this when the problem gives I and R and asks for P.',
    target: 'realPower',
    inputs: ['current', 'resistance'],
  },
  {
    id: 'impedance-from-power-voltage-and-power-factor',
    chapter: '15',
    section: 'Series AC power',
    label: 'Find rectangular impedance from power, voltage, and power factor',
    description: 'Use this when the problem gives P, V, and pf and asks for Z in rectangular form.',
    formulaSummary: [
      'I = P / (V pf)',
      '|Z| = V / I = V^2 pf / P',
      'Z = |Z| (pf + j sqrt(1 - pf^2)) for the lagging quiz convention',
    ],
    target: 'impedanceComplex',
    inputs: ['realPower', 'voltage', 'powerFactor'],
    note: 'This quiz-focused solve assumes the power-factor angle is the standard lagging positive angle. For leading cases, use formula mode with a signed phase angle directly.',
  },
  {
    id: 'impedance-from-source-voltage-and-current-phasors',
    chapter: '15',
    section: 'Phasor relationships',
    label: 'Find total impedance from source voltage and current phasors',
    description: 'Use this when the problem gives E and I as phasors and asks for Z.',
    formulaSummary: ['Z = E / I'],
    target: 'impedanceComplex',
    inputs: ['phasorSourceVoltage', 'phasorCurrent'],
  },
  {
    id: 'equivalent-parallel-resistance-from-series-r-xl',
    chapter: '15',
    section: 'Equivalent RL circuits',
    label: 'Find equivalent parallel resistance from series R and XL',
    description: 'Use this when the problem asks for Rp from a series RL pair.',
    formulaSummary: ['Rp = (R^2 + XL^2) / R'],
    target: 'equivalentParallelResistance',
    inputs: ['resistance', 'inductiveReactance'],
    note: 'Question 31 style problems need both Rp and XLp. Run this goal for Rp, then switch to the next goal for XLp.',
  },
  {
    id: 'equivalent-parallel-reactance-from-series-r-xl',
    chapter: '15',
    section: 'Equivalent RL circuits',
    label: 'Find equivalent parallel inductive reactance from series R and XL',
    description: 'Use this when the problem asks for the parallel XL from a series RL pair.',
    formulaSummary: ['XLp = (R^2 + XL^2) / XL'],
    target: 'equivalentParallelInductiveReactance',
    inputs: ['resistance', 'inductiveReactance'],
    note: 'Question 31 style problems need both Rp and XLp. Run the companion Rp goal first or second to complete the pair.',
  },
  {
    id: 'parallel-impedance-from-resistor-and-coil',
    chapter: '16',
    section: 'Parallel AC impedance',
    label: 'Find total impedance of a resistor in parallel with a coil',
    description: 'Use this when the problem gives a resistor branch in parallel with a coil that has internal resistance and inductance.',
    formulaSummary: [
      'XL = 2pi f L',
      'Zcoil = Rcoil + jXL',
      'Ytotal = 1 / Rparallel + 1 / Zcoil',
      'ZT = 1 / Ytotal',
    ],
    target: 'impedanceComplex',
    inputs: ['parallelResistance', 'coilResistance', 'frequency', 'inductance'],
    note: 'The answer panel shows both the full complex impedance and its magnitude for multiple-choice magnitude questions.',
  },
  {
    id: 'conductance-from-resistance',
    chapter: '16',
    section: 'Parallel AC building blocks',
    label: 'Find conductance from resistance',
    description: 'Use this when the problem gives R and asks for G.',
    target: 'conductance',
    inputs: ['resistance'],
  },
  {
    id: 'inductive-susceptance-from-reactance',
    chapter: '16',
    section: 'Parallel AC building blocks',
    label: 'Find inductive susceptance from inductive reactance',
    description: 'Use this when the problem gives XL and asks for BL.',
    target: 'inductiveSusceptance',
    inputs: ['inductiveReactance'],
  },
  {
    id: 'capacitive-susceptance-from-reactance',
    chapter: '16',
    section: 'Parallel AC building blocks',
    label: 'Find capacitive susceptance from capacitive reactance',
    description: 'Use this when the problem gives XC and asks for BC.',
    target: 'capacitiveSusceptance',
    inputs: ['capacitiveReactance'],
  },
  {
    id: 'capacitive-susceptance-from-frequency-and-capacitance',
    chapter: '16',
    section: 'Parallel AC building blocks',
    label: 'Find capacitive susceptance from frequency and capacitance',
    description: 'Use this when the problem gives f and C and asks for BC.',
    formulaSummary: ['BC = 2pi f C', 'BC = 1 / XC'],
    target: 'capacitiveSusceptance',
    inputs: ['frequency', 'capacitance'],
  },
  {
    id: 'parallel-admittance-from-g-bl-bc',
    chapter: '16',
    section: 'Parallel AC building blocks',
    label: 'Find total admittance from conductance and susceptances',
    description: 'Use this when the problem gives total G, BL, and BC and asks for Y.',
    target: 'admittanceComplex',
    inputs: ['conductance', 'inductiveSusceptance', 'capacitiveSusceptance'],
  },
  {
    id: 'parallel-source-current-from-voltage-and-admittance',
    chapter: '16',
    section: 'Parallel AC networks',
    label: 'Find source current from voltage and admittance magnitude',
    description: 'Use this when the problem gives V and |Y| and asks for total current.',
    target: 'current',
    inputs: ['voltage', 'admittanceMagnitude'],
  },
  {
    id: 'parallel-power-from-voltage-and-conductance',
    chapter: '16',
    section: 'Parallel AC networks',
    label: 'Find real power from voltage and conductance',
    description: 'Use this when the problem gives V and G and asks for P.',
    target: 'realPower',
    inputs: ['voltage', 'conductance'],
  },
  {
    id: 'parallel-power-factor-from-g-and-y',
    chapter: '16',
    section: 'Parallel AC networks',
    label: 'Find power factor from conductance and admittance magnitude',
    description: 'Use this when the problem gives G and |Y| and asks for power factor.',
    target: 'powerFactor',
    inputs: ['conductance', 'admittanceMagnitude'],
  },
  {
    id: 'tau-from-l-and-r',
    chapter: '11',
    section: 'Inductor transients',
    label: 'Find RL time constant from inductance and resistance',
    description: 'Use this when the problem asks for tau in an RL circuit.',
    target: 'timeConstant',
    inputs: ['inductance', 'resistance'],
  },
  {
    id: 'rl-growth-current',
    chapter: '11',
    section: 'Inductor transients',
    label: 'Find RL current after time t',
    description: 'Use this when the problem gives Ifinal, t, and tau.',
    target: 'rlGrowthCurrent',
    inputs: ['finalCurrent', 'elapsedTime', 'timeConstant'],
  },
  {
    id: 'inductor-voltage-from-l-and-didt',
    chapter: '11',
    section: 'Inductor relations',
    label: 'Find inductor voltage from inductance and di/dt',
    description: 'Use this when the problem gives L and the current rate of change.',
    target: 'voltage',
    inputs: ['inductance', 'diDt'],
  },
  {
    id: 'induced-voltage-from-turns-and-flux-rate',
    chapter: '11',
    section: 'Inductor relations',
    label: 'Find induced emf from turns and dPhi/dt',
    description: 'Use this when the problem gives N and magnetic flux rate.',
    target: 'inducedVoltage',
    inputs: ['turnCount', 'magneticFluxRate'],
  },
  {
    id: 'wheeler-air-core-inductance',
    chapter: '15',
    section: 'Air-core coils',
    label: 'Find air-core coil inductance with Wheeler formula',
    description: 'Use this when the problem gives coil radius, coil length, and turns.',
    target: 'inductance',
    inputs: ['coilRadius', 'coilLength', 'coilTurns'],
  },
]

export const guidedMathGoalMap = Object.fromEntries(
  guidedMathGoals.map((goal) => [goal.id, goal]),
) as Record<string, GuidedMathGoalDefinition>

export const guidedMathGoalGroups = guidedMathGoals.reduce<
  Array<{
    key: string
    label: string
    goals: GuidedMathGoalDefinition[]
  }>
>((groups, goal) => {
  const key = `${goal.chapter}-${goal.section}`
  const current = groups.find((group) => group.key === key)
  if (current) {
    current.goals.push(goal)
    return groups
  }

  groups.push({
    key,
    label: `Chapter ${goal.chapter} - ${goal.section}`,
    goals: [goal],
  })

  return groups
}, [])
  .sort((left, right) => {
    const chapterOrder: Record<string, number> = {
      '10': 10,
      '11': 11,
      '13': 13,
      '14': 14,
      '15': 15,
      '16': 16,
    }
    const leftChapter = chapterOrder[left.goals[0]?.chapter ?? '999'] ?? 999
    const rightChapter = chapterOrder[right.goals[0]?.chapter ?? '999'] ?? 999

    if (leftChapter !== rightChapter) {
      return leftChapter - rightChapter
    }

    return left.label.localeCompare(right.label)
  })

export function makeGuidedMathRows(goal: GuidedMathGoalDefinition): SolverInputRow[] {
  return goal.inputs.map((quantityId) => ({
    quantityId,
    rawValue: '',
    unitId: quantityMap[quantityId].defaultUnitId,
  }))
}

export function solveGuidedMathGoal(
  goal: GuidedMathGoalDefinition,
  rows: SolverInputRow[],
): GuidedMathResult {
  if (goal.waveformGoal) {
    return solveGuidedWaveformExpression(goal.waveformGoal, rows)
  }

  if (!goal.target) {
    return {
      kind: 'waveform-expression',
      status: 'invalid',
      message: `No solve target is configured for "${goal.label}".`,
    }
  }

  return solveCircuitProblem(goal.target, rows)
}
