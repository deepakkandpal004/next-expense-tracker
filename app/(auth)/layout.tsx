import type { ReactNode } from 'react';
import { AuthenticationShell } from '@/components/patterns/authentication-shell';

export default function AuthenticationLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <AuthenticationShell>{children}</AuthenticationShell>;
}
