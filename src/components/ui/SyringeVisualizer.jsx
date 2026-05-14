import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function SyringeVisualizer({ units, maxUnits, ml }) {
  const safeUnits = Number(units) || 0;
  const safeMaxUnits = Math.min(Math.max(Number(maxUnits) || 100, 1), 500);
  const safeMl = Number(ml) || 0;
  const targetPct = Math.min(100, Math.max(0, (safeUnits / safeMaxUnits) * 100));
  const isOverdrawn = safeUnits > safeMaxUnits;
  const [displayPct, setDisplayPct] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setDisplayPct(targetPct), 50);
    return () => clearTimeout(timer);
  }, [targetPct]);

  const ticks = [];
  for (let i = 0; i <= safeMaxUnits; i += 2) {
    const isMajor = i % 10 === 0;
    ticks.push(
      <View key={i} style={[styles.tickContainer, { left: `${(i / safeMaxUnits) * 100}%` }]}>
        <View style={isMajor ? styles.tickMajor : styles.tickMinor} />
        {isMajor && <Text style={styles.tickLabel}>{i}</Text>}
      </View>
    );
  }

  const fluidGradient = isOverdrawn
    ? 'linear-gradient(90deg, #7f1d1d 0%, #ef4444 100%)'
    : 'linear-gradient(90deg, #083344 0%, #22d3ee 100%)';
  const textColor = isOverdrawn ? '#ef4444' : '#22d3ee';
  const glowColor = isOverdrawn ? 'rgba(239, 68, 68, 0.8)' : 'rgba(34, 211, 238, 0.8)';
  const borderColor = isOverdrawn ? '#991b1b' : '#374151';

  return (
    <View style={[styles.container, { borderColor }]}>
      <View style={styles.header}>
        <Text style={[styles.unitsValue, { color: textColor }]}>
          {safeUnits.toFixed(1)}{' '}<Text style={styles.unitsUnit}>units</Text>
        </Text>
        <Text style={styles.mlText}>≈ {safeMl.toFixed(3)} mL</Text>
        {isOverdrawn && (
          <Text style={styles.overdrawWarn}>⚠️ Exceeds Syringe Capacity</Text>
        )}
      </View>

      <View style={styles.barArea}>
        <View style={styles.barTrack}>
          <View style={[
            styles.fluidFill,
            {
              width: `${displayPct}%`,
              backgroundImage: fluidGradient,
              borderTopLeftRadius: 5,
              borderBottomLeftRadius: 5,
              borderTopRightRadius: displayPct >= 100 ? 5 : 0,
              borderBottomRightRadius: displayPct >= 100 ? 5 : 0,
            }
          ]} />
          {displayPct > 0 && (
            <View style={[
              styles.indicator,
              { left: `${displayPct}%`, boxShadow: `0 0 6px ${glowColor}` }
            ]} />
          )}
        </View>
        <View style={styles.ticksRow}>
          {ticks}
        </View>
      </View>
    </View>
  );
}

export default SyringeVisualizer;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1f2937',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    transition: 'border-color 0.3s',
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  unitsValue: {
    fontSize: 36,
    fontWeight: '700',
    lineHeight: 36,
    letterSpacing: -0.72,
  },
  unitsUnit: {
    fontSize: 16,
    fontWeight: '500',
    color: '#9ca3af',
  },
  mlText: {
    color: '#6b7280',
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500',
  },
  overdrawWarn: {
    color: '#fca5a5',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    backgroundColor: '#450a0a',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  barArea: {
    marginHorizontal: 12,
  },
  barTrack: {
    position: 'relative',
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#4b5563',
    height: 32,
    borderRadius: 6,
    boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.5)',
  },
  fluidFill: {
    height: '100%',
    transition: 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  indicator: {
    position: 'absolute',
    top: -2,
    bottom: -2,
    width: 4,
    backgroundColor: '#e5e7eb',
    transform: [{ translateX: -2 }],
    borderRadius: 2,
    transition: 'left 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  ticksRow: {
    position: 'relative',
    height: 28,
    marginTop: 4,
  },
  // Tick container centered on the tick mark via negative margin
  tickContainer: {
    position: 'absolute',
    width: 30,
    marginLeft: -15,
    alignItems: 'center',
  },
  tickMajor: {
    width: 1,
    height: 12,
    backgroundColor: '#9ca3af',
  },
  tickMinor: {
    width: 1,
    height: 6,
    backgroundColor: '#4b5563',
  },
  tickLabel: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 4,
    fontWeight: '500',
    textAlign: 'center',
  },
});
