import type { ReactNode } from "react";

/** Serializable account data deliberately excludes passwords, tokens, and timestamps. */
export interface SafeUser {
  id: string;
  email: string;
  name: string | null;
  imageUrl: string | null;
}

export interface AuthenticatedAppShellProps {
  children: ReactNode;
  user: SafeUser;
}
