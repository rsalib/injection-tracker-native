import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { InputField } from '../ui/InputField.jsx';
import { Pressable } from '../ui/Pressable.jsx';
import { Modal } from '../ui/Modal.jsx';
import { SearchDropdown } from '../ui/SearchDropdown.jsx';
import { colors, blur, button, input, type } from '../../theme.js';
import { SITES, DAYS, EMPTY_MED, POPULAR_MEDS, ALL_STACKS, VIAL_UNIT_OPTIONS, DOSE_UNIT_OPTIONS, getIuPerMg } from '../../constants.js';
import { toMg, calculateProportionateStack } from '../../mathEngine.js';


export function MedForm({ initial, onSave, onClose, title, originElement }) {
  const isEdit = !!initial.id;

  const initPeps = initial.isStack && initial.subPeptides
    ? initial.subPeptides
    : [{
        id: `sp_${Date.now()}`,
        name: initial.name || '',
        dose: initial.dose || '',
        unit: initial.unit || 'mcg',
        vialTotal: initial.vialTotal || '',
        vialUnit: initial.vialUnit || 'mg'
      }];

  const [form, setForm] = useState({
    ...initial,
    name: initial.isStack ? initial.name : (initPeps[0]?.name || ''),
    bwAdded: initial.bwAdded || '',
    syringeMl: initial.syringeMl || '1',
    syringeUnits: initial.syringeUnits || '100',
    type: initial.type || 'Peptide'
  });
  const [peptides, setPeptides] = useState(initPeps);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleDay = d => {
    setForm(f => ({
      ...f,
      frequency: 'Custom',
      scheduleDays: f.scheduleDays?.includes(d) ? f.scheduleDays.filter(x => x !== d) : [...(f.scheduleDays || []), d]
    }));
  };

  const PRESETS = [
    { l: 'Daily', d: DAYS },
    { l: 'Every Other Day', d: ['Monday', 'Wednesday', 'Friday', 'Sunday'] },
    { l: 'Twice Weekly', d: ['Monday', 'Thursday'] },
    { l: 'Weekly', d: ['Monday'] },
    { l: 'Weekdays Only', d: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
    { l: 'Weekends Only', d: ['Saturday', 'Sunday'] },
    { l: 'Custom', d: null }
  ];

  const handleStackDoseChange = (idx, val) => {
    setPeptides(calculateProportionateStack(peptides, idx, val));
  };

  const handleStackUnitChange = (idx, newUnit) => {
    const newPeps = [...peptides];
    const p = newPeps[idx];
    const oldUnit = p.unit;
    p.unit = newUnit;
    const currentAmt = parseFloat(p.dose);
    if (!isNaN(currentAmt)) {
      let newAmt = currentAmt;
      if (oldUnit === 'mcg' && newUnit === 'mg') newAmt = currentAmt / 1000;
      if (oldUnit === 'mg' && newUnit === 'mcg') newAmt = currentAmt * 1000;
      p.dose = parseFloat(newAmt.toFixed(3)).toString();
    }
    setPeptides(newPeps);
  };

  const submit = () => {
    const validPeps = peptides.filter(p => p.name && p.dose && p.vialTotal);
    if (validPeps.length === 0) {
      window.showToast?.('Please complete the medication name, dose, and vial size.', 'error');
      return;
    }

    if (validPeps.length === 1) {
      const p = validPeps[0];
      onSave({
        ...form,
        name: form.name || p.name,
        type: form.type === 'Stack' ? 'Peptide' : form.type,
        isStack: false,
        subPeptides: null,
        dose: parseFloat(p.dose).toString(),
        unit: p.unit,
        vialTotal: parseFloat(p.vialTotal) || 0,
        vialRemaining: isEdit && form.vialRemaining ? parseFloat(form.vialRemaining) : (parseFloat(p.vialTotal) || 0),
        vialUnit: p.vialUnit,
        iuPerMg: p.iuPerMg ?? form.iuPerMg ?? null,
        bwAdded: parseFloat(form.bwAdded) || 0,
      });
    } else {
      if (!form.name) form.name = 'Custom Blend';
      if (!form.bwAdded) {
        window.showToast?.('Please enter the total Bacteriostatic Water (BW) amount for the blend.', 'error');
        return;
      }

      let totalStackMg = 0;
      let totalDoseMg = 0;
      validPeps.forEach(p => {
        totalStackMg += toMg(parseFloat(p.vialTotal) || 0, p.vialUnit, p.iuPerMg);
        totalDoseMg += toMg(parseFloat(p.dose) || 0, p.unit, p.iuPerMg);
      });

      const displayDoseUnit = totalDoseMg < 1 ? 'mcg' : 'mg';
      const displayDoseAmt = displayDoseUnit === 'mcg' ? (totalDoseMg * 1000) : totalDoseMg;

      onSave({
        ...form,
        name: form.name,
        type: 'Stack',
        isStack: true,
        subPeptides: validPeps,
        dose: parseFloat(displayDoseAmt.toFixed(3)).toString(),
        unit: displayDoseUnit,
        vialTotal: parseFloat(totalStackMg.toFixed(3)).toString(),
        vialRemaining: isEdit && form.vialRemaining ? parseFloat(form.vialRemaining) : parseFloat(totalStackMg.toFixed(3)).toString(),
        vialUnit: 'mg',
        bwAdded: parseFloat(form.bwAdded) || 0,
      });
    }
  };

  const indivOpts = form.name
    ? POPULAR_MEDS.filter(m => m.name.toLowerCase().includes(form.name.toLowerCase())).slice(0, 15)
    : POPULAR_MEDS.slice(0, 15);
  const stackOpts = ALL_STACKS
    .filter(s => !form.name || s.name.toLowerCase().includes(form.name.toLowerCase()))
    .map(s => ({ ...s, _isStack: true, type: 'Stack' }));
  const medOpts = [...indivOpts, ...stackOpts];

  return (
    <Modal title={title} onClose={onClose} originElement={originElement}>
      <View style={styles.form}>

        {/* Search / Blend Name */}
        <View style={styles.field}>
          <Text style={styles.lbl}>{peptides.length > 1 ? 'Protocol / Blend Name' : 'Search Medication / Peptide'}</Text>
          <SearchDropdown
            value={form.name}
            onChange={v => {
              set('name', v);
              if (peptides.length === 1) {
                const nPeps = [...peptides]; nPeps[0].name = v; setPeptides(nPeps);
              }
            }}
            placeholder={peptides.length > 1 ? 'e.g. AM Recovery Stack' : 'Search medications...'}
            options={medOpts}
            renderOption={m => (
              <>
                <span>{m.name}</span>
                {m._isStack
                  ? <span style={{ fontSize: 10, color: colors.textAmber, background: colors.stackBadgeBg, borderRadius: '6px', padding: '4px 8px', marginLeft: 8, fontWeight: 900 }}>STACK</span>
                  : <span style={{ fontSize: 11, color: colors.textSecondary, marginLeft: 8, fontWeight: 600 }}>{m.type}</span>
                }
              </>
            )}
            onSelect={m => {
              if (m._isStack) {
                // Each stack peptide carries its own iuPerMg via the shared getIuPerMg helper.
                const firstP = m.peptides[0];
                const firstIuPerMg = getIuPerMg(firstP.name);
                const firstAmt = toMg(parseFloat(firstP.amount) || 0, firstP.unit, firstIuPerMg);
                const firstDose = toMg(parseFloat(firstP.dose) || 0, firstP.doseUnit, firstIuPerMg);
                const drawRatio = firstAmt > 0 && firstDose > 0 ? firstDose / firstAmt : 0;
                setPeptides(m.peptides.map((p, i) => {
                  const pIuPerMg = getIuPerMg(p.name);
                  const pAmt = toMg(parseFloat(p.amount) || 0, p.unit, pIuPerMg);
                  const normalizedMg = i === 0 ? firstDose : (pAmt * drawRatio);
                  const normalizedDose = i === 0 ? p.dose : (p.doseUnit === 'mcg' ? parseFloat((normalizedMg * 1000).toFixed(3)).toString() : parseFloat(normalizedMg.toFixed(3)).toString());
                  return { id: `sp_${Date.now()}_${i}`, name: p.name, dose: normalizedDose, unit: p.doseUnit, vialTotal: p.amount, vialUnit: p.unit, iuPerMg: pIuPerMg };
                }));
                setForm(f => ({ ...f, name: m.name, type: 'Stack' }));
              } else {
                setPeptides([{ id: `sp_${Date.now()}`, name: m.name, dose: m.dose || '', unit: m.unit, vialTotal: '', vialUnit: m.unit === 'mcg' ? 'mg' : m.unit, iuPerMg: m.iuPerMg ?? null }]);
                setForm(f => ({ ...f, name: m.name, type: m.type, iuPerMg: m.iuPerMg ?? null }));
              }
            }}
          />
        </View>

        {/* Type — single peptide only */}
        {peptides.length === 1 && (
          <View style={styles.field}>
            <Text style={styles.lbl}>Type</Text>
            <select style={input.rawSelect} value={form.type} onChange={e => set('type', e.target.value)}>
              <option>Peptide</option><option>Hormone</option><option>SARM</option><option>Other</option>
            </select>
          </View>
        )}

        {/* Syringe settings */}
        <View style={styles.row2}>
          <View style={styles.flex1}>
            <Text style={styles.lbl}>Syringe Vol (mL)</Text>
            <select style={input.rawSelect} value={form.syringeMl} onChange={e => set('syringeMl', e.target.value)}>
              <option value="0.3">0.3 mL</option><option value="0.5">0.5 mL</option><option value="1">1.0 mL</option>
            </select>
          </View>
          <View style={styles.flex1}>
            <Text style={styles.lbl}>Syringe Units</Text>
            <select style={input.rawSelect} value={form.syringeUnits} onChange={e => set('syringeUnits', e.target.value)}>
              <option value="30">30 U</option><option value="50">50 U</option><option value="100">100 U</option>
            </select>
          </View>
        </View>

        {/* Reconstitution volume */}
        <View style={styles.well}>
          <Text style={styles.lbl}>Reconstitution Volume</Text>
          <Text style={styles.hint}>TOTAL BW ADDED (mL)</Text>
          <InputField id="field-addmedmodal-1" name="field-addmedmodal-1" nativeID="field-addmedmodal-1"
            style={styles.inp}
            value={form.bwAdded}
            onChangeText={v => set('bwAdded', v)}
            placeholder="e.g. 2"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
          />
        </View>

        {/* Peptide cards */}
        {peptides.map((p, idx) => (
          <View key={p.id} style={styles.pepCard}>
            {peptides.length > 1 && (
              <Pressable
                onPress={() => { const n = [...peptides]; n.splice(idx, 1); setPeptides(n); }}
                style={styles.removeBtn}
              >
                <Text style={styles.removeBtnText}>REMOVE</Text>
              </Pressable>
            )}

            {peptides.length > 1 && (
              <View style={styles.pepNameField}>
                <Text style={styles.hint}>INGREDIENT NAME</Text>
                <SearchDropdown
                  value={p.name}
                  onChange={v => { const n = [...peptides]; n[idx].name = v; setPeptides(n); }}
                  placeholder="e.g. BPC-157"
                  options={POPULAR_MEDS.filter(m => m.name.toLowerCase().includes((p.name || '').toLowerCase())).slice(0, 10)}
                  renderOption={m => (
                    <>
                      <span>{m.name}</span>
                      <span style={{ fontSize: 10, color: colors.textSecondary, marginLeft: 8, fontWeight: 600 }}>{m.type}</span>
                    </>
                  )}
                  onSelect={m => {
                    const n = [...peptides];
                    n[idx].name = m.name;
                    n[idx].unit = m.unit || 'mcg';
                    n[idx].vialUnit = (m.unit === 'mcg') ? 'mg' : m.unit;
                    setPeptides(n);
                  }}
                />
              </View>
            )}

            {/* Vial Total + Target Dose — pill input+select combos, raw HTML */}
            <View style={styles.row2}>
              <View style={styles.flex1}>
                <Text style={styles.hint}>VIAL TOTAL</Text>
                <div style={input.compositePillFaint}>
                  <input id={`pep-vial-${idx}`} name={`pep-vial-${idx}`} type="number" value={p.vialTotal} placeholder="e.g. 5" onChange={e => { const n = [...peptides]; n[idx].vialTotal = e.target.value; setPeptides(n); }} style={{ flex: 1, background: 'transparent', border: 'none', color: colors.white, padding: '10px 8px', fontSize: 14, outline: 'none', minWidth: 0, boxSizing: 'border-box' }} />
                  <div style={input.compositePillDivider} />
                  <select value={p.vialUnit} onChange={e => { const n = [...peptides]; n[idx].vialUnit = e.target.value; setPeptides(n); }} style={{ flex: '0 0 55px', background: 'transparent', border: 'none', color: colors.white, padding: '10px 4px', fontSize: 14, outline: 'none', minWidth: 0, boxSizing: 'border-box', appearance: 'none', cursor: 'pointer', textAlign: 'center' }}>
                    {VIAL_UNIT_OPTIONS.map(u => <option key={u} style={{color:'black'}}>{u}</option>)}
                  </select>
                </div>
              </View>
              <View style={styles.flex1}>
                <Text style={styles.hintCyan}>TARGET DOSE</Text>
                <div style={input.compositePillAccent}>
                  <input id={`pep-dose-${idx}`} name={`pep-dose-${idx}`} type="number" value={p.dose} placeholder="e.g. 250" onChange={e => handleStackDoseChange(idx, e.target.value)} style={{ flex: 1, background: 'transparent', border: 'none', color: colors.white, padding: '10px 8px', fontSize: 14, outline: 'none', minWidth: 0, boxSizing: 'border-box' }} />
                  <div style={input.compositePillDividerAccent} />
                  <select value={p.unit} onChange={e => handleStackUnitChange(idx, e.target.value)} style={{ flex: '0 0 55px', background: 'transparent', border: 'none', color: colors.white, padding: '10px 4px', fontSize: 14, outline: 'none', minWidth: 0, boxSizing: 'border-box', appearance: 'none', cursor: 'pointer', textAlign: 'center' }}>
                    {DOSE_UNIT_OPTIONS.map(u => <option key={u} style={{color:'black'}}>{u}</option>)}
                  </select>
                </div>
              </View>
            </View>
          </View>
        ))}

        {/* Add peptide */}
        <Pressable
          onPress={() => setPeptides([...peptides, { id: `sp_${Date.now()}`, name: '', vialTotal: '', vialUnit: 'mg', dose: '', unit: 'mcg' }])}
          style={[styles.addPepBtn, { justifyContent: 'center' }]}
        >
          <Text style={styles.addPepText}>+ ADD ANOTHER PEPTIDE</Text>
        </Pressable>

        {/* Schedule + Location */}
        <View style={styles.well}>
          <View style={styles.wellSection}>
            <Text style={styles.lbl}>Start Date & Time</Text>
            {/* date + time inputs — raw HTML */}
            <div style={input.compositePillFaint}>
              <input id="addmed-start-date" name="addmed-start-date" type="date" value={form.startDate || ''} onChange={e => set('startDate', e.target.value)} style={{ flex: 1, background: 'transparent', border: 'none', color: colors.white, padding: '12px 14px', fontSize: 13, outline: 'none', minWidth: 0, boxSizing: 'border-box' }} />
              <div style={input.compositePillDivider} />
              <input id="addmed-inj-time" name="addmed-inj-time" type="time" value={form.injectionTime || ''} onChange={e => set('injectionTime', e.target.value)} style={{ flex: 1, background: 'transparent', border: 'none', color: colors.white, padding: '12px 14px', fontSize: 13, outline: 'none', minWidth: 0, boxSizing: 'border-box' }} />
            </div>
          </View>
          <View>
            <Text style={styles.lbl}>Location</Text>
            <select style={input.rawSelect} value={form.site} onChange={e => set('site', e.target.value)}>
              {SITES.map(s => <option key={s}>{s}</option>)}
            </select>
          </View>
        </View>

        {/* Frequency */}
        <View style={styles.field}>
          <Text style={styles.lbl}>Frequency Preset</Text>
          <View style={styles.presetsRow}>
            {PRESETS.map(preset => (
              <Pressable
                key={preset.l}
                onPress={() => preset.d ? setForm(f => ({ ...f, frequency: preset.l, scheduleDays: preset.d })) : set('frequency', 'Custom')}
                style={[styles.presetBtn, form.frequency === preset.l && styles.presetBtnActive]}
              >
                <Text style={[styles.presetBtnText, form.frequency === preset.l && styles.presetBtnTextActive]}>{preset.l}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.daysGrid}>
            {DAYS.map(d => (
              <Pressable
                key={d}
                onPress={() => toggleDay(d)}
                style={[styles.dayBtn, form.scheduleDays?.includes(d) && styles.dayBtnActive]}
              >
                <Text style={[styles.dayBtnText, form.scheduleDays?.includes(d) && styles.dayBtnTextActive]}>{d.slice(0, 3)}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable onPress={submit} style={[styles.submitBtn, { justifyContent: 'center' }]}>
          <Text style={[styles.submitBtnText, { textAlign: 'center' }]}>{peptides.length > 1 ? 'SAVE STACK PROTOCOL' : 'SAVE MEDICATION'}</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

export function AddMedModal({ onClose, onSave }) {
  return <MedForm title="Add Medication / Protocol" initial={EMPTY_MED} onSave={onSave} onClose={onClose} />;
}

export default AddMedModal;

const styles = StyleSheet.create({
  form: {
    gap: 16,
  },
  field: {
    gap: 6,
  },
  lbl: {
    ...type.formLabel,
    marginBottom: 8,
    paddingLeft: 4,
  },
  hint: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '800',
    marginBottom: 6,
    paddingLeft: 4,
  },
  hintCyan: {
    fontSize: 10,
    color: colors.blue,
    fontWeight: '800',
    marginBottom: 6,
    paddingLeft: 4,
  },
  inp: {
    ...input.field,
  },
  well: {
    backgroundColor: colors.surfaceDeep,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 16,
  },
  wellSection: {
    marginBottom: 0,
  },
  row2: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
    gap: 6,
  },
  pepCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
    gap: 12,
  },
  pepNameField: {
    gap: 6,
  },
  removeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: colors.errorSoft,
    borderRadius: 100,
    paddingVertical: 6,
    paddingHorizontal: 12,
    cursor: 'pointer',
  },
  removeBtnText: {
    color: colors.error,
    fontSize: 10,
    fontWeight: '900',
  },
  addPepBtn: {
    backgroundColor: colors.blueDim,
    borderWidth: 1,
    borderColor: colors.blueBorder,
    borderStyle: 'dashed',
    borderRadius: 100,
    padding: 18,
    alignItems: 'center',
    cursor: 'pointer',
  },
  addPepText: {
    color: colors.blue,
    fontWeight: '900',
    fontSize: 14,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  presetBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 100,
    backgroundColor: colors.surface,
    cursor: 'pointer',
  },
  presetBtnActive: {
    backgroundColor: colors.blueDim,
  },
  presetBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.textSecondary,
  },
  presetBtnTextActive: {
    color: colors.blue,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 12,
    backgroundColor: colors.shadowSoft,
    borderRadius: 24,
  },
  dayBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 100,
    backgroundColor: colors.surface,
    cursor: 'pointer',
  },
  dayBtnActive: {
    backgroundColor: colors.blue,
  },
  dayBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  dayBtnTextActive: {
    color: colors.bg,
  },
  submitBtn: {
    ...button.primary,
    cursor: 'pointer',
    marginTop: 12,
  },
  submitBtnText: {
    ...button.primaryText,
  },
});
