import { el, clearNode } from "../utils.js";
import { EDITIONS } from "../data.js";

export function renderHostSetup(container, { onCreate, onBack }) {
  clearNode(container);

  const form = {
    edition: "leadership",
    mode: "wholeClass",
    driverSetting: "freeForAll",
    roundTimerMinutes: 7,
    groupPlanMode: "auto",
    groupCount: 4
  };

  const panel = el("div", { class: "card-panel" });
  container.appendChild(el("h2", {}, "Set up a session"));
  container.appendChild(panel);

  function editionField() {
    const wrap = el("div", { class: "field" }, [el("label", {}, "Edition")]);
    const select = el("select", {
      onchange: (e) => (form.edition = e.target.value)
    });
    Object.entries(EDITIONS).forEach(([key, ed]) => {
      select.appendChild(el("option", { value: key, selected: key === form.edition }, ed.label));
    });
    wrap.appendChild(select);
    wrap.appendChild(el("div", { class: "field-hint" }, "The Decision cards are identical across editions — only the Use Case / Risk / Opportunity text changes."));
    return wrap;
  }

  function modeField() {
    const wrap = el("div", { class: "field" }, [el("label", {}, "Play mode")]);
    const group = el("div", { class: "radio-group" });
    const options = [
      { v: "wholeClass", title: "Whole Class", desc: "One shared session — everyone flags cards and votes together. Best for classes without natural sub-tables." },
      { v: "smallGroups", title: "Small Groups", desc: "5–6 per group, each running its own independent game. Best for in-person clusters or Zoom breakout rooms." }
    ];
    options.forEach((opt) => {
      const row = el("label", { class: "radio-option" + (form.mode === opt.v ? " selected" : "") });
      const radio = el("input", {
        type: "radio", name: "mode", value: opt.v, checked: form.mode === opt.v,
        onchange: () => { form.mode = opt.v; rerenderGroupOptions(); row.parentElement.querySelectorAll(".radio-option").forEach((n) => n.classList.remove("selected")); row.classList.add("selected"); groupPlanBlock.hidden = form.mode !== "smallGroups"; driverBlock.hidden = form.mode !== "smallGroups"; }
      });
      row.appendChild(radio);
      row.appendChild(el("div", {}, [el("div", { class: "opt-title" }, opt.title), el("div", { class: "opt-desc" }, opt.desc)]));
      group.appendChild(row);
    });
    wrap.appendChild(group);
    return wrap;
  }

  function timerField() {
    const wrap = el("div", { class: "field" }, [el("label", {}, "Round timer (advisory only — never auto-advances)")]);
    wrap.appendChild(el("input", {
      type: "number", min: "1", max: "20", value: String(form.roundTimerMinutes),
      oninput: (e) => (form.roundTimerMinutes = Number(e.target.value) || 7)
    }));
    wrap.appendChild(el("div", { class: "field-hint" }, "Just a shown countdown to help pace discussion. The host still decides when to move on."));
    return wrap;
  }

  let groupPlanBlock, driverBlock;

  function groupPlanField() {
    groupPlanBlock = el("div", { class: "field" }, [el("label", {}, "Forming groups")]);
    groupPlanBlock.hidden = form.mode !== "smallGroups";
    const group = el("div", { class: "radio-group" });
    const options = [
      { v: "auto", title: "Auto-split once everyone's joined", desc: "Good for in-person classes: everyone joins the one room code, then you tap \"Split into groups.\"" },
      { v: "pregenerated", title: "Pre-generate group codes now", desc: "Good for Zoom breakout rooms: get a code per group in advance, then read out \"you're Group 3, code DELTA\" per room." }
    ];
    options.forEach((opt) => {
      const row = el("label", { class: "radio-option" + (form.groupPlanMode === opt.v ? " selected" : "") });
      const radio = el("input", {
        type: "radio", name: "groupplan", value: opt.v, checked: form.groupPlanMode === opt.v,
        onchange: () => { form.groupPlanMode = opt.v; group.querySelectorAll(".radio-option").forEach((n) => n.classList.remove("selected")); row.classList.add("selected"); countField.hidden = form.groupPlanMode !== "pregenerated"; }
      });
      row.appendChild(radio);
      row.appendChild(el("div", {}, [el("div", { class: "opt-title" }, opt.title), el("div", { class: "opt-desc" }, opt.desc)]));
      group.appendChild(row);
    });
    groupPlanBlock.appendChild(group);
    const countField = el("div", { class: "field mt-1" }, [el("label", {}, "How many groups?")]);
    countField.hidden = form.groupPlanMode !== "pregenerated";
    countField.appendChild(el("input", {
      type: "number", min: "1", max: "20", value: String(form.groupCount),
      oninput: (e) => (form.groupCount = Number(e.target.value) || 4)
    }));
    groupPlanBlock.appendChild(countField);
    return groupPlanBlock;
  }

  function driverField() {
    driverBlock = el("div", { class: "field" }, [el("label", {}, "Within each group, who can advance the round?")]);
    driverBlock.hidden = form.mode !== "smallGroups";
    const group = el("div", { class: "radio-group" });
    const options = [
      { v: "freeForAll", title: "Free-for-all", desc: "Any group member can flag cards, promote cards, and advance the round. Simplest for a small in-person cluster sharing one table." },
      { v: "oneDriver", title: "One driver", desc: "Only the first student to join each group (the \"driver\") can advance the round and lock in decisions. Reduces conflicting taps in an online breakout room." }
    ];
    options.forEach((opt) => {
      const row = el("label", { class: "radio-option" + (form.driverSetting === opt.v ? " selected" : "") });
      const radio = el("input", {
        type: "radio", name: "driver", value: opt.v, checked: form.driverSetting === opt.v,
        onchange: () => { form.driverSetting = opt.v; group.querySelectorAll(".radio-option").forEach((n) => n.classList.remove("selected")); row.classList.add("selected"); }
      });
      row.appendChild(radio);
      row.appendChild(el("div", {}, [el("div", { class: "opt-title" }, opt.title), el("div", { class: "opt-desc" }, opt.desc)]));
      group.appendChild(row);
    });
    driverBlock.appendChild(group);
    return driverBlock;
  }

  function rerenderGroupOptions() {
    groupPlanBlock.hidden = form.mode !== "smallGroups";
  }

  panel.appendChild(editionField());
  panel.appendChild(el("hr", { class: "divider" }));
  panel.appendChild(modeField());
  panel.appendChild(el("hr", { class: "divider" }));
  panel.appendChild(timerField());
  panel.appendChild(el("hr", { class: "divider" }));
  panel.appendChild(groupPlanField());
  panel.appendChild(driverField());

  const err = el("p", { style: "color:#8f2d2d" }, "");
  panel.appendChild(err);

  const btnRow = el("div", { class: "btn-row" }, [
    el("button", { class: "btn", onclick: onBack }, "← Back"),
    el("button", {
      class: "btn btn-primary btn-lg",
      onclick: async (e) => {
        e.target.disabled = true;
        e.target.textContent = "Creating session…";
        try {
          await onCreate({ ...form });
        } catch (ex) {
          err.textContent = ex.message || String(ex);
          e.target.disabled = false;
          e.target.textContent = "Create session →";
        }
      }
    }, "Create session →")
  ]);
  panel.appendChild(btnRow);
}
