import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Manrope, Outfit, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { RootProviders } from '@/app/providers';
import {
  DENSITY_COOKIE_NAME,
  PREFERENCES_BOOTSTRAP_SCRIPT,
  THEME_COLORS,
  isContentDensity,
} from '@/lib/preferences/preferences';
import { cn } from "@/lib/utils";

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Expense Tracker AI - Smart Financial Tracker',
  description:
    'AI-powered expense tracking with intelligent insights, smart categorization, and personalized financial recommendations',
  icons: {
    icon: [{ url: '/icon.png', type: 'image/png', sizes: '512x512' }],
    apple: [{ url: '/apple-touch-icon.png', sizes: '512x512' }],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const densityCookie = cookieStore.get(DENSITY_COOKIE_NAME)?.value;
  const initialDensity = isContentDensity(densityCookie)
    ? densityCookie
    : 'comfortable';

  return (
    <html
      lang='en'
      data-appearance-preference='dark'
      data-density={initialDensity}
      data-scroll-behavior='smooth'
      suppressHydrationWarning
      className={cn("dark", manrope.variable, outfit.variable, spaceGrotesk.variable)}
    >
      <head>
        <meta name='theme-color' content={THEME_COLORS.dark} />
        <link rel='manifest' href='/manifest.json' />
        <link rel='icon' type='image/png' sizes='512x512' href='/icon.png' />
        <link rel='apple-touch-icon' sizes='512x512' href='/apple-touch-icon.png' />
        <meta name='application-name' content='Expense Tracker AI' />
        <meta name='mobile-web-app-capable' content='yes' />
        <meta name='apple-mobile-web-app-status-bar-style' content='black-translucent' />
        <meta name='apple-mobile-web-app-title' content='Expense Tracker AI' />
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: PREFERENCES_BOOTSTRAP_SCRIPT }}
        />
      </head>
      <body className={`${manrope.variable} font-sans antialiased`}>
        <a
          className='sr-only fixed left-4 top-4 z-50 rounded-control bg-primary px-4 py-2 font-semibold text-primary-foreground focus:not-sr-only focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus'
          href='#main-content'
        >
          Skip to main content
        </a>
        <RootProviders
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

