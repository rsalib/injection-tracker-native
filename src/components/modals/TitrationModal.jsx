import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import PressableCard from '../ui/PressableCard.jsx';
import { Modal } from '../ui/Modal.jsx';
import { formatDisplayDate } from '../../constants.js';
import { toMg, calculateProportionateStack } from '../../mathEngine.js';

export function TitrationModal({ med, onClose, onSave, today }) {
  const [sched, setSched] = useState(med.titrationSchedule || []);
  const [newDate, setNewDate] = useState('');
  const [newDose, setNewDose] = useState('');
  const [newUnit, setNewUnit] = useState(med.unit || 'mcg');
  const [isTitrating, setIsTitrating] = useState(med.isTitrating || false);
  const [tempPeps, setTempPeps] = useState(med.isStack ? JSON.parse(JSON.stringify(med.subPeptides)) : null);

  const activeDose = sched.filter(s => s.date <= today).sort((a, b) => b.date.localeCompare(a.date))[0];

  const handleStepDoseChange = (idx, val) => {
    const updated = calculateProportionateStack(tempPeps, idx, val);
    setTempPeps(updated);
    let totalMg = 0;
    updated.forEach(p => totalMg += toMg(p.dose, p.unit));
    const totalDisp = newUnit === 'mcg' ? totalMg * 1000 : totalMg;
    setNewDose(parseFloat(totalDisp.toFixed(3)).toString());
  };

  const addEntry = () => {
    if (!newDate || !newDose) {
      window.showToast?.('Please enter both a start date and a dose.', 'error');
      return;
    }
    if (newDate < today) {
      window.showToast?.('Titration start date must be today or later.', 'error');
      return;
    }
    if (sched.some(s => s.date === newDate)) {
      window.showToast?.('Another step already exists on that date. Remove it first or pick a different date.', 'error');
      return;
    }
    const parsedDose = parseFloat(newDose);
    if (isNaN(parsedDose) || parsedDose <= 0 || parsedDose > 100000) {
      window.showToast?.('Dose must be a positive, realistic number.', 'error');
      return;
    }
    const currentDoseMg = toMg(med.dose, med.unit);
    const newDoseMg = toMg(parsedDose, newUnit);
    if (currentDoseMg > 0 && (newDoseMg > currentDoseMg * 10 || newDoseMg < currentDoseMg / 10)) {
      window.showToast?.(`Note: this dose is very different from the current ${med.dose} ${med.unit}. Double-check before saving.`, 'info');
    }
    const entry = {
      date: newDate,
      dose: parsedDose,
      unit: newUnit,
      id: Date.now().toString(),
      subPeptides: tempPeps ? [...tempPeps] : null
    };
    setSched(prev => [...prev, entry].sort((a, b) => a.date.localeCompare(b.date)));
    setNewDate('');
    setNewDose('');
    if (med.isStack) setTempPeps(JSON.parse(JSON.stringify(med.subPeptides)));
  };

  const saveTit = () => {
    const updatedMed = { ...med, isTitrating, titrationSchedule: sched };
    if (activeDose) {
      updatedMed.dose = activeDose.dose;
      updatedMed.unit = activeDose.unit;
      if (activeDose.subPeptides) updatedMed.subPeptides = activeDose.subPeptides;
    }
    onSave(updatedMed);
  };

  return (
    <Modal title={med.isStack ? `Titrate Blend: ${med.name}` : `Titrate: ${med.name}`} onClose={onClose}>
      <View style={styles.form}>

        {/* Titration toggle */}
        <View style={styles.toggleRow}>
          <View>
            <Text style={styles.toggleTitle}>Titration Mode</Text>
            <Text style={styles.toggleSub}>Auto-adjust dose on set dates</Text>
          </View>
          <Pressable
            onPress={() => setIsTitrating(t => !t)}
            style={[styles.toggleBtn, isTitrating && styles.toggleBtnActive]}
          >
            <Text style={[styles.toggleBtnText, isTitrating && styles.toggleBtnTextActive]}>
              {isTitrating ? 'ENABLED' : 'DISABLED'}
            </Text>
          </Pressable>
        </View>

        {/* Add dose step */}
        {isTitrating && (
          <View style={styles.stepBox}>
            <Text style={styles.stepBoxTitle}>Add Dose Step</Text>
            <View style={styles.field}>
              <Text style={styles.lbl}>Start Date</Text>
              {/* date input — raw HTML */}
              <input
                type="date"
                value={newDate}
                onChange={e => setNewDate(e.target.value)}
                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '100px', padding: '14px 18px', color: 'white', fontSize: 15, boxSizing: 'border-box', outline: 'none' }}
              />
            </View>

            {med.isStack ? (
              <View style={styles.stackBox}>
                <Text style={styles.stackBoxTitle}>📊 Stack Breakdown</Text>
                <View style={styles.stackRows}>
                  {tempPeps.map((p, idx) => (
                    <View key={p.id} style={styles.stackRow}>
                      <Text style={styles.stackPepName}>{p.name.split('(')[0].trim()}</Text>
                      {/* pill input — raw HTML */}
                      <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '100px', overflow: 'hidden', width: 100 }}>
                        <input type="number" value={p.dose} onChange={e => handleStepDoseChange(idx, e.target.value)} placeholder="0" style={{ flex: 1, width: '100%', background: 'transparent', border: 'none', padding: '8px', color: '#22d3ee', fontSize: 14, fontWeight: 800, textAlign: 'center', outline: 'none' }} />
                        <div style={{ width: 1, background: 'rgba(255,255,255,0.1)', margin: '6px 0' }} />
                        <div style={{ padding: '8px', fontSize: 11, color: '#9ca3af', fontWeight: 800 }}>{p.unit}</div>
                      </div>
                    </View>
                  ))}
                </View>
                <View style={styles.stackTotal}>
                  <Text style={styles.stackTotalLabel}>Combined Weight</Text>
                  <Text style={styles.stackTotalValue}>{newDose || '0'} {newUnit}</Text>
                </View>
              </View>
            ) : (
              <View style={styles.field}>
                <Text style={styles.lbl}>New Dose & Unit</Text>
                {/* dose + unit pill — raw HTML */}
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '100px', overflow: 'hidden' }}>
                  <input type="number" value={newDose} onChange={e => setNewDose(e.target.value)} placeholder={med.dose} style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', padding: '12px 16px', fontSize: 15, outline: 'none', minWidth: 0, boxSizing: 'border-box' }} />
                  <div style={{ width: 1, background: 'rgba(255,255,255,0.1)', margin: '8px 0' }} />
                  <select value={newUnit} onChange={e => setNewUnit(e.target.value)} style={{ flex: '0 0 85px', background: 'transparent', border: 'none', color: 'white', padding: '12px 14px', fontSize: 15, outline: 'none', minWidth: 0, boxSizing: 'border-box', appearance: 'none', cursor: 'pointer', textAlign: 'center' }}>
                    <option style={{color:'black'}}>mcg</option><option style={{color:'black'}}>mg</option><option style={{color:'black'}}>IU</option>
                  </select>
                </div>
              </View>
            )}

            <PressableCard onPress={addEntry} style={styles.addStepBtn} pressableStyle={{ alignItems: 'center', justifyContent: 'center' }}>
              <Text style={styles.addStepText}>+ ADD STEP TO SCHEDULE</Text>
            </PressableCard>
          </View>
        )}

        {/* Schedule list */}
        {sched.length > 0 && (
          <View style={styles.schedList}>
            <Text style={styles.schedListTitle}>Upcoming Schedule</Text>
            {sched.map(s => {
              const isAct = s.id === activeDose?.id;
              return (
                <View key={s.id} style={[styles.schedItem, isAct && styles.schedItemActive]}>
                  <View>
                    <View style={styles.schedDoseRow}>
                      <Text style={styles.schedDose}>{s.dose}{s.unit}</Text>
                      {isAct && <Text style={styles.activeBadge}>ACTIVE</Text>}
                    </View>
                    <Text style={styles.schedDate}>Starts {formatDisplayDate(s.date)}</Text>
                  </View>
                  <Pressable
                    onPress={() => setSched(sc => sc.filter(x => x.id !== s.id))}
                    style={styles.removeStepBtn}
                  >
                    <Text style={styles.removeStepText}>REMOVE</Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}

        <PressableCard onPress={saveTit} style={styles.saveBtn} pressableStyle={{ alignItems: 'center', justifyContent: 'center' }}>
          <Text style={styles.saveBtnText}>SAVE TITRATION SETTINGS</Text>
        </PressableCard>
      </View>
    </Modal>
  );
}

export default TitrationModal;

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
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(17,24,39,0.3)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: 'white',
  },
  toggleSub: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 4,
  },
  toggleBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.05)',
    cursor: 'pointer',
  },
  toggleBtnActive: {
    backgroundColor: 'rgba(34,211,238,0.1)',
  },
  toggleBtnText: {
    fontWeight: '800',
    fontSize: 12,
    color: '#9ca3af',
  },
  toggleBtnTextActive: {
    color: '#22d3ee',
  },
  stepBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(40px)',
    WebkitBackdropFilter: 'blur(40px)',
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
    borderLeftColor: 'rgba(255, 255, 255, 0.06)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
    gap: 16,
  },
  stepBoxTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#22d3ee',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stackBox: {
    backgroundColor: 'rgba(8,51,68,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(21,94,117,0.3)',
    borderRadius: 24,
    padding: 16,
    gap: 8,
  },
  stackBoxTitle: {
    color: '#67e8f9',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  stackRows: {
    gap: 8,
  },
  stackRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  stackPepName: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
  stackTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(21,94,117,0.2)',
  },
  stackTotalLabel: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  stackTotalValue: {
    color: '#67e8f9',
    fontSize: 14,
    fontWeight: '900',
  },
  addStepBtn: {
    backgroundColor: 'rgba(34,211,238,0.1)',
    borderRadius: 100,
    padding: 16,
    alignItems: 'center',
    cursor: 'pointer',
  },
  addStepText: {
    color: '#22d3ee',
    fontSize: 14,
    fontWeight: '900',
  },
  schedList: {
    gap: 12,
  },
  schedListTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9ca3af',
    textTransform: 'uppercase',
    paddingLeft: 8,
    letterSpacing: 0.5,
  },
  schedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(17,24,39,0.4)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  schedItemActive: {
    backgroundColor: 'rgba(34,211,238,0.05)',
    borderColor: 'rgba(34,211,238,0.2)',
  },
  schedDoseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  schedDose: {
    fontSize: 16,
    fontWeight: '900',
    color: 'white',
  },
  activeBadge: {
    fontSize: 10,
    color: '#22d3ee',
    backgroundColor: 'rgba(34,211,238,0.1)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  schedDate: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '600',
  },
  removeStepBtn: {
    backgroundColor: 'rgba(248,113,113,0.1)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 100,
    cursor: 'pointer',
  },
  removeStepText: {
    fontSize: 11,
    color: '#f87171',
    fontWeight: '900',
  },
  saveBtn: {
    backgroundColor: '#0e7490', // TODO: expo-linear-gradient(135deg, #0e7490 0%, #22d3ee 100%)
    borderRadius: 100,
    padding: 16,
    alignItems: 'center',
    cursor: 'pointer',
    marginTop: 8,
    boxShadow: '0 10px 20px -5px rgba(34,211,238,0.3)',
  },
  saveBtnText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '900',
  },
});
