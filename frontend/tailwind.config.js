/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        serif: ['"DM Serif Display"', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        rose: {
          50:  '#fff5f7',
          100: '#ffe4e8',
          200: '#fecdd3',
          300: '#fca5b4',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        },
      },
      keyframes: {
        fadeUp:    { from: { opacity: 0, transform: 'translateY(24px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn:    { from: { opacity: 0 }, to: { opacity: 1 } },
        slideIn:   { from: { opacity: 0, transform: 'translateX(-16px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        float:     { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        pulseRing: { '0%': { boxShadow: '0 0 0 0 rgba(244,63,94,0.4)' }, '70%': { boxShadow: '0 0 0 10px rgba(244,63,94,0)' }, '100%': { boxShadow: '0 0 0 0 rgba(244,63,94,0)' } },
        blink:     { '0%,100%': { opacity: 1 }, '50%': { opacity: 0 } },
        spin:      { to: { transform: 'rotate(360deg)' } },
      },
      animation: {
        'fade-up':    'fadeUp 0.6s ease both',
        'fade-in':    'fadeIn 0.5s ease both',
        'slide-in':   'slideIn 0.4s ease both',
        'float':      'float 4s ease-in-out infinite',
        'pulse-ring': 'pulseRing 2s ease-in-out infinite',
        'blink':      'blink 1s step-end infinite',
      },
    },
  },
  plugins: [],
}
