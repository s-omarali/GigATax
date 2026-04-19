import type {
  DashboardMetrics,
  Deduction,
  FilingProfile,
  FilingRun,
  IntegrationConnection,
  OptimizationSignal,
  Transaction,
  UserProfile,
} from "./domain";

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface DashboardResponse {
  metrics: DashboardMetrics;
  transactions: Transaction[];
  deductions: Deduction[];
  optimizationSignals: OptimizationSignal[];
}

export interface OnboardingPayload {
  fullName: string;
  email: string;
  gigs: UserProfile["gigs"];
  integrations: IntegrationConnection[];
  /** US state of residence, 2-letter code. */
  state: string;
  /** Whole dollars (≥ 0). */
  estimatedAnnualIncome: number;
}

export interface ReceiptScanResponse {
  merchant: string;
  amount: number;
  date: string;
  suggestedCategory: Transaction["category"];
}

export interface OptimizationMileagePayload {
  state: string;
  mpg: number;
  businessMiles: number;
  gasSpend: number;
}

export interface OptimizationMileageResult {
  averageGasPrice: number;
  estimatedMiles: number;
  allowedDeductionAmount: number;
  taxSavingsClaimed: number;
}

export interface FilingPreparationPayload extends FilingProfile {
  acceptDisclosure: boolean;
}

export interface FilingRunStartPayload {
  provider: FilingRun["provider"];
}

export const API_ROUTES = {
  me: "/api/v1/me",
  dashboard: "/api/v1/dashboard",
  onboarding: "/api/v1/onboarding",
  receiptScan: "/api/v1/receipts/scan",
  optimizationMileage: "/api/v1/optimization/mileage",
  filingPreparation: "/api/v1/filing/preparation",
  filingRun: "/api/v1/filing/runs",
} as const;
