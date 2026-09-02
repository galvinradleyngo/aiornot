#!/usr/bin/env node
// Regenerates print-ready individual playing cards (front + back, one per
// PDF page) for a chosen edition of "To AI or Not to AI?" — matching the
// page size, colors, and layout of the original print-ready card decks.
//
// Usage:
//   node print-cards/generate.mjs student "STUDENT EDITION" out/student.pdf
//   node print-cards/generate.mjs teacher "TEACHER EDITION" out/teacher.pdf
//   node print-cards/generate.mjs leadership "LEADERSHIP EDITION" out/leadership.pdf
//
// Requires Playwright (`npm install playwright` + a Chromium install) —
// this script is a design tool, not something the deployed game needs.

import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { EDITIONS } from "../js/data.js";
import { iconFor, iconSvg } from "./icons.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const [, , editionKey, editionLabel, outPath] = process.argv;
if (!editionKey || !EDITIONS[editionKey]) {
  console.error("Usage: node generate.mjs <leadership|teacher|student> \"<LABEL>\" <outfile.pdf>");
  process.exit(1);
}
const ed = EDITIONS[editionKey];
const label = editionLabel || `${ed.label.toUpperCase()} EDITION`;
const out = outPath || path.join(__dirname, `${editionKey}-cards.pdf`);

// Page size matches the original print-ready deck exactly (points):
const PAGE_W = 198.96;
const PAGE_H = 281.04;

const PALETTE = {
  usecase: { accent: "#1f3a5f", tint: "#eef3f9" },
  risk: { accent: "#8f2d2d", tint: "#fbeeee" },
  opp: { accent: "#1f6d3d", tint: "#eaf5ee" }
};

function pad2(n) { return String(n).padStart(2, "0"); }

function cardHtml({ type, headerLabel, footerLabel, n, title, body, icon }) {
  const p = PALETTE[type];
  return `
  <section class="card front">
    <div class="header" style="background:${p.accent}">
      <span class="icon">${iconSvg(icon)}</span>
      <span class="cat">${headerLabel}</span>
    </div>
    <div class="body" style="background:${p.tint}">
      <h1 style="color:${p.accent}">${title}</h1>
      <p>${body}</p>
    </div>
    <div class="footer" style="background:${p.tint}">
      <span>${footerLabel}</span>
      <span>#${pad2(n)}</span>
    </div>
  </section>
  <section class="card back" style="background:${p.accent}">
    <div class="back-inner">
      <h2>TO AI<br/>OR<br/>NOT TO AI?</h2>
      <div class="sub">${footerLabel} CARD</div>
      <div class="pill">${label}</div>
    </div>
  </section>`;
}

const pages = [];
ed.use_cases.forEach((u) => {
  pages.push(cardHtml({
    type: "usecase", headerLabel: u.cat, footerLabel: "USE CASE", n: u.n,
    title: u.title, body: u.body, icon: iconFor(u.title, "document")
  }));
});
ed.risks.forEach((r) => {
  pages.push(cardHtml({
    type: "risk", headerLabel: "RISK", footerLabel: "RISK", n: r.n,
    title: r.title, body: r.body, icon: iconFor(r.title, "warning")
  }));
});
ed.potentials.forEach((o) => {
  pages.push(cardHtml({
    type: "opp", headerLabel: "OPPORTUNITY", footerLabel: "OPPORTUNITY", n: o.n,
    title: o.title, body: o.body, icon: iconFor(o.title, "lightbulb")
  }));
});

const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><style>
  @page { size: ${PAGE_W}pt ${PAGE_H}pt; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body { font-family: Arial, Helvetica, sans-serif; }
  .card {
    width: ${PAGE_W}pt; height: ${PAGE_H}pt; position: relative; overflow: hidden;
    break-after: page; page-break-after: always;
  }
  .header {
    height: 32pt; padding: 0 12pt; display: flex; align-items: center;
    justify-content: space-between;
  }
  .icon svg { width: 15pt; height: 15pt; display: block; }
  .cat { color: #fff; font-weight: 700; font-size: 8.5pt; letter-spacing: 0.06em; text-transform: uppercase; }
  .body { position: absolute; top: 32pt; left: 0; right: 0; bottom: 26pt; padding: 13pt 12pt 0; }
  .body h1 { font-size: 15pt; font-weight: 800; line-height: 1.25; margin: 0 0 6pt; }
  .body p { font-size: 9.3pt; line-height: 1.42; color: #2c2c2c; margin: 0; }
  .footer {
    position: absolute; bottom: 0; left: 0; right: 0; height: 26pt;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 12pt; border-top: 1pt solid rgba(0,0,0,0.09);
    font-size: 7.6pt; letter-spacing: 0.05em; text-transform: uppercase; color: #7c8494;
  }
  .card.back { display: flex; align-items: center; justify-content: center; }
  .back-inner { text-align: center; color: #fff; }
  .back-inner h2 { font-size: 17pt; font-weight: 800; line-height: 1.3; margin: 0; }
  .sub { margin-top: 10pt; font-size: 8.5pt; letter-spacing: 0.14em; opacity: 0.7; }
  .pill {
    display: inline-block; margin-top: 9pt; border: 1pt solid rgba(255,255,255,0.55);
    border-radius: 999pt; padding: 4pt 13pt; font-size: 8pt; font-weight: 700; letter-spacing: 0.07em;
  }
</style></head>
<body>${pages.join("\n")}</body></html>`;

const debugHtmlPath = out.replace(/\.pdf$/, ".html");
fs.writeFileSync(debugHtmlPath, html, "utf8");

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(html, { waitUntil: "load" });
await page.pdf({
  path: out,
  printBackground: true,
  preferCSSPageSize: true
});
await browser.close();
console.log(`Wrote ${out} (${ed.use_cases.length + ed.risks.length + ed.potentials.length} cards, ${(ed.use_cases.length + ed.risks.length + ed.potentials.length) * 2} pages)`);
