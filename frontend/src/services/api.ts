/**
 * Real API client — calls the FastAPI backend at localhost:8000.
 * Swap imports from mockApi to this file when the backend is running.
 *
 * Auth: each request attaches the Supabase JWT so FastAPI can verify identity.
 */

import { getAuthHeaders } from "./supabaseClient";
import type {
  DashboardResponse,
  FilingPreparationPayload,
  FilingRunStartPayload,
  OnboardingPayload,
  OptimizationMileagePayload,
  OptimizationMileageResult,
  ReceiptScanResponse,
} from "../types/api";
import type { FilingRun, IntegrationConnection, UserProfile } from "../types/domain";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const authHeaders = await getAuthHeaders();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API ${path} failed (${res.status}): ${text}`);
  }
  return res.json() as Promise<T>;
}

export async function getCurrentUser(): Promise<UserProfile> {
  return apiFetch<UserProfile>("/api/v1/me");
}

export async function getDashboardData(): Promise<DashboardResponse> {
  return apiFetch<DashboardResponse>("/api/v1/dashboard");
}

export async function saveOnboarding(
  payload: OnboardingPayload
): Promise<{ profile: UserProfile; integrations: IntegrationConnection[] }> {
  return apiFetch("/api/v1/onboarding", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function scanReceiptFile(fileName: string): Promise<ReceiptScanResponse> {
  return apiFetch<ReceiptScanResponse>("/api/v1/receipts/scan", {
    method: "POST",
    body: JSON.stringify({ fileName }),
  });
}

export async function getOptimizationMileage(
  payload: OptimizationMileagePayload
): Promise<OptimizationMileageResult> {
  return apiFetch<OptimizationMileageResult>("/api/v1/optimization/mileage", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function saveFilingPreparation(
  payload: FilingPreparationPayload
): Promise<{ saved: true; profile: FilingPreparationPayload }> {
  return apiFetch("/api/v1/filing/preparation", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function startFilingRun(payload: FilingRunStartPayload): Promise<FilingRun> {
  return apiFetch<FilingRun>("/api/v1/filing/runs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
