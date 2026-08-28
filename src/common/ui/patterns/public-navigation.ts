export interface PublicNavigationItem {
  id: string;
  label: string;
  href: string;
}

/** The ordered public destinations shared by wide and compact navigation. */
export const PUBLIC_NAVIGATION: readonly PublicNavigationItem[] = [
  { id: 'home', label: 'Home', href: '/' },
  { id: 'features', label: 'Features', href: '/features' },
  { id: 'about', label: 'About', href: '/about' },
  { id: 'contact', label: 'Contact', href: '/contact' },
] as const;

export const PUBLIC_DISCLOSURE_NAVIGATION: readonly PublicNavigationItem[] = [
  { id: 'privacy', label: 'Privacy', href: '/privacy' },
  { id: 'ai-transparency', label: 'AI transparency', href: '/ai-transparency' },
] as const;

export const SUPPORT_EMAIL = 'deepakkandpal.tech@gmail.com';
export const SUPPORT_EMAIL_ALT = 'deepakkandpal.work@gmail.com';
