import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import PressableCard from '../ui/PressableCard.jsx';
import { Badge } from '../ui/Badge.jsx';
import { SortBar } from '../ui/SortBar.jsx';
import { ConfirmDialog } from '../ui/ConfirmDialog.jsx';
import { SiteRotation } from '../../SiteRotation.jsx';
import { sortMeds, parseLocalDate, formatDisplayDate, getLocalDate } from '../../constants.js';
import { toMg } from '../../mathEngine.js';
import { InteractionEngine } from '../../services/gemini.js';

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
          confirmBg="#0e7490"
          confirmColor="white"
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
              <PressableCard onPress={() => onQueueVial(m)} style={styles.alertQueueBtn} pressableStyle={{ alignItems: 'center' }}>
                <Text style={styles.alertQueueText}>Queue Next Vial</Text>
              </PressableCard>
              <PressableCard onPress={() => { const u = meds.map(x => x.id === m.id ? { ...x, snoozedAtDoses: currentDoses } : x); onSaveMeds(u); }} style={styles.alertSnoozeBtn} pressableStyle={{ alignItems: 'center' }}>
                <Text style={styles.alertSnoozeText}>Snooze</Text>
              </PressableCard>
            </View>
          </View>
        );
      })}

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        {[
          { v: activeMeds.length, l: 'Protocols', c: '#22d3ee' },
          { v: todayLogs.length,  l: 'Dosed',     c: '#4ade80' },
          { v: logs.length,       l: 'Total',      c: '#c084fc' },
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
                    <Text style={[styles.pctText, { color: pct < 15 ? '#f87171' : '#22d3ee' }]}>{pct}%</Text>
                  </View>
                </View>

                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: pct > 20 ? '#22d3ee' : '#ef4444' }]} />
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
    backgroundColor: '#422006',
    borderWidth: 1,
    borderColor: '#92400e',
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
    color: '#fcd34d',
    fontSize: 16,
    fontWeight: '800',
  },
  alertTitle: {
    color: '#fde68a',
    fontWeight: '600',
    marginBottom: 8,
  },
  alertBody: {
    color: '#fcd34d',
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
    backgroundColor: '#713f12',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    cursor: 'pointer',
  },
  alertQueueText: {
    color: '#fde68a',
    fontWeight: '600',
    fontSize: 14,
  },
  alertSnoozeBtn: {
    backgroundColor: '#422006',
    borderWidth: 1,
    borderColor: '#92400e',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    cursor: 'pointer',
  },
  alertSnoozeText: {
    color: '#fcd34d',
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
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(40px)',
    WebkitBackdropFilter: 'blur(40px)',
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderTopColor: 'rgba(255, 255, 255, 0.25)',
    borderLeftColor: 'rgba(255, 255, 255, 0.12)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 24,
  },
  statLabel: {
    fontSize: 10,
    color: '#9ca3af',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 4,
  },

  // ── Shared bubble ──────────────────────────────────────────────────
  bubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(40px)',
    WebkitBackdropFilter: 'blur(40px)',
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderTopColor: 'rgba(255, 255, 255, 0.25)',
    borderLeftColor: 'rgba(255, 255, 255, 0.12)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
  },
  bubbleTitle: {
    fontWeight: '800',
    fontSize: 18,
    color: 'white',
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
    color: '#6b7280',
    fontSize: 14,
  },

  // ── Schedule ───────────────────────────────────────────────────────
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: 'rgba(17, 24, 39, 0.4)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.03)',
  },
  scheduleItem: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
  },
  scheduleSub: {
    fontSize: 12,
    color: '#9ca3af',
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
    color: 'white',
    letterSpacing: -0.36,
  },

  // ── Protocol list ──────────────────────────────────────────────────
  emptyCard: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: 'rgba(31, 41, 55, 0.2)',
    borderRadius: 32,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  protocolList: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(40px)',
    WebkitBackdropFilter: 'blur(40px)',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderTopColor: 'rgba(255, 255, 255, 0.25)',
    borderLeftColor: 'rgba(255, 255, 255, 0.12)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
  },
  protocolItem: {
    padding: 24,
  },
  protocolItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
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
    color: 'white',
    letterSpacing: -0.4,
    flexShrink: 1,
  },
  sevEmoji: {
    fontSize: 14,
  },
  futureSub: {
    fontSize: 13,
    color: '#9ca3af',
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
    backgroundColor: 'rgba(17, 24, 39, 0.6)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pctText: {
    fontSize: 14,
    fontWeight: '800',
  },
  progressTrack: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 9999,
    height: 8,
    marginBottom: 8,
  },
  progressFill: {
    height: 8,
    borderRadius: 9999,
    boxShadow: '0 0 8px rgba(34, 211, 238, 0.6)',
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
  },

  // ── Recent injections ──────────────────────────────────────────────
  recentTitle: {
    fontWeight: '800',
    fontSize: 16,
    color: 'white',
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
    backgroundColor: 'rgba(17, 24, 39, 0.4)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.03)',
  },
  recentName: {
    fontSize: 14,
    fontWeight: '800',
    color: 'white',
  },
  recentSub: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
    fontWeight: '600',
  },
  recentDate: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '700',
  },
});
