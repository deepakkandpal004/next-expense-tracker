import { User } from "lucide-react";
import { Field } from "@/src/common/ui";

export function ProfileForm({
  name,
  email,
  onNameChange,
}: {
  name: string;
  email: string;
  onNameChange: (value: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-muted text-primary">
          <User size={18} />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">Profile</h2>
          <p className="text-xs text-muted-foreground">Your name and email</p>
        </div>
      </div>
      <div className="grid gap-4">
        <Field
          id="settings-name"
          label="Name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
        />
        <Field
          id="settings-email"
          label="Email"
          value={email}
          disabled
          description="Email cannot be changed."
        />
      </div>
    </div>
  );
}
