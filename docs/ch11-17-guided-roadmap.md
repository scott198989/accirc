# Chapter 11-17 Guided Roadmap

This app is being shaped around the actual math problem families in Boylestad/Olivari Chapters 11 through 17.

## Design principle

The user should not need to:

- choose formulas manually
- translate every problem into symbolic notation first
- guess which inverse relationship is safe
- mentally normalize units before solving

The deterministic solver should do those steps when the problem type is supported, and refuse clearly when it is not.

## Current guided coverage

### Chapter 11

- RL time constant from `L` and `R`
- RL current growth from `Ifinal`, `t`, and `tau`
- Inductor voltage from `L` and `di/dt`
- Induced emf from `N` and `dPhi/dt`

### Chapter 13

- Period from frequency
- Frequency from period
- Elapsed time from cycles and period
- Angular frequency from frequency
- RMS and peak conversions
- Degree/radian conversion

### Chapter 14

- Capacitive reactance from `f` and `C`
- Charge from `C` and `V`
- Total capacitance for parallel capacitors
- Total capacitance for series capacitors
- RC time constant
- RC charging voltage

### Chapter 15

- Inductive reactance from `f` and `L`
- Inductance from `XL` and `f`
- Power factor from phase angle
- Real power from current and resistance
- Wheeler single-layer air-core coil inductance
- Series-circuit diagram workflow for impedance, phase angle, power factor, source current, component voltages, and real power

## Next deterministic expansion

### Chapter 16

Current support includes:

- conductance and susceptance building blocks
- total admittance and total impedance
- source current from total admittance
- real power from voltage and conductance
- power factor from conductance and admittance magnitude
- parallel R/L/C diagram workflow for admittance, impedance, source current, power factor, and aggregate branch currents

Next additions for Chapter 16:

- current division in multi-branch mixed-impedance networks
- more explicit branch-by-branch phasor current targets
- equivalent parallel circuit conversions

### Chapter 17

Add guided workflows for:

- series-parallel reduction sequences
- ladder network reduction
- branch-by-branch target solving after deterministic reduction

## Guardrails

For every guided workflow:

- no LLM inference is used for solving
- the rule engine must still be the final authority
- the app must show the formula used, why it was selected, substituted values, and final units
- unsupported topologies must return a clear refusal instead of a guessed answer
