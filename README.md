# AI Use Case Review Worksheet

An interactive, browser-based version of the printable "AI Use Case Review Worksheet." It walks one reviewer (or a small team sitting together) through a single real AI use case — 14 Risk concepts, 12 Opportunity concepts, and a three-way decision (To AI / Not To AI / To AI With Guardrails) — and automatically produces a clean, finished report at the end instead of a re-typed handwritten checklist.

This is a **single-user tool**: no accounts, no login, no server, no database. Everything runs entirely in your browser.

## What it does

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

## How to open it

Just open `index.html` directly in any modern web browser (double-click it, or `File > Open`). No build step, no install, no internet connection required.

## How to host it

Because it's a single self-contained static HTML file, you can host it anywhere that serves static files — GitHub Pages, Netlify, a plain web server, an internal file share, etc. Just upload `index.html`.
