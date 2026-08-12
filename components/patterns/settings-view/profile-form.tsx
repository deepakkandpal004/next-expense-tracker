import { motion } from "motion/react";
import { User } from "lucide-react";
import { listItemVariants } from "@/lib/ui/motion";

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
    <motion.div variants={listItemVariants} className="rounded-xl border border-border/50 bg-surface p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <User size={18} />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">Profile</h2>
          <p className="text-xs text-muted-foreground">Your name and email</p>
        </div>
      </div>
      <div className="grid gap-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Name</label>
          <input
            value={name}
            onChange={e => onNameChange(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border/50 bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Email</label>
          <input
            value={email}
            disabled
            className="mt-1 w-full rounded-lg border border-border/50 bg-muted/50 px-3 py-2 text-sm text-muted-foreground outline-none cursor-not-allowed"
          />
          <p className="mt-1 text-[10px] text-muted-foreground">Email cannot be changed.</p>
        </div>
      </div>
    </motion.div>
  );
}