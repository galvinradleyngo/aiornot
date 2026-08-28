# To AI or Not to AI? — digital edition

A live, multi-device version of the "To AI or Not to AI?" case-method card
game. Everyone joins on their own phone/laptop/tablet with a room code; the
app replaces the physical card table with a shared live view, and replaces
the three paper Decision Boards with a running tally. It works for a class
in one room on the same wifi, or a class split across Zoom breakout rooms.

It's a **static site** (plain HTML/CSS/JS, no build step) that talks
directly to a free **Firestore** database in the browser. There is no server
to run or maintain — GitHub Pages hosts the files, and Firestore's
realtime listeners push state to every device the instant something
changes.

This README is a reference you can come back to any time. The first setup
was done together, live, step by step — this document just writes it all
down afterward.

## Table of contents

- [How it works, in one page](#how-it-works-in-one-page)
- [Play modes](#play-modes)
- [Editions](#editions)
- [Firebase setup](#firebase-setup)
- [Firestore Security Rules explained](#firestore-security-rules-explained)
- [Data retention (2-week auto-delete)](#data-retention-2-week-auto-delete)
- [Deploying with GitHub Pages](#deploying-with-github-pages)
- [Data model](#data-model)
- [Why the Firebase SDK is vendored instead of loaded from a CDN](#why-the-firebase-sdk-is-vendored-instead-of-loaded-from-a-cdn)
- [Running it yourself / local testing](#running-it-yourself--local-testing)
- [Known limitations](#known-limitations)

## How it works, in one page

- **No accounts.** Every device that opens the site silently gets a private,
  anonymous Firebase identity in the background — no login screen, no
  password. That hidden ID is what lets the app tell "the host's device"
  apart from "a student's device" for permission purposes.
- **A session = a Firestore document tree.** When a host starts a session,
  the app creates a document at `sessions/{roomCode}` plus a handful of
  subcollections (groups, players, rounds, notes log). Every device in that
  session reads and writes those documents directly from the browser.
  Firestore's `onSnapshot` listeners push any change to everyone watching —
  that's the whole "realtime sync" mechanism, no custom server involved.
- **Firestore Security Rules are the only real "backend logic."** Since
  there's no server validating writes, `firestore.rules` (in this repo)
  enforces things like "only the host device can advance the round" and "a
  player can only edit their own hand." See the
  [rules walkthrough](#firestore-security-rules-explained) below.
- **Everything expires after 14 days.** No manual cleanup needed — see
  [Data retention](#data-retention-2-week-auto-delete).

## Play modes

Pick a mode when you set up a session (`hostSetup` screen). Both modes
share the same round loop: reveal a Use Case → students flag relevant
Risk/Opportunity cards from their own hand → the controller promotes the
final 2–3 of each → the group votes → the controller locks in TO AI / NOT
TO AI / TO AI — WITH GUARDRAILS (+ guardrail text) → advance.

- **Whole Class** — one shared session. Every joined student is dealt a
  few cards (round-robin — it's fine and expected for the same card to end
  up in more than one hand with a big class). The whole class flags cards,
  watches one shared live tally, and votes together. The teacher is the
  Host and is the only one who can advance rounds.
- **Small Groups** — the class is split into groups of 5–6, each running
  its own independent game (own hands, own shuffled Use Case order, own
  Decision Board tallies) at its own pace. You choose:
  - **Auto-split** — everyone joins one room code; you tap "Split into
    groups" once everyone's in. Good for an in-person class.
  - **Pre-generated codes** — you get one code per group *before* class
    (e.g. "Group 3 = code DELTA") to read out when assigning Zoom breakout
    rooms.

  Within a group, you also choose who can drive the round forward:
  - **Free-for-all** — anyone in the group can advance rounds (good for an
    in-person cluster sharing one table).
  - **One driver** — only the first student to join each group can advance
    rounds and lock decisions (reduces conflicting taps in an online
    breakout room).

  The teacher, in Small Groups mode, sees a live dashboard of every group's
  progress instead of playing a round themselves, plus a cross-group
  compare table at the end showing where groups agreed or split.

## Editions

Leadership, Teacher, and Student editions are baked into `js/data.js` as
static data — all Use Case, Risk, and Opportunity card text from the
physical game, verbatim. The 3 Decision cards (TO AI / NOT TO AI / TO AI —
WITH GUARDRAILS) are shared across editions. There's no in-app content
editor by design — to change card text, edit `js/data.js` directly.

## Firebase setup

You only need to do this once. Everything here was walked through live in
chat when this was first set up — this section is the reference copy.

### 1. Create a Firebase project

1. Go to **console.firebase.google.com** and sign in with your Google
   account.
2. Click **"Create a project"** (or **"Add project"**).
3. Give it a name (e.g. `to-ai-or-not-to-ai`) and click **Continue**.
4. When asked about Google Analytics, you can turn the toggle **off** —
   this app doesn't need it — then click **Create project**.
5. Wait for the "Your new project is ready" screen, then click
   **Continue**.

### 2. Register a Web app and get your config

1. On the project's home/overview page, click the **`</>`** ("Web") icon
   to add a web app.
2. Give the app a nickname (e.g. `to-ai-web`) — you can leave "Also set up
   Firebase Hosting" **unchecked** (we're using GitHub Pages instead).
3. Click **Register app**.
4. Firebase shows a code snippet with a `firebaseConfig = { ... }` object.
   Copy the object's contents (the `apiKey`, `authDomain`, `projectId`,
   `storageBucket`, `messagingSenderId`, `appId` values).
5. Paste those values into **`js/firebase-config.js`** in this repo,
   replacing the placeholder strings. This file is safe to commit — it
   identifies your project publicly, like a public account name; it is
   **not** a secret. Real protection comes from the Security Rules below.
6. Click **Continue to console**.

### 3. Turn on Firestore

1. In the left sidebar, click **Build → Firestore Database**.
2. Click **Create database**.
3. Choose a location close to you (any region works) and click **Next**.
4. Choose **Start in production mode** (we'll paste in our own rules next)
   and click **Create**.

### 4. Turn on Anonymous sign-in

This is what gives every device a private ID with **no login screen** —
it's what makes "no accounts" and "only the host can advance the round"
both true at once.

1. In the left sidebar, click **Build → Authentication**.
2. Click **Get started** (first time) then go to the **Sign-in method**
   tab.
3. Click **Anonymous** in the provider list.
4. Toggle **Enable**, then click **Save**.

### 5. Paste in the Security Rules

1. Back in **Build → Firestore Database**, click the **Rules** tab.
2. Select all the existing text in the editor and delete it.
3. Open **`firestore.rules`** in this repo, copy its entire contents, and
   paste them into the console editor.
4. Click **Publish**.

See [Firestore Security Rules explained](#firestore-security-rules-explained)
below for what each part actually prevents.

### 6. Configure the 14-day auto-delete (TTL) policy

1. Still in **Firestore Database**, click the **TTL** tab (it may be under
   a "..." / additional-tabs menu depending on the console layout).
2. Click **Create policy** (or **Add policy**).
3. You'll be asked for a **collection group ID** and a **timestamp field**.
   The timestamp field is always `expiresAt`. Add one policy per collection
   group listed below (the console lets you add multiple):
   - `sessions` → field `expiresAt`
   - `groups` → field `expiresAt`
   - `players` → field `expiresAt`
   - `rounds` → field `expiresAt`
   - `playerFlags` → field `expiresAt`
   - `playerVotes` → field `expiresAt`
   - `notesLog` → field `expiresAt`
4. Click **Create** / **Save** for each.

Every document this app writes already has an `expiresAt` field set to
"created at + 14 days" (computed once when the session starts, and copied
onto every document created under it, so the whole session tree expires
together). Once `expiresAt` passes, Firestore deletes that document
automatically in the background — Google's docs describe this as typically
happening within about 24 hours of expiry, not the exact instant it
passes. Each of those deletions still counts against the free daily delete
quota, but at classroom volume (a few hundred documents per session) this
is a non-issue.

You're done with Firebase. The remaining steps are in GitHub.

## Firestore Security Rules explained

`firestore.rules` in this repo is the only real "backend logic" in this
app — since there's no server, these rules are what stop someone who
knows a room code from writing arbitrary data. Every device is signed in
anonymously (see step 4 above), so `request.auth.uid` is a private,
per-device ID rules can check against. Here's what each part does, in
plain English:

| Rule | What it prevents |
|---|---|
| `sessions/{roomCode}`: `list` is always denied, only direct `get` by ID is allowed | Nobody can browse/enumerate every session in the database — you can only read a session if you already know its exact room code. |
| `sessions/{roomCode}`: only the creator's `uid` (`hostUid`) can update/delete it | A student can't end the session, change its edition, or delete it. |
| `groups/{groupId}`: only the host can create/delete groups | A student can't spin up fake groups or remove real ones. |
| `groups/{groupId}`: updates require being the host, the group's assigned "driver," or (if the host chose Free-for-all) any player who has joined that session | Advancing a round, claiming the driver seat, or changing group status is restricted to whoever the host said should control pacing — not any random visitor. |
| `players/{uid}`: a player can only `create`/be the doc for their **own** `uid` | Nobody can create or impersonate another student's player record. |
| `players/{uid}`: updates allowed by that player OR the host | Lets a student manage their own doc, and lets the host deal/redeal hands and run auto-split (which reassigns students into groups). |
| `rounds/{roundId}`: full-document writes (revealing a use case, promoting cards, locking a decision) require the same host/driver/free-for-all check as groups | A student can't skip to a different use case or fake a decision. |
| `rounds/{roundId}`: **any** signed-in member of the session may update *only* the `flagTally` / `voteTally` fields | This is what lets every student's tap update the shared live board immediately, without funnelling every flag/vote through the host (which would be slow and defeat the point of "everyone's cards are visible"). It's a deliberate, low-stakes trade-off: a student could theoretically nudge another group's tally by a count, which isn't worth defending against in an ungraded classroom tool — the things that actually matter (who can end a session, whose name is on which hand, who can lock a decision) are still fully locked down. |
| `playerFlags/{uid}` / `playerVotes/{uid}`: only that `uid` can write their own | A student can only flag/vote as themselves, and the app can tell whether *they specifically* already flagged a card (to toggle it) or already voted (to change their vote instead of double-counting it). |
| `notesLog/{entryId}`: create-only, no update, delete only by host | The notes log is an append-only record of what actually happened — nobody can rewrite history once a decision is logged. |

## Data retention (2-week auto-delete)

Covered in [Firebase setup, step 6](#6-configure-the-14-day-auto-delete-ttl-policy)
above. Short version: every document gets an `expiresAt` timestamp 14 days
out from when its session was created, a Firestore TTL policy watches that
field on every relevant collection, and Firestore deletes expired
documents automatically — no cron job, no Cloud Function, no manual
cleanup, and it works fully on the free Spark plan.

## Deploying with GitHub Pages

1. On GitHub, go to this repository's **Settings** tab (top row of tabs on
   the repo page).
2. In the left sidebar, click **Pages**.
3. Under **Build and deployment → Source**, choose **Deploy from a
   branch**.
4. Under **Branch**, choose the branch this app lives on (the one this PR
   merges into, typically `main`) and folder **`/ (root)`**, then click
   **Save**.
5. GitHub shows a banner "Your site is live at `https://<your-username>.github.io/<repo-name>/`"
   after a minute or two — that URL is what you share with your class,
   the same way you'd share a Kahoot link.

Any time you push new changes to that branch, GitHub Pages redeploys
automatically within a minute or two.

## Data model

Everything lives under `sessions/{roomCode}`:

```
sessions/{roomCode}                      one per session (hostUid, edition, mode,
                                          driverSetting, roundTimerMinutes, status,
                                          createdAt, expiresAt)
  groups/{groupId}                       "main" in Whole Class mode; one per group
                                          in Small Groups mode (name, code, driverSetting,
                                          driverUid, useCaseOrder, currentRoundIndex,
                                          currentRoundId, status, expiresAt)
  players/{uid}                          one per joined device, keyed by its anonymous
                                          uid (name, groupId, hand[], joinedAt, expiresAt)
  rounds/{roundId}                       one per use case played, in any group
                                          (groupId, useCaseNum, phase, flagTally{},
                                          finalRisks[], finalOpportunities[], voteTally{},
                                          decision, guardrailText, expiresAt)
    playerFlags/{uid}                    which cards this player flagged + why
    playerVotes/{uid}                    this player's current vote
  notesLog/{entryId}                     one per locked-in decision — the permanent,
                                          append-only debrief record
```

All Firestore queries in `js/db.js` use plain equality filters with
in-memory sorting afterward (never `orderBy` combined with `where` on a
different field) — this means you'll never be prompted to create a
composite index in the Firebase console.

Live tallies (the shared flagged-cards board, the live vote bars) read
from the single `flagTally` / `voteTally` map fields on the round document
via one `onSnapshot` listener — not from every individual player's
document — which is what keeps a big class comfortably inside the free
tier's daily read quota (see the project brief's free-tier note).

## Why the Firebase SDK is vendored instead of loaded from a CDN

Most Firebase tutorials have you load the SDK straight from
`https://www.gstatic.com/firebasejs/...` in a `<script type="module">` tag.
This app instead ships a single pre-bundled file at
`js/vendor/firebase-bundle.js` (built once from the official `firebase` npm
package with esbuild) and imports from that local file instead.

Functionally it's the identical, official SDK — just packaged differently.
The reason: some school and campus networks filter or block Google's CDN
domains, which would otherwise break the game mid-class for no reason a
teacher could diagnose. Vendoring it removes that runtime dependency
entirely; the only thing your browser talks to while playing is your own
Firestore project. There's nothing you need to do to maintain this file —
treat it like any other file in the repo.

## Running it yourself / local testing

Because this is a plain static site, you can preview it locally with any
static file server, e.g. from this folder:

```
python3 -m http.server 8080
```

then open `http://localhost:8080/`. You'll still need a real Firebase
project wired up in `js/firebase-config.js` for anything beyond the
landing page to work, since the app talks to Firestore directly.

## Known limitations

- If the sole "driver" in a One-Driver small group closes their tab and
  never comes back, nobody else in that group can advance the round. If
  that happens mid-class, easiest fix: have that student rejoin (their
  browser remembers their identity automatically), or switch that one
  group's dynamic by having the teacher/host informally hand a phone to
  another student in the room.
- The live flag/vote tallies are intentionally writable by any signed-in
  session member (see the Security Rules table above) — a deliberate
  trade-off for responsiveness in a low-stakes classroom tool, not a
  security gap worth closing here.
- There's no in-app editor for card text — it's static data in
  `js/data.js` by design (see the project brief's "explicitly out of
  scope" list).
