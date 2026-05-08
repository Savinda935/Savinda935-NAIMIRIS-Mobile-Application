export function scoreSeverity({ affectedLeavesPercent, pestCount }) {
  const score = affectedLeavesPercent + pestCount;

  if (score < 20) {
    return { level: "Low", riskNote: "Monitor weekly, no spray required." };
  }

  if (score < 35) {
    return { level: "Medium", riskNote: "Spot treat with recommended pesticide." };
  }

  return { level: "High", riskNote: "Immediate full coverage treatment needed." };
}
