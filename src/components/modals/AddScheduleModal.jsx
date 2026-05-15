import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet } from 'react-native';
import PressableCard from '../ui/PressableCard.jsx';
import { Modal } from '../ui/Modal.jsx';
import { SITES, DAYS } from '../../constants.js';

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
            style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '100px', padding: '14px 18px', color: 'white', fontSize: 15, boxSizing: 'border-box', outline: 'none' }}
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
            type="time"
            value={time}
            onChange={e => setTime(e.target.value)}
            style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '100px', padding: '14px 18px', color: 'white', fontSize: 15, boxSizing: 'border-box', outline: 'none' }}
          />
        </View>

        {/* Dose + Unit */}
        <View style={styles.row2}>
          <View style={styles.doseField}>
            <Text style={styles.lbl}>Dose</Text>
            <TextInput
              style={styles.inp}
              value={dose}
              onChangeText={setDose}
              placeholder="0"
              placeholderTextColor="#6b7280"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.unitField}>
            <Text style={styles.lbl}>Unit</Text>
            <select
              style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '100px', padding: '14px 18px', color: 'white', fontSize: 15, boxSizing: 'border-box', outline: 'none' }}
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
            style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '100px', padding: '14px 18px', color: 'white', fontSize: 15, boxSizing: 'border-box', outline: 'none' }}
            value={site}
            onChange={e => setSite(e.target.value)}
          >
            {SITES.map(s => <option key={s}>{s}</option>)}
          </select>
        </View>

        {/* Notes */}
        <View style={styles.field}>
          <Text style={styles.lbl}>Notes (optional)</Text>
          <TextInput
            style={styles.inp}
            value={notes}
            onChangeText={setNotes}
            placeholder="Protocol notes…"
            placeholderTextColor="#6b7280"
          />
        </View>

        <PressableCard onPress={submit} style={styles.submitBtn}>
          <Text style={styles.submitBtnText}>Add to Schedule</Text>
        </PressableCard>
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
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    paddingLeft: 4,
  },
  inp: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 100,
    paddingVertical: 14,
    paddingHorizontal: 18,
    color: 'white',
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
    backgroundColor: 'rgba(255,255,255,0.05)',
    cursor: 'pointer',
  },
  dayBtnActive: {
    backgroundColor: 'rgba(34,211,238,0.2)',
  },
  dayBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9ca3af',
  },
  dayBtnTextActive: {
    color: '#22d3ee',
  },
  submitBtn: {
    backgroundColor: '#0e7490', // TODO: expo-linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)
    borderRadius: 100,
    padding: 16,
    alignItems: 'center',
    cursor: 'pointer',
  },
  submitBtnText: {
    color: 'white',
    fontWeight: '900',
    fontSize: 15,
    letterSpacing: -0.15,
  },
});
