export function buildBudgetPlan({ budgetLkr, landSizeAcres, workers, tools }) {
  const baseCost = 180000 * landSizeAcres + workers * 15000;
  const dripCost = tools.includes("drip") ? 45000 : 0;
  const estimatedCost = baseCost + dripCost;

  return {
    method: estimatedCost <= budgetLkr ? "Drip irrigation" : "Rain-fed with mulch",
    estimatedCost,
    fitsBudget: estimatedCost <= budgetLkr
  };
}
