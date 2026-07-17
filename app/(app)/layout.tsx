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
    redirect('/sign-in');
  }

  const safeUser: SafeUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    imageUrl: user.imageUrl,
  };

  return <AuthenticatedAppShell user={safeUser}>{children}</AuthenticatedAppShell>;
}
