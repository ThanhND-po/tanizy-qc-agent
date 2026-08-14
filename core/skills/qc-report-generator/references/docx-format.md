# DOCX Output Format Specification

DOCX is the **second-choice format after HTML**: use it when stakeholders want a
Word document they can annotate, print, or circulate via email. It carries the
same 8 content sections as every other format (see `report-content-spec.md`);
only the presentation differs.

## Generation Toolchain

Build the `.docx` with `python-docx` (preferred) or the `pandoc` CLI. Do not
hand-craft XML, and never generate the file by pasting Markdown into a plain
template without checking the result opens correctly.

Recommended command (when pandoc is available):

```bash
pandoc report.md -o report.docx --toc --toc-depth=2 --metadata title="Test Report"
```

Recommended python-docx recipe (when a script is preferred):

```python
from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn

doc = Document()
style = doc.styles["Normal"]
style.font.name = "Calibri"
style.font.size = Pt(10.5)
style._element.rPr.rFonts.set(qn("w:eastAsia"), "Calibri")  # CJK/Vietnamese fallback
# ...build headings, paragraphs, tables per structure below
doc.save(path)
```

**Before saving, run one verification:** re-open the file with `python-docx`
(or `LibreOffice` headless: `libreoffice --headless --convert-to pdf file.docx`)
and confirm it opens without errors. If it fails, fall back to Markdown and
tell the user.

## Unicode and Font Rules (no mojibake)

1. **Use a Unicode-capable font stack.** Body: `Calibri` (or `Trebuchet MS`);
   Vietnamese CJK-safe fallback is implicit in modern Word, but set the
   `w:eastAsia` font on the Normal style so Vietnamese diacritics never render
   as boxes (they are part of the Latin script and are safe; the rule exists
   mainly for headers and embedded East-Asian tooling).
2. **Save with UTF-8 encoding everywhere.** If generating the docx via a
   Markdown intermediate, make sure the `.md` is UTF-8 with NO BOM, and the
   pandoc/docx conversion does not pass through a Latin-1 pipe.
3. **Never use the legacy Word symbol fonts** (Wingdings, Symbol) for status
   icons — they break on non-Windows viewers. Use text markers instead:
   `PASS / FAIL / BLOCKED / SKIP / NOT_RUN` plain text, optionally colored
   (see Color Rules).
4. If source data contains control characters or NUL bytes (raw logs), strip
   them before inserting into paragraphs or table cells.

## Color Rules (status visibility without icons)

Shade status cells and verdict text with these exact fills/text colors so the
docx reads like the HTML version:

| Status | Fill (status cell) | Text color |
|---|---|---|
| PASS | `#D6F5D6` | `#1B7A2F` |
| FAIL | `#FADBD8` | `#B03A2E` |
| BLOCKED | `#FDF2D5` | `#9C640C` |
| SKIP | `#EBEDEF` | `#566573` |
| NOT_RUN | `#F2F3F4` | `#7B7D7D` |
| Verdict GO | — | `#1B7A2F` bold |
| Verdict CONDITIONAL GO | — | `#9C640C` bold |
| Verdict NO-GO | — | `#B03A2E` bold |

Apply shading via `CT_Shl` on the table cell: `xml:space="preserve"`,
`w:val="clear"`, `w:color="auto"`, `w:fill="<hex>"`.

## Document Structure (maps to content spec sections 1–8)

1. **Title page block** — report title, scope, verdict (bold + color), run
   date, generated-by line.
2. **Summary metrics** — one table: Metric → Value (8 rows: Scope, Test cases,
   PASS, FAIL, BLOCKED, SKIP/NOT_RUN, Coverage, Verdict).
3. **What Was Tested** — scope statement + tested-items table.
4. **Result Breakdown** — table: Viewpoint / AC → # cases → PASS/FAIL/BLOCKED.
5. **Coverage Detail** — coverage matrix; uncovered VP/ACs highlighted
   (fill `#FDF2D5`) and explicitly listed as risks.
6. **Issues** — 4-group table (Blocking / Failures / Accepted /
   Stakeholder-aware).
7. **Confidence Statement** — 1–2 sentences.
8. **Recommendation** — verdict + explicit conditions.
9. **Evidence Index** — TC ID → Evidence link table (max 2 columns).

## Table Rules

1. Every table must have an explicit header row with bold text; set the header
   row to repeat across pages (`tblHeader`) so long matrices stay readable.
2. Use `TableStyle("Table Grid")` or a banded style — never rely on invisible
   borders; some viewers render borderless tables as unreadable.
3. Column widths: set explicitly with `table.columns[i].width` (inches) and
   `allow_autofit=False`-style fixed layout (`tblLayout fixed` via XML) so
   wide paths or long Vietnamese titles do not collapse or overflow.
4. Status cells always carry the color fill; other cells keep the default
   white.
5. Links in the Evidence Index must be inserted as real hyperlinks (add
   `HYPERLINK` rIds) so they are clickable in Word — plain URLs that wrap to
   the next line break Word's table layout.

## Image and Chart Rules (no broken pictures)

1. Prefer **native Word shapes** for charts: if the environment provides
   `python-pptx`-style chart APIs or pandoc handles SVG charts, render the
   donut + bar chart as vector/natives. Otherwise generate charts as **PNG
   files** (matplotlib, 150–200 DPI, UTF-8-safe labels — never let matplotlib
   write characters the system font cannot render; test with
   `plt.rcParams["font.family"] = "DejaVu Sans"`).
2. Embed images with `add_picture(path, width=Inches(5.5))` — fixed width, no
   height constraint, so aspect ratios stay correct.
3. All image files must be **local absolute or relative paths**; never embed
   remote URLs (they show as broken frames offline). Download evidence
   screenshots first if they come from remote locations.
4. Keep the total number of embedded images reasonable: the standard set is
   donut + one bar chart in the Summary; evidence screenshots go in the
   Evidence Index section as thumbnails (`width=Inches(3.0)`) or as links if
   numerous.
5. After embedding, verify the docx size did not balloon past ~10 MB with a
   single run; if it did, switch evidence to links.

## Footer and Metadata

End the document with: `Generated by Tanizy QC Agent ($qc-report-generator)`
+ document creation date in the footer. This marks the artifact as
machine-generated so readers do not edit it as source.

## Rules

- Content parity with all other formats: nothing is invented or omitted for
  DOCX convenience.
- Never ask the user to pick chart types — donut + one bar chart is the
  standard, same as HTML.
- If charts cannot be produced without breaking fonts/layout, degrade to
  text-table summary metrics and say so in one sentence; do not ship a
  corrupted document.
- File naming: `test-report-<feature>-<YYYY-MM-DD>.docx` in `qc/reports/`,
  version-suffixed (`-v2`) if it exists.
- Vietnamese by default; technical terms in English.
