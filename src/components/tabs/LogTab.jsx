import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Pressable } from '../ui/Pressable.jsx';
import { formatDisplayDate } from '../../constants.js';
import { button } from '../../theme.js';
import { auth } from '../../services/firebase.js';
import { appCheck } from '../../services/firebase.js';
import { getToken as getAppCheckToken } from 'firebase/app-check';

const CALENDAR_TOKEN_URL = "https://getcalendartoken-pl4s2cxu2a-uc.a.run.app";
const CALENDAR_FEED_URL = "https://getcalendarfeed-pl4s2cxu2a-uc.a.run.app";

async function getSubscribeURL() {
  const user = auth.currentUser;
  if (!user) throw new Error("Not signed in");
  const idToken = await user.getIdToken();
  const { token: acToken } = await getAppCheckToken(appCheck, false).catch(() => ({ token: '' }));
  const res = await fetch(CALENDAR_TOKEN_URL, {
    headers: { Authorization: `Bearer ${idToken}`, "X-Firebase-AppCheck": acToken }
  });
  if (!res.ok) throw new Error("Failed to get calendar token");
  const { uid, token } = await res.json();
  return `${CALENDAR_FEED_URL}?uid=${uid}&token=${token}`;
}

export function exportICS(meds) {
  const DM = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6, Sunday: 0 };
  const BD = { Monday: "MO", Tuesday: "TU", Wednesday: "WE", Thursday: "TH", Friday: "FR", Saturday: "SA", Sunday: "SU" };
  const pad = n => String(n).padStart(2, "0");
  const fmtLocal = d => `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  const fmtDate = d => `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}`;

  let ics = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//InjectionTracker//EN\nCALSCALE:GREGORIAN\n";

  meds.forEach(m => {
    if (!m.scheduleDays || m.isArchived) return;
    const scheduleDays = m.scheduleDays;
    if (scheduleDays.length === 0) return;

    const rem = parseFloat(m.vialRemaining) || 0;
    const remMg = m.vialUnit === "mcg" ? rem / 1000 : rem;
    const doseRaw = parseFloat(m.dose) || 0;
    const doseMg = m.unit === "mcg" ? doseRaw / 1000 : doseRaw;
    const dosesLeft = doseMg > 0 ? Math.floor(remMg / doseMg) : 0;

    let totalDosesLeft = dosesLeft;
    if (m.nextVial && m.nextVial.vialTotal) {
      const nextVialMg = m.vialUnit === "mcg" ? (parseFloat(m.nextVial.vialTotal) || 0) / 1000 : (parseFloat(m.nextVial.vialTotal) || 0);
      if (doseMg > 0) totalDosesLeft += Math.floor(nextVialMg / doseMg);
    }

    scheduleDays.forEach(day => {
      const timeStr = m.injectionTime || "08:00";
      const [h, min] = timeStr.split(":");
      const now = new Date();
      const diff = (DM[day] - now.getDay() + 7) % 7;
      const start = new Date(now);
      start.setDate(start.getDate() + diff);
      start.setHours(parseInt(h), parseInt(min), 0);

      let rrule = `FREQ=WEEKLY;BYDAY=${BD[day]}`;
      if (totalDosesLeft > 0) {
        const occurrencesForThisDay = Math.ceil(totalDosesLeft / scheduleDays.length);
        if (occurrencesForThisDay > 0) {
          rrule += `;COUNT=${occurrencesForThisDay}`;
        }
      } else {
        const cap = new Date(start);
        cap.setFullYear(cap.getFullYear() + 1);
        rrule += `;UNTIL=${fmtDate(cap)}T235959`;
      }

      ics += `BEGIN:VEVENT\nUID:${m.id}-${day}@injtrack\nDTSTART:${fmtLocal(start)}\nDURATION:PT5M\nRRULE:${rrule}\nSUMMARY:💉 ${m.name} ${m.dose}${m.unit}\nEND:VEVENT\n`;
    });
  });

  ics += "END:VCALENDAR";
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  a.download = "active_protocols.ics";
  a.click();
}

export function exportLogsCSV(logs) {
  if (!Array.isArray(logs) || logs.length === 0) {
    window.showToast?.("No logs to export.", "info");
    return;
  }
  const escape = (v) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const headers = ["date", "time", "medName", "dose", "unit", "site", "notes", "isAuto"];
  const sorted = [...logs].sort((a, b) => (b.date || "").localeCompare(a.date || "") || (b.time || "").localeCompare(a.time || ""));
  const rows = sorted.map(l => headers.map(h => escape(l[h])).join(","));
  const csv = [headers.join(","), ...rows].join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const today = new Date();
  const pad = n => String(n).padStart(2, "0");
  a.download = `injection-log-${today.getFullYear()}-${pad(today.getMonth()+1)}-${pad(today.getDate())}.csv`;
  a.click();
}

export function LogTab({ meds, logs, delLog, onEditLog, autoLogEnabled, toggleAutoLog, save, today, showAddLog, setShowAddLog }) {
  const [expandedMonths, setExpandedMonths] = useState({});
  const [expandedDates, setExpandedDates] = useState({});
  const [visibleMonthCount, setVisibleMonthCount] = useState(2);
  const [calendarCopied, setCalendarCopied] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(false);

  const handleSubscribe = async () => {
    setCalendarLoading(true);
    try {
      const url = await getSubscribeURL();
      await navigator.clipboard.writeText(url);
      setCalendarCopied(true);
      setTimeout(() => setCalendarCopied(false), 3000);
    } catch (e) {
      window.showToast?.("Failed to copy calendar link", "error");
    } finally {
      setCalendarLoading(false);
    }
  };

  const toggleMonth = (m) => setExpandedMonths(p => ({ ...p, [m]: p[m] === undefined ? false : !p[m] }));
  const toggleDate = (d) => setExpandedDates(p => ({ ...p, [d]: p[d] === undefined ? false : !p[d] }));

  const getMonthStr = (dStr) => {
    if (!dStr) return "";
    const [y, m] = dStr.split("-");
    return `${m}-${y}`;
  };

  const groupedLogs = logs.reduce((acc, log) => {
    const month = getMonthStr(log.date);
    if (!acc[month]) acc[month] = {};
    if (!acc[month][log.date]) acc[month][log.date] = [];
    acc[month][log.date].push(log);
    return acc;
  }, {});

  const sortedMonths = Object.keys(groupedLogs).sort((a, b) => {
    const [m1, y1] = a.split("-");
    const [m2, y2] = b.split("-");
    return (parseInt(y2) * 100 + parseInt(m2)) - (parseInt(y1) * 100 + parseInt(m1));
  });

  const displayedMonths = sortedMonths.slice(0, visibleMonthCount);
  const hasMoreMonths = visibleMonthCount < sortedMonths.length;

  const formatDate = (dStr) => formatDisplayDate(dStr);

  const formatTime = (tStr) => {
    if (!tStr) return "";
    let [h, m] = tStr.split(":");
    let hr = parseInt(h, 10);
    const ampm = hr >= 12 ? "PM" : "AM";
    hr = hr % 12 || 12;
    return `${hr}:${m} ${ampm}`;
  };

  return (
    <View style={styles.container}>

      {/* Auto-Logger Status Bubble */}
      <View style={[styles.autoLoggerCard, { backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)' }]}>
        <View style={styles.autoLoggerLeft}>
          <Text style={styles.autoLoggerTitle}>Auto-Logger</Text>
          <Text style={styles.autoLoggerStatus}>
            {autoLogEnabled ? "Tracking scheduled doses" : "Currently paused"}
          </Text>
        </View>
        <Pressable onPress={toggleAutoLog} style={[styles.toggleTrack, autoLogEnabled && styles.toggleTrackActive]}>
          <View style={[styles.toggleDot, autoLogEnabled && styles.toggleDotActive]} />
        </Pressable>
      </View>

      {/* Primary Action Button */}
      <Pressable onPress={() => setShowAddLog(true)} style={[styles.logBtn, { justifyContent: 'center' }]}>
        <Text style={styles.logBtnText}>+ LOG INJECTION</Text>
      </Pressable>

      {/* History Timeline Bubble */}
      <View style={[styles.historyCard, { backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)' }]}>
        <Text style={styles.historyTitle}>Injection History</Text>

        {logs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No history found.</Text>
          </View>
        ) : (
          <View>
            {displayedMonths.map((month, mIdx) => {
              const isCurrentMonth = mIdx === 0;
              const monthDates = Object.keys(groupedLogs[month]).sort((a, b) => b.localeCompare(a));
              const isMonthExpanded = expandedMonths[month] !== undefined ? expandedMonths[month] : isCurrentMonth;
              const monthLogCount = monthDates.reduce((sum, d) => sum + groupedLogs[month][d].length, 0);

              return (
                <View key={month} style={styles.monthBlock}>
                  <Pressable
                    onPress={() => toggleMonth(month)}
                    style={[styles.monthToggle, { marginBottom: isMonthExpanded ? 16 : 0 }]}
                  >
                    <View style={styles.monthToggleLeft}>
                      <Text style={styles.monthLabel}>{month}</Text>
                      <Text style={styles.monthCount}> ({monthLogCount} doses)</Text>
                    </View>
                    <Text style={styles.chevron}>{isMonthExpanded ? "▲" : "▼"}</Text>
                  </Pressable>

                  {isMonthExpanded && (
                    <View style={styles.timelineWrap}>
                      {/* Vertical line */}
                      <View style={styles.timelineLine} />

                      {monthDates.map((date, dIdx) => {
                        const dateLogs = groupedLogs[month][date].sort((a, b) => b.time.localeCompare(a.time));
                        const isDateExpanded = expandedDates[date] !== undefined ? expandedDates[date] : (isCurrentMonth && dIdx === 0);

                        return (
                          <View key={date} style={styles.dateBlock}>
                            <View style={{ position: 'relative' }}>
                              <View style={styles.dateNodeOuter} />
                              <Pressable
                                onPress={() => toggleDate(date)}
                                style={styles.dateToggle}
                              >
                                <View style={styles.dateToggleLeft}>
                                  <Text style={[styles.dateLabel, isDateExpanded && styles.dateLabelActive]}>
                                    {formatDate(date)}
                                    <Text style={styles.dateCount}> ({dateLogs.length})</Text>
                                  </Text>
                                </View>
                                <Text style={styles.chevron}>{isDateExpanded ? "▲" : "▼"}</Text>
                              </Pressable>
                            </View>

                            {isDateExpanded && dateLogs.map((l) => {
                              const isAuto = l.isAuto || l.type === 'auto';
                              const circleColor = "#86efac";
                              const circleShadow = isAuto ? "rgba(168, 85, 247, 0.6)" : "rgba(134, 239, 172, 0.4)";
                              const badgeColor = isAuto ? "#a855f7" : "#86efac";
                              const badgeBg = isAuto ? "rgba(168, 85, 247, 0.1)" : "rgba(134, 239, 172, 0.1)";

                              return (
                                <View key={l.id} style={styles.logEntry}>
                                  <View style={[styles.logEntryDot, { borderColor: circleColor, boxShadow: `0 0 10px ${circleShadow}` }]} />
                                  <View style={styles.logEntryCard}>
                                    {isAuto && (
                                      <View style={[styles.autoTag, { backgroundColor: badgeBg }]}>
                                        <Text style={[styles.autoTagText, { color: badgeColor }]}>Auto-Logged</Text>
                                      </View>
                                    )}
                                    <View style={{ paddingRight: isAuto ? 80 : 0 }}>
                                      <Text style={styles.logMedName}>{l.medName}</Text>
                                      <View style={styles.logMeta}>
                                        <View style={styles.logDoseBadge}>
                                          <Text style={styles.logDoseText}>{l.dose}{l.unit}</Text>
                                        </View>
                                        <Text style={styles.logSite}>{l.site}</Text>
                                        <Text style={styles.logTime}>• {formatTime(l.time)}</Text>
                                      </View>
                                    </View>
                                    {l.notes && (
                                      <View style={styles.logNotes}>
                                        <Text style={styles.logNotesText}>"{l.notes}"</Text>
                                      </View>
                                    )}
                                    <View style={styles.logActions}>
                                      <Pressable onPress={() => onEditLog(l)} style={styles.logEditBtn}>
                                        <Text style={styles.logEditText}>EDIT</Text>
                                      </Pressable>
                                      <Pressable onPress={() => delLog(l.id)} style={styles.logDeleteBtn}>
                                        <Text style={styles.logDeleteText}>DELETE</Text>
                                      </Pressable>
                                    </View>
                                  </View>
                                </View>
                              );
                            })}
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })}

            {hasMoreMonths && (
              <Pressable
                onPress={() => setVisibleMonthCount(prev => prev + 3)}
                style={styles.loadMoreBtn}
              >
                <Text style={styles.loadMoreText}>LOAD OLDER HISTORY</Text>
              </Pressable>
            )}
          </View>
        )}
      </View>

      {/* Calendar & CSV Export */}
      <View style={[styles.exportCard, { backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)' }]}>
        <Text style={styles.exportTitle}>Export</Text>
        <Text style={styles.exportSub}>Share your protocols with a provider or archive your log history.</Text>
        <View style={styles.exportActions}>
          <View style={styles.exportRow}>
            <Pressable onPress={() => exportICS(meds)} style={[styles.exportBtnGray, { justifyContent: 'center' }]}>
              <Text style={styles.exportBtnGrayText}>📅 Calendar (.ics)</Text>
            </Pressable>
            <Pressable
              onPress={() => exportLogsCSV(logs)}
              disabled={!logs || logs.length === 0}
              style={[styles.exportBtnCyan, (!logs || logs.length === 0) && styles.exportBtnDisabled, { justifyContent: 'center' }]}
            >
              <Text style={styles.exportBtnCyanText}>📊 Log History (.csv)</Text>
            </Pressable>
          </View>
          <Pressable
            onPress={handleSubscribe}
            disabled={calendarLoading}
            style={[styles.subscribeBtn, calendarLoading && styles.subscribeBtnLoading, { justifyContent: 'center' }]}
          >
            <Text style={styles.subscribeBtnText}>
              {calendarLoading ? "⏳ Getting Link..." : calendarCopied ? "✅ Link Copied!" : "🔗 Subscribe to Calendar"}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default LogTab;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    gap: 16,
  },
  autoLoggerCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 32,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderTopColor: 'rgba(255, 255, 255, 0.25)',
    borderLeftColor: 'rgba(255, 255, 255, 0.12)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
  },
  autoLoggerLeft: {
    flexDirection: 'column',
    gap: 2,
  },
  autoLoggerTitle: {
    fontWeight: '800',
    fontSize: 16,
    color: 'white',
    letterSpacing: -0.32,
  },
  autoLoggerStatus: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '600',
  },
  toggleTrack: {
    width: 56,
    height: 32,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
    position: 'relative',
    cursor: 'pointer',
    transition: '0.3s',
  },
  toggleTrackActive: {
    backgroundColor: 'rgba(34, 211, 238, 0.2)',
  },
  toggleDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#9ca3af',
    position: 'absolute',
    top: 4,
    left: 4,
    transition: '0.3s',
    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
  },
  toggleDotActive: {
    backgroundColor: '#22d3ee',
    left: 28,
  },
  logBtn: {
    ...button.primary,
    width: '100%',
    cursor: 'pointer',
  },
  logBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '900',
  },
  historyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderTopColor: 'rgba(255, 255, 255, 0.25)',
    borderLeftColor: 'rgba(255, 255, 255, 0.12)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
  },
  historyTitle: {
    fontWeight: '900',
    fontSize: 18,
    color: 'white',
    letterSpacing: -0.36,
    marginBottom: 24,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: 'rgba(31,41,55,0.2)',
    borderRadius: 24,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.1)',
  },
  emptyStateText: {
    color: '#6b7280',
    fontSize: 14,
  },
  monthBlock: {
    marginBottom: 24,
  },
  monthToggle: {
    backgroundColor: 'rgba(17, 24, 39, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    cursor: 'pointer',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  monthToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthLabel: {
    fontSize: 13,
    fontWeight: '900',
    color: 'white',
  },
  monthCount: {
    color: '#9ca3af',
    fontWeight: '600',
    fontSize: 12,
    marginLeft: 6,
  },
  chevron: {
    color: '#6b7280',
    fontSize: 12,
  },
  timelineWrap: {
    position: 'relative',
    paddingLeft: 12,
  },
  timelineLine: {
    position: 'absolute',
    left: 23,
    top: 8,
    bottom: 16,
    width: 2,
    backgroundColor: '#22d3ee', // TODO: expo-linear-gradient(to bottom, #22d3ee, rgba(34,211,238,0.1))
    borderRadius: 2,
  },
  dateBlock: {
    marginBottom: 24,
  },
  dateToggle: {
    backgroundColor: 'transparent',
    cursor: 'pointer',
    position: 'relative',
    paddingLeft: 36,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateNodeOuter: {
    position: 'absolute',
    left: 23,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0f172a',
    borderWidth: 2,
    borderColor: '#22d3ee',
    zIndex: 2,
    transform: [{ translateX: -5 }],
  },
  dateLabel: {
    fontWeight: '800',
    fontSize: 13,
    color: '#9ca3af',
    transition: '0.2s',
  },
  dateLabelActive: {
    color: 'white',
  },
  dateCount: {
    opacity: 0.6,
    fontSize: 11,
    marginLeft: 6,
  },
  logEntry: {
    position: 'relative',
    paddingLeft: 36,
    marginBottom: 12,
  },
  logEntryDot: {
    position: 'absolute',
    left: 23,
    top: 24,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0f172a',
    borderWidth: 2,
    zIndex: 5,
    transform: [{ translateX: -5 }],
  },
  logEntryCard: {
    backgroundColor: 'rgba(17, 24, 39, 0.4)',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    position: 'relative',
  },
  autoTag: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 100,
  },
  autoTagText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  logMedName: {
    fontSize: 16,
    fontWeight: '900',
    color: 'white',
    marginBottom: 6,
  },
  logMeta: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  logDoseBadge: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 100,
  },
  logDoseText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '700',
  },
  logSite: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '700',
  },
  logTime: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '700',
  },
  logNotes: {
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#6b7280',
  },
  logNotesText: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  logActions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  logEditBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    cursor: 'pointer',
  },
  logEditText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '800',
  },
  logDeleteBtn: {
    flex: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    cursor: 'pointer',
  },
  logDeleteText: {
    color: '#f87171',
    fontSize: 12,
    fontWeight: '800',
  },
  loadMoreBtn: {
    width: '100%',
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.2)',
    cursor: 'pointer',
    marginTop: 16,
  },
  loadMoreText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '800',
  },
  exportCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderTopColor: 'rgba(255, 255, 255, 0.25)',
    borderLeftColor: 'rgba(255, 255, 255, 0.12)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
    marginTop: 8,
  },
  exportTitle: {
    fontWeight: '800',
    fontSize: 16,
    color: 'white',
    marginBottom: 8,
  },
  exportSub: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 16,
    lineHeight: 17,
  },
  exportActions: {
    flexDirection: 'column',
    gap: 10,
  },
  exportRow: {
    flexDirection: 'row',
    gap: 10,
  },
  exportBtnGray: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    cursor: 'pointer',
  },
  exportBtnGrayText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '800',
  },
  exportBtnCyan: {
    flex: 1,
    backgroundColor: 'rgba(34, 211, 238, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.2)',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    cursor: 'pointer',
  },
  exportBtnCyanText: {
    color: '#22d3ee',
    fontSize: 13,
    fontWeight: '800',
  },
  exportBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  subscribeBtn: {
    ...button.primary,
    width: '100%',
    cursor: 'pointer',
  },
  subscribeBtnLoading: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  subscribeBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '900',
  },
});
