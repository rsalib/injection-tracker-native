# Injection Tracker (Native) — React Native for Web Migration

## Session Workflow

**Always update CLAUDE.md before git commits.** When a step or fix is complete, update CLAUDE.md first to document what changed, then the user runs `git add` / `commit` / `push` in Terminal.

## Migration Context
This is a fresh project migrating the production app at `/Users/rsalib/Desktop/injection-tracker-v2` from a Vite + React web app to React Native for Web. Same Firebase backend (project `injection-tracker-6341d`), same data, same users. The current v2 app stays live during the migration. This project will eventually replace it on `injectiontracker.web.app` and serve as the foundation for native iOS/Android builds via Metro.

**Stack:**
- React 19 + React Native for Web
- Vite 8 + Rolldown
- Same Firebase backend as v2
- Component layer rewritten using React Native primitives (View, Text, TouchableOpacity, etc.)
- Service layer copied verbatim from v2 (firebase.js, gemini.js, mathEngine.js)

## What This App Is
A private clinical companion app for tracking peptide and hormone injection protocols. Features include medication management, dose logging, vial inventory tracking, blended stack math, titration schedules, drug interaction checking via Gemini AI, a resources tab pulling from PubMed and FDA APIs, and a live calendar subscription feed.

## Current State
- **Live URL:** https://injectiontracker.web.app
- **GitHub:** github.com/rsalib/injection-tracker-native (private)
- **Firebase project:** injection-tracker-6341d
- **Gemini model:** `gemini-2.5-flash` (see Gemini Model History below)

---

## Architecture

### Migration from Legacy
Migrated from a single-file `index.html` (plain HTML + CDN React + Babel) at `/Users/rsalib/injection-tracker/public/index.html` to a modern Vite + React project. The old file was left untouched as a reference.

### Modular File Structure

```
src/
  services/
    firebase.js         # copied from v2 (modular SDK)
    gemini.js           # copied from v2
  mathEngine.js         # copied from v2
  constants.js          # data + helpers (no JSX, no web CSS)
  styles.js             # shared StyleSheet constants (populated as needed)
  components/
    ui/
      Badge.jsx             # fully implemented
      SortBar.jsx           # fully implemented
      TabIcons.jsx          # 6 SVG tab icons (DashboardIcon … AIIcon)
      SyringeVisualizer.jsx # fully implemented
      SearchDropdown.jsx    # fully implemented
      ConfirmDialog.jsx     # fully implemented
      PromptDialog.jsx      # fully implemented
      Modal.jsx             # fully implemented
      ToastHost.jsx         # fully implemented
      ErrorBoundary.jsx     # fully implemented
    modals/
      AddMedModal.jsx       # fully implemented (exports MedForm)
      EditMedModal.jsx      # fully implemented (imports MedForm)
      TitrationModal.jsx    # fully implemented
      QueueVialModal.jsx    # fully implemented
      LogFormModal.jsx      # fully implemented
      AddScheduleModal.jsx  # fully implemented
    tabs/
      Calculator.jsx        # fully implemented
      Dashboard.jsx         # fully implemented
      MedsTab.jsx           # fully implemented
      LogTab.jsx            # fully implemented
      ResourcesTab.jsx      # fully implemented
      AIAssistant.jsx       # fully implemented
  SiteRotation.jsx          # stub — implement in Step 6
  LoginScreen.jsx           # fully implemented
  App.jsx                   # shell + navigation (data layer wiring in Step 6)
  main.jsx                  # entry point
index.html
vite.config.js              # aliases react-native → react-native-web
```

---

## Features Added Post-Migration

> **Note:** All features below are inherited from v2 and need re-verification when their corresponding components are migrated to React Native primitives.

### Live Calendar Subscription (Log Tab → Export)
- **Subscribe to Calendar** button copies a private URL to clipboard
- URL format: `https://getcalendarfeed-pl4s2cxu2a-uc.a.run.app?uid=...&token=...`
- Token is generated once per user and stored in Firebase at `users/{uid}/calendarToken`
- Feed is a live `.ics` file generated from active meds — calculates end date from vial remaining, dose, and schedule. Archived meds are excluded. Queued next vials extend the event count.
- Calendar apps (Apple Calendar, Google Calendar, Outlook) can subscribe to the URL and auto-refresh every 6 hours
- Two Cloud Functions power this: `getCalendarToken` (Firebase Auth protected) and `getCalendarFeed` (token protected)

### Lighthouse Performance & Accessibility Improvements (May 2026)
Audited with Lighthouse and improved scores from Performance 85 / Accessibility 72 / Best Practices 96 / SEO 82 to Performance 95 / Accessibility 94 / Best Practices 96 / SEO 91 (desktop).

Changes made:

- **Code splitting (`src/App.jsx`):** All 6 tab components converted to `React.lazy()` with `<Suspense>` dark fallback (`#121212`). Prefetch `useEffect` fires on mount to silently load all chunks before the user switches tabs.
- **Cache-first hydration (`src/App.jsx`):** `load()` now hydrates meds/logs/schedule from localStorage before the Firebase `await`, so the UI is never blank on cold start.
- **CLS fix (`src/components/tabs/Dashboard.jsx`):** Badge row div given conditional `minHeight` of 30 when no badges are showing, preventing layout shift during data load.
- **Same-day cache invalidation (`src/services/firebase.js`):** `isCacheFresh` now checks that the cache was written on the same calendar day (local time). Fixes stale schedule data on new-day open.
- **Meta description (`index.html`):** Added for SEO.
- **Accessibility (`src/App.jsx`, `src/components/ui/SortBar.jsx`):** Nav buttons given `aria-label`, content wrapped in `<main>` landmark, sort button contrast improved from `#9ca3af` to `#b0b8c4`.
- **`CACHE_VERSION` bumped to `v7` (`public/sw.js`).**
- Mobile performance (68) remains lower due to Firebase compat SDK size — modular SDK migration considered and deferred as insufficient ROI for a private app.

### Modular Firebase SDK Migration (May 2026)
Migrated from Firebase compat SDK (v8 style) to modular SDK (v9+) for tree-shaking, future-proofing, and bundle size reduction.

- Bundle reduced from 326 KB to 242 KB gzipped (84 KB / 26% savings)
- **`src/services/firebase.js`** — replaced all compat imports with modular: `initializeApp`, `getAuth`, `getDatabase`, `ref`, `get`, `set`, `update`, `onValue`. All `db.ref().get/set/update` calls updated to modular syntax.
- **`src/LoginScreen.jsx`** — `firebase.auth.GoogleAuthProvider` → `GoogleAuthProvider`; `auth.signInWithPopup/Redirect` → `signInWithPopup/Redirect(auth, provider)`
- **`src/App.jsx`** — `auth.getRedirectResult/onAuthStateChanged/signOut` → modular equivalents imported directly from `firebase/auth`
- `CACHE_VERSION` bumped to `v8`
- **Why:** Compat layer is a temporary bridge scheduled for deprecation. Modular SDK is required for all new Firebase features going forward. Migration was low-risk given all Firebase usage is contained in one file (`firebase.js`) plus two call sites (`LoginScreen.jsx`, `App.jsx`).
- **Lighthouse impact:** Mobile Best Practices 77 → 100, Performance 68 → 77, CLS 0.477 → 0.003.

### Firebase App Check (May 2026)
Added Firebase App Check with reCAPTCHA v3 to prevent unauthorized access to RTDB and Cloud Functions from outside the app.

Changes made:
- **`src/services/firebase.js`:** Added `initializeAppCheck` with `ReCaptchaV3Provider`. The return value is exported as `appCheck` for use by other modules.
- **`src/services/gemini.js`:** Imports `appCheck` from `firebase.js` and `getToken` from `firebase/app-check`. Both `callGemini()` and `callGeminiChat()` now fetch the App Check token in parallel with the auth token and send it as `X-Firebase-AppCheck` header.
- **`src/components/tabs/LogTab.jsx`:** Same pattern applied to the `getCalendarToken` Cloud Function fetch call.
- **`functions/index.js`:** `askGemini` and `getCalendarToken` functions now verify the App Check token if present. `getCalendarFeed` is excluded as it uses its own calendar token protection.
- reCAPTCHA v3 site key: `6LcF3-gsAAAAAHbr7DkcvqGLvyf4Yz5WZs1EOXJi`
- Enforcement is in monitoring mode — turn on full enforcement in Firebase Console → App Check once traffic is confirmed healthy.
- Note: `getAppCheck` is not exported by firebase v12's app-check package. Use the exported `appCheck` instance from `firebase.js` directly.

### Per-Record Log Writes & Atomic Vial Transactions (May 2026)
Migrated logs from a single JSON array to individual RTDB nodes keyed by log ID. Added atomic transactions for vial deductions to prevent collision between two devices logging simultaneously.

**Schema change:**
- Old: `users/{uid}/logs` = one JSON array
- New: `users/{uid}/logs/{logId}` = each log its own node

**Migration:** On first app load after this update, if `fbGet("logs")` returns an array (old format), each entry is automatically written as its own node. No manual migration needed.

**Changes made:**
- **`src/services/firebase.js`:** Added `runTransaction` to database imports. Added `fbDelete(path)` helper for removing individual nodes. Added `fbTransaction(path, updateFn)` helper wrapping Firebase `runTransaction`.
- **`src/App.jsx`:**
  - `syncAllPending()` skips the bare `pending_logs` key — individual log nodes are managed directly
  - `load()` detects old array format and migrates on first open
  - `processAutoLogs()` writes only new entries as individual nodes
  - Minute-check interval writes only new entries as individual nodes
  - `updateMed()` writes each log individually when med name changes
  - `logDose()` writes new log as single node; vial deduction wrapped in `fbTransaction` for atomic collision-safe decrement
  - `updateLog()` writes single updated node
  - `delLog()` calls `fbDelete` on the specific log node
  - `importBackup()` writes each restored log as its own node

**Key behavior:** Two devices logging simultaneously can no longer overwrite each other's vial remaining amount — `runTransaction` reads and writes server-side atomically.

**Refactor (May 2026):** Extracted per-record log path construction into two named helpers in `firebase.js` following the existing `fbGet`/`fbSet`/`fbDelete` pattern:
- `fbSetLog(log)` — writes a single log entry to `logs/{log.id}`
- `fbDeleteLog(logId)` — deletes a single log entry at `logs/{logId}`

All 8 call sites in `App.jsx` updated to use these helpers. No behavior change.

### PWA Overscroll & Fixed Header (May 2026)
Fixed iOS PWA bounce/overscroll showing white space at the top and bottom, and header scrolling away on overscroll.

Changes made:
- **`src/index.css`:** Added `html, body` rule setting `background: #111827`, `overscroll-behavior: none`, and `height: 100%` so bounce zones match the app's dark background and rubber-band scrolling is disabled.
- **`src/App.jsx`:**
  - Outermost div given `paddingTop: "env(safe-area-inset-top)"` for iOS status bar
  - Header changed from `position: sticky` to `position: fixed` with `left: 0, right: 0` so it never moves with scroll. Padding uses `max(16px, env(safe-area-inset-top))` to respect the notch.
  - `<main>` given `paddingTop: 140` to prevent content hiding behind the fixed header
  - Bottom nav changed from `bottom: 24` to `bottom: 0` with `paddingBottom: "max(24px, env(safe-area-inset-bottom))"` to respect the iPhone home indicator

---

## Cloud Functions
All three functions are in `functions/index.js`:

1. **`askGemini`** — Proxies all Gemini API calls (interactions, AI assistant, resources). Requires Firebase Auth ID token. Gemini API key in Firebase Secrets Manager.
2. **`getCalendarToken`** — Requires Firebase Auth ID token. Generates or returns a persistent calendar token stored in Firebase.
3. **`getCalendarFeed`** — Public endpoint protected by calendar token (`?uid=&token=`). Returns live `.ics` feed from user's meds.

**Cloud Run URLs (hardcoded in `src/services/gemini.js` and `src/components/tabs/LogTab.jsx`):**
- `https://askgemini-pl4s2cxu2a-uc.a.run.app`
- `https://getcalendartoken-pl4s2cxu2a-uc.a.run.app`
- `https://getcalendarfeed-pl4s2cxu2a-uc.a.run.app`

---

## Gemini Model History
- Started with `gemini-3.1-flash-lite` (legacy) — worked but preview
- Attempted `gemini-3.0-flash` — returns 404 from API even though GA. The `@google/generative-ai` SDK v0.24.1 (latest as of May 2026) does not support this model ID. The product name does not match the API ID.
- Attempted `gemini-2.0-flash` — works but older
- **Current: `gemini-2.5-flash`** — GA, stable, works correctly
- Switch to `gemini-3.0-flash` when Google updates the SDK to support it

---

## PWA & Service Worker
- Installed on home screen on iOS and Android via `manifest.json`
- `sw.js` strategy: cache-first for Vite hashed `/assets/*` bundles, network-first for `index.html`
- Never intercepts: Firebase, Gemini, Google Auth, FDA, PubMed, Cloud Run
- Auth redirect bypass: checks for `/__/auth/`, `apiKey`, `access_token`, `id_token`, `code`, `state` in URL to avoid intercepting Firebase Auth redirects
- Bump `CACHE_VERSION` in `sw.js` on each deploy to force cache invalidation
- Current version: `v10`

---

## What We Chose NOT To Do (And Why)

### Lazy Loading / Code Splitting
~~Against `React.lazy` + `Suspense`.~~ **Implemented (2026-05-13).** Tab components (Dashboard, LogTab, MedsTab, Calculator, ResourcesTab, AIAssistant) converted to `React.lazy()` in `App.jsx`, wrapped in `<Suspense>` with a dark `#121212` fallback. A prefetch `useEffect` fires on mount to silently load all chunks in the background, so tabs are ready before the user navigates — no visible spinners in practice. Main bundle reduced; each tab is a separate chunk.

### Native App (React Native / Expo)
Considered but deferred. iOS requires $99/year Apple Developer account for any permanent install. The PWA already covers the core use case. The modular codebase is Expo-ready if this decision changes — `mathEngine.js`, `services/gemini.js`, and all business logic would transfer unchanged. Only the UI layer would need rewriting.

### Web Push Notifications
Deferred in favor of the calendar subscription feature. Calendar subscriptions integrate with the native calendar app and provide injection reminders through the system — achieving the same goal without implementing a push notification backend.

---

## Key Technical Details

### fbGet / fbSet Pattern
Cache-first with Firebase background sync. localStorage is read first for instant UI, Firebase synced in background. Pending writes tracked with `pending_` prefix keys, synced via `syncAllPending` on login.

### Circuit Breaker
`MAX_FIREBASE_CALLS = 100` per session in sessionStorage. If tripped, Firebase calls are blocked. `circuit_tripped` window event notifies the UI.

### isCacheFresh (`src/services/firebase.js`)
Returns `true` only if the cached value is both within the 60-second TTL **and** was written on the same calendar day (local time). Prevents stale data from the prior day being served as fresh on a new-day app open.

### Math Engine
- `toMg(val, unit)` — converts mcg or mg to mg
- `fromMg(mg, unit)` — reverse
- `convertToVialUnit(dose, doseUnit, vialUnit)` — converts dose to vial unit for deduction
- `calculateProportionateStack(...)` — blended vial math for stacked peptides

### Brand / Design
- Icon is a glass peptide vial with colorful swirling liquid (`icon.png`) — core to the brand identity. Never replace with a syringe or generic icon.
- Color scheme: dark background, cyan (`#22d3ee`) as primary accent
- Primary action buttons use `linear-gradient(135deg, #0e7490 0%, #22d3ee 100%)`
- **Styling in this project:** All component styles are React Native `StyleSheet` objects, not inline CSS or web style objects. The web CSS constants (`inpStyle`, `labelStyle`, `wellStyle`) from v2 are not carried over — equivalents will be defined in `src/styles.js` as components are migrated.

### GitHub
Preferred workflow is **GitHub Desktop** (visual, no command line). User does not want to use git CLI commands.

---

## Environment Notes
- **Real project:** `/Users/rsalib/Desktop/injection-tracker-native` (this folder)
- **Reference project:** `/Users/rsalib/Desktop/injection-tracker-v2` (current production, read-only for migration purposes)

---

## Design Rules

Standing constraints that apply to all current and future work in this project:

- **🤖 banned everywhere** — the robot emoji must never appear anywhere in the codebase, with no exceptions.
- **All other v2 emojis preserved as-is** — do not add or remove any emoji that v2 uses. This includes status badges, alert headers, button labels, ICS fields, greeting text, etc.
- **Tab navigation icons are SVG only** — sourced from `src/components/ui/TabIcons.jsx`, never emoji.
- **All inline styles hoisted to `StyleSheet.create({})`** — inline styles permitted only for truly dynamic values (e.g. `{ width: \`${pct}%\` }`, `{ color: c }`).
- **Color fidelity** — match v2 exactly: dark bg `#111827`, cyan accent `#22d3ee`, primary button solid fallback `#0e7490` (gradient `linear-gradient(135deg, #0e7490 0%, #22d3ee 100%)` is a TODO until `expo-linear-gradient` is added for native builds).
- **Content width** — `maxWidth: 672` with `paddingHorizontal: 16` inside the same container. This matches v2's border-box math: `padding: 16 + maxWidth: 672` on the same element = 640px content area.
- **`<select>`, `<svg>`, `<a>` kept as raw HTML** — these DOM elements work in RN-for-Web and should not be replaced with RN primitives unless a specific native-build requirement demands it.

---

## Migration Plan

### Completed
- Step 1: Project scaffolding (Vite + React 19 + React Native for Web)
- Step 2: Service layer copied (firebase, gemini, mathEngine, constants)
- Step 3: Auth flow + Calculator tab + core UI components
- Step 4: App shell — header, 6-tab navigation
- Step 5: All five remaining tab components migrated to RN primitives
- Step 6: Modals + full business logic wiring
- Step 7: PWA shell — manifest.json, sw.js, firebase.json, SW registration

### Completed Steps Detail

**Step 3 — Auth flow, Calculator, core UI components**
- `LoginScreen.jsx` migrated to RN primitives; vial `icon.png` (from `/public/`) used as the brand image replacing the emoji placeholder.
- `Calculator.jsx` migrated — lowest-complexity tab, no Firebase writes, chosen first.
- `SyringeVisualizer.jsx` and `SearchDropdown.jsx` migrated to RN primitives.
- Content container established in `App.jsx`: `maxWidth: 672`, `paddingHorizontal: 16` on the same `appContainer` View, matching v2's border-box width exactly (640px content).

**Step 4 — App shell**
- Full header bar: title (`{firstName} TRACKER`), sync status dot, logout button, and three action buttons (Sync, Backup, Restore) in `App.jsx`.
- 6-tab bottom navigation capsule with SVG icons.
- SVG tab icons extracted verbatim from v2's `constants.jsx` into `src/components/ui/TabIcons.jsx` (6 named exports: `DashboardIcon`, `LogIcon`, `MedsIcon`, `CalcIcon`, `ResourcesIcon`, `AIIcon`).
- Icons referenced via `iconKey` string on each `NAV_TABS` entry in `constants.js`; resolved at render time via a `TAB_ICONS` lookup map in `App.jsx` (defined outside the component, no re-creation per render).
- `color` style on `Pressable` passes through to the DOM div, enabling SVG `stroke="currentColor"` / `fill="currentColor"` inheritance — active tab cyan `#22d3ee`, inactive `#9ca3af`.
- Active tab pill: `flex: 1.2`, `backgroundColor: rgba(34,211,238,0.1)`.
- Shared UI components built: `Badge.jsx`, `SortBar.jsx`; stubs created for `ConfirmDialog.jsx`, `PromptDialog.jsx`, `Modal.jsx`, `SiteRotation.jsx`.

**Step 5 — Five tab components**
- `Dashboard.jsx`, `MedsTab.jsx`, `LogTab.jsx`, `ResourcesTab.jsx`, `AIAssistant.jsx` all migrated from v2's HTML/CSS to RN primitives.
- All inline `div`/`button`/`p`/`span` replaced with `View`/`Pressable`/`Text`; all `input[type=text]` replaced with `TextInput`.
- `<select>`, `<svg>`, and `<a>` kept as raw HTML — they work in RN-for-Web and have no RN-native equivalent yet.
- All styles moved into `StyleSheet.create({})` at the bottom of each file; inline styles used only for dynamic values.
- `display: grid; grid-template-columns: repeat(N, 1fr)` layouts replaced with `flexDirection: 'row'` + `flex: 1` children.
- `borderBottom` conditionals replaced with `[styles.item, !isLast && styles.itemBorder]` array syntax.
- Gradient buttons use `backgroundColor: '#0e7490'` with a `// TODO: expo-linear-gradient` comment.
- All emojis from v2 preserved as-is (per Design Rules above); 🤖 was confirmed absent from v2.
- Pixel-perfect tuning deferred to Step 9 QA pass.
- All 5 tabs wired into `App.jsx` with empty-state props; data layer wiring is Step 6.

**Step 6a — UI Primitives**
- `Modal.jsx` — overlay as raw `<div>` (`position: fixed`) with focus trap, Escape key handler, click-outside-to-close, and `popIn` keyframe animation injected via `<style>` tag. Focus trap uses DOM APIs (`querySelector`, `activeElement`) — will need `react-native-modal` port for native builds.
- `ConfirmDialog.jsx` — no click-outside-to-close (deliberate, matches v2). Accepts dynamic `confirmBg`/`confirmColor` props for context-sensitive button styling.
- `PromptDialog.jsx` — `TextInput` with `autoFocus` + `onSubmitEditing`. `keyboardType="numeric"` for number prompts.
- `ToastHost.jsx` — `position: fixed` raw `<div>`, exposes `window.showToast` global. CSS `animation:` on raw `<div>` elements (exempt from RN StyleSheet rules).
- `ErrorBoundary.jsx` — class component, pure RN primitives. `handleEmergencyReset` clears `localStorage`/`sessionStorage` and calls `window.location.reload()`.
- `App.jsx` updated: `ErrorBoundary` wraps root output; `ToastHost` mounted at root level.

**Step 6b — Modals**
- All 6 modals created: `AddMedModal` (exports reusable `MedForm`), `EditMedModal` (imports `MedForm` from `AddMedModal.jsx`), `TitrationModal`, `QueueVialModal`, `LogFormModal`, `AddScheduleModal`.
- `<select>`, `<input type="date">`, `<input type="time">` kept as raw HTML. Standalone number inputs use `TextInput keyboardType="numeric"`.
- Style fixes applied across all files: `animation:` → `animationKeyframes:` in all `StyleSheet` entries; `background:` shorthand → `backgroundColor:` throughout (raw HTML inline styles remain exempt).

**Step 6c — Business Logic**
- Full `App.jsx` state, refs, handlers, and effects ported from v2.
- Auto-logger reads from `stateRef.current` inside the 60s interval to avoid stale closure state — **this pattern must be preserved in any future edits to the interval**.
- `logDose` uses `fbTransaction` for atomic vial deduction (collision-safe across multiple devices).
- Restore button implemented as raw `<label>` + `<input type="file">` (no RN equivalent exists).
- All 6 tabs wired with real props matching v2 prop signatures exactly. All 6 modals wired with open/close state and callbacks.
- Build: **212 KB gzipped, clean.**

**Step 7 — PWA Shell**
- `manifest.json` — copied verbatim from v2. Name, short_name, start_url, display, background_color, theme_color, and icon path all correct for native project structure.
- `sw.js` — copied from v2, `CACHE_VERSION` reset to `v1` (fresh start; no stale v2 cache keys to inherit). Never-intercept list covers Firebase, Gemini, Google Auth, FDA, PubMed, and all `run.app` Cloud Run URLs.
- `firebase.json` — hosting block only. Functions block omitted — Cloud Functions stay deployed from v2; `firebase deploy --only hosting` will not touch functions.
- `.firebaserc` — copied verbatim. Same Firebase project `injection-tracker-6341d`.
- `index.html` updated: added `<meta name="theme-color" content="#111827">`, `<link rel="manifest" href="/manifest.json">`, and SW registration script (`navigator.serviceWorker.register('/sw.js')` on `window load`).
- Note: `theme-color` in `index.html` is `#111827`; `manifest.json` uses `#121212` — both preserved to match v2 exactly.

**Step 8 — QA (in progress)**
- `Dashboard.jsx`: `ConfirmDialog` missing `confirmBg`/`confirmColor` props added (`confirmBg="#0e7490"` / `confirmColor="white"`)
- `Dashboard.jsx`: Protocol card layout fixed — `futureSub` and `badgeRow` moved inside `protocolLeft` column View so they stack vertically below the med name instead of floating as row siblings next to the pct pill
- `Dashboard.jsx`: Badge row CLS fix restored — conditional `minHeight: 30` when no badges are visible (matching v2 Lighthouse fix)
- `Dashboard.jsx`: Separator characters corrected `·` (U+00B7) → `•` (U+2022) in `scheduleSub` and `recentSub`
- `ResourcesTab.jsx`: `resultItem` border shorthand conflict fixed — `borderWidth: 1` replaced with explicit `borderTopWidth`/`borderRightWidth`/`borderBottomWidth` so `borderLeftWidth: 4` cyan accent is never overridden
- `LogTab.jsx`: Timeline dot positioning fixed — `dateNodeOuter` moved to direct child of `Pressable` (matching v2 structure where circle is direct child of `<button>`); empty `dateNodeInner` stub removed
- `App.jsx`: Initial tab changed from `'Calculator'` to `'Dashboard'`
- `App.jsx`: Layout structure fixed — `height: '100vh'` + `overflow: 'hidden'` on `screen` container; `index.html` updated with `html`/`body`/`#root` height anchors so header and tab bar stay fixed while `ScrollView` scrolls

### Remaining
- **Step 8 (next):** Full QA pass — run `npm run build && firebase deploy --only hosting` to a Firebase Hosting preview channel, then do a side-by-side visual and functional comparison against v2
- Step 9: Cutover — point injectiontracker.web.app to this project, retire v2
- Step 10 (future): Add Metro for native iOS/Android build, App Store submission
