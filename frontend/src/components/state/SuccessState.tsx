import { CheckCircle2 } from "lucide-react";

interface SuccessStateProps {
  title: string;
  description: string;
}

export function SuccessState({ title, description }: SuccessStateProps) {
  return (
    <div className="bento-card flex min-h-40 items-center justify-center p-6 text-center shadow-glow">
      <div className="space-y-3">
        <CheckCircle2 className="mx-auto h-7 w-7 text-neon-mint" />
        <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
        <p className="text-sm text-slate-300">{description}</p>
      </div>
    </div>
  );
}
