# Approved Synthetic Sources: Atomic Test Objectives

These contracts are synthetic regression inputs approved only for package behavior evaluation.
They do not describe a real product.

## Scenario A: Bundled coupon conditions

- Applying a coupon requires a non-empty coupon code.
- Applying an expired coupon is rejected and leaves the cart unchanged.

## Scenario B1: Coherent cart transformation

- Cart `C-B1` contains one eligible item with subtotal `100` units, discount `0`, and total `100` units.
- Coupon `SAVE10-B1` is valid and eligible for cart `C-B1` and applies a fixed discount of `10` units.
- No other adjustment applies to this fixture.
- Applying the coupon updates the same cart to discount `10` and total `90` units.
- Cart Details exposes the same cart's resulting discount and total.

## Scenario B2: Incomplete cart transformation

- Coupon `SAVE10-B2` applies a fixed discount of `10` units only to an eligible cart.
- The source does not define whether cart `C-B2` is eligible.
- The source does not identify an approved observation surface for the resulting amounts.

## Scenario C: Coupon validity branches

- Cart `C-C` starts with subtotal `100` units, discount `0`, and total `100` units.
- Applying valid coupon `SAVE10-C` changes the cart to discount `10` and total `90` units.
- Applying expired coupon `OLD10-C` is rejected and leaves discount `0` and total `100` units.
- Each branch begins from a fresh cart with the stated initial values.
- The cart summary exposes coupon feedback, discount, and total.

## Scenario D: Quantity threshold

- The cart quantity warning is absent when quantity is less than or equal to `5`.
- The cart quantity warning is present when quantity is greater than `5`.
- The approved coverage target for this evaluation is quantity `4`, `5`, and `6`.
- Each variation starts with a fresh cart and the cart summary exposes the warning state.

## Scenario E: Checkout state sequence

- Checkout `C-E` starts in `Draft`.
- Submitting checkout `C-E` changes its state from `Draft` to `Submitted`.
- Recording an approved payment for that same checkout changes its state from `Submitted` to `Confirmed`.
- Checkout Details exposes the current state after each event.
- The approved objective is to verify the complete `Draft -> Submitted -> Confirmed` sequence for the same checkout.

## Scenario F: Discount output tuple

- Cart `C-F` starts with subtotal `100` units, discount `0`, and total `100` units.
- Applying valid coupon `SAVE10-F` changes the same cart to discount `10` and total `90` units.
- No other adjustment applies to this fixture.
- The cart summary exposes both discount and total.

## Scenario G: Valid and expired coverage target

- The approved coverage target contains two items: a valid coupon branch and an expired coupon branch.
- Valid coupon `SAVE10-G` changes cart `C-G-VALID` from discount `0` and total `100` to discount `10` and total `90` units.
- Expired coupon `OLD10-G` is rejected for cart `C-G-EXPIRED` and leaves discount `0` and total `100` units.
- Each cart starts fresh, and the cart summary exposes coupon feedback, discount, and total.

## Scenario H: Coherent flow failure evidence

- Cart `C-H` starts with subtotal `100` units, discount `0`, and total `100` units.
- Valid coupon `SAVE10-H` should change the same cart to discount `10` and total `90` units.
- Cart Details should expose the same resulting discount and total.
- The approved objective is the same-cart transformation and consistency across cart summary and Cart Details.

## Scenario I: Independent checkout concerns

- A signed-in owner may open checkout `C-I`; a different user is denied access.
- Applying an expired coupon to an accessible checkout is rejected and leaves its amounts unchanged.
- Access permission and expired coupon validation are independent rules with independent outcomes.
