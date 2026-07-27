# Expense AI - Development Context

## Project Overview
- **App**: Expense AI - AI-powered expense tracker
- **Stack**: Next.js, Prisma, PostgreSQL, Tailwind CSS, motion/react
- **Theme**: Dark glassmorphism with cyan (#00DCE5) primary accent
- **Design Language**: Premium, minimal, Linear/Vercel-inspired

---

## Completed Work

### 1. Landing Page (`world-class-landing.tsx`)
- **Navbar**: Dark glassmorphism (`bg-[#0B0F14]/60 backdrop-blur-xl`), clean nav links, CTA buttons
- **Hero**: Animated SVG shapes, parallax text, glassmorphic dashboard preview with animated bar chart
- **Features**: Bento grid layout with asymmetric cards, glow effects on hover
- **Footer**: Minimal dark theme, 4-column grid, subtle cyan gradient accent

### 2. Logo & Favicon
- **Design**: Abstract upward chart line with ascending bars
- **Colors**: Cyan (#00DCE5) on dark (#0B0F14)
- **Files**: `public/favicon.svg`, `public/icon.svg`
- **Usage**: Header, sidebar, footer, browser tab

### 3. Features Page (`/features`)
- **Structure**: Hero → Core Features Bento Grid → Advanced Tools → Stats → FAQ → CTA
- **Core Features**: 6 items (Smart Analytics featured with mini chart)
- **Advanced Features**: 6 items (Forecasts, Anomaly Detection, Search, Export, Recurring, Goals)
- **Stats**: 10K+ transactions, 99.9% uptime, 4.9/5 rating, 100% free
- **FAQ**: 5 expandable questions with smooth animations

### 4. About Page (`/about`)
- **Hero**: Large editorial headline "We believe finance should be clear"
- **Stats**: Large numbers (5xl/6xl), uppercase tracking labels
- **Story**: Split layout - founder narrative left, 3-step process right
- **Principles**: 6 values in grid with subtle dividers
- **CTA**: Clean "Start with clarity"

### 5. Contact Page (`/contact`)
- **Hero**: Large headline "Get in touch" with clean subtext
- **Contact Options**: 3 large cards (Email, Phone, Support Hours) with icons and glow effects
- **Quick Links**: 4 resource cards (FAQ, AI Transparency, Privacy, Features)
- **CTA**: Clean "Ready to get started?" with signup link

### 6. Auth Pages (Sign-in / Sign-up)
- **Layout**: Split screen — form left, branding right (hidden on mobile)
- **Background**: Animated gradient orbs on dark (#0B0F14)
- **Form Card**: Max-width 400px, clean glassmorphic styling
- **Branding Side**: Features list + stats (10K+ transactions, 99.9% uptime, 100% free)
- **Input Fields**: Dark background, cyan focus ring, inline password toggle
- **Submit Button**: Cyan with glow hover effect and loading spinner
- **Footer Links**: Sign in | Create account | Reset password
- **Bug Fix**: Removed `AuthenticationShell` wrapper from `app/(auth)/layout.tsx` that was overriding the custom dark theme with light-themed card layout

### 7. Dashboard Charts Fix
- **Issue**: Income & Spending area/bar chart gradients were being overwritten by `applyChartTheme`
- **Root Cause**: `applyChartTheme` was replacing gradient functions with solid CSS variable colors
- **Fix**: Check if `backgroundColor`, `borderColor`, `pointBackgroundColor` are functions before overriding
- **Additional Fix**: Use callback ref with `requestAnimationFrame` to apply theme after chart mounts when switching between area/bar views
- **Category Breakdown Fix**: Applied same callback ref pattern to resolve CSS variables for doughnut chart colors

---

## Design System

### Colors
```
Background:    #0B0F14 (primary), #080C10 (alternating sections)
Accent:        #00DCE5 (cyan - primary)
Secondary:     #A855F7 (purple)
Success:       #22C55E (green)
Warning:       #FBBF24 (yellow)
Error:         #F04438 (red)
Info:          #3B82F6 (blue)
Text:          #FFFFFF (headings), #9AA3AF (body)
Borders:       white/[0.06] (default), white/[0.12] (hover)
```

### Components
- **Cards**: `bg-white/[0.02] border-white/[0.06] rounded-2xl`
- **Hover**: `hover:bg-white/[0.04] hover:border-white/[0.12]`
- **Glow**: `hover:shadow-[0_0_40px_rgba(0,220,229,0.06)]`
- **Buttons**: Cyan primary, ghost secondary, glassmorphic tertiary

### Animation Pattern
```tsx
function AnimateInView({ children, className, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

---

## File Locations

### Pages
- Landing: `app/page.tsx` → `components/patterns/world-class-landing.tsx`
- Features: `app/(public)/features/page.tsx`
- About: `app/(public)/about/page.tsx`
- Contact: `app/(public)/contact/page.tsx`
- Privacy: `app/(public)/privacy/page.tsx`

### Components
- Public Header: `components/patterns/PublicHeader.tsx`
- Public Footer: `components/patterns/PublicFooter.tsx`
- Shared Pages: `components/patterns/public-pages.tsx`
- Navigation: `components/patterns/public-navigation.ts`
- Auth Form: `components/patterns/authentication-form.tsx`

### Assets
- Favicon: `public/favicon.svg`
- Icon: `public/icon.svg`

---

## Key Decisions

1. **Import**: Use `motion/react` not `framer-motion`
2. **Fonts**: Geist (body), Plus Jakarta Sans (headings)
3. **Dark Mode**: Always dark, no light mode toggle for public pages
4. **Animations**: Staggered entrance, hover lift/scale, glow effects
5. **Glassmorphism**: `backdrop-blur-xl` with low-opacity backgrounds

---

## Next Steps (Potential)

- [ ] Privacy page redesign
- [ ] AI Transparency page redesign
- [ ] Forgot Password page redesign
- [ ] Dashboard polish
- [ ] Mobile responsiveness audit

---

## Build Status
- ✅ All pages compile successfully
- ✅ No TypeScript errors
- ✅ Warnings only (img element usage - acceptable)

---

*Last updated: Current session*
