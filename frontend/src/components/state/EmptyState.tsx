import { Inbox } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="bento-card flex min-h-52 items-center justify-center p-8 text-center">
      <div className="space-y-3">
        <Inbox className="mx-auto h-6 w-6" style={{ color: "#555555" }} />
        <h3 className="text-[15px] font-semibold text-[#EDEDED]">{title}</h3>
        <p className="text-[13px]" style={{ color: "#888888" }}>{description}</p>
      </div>
    </div>
  );
}
