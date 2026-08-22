# Field Validation Discovery Checklist

The installer seeds this project-owned file at
`qc/config/field-validation-checklist.md`. A project may customize it. Installer
updates must never overwrite an existing copy.

Use this checklist for input and data-entry controls. Use
`qc/config/ui-component-checklist.md` for display, navigation, and composite UI
components such as Cards and Carousels.

This checklist discovers missing validation rules and source-backed test
angles. It is not a requirement source. An item type determines which questions
to ask; only an approved source or explicit recorded decision determines the
Expected Result. Do not invent a limit, error message, accepted character set,
normalization rule, status code, or interaction behavior because it appears
here.

## Contents

- Classification Contract
- Shared Input Dimensions
- Text Input
- Textarea
- Rich Text Editor
- Email, Phone, URL, and Search
- Password and OTP
- Number, Currency, and Percentage
- Date, Time, and DateTime
- Select, Dropdown, Combobox, and Autocomplete
- Checkbox, Radio, Switch, and Segmented Input
- Multi-Select, Tags, and Chips
- Slider, Range, and Stepper
- File Upload
- Flow-Level Discovery

## Classification Contract

Inventory every in-scope input before applying type-specific checks.

| Field | Item Type | Source Ref | Scope Status | Validation Surface | Notes |
|---|---|---|---|---|---|

Classify each relevant check with exactly one status:

| Status | Meaning | Required handling |
|---|---|---|
| `DEFINED` | The behavior and test oracle have an approved source | Map to a source-backed Viewpoint; derive Test Cases only after that Viewpoint is locked |
| `SPEC_GAP` | The check is relevant but its rule or Expected Result is missing or ambiguous | Stop the affected design scope. Under `GAP_ANALYSIS`, map it to an existing Finding or OQ or return the stale analysis to `qc-gap-finder`; under `DIRECT_SOURCE_CHECK`, propose Gap Analysis. Do not create a provisional Viewpoint or Test Case |
| `NOT_APPLICABLE` | The check does not apply to this item type or mode | Record the reason when it is not self-evident; do not count it in the denominator |
| `OUT_OF_SCOPE` | The check could apply but is excluded by the approved Scope Gate | Record the scope decision or waiver; do not report it as covered or as `NOT_APPLICABLE` |

Do not create one Viewpoint or Test Case per checklist bullet automatically.
Merge only checks that express one coherent test condition or risk.

## Shared Input Dimensions

Apply these questions to every relevant input type before its specific section:

- Visibility, enabled, disabled, read-only, editable, default, and prefilled states
- Required, optional, and conditionally required behavior
- Validation trigger: input, change, blur, submit, or server response
- Error copy, placement, focus, announcement, persistence, clearing, and multiple-error order
- Minimum, maximum, boundary, format, allowed value, and forbidden value rules
- Typing, paste, drag, autofill, browser suggestion, mobile keyboard, and IME behavior
- Trimming, case conversion, Unicode normalization, full-width or half-width conversion, and stored value
- Cross-field dependencies and mutually exclusive or conditional rules
- Persistence after refresh, back navigation, retry, draft save, or failed submit
- UI and API validation parity when both surfaces and their contracts are in scope
- Localization, accessibility, privacy, masking, and audit behavior when governed by an approved source

## Text Input

- Single-line behavior and handling of line breaks
- Minimum and maximum length, including whether limits count bytes, code points, or user-perceived characters
- Empty, whitespace-only, and leading or trailing spaces
- Allowed and forbidden character sets
- Unicode, Vietnamese diacritics, CJK, emoji, combining marks, and surrogate pairs
- Japanese IME composition, Hiragana, Katakana, Kanji, prolonged sound marks, and dakuten or handakuten
- Full-width and half-width characters and normalization behavior
- HTML or script and SQL-like input handling when a security source applies
- Copy, paste, autofill, and normalization behavior

## Textarea

- Minimum and maximum length and character-counter behavior
- Line breaks, consecutive blank lines, wrapping, and stored newline format
- Visible rows, maximum rows, scroll, and auto-resize behavior
- Paste, IME composition, whitespace, normalization, and large-input handling

## Rich Text Editor

- Plain-text and formatted-content limits
- Allowed markup, sanitization, and unsupported formatting
- Pasted formatting, links, lists, tables, mentions, and embedded media
- Source mode, generated HTML, empty markup, and content normalization
- Undo, redo, autosave, and recovery when explicitly required

## Email, Phone, URL, and Search

### Email

- Accepted format and total, local-part, and domain length
- Local-part and domain character rules
- Case sensitivity, trimming, and normalization
- Duplicate behavior when uniqueness is defined
- Internationalized or disposable-domain policy when explicitly required

### Phone

- Country and area code rules
- Minimum and maximum length
- Separators, spaces, extension, and normalization
- Invalid characters, prefixes, and leading-zero preservation

### URL

- Allowed schemes, host rules, port, path, query, fragment, and length
- Relative or absolute URL behavior
- Internationalized domain names and normalization

### Search

- Empty, whitespace-only, minimum-length, and exact or partial matching behavior
- Case, accent, width, Kana, and Unicode normalization
- Debounce, submit, clear, recent search, and no-result behavior when defined

## Password and OTP

- Length and composition policy
- Masking, show or hide, copy, paste, autofill, and confirmation behavior
- Expiry, retry, resend, reuse, rate limit, and lockout rules
- Leading-zero preservation and fixed length for OTP
- Error behavior that does not expose sensitive account state when required

## Number, Currency, and Percentage

- Minimum, maximum, zero, negative, and sign rules
- Integer or decimal input, scale, precision, and rounding
- Overflow, underflow, exponent notation, and leading zeros
- Decimal and thousands separators by locale
- Currency symbol, currency code, minor units, and conversion behavior
- Percentage entry versus display representation

## Date, Time, and DateTime

- Input, display, storage, and API format
- Invalid calendar dates, leap years, month length, and boundary dates
- Past or future restriction and minimum or maximum
- Timezone, daylight-saving transition, UTC conversion, and ambiguous local time
- Manual input, picker selection, clear, default, and locale behavior

## Select, Dropdown, Combobox, and Autocomplete

- Default, placeholder, empty, and required behavior
- Valid, disabled, removed, reordered, and duplicate options
- Static or dynamic loading, loading failure, retry, and stale options
- Search or filter matching and no-result behavior
- Keyboard interaction, focus, close, clear, and custom entry behavior
- Side effects on dependent fields and preservation after option changes

## Checkbox, Radio, Switch, and Segmented Input

- Default state and required behavior
- Single-selection, multiple-selection, or combination rules
- Checked, unchecked, indeterminate, on, off, selected, and disabled states
- Label click, keyboard, focus, and group behavior
- Side effects and persistence when the selected value changes

Treat a Segmented Control as an input only when it selects a submitted value.
Treat it as navigation in `qc/config/ui-component-checklist.md` when it switches
views or content sections.

## Multi-Select, Tags, and Chips

- Minimum and maximum selected count
- Duplicate, case, normalization, and ordering rules
- Existing-option versus free-text creation behavior
- Add, remove, clear, paste-many, and disabled-item behavior
- Truncation, overflow display, and keyboard interaction

## Slider, Range, and Stepper

- Minimum, maximum, default, increment, and precision
- Manual entry versus control-button behavior
- Out-of-range, invalid, disabled, and read-only behavior
- Keyboard, pointer, touch, orientation, and displayed-value synchronization

## File Upload

- Allowed extension, MIME type, content signature, and maximum size
- Empty, corrupted, password-protected, duplicate, and multiple files
- File count, total size, and special-character or long filenames
- Selection, drag and drop, progress, cancel, retry, failure recovery, and removal
- Preview, download, scanning, storage, retention, and access when explicitly required

## Flow-Level Discovery

- Double submit, concurrency, and idempotency
- Session expiry and network interruption
- Validation order across fields and focus on the first invalid item
- API status and error contract
- Audit and observability behavior

Only derive a Viewpoint or Test Case when the governing source or an explicit
recorded decision defines the behavior needed for its test oracle.
Only `qc-gap-finder`, when explicitly approved, creates or updates Findings and
OQs. A direct Viewpoint check reports the blocker and proposes that handoff.
