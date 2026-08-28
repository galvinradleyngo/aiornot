import { el, clearNode, downloadCsv } from "../utils.js";
import { getDeck, getCardInfo, DECISIONS } from "../data.js";

function rowText(edition, ed, n) {
  const uc = ed.use_cases.find((u) => u.n === n.useCaseNum);
  const risks = (n.finalRisks || []).map((r) => getCardInfo(edition, { type: "risk", n: r })?.title).filter(Boolean).join("; ");
  const opps = (n.finalOpportunities || []).map((o) => getCardInfo(edition, { type: "opp", n: o })?.title).filter(Boolean).join("; ");
  const decision = DECISIONS.find((d) => d.key === n.decision)?.title || n.decision;
  return { group: n.groupName, useCase: uc ? uc.title : `#${n.useCaseNum}`, risks, opps, decision, guardrail: n.guardrailText || "" };
}

export function renderNotes(container, { edition, notesLog, mode, onBack }) {
  clearNode(container);
  const ed = getDeck(edition);
  container.appendChild(el("h2", {}, "Notes log"));
  container.appendChild(el("p", { class: "muted" }, "A running record of every use case played — risks and opportunities chosen, the decision, and any guardrail text."));

  const rows = notesLog
    .slice()
    .sort((a, b) => (a.decidedAt?.toMillis?.() || 0) - (b.decidedAt?.toMillis?.() || 0))
    .map((n) => rowText(edition, ed, n));

  const btnRow = el("div", { class: "btn-row" }, [
    el("button", { class: "btn", onclick: onBack }, "← Back"),
    el("button", {
      class: "btn btn-primary",
      onclick: () => downloadCsv("to-ai-or-not-to-ai-notes.csv", [
        ["Group", "Use Case", "Risks", "Opportunities", "Decision", "Guardrail"],
        ...rows.map((r) => [r.group, r.useCase, r.risks, r.opps, r.decision, r.guardrail])
      ])
    }, "⬇ Download as .csv"),
    el("button", {
      class: "btn",
      onclick: async (e) => {
        const text = rows.map((r) => `${r.group ? r.group + " — " : ""}${r.useCase}\n  Risks: ${r.risks || "none"}\n  Opportunities: ${r.opps || "none"}\n  Decision: ${r.decision}${r.guardrail ? `\n  Guardrail: ${r.guardrail}` : ""}`).join("\n\n");
        try {
          await navigator.clipboard.writeText(text);
          e.target.textContent = "Copied!";
          setTimeout(() => (e.target.textContent = "📋 Copy as text"), 1500);
        } catch (err) {
          window.alert("Couldn't copy automatically — select and copy the text log manually.");
        }
      }
    }, "📋 Copy as text")
  ]);
  container.appendChild(btnRow);

  const panel = el("div", { class: "card-panel table-scroll" });
  if (rows.length === 0) {
    panel.appendChild(el("p", { class: "empty-hint" }, "No use cases have been decided yet."));
  } else {
    const table = el("table", { class: "data-table" });
    const thead = el("thead", {}, [el("tr", {}, [
      mode === "smallGroups" ? el("th", {}, "Group") : null,
      el("th", {}, "Use Case"), el("th", {}, "Risks"), el("th", {}, "Opportunities"), el("th", {}, "Decision"), el("th", {}, "Guardrail")
    ])]);
    const tbody = el("tbody", {});
    rows.forEach((r) => {
      tbody.appendChild(el("tr", {}, [
        mode === "smallGroups" ? el("td", {}, r.group) : null,
        el("td", {}, r.useCase), el("td", {}, r.risks || "—"), el("td", {}, r.opps || "—"), el("td", {}, r.decision), el("td", {}, r.guardrail || "—")
      ]));
    });
    table.appendChild(thead);
    table.appendChild(tbody);
    panel.appendChild(table);
  }
  container.appendChild(panel);
}
