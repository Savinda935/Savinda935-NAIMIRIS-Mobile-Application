export function formatCurrencyLkr(amount) {
  if (amount == null) {
    return "LKR 0";
  }

  return `LKR ${amount.toLocaleString("en-LK")}`;
}
