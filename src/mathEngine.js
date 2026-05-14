export function toMg(val, u) {
  const n = parseFloat(val) || 0;
  return u === "mcg" ? n / 1000 : n;
}

export function fromMg(mg, u) {
  return u === "mcg" ? mg * 1000 : mg;
}

export const convertToVialUnit = (dose, doseUnit, vialUnit) => {
  if (doseUnit === "mcg" && vialUnit === "mg") return dose / 1000;
  if (doseUnit === "mg" && vialUnit === "mcg") return dose * 1000;
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

    // FIX: Calculator vials are always mg. MedForm vials use a dedicated vialUnit property.
    const changedVMg = isCalc
      ? (parseFloat(changedP[vialKey]) || 0)
      : toMg(changedP[vialKey] || "0", changedP.vialUnit || "mg");

    if (changedVMg > 0) {
      const changedDMg = toMg(newVal, changedP[unitKey]);
      const drawRatio = changedDMg / changedVMg;

      newPeps.forEach((p, i) => {
        if (i !== changedIdx) {
          const pVMg = isCalc
            ? (parseFloat(p[vialKey]) || 0)
            : toMg(p[vialKey] || "0", p.vialUnit || "mg");

          if (pVMg > 0) {
            const newDMg = pVMg * drawRatio;
            const displayNum = p[unitKey] === "mcg" ? newDMg * 1000 : newDMg;
            p[doseKey] = parseFloat(displayNum.toFixed(3)).toString();
          }
        }
      });
    }
  }
  return newPeps;
};
