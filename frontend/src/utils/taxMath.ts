const IRS_STANDARD_MILEAGE_RATE_2025 = 0.67;
const DEFAULT_MARGINAL_TAX_RATE = 0.24;
const FALLBACK_GAS_PRICE = 3.49;

export function getAverageGasPriceForState(state: string, map: Record<string, number>): number {
  const key = state.trim().toUpperCase();
  return map[key] ?? FALLBACK_GAS_PRICE;
}

export function estimateMilesFromGasSpend(gasSpend: number, averageGasPrice: number, mpg: number): number {
  if (averageGasPrice <= 0 || mpg <= 0) return 0;
  const gallons = gasSpend / averageGasPrice;
  return Math.max(0, gallons * mpg);
}

export function getAllowedMileageDeduction(businessMiles: number): number {
  return Math.max(0, businessMiles * IRS_STANDARD_MILEAGE_RATE_2025);
}

export function getEstimatedTaxSavings(deductionAmount: number, marginalTaxRate = DEFAULT_MARGINAL_TAX_RATE): number {
  return Math.max(0, deductionAmount * marginalTaxRate);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}
