import { authReady, getUid } from "./firebase.js";
import { state, rememberSession, recallSession, forgetSession } from "./state.js";
import * as db from "./db.js";
import { el, clearNode } from "./utils.js";
import { renderLanding } from "./views/landing.js";
import { renderHostSetup } from "./views/hostSetup.js";
import { renderJoin } from "./views/join.js";
import { renderHostLobby, renderPlayerLobby } from "./views/lobby.js";
import { renderRoundScreen } from "./views/round.js";
import { renderGroupsDashboard } from "./views/groupsDashboard.js";
import { renderNotes } from "./views/notes.js";
import { renderDebrief } from "./views/debrief.js";

const screenEl = document.getElementById("screen");
const topbarInfo = document.getElementById("topbar-info");
const errorBanner = document.getElementById("global-error");

state.screenName = "boot";
state.joinPrefill = "";
state.players = [];

window.addEventListener("unhandledrejection", (e) => {
  console.error(e.reason);
  showError("Something went wrong: " + (e.reason?.message || e.reason));
});

function showError(msg) {
  errorBanner.hidden = false;
  errorBanner.textContent = msg;
  clearTimeout(showError._t);
  showError._t = setTimeout(() => (errorBanner.hidden = true), 6000);
}

// ---------------- session-scoped listener lifecycle ----------------

let sessionUnsubs = [];
let roundUnsub = null, flagsUnsub = null, voteUnsub = null, watchedRoundId = null;

function teardownRoundListeners() {
  if (roundUnsub) roundUnsub();
  if (flagsUnsub) flagsUnsub();
  if (voteUnsub) voteUnsub();
  roundUnsub = flagsUnsub = voteUnsub = null;
  watchedRoundId = null;
  state.round = null;
  state.myFlags = {};
  state.myVote = null;
}

function teardownSessionListeners() {
  sessionUnsubs.forEach((fn) => fn());
  sessionUnsubs = [];
  teardownRoundListeners();
}

function ensureRoundListener() {
  if (!state.session) return;
  let groupId = null;
  if (state.session.mode === "wholeClass") groupId = "main";
  else if (state.role === "player") groupId = state.myGroupId;
  const group = state.groups.find((g) => g.id === groupId) || null;
  state.activeGroup = group;
  const roundId = group?.currentRoundId || null;
  if (roundId === watchedRoundId) return;
  teardownRoundListeners();
  watchedRoundId = roundId;
  if (roundId) {
    roundUnsub = db.watchRound(state.roomCode, roundId, (r) => { state.round = r; render(); });
    if (state.role === "player") {
      flagsUnsub = db.watchMyFlags(state.roomCode, roundId, state.uid, (f) => { state.myFlags = f; render(); });
      voteUnsub = db.watchMyVote(state.roomCode, roundId, state.uid, (v) => { state.myVote = v; render(); });
    }
  }
}

function naturalScreenName() {
  if (!state.session) return "landing";
  if (state.session.status === "ended") return "debrief";
  if (state.session.status === "lobby") return state.role === "host" ? "hostLobby" : "playerLobby";
  // active
  if (state.role === "player" && state.myPlayer && state.myPlayer.groupId === "pending") return "playerLobby";
  if (state.role === "host" && state.session.mode === "smallGroups") return "groupsDashboard";
  return "round";
}

const IN_SESSION_SCREENS = ["hostLobby", "playerLobby", "round", "groupsDashboard", "debrief"];

function syncScreenIfLoaded() {
  if (!state.session) return;
  if (state.role === "player" && !state.myPlayer) return;
  if (state.screenName === "boot" || IN_SESSION_SCREENS.includes(state.screenName)) {
    state.screenName = naturalScreenName();
  }
  render();
}

function enterSession() {
  teardownSessionListeners();
  state.groups = [];
  state.notesLog = [];
  state.players = [];
  state.myPlayer = null;
  state.myGroupId = null;
  state.activeGroup = null;
  state.screenName = "boot";
  render();

  sessionUnsubs.push(db.watchSession(state.roomCode, (session) => {
    if (!session) {
      forgetSession();
      showError("This session no longer exists — it may have expired or been ended.");
      state.roomCode = null;
      state.role = null;
      teardownSessionListeners();
      state.screenName = "landing";
      render();
      return;
    }
    state.session = session;
    syncScreenIfLoaded();
  }));

  sessionUnsubs.push(db.watchGroups(state.roomCode, (groups) => {
    state.groups = groups;
    syncScreenIfLoaded();
  }));

  sessionUnsubs.push(db.watchNotesLog(state.roomCode, (log) => {
    state.notesLog = log;
    render();
  }));

  if (state.role === "host") {
    sessionUnsubs.push(db.watchPlayers(state.roomCode, (players) => {
      state.players = players;
      render();
    }));
  } else {
    sessionUnsubs.push(db.watchPlayer(state.roomCode, state.uid, (p) => {
      state.myPlayer = p;
      state.myGroupId = p ? p.groupId : null;
      syncScreenIfLoaded();
    }));
  }
}

// ---------------- navigation ----------------

function goLanding() {
  teardownSessionListeners();
  state.roomCode = null;
  state.role = null;
  forgetSession();
  state.screenName = "landing";
  render();
}
function goHostSetup() { state.screenName = "hostSetup"; render(); }
function goJoin(prefill) { state.joinPrefill = prefill || ""; state.screenName = "join"; render(); }
function goNotes() { state.screenName = "notes"; render(); }
function goBackFromNotes() { state.screenName = naturalScreenName(); render(); }

// ---------------- action handlers ----------------

async function handleCreateSession(form) {
  const groupPlan = form.mode === "smallGroups" && form.groupPlanMode === "pregenerated"
    ? { mode: "pregenerated", count: form.groupCount }
    : null;
  const { roomCode } = await db.createSession(state.uid, {
    edition: form.edition, mode: form.mode, driverSetting: form.driverSetting,
    roundTimerMinutes: form.roundTimerMinutes, groupPlan
  });
  state.roomCode = roomCode;
  state.role = "host";
  rememberSession(roomCode, "host");
  enterSession();
}

async function handleJoinSession({ name, roomCode, groupCode }) {
  const session = await db.getSessionOnce(roomCode);
  if (!session) throw new Error("That room code wasn't found.");
  const player = await db.joinSession(roomCode, state.uid, { name, groupCode, mode: session.mode });
  state.roomCode = roomCode;
  state.role = "player";
  rememberSession(roomCode, "player");
  if (session.mode === "smallGroups" && player.groupId !== "pending") {
    db.claimDriver(roomCode, player.groupId, state.uid).catch(() => {});
  }
  enterSession();
}

async function handleAutoSplit() {
  await db.autoSplitIntoGroups(state.roomCode, state.session.edition, state.session.driverSetting, state.session.expiresAt);
}

async function handleStart() {
  if (state.session.mode === "wholeClass") {
    await db.dealHandsRoundRobin(state.roomCode, "main", state.session.edition);
    await db.startSession(state.roomCode);
    await db.advanceToNextUseCase(state.roomCode, "main", state.session.expiresAt);
  } else {
    for (const g of state.groups) {
      const hasMembers = state.players.some((p) => p.groupId === g.id);
      if (!hasMembers) continue;
      if (!g.id.startsWith("auto")) {
        await db.dealHandsRoundRobin(state.roomCode, g.id, state.session.edition);
      }
    }
    await db.startSession(state.roomCode);
    for (const g of state.groups) {
      if (state.players.some((p) => p.groupId === g.id)) {
        await db.advanceToNextUseCase(state.roomCode, g.id, state.session.expiresAt);
      }
    }
  }
}

async function handleEndSession() {
  await db.endSession(state.roomCode);
}

async function onToggleFlag(card) {
  const key = card.type + "_" + card.n;
  const wasFlagged = !!(state.myFlags && state.myFlags[key]);
  await db.toggleFlag(state.roomCode, state.round.id, state.uid, card);
  if (!wasFlagged) {
    const reason = window.prompt("Optional: why does this apply? (leave blank to skip)");
    if (reason && reason.trim()) {
      await db.setFlagReason(state.roomCode, state.round.id, state.uid, key, reason);
    }
  }
}
async function onPromote(risks, opps) {
  await db.promoteCards(state.roomCode, state.round.id, risks, opps);
}
async function onOpenVote() {
  await db.openVote(state.roomCode, state.round.id);
}
async function onCastVote(key) {
  if (!state.myPlayer) return;
  await db.castVote(state.roomCode, state.round.id, state.uid, key);
}
async function onLockDecision(key, guardrailText) {
  await db.lockDecision(state.roomCode, state.round, key, guardrailText);
}
async function onAdvance() {
  await db.advanceToNextUseCase(state.roomCode, state.activeGroup.id, state.session.expiresAt);
}
async function onRedealWholeClass() {
  await db.dealHandsRoundRobin(state.roomCode, "main", state.session.edition);
}

// ---------------- render dispatch ----------------

function renderLoading(msg) {
  clearNode(screenEl);
  screenEl.appendChild(el("div", { class: "center-stage" }, [
    el("div", { class: "card-panel text-center" }, [el("div", { class: "waiting-pulse" }), msg || "Loading…"])
  ]));
}

function updateTopbar() {
  clearNode(topbarInfo);
  if (state.roomCode && state.screenName !== "landing") {
    topbarInfo.appendChild(el("span", { class: "room-code-badge" }, state.roomCode));
    if (state.screenName !== "notes") {
      topbarInfo.appendChild(el("button", { class: "btn", style: "background:transparent;color:#fff;border-color:rgba(255,255,255,0.4)", onclick: goNotes }, "Notes"));
    }
  }
}

function renderRoundView() {
  if (!state.activeGroup) { renderLoading("Loading round…"); return; }
  const isHost = state.role === "host";
  const group = state.activeGroup;
  const myPlayer = state.role === "player" ? state.myPlayer : null;
  const canControl = isHost || group.driverSetting === "freeForAll" || group.driverUid === state.uid;
  const controllerLabel = isHost ? "the host" : group.driverSetting === "freeForAll" ? "the group" : "the driver";
  const decided = state.notesLog.filter((n) => n.groupId === group.id);
  const boardTally = { toai: 0, notoai: 0, guardrails: 0 };
  decided.forEach((n) => { if (boardTally[n.decision] !== undefined) boardTally[n.decision]++; });

  renderRoundScreen(screenEl, {
    edition: state.session.edition,
    group, round: state.round, myPlayer, canControl, controllerLabel,
    boardTally, decidedCount: decided.length, deckSize: 18,
    myFlags: state.myFlags, myVote: state.myVote,
    onToggleFlag, onPromote, onOpenVote, onCastVote, onLockDecision, onAdvance,
    onGoNotes: goNotes, onEndSession: handleEndSession, isHost,
    onRedeal: (isHost && state.session.mode === "wholeClass") ? onRedealWholeClass : null
  });
}

function render() {
  updateTopbar();
  if (state.session) ensureRoundListener();

  if (IN_SESSION_SCREENS.includes(state.screenName) && !state.session) {
    renderLoading();
    return;
  }

  switch (state.screenName) {
    case "boot":
      renderLoading();
      break;
    case "landing":
      renderLanding(screenEl, { onHost: goHostSetup, onJoin: () => goJoin() });
      break;
    case "hostSetup":
      renderHostSetup(screenEl, { onCreate: handleCreateSession, onBack: goLanding });
      break;
    case "join":
      renderJoin(screenEl, { onJoin: handleJoinSession, onBack: goLanding, prefillRoomCode: state.joinPrefill });
      break;
    case "hostLobby":
      renderHostLobby(screenEl, {
        session: state.session, roomCode: state.roomCode, groups: state.groups, players: state.players,
        onAutoSplit: handleAutoSplit, onStart: handleStart, onGoNotes: goNotes
      });
      break;
    case "playerLobby":
      renderPlayerLobby(screenEl, { session: state.session, myPlayer: state.myPlayer, group: state.activeGroup });
      break;
    case "round":
      renderRoundView();
      break;
    case "groupsDashboard":
      renderGroupsDashboard(screenEl, {
        roomCode: state.roomCode, edition: state.session.edition, groups: state.groups,
        players: state.players, notesLog: state.notesLog, onGoNotes: goNotes, onEndSession: handleEndSession
      });
      break;
    case "notes":
      renderNotes(screenEl, { edition: state.session.edition, notesLog: state.notesLog, mode: state.session.mode, onBack: goBackFromNotes });
      break;
    case "debrief":
      renderDebrief(screenEl, {
        roomCode: state.roomCode, edition: state.session.edition, mode: state.session.mode,
        groups: state.groups, notesLog: state.notesLog, onGoNotes: goNotes, onBackLanding: goLanding
      });
      break;
    default:
      renderLoading();
  }
}

// ---------------- boot ----------------

async function boot() {
  await authReady;
  state.uid = getUid();

  const remembered = recallSession();
  if (remembered) {
    try {
      const session = await db.getSessionOnce(remembered.roomCode);
      if (session) {
        if (remembered.role === "host" && session.hostUid !== state.uid) {
          forgetSession();
        } else {
          state.roomCode = remembered.roomCode;
          state.role = remembered.role;
          enterSession();
          return;
        }
      } else {
        forgetSession();
      }
    } catch (e) {
      console.error("Reconnect failed", e);
      forgetSession();
    }
  }
  state.screenName = "landing";
  render();
}

boot();
