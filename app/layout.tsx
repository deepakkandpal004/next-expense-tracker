import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Sora, Inter } from 'next/font/google';
import './globals.css';
import { RootProviders } from '@/app/providers';
import { getAuthUser } from '@/lib/auth';
import {
  APPEARANCE_COOKIE_NAME,
  DENSITY_COOKIE_NAME,
  PREFERENCES_BOOTSTRAP_SCRIPT,
  THEME_COLORS,
  isAppearancePreference,
  isContentDensity,
} from '@/lib/preferences/preferences';

const sora = Sora({
  variable: '--font-sora',
  subsets: ['latin'],
  weight: ['600', '700'],
  display: 'swap',
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Expense AI - Smart Financial Management',
  description:
    'AI-powered expense tracking app with intelligent insights, smart categorization, and personalized financial recommendations',
  icons: {
    icon: {
      url: '/favicon.png',
      type: 'image/png',
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const appearanceCookie = cookieStore.get(APPEARANCE_COOKIE_NAME)?.value;
  const densityCookie = cookieStore.get(DENSITY_COOKIE_NAME)?.value;
  const initialAppearance = isAppearancePreference(appearanceCookie)
    ? appearanceCookie
    : 'system';
  const initialDensity = isContentDensity(densityCookie)
    ? densityCookie
    : 'comfortable';

  // Resolve the current auth user on the server and pass a safe initial user down to the
  // client provider. This prevents a client-side fetch to /api/auth/me on every page load
  // or navigation and removes the loading flicker.
  let initialUser = undefined;
  try {
    const user = await getAuthUser();
    if (user) {
      initialUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        imageUrl: user.imageUrl,
      };
    } else {
      initialUser = null;
    }
  } catch (e) {
    // Do not block rendering if auth resolution fails; client can still refresh explicitly.
    initialUser = undefined;
  }

  return (
    <html
      lang='en'
      data-appearance-preference={initialAppearance}
      data-density={initialDensity}
      suppressHydrationWarning
    >
      <head>
        <meta name='theme-color' content={THEME_COLORS.light} />
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: PREFERENCES_BOOTSTRAP_SCRIPT }}
        />
      </head>
      <body className={`${sora.variable} ${inter.variable} antialiased`}>
        <a
          className='sr-only fixed left-4 top-4 z-50 rounded-control bg-primary px-4 py-2 font-semibold text-primary-foreground focus:not-sr-only focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus'
          href='#main-content'
        >
          Skip to main content
        </a>
        <RootProviders
          initialAppearance={initialAppearance}
          initialDensity={initialDensity}
          initialUser={initialUser}
        >
          <main id='main-content' tabIndex={-1}>
            {children}
          </main>
        </RootProviders>
      </body>
    </html>
  );
}