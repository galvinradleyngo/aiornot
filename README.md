# AI or Not

Two standalone, single-file HTML tools for thinking through where AI belongs. Each opens directly in a browser — no build step, no server, no accounts.

## `drawing-the-line.html` — Drawing the Line

A playful, notebook-styled prototype for capturing where someone draws the line on AI use, task by task. Add tasks (or use the example set), then drag each one onto a hand-drawn line running from "No AI" to "Full AI" — the further right, the more AI involvement that task calls for. Placed tasks line up underneath the line in swimlanes with connecting stems, a live histogram shows the overall spread, and you can copy a plain-text summary or print/save a PDF. Layout adapts from desktop down to phone width, and dragging works with both mouse and touch (pointer events). Progress is saved to `localStorage`.

## `index.html` — AI Use Case Review Worksheet

An interactive, browser-based version of the printable "AI Use Case Review Worksheet." It walks one reviewer (or a small team sitting together) through a single real AI use case — 14 Risk concepts, 12 Opportunity concepts, and a three-way decision (To AI / Not To AI / To AI With Guardrails) — and automatically produces a clean, finished report at the end instead of a re-typed handwritten checklist.

Both tools are **single-user**: no accounts, no login, no server, no database. Everything runs entirely in your browser.

## AI Use Case Review Worksheet — how it works

A guided, 5-step wizard with a visible progress bar and Back/Next navigation:

1. **Setup** — reviewer name(s), date, and a description of the specific use case being reviewed (the only required field).
2. **Risk Checklist** — all 14 risk concepts, each with a "this applies" toggle that reveals a Low/Med/High severity rating and a notes field.
3. **Opportunity Checklist** — the same pattern for all 12 opportunity concepts ("value if realized").
4. **Decision** — a live, informational summary of what was flagged, followed by the three decision options as selectable cards. Choosing "With Guardrails" requires a specific, concrete guardrail description.
5. **Report** — an auto-generated summary of everything entered, with High-severity/value items surfaced first. Only items that were actually flagged appear — this is a summary of what came up, not a re-print of the full checklist.

From the report you can:
- **Print / Save as PDF** — uses a dedicated print stylesheet, so the browser's print dialog produces a clean document with no app chrome.
- **Copy summary as text** — copies a plain-text version of the report to your clipboard for pasting into an email, doc, or chat.

Your progress is saved automatically to your browser's `localStorage`. If you close the tab or refresh mid-review, reopening the page offers to resume where you left off or start fresh. "Start New Review" (available at any time) clears everything. Nothing is stored beyond the single review in progress — there's no in-app history of past reviews.

## How to open them

Just open `drawing-the-line.html` or `index.html` directly in any modern web browser (double-click it, or `File > Open`). No build step, no install required. `drawing-the-line.html` loads two Google Fonts for its handwritten look but falls back to system cursive/handwriting fonts if there's no internet connection; `index.html` needs no internet at all.

## How to host them

Because they're self-contained static HTML files, you can host them anywhere that serves static files — GitHub Pages, Netlify, a plain web server, an internal file share, etc. Just upload the `.html` file(s) you want.
