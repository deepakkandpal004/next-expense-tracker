import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AuthenticatedAppShell } from '@/components/patterns/authenticated-app-shell';

function ShellFallback() {
  return <div className="flex min-h-[100dvh] items-center justify-center bg-bg text-foreground">Loading…</div>;
}

export default async function AuthenticatedAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const hasToken = cookieStore.has('access_token') || cookieStore.has('refresh_token');
  if (!hasToken) redirect('/sign-in');

  return (
    <Suspense fallback={<ShellFallback />}>
      <AuthenticatedAppShell>{children}</AuthenticatedAppShell>
    </Suspense>
  );
}