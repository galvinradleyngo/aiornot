import { el, clearNode } from "../utils.js";

export function renderJoin(container, { onJoin, onBack, prefillRoomCode, error }) {
  clearNode(container);
  container.appendChild(el("h2", {}, "Join a session"));
  const panel = el("div", { class: "card-panel screen-narrow" });

  const nameField = el("input", { type: "text", placeholder: "e.g. Jordan", maxlength: "40" });
  const roomField = el("input", {
    type: "text", placeholder: "e.g. K7QRT", maxlength: "8", style: "text-transform:uppercase;letter-spacing:0.1em;font-weight:700;",
    value: prefillRoomCode || ""
  });
  const groupField = el("input", { type: "text", placeholder: "e.g. DELTA (only if your host gave you one)", maxlength: "20" });

  panel.appendChild(el("div", { class: "field" }, [el("label", {}, "Your name"), nameField]));
  panel.appendChild(el("div", { class: "field" }, [el("label", {}, "Room code"), roomField]));
  panel.appendChild(el("div", { class: "field" }, [
    el("label", {}, "Group code (only for Small Groups sessions with pre-generated codes)"),
    groupField,
    el("div", { class: "field-hint" }, "Leave this blank if your host said the class will be auto-split into groups, or if you're in Whole Class mode.")
  ]));

  const err = el("p", { style: "color:#8f2d2d" }, error || "");
  panel.appendChild(err);

  panel.appendChild(el("div", { class: "btn-row" }, [
    el("button", { class: "btn", onclick: onBack }, "← Back"),
    el("button", {
      class: "btn btn-primary btn-lg btn-block",
      onclick: async (e) => {
        const name = nameField.value.trim();
        const roomCode = roomField.value.trim().toUpperCase();
        const groupCode = groupField.value.trim().toUpperCase();
        if (!name) { err.textContent = "Please enter your name."; return; }
        if (!roomCode) { err.textContent = "Please enter the room code."; return; }
        e.target.disabled = true;
        e.target.textContent = "Joining…";
        try {
          await onJoin({ name, roomCode, groupCode });
        } catch (ex) {
          err.textContent = ex.message || String(ex);
          e.target.disabled = false;
          e.target.textContent = "Join session →";
        }
      }
    }, "Join session →")
  ]));

  container.appendChild(panel);
}
