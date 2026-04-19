export type GigType = "Content Creator" | "Video Editor" | "Streamer" | "Photographer" | "Podcaster" | "Freelance Writer";

export type TransactionCategory =
  | "Income"
  | "Software"
  | "Travel"
  | "Meals"
  | "Vehicle"
  | "Home Office"
  | "Supplies"
  | "Uncategorized";

export interface Transaction {
  id: string;
  date: string;
  merchant: string;
  amount: number;
  type: "income" | "expense";
  category: TransactionCategory;
  confidenceScore: number;
  source: "bank" | "email" | "receipt";
  notes?: string;
}

export interface Deduction {
  id: string;
  title: string;
  category: string;
  status: "available" | "in_progress" | "claimed";
  potentialSavings: number;
  detail: string;
}

export interface IntegrationConnection {
  id: "bank" | "youtube" | "paypal" | "stripe" | "twitch" | "patreon";
  name: string;
  description: string;
  connected: boolean;
  lastSyncAt?: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  gigs: GigType[];
  state: string;
  estimatedMarginalTaxRate: number;
  onboardingCompleted: boolean;
}

export interface DashboardMetrics {
  totalIncome: number;
  estimatedTaxLiability: number;
  totalDeductionsFound: number;
}

export interface OptimizationSignal {
  id: string;
  type: "vehicle_mileage";
  gasSpend: number;
  detectedPeriodLabel: string;
}

export interface FilingProfile {
  legalName: string;
  ssnLast4: string;
  filingStatus: "single" | "married_joint" | "married_separate" | "head_household";
  dependents: number;
  address1: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface FilingRunStep {
  id: string;
  label: string;
  status: "pending" | "ready_for_approval" | "completed";
  preview: Array<{ field: string; value: string }>;
}

export interface FilingRun {
  runId: string;
  status: "idle" | "running" | "awaiting_user" | "completed";
  provider: "TurboTax" | "FreeTaxUSA";
  currentStepIndex: number;
  steps: FilingRunStep[];
}
