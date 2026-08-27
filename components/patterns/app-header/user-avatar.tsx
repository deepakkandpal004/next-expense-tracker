import { LogOut, User } from "lucide-react";
import { DropdownMenu } from "@/components/ui";
import type { SafeUser } from "../authenticated-app-shell";

export function UserAvatar({
  user,
  onSignOut,
  signingOut,
}: {
  user: SafeUser;
  onSignOut: () => void;
  signingOut: boolean;
}) {
  const initial = ((user.name?.trim()[0] ?? user.email[0]) || "?").toUpperCase();
  const displayName = user.name || user.email.split("@")[0];

  return (
    <DropdownMenu
      align="end"
      label="User menu"
      trigger={
        <button
          aria-label="Open user menu"
          className="group relative inline-flex h-10 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] py-1 pl-1 pr-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          type="button"
        >
          <span className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-accent">
            {user.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt=""
                src={user.imageUrl}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-sm font-bold text-white">{initial}</span>
            )}
          </span>
          <span className="hidden max-w-28 truncate text-sm font-medium text-on-surface sm:block">{displayName}</span>
        </button>
      }
      items={[
        {
          id: "user-info",
          label: displayName,
          disabled: true,
          icon: <User size={16} />,
        },
        {
          id: "sign-out",
          label: signingOut ? "Signing out..." : "Sign out",
          icon: <LogOut size={16} />,
          destructive: true,
          disabled: signingOut,
          onSelect: onSignOut,
        },
      ]}
    />
  );
}
