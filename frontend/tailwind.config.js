/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Tikēt brand
        tiket: {
          green: '#1A6B3A',
          'green-dark': '#0F4D27',
          'green-light': '#22C55E',
          gold: '#D4A33B',
          'gold-bright': '#FBBF24',
          red: '#DC2626',
          cream: '#FAF7F0',
          'warm-cream': '#F4F1EA',
        },
        // Neutrals
        ink: {
          50: '#F9FAFB',
          100: '#E5E7EB',
          500: '#6B7280',
          900: '#0E1411',
        },
        // Payment brands
        telebirr: {
          DEFAULT: '#1B3A8C',
          end: '#2563EB',
        },
        // Rail
        rail: {
          DEFAULT: '#1E3A8A',
          accent: '#FBBF24',
        },
        // States
        ok: '#10B981',
        warn: '#F59E0B',
        err: '#EF4444',
        info: '#3B82F6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        ethiopic: ['"Noto Sans Ethiopic"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      animation: {
        'tk-pulse': 'tk-pulse 1.4s ease-in-out infinite',
        'tk-flash-in': 'tk-flash-in 200ms ease-out',
        'tk-pop': 'tk-pop 360ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        'tk-shine': 'tk-shine 2.5s linear infinite',
        'tk-sweep': 'tk-sweep 1.6s ease-in-out infinite alternate',
        'tk-sheet-up': 'tk-sheet-up 240ms cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        'tk-pulse': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(0.92)' },
        },
        'tk-flash-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'tk-pop': {
          '0%': { transform: 'scale(0.7)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'tk-shine': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'tk-sweep': {
          '0%': { top: '20%' },
          '100%': { top: '80%' },
        },
        'tk-sheet-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
