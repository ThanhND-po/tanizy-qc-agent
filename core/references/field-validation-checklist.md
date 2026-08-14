# Field-Level Validation Checklist (Customizable)

This file is installed into the target project as `qc/field-validation-checklist.md`.
Each project owns this file and may customize, remove, or add items per its own
business rules. Skills reference this file; they do not contain the checklist inline.

When designing test cases for a form or screen, list every input field and
generate validation test cases **per field**, using the matching section below.
Never merge validation for multiple fields into a single test case.

Every input field must receive at least **1 positive** and **2+ negative/boundary**
validation test cases, unless the project team agrees otherwise.

## Text (Name, Address, ...)

Required/Optional, Min/Max length, whitespace-only, special characters (`<>&"'`),
XSS injection (`<script>alert(1)</script>`), SQL injection (`' OR 1=1--`),
Unicode/emoji, leading/trailing spaces, paste behavior.

## Email

Valid format (`user@domain.com`), missing `@`, missing domain, invalid domain,
multiple `@`, special characters before `@`, max length, case sensitivity,
duplicate email when unique, disposable domains (if the product forbids them).

## Phone

Digits only, valid prefix (`+84`, `0`), min/max length, letters mixed in,
dashes/dots/spaces, invalid country/area codes, formatting on paste.

## Date / DateTime

Correct format (dd/MM/yyyy, ISO...), non-existent dates (`31/02`, `30/02`),
leap year (`29/02/2024`), past vs future restrictions, min/max date, timezone
effects, daylight saving transitions.

## Number / Currency

Min/max value, negatives, zero, decimals, non-numeric characters, overflow,
leading zeros, currency formatting, thousands separators, negative currency.

## Dropdown / Select

Default value, all valid options, disabled options, changing selection side
effects, required validation, option reordering/deletion when the list is
dynamic.

## Checkbox / Radio

Default state, check/uncheck behavior, required validation, radio group
single-selection guarantee, mutually exclusive combinations with checkboxes.

## File Upload

Allowed vs blocked file types, max size, empty file (0 KB), special characters
in file names, multiple files, drag-drop vs button selection, duplicate upload.

## Password

Min/max length, special characters, mixed case, digits, copy-paste restrictions,
show/hide toggle, confirm password mismatch, strength meter thresholds.

## Textarea

Max length, line breaks, HTML tags, resize behavior, character counter accuracy.

## OTP / MFA Code

Auto-focus next cell, paste full OTP string, expiry timeout, retry limit /
lockout, re-send rate limit, leading zeros preservation.

## Date Range / Time Picker

End date earlier than start date, overlapping time windows, range caps
(e.g., max 30 days), past/future restrictions, crossing midnight.

## Rich Text Editor (WYSIWYG)

Sanitization of dangerous HTML (`<script>`, `<iframe>`), pasting formatted text
and images, character counter on raw text vs markup, toolbar disabled states.

## Multi-Select / Tag Input

Tag count limits, duplicate tags, removing tags via Backspace or the X button,
tags containing special characters, selection order persistence.

## Range Slider / Stepper

Min/max limits, step-increment violations, manual typed input vs dragging,
keyboard control.

## Scenarios Chuyên Sâu & Non-Functional (per form/screen)

Beyond per-field validation, every interactive flow should also cover:

1. **Race Condition & Double Submit:** double-clicking Save/Submit must not
   create duplicate records; concurrent edits of the same record by two
   users/tabs.
2. **Session & Network Resilience:** session or token expiry mid-form, network
   interruption during submission, slow (3G) timeouts, retry behavior.
3. **Localization & UTF-8 / Emoji:** full Vietnamese diacritics, emoji
   (😀🎉🚀), RTL, Chinese/Japanese/Arabic scripts.
4. **Keyboard Accessibility (A11y):** logical Tab order, Enter/Space activation,
   visible focus state.
5. **HTTP Status Codes (API test cases):** assert the codes relevant to the
   contract, typically `200/201 Success`, `400 Bad Request`,
   `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict`,
   `422 Unprocessable Entity`, `429 Rate Limit`, `500/503 Server Error`.
