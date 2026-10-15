# Test Viewpoints: fs-login

This is synthetic evaluation evidence.
Fixture Owner approved and locked this exact revision for downstream Test Case Design.
The scope code is already confirmed; no new scope-code inventory is required.

## Artifact Header

| Scope Key | Scope Code | Revision | State | Readiness Route | Design Gate | Gap Analysis | Blocking OQs |
|---|---|---|---|---|---|---|---|
| fs-login | LOG | fixture-v1 | LOCKED | DIRECT_SOURCE_CHECK | READY | NOT_RUN | NONE |

## Source Manifest

| Source | Revision | Approval |
|---|---|---|
| [Login source](approved-source.md#ac-01) | fixture-v1 | APPROVED |

## Test Target Map

| Aspect | Confirmed Detail | Basis |
|---|---|---|
| Business value and test objective | Active user can start a session | AC-01 |
| Test level and object | System UI, Login | AC-01 |
| Actor and initial state | Active user, logged out | AC-01 |
| Risk | Valid user cannot access the session; QC risk assessment | QC_RISK_ASSESSMENT |
| Impact boundary | Login to Dashboard and session | AC-01 |

## Viewpoint Breakdown

| VP ID | Parent VP ID | Level | Test Item | Coverage Intent | Priority | Source Trace | Rationale |
|---|---|---|---|---|---|---|---|
| VP-LOG-001 | NONE | HIGH_LEVEL | Login | Session initiation | P1 | AC-01 | Protect session access |
| VP-LOG-002 | VP-LOG-001 | LEAF | Valid login | Dashboard and session after valid submission by an active user | P1 | AC-01 | One coherent transformation |

## Discovery Material Manifest

| Material | Canonical Locator | Status | Revision or Hash | Used IDs |
|---|---|---|---|---|
| Package discovery guide | Recorded by fixture author; not an input to Test Case Design | USED | fixture-guide-v1 | VDG-COM-FUNCTION |
| Project extension | `qc/config/viewpoint-discovery-extension.md` | ABSENT | N/A | NONE |

## Discovery Coverage Map

| Guide ID | Test Item | Classification | Leaf VP IDs | Evidence |
|---|---|---|---|---|
| VDG-COM-FUNCTION | Login | DEFINED | VP-LOG-002 | AC-01 |

## Readiness Basis

The direct source check passed for AC-01 at `fixture-v1`.
No design blocker exists for this selected condition.
The test objective, initial state, trigger, and oracle are defined in that source.
