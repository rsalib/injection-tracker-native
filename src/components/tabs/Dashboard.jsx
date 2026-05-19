import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Pressable } from '../ui/Pressable.jsx';
import { Badge } from '../ui/Badge.jsx';
import { SortBar } from '../ui/SortBar.jsx';
import { ConfirmDialog } from '../ui/ConfirmDialog.jsx';
import { SiteRotation } from '../../SiteRotation.jsx';
import { sortMeds, parseLocalDate, formatDisplayDate, getLocalDate } from '../../constants.js';
import { toMg } from '../../mathEngine.js';
import { InteractionEngine } from '../../services/gemini.js';
import { colors, glass } from '../../theme.js';

export function Dashboard({ meds, logs, schedule, todayLogs, highInteractions, actionableInteractions, onAlertClick, onSaveMeds, logDose, undoDose, today, onQueueVial, settings, updateSetting }) {
  const sort = settings?.dashSort || 'newest';
  const [confirmStartNow, setConfirmStartNow] = useState(null);

  const activeMeds = meds.filter(m => !m.isArchived);
  const sorted = sortMeds(activeMeds, sort);
  const updateSort = v => updateSetting('dashSort', v);

  const currentD = parseLocalDate(today);
  const dayNameToday = currentD.toLocaleDateString('en-US', { weekday: 'long' });
  const nextD = new Date(currentD);
  nextD.setDate(currentD.getDate() + 1);
  const dayNameTomorrow = nextD.toLocaleDateString('en-US', { weekday: 'long' });

  const todaysDueMeds = sorted.filter(m => {
    const isScheduledToday = Array.isArray(m.scheduleDays) && m.scheduleDays.includes(dayNameToday);
    const hasLoggedToday = todayLogs.some(l => l.medId === m.id);
    const isActive = !m.startDate || m.startDate <= today;
    const inStandalone = schedule.some(s => s.medId === m.id && s.days?.includes(dayNameToday));
    return isActive && (isScheduledToday || hasLoggedToday) && !inStandalone;
  });

  return (
    <View style={styles.root}>

      {confirmStartNow && (
        <ConfirmDialog
          titleIcon="📦"
          titleText="Activate Queued Vial?"
          message={`This will permanently discard the ${parseFloat(confirmStartNow.vialRemaining || 0).toFixed(2)} ${confirmStartNow.vialUnit || confirmStartNow.unit} remaining in your current vial.`}
          confirmText="Activate Now"
          confirmBg={colors.primary}
          confirmColor={colors.white}
          onCancel={() => setConfirmStartNow(null)}
          onConfirm={() => {
            const u = meds.map(x => {
              if (x.id === confirmStartNow.id && x.nextVial) {
                return { ...x, vialTotal: x.nextVial.vialTotal, vialRemaining: x.nextVial.vialTotal, bwAdded: x.nextVial.bwAdded, startDate: getLocalDate(), subPeptides: x.nextVial.subPeptides || x.subPeptides, nextVial: null, isAlertDismissed: false, snoozedAtDoses: undefined };
              }
              return x;
            });
            onSaveMeds(u);
            setConfirmStartNow(null);
            window.showToast?.('Queued vial activated!', 'success');
          }}
        />
      )}

      {/* Low Inventory Alerts */}
      {sorted.filter(m => {
        const remMg = toMg(parseFloat(m.vialRemaining) || 0, m.vialUnit || m.unit);
        const doseMg = toMg(parseFloat(m.dose) || 0, m.unit);
        const currentDoses = doseMg > 0 ? Math.floor(remMg / doseMg) : 0;
        const isSnoozed = m.snoozedAtDoses !== undefined && currentDoses <= m.snoozedAtDoses;
        const isActive = !m.startDate || m.startDate <= today;
        const diff = (parseFloat(m.vialTotal) || 0) - (parseFloat(m.vialRemaining) || 0);
        const isStarted = diff > 0.01;
        return isActive && isStarted && currentDoses <= 4 && !m.nextVial && !m.isEndingCycle && !m.isAlertDismissed && !isSnoozed;
      }).map(m => {
        const remMg = toMg(parseFloat(m.vialRemaining) || 0, m.vialUnit || m.unit);
        const doseMg = toMg(parseFloat(m.dose) || 0, m.unit);
        const currentDoses = doseMg > 0 ? Math.floor(remMg / doseMg) : 0;
        return (
          <View key={`alert-${m.id}`} style={styles.alertCard}>
            <Pressable onPress={() => { const u = meds.map(x => x.id === m.id ? { ...x, isAlertDismissed: true } : x); onSaveMeds(u); }} style={styles.alertDismiss}>
              <Text style={styles.alertDismissText}>✕</Text>
            </Pressable>
            <Text style={styles.alertTitle}>⚠️ Low Inventory</Text>
            <Text style={styles.alertBody}>You have {currentDoses} doses left of <Text style={styles.bold}>{m.name}</Text>.</Text>
            <View style={styles.alertActions}>
              <Pressable onPress={() => onQueueVial(m)} style={styles.alertQueueBtn}>
                <Text style={styles.alertQueueText}>Queue Next Vial</Text>
              </Pressable>
              <Pressable onPress={() => { const u = meds.map(x => x.id === m.id ? { ...x, snoozedAtDoses: currentDoses } : x); onSaveMeds(u); }} style={styles.alertSnoozeBtn}>
                <Text style={styles.alertSnoozeText}>Snooze</Text>
              </Pressable>
            </View>
          </View>
        );
      })}

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        {[
          { v: activeMeds.length, l: 'Protocols', c: colors.blue },
          { v: todayLogs.length,  l: 'Dosed',     c: colors.success },
          { v: logs.length,       l: 'Total',      c: colors.purple },
        ].map(({ v, l, c }) => (
          <View key={l} style={styles.statCard}>
            <Text style={[styles.statValue, { color: c }]}>{v}</Text>
            <Text style={styles.statLabel}>{l}</Text>
          </View>
        ))}
      </View>

      {/* Today's Schedule */}
      <View style={styles.bubble}>
        <Text style={styles.bubbleTitle}>Today's Schedule</Text>
        {schedule.length === 0 && todaysDueMeds.length === 0 ? (
          <Text style={styles.empty}>Clear schedule today.</Text>
        ) : (
          <View style={styles.col12}>
            {schedule.map(s => {
              const done = todayLogs.some(l => l.medId === s.medId);
              return (
                <View key={s.id} style={styles.scheduleRow}>
                  <View>
                    <Text style={styles.scheduleItem}>{s.medName}</Text>
                    <Text style={styles.scheduleSub}>{s.dose}{s.unit} • {s.time}</Text>
                  </View>
                  <Badge label={done ? '✓ Done' : 'Due Today'} color={done ? 'green' : 'blue'} />
                </View>
              );
            })}
            {todaysDueMeds.map(m => {
              const done = todayLogs.some(l => l.medId === m.id);
              return (
                <View key={`td-${m.id}`} style={styles.scheduleRow}>
                  <View>
                    <Text style={styles.scheduleItem}>{m.name}</Text>
                    <Text style={styles.scheduleSub}>Protocol Requirement</Text>
                  </View>
                  <Badge label={done ? '✓ Dosed Today' : 'Due Today'} color={done ? 'green' : 'blue'} />
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Active Protocols Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Active Protocols</Text>
        <SortBar sort={sort} setSort={updateSort} />
      </View>

      {/* Active Protocols List */}
      {sorted.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.empty}>No active protocols tracked.</Text>
        </View>
      ) : (
        <View style={styles.protocolList}>
          {sorted.map((m, index) => {
            const isLastItem = index === sorted.length - 1;
            const rem = parseFloat(m.vialRemaining) || 0;
            const vt = parseFloat(m.vialTotal) || 0;
            const pct = vt > 0 ? Math.round((rem / vt) * 100) : 0;

            const displayDose = parseFloat(m.dose) || 0;
            const remMg = toMg(rem, m.vialUnit || m.unit);
            const doseMg = toMg(displayDose, m.unit);
            const dosesLeft = doseMg > 0 ? Math.floor(remMg / doseMg) : 0;

            const isScheduledToday = Array.isArray(m.scheduleDays) && m.scheduleDays.includes(dayNameToday);
            const isScheduledTomorrow = Array.isArray(m.scheduleDays) && m.scheduleDays.includes(dayNameTomorrow);
            const hasLoggedToday = todayLogs.some(l => l.medId === m.id);
            const isFuture = m.startDate && m.startDate > today;
            const showDueToday = !isFuture && isScheduledToday && !hasLoggedToday && (!m.isEndingCycle || dosesLeft > 0);
            const showDueTomorrow = !isFuture && isScheduledTomorrow && (!m.isEndingCycle || dosesLeft > (showDueToday ? 1 : 0));
            const showDosedToday = hasLoggedToday;
            const showEndingCycle = !!m.isEndingCycle;
            const showQueuePrompt = !isFuture && !showEndingCycle && dosesLeft <= 4 && !m.nextVial && (vt - rem > 0.01);

            let maxSev = 'none';
            const otherMeds = activeMeds.filter(o => o.id !== m.id);
            const myNames = InteractionEngine.getNormNames(m);
            otherMeds.forEach(other => {
              const otherNames = InteractionEngine.getNormNames(other);
              const match = (Array.isArray(actionableInteractions) ? actionableInteractions : []).find(i =>
                InteractionEngine.pairMatches(i.pair, myNames, otherNames)
              );
              if (match) {
                if (match.severity === 'high') maxSev = 'high';
                else if (match.severity === 'moderate' && maxSev !== 'high') maxSev = 'moderate';
                else if (match.severity === 'mild' && maxSev === 'none') maxSev = 'mild';
              }
            });

            return (
              <View key={m.id} style={[styles.protocolItem, !isLastItem && styles.protocolItemBorder]}>
                <View style={styles.protocolHeader}>
                  <View style={styles.protocolLeft}>
                    <View style={styles.protocolNameRow}>
                      <Text style={styles.protocolName}>{m.name}</Text>
                      {maxSev === 'high'     && <Text style={styles.sevEmoji}>🔴</Text>}
                      {maxSev === 'moderate' && <Text style={styles.sevEmoji}>🟠</Text>}
                      {maxSev === 'mild'     && <Text style={styles.sevEmoji}>🟡</Text>}
                    </View>

                    {isFuture && <Text style={styles.futureSub}>Starts: {formatDisplayDate(m.startDate)}</Text>}

                    {!isFuture && (
                      <View style={[styles.badgeRow, { minHeight: (showDueToday || showDueTomorrow || showDosedToday || showEndingCycle || showQueuePrompt) ? 0 : 30 }]}>
                        {showDosedToday   && <Badge label="✓ Dosed Today"  color="green"  />}
                        {showDueToday     && <Badge label="Due Today"        color="blue"   />}
                        {showDueTomorrow  && <Badge label="Due Tomorrow"     color="blue"   />}
                        {showEndingCycle  && <Badge label="Ending Cycle"     color="red"    />}
                        {showQueuePrompt  && <Badge label="Queue New Vial"   color="yellow" />}
                      </View>
                    )}
                  </View>

                  <View style={styles.pctPill}>
                    <Text style={[styles.pctText, { color: pct < 15 ? colors.error : colors.blue }]}>{pct}%</Text>
                  </View>
                </View>

                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: pct > 20 ? colors.blue : colors.errorStrong }]} />
                </View>

                <View style={styles.progressLabels}>
                  <Text style={styles.progressLabel}>{rem.toFixed(2)} {m.vialUnit || m.unit} left</Text>
                  <Text style={styles.progressLabel}>~{dosesLeft} doses left</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      <SiteRotation logs={logs} />

      {/* Recent Injections */}
      <View style={styles.bubble}>
        <Text style={styles.recentTitle}>Recent Injections</Text>
        {logs.length === 0 ? (
          <Text style={[styles.empty, { textAlign: 'center', paddingVertical: 20 }]}>No history found.</Text>
        ) : (
          <View style={styles.col8}>
            {[...logs].reverse().slice(0, 5).map(l => (
              <View key={l.id} style={styles.recentRow}>
                <View>
                  <Text style={styles.recentName}>{l.medName}</Text>
                  <Text style={styles.recentSub}>{l.site} • {l.dose}{l.unit}</Text>
                </View>
                <Text style={styles.recentDate}>{formatDisplayDate(l.date)}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

    </View>
  );
}

export default Dashboard;

const styles = StyleSheet.create({
  root: {
    gap: 16,
  },

  // ── Alerts ─────────────────────────────────────────────────────────
  alertCard: {
    backgroundColor: colors.orangeDarkBg,
    borderWidth: 1,
    borderColor: colors.orangeDarkBorder,
    borderRadius: 12,
    padding: 16,
  },
  alertDismiss: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4,
    cursor: 'pointer',
  },
  alertDismissText: {
    color: colors.textYellow,
    fontSize: 16,
    fontWeight: '800',
  },
  alertTitle: {
    color: colors.textAmber,
    fontWeight: '600',
    marginBottom: 8,
  },
  alertBody: {
    color: colors.textYellow,
    fontSize: 14,
    marginBottom: 12,
    paddingRight: 24,
  },
  bold: {
    fontWeight: '800',
  },
  alertActions: {
    flexDirection: 'row',
    gap: 8,
  },
  alertQueueBtn: {
    flex: 1,
    backgroundColor: colors.yellowDarkBorder,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    cursor: 'pointer',
  },
  alertQueueText: {
    color: colors.textAmber,
    fontWeight: '600',
    fontSize: 14,
  },
  alertSnoozeBtn: {
    backgroundColor: colors.orangeDarkBg,
    borderWidth: 1,
    borderColor: colors.orangeDarkBorder,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    cursor: 'pointer',
  },
  alertSnoozeText: {
    color: colors.textYellow,
    fontWeight: '600',
    fontSize: 14,
  },

  // ── Stats ──────────────────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  statCard: {
    ...glass.card,
    flex: 1,
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 24,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 4,
  },

  // ── Shared bubble ──────────────────────────────────────────────────
  bubble: {
    ...glass.card,
    borderRadius: 32,
    padding: 24,
  },
  bubbleTitle: {
    fontWeight: '800',
    fontSize: 18,
    color: colors.white,
    marginBottom: 16,
    letterSpacing: -0.36,
  },
  col12: {
    gap: 12,
  },
  col8: {
    gap: 8,
  },
  empty: {
    color: colors.textMuted,
    fontSize: 14,
  },

  // ── Schedule ───────────────────────────────────────────────────────
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: colors.surfaceRow,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderFaint,
  },
  scheduleItem: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
  scheduleSub: {
    fontSize: 12,
    color: colors.textSecondary,
  },

  // ── Section header ─────────────────────────────────────────────────
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  sectionTitle: {
    fontWeight: '800',
    fontSize: 18,
    color: colors.white,
    letterSpacing: -0.36,
  },

  // ── Protocol list ──────────────────────────────────────────────────
  emptyCard: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: colors.surfaceEmpty,
    borderRadius: 32,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderSubtle,
  },
  protocolList: {
    ...glass.card,
    borderRadius: 32,
    overflow: 'hidden',
  },
  protocolItem: {
    padding: 24,
  },
  protocolItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  protocolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  protocolLeft: {
    flex: 1,
  },
  protocolNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  protocolName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: -0.4,
    flexShrink: 1,
  },
  sevEmoji: {
    fontSize: 14,
  },
  futureSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    fontWeight: '600',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  pctPill: {
    backgroundColor: colors.surfaceMid,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pctText: {
    fontSize: 14,
    fontWeight: '800',
  },
  progressTrack: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 9999,
    height: 8,
    marginBottom: 8,
  },
  progressFill: {
    height: 8,
    borderRadius: 9999,
    boxShadow: `0 0 8px ${colors.blueGlass}`,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },

  // ── Recent injections ──────────────────────────────────────────────
  recentTitle: {
    fontWeight: '800',
    fontSize: 16,
    color: colors.white,
    textTransform: 'uppercase',
    letterSpacing: 1.6,
    marginBottom: 16,
  },
  recentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.surfaceRow,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderFaint,
  },
  recentName: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.white,
  },
  recentSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    fontWeight: '600',
  },
  recentDate: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '700',
  },
});
