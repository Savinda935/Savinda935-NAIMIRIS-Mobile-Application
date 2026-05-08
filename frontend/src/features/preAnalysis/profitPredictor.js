export function predictProfit({ budgetLkr, landSizeAcres, yieldKg, pricePerKg }) {
  const totalCost = Math.max(budgetLkr, 150000 * landSizeAcres);
  const revenue = yieldKg * pricePerKg;
  const profit = revenue - totalCost;
  const roiPercent = totalCost > 0 ? Math.round((profit / totalCost) * 100) : 0;

  return { totalCost, revenue, profit, roiPercent };
}
