// Paste the config object Firebase gives you when you register a "Web app" in
// your Firebase project settings. See README.md, section "Firebase setup",
// step "Get your config keys" for exactly where this comes from.
//
// This is safe to commit to a public repo: it identifies your Firebase
// project (like a public account name), it is not a secret. Real write
// protection comes from Firestore Security Rules (see firestore.rules),
// not from hiding this file.

export const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY_HERE",
  authDomain: "PASTE_YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "PASTE_YOUR_PROJECT_ID",
  storageBucket: "PASTE_YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "PASTE_YOUR_SENDER_ID",
  appId: "PASTE_YOUR_APP_ID"
};
