import type {
  DashboardMetrics,
  Deduction,
  FilingProfile,
  FilingRun,
  GigType,
  IntegrationConnection,
  OptimizationSignal,
  TransactionCategory,
  Transaction,
  UserProfile,
} from "../types/domain";

export const gigOptions: GigType[] = [
  "Content Creator",
  "Video Editor",
  "Streamer",
  "Photographer",
  "Podcaster",
  "Freelance Writer",
];

export const stateAbbreviations = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

export const avgGasPriceByState2025: Record<string, number> = {
  AL: 3.27, AK: 3.74, AZ: 3.71, AR: 3.22, CA: 4.91, CO: 3.44, CT: 3.58, DE: 3.33,
  FL: 3.39, GA: 3.31, HI: 5.14, ID: 3.88, IL: 3.89, IN: 3.36, IA: 3.24, KS: 3.20,
  KY: 3.29, LA: 3.26, ME: 3.59, MD: 3.46, MA: 3.54, MI: 3.48, MN: 3.31, MS: 3.17,
  MO: 3.21, MT: 3.64, NE: 3.26, NV: 4.25, NH: 3.46, NJ: 3.44, NM: 3.33, NY: 3.78,
  NC: 3.30, ND: 3.35, OH: 3.34, OK: 3.13, OR: 4.38, PA: 3.81, RI: 3.48, SC: 3.24,
  SD: 3.36, TN: 3.21, TX: 3.19, UT: 3.63, VT: 3.61, VA: 3.31, WA: 4.67, WV: 3.41,
  WI: 3.33, WY: 3.47,
};

export const mockUser: UserProfile = {
  id: "user_01",
  fullName: "Alex Rivera",
  email: "alex@gigatax.app",
  gigs: ["Content Creator", "Video Editor"],
  state: "CA",
  estimatedMarginalTaxRate: 0.24,
  onboardingCompleted: true,
};

// Ordered: largest audience platforms first, then payment processors, then subscription
export const mockIntegrations: IntegrationConnection[] = [
  { id: "bank", name: "Bank (Plaid)", description: "Connect checking and credit accounts for auto transaction sync", connected: false },
  { id: "youtube", name: "YouTube",  description: "Pull AdSense revenue, memberships & sponsorship payouts",  connected: true,  lastSyncAt: "2026-04-11T09:10:00Z" },
  { id: "paypal",  name: "PayPal",   description: "Sync client payments, invoices & freelance transfers",     connected: true,  lastSyncAt: "2026-04-10T12:00:00Z" },
  { id: "stripe",  name: "Stripe",   description: "Import card payments, subscriptions & platform payouts",   connected: false },
  { id: "twitch",  name: "Twitch",   description: "Auto-import subscription, bits & ad revenue",              connected: false },
  { id: "patreon", name: "Patreon",  description: "Import tier membership income and platform fees",          connected: false },
];

export const mockTransactions: Transaction[] = [
  { id: "txn_1", date: "2026-04-17", merchant: "YouTube", amount: 3200, type: "income", category: "Income", confidenceScore: 0.99, source: "bank" },
  { id: "txn_2", date: "2026-04-16", merchant: "Adobe", amount: 59.99, type: "expense", category: "Software", confidenceScore: 0.97, source: "bank" },
  { id: "txn_3", date: "2026-04-16", merchant: "Shell", amount: 486.2, type: "expense", category: "Vehicle", confidenceScore: 0.92, source: "bank", notes: "Multiple fuel fills detected" },
  { id: "txn_4", date: "2026-04-14", merchant: "Delta", amount: 417.35, type: "expense", category: "Travel", confidenceScore: 0.9, source: "email" },
  { id: "txn_5", date: "2026-04-13", merchant: "Best Buy", amount: 179.99, type: "expense", category: "Supplies", confidenceScore: 0.73, source: "receipt" },
  { id: "txn_6", date: "2026-04-11", merchant: "Patreon", amount: 950, type: "income", category: "Income", confidenceScore: 0.96, source: "bank" },
];

export const mockTransactionsByCategory: Record<TransactionCategory, Transaction[]> = {
  Income: [
    { id: "cat-inc-1", date: "2026-04-17", merchant: "YouTube", amount: 3200, type: "income", category: "Income", confidenceScore: 0.99, source: "bank" },
    { id: "cat-inc-2", date: "2026-04-11", merchant: "Patreon", amount: 950, type: "income", category: "Income", confidenceScore: 0.96, source: "bank" },
    { id: "cat-inc-3", date: "2026-04-08", merchant: "Stripe", amount: 740, type: "income", category: "Income", confidenceScore: 0.95, source: "bank" },
  ],
  Software: [
    { id: "cat-sw-1", date: "2026-04-16", merchant: "Adobe", amount: 59.99, type: "expense", category: "Software", confidenceScore: 0.97, source: "bank" },
    { id: "cat-sw-2", date: "2026-04-12", merchant: "Notion", amount: 12.0, type: "expense", category: "Software", confidenceScore: 0.95, source: "bank" },
    { id: "cat-sw-3", date: "2026-04-09", merchant: "Canva", amount: 14.99, type: "expense", category: "Software", confidenceScore: 0.94, source: "email" },
  ],
  Travel: [
    { id: "cat-tr-1", date: "2026-04-14", merchant: "Delta", amount: 417.35, type: "expense", category: "Travel", confidenceScore: 0.9, source: "email" },
    { id: "cat-tr-2", date: "2026-04-10", merchant: "Uber", amount: 43.2, type: "expense", category: "Travel", confidenceScore: 0.93, source: "bank" },
    { id: "cat-tr-3", date: "2026-04-06", merchant: "Hilton", amount: 219.0, type: "expense", category: "Travel", confidenceScore: 0.89, source: "bank" },
  ],
  Meals: [
    { id: "cat-me-1", date: "2026-04-15", merchant: "Sweetgreen", amount: 21.45, type: "expense", category: "Meals", confidenceScore: 0.91, source: "receipt" },
    { id: "cat-me-2", date: "2026-04-12", merchant: "Blue Bottle", amount: 18.2, type: "expense", category: "Meals", confidenceScore: 0.9, source: "bank" },
    { id: "cat-me-3", date: "2026-04-07", merchant: "DoorDash", amount: 33.75, type: "expense", category: "Meals", confidenceScore: 0.88, source: "email" },
  ],
  Vehicle: [
    { id: "cat-veh-1", date: "2026-04-16", merchant: "Shell", amount: 486.2, type: "expense", category: "Vehicle", confidenceScore: 0.92, source: "bank", notes: "Multiple fuel fills detected" },
    { id: "cat-veh-2", date: "2026-04-10", merchant: "Chevron", amount: 122.34, type: "expense", category: "Vehicle", confidenceScore: 0.91, source: "bank" },
    { id: "cat-veh-3", date: "2026-04-05", merchant: "Exxon", amount: 98.17, type: "expense", category: "Vehicle", confidenceScore: 0.9, source: "bank" },
  ],
  "Home Office": [
    { id: "cat-ho-1", date: "2026-04-13", merchant: "IKEA", amount: 124.0, type: "expense", category: "Home Office", confidenceScore: 0.86, source: "receipt" },
    { id: "cat-ho-2", date: "2026-04-09", merchant: "Staples", amount: 47.6, type: "expense", category: "Home Office", confidenceScore: 0.87, source: "receipt" },
    { id: "cat-ho-3", date: "2026-04-04", merchant: "Amazon", amount: 89.99, type: "expense", category: "Home Office", confidenceScore: 0.84, source: "email" },
  ],
  Supplies: [
    { id: "cat-sup-1", date: "2026-04-13", merchant: "Best Buy", amount: 179.99, type: "expense", category: "Supplies", confidenceScore: 0.73, source: "receipt" },
    { id: "cat-sup-2", date: "2026-04-11", merchant: "B&H", amount: 64.5, type: "expense", category: "Supplies", confidenceScore: 0.88, source: "bank" },
    { id: "cat-sup-3", date: "2026-04-03", merchant: "Target", amount: 39.2, type: "expense", category: "Supplies", confidenceScore: 0.82, source: "receipt" },
  ],
  Uncategorized: [
    { id: "cat-unc-1", date: "2026-04-12", merchant: "Square", amount: 49.0, type: "expense", category: "Uncategorized", confidenceScore: 0.54, source: "bank" },
    { id: "cat-unc-2", date: "2026-04-08", merchant: "Unknown Merchant", amount: 27.5, type: "expense", category: "Uncategorized", confidenceScore: 0.51, source: "email" },
  ],
};

export const mockDeductions: Deduction[] = [
  {
    id: "ded_veh_1",
    title: "Vehicle Mileage",
    category: "Vehicle",
    status: "in_progress",
    potentialSavings: 340,
    detail: "Fuel purchases suggest business driving activity.",
  },
  {
    id: "ded_home_1",
    title: "Home Office",
    category: "Home Office",
    status: "available",
    potentialSavings: 220,
    detail: "Workspace expenses can likely be allocated.",
  },
  {
    id: "ded_sw_1",
    title: "Software Subscriptions",
    category: "Software",
    status: "claimed",
    potentialSavings: 110,
    detail: "Recurring software spend is already categorized.",
  },
];

export const mockOptimizationSignals: OptimizationSignal[] = [
  {
    id: "sig_1",
    type: "vehicle_mileage",
    gasSpend: 486.2,
    detectedPeriodLabel: "Last 90 days",
  },
];

export const mockMetrics: DashboardMetrics = {
  totalIncome: 4150,
  estimatedTaxLiability: 1087,
  totalDeductionsFound: 670,
};

export const mockFilingProfile: FilingProfile = {
  legalName: "Alex Rivera",
  ssnLast4: "2319",
  filingStatus: "single",
  dependents: 0,
  address1: "123 Creator Ave",
  city: "Los Angeles",
  state: "CA",
  zipCode: "90012",
};

export const mockFilingRun: FilingRun = {
  runId: "run_2026_01",
  status: "awaiting_user",
  provider: "TurboTax",
  currentStepIndex: 0,
  steps: [
    {
      id: "step_1",
      label: "Personal Info",
      status: "ready_for_approval",
      preview: [
        { field: "Legal Name", value: "Alex Rivera" },
        { field: "SSN (last 4)", value: "2319" },
        { field: "Filing Status", value: "Single" },
      ],
    },
    {
      id: "step_2",
      label: "Income Summary",
      status: "pending",
      preview: [
        { field: "1099 Total", value: "$4,150" },
        { field: "Other Income", value: "$0" },
      ],
    },
    {
      id: "step_3",
      label: "Deductions",
      status: "pending",
      preview: [
        { field: "Mileage Deduction", value: "$650" },
        { field: "Software Deductions", value: "$180" },
      ],
    },
  ],
};
