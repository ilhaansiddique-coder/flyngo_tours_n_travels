import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        surface: {
          DEFAULT: '#031427',
          'bright': '#2a3a4f',
          'container': '#102034',
          'container-low': '#0b1c30',
          'container-lowest': '#000f21',
          'container-high': '#1b2b3f',
          'container-highest': '#26364a',
          'variant': '#26364a',
          'dim': '#031427',
        },
        secondary: {
          container: '#00eefc',
          'fixed-dim': '#00dbe9',
          fixed: '#7df4ff',
          DEFAULT: '#d3fbff',
        },
        on: {
          surface: '#d3e4fe',
          'surface-variant': '#c4c7c8',
          background: '#d3e4fe',
          primary: '#2f3131',
          'primary-container': '#636565',
          'primary-fixed': '#1a1c1c',
          'primary-fixed-variant': '#454747',
          secondary: '#00363a',
          'secondary-container': '#00686f',
          'secondary-fixed': '#002022',
          'secondary-fixed-variant': '#004f54',
          tertiary: '#313030',
          'tertiary-container': '#656464',
          'tertiary-fixed': '#1c1b1b',
          'tertiary-fixed-variant': '#474646',
          error: '#690005',
          'error-container': '#ffdad6',
        },
        outline: {
          DEFAULT: '#8e9192',
          variant: '#444748',
        },
        error: {
          DEFAULT: '#ffb4ab',
          container: '#93000a',
        },
        inverse: {
          surface: '#d3e4fe',
          primary: '#5d5f5f',
          'on-surface': '#213145',
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
