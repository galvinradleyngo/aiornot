import { el, clearNode } from "../utils.js";
import { getDeck } from "../data.js";

export function renderGroupsDashboard(container, { roomCode, edition, groups, players, notesLog, onGoNotes, onEndSession, onRedeal }) {
  clearNode(container);
  const ed = getDeck(edition);

  container.appendChild(el("h2", {}, "Host dashboard — Small Groups"));
  container.appendChild(el("p", { class: "muted" }, `Room code `), );
  container.lastChild.appendChild(el("code", { class: "room-code", style: "font-size:1.1rem" }, roomCode));

  const combined = { toai: 0, notoai: 0, guardrails: 0 };
  notesLog.forEach((n) => { if (combined[n.decision] !== undefined) combined[n.decision]++; });

  const stats = el("div", { class: "stat-grid" }, [
    el("div", { class: "stat-tile" }, [el("div", { class: "stat-num" }, String(groups.length)), el("div", { class: "stat-label" }, "Groups")]),
    el("div", { class: "stat-tile" }, [el("div", { class: "stat-num" }, String(notesLog.length)), el("div", { class: "stat-label" }, "Use cases decided")]),
    el("div", { class: "stat-tile" }, [el("div", { class: "stat-num" }, String(combined.toai)), el("div", { class: "stat-label" }, "TO AI")]),
    el("div", { class: "stat-tile" }, [el("div", { class: "stat-num" }, String(combined.notoai)), el("div", { class: "stat-label" }, "NOT TO AI")]),
    el("div", { class: "stat-tile" }, [el("div", { class: "stat-num" }, String(combined.guardrails)), el("div", { class: "stat-label" }, "WITH GUARDRAILS")])
  ]);
  container.appendChild(stats);

  const panel = el("div", { class: "card-panel" });
  panel.appendChild(el("h3", {}, "Groups in progress"));
  if (groups.length === 0) panel.appendChild(el("p", { class: "empty-hint" }, "No groups yet."));
  groups.forEach((g) => {
    const memberCount = players.filter((p) => p.groupId === g.id).length;
    const decided = notesLog.filter((n) => n.groupId === g.id).length;
    const idx = g.currentRoundIndex || 0;
    const currentUseCaseNum = idx > 0 ? g.useCaseOrder[idx - 1] : null;
    const uc = currentUseCaseNum ? ed.use_cases.find((u) => u.n === currentUseCaseNum) : null;
    const row = el("div", { class: "group-row" }, [
      el("div", {}, [
        el("div", { class: "g-name" }, g.name + (g.code ? ` (${g.code})` : "")),
        el("div", { class: "g-sub" }, `${memberCount} members · ${g.status === "lobby" ? "not started" : uc ? `on: ${uc.title}` : "…"}`)
      ]),
      el("div", { class: "g-sub" }, `${decided} decided`),
      el("span", { class: "pill " + (g.status === "ended" ? "pill-risk" : "pill-opp") }, g.status || "lobby")
    ]);
    panel.appendChild(row);
  });
  container.appendChild(panel);

  container.appendChild(el("div", { class: "btn-row" }, [
    el("button", { class: "btn btn-ghost", onclick: onGoNotes }, "📋 Notes log"),
    el("button", { class: "btn btn-danger", onclick: () => { if (window.confirm("End the session for every group and go to the debrief?")) onEndSession(); } }, "End session → Debrief")
  ]));
  container.appendChild(el("p", { class: "field-hint mt-1" }, "Each group plays independently at its own pace — that's expected, just like different tables in the physical game."));
}
