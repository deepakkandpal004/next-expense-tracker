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
        canvas: 'var(--color-bg)',
        surface: {
          DEFAULT: 'var(--color-surface)',
          subtle: 'var(--color-surface-subtle)',
          raised: 'var(--color-surface-raised)',
        },
        foreground: {
          DEFAULT: 'var(--color-text)',
          secondary: 'var(--color-text-muted)',
          inverse: 'var(--color-text-inverse)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          strong: 'var(--color-border-strong)',
        },
        focus: 'var(--color-focus)',
        primary: {
          DEFAULT: 'var(--color-primary)',
          foreground: 'var(--color-on-primary)',
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
      },
      boxShadow: {
        flat: 'var(--elevation-flat)',
        raised: 'var(--elevation-raised)',
        overlay: 'var(--elevation-overlay)',
      },
      fontSize: {
        'interface-xs': ['var(--font-size-label)', { lineHeight: 'var(--line-height-label)' }],
        'interface-sm': ['var(--font-size-body)', { lineHeight: 'var(--line-height-body)' }],
        'interface-md': ['var(--font-size-lead)', { lineHeight: 'var(--line-height-lead)' }],
        'display-sm': ['var(--font-size-heading-sm)', { lineHeight: 'var(--line-height-heading-sm)' }],
        'display-md': ['var(--font-size-heading-md)', { lineHeight: 'var(--line-height-heading-md)' }],
        'display-lg': ['var(--font-size-heading-lg)', { lineHeight: 'var(--line-height-heading-lg)' }],
      },
      maxWidth: {
        '7xl': 'var(--content-frame-max)',
        frame: 'var(--content-frame-max)',
      },
    },
  },
  plugins: [],
};

export default config;