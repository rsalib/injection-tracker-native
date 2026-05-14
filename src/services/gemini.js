import { auth } from './firebase.js';
import { cacheGet, cacheSet } from './firebase.js';
import { appCheck } from './firebase.js';
import { getToken as getAppCheckToken } from 'firebase/app-check';

const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

export function cacheKey(name) {
  return name.replace(/[.#$/[\]]/g, "_");
}

export function isFresh(cachedAt) {
  return cachedAt && (Date.now() - cachedAt) < CACHE_TTL;
}

export const APPROVED_DOMAINS = [
  "go.drugbank.com", "rxlist.com", "medscape.com", "healthline.com",
  "nejm.org", "jamanetwork.com", "europepmc.org", "hormone.org",
  "cdc.gov", "aace.com", "cochrane.org", "clinicaltrials.gov",
  "merckmanuals.com", "dailymed.nlm.nih.gov", "endocrine.org",
  "medlineplus.gov", "mayoclinic.org", "accessdata.fda.gov",
  "drugs.com", "fda.gov", "ncbi.nlm.nih.gov", "pubmed.ncbi.nlm.nih.gov",
  "examine.com"
];
export const DOMAIN_QUERY = APPROVED_DOMAINS.map(d => `site:${d}`).join(" OR ");

// --- SECURE CLOUD BRIDGE ---
const FUNCTION_URL = "https://askgemini-pl4s2cxu2a-uc.a.run.app";

// Helper function to grab the fresh Auth Token
async function getAuthToken() {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated.");
  return await user.getIdToken();
}

async function getACToken() {
  try {
    const { token } = await getAppCheckToken(appCheck, false);
    return token;
  } catch { return ''; }
}

export async function callGemini(prompt, systemPrompt = "") {
  const [token, acToken] = await Promise.all([getAuthToken(), getACToken()]);
  const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;

  const r = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "X-Firebase-AppCheck": acToken,
    },
    body: JSON.stringify({ prompt: fullPrompt })
  });
  const d = await r.json();
  if (d.error) throw new Error(d.error);
  return d.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
}

export async function callGeminiChat(messages, systemPrompt = "", useNativeSearch = false) {
  const [token, acToken] = await Promise.all([getAuthToken(), getACToken()]);
  const contents = messages.map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }]
  }));

  if (systemPrompt && contents.length > 0) {
    contents[0].parts[0].text = `${systemPrompt}\n\n${contents[0].parts[0].text}`;
  }

  const payload = { contents };
  if (useNativeSearch) {
    payload.tools = [{ googleSearch: {} }];
    const lastUserIdx = contents.map(c => c.role).lastIndexOf("user");
    if (lastUserIdx !== -1) {
      contents[lastUserIdx].parts[0].text += "\n\nCRITICAL: Use Google Search for clinical data.";
    }
  }

  const r = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "X-Firebase-AppCheck": acToken,
    },
    body: JSON.stringify(payload)
  });
  const d = await r.json();
  if (d.error) throw new Error(d.error);

  const candidate = d.candidates?.[0];
  let text = candidate?.content?.parts?.[0]?.text || "No response.";
  const groundingMetadata = candidate?.groundingMetadata;
  return { text, groundingMetadata };
}

// ── Resource fetching ─────────────────────────────────────────────
async function fetchPubMed(query) {
  try {
    const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=5&retmode=json`;
    const sr = await fetch(searchUrl);
    const sd = await sr.json();
    const ids = sd.esearchresult?.idlist || [];
    if (!ids.length) return [];

    const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(",")}&retmode=json`;
    const smr = await fetch(summaryUrl);
    const smd = await smr.json();

    return ids.map(id => {
      const art = smd.result?.[id];
      if (!art) return null;
      return {
        title: art.title || `PubMed Article ${id}`,
        url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
        source: "PubMed",
        category: "Research"
      };
    }).filter(Boolean);
  } catch (e) {
    console.error("PubMed fetch failed:", e);
    return [];
  }
}

async function fetchFDA(query) {
  try {
    const r = await fetch(`https://api.fda.gov/drug/label.json?search=${encodeURIComponent(query)}&limit=3`);
    if (!r.ok) return [];
    const d = await r.json();
    if (!d.results) return [];

    return d.results.slice(0, 3).map(item => {
      const name = item.openfda?.brand_name?.[0] || item.openfda?.generic_name?.[0] || query;
      const appNum = item.openfda?.application_number?.[0] || "";
      return {
        title: `FDA Label: ${name}`,
        url: appNum ? `https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=${appNum.replace(/[^0-9]/g,"")}` : `https://www.accessdata.fda.gov/scripts/cder/daf/`,
        source: "FDA",
        category: "Safety"
      };
    });
  } catch (e) {
    console.error("FDA fetch failed:", e);
    return [];
  }
}

async function fetchGroundedResources(query) {
  try {
    const promptMsg = [{ role: "user", content: `Find clinical research, safety data, and guidelines for: ${query}` }];
    const res = await callGeminiChat(promptMsg, "You are a clinical assistant. Use your Google Search tool.", true);

    const summary = res.text || "";
    let items = [];

    if (res.groundingMetadata && res.groundingMetadata.groundingChunks) {
      items = res.groundingMetadata.groundingChunks.map(chunk => {
        const web = chunk.web;
        if (!web || !web.uri) return null;
        const url = web.uri;
        let category = "Guide";
        if (url.includes("endocrine.org") || url.includes("mayoclinic.org")) category = "Guidelines";
        else if (url.includes("drugs.com") || url.includes("medlineplus.gov") || url.includes("fda.gov") || url.includes("drugbank.com")) category = "Safety";
        else if (url.includes("examine.com") || url.includes("rxlist.com")) category = "Guide";
        else if (url.includes("pubmed") || url.includes("nih.gov") || url.includes("nejm.org")) category = "Research";

        return {
          title: web.title || "Web Resource",
          snippet: "Sourced via Google Grounding",
          url,
          source: new URL(url).hostname.replace("www.", ""),
          category
        };
      }).filter(Boolean);
    }
    return { summary, items };
  } catch (e) {
    console.error("Grounded Resource fetch failed:", e);
    return { summary: "", items: [] };
  }
}

export async function fetchAllResources(medName) {
  const key = cacheKey(medName);
  const cached = await cacheGet(`resources/${key}`);

  // Support legacy cache data structures (fallback to empty arrays/strings)
  if (cached && isFresh(cached.cachedAt)) {
    const items = Array.isArray(cached.items) ? cached.items : (Array.isArray(cached) ? cached : []);
    const summary = cached.summary || "";
    return { items, summary };
  }

  const [pubmed, fda, grounded] = await Promise.all([
    fetchPubMed(medName),
    fetchFDA(medName),
    fetchGroundedResources(medName)
  ]);

  const allItems = [...pubmed, ...fda, ...(grounded.items || [])];
  const summary = grounded.summary || "";

  await cacheSet(`resources/${key}`, { items: allItems, summary });
  return { items: allItems, summary };
}

export async function fetchInteractionsWithCache(meds, force = false) {
  // 🛡️ ARMORED: Ignore archived meds, preserve disambiguators (e.g. "CJC-1295 (no DAC)")
  const active = (meds || []).filter(m => !m.isArchived);
  const ingredients = [];

  active.forEach(m => {
    if (m.isStack && m.subPeptides) {
      m.subPeptides.forEach(sp => {
        const clean = (sp.name || "").replace(/[-]/g, ' ').trim();
        if (clean && !ingredients.includes(clean)) ingredients.push(clean);
      });
    } else {
      const clean = (m.name || "").replace(/[-]/g, ' ').trim();
      if (clean && !ingredients.includes(clean)) ingredients.push(clean);
    }
  });

  if (ingredients.length < 2) return { items: [], error: null };

  const names = [...ingredients].sort();
  const key = cacheKey(names.join("_"));

  if (!force) {
    const cached = await cacheGet(`interactions/${key}`);
    if (cached && isFresh(cached.cachedAt)) return { items: cached.items || [], error: null };
  }

  const prompt = `Analyze drug interactions for these medications: ${ingredients.join(", ")}.
            Return ONLY a JSON array of pairs with "mild", "moderate", or "high" interactions.
            If a pair has no known clinical interaction, do not include it.
            Format: [{"pair":"Med A + Med B","severity":"mild|moderate|high","description":"short","recommendation":"short"}]`;

  try {
    const res = await callGemini(prompt, "You are a clinical pharmacology assistant. Return only valid JSON.");
    const clean = res.replace(/```json|```|`/g, "").trim();
    const parsed = JSON.parse(clean);
    if (!Array.isArray(parsed)) throw new Error("Invalid Format");

    await cacheSet(`interactions/${key}`, { items: parsed });
    return { items: parsed, error: null };
  } catch (e) {
    return { items: [], error: "Analysis unavailable. Tap Re-check to retry." };
  }
}

// 🛡️ GLOBAL INTERACTION ENGINE: Single source of truth for drug-pair matching
export const InteractionEngine = {
  norm: (str) => (typeof str === 'string' ? str : '').toLowerCase().replace(/[^a-z0-9]/g, ''),
  normVariants: (rawName) => {
    const full = InteractionEngine.norm(rawName);
    const base = InteractionEngine.norm((rawName || "").split('(')[0]);
    return [...new Set([full, base].filter(Boolean))];
  },
  getNormNames: (med) => {
    if (med.isStack && Array.isArray(med.subPeptides)) {
      return [...new Set(med.subPeptides.flatMap(sp => InteractionEngine.normVariants(sp.name || "")))];
    }
    return InteractionEngine.normVariants(med.name || "");
  },
  pairMatches: (pairStr, namesA, namesB) => {
    const halves = (pairStr || "").split(/\s*\+\s*/).flatMap(h => InteractionEngine.normVariants(h));
    if (halves.length < 2) return false;
    const aHit = namesA.some(n => halves.includes(n));
    const bHit = namesB.some(n => halves.includes(n));
    return aHit && bHit;
  }
};
