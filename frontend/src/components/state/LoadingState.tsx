import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  title?: string;
  description?: string;
}

export function LoadingState({
  title = "Loading",
  description = "AI is analyzing your transactions...",
}: LoadingStateProps) {
  return (
    <div className="bento-card flex min-h-40 items-center justify-center p-6 text-center">
      <div className="space-y-3">
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-neon-cyan" />
        <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
    </div>
  );
}
