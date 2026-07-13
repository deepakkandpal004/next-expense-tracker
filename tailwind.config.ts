import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class', // 👈 REQUIRED
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          deep: '#0b132b',
          dark: '#1c2541',
          muted: '#3a506b',
          cyan: '#5bc0be',
        }
      }
    },
  },
  plugins: [],
};

export default config;