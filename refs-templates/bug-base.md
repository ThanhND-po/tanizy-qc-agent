# Bug Base

This project-owned reference stores verified known defects and observed product failures.
Installer updates preserve existing content.

Do not add a risk hypothesis, missing requirement, locator failure, or automation error as a product bug.

Evidence is required before a failed execution is promoted into Bug Base, but the locator may point outside the project tree.
Use an exact file path, URL, or external evidence ID.
Do not invent a customer tracker ID or use `TBD`.

Use one lifecycle table so traceability remains available after closure.
Status is `OPEN`, `IN_PROGRESS`, `FIXED`, `VERIFIED`, `CLOSED`, or `REOPENED`.

## Bug Registry

| Bug ID | Scope Key | Module | Related Requirement | TC ID | Run ID | Summary | Status | Environment | Evidence | Observed At | Observed By | Fixed Version | Closed At | Regression Implication |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|

## Example

The row below is illustrative only.
Do not treat it as a verified project bug.
Before copying it into Bug Registry, replace every placeholder with verified data.
If Evidence is unavailable, keep the failure in the execution log and do not promote it into Bug Base.

| Bug ID | Scope Key | Module | Related Requirement | TC ID | Run ID | Summary | Status | Environment | Evidence | Observed At | Observed By | Fixed Version | Closed At | Regression Implication |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| BUG-CART-001 | `fs-shopping-cart` | Shopping Cart | `replace-with-shopping-cart-requirement-ref` | `replace-with-TC-ID` | `replace-with-Run-ID` | Sau khi xóa sản phẩm, cart badge vẫn hiển thị số lượng cũ cho đến khi reload trang. | OPEN | Web / test | `replace-with-external-evidence-path-url-or-id` | `YYYY-MM-DDTHH:mm:ssZ` | `replace-with-observer` | | | Bổ sung regression coverage cho item removal, quantity recalculation, cart badge refresh và empty-cart state. |

## Revision History

| Revision | Date | Change | Updated By | Change Source |
|---|---|---|---|---|
| 1 | | Seed created | Installer | Package template |
