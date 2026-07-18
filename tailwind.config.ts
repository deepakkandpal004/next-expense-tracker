import tailwindcssAnimate from 'tailwindcss-animate';
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class', // 👈 REQUIRED
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        sora: ['var(--font-sora)', 'sans-serif'],
      },
      colors: {
        // shadcn/ui semantic aliases
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
        },
        input: 'var(--input)',
        ring: 'var(--ring)',
        chart: {
          1: 'var(--chart-1)',
          2: 'var(--chart-2)',
          3: 'var(--chart-3)',
          4: 'var(--chart-4)',
          5: 'var(--chart-5)',
        },
        // Project-specific semantic tokens
        canvas: 'var(--color-bg)',
        surface: {
          DEFAULT: 'var(--color-surface)',
          subtle: 'var(--color-surface-subtle)',
          raised: 'var(--color-surface-raised)',
        },
        'foreground-inverse': 'var(--color-text-inverse)',
        border: {
          DEFAULT: 'var(--color-border)',
          strong: 'var(--color-border-strong)',
        },
        focus: 'var(--color-focus)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        info: {
          DEFAULT: 'var(--color-info)',
          foreground: 'var(--color-info-foreground)',
          surface: 'var(--color-info-surface)',
          border: 'var(--color-info-border)',
        },
        success: {
          DEFAULT: 'var(--color-success)',
          foreground: 'var(--color-success-foreground)',
          surface: 'var(--color-success-surface)',
          border: 'var(--color-success-border)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          foreground: 'var(--color-warning-foreground)',
          surface: 'var(--color-warning-surface)',
          border: 'var(--color-warning-border)',
        },
        danger: {
          DEFAULT: 'var(--color-danger)',
          foreground: 'var(--color-danger-foreground)',
          surface: 'var(--color-danger-surface)',
          border: 'var(--color-danger-border)',
        },
        'accent-surface': 'var(--color-accent-surface)',
        'accent-border': 'var(--color-accent-border)',
        kpi: {
          balance: {
            DEFAULT: 'var(--color-kpi-balance)',
            surface: 'var(--color-kpi-balance-surface)',
            foreground: 'var(--color-kpi-balance-foreground)',
          },
          income: {
            DEFAULT: 'var(--color-kpi-income)',
            surface: 'var(--color-kpi-income-surface)',
            foreground: 'var(--color-kpi-income-foreground)',
          },
          expense: {
            DEFAULT: 'var(--color-kpi-expense)',
            surface: 'var(--color-kpi-expense-surface)',
            foreground: 'var(--color-kpi-expense-foreground)',
          },
          savings: {
            DEFAULT: 'var(--color-kpi-savings)',
            surface: 'var(--color-kpi-savings-surface)',
            foreground: 'var(--color-kpi-savings-foreground)',
          },
        },
        trend: {
          up: {
            DEFAULT: 'var(--color-trend-up)',
            foreground: 'var(--color-trend-up-foreground)',
            surface: 'var(--color-trend-up-surface)',
          },
          down: {
            DEFAULT: 'var(--color-trend-down)',
            foreground: 'var(--color-trend-down-foreground)',
            surface: 'var(--color-trend-down-surface)',
          },
        },
        // Merged sidebar: shadcn aliases + project-specific tokens
        sidebar: {
          DEFAULT: 'var(--sidebar)',
          foreground: 'var(--sidebar-foreground)',
          primary: 'var(--sidebar-primary)',
          'primary-foreground': 'var(--sidebar-primary-foreground)',
          accent: 'var(--sidebar-accent)',
          'accent-foreground': 'var(--sidebar-accent-foreground)',
          border: 'var(--sidebar-border)',
          ring: 'var(--sidebar-ring)',
          bg: 'var(--color-sidebar-bg)',
          'bg-end': 'var(--color-sidebar-bg-end)',
          'foreground-muted': 'var(--color-sidebar-foreground-muted)',
          'item-hover': 'var(--color-sidebar-item-hover)',
          'item-active-bg': 'var(--color-sidebar-item-active-bg)',
          'item-active-foreground': 'var(--color-sidebar-item-active-foreground)',
        },
        // Compatibility aliases while route components migrate to semantic roles.
        theme: {
          deep: 'var(--color-bg)',
          dark: 'var(--color-surface)',
          muted: 'var(--color-text-muted)',
          cyan: 'var(--color-primary)',
        },
      },
      spacing: {
        'token-0': 'var(--space-0)',
        'token-1': 'var(--space-1)',
        'token-2': 'var(--space-2)',
        'token-3': 'var(--space-3)',
        'token-4': 'var(--space-4)',
        'token-6': 'var(--space-6)',
        'token-8': 'var(--space-8)',
        'token-12': 'var(--space-12)',
        'token-16': 'var(--space-16)',
      },
      borderRadius: {
        square: 'var(--radius-square)',
        control: 'var(--radius-control)',
        container: 'var(--radius-container)',
        circular: 'var(--radius-circular)',
        'premium-sm': 'calc(var(--radius-container) - 4px)',
        premium: 'var(--radius-container)',
        'premium-lg': 'calc(var(--radius-container) + 8px)',
        'premium-xl': 'calc(var(--radius-container) + 16px)',
        'premium-2xl': 'calc(var(--radius-container) + 24px)',
      },
      boxShadow: {
        flat: 'var(--elevation-flat)',
        raised: 'var(--elevation-raised)',
        overlay: 'var(--elevation-overlay)',
        'premium-sm': '0 1px 2px rgb(15 23 42 / 0.05), 0 4px 8px rgb(15 23 42 / 0.04)',
        premium: '0 2px 4px rgb(15 23 42 / 0.06), 0 8px 16px rgb(15 23 42 / 0.06)',
        'premium-lg': '0 4px 8px rgb(15 23 42 / 0.08), 0 16px 32px rgb(15 23 42 / 0.08)',
        'premium-xl': '0 8px 16px rgb(15 23 42 / 0.1), 0 24px 48px rgb(15 23 42 / 0.12)',
        'glow-primary': '0 0 0 1px var(--color-primary), 0 8px 32px var(--color-primary) / 0.3',
        'glow-accent': '0 0 0 1px var(--color-accent), 0 8px 32px var(--color-accent) / 0.3',
        'glow-success': '0 0 0 1px var(--color-success), 0 8px 32px var(--color-success) / 0.3',
        'glow-warning': '0 0 0 1px var(--color-warning), 0 8px 32px var(--color-warning) / 0.3',
        'glow-danger': '0 0 0 1px var(--color-danger), 0 8px 32px var(--color-danger) / 0.3',
      },
      fontSize: {
        'interface-xs': ['var(--font-size-label)', { lineHeight: 'var(--line-height-label)' }],
        'interface-sm': ['var(--font-size-body)', { lineHeight: 'var(--line-height-body)' }],
        'interface-md': ['var(--font-size-lead)', { lineHeight: 'var(--line-height-lead)' }],
        'display-sm': ['var(--font-size-heading-sm)', { lineHeight: 'var(--line-height-heading-sm)' }],
        'display-md': ['var(--font-size-heading-md)', { lineHeight: 'var(--line-height-heading-md)' }],
        'display-lg': ['var(--font-size-heading-lg)', { lineHeight: 'var(--line-height-heading-lg)' }],
        'display-hero': ['clamp(2.5rem, 5vw, 4.5rem)', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-xl': ['clamp(2rem, 3.5vw, 3.5rem)', { lineHeight: '1.15', letterSpacing: '-0.015em', fontWeight: '700' }],
        'display-2xl': ['clamp(1.75rem, 3vw, 2.5rem)', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
        'display-3xl': ['clamp(1.5rem, 2.5vw, 2rem)', { lineHeight: '1.25', fontWeight: '600' }],
        'display-4xl': ['clamp(1.25rem, 2vw, 1.5rem)', { lineHeight: '1.3', fontWeight: '600' }],
        lead: ['var(--font-size-lead)', { lineHeight: 'var(--line-height-lead)' }],
        body: ['var(--font-size-body)', { lineHeight: 'var(--line-height-body)' }],
        label: ['var(--font-size-label)', { lineHeight: 'var(--line-height-label)', fontWeight: '500' }],
        caption: ['0.8125rem', { lineHeight: '1.25rem' }],
        'caption-strong': ['0.8125rem', { lineHeight: '1.25rem', fontWeight: '600' }],
      },
      maxWidth: {
        '7xl': 'var(--content-frame-max)',
        frame: 'var(--content-frame-max)',
      },
      backgroundImage: {
        'sidebar-gradient':
          'linear-gradient(180deg, var(--color-sidebar-bg) 0%, var(--color-sidebar-bg-end) 100%)',
        'accent-gradient':
          'linear-gradient(135deg, var(--color-accent) 0%, var(--color-kpi-savings) 100%)',
        'gradient-hero': 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-kpi-balance) 50%, var(--color-kpi-savings) 100%)',
        'gradient-hero-warm': 'linear-gradient(135deg, var(--color-kpi-income) 0%, var(--color-warning) 50%, var(--color-kpi-expense) 100%)',
        'gradient-hero-cool': 'linear-gradient(135deg, var(--color-info) 0%, var(--color-primary) 50%, var(--color-kpi-savings) 100%)',
        'gradient-accent': 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-kpi-savings) 100%)',
        'gradient-surface-warm': 'linear-gradient(145deg, var(--color-kpi-income-surface) 0%, var(--color-warning-surface) 100%)',
        'gradient-surface-cool': 'linear-gradient(145deg, var(--color-kpi-balance-surface) 0%, var(--color-kpi-savings-surface) 100%)',
        'shimmer-premium': 'linear-gradient(90deg, var(--color-surface-subtle) 25%, var(--color-surface-raised) 50%, var(--color-surface-subtle) 75%)',
      },
      animation: {
        'fade-in-up': 'fade-in-up var(--motion-duration-slow) var(--motion-ease-emphasized) forwards',
        'fade-in-down': 'fade-in-down var(--motion-duration-slow) var(--motion-ease-emphasized) forwards',
        'scale-in': 'scale-in var(--motion-duration-standard) var(--motion-ease-emphasized) forwards',
        'slide-in-right': 'slide-in-right var(--motion-duration-standard) var(--motion-ease-emphasized) forwards',
        'slide-in-left': 'slide-in-left var(--motion-duration-standard) var(--motion-ease-emphasized) forwards',
        'shimmer-premium': 'shimmer-premium 1.8s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'number-count': 'number-count var(--motion-duration-emphasized) var(--motion-ease-emphasized) forwards',
        'progress-fill': 'progress-fill var(--motion-duration-emphasized) var(--motion-ease-emphasized) forwards',
        'icon-bounce': 'icon-bounce 0.4s var(--motion-ease-emphasized)',
        'icon-spin-in': 'icon-spin-in 0.5s var(--motion-ease-emphasized)',
        'border-glow': 'border-glow 2s ease-in-out infinite',
      },
      keyframes: {
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-down': {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(16px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-left': {
          from: { opacity: '0', transform: 'translateX(-16px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'shimmer-premium': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 var(--color-primary) / 0.4' },
          '50%': { boxShadow: '0 0 0 12px var(--color-primary) / 0' },
        },
        'number-count': {
          from: { opacity: '0', transform: 'translateY(0.5rem)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'progress-fill': {
          from: { width: '0%' },
          to: { width: 'var(--progress-width)' },
        },
        'icon-bounce': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
        },
        'icon-spin-in': {
          from: { opacity: '0', transform: 'rotate(-180deg) scale(0.5)' },
          to: { opacity: '1', transform: 'rotate(0) scale(1)' },
        },
        'border-glow': {
          '0%, 100%': { borderColor: 'var(--color-border)' },
          '50%': { borderColor: 'var(--color-primary)' },
        },
      },
      transitionDuration: {
        instant: 'var(--motion-duration-fast)',
        fast: 'var(--motion-duration-standard)',
        standard: 'var(--motion-duration-slow)',
        slow: 'var(--motion-duration-emphasized)',
      },
      transitionTimingFunction: {
        standard: 'var(--motion-ease-standard)',
        emphasized: 'var(--motion-ease-emphasized)',
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;