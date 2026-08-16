# DOCX Test Report Specification

Create a Word document with the `COMPACT` core and calculations defined in `report-content-spec.md`. Add only requested `DETAILED` appendices. Use DOCX when stakeholders need annotation, printing, or email circulation.

## Toolchain

Use an available document-generation tool such as `python-docx` or Pandoc. Generate charts as verified local PNG files or supported native shapes. Do not handcraft OOXML unless no supported tool exists.

## Typography and Unicode

- Use a Unicode-capable font available in the environment.
- Set both Latin and East Asian font properties when the tool supports them.
- Keep Vietnamese and CJK text as Unicode.
- Strip invalid control characters and NUL bytes from raw logs.
- Do not use Wingdings, Symbol, or other legacy symbol fonts for status.

Use plain text labels: `PASS`, `FAIL`, `BLOCKED`, `SKIP`, `ERROR`, `NOT_RUN`,
and `UNDETERMINED`.

## Status Colors

| Label | Fill | Text |
|---|---|---|
| PASS | `#D6F5D6` | `#1B7A2F` |
| FAIL | `#FADBD8` | `#B03A2E` |
| BLOCKED | `#FDF2D5` | `#9C640C` |
| ERROR | `#FCE4EC` | `#AD1457` |
| SKIP | `#EBEDEF` | `#566573` |
| NOT_RUN | `#F2F3F4` | `#7B7D7D` |
| GO | `#D6F5D6` | `#1B7A2F` |
| CONDITIONAL GO | `#FDF2D5` | `#9C640C` |
| NO-GO | `#FADBD8` | `#B03A2E` |
| UNDETERMINED | `#E8EAF6` | `#3949AB` |

Status must remain understandable when printed without color.

## Layout

1. Add a compact title block with scope key, Run IDs, environment, application build, report date, and verdict.
2. Render Decision Summary, Findings and Actions, then Confidence and Evidence.
3. Use a metrics table before explanatory prose.
4. Keep failures, blockers, limitations, and required decisions visible without opening an appendix.
5. Start any requested detailed appendix on a new page.
6. Add a footer with generation timestamp and tool identity.

## Tables

- Use visible borders and a repeated bold header row.
- Set practical column widths and prevent path columns from collapsing.
- Keep one result per row and one available evidence item per evidence row.
- Insert real hyperlinks for source and available evidence paths.
- Split oversized matrices by coverage dimension rather than shrinking text below a readable size.

## Charts and Images

- Use only charts that materially clarify result distribution or coverage.
- Keep labels readable and include source values in a nearby table.
- Embed local files only. Do not depend on remote image URLs.
- Preserve aspect ratio and compress oversized evidence images.
- Prefer evidence links when embedding all screenshots would make the file too large.

Follow the canonical file naming and no-overwrite rule in `format-guide.md`.

## Verification Gate

Before delivery:

1. Reopen the DOCX with the generation library;
2. Render every page with an available office or document renderer;
3. Inspect missing glyphs, clipped text, split tables, broken charts, and links;
4. Reconcile displayed metrics with the source execution rows;
5. Verify the file name and output path.

If reopen or rendering fails, do not deliver the file as valid. Report the failure and offer an approved HTML or Markdown alternative.
