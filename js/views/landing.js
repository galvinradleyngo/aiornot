import { el, clearNode } from "../utils.js";

export function renderLanding(container, { onHost, onJoin }) {
  clearNode(container);
  container.appendChild(
    el("div", { class: "brand-hero" }, [
      el("h1", {}, "To AI or Not to AI?"),
      el("p", {}, "A case-method card game about the risks and opportunities of using AI in your role. Play together, live, on your own devices.")
    ])
  );
  container.appendChild(
    el("div", { class: "choice-grid" }, [
      el("button", { class: "choice-card", onclick: onHost }, [
        el("h3", {}, "🧑‍🏫 I'm hosting"),
        el("p", {}, "Set up a session: pick an edition, a play mode, and get a room code to share.")
      ]),
      el("button", { class: "choice-card", onclick: onJoin }, [
        el("h3", {}, "🙋 I'm joining a session"),
        el("p", {}, "Enter the room code your host gave you and your name.")
      ])
    ])
  );
}
