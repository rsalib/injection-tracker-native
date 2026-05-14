import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet } from 'react-native';
import { Badge } from '../ui/Badge.jsx';
import { CAT_META, POPULAR_MEDS } from '../../constants.js';
import { fetchAllResources } from '../../services/gemini.js';

export function ResourcesTab({ library, meds, onSaveToLibrary, onRemoveFromLibrary, onRefreshMed }) {
  const [query, setQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [liveResults, setLiveResults] = useState(null);
  const [liveSummary, setLiveSummary] = useState("");
  const [searchedMed, setSearchedMed] = useState("");
  const [expandedMeds, setExpandedMeds] = useState({});
  const [refreshing, setRefreshing] = useState({});
  const searchRef = useRef(null);

  useEffect(() => {
    const h = e => { if (searchRef.current && !searchRef.current.contains(e.target)) setDropdownOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const medOptions = query
    ? POPULAR_MEDS.filter(m => m.name.toLowerCase().includes(query.toLowerCase())).slice(0, 10)
    : POPULAR_MEDS.slice(0, 8);

  const doSearch = async (name) => {
    if (!name.trim()) return;
    setSearchedMed(name);
    setLiveResults(null);
    setLiveSummary("");
    setSearching(true);
    setDropdownOpen(false);
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

  const handleSelect = m => { setQuery(m.name); doSearch(m.name); };
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
        {/* Keep search input + dropdown as DOM for mousedown event handling */}
        <div ref={searchRef} style={{ position: "relative" }}>
          <div style={{ display: "flex", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "100px", padding: 6, gap: 8 }}>
            <div style={{ flex: 1, position: "relative" }}>
              <input
                style={{ width: "100%", background: "transparent", border: "none", color: "white", padding: "12px 16px", fontSize: 15, outline: "none", boxSizing: "border-box" }}
                placeholder="Peptide or medication..."
                value={query}
                onChange={e => { setQuery(e.target.value); setDropdownOpen(true); }}
                onFocus={() => setDropdownOpen(true)}
                onKeyDown={e => e.key === "Enter" && handleSearchSubmit()}
              />
              {dropdownOpen && query && (
                <div style={{ position: "absolute", zIndex: 50, width: "100%", background: "rgba(31,41,55,0.98)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "24px", marginTop: 12, padding: 8, maxHeight: 240, overflowY: "auto", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}>
                  {medOptions.length > 0 ? medOptions.map((m, i) => (
                    <div
                      key={i}
                      onMouseDown={() => handleSelect(m)}
                      style={{ padding: "14px 16px", cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", borderRadius: "16px" }}
                    >
                      <span style={{ color: "white", fontSize: 15, fontWeight: 700 }}>{m.name}</span>
                      <span style={{ fontSize: 11, color: "#22d3ee", fontWeight: 800, textTransform: "uppercase" }}>{m.type}</span>
                    </div>
                  )) : null}
                </div>
              )}
            </div>
            <button
              onClick={handleSearchSubmit}
              disabled={searching || !query.trim()}
              style={{ background: "linear-gradient(135deg, #0e7490 0%, #22d3ee 100%)", border: "none", borderRadius: "100px", padding: "0 24px", color: "white", fontSize: 14, fontWeight: 900, cursor: "pointer", opacity: searching || !query.trim() ? 0.5 : 1, whiteSpace: "nowrap", boxShadow: "0 4px 12px rgba(34,211,238,0.2)" }}
            >
              {searching ? "..." : "SEARCH"}
            </button>
          </div>
        </div>
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
              <Pressable onPress={saveAll} style={styles.saveAllBtn}>
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
                          <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 15, color: "white", textDecoration: "none", fontWeight: 800, display: "block", marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {r.title}
                          </a>
                          <Text style={styles.resultSource}>{r.source}</Text>
                        </View>
                        <Pressable
                          onPress={() => saveOne(r)}
                          disabled={saved}
                          style={[styles.saveBtn, saved && styles.saveBtnSaved]}
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
                              <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, color: "white", textDecoration: "none", fontWeight: 700, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {r.title}
                              </a>
                              <Pressable onPress={() => onRemoveFromLibrary(name, r.url)} style={styles.removeBtn}>
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
    backgroundColor: 'rgba(31, 41, 55, 0.4)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
  },
  searchTitle: {
    fontWeight: '800',
    fontSize: 18,
    color: 'white',
    letterSpacing: -0.36,
    marginBottom: 16,
  },
  searchingCard: {
    backgroundColor: 'rgba(31, 41, 55, 0.4)',
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  searchingText: {
    color: '#9ca3af',
    fontWeight: '600',
  },
  searchingMedName: {
    color: 'white',
    fontWeight: '700',
  },
  searchingSubtext: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 8,
  },
  resultsCard: {
    backgroundColor: 'rgba(31, 41, 55, 0.4)',
    backdropFilter: 'blur(16px)',
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.4)',
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
    color: 'white',
  },
  resultsMeta: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
    fontWeight: '600',
  },
  saveAllBtn: {
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 100,
    cursor: 'pointer',
  },
  saveAllText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#22d3ee',
  },
  summaryCard: {
    backgroundColor: 'rgba(17, 24, 39, 0.6)',
    padding: 20,
    borderRadius: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.2)',
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#22d3ee',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 14,
    color: 'white',
    lineHeight: 22,
    fontWeight: '500',
    whiteSpace: 'pre-wrap',
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noResultsText: {
    color: '#6b7280',
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
    backgroundColor: 'rgba(17, 24, 39, 0.6)',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.15)',
    borderLeftWidth: 4,
    borderLeftColor: '#22d3ee',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  },
  resultItemLeft: {
    flex: 1,
    minWidth: 0,
  },
  resultSource: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  saveBtn: {
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 100,
    cursor: 'pointer',
  },
  saveBtnSaved: {
    backgroundColor: 'rgba(20, 83, 45, 0.3)',
    cursor: 'default',
  },
  saveBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#22d3ee',
  },
  saveBtnTextSaved: {
    color: '#86efac',
  },
  libraryCard: {
    backgroundColor: 'rgba(31, 41, 55, 0.4)',
    backdropFilter: 'blur(16px)',
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.4)',
  },
  libraryTitle: {
    fontWeight: '800',
    fontSize: 18,
    color: 'white',
    marginBottom: 20,
  },
  libraryEmpty: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  libraryEmptyText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '600',
  },
  libraryEntry: {
  },
  libraryEntryBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
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
    color: 'white',
    letterSpacing: -0.32,
  },
  libraryEntryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  libraryItemCount: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 100,
  },
  libraryItemCountText: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '800',
  },
  chevron: {
    color: '#6b7280',
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
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 100,
    cursor: 'pointer',
  },
  refreshBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#9ca3af',
  },
  libraryNoItems: {
    color: '#6b7280',
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
    backgroundColor: 'rgba(17, 24, 39, 0.6)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  removeBtn: {
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 100,
    cursor: 'pointer',
  },
  removeBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#f87171',
  },
});
