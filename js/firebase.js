// Firebase app initialization: Firestore + silent anonymous auth.
// Anonymous auth gives every device a stable, private uid with NO login
// screen and NO password — it's what lets Firestore Security Rules tell
// devices apart (e.g. "only the host's device may advance the round")
// without this app needing accounts.

// js/vendor/firebase-bundle.js is the Firebase Web SDK (app + firestore +
// auth), bundled once into a single static file instead of loaded from
// Google's gstatic.com CDN at runtime. Same SDK, same official package —
// vendoring it just means the game still works on school networks that
// block Google's CDN domains, with no extra step for you. See README.md,
// "Why the Firebase SDK is vendored instead of loaded from a CDN".
import { firebaseConfig } from "./firebase-config.js";
import { initializeApp, getFirestore, getAuth, signInAnonymously, onAuthStateChanged } from "./vendor/firebase-bundle.js";

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

let readyResolve;
export const authReady = new Promise((resolve) => (readyResolve = resolve));

onAuthStateChanged(auth, (user) => {
  if (user) readyResolve(user.uid);
});

signInAnonymously(auth).catch((err) => {
  console.error("Anonymous sign-in failed", err);
  const el = document.getElementById("global-error");
  if (el) {
    el.hidden = false;
    el.textContent =
      "Could not connect to Firebase. Check that Anonymous sign-in is enabled and your firebase-config.js is filled in correctly.";
  }
});

export function getUid() {
  return auth.currentUser ? auth.currentUser.uid : null;
}
