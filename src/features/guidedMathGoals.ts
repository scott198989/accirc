import { quantityMap, solveCircuitProblem, type QuantityId, type SolveResult, type SolverInputRow } from '../core'

export interface GuidedMathGoalDefinition {
  id: string
  chapter: string
  section: string
  label: string
  description: string
  target: QuantityId
  inputs: QuantityId[]
  note?: string
}

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
    description: 'Use this when the problem gives phi and asks for pf.',
    target: 'powerFactor',
    inputs: ['phaseAngle'],
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
): SolveResult {
  return solveCircuitProblem(goal.target, rows)
}
