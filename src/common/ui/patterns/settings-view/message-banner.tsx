import { AlertTriangle, CheckCircle2, X } from "lucide-react";

export interface SettingsMessage {
  type: "success" | "error";
  text: string;
}

export function MessageBanner({
  message,
  onDismiss,
}: {
  message: SettingsMessage;
  onDismiss: () => void;
}) {
  return (
    <div className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs ${
      message.type === "success" ? "bg-success-surface text-success" : "bg-danger-surface text-danger"
    }`}>
      {message.type === "success" ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
      <span>{message.text}</span>
      <button type="button" onClick={onDismiss} aria-label="Dismiss" className="ml-auto flex items-center opacity-60 transition-opacity hover:opacity-100">
        <X size={14} />
      </button>
    </div>
  );
}