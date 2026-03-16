# AC Circuits Formula Selector and Solver

A local-first deterministic circuits app aimed at the math problem families in Chapters 11 through 17, plus the audited study-guide formulas that support them.

The app is intentionally deterministic:

- No LLM or AI reasoning is used to solve problems.
- Formula selection is driven by an explicit rule engine.
- Units are normalized internally to SI before solving.
- The solver refuses incomplete or ambiguous inputs instead of guessing.
- Every solved path shows the chosen formula, why it was chosen, the substituted values, and the final answer with units.

It now also includes guided workflows so users do not have to think in raw symbols first:

- chapter-guided goals for textbook-style "find X from these numbers" problems
- as-labeled variable mode for textbook symbols like `R`, `XL1`, `XL2`, `XC`, `L2`, `C`, `f`, and `E`
- series-circuit diagram mode for component-based impedance, phase, power-factor, current, and voltage questions
- parallel-circuit diagram mode for Chapter 16 style admittance, impedance, current, power-factor, and branch-current questions

## Local runtime

The solver runs locally in the browser with no internet requirement at runtime.

One-time setup uses `npm install` to fetch packages. After that, the app, solver, and tests all run on your machine.

## Tech stack

- React 19
- TypeScript
- Vite
- Vitest

## Project structure

```text
src/
  core/
    complex.ts         Complex math helpers and parsers
    format.ts          Output formatting for values and units
    formulaLibrary.ts  Structured formula families and solve variants
    quantities.ts      Quantity metadata and UI-facing labels/units
    ruleEngine.ts      Deterministic path selection and ambiguity handling
    solver.ts          High-level solver entry point used by the UI/tests
    units.ts           Unit parsing and SI normalization
  features/
    guidedMathGoals.ts        Chapter-oriented question goals mapped to deterministic solve targets
    guidedParallelCircuit.ts  Plain-English branch workflow for parallel AC solving
    guidedSeriesImpedance.ts  Plain-English component workflow for series impedance
    guidedSymbolProblem.ts    Textbook-variable workflow for symbols like R, XL1, XL2, XC, L, C, f, and E
  App.tsx              Local UI prototype
  index.css            App styling
```

## UI modes

The app has two local workflows:

- Guided mode
  - `Chapter math goal`
  - best when the problem says "find period", "find tau", "find induced emf", "find XC", and so on
  - the user selects the question goal and only fills in the values the problem gives
  - `As-labeled variables`
  - best when the problem gives textbook symbols like `R`, `XL1`, `XL2`, `XC`, `L2`, `C`, `f`, or `E`
  - users enter the labeled variables in any order and the app aggregates repeated `R`, `XL`, and `XC` values automatically
  - `Series circuit from diagram`
  - best when a textbook problem gives component values from a circuit drawing
  - users enter components in plain English: resistor, inductor, capacitor, frequency, and source voltage if needed
  - the app converts inductance/capacitance into reactance when needed
  - the app returns rectangular impedance, polar impedance, and an impedance diagram when applicable
- Formula mode
  - best when the user already knows the exact electrical quantities they want to enter
  - exposes the raw deterministic formula selector and trace output

## Chapter-focused guided coverage

Current guided goals cover common math patterns from:

- Chapter 11: RL time constant, RL current growth, inductor voltage, induced emf
- Chapter 13: period, frequency, elapsed time, angular frequency, RMS and peak conversions, angle conversion
- Chapter 14: capacitive reactance, charge/voltage/capacitance, capacitor combinations, RC time constant, RC charging
- Chapter 15: inductive reactance, inductance recovery, power factor, real power, air-core coil inductance, and series RLC diagram-based solving
- Chapter 16: conductance, susceptance, admittance, parallel source current, parallel power, and parallel RLC diagram-based solving

Chapter 17 network-reduction workflows are the next deterministic expansion target. The current app already refuses to guess there rather than pretending to solve unsupported topologies.

## Included formula families

The structured formula library includes:

- `T = 1/f`, `f = 1/T`, `t = N*T`
- degree/radian conversion
- `omega = 2pi/T`, `f = omega/(2pi)`
- `i = v/R`
- `XL = 2pi f L`, `XL = omega L`, `L = XL/omega`
- `XC = 1/(2pi f C)`, `C = 1/(omega XC)`
- `i = C dv/dt`, `v = L di/dt`, `e = N dPhi/dt`
- `Z = V/I`, `|Z| = sqrt(R^2 + X^2)`, `theta = atan(X/R)`
- `pf = P/(VI)`, `P = I^2 R`, `P = VI cos(phi)`, `pf = cos(phi)`
- `Irms = Im/sqrt(2)`, `Vrms = Vm/sqrt(2)`, `Vm = sqrt(2)Vrms`
- `ZL = jXL`, `VL = jXLI`, `VC = -jXCI`
- `Z = R + j(XL - XC)`, `I = E/Z`, `VR = IR`, `E = VR + VL + VC`
- `Vx = E(Zx/Zt)`
- `Q = CV`, `C = Q/V`
- parallel and series capacitor equivalents
- `tau = RC`, `tau = L/R`
- RC charging and RL growth equations
- polar/rectangular conversion
- complex multiplication
- Wheeler single-layer air-core coil formula

Inverse solving is implemented only where the rearrangement is explicit and deterministic. Formulas with sign ambiguity or underdetermined inverses are not guessed.

## How the solver works

1. The UI collects known quantities, raw values, and selected units.
2. `units.ts` parses the input and converts it into SI-normalized internal values.
3. In guided series mode, `guidedSeriesImpedance.ts` first translates component inputs into total series `R`, `XL`, and `XC`.
4. In chapter-guided mode, `guidedMathGoals.ts` narrows the problem to a textbook-style target and expected inputs before solving.
5. In as-labeled variable mode, `guidedSymbolProblem.ts` maps symbols like `XL1` or `C2` into the correct deterministic series or parallel workflow before solving.
6. `ruleEngine.ts` searches the declared formula variants for valid derivation paths.
7. Candidates are ranked by:
   - fewest total steps
   - fewest derived inputs
   - explicit formula priority
8. If more than one best-ranked path exists, the solver returns `ambiguous`.
9. If no valid path exists, the solver returns `incomplete` with the closest formula requirements.
10. If a single best path exists, the UI renders the full trace.

## Transparency guarantees

For solved cases the UI always displays:

- formula selected
- why it was selected
- substituted values
- final answer with units

For refusal cases the UI explains:

- which formula family was closest
- which quantities are still missing
- when multiple formula paths are equally valid

## Development

Install dependencies:

```bash
npm install
```

Run the app:

```bash
npm run dev
```

Run tests:

```bash
npm run test:run
```

Build for production:

```bash
npm run build
```

## Adding a new formula

The formula system is data-first. To add a formula:

1. Add any new quantity metadata to `src/core/quantities.ts`.
2. Add units or prefixes in `src/core/units.ts` if the quantity needs them.
3. Add one or more explicit solve variants in `src/core/formulaLibrary.ts`.
4. For each variant, declare:
   - `target`
   - `inputs`
   - `displayFormula`
   - `description`
   - `priority`
   - `compute`
   - optional `validate`
5. Add tests in `src/core/__tests__/solver.test.ts`.

Example variant shape:

```ts
{
  id: 'period-from-frequency',
  target: 'period',
  inputs: ['frequency'],
  displayFormula: 'T = 1 / f',
  description: 'Computes period from frequency.',
  priority: 7,
  validate: (values) => positive(getScalar(values, 'frequency'), 'Frequency'),
  compute: (values) => scalar(1 / getScalar(values, 'frequency')),
}
```

## Notes for future TI-Nspire adaptation

The core solver is intentionally separated from the UI:

- formula metadata is centralized
- unit normalization is isolated
- solve selection is deterministic and side-effect free
- the UI only calls a single high-level solver entry point

That separation should make it much easier to port the same rule set into a TI-Nspire CX II CAS-friendly workflow later.
