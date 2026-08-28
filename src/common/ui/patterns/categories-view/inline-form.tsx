import { Button } from "@/src/common/ui";
import type { CategoryFormProps } from "./types";

export function InlineForm({
  value,
  onChange,
  onSave,
  onCancel,
  saveLabel,
  placeholder,
}: CategoryFormProps) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-surface p-3">
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 rounded-lg border border-border/50 bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
        onKeyDown={e => e.key === "Enter" && onSave()}
      />
      <Button label={saveLabel} onClick={onSave} />
      <Button intent="ghost" label="Cancel" onClick={onCancel} />
    </div>
  );
}
