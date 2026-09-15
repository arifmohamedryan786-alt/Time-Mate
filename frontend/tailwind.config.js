/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        warm: {
          50: '#FDFBF7',
          100: '#F7F2EB',
          200: '#EAE0D3',
          300: '#D6C3B0',
          400: '#BC9D84',
          500: '#8C5638', // Primary Warm Brown Accent
          600: '#75432B',
          700: '#5C3320',
          800: '#422416',
          900: '#2C170D',
        },
        surface: {
          bg: '#FAFAF8',      // Soft off-white
          card: '#FFFFFF',    // Clean white card background
          border: '#E8DFD8',  // Subtle warm border
          hover: '#F5EBE6',   // Soft warm cream hover
        },
        slate: {
          950: '#0F172A',
          900: '#1E293B',
          800: '#334155',
          700: '#475569',
          600: '#64748B',
          500: '#94A3B8',
          400: '#CBD5E1',
          300: '#E2E8F0',
          200: '#F1F5F9',
          100: '#F8FAFC',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.02)',
        card: '0 4px 6px -1px rgba(140, 86, 56, 0.04), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
        dropdown: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
      }
    },
  },
  plugins: [],
}
