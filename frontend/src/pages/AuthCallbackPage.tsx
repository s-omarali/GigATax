import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingState } from "../components/state/LoadingState";
import { getCurrentUser } from "../services/api";
import { supabase } from "../services/supabaseClient";

export function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    async function routeAfterAuth() {
      if (!active) return;
      try {
        const user = await getCurrentUser();
        navigate(user.onboardingCompleted ? "/dashboard" : "/start?from=google");
      } catch {
        navigate("/start?from=google");
      }
    }

    // Handle case where session is already available by the time this page mounts.
    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (data.session) {
        void routeAfterAuth();
      }
    });

    // Also listen for SIGNED_IN in case session exchange completes after mount.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === "SIGNED_IN" && session) {
        subscription.unsubscribe();
        void routeAfterAuth();
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  return <LoadingState title="Signing you in" description="Just a moment…" />;
}
