# CH 15 and 16 AC Quiz Math Solver

A local-first deterministic circuits app scoped to the math-only problem families from the Chapter 15 and 16 quiz screenshots.

This shell intentionally excludes:

- theory prompts
- true/false questions
- legacy extra workflows

The app does not guess. It only solves from explicit formulas and clear inputs.

## What the app covers

The current UI is focused on Chapter 15 and 16 quiz math, including:

- inductive reactance and capacitive reactance
- inductor and capacitor impedance
- series impedance magnitude and phase relationships
- power factor from phase angle
- rectangular impedance from power, voltage, and power factor
- impedance from voltage and current phasors
- equivalent parallel RL conversion
- capacitive susceptance
- series RL, RC, and RLC diagram entry
- mixed series-parallel impedance reduction for the quiz network problems

## UI modes

The app currently exposes two working modes:

- `Guided mode`
  - `Quiz math goal`
  - `Series circuit from diagram`
  - `Mixed series-parallel network`
- `Formula mode`
  - direct quantity-based solving within the same Chapter 15 and 16 quiz scope

## Deterministic behavior

- No LLM or AI reasoning is used to solve problems.
- Formula selection is handled by explicit rules.
- Units are normalized to SI before solving.
- Incomplete or ambiguous inputs are refused instead of guessed.
- Solved cases show the chosen formula, substituted values, and final answer.

## Local runtime

Install dependencies:

```bash
npm install
```

Run the standard dev server:

```bash
npm run dev
```

Run on the fixed local port used by the Windows launcher:

```bash
npm run dev:local
```

Build the app:

```bash
npm run build
```

Run tests:

```bash
npm run test:run
```

## Windows launcher

You can also use the included Windows launcher:

- `Start-ACCirc.cmd`
- `Start-ACCirc.ps1`

The launcher installs dependencies on first run, starts the local server on `http://127.0.0.1:4173/`, and opens the browser.

## Tech stack

- React 19
- TypeScript
- Vite
- Vitest

## Project structure

```text
src/
  core/
    complex.ts
    format.ts
    formulaLibrary.ts
    quantities.ts
    ruleEngine.ts
    solver.ts
    units.ts
  features/
    guidedMathGoals.ts
    guidedSeriesImpedance.ts
    guidedSeriesParallelNetwork.ts
  App.tsx
  index.css
```

## Validation

Recommended local checks:

```bash
npm run test:run
npm run lint
npm run build
```
