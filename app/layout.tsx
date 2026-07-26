import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Plus_Jakarta_Sans, Geist } from 'next/font/google';
import './globals.css';
import { RootProviders } from '@/app/providers';
import {
  APPEARANCE_COOKIE_NAME,
  DENSITY_COOKIE_NAME,
  PREFERENCES_BOOTSTRAP_SCRIPT,
  THEME_COLORS,
  isAppearancePreference,
  isContentDensity,
} from '@/lib/preferences/preferences';
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });

const plusJakarta = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Expense AI - Smart Financial Tracker',
  description:
    'AI-powered expense tracking with intelligent insights, smart categorization, and personalized financial recommendations',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: { url: '/icon.svg', type: 'image/svg+xml' },
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

  return (
    <html
      lang='en'
      data-appearance-preference={initialAppearance}
      data-density={initialDensity}
      suppressHydrationWarning className={cn("dark", geist.variable)}
    >
      <head>
        <meta name='theme-color' content={THEME_COLORS.light} />
        <link rel='manifest' href='/manifest.json' />
        <meta name='application-name' content='Expense AI' />
        <meta name='apple-mobile-web-app-capable' content='yes' />
        <meta name='apple-mobile-web-app-status-bar-style' content='black-translucent' />
        <meta name='apple-mobile-web-app-title' content='Expense AI' />
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: PREFERENCES_BOOTSTRAP_SCRIPT }}
        />
      </head>
      <body className={`${plusJakarta.variable} ${geist.variable} antialiased`}>
        <a
          className='sr-only fixed left-4 top-4 z-50 rounded-control bg-primary px-4 py-2 font-semibold text-primary-foreground focus:not-sr-only focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus'
          href='#main-content'
        >
          Skip to main content
        </a>
        <RootProviders
          initialAppearance={initialAppearance}
          initialDensity={initialDensity}
        >
          <main id='main-content' tabIndex={-1}>
            {children}
          </main>
        </RootProviders>
      </body>
    </html>
  );
}