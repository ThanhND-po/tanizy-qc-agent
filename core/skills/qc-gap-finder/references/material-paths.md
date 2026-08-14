# Material Path Layout

All QC artifacts live under the `qc/` directory of the target project, but each
material type has its own dedicated subfolder named after the feature it
belongs to. Materials are **never** dumped into the `qc/` root (except the OQ
ledger and refs, which are shared across features).

## Directory Layout

```
qc/
├── AGENTS.md                        # QC actor routing rules (created by installer)
├── open-questions.md                # Shared OQ ledger (all features)
├── refs/                            # Runtime context (created by installer)
│   ├── system-context.md
│   ├── bug-base.md
│   └── ...
├── gap-reports/
│   ├── <epic|feature>-gap-report.md
│   └── ...
├── test-viewpoints/
│   ├── <epic|feature|user-story>-viewpoints.md
│   └── ...
├── test-cases/
│   ├── <epic|feature|user-story>-test-cases.md
│   └── ...
├── executions/
│   ├── <feature|sprint>-executions.md
│   └── ...
└── reports/
    ├── test-report-<feature>-<YYYY-MM-DD>.html   # stakeholder-facing (primary)
    ├── test-report-<feature>-<YYYY-MM-DD>.pptx
    ├── test-report-<feature>-<YYYY-MM-DD>.md
    └── ...
```

## Naming Rules

1. Use the **exact name** of the Epic/Feature/User Story file (minus extension),
   kebab-cased. Example:
   `fs-paypay-bank-direct-transfer.md` →
   `qc/test-cases/paypay-bank-direct-transfer-test-cases.md`.
2. When a material covers several stories, name it after the parent feature.
3. Never create two materials with the same name; version by updating the file
   and noting the change in its header table (see template headers).
4. Reports always land in `qc/reports/`, never in `qc/` root.

## Cross-Material Traceability

Every material must reference its neighbors by relative path:
- Viewpoints file lists the gap report it derives from.
- Test cases file lists the viewpoints file and traces each case to Viewpoint
  IDs and AC numbers.
- Executions log references the test cases file by relative path and Test Case
  IDs.
- Report aggregates executions and cites the test cases/viewpoints paths.
