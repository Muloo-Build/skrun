export interface CostCheckResult {
  exceeded: boolean;
  estimated: number;
}

export function checkCost(estimatedCost: number, maxCost?: number): CostCheckResult {
  return {
    exceeded: maxCost !== undefined && estimatedCost > maxCost,
    estimated: estimatedCost,
  };
}
