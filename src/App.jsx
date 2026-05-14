import { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { auth } from './services/firebase.js';
import { onAuthStateChanged, getRedirectResult, signOut } from 'firebase/auth';
import { NAV_TABS } from './constants.js';
import { LoginScreen } from './LoginScreen.jsx';
import Calculator from './components/tabs/Calculator.jsx';
import { Dashboard } from './components/tabs/Dashboard.jsx';
import { MedsTab } from './components/tabs/MedsTab.jsx';
import { LogTab } from './components/tabs/LogTab.jsx';
import { ResourcesTab } from './components/tabs/ResourcesTab.jsx';
import { AIAssistant } from './components/tabs/AIAssistant.jsx';
import { DashboardIcon, LogIcon, MedsIcon, CalcIcon, ResourcesIcon, AIIcon } from './components/ui/TabIcons.jsx';

const TAB_ICONS = {
  Dashboard:    DashboardIcon,
  LogInjection: LogIcon,
  Medications:  MedsIcon,
  Calculator:   CalcIcon,
  Resources:    ResourcesIcon,
  AIAssistant:  AIIcon,
};

export default function App() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [activeTab, setActiveTab] = useState('Calculator');
  // Placeholders — wired to data layer in a later step
  const [syncStatus] = useState('synced');
  const [pendingCount] = useState(0);

  useEffect(() => {
    // Consume any pending redirect auth result on load (mobile fallback flow)
    getRedirectResult(auth).catch(() => {});
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u);
      setAuthReady(true);
    });
    return unsub;
  }, []);

  if (!authReady) return null;
  if (!user) return <LoginScreen />;

  const firstName = user.displayName ? user.displayName.split(' ')[0].toUpperCase() : 'MY';

  const scText =
    syncStatus === 'synced' ? 'Synced' :
    syncStatus === 'saving' ? 'Saving...' :
    syncStatus === 'error'  ? 'Error – tap 🔄' :
    'Loading...';

  const syncDotStyle =
    syncStatus === 'synced' ? styles.dotSynced :
    syncStatus === 'saving' ? styles.dotSaving :
    syncStatus === 'error'  ? styles.dotError  :
    styles.dotIdle;

  return (
    <View style={styles.root}>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <View style={styles.headerWrap}>
        <View style={styles.headerCard}>

          {/* Title + sync status / logout */}
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>{firstName} TRACKER</Text>
              <View style={styles.syncRow}>
                <View style={[styles.syncDot, syncDotStyle]} />
                <Text style={styles.syncLabel}>{scText}</Text>
              </View>
            </View>
            <Pressable onPress={() => signOut(auth)} style={styles.logoutBtn}>
              <Text style={styles.logoutText}>LOGOUT</Text>
            </Pressable>
          </View>

          {/* Action buttons */}
          <View style={styles.actionRow}>
            <Pressable onPress={() => {}} style={styles.syncBtn}>
              <View style={styles.syncBtnInner}>
                <Text>{syncStatus === 'saving' ? '⏳' : '🔄'}</Text>
                <Text style={styles.syncBtnText}>Sync</Text>
              </View>
              {pendingCount > 0 && <View style={styles.pendingDot} />}
            </Pressable>
            <Pressable onPress={() => {}} style={styles.actionBtn}>
              <Text style={styles.actionBtnText}>💾 Backup</Text>
            </Pressable>
            <Pressable onPress={() => {}} style={styles.actionBtn}>
              <Text style={styles.actionBtnText}>📂 Restore</Text>
            </Pressable>
          </View>

        </View>
      </View>

      {/* ── Scrollable content ─────────────────────────────────────── */}
      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.content}>
        <View style={styles.appContainer}>
          {activeTab === 'Dashboard'     && <Dashboard meds={[]} logs={[]} interactions={[]} today={''} settings={{}} updateSetting={() => {}} onDismissInteraction={() => {}} />}
          {activeTab === 'Log Injection' && <LogTab meds={[]} logs={[]} delLog={() => {}} onEditLog={() => {}} autoLogEnabled={false} toggleAutoLog={() => {}} save={() => {}} today={''} showAddLog={false} setShowAddLog={() => {}} />}
          {activeTab === 'Medications'   && <MedsTab meds={[]} logs={[]} interactions={[]} highInteractions={[]} interactionError={null} onAdd={() => {}} onEdit={() => {}} onTitrate={() => {}} onRemove={() => {}} onSaveMeds={() => {}} onRecheck={() => {}} logDose={() => {}} undoDose={() => {}} today={''} onQueueVial={() => {}} settings={{}} updateSetting={() => {}} />}
          {activeTab === 'Calculator'    && <Calculator />}
          {activeTab === 'Resources'     && <ResourcesTab library={{}} meds={[]} onSaveToLibrary={() => {}} onRemoveFromLibrary={() => {}} onRefreshMed={() => {}} />}
          {activeTab === 'AI Assistant'  && <AIAssistant meds={[]} interactions={[]} onRecheck={() => {}} />}
        </View>
      </ScrollView>

      {/* ── Bottom tab navigation ──────────────────────────────────── */}
      <View style={styles.tabBarWrap}>
        <View style={styles.tabBarCapsule}>
          {NAV_TABS.map(t => {
            const active = activeTab === t.id;
            const Icon = TAB_ICONS[t.iconKey];
            return (
              <Pressable
                key={t.id}
                onPress={() => setActiveTab(t.id)}
                style={[styles.tabBtn, active && styles.tabBtnActive, { color: active ? '#22d3ee' : '#9ca3af' }]}
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

    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#111827',
    minHeight: '100vh',
  },

  // ── Header — full-bleed, no maxWidth constraint ─────────────────
  headerWrap: {
    // TODO: v2 uses linear-gradient(to bottom, #111827 80%, transparent 100%) here.
    // Use expo-linear-gradient when adding native builds.
    backgroundColor: '#111827',
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  headerCard: {
    backgroundColor: 'rgba(31, 41, 55, 0.6)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: 'white',
    letterSpacing: -0.54,   // v2: "-0.03em" at 18px
  },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  syncDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotSynced: { backgroundColor: '#4ade80' },
  dotSaving: { backgroundColor: '#facc15' },
  dotError:  { backgroundColor: '#f87171' },
  dotIdle:   { backgroundColor: '#9ca3af' },
  syncLabel: {
    fontSize: 10,
    color: '#9ca3af',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,     // v2: "0.05em" at 10px
  },
  logoutBtn: {
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    cursor: 'pointer',
  },
  logoutText: {
    color: '#f87171',
    fontSize: 11,
    fontWeight: '800',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  syncBtn: {
    flex: 1,
    position: 'relative',
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.2)',
    borderRadius: 100,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  syncBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  syncBtnText: {
    color: '#22d3ee',
    fontSize: 12,
    fontWeight: '800',
  },
  pendingDot: {
    position: 'absolute',
    top: -2,
    right: 10,
    width: 10,
    height: 10,
    backgroundColor: '#f97316',
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#1f2937',
    boxShadow: '0 0 8px #f97316',
  },
  actionBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 100,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  actionBtnText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '800',
  },

  // ── Content — constrained to 672px matching v2 ─────────────────
  scrollArea: {
    flex: 1,
  },
  content: {
    paddingTop: 16,
    paddingBottom: 40,
  },
  appContainer: {
    width: '100%',
    maxWidth: 672,
    paddingHorizontal: 16,
    alignSelf: 'center',
    flex: 1,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  placeholderText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },

  // ── Tab bar — full-bleed outer, capsule maxWidth 500 ───────────
  tabBarWrap: {
    backgroundColor: '#111827',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    alignItems: 'center',
  },
  tabBarCapsule: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(31, 41, 55, 0.7)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.6)',
    width: '100%',
    maxWidth: 500,            // v2: maxWidth: "500px"
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 100,
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
  tabBtnActive: {
    flex: 1.2,
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    color: '#22d3ee',
    letterSpacing: 0.45,    // "0.05em" at 9px
  },
});
