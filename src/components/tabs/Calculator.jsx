import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { SyringeVisualizer } from '../ui/SyringeVisualizer.jsx';
import { SearchDropdown } from '../ui/SearchDropdown.jsx';
import { ALL_STACKS } from '../../constants.js';
import { toMg, calculateProportionateStack } from '../../mathEngine.js';

export function Calculator() {
  const [calcMode, setCalcMode] = useState('single');
  const [sylMl, setSylMl] = useState('1');
  const [sylU, setSylU] = useState('100');

  const [singleData, setSingleData] = useState({ vialMg: '', bwMl: '', doseAmount: '', doseUnit: 'mcg' });

  const [stackData, setStackData] = useState({
    bwMl: '',
    peptides: [{ id: Date.now().toString(), name: '', vialMg: '', doseAmount: '', doseUnit: 'mcg' }]
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
      p.doseAmount = parseFloat(newAmt.toFixed(3)).toString();
    }
    setStackData({ ...stackData, peptides: newPeps });
  };

  let calcUnits = 0;
  let calcMl = 0;
  let dosesLeft = 0;

  const sMl = parseFloat(sylMl) || 1;
  const sU = parseFloat(sylU) || 100;

  if (calcMode === 'single') {
    const vMg = parseFloat(singleData.vialMg) || 0;
    const bw = parseFloat(singleData.bwMl) || 0;
    const dAmt = parseFloat(singleData.doseAmount) || 0;
    if (vMg > 0 && bw > 0 && dAmt > 0) {
      const conc = vMg / bw;
      const dMg = toMg(String(dAmt), singleData.doseUnit);
      calcMl = dMg / conc;
      calcUnits = (calcMl / sMl) * sU;
      dosesLeft = vMg / dMg;
    }
  } else {
    const bw = parseFloat(stackData.bwMl) || 0;
    if (bw > 0) {
      const validPep = stackData.peptides.find(p => parseFloat(p.vialMg) > 0 && parseFloat(p.doseAmount) > 0);
      if (validPep) {
        const vMg = parseFloat(validPep.vialMg);
        const dAmt = parseFloat(validPep.doseAmount);
        const dMg = toMg(String(dAmt), validPep.doseUnit);
        const conc = vMg / bw;
        calcMl = dMg / conc;
        calcUnits = (calcMl / sMl) * sU;
        dosesLeft = vMg / dMg;
      }
    }
  }

  return (
    <View style={styles.root}>

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
              <View style={styles.dropdownOption}>
                <Text style={styles.dropdownOptionName}>{m.name}</Text>
                <Text style={styles.dropdownOptionBadge}>BLEND</Text>
              </View>
            )}
            onSelect={m => {
              setStackSearch('');
              setStackData({
                bwMl: stackData.bwMl,
                peptides: m.peptides.map((p, i) => ({
                  id: `sp_${Date.now()}_${i}`,
                  name: p.name || '',
                  vialMg: p.amount || '',
                  doseAmount: p.dose || '',
                  doseUnit: p.doseUnit || 'mcg',
                }))
              });
            }}
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
              <TextInput
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
              <TextInput
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
                  <TextInput
                    style={styles.pillInput}
                    keyboardType="decimal-pad"
                    value={singleData.vialMg}
                    onChangeText={v => setSingleData({ ...singleData, vialMg: v })}
                    placeholder="e.g. 5"
                    placeholderTextColor="#4b5563"
                  />
                  <View style={styles.pillDivider} />
                  <View style={styles.pillUnit}><Text style={styles.pillUnitText}>mg</Text></View>
                </View>
              </View>
              <View style={styles.col}>
                <Text style={styles.fieldLabel}>BW ADDED</Text>
                <View style={styles.pillWrapper}>
                  <TextInput
                    style={styles.pillInput}
                    keyboardType="decimal-pad"
                    value={singleData.bwMl}
                    onChangeText={v => setSingleData({ ...singleData, bwMl: v })}
                    placeholder="e.g. 2"
                    placeholderTextColor="#4b5563"
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
              <TextInput
                style={styles.pillInput}
                keyboardType="decimal-pad"
                value={singleData.doseAmount}
                onChangeText={v => setSingleData({ ...singleData, doseAmount: v })}
                placeholder="e.g. 250"
                placeholderTextColor="#4b5563"
              />
              <View style={styles.pillDivider} />
              {/* <select> kept as native HTML per migration rules */}
              <select
                style={selectStyle}
                value={singleData.doseUnit}
                onChange={e => {
                  const oldUnit = singleData.doseUnit;
                  const newUnit = e.target.value;
                  let amt = parseFloat(singleData.doseAmount);
                  if (!isNaN(amt)) {
                    if (oldUnit === 'mcg' && newUnit === 'mg') amt = amt / 1000;
                    if (oldUnit === 'mg' && newUnit === 'mcg') amt = amt * 1000;
                  }
                  setSingleData({
                    ...singleData,
                    doseUnit: newUnit,
                    doseAmount: isNaN(amt) ? singleData.doseAmount : parseFloat(amt.toFixed(3)).toString(),
                  });
                }}
              >
                <option>mcg</option>
                <option>mg</option>
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
              <TextInput
                style={styles.pillInput}
                keyboardType="decimal-pad"
                value={stackData.bwMl}
                onChangeText={v => setStackData({ ...stackData, bwMl: v })}
                placeholder="e.g. 2"
                placeholderTextColor="#4b5563"
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
                    <TextInput
                      style={styles.pillInput}
                      keyboardType="decimal-pad"
                      value={p.vialMg}
                      placeholder="e.g. 5"
                      placeholderTextColor="#4b5563"
                      onChangeText={v => {
                        const n = [...stackData.peptides];
                        n[idx].vialMg = v;
                        setStackData({ ...stackData, peptides: n });
                      }}
                    />
                    <View style={styles.pillDivider} />
                    <View style={styles.pillUnit}><Text style={styles.pillUnitText}>mg</Text></View>
                  </View>
                </View>
                <View style={styles.col}>
                  <Text style={styles.fieldLabel}>TARGET DOSE</Text>
                  <View style={styles.pillWrapper}>
                    <TextInput
                      style={styles.pillInput}
                      keyboardType="decimal-pad"
                      value={p.doseAmount}
                      placeholder="e.g. 250"
                      placeholderTextColor="#4b5563"
                      onChangeText={v => handleStackDoseChange(idx, v)}
                    />
                    <View style={styles.pillDivider} />
                    <select
                      style={selectStyle}
                      value={p.doseUnit}
                      onChange={e => handleStackUnitChange(idx, e.target.value)}
                    >
                      <option>mcg</option>
                      <option>mg</option>
                    </select>
                  </View>
                </View>
              </View>
            </View>
          ))}

          <Pressable
            onPress={() => setStackData({
              ...stackData,
              peptides: [...stackData.peptides, { id: Date.now().toString(), name: '', vialMg: '', doseAmount: '', doseUnit: 'mcg' }]
            })}
            style={styles.addPeptideBtn}
          >
            <Text style={styles.addPeptideBtnText}>+ ADD ANOTHER PEPTIDE</Text>
          </Pressable>
        </View>
      )}

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
    </View>
  );
}

export default Calculator;

// Native <select> style — applied inline since it's an HTML element
const selectStyle = {
  flex: '0 0 85px',
  background: 'transparent',
  border: 'none',
  color: 'white',
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

  // ── Mode toggle ────────────────────────────────────────────────────
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
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
    // when adding native builds. v2 used: linear-gradient(135deg, #0e7490 0%, #22d3ee 100%)
    backgroundColor: '#0e7490',
  },
  modeBtnText: {
    color: '#9ca3af',
    fontWeight: '900',
    fontSize: 13,
  },
  modeBtnTextActive: {
    color: 'white',
  },

  // ── Search dropdown wrapper ────────────────────────────────────────
  searchWrap: {
    position: 'relative',
    zIndex: 50,
  },

  // ── Well card (matches v2 wellStyle) ──────────────────────────────
  well: {
    backgroundColor: 'rgba(17, 24, 39, 0.3)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },

  // ── Labels (match v2 lbl / labelStyle) ────────────────────────────
  lbl: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.55,   // v2: "0.05em" at 11px = 0.55px
    marginBottom: 8,
    paddingLeft: 4,
  },
  fieldLabel: {
    fontSize: 10,
    color: '#6b7280',
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
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 100,
    overflow: 'hidden',
  },
  pillInput: {
    flex: 1,
    backgroundColor: 'transparent',
    color: 'white',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    outlineStyle: 'none',
    minWidth: 0,
  },
  pillDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 10,
  },
  pillUnit: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  pillUnitText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '800',
  },

  // ── Stack peptide card ────────────────────────────────────────────
  peptideCard: {
    backgroundColor: 'rgba(31, 41, 55, 0.4)',
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    position: 'relative',
    zIndex: 10,
  },
  removeBtn: {
    position: 'absolute',
    top: 16,
    right: 20,
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
    borderRadius: 100,
    paddingVertical: 6,
    paddingHorizontal: 12,
    cursor: 'pointer',
  },
  removeBtnText: {
    color: '#f87171',
    fontSize: 10,
    fontWeight: '900',
  },
  addPeptideBtn: {
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.3)',
    borderStyle: 'dashed',
    borderRadius: 100,
    paddingVertical: 18,
    paddingHorizontal: 18,  // v2: padding: "18px" (all sides)
    alignItems: 'center',
    transition: '0.2s',
    cursor: 'pointer',
  },
  addPeptideBtnText: {
    color: '#22d3ee',
    fontWeight: '900',
    fontSize: 14,
  },

  // ── Results dashboard ─────────────────────────────────────────────
  results: {
    marginTop: 16,
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderRadius: 32,
    backgroundColor: 'rgba(8, 51, 68, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.3)',
    boxShadow: '0 10px 40px -10px rgba(34,211,238,0.25)',
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: 'white',
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
    color: '#22d3ee',
    lineHeight: 40,         // v2: lineHeight: 1 (= 1× fontSize = 40)
  },
  resultUnit: {
    fontSize: 12,
    fontWeight: '800',
    color: '#67e8f9',
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.6,     // v2: "0.05em" at 12px = 0.6px
  },
  resultsDivider: {
    width: 1,
    height: 48,
    backgroundColor: 'rgba(34, 211, 238, 0.2)',
  },
  dosesLeftBadge: {
    alignItems: 'center',
    padding: 14,            // v2: padding: "14px" (all sides)
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 100,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  dosesLeftText: {
    fontSize: 13,
    color: '#9ca3af',
    fontWeight: '700',
  },
  dosesLeftNum: {
    color: 'white',
    fontWeight: '900',
  },

  // ── Dropdown option row (inside SearchDropdown renderOption) ──────
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    cursor: 'pointer',
  },
  dropdownOptionName: {
    color: 'white',
    fontWeight: '700',
    fontSize: 15,
  },
  dropdownOptionBadge: {
    fontSize: 10,
    color: '#fde68a',
    backgroundColor: 'rgba(113, 63, 18, 0.6)',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginLeft: 8,
    fontWeight: '900',
    overflow: 'hidden',
  },
});
