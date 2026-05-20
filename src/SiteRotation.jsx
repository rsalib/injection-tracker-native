import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SITES } from './constants.js';
import { colors, glass, blur, siteActive } from './theme.js';

export function SiteRotation({ logs }) {
  const recent = [...logs].reverse().slice(0, 20);
  const counts = {};
  SITES.forEach(s => counts[s] = 0);
  recent.forEach(l => { if (counts[l.site] !== undefined) counts[l.site]++; });

  const lastSite = recent[0]?.site;
  const suggested = SITES.filter(s => s !== lastSite).sort((a, b) => counts[a] - counts[b])[0];

  return (
    <View className="glass-card" style={[styles.card, { backdropFilter: blur.dialog, WebkitBackdropFilter: blur.dialog }]}>
      <Text style={styles.heading}>💉 Site Rotation</Text>
      {lastSite ? (
        <View style={styles.body}>
          <View style={styles.tileRow}>
            <View style={styles.tileLeft}>
              <Text style={styles.tileLabel}>Last Site</Text>
              <Text style={styles.tileValueAmber}>{lastSite}</Text>
            </View>
            <View style={styles.tileRight}>
              <Text style={styles.tileLabelCyan}>Suggested</Text>
              <Text style={styles.tileValueGreen}>{suggested || "Any"}</Text>
            </View>
          </View>
          <View style={styles.siteGrid}>
            {SITES.map(s => {
              const isLast = s === lastSite;
              return (
                <View
                  key={s}
                  style={[
                    styles.siteCell,
                    isLast ? styles.siteCellActive : styles.siteCellInactive,
                  ]}
                >
                  <Text style={[styles.siteName, isLast ? styles.siteNameActive : styles.siteNameInactive]}>
                    {s.split(" ")[0]}
                  </Text>
                  <Text style={[styles.siteCount, isLast ? styles.siteNameActive : styles.siteNameInactive]}>
                    {counts[s]}x
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      ) : (
        <Text style={styles.emptyText}>Log injections to view rotation stats.</Text>
      )}
    </View>
  );
}

export default SiteRotation;

const styles = StyleSheet.create({
  card: {
    ...glass.card,
    borderRadius: 32,
    padding: 24,
  },
  heading: {
    fontWeight: '800',
    fontSize: 16,
    color: colors.white,
    textTransform: 'uppercase',
    letterSpacing: 1.6,
    marginBottom: 16,
  },
  body: {
    flexDirection: 'column',
    gap: 16,
  },
  tileRow: {
    flexDirection: 'row',
    gap: 12,
  },
  tileLeft: {
    flex: 1,
    backgroundColor: colors.surfaceDeep,
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderFaint,
  },
  tileRight: {
    flex: 1,
    backgroundColor: colors.blueFaint,
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.blueDim,
  },
  tileLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  tileLabelCyan: {
    fontSize: 10,
    color: colors.blue,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  tileValueAmber: {
    fontWeight: '800',
    color: colors.textAmber,
    fontSize: 14,
  },
  tileValueGreen: {
    fontWeight: '800',
    color: colors.textGreen,
    fontSize: 14,
  },
  siteGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  siteCell: {
    width: '33.33%',
    fontSize: 10,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 12,
    alignItems: 'center',
  },
  siteCellActive: {
    backgroundColor: siteActive.bg,
    borderWidth: 1,
    borderColor: siteActive.border,
  },
  siteCellInactive: {
    backgroundColor: colors.borderFaint,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  siteName: {
    fontWeight: '700',
    fontSize: 10,
  },
  siteNameActive: {
    color: colors.textAmber,
  },
  siteNameInactive: {
    color: colors.textSecondary,
  },
  siteCount: {
    fontSize: 10,
    opacity: 0.6,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
});
