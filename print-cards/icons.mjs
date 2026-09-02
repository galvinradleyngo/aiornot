// A small set of simple line icons (Feather-style: 24x24 viewBox, white
// stroke, no fill) used on the printed cards. These are deliberately plain
// geometric approximations, not a matched icon library — see README.md,
// "Printable physical cards", for why exact icon-matching isn't required.

const ICONS = {
  pen: `<path d="M4 20l1-4L16 5l3 3L8 19l-4 1z"/><path d="M14 6l4 4"/>`,
  laptop: `<rect x="3" y="5" width="18" height="11" rx="1"/><path d="M2 19h20"/>`,
  book: `<path d="M4 4h9a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3V4z"/><path d="M20 4h-4v16h4z"/>`,
  clock: `<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>`,
  chat: `<path d="M4 5h16v11H9l-4 4V5z"/>`,
  globe: `<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>`,
  briefcase: `<rect x="3" y="8" width="18" height="12" rx="1"/><path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>`,
  search: `<circle cx="10" cy="10" r="6"/><path d="M20 20l-5.5-5.5"/>`,
  warning: `<path d="M12 3l10 18H2L12 3z"/><path d="M12 10v4M12 17v.5"/>`,
  compass: `<circle cx="12" cy="12" r="9"/><path d="M15 9l-2 6-6 2 2-6 6-2z"/>`,
  heart: `<path d="M12 20s-7-4.4-9.5-9C1 7.5 3 4 6.5 4 9 4 11 6 12 7.5 13 6 15 4 17.5 4 21 4 23 7.5 21.5 11 19 15.6 12 20 12 20z"/>`,
  scale: `<path d="M12 3v18M6 21h12M4 7h6M14 7h6M4 7l-2 5h6L4 7zM20 7l-2 5h6l-4-5z"/>`,
  lock: `<rect x="4" y="11" width="16" height="10" rx="1"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>`,
  cube: `<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"/><path d="M4 7.5L12 12l8-4.5M12 12v9"/>`,
  battery: `<rect x="2" y="8" width="17" height="8" rx="1"/><path d="M21 11v2"/><path d="M5 11v2"/>`,
  leaf: `<path d="M20 4C10 4 4 10 4 18c8 0 14-6 14-14z"/><path d="M4 20l7-7"/>`,
  gavel: `<path d="M13 5l6 6M9 9l6 6M4 15l5-5 5 5-5 5-5-5z"/><path d="M15 19h6"/>`,
  megaphone: `<path d="M3 10v4h4l8 4V6l-8 4H3z"/><path d="M17 9a4 4 0 0 1 0 6"/>`,
  brain: `<path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5h1a3 3 0 0 0 2-1V6a2 2 0 0 0-0-2z"/><path d="M15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5h-1a3 3 0 0 1-2-1V6a2 2 0 0 1 0-2z"/>`,
  chartBar: `<path d="M4 20V10M11 20V4M18 20v-7"/><path d="M2 20h20"/>`,
  chartLine: `<path d="M3 17l5-5 4 4 8-9"/><path d="M2 20h20"/>`,
  lightbulb: `<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3 11c1 1 1 2 1 3h4c0-1 0-2 1-3a6 6 0 0 0-3-11z"/>`,
  gear: `<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>`,
  rocket: `<path d="M12 2c3 2 5 6 4 12-2 0-5-1-6-2-1-2-2-6 2-10z"/><path d="M9 15l-4 4M13 14l4 4M8 19l-1 3 3-1M14 13l3-1-1 3"/>`,
  refresh: `<path d="M20 12a8 8 0 1 1-3-6.3"/><path d="M20 3v5h-5"/>`,
  coin: `<circle cx="12" cy="12" r="9"/><path d="M12 7v10M9.5 9.5c0-1.4 1.1-2.5 2.5-2.5s2.5.7 2.5 2-1 1.7-2.5 2-2.5.9-2.5 2 1.1 2 2.5 2 2.5-1 2.5-2.5"/>`,
  access: `<circle cx="12" cy="5" r="2"/><path d="M4 9l8 2 8-2M12 11v9M8 20l4-3 4 3"/>`,
  users: `<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3 3-5 6-5s6 2 6 5"/><circle cx="17" cy="9" r="2.5"/><path d="M15.5 15c2.5.3 4.5 2 4.5 5"/>`,
  shield: `<path d="M12 3l7 3v6c0 5-3 8-7 9-4-1-7-4-7-9V6l7-3z"/>`,
  moon: `<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/>`,
  document: `<path d="M6 3h9l4 4v14H6V3z"/><path d="M15 3v4h4"/>`,
  robot: `<rect x="5" y="9" width="14" height="10" rx="2"/><circle cx="9" cy="14" r="1.3"/><circle cx="15" cy="14" r="1.3"/><path d="M12 6v3M9 3h6"/>`
};

// Keyword -> icon name. First match (case-insensitive substring on the
// card title) wins; falls back to a sensible per-type default.
const RULES = [
  [/writ|essay|draft|resume|cover letter|slide|presentation/i, "pen"],
  [/cod(e|ing)|debug/i, "laptop"],
  [/read|flashcard|summar|study|explain|concept|practice problem/i, "book"],
  [/24\/7|time|efficiency|after-hours|available/i, "clock"],
  [/chatbot|bot|tutor|homework help|emotional support|wellbeing/i, "chat"],
  [/translat|language|international/i, "globe"],
  [/career|interview|internship|resume/i, "briefcase"],
  [/fact-check|research|verify/i, "search"],
  [/integrity|cheat|proctor|timed test/i, "warning"],
  [/advis|elective|recommend/i, "compass"],
  [/wellbeing|emotional|trust/i, "heart"],
  [/bias|discrimination|fair/i, "scale"],
  [/privacy|data exposure|security vulnerab/i, "lock"],
  [/black box/i, "cube"],
  [/de-skilling|over-reliance|reliance/i, "battery"],
  [/environmental/i, "leaf"],
  [/legal|regulatory|liabilit/i, "gavel"],
  [/reputation/i, "megaphone"],
  [/cognitive/i, "brain"],
  [/data-driven|insight/i, "chartBar"],
  [/pattern detection/i, "chartLine"],
  [/augmented decision/i, "lightbulb"],
  [/cost/i, "coin"],
  [/accessib/i, "access"],
  [/group|collaborat|team/i, "users"],
  [/security|hack|jailbreak/i, "shield"],
  [/24\/7 study|1am|late at night/i, "moon"],
  [/homogeniz/i, "users"],
  [/accountability|black box|hallucinat|sycophan/i, "robot"],
  [/faster iteration|refin/i, "refresh"],
  [/frees|higher-value|rocket/i, "rocket"],
  [/consisten/i, "gear"]
];

export function iconFor(title, fallback) {
  for (const [re, name] of RULES) {
    if (re.test(title)) return ICONS[name] ? name : fallback;
  }
  return fallback;
}

export function iconSvg(name) {
  const body = ICONS[name] || ICONS.document;
  return `<svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
}
