/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        medical: {
          canvas: '#f0f9ff',
          surface: '#ffffff',
          muted: '#64748b',
          border: '#e2e8f0',
          accent: '#0ea5e9',
          accentDeep: '#0284c7',
          teal: '#0d9488',
          mint: '#d1fae5',
          mintDeep: '#6ee7b7',
        },
        primary: {
          blue: {
            light: '#3B82F6',
            DEFAULT: '#2563EB',
            dark: '#1E40AF',
          },
          purple: {
            light: '#A855F7',
            DEFAULT: '#9333EA',
            dark: '#7E22CE',
          },
          green: {
            light: '#10B981',
            DEFAULT: '#059669',
            dark: '#047857',
          },
          teal: {
            light: '#14B8A6',
            DEFAULT: '#0D9488',
            dark: '#0F766E',
          },
        },
      },
      maxWidth: {
        '8xl': '88rem',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        glow: 'glow 2s ease-in-out infinite alternate',
        'fade-in': 'fade-in 0.35s ease-out forwards',
        'slide-up': 'slide-up 0.4s ease-out forwards',
        shimmer: 'shimmer 2.5s ease-in-out infinite',
        float: 'float 3s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor' },
          '100%': { boxShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      boxShadow: {
        'glow-sky': '0 0 20px rgba(14, 165, 233, 0.3), 0 0 60px rgba(14, 165, 233, 0.1)',
        'glow-violet': '0 0 20px rgba(139, 92, 246, 0.3), 0 0 60px rgba(139, 92, 246, 0.1)',
        'glow-emerald': '0 0 20px rgba(16, 185, 129, 0.3), 0 0 60px rgba(16, 185, 129, 0.1)',
      },
    },
  },
  plugins: [],
}

