import { Navigate } from "react-router-dom";

export function AccessGuard({ children }: { children: React.ReactNode }) {
  const granted = sessionStorage.getItem("access_granted") === "true";
  if (!granted) return <Navigate to="/waitlist" replace />;
  return <>{children}</>;
}
