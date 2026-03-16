import { formulaVariants, variantsByTarget } from './formulaLibrary'
import { formatKnownAssignment } from './format'
import { quantityMap } from './quantities'
import type {
  AmbiguousCandidate,
  KnownValueMap,
  QuantityId,
  RequirementHint,
  SolveRequest,
  SolveResult,
  SolveStep,
  SolveStepInput,
} from './types'

interface Candidate {
  target: QuantityId
  value: SolveStep['output']
  steps: SolveStep[]
  totalSteps: number
  derivedInputs: number
  priority: number
  formulaId: string
  signature: string
}

interface DeriveOutcome {
  candidates: Candidate[]
  requirements: RequirementHint[]
}

interface InputResolution {
  quantityId: QuantityId
  value: SolveStep['output']
  source: 'known' | 'derived'
  steps: SolveStep[]
}

export function solveWithRules(request: SolveRequest): SolveResult {
  if (!request.target) {
    return {
      status: 'invalid',
      target: 'frequency',
      message: 'Choose a target quantity before solving.',
    }
  }

  if (request.knowns[request.target]) {
    return {
      status: 'invalid',
      target: request.target,
      message: `Remove ${quantityMap[request.target].label} from the known values before asking the solver to find it.`,
    }
  }

  if (Object.keys(request.knowns).length === 0) {
    return {
      status: 'invalid',
      target: request.target,
      message: 'Enter at least one known value before solving.',
    }
  }

  const memo = new Map<QuantityId, DeriveOutcome>()
  const outcome = derive(request.target, request.knowns, new Set(), memo)

  if (outcome.candidates.length === 0) {
    return {
      status: 'incomplete',
      target: request.target,
      message: `No deterministic path can solve ${quantityMap[request.target].label} from the values entered.`,
      requirements: outcome.requirements.slice(0, 5),
    }
  }

  const ranked = [...outcome.candidates].sort(compareCandidates)
  const best = ranked[0]
  const tied = ranked.filter((candidate) => hasSameScore(candidate, best))

  if (tied.length > 1) {
    const candidates: AmbiguousCandidate[] = tied.map((candidate) => {
      const finalStep = candidate.steps[candidate.steps.length - 1]
      return {
        formulaId: candidate.formulaId,
        formula: finalStep.formula,
        target: candidate.target,
        derivedStepCount: candidate.steps.length,
      }
    })

    return {
      status: 'ambiguous',
      target: request.target,
      message: `Multiple formula paths can solve ${quantityMap[request.target].label} with the current knowns, so the app will not guess.`,
      candidates,
    }
  }

  return {
    status: 'solved',
    target: request.target,
    value: best.value,
    steps: best.steps,
  }
}

function derive(
  target: QuantityId,
  knowns: KnownValueMap,
  trail: Set<QuantityId>,
  memo: Map<QuantityId, DeriveOutcome>,
): DeriveOutcome {
  if (knowns[target]) {
    return { candidates: [], requirements: [] }
  }

  if (memo.has(target)) {
    return memo.get(target)!
  }

  trail.add(target)

  const candidates: Candidate[] = []
  const requirements: RequirementHint[] = []

  for (const variant of variantsByTarget[target] ?? []) {
    const missing: QuantityId[] = []
    const resolvedInputs: InputResolution[][] = []

    let skipVariant = false

    for (const inputId of variant.inputs) {
      const knownValue = knowns[inputId]
      if (knownValue) {
        resolvedInputs.push([
          {
            quantityId: inputId,
            value: knownValue,
            source: 'known',
            steps: [],
          },
        ])
        continue
      }

      if (trail.has(inputId)) {
        skipVariant = true
        break
      }

      const derivedOutcome = derive(inputId, knowns, new Set(trail), memo)
      if (derivedOutcome.candidates.length === 0) {
        missing.push(inputId)
      } else {
        resolvedInputs.push(
          derivedOutcome.candidates.map((candidate) => ({
            quantityId: inputId,
            value: candidate.value,
            source: 'derived',
            steps: candidate.steps,
          })),
        )
      }
    }

    if (skipVariant) {
      continue
    }

    if (missing.length > 0) {
      requirements.push({
        formulaId: variant.id,
        formula: variant.displayFormula,
        missing,
      })
      continue
    }

    for (const combination of combineInputPaths(resolvedInputs)) {
      const valueMap: KnownValueMap = {}
      for (const resolution of combination) {
        valueMap[resolution.quantityId] = resolution.value
      }

      const validationMessage = variant.validate?.(valueMap)
      if (validationMessage) {
        requirements.push({
          formulaId: variant.id,
          formula: `${variant.displayFormula} (${validationMessage})`,
          missing: [],
        })
        continue
      }

      const output = variant.compute(valueMap)
      const stepInputs: SolveStepInput[] = combination.map((resolution) => ({
        quantityId: resolution.quantityId,
        label: quantityMap[resolution.quantityId].label,
        symbol: quantityMap[resolution.quantityId].symbol,
        value: resolution.value,
        source: resolution.source,
      }))

      const step: SolveStep = {
        formulaId: variant.id,
        familyId: variant.familyId,
        familyLabel: variant.familyLabel,
        chapter: variant.chapter,
        target: variant.target,
        formula: variant.displayFormula,
        whySelected: describeSelection(variant.target, variant.displayFormula, stepInputs),
        substitutedValues: stepInputs.map((input) => formatKnownAssignment(input.quantityId, input.value)),
        output,
      }

      const dependencySteps = uniqueSteps(combination.flatMap((resolution) => resolution.steps))
      const steps = [...dependencySteps, step]
      const candidate: Candidate = {
        target,
        value: output,
        steps,
        totalSteps: steps.length,
        derivedInputs: combination.filter((entry) => entry.source === 'derived').length,
        priority: variant.priority,
        formulaId: variant.id,
        signature: steps.map((entry) => entry.formulaId).join('>'),
      }

      if (!candidates.some((existing) => existing.signature === candidate.signature)) {
        candidates.push(candidate)
      }
    }
  }

  const outcome = {
    candidates,
    requirements: uniqueRequirements(requirements),
  }
  memo.set(target, outcome)
  return outcome
}

function combineInputPaths(inputs: InputResolution[][]): InputResolution[][] {
  if (inputs.length === 0) {
    return [[]]
  }

  const [head, ...tail] = inputs
  const tailCombinations = combineInputPaths(tail)
  const combinations: InputResolution[][] = []

  for (const option of head) {
    for (const suffix of tailCombinations) {
      combinations.push([option, ...suffix])
    }
  }

  return combinations
}

function uniqueSteps(steps: SolveStep[]): SolveStep[] {
  const seen = new Set<string>()
  const unique: SolveStep[] = []

  for (const step of steps) {
    const key = `${step.formulaId}:${step.target}`
    if (seen.has(key)) {
      continue
    }

    seen.add(key)
    unique.push(step)
  }

  return unique
}

function uniqueRequirements(requirements: RequirementHint[]): RequirementHint[] {
  const seen = new Set<string>()
  const unique: RequirementHint[] = []

  for (const requirement of requirements) {
    const key = `${requirement.formulaId}:${requirement.missing.join(',')}:${requirement.formula}`
    if (seen.has(key)) {
      continue
    }

    seen.add(key)
    unique.push(requirement)
  }

  return unique
}

function describeSelection(
  target: QuantityId,
  formula: string,
  inputs: SolveStepInput[],
): string {
  const targetLabel = quantityMap[target].label
  const inputLabels = inputs.map((input) => input.label).join(', ')
  const derivedLabels = inputs
    .filter((input) => input.source === 'derived')
    .map((input) => input.label)
    .join(', ')

  if (derivedLabels.length > 0) {
    return `${formula} was selected because it directly solves ${targetLabel} from ${inputLabels}, and ${derivedLabels} could be derived deterministically first.`
  }

  return `${formula} was selected because it directly solves ${targetLabel} from the known values ${inputLabels}.`
}

function compareCandidates(left: Candidate, right: Candidate): number {
  if (left.totalSteps !== right.totalSteps) {
    return left.totalSteps - right.totalSteps
  }

  if (left.derivedInputs !== right.derivedInputs) {
    return left.derivedInputs - right.derivedInputs
  }

  if (left.priority !== right.priority) {
    return right.priority - left.priority
  }

  return left.formulaId.localeCompare(right.formulaId)
}

function hasSameScore(left: Candidate, right: Candidate): boolean {
  return (
    left.totalSteps === right.totalSteps &&
    left.derivedInputs === right.derivedInputs &&
    left.priority === right.priority
  )
}

export const formulaCount = formulaVariants.length
