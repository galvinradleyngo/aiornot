import { el, clearNode } from "../utils.js";
import { EDITIONS } from "../data.js";

export function renderHostLobby(container, { session, roomCode, groups, players, onAutoSplit, onStart, onGoNotes }) {
  clearNode(container);
  const ed = EDITIONS[session.edition];

  container.appendChild(el("h2", {}, "Waiting room"));
  const panel = el("div", { class: "card-panel text-center" });
  panel.appendChild(el("p", { class: "muted" }, "Share this room code with your class:"));
  panel.appendChild(el("code", { class: "room-code" }, roomCode));
  panel.appendChild(el("p", { class: "muted mt-1" }, `${ed.label} edition · ${session.mode === "wholeClass" ? "Whole Class" : "Small Groups"} mode`));
  container.appendChild(panel);

  if (session.mode === "wholeClass") {
    const mainPlayers = players.filter((p) => p.groupId === "main");
    const p2 = el("div", { class: "card-panel" });
    p2.appendChild(el("h3", {}, `Joined (${mainPlayers.length})`));
    if (mainPlayers.length === 0) p2.appendChild(el("p", { class: "empty-hint" }, "No one has joined yet."));
    else p2.appendChild(el("p", {}, mainPlayers.map((p) => p.name).join(", ")));
    container.appendChild(p2);
  } else {
    const pending = players.filter((p) => p.groupId === "pending");
    const p2 = el("div", { class: "card-panel" });
    if (groups.length === 0) {
      p2.appendChild(el("h3", {}, `Joined, waiting to be split (${pending.length})`));
      if (pending.length) p2.appendChild(el("p", {}, pending.map((p) => p.name).join(", ")));
      p2.appendChild(el("div", { class: "btn-row" }, [
        el("button", {
          class: "btn btn-gold", disabled: pending.length === 0,
          onclick: async (e) => { e.target.disabled = true; e.target.textContent = "Splitting…"; await onAutoSplit(); }
        }, "Split into groups now →")
      ]));
    } else {
      p2.appendChild(el("h3", {}, "Groups"));
      groups.forEach((g) => {
        const count = players.filter((p) => p.groupId === g.id).length;
        const row = el("div", { class: "group-row" });
        row.appendChild(el("div", {}, [
          el("div", { class: "g-name" }, g.name + (g.code ? ` — code “${g.code}”` : "")),
          el("div", { class: "g-sub" }, `${count} joined`)
        ]));
        p2.appendChild(row);
      });
      if (pending.length) p2.appendChild(el("p", { class: "field-hint" }, `${pending.length} more joined without a group code and are waiting.`));
    }
    container.appendChild(p2);
  }

  const canStart = session.mode === "wholeClass"
    ? players.some((p) => p.groupId === "main")
    : groups.some((g) => players.some((p) => p.groupId === g.id));

  container.appendChild(el("div", { class: "btn-row" }, [
    el("button", {
      class: "btn btn-primary btn-lg", disabled: !canStart,
      onclick: async (e) => { e.target.disabled = true; e.target.textContent = "Dealing cards…"; await onStart(); }
    }, "Deal cards & start session →"),
    el("button", { class: "btn btn-ghost", onclick: onGoNotes }, "View notes log")
  ]));
  if (!canStart) container.appendChild(el("p", { class: "field-hint" }, "Waiting for at least one player to join before you can start."));
}

export function renderPlayerLobby(container, { session, myPlayer, group }) {
  clearNode(container);
  container.appendChild(
    el("div", { class: "center-stage" }, [
      el("div", { class: "card-panel text-center", style: "max-width:420px" }, [
        el("div", { class: "waiting-pulse" }),
        el("strong", {}, "Waiting for the host to start…"),
        el("p", { class: "muted mt-1" }, `You're in as ${myPlayer?.name || "…"}.`),
        group?.name ? el("p", { class: "muted" }, group.code ? `${group.name} (code ${group.code})` : group.name) : null,
        myPlayer && myPlayer.groupId === "pending" ? el("p", { class: "field-hint" }, "Your host hasn't split the class into groups yet.") : null
      ])
    ])
  );
}
