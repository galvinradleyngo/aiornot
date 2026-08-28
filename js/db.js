// All Firestore reads/writes live here. Nothing in the UI layer talks to
// Firestore directly — it calls these functions.
//
// Data model (see README.md "How the data is organized" for the full picture):
//   sessions/{roomCode}
//   sessions/{roomCode}/groups/{groupId}
//   sessions/{roomCode}/players/{uid}
//   sessions/{roomCode}/rounds/{roundId}
//   sessions/{roomCode}/rounds/{roundId}/playerFlags/{uid}
//   sessions/{roomCode}/rounds/{roundId}/playerVotes/{uid}
//   sessions/{roomCode}/notesLog/{entryId}
//
// Every document under a session carries the SAME `expiresAt` Timestamp,
// computed once when the session is created, so the whole tree expires
// together under the Firestore TTL policy (see README).

import { db } from "./firebase.js";
import {
  doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc,
  collection, getDocs, onSnapshot, query, where,
  runTransaction, writeBatch, serverTimestamp, Timestamp, increment
} from "./vendor/firebase-bundle.js";
import { fullCardDeck, cardKey } from "./data.js";
import { randomRoomCode, groupWord, shuffle, fourteenDaysFromNow } from "./utils.js";

const sessionRef = (roomCode) => doc(db, "sessions", roomCode);
const groupsCol = (roomCode) => collection(db, "sessions", roomCode, "groups");
const groupRef = (roomCode, groupId) => doc(db, "sessions", roomCode, "groups", groupId);
const playersCol = (roomCode) => collection(db, "sessions", roomCode, "players");
const playerRef = (roomCode, uid) => doc(db, "sessions", roomCode, "players", uid);
const roundsCol = (roomCode) => collection(db, "sessions", roomCode, "rounds");
const roundRef = (roomCode, roundId) => doc(db, "sessions", roomCode, "rounds", roundId);
const flagRef = (roomCode, roundId, uid) =>
  doc(db, "sessions", roomCode, "rounds", roundId, "playerFlags", uid);
const voteRef = (roomCode, roundId, uid) =>
  doc(db, "sessions", roomCode, "rounds", roundId, "playerVotes", uid);
const notesLogCol = (roomCode) => collection(db, "sessions", roomCode, "notesLog");

// ---------- Session / host setup ----------

export async function createSession(hostUid, { edition, mode, driverSetting, roundTimerMinutes, groupPlan }) {
  let roomCode = randomRoomCode();
  // extremely unlikely collision guard
  for (let i = 0; i < 5; i++) {
    const snap = await getDoc(sessionRef(roomCode));
    if (!snap.exists()) break;
    roomCode = randomRoomCode();
  }
  const expiresAt = Timestamp.fromDate(fourteenDaysFromNow());
  await setDoc(sessionRef(roomCode), {
    hostUid,
    edition,
    mode, // 'wholeClass' | 'smallGroups'
    driverSetting: mode === "wholeClass" ? "hostOnly" : driverSetting, // 'oneDriver' | 'freeForAll'
    roundTimerMinutes: roundTimerMinutes || 7,
    status: "lobby", // 'lobby' | 'active' | 'ended'
    createdAt: serverTimestamp(),
    expiresAt
  });

  if (mode === "wholeClass") {
    await setDoc(groupRef(roomCode, "main"), {
      name: "Class",
      code: null,
      driverSetting: "hostOnly",
      driverUid: null,
      useCaseOrder: shuffle(Array.from({ length: 18 }, (_, i) => i + 1)),
      currentRoundIndex: 0,
      currentRoundId: null,
      status: "lobby",
      createdAt: serverTimestamp(),
      expiresAt
    });
  } else if (groupPlan?.mode === "pregenerated") {
    for (let i = 0; i < groupPlan.count; i++) {
      const gid = `g${i}`;
      await setDoc(groupRef(roomCode, gid), {
        name: `Group ${i + 1}`,
        code: groupWord(i),
        driverSetting,
        driverUid: null,
        useCaseOrder: shuffle(Array.from({ length: 18 }, (_, j) => j + 1)),
        currentRoundIndex: 0,
        currentRoundId: null,
        status: "lobby",
        createdAt: serverTimestamp(),
        expiresAt
      });
    }
  }
  // auto-split groups are created later, once players have joined, via autoSplitIntoGroups()

  return { roomCode, expiresAt };
}

export function watchSession(roomCode, cb) {
  return onSnapshot(sessionRef(roomCode), (snap) => cb(snap.exists() ? { id: snap.id, ...snap.data() } : null));
}

export async function getSessionOnce(roomCode) {
  const snap = await getDoc(sessionRef(roomCode));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function startSession(roomCode) {
  await updateDoc(sessionRef(roomCode), { status: "active" });
}

export async function endSession(roomCode) {
  await updateDoc(sessionRef(roomCode), { status: "ended" });
}

// ---------- Groups ----------

export function watchGroups(roomCode, cb) {
  return onSnapshot(groupsCol(roomCode), (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export function watchGroup(roomCode, groupId, cb) {
  return onSnapshot(groupRef(roomCode, groupId), (snap) => cb(snap.exists() ? { id: snap.id, ...snap.data() } : null));
}

export async function findGroupByCode(roomCode, code) {
  const snap = await getDocs(groupsCol(roomCode));
  const match = snap.docs.find((d) => (d.data().code || "").toUpperCase() === code.toUpperCase());
  return match ? { id: match.id, ...match.data() } : null;
}

// Auto-split every "pending" player into groups of 5-6, deal hands, create groups.
export async function autoSplitIntoGroups(roomCode, edition, driverSetting, expiresAt) {
  const playersSnap = await getDocs(query(playersCol(roomCode), where("groupId", "==", "pending")));
  const players = shuffle(playersSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
  if (players.length === 0) return [];

  const groupSize = 6;
  const groupCount = Math.max(1, Math.round(players.length / groupSize));
  const chunks = Array.from({ length: groupCount }, () => []);
  players.forEach((p, i) => chunks[i % groupCount].push(p));

  const batch = writeBatch(db);
  const groupIds = [];
  chunks.forEach((chunk, i) => {
    const gid = `auto${i}`;
    groupIds.push(gid);
    batch.set(groupRef(roomCode, gid), {
      name: `Group ${i + 1}`,
      code: groupWord(i),
      driverSetting,
      driverUid: chunk[0] ? chunk[0].id : null,
      useCaseOrder: shuffle(Array.from({ length: 18 }, (_, j) => j + 1)),
      currentRoundIndex: 0,
      currentRoundId: null,
      status: "lobby",
      createdAt: serverTimestamp(),
      expiresAt
    });
    const deck = shuffle(fullCardDeck(edition));
    chunk.forEach((p, idx) => {
      const hand = deck.filter((_, ci) => ci % chunk.length === idx);
      batch.update(playerRef(roomCode, p.id), { groupId: gid, hand });
    });
  });
  await batch.commit();
  return groupIds;
}

export async function dealHandsRoundRobin(roomCode, groupId, edition) {
  const playersSnap = await getDocs(query(playersCol(roomCode), where("groupId", "==", groupId)));
  const players = playersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  if (players.length === 0) return;
  const deck = shuffle(fullCardDeck(edition));
  const batch = writeBatch(db);
  players.forEach((p, idx) => {
    const hand = deck.filter((_, ci) => ci % players.length === idx);
    batch.update(playerRef(roomCode, p.id), { hand });
  });
  await batch.commit();
}

export async function claimDriver(roomCode, groupId, uid) {
  const snap = await getDoc(groupRef(roomCode, groupId));
  if (snap.exists() && !snap.data().driverUid) {
    await updateDoc(groupRef(roomCode, groupId), { driverUid: uid });
  }
}

export async function setGroupStatus(roomCode, groupId, status) {
  await updateDoc(groupRef(roomCode, groupId), { status });
}

// ---------- Players ----------

export async function joinSession(roomCode, uid, { name, groupCode, mode }) {
  let groupId = "main";
  if (mode === "smallGroups") {
    if (groupCode) {
      const group = await findGroupByCode(roomCode, groupCode);
      if (!group) throw new Error("That group code wasn't found. Double-check with your host.");
      groupId = group.id;
    } else {
      const existingGroups = await getDocs(groupsCol(roomCode));
      const usesCodes = existingGroups.docs.some((d) => !!d.data().code);
      if (usesCodes) throw new Error("This class is using group codes — please enter the one your host gave you.");
      groupId = "pending"; // auto-split mode: parked here until host splits
    }
  }
  const session = await getSessionOnce(roomCode);
  if (!session) throw new Error("That room code wasn't found.");

  const existing = await getDoc(playerRef(roomCode, uid));
  if (existing.exists()) {
    return { id: uid, ...existing.data() };
  }
  const data = {
    uid,
    name: (name || "Player").trim().slice(0, 40),
    groupId,
    hand: [],
    joinedAt: serverTimestamp(),
    expiresAt: session.expiresAt
  };
  await setDoc(playerRef(roomCode, uid), data);
  return { id: uid, ...data };
}

export function watchPlayer(roomCode, uid, cb) {
  return onSnapshot(playerRef(roomCode, uid), (snap) => cb(snap.exists() ? { id: snap.id, ...snap.data() } : null));
}

export function watchPlayers(roomCode, cb) {
  return onSnapshot(playersCol(roomCode), (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

// ---------- Rounds ----------

export async function advanceToNextUseCase(roomCode, groupId, expiresAt) {
  const groupSnap = await getDoc(groupRef(roomCode, groupId));
  const group = groupSnap.data();
  const idx = group.currentRoundIndex || 0;
  if (idx >= group.useCaseOrder.length) return null; // deck exhausted
  const useCaseNum = group.useCaseOrder[idx];

  const newRound = await addDoc(roundsCol(roomCode), {
    groupId,
    groupName: group.name,
    useCaseNum,
    roundIndex: idx,
    phase: "scanning", // scanning -> promoted -> voting -> decided
    flagTally: {},
    finalRisks: [],
    finalOpportunities: [],
    voteTally: { toai: 0, notoai: 0, guardrails: 0 },
    decision: null,
    guardrailText: null,
    createdAt: serverTimestamp(),
    decidedAt: null,
    expiresAt
  });

  await updateDoc(groupRef(roomCode, groupId), {
    currentRoundIndex: idx + 1,
    currentRoundId: newRound.id,
    status: "active"
  });
  return newRound.id;
}

export function watchRound(roomCode, roundId, cb) {
  if (!roundId) return () => {};
  return onSnapshot(roundRef(roomCode, roundId), (snap) => cb(snap.exists() ? { id: snap.id, ...snap.data() } : null));
}

// One-time fetch of every round played in this session (used only at
// debrief time, to compute "most flagged cards" — bounded to a handful of
// rounds per group, so this is a tiny read even for a full class).
export async function getAllRoundsOnce(roomCode) {
  const snap = await getDocs(roundsCol(roomCode));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function watchNotesLog(roomCode, cb) {
  return onSnapshot(notesLogCol(roomCode), (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

export async function toggleFlag(roomCode, roundId, uid, card, reason) {
  const key = cardKey(card);
  const fRef = flagRef(roomCode, roundId, uid);
  const rRef = roundRef(roomCode, roundId);
  await runTransaction(db, async (tx) => {
    const flagSnap = await tx.get(fRef);
    const already = flagSnap.exists() && flagSnap.data().cards && flagSnap.data().cards[key];
    const flagsMap = flagSnap.exists() ? { ...(flagSnap.data().cards || {}) } : {};
    if (already) {
      delete flagsMap[key];
      tx.update(rRef, { [`flagTally.${key}`]: increment(-1) });
    } else {
      flagsMap[key] = { reason: (reason || "").trim().slice(0, 140) };
      tx.update(rRef, { [`flagTally.${key}`]: increment(1) });
    }
    tx.set(fRef, { uid, cards: flagsMap }, { merge: false });
  });
}

export async function setFlagReason(roomCode, roundId, uid, key, reason) {
  await updateDoc(flagRef(roomCode, roundId, uid), {
    [`cards.${key}.reason`]: (reason || "").trim().slice(0, 140)
  });
}

export function watchMyFlags(roomCode, roundId, uid, cb) {
  if (!roundId) return () => {};
  return onSnapshot(flagRef(roomCode, roundId, uid), (snap) => cb(snap.exists() ? snap.data().cards || {} : {}));
}

export async function promoteCards(roomCode, roundId, finalRisks, finalOpportunities) {
  await updateDoc(roundRef(roomCode, roundId), {
    finalRisks,
    finalOpportunities,
    phase: "promoted"
  });
}

export async function openVote(roomCode, roundId) {
  await updateDoc(roundRef(roomCode, roundId), { phase: "voting" });
}

export async function castVote(roomCode, roundId, uid, decisionKey) {
  const vRef = voteRef(roomCode, roundId, uid);
  const rRef = roundRef(roomCode, roundId);
  await runTransaction(db, async (tx) => {
    const voteSnap = await tx.get(vRef);
    const prev = voteSnap.exists() ? voteSnap.data().decisionKey : null;
    if (prev === decisionKey) return;
    if (prev) tx.update(rRef, { [`voteTally.${prev}`]: increment(-1) });
    tx.update(rRef, { [`voteTally.${decisionKey}`]: increment(1) });
    tx.set(vRef, { uid, decisionKey });
  });
}

export function watchMyVote(roomCode, roundId, uid, cb) {
  if (!roundId) return () => {};
  return onSnapshot(voteRef(roomCode, roundId, uid), (snap) => cb(snap.exists() ? snap.data().decisionKey : null));
}

export async function lockDecision(roomCode, round, decisionKey, guardrailText) {
  await updateDoc(roundRef(roomCode, round.id), {
    decision: decisionKey,
    guardrailText: decisionKey === "guardrails" ? (guardrailText || "").trim().slice(0, 300) : null,
    phase: "decided",
    decidedAt: serverTimestamp()
  });
  await addDoc(notesLogCol(roomCode), {
    groupId: round.groupId,
    groupName: round.groupName,
    useCaseNum: round.useCaseNum,
    finalRisks: round.finalRisks || [],
    finalOpportunities: round.finalOpportunities || [],
    decision: decisionKey,
    guardrailText: decisionKey === "guardrails" ? (guardrailText || "").trim().slice(0, 300) : null,
    decidedAt: serverTimestamp(),
    expiresAt: round.expiresAt
  });
}
