// IU handling: when unit is "IU" and iuPerMg is a positive number, convert IU↔mg
// using the substance-specific ratio (e.g., HGH iuPerMg=3 → 6 IU = 2 mg).
// When unit is "IU" and no ratio is provided, IU passes through unchanged —
// callers are responsible for ensuring both sides of any comparison stay in IU.

export function toMg(val, u, iuPerMg = null) {
  const n = parseFloat(val) || 0;
  if (u === "mcg") return n / 1000;
  if (u === "IU" && iuPerMg && iuPerMg > 0) return n / iuPerMg;
  return n;
}

export function fromMg(mg, u, iuPerMg = null) {
  if (u === "mcg") return mg * 1000;
  if (u === "IU" && iuPerMg && iuPerMg > 0) return mg * iuPerMg;
  return mg;
}

export const convertToVialUnit = (dose, doseUnit, vialUnit, iuPerMg = null) => {
  if (doseUnit === vialUnit) return dose;
  // mcg ↔ mg
  if (doseUnit === "mcg" && vialUnit === "mg") return dose / 1000;
  if (doseUnit === "mg" && vialUnit === "mcg") return dose * 1000;
  // IU ↔ mg/mcg (only when ratio is known)
  if (iuPerMg && iuPerMg > 0) {
    if (doseUnit === "IU" && vialUnit === "mg") return dose / iuPerMg;
    if (doseUnit === "IU" && vialUnit === "mcg") return (dose / iuPerMg) * 1000;
    if (doseUnit === "mg" && vialUnit === "IU") return dose * iuPerMg;
    if (doseUnit === "mcg" && vialUnit === "IU") return (dose / 1000) * iuPerMg;
  }
  // Fallback: unknown conversion — pass through (closed-family IU or unsupported pair)
  return dose;
};

export const calculateProportionateStack = (peptides, changedIdx, newVal) => {
  const newPeps = [...peptides];
  // Detect if we are in Calculator (doseAmount) or MedForm (dose)
  const isCalc = newPeps[changedIdx].doseAmount !== undefined;
  const doseKey = isCalc ? "doseAmount" : "dose";
  const vialKey = isCalc ? "vialMg" : "vialTotal";
  const unitKey = isCalc ? "doseUnit" : "unit";

  newPeps[changedIdx][doseKey] = newVal;

  const parsedVal = parseFloat(newVal);
  if (!isNaN(parsedVal) && parsedVal > 0) {
    const changedP = newPeps[changedIdx];

    // Calculator: vialMg field name implies mg, but with IU support added we
    // honor a vialUnit if present (default mg). MedForm: explicit vialUnit field.
    const changedVUnit = isCalc ? (changedP.vialUnit || "mg") : (changedP.vialUnit || "mg");
    const changedVMg = toMg(changedP[vialKey] || "0", changedVUnit, changedP.iuPerMg);

    if (changedVMg > 0) {
      const changedDMg = toMg(newVal, changedP[unitKey], changedP.iuPerMg);
      const drawRatio = changedDMg / changedVMg;

      newPeps.forEach((p, i) => {
        if (i !== changedIdx) {
          const pVUnit = isCalc ? (p.vialUnit || "mg") : (p.vialUnit || "mg");
          const pVMg = toMg(p[vialKey] || "0", pVUnit, p.iuPerMg);

          if (pVMg > 0) {
            const newDMg = pVMg * drawRatio;
            const displayNum = fromMg(newDMg, p[unitKey], p.iuPerMg);
            p[doseKey] = parseFloat(displayNum.toFixed(3)).toString();
          }
        }
      });
    }
  }
  return newPeps;
};
