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

const MEAL_REVIEW_THRESHOLD = 50;

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
  estimatedAnnualIncome: 198_000,
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

const MOCK_GIG_TRANSACTIONS: Record<GigType, Transaction[]> = {
  "Content Creator": [
    { id: "cc-1", date: "2026-04-17", merchant: "YouTube", amount: 8600, type: "income", category: "Income", confidenceScore: 0.99, source: "bank" },
    { id: "cc-2", date: "2026-04-15", merchant: "Patreon", amount: 3400, type: "income", category: "Income", confidenceScore: 0.96, source: "bank" },
    { id: "cc-3", date: "2026-04-14", merchant: "Adobe", amount: 59.99, type: "expense", category: "Software", confidenceScore: 0.97, source: "bank" },
    { id: "cc-4", date: "2026-04-12", merchant: "Best Buy", amount: 179.99, type: "expense", category: "Supplies", confidenceScore: 0.84, source: "receipt" },
    { id: "cc-5", date: "2026-04-11", merchant: "Shell", amount: 138.5, type: "expense", category: "Vehicle", confidenceScore: 0.9, source: "bank" },
    { id: "cc-6", date: "2026-04-10", merchant: "McDonald's", amount: 12.49, type: "expense", category: "Personal", confidenceScore: 0.98, source: "bank", notes: "Personal expense (non-deductible)" },
    { id: "cc-7", date: "2026-04-08", merchant: "7-Eleven", amount: 7.25, type: "expense", category: "Personal", confidenceScore: 0.96, source: "receipt", notes: "Personal snacks (non-deductible)" },
    { id: "cc-8", date: "2026-04-06", merchant: "Nobu", amount: 86.4, type: "expense", category: "Meals", confidenceScore: 0.9, source: "bank", notes: "Potential client dinner - review needed" },
  ],
  "Video Editor": [
    { id: "ve-1", date: "2026-04-16", merchant: "Upwork", amount: 9400, type: "income", category: "Income", confidenceScore: 0.97, source: "bank" },
    { id: "ve-2", date: "2026-04-13", merchant: "Frame.io", amount: 15.0, type: "expense", category: "Software", confidenceScore: 0.95, source: "bank" },
    { id: "ve-3", date: "2026-04-12", merchant: "DaVinci Resolve", amount: 29.0, type: "expense", category: "Software", confidenceScore: 0.94, source: "bank" },
    { id: "ve-4", date: "2026-04-10", merchant: "B&H", amount: 84.6, type: "expense", category: "Supplies", confidenceScore: 0.88, source: "receipt" },
    { id: "ve-5", date: "2026-04-09", merchant: "Delta", amount: 312.2, type: "expense", category: "Travel", confidenceScore: 0.91, source: "email" },
    { id: "ve-6", date: "2026-04-07", merchant: "Chipotle", amount: 14.95, type: "expense", category: "Personal", confidenceScore: 0.96, source: "bank", notes: "Personal meal (non-deductible)" },
    { id: "ve-7", date: "2026-04-05", merchant: "Target Snacks", amount: 9.4, type: "expense", category: "Personal", confidenceScore: 0.95, source: "receipt", notes: "Personal snacks (non-deductible)" },
    { id: "ve-8", date: "2026-04-04", merchant: "Perry's Steakhouse", amount: 74.8, type: "expense", category: "Meals", confidenceScore: 0.88, source: "bank", notes: "Potential client dinner - review needed" },
  ],
  "Streamer": [
    { id: "st-1", date: "2026-04-17", merchant: "Twitch", amount: 6200, type: "income", category: "Income", confidenceScore: 0.98, source: "bank" },
    { id: "st-2", date: "2026-04-15", merchant: "PayPal Tips", amount: 2300, type: "income", category: "Income", confidenceScore: 0.95, source: "bank" },
    { id: "st-3", date: "2026-04-14", merchant: "Elgato", amount: 149.0, type: "expense", category: "Supplies", confidenceScore: 0.91, source: "receipt" },
    { id: "st-4", date: "2026-04-12", merchant: "Canva", amount: 15.0, type: "expense", category: "Software", confidenceScore: 0.93, source: "email" },
    { id: "st-5", date: "2026-04-11", merchant: "Uber", amount: 28.6, type: "expense", category: "Travel", confidenceScore: 0.86, source: "bank" },
    { id: "st-6", date: "2026-04-10", merchant: "McDonald's", amount: 10.89, type: "expense", category: "Personal", confidenceScore: 0.97, source: "bank", notes: "Personal expense (non-deductible)" },
    { id: "st-7", date: "2026-04-08", merchant: "Circle K", amount: 6.75, type: "expense", category: "Personal", confidenceScore: 0.95, source: "receipt", notes: "Personal snacks (non-deductible)" },
    { id: "st-8", date: "2026-04-07", merchant: "Wingstop", amount: 52.1, type: "expense", category: "Meals", confidenceScore: 0.86, source: "bank", notes: "Potential collab meeting meal - review needed" },
  ],
  "Photographer": [
    { id: "ph-1", date: "2026-04-16", merchant: "HoneyBook", amount: 7800, type: "income", category: "Income", confidenceScore: 0.98, source: "bank" },
    { id: "ph-2", date: "2026-04-13", merchant: "Pixieset", amount: 3600, type: "income", category: "Income", confidenceScore: 0.94, source: "bank" },
    { id: "ph-3", date: "2026-04-12", merchant: "LensRentals", amount: 175.0, type: "expense", category: "Supplies", confidenceScore: 0.92, source: "receipt" },
    { id: "ph-4", date: "2026-04-11", merchant: "Chevron", amount: 118.7, type: "expense", category: "Vehicle", confidenceScore: 0.9, source: "bank" },
    { id: "ph-5", date: "2026-04-09", merchant: "Hilton", amount: 264.0, type: "expense", category: "Travel", confidenceScore: 0.87, source: "email" },
    { id: "ph-6", date: "2026-04-07", merchant: "Chick-fil-A", amount: 13.2, type: "expense", category: "Personal", confidenceScore: 0.96, source: "bank", notes: "Personal meal (non-deductible)" },
    { id: "ph-7", date: "2026-04-06", merchant: "CVS", amount: 8.9, type: "expense", category: "Personal", confidenceScore: 0.95, source: "receipt", notes: "Personal item (non-deductible)" },
    { id: "ph-8", date: "2026-04-05", merchant: "Truluck's", amount: 91.35, type: "expense", category: "Meals", confidenceScore: 0.87, source: "bank", notes: "Potential client dinner - review needed" },
  ],
  "Podcaster": [
    { id: "po-1", date: "2026-04-17", merchant: "Spotify", amount: 4200, type: "income", category: "Income", confidenceScore: 0.95, source: "bank" },
    { id: "po-2", date: "2026-04-15", merchant: "Patreon", amount: 2100, type: "income", category: "Income", confidenceScore: 0.94, source: "bank" },
    { id: "po-3", date: "2026-04-13", merchant: "Riverside", amount: 24.0, type: "expense", category: "Software", confidenceScore: 0.92, source: "bank" },
    { id: "po-4", date: "2026-04-12", merchant: "Shure", amount: 199.0, type: "expense", category: "Supplies", confidenceScore: 0.9, source: "receipt" },
    { id: "po-5", date: "2026-04-10", merchant: "Uber", amount: 32.4, type: "expense", category: "Travel", confidenceScore: 0.85, source: "bank" },
    { id: "po-6", date: "2026-04-08", merchant: "Subway", amount: 11.35, type: "expense", category: "Personal", confidenceScore: 0.96, source: "bank", notes: "Personal meal (non-deductible)" },
    { id: "po-7", date: "2026-04-07", merchant: "Snack Stop", amount: 5.8, type: "expense", category: "Personal", confidenceScore: 0.95, source: "receipt", notes: "Personal snacks (non-deductible)" },
    { id: "po-8", date: "2026-04-06", merchant: "P.F. Chang's", amount: 63.55, type: "expense", category: "Meals", confidenceScore: 0.88, source: "bank", notes: "Potential guest meal - review needed" },
  ],
  "Freelance Writer": [
    { id: "fw-1", date: "2026-04-16", merchant: "Substack", amount: 5200, type: "income", category: "Income", confidenceScore: 0.96, source: "bank" },
    { id: "fw-2", date: "2026-04-13", merchant: "Wise", amount: 4700, type: "income", category: "Income", confidenceScore: 0.95, source: "bank" },
    { id: "fw-3", date: "2026-04-12", merchant: "Grammarly", amount: 12.0, type: "expense", category: "Software", confidenceScore: 0.94, source: "bank" },
    { id: "fw-4", date: "2026-04-10", merchant: "Amazon Books", amount: 54.2, type: "expense", category: "Supplies", confidenceScore: 0.88, source: "email" },
    { id: "fw-5", date: "2026-04-09", merchant: "Blue Bottle", amount: 23.6, type: "expense", category: "Meals", confidenceScore: 0.84, source: "bank" },
    { id: "fw-6", date: "2026-04-08", merchant: "McDonald's", amount: 9.75, type: "expense", category: "Personal", confidenceScore: 0.97, source: "bank", notes: "Personal expense (non-deductible)" },
    { id: "fw-7", date: "2026-04-06", merchant: "Doritos (Corner Store)", amount: 4.5, type: "expense", category: "Personal", confidenceScore: 0.94, source: "receipt", notes: "Personal snacks (non-deductible)" },
    { id: "fw-8", date: "2026-04-05", merchant: "Uchi", amount: 68.9, type: "expense", category: "Meals", confidenceScore: 0.87, source: "bank", notes: "Potential editorial meeting meal - review needed" },
  ],
};

export function getMockTransactionsForGigs(gigs: GigType[]): Transaction[] {
  const selected: GigType[] = gigs.length ? gigs : ["Content Creator"];
  const merged: Transaction[] = [];
  const seen = new Set<string>();

  for (const gig of selected) {
    const rows = MOCK_GIG_TRANSACTIONS[gig] ?? [];
    for (const tx of rows) {
      if (seen.has(tx.id)) continue;
      seen.add(tx.id);
      merged.push({ ...tx });
    }
  }

  return merged.sort((a, b) => b.date.localeCompare(a.date));
}

export function estimateAnnualIncomeFromGigs(gigs: GigType[]): number {
  const monthlyIncome = getMockTransactionsForGigs(gigs)
    .filter((tx) => tx.type === "income")
    .reduce((sum, tx) => sum + tx.amount, 0);
  return Math.round(monthlyIncome * 12);
}

export function getMockTransactionsByCategory(transactions: Transaction[]): Record<TransactionCategory, Transaction[]> {
  const grouped: Record<TransactionCategory, Transaction[]> = {
    Income: [],
    Software: [],
    Travel: [],
    Meals: [],
    Vehicle: [],
    "Home Office": [],
    Supplies: [],
    Personal: [],
    Uncategorized: [],
  };

  for (const tx of transactions) {
    grouped[tx.category].push(tx);
  }

  return grouped;
}

export const mockTransactions = getMockTransactionsForGigs(mockUser.gigs);

export const mockTransactionsByCategory: Record<TransactionCategory, Transaction[]> =
  getMockTransactionsByCategory(mockTransactions);

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

export function getMockOptimizationSignals(transactions: Transaction[]): OptimizationSignal[] {
  const mealCandidates = transactions
    .filter((tx) => tx.type === "expense" && tx.category === "Meals" && tx.amount > MEAL_REVIEW_THRESHOLD)
    .map((tx) => ({
      transactionId: tx.id,
      date: tx.date,
      merchant: tx.merchant,
      amount: tx.amount,
      businessPurpose: "",
      attendees: "",
    }));

  const mealSignal: OptimizationSignal[] = mealCandidates.length
    ? [
        {
          id: "sig_meals_review",
          type: "meal_review",
          completed: false,
          label: "High-value meal deductions",
          threshold: MEAL_REVIEW_THRESHOLD,
          meals: mealCandidates,
        },
      ]
    : [];

  return [...mockOptimizationSignals, ...mealSignal];
}

export const mockMetrics: DashboardMetrics = {
  totalIncome: 165000,
  estimatedTaxLiability: 36500,
  totalDeductionsFound: 8400,
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
