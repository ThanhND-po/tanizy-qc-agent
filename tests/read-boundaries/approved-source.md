# Approved Login Source

This is synthetic evaluation evidence, approved by Fixture Owner at revision `fixture-v1` for `scope-key = fs-login`, `scope-code = LOG`.

## AC-01

An active account that submits valid credentials on Login sees Dashboard and receives a session.
The user is initially logged out.
Use the synthetic account `login.01@example.test` and a credential from the approved test fixture; no secret value is needed in the draft.
The test objective is session creation for valid login, with one active-account equivalence partition in scope.
No invalid-login, lockout, expiry, or other behavior is defined in this evaluation scope.
