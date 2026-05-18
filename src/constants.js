import { colors } from './theme.js';

export const SITES = ["Abdomen", "Thigh (Left)", "Thigh (Right)", "Glute (Left)", "Glute (Right)", "Deltoid (Left)", "Deltoid (Right)", "Ventroglute (Left)", "Ventroglute (Right)"];
export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export const CAT_META = {
  Research: { icon: "🔬", color: "blue", bg: colors.blueDarkBg, border: colors.blueDarkBorder, text: colors.blueLight },
  Safety: { icon: "🛡️", color: "red", bg: colors.errorDarkBg, border: colors.errorDarkBorderAlt, text: colors.errorLight },
  Guidelines: { icon: "📋", color: "purple", bg: colors.purpleDarkBg, border: colors.purpleDarkBorder, text: colors.purpleLight },
  Guide: { icon: "📖", color: "green", bg: colors.successDarkest, border: colors.successDarkBg, text: colors.textGreen }
};

export const NAV_TABS = [
  { id: "Dashboard",    label: "Home",      iconKey: "Dashboard"    },
  { id: "Log Injection",label: "Log",       iconKey: "LogInjection" },
  { id: "Medications",  label: "Meds",      iconKey: "Medications"  },
  { id: "Calculator",   label: "Calc",      iconKey: "Calculator"   },
  { id: "Resources",    label: "Resources", iconKey: "Resources"    },
  { id: "AI Assistant", label: "AI",        iconKey: "AIAssistant"  },
];

export const EMPTY_MED = {
  name: "", type: "Peptide", dose: "", unit: "mcg", frequency: "Daily",
  scheduleDays: [...DAYS], injectionTime: "08:00", site: "Abdomen",
  vialTotal: "", vialUnit: "mg", vialRemaining: "", bwAdded: "", notes: "",
  startDate: "", syringeMl: "1", syringeUnits: "100", isTitrating: false, titrationSchedule: [],
  isArchived: false, nextVial: null
};

export const POPULAR_MEDS = [
  {name:"BPC-157",type:"Peptide",unit:"mcg",dose:250},{name:"TB-500 (Thymosin Beta-4)",type:"Peptide",unit:"mcg",dose:500},
  {name:"CJC-1295 (no DAC)",type:"Peptide",unit:"mcg",dose:100},{name:"CJC-1295 (with DAC)",type:"Peptide",unit:"mcg",dose:1000},
  {name:"Ipamorelin",type:"Peptide",unit:"mcg",dose:200},{name:"GHRP-2",type:"Peptide",unit:"mcg",dose:100},
  {name:"GHRP-6",type:"Peptide",unit:"mcg",dose:100},{name:"Sermorelin",type:"Peptide",unit:"mcg",dose:200},
  {name:"Tesamorelin",type:"Peptide",unit:"mcg",dose:1000},{name:"AOD-9604",type:"Peptide",unit:"mcg",dose:300},
  {name:"GHK-Cu (Copper Peptide)",type:"Peptide",unit:"mg",dose:1},{name:"Epithalon",type:"Peptide",unit:"mg",dose:5},
  {name:"Selank",type:"Peptide",unit:"mcg",dose:250},{name:"Semax",type:"Peptide",unit:"mcg",dose:200},
  {name:"PT-141 (Bremelanotide)",type:"Peptide",unit:"mg",dose:1},{name:"KPV",type:"Peptide",unit:"mcg",dose:500},
  {name:"Thymosin Alpha-1",type:"Peptide",unit:"mg",dose:1.5},{name:"NAD+ (Injectable)",type:"Peptide",unit:"mg",dose:100},
  {name:"IGF-1 LR3",type:"Peptide",unit:"mcg",dose:50},{name:"Follistatin 344",type:"Peptide",unit:"mcg",dose:100},
  {name:"Semaglutide",type:"Peptide",unit:"mg",dose:0.25},{name:"Tirzepatide",type:"Peptide",unit:"mg",dose:2.5},
  {name:"Retatrutide",type:"Peptide",unit:"mg",dose:2},{name:"Liraglutide",type:"Peptide",unit:"mg",dose:0.6},
  {name:"Testosterone Cypionate",type:"Hormone",unit:"mg",dose:100},{name:"Testosterone Enanthate",type:"Hormone",unit:"mg",dose:100},
  {name:"Testosterone Propionate",type:"Hormone",unit:"mg",dose:50},{name:"Testosterone Undecanoate",type:"Hormone",unit:"mg",dose:250},
  {name:"HCG (Human Chorionic Gonadotropin)",type:"Hormone",unit:"IU",dose:500},{name:"HGH (Human Growth Hormone)",type:"Hormone",unit:"IU",dose:2},
  {name:"Gonadorelin",type:"Hormone",unit:"mcg",dose:100},{name:"Estradiol Cypionate",type:"Hormone",unit:"mg",dose:2},
  {name:"Progesterone (Injectable)",type:"Hormone",unit:"mg",dose:50},{name:"Nandrolone Decanoate (Deca)",type:"Hormone",unit:"mg",dose:200},
  {name:"Trenbolone Acetate",type:"Hormone",unit:"mg",dose:50},{name:"Masteron (Drostanolone)",type:"Hormone",unit:"mg",dose:100},
  {name:"Primobolan (Methenolone Enanthate)",type:"Hormone",unit:"mg",dose:100},
  {name:"Vitamin B12 (Methylcobalamin)",type:"Other",unit:"mcg",dose:1000},{name:"Glutathione (Injectable)",type:"Other",unit:"mg",dose:600},
  {name:"Methylene Blue (Injectable)",type:"Other",unit:"mg",dose:10},{name:"Oxytocin",type:"Peptide",unit:"IU",dose:10},
  {name:"MOTS-c",type:"Peptide",unit:"mg",dose:5},{name:"SS-31 (Elamipretide)",type:"Peptide",unit:"mg",dose:4},
  {name:"Melanotan II",type:"Peptide",unit:"mg",dose:0.5},{name:"LL-37",type:"Peptide",unit:"mg",dose:1},
  {name:"Cagrilintide",type:"Peptide",unit:"mg",dose:0.3},{name:"SLU-PP-332",type:"Other",unit:"mg",dose:5},
];

export const ALL_STACKS = [
  {name:"CJC + Ipamorelin",category:"GH / Recovery",desc:"Classic GH stack for sleep, recovery, body comp",peptides:[{name:"CJC-1295 (no DAC)",amount:"2",unit:"mg",dose:"100",doseUnit:"mcg"},{name:"Ipamorelin",amount:"2",unit:"mg",dose:"200",doseUnit:"mcg"}]},
  {name:"CJC + GHRP-2",category:"GH / Recovery",desc:"Strong GH pulse, appetite stimulation",peptides:[{name:"CJC-1295 (no DAC)",amount:"2",unit:"mg",dose:"100",doseUnit:"mcg"},{name:"GHRP-2",amount:"2",unit:"mg",dose:"100",doseUnit:"mcg"}]},
  {name:"Sermorelin + Ipamorelin",category:"GH / Recovery",desc:"Gentle GH support, good for beginners",peptides:[{name:"Sermorelin",amount:"3",unit:"mg",dose:"200",doseUnit:"mcg"},{name:"Ipamorelin",amount:"2",unit:"mg",dose:"200",doseUnit:"mcg"}]},
  {name:"BPC + TB-500",category:"Healing",desc:"Tissue repair, injury recovery",peptides:[{name:"BPC-157",amount:"5",unit:"mg",dose:"250",doseUnit:"mcg"},{name:"TB-500 (Thymosin Beta-4)",amount:"10",unit:"mg",dose:"500",doseUnit:"mcg"}]},
  {name:"BPC + TB-500 + GHK-Cu",category:"Healing",desc:"Enhanced healing with collagen support",peptides:[{name:"BPC-157",amount:"5",unit:"mg",dose:"250",doseUnit:"mcg"},{name:"TB-500 (Thymosin Beta-4)",amount:"10",unit:"mg",dose:"500",doseUnit:"mcg"},{name:"GHK-Cu (Copper Peptide)",amount:"50",unit:"mg",dose:"1",doseUnit:"mg"}]},
  {name:"BPC + KPV",category:"Healing",desc:"Gut healing, anti-inflammatory",peptides:[{name:"BPC-157",amount:"5",unit:"mg",dose:"250",doseUnit:"mcg"},{name:"KPV",amount:"5",unit:"mg",dose:"500",doseUnit:"mcg"}]},
  {name:"GLOW Stack",category:"Skin / Anti-aging",desc:"Skin, collagen, healing trifecta",peptides:[{name:"GHK-Cu (Copper Peptide)",amount:"50",unit:"mg",dose:"1",doseUnit:"mg"},{name:"BPC-157",amount:"5",unit:"mg",dose:"250",doseUnit:"mcg"},{name:"TB-500 (Thymosin Beta-4)",amount:"10",unit:"mg",dose:"500",doseUnit:"mcg"}]},
  {name:"Epithalon + GHK-Cu",category:"Skin / Anti-aging",desc:"Longevity and skin rejuvenation",peptides:[{name:"Epithalon",amount:"10",unit:"mg",dose:"5",doseUnit:"mg"},{name:"GHK-Cu (Copper Peptide)",amount:"50",unit:"mg",dose:"1",doseUnit:"mg"}]},
  {name:"Semaglutide + BPC-157",category:"Weight Loss",desc:"GLP-1 with gut protection",peptides:[{name:"Semaglutide",amount:"5",unit:"mg",dose:"0.25",doseUnit:"mg"},{name:"BPC-157",amount:"5",unit:"mg",dose:"250",doseUnit:"mcg"}]},
  {name:"AOD + Ipamorelin",category:"Weight Loss",desc:"Fat loss + GH pulse",peptides:[{name:"AOD-9604",amount:"5",unit:"mg",dose:"300",doseUnit:"mcg"},{name:"Ipamorelin",amount:"2",unit:"mg",dose:"200",doseUnit:"mcg"}]},
  {name:"Selank + Semax",category:"Cognitive / Mood",desc:"Anxiety reduction + cognitive boost",peptides:[{name:"Selank",amount:"5",unit:"mg",dose:"250",doseUnit:"mcg"},{name:"Semax",amount:"3",unit:"mg",dose:"200",doseUnit:"mcg"}]},
  {name:"IGF-1 LR3 + BPC-157",category:"Performance",desc:"Muscle growth + recovery",peptides:[{name:"IGF-1 LR3",amount:"1",unit:"mg",dose:"50",doseUnit:"mcg"},{name:"BPC-157",amount:"5",unit:"mg",dose:"250",doseUnit:"mcg"}]},
  {name:"NAD+ + SS-31",category:"Longevity",desc:"Mitochondrial health and energy",peptides:[{name:"NAD+ (Injectable)",amount:"500",unit:"mg",dose:"100",doseUnit:"mg"},{name:"SS-31 (Elamipretide)",amount:"10",unit:"mg",dose:"4",doseUnit:"mg"}]},
  {name:"Epithalon + Thymosin Alpha-1",category:"Longevity",desc:"Immune support + telomere health",peptides:[{name:"Epithalon",amount:"10",unit:"mg",dose:"5",doseUnit:"mg"},{name:"Thymosin Alpha-1",amount:"3",unit:"mg",dose:"1.5",doseUnit:"mg"}]},
  {name:"KLOW Blend",category:"Skin / Anti-aging",desc:"GHK-Cu, BPC, TB-500, KPV skin & healing blend",peptides:[{name:"GHK-Cu (Copper Peptide)",amount:"50",unit:"mg",dose:"1.25",doseUnit:"mg"},{name:"BPC-157",amount:"10",unit:"mg",dose:"250",doseUnit:"mcg"},{name:"TB-500 (Thymosin Beta-4)",amount:"10",unit:"mg",dose:"250",doseUnit:"mcg"},{name:"KPV",amount:"10",unit:"mg",dose:"250",doseUnit:"mcg"}]},
];

export function getLocalDate() {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
}

export function getLocalTime() {
  const n = new Date();
  return `${String(n.getHours()).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}`;
}

export function parseLocalDate(dateStr) {
  if (!dateStr) return new Date();
  const [y, m, d] = dateStr.split("-");
  return new Date(y, m - 1, d);
}

export function formatDisplayDate(dStr) {
  if (!dStr) return "";
  const [y, m, d] = dStr.split("-");
  return `${m}-${d}-${y}`;
}

export function getActiveDose(med, today) {
  if (!med.isTitrating || !med.titrationSchedule?.length) return null;
  return med.titrationSchedule.filter(s => s.date <= today).sort((a, b) => b.date.localeCompare(a.date))[0] || null;
}

export function sortMeds(meds, sort) {
  const m = [...meds];
  if (sort === "az") return m.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === "za") return m.sort((a, b) => b.name.localeCompare(a.name));
  if (sort === "oldest") return m.sort((a, b) => parseInt(a.id) - parseInt(b.id));
  return m.sort((a, b) => parseInt(b.id) - parseInt(a.id));
}
