/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#071524', 900: '#0D2137', 800: '#122840',
          700: '#1a3a55', 600: '#234e70',
        },
        brand: { DEFAULT: '#1E6FB5', light: '#2B7EC7', muted: '#4B96D4' },
        surface: { DEFAULT: '#F5F7FA', subtle: '#F8FAFC', card: '#FFFFFF' },
        ink: { DEFAULT: '#111827', secondary: '#64748B', muted: '#94A3B8' },
        line: { DEFAULT: '#E5EAF0', strong: '#CBD5E1' },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        card:      '0 1px 3px rgba(13,33,55,0.06), 0 1px 2px rgba(13,33,55,0.04)',
        'card-md': '0 4px 16px rgba(13,33,55,0.08), 0 2px 4px rgba(13,33,55,0.04)',
        'card-lg': '0 8px 32px rgba(13,33,55,0.10), 0 2px 8px rgba(13,33,55,0.05)',
        'card-xl': '0 16px 48px rgba(13,33,55,0.12), 0 4px 12px rgba(13,33,55,0.06)',
      },
      borderRadius: { '2.5xl': '20px', '3xl': '24px', '4xl': '28px' },
      animation: {
        'fade-in':  'fadeIn 0.2s ease',
        'slide-up': 'slideUp 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        'spin-ai':  'spin 0.8s linear infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { transform: 'translateY(10px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
      },
    },
  },
  plugins: [],
};