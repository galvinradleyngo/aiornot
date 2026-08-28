import { el, clearNode } from "../utils.js";
import { getDeck, getCardInfo, cardKey, DECISIONS } from "../data.js";

// Selections made while promoting cards are kept outside the render
// function (keyed by round id) so a live flag coming in from another
// student — which forces a re-render — doesn't wipe the controller's
// in-progress picks.
const promoteSelection = { roundId: null, risks: new Set(), opps: new Set() };

function ensurePromoteSelection(roundId) {
  if (promoteSelection.roundId !== roundId) {
    promoteSelection.roundId = roundId;
    promoteSelection.risks = new Set();
    promoteSelection.opps = new Set();
  }
}

function cardTag(edition, type, n) {
  const info = getCardInfo(edition, { type, n });
  return el("span", { class: "tag " + (type === "risk" ? "tag-risk" : "tag-opp") }, info ? info.title : `${type} ${n}`);
}

function flaggedBoard(edition, round) {
  const wrap = el("div", {});
  const entries = Object.entries(round.flagTally || {}).filter(([, c]) => c > 0);
  if (entries.length === 0) {
    wrap.appendChild(el("p", { class: "empty-hint" }, "No cards flagged yet — this fills in live as people tap their hand."));
    return wrap;
  }
  const max = Math.max(1, ...entries.map(([, c]) => c));
  entries
    .sort((a, b) => b[1] - a[1])
    .forEach(([key, count]) => {
      const [type, nStr] = key.split("_");
      const info = getCardInfo(edition, { type, n: Number(nStr) });
      if (!info) return;
      const row = el("div", { class: "tally-row" }, [
        el("div", { class: "tally-label" }, [
          el("span", { class: "pill " + (type === "risk" ? "pill-risk" : "pill-opp") }, type === "risk" ? "Risk" : "Opp"),
          info.title
        ]),
        el("span", { class: "tally-count" }, String(count))
      ]);
      const track = el("div", { class: "tally-bar-track" }, [
        el("div", { class: `tally-bar-fill ${type === "risk" ? "risk" : "opp"}`, style: `width:${(count / max) * 100}%` })
      ]);
      wrap.appendChild(row);
      wrap.appendChild(track);
    });
  return wrap;
}

function handGrid(edition, hand, myFlags, onToggle) {
  if (!hand || hand.length === 0) {
    return el("p", { class: "empty-hint" }, "You weren't dealt any cards this round — you can still discuss and vote!");
  }
  const grid = el("div", { class: "hand-grid" });
  hand.forEach((card) => {
    const info = getCardInfo(edition, card);
    if (!info) return;
    const key = cardKey(card);
    const isFlagged = !!(myFlags && myFlags[key]);
    const btn = el("button", {
      class: `hand-card ${card.type} ${isFlagged ? "flagged" : ""}`,
      onclick: () => onToggle(card)
    }, [
      el("span", { class: "hc-check" }, "✓"),
      el("span", { class: "hc-title" }, info.title),
      el("span", { class: "hc-body" }, info.body)
    ]);
    grid.appendChild(btn);
  });
  return grid;
}

export function renderRoundScreen(container, ctx) {
  const {
    edition, group, round, myPlayer, canControl, controllerLabel,
    boardTally, decidedCount, onToggleFlag, onPromote, onOpenVote,
    onCastVote, myVote, onLockDecision, onAdvance, onGoNotes, onEndSession,
    isHost, onRedeal, deckSize
  } = ctx;

  clearNode(container);

  // ---- decision board tally chips ----
  const boardsRow = el("div", { class: "board-tally" }, [
    el("span", { class: "board-chip yes" }, `TO AI: ${boardTally.toai || 0}`),
    el("span", { class: "board-chip no" }, `NOT TO AI: ${boardTally.notoai || 0}`),
    el("span", { class: "board-chip guard" }, `WITH GUARDRAILS: ${boardTally.guardrails || 0}`)
  ]);
  const headRow = el("div", { class: "section-title" }, [
    el("h3", {}, group.name + (group.code ? ` (${group.code})` : "")),
    el("span", { class: "muted" }, `Use case ${decidedCount + 1} of up to ${deckSize}`)
  ]);
  container.appendChild(headRow);
  container.appendChild(boardsRow);

  if (!round) {
    container.appendChild(el("div", { class: "card-panel text-center" }, [
      el("div", { class: "waiting-pulse" }),
      "Waiting for the use case to be revealed…"
    ]));
    return;
  }

  const ed = getDeck(edition);
  const uc = ed.use_cases.find((u) => u.n === round.useCaseNum);

  container.appendChild(el("div", { class: "usecase-card" }, [
    el("span", { class: "usecase-cat" }, uc.cat),
    el("h2", {}, uc.title),
    el("p", {}, uc.body)
  ]));

  // ---- SCANNING ----
  if (round.phase === "scanning") {
    if (myPlayer) {
      container.appendChild(el("div", { class: "section-title" }, [el("h3", {}, "Your cards — tap anything that applies")]));
      container.appendChild(handGrid(edition, myPlayer.hand, ctx.myFlags, onToggleFlag));
    }
    container.appendChild(el("div", { class: "section-title" }, [el("h3", {}, "Flagged by the group (live)")]));
    const board = el("div", { class: "card-panel" }, [flaggedBoard(edition, round)]);
    container.appendChild(board);

    if (canControl) {
      ensurePromoteSelection(round.id);
      container.appendChild(renderPromotePanel(edition, round, onPromote));
    } else {
      container.appendChild(el("p", { class: "muted text-center" }, `Waiting for ${controllerLabel} to pick the final cards and open the vote…`));
    }
  }

  // ---- PROMOTED ----
  if (round.phase === "promoted" || round.phase === "voting" || round.phase === "decided") {
    container.appendChild(el("div", { class: "section-title" }, [el("h3", {}, "Final Risks & Opportunities")]));
    const finalPanel = el("div", { class: "card-panel" });
    (round.finalRisks || []).forEach((n) => finalPanel.appendChild(cardTag(edition, "risk", n)));
    (round.finalOpportunities || []).forEach((n) => finalPanel.appendChild(cardTag(edition, "opp", n)));
    if ((round.finalRisks || []).length === 0 && (round.finalOpportunities || []).length === 0) {
      finalPanel.appendChild(el("span", { class: "muted" }, "No cards were promoted."));
    }
    container.appendChild(finalPanel);
  }

  if (round.phase === "promoted") {
    if (canControl) {
      container.appendChild(el("div", { class: "btn-row" }, [
        el("button", { class: "btn btn-primary btn-lg", onclick: onOpenVote }, "Open the vote →")
      ]));
    } else {
      container.appendChild(el("p", { class: "muted text-center" }, `Waiting for ${controllerLabel} to open the vote…`));
    }
  }

  // ---- VOTING / DECIDED ----
  if (round.phase === "voting" || round.phase === "decided") {
    const locked = round.phase === "decided";
    container.appendChild(el("div", { class: "section-title" }, [el("h3", {}, locked ? "Decision" : "Cast your vote")]));
    const totalVotes = Object.values(round.voteTally || {}).reduce((a, b) => a + b, 0) || 1;
    const grid = el("div", { class: "decision-grid" });
    DECISIONS.forEach((d) => {
      const count = (round.voteTally || {})[d.key] || 0;
      const pct = Math.round((count / totalVotes) * 100);
      const selected = locked ? round.decision === d.key : myVote === d.key;
      const btn = el("button", {
        class: `decision-btn ${d.cls} ${selected ? "selected" : ""}`,
        disabled: locked || !myPlayer,
        onclick: () => onCastVote(d.key)
      }, [
        d.title,
        el("span", { class: "db-body" }, d.body),
        el("span", { class: "db-votes" }, `${count} vote${count === 1 ? "" : "s"} (${pct}%)`)
      ]);
      grid.appendChild(btn);
    });
    container.appendChild(grid);

    if (locked && round.decision === "guardrails" && round.guardrailText) {
      container.appendChild(el("div", { class: "card-panel" }, [
        el("h4", {}, "Guardrail"),
        el("p", {}, round.guardrailText)
      ]));
    }

    if (round.phase === "voting" && canControl) {
      container.appendChild(el("div", { class: "section-title" }, [el("h3", {}, `Lock it in as ${controllerLabel}`)]));
      const row = el("div", { class: "btn-row" });
      DECISIONS.forEach((d) => {
        row.appendChild(el("button", {
          class: `btn ${d.cls === "yes" ? "btn-primary" : d.cls === "no" ? "btn-danger" : "btn-gold"}`,
          onclick: () => {
            let guardrailText = "";
            if (d.key === "guardrails") {
              guardrailText = window.prompt(
                "What's the specific guardrail? (e.g. \"human sign-off before any student is contacted\") — be concrete, not just \"have oversight.\""
              );
              if (guardrailText === null) return; // cancelled
              if (!guardrailText.trim()) { window.alert("A guardrail decision needs at least a short concrete guardrail."); return; }
            }
            if (!window.confirm(`Lock in "${d.title}" for this use case?`)) return;
            onLockDecision(d.key, guardrailText);
          }
        }, `Lock: ${d.title}`));
      });
      container.appendChild(row);
    } else if (round.phase === "voting") {
      container.appendChild(el("p", { class: "muted text-center" }, `Waiting for ${controllerLabel} to lock in the decision…`));
    }
  }

  if (round.phase === "decided" && canControl) {
    const exhausted = decidedCount + 1 >= deckSize;
    const row = el("div", { class: "btn-row" });
    if (!exhausted) {
      row.appendChild(el("button", { class: "btn btn-primary btn-lg", onclick: onAdvance }, "Next use case →"));
    } else {
      row.appendChild(el("p", { class: "muted" }, "That's every use case in the deck for this group."));
    }
    container.appendChild(row);
  } else if (round.phase === "decided") {
    container.appendChild(el("p", { class: "muted text-center" }, `Waiting for ${controllerLabel} to move on…`));
  }

  // ---- footer controls ----
  const footer = el("div", { class: "btn-row mt-2" }, [
    el("button", { class: "btn btn-ghost", onclick: onGoNotes }, "📋 Notes log")
  ]);
  if (isHost && onRedeal) footer.appendChild(el("button", { class: "btn btn-ghost", onclick: onRedeal }, "🔄 Re-deal hands (for late joiners)"));
  if (isHost) footer.appendChild(el("button", { class: "btn btn-danger", onclick: () => { if (window.confirm("End the session for everyone and go to the debrief?")) onEndSession(); } }, "End session → Debrief"));
  container.appendChild(footer);
}

function renderPromotePanel(edition, round, onPromote) {
  const ed = getDeck(edition);
  const panel = el("div", { class: "card-panel" });
  panel.appendChild(el("h3", {}, "Promote the final cards"));
  panel.appendChild(el("p", { class: "field-hint" }, "Pick 2–3 Risk and 2–3 Opportunity cards the group agreed apply. You can pick any card, not just flagged ones."));

  function chip(type, n, title) {
    const key = `${type}_${n}`;
    const set = type === "risk" ? promoteSelection.risks : promoteSelection.opps;
    const selected = set.has(n);
    return el("button", {
      class: `tag ${type === "risk" ? "tag-risk" : "tag-opp"}`,
      style: `cursor:pointer;border:2px solid transparent;${selected ? "border-color:" + (type === "risk" ? "#8f2d2d" : "#1f6d3d") : ""}`,
      onclick: (e) => {
        if (set.has(n)) set.delete(n); else set.add(n);
        e.target.style.borderColor = set.has(n) ? (type === "risk" ? "#8f2d2d" : "#1f6d3d") : "transparent";
      }
    }, (selected ? "✓ " : "") + title);
  }

  const flaggedKeys = Object.entries(round.flagTally || {}).filter(([, c]) => c > 0).sort((a, b) => b[1] - a[1]).map(([k]) => k);
  if (flaggedKeys.length) {
    panel.appendChild(el("h4", {}, "Flagged cards"));
    const row = el("div", {});
    flaggedKeys.forEach((key) => {
      const [type, nStr] = key.split("_");
      const info = getCardInfo(edition, { type, n: Number(nStr) });
      if (info) row.appendChild(chip(type, info.n, info.title));
    });
    panel.appendChild(row);
  }

  const details = el("details", { class: "mt-1" });
  details.appendChild(el("summary", { style: "cursor:pointer;font-weight:600;color:#1f3a5f" }, "Browse all cards"));
  const riskRow = el("div", { class: "mt-1" }, [el("strong", {}, "Risks: ")]);
  ed.risks.forEach((r) => riskRow.appendChild(chip("risk", r.n, r.title)));
  const oppRow = el("div", { class: "mt-1" }, [el("strong", {}, "Opportunities: ")]);
  ed.potentials.forEach((o) => oppRow.appendChild(chip("opp", o.n, o.title)));
  details.appendChild(riskRow);
  details.appendChild(oppRow);
  panel.appendChild(details);

  panel.appendChild(el("div", { class: "btn-row" }, [
    el("button", {
      class: "btn btn-primary btn-lg",
      onclick: () => onPromote(Array.from(promoteSelection.risks), Array.from(promoteSelection.opps))
    }, "Lock in final cards & continue →")
  ]));
  return panel;
}
