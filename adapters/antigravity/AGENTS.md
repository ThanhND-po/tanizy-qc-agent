## Tanizy QC Agent for Antigravity

Use Tanizy QC Agent only when the user explicitly requests QC work. Do not
start QC because a requirement file was created or changed.

### QC Rules

- Read the shared contract at `qc/config/material-paths.md` before proposing an
  artifact.
- Keep installed skills in `.agents/skills/qc-*` and project-owned artifacts
  under `qc/`. Never install skills inside `qc/`.
- Keep requirement and PO artifacts read-only.
- Accept explicitly supplied approved specs from inside or outside the project
  when their exact locator, approval state, and revision are available.
- Treat a PO handoff as source input only. It does not grant QC write, Lock,
  Execution, or Release Verdict approval.
- Apply the spec-first gate. Missing behavior that affects Test Data or Expected
  Results blocks the affected design, export, and execution scope.
- Draft first, then obtain explicit approval for content and exact paths before
  writing.
- Require a separate Execution Gate before browser or API actions.
- Ask in Vietnamese by default, retain exact English technical terms, and never
  guess business rules, selectors, endpoints, payloads, or release decisions.

### Skill Routing

Route only to a `qc-*` skill that exists in `.agents/skills/`. A selective
install does not make the other package skills available.
