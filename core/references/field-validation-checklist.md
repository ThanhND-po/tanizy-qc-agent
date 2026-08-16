# Field Validation Discovery Checklist

The installer seeds this project-owned file at
`qc/config/field-validation-checklist.md`. A project may customize it. Installer
updates must never overwrite an existing copy.

Use this checklist to discover missing validation rules and source-backed test angles. It is not a requirement source. Do not invent a limit, error message, accepted character set, status code, or Expected Result because it appears in this checklist.

For every field in scope:

1. Record the field and its requirement/design source.
2. Mark each relevant check as `DEFINED`, `NOT_APPLICABLE`, or `SPEC_GAP`.
3. Create test cases only for `DEFINED` behavior.
4. Convert `SPEC_GAP` behavior into an Open Question. If it affects Test Data or Expected Result, set `Blocks From Phase = DESIGN` for the affected scope.

## Text

- Required or optional
- Minimum and maximum length
- Whitespace-only and leading/trailing spaces
- Allowed and forbidden character sets
- Unicode, Vietnamese diacritics, CJK, and emoji
- HTML/script and SQL-like input handling when a security source applies
- Paste and normalization behavior

## Email

- Accepted format and length
- Local-part/domain character rules
- Case sensitivity and normalization
- Duplicate behavior when uniqueness is defined
- Disposable-domain policy when explicitly required

## Phone

- Country and area code rules
- Minimum and maximum length
- Separators, spaces, and normalization
- Invalid characters and prefixes

## Date and DateTime

- Display and storage format
- Invalid calendar dates and leap years
- Past/future restrictions and min/max
- Timezone and daylight-saving behavior

## Number and Currency

- Minimum, maximum, zero, and negative rules
- Decimal scale and rounding
- Overflow and leading zeros
- Currency and thousands-separator formatting

## Dropdown and Select

- Default value and required behavior
- Valid, disabled, removed, and reordered options
- Dynamic option loading and side effects

## Checkbox and Radio

- Default state and required behavior
- Single-selection or combination rules
- Disabled-state behavior

## File Upload

- Allowed type and maximum size
- Empty, duplicate, multiple, and special-character filenames
- Upload method and failure recovery

## Password and OTP

- Length and composition policy
- Show/hide, copy/paste, and confirm behavior
- Expiry, retry, resend, and lockout rules
- Leading-zero preservation for OTP

## Textarea and Rich Text

- Length, line breaks, and counter behavior
- Sanitization policy and allowed markup
- Pasted formatting and embedded media

## Multi-Select, Tag, Range, and Stepper

- Count, duplicate, order, min/max, and increment rules
- Keyboard interaction and manual input behavior

## Flow-Level Discovery

- Double submit, concurrency, and idempotency
- Session expiry and network interruption
- Localization and accessibility
- API status/error contract
- Audit and observability behavior

Only generate a test for these items when the source or an explicit user decision defines the expected outcome.
