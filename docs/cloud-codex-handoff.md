# Cloud Codex Handoff

## Mission

Keep this app narrowly scoped to the math problems that appear in Scott's actual AC circuits homework and screenshot sets.

Do not treat this repo as a "cover the whole textbook" project.

The product goal is:

- deterministic solving
- minimal user thinking
- no LLM solve logic
- only the problem families that actually show up in the homework and screenshots

The user should be able to pick what the problem asks for, enter the known values, and let the app choose the correct deterministic formula path.

## Source materials

The current canonical source library is now committed to the repo and available in cloud or local
workspaces at:

- `public/reference-library/homework/`
- `public/reference-library/screenshots/`
- `src/data/referenceLibrary.ts`

For the import and dedupe details, read `docs/reference-library.md`.

The external originals used in the earlier audit were:

### Homework files

- `C:\Users\Scott\OneDrive\Desktop\Scott Tuschl HW Cha 15 A000834342.docx`
- `C:\Users\Scott\OneDrive\Desktop\Scott Tuschl ch 16 HW (1).pdf`
- `C:\Users\Scott\OneDrive\Desktop\Scott Tuschl HW 17.docx`

### Screenshot and study-guide folders

- `G:\My Drive\New School Notes\AC Circuits\Screen shots\Test 2 study guide`
- `G:\My Drive\New School Notes\AC Circuits\Screen shots\test 2 no 2`
- `G:\My Drive\New School Notes\AC Circuits\Screen shots\test 2 no 3`
- `G:\My Drive\New School Notes\AC Circuits\Ch 15 16 screen shots`

### Chapter 17 support material

- `G:\My Drive\New School Notes\AC Circuits\Notes\ch-17-PPTaccessible.pptx`

If you are working from a fresh cloud checkout now, you no longer need the original external paths
just to review the audited source material because the committed reference library is part of the
repo.

## What was already audited

Use `docs/homework-audit-2026-03-18.md` as the current audit baseline.

The main conclusions from that audit were:

- Chapter 15 is in the strongest shape.
- Chapter 16 still needs more guided workflows.
- Chapter 17 has real mixed-network logic already, but some homework-friendly outputs are still not first-class goals.

## What was just completed

This pass aligned the shell with the solver that was already in the repo:

- exposed additional series goals that were already supported in `src/features/guidedSeriesImpedance.ts`
- exposed additional mixed-network goals that were already supported in `src/features/guidedSeriesParallelNetwork.ts`
- added a visible Chapter 17 mixed-network quick-load sample in `src/features/appShell/appShell.ts`
- updated the repo docs so the public scope now points to homework-and-screenshot coverage instead of "the whole chapter"

Validation completed after those changes:

- `npm run test:run`
- `npm run lint`
- `npm run build`

At the time of handoff, the suite was passing with `64` tests.

## Current product boundary

Build only what is necessary to solve the assigned materials.

Good work:

- guided goals that directly match homework asks
- diagram-driven inputs for the screenshot problems
- deterministic reductions and formula traces
- tests copied from the actual assigned problems

Avoid:

- broad textbook coverage outside the assigned problems
- theory helpers
- true/false handling
- speculative workflows that do not appear in the homework or screenshots

## Where work stopped

The next pass should not expand generically by chapter. It should close the remaining gaps that were already identified in the audit and that map directly to the assignment materials.

Highest-value next work:

1. Add explicit current-divider workflows for the Chapter 16 and 17 homework problems.
2. Add explicit AC voltage-divider workflows for the Chapter 15 and 17 homework problems.
3. Rebuild or expose a cleaner parallel-from-diagram guided flow for the Chapter 16 screenshot and homework questions.
4. Promote branch-voltage and branch-current outputs in mixed-network mode from "internally available" to first-class guided targets.
5. Expose equivalent-series-from-parallel workflows only if they are required by the assigned Chapter 16 problems.

## Useful implementation notes

There are already solver hooks worth reusing before adding anything new:

- `src/features/guidedSeriesImpedance.ts`
  already supports source current, component voltages, and real power for series networks
- `src/features/guidedSeriesParallelNetwork.ts`
  already supports total impedance, source current, real power, and node summaries
- `src/core/formulaLibrary.ts`
  already contains formulas for branch currents and AC voltage divider relationships
- `src/features/appShell/appShell.ts`
  is where guided goal visibility is currently curated

The preferred next move is to expose or compose these existing deterministic paths into homework-specific workflows rather than building new broad solver layers.
