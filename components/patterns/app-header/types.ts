import type { SafeUser } from "../authenticated-app-shell";

export interface AppHeaderProps {
  user: SafeUser;
  onMobileMenuOpen: () => void;
  onSignOut: () => void;
  signingOut: boolean;
  accountError: string | null;
}