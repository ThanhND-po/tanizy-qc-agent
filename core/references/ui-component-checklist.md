# UI Component Discovery Checklist

The installer seeds this project-owned file at
`qc/config/ui-component-checklist.md`. A project may customize it. Installer
updates must never overwrite an existing copy.

Use this checklist for display, navigation, feedback, and composite UI
components. Use `qc/config/field-validation-checklist.md` for input and
data-entry controls.

This checklist discovers missing component behavior and source-backed test
angles. It is not a requirement or design source. An item type determines which
questions to ask; only an approved source, approved UI standard, or explicit
recorded decision determines the Expected Result.

## Contents

- Classification Contract
- Shared Component Dimensions
- Button, Link, and Icon Button
- Tabs and Segmented Navigation
- Card
- Carousel
- List, Table, and Grid
- Pagination and Infinite Scroll
- Accordion
- Modal, Dialog, and Drawer
- Tooltip and Popover
- Toast, Banner, and Inline Alert
- Image, Avatar, and Video
- Loading, Skeleton, Empty, and Error State

## Classification Contract

Inventory every in-scope component before applying type-specific checks.

| Component | Item Type | Mode or Variant | Source Ref | Scope Status | Notes |
|---|---|---|---|---|---|

Classify each relevant check with exactly one status:

| Status | Meaning | Required handling |
|---|---|---|
| `DEFINED` | The behavior and test oracle have an approved source | Map to a source-backed Viewpoint; derive Test Cases only after that Viewpoint is locked |
| `SPEC_GAP` | The check is relevant but its rule or Expected Result is missing or ambiguous | Stop the affected design scope. Under `GAP_ANALYSIS`, map it to an existing Finding or OQ or return the stale analysis to `qc-gap-finder`; under `DIRECT_SOURCE_CHECK`, propose Gap Analysis. Do not create a provisional Viewpoint or Test Case |
| `NOT_APPLICABLE` | The check does not apply to this component type, mode, or variant | Record the reason when it is not self-evident; do not count it in the denominator |
| `OUT_OF_SCOPE` | The check could apply but is excluded by the approved Scope Gate | Record the scope decision or waiver; do not report it as covered or as `NOT_APPLICABLE` |

Do not create one Viewpoint or Test Case per checklist bullet automatically.
Merge only checks that express one coherent test condition or risk.

## Shared Component Dimensions

Apply these questions to every relevant component before its specific section:

- Presence, visibility, content mapping, ordering, default state, and conditional display
- Enabled, disabled, selected, active, focused, loading, empty, error, and stale states
- Primary action, secondary action, cancel, retry, and repeated interaction behavior
- Mouse, keyboard, touch, swipe, focus order, and focus restoration
- Accessible name, role, state, announcement, contrast, reduced motion, and screen-reader behavior when governed by an approved source
- Responsive layout, orientation, zoom, truncation, overflow, and content reflow
- Loading, timeout, network failure, partial data, retry, and recovery
- Routing, deep link, browser back or forward, refresh, and state persistence
- Localization, text expansion, bidirectional layout, date, number, and currency display
- Authorization, sensitive-data display, analytics, and audit behavior when explicitly required

## Button, Link, and Icon Button

- Label or accessible name, icon meaning, and visual priority
- Enabled, disabled, loading, pressed, visited, hover, focus, and active states
- Single activation, repeated click, double click, and prevention of duplicate action
- Link destination, internal or external navigation, target, and broken-route behavior
- Focus behavior after action success, failure, cancellation, or navigation

## Tabs and Segmented Navigation

- Default active item and rules for changing selection
- Content panel mapping, loading, empty, and error state per item
- Keyboard navigation, focus movement, selected state, and disabled item
- Deep link, URL synchronization, refresh, and browser back or forward behavior
- Label, count or badge, truncation, overflow, and responsive behavior

Treat a Segmented Control as navigation when it switches views or content
sections. Treat it as an input in `qc/config/field-validation-checklist.md` when
it selects a submitted value.

## Card

Classify the Card as passive, actionable, selectable, or mixed before deriving
checks.

- Title, metadata, image, badge, status, price, and other data mapping
- Whole-card click target versus explicit CTA
- Nested links or buttons and prevention of conflicting activation
- Selected, disabled, unavailable, loading, empty, and error states
- Ordering, grouping, truncation, overflow, responsive layout, and equal-height behavior
- Image aspect ratio, alt text, placeholder, broken image, and lazy loading

## Carousel

- Slide content, order, count, initial slide, and current-slide indicator
- Previous, next, pagination-dot, thumbnail, and direct-navigation controls
- First and last slide, loop, rewind, and disabled-control behavior
- Swipe, drag, keyboard, focus, touch-target, and responsive behavior
- Auto-rotation interval, pause, resume, hover, focus, and reduced-motion behavior when defined
- Slide-change announcement and focus behavior when accessibility is in scope
- Lazy loading, broken media, partial data, empty state, and loading failure

## List, Table, and Grid

- Column or item mapping, order, grouping, hierarchy, and duplicate rows
- Empty, loading, partial, stale, and error states
- Sort, filter, search, selection, expansion, and row-level actions
- Sticky header, horizontal or vertical overflow, responsive transformation, and virtualization
- Keyboard navigation, focus, headers, captions, and accessible relationships

## Pagination and Infinite Scroll

- Initial page, page size, total count, first, previous, next, last, and direct page selection
- Boundary page, empty final page, changed dataset, duplicate or missing items
- Loading, failure, retry, cancellation, and prevention of duplicate requests
- Scroll position, focus, URL, refresh, browser back, and state restoration

## Accordion

- Default expanded item and single or multiple expansion rules
- Expand, collapse, disabled item, nested content, and dynamic content
- Keyboard interaction, focus, state announcement, and deep link
- Layout shift, scroll position, and state persistence

## Modal, Dialog, and Drawer

- Open trigger, title, content, action mapping, and initial focus
- Close button, cancel, confirm, Escape, backdrop, and browser back behavior
- Focus trap, focus restoration, background interaction, and scroll lock
- Unsaved changes, destructive confirmation, loading, failure, retry, and repeated open
- Stacking, nested overlays, responsive size, and mobile keyboard behavior

## Tooltip and Popover

- Trigger by hover, focus, click, or touch
- Content mapping, placement, collision, delay, dismissal, and repeated trigger
- Keyboard access, pointer movement, focus retention, and accessible relationship

## Toast, Banner, and Inline Alert

- Trigger, severity, title, message, icon, action, and error-code mapping
- Placement, stacking, duplicate messages, dismissal, duration, and persistence
- Focus and screen-reader announcement when accessibility is in scope
- Behavior after retry, navigation, refresh, or repeated failure

## Image, Avatar, and Video

- Source, aspect ratio, crop, resolution, orientation, and responsive source
- Alt text, caption, transcript, controls, autoplay, mute, and reduced motion when applicable
- Loading, lazy loading, broken source, placeholder, retry, and unsupported media
- Authorization, sensitive media, download, caching, and retention when explicitly required

## Loading, Skeleton, Empty, and Error State

- Trigger and exit conditions
- Skeleton or spinner mapping and prevention of stale-content interaction
- Empty-state distinction from loading, filtered-empty, permission-denied, and failure
- Error message, error code, retry, fallback, support action, and recovery
- Focus, announcement, layout stability, timeout, and repeated failure behavior

Only derive a Viewpoint or Test Case when the governing source or an explicit
recorded decision defines the behavior needed for its test oracle.
Only `qc-gap-finder`, when explicitly approved, creates or updates Findings and
OQs. A direct Viewpoint check reports the blocker and proposes that handoff.
