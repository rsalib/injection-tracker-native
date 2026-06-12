// Desktop navigation sidebar (v123) — M3 Navigation Drawer as a floating
// full-height card. Renders ONLY at ≥1024px (App.jsx swaps it in via
// useIsDesktop()); it absorbs the mobile Header card entirely: branding +
// sync status at the top, the 6 nav destinations in the middle, and the
// Sync / Backup / Restore / LOGOUT actions at the bottom.
//
// Outer wrapper is a raw fixed <div> — RN StyleSheet silently strips
// `position: 'fixed'`, so fixed chrome uses inline-styled DOM wrappers
// (same established pattern as Header, the nav capsule, FAB, ToastHost).
//
// Active-item highlight reads `displayedActiveTab` (not `activeTab`) so the
// sub-project 13 selection cascade animates down the sidebar exactly as it
// does across the mobile capsule.
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Pressable } from './Pressable.jsx';
import { AnimatedTabIcon } from './AnimatedTabIcon.jsx';
import { SyncStatusRow } from './Header.jsx';
import { colors, sidebar, layout } from '../../theme.js';
import { NAV_TABS } from '../../constants.js';

export function Sidebar({
  firstName,
  syncStatus,
  pendingCount,
  onSync,
  onExport,
  onImport,
  onLogout,
  displayedActiveTab,
  onSelectTab,
  medsPulse,
}) {
  return (
    <div style={{ position: 'fixed', top: 12, left: 16, bottom: 12, width: layout.sidebarWidth, zIndex: 100 }}>
      <View style={styles.bar}>

        {/* Branding + sync status */}
        <View style={styles.brand}>
          <Text style={styles.brandTitle}>{firstName} TRACKER</Text>
          <SyncStatusRow syncStatus={syncStatus} />
        </View>

        {/* Navigation destinations */}
        <View style={styles.nav}>
          {NAV_TABS.map(t => {
            const active = displayedActiveTab === t.id;
            return (
              <Pressable
                key={t.id}
                onPress={() => onSelectTab(t.id)}
                accessibilityLabel={t.labelLong}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={[styles.item, active && styles.itemActive, { color: active ? sidebar.iconActive : sidebar.iconInactive }]}
              >
                <AnimatedTabIcon
                  name={t.iconKey}
                  active={active}
                  pulse={t.iconKey === 'Medications' && !active && medsPulse}
                />
                <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>{t.labelLong}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Actions — absorbed from the mobile Header card */}
        <View style={styles.actions}>
          <View style={styles.actionRow}>
            <Pressable onPress={onSync} style={styles.syncBtn}>
              <View style={styles.syncBtnInner}>
                <Text>{syncStatus === 'saving' ? '⏳' : '🔄'}</Text>
                <Text style={styles.actionText}>Sync</Text>
              </View>
              {pendingCount > 0 && <View style={styles.pendingDot} />}
            </Pressable>
            <Pressable onPress={onExport} style={styles.actionBtn}>
              <Text style={styles.actionText}>💾 Backup</Text>
            </Pressable>
          </View>
          <View style={styles.actionRow}>
            {/* Restore — raw HTML label+file-input (DOM-specific), mirrors
                Header.jsx with a distinct input id so the two never collide. */}
            <label style={{ flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: 100, padding: 10, alignItems: 'center', justifyContent: 'center', cursor: 'pointer', display: 'flex', boxSizing: 'border-box' }}>
              <span style={{ color: colors.white, fontSize: 12, fontWeight: 800 }}>📂 Restore</span>
              <input id="sidebar-restore-file-input" name="sidebar-restore-file-input" type="file" accept=".json" style={{ display: 'none' }} onChange={onImport} />
            </label>
            <Pressable onPress={onLogout} style={styles.logoutBtn}>
              <Text style={styles.actionText}>LOGOUT</Text>
            </Pressable>
          </View>
        </View>

      </View>
    </div>
  );
}

const styles = StyleSheet.create({
  bar: {
    ...sidebar.bar,
    height: '100%',
    padding: 16,
    flexDirection: 'column',
  },
  brand: {
    paddingHorizontal: 8,
    paddingBottom: 20,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: -0.54,
  },
  nav: {
    flex: 1,
    gap: 4,
  },
  item: {
    ...sidebar.item,
  },
  itemActive: {
    ...sidebar.itemActive,
  },
  label: {
    ...sidebar.label,
  },
  labelActive: {
    ...sidebar.labelActive,
  },
  actions: {
    gap: 8,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  syncBtn: {
    flex: 1,
    position: 'relative',
    backgroundColor: colors.blueDim,
    borderWidth: 1,
    borderColor: colors.blueMid,
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
  actionBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 100,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  logoutBtn: {
    flex: 1,
    backgroundColor: colors.errorSoft,
    borderRadius: 100,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  actionText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '800',
  },
  pendingDot: {
    position: 'absolute',
    top: -2,
    right: 10,
    width: 10,
    height: 10,
    backgroundColor: colors.syncPending,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.bgMid,
    boxShadow: `0 0 8px ${colors.syncPending}`,
  },
});
