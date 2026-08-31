# Tanizy QC Agent Rule

Use installed `qc-*` skills only after an explicit QC request.
Read `qc/config/material-paths.md`, keep project-owned outputs under `qc/`, apply the spec-first and approval gates, and never modify requirement documents or infer missing business behavior.
Treat PO handoff or approved specs inside or outside the project as read-only source input, not inherited QC approval.
Treat only exact user-supplied or explicitly approved locators as authorized inputs.
A feature name, module name, scope key, keyword, or prior project knowledge is not a source locator.
If a required locator or content is missing, stop with `BLOCKED_INPUT` and ask in chat.
Do not search the filesystem for it or request broader filesystem permission unless the user explicitly approves one bounded search root.
