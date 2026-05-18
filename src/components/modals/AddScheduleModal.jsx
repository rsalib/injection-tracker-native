import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Pressable } from '../ui/Pressable.jsx';
import { Modal } from '../ui/Modal.jsx';
import { SITES, DAYS } from '../../constants.js';
import { colors, button } from '../../theme.js';

export function AddScheduleModal({ meds, onClose, onSave }) {
  const [medId, setMedId] = useState('');
  const [days, setDays] = useState([]);
  const [time, setTime] = useState('08:00');
  const [dose, setDose] = useState('');
  const [unit, setUnit] = useState('mcg');
  const [site, setSite] = useState(SITES[0]);
  const [notes, setNotes] = useState('');

  const selectedMed = meds.find(m => m.id === medId);

  const toggleDay = d => setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);

  const handleMedSelect = id => {
    const m = meds.find(x => x.id === id);
    setMedId(id);
    if (m) { setDose(m.dose || ''); setUnit(m.unit || 'mcg'); setSite(m.site || SITES[0]); }
  };

  const submit = () => {
    if (!medId || days.length === 0 || !dose) {
      window.showToast?.('Please select a medication, at least one day, and a dose.', 'error');
      return;
    }
    onSave({
      id: Date.now().toString(),
      medId,
      medName: selectedMed?.name || '',
      days,
      time,
      dose: parseFloat(dose),
      unit,
      site,
      notes
    });
  };

  return (
    <Modal title="Add Schedule" onClose={onClose}>
      <View style={styles.form}>

        {/* Medication select */}
        <View style={styles.field}>
          <Text style={styles.lbl}>Medication</Text>
          <select
            id="addschedule-med" name="addschedule-med"
            style={{ width: '100%', background: colors.borderFaint, border: `1px solid ${colors.borderSubtle}`, borderRadius: '100px', padding: '14px 18px', color: colors.white, fontSize: 15, boxSizing: 'border-box', outline: 'none' }}
            value={medId}
            onChange={e => handleMedSelect(e.target.value)}
          >
            <option value="">-- Select --</option>
            {meds.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </View>

        {/* Day toggles */}
        <View style={styles.field}>
          <Text style={styles.lbl}>Days</Text>
          <View style={styles.daysRow}>
            {DAYS.map(d => (
              <Pressable
                key={d}
                onPress={() => toggleDay(d)}
                style={[styles.dayBtn, days.includes(d) && styles.dayBtnActive]}
              >
                <Text style={[styles.dayBtnText, days.includes(d) && styles.dayBtnTextActive]}>{d.slice(0, 3)}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Injection time */}
        <View style={styles.field}>
          <Text style={styles.lbl}>Injection Time</Text>
          <input
            id="addschedule-time" name="addschedule-time"
            type="time"
            value={time}
            onChange={e => setTime(e.target.value)}
            style={{ width: '100%', background: colors.borderFaint, border: `1px solid ${colors.borderSubtle}`, borderRadius: '100px', padding: '14px 18px', color: colors.white, fontSize: 15, boxSizing: 'border-box', outline: 'none' }}
          />
        </View>

        {/* Dose + Unit */}
        <View style={styles.row2}>
          <View style={styles.doseField}>
            <Text style={styles.lbl}>Dose</Text>
            <TextInput id="field-addschedulemodal-2" name="field-addschedulemodal-2" nativeID="field-addschedulemodal-2"
              style={styles.inp}
              value={dose}
              onChangeText={setDose}
              placeholder="0"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.unitField}>
            <Text style={styles.lbl}>Unit</Text>
            <select
              id="addschedule-unit" name="addschedule-unit"
              style={{ width: '100%', background: colors.borderFaint, border: `1px solid ${colors.borderSubtle}`, borderRadius: '100px', padding: '14px 18px', color: colors.white, fontSize: 15, boxSizing: 'border-box', outline: 'none' }}
              value={unit}
              onChange={e => setUnit(e.target.value)}
            >
              {['mcg', 'mg', 'IU', 'ml'].map(u => <option key={u}>{u}</option>)}
            </select>
          </View>
        </View>

        {/* Injection site */}
        <View style={styles.field}>
          <Text style={styles.lbl}>Injection Site</Text>
          <select
            id="addschedule-site" name="addschedule-site"
            style={{ width: '100%', background: colors.borderFaint, border: `1px solid ${colors.borderSubtle}`, borderRadius: '100px', padding: '14px 18px', color: colors.white, fontSize: 15, boxSizing: 'border-box', outline: 'none' }}
            value={site}
            onChange={e => setSite(e.target.value)}
          >
            {SITES.map(s => <option key={s}>{s}</option>)}
          </select>
        </View>

        {/* Notes */}
        <View style={styles.field}>
          <Text style={styles.lbl}>Notes (optional)</Text>
          <TextInput id="field-addschedulemodal-3" name="field-addschedulemodal-3" nativeID="field-addschedulemodal-3"
            style={styles.inp}
            value={notes}
            onChangeText={setNotes}
            placeholder="Protocol notes…"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <Pressable onPress={submit} style={styles.submitBtn}>
          <Text style={styles.submitBtnText}>Add to Schedule</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

export default AddScheduleModal;

const styles = StyleSheet.create({
  form: {
    gap: 16,
  },
  field: {
    gap: 6,
  },
  lbl: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    paddingLeft: 4,
  },
  inp: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 100,
    paddingVertical: 14,
    paddingHorizontal: 18,
    color: colors.white,
    fontSize: 15,
  },
  row2: {
    flexDirection: 'row',
    gap: 12,
  },
  doseField: {
    flex: 2,
    gap: 6,
  },
  unitField: {
    flex: 1,
    gap: 6,
  },
  daysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 100,
    backgroundColor: colors.surface,
    cursor: 'pointer',
  },
  dayBtnActive: {
    backgroundColor: colors.cyanMid,
  },
  dayBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  dayBtnTextActive: {
    color: colors.cyan,
  },
  submitBtn: {
    ...button.primary,
    cursor: 'pointer',
  },
  submitBtnText: {
    ...button.primaryText,
    letterSpacing: -0.15,
  },
});
