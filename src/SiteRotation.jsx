import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SITES } from './constants.js';

export function SiteRotation({ logs }) {
  const recent = [...logs].reverse().slice(0, 20);
  const counts = {};
  SITES.forEach(s => counts[s] = 0);
  recent.forEach(l => { if (counts[l.site] !== undefined) counts[l.site]++; });

  const lastSite = recent[0]?.site;
  const suggested = SITES.filter(s => s !== lastSite).sort((a, b) => counts[a] - counts[b])[0];

  return (
    <View style={styles.card}>
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
    backgroundColor: 'rgba(31, 41, 55, 0.4)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
  },
  heading: {
    fontWeight: '800',
    fontSize: 16,
    color: 'white',
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
    backgroundColor: 'rgba(17, 24, 39, 0.3)',
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.03)',
  },
  tileRight: {
    flex: 1,
    backgroundColor: 'rgba(34, 211, 238, 0.05)',
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.1)',
  },
  tileLabel: {
    fontSize: 10,
    color: '#9ca3af',
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  tileLabelCyan: {
    fontSize: 10,
    color: '#22d3ee',
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  tileValueAmber: {
    fontWeight: '800',
    color: '#fde68a',
    fontSize: 14,
  },
  tileValueGreen: {
    fontWeight: '800',
    color: '#86efac',
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
    backgroundColor: 'rgba(113, 63, 18, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(146, 64, 14, 0.4)',
  },
  siteCellInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  siteName: {
    fontWeight: '700',
    fontSize: 10,
  },
  siteNameActive: {
    color: '#fde68a',
  },
  siteNameInactive: {
    color: '#9ca3af',
  },
  siteCount: {
    fontSize: 10,
    opacity: 0.6,
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
});
