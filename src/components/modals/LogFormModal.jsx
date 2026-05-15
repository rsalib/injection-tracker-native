import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet } from 'react-native';
import PressableCard from '../ui/PressableCard.jsx';
import { Modal } from '../ui/Modal.jsx';
import { SyringeVisualizer } from '../ui/SyringeVisualizer.jsx';
import { SITES, getLocalDate, getLocalTime } from '../../constants.js';
import { toMg } from '../../mathEngine.js';

export function LogFormModal({ meds, initialData, onClose, onSave }) {
  const isEdit = !!initialData;
  const [form, setForm] = useState(
    initialData || { medId: '', medName: '', dose: '', unit: 'mcg', site: 'Abdomen', date: getLocalDate(), time: getLocalTime(), notes: '' }
  );
  const [calcVisuals, setCalcVisuals] = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const selMed = id => {
    const m = meds.find(x => x.id === id);
    if (m) setForm(f => ({ ...f, medId: m.id, medName: m.name, dose: m.dose, unit: m.unit, site: m.site }));
  };

  const selectedMed = form.medId ? meds.find(m => m.id === form.medId) : null;

  useEffect(() => {
    if (form.medId && form.dose) {
      const m = meds.find(x => x.id === form.medId);
      if (m && parseFloat(m.vialTotal) > 0 && parseFloat(m.bwAdded) > 0) {
        const vMg = toMg(m.vialTotal, m.vialUnit || m.unit);
        const conc = vMg / parseFloat(m.bwAdded);
        const doseMg = toMg(form.dose, form.unit);
        if (doseMg > 0) {
          const dMl = doseMg / conc;
          const sMl = parseFloat(m.syringeMl || '1');
          const sU = parseFloat(m.syringeUnits || '100');
          setCalcVisuals({ units: (dMl / sMl) * sU, ml: dMl, maxUnits: sU });
          return;
        }
      }
    }
    setCalcVisuals(null);
  }, [form.medId, form.dose, form.unit, meds]);

  const submit = () => {
    if (!form.medName || !form.dose) return;
    onSave({ ...form, id: isEdit ? form.id : Date.now().toString(), dose: parseFloat(form.dose) });
  };

  return (
    <Modal title={isEdit ? 'Edit Injection Log' : 'Log Injection'} onClose={onClose}>
      <View style={styles.form}>

        {/* Quick select — add mode only */}
        {!isEdit && meds.length > 0 && (
          <View style={styles.field}>
            <Text style={styles.lbl}>Quick Select Protocol</Text>
            <select
              style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '100px', padding: '14px 18px', color: 'white', fontSize: 15, boxSizing: 'border-box', outline: 'none' }}
              onChange={e => selMed(e.target.value)}
            >
              <option value="">-- Select --</option>
              {meds.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </View>
        )}

        {/* Med name */}
        <View style={styles.field}>
          <Text style={styles.lbl}>Medication Name</Text>
          <TextInput
            style={[styles.inp, isEdit && styles.inpDisabled]}
            value={form.medName}
            onChangeText={v => set('medName', v)}
            editable={!isEdit}
          />
          {isEdit && <Text style={styles.editHint}>Medication name cannot be changed while editing.</Text>}
        </View>

        {/* Stack delivery breakdown — raw HTML for complex inline structure */}
        {selectedMed?.isStack ? (
          <View style={styles.stackBox}>
            <Text style={styles.stackBoxTitle}>📊 Stack Delivery Breakdown</Text>
            <View style={styles.stackRows}>
              {selectedMed.subPeptides.map(p => {
                const savedTotalDoseMg = toMg(selectedMed.dose, selectedMed.unit);
                const enteredDoseMg = toMg(form.dose, form.unit);
                const ratio = savedTotalDoseMg > 0 ? (enteredDoseMg / savedTotalDoseMg) : 0;
                const pSavedDoseMg = toMg(p.dose, p.unit);
                const deliveredMg = pSavedDoseMg * ratio;
                const displayNum = p.unit === 'mcg' ? deliveredMg * 1000 : deliveredMg;

                const handleDoseEdit = (val) => {
                  const newDoseVal = parseFloat(val);
                  if (isNaN(newDoseVal) || newDoseVal <= 0) { set('dose', ''); return; }
                  const newDoseMg = toMg(String(newDoseVal), p.unit);
                  const newRatio = pSavedDoseMg > 0 ? newDoseMg / pSavedDoseMg : 0;
                  const newTotalDoseMg = savedTotalDoseMg * newRatio;
                  const newFormDose = form.unit === 'mcg' ? newTotalDoseMg * 1000 : newTotalDoseMg;
                  set('dose', parseFloat(newFormDose.toFixed(3)).toString());
                };

                return (
                  <View key={p.id} style={styles.stackRow}>
                    <Text style={styles.stackPepName}>{p.name.split('(')[0].trim()}</Text>
                    {/* pill input+select — raw HTML */}
                    <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '100px', overflow: 'hidden', width: 140 }}>
                      <input
                        type="number"
                        value={form.dose ? parseFloat(displayNum.toFixed(3)) : ''}
                        onChange={e => handleDoseEdit(e.target.value)}
                        placeholder="0"
                        style={{ flex: 1, width: '100%', background: 'transparent', border: 'none', padding: '8px 12px', color: '#22d3ee', fontSize: 14, fontWeight: 800, textAlign: 'center', outline: 'none', minWidth: 0 }}
                      />
                      <div style={{ width: 1, background: 'rgba(255,255,255,0.1)', margin: '6px 0' }} />
                      <select
                        value={p.unit || 'mcg'}
                        disabled
                        style={{ flex: '0 0 65px', background: 'rgba(0,0,0,0.2)', border: 'none', color: '#9ca3af', padding: '0 8px', fontSize: 12, fontWeight: 700, outline: 'none', appearance: 'none', textAlign: 'center', opacity: 0.8 }}
                      >
                        <option style={{color:'black'}}>mcg</option>
                        <option style={{color:'black'}}>mg</option>
                        <option style={{color:'black'}}>IU</option>
                      </select>
                    </div>
                  </View>
                );
              })}
            </View>
            <View style={styles.stackTotal}>
              <Text style={styles.stackTotalLabel}>Total Stack Deduction</Text>
              <Text style={styles.stackTotalValue}>{form.dose || '0'} {form.unit}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.field}>
            <Text style={styles.lbl}>Dose & Unit</Text>
            {/* dose + unit pill — raw HTML */}
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '100px', overflow: 'hidden' }}>
              <input type="number" value={form.dose} onChange={e => set('dose', e.target.value)} style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', padding: '12px 16px', fontSize: 15, outline: 'none', minWidth: 0, boxSizing: 'border-box' }} />
              <div style={{ width: 1, background: 'rgba(255,255,255,0.1)', margin: '8px 0' }} />
              <select value={form.unit} onChange={e => set('unit', e.target.value)} style={{ flex: '0 0 85px', background: 'transparent', border: 'none', color: 'white', padding: '12px 14px', fontSize: 15, outline: 'none', minWidth: 0, boxSizing: 'border-box', appearance: 'none', cursor: 'pointer', textAlign: 'center' }}>
                <option style={{color:'black'}}>mcg</option><option style={{color:'black'}}>mg</option><option style={{color:'black'}}>IU</option><option style={{color:'black'}}>mL</option>
              </select>
            </div>
          </View>
        )}

        {/* Injection site */}
        <View style={styles.field}>
          <Text style={styles.lbl}>Injection Site</Text>
          <select
            style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '100px', padding: '14px 18px', color: 'white', fontSize: 15, boxSizing: 'border-box', outline: 'none' }}
            value={form.site}
            onChange={e => set('site', e.target.value)}
          >
            {SITES.map(s => <option key={s}>{s}</option>)}
          </select>
        </View>

        {/* Date + Time */}
        <View style={styles.field}>
          <Text style={styles.lbl}>Date & Time</Text>
          {/* date + time pill — raw HTML */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '100px', overflow: 'hidden' }}>
            <input type="date" value={form.date} onChange={e => set('date', e.target.value)} style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', padding: '12px 14px', fontSize: 13, outline: 'none', minWidth: 0, boxSizing: 'border-box' }} />
            <div style={{ width: 1, background: 'rgba(255,255,255,0.1)', margin: '8px 0' }} />
            <input type="time" value={form.time} onChange={e => set('time', e.target.value)} style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', padding: '12px 14px', fontSize: 13, outline: 'none', minWidth: 0, boxSizing: 'border-box' }} />
          </div>
        </View>

        {/* Notes */}
        <View style={styles.field}>
          <Text style={styles.lbl}>Notes</Text>
          <TextInput
            style={styles.notesInp}
            multiline
            numberOfLines={3}
            value={form.notes}
            onChangeText={v => set('notes', v)}
            placeholder="Add any details here..."
            placeholderTextColor="#6b7280"
          />
        </View>

        {/* Syringe visual */}
        {calcVisuals && calcVisuals.units > 0 && (
          <SyringeVisualizer units={calcVisuals.units} maxUnits={calcVisuals.maxUnits} ml={calcVisuals.ml} />
        )}

        <PressableCard onPress={submit} style={styles.submitBtn} pressableStyle={{ alignItems: 'center', justifyContent: 'center' }}>
          <Text style={styles.submitBtnText}>{isEdit ? 'SAVE CHANGES' : 'LOG INJECTION'}</Text>
        </PressableCard>
      </View>
    </Modal>
  );
}

export default LogFormModal;

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
  inpDisabled: {
    opacity: 0.5,
  },
  editHint: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 6,
    marginLeft: 4,
  },
  notesInp: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 18,
    color: 'white',
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  stackBox: {
    backgroundColor: 'rgba(17,24,39,0.3)',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    gap: 12,
  },
  stackBoxTitle: {
    color: '#22d3ee',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  stackTotalLabel: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  stackTotalValue: {
    color: '#22d3ee',
    fontSize: 15,
    fontWeight: '900',
  },
  submitBtn: {
    backgroundColor: '#0e7490', // TODO: expo-linear-gradient(135deg, #0e7490 0%, #22d3ee 100%)
    borderRadius: 100,
    padding: 16,
    alignItems: 'center',
    cursor: 'pointer',
    boxShadow: '0 10px 20px -5px rgba(34,211,238,0.3)',
    marginTop: 8,
  },
  submitBtnText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '900',
  },
});
