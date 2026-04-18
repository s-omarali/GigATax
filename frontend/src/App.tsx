import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { DashboardPage } from "./pages/DashboardPage";
import { FilingPrepPage } from "./pages/FilingPrepPage";
import { FinalReviewPage } from "./pages/FinalReviewPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { OptimizationPage } from "./pages/OptimizationPage";
import { ReceiptCapturePage } from "./pages/ReceiptCapturePage";

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/receipts" element={<ReceiptCapturePage />} />
        <Route path="/optimization" element={<OptimizationPage />} />
        <Route path="/review" element={<FinalReviewPage />} />
        <Route path="/filing-prep" element={<FilingPrepPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
