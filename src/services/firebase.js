import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, get, set, update, onValue, runTransaction } from 'firebase/database';
import { initializeAppCheck, ReCaptchaV3Provider, getToken } from 'firebase/app-check';

const app = initializeApp({
  apiKey: "AIzaSyC5qJWkGvTumgJoAttVJwoLb03pcbTrqQg",
  authDomain: "injection-tracker-6341d.firebaseapp.com",
  databaseURL: "https://injection-tracker-6341d-default-rtdb.firebaseio.com",
  projectId: "injection-tracker-6341d",
  storageBucket: "injection-tracker-6341d.firebasestorage.app",
  messagingSenderId: "970883133523",
  appId: "1:970883133523:web:192958710502897b22d6a6"
});

export const auth = getAuth(app);
export const db = getDatabase(app);

// App Check lazy-init.
//
// Why factory functions instead of eager singleton exports:
//   - Module imports should be cheap and side-effect-free; eager
//     initializeAppCheck triggers a ~360 KB reCAPTCHA download from gstatic
//     on every cold start, even when the user is just looking at the login
//     screen and may never sign in.
//   - Matches Firebase v9+ modular SDK convention (`getAuth(app)`,
//     `getDatabase(app)` are all factories).
//   - First call to either function below triggers reCAPTCHA load + token
//     issuance. Subsequent calls return the cached instance / promise.
//
// Trigger points (intentional):
//   - LoginScreen.signIn() awaits ensureAppCheckReady before any auth call
//   - App.jsx auth useEffect calls ensureAppCheckReady before getRedirectResult
//     AND inside onAuthStateChanged when a user is present, so App Check is
//     guaranteed ready before any downstream RTDB / Cloud Function call
//   - gemini.js and LogTab.jsx call getAppCheck() when fetching App Check
//     tokens for Cloud Function requests
//
// Failure mode: getToken's .catch returns null so a network/reCAPTCHA
// failure doesn't deadlock auth. Firebase Auth's SDK independently retries
// attaching a token; if that also fails, App Check enforcement rejects
// cleanly rather than hanging.

let _appCheck = null;
let _appCheckReady = null;

export function getAppCheck() {
  if (!_appCheck) {
    _appCheck = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider('6LcF3-gsAAAAAHbr7DkcvqGLvyf4Yz5WZs1EOXJi'),
      isTokenAutoRefreshEnabled: true,
    });
    _appCheckReady = getToken(_appCheck, false).catch(() => null);
  }
  return _appCheck;
}

export function ensureAppCheckReady() {
  getAppCheck();
  return _appCheckReady;
}

export function getUserPath() {
  const u = auth.currentUser;
  return u ? `users/${u.uid}` : null;
}

// ── DEFENSIVE LAYER: Circuit Breaker ──────────────────────────────
const MAX_FIREBASE_CALLS = 100;

export function checkCircuitBreaker() {
  let currentCalls = parseInt(sessionStorage.getItem('fb_call_count') || '0', 10);
  if (currentCalls >= MAX_FIREBASE_CALLS) {
    if (!sessionStorage.getItem('fb_breaker_tripped')) {
      sessionStorage.setItem('fb_breaker_tripped', 'true');
      window.dispatchEvent(new Event('circuit_tripped')); // Instantly triggers the React Lockdown UI
    }
    console.error(`🛑 CIRCUIT BREAKER TRIPPED! Call ${currentCalls+1} blocked.`);
    return false;
  }
  sessionStorage.setItem('fb_call_count', currentCalls + 1);
  return true;
}

export async function fbGet(path) {
  const up = getUserPath();
  // Safety check: if circuit breaker tripped, force local cache
  if (!up || !checkCircuitBreaker()) {
    const local = localStorage.getItem(`cache_${path}`);
    return local ? JSON.parse(local) : null;
  }

  try {
    // 1. NETWORK FIRST: Always try to pull the absolute freshest data from the cloud
    const s = await get(ref(db, `${up}/${path}`));
    if (s.exists()) {
      const val = s.val();
      // Update the local cache behind the scenes so offline mode is always ready
      localStorage.setItem(`cache_${path}`, JSON.stringify(val));
      return val;
    }
    return null;
  } catch (error) {
    // 2. OFFLINE FALLBACK: If you have no internet, seamlessly load from local storage
    console.warn(`Offline mode: Loading ${path} from local cache.`);
    const local = localStorage.getItem(`cache_${path}`);
    return local ? JSON.parse(local) : null;
  }
}

export async function fbSet(path, data) {
  // 1. Save to phone storage immediately
  localStorage.setItem(`cache_${path}`, JSON.stringify(data));
  localStorage.setItem(`pending_${path}`, 'true');
  window.dispatchEvent(new Event('pending_change'));

  // 2. Attempt background sync
  if (!checkCircuitBreaker()) return;
  const up = getUserPath();
  if (!up) return;
  try {
    await set(ref(db, `${up}/${path}`), data);
    localStorage.removeItem(`pending_${path}`);
    window.dispatchEvent(new Event('pending_change'));
  } catch (e) {
    console.warn("Offline: Saved to phone storage only.");
  }
}

export async function fbUpdate(pathToValueMap) {
  // 1. Save all values to phone storage immediately
  for (const [path, data] of Object.entries(pathToValueMap)) {
    localStorage.setItem(`cache_${path}`, JSON.stringify(data));
    localStorage.setItem(`pending_${path}`, 'true');
  }
  window.dispatchEvent(new Event('pending_change'));

  // 2. Attempt background sync
  if (!checkCircuitBreaker()) return;
  const up = getUserPath();
  if (!up) return;
  const prefixed = {};
  for (const [path, data] of Object.entries(pathToValueMap)) {
    prefixed[`${up}/${path}`] = data;
  }
  try {
    await update(ref(db), prefixed);
    for (const path of Object.keys(pathToValueMap)) {
      localStorage.removeItem(`pending_${path}`);
    }
    window.dispatchEvent(new Event('pending_change'));
  } catch (e) {
    console.warn("Offline: Saved to phone storage only.");
  }
}

export async function fbDelete(path) {
  if (!checkCircuitBreaker()) return;
  const up = getUserPath();
  if (!up) return;
  localStorage.removeItem(`cache_${path}`);
  localStorage.removeItem(`pending_${path}`);
  try {
    await set(ref(db, `${up}/${path}`), null);
  } catch (e) {
    console.warn("Offline: delete queued.");
  }
}

export async function fbSetLog(log) {
  return fbSet(`logs/${log.id}`, log);
}

export async function fbDeleteLog(logId) {
  return fbDelete(`logs/${logId}`);
}

export async function fbTransaction(path, updateFn) {
  if (!checkCircuitBreaker()) return;
  const up = getUserPath();
  if (!up) return;
  return runTransaction(ref(db, `${up}/${path}`), updateFn);
}

export function onConnectionState(handler) {
  return onValue(ref(db, '.info/connected'), snapshot => {
    handler(snapshot.val() === true);
  });
}

// ── Shared cache (not under user path) ───────────────────────────
export async function cacheGet(path) {
  if (!checkCircuitBreaker()) return null;
  try {
    const s = await get(ref(db, `cache/${path}`));
    return s.exists() ? s.val() : null;
  } catch {
    return null;
  }
}

export async function cacheSet(path, data) {
  if (!checkCircuitBreaker()) return;
  try {
    await set(ref(db, `cache/${path}`), { ...data, cachedAt: Date.now() });
  } catch(e) {
    console.error("Cache write failed:", e);
  }
}
