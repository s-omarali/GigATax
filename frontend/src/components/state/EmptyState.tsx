import { Inbox } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="bento-card flex min-h-40 items-center justify-center p-6 text-center">
      <div className="space-y-3">
        <Inbox className="mx-auto h-6 w-6 text-slate-500" />
        <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
    </div>
  );
}
