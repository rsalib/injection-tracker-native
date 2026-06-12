import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { InputField } from '../ui/InputField.jsx';
import { Pressable } from '../ui/Pressable.jsx';
import { SyringeVisualizer } from '../ui/SyringeVisualizer.jsx';
import { SearchDropdown } from '../ui/SearchDropdown.jsx';
import { ResponsiveColumns } from '../ui/Responsive.jsx';
import { ALL_STACKS, POPULAR_MEDS, VIAL_UNIT_OPTIONS, DOSE_UNIT_OPTIONS, getIuPerMg } from '../../constants.js';
import { colors, glass, button, input } from '../../theme.js';
import { toMg, calculateProportionateStack } from '../../mathEngine.js';

export function Calculator() {
  const [calcMode, setCalcMode] = useState('single');
  const [sylMl, setSylMl] = useState('1');
  const [sylU, setSylU] = useState('100');

  const [singleData, setSingleData] = useState({ name: '', iuPerMg: null, vialMg: '', vialUnit: 'mg', bwMl: '', doseAmount: '', doseUnit: 'mcg' });

  const [stackData, setStackData] = useState({
    bwMl: '',
    peptides: [{ id: Date.now().toString(), name: '', vialMg: '', vialUnit: 'mg', doseAmount: '', doseUnit: 'mcg' }]
  });
  const [stackSearch, setStackSearch] = useState('');

  const handleStackDoseChange = (idx, val) =>
    setStackData({ ...stackData, peptides: calculateProportionateStack(stackData.peptides, idx, val) });

  const handleStackUnitChange = (idx, newUnit) => {
    const newPeps = [...stackData.peptides];
    const p = newPeps[idx];
    const oldUnit = p.doseUnit;
    p.doseUnit = newUnit;
    const currentAmt = parseFloat(p.doseAmount);
    if (!isNaN(currentAmt)) {
      let newAmt = currentAmt;
      if (oldUnit === 'mcg' && newUnit === 'mg') newAmt = currentAmt / 1000;
      if (oldUnit === 'mg' && newUnit === 'mcg') newAmt = currentAmt * 1000;
      // IU↔mg/mcg conversion has no generic factor in the Calculator (no peptide
      // identity to look up iuPerMg from). When crossing the IU boundary, keep the
      // numeric value as-is — the user is asserting a new unit, not a conversion.
      p.doseAmount = parseFloat(newAmt.toFixed(3)).toString();
    }
    setStackData({ ...stackData, peptides: newPeps });
  };

  let calcUnits = 0;
  let calcMl = 0;
  let dosesLeft = 0;

  const sMl = parseFloat(sylMl) || 1;
  const sU = parseFloat(sylU) || 100;

  // Calculator math: normalize vial + dose to a common base via toMg. When the
  // selected peptide has a known iuPerMg ratio (e.g., HGH = 3 IU/mg), cross-unit
  // entries like vial 24 IU + dose 1 mg compute correctly (1 mg → 3 IU on a 24 IU
  // vial). Without a ratio, IU is closed-family pass-through; mg ↔ mcg always works.
  if (calcMode === 'single') {
    const vRaw = parseFloat(singleData.vialMg) || 0;
    const bw = parseFloat(singleData.bwMl) || 0;
    const dRaw = parseFloat(singleData.doseAmount) || 0;
    if (vRaw > 0 && bw > 0 && dRaw > 0) {
      const vNorm = toMg(String(vRaw), singleData.vialUnit, singleData.iuPerMg);
      const dNorm = toMg(String(dRaw), singleData.doseUnit, singleData.iuPerMg);
      const conc = vNorm / bw;
      calcMl = dNorm / conc;
      calcUnits = (calcMl / sMl) * sU;
      dosesLeft = vNorm / dNorm;
    }
  } else {
    const bw = parseFloat(stackData.bwMl) || 0;
    if (bw > 0) {
      const validPep = stackData.peptides.find(p => parseFloat(p.vialMg) > 0 && parseFloat(p.doseAmount) > 0);
      if (validPep) {
        const vNorm = toMg(String(parseFloat(validPep.vialMg)), validPep.vialUnit || 'mg', validPep.iuPerMg);
        const dNorm = toMg(String(parseFloat(validPep.doseAmount)), validPep.doseUnit, validPep.iuPerMg);
        const conc = vNorm / bw;
        calcMl = dNorm / conc;
        calcUnits = (calcMl / sMl) * sU;
        dosesLeft = vNorm / dNorm;
      }
    }
  }

  return (
    <View style={styles.root}>

      {/* gap 16 matches root's gap — mobile is pixel-identical; desktop puts
          the input sections left and the live results right. The results child
          is conditional, so with no valid math the inputs take the full row. */}
      <ResponsiveColumns gap={16}>

      <View style={styles.inputsCol}>

      {/* 1. Mode Toggle */}
      <View style={styles.modeToggle}>
        <Pressable
          onPress={() => setCalcMode('single')}
          style={[styles.modeBtn, calcMode === 'single' && styles.modeBtnActive]}
        >
          <Text style={[styles.modeBtnText, calcMode === 'single' && styles.modeBtnTextActive]}>
            SINGLE PEPTIDE
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setCalcMode('stack')}
          style={[styles.modeBtn, calcMode === 'stack' && styles.modeBtnActive]}
        >
          <Text style={[styles.modeBtnText, calcMode === 'stack' && styles.modeBtnTextActive]}>
            BLENDED VIAL
          </Text>
        </Pressable>
      </View>

      {/* 1.5 Stack preset search */}
      {calcMode === 'stack' && (
        <View style={styles.searchWrap}>
          <Text style={styles.lbl}>Load Pre-Made Blend</Text>
          <SearchDropdown
            value={stackSearch}
            onChange={setStackSearch}
            placeholder="Search blended vials..."
            options={ALL_STACKS.filter(s => !stackSearch || s.name.toLowerCase().includes(stackSearch.toLowerCase()))}
            renderOption={m => (
              <>
                <span>{m.name}</span>
                <span style={{ fontSize: 10, color: colors.textAmber, background: colors.stackBadgeBg, borderRadius: '6px', padding: '4px 8px', marginLeft: 8, fontWeight: 900 }}>BLEND</span>
              </>
            )}
            onSelect={m => {
              setStackSearch('');
              setStackData({
                bwMl: stackData.bwMl,
                peptides: m.peptides.map((p, i) => ({
                  id: `sp_${Date.now()}_${i}`,
                  name: p.name || '',
                  iuPerMg: getIuPerMg(p.name),
                  vialMg: p.amount || '',
                  vialUnit: p.unit || 'mg',
                  doseAmount: p.dose || '',
                  doseUnit: p.doseUnit || 'mcg',
                }))
              });
            }}
          />
        </View>
      )}

      {/* 1.6 Single-peptide search — mirrors the stack-mode "Load Pre-Made Blend"
          search in the same slot. Picks up iuPerMg via getIuPerMg() so cross-unit
          IU↔mg math works in this tab too. */}
      {calcMode === 'single' && (
        <View style={styles.searchWrap}>
          <Text style={styles.lbl}>Load Peptide</Text>
          <SearchDropdown
            value={singleData.name}
            onChange={v => setSingleData({ ...singleData, name: v, iuPerMg: getIuPerMg(v) })}
            placeholder="Search peptides..."
            options={POPULAR_MEDS.filter(m => !singleData.name || m.name.toLowerCase().includes(singleData.name.toLowerCase())).slice(0, 15)}
            renderOption={m => (
              <>
                <span>{m.name}</span>
                <span style={{ fontSize: 11, color: colors.textSecondary, marginLeft: 8, fontWeight: 600 }}>{m.type}</span>
              </>
            )}
            onSelect={m => setSingleData({
              ...singleData,
              name: m.name,
              iuPerMg: m.iuPerMg ?? null,
              vialUnit: m.unit === 'mcg' ? 'mg' : m.unit,
              doseUnit: m.unit,
            })}
          />
        </View>
      )}

      {/* 2. Syringe Specs Well */}
      <View style={styles.well}>
        <Text style={styles.lbl}>Syringe Specifications</Text>
        <View style={styles.grid2}>
          <View style={styles.col}>
            <Text style={styles.fieldLabel}>SYRINGE VOLUME</Text>
            <View style={styles.pillWrapper}>
              <InputField id="field-calculator-9" name="field-calculator-9" nativeID="field-calculator-9"
                style={styles.pillInput}
                keyboardType="decimal-pad"
                value={sylMl}
                onChangeText={setSylMl}
              />
              <View style={styles.pillDivider} />
              <View style={styles.pillUnit}><Text style={styles.pillUnitText}>mL</Text></View>
            </View>
          </View>
          <View style={styles.col}>
            <Text style={styles.fieldLabel}>SYRINGE UNITS</Text>
            <View style={styles.pillWrapper}>
              <InputField id="field-calculator-10" name="field-calculator-10" nativeID="field-calculator-10"
                style={styles.pillInput}
                keyboardType="decimal-pad"
                value={sylU}
                onChangeText={setSylU}
              />
              <View style={styles.pillDivider} />
              <View style={styles.pillUnit}><Text style={styles.pillUnitText}>U</Text></View>
            </View>
          </View>
        </View>
      </View>

      {/* 3. Single Peptide Inputs */}
      {calcMode === 'single' && (
        <View style={styles.section}>
          <View style={styles.well}>
            <Text style={styles.lbl}>Reconstitution Specs</Text>
            <View style={styles.grid2}>
              <View style={styles.col}>
                <Text style={styles.fieldLabel}>VIAL TOTAL</Text>
                <View style={styles.pillWrapper}>
                  <InputField id="field-calculator-11" name="field-calculator-11" nativeID="field-calculator-11"
                    style={styles.pillInput}
                    keyboardType="decimal-pad"
                    value={singleData.vialMg}
                    onChangeText={v => setSingleData({ ...singleData, vialMg: v })}
                    placeholder="e.g. 5"
                    placeholderTextColor={colors.bgMid3}
                  />
                  <View style={styles.pillDivider} />
                  <select
                    id="field-calculator-vialunit-single"
                    name="field-calculator-vialunit-single"
                    style={selectStyle}
                    value={singleData.vialUnit}
                    onChange={e => setSingleData({ ...singleData, vialUnit: e.target.value })}
                  >
                    {VIAL_UNIT_OPTIONS.map(u => <option key={u}>{u}</option>)}
                  </select>
                </View>
              </View>
              <View style={styles.col}>
                <Text style={styles.fieldLabel}>BW ADDED</Text>
                <View style={styles.pillWrapper}>
                  <InputField id="field-calculator-12" name="field-calculator-12" nativeID="field-calculator-12"
                    style={styles.pillInput}
                    keyboardType="decimal-pad"
                    value={singleData.bwMl}
                    onChangeText={v => setSingleData({ ...singleData, bwMl: v })}
                    placeholder="e.g. 2"
                    placeholderTextColor={colors.bgMid3}
                  />
                  <View style={styles.pillDivider} />
                  <View style={styles.pillUnit}><Text style={styles.pillUnitText}>mL</Text></View>
                </View>
              </View>
            </View>
          </View>

          <View>
            <Text style={styles.lbl}>Target Dose</Text>
            <View style={styles.pillWrapper}>
              <InputField id="field-calculator-13" name="field-calculator-13" nativeID="field-calculator-13"
                style={styles.pillInput}
                keyboardType="decimal-pad"
                value={singleData.doseAmount}
                onChangeText={v => setSingleData({ ...singleData, doseAmount: v })}
                placeholder="e.g. 250"
                placeholderTextColor={colors.bgMid3}
              />
              <View style={styles.pillDivider} />
              {/* <select> kept as native HTML per migration rules */}
              <select
                id="field-calculator-unit-single"
                name="field-calculator-unit-single"
                style={selectStyle}
                value={singleData.doseUnit}
                onChange={e => {
                  const oldUnit = singleData.doseUnit;
                  const newUnit = e.target.value;
                  let amt = parseFloat(singleData.doseAmount);
                  if (!isNaN(amt)) {
                    if (oldUnit === 'mcg' && newUnit === 'mg') amt = amt / 1000;
                    if (oldUnit === 'mg' && newUnit === 'mcg') amt = amt * 1000;
                    // Crossing the IU boundary: keep the numeric value (no generic ratio in Calculator).
                  }
                  setSingleData({
                    ...singleData,
                    doseUnit: newUnit,
                    doseAmount: isNaN(amt) ? singleData.doseAmount : parseFloat(amt.toFixed(3)).toString(),
                  });
                }}
              >
                {DOSE_UNIT_OPTIONS.map(u => <option key={u}>{u}</option>)}
              </select>
            </View>
          </View>
        </View>
      )}

      {/* 4. Blended Stack Inputs */}
      {calcMode === 'stack' && (
        <View style={styles.section}>
          <View style={styles.well}>
            <Text style={styles.lbl}>Shared Reconstitution</Text>
            <Text style={styles.fieldLabel}>BW ADDED (TOTAL)</Text>
            <View style={styles.pillWrapper}>
              <InputField id="field-calculator-14" name="field-calculator-14" nativeID="field-calculator-14"
                style={styles.pillInput}
                keyboardType="decimal-pad"
                value={stackData.bwMl}
                onChangeText={v => setStackData({ ...stackData, bwMl: v })}
                placeholder="e.g. 2"
                placeholderTextColor={colors.bgMid3}
              />
              <View style={styles.pillDivider} />
              <View style={styles.pillUnit}><Text style={styles.pillUnitText}>mL</Text></View>
            </View>
          </View>

          {stackData.peptides.map((p, idx) => (
            <View key={p.id} style={styles.peptideCard}>
              {stackData.peptides.length > 1 && (
                <Pressable
                  onPress={() => {
                    const newPeps = [...stackData.peptides];
                    newPeps.splice(idx, 1);
                    setStackData({ ...stackData, peptides: newPeps });
                  }}
                  style={styles.removeBtn}
                >
                  <Text style={styles.removeBtnText}>REMOVE</Text>
                </Pressable>
              )}
              <Text style={styles.lbl}>
                {p.name ? p.name.split('(')[0].trim() : `Peptide ${idx + 1}`}
              </Text>
              <View style={styles.grid2mt}>
                <View style={styles.col}>
                  <Text style={styles.fieldLabel}>VIAL TOTAL</Text>
                  <View style={styles.pillWrapper}>
                    <InputField id="field-calculator-15" name="field-calculator-15" nativeID="field-calculator-15"
                      style={styles.pillInput}
                      keyboardType="decimal-pad"
                      value={p.vialMg}
                      placeholder="e.g. 5"
                      placeholderTextColor={colors.bgMid3}
                      onChangeText={v => {
                        const n = [...stackData.peptides];
                        n[idx].vialMg = v;
                        setStackData({ ...stackData, peptides: n });
                      }}
                    />
                    <View style={styles.pillDivider} />
                    <select
                      id={`field-calculator-vialunit-stack-${idx}`}
                      name={`field-calculator-vialunit-stack-${idx}`}
                      style={selectStyle}
                      value={p.vialUnit || 'mg'}
                      onChange={e => {
                        const n = [...stackData.peptides];
                        n[idx].vialUnit = e.target.value;
                        setStackData({ ...stackData, peptides: n });
                      }}
                    >
                      {VIAL_UNIT_OPTIONS.map(u => <option key={u}>{u}</option>)}
                    </select>
                  </View>
                </View>
                <View style={styles.col}>
                  <Text style={styles.fieldLabel}>TARGET DOSE</Text>
                  <View style={styles.pillWrapper}>
                    <InputField id="field-calculator-16" name="field-calculator-16" nativeID="field-calculator-16"
                      style={styles.pillInput}
                      keyboardType="decimal-pad"
                      value={p.doseAmount}
                      placeholder="e.g. 250"
                      placeholderTextColor={colors.bgMid3}
                      onChangeText={v => handleStackDoseChange(idx, v)}
                    />
                    <View style={styles.pillDivider} />
                    <select
                      id={`field-calculator-unit-stack-${idx}`}
                      name={`field-calculator-unit-stack-${idx}`}
                      style={selectStyle}
                      value={p.doseUnit}
                      onChange={e => handleStackUnitChange(idx, e.target.value)}
                    >
                      {DOSE_UNIT_OPTIONS.map(u => <option key={u}>{u}</option>)}
                    </select>
                  </View>
                </View>
              </View>
            </View>
          ))}

          <Pressable
            onPress={() => setStackData({
              ...stackData,
              peptides: [...stackData.peptides, { id: Date.now().toString(), name: '', vialMg: '', vialUnit: 'mg', doseAmount: '', doseUnit: 'mcg' }]
            })}
            style={[styles.addPeptideBtn, { justifyContent: 'center' }]}
          >
            <Text style={styles.addPeptideBtnText}>+ ADD ANOTHER PEPTIDE</Text>
          </Pressable>
        </View>
      )}

      </View>

      {/* 5. Results */}
      {calcUnits > 0 && (
        <View style={styles.results}>
          <Text style={styles.resultsTitle}>Volume to Draw</Text>
          <View style={styles.resultsRow}>
            <View style={styles.resultCell}>
              <Text style={styles.resultValue}>{calcUnits.toFixed(1)}</Text>
              <Text style={styles.resultUnit}>Units</Text>
            </View>
            <View style={styles.resultsDivider} />
            <View style={styles.resultCell}>
              <Text style={styles.resultValue}>{calcMl.toFixed(3)}</Text>
              <Text style={styles.resultUnit}>mL</Text>
            </View>
          </View>

          {dosesLeft > 0 && (
            <View style={styles.dosesLeftBadge}>
              <Text style={styles.dosesLeftText}>
                This {calcMode === 'single' ? 'vial' : 'blend'} contains ~
                <Text style={styles.dosesLeftNum}>{Math.floor(dosesLeft)} doses</Text>
              </Text>
            </View>
          )}

          <SyringeVisualizer units={calcUnits} maxUnits={sU} ml={calcMl} />
        </View>
      )}

      </ResponsiveColumns>
    </View>
  );
}

export default Calculator;

// Native <select> style — applied inline since it's an HTML element
const selectStyle = {
  flex: '0 0 85px',
  background: 'transparent',
  border: 'none',
  color: colors.white,
  padding: '14px 10px',
  fontSize: 16,
  outline: 'none',
  minWidth: 0,
  boxSizing: 'border-box',
  cursor: 'pointer',
};

const styles = StyleSheet.create({
  root: {
    flexDirection: 'column',
    gap: 16,
  },
  // Left column inside the ResponsiveColumns split — keeps the input sections
  // spaced at the same 16px the root gap gave them pre-split.
  inputsCol: {
    gap: 16,
  },

  // ── Mode toggle ────────────────────────────────────────────────────
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 100,
    padding: 6,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,  // v2: padding: "14px" (all sides)
    borderRadius: 100,
    alignItems: 'center',
    transition: 'all 0.2s',
    cursor: 'pointer',
  },
  modeBtnActive: {
    // TODO: replace with expo-linear-gradient / react-native-linear-gradient
    // when adding native builds. v2 used: linear-gradient(135deg, #0e7490 0%, #0a84ff 100%)
    backgroundColor: colors.primary,
  },
  modeBtnText: {
    color: colors.textSecondary,
    fontWeight: '900',
    fontSize: 13,
  },
  modeBtnTextActive: {
    color: colors.white,
  },

  // ── Search dropdown wrapper ────────────────────────────────────────
  searchWrap: {
    position: 'relative',
    zIndex: 50,
  },

  // ── Well card (matches v2 wellStyle) ──────────────────────────────
  well: {
    backgroundColor: colors.surfaceDeep,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },

  // ── Labels (match v2 lbl / labelStyle) ────────────────────────────
  lbl: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.55,   // v2: "0.05em" at 11px = 0.55px
    marginBottom: 8,
    paddingLeft: 4,
  },
  fieldLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginBottom: 6,
    marginLeft: 4,
    fontWeight: '800',
  },

  // ── Layout ────────────────────────────────────────────────────────
  section: {
    flexDirection: 'column',
    gap: 16,
  },
  grid2: {
    flexDirection: 'row',
    gap: 12,
  },
  grid2mt: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  col: {
    flex: 1,
    minWidth: 0,
  },

  // ── Pill input row (matches v2 pillWrapper + inpField) ────────────
  pillWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceRow, // v97: inner-well color (was colors.borderFaint)
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 100,
    overflow: 'hidden',
  },
  pillInput: {
    ...input.fieldPill,
  },
  pillDivider: {
    width: 1,
    backgroundColor: colors.borderSubtle,
    marginVertical: 10,
  },
  pillUnit: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.shadowSoft,
  },
  pillUnitText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '800',
  },

  // ── Stack peptide card ────────────────────────────────────────────
  peptideCard: {
    ...glass.cardEmphasis,
    borderRadius: 32,
    padding: 24,
    position: 'relative',
    zIndex: 10,
  },
  removeBtn: {
    position: 'absolute',
    top: 16,
    right: 20,
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
  addPeptideBtn: {
    backgroundColor: colors.blueDim,
    borderWidth: 1,
    borderColor: colors.blueBorder,
    borderStyle: 'dashed',
    borderRadius: 100,
    paddingVertical: 18,
    paddingHorizontal: 18,  // v2: padding: "18px" (all sides)
    alignItems: 'center',
    transition: '0.2s',
    cursor: 'pointer',
  },
  addPeptideBtnText: {
    color: colors.blue,
    fontWeight: '900',
    fontSize: 14,
  },

  // ── Results dashboard ─────────────────────────────────────────────
  results: {
    marginTop: 16,
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderRadius: 32,
    backgroundColor: colors.tealDeep,
    borderWidth: 1,
    borderColor: colors.blueBorder,
    boxShadow: `0 10px 40px -10px ${colors.blueGlowSoft}`,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.white,
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: -0.36,   // v2: "-0.02em" at 18px = -0.36px
  },
  resultsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 24,
  },
  resultCell: {
    alignItems: 'center',
  },
  resultValue: {
    fontSize: 40,
    fontWeight: '900',
    color: colors.blue,
    lineHeight: 40,         // v2: lineHeight: 1 (= 1× fontSize = 40)
  },
  resultUnit: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textSecondary,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.6,     // v2: "0.05em" at 12px = 0.6px
  },
  resultsDivider: {
    width: 1,
    height: 48,
    backgroundColor: colors.blueMid,
  },
  dosesLeftBadge: {
    alignItems: 'center',
    padding: 14,            // v2: padding: "14px" (all sides)
    backgroundColor: colors.shadowSoft,
    borderRadius: 100,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dosesLeftText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  dosesLeftNum: {
    color: colors.white,
    fontWeight: '900',
  },

});
