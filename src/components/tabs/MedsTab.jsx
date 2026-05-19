import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Pressable } from '../ui/Pressable.jsx';
import { Badge } from '../ui/Badge.jsx';
import { colors, glass, button } from '../../theme.js';
import { SortBar } from '../ui/SortBar.jsx';
import { ConfirmDialog } from '../ui/ConfirmDialog.jsx';
import { PromptDialog } from '../ui/PromptDialog.jsx';
import { Modal } from '../ui/Modal.jsx';
import { SyringeVisualizer } from '../ui/SyringeVisualizer.jsx';
import { sortMeds, formatDisplayDate, getLocalTime, getActiveDose } from '../../constants.js';
import { toMg, fromMg } from '../../mathEngine.js';
import { InteractionEngine } from '../../services/gemini.js';

export function MedsTab({ meds, logs, interactions, highInteractions, interactionError, onAdd, onEdit, onTitrate, onRemove, onSaveMeds, onRecheck, logDose, undoDose, today, onQueueVial, settings, updateSetting }) {
  const sort = settings?.medsSort || "newest";
  const [checking, setChecking] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(null);
  const [setVialPrompt, setSetVialPrompt] = useState(null);
  const [archiveSearch, setArchiveSearch] = useState("");
  const [confirmEndCycle, setConfirmEndCycle] = useState(null);
  const [expandedMeds, setExpandedMeds] = useState({});
  const [archiveExpanded, setArchiveExpanded] = useState(false);

  const activeMeds = meds.filter(m => !m.isArchived);
  const archivedMeds = meds.filter(m => m.isArchived);
  const sorted = sortMeds(activeMeds, sort);
  const updateSort = v => updateSetting("medsSort", v);
  const actionableInteractions = (Array.isArray(interactions) ? interactions : []).filter(i => i.severity && i.severity !== "none");

  const runCheck = async () => {
    setChecking(true);
    await onRecheck(true);
    setChecking(false);
  };

  const toggleMed = (id) => setExpandedMeds(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <View style={styles.container}>
      {confirmRemove && (
        <ConfirmDialog
          titleText="Remove Protocol?"
          message={`"${confirmRemove.name}" will be permanently removed.`}
          onConfirm={() => { onRemove(confirmRemove.id); setConfirmRemove(null); }}
          onCancel={() => setConfirmRemove(null)}
        />
      )}

      {setVialPrompt && (
        <PromptDialog
          title="Set Vial Volume"
          message={`${setVialPrompt.name} — enter remaining amount in ${setVialPrompt.unit}`}
          initialValue={setVialPrompt.current}
          inputType="number"
          confirmText="Save"
          onCancel={() => setSetVialPrompt(null)}
          onConfirm={(val) => {
            const parsed = parseFloat(val);
            if (isNaN(parsed) || parsed < 0) {
              window.showToast?.("Please enter a valid non-negative number.", "error");
              return;
            }
            const u = meds.map(x => x.id === setVialPrompt.id ? { ...x, vialRemaining: Math.round(parsed * 100) / 100 } : x);
            onSaveMeds(u);
            setSetVialPrompt(null);
          }}
        />
      )}

      {confirmEndCycle && (
        <Modal title="End Cycle?" onClose={() => setConfirmEndCycle(null)}>
          <View style={styles.endCycleBody}>
            <View style={styles.endCycleHeader}>
              <Text style={styles.endCycleIcon}>⏹</Text>
              <Text style={styles.endCycleTitle}>How would you like to end "{confirmEndCycle.name}"?</Text>
              <Text style={styles.endCycleSubtitle}>Finish current vial or archive immediately.</Text>
            </View>
            <Pressable
              onPress={() => { onSaveMeds(meds.map(x => x.id === confirmEndCycle.id ? { ...x, isEndingCycle: true, nextVial: null } : x)); setConfirmEndCycle(null); }}
              style={styles.endCycleBtnFinish}
            >
              <Text style={styles.endCycleBtnTitleFinish}>📉 Finish Current Vial</Text>
              <Text style={styles.endCycleBtnSub}>Auto-archives when remaining amount reaches zero.</Text>
            </Pressable>
            <Pressable
              onPress={() => { onSaveMeds(meds.map(x => x.id === confirmEndCycle.id ? { ...x, isArchived: true, isEndingCycle: false, nextVial: null } : x)); setConfirmEndCycle(null); }}
              style={styles.endCycleBtnNow}
            >
              <Text style={styles.endCycleBtnTitleNow}>🛑 End Immediately</Text>
              <Text style={styles.endCycleBtnSub}>Moves to archive and stops logging now.</Text>
            </Pressable>
            <Pressable onPress={() => setConfirmEndCycle(null)} style={styles.endCycleBtnCancel}>
              <Text style={styles.endCycleBtnCancelText}>CANCEL</Text>
            </Pressable>
          </View>
        </Modal>
      )}

      {/* Primary Action Button */}
      <Pressable onPress={onAdd} style={[styles.createBtn, { justifyContent: 'center' }]}>
        <Text style={styles.createBtnText}>+ CREATE NEW PROTOCOL</Text>
      </Pressable>

      <SortBar sort={sort} setSort={updateSort} />

      {/* Interaction Monitor */}
      {activeMeds.length >= 2 && (
        <View style={[styles.interactionCard, interactionError && styles.interactionCardError]}>
          <View style={styles.interactionCardLeft}>
            <Text style={styles.interactionCardTitle}>AI Interaction Monitor</Text>
            <Text style={[
              styles.interactionCardStatus,
              interactionError ? styles.statusError : actionableInteractions.length > 0 ? styles.statusWarn : styles.statusOk
            ]}>
              {checking
                ? "Analyzing clinical data..."
                : interactionError
                  ? "⚠️ Analysis unavailable — tap Re-check to retry."
                  : actionableInteractions.length > 0
                    ? "ℹ️ Concerns flagged. Expand cards for details."
                    : interactions.length > 0
                      ? "✅ All pairs checked, no concerns."
                      : "✅ No interactions detected."}
            </Text>
          </View>
          <Pressable
            onPress={runCheck}
            disabled={checking}
            style={[styles.recheckBtn, interactionError && styles.recheckBtnError, { alignItems: 'center' }]}
          >
            <Text style={[styles.recheckBtnText, interactionError && styles.recheckBtnTextError]}>
              {checking ? "WAITING..." : "RE-CHECK"}
            </Text>
          </Pressable>
        </View>
      )}

      {/* Active Protocols List */}
      <View style={styles.listContainer}>
        {sorted.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No active protocols tracked.</Text>
          </View>
        ) : (
          sorted.map(m => {
            const isExp = !!expandedMeds[m.id];
            const rem = parseFloat(m.vialRemaining) || 0;
            const vt = parseFloat(m.vialTotal) || 0;
            const pct = vt > 0 ? Math.round((rem / vt) * 100) : 0;

            const at = getActiveDose(m, today);
            const displayDose = at ? parseFloat(at.dose) : parseFloat(m.dose) || 0;
            const displayUnit = at ? at.unit : m.unit;
            const remMg = toMg(rem, m.vialUnit || m.unit);
            const dsMg = toMg(displayDose, displayUnit);
            const usesRem = dsMg > 0 && remMg > 0 ? Math.floor(remMg / dsMg) : 0;

            const bw = parseFloat(m.bwAdded) || 0;
            const vtMg = toMg(vt, m.vialUnit || m.unit);
            const conc = vtMg > 0 && bw > 0 ? vtMg / bw : 0;
            const su = parseFloat(m.syringeUnits || "100");
            const drawMl = conc > 0 && dsMg > 0 ? dsMg / conc : 0;
            const drawU = drawMl > 0 ? Math.round((drawMl / parseFloat(m.syringeMl || "1")) * su) : 0;

            const otherMeds = activeMeds.filter(o => o.id !== m.id);
            const myNames = InteractionEngine.getNormNames(m);
            const medInts = otherMeds.map(other => {
              const otherNames = InteractionEngine.getNormNames(other);
              const tN = (other.name || "").split('(')[0].trim();
              const match = (Array.isArray(interactions) ? interactions : []).find(i =>
                InteractionEngine.pairMatches(i.pair, myNames, otherNames)
              );
              return match ? { ...match, tN } : { tN, severity: "safe", description: "No clinical interactions reported." };
            });

            let maxSev = "none";
            medInts.forEach(i => {
              if (i.severity === "high") maxSev = "high";
              else if (i.severity === "moderate" && maxSev !== "high") maxSev = "moderate";
              else if (i.severity === "mild" && maxSev === "none") maxSev = "mild";
            });

            return (
              <Pressable key={m.id} onPress={() => toggleMed(m.id)} style={styles.medCard}>
                {/* Header */}
                <View style={styles.medCardHeader}>
                  <View style={styles.medCardHeaderTop}>
                    <View style={styles.medCardHeaderLeft}>
                      <View style={styles.medNameRow}>
                        <Text style={styles.medName}>{m.name}</Text>
                        {maxSev === "high" && <Text style={styles.sevEmoji}>🔴</Text>}
                        {maxSev === "moderate" && <Text style={styles.sevEmoji}>🟠</Text>}
                        {maxSev === "mild" && <Text style={styles.sevEmoji}>🟡</Text>}
                      </View>
                      <View style={styles.badgeRow}>
                        {m.startDate && m.startDate > today && <Badge label={`Starts: ${formatDisplayDate(m.startDate)}`} color="gray" />}
                        {m.isTitrating && <Badge label="Titrating" color="purple" />}
                        {m.isEndingCycle && <Badge label="Ending Cycle" color="red" />}
                        {m.nextVial && !m.isEndingCycle && <Badge label="QUEUED" color="yellow" />}
                      </View>
                    </View>
                    <View style={styles.medCardHeaderRight}>
                      <View style={styles.pctBadge}>
                        <Text style={[styles.pctText, pct < 15 && styles.pctTextLow]}>{pct}%</Text>
                      </View>
                      <Text style={styles.chevron}>{isExp ? "▲" : "▼"}</Text>
                    </View>
                  </View>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: pct > 20 ? colors.blue : colors.errorStrong }]} />
                  </View>
                  <View style={styles.progressLabels}>
                    <Text style={styles.progressLabelText}>{rem.toFixed(2)} {m.vialUnit || m.unit} Left</Text>
                    <Text style={styles.progressLabelText}>~{usesRem} doses left</Text>
                  </View>
                </View>

                {/* Expanded Details */}
                {isExp && (
                  <View style={styles.expandedSection} pointerEvents="box-none">
                    {/* Metrics Grid */}
                    <View style={styles.metricsCard}>
                      <View style={styles.metricsGrid}>
                        <View style={styles.metricItem}>
                          <Text style={styles.metricLabel}>Current Dose</Text>
                          <Text style={styles.metricValue}>{displayDose} {displayUnit}</Text>
                        </View>
                        <View style={styles.metricItem}>
                          <Text style={styles.metricLabel}>Location</Text>
                          <Text style={styles.metricValue}>{m.site}</Text>
                        </View>
                      </View>
                    </View>

                    {/* Syringe Visualizer */}
                    {conc > 0 && (
                      <View style={styles.syringeCard}>
                        <View style={styles.metricsGrid}>
                          <View style={styles.metricItem}>
                            <Text style={styles.syringeMetricLabel}>Concentration</Text>
                            <Text style={styles.syringeMetricValue}>{fromMg(conc, m.vialUnit || m.unit).toFixed(2)} {m.vialUnit || m.unit}/mL</Text>
                          </View>
                          <View style={styles.metricItem}>
                            <Text style={styles.syringeMetricLabel}>Draw Volume</Text>
                            <Text style={styles.syringeMetricValue}>{drawU} units</Text>
                          </View>
                        </View>
                        <SyringeVisualizer units={drawU} maxUnits={su} ml={drawMl} />
                      </View>
                    )}

                    {/* Safety Monitor */}
                    {medInts.length > 0 && (
                      <View style={styles.safetyCard}>
                        <Text style={styles.safetyLabel}>Safety Monitor</Text>
                        <View style={styles.safetyList}>
                          {medInts.map((i, idx) => (
                            <View key={idx} style={styles.safetyItem}>
                              <View style={styles.safetyItemHeader}>
                                <Text style={styles.safetyItemName}>{i.tN}</Text>
                                <Badge
                                  label={(!i.severity || ["none", "safe"].includes(i.severity.toLowerCase()) ? "SAFE" : i.severity).toUpperCase()}
                                  color={i.severity === "high" ? "red" : i.severity === "moderate" ? "orange" : i.severity === "mild" ? "yellow" : "green"}
                                />
                              </View>
                              <Text style={styles.safetyItemDesc}>{i.description}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}

                    {/* Action Hub */}
                    <View style={styles.actionHub}>
                      <View style={styles.actionRow2}>
                        <Pressable
                          onPress={() => logDose(m, today, getLocalTime(), displayDose, displayUnit, m.site, "Manual dose")}
                          style={styles.useDoseBtn}
                        >
                          <Text style={styles.useDoseBtnText}>USE DOSE</Text>
                        </Pressable>
                        <Pressable onPress={() => undoDose(m.id)} style={styles.undoBtn}>
                          <Text style={styles.undoBtnText}>UNDO LAST</Text>
                        </Pressable>
                      </View>
                      <View style={styles.actionRow2}>
                        <Pressable
                          onPress={() => setSetVialPrompt({ id: m.id, name: m.name, unit: m.vialUnit || m.unit, current: rem })}
                          style={styles.smBtn}
                        >
                          <Text style={styles.smBtnText}>SET VIAL</Text>
                        </Pressable>
                        {!m.isEndingCycle && (
                          <Pressable onPress={() => onQueueVial(m)} style={styles.smBtnCyan}>
                            <Text style={styles.smBtnCyanText}>NEW VIAL</Text>
                          </Pressable>
                        )}
                      </View>
                      <View style={styles.actionRow4}>
                        <Pressable onPress={() => onEdit(m)} style={styles.xsBtn}>
                          <Text style={styles.xsBtnText}>EDIT</Text>
                        </Pressable>
                        <Pressable onPress={() => onTitrate(m)} style={styles.xsBtnPurple}>
                          <Text style={styles.xsBtnPurpleText}>TITRATE</Text>
                        </Pressable>
                        <Pressable onPress={() => setConfirmEndCycle(m)} style={styles.xsBtnRed}>
                          <Text style={styles.xsBtnRedText}>{m.isEndingCycle ? "RESUME" : "END"}</Text>
                        </Pressable>
                        <Pressable onPress={() => setConfirmRemove(m)} style={styles.xsBtnRed}>
                          <Text style={styles.xsBtnRedText}>REMOVE</Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                )}
              </Pressable>
            );
          })
        )}
      </View>

      {/* Archived Cycles */}
      {archivedMeds.length > 0 && (() => {
        const q = (archiveSearch || "").trim().toLowerCase();
        const filteredArchive = q
          ? archivedMeds.filter(m => (m.name || "").toLowerCase().includes(q))
          : archivedMeds;
        return (
          <View style={styles.archiveSection}>
            <Pressable onPress={() => setArchiveExpanded(!archiveExpanded)} style={styles.archiveToggle}>
              <Text style={styles.archiveToggleText}>Archived Cycles ({archivedMeds.length})</Text>
              <Text style={styles.chevronGray}>{archiveExpanded ? "▲" : "▼"}</Text>
            </Pressable>

            {archiveExpanded && (
              <View style={styles.archiveList}>
                {archivedMeds.length > 3 && (
                  <TextInput id="field-medstab-17" name="field-medstab-17" nativeID="field-medstab-17"
                    placeholder="Filter archive by name..."
                    placeholderTextColor={colors.textMuted}
                    value={archiveSearch}
                    onChangeText={setArchiveSearch}
                    style={styles.archiveSearch}
                  />
                )}
                <View style={styles.archiveItems}>
                  {filteredArchive.length === 0 ? (
                    <Text style={styles.archiveEmpty}>No archived cycles match "{archiveSearch}".</Text>
                  ) : filteredArchive.map(m => (
                    <View key={m.id} style={styles.archiveItem}>
                      <View>
                        <Text style={styles.archiveItemName}>{m.name}</Text>
                        <Text style={styles.archiveItemSub}>Ended Cycle · {formatDisplayDate(m.startDate)}</Text>
                      </View>
                      <View style={styles.archiveItemActions}>
                        <Pressable onPress={() => onQueueVial(m)} style={[styles.archiveRestartBtn, { alignItems: 'center' }]}>
                          <Text style={styles.archiveRestartText}>RESTART</Text>
                        </Pressable>
                        <Pressable onPress={() => setConfirmRemove(m)} style={[styles.archiveDeleteBtn, { alignItems: 'center' }]}>
                          <Text style={styles.archiveDeleteText}>DELETE</Text>
                        </Pressable>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        );
      })()}
    </View>
  );
}

export default MedsTab;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    gap: 16,
  },
  createBtn: {
    ...button.primary,
    width: '100%',
    cursor: 'pointer',
  },
  createBtnText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '900',
  },
  interactionCard: {
    ...glass.card,
    borderRadius: 32,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  interactionCardError: {
    backgroundColor: colors.errorDeepBg,
    borderColor: colors.errorDark,
  },
  interactionCardLeft: {
    flex: 1,
    minWidth: 0,
  },
  interactionCardTitle: {
    fontWeight: '800',
    fontSize: 16,
    color: colors.white,
    letterSpacing: -0.32,
  },
  interactionCardStatus: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  statusError: { color: colors.errorLight },
  statusWarn: { color: colors.textSecondary },
  statusOk: { color: colors.textGreen },
  recheckBtn: {
    backgroundColor: colors.blueDim,
    borderRadius: 100,
    paddingVertical: 8,
    paddingHorizontal: 16,
    cursor: 'pointer',
  },
  recheckBtnError: {
    backgroundColor: colors.errorStrongBg,
  },
  recheckBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.blue,
  },
  recheckBtnTextError: {
    color: colors.error,
  },
  listContainer: {
    flexDirection: 'column',
    gap: 16,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: colors.surfaceEmpty,
    borderRadius: 32,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderSubtle,
  },
  emptyStateText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  medCard: {
    ...glass.card,
    borderRadius: 32,
    overflow: 'hidden',
  },
  medCardHeader: {
    padding: 24,
    cursor: 'pointer',
  },
  medCardHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  medCardHeaderLeft: {
    flex: 1,
  },
  medNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  medName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: -0.4,
  },
  sevEmoji: {
    fontSize: 14,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  medCardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pctBadge: {
    backgroundColor: colors.surfaceMid,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  pctText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.blue,
  },
  pctTextLow: {
    color: colors.error,
  },
  chevron: {
    color: colors.textSecondary,
    fontSize: 14,
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
  progressLabelText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  expandedSection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    flexDirection: 'column',
    gap: 16,
  },
  metricsCard: {
    backgroundColor: colors.surfaceDeep,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderFaint,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  metricItem: {
    flex: 1,
  },
  metricLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.white,
  },
  syringeCard: {
    backgroundColor: colors.tealDeep,
    borderWidth: 1,
    borderColor: colors.tealBorder,
    borderRadius: 24,
    padding: 16,
  },
  syringeMetricLabel: {
    color: colors.blue,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  syringeMetricValue: {
    fontWeight: '700',
    color: colors.white,
    fontSize: 14,
  },
  safetyCard: {
    backgroundColor: colors.surfaceDeep,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderFaint,
  },
  safetyLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  safetyList: {
    flexDirection: 'column',
    gap: 8,
  },
  safetyItem: {
    padding: 12,
    borderRadius: 16,
    backgroundColor: colors.shadowSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  safetyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  safetyItemName: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.white,
  },
  safetyItemDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 15,
  },
  actionHub: {
    flexDirection: 'column',
    gap: 10,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionRow2: {
    flexDirection: 'row',
    gap: 10,
  },
  actionRow4: {
    flexDirection: 'row',
    gap: 8,
  },
  useDoseBtn: {
    ...button.primary,
    flex: 1,
    boxShadow: `0 4px 12px ${colors.blueBorder}, inset 0 1px 0 ${colors.borderHighlight}`,
    cursor: 'pointer',
  },
  useDoseBtnText: {
    color: colors.white,
    fontWeight: '900',
    fontSize: 13,
  },
  undoBtn: {
    ...button.secondary,
    flex: 1,
    cursor: 'pointer',
  },
  undoBtnText: {
    ...button.secondaryText,
  },
  smBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    cursor: 'pointer',
  },
  smBtnText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 11,
  },
  smBtnCyan: {
    flex: 1,
    backgroundColor: colors.blueDim,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    cursor: 'pointer',
  },
  smBtnCyanText: {
    color: colors.blue,
    fontWeight: '800',
    fontSize: 11,
  },
  xsBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    cursor: 'pointer',
  },
  xsBtnText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 10,
  },
  xsBtnPurple: {
    flex: 1,
    backgroundColor: colors.purpleDeepSoft,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    cursor: 'pointer',
  },
  xsBtnPurpleText: {
    color: colors.purpleLight,
    fontWeight: '800',
    fontSize: 10,
  },
  xsBtnRed: {
    flex: 1,
    backgroundColor: colors.errorFaintBg,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    cursor: 'pointer',
  },
  xsBtnRedText: {
    color: colors.error,
    fontWeight: '800',
    fontSize: 10,
  },
  archiveSection: {
    marginTop: 16,
  },
  archiveToggle: {
    width: '100%',
    backgroundColor: colors.surfaceRow,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    cursor: 'pointer',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  archiveToggleText: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chevronGray: {
    color: colors.textMuted,
    fontSize: 12,
  },
  archiveList: {
    marginTop: 12,
  },
  archiveSearch: {
    backgroundColor: colors.borderFaint,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 100,
    paddingVertical: 10,
    paddingHorizontal: 16,
    color: colors.white,
    fontSize: 14,
    marginBottom: 12,
  },
  archiveItems: {
    flexDirection: 'column',
    gap: 12,
  },
  archiveEmpty: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 16,
  },
  archiveItem: {
    backgroundColor: colors.surfaceEmpty,
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderFaint,
  },
  archiveItemName: {
    fontWeight: '800',
    color: colors.white,
    fontSize: 15,
  },
  archiveItemSub: {
    marginTop: 2,
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  archiveItemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  archiveRestartBtn: {
    backgroundColor: colors.blueDim,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 100,
    cursor: 'pointer',
  },
  archiveRestartText: {
    color: colors.blue,
    fontSize: 12,
    fontWeight: '800',
  },
  archiveDeleteBtn: {
    backgroundColor: colors.errorFaintBg,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 100,
    cursor: 'pointer',
  },
  archiveDeleteText: {
    color: colors.error,
    fontSize: 12,
    fontWeight: '800',
  },
  // End cycle modal styles
  endCycleBody: {
    flexDirection: 'column',
    gap: 16,
  },
  endCycleHeader: {
    alignItems: 'center',
  },
  endCycleIcon: {
    fontSize: 36,
    marginBottom: 12,
  },
  endCycleTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  endCycleSubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  endCycleBtnFinish: {
    backgroundColor: colors.yellowDeep,
    borderWidth: 1,
    borderColor: colors.orangeDarkBorder,
    borderRadius: 16,
    padding: 16,
    cursor: 'pointer',
  },
  endCycleBtnTitleFinish: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textAmber,
  },
  endCycleBtnNow: {
    backgroundColor: colors.errorDarkMid,
    borderWidth: 1,
    borderColor: colors.errorDarkBorder,
    borderRadius: 16,
    padding: 16,
    cursor: 'pointer',
  },
  endCycleBtnTitleNow: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.errorLight,
  },
  endCycleBtnSub: {
    fontSize: 12,
    opacity: 0.8,
    color: colors.white,
    marginTop: 4,
  },
  endCycleBtnCancel: {
    ...button.secondary,
    cursor: 'pointer',
  },
  endCycleBtnCancelText: {
    ...button.secondaryText,
  },
});
