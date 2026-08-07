import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import {  Inter, Manrope } from 'next/font/google';
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

const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope' });

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Expense AI - Smart Financial Tracker',
  description:
    'AI-powered expense tracking with intelligent insights, smart categorization, and personalized financial recommendations',
  icons: {
    icon: [{ url: '/favicon.png?v=15', type: 'image/png', sizes: '512x512' }],
    apple: [{ url: '/favicon.png?v=15', sizes: '512x512' }],
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
      suppressHydrationWarning className={cn("dark", manrope.variable)}
    >
      <head>
        <meta name='theme-color' content={THEME_COLORS.light} />
        <link rel='manifest' href='/manifest.json' />
        <link rel='icon' type='image/png' sizes='512x512' href='/favicon.png?v=14' />
        <link rel='apple-touch-icon' sizes='512x512' href='/favicon.png?v=14' />
        <meta name='application-name' content='Expense AI' />
        <meta name='mobile-web-app-capable' content='yes' />
        <meta name='apple-mobile-web-app-capable' content='yes' />
        <meta name='apple-mobile-web-app-status-bar-style' content='black-translucent' />
        <meta name='apple-mobile-web-app-title' content='Expense AI' />
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: PREFERENCES_BOOTSTRAP_SCRIPT }}
        />
      </head>
      <body className={`${inter.variable} ${manrope.variable} antialiased`}>
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
