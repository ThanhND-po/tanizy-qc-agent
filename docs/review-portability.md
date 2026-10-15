# Installation Portability and Path Recovery Review

Review date: 2026-10-15.
Prepared package: `0.8.8`.
Scope: installer, published layouts, nine QC skill entrypoints, shared contract, three supported adapters, package references, and manual-result helpers.

## Findings and Resolution

| Finding | User impact | Resolution |
|---|---|---|
| Shared contract is a single required file without a bootstrap recovery rule | Deleting it prevents the agent from loading the rules that could explain recovery | Each skill and adapter now reports `BLOCKED_INSTALLATION` with the exact path before any substitute search or reconstruction |
| `qc/`, skill references, and terminal working directory have different bases | A nested working directory or helper invocation from a skill folder can resolve inputs or outputs incorrectly | `qc/` resolves from the confirmed project root; references/helpers resolve from the loaded skill directory; manual helper commands use an absolute script path from the project root |
| Gap Finder refers to an installed seed that is not installed inside its skill | A missing ledger or `--skip-refs` installation can trigger a hunt for package-checkout files | A confirmed new ledger uses the installed OQ schema guide; expected lost history remains `BLOCKED_INPUT` |
| Deleted project-owned data and deleted package files require different recovery | A normal installer run could seed an empty missing ledger or context file | Repair instructions use `--force --skip-refs`, preserve known history, and distinguish repair from data restoration |
| Missing source files can be discovered after a force replacement begins | A damaged distributable can leave an installation partially replaced | Installer preflight checks planned sources and selected entrypoints' routed references/helpers before any destination mutation |
| Gemini CLI is no longer used | Package continues advertising and installing an obsolete target | Removed adapter, target, alias, package keyword, and active installation examples; rejection occurs without writes |

No machine-specific home path is required by the published workflow.
The maintainer's local installation sandbox remains a repository-only convention.
Installed skill files and runtime contract are copied locally; they do not depend on keeping the package source checkout or npm cache at its original location.

## Supported Moves and Limits

- Moving the complete project with its hidden target-native skill directories preserves package-relative paths.
- External absolute source locators and retained artifact links still need verification after a move.
- Moving only `qc/` or a skill directory is outside the supported runtime layout; restore the layout or review a migration before writing.
- An exact approved new source locator can be reused without broad discovery, while canonical output paths remain under `qc/`.
- Lost decisions, locked designs, execution history, and evidence require the user's restored data or exact replacement input; package repair cannot reconstruct them.
- Missing optional context remains a disclosed limitation rather than a new mandatory gate.
- Gemini installations already on a user's machine are preserved; this release does not uninstall or delete them.

The fixed runtime layout remains intentional.
Recovery is explicit and bounded rather than an automatic search for similarly named files.
Installer preflight does not provide rollback for arbitrary disk or permission failures during copying.
The missing-source checks cover planned copy sources and direct reference/helper routes declared by selected skill entrypoints; they are not a general checksum or transitive module-integrity verifier.

## Verification

`npm run pack:check` passed with all three supported targets, selected installs, force refresh, managed-block preservation, PO coexistence, malformed-block rejection, symlink guards, and packaged CLI checks.
Additional installer scenarios passed for complete project moves to paths with spaces and Unicode, deletion and repair of the shared contract and templates, repair without recreating an absent project-owned seed, installed helper execution, and damaged-package rejection before writes.
Both `gemini-cli` and `gemini` are rejected without changing the target project, and the packed file list excludes the retired adapter.

The configured Codex sandbox was refreshed from this checkout after a safe dry run.
Its 22 package skill files, three generated execution references, shared contract, and Codex managed block matched the source.
Its installed manual-results helper prepared XLSX, CSV, and Markdown using temporary synthetic inputs and outputs.

These checks establish local package and helper compatibility, not host/model behavior.
Actual Antigravity and Claude Code host discovery, other operating systems, and weaker-model tool-choice compliance were not evaluated in this review.
Use `tests/read-boundaries/rubric.md` from a source checkout for behavioral assessment; that reviewer-only rubric is not a runtime dependency or included in the published package.
