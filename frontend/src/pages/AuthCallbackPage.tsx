import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingState } from "../components/state/LoadingState";
import { getCurrentUser } from "../services/api";
import { supabase } from "../services/supabaseClient";

export function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase auto-exchanges the code from the URL on page load.
    // Listen for the resulting SIGNED_IN event instead of calling exchangeCodeForSession manually.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        subscription.unsubscribe();
        try {
          const user = await getCurrentUser();
          navigate(user.onboardingCompleted ? "/dashboard" : "/start?from=google");
        } catch {
          navigate("/start?from=google");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return <LoadingState title="Signing you in" description="Just a moment…" />;
}
