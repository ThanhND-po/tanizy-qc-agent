# Existing Synthetic Cases and Evidence

## Scenario G: Draft coverage claim

Test Design Basis claims both `valid` and `expired` coupon branches and maps both to `TC-ATO-007`.

| TC ID | Title | Preconditions | Test Data | Steps | Expected Results | VP ID |
|---|---|---|---|---|---|---|
| TC-ATO-007 | Verify valid and expired coupon outcomes | Fresh cart with subtotal `100`, discount `0`, and total `100` units | Valid coupon `SAVE10-G`; expired coupon `OLD10-G` | 1. Open cart `C-G-VALID`. 2. Apply `SAVE10-G`. | 1. Cart summary is available. 2. Discount is `10` and total is `90` units. | VP-ATO-010 |

The current coverage total reports `2/2` branches designed.

## Scenario H: Execution evidence

The locked case objective is to verify the same-cart amount transformation and consistency across cart summary and Cart Details.

| Checkpoint | Input or state | Expected | Actual | Execution state |
|---|---|---|---|---|
| 1 | Open cart `C-H` | Cart summary shows subtotal `100`, discount `0`, and total `100` units | Values matched | PASS |
| 2 | Apply `SAVE10-H` | The same cart shows discount `10` and total `90` units | Discount remained `0` and total remained `100` units | FAIL |
| 3 | Open Cart Details | The same cart shows discount `10` and total `90` units | Not performed after checkpoint 2 failed | NOT_EXECUTED |
