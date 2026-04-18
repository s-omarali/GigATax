import {
  avgGasPriceByState2025,
  mockDeductions,
  mockFilingProfile,
  mockFilingRun,
  mockIntegrations,
  mockMetrics,
  mockOptimizationSignals,
  mockTransactions,
  mockUser,
} from "../data/mockData";
import type {
  DashboardResponse,
  FilingPreparationPayload,
  FilingRunStartPayload,
  OptimizationMileagePayload,
  OptimizationMileageResult,
  OnboardingPayload,
  ReceiptScanResponse,
} from "../types/api";
import type { FilingRun, IntegrationConnection, UserProfile } from "../types/domain";
import {
  estimateMilesFromGasSpend,
  getAllowedMileageDeduction,
  getAverageGasPriceForState,
  getEstimatedTaxSavings,
} from "../utils/taxMath";

function withLatency<T>(value: T, ms = 700): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), ms);
  });
}

export async function getCurrentUser(): Promise<UserProfile> {
  return withLatency(mockUser, 450);
}

export async function getDashboardData(): Promise<DashboardResponse> {
  return withLatency(
    {
      metrics: mockMetrics,
      transactions: mockTransactions,
      deductions: mockDeductions,
      optimizationSignals: mockOptimizationSignals,
    },
    850
  );
}

export async function saveOnboarding(payload: OnboardingPayload): Promise<{ profile: UserProfile; integrations: IntegrationConnection[] }> {
  return withLatency(
    {
      profile: { ...mockUser, gigs: payload.gigs, onboardingCompleted: true },
      integrations: payload.integrations,
    },
    900
  );
}

export async function scanReceiptFile(fileName: string): Promise<ReceiptScanResponse> {
  const hint = fileName.toLowerCase();
  const suggestedCategory = hint.includes("uber") ? "Travel" : "Supplies";
  return withLatency(
    {
      merchant: "Scanned Merchant",
      amount: 84.75,
      date: new Date().toISOString().slice(0, 10),
      suggestedCategory,
    },
    1400
  );
}

export async function getOptimizationMileage(payload: OptimizationMileagePayload): Promise<OptimizationMileageResult> {
  const averageGasPrice = getAverageGasPriceForState(payload.state, avgGasPriceByState2025);
  const estimatedMiles = estimateMilesFromGasSpend(payload.gasSpend, averageGasPrice, payload.mpg);
  const allowedDeductionAmount = getAllowedMileageDeduction(payload.businessMiles);
  const taxSavingsClaimed = getEstimatedTaxSavings(allowedDeductionAmount);

  return withLatency(
    {
      averageGasPrice,
      estimatedMiles,
      allowedDeductionAmount,
      taxSavingsClaimed,
    },
    500
  );
}

export async function saveFilingPreparation(payload: FilingPreparationPayload): Promise<{ saved: true; profile: FilingPreparationPayload }> {
  return withLatency({ saved: true, profile: payload }, 700);
}

export async function getFilingPreparationDefaults() {
  return withLatency(mockFilingProfile, 400);
}

export async function startFilingRun(payload: FilingRunStartPayload): Promise<FilingRun> {
  return withLatency({ ...mockFilingRun, provider: payload.provider }, 800);
}

export async function approveCurrentFilingStep(run: FilingRun): Promise<FilingRun> {
  const nextIndex = run.currentStepIndex + 1;
  const updatedSteps = run.steps.map((step, index) => {
    if (index === run.currentStepIndex) {
      return { ...step, status: "completed" as const };
    }
    if (index === nextIndex) {
      return { ...step, status: "ready_for_approval" as const };
    }
    return step;
  });

  const complete = nextIndex >= run.steps.length;
  const nextRun: FilingRun = {
    ...run,
    steps: updatedSteps,
    currentStepIndex: complete ? run.steps.length - 1 : nextIndex,
    status: complete ? "completed" : "awaiting_user",
  };

  return withLatency(nextRun, 650);
}

export async function getIntegrationDefaults(): Promise<IntegrationConnection[]> {
  return withLatency(mockIntegrations, 420);
}
