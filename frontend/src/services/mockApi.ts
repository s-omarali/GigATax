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
import type { DashboardMetrics, FilingRun, IntegrationConnection, Transaction, UserProfile } from "../types/domain";
import { getStateTaxContext } from "../utils/stateTaxContext";
import {
  estimateMilesFromGasSpend,
  getAllowedMileageDeduction,
  getAverageGasPriceForState,
  getDemoMarginalRateFromAnnualIncome,
  getEstimatedTaxSavings,
} from "../utils/taxMath";

function withLatency<T>(value: T, ms = 700): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), ms);
  });
}

function cloneProfile(profile: UserProfile): UserProfile {
  return { ...profile, gigs: [...profile.gigs] };
}

function sumIncomeFromTransactions(transactions: Transaction[]): number {
  return transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
}

/** Dashboard metrics scale from profile + static mock transactions (demo). */
function buildDashboardMetrics(profile: UserProfile): DashboardMetrics {
  const txnIncome = sumIncomeFromTransactions(mockTransactions);
  const annual = Math.max(0, profile.estimatedAnnualIncome);
  const blendedIncome = Math.round(Math.max(txnIncome, annual));

  const ctx = getStateTaxContext(profile.state);
  const incomeRatio = blendedIncome / Math.max(1, mockMetrics.totalIncome);

  const estimatedTaxLiability = Math.round(
    mockMetrics.estimatedTaxLiability * incomeRatio * ctx.liabilityMultiplier
  );

  const deductionTilt = 0.94 + 0.08 * Math.min(1.2, Math.max(0.8, ctx.liabilityMultiplier));
  const totalDeductionsFound = Math.round(mockMetrics.totalDeductionsFound * deductionTilt);

  return {
    totalIncome: blendedIncome,
    estimatedTaxLiability: Math.max(0, estimatedTaxLiability),
    totalDeductionsFound: Math.max(0, totalDeductionsFound),
  };
}

function initialProfile(): UserProfile {
  const p = cloneProfile(mockUser);
  p.estimatedMarginalTaxRate = getDemoMarginalRateFromAnnualIncome(p.estimatedAnnualIncome);
  return p;
}

let currentMockProfile: UserProfile = initialProfile();

export async function getCurrentUser(): Promise<UserProfile> {
  return withLatency(cloneProfile(currentMockProfile), 450);
}

export async function getDashboardData(): Promise<DashboardResponse> {
  return withLatency(
    {
      metrics: buildDashboardMetrics(currentMockProfile),
      transactions: mockTransactions,
      deductions: mockDeductions,
      optimizationSignals: mockOptimizationSignals,
    },
    850
  );
}

export async function saveOnboarding(payload: OnboardingPayload): Promise<{ profile: UserProfile; integrations: IntegrationConnection[] }> {
  const state = payload.state.trim().toUpperCase().slice(0, 2) || currentMockProfile.state;
  const estimatedAnnualIncome = Math.max(0, Math.floor(payload.estimatedAnnualIncome));
  const fullName = payload.fullName.trim() || currentMockProfile.fullName;
  const email = payload.email.trim().toLowerCase() || currentMockProfile.email;

  currentMockProfile = {
    ...currentMockProfile,
    fullName,
    email,
    gigs: [...payload.gigs],
    state,
    estimatedAnnualIncome,
    estimatedMarginalTaxRate: getDemoMarginalRateFromAnnualIncome(estimatedAnnualIncome),
    onboardingCompleted: true,
  };

  return withLatency(
    {
      profile: cloneProfile(currentMockProfile),
      integrations: payload.integrations.map((i) => ({ ...i })),
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
