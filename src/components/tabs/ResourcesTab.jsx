import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Pressable } from '../ui/Pressable.jsx';
import { Badge } from '../ui/Badge.jsx';
import { SearchDropdown } from '../ui/SearchDropdown.jsx';
import { CAT_META, POPULAR_MEDS } from '../../constants.js';
import { fetchAllResources } from '../../services/gemini.js';
import { colors, glass, type } from '../../theme.js';

export function ResourcesTab({ library, meds, onSaveToLibrary, onRemoveFromLibrary, onRefreshMed }) {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [liveResults, setLiveResults] = useState(null);
  const [liveSummary, setLiveSummary] = useState("");
  const [searchedMed, setSearchedMed] = useState("");
  const [expandedMeds, setExpandedMeds] = useState({});
  const [refreshing, setRefreshing] = useState({});

  const medOptions = query
    ? POPULAR_MEDS.filter(m => m.name.toLowerCase().includes(query.toLowerCase())).slice(0, 10)
    : POPULAR_MEDS.slice(0, 8);

  const doSearch = async (name) => {
    if (!name.trim()) return;
    setSearchedMed(name);
    setLiveResults(null);
    setLiveSummary("");
    setSearching(true);
    try {
      const result = await fetchAllResources(name);
      setLiveResults(result.items || []);
      setLiveSummary(result.summary || "");
    } catch (e) {
      setLiveResults([]);
      setLiveSummary("");
    }
    setSearching(false);
  };

  const handleSearchSubmit = () => doSearch(query);
  const saveOne = async (item) => onSaveToLibrary(searchedMed, item);
  const saveAll = async () => { if (liveResults?.length) await onSaveToLibrary(searchedMed, liveResults); };
  const toggleExpand = name => setExpandedMeds(p => ({ ...p, [name]: !p[name] }));

  const refreshMed = async (medName) => {
    setRefreshing(p => ({ ...p, [medName]: true }));
    await onRefreshMed(medName, library);
    setRefreshing(p => ({ ...p, [medName]: false }));
  };

  const trackedNames = meds.map(m => m.name);
  const allLibraryNames = [...new Set([...trackedNames, ...Object.keys(library)])].sort();

  const grouped = cat => liveResults?.filter(r => r.category === cat) || [];
  const cats = ["Research", "Safety", "Guidelines", "Guide"];
  const hasResults = liveResults && liveResults.length > 0;
  const isInLibrary = (medName, url) => (library[medName] || []).some(r => r.url === url);

  return (
    <View style={styles.container}>

      {/* Search Area */}
      <View style={styles.searchCard}>
        <Text style={styles.searchTitle}>🔍 Search Resources</Text>
        <View style={styles.searchRow}>
          <View style={{ flex: 1 }}>
            <SearchDropdown
              value={query}
              onChange={setQuery}
              placeholder="Search medication..."
              options={medOptions}
              renderOption={m => (
                <>
                  <span>{m.name}</span>
                  <span style={{ fontSize: 11, color: colors.bgMid2, marginLeft: 8, fontWeight: 600 }}>{m.type}</span>
                </>
              )}
              onSelect={m => { setQuery(m.name); doSearch(m.name); }}
              onSubmit={handleSearchSubmit}
            />
          </View>
          <Pressable
            onPress={handleSearchSubmit}
            disabled={searching || !query.trim()}
            style={[styles.searchBtn, (searching || !query.trim()) && styles.searchBtnDisabled]}
          >
            <Text style={styles.searchBtnText}>{searching ? "..." : "SEARCH"}</Text>
          </Pressable>
        </View>
      </View>

      {/* Searching indicator */}
      {searching && (
        <View style={styles.searchingCard}>
          <Text style={styles.searchingText}>
            Fetching clinical data for{' '}
            <Text style={styles.searchingMedName}>{searchedMed}</Text>
            ...
          </Text>
          <Text style={styles.searchingSubtext}>Searching PubMed, FDA, and Guidelines</Text>
        </View>
      )}

      {/* Live Results */}
      {liveResults !== null && !searching && (
        <View style={styles.resultsCard}>
          <View style={styles.resultsHeader}>
            <View>
              <Text style={styles.resultsTitle}>📡 Live Results</Text>
              <Text style={styles.resultsMeta}>{searchedMed} · {liveResults.length} sources found</Text>
            </View>
            {hasResults && (
              <Pressable onPress={saveAll} style={[styles.saveAllBtn, { alignItems: 'center' }]}>
                <Text style={styles.saveAllText}>SAVE ALL</Text>
              </Pressable>
            )}
          </View>

          {liveSummary && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>✨ Clinical AI Summary</Text>
              <Text style={styles.summaryText}>{liveSummary}</Text>
            </View>
          )}

          {!hasResults && (
            <View style={styles.noResults}>
              <Text style={styles.noResultsText}>No results found for "{searchedMed}".</Text>
            </View>
          )}

          {hasResults && cats.map(cat => {
            const items = grouped(cat);
            if (!items.length) return null;
            const mStyle = CAT_META[cat] || CAT_META.Guide;
            return (
              <View key={cat} style={styles.catSection}>
                <View style={styles.catBadgeWrap}>
                  <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: "100px", fontWeight: 800, backgroundColor: mStyle.bg, color: mStyle.text, border: `1px solid ${mStyle.border}`, letterSpacing: "0.05em" }}>
                    {mStyle.icon} {cat.toUpperCase()}
                  </span>
                </View>
                <View style={styles.catItems}>
                  {items.map((r, i) => {
                    const saved = isInLibrary(searchedMed, r.url);
                    return (
                      <View key={i} style={styles.resultItem}>
                        <View style={styles.resultItemLeft}>
                          <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 15, color: colors.white, textDecoration: "none", fontWeight: 800, display: "block", marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {r.title}
                          </a>
                          <Text style={styles.resultSource}>{r.source}</Text>
                        </View>
                        <Pressable
                          onPress={() => saveOne(r)}
                          disabled={saved}
                          style={[styles.saveBtn, saved && styles.saveBtnSaved, { alignItems: 'center' }]}
                        >
                          <Text style={[styles.saveBtnText, saved && styles.saveBtnTextSaved]}>
                            {saved ? "SAVED" : "SAVE"}
                          </Text>
                        </Pressable>
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* My Library */}
      <View style={styles.libraryCard}>
        <Text style={styles.libraryTitle}>📚 My Library</Text>
        {allLibraryNames.length === 0 && (
          <View style={styles.libraryEmpty}>
            <Text style={styles.libraryEmptyText}>No resources saved yet.</Text>
          </View>
        )}
        {allLibraryNames.map((name, index) => {
          const items = library[name] || [];
          const expanded = expandedMeds[name];
          const isTracked = trackedNames.includes(name);
          const catGroups = cats.reduce((acc, c) => { acc[c] = items.filter(r => r.category === c); return acc; }, {});
          const isLast = index === allLibraryNames.length - 1;

          return (
            <View
              key={name}
              style={[
                styles.libraryEntry,
                !isLast && styles.libraryEntryBorder,
                { paddingBottom: expanded || isLast ? 16 : 0, marginBottom: expanded && !isLast ? 16 : 0 },
              ]}
            >
              <Pressable
                onPress={() => toggleExpand(name)}
                style={styles.libraryEntryToggle}
              >
                <View style={styles.libraryEntryLeft}>
                  <Text style={styles.libraryEntryName}>{name}</Text>
                  {isTracked && <Badge label="TRACKED" color="blue" />}
                </View>
                <View style={styles.libraryEntryRight}>
                  <View style={styles.libraryItemCount}>
                    <Text style={styles.libraryItemCountText}>{items.length} items</Text>
                  </View>
                  <Text style={styles.chevron}>{expanded ? "▲" : "▼"}</Text>
                </View>
              </Pressable>

              {expanded && (
                <View style={styles.libraryExpanded}>
                  <View style={styles.refreshRow}>
                    <Pressable
                      onPress={() => refreshMed(name)}
                      disabled={refreshing[name]}
                      style={styles.refreshBtn}
                    >
                      <Text style={styles.refreshBtnText}>
                        {refreshing[name] ? "REFRESHING..." : "🔄 REFRESH"}
                      </Text>
                    </Pressable>
                  </View>
                  {items.length === 0 && (
                    <Text style={styles.libraryNoItems}>No resources found.</Text>
                  )}
                  {cats.map(cat => {
                    const catItems = catGroups[cat];
                    if (!catItems.length) return null;
                    const mStyle = CAT_META[cat] || CAT_META.Guide;
                    return (
                      <View key={cat} style={styles.libCatSection}>
                        <View style={styles.catBadgeWrap}>
                          <span style={{ fontSize: 10, padding: "4px 8px", borderRadius: "100px", fontWeight: 800, backgroundColor: mStyle.bg, color: mStyle.text, border: `1px solid ${mStyle.border}`, textTransform: "uppercase" }}>
                            {mStyle.icon} {cat}
                          </span>
                        </View>
                        <View style={styles.catItems}>
                          {catItems.map((r, i) => (
                            <View key={i} style={styles.libResultItem}>
                              <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, color: colors.white, textDecoration: "none", fontWeight: 700, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {r.title}
                              </a>
                              <Pressable onPress={() => onRemoveFromLibrary(name, r.url)} style={[styles.removeBtn, { alignItems: 'center' }]}>
                                <Text style={styles.removeBtnText}>REMOVE</Text>
                              </Pressable>
                            </View>
                          ))}
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default ResourcesTab;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    gap: 20,
  },
  searchCard: {
    ...glass.cardEmphasis,
    borderRadius: 32,
    padding: 24,
  },
  searchTitle: {
    ...type.cardTitle,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  searchBtn: {
    backgroundColor: colors.primary, // TODO: expo-linear-gradient(135deg, #0e7490 0%, #0a84ff 100%)
    borderRadius: 100,
    paddingVertical: 14,
    paddingHorizontal: 24,
    cursor: 'pointer',
    boxShadow: `0 4px 12px ${colors.blueMid}`,
  },
  searchBtnDisabled: {
    opacity: 0.5,
  },
  searchBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '900',
  },
  searchingCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchingText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  searchingMedName: {
    color: colors.white,
    fontWeight: '700',
  },
  searchingSubtext: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 8,
  },
  resultsCard: {
    ...glass.card,
    borderRadius: 32,
    padding: 24,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  resultsTitle: {
    fontWeight: '800',
    fontSize: 18,
    color: colors.white,
  },
  resultsMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    fontWeight: '600',
  },
  saveAllBtn: {
    backgroundColor: colors.blueDim,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 100,
    cursor: 'pointer',
  },
  saveAllText: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.blue,
  },
  summaryCard: {
    backgroundColor: colors.surfaceMid,
    padding: 20,
    borderRadius: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.blueMid,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.blue,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 14,
    color: colors.white,
    lineHeight: 22,
    fontWeight: '500',
    whiteSpace: 'pre-wrap',
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noResultsText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  catSection: {
    marginBottom: 24,
  },
  catBadgeWrap: {
    marginBottom: 12,
  },
  catItems: {
    flexDirection: 'column',
    gap: 12,
  },
  resultItem: {
    backgroundColor: colors.surfaceMid,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: colors.blueSoft,
    borderRightColor: colors.blueSoft,
    borderBottomColor: colors.blueSoft,
    borderLeftWidth: 4,
    borderLeftColor: colors.blue,
    boxShadow: `0 4px 12px ${colors.shadowSoft}`,
  },
  resultItemLeft: {
    flex: 1,
    minWidth: 0,
  },
  resultSource: {
    ...type.formLabel,
  },
  saveBtn: {
    backgroundColor: colors.blueDim,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 100,
    cursor: 'pointer',
  },
  saveBtnSaved: {
    backgroundColor: colors.successDarkSoft,
    cursor: 'default',
  },
  saveBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.blue,
  },
  saveBtnTextSaved: {
    color: colors.textGreen,
  },
  libraryCard: {
    ...glass.card,
    borderRadius: 32,
    padding: 24,
  },
  libraryTitle: {
    ...type.cardTitle,
    marginBottom: 20,
  },
  libraryEmpty: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  libraryEmptyText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  libraryEntry: {
  },
  libraryEntryBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  libraryEntryToggle: {
    cursor: 'pointer',
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  libraryEntryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  libraryEntryName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: -0.32,
  },
  libraryEntryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  libraryItemCount: {
    backgroundColor: colors.shadowSoft,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 100,
  },
  libraryItemCountText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '800',
  },
  chevron: {
    color: colors.textMuted,
    fontSize: 12,
  },
  libraryExpanded: {
    paddingBottom: 16,
  },
  refreshRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  refreshBtn: {
    backgroundColor: colors.surface,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 100,
    cursor: 'pointer',
  },
  refreshBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.textSecondary,
  },
  libraryNoItems: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 12,
    fontWeight: '600',
  },
  libCatSection: {
    marginBottom: 20,
  },
  libResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: 16,
    backgroundColor: colors.surfaceMid,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  removeBtn: {
    backgroundColor: colors.errorSoft,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 100,
    cursor: 'pointer',
  },
  removeBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.error,
  },
});
