export function getTreatmentPlan({ severity }) {
  if (severity === "Low") {
    return { action: "Neem-based spray", dosage: "2 ml/L", safetyNote: "Apply in evening." };
  }

  if (severity === "Medium") {
    return { action: "Spinosad", dosage: "0.5 ml/L", safetyNote: "Wear gloves and mask." };
  }

  return { action: "Emamectin", dosage: "0.4 g/L", safetyNote: "Avoid harvest for 7 days." };
}
