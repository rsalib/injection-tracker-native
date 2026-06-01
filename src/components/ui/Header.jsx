import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Pressable } from './Pressable.jsx';
import { colors, type } from '../../theme.js';

export function Header({
  firstName,
  syncStatus,
  pendingCount,
  onSync,
  onExport,
  onImport,
  onLogout,
}) {
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
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}>
      <View className="header-wrap" style={[styles.headerWrap, { paddingTop: 'max(16px, env(safe-area-inset-top))' }]} onStartShouldSetResponder={() => true}>
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
            <Pressable onPress={onLogout} style={[styles.logoutBtn, { alignItems: 'center' }]}>
              <Text style={styles.logoutText}>LOGOUT</Text>
            </Pressable>
          </View>

          {/* Action buttons */}
          <View style={styles.actionRow}>
            <Pressable onPress={onSync} style={styles.syncBtn}>
              <View style={styles.syncBtnInner}>
                <Text>{syncStatus === 'saving' ? '⏳' : '🔄'}</Text>
                <Text style={styles.syncBtnText}>Sync</Text>
              </View>
              {pendingCount > 0 && <View style={styles.pendingDot} />}
            </Pressable>

            <Pressable onPress={onExport} style={styles.actionBtn}>
              <Text style={styles.actionBtnText}>💾 Backup</Text>
            </Pressable>

            {/* Restore — raw HTML label+file-input (DOM-specific) */}
            <label style={{ flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: 100, padding: 10, alignItems: 'center', justifyContent: 'center', cursor: 'pointer', display: 'flex', boxSizing: 'border-box' }}>
              <span style={{ color: colors.white, fontSize: 12, fontWeight: 800 }}>📂 Restore</span>
              <input id="restore-file-input" name="restore-file-input" type="file" accept=".json" style={{ display: 'none' }} onChange={onImport} />
            </label>
          </View>

        </View>
      </View>
    </div>
  );
}

const styles = StyleSheet.create({
  headerWrap: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 10,
    touchAction: 'none',
  },
  // Sub-project 22 (v95): headerCard retinted to opaque M3 tonal surface + M3
  // elevation2 shadow, completing the Liquid Glass → M3 migration. backdropFilter
  // dropped — no translucency to blur. surfaceContainerHigh (slate-700) sits one
  // tonal step above the standard card surface, distinguishing the header chrome
  // from the scrolling content cards below.
  headerCard: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderTopColor: colors.borderHighTop,
    borderLeftColor: colors.borderHighLeft,
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3), 0 2px 6px 2px rgba(0, 0, 0, 0.15)', // elevation2
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: -0.54,
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
  dotSynced: { backgroundColor: colors.success, boxShadow: `0 0 8px ${colors.blueHeavy}, 0 0 16px ${colors.blueDeep}` },
  dotSaving: { backgroundColor: colors.syncSaving },
  dotError:  { backgroundColor: colors.error },
  dotIdle:   { backgroundColor: colors.textSecondary },
  syncLabel: {
    ...type.microLabel,
  },
  logoutBtn: {
    backgroundColor: colors.errorSoft,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    cursor: 'pointer',
  },
  logoutText: {
    color: colors.white,
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
  syncBtnText: {
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
  actionBtnText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '800',
  },
});
