import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { resetOptimizationTasksForDemo } from "../utils/optimizationSignals";

/** Each full reload clears stored completions so the demo always starts with open optimization tasks. */
resetOptimizationTasksForDemo();

interface OptimizationReviewContextValue {
  /** Signal IDs marked complete this session (in-memory; resets on full page reload for demo). */
  completedIds: ReadonlySet<string>;
  /** Signal IDs dismissed this session (in-memory; resets on full page reload for demo). */
  dismissedIds: ReadonlySet<string>;
  completeSignal: (signalId: string) => void;
  dismissSignal: (signalId: string) => void;
}

const OptimizationReviewContext = createContext<OptimizationReviewContextValue | null>(null);

export function OptimizationReviewProvider({ children }: { children: ReactNode }) {
  const [completedIds, setCompletedIds] = useState<Set<string>>(() => new Set());
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(() => new Set());

  const completeSignal = useCallback((signalId: string) => {
    setCompletedIds((prev) => {
      if (prev.has(signalId)) return prev;
      const next = new Set(prev);
      next.add(signalId);
      return next;
    });
  }, []);

  const dismissSignal = useCallback((signalId: string) => {
    setDismissedIds((prev) => {
      if (prev.has(signalId)) return prev;
      const next = new Set(prev);
      next.add(signalId);
      return next;
    });
  }, []);

  const value = useMemo<OptimizationReviewContextValue>(
    () => ({ completedIds, dismissedIds, completeSignal, dismissSignal }),
    [completedIds, dismissedIds, completeSignal, dismissSignal]
  );

  return (
    <OptimizationReviewContext.Provider value={value}>
      {children}
    </OptimizationReviewContext.Provider>
  );
}

export function useOptimizationReview(): OptimizationReviewContextValue {
  const ctx = useContext(OptimizationReviewContext);
  if (!ctx) {
    throw new Error("useOptimizationReview must be used within OptimizationReviewProvider");
  }
  return ctx;
}
