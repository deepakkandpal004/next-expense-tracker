import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';

export default async function AuthenticationLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const user = await getAuthUser();
  if (user) redirect('/dashboard');

  return <>{children}</>;
}
