// Shared app state + localStorage-backed "which session was I in" memory.
// Firebase Anonymous Auth already gives each device a stable uid across
// refreshes (that's the real reconnection mechanism — see firebase.js);
// this localStorage hint just lets the app skip straight back to the
// right screen instead of asking "host or join?" again.

import { saveLocal, loadLocal, clearLocal } from "./utils.js";

const KEY = "aiornot_last_session";

export const state = {
  uid: null,
  roomCode: null,
  role: null, // 'host' | 'player'
  session: null,
  groups: [],
  notesLog: [],
  myGroupId: null,
  myPlayer: null,
  round: null,
  myFlags: {},
  myVote: null,
  unsubs: [] // active onSnapshot unsubscribe fns for the current screen
};

export function rememberSession(roomCode, role) {
  saveLocal(KEY, { roomCode, role });
}

export function recallSession() {
  return loadLocal(KEY);
}

export function forgetSession() {
  clearLocal(KEY);
}

export function teardownListeners() {
  state.unsubs.forEach((fn) => {
    try { fn(); } catch (e) {}
  });
  state.unsubs = [];
}

export function track(unsub) {
  state.unsubs.push(unsub);
}
