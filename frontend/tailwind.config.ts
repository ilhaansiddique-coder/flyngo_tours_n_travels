import type { Config } from 'tailwindcss';

/* Tailwind v4 is the source of truth for theme tokens (see `globals.css`
 * `@theme inline` block). The values below keep `bg-brand-*`, `bg-surface-*`
 * and the shared `on-*` / `outline-*` / `inverse-*` utility families
 * aligned with the Fly&Go Velocity theme — Fly blue + Go orange + cyan —
 * so admin pages that haven't migrated to CSS variables still render in
 * the same brand palette as the public site. */
const config: Config = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#e6f1ff',
          100: '#cce4ff',
          200: '#99c9ff',
          300: '#66adff',
          400: '#3392ff',
          500: '#1881ff',
          600: '#0c6fdf',
          700: '#095ab3',
          800: '#064487',
          900: '#042e5b',
          950: '#021935',
        },
        surface: {
          DEFAULT:    '#020617',
          'bright':   '#0b1c30',
          'container':        '#0a1628',
          'container-low':    '#07111f',
          'container-lowest': '#010410',
          'container-high':   '#102034',
          'container-highest':'#1b2b3f',
          'variant':          '#1b2b3f',
          'dim':              '#010410',
        },
        secondary: {
          DEFAULT:       '#00eefc',
          'fixed-dim':   '#00b8c4',
          fixed:         '#7df4ff',
          container:     '#cffafd',
        },
        on: {
          surface:                    '#d3e4fe',
          'surface-variant':          '#9aa3b2',
          background:                 '#d3e4fe',
          primary:                    '#020617',
          'primary-container':        '#00eefc',
          'primary-fixed':            '#1a1c1c',
          'primary-fixed-variant':    '#454747',
          secondary:                  '#020617',
          'secondary-container':      '#00eefc',
          'secondary-fixed':          '#002022',
          'secondary-fixed-variant':  '#004f54',
          tertiary:                   '#020617',
          'tertiary-container':       '#fde0d0',
          'tertiary-fixed':           '#1c1b1b',
          'tertiary-fixed-variant':   '#474646',
          error:                      '#ffb4ab',
          'error-container':          '#ffdad6',
        },
        outline: {
          DEFAULT: '#5fa9ff',
          variant: 'rgba(255, 255, 255, 0.12)',
        },
        error: {
          DEFAULT:  '#ff6b6b',
          container:'rgba(255, 107, 107, 0.12)',
        },
        inverse: {
          surface:     '#d3e4fe',
          primary:     '#5d5f5f',
          'on-surface':'#020617',
        },
      },
      spacing: {
        'margin-mobile': '16px',
        'gutter': '24px',
        'margin-desktop': '64px',
        'unit': '4px',
        'max-width': '1440px',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'serif'],
      },
      fontSize: {
        'headline-xl': ['60px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-lg': ['48px', { lineHeight: '1.2', fontWeight: '600' }],
        'headline-md': ['32px', { lineHeight: '1.3', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'label-md': ['14px', { lineHeight: '1', letterSpacing: '0.05em', fontWeight: '600' }],
        'label-sm': ['12px', { lineHeight: '1', fontWeight: '500' }],
      },
      borderRadius: {
        DEFAULT: '0.125rem',
        lg: '0.25rem',
        xl: '0.5rem',
        full: '0.75rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-in-up': 'fadeInUp 0.8s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
