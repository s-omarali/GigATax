import { Navigate, Route, Routes } from "react-router-dom";
import { RequireAuth } from "./components/auth/RequireAuth";
import { AppShell } from "./components/layout/AppShell";
import { AuthCallbackPage } from "./pages/AuthCallbackPage";
import { DashboardPage } from "./pages/DashboardPage";
import { FilingPrepPage } from "./pages/FilingPrepPage";
import { FinalReviewPage } from "./pages/FinalReviewPage";
import { LandingPage } from "./pages/LandingPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { OptimizationPage } from "./pages/OptimizationPage";
import { ReceiptCapturePage } from "./pages/ReceiptCapturePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/start" element={<OnboardingPage />} />
      <Route path="/onboarding" element={<Navigate to="/start" replace />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      <Route element={<RequireAuth><AppShell /></RequireAuth>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/receipts" element={<ReceiptCapturePage />} />
        <Route path="/optimization" element={<OptimizationPage />} />
        <Route path="/review" element={<FinalReviewPage />} />
        <Route path="/filing-prep" element={<FilingPrepPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
