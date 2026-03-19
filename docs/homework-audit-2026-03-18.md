# Homework Audit - March 18, 2026

## Post-implementation update

The app now exposes the missing solver paths that were already present in the codebase and adds the remaining direct Chapter 15 and Chapter 16 formula goals needed for the uploaded homework and screenshot equations.

What now solves directly in the app:

- Chapter 15 series-diagram questions through the series builder
- Chapter 15 direct phasor, waveform-writeback, capacitance-from-reactance, and voltage-divider questions through quiz-goal mode
- Chapter 16 parallel-diagram questions through the parallel builder
- Chapter 16 current-divider style problems through the parallel builder using either source voltage or a source-current phasor
- Screenshot-style textbook labels such as `R`, `XL`, `XC`, `L`, `C`, `f`, `E`, `V`, and `Is` through the textbook-label workflow

Still primarily manual or presentation-oriented:

- waveform sketches and overlaid plots
- admittance and phasor diagrams as drawn graphics
- explicit KCL and KVL proof writeups beyond the computed phasors and totals

## Files reviewed

- `C:\Users\Scott\OneDrive\Desktop\Scott Tuschl HW Cha 15 A000834342.docx`
- `C:\Users\Scott\OneDrive\Desktop\Scott Tuschl ch 16 HW (1).pdf`
- `C:\Users\Scott\OneDrive\Desktop\Scott Tuschl HW 17.docx`

## Screenshot zip status

The two screenshot zip paths provided earlier were no longer present during this review, so they could not be audited directly:

- `C:\Users\Scott\OneDrive\Desktop\screenshots\drive-download-20260318T175543Z-3-001.zip`
- `C:\Users\Scott\OneDrive\Desktop\screenshots\drive-download-20260318T175634Z-3-001.zip`

A newer Drive export was found at:

- `C:\Users\Scott\Downloads\drive-download-20260318T180033Z-3-001.zip`

That replacement zip only contained copies of the Chapter 15 and Chapter 16 homework files, not additional screenshots.

## Summary

The current app is strongest on:

- Chapter 15 impedance, phasor, waveform-expression, and power-factor math
- Chapter 16 direct admittance and parallel-coil quiz math
- Chapter 17 mixed-network reduction for total impedance, source current, and real power

The current app is still weak on:

- explicit current-divider workflows
- explicit branch-voltage and branch-current guided goals for Chapter 17
- plotting requests
- diagram-drawing requests beyond the existing impedance and admittance sketches
- fully guided Chapter 16 parallel-from-diagram workflows

## Coverage matrix

Legend:

- `Supported`: the current app has a clear deterministic workflow for the main math ask
- `Partial`: the math is possible in formula mode or across multiple solves, but the homework is not covered end-to-end in one clean guided flow
- `Missing`: no current deterministic workflow was found for the requested homework task

### Chapter 15 homework

| Problem | Main asks | Status | Notes |
| --- | --- | --- | --- |
| 3 | current phasor, inductor voltage phasor, sinusoidal voltage writeback | Partial | Phasor conversion and sine-expression writeback are covered. The full "one guided problem" flow plus phasor sketch and waveform plot are not. |
| 5 | voltage/current phasors, inductor impedance, inductance | Partial | Inductor impedance and inductance are covered. Phasor sketch and waveform plot are still manual. |
| 7 | capacitor reactance, current phasor, capacitor voltage phasor, sinusoidal voltage writeback | Partial | Capacitor impedance math and sine-expression writeback are covered. The full guided capacitor-element workflow and plotting are not. |
| 13 | total impedance in rectangular and polar form, impedance diagram | Supported | This is directly in scope. The app now handles separate parts like `(a)`, `(b)`, and `(c)` without merging them. |
| 17 | total impedance, C and L values, phasor voltages/currents, KVL, power, power factor, sine expressions | Partial | Most underlying math exists, but the app does not yet present this full series-RLC homework as one end-to-end guided workflow. `L` from `XL` and `f` is exposed. `C` from `XC` and `f` exists in core rules but is not surfaced as a guided goal. |
| 21 | source current and voltages in phasor form | Partial | The phasor math exists in formula mode, but there is no dedicated guided goal for this exact problem family yet. |
| 28 | voltage divider rule in phasor form | Partial | The AC voltage-divider formula exists in the rule library, but it is not exposed as a user-friendly guided goal yet. |

### Chapter 16 homework

| Problem | Main asks | Status | Notes |
| --- | --- | --- | --- |
| 3 | admittance in rectangular and polar form, admittance diagram | Partial | The math is supported, but there is no current parallel-from-diagram guided workflow in the pulled app shell. |
| 5 | total impedance, total admittance, conductance, susceptance, admittance diagram | Partial | The direct formulas are available. The user still has to translate the configuration into the right known quantities manually. |
| 9 | total admittance, source voltage, branch currents, KCL, power, power factor, sine expressions | Partial | Several sub-solves exist, but there is no clean guided parallel-network workflow that carries the user through this exact homework structure. |
| 14 | current divider rule for `I1` and `I2` | Missing | No explicit current-divider workflow was found in the current guided goals or app shell. |
| 19 | frequency plots for `Y`, `thetaY`, `Z`, `thetaZ`, `VC`, `IL` | Missing | The app does not currently generate sweep plots versus frequency. |
| 21 | find an equivalent series circuit for a parallel circuit with the same total impedance | Missing | No exposed guided workflow for converting a parallel network into an equivalent series circuit was found. |

### Chapter 17 homework

| Problem | Main asks | Status | Notes |
| --- | --- | --- | --- |
| 3 | total impedance, source current, current divider, voltage divider, average power | Partial | Mixed-network reduction, source current, and real power are supported. Current-divider and voltage-divider steps are not yet exposed as homework-friendly guided outputs. |
| 5 | source current, a branch voltage, average power | Partial | The mixed-network engine can reduce the network and compute source current/power, but there is not yet a direct guided goal for the requested branch voltage. |
| 7 | branch currents, branch voltage, average power | Partial | The engine can compute node voltages and currents internally when source voltage is provided, and the UI can display node summaries. The exact homework-style guided asks are not yet first-class goals. |
| 16 | ladder-network total impedance and resistor voltage | Partial | Total impedance reduction is supported. The specific branch/resistor voltage target is not yet exposed as a dedicated guided goal. |
| 17 | branch current for a mixed network | Partial | Likely solvable through the mixed-network engine plus node summaries, but not yet represented as a clear guided end-to-end workflow. |

## Highest-value gaps to build next

1. Add guided AC current-divider and voltage-divider goals.
2. Reintroduce or rebuild a Chapter 16 parallel-from-diagram workflow.
3. Expose `C` from `XC` and `f` as a guided goal, not only as an internal formula.
4. Expand the Chapter 17 mixed-network UI to support explicit branch-voltage and branch-current targets.
5. Add optional frequency-sweep plotting for Chapter 16 homework like Problem 19.

## Practical conclusion

If the goal is "solve Scott's assigned Chapter 15, 16, and 17 homework and screenshot math with minimal thought from the user," the current app is close for the core Chapter 15 impedance and phasor material, but Chapter 16 and Chapter 17 still need more guided workflows before the assignment scope feels complete.
