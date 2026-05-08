export function analyzeGrowthStage({ week, imageScore }) {
  if (week <= 3) {
    return { stage: "Seedling", guidance: "Maintain consistent moisture and shade nets." };
  }

  if (week <= 6) {
    return { stage: "Vegetative", guidance: "Increase nitrogen and monitor leaf color." };
  }

  return { stage: "Flowering/Fruiting", guidance: "Shift to balanced NPK and reduce overwatering." };
}
