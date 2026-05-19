import React, { useState } from 'react';
import { colors } from '../../theme.js';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Pressable } from '../ui/Pressable.jsx';
import { Modal } from '../ui/Modal.jsx';
import { getLocalDate } from '../../constants.js';
import { button } from '../../theme.js';

export function QueueVialModal({ med, onClose, onSave }) {
  const [vialTotal, setVialTotal] = useState(med.vialTotal || '');
  const [bwAdded, setBwAdded] = useState(med.bwAdded || '');
  const [startDate, setStartDate] = useState(getLocalDate());
  const [peptides, setPeptides] = useState(
    med.isStack && med.subPeptides ? JSON.parse(JSON.stringify(med.subPeptides)) : []
  );

  const hasRemaining = parseFloat(med.vialRemaining || 0) > 0 && !med.isArchived;

  const handleSave = (overwriteNow) => {
    if (med.isStack) {
      const validPeps = peptides.filter(p => parseFloat(p.vialTotal) > 0);
      if (validPeps.length === 0) return;

      let totalStackMg = 0;
      validPeps.forEach(p => {
        const mg = p.vialUnit === 'mcg' ? parseFloat(p.vialTotal) / 1000 : parseFloat(p.vialTotal);
        totalStackMg += mg || 0;
      });

      onSave(med.id, {
        vialTotal: parseFloat(totalStackMg.toFixed(3)),
        bwAdded: parseFloat(bwAdded || 0),
        startDate,
        subPeptides: validPeps
      }, overwriteNow);
    } else {
      if (!vialTotal) return;
      onSave(med.id, {
        vialTotal: parseFloat(vialTotal),
        bwAdded: parseFloat(bwAdded || 0),
        startDate
      }, overwriteNow);
    }
  };

  return (
    <Modal title={med.isArchived ? `Restart: ${med.name}` : `New Vial: ${med.name}`} onClose={onClose}>
      <View style={styles.form}>

        {med.isStack ? (
          <View style={styles.blendBox}>
            <Text style={styles.blendTitle}>📊 Blend Composition</Text>
            <View style={styles.blendRows}>
              {peptides.map((p, idx) => (
                <View key={p.id} style={styles.blendRow}>
                  <Text style={styles.blendPepName}>{p.name.split('(')[0].trim()}</Text>
                  {/* pill input — raw HTML */}
                  <div style={{ display: 'flex', background: colors.surface, border: `1px solid ${colors.borderSubtle}`, borderRadius: '100px', overflow: 'hidden', width: 120 }}>
                    <input
                      id={`pep-total-${p.id}`}
                      name={`pep-total-${p.id}`}
                      type="number"
                      value={p.vialTotal}
                      onChange={e => { const n = [...peptides]; n[idx].vialTotal = e.target.value; setPeptides(n); }}
                      placeholder="0"
                      style={{ flex: 1, width: '100%', background: 'transparent', border: 'none', padding: '8px', color: colors.blue, fontSize: 14, fontWeight: 800, textAlign: 'center', outline: 'none' }}
                    />
                    <div style={{ width: 1, background: colors.borderSubtle, margin: '6px 0' }} />
                    <div style={{ padding: '8px', fontSize: 11, color: colors.textSecondary, fontWeight: 800 }}>{p.vialUnit}</div>
                  </div>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.field}>
            <Text style={styles.lbl}>Vial Size ({med.vialUnit || med.unit})</Text>
            <TextInput id="field-queuevialmodal-6" name="field-queuevialmodal-6" nativeID="field-queuevialmodal-6"
              style={styles.inp}
              value={String(vialTotal)}
              onChangeText={setVialTotal}
              placeholder="e.g. 5"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
            />
          </View>
        )}

        <View style={styles.field}>
          <Text style={styles.lbl}>Bacteriostatic Water Added (mL)</Text>
          <TextInput id="field-queuevialmodal-7" name="field-queuevialmodal-7" nativeID="field-queuevialmodal-7"
            style={styles.inp}
            value={String(bwAdded)}
            onChangeText={setBwAdded}
            keyboardType="numeric"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.lbl}>Start Date</Text>
          {/* date input — raw HTML */}
          <input
            id="start-date"
            name="start-date"
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            style={{ width: '100%', background: colors.borderFaint, border: `1px solid ${colors.borderSubtle}`, borderRadius: '100px', padding: '14px 18px', color: colors.white, fontSize: 15, boxSizing: 'border-box', outline: 'none' }}
          />
        </View>

        {hasRemaining ? (
          <View style={styles.splitBtns}>
            <Pressable onPress={() => handleSave(true)} style={styles.replaceBtn}>
              <Text style={styles.replaceBtnText}>REPLACE CURRENT</Text>
            </Pressable>
            <Pressable onPress={() => handleSave(false)} style={styles.queueBtn}>
              <Text style={styles.queueBtnText}>QUEUE FOR LATER</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={() => handleSave(true)} style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>{med.isArchived ? 'RESTART PROTOCOL' : 'SAVE NEW VIAL'}</Text>
          </Pressable>
        )}
      </View>
    </Modal>
  );
}

export default QueueVialModal;

const styles = StyleSheet.create({
  form: {
    gap: 20,
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
  blendBox: {
    backgroundColor: colors.tealDeep,
    borderWidth: 1,
    borderColor: colors.tealBorder,
    borderRadius: 24,
    padding: 16,
    gap: 12,
  },
  blendTitle: {
    color: colors.blueLight,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  blendRows: {
    gap: 8,
  },
  blendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.shadowSoft,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderFaint,
  },
  blendPepName: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  splitBtns: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  replaceBtn: {
    flex: 1,
    backgroundColor: colors.errorDeepBg,
    borderWidth: 1,
    borderColor: colors.errorDeepBorder,
    borderRadius: 100,
    padding: 16,
    alignItems: 'center',
    cursor: 'pointer',
  },
  replaceBtnText: {
    color: colors.errorLight,
    fontSize: 14,
    fontWeight: '800',
  },
  queueBtn: {
    ...button.secondary,
    flex: 1,
    cursor: 'pointer',
  },
  queueBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '800',
  },
  saveBtn: {
    ...button.primary,
    cursor: 'pointer',
    marginTop: 8,
  },
  saveBtnText: {
    ...button.primaryText,
  },
});
