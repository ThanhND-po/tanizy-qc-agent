# Tanizy QC Agent for Codex

This project uses Tanizy QC Agent skills for Quality Control workflows. QC is a standalone actor and runs only when the user explicitly invokes QC review.

## Global QC Rules

- Read the installed global material-paths reference at `qc/material-paths.md` before creating or updating any QC material, including `qc-task.md` and `open-questions.md`. Each installed skill also contains the same file at `references/material-paths.md`; these copies are generated from the single canonical source in this package.
- All QC artifacts live under `qc/`; generated materials must follow the directory, naming, and traceability rules in that reference.
- Do not modify requirement documents or start QC automatically. Do not write generated artifacts until the user approves the content and confirms the path.
- Ask in Vietnamese by default, keep technical terms in English, and never guess locators, endpoints, or payload schemas.

## Skill Routing

- Explicit QC review: use `qc-orchestrator`.
- Gaps, ambiguities, and testability: use `qc-gap-finder`.
- Test Viewpoints: use `qc-design-viewpoints`.
- Traceable test cases: use `qc-design-test-cases`.
- Playwright Gherkin export: use `qc-export-gherkin`.
- Playwright MCP execution: use `qc-run-playwright`.
- Postman collection export: use `qc-export-postman`.
- Stakeholder-facing reports: use `qc-report-generator`.
