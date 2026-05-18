import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { colors, blur, shadow, navBar, layout, motion, radius, spacing, type } from './theme.js';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { auth, fbGet, fbSet, fbTransaction, fbSetLog, fbDeleteLog } from './services/firebase.js';
import { onAuthStateChanged, getRedirectResult, signOut } from 'firebase/auth';
import { fetchInteractionsWithCache, fetchAllResources } from './services/gemini.js';
import { getLocalDate, getLocalTime, parseLocalDate, getActiveDose, EMPTY_MED, NAV_TABS } from './constants.js';
import { toMg, convertToVialUnit } from './mathEngine.js';
import { LoginScreen } from './LoginScreen.jsx';
import { ErrorBoundary } from './components/ui/ErrorBoundary.jsx';
import { ToastHost } from './components/ui/ToastHost.jsx';
const Calculator = lazy(() => import('./components/tabs/Calculator.jsx'));
const Dashboard = lazy(() => import('./components/tabs/Dashboard.jsx').then(m => ({ default: m.Dashboard })));
const MedsTab = lazy(() => import('./components/tabs/MedsTab.jsx').then(m => ({ default: m.MedsTab })));
const LogTab = lazy(() => import('./components/tabs/LogTab.jsx').then(m => ({ default: m.LogTab })));
const ResourcesTab = lazy(() => import('./components/tabs/ResourcesTab.jsx').then(m => ({ default: m.ResourcesTab })));
const AIAssistant = lazy(() => import('./components/tabs/AIAssistant.jsx').then(m => ({ default: m.AIAssistant })));
import { DashboardIcon, LogIcon, MedsIcon, CalcIcon, ResourcesIcon, AIIcon } from './components/ui/TabIcons.jsx';
import { AddMedModal } from './components/modals/AddMedModal.jsx';
import { EditMedModal } from './components/modals/EditMedModal.jsx';
import { TitrationModal } from './components/modals/TitrationModal.jsx';
import { QueueVialModal } from './components/modals/QueueVialModal.jsx';
import { LogFormModal } from './components/modals/LogFormModal.jsx';
import { AddScheduleModal } from './components/modals/AddScheduleModal.jsx';
import { Pressable } from './components/ui/Pressable.jsx';
import { CircuitBreaker } from './components/ui/CircuitBreaker.jsx';
import { Header } from './components/ui/Header.jsx';

const TAB_ICONS = {
  Dashboard:    DashboardIcon,
  LogInjection: LogIcon,
  Medications:  MedsIcon,
  Calculator:   CalcIcon,
  Resources:    ResourcesIcon,
  AIAssistant:  AIIcon,
};

// Simple fbSet wrapper passed to LogTab (matches v2 signature)
const save = async (path, data) => { await fbSet(path, data); };

export default function App() {
  // ── Auth ───────────────────────────────────────────────────────────
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  // ── Navigation ─────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('Dashboard');

  // ── Data ───────────────────────────────────────────────────────────
  const [meds, setMeds] = useState([]);
  const [logs, setLogs] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [library, setLibrary] = useState({});
  const [interactions, setInteractions] = useState([]);
  const [interactionError, setInteractionError] = useState(null);

  // ── Sync state ─────────────────────────────────────────────────────
  const [syncStatus, setSyncStatus] = useState('loading');
  const [pendingCount, setPendingCount] = useState(0);
  const [circuitTripped, setCircuitTripped] = useState(
    typeof sessionStorage !== 'undefined' && sessionStorage.getItem('fb_breaker_tripped') === 'true'
  );

  // ── Modal open state ───────────────────────────────────────────────
  const [showAddMed, setShowAddMed] = useState(false);
  const [editMed, setEditMed] = useState(null);
  const [titrationMed, setTitrationMed] = useState(null);
  const [queueMed, setQueueMed] = useState(null);
  const [showAddLog, setShowAddLog] = useState(false);
  const [editLogData, setEditLogData] = useState(null);
  const [showAddSchedule, setShowAddSchedule] = useState(false);

  // ── Settings ───────────────────────────────────────────────────────
  const [settings, setSettings] = useState({ dashSort: 'newest', medsSort: 'newest', autoLogEnabled: true });
  const autoLogEnabled = settings.autoLogEnabled !== false;

  // ── Refs for interval / processing lock ────────────────────────────
  const isProcessingRef = useRef(false);
  const stateRef = useRef({ meds, logs, schedule, autoLogEnabled });
  const scrollRef = useRef(null);

  // Scroll to top on tab change
  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [activeTab]);

  // Keep stateRef current so the minute-check interval reads fresh state
  useEffect(() => {
    stateRef.current = { meds, logs, schedule, autoLogEnabled };
  }, [meds, logs, schedule, autoLogEnabled]);

  // ── Derived values ─────────────────────────────────────────────────
  const today = getLocalDate();
  const todayLogs = logs.filter(l => l.date === today);
  const todaySchedule = schedule.filter(s =>
    s.days?.includes(new Date().toLocaleDateString('en-US', { weekday: 'long' }))
  );
  const highInteractions = interactions.filter(i => i.severity === 'high');
  const actionableInteractions = interactions.filter(i => i.severity && i.severity !== 'none');

  // ── Prefetch all tab chunks on mount so navigation is instant ─────────
  useEffect(() => {
    import('./components/tabs/Calculator.jsx');
    import('./components/tabs/Dashboard.jsx');
    import('./components/tabs/MedsTab.jsx');
    import('./components/tabs/LogTab.jsx');
    import('./components/tabs/ResourcesTab.jsx');
    import('./components/tabs/AIAssistant.jsx');
  }, []);

  // ── Circuit breaker listener ────────────────────────────────────────
  useEffect(() => {
    const handleTrip = () => setCircuitTripped(true);
    window.addEventListener('circuit_tripped', handleTrip);
    return () => window.removeEventListener('circuit_tripped', handleTrip);
  }, []);

  // ── Pending-change count listener ──────────────────────────────────
  useEffect(() => {
    const updateCount = () => {
      const count = Object.keys(localStorage).filter(k => k.startsWith('pending_')).length;
      setPendingCount(count);
    };
    window.addEventListener('pending_change', updateCount);
    updateCount();
    return () => window.removeEventListener('pending_change', updateCount);
  }, []);

  // ── Sync pending on login ───────────────────────────────────────────
  useEffect(() => {
    if (user) syncAllPending();
  }, [user]);

  // ── Auth listener ──────────────────────────────────────────────────
  useEffect(() => {
    getRedirectResult(auth).catch(() => {});
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  // ── Load on login ──────────────────────────────────────────────────
  useEffect(() => {
    if (user) load();
  }, [user]);

  // ── Re-run auto-logger when autoLogEnabled changes ─────────────────
  useEffect(() => {
    if (syncStatus !== 'synced' || !autoLogEnabled) return;
    processAutoLogs(meds, logs, schedule).then(({ processedMeds, processedLogs }) => {
      if (processedLogs.length !== logs.length || processedMeds !== meds) {
        setMeds(processedMeds);
        setLogs(processedLogs);
      }
    });
  }, [autoLogEnabled]);

  // ── Minute-check interval ──────────────────────────────────────────
  useEffect(() => {
    if (syncStatus !== 'synced' || !autoLogEnabled) return;

    const interval = setInterval(async () => {
      if (typeof document !== 'undefined' && document.hidden) return;

      const now = new Date();
      const dStr = getLocalDate();
      const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
      const h = now.getHours();
      const min = now.getMinutes();

      let didChange = false;
      let cMeds = [...stateRef.current.meds];
      let cLogs = [...stateRef.current.logs];

      const checkCurrentMinuteLog = (medId, medName, schTime, doseVal, unit, site, protocolNotes) => {
        const [th, tm] = schTime.split(':');
        const deductRaw = parseFloat(doseVal) || 0;
        const mObj = cMeds.find(x => x.id === medId);

        if (parseInt(th) === h && parseInt(tm) === min && deductRaw > 0 && mObj && !mObj.isArchived) {
          if (!cLogs.some(l => l.medId === medId && l.date === dStr)) {
            const logId = Date.now().toString() + Math.random().toString(36).substring(2, 7);
            const noteStr = protocolNotes ? `Auto-logged · ${protocolNotes}` : 'Auto-logged';
            cLogs.push({ id: logId, medId, medName, dose: deductRaw, unit, site, date: dStr, time: schTime, notes: noteStr, isAuto: true });
            didChange = true;

            cMeds = cMeds.map(m => {
              if (m.id === medId) {
                const vUnit = m.vialUnit || m.unit;
                const deductAmount = convertToVialUnit(deductRaw, unit, vUnit);
                const newRemaining = Math.max(0, Math.round((parseFloat(m.vialRemaining || m.vialTotal || 0) - deductAmount) * 1000) / 1000);
                return { ...m, vialRemaining: newRemaining };
              }
              return m;
            });
          }
        }
      };

      cMeds.forEach(m => {
        if (!m.scheduleDays?.includes(dayName) || m.isArchived) return;
        const at = getActiveDose(m, dStr);
        const d = parseFloat(at ? at.dose : m.dose);
        const u = at ? at.unit : m.unit;
        checkCurrentMinuteLog(m.id, m.name, m.injectionTime || '08:00', d, u, m.site, m.notes);
      });

      stateRef.current.schedule.forEach(s => {
        if (!s.days?.includes(dayName)) return;
        const m = cMeds.find(x => x.id === s.medId);
        if (!m || m.isArchived) return;
        checkCurrentMinuteLog(s.medId, s.medName, s.time, s.dose, s.unit, s.site, s.notes);
      });

      if (didChange) {
        setMeds(cMeds);
        setLogs(cLogs);
        const newEntries = cLogs.filter(l => !stateRef.current.logs.some(f => f.id === l.id));
        await Promise.all(newEntries.map(entry => fbSetLog(entry)));
        const medsObj = {};
        cMeds.forEach(m => { medsObj[m.id] = m; });
        await fbSet('meds', medsObj);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [syncStatus, autoLogEnabled]);

  // ── Helpers ────────────────────────────────────────────────────────

  const updateSetting = async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await fbSet('settings', newSettings);
  };

  const toggleAutoLog = () => updateSetting('autoLogEnabled', !autoLogEnabled);

  const syncAllPending = async () => {
    const keys = Object.keys(localStorage);
    const pendingKeys = keys.filter(k => k.startsWith('pending_') && k !== 'pending_logs');
    setPendingCount(pendingKeys.length);
    for (let key of pendingKeys) {
      const path = key.replace('pending_', '');
      const data = JSON.parse(localStorage.getItem(`cache_${path}`));
      try { await fbSet(path, data); } catch (e) { console.warn(`Sync failed for ${path}:`, e); }
    }
  };

  const cleanupLocalStorage = () => {
    try {
      const validPaths = new Set(['meds', 'logs', 'schedule', 'library', 'interactions', 'settings']);
      Object.keys(localStorage).forEach(k => {
        if (k.startsWith('cache_') || k.startsWith('pending_')) {
          const path = k.replace(/^(cache_|pending_)/, '');
          if (!validPaths.has(path)) localStorage.removeItem(k);
        }
      });
    } catch (e) { console.warn('localStorage cleanup failed (non-fatal):', e); }
  };

  const applyMedsUpdate = async (newMeds, freshLogs) => {
    const todayStr = getLocalDate();
    const effectiveLogs = Array.isArray(freshLogs) ? freshLogs : logs;
    let changed = false;
    const swappedMeds = newMeds.map(m => {
      const hasLoggedToday = effectiveLogs.some(l => l.medId === m.id && l.date === todayStr);
      if (m.nextVial && !m.isArchived) {
        if ((parseFloat(m.vialRemaining || 0) <= 0 && !hasLoggedToday) || m.nextVial.startDate <= todayStr) {
          changed = true;
          return { ...m, vialTotal: m.nextVial.vialTotal, vialRemaining: m.nextVial.vialTotal, bwAdded: m.nextVial.bwAdded, startDate: m.nextVial.startDate, subPeptides: m.nextVial.subPeptides || m.subPeptides, nextVial: null };
        }
      }
      if (m.isEndingCycle && !m.isArchived) {
        if (parseFloat(m.vialRemaining || 0) <= 0 && !hasLoggedToday) {
          changed = true;
          return { ...m, isArchived: true, nextVial: null, isEndingCycle: false };
        }
      }
      return m;
    });
    setMeds(swappedMeds);
    const medsObj = {};
    swappedMeds.forEach(m => { medsObj[m.id] = m; });
    await fbSet('meds', medsObj);
  };

  const processAutoLogs = async (fetchedMeds, fetchedLogs, fetchedSchedule, isAutoEnabled = autoLogEnabled) => {
    if (!isAutoEnabled || isProcessingRef.current) return { processedMeds: fetchedMeds, processedLogs: fetchedLogs };

    isProcessingRef.current = true;
    try {
      const now = new Date();
      let modifiedMeds = false;
      let modifiedLogs = false;
      let currentLogs = [...fetchedLogs];
      let currentMeds = [...fetchedMeds];

      const maxDaysBack = 7;
      const catchUpStart = new Date(now);
      catchUpStart.setDate(catchUpStart.getDate() - maxDaysBack);

      const checkAndLog = (medId, medName, dStr, schTime, doseVal, unit, site, protocolNotes) => {
        const deductRaw = parseFloat(doseVal) || 0;
        if (deductRaw > 0 && !currentLogs.some(l => l.medId === medId && l.date === dStr)) {
          const logId = Date.now().toString() + Math.random().toString(36).substring(2, 7);
          const noteStr = protocolNotes ? `Auto-logged · ${protocolNotes}` : 'Auto-logged';
          currentLogs.push({ id: logId, medId, medName, dose: deductRaw, unit, site, date: dStr, time: schTime, notes: noteStr, isAuto: true });
          modifiedLogs = true;
          currentMeds = currentMeds.map(m => {
            if (m.id === medId) {
              const vUnit = m.vialUnit || m.unit;
              const deductAmount = convertToVialUnit(deductRaw, unit, vUnit);
              const newRemaining = Math.max(0, Math.round((parseFloat(m.vialRemaining || m.vialTotal || 0) - deductAmount) * 1000) / 1000);
              return { ...m, vialRemaining: newRemaining };
            }
            return m;
          });
          modifiedMeds = true;
        }
      };

      const runLoop = (item, isStandalone) => {
        const medId = isStandalone ? item.medId : item.id;
        const initialM = currentMeds.find(x => x.id === medId);
        if (!initialM || !initialM.startDate || initialM.isArchived) return;

        let iterDate = parseLocalDate(initialM.startDate) > catchUpStart ? parseLocalDate(initialM.startDate) : new Date(catchUpStart);
        const validDays = isStandalone ? item.days : initialM.scheduleDays;

        while (iterDate <= now) {
          const m = currentMeds.find(x => x.id === medId);
          if (!m) break;

          const dStr = `${iterDate.getFullYear()}-${String(iterDate.getMonth() + 1).padStart(2, '0')}-${String(iterDate.getDate()).padStart(2, '0')}`;
          const dayName = iterDate.toLocaleDateString('en-US', { weekday: 'long' });

          const tempRemaining = parseFloat(m.vialRemaining || 0);
          if (tempRemaining <= 0) {
            if (!(m.nextVial && parseLocalDate(m.nextVial.startDate) <= iterDate)) break;
          }

          if (validDays?.includes(dayName)) {
            const isToday = dStr === getLocalDate();
            const schTime = isStandalone ? item.time : (m.injectionTime || '08:00');
            const [th, tm] = schTime.split(':');

            if (!isToday || now.getHours() > parseInt(th) || (now.getHours() === parseInt(th) && now.getMinutes() >= parseInt(tm))) {
              let doseToLog, unitToLog;
              if (!isStandalone) {
                const at = getActiveDose(m, dStr);
                doseToLog = parseFloat(at ? at.dose : m.dose);
                unitToLog = at ? at.unit : m.unit;
              } else {
                doseToLog = parseFloat(item.dose);
                unitToLog = item.unit;
              }
              checkAndLog(medId, isStandalone ? item.medName : m.name, dStr, schTime, doseToLog, unitToLog, isStandalone ? item.site : m.site, isStandalone ? item.notes : m.notes);
            }
          }
          iterDate.setDate(iterDate.getDate() + 1);
        }
      };

      currentMeds.forEach(m => runLoop(m, false));
      fetchedSchedule.forEach(s => runLoop(s, true));

      if (modifiedLogs) {
        const newEntries = currentLogs.filter(l => !fetchedLogs.some(f => f.id === l.id));
        await Promise.all(newEntries.map(entry => fbSetLog(entry)));
      }

      let medsRequiredUpdate = modifiedMeds;
      const todayStr = getLocalDate();
      currentMeds = currentMeds.map(m => {
        const hasLoggedToday = currentLogs.some(l => l.medId === m.id && l.date === todayStr);
        if (m.nextVial && !m.isArchived && ((parseFloat(m.vialRemaining || 0) <= 0 && !hasLoggedToday) || m.nextVial.startDate <= todayStr)) {
          medsRequiredUpdate = true;
          return { ...m, vialTotal: m.nextVial.vialTotal, vialRemaining: m.nextVial.vialTotal, bwAdded: m.nextVial.bwAdded, startDate: m.nextVial.startDate, subPeptides: m.nextVial.subPeptides || m.subPeptides, nextVial: null };
        }
        if (m.isEndingCycle && !m.isArchived && (parseFloat(m.vialRemaining || 0) <= 0 && !hasLoggedToday)) {
          medsRequiredUpdate = true;
          return { ...m, isArchived: true, nextVial: null, isEndingCycle: false };
        }
        return m;
      });

      if (medsRequiredUpdate) {
        const medsObj = {};
        currentMeds.forEach(m => { medsObj[m.id] = m; });
        await fbSet('meds', medsObj);
      }

      return { processedMeds: currentMeds, processedLogs: currentLogs };
    } finally {
      isProcessingRef.current = false;
    }
  };

  const load = async () => {
    cleanupLocalStorage();
    setSyncStatus('loading');

    // Hydrate from cache immediately (avoids blank UI on cold start)
    try {
      const cm = localStorage.getItem('cache_meds');
      const cl = localStorage.getItem('cache_logs');
      const cs = localStorage.getItem('cache_schedule');
      if (cm) setMeds(Object.values(JSON.parse(cm)));
      if (cl) setLogs(Object.values(JSON.parse(cl)));
      if (cs) setSchedule(Object.values(JSON.parse(cs)));
    } catch {}

    try {
      const [m, l, s, lib, i, fetchedSettings] = await Promise.all([
        fbGet('meds'), fbGet('logs'), fbGet('schedule'),
        fbGet('library'), fbGet('interactions'), fbGet('settings')
      ]);

      if (fetchedSettings) setSettings(fetchedSettings);

      const fetchedMeds = m ? Object.values(m) : [];
      let fetchedLogs = [];
      if (l) {
        if (Array.isArray(l)) {
          fetchedLogs = l;
          await Promise.all(fetchedLogs.map(entry => fbSetLog(entry)));
        } else {
          fetchedLogs = Object.values(l);
        }
      }
      const fetchedSchedule = s ? Object.values(s) : [];
      const initialAutoLog = fetchedSettings ? fetchedSettings.autoLogEnabled !== false : true;

      const { processedMeds, processedLogs } = await processAutoLogs(fetchedMeds, fetchedLogs, fetchedSchedule, initialAutoLog);

      setMeds(processedMeds);
      setLogs(processedLogs);
      setSchedule(fetchedSchedule);
      setLibrary(lib || {});
      setInteractions(Array.isArray(i) ? i : []);
      setSyncStatus('synced');
    } catch {
      setSyncStatus('error');
    }
  };

  // ── Interaction check ──────────────────────────────────────────────

  const checkInteractions = async (medsToCheck, force = false) => {
    const activeForCheck = (medsToCheck || meds).filter(m => !m.isArchived);
    if (activeForCheck.length < 2) { setInteractions([]); setInteractionError(null); return; }
    const result = await fetchInteractionsWithCache(activeForCheck, force);
    setInteractions(result.items);
    setInteractionError(result.error);
    if (result.error) window.showToast?.('Interaction check ACTIVE. Tap Re-check to retry.', 'error');
    await fbSet('interactions', result.items);
  };

  const autoFetchResources = async (medName, currentLibrary) => {
    try {
      const result = await fetchAllResources(medName);
      const items = result.items || [];
      const existing = currentLibrary[medName] || [];
      const existingUrls = new Set(existing.map(r => r.url));
      const newItems = items.filter(r => !existingUrls.has(r.url));
      if (newItems.length === 0 && existing.length > 0) return currentLibrary;
      const updated = { ...currentLibrary, [medName]: [...existing, ...newItems] };
      setLibrary(updated);
      await fbSet('library', updated);
      return updated;
    } catch (e) {
      console.error('Auto-fetch resources failed silently:', e);
      if (!currentLibrary[medName]) {
        const updated = { ...currentLibrary, [medName]: [] };
        setLibrary(updated);
        await fbSet('library', updated);
        return updated;
      }
      return currentLibrary;
    }
  };

  // ── Med handlers ───────────────────────────────────────────────────

  const addMed = async m => {
    const w = { ...m, vialRemaining: parseFloat(m.vialTotal) || 0 };
    const u = [...meds, w];
    await applyMedsUpdate(u);
    checkInteractions(u);
    setShowAddMed(false);
    autoFetchResources(m.name, library);
  };

  const addMeds = async (medsArr) => {
    const newMeds = medsArr.map(m => ({
      ...EMPTY_MED, ...m,
      id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
      vialRemaining: parseFloat(m.vialTotal) || 0,
    }));
    const u = [...meds, ...newMeds];
    await applyMedsUpdate(u);
    checkInteractions(u);
    setShowAddMed(false);
    newMeds.forEach(m => autoFetchResources(m.name, library));
  };

  const removeMed = async id => {
    const u = meds.filter(x => x.id !== id);
    await applyMedsUpdate(u);
    checkInteractions(u);
  };

  const updateMed = async m => {
    const oldMed = meds.find(x => x.id === m.id);
    const u = meds.map(x => x.id === m.id ? m : x);
    await applyMedsUpdate(u);

    if (oldMed && oldMed.name !== m.name) {
      const updatedLogs = logs.map(l => l.medId === m.id ? { ...l, medName: m.name } : l);
      setLogs(updatedLogs);
      await Promise.all(updatedLogs.map(l => fbSetLog(l)));

      const updatedSchedule = schedule.map(s => s.medId === m.id ? { ...s, medName: m.name } : s);
      setSchedule(updatedSchedule);
      await save('schedule', updatedSchedule);
    }
    checkInteractions(u);
  };

  // ── Log handlers ───────────────────────────────────────────────────

  const logDose = async (med, date, time, dose, unit, site, notes, isAuto = false) => {
    const logId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now().toString()}_${Math.random().toString(36).substring(2, 9)}`;

    const deductRaw = parseFloat(dose) || 0;

    if (deductRaw < 0 || deductRaw > 100000) {
      window.showToast?.('Invalid dose amount. Please enter a positive, realistic number.', 'error');
      return;
    }

    if (!isAuto && med) {
      const expectedDoseMg = toMg(parseFloat(med.dose) || 0, med.unit);
      const actualDoseMg = toMg(deductRaw, unit);
      if (expectedDoseMg > 0 && actualDoseMg > 0) {
        const ratio = actualDoseMg / expectedDoseMg;
        if (ratio >= 10 || ratio <= 0.1) {
          window.showToast?.(`Note: this dose is ${ratio >= 10 ? Math.round(ratio) + '×' : '1/' + Math.round(1/ratio)} the protocol dose (${med.dose} ${med.unit}). Saved — verify it's intentional.`, 'info');
        }
      }
    }

    const cleanNotes = notes ? String(notes).replace(/[<>]/g, '').trim() : '';
    const cleanSite = site ? String(site).replace(/[<>]/g, '').trim() : (med.site || '');
    const newLog = { id: logId, medId: med.id, medName: med.name, dose: deductRaw, unit, site: cleanSite, date, time, notes: cleanNotes, isAuto };

    const ul = [...logs, newLog];
    setLogs(ul);
    await fbSetLog(newLog);

    await fbTransaction(`meds/${med.id}`, (current) => {
      if (!current) return current;
      const vUnit = current.vialUnit || current.unit;
      const deductAmount = convertToVialUnit(deductRaw, unit, vUnit);
      const newRemaining = Math.max(0, Math.round((parseFloat(current.vialRemaining || current.vialTotal || 0) - deductAmount) * 1000) / 1000);
      return { ...current, vialRemaining: newRemaining };
    });

    const um = meds.map(m => {
      if (m.id === med.id) {
        const vUnit = m.vialUnit || m.unit;
        const deductAmount = convertToVialUnit(deductRaw, unit, vUnit);
        const newRemaining = Math.max(0, Math.round((parseFloat(m.vialRemaining || m.vialTotal || 0) - deductAmount) * 1000) / 1000);
        return { ...m, vialRemaining: newRemaining };
      }
      return m;
    });
    await applyMedsUpdate(um, ul);
  };

  const updateLog = async (updatedLog) => {
    const oldLog = logs.find(l => l.id === updatedLog.id);
    if (!oldLog) return;

    const ul = logs.map(l => l.id === updatedLog.id ? updatedLog : l);
    setLogs(ul);
    await fbSetLog(updatedLog);

    const um = meds.map(m => {
      if (m.id === updatedLog.medId) {
        const vUnit = m.vialUnit || m.unit;
        const oldDeduct = convertToVialUnit(parseFloat(oldLog.dose) || 0, oldLog.unit, vUnit);
        const newDeduct = convertToVialUnit(parseFloat(updatedLog.dose) || 0, updatedLog.unit, vUnit);
        const doseDiff = newDeduct - oldDeduct;
        if (doseDiff !== 0) {
          const newRemaining = Math.round((parseFloat(m.vialRemaining || 0) - doseDiff) * 1000) / 1000;
          const maxVol = parseFloat(m.vialTotal || Infinity);
          return { ...m, vialRemaining: Math.min(maxVol, Math.max(0, newRemaining)) };
        }
      }
      return m;
    });
    await applyMedsUpdate(um, ul);
  };

  const delLog = async (logId) => {
    const logToDel = logs.find(l => l.id === logId);
    if (!logToDel) return;

    const ul = logs.filter(l => l.id !== logId);
    setLogs(ul);
    await fbDeleteLog(logId);

    const um = meds.map(m => {
      if (m.id === logToDel.medId) {
        const vUnit = m.vialUnit || m.unit;
        const restoreAmount = convertToVialUnit(parseFloat(logToDel.dose) || 0, logToDel.unit, vUnit);
        const restored = Math.round((parseFloat(m.vialRemaining || 0) + restoreAmount) * 1000) / 1000;
        const maxVol = parseFloat(m.vialTotal || Infinity);
        return { ...m, vialRemaining: Math.min(maxVol, restored) };
      }
      return m;
    });
    await applyMedsUpdate(um, ul);
  };

  const undoDose = async (medId) => {
    const medLogs = logs.filter(l => l.medId === medId).sort((a, b) => {
      const dateDiff = b.date.localeCompare(a.date);
      if (dateDiff !== 0) return dateDiff;
      return b.time.localeCompare(a.time);
    });
    if (medLogs.length > 0) {
      if (medLogs[0].date === today) {
        await delLog(medLogs[0].id);
      } else {
        window.showToast?.("Cannot undo — most recent dose wasn't today. Manage older logs in the 'Log' tab.", 'info');
      }
    } else {
      window.showToast?.('No logs found to undo.', 'info');
    }
  };

  // ── Library handlers ───────────────────────────────────────────────

  const saveToLibrary = async (medName, items) => {
    const existing = library[medName] || [];
    const existingUrls = new Set(existing.map(r => r.url));
    const newItems = Array.isArray(items)
      ? items.filter(r => !existingUrls.has(r.url))
      : [items].filter(r => !existingUrls.has(r.url));
    if (!newItems.length) return;
    const updated = { ...library, [medName]: [...existing, ...newItems] };
    setLibrary(updated);
    await fbSet('library', updated);
  };

  const removeFromLibrary = async (medName, url) => {
    const updated = { ...library, [medName]: (library[medName] || []).filter(r => r.url !== url) };
    setLibrary(updated);
    await fbSet('library', updated);
  };

  // ── Backup / Restore ───────────────────────────────────────────────

  const exportBackup = () => {
    const b = { meds, logs, schedule, library, exportedAt: new Date().toISOString() };
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(b, null, 2)], { type: 'application/json' }));
    a.download = `injection-backup-${today}.json`;
    a.click();
  };

  const validateBackup = (d) => {
    if (!d || typeof d !== 'object') return 'File is not a valid JSON object.';
    const isMedsValid = !d.meds || (Array.isArray(d.meds) && d.meds.every(m => m && typeof m === 'object' && typeof m.id === 'string' && typeof m.name === 'string'));
    const isLogsValid = !d.logs || (Array.isArray(d.logs) && d.logs.every(l => l && typeof l === 'object' && typeof l.id === 'string' && typeof l.medId === 'string' && typeof l.date === 'string'));
    const isSchedValid = !d.schedule || (Array.isArray(d.schedule) && d.schedule.every(s => s && typeof s === 'object' && typeof s.id === 'string'));
    const isLibValid = !d.library || (d.library && typeof d.library === 'object' && !Array.isArray(d.library));
    if (!isMedsValid) return "Invalid 'meds' section — each medication must have id and name.";
    if (!isLogsValid) return "Invalid 'logs' section — each log must have id, medId, and date.";
    if (!isSchedValid) return "Invalid 'schedule' section.";
    if (!isLibValid) return "Invalid 'library' section.";
    if (!d.meds && !d.logs && !d.schedule && !d.library) return 'Backup contains no recognized data.';
    return null;
  };

  const importBackup = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async ev => {
      let d;
      try { d = JSON.parse(ev.target.result); } catch {
        window.showToast?.('Invalid backup file — could not parse JSON.', 'error'); return;
      }
      const validationError = validateBackup(d);
      if (validationError) { window.showToast?.(validationError, 'error'); return; }
      try {
        if (d.meds) await applyMedsUpdate(d.meds);
        if (d.logs) { setLogs(d.logs); await Promise.all(d.logs.map(entry => fbSetLog(entry))); }
        if (d.schedule) { setSchedule(d.schedule); await save('schedule', d.schedule); }
        if (d.library) { setLibrary(d.library); await fbSet('library', d.library); }
        window.showToast?.('Backup restored successfully.', 'success');
      } catch (err) {
        window.showToast?.(`Restore failed: ${err.message || 'Unknown error'}`, 'error');
      }
    };
    reader.readAsText(file);
  };

  // ── Early returns ──────────────────────────────────────────────────

  if (!authReady) return null;
  if (!user) return <LoginScreen />;

  if (circuitTripped) return (
    <CircuitBreaker
      icon="🛑"
      title="Safety Lock Activated"
      message="The app has paused cloud syncing because it detected abnormal database activity (over 100 requests in this session). This protects your account from excessive billing. If you were just using the app normally, you can safely reset the counter below."
      buttonText="RESET COUNTER"
      onAction={() => {
        sessionStorage.removeItem('fb_breaker_tripped');
        sessionStorage.setItem('fb_call_count', '0');
        window.location.reload();
      }}
    />
  );

  const firstName = user.displayName ? user.displayName.split(' ')[0].toUpperCase() : 'MY';

  return (
    <ErrorBoundary>
    <ToastHost />
    <View style={styles.screen} className="screen-wrap">

      {/* SVG noise texture overlay */}
      <svg style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none', opacity: layout.noiseOpacity }}>
        <filter id="noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <Header
        firstName={firstName}
        syncStatus={syncStatus}
        pendingCount={pendingCount}
        onSync={async () => {
          setSyncStatus('saving');
          await syncAllPending();
          await load();
        }}
        onExport={exportBackup}
        onImport={importBackup}
        onLogout={() => signOut(auth)}
      />

      {/* ── Scrollable content ─────────────────────────────────────── */}
      <ScrollView ref={scrollRef} style={styles.scrollArea} contentContainerStyle={styles.content} accessibilityRole="main" bounces={false} overScrollMode="never">
        <Suspense fallback={<View style={{ minHeight: '60vh', backgroundColor: colors.bgFallback }} />}>
        <View style={styles.appContainer}>
          {activeTab === 'Dashboard' && (
            <Dashboard
              meds={meds.filter(m => !m.isArchived)}
              logs={logs}
              schedule={todaySchedule}
              todayLogs={todayLogs}
              highInteractions={highInteractions}
              actionableInteractions={actionableInteractions}
              onAlertClick={() => setActiveTab('AI Assistant')}
              onSaveMeds={applyMedsUpdate}
              logDose={logDose}
              undoDose={undoDose}
              today={today}
              onQueueVial={setQueueMed}
              settings={settings}
              updateSetting={updateSetting}
            />
          )}
          {activeTab === 'Log Injection' && (
            <LogTab
              meds={meds.filter(m => !m.isArchived)}
              logs={logs}
              delLog={delLog}
              onEditLog={setEditLogData}
              autoLogEnabled={autoLogEnabled}
              toggleAutoLog={toggleAutoLog}
              save={save}
              today={today}
              showAddLog={showAddLog}
              setShowAddLog={setShowAddLog}
            />
          )}
          {activeTab === 'Medications' && (
            <MedsTab
              meds={meds}
              logs={logs}
              interactions={interactions}
              highInteractions={highInteractions}
              interactionError={interactionError}
              onAdd={() => setShowAddMed(true)}
              onEdit={setEditMed}
              onTitrate={setTitrationMed}
              onRemove={removeMed}
              onSaveMeds={applyMedsUpdate}
              onRecheck={() => checkInteractions(meds, true)}
              logDose={logDose}
              undoDose={undoDose}
              today={today}
              onQueueVial={setQueueMed}
              settings={settings}
              updateSetting={updateSetting}
            />
          )}
          {activeTab === 'Calculator' && <Calculator />}
          {activeTab === 'Resources' && (
            <ResourcesTab
              library={library}
              meds={meds.filter(m => !m.isArchived)}
              onSaveToLibrary={saveToLibrary}
              onRemoveFromLibrary={removeFromLibrary}
              onRefreshMed={autoFetchResources}
            />
          )}
          {activeTab === 'AI Assistant' && (
            <AIAssistant
              meds={meds.filter(m => !m.isArchived)}
              interactions={interactions}
              onRecheck={() => checkInteractions(meds.filter(m => !m.isArchived))}
            />
          )}
        </View>
        </Suspense>
      </ScrollView>

      {/* ── Bottom tab navigation ──────────────────────────────────── */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100 }}>
      <View className="tabbar-wrap" style={[styles.tabBarWrap, { paddingBottom: layout.tabBarSafeBottom }]} onStartShouldSetResponder={() => true}>
        <View style={styles.tabBarCapsule}>
          {NAV_TABS.map(t => {
            const active = activeTab === t.id;
            const Icon = TAB_ICONS[t.iconKey];
            return (
              <Pressable
                key={t.id}
                onPress={() => setActiveTab(t.id)}
                accessibilityLabel={t.id}
                accessibilityRole="button"
                style={[styles.tabBtn, active && styles.tabBtnActive, { color: active ? navBar.iconActive : navBar.iconInactive }]}
              >
                <Icon active={active} />
                {active && (
                  <Text style={styles.tabLabel} numberOfLines={1}>{t.label}</Text>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>
      </div>

    </View>

    {/* ── Modals ─────────────────────────────────────────────────────── */}
    {showAddMed && (
      <AddMedModal
        onClose={() => setShowAddMed(false)}
        onSave={async m => { await addMed({ ...m, id: Date.now().toString() }); }}
      />
    )}
    {editMed && (
      <EditMedModal
        med={editMed}
        onClose={() => setEditMed(null)}
        onSave={async m => { await updateMed(m); setEditMed(null); }}
      />
    )}
    {titrationMed && (
      <TitrationModal
        med={titrationMed}
        onClose={() => setTitrationMed(null)}
        onSave={async m => { await updateMed(m); setTitrationMed(null); }}
        today={today}
      />
    )}
    {queueMed && (
      <QueueVialModal
        med={queueMed}
        onClose={() => setQueueMed(null)}
        onSave={async (id, vialData, overwriteNow) => {
          const u = meds.map(x => {
            if (x.id === id) {
              if (overwriteNow || x.isArchived) {
                return { ...x, isArchived: false, nextVial: null, vialTotal: vialData.vialTotal, vialRemaining: vialData.vialTotal, bwAdded: vialData.bwAdded, startDate: vialData.startDate, subPeptides: vialData.subPeptides || x.subPeptides };
              } else {
                return { ...x, nextVial: vialData };
              }
            }
            return x;
          });
          await applyMedsUpdate(u);
          setQueueMed(null);
          window.showToast?.(overwriteNow || queueMed.isArchived ? 'Vial activated!' : 'Vial queued successfully!', 'success');
        }}
      />
    )}
    {showAddLog && (
      <LogFormModal
        meds={meds.filter(m => !m.isArchived)}
        onClose={() => setShowAddLog(false)}
        onSave={l => {
          const m = meds.find(x => x.id === l.medId);
          if (m) logDose(m, l.date, l.time, l.dose, l.unit, l.site, l.notes);
          setShowAddLog(false);
        }}
      />
    )}
    {editLogData && (
      <LogFormModal
        meds={meds.filter(m => !m.isArchived)}
        initialData={editLogData}
        onClose={() => setEditLogData(null)}
        onSave={l => { updateLog(l); setEditLogData(null); }}
      />
    )}
    {showAddSchedule && (
      <AddScheduleModal
        meds={meds.filter(m => !m.isArchived)}
        onClose={() => setShowAddSchedule(false)}
        onSave={s => {
          const u = [...schedule, s];
          setSchedule(u);
          save('schedule', u);
          setShowAddSchedule(false);
        }}
      />
    )}
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  // ── Content — constrained to 672px matching v2 ─────────────────
  scrollArea: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  content: {
    paddingTop: layout.headerClearanceSafe,
    paddingBottom: layout.tabBarClearance,
  },
  appContainer: {
    width: '100%',
    maxWidth: layout.contentMaxWidth,
    paddingHorizontal: spacing.screenPad,
    alignSelf: 'center',
    flex: 1,
  },

  // ── Tab bar — full-bleed outer, capsule constrained ────────────
  tabBarWrap: {
    paddingHorizontal: spacing.screenPad,
    paddingTop: 6,
    paddingBottom: 24,
    alignItems: 'center',
    touchAction: 'none',
  },
  tabBarCapsule: {
    ...navBar.capsule,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    width: '100%',
    maxWidth: layout.tabBarMaxWidth,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: radius.pill,
    transition: motion.tabTransition,
    cursor: 'pointer',
  },
  tabBtnActive: {
    flex: 1.2,
    ...navBar.btnActive,
  },
  tabLabel: {
    ...type.tabLabel,
    ...navBar.label,
  },
});
