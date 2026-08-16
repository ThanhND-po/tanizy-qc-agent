# Bug Base

This project-owned reference stores verified known defects and observed product failures. Installer updates preserve existing content.

Do not add a risk hypothesis, missing requirement, locator failure, or automation error as a product bug.

Evidence is required before a failed execution is promoted into Bug Base, but
the locator may point outside the project tree. Use an exact file path, URL, or
external evidence ID. Do not invent a customer tracker ID or use `TBD`.

Use one lifecycle table so traceability remains available after closure. Status
is `OPEN`, `IN_PROGRESS`, `FIXED`, `VERIFIED`, `CLOSED`, or `REOPENED`.

## Bug Registry

| Bug ID | Scope Key | Module | Related Requirement | TC ID | Run ID | Summary | Status | Environment | Evidence | Observed At | Observed By | Fixed Version | Closed At | Regression Implication |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|

## Example

The row below is illustrative only. Do not treat it as a verified project bug.
Before copying it into Bug Registry, replace every placeholder with verified data. If Evidence is unavailable, keep the failure in the execution log and do not promote it into Bug Base.

| Bug ID | Scope Key | Module | Related Requirement | TC ID | Run ID | Summary | Status | Environment | Evidence | Observed At | Observed By | Fixed Version | Closed At | Regression Implication |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| BUG-TOU-001 | `replace-with-scope-key` | Mobile App / ToU | `replace-with-ToU-requirement-ref` | `replace-with-TC-ID` | `replace-with-Run-ID` | Cache của app vẫn tồn tại trên Android phone sau khi xóa bản Test app. Khi cài bản mới từ Firebase App Distribution, QC không thể trigger màn hình ToU. | OPEN | Android / Firebase App Distribution build | `replace-with-external-evidence-path-url-or-id` | `YYYY-MM-DDTHH:mm:ssZ` | `replace-with-observer` | | | Bổ sung regression coverage cho uninstall, reinstall, cache cleanup và điều kiện trigger ToU ở lần mở app đầu tiên. |

## Revision History

| Revision | Date | Change | Updated By | Change Source |
|---|---|---|---|---|
| 1 | | Seed created | Installer | Package template |
