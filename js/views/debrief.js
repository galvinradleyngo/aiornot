import { el, clearNode } from "../utils.js";
import { getDeck, getCardInfo, DECISIONS } from "../data.js";
import { getAllRoundsOnce } from "../db.js";

function decisionChip(key) {
  const d = DECISIONS.find((d) => d.key === key);
  if (!d) return el("span", { class: "muted" }, "—");
  return el("span", { class: "board-chip " + d.cls }, d.title);
}

export function renderDebrief(container, { roomCode, edition, mode, groups, notesLog, onGoNotes, onBackLanding }) {
  clearNode(container);
  const ed = getDeck(edition);
  container.appendChild(el("h2", {}, "Debrief"));

  const overall = { toai: 0, notoai: 0, guardrails: 0 };
  notesLog.forEach((n) => { if (overall[n.decision] !== undefined) overall[n.decision]++; });

  const stats = el("div", { class: "stat-grid" }, [
    el("div", { class: "stat-tile" }, [el("div", { class: "stat-num" }, String(notesLog.length)), el("div", { class: "stat-label" }, "Use cases decided")]),
    el("div", { class: "stat-tile" }, [el("div", { class: "stat-num" }, String(overall.toai)), el("div", { class: "stat-label" }, "TO AI")]),
    el("div", { class: "stat-tile" }, [el("div", { class: "stat-num" }, String(overall.notoai)), el("div", { class: "stat-label" }, "NOT TO AI")]),
    el("div", { class: "stat-tile" }, [el("div", { class: "stat-num" }, String(overall.guardrails)), el("div", { class: "stat-label" }, "WITH GUARDRAILS")])
  ]);
  container.appendChild(stats);

  const flagPanel = el("div", { class: "card-panel" }, [
    el("h3", {}, "Most-flagged cards"),
    el("p", { class: "waiting-pulse-wrap muted" }, "Loading…")
  ]);
  container.appendChild(flagPanel);

  if (mode === "smallGroups") {
    container.appendChild(renderCompareTable(ed, groups, notesLog));
  }

  const btnRow = el("div", { class: "btn-row mt-1" }, [
    el("button", { class: "btn btn-primary", onclick: onGoNotes }, "📋 Full notes log"),
    el("button", { class: "btn btn-ghost", onclick: onBackLanding }, "Leave session")
  ]);
  container.appendChild(btnRow);

  // fetch + fill in most-flagged cards without blocking the rest of the view
  getAllRoundsOnce(roomCode).then((rounds) => {
    const totals = {};
    rounds.forEach((r) => {
      Object.entries(r.flagTally || {}).forEach(([key, count]) => {
        totals[key] = (totals[key] || 0) + (count || 0);
      });
    });
    const entries = Object.entries(totals).filter(([, c]) => c > 0);
    clearNode(flagPanel);
    flagPanel.appendChild(el("h3", {}, "Most-flagged cards (across all use cases played)"));
    if (entries.length === 0) {
      flagPanel.appendChild(el("p", { class: "empty-hint" }, "No cards were flagged this session."));
      return;
    }
    const risks = entries.filter(([k]) => k.startsWith("risk_")).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const opps = entries.filter(([k]) => k.startsWith("opp_")).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const cols = el("div", { style: "display:grid;grid-template-columns:1fr;gap:1.2rem" });
    cols.style.gridTemplateColumns = "1fr 1fr";
    function col(title, list, type) {
      const c = el("div", {}, [el("h4", {}, title)]);
      if (list.length === 0) { c.appendChild(el("p", { class: "empty-hint" }, "None flagged.")); return c; }
      list.forEach(([key, count]) => {
        const n = Number(key.split("_")[1]);
        const info = getCardInfo(edition, { type, n });
        c.appendChild(el("div", { class: "tally-row" }, [
          el("span", {}, info ? info.title : key),
          el("span", { class: "tally-count" }, String(count))
        ]));
      });
      return c;
    }
    cols.appendChild(col("Risks", risks, "risk"));
    cols.appendChild(col("Opportunities", opps, "opp"));
    flagPanel.appendChild(cols);
  });
}

function renderCompareTable(ed, groups, notesLog) {
  const panel = el("div", { class: "card-panel table-scroll" });
  panel.appendChild(el("h3", {}, "Cross-group compare"));
  panel.appendChild(el("p", { class: "field-hint" }, "Rows highlighted in gold are use cases where groups landed on different decisions."));

  const useCaseNums = Array.from(new Set(notesLog.map((n) => n.useCaseNum))).sort((a, b) => a - b);
  if (useCaseNums.length === 0) {
    panel.appendChild(el("p", { class: "empty-hint" }, "No decisions recorded yet."));
    return panel;
  }
  const table = el("table", { class: "data-table" });
  const thead = el("tr", {}, [el("th", {}, "Use Case"), ...groups.map((g) => el("th", {}, g.name))]);
  const tbody = el("tbody", {});
  useCaseNums.forEach((num) => {
    const uc = ed.use_cases.find((u) => u.n === num);
    const cellsByGroup = {};
    groups.forEach((g) => {
      const entry = notesLog.find((n) => n.useCaseNum === num && n.groupId === g.id);
      cellsByGroup[g.id] = entry ? entry.decision : null;
    });
    const decisionsPlayed = Object.values(cellsByGroup).filter(Boolean);
    const split = new Set(decisionsPlayed).size > 1;
    const tr = el("tr", { class: split ? "split-row" : "" }, [
      el("td", {}, uc ? uc.title : `#${num}`),
      ...groups.map((g) => el("td", {}, cellsByGroup[g.id] ? decisionChip(cellsByGroup[g.id]) : el("span", { class: "muted" }, "—")))
    ]);
    tbody.appendChild(tr);
  });
  table.appendChild(el("thead", {}, [thead]));
  table.appendChild(tbody);
  panel.appendChild(table);
  return panel;
}
