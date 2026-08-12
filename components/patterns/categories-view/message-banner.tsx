import { AlertTriangle, X } from "lucide-react";

export function MessageBanner({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-info/10 px-3 py-2 text-xs text-info">
      <AlertTriangle size={14} />
      <span>{message}</span>
      <button onClick={onDismiss} className="ml-auto text-info/60 hover:text-info">
        <X size={14} />
      </button>
    </div>
  );
}
