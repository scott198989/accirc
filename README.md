# CH 15, 16, and 17 AC Homework and Quiz Math Solver

A local-first deterministic circuits app scoped to the math-only problem families that appear in Scott's assigned homework files and screenshot sets for Chapters 15, 16, and 17.

This shell intentionally excludes:

- theory prompts
- true/false questions
- legacy extra workflows

The app does not guess. It only solves from explicit formulas and clear inputs.

## Scope guardrails

This repo is intentionally **not** trying to cover the entire textbook or every formula in each chapter.

The target scope is only:

- the Chapter 15 homework file
- the Chapter 16 homework file
- the Chapter 17 homework file
- the screenshot folders and study-guide captures that Scott actually uses

If a future contributor works on this app, they should keep the product narrow:

- prioritize deterministic workflows for the assigned problems
- do not widen scope to unrelated textbook material unless it appears in the homework or screenshots
- prefer exposing existing deterministic solver paths over adding broad new surface area

## Cloud handoff

If you are picking this up in a cloud workspace, read:

- `docs/cloud-codex-handoff.md`
- `docs/homework-audit-2026-03-18.md`
- `docs/reference-library.md`

Those documents describe:

- the intended scope
- the source homework and screenshot files
- what was already audited
- what work was in progress
- where the next implementation pass should continue

## Reference library

The homework files and screenshot sets now live inside the repo under:

- `public/reference-library/homework/`
- `public/reference-library/screenshots/`
- `src/data/referenceLibrary.ts`

Current imported totals:

- `109` canonical files committed to the repo
- `2` homework documents
- `107` screenshots
- `17` exact duplicate screenshots removed during import

The generated manifest preserves:

- the original zip paths
- SHA-256 hashes for each canonical file
- which duplicate screenshot paths were collapsed into a single kept copy

Binary asset safety for Git pulls is enforced in `.gitattributes` for `*.docx`, `*.pdf`, and `*.png`.

If you need to re-import a new archive later, run:

```bash
python scripts/import_reference_library.py "C:\path\to\Homeworks and Screenshots.zip"
```

## GitHub sync for desktop and laptop

This repo already uses GitHub as the shared source of truth:

- remote: `https://github.com/scott198989/accirc.git`
- branch: `main`

Recommended workflow on either machine:

```bash
git pull --ff-only origin main
```

Make your changes, then:

```bash
git add .
git commit -m "Describe the work clearly"
git push origin main
```

That keeps your desktop, laptop, GitHub, and any cloud workspace aligned on the same committed assets and code.

## What the app covers

The current UI is focused on the Chapter 15, 16, and 17 homework-and-screenshot math, including:

- inductive reactance and capacitive reactance
- inductor and capacitor impedance
- direct series RL, RC, and RLC impedance workflows
- series impedance magnitude and phase relationships
- power factor from phase angle
- rectangular impedance from power, voltage, and power factor
- impedance from voltage and current phasors
- equivalent parallel RL conversion
- resistor-in-parallel-with-coil impedance
- capacitive susceptance
- series RL, RC, and RLC diagram entry
- mixed series-parallel impedance reduction for the quiz network problems
- mixed-network source current and real-power solves for Chapter 17 style reductions
- formula previews on each quiz goal so the user can see the solve path before entering values

## UI modes

The app currently exposes two working modes:

- `Guided mode`
  - `Quiz math goal`
  - `Series circuit from diagram`
  - `Mixed series-parallel network`
- `Formula mode`
  - direct quantity-based solving within the same Chapter 15, 16, and 17 quiz scope

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

## Desktop and laptop setup

Use this section when setting up the project on your laptop so it matches your desktop as closely as possible.

### What is already synced by GitHub

After you pull the repo, you already have:

- the app code
- the committed homework files
- the committed screenshot files
- the reference-library manifest
- the duplicate cleanup work

You do **not** need to manually copy the screenshots or homework documents between machines anymore because they are already committed inside this repo.

### Required software

Install these on the laptop:

- Git
- Node.js
- npm
- a modern browser

This app currently runs with the standard Node/npm toolchain already used in this repo. No app-specific environment variables are required.

### First-time laptop setup

Clone the repo:

```bash
git clone https://github.com/scott198989/accirc.git
cd accirc
```

Install dependencies:

```bash
npm install
```

Validate the setup:

```bash
npm run test:run
npm run lint
npm run build
```

Start the app:

```bash
npm run dev:local
```

Then open:

```text
http://127.0.0.1:4173/
```

### Daily sync workflow for both machines

Before starting work on either the desktop or laptop:

```bash
git pull --ff-only origin main
```

After making changes:

```bash
git add .
git commit -m "Describe the work clearly"
git push origin main
```

On the other machine, pull again:

```bash
git pull --ff-only origin main
```

### If you want Codex on the laptop to see the same project

Open the cloned repo folder in Codex on the laptop. Once the repo has been pulled, Codex will have access to the same committed code, homework files, screenshots, and docs that exist on the desktop copy.

Good folders to keep consistent are:

- the repo itself
- your Git login on both machines
- your Node/npm installation

### Current GitHub source of truth

- repo: `https://github.com/scott198989/accirc.git`
- branch: `main`
- latest pushed solver-coverage commit: `c784f9a`
