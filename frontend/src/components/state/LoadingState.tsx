import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  title?: string;
  description?: string;
}

export function LoadingState({
  title = "Loading",
  description = "Crunching…",
}: LoadingStateProps) {
  return (
    <div className="bento-card flex min-h-52 items-center justify-center p-8 text-center">
      <div className="space-y-3">
        <Loader2 className="mx-auto h-6 w-6 animate-spin" style={{ color: "#3B82F6" }} />
        <h3 className="text-[15px] font-semibold text-[#EDEDED]">{title}</h3>
        <p className="text-[13px]" style={{ color: "#888888" }}>{description}</p>
      </div>
    </div>
  );
}
