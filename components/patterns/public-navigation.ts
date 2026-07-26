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

export const SUPPORT_EMAIL = 'dkandpal757@gmail.com';
export const SUPPORT_PHONE = '+919123495043';
export const SUPPORT_PHONE_LABEL = '+91 91234 95043';
export const SUPPORT_HOURS = 'Monday–Friday, 9:00 AM–6:00 PM Pacific Standard Time (UTC−08:00)';
