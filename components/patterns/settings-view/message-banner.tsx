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
    <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${
      message.type === "success" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
    }`}>
      {message.type === "success" ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
      <span>{message.text}</span>
      <button onClick={onDismiss} className="ml-auto opacity-60 hover:opacity-100">
        <X size={14} />
      </button>
    </div>
  );
}