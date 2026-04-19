import { CheckCircle2 } from "lucide-react";

interface SuccessStateProps {
  title: string;
  description: string;
}

export function SuccessState({ title, description }: SuccessStateProps) {
  return (
    <div
      className="bento-card flex min-h-52 items-center justify-center p-8 text-center"
      style={{
        border: "1px solid rgba(0,255,133,0.25)",
        boxShadow: "0 0 0 1px rgba(0,255,133,0.1), 0 8px 32px rgba(0,0,0,0.7), 0 0 40px rgba(0,255,133,0.07)",
      }}
    >
      <div className="space-y-3">
        <CheckCircle2 className="mx-auto h-7 w-7" style={{ color: "#00FF85" }} />
        <h3 className="text-[15px] font-semibold text-[#EDEDED]">{title}</h3>
        <p className="text-[13px]" style={{ color: "#888888" }}>{description}</p>
      </div>
    </div>
  );
}
