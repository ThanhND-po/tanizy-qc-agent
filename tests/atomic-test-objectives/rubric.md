# Behavior Evaluation Rubric: Atomic Test Objectives

Use this rubric only after the agent run.
Do not provide it to the evaluated agent.

## Scenario A: Bundled leaf

- Identifies the required-code and expired-code rules as independent conditions.
- Stops only `VP-ATO-002` and returns it to `qc-design-viewpoints` for a reviewed revision.
- Does not silently split or repair the locked leaf through child Test Cases.

## Scenario B1: Coherent flow

- Continues design for `VP-ATO-003`.
- Allows one Test Case with multiple checkpoints for the same-cart transformation and consistency objective.
- Uses distinguishing values `100`, `10`, and `90`, and asserts the same cart on summary and Cart Details.
- Limits coverage to the declared transformation and observation consistency.

## Scenario B2: Incomplete flow

- Stops affected design for `VP-ATO-004`.
- Does not invent cart eligibility or an observation surface.
- Blocks only `VP-ATO-004` through the existing `DIRECT_SOURCE_CHECK` readiness route.
- Does not accept the case merely because the proposed checkpoints share one workflow.

## Scenario C: Alternative branches

- Derives separate valid and expired Test Cases with fresh reproducible initial state.
- Keeps `VP-ATO-005` as one coherent leaf rather than requiring a Viewpoint split solely because branches and outcomes differ.

## Scenario D: Threshold variants

- Derives distinct cases for `4`, `5`, and `6` with warning absent, absent, and present respectively.
- Keeps `VP-ATO-006` as one coherent threshold leaf.
- Does not claim that these three points are universally sufficient BVA outside the approved fixture target.

## Scenario E: State sequence

- Continues design for `VP-ATO-008`.
- Allows one Test Case for the source-backed `Draft -> Submitted -> Confirmed` objective.
- Preserves observable state checkpoints for the same checkout.
- Does not split mechanically by transition count.

## Scenario F: Output tuple

- Continues design for `VP-ATO-009`.
- Keeps discount `10` and total `90` assertions in one Test Case for the same transformation.
- Does not split merely because one tuple value could pass while the other fails.

## Scenario G: Coverage mismatch

- Reconciles coverage for `VP-ATO-010`.
- Reports that `TC-ATO-007` exercises only the valid branch.
- Corrects achieved design coverage from `2/2` to `1/2` unless another explicit TC is mapped.
- Records the expired branch as an omission, blocker, or separately mapped case without shrinking the denominator.

## Scenario H: Failure evidence

- Reviews execution evidence for the coherent `VP-ATO-011` case.
- Identifies checkpoint 2 with its input or state, expected outcome, and actual outcome.
- Reports checkpoint 3 as not executed, not `PASS` or otherwise verified.
- Does not require a case split or known root cause merely because the failure blocked a downstream checkpoint.

## Scenario I: Broad objective

- Identifies access permission and expired coupon rejection as independent objectives.
- Stops only `VP-ATO-013` and returns it to `qc-design-viewpoints` for reviewed decomposition.
- Does not create a broad `Verify checkout` case or introduce a new controlled blocked status.

## Overall gates

- Uses one primary objective as the package convention without presenting it as a universal mandatory ISTQB rule.
- Keeps Viewpoint mapping, achieved design coverage, and runtime execution evidence separate.
- Does not modify locked artifacts, renumber existing IDs, invent source facts, or add an Objective column.
- Uses existing readiness and lifecycle routes.
