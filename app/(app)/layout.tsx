import { redirect } from 'next/navigation';
import { AuthenticatedAppShell, type SafeUser } from '@/components/patterns/authenticated-app-shell';
import { getAuthUser } from '@/lib/auth';

export default async function AuthenticatedAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getAuthUser();

  if (!user) {
    // Route through the session-clearing handler so the stale cookie is
    // removed before /sign-in renders; otherwise middleware bounces the
    // request back to /dashboard in an infinite redirect loop.
    redirect('/api/auth/clear-session');
  }

  const safeUser: SafeUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    imageUrl: user.imageUrl,
  };

  return <AuthenticatedAppShell user={safeUser}>{children}</AuthenticatedAppShell>;
}
