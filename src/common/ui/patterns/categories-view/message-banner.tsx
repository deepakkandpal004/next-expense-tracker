import { AlertTriangle, X } from "lucide-react";

export function MessageBanner({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-info-surface px-3 py-2 text-xs text-info">
      <AlertTriangle size={14} />
      <span>{message}</span>
      <button aria-label="Dismiss" onClick={onDismiss} className="ml-auto text-info opacity-60 hover:opacity-100">
        <X size={14} />
      </button>
    </div>
  );
}
