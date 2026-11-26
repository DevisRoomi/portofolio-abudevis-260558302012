import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'canvas-bg': '#0C1446',
        'midnight-blue': '#0C1446',
        'soft-indigo': '#2B5C92',
        'ice-blue': '#B3CDE0',
        surface: '#101a52',
        elevated: '#1a2a6b',
        'border-subtle': '#2B5C92',
        'border-strong': '#4678b8',
        'text-primary': '#FFFFFF',
        'text-secondary': '#B3CDE0',
        'text-muted': '#7e9db8',
        crimson: '#e63946',
        'crimson-hover': '#ff4d5a',
        'crimson-subtle': 'rgba(230, 57, 70, 0.15)',
      },
      fontFamily: {
        bebas: ['"Bebas Neue"', 'sans-serif'],
        anton: ['Anton', 'sans-serif'],
        instrument: ['"Instrument Serif"', '"Cormorant Garamond"', 'Georgia', 'serif'],
        serif: ['"Instrument Serif"', '"Cormorant Garamond"', 'Georgia', 'serif'],
        italiana: ['Italiana', 'serif'],
        display: ['Syne', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config;
