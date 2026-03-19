# Homework Audit - March 18, 2026

## Current status

The cleanup and coverage pass is now centered on five canonical coverage sources:

- `HW 15`
- `HW 16`
- `HW 17`
- `Quiz 15-16`
- `Quiz 17`

The `Study guide` screenshots remain available in the repo, but they are explicitly supplemental and do not count toward formula-coverage scope.

## What changed

- The canonical workspace moved to `C:\dev\accirc`.
- The reference library was rebuilt around source truth instead of archive folder names.
- A structured question catalog now tracks one canonical record per question or homework sub-part.
- The mixed-network workflow now exposes explicit branch-voltage and branch-current targets.
- The parallel workflow now exposes equivalent-series resistance and reactance outputs.
- Coverage tests now fail if a calculation question loses its mapped deterministic solver path.

## Deterministic coverage summary

The current app now has cataloged deterministic coverage for every calculation prompt in the five canonical sources.

Covered solver surfaces include:

- Chapter 15 phasor conversion, waveform writeback, impedance, divider, power, and series-circuit outputs
- Chapter 16 admittance, impedance, source current, branch current, current-divider style outputs, and equivalent-series outputs
- Chapter 17 mixed-network total impedance, source current, real power, branch voltage, and branch current outputs

Still intentionally out of scope:

- true/false prompts
- concept or equation-identification prompts
- drawn phasor or admittance diagrams
- waveform sketches and freehand plots
- proof-style KCL and KVL writeups

## Catalog guardrails

The repo now treats these as invariants:

- one canonical question record per source question
- no supplemental study-guide questions mixed into the canonical catalog
- every calculation question marked `supported`
- every supported question wired to a solver mode, goal ids, formula ids, and a regression test mapping

These checks are enforced in:

- `src/data/__tests__/questionCatalogCoverage.test.ts`

## Regression coverage

The solver regression suite now covers:

- the new parallel equivalent-series outputs
- the new mixed-network branch-target outputs
- the updated source-library UI
- the question-catalog coverage invariants
- the existing chapter-specific spot checks and solver tests already in the repo

Validation gate:

```bash
npm run test:run
npm run lint
npm run build
```

## Follow-on work if scope expands later

If a future pass wants to go beyond the current deterministic math scope, the next reasonable additions would be:

1. frequency-sweep plot rendering for Chapter 16 visualization asks
2. richer proof/explanation outputs for KCL and KVL verification prompts
3. rendered phasor/admittance diagrams for the out-of-scope sketch questions

Those are intentionally separate from this cleanup pass so the current app stays narrow, deterministic, and aligned to the actual assigned problem set.
