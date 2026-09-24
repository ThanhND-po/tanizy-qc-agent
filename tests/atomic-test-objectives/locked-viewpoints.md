# Test Viewpoints: Atomic Test Objectives Evaluation

## 1. Artifact Header

| Scope Key | Scope Code | Artifact Type | Revision | State | Readiness Route | Design Gate | Gap Analysis | Parent Gap Revision | Blocking OQs | Approved By | Approved At |
|---|---|---|---|---|---|---|---|---|---|---|---|
| atomic-test-objectives | ATO | Test Viewpoints | fixture-v1 | LOCKED | DIRECT_SOURCE_CHECK | READY | NOT_RUN | NOT_APPLICABLE | NONE | Evaluation Fixture Owner | 2026-09-24 |

## 2. Source Manifest

| Source path | Section or ID | Revision or hash |
|---|---|---|
| `tests/atomic-test-objectives/approved-sources.md` | Scenarios A-I | fixture-v1 |

## 3. Discovery Material Manifest

| Material | Canonical Locator | Status | Revision or Hash | Used IDs | Notes |
|---|---|---|---|---|---|
| Package Viewpoint Discovery Guide | `.agents/skills/qc-design-viewpoints/references/viewpoint-discovery-guide.md` | USED | installed evaluation revision | `VDG-FUNC-01` | Synthetic behavior evaluation only. |
| Optional Project Extension | `qc/config/viewpoint-discovery-extension.md` | ABSENT | N/A | NONE | Absence is non-blocking. |

## 4. Readiness Basis

| Route | Check or Parent Artifact | Result | Notes |
|---|---|---|---|
| DIRECT_SOURCE_CHECK | Approved synthetic source fixture | PASS | The parent evaluation artifact is locked; deliberately incomplete behavior remains isolated to Scenario B2. |

## 5. Test Target Map

| Aspect | Confirmed Detail | Basis or Source | Status |
|---|---|---|---|
| Test level | Functional design evaluation | Approved synthetic source fixture | IN_SCOPE |
| Test objects | Shopping cart and checkout records | Approved synthetic source fixture | IN_SCOPE |
| Users | Signed-in owner and different user where specified | Scenario I | IN_SCOPE |
| Product risk | Incorrect validation, amount transformation, state sequence, access, or coverage claim | Scenarios A-I | QC_RISK_ASSESSMENT |

## 6. Test Item Inventory

| Test Item | Item Type | Parent Object | Source Refs | Scope Status | Applicable Guide IDs | Notes |
|---|---|---|---|---|---|---|
| Coupon application | Business operation | Shopping cart | Scenarios A-D, F-H | IN_SCOPE | `VDG-FUNC-01` | Synthetic item. |
| Checkout lifecycle | State-based operation | Checkout | Scenario E | IN_SCOPE | `VDG-FUNC-01` | Synthetic item. |
| Checkout access and coupon handling | Interaction | Checkout | Scenario I | IN_SCOPE | `VDG-FUNC-01` | Intentionally broad locked leaf for regression review. |

## 7. Viewpoint Breakdown

| VP ID | Parent VP ID | Level | Test Item | Item Type | Lens | Coverage Intent | Priority | Source, Objective, or Risk Trace | Rationale |
|---|---|---|---|---|---|---|---|---|---|
| VP-ATO-001 | NONE | HIGH_LEVEL | Coupon application | Business operation | Function | Coupon application behavior | P1 | Scenarios A-D, F-H | Group related synthetic coupon behavior. |
| VP-ATO-002 | VP-ATO-001 | LEAF | Coupon application | Business operation | Validation | Coupon code is required and expired coupons are rejected | P1 | Scenario A | Intentionally bundled locked leaf. |
| VP-ATO-003 | VP-ATO-001 | LEAF | Coupon application | Business operation | Transformation | Applying an eligible fixed-discount coupon updates the same cart amounts consistently across summary and details | P1 | Scenario B1 | Coherent transformation and observation consistency. |
| VP-ATO-004 | VP-ATO-001 | LEAF | Coupon application | Business operation | Transformation | Applying an eligible fixed-discount coupon updates cart amounts | P1 | Scenario B2 | Deliberately incomplete source facts. |
| VP-ATO-005 | VP-ATO-001 | LEAF | Coupon application | Business operation | Decision | Coupon application outcome follows the defined validity branch | P1 | Scenario C | One coherent validity condition with two branches. |
| VP-ATO-006 | VP-ATO-001 | LEAF | Coupon application | Business operation | Boundary | Cart quantity warning follows the defined threshold rule | P1 | Scenario D | One coherent boundary condition. |
| VP-ATO-007 | NONE | HIGH_LEVEL | Checkout lifecycle | State-based operation | State | Checkout lifecycle behavior | P1 | Scenario E | Group lifecycle behavior. |
| VP-ATO-008 | VP-ATO-007 | LEAF | Checkout lifecycle | State-based operation | State | The same checkout follows the approved `Draft -> Submitted -> Confirmed` sequence | P1 | Scenario E | The sequence is the approved objective. |
| VP-ATO-009 | VP-ATO-001 | LEAF | Coupon application | Business operation | Transformation | Applying a fixed-discount coupon produces the defined discount and total tuple | P1 | Scenario F | Coherent output tuple. |
| VP-ATO-010 | VP-ATO-001 | LEAF | Coupon application | Business operation | Decision | Valid and expired coupon branches receive their defined outcomes | P1 | Scenario G | Coherent validity condition. |
| VP-ATO-011 | VP-ATO-001 | LEAF | Coupon application | Business operation | Transformation | Coupon application keeps summary and details consistent for the same cart | P1 | Scenario H | Coherent flow with multiple checkpoints. |
| VP-ATO-012 | NONE | HIGH_LEVEL | Checkout access and coupon handling | Interaction | Function | Checkout access and coupon handling | P1 | Scenario I | Group checkout concerns. |
| VP-ATO-013 | VP-ATO-012 | LEAF | Checkout access and coupon handling | Interaction | Function | Checkout enforces access permission and rejects expired coupons | P1 | Scenario I | Intentionally bundled locked leaf. |

## 8. Discovery Coverage Map

| Guide or Extension ID | Test Item | Classification | Leaf VP IDs | Evidence or Exclusion Basis |
|---|---|---|---|---|
| `VDG-FUNC-01` | Coupon application | DEFINED | VP-ATO-002, VP-ATO-003, VP-ATO-004, VP-ATO-005, VP-ATO-006, VP-ATO-009, VP-ATO-010, VP-ATO-011 | Approved synthetic source fixture. |
| `VDG-FUNC-01` | Checkout lifecycle | DEFINED | VP-ATO-008 | Approved synthetic source fixture. |
| `VDG-FUNC-01` | Checkout access and coupon handling | DEFINED | VP-ATO-013 | Approved synthetic source fixture. |

## 9. Coverage

| Dimension | Covered | Total | Blocked | Coverage % |
|---|---:|---:|---:|---:|
| Synthetic source scenarios | 9 | 9 | 0 | 100% of declared fixture scenarios |
| Leaf Viewpoints | 10 | 10 | 0 | 100% of locked fixture leaves |

## 10. Blocked Scope

| Test Item or Requirement Ref | Guide ID or Missing Behavior | OQ ID | Missing Evidence |
|---|---|---|---|
| NONE | NONE | NONE | NONE |

## 11. Review History

| Revision | Date | Change | Reviewer |
|---|---|---|---|
| fixture-v1 | 2026-09-24 | Created neutral regression fixture. | Evaluation Fixture Owner |
