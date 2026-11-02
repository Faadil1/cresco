/**
 * Deterministic, fictional classroom calculations for the Family learning lab.
 * No persistence, wallet, API, financial data, Key or approval side effects.
 */
export function savingsPlan(target: number, saved: number, periods: number) {
  const stillNeeded = Math.max(0, target - saved);
  const count = Math.max(1, Math.floor(periods));
  return { stillNeeded, perPeriod: Math.ceil(stillNeeded / count), periods: count };
}

export function groceryMargin(sales: number, otherCosts: number, deliveryCosts: number) {
  const remaining = sales - otherCosts - deliveryCosts;
  return { sales, otherCosts, deliveryCosts, remaining };
}

export function priceDrop(initialValue: number, dropPercent: number) {
  const drop = Math.max(0, Math.min(100, dropPercent));
  return {
    initialValue,
    dropPercent: drop,
    lost: initialValue * drop / 100,
    afterDrop: initialValue * (100 - drop) / 100,
  };
}
