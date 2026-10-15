# Tanizy QC Agent Rule

Use installed `qc-*` skills only after an explicit QC request.
Resolve `qc/` from the confirmed project root and references/helpers from the loaded skill directory; ask for an unclear root without searching.
If the shared contract or a required package reference/helper is missing or unreadable, stop with `BLOCKED_INSTALLATION`, name the exact path, and request installer repair; never search for substitutes or reconstruct instructions from memory.
Apply `Path Resolution and Recovery` in the shared contract to moved or deleted project inputs.
Read `qc/config/material-paths.md`, keep project-owned outputs under `qc/`, apply the spec-first and approval gates, and never modify requirement documents or infer missing business behavior.
Confirm reader-facing artifact language at the QC Scope Gate, default to Vietnamese unless the user explicitly requests another language, retain exact technical terms and controlled values, and never add the selected language to artifact headers.
Reconcile reader-facing Controlled Value Legends after every artifact content change according to `qc/config/material-paths.md`; never approve, lock, export, or report with `LEGEND_UNDEFINED_VALUE` unresolved.
Treat PO handoff or approved specs inside or outside the project as read-only source input, not inherited QC approval.
Apply `Read Scope and Template Sources` in the shared contract: never open historical artifacts to learn formatting, and limit identifier checks to metadata.
Treat only exact user-supplied or explicitly approved locators as authorized inputs.
A feature name, module name, scope key, keyword, or prior project knowledge is not a source locator.
If a required locator or content is missing, stop with `BLOCKED_INPUT` and ask in chat.
Do not search the filesystem for it or request broader filesystem permission unless the user explicitly approves one bounded search root.
