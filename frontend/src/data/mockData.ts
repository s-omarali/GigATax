import type {
  DashboardMetrics,
  Deduction,
  FilingProfile,
  FilingRun,
  GigType,
  IntegrationConnection,
  OptimizationSignal,
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

/** Full state names for onboarding `<select>` labels (`CA — California`). */
export const usStateNames: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California", CO: "Colorado",
  CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho",
  IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana",
  ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi",
  MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
  NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma",
  OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota",
  TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington",
  WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
};

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
  state: "TX",
  estimatedAnnualIncome: 52_000,
  estimatedMarginalTaxRate: 0.24,
  onboardingCompleted: true,
};

// Bank account first (most universal), then payment processors, then creator platforms
export const mockIntegrations: IntegrationConnection[] = [
  { id: "bank",    name: "Bank Account", description: "We use Plaid to connect your account securely",         connected: false },
  { id: "stripe",  name: "Stripe",       description: "Import card payments, subscriptions & platform payouts", connected: false },
  { id: "twitch",  name: "Twitch",       description: "Auto-import subscriptions, bits & ad revenue",           connected: false },
  { id: "youtube", name: "YouTube",      description: "Pull AdSense revenue, memberships & sponsorship payouts", connected: true, lastSyncAt: "2026-04-11T09:10:00Z" },
  { id: "paypal",  name: "PayPal",       description: "Sync client payments, invoices & freelance transfers",    connected: true, lastSyncAt: "2026-04-10T12:00:00Z" },
  { id: "patreon", name: "Patreon",      description: "Import tier membership income and platform fees",         connected: false },
];

export const mockTransactions: Transaction[] = [
  { id: "txn_1", date: "2026-04-17", merchant: "YouTube", amount: 3200, type: "income", category: "Income", confidenceScore: 0.99, source: "bank" },
  { id: "txn_2", date: "2026-04-16", merchant: "Adobe", amount: 59.99, type: "expense", category: "Software", confidenceScore: 0.97, source: "bank" },
  { id: "txn_3", date: "2026-04-16", merchant: "Shell", amount: 486.2, type: "expense", category: "Vehicle", confidenceScore: 0.92, source: "bank", notes: "Multiple fuel fills detected" },
  { id: "txn_4", date: "2026-04-14", merchant: "Delta", amount: 417.35, type: "expense", category: "Travel", confidenceScore: 0.9, source: "email" },
  { id: "txn_5", date: "2026-04-13", merchant: "Best Buy", amount: 179.99, type: "expense", category: "Supplies", confidenceScore: 0.73, source: "receipt" },
  { id: "txn_6", date: "2026-04-11", merchant: "Patreon", amount: 950, type: "income", category: "Income", confidenceScore: 0.96, source: "bank" },
];

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
    completed: false,
    label: "Vehicle mileage",
    gasSpend: 486.2,
    detectedPeriodLabel: "Last 90 days",
  },
  {
    id: "sig_2",
    type: "home_office",
    completed: false,
    label: "Home office",
    workspaceSqFt: 120,
    suggestedBusinessUsePercent: 18,
    potentialSavingsHint: 220,
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
  city: "Austin",
  state: "TX",
  zipCode: "78701",
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
