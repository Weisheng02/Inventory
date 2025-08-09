/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f3ff',
          100: '#efe9ff',
          200: '#e4d6ff',
          300: '#d3b9ff',
          400: '#b58cff',
          500: '#9f70ff',
          600: '#8053e6',
          700: '#673dc1',
          800: '#5633a3',
          900: '#472c85',
        },
        mint: {
          100: '#e9fff6',
          300: '#b9f3dd',
          500: '#6ee7c6',
        },
        sky: {
          100: '#e6f6ff',
          300: '#b9e6ff',
          500: '#7cd4ff',
        },
        rose: {
          100: '#ffeaf1',
          300: '#ffc2d6',
          500: '#ff8fb3',
        },
      },
      boxShadow: {
        soft: '0 8px 24px rgba(0,0,0,0.08)',
        glass: '0 10px 30px rgba(31, 38, 135, 0.12)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        candy: {
          primary: '#9f70ff',
          secondary: '#6ee7c6',
          accent: '#7cd4ff',
          neutral: '#2b3440',
          'base-100': '#f9fbff',
          info: '#93c5fd',
          success: '#86efac',
          warning: '#fde68a',
          error: '#fca5a5',
        },
      },
      'pastel',
    ],
  },
};


